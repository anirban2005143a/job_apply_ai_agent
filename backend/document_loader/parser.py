import tempfile
import os
import re
import json
from typing import List, Any
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
from langchain_core.prompts import ChatPromptTemplate
import pymupdf4llm
from dotenv import load_dotenv
import uuid

load_dotenv()


# System prompt & template (kept in function scope for easy adjustments)
SYSTEM_PROMPT = """You are an expert HR recruitment agent and a strict Data Extraction Engine. 
Your task is to convert resume markdown into a perfectly structured JSON format.

### CRITICAL EXTRACTION RULES:

1. **Phone Number:** Search the entire document for a phone number. Extract it as a STRING (e.g., "6290375587"). Do NOT return null if a number is present.
2. **Summary Generation:** Extract the existing summary or write a professional 2-3 sentence bio based on the candidate's history. Never return null.
3. **Mandatory Data Types:** - Every root-level field must be either a **STRING** or an **ARRAY OF DICTIONARIES**. 
    - Within any dictionary inside an array, every value MUST be a **STRING**. 
    - **NO NESTED OBJECTS:** Nested dictionaries or nested lists inside these arrays are strictly forbidden. Flatten all nested data into strings.
4. **No Hallucinations:** Use null for missing links or emails. 
5. **Strict JSON:** Return ONLY valid JSON. No markdown blocks, no ```json preamble, no conversational filler.
6. **Mandatory Schema Compliance:** For "skills", "experience", "education", "achievements", and "social_engagements", follow the base structure provided below.
7. **Dynamic Section Discovery (Non-Standard Sections):** For sections like Projects, Certifications, or Languages:
    - Categorize them into new root-level keys using snake_case.
    - Structure: 1D array of dictionaries where every value is a **STRING**.
8. **One-Shot Learning Example (Expected Format):**
{{
  "full_name": "John Doe",
  "summary": "Full-stack developer with 5 years experience...",
  "experience": [
    {{
      "company": "Tech Innovations",
      "role": "Software Engineer",
      "duration": "Jan 2020 - Present",
      "description": "Developed microservices using Python. Managed AWS deployment."
    }}
  ],
  "certifications": [
    {{
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon",
      "year": "2022"
    }}
  ]
}}

9. Output MUST start with {{ and end with }}.


### BASE JSON STRUCTURE (Extend as needed):
{{
    "full_name": "string",
    "email": "string",
    "phone": "string", 
    "linkedin_url": "string or null",
    "github_url": "string or null",
    "summary": "string",
    "skills": [
        {{"name": "string"}}
    ],
    "experience": [
        {{
            "company": "string or null",
            "role": "string or null",
            "dates": "string or null",
            "location": "string or null",
            "responsibilities": "string or null"
        }}
    ],
    "education": [
        {{
            "institution": "string or null",
            "degree": "string or null",
            "year": "string or null"
        }}
    ],
    "achievements": [
        {{
            "description": "string or null",
            "link": "string or null"
        }}
    ],
    "social_engagements": [
        {{
            "organization": "string or null",
            "role": "string or null",
            "description": "string or null"
        }}
    ]
}}"""

HUMAN_PROMPT = "Resume Markdown Content:\n\n{resume_text}"


def load_resume_text(file_path: str) -> str:
    print(f"[parser] Loading and converting file to markdown: {file_path}")
    return pymupdf4llm.to_markdown(file_path)

 
def _build_model():
    print("[parser] Building HuggingFace model instance...")
    # Create a model instance using HF token from env
    llm = HuggingFaceEndpoint(
        repo_id=os.getenv("HF_MODEL", "meta-llama/Llama-3.2-3B-Instruct"),
        huggingfacehub_api_token=os.getenv("HF_TOKEN"),
        temperature=0.0,
        max_new_tokens=2048,
    )
    return ChatHuggingFace(llm=llm)


def _clean_model_response(response: str) -> dict:
    print("[parser] Cleaning model response and extracting JSON...")
    # Remove code fences and extract JSON object
    response = re.sub(r"```json|```", "", response).strip().strip("'")
    clean_json = response.replace("```json", "").replace("```", "").replace('\n', ' ').replace('\r', ' ').replace('\t', ' ').strip()

    start_idx = clean_json.find('{')
    end_idx = clean_json.rfind('}')

    if start_idx == -1 or end_idx == -1:
        raise ValueError("No JSON object found in model response")

    json_str = clean_json[start_idx:end_idx + 1]
    return json.loads(json_str)


def parse_markdown_and_extract(markdown: str) -> dict:
    print("[parser] Parsing markdown and extracting structured data via LLM...")
    model = _build_model()
    prompt = ChatPromptTemplate.from_messages([("system", SYSTEM_PROMPT), ("human", HUMAN_PROMPT)])
    chain = prompt | model
    resp = chain.invoke({"resume_text": markdown}).content
    print(resp)
    return _clean_model_response(resp)


def parse_resumes_from_paths(paths: List[str]) -> dict:
    print(f"[parser] Parsing resumes from file paths: {paths}")
    # read all markdowns and concatenate
    markdowns = []
    for p in paths:
        markdowns.append(load_resume_text(p))
    combined = '\n\n-----\n\n'.join(markdowns)
    return parse_markdown_and_extract(combined)


def parse_resumes_from_uploads(uploaded_files: List[Any]) -> dict:
    print(f"[parser] Received {len(uploaded_files)} uploaded files for parsing.")
    """uploaded_files are objects with .filename and .file.read() methods (UploadFile or similar)."""
    tmpdir = tempfile.mkdtemp()
    paths: List[str] = []
    try:
        for i, uf in enumerate(uploaded_files):
            uid = uuid.uuid4()
            filename = f"resume_{uid}_{uf.filename}"
            path = os.path.join(tmpdir, filename)
            print(f"[parser] Writing uploaded file to temp: {path}")
            try:
                with open(path, "wb") as f:
                    data = uf.file.read()
                    if not data:
                        raise ValueError(f"Uploaded file {uf.filename} appears to be empty")
                    f.write(data)
                paths.append(path)
            except Exception as e:
                print(f"[parser] Failed to write uploaded file {uf.filename}: {e}")
                raise RuntimeError(f"Failed to write uploaded file {uf.filename}: {e}")

        # run parsing on all paths; if parsing fails raise with context
        try:
            print(f"[parser] All files written. Invoking parse_resumes_from_paths...")
            return parse_resumes_from_paths(paths)
        except Exception as e:
            print(f"[parser] Failed to parse uploaded resumes: {e}")
            raise RuntimeError(f"Failed to parse uploaded resumes: {e}")
    finally:
        # cleanup
        for p in paths:
            try:
                os.remove(p)
                print(f"[parser] Deleted temp file: {p}")
            except Exception:
                pass
        try:
            os.rmdir(tmpdir)
            print(f"[parser] Deleted temp directory: {tmpdir}")
        except Exception:
            pass
