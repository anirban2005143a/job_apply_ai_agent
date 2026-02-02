# Generated from: load_resume.ipynb
# Converted at: 2026-01-31T22:01:18.494Z
# Next step (optional): refactor into modules & generate tests with RunCell
# Quick start: pip install runcell

import pymupdf4llm
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field
from langchain_huggingface import HuggingFaceEndpoint , ChatHuggingFace
from langchain_core.output_parsers.pydantic import PydanticOutputParser
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from pymongo import MongoClient
import re
import json
import os

load_dotenv()

# # Load the resume in markdown formate



def load_resume_text(file_path):
    # This converts the PDF directly to clean Markdown text
    md_text = pymupdf4llm.to_markdown(file_path)
    return md_text

# Example usage for your LangGraph state
path = r"D:\projects\job apply from resume\backend\resume\frontend resume.pdf"
resume_content = load_resume_text(path)

print(resume_content)

# # Define model


llm = HuggingFaceEndpoint(
    repo_id='meta-llama/Llama-3.2-3B-Instruct',
    huggingfacehub_api_token = os.environ["HF_TOKEN"],
    temperature=0.0,
    max_new_tokens=2048
)

model = ChatHuggingFace(
    llm=llm
)

# structured_llm = model.with_structured_output(ResumeSchema ,  method="json_schema")

# # Define prompt and invoke model


# 1. Define the System Message with the Manual Schema
system_prompt = """You are an expert HR recruitment agent and a strict Data Extraction Engine. 
Your task is to convert resume markdown into a perfectly structured JSON format.

### CRITICAL EXTRACTION RULES:
1. **Phone Number:** Search the entire document (especially the header) for a phone number. Extract it as a STRING (e.g., "6290375587"). Do NOT return null if a number is present.
2. **Summary Generation:** If the resume has a "Summary" or "Profile" section, extract it. If NOT, you MUST write a professional 2-3 sentence summary/bio based on the candidate's experience and skills provided in the text. Never return null for the summary.
3. **Data Types:** Every single field (except for lists and nulls) must be a STRING. This includes phone numbers and years (e.g., "2023", not 2023).
4. **Skill Categories:** Use ONLY the categories: "technical", "soft", or "tool". Map "databases" or "languages" to "technical".
5. **No Hallucinations:** Do not invent links or emails. If they are not in the text, use null.
6. **Strict JSON:** Return ONLY valid JSON. No markdown backticks, no conversational text, no markdown code blocks (```json), and no preamble , and no conversational filler.
7. Output MUST start with {{ and end with }}.


### JSON Structure:
{{
    "full_name": "string",
    "email": "string",
    "phone": "string", 
    "linkedin_url": "string or null",
    "github_url": "string or null",
    "summary": "string (Professional bio based on the resume)",
    "skills": [
        {{"name": "string", "category": "technical/soft/tool"}}
    ],
    "experience": [
        {{
            "company": "string",
            "role": "string",
            "dates": "string",
            "location": "string or null",
            "responsibilities": "string"
        }}
    ],
    "education": [
        {{
            "institution": "string",
            "degree": "string",
            "year": "string"
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


# 2. Define the Human Message
human_prompt = "Resume Markdown Content:\n\n{resume_text}"

# 3. Create the Prompt Template
prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", human_prompt)
])

# 4. Update your chain
# Since you aren't using the Pydantic parser, we use a simple String output
chain = prompt | model 

# 5. Invoke and manually convert to Pydantic if needed
response = chain.invoke({"resume_text": resume_content}).content

# # Post process the output to get a valid json 


user_data_json = ""
try:
    # Remove any potential markdown code blocks the model might have added anyway
    response = re.sub(r"```json|```", "", response).strip().strip("'")
    clean_json = response.replace("```json", "").replace("```", "").replace('\n', ' ').replace('\r', ' ').replace('\t', ' ').strip()
    
    start_idx = clean_json.find('{')
    end_idx = clean_json.rfind('}')
    
    if start_idx == -1 or end_idx == -1:
        raise ValueError("No JSON object found in response")
    
    json_str = clean_json[start_idx:end_idx + 1]

    # print(json_str)
    python_dict = json.loads(json_str) 

    # 2. Now convert that dictionary back to a pretty-printed JSON string
    user_data_json = json.dumps(python_dict, indent=4)

    # print(user_data_json)
except Exception as e:
    print(f"Parsing failed: {e}")
    print("Raw Response:", response)

print(user_data_json)

# # Store the user data in mongodb


# MONGO_URI = os.getenv("MONGO_URI")
# client = MongoClient(MONGO_URI)

# db = client["job_apply_agent"]
# user_profile_collection = db["user_profiles"]

# # 4. Insert the data
# try:
#     user_data_dict = json.loads(user_data_json)
#     result = user_profile_collection.insert_one(user_data_dict)
#     print(f"Successfully inserted! Document ID: {result.inserted_id}")
# except Exception as e:
#     print(f"An error occurred: {e}")