from langchain_huggingface import HuggingFaceEndpoint , ChatHuggingFace
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import db.mongo_db as db
import os
import json
from filelock import FileLock

from data_types import User
from document_loader.parser import _clean_model_response
from websocker_handle import websocket_manager

load_dotenv()

# db.connect_to_db()

# prompts  
JOB_QUERY_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a Recruitment Specialist. Your task is to convert a user profile into a "
        "natural, keyword-rich job search string for a standard search bar.\n\n"
        "Strict Rules:\n"
        "1. Output ONLY the search string. No introduction or explanation.\n"
        "2. Do NOT use logic operators like 'AND', 'OR', 'NOT', or parentheses.\n"
        "3. Do NOT use colons or key-value pairs (e.g., no 'skills:react').\n"
        "4. Combine roles, technical skills, education , and locations "
        "into a simple, space-separated sequence of terms.\n"
        "5. Keep the output clean and human-readable."
    ),
    (
        "user",
        "Generate a job search query for this user profile: {user_json}"
    )
])

SCORING_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        "You are a Senior Talent Acquisition Lead. Evaluate job compatibility with extreme precision.\n\n"
        
        "STRICT SCORING CRITERIA (Total 100%):\n"
        "1. Technical Skills & Roles (40%): Compare 'skills' and 'roleExperience' with the Job Description.\n"
        "2. Educational & Achievement Tier (30%): Evaluate 'education' (e.g., IIT ISM), 'achievements' (JEE ranks, Hackathons), and 'projects'.\n"
        "3. Preferences & Logistics (30%): Evaluate match against:\n"
        "   - 'workMode' and 'cityPreference'/'countryPreference'.\n"
        "   - 'minimumSalary' (Reject if job pay is clearly below user minimum).\n"
        "   - 'noticePeriod' and 'relocationOpenness'.\n"
        "   - 'companyPreference' (Google, Facebook, etc.).\n\n"
        
        "OUTPUT FORMAT:\n"
        "Return ONLY a JSON object. No conversational text.\n"
        "{{ \"score\": <int give evaluation score out of 100>, \"reason\": \"<string summarizing specific pros/cons and the reason for the given score>\" }}"
    )),
    ("user", "### CANDIDATE PROFILE:\n{user_json}\n\n### JOB DESCRIPTION:\n{job_json}")
])

RESUME_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        "You are a Professional Resume Writer and Career Coach. Your goal is to generate a "
        "tailored, ATS-optimized resume in Markdown format based on the user's profile and "
        "a specific job description.\n\n"
        "STRICT GUIDELINES:\n"
        "1. Tailor the 'Professional Summary' to show how the user's background (IIT, specific skills) "
        "align with the needs mentioned in the Job Description.\n"
        "2. Rephrase 'Experience' bullet points to focus on impact and metrics (e.g., 'Optimized API response time by 30%').\n"
        "3. Select and feature AT MAX 2 projects from the user's profile that most closely align with the "
        "technical requirements of the job. Briefly explain their relevance.\n"
        "4. Ensure all technical skills required by the job that the user possesses are prominently listed.\n"
        "5. Highlight elite credentials like 'IIT' and 'AIR' ranks (e.g., WBJEE AIR 235).\n"
        "6. DO NOT fabricate, infer, or add any information that is not explicitly present in the user data.\n"
        "7. Output ONLY the resume in Markdown format. No conversational text."
    )),
    ("user", "### USER PROFILE:\n{user_json}\n\n### JOB DESCRIPTION:\n{job_json}")
])

COVER_LETTER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        "You are an expert Career Strategist and Technical Recruiter. Your task is to write a "
        "high-conversion, professional cover letter (max 300 words) that bridges a candidate's "
        "technical depth with a company's specific needs.\n\n"
        "STRICT NARRATIVE STRUCTURE:\n"
        "1. THE HOOK: Start with a strong opening that mentions the specific role and a unique "
        "reason for your interest in the company (e.g., their tech stack, a recent product launch, or mission).\n"
        "2. THE PROOF: Connect the user's elite background (e.g., IIT ISM Dhanbad, competitive programming ranks, "
        "or specific high-impact projects) to the job's core challenges.\n"
        "3. THE VALUE: Explain how your skills in specific frameworks (e.g., React, Node.js, Docker) "
        "will directly benefit their current team.\n"
        "4. THE CALL TO ACTION: A confident, professional closing inviting a discussion.\n\n"
        "TONE REQUIREMENTS:\n"
        "- Professional yet enthusiastic.\n"
        "- Achievement-oriented (mention metrics/ranks).\n"
        "- Output ONLY the cover letter text. No preamble."
    )),
    ("user", "### CANDIDATE PROFILE:\n{user_json}\n\n### JOB DESCRIPTION:\n{job_json}")
])

EVIDENCE_POINTS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        "You are a Technical Resume Strategist. Your task is to transform raw project descriptions "
        "and work tasks into high-impact 'Evidence Points' using the Google XYZ formula.\n\n"
        "FORMULA: Accomplished [X] as measured by [Y] by doing [Z].\n\n"
        "STRICT RULES:\n"
        "1. Every point must start with a strong Action Verb (e.g., Architected, Optimized, Spearheaded).\n"
        "2. Every point must include a Metric or Quantifiable Result (e.g., 20% faster, 500+ users, Rank 4/500).\n"
        "3. Every point must specify the Technology used (e.g., React, Go, AWS).\n"
        "4. Focus on 'Hard Evidence' like performance gains, security hardening, or competitive ranks.\n"
        "5. Output ONLY a bulleted list of 5-7 evidence points."
    )),
    ("user", "### RAW EXPERIENCE/PROJECTS:\n{user_json}\n\n### TARGET JOB KEYWORDS:\n{job_json}")
])

CLARIFICATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        "You are an Elite Career Intelligence Engine. Your task is to perform a clinical "
        "feasibility study on a job application by cross-referencing candidate data "
        "against job requirements.\n\n"
        
        "STRICT LOGIC RULES:\n"
        "1. JOB-CENTRIC SUMMARY: The 'Executive Summary' must describe the DAY-TO-DAY REALITY "
        "of the job and the specific technical challenges the domain presents. Do not summarize "
        "the candidate here; summarize the mission they are being hired for.\n"
        
        "2. SCORE ACCURACY: You must penalize the 'Compatibility Index' heavily for 'High Severity' gaps. "
        "If more than 2 'High Severity' technical gaps exist, the score CANNOT exceed 50%. "
        "If a 'Critical' mismatch (like Salary or Visa) exists, the Risk Level MUST be 'High'.\n"
        
        "3. DATA INTEGRITY: In the Technical Delta table, if a required skill is not found in the "
        "candidate's profile, you MUST write 'Not mentioned' in the Candidate Status column. "
        "Do not leave cells blank or assume proficiency.\n"

        "4. OUTPUT STRUCTURE:\n"
        "   - ## JOB MISSION & DOMAIN: Describe the daily tasks and the tech environment.\n"
        "   - ### COMPATIBILITY INDEX: [Score %] | [Risk Level].\n"
        "   - ### TECHNICAL DELTA (Table): [Requirement | Candidate Status | Gap Severity].\n"
        "   - ### STRATEGIC MISMATCHES: List dealbreakers (Location, Salary, Visa).\n"
        "   - ### SYSTEM ADVISORY: Provide a high-density, bulleted summary of the final verdict. Focus on the 'Hard Truths' regarding the application's viability and the specific conditions the user must accept if they choose to proceed."
        
        "Tone: Clinical, formal, and brutally honest. Output in clean Markdown."
    )),
    ("user", "### CANDIDATE DATA:\n{user_json}\n\n### JOB SPECIFICATION:\n{job_json}")
])

# changable variables
REJECT_THRESHOLD_SCORE = 40
CLARIFY_THRESHOLD_SCORE = 70


llm = HuggingFaceEndpoint(
    repo_id="meta-llama/Llama-3.1-8B-Instruct",
    huggingfacehub_api_token=os.environ["HUGGINGFACEHUB_API_TOKEN"]
)
model = ChatHuggingFace(llm = llm)


def generate_query_for_job_search(user_data = None):
    if user_data is None:
        raise Exception("User_data is required")
    
    # The LLM needs a string representation of the JSON
    user_json_str = json.dumps(user_data)

    print("Invoke chain")

    chain = JOB_QUERY_PROMPT | model
    result = chain.invoke({"user_json": user_json_str})

    # If result is a ChatMessage object (typical in LangChain), extract the content string
    query_string = result.content if hasattr(result, 'content') else str(result)    

    return query_string.strip()


def generate_clarification(user:User , job:dict , user_data=None):
    if not user_data:
        raise Exception("user data is required")

    print(f"Generating clarification for: {user.user_id}" , job.get("company"))

    # 1. Prepare User Data 
    # The LLM needs a string representation of the JSON
    user_json = json.dumps(user_data)
    job_json = json.dumps(job)

    print("Calling chain")
    # 2. Initialize the Chain
    # Assuming 'model' is your ChatHuggingFace(llm=llm) instance
    chain = CLARIFICATION_PROMPT | model

    # 3. Invoke LLM
    try:
        response = chain.invoke({
            "user_json": user_json,
            "job_json": job_json
        })
        
        # 4. Extract Content
        # result.content contains the raw Markdown text
        clarification_markdown = response.content if hasattr(response, 'content') else str(response)
        
        print("created clarification for ", job.get("company"))

        return clarification_markdown.strip()

    except Exception as e:
        print(f"Error generating clarification points: {e}")
        raise Exception("Failed to generate clarification points. Please check your LLM connection.")


async def separate_and_rank_jobs(user:User , jobs:list , user_data = None):
    if len(jobs)==0 or user_data is None:
        return []
    
    if not user.is_active:
        print("User is not active")
        return

    user_id = str(user.user_id)
    user_dir = f"./{user_id}"
    
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    applied_jobs = []
    rejected_list = []
    clarify_list = []

    # The LLM needs a string representation of the JSON
    user_json = json.dumps(user_data)

    # 1. Initialize the Chain
    chain = SCORING_PROMPT | model

    for job in jobs:
        if not user.is_active:
            print("User is not active")
            return

        # Generate Score using LLM
        job_json = json.dumps(job)
        print("process job " , job["id"])
        try:
            response = chain.invoke({"user_json": user_json, "job_json": job_json})
            print("raw model repsonse " , response.content.strip())
            # Parse the JSON response from LLM
            # Note: Depending on output, you might need to clean markdown ```json ... ```
            data = _clean_model_response(response.content.strip())
            score = data.get("score", 0)
            job["match_score"] = score
            job["match_reason"] = data.get("reason", "")
        except Exception as e:
            print(f"Error scoring job: {e}")
            continue

        # 2. Logic for Ranking and Filing
        if int(score) <= REJECT_THRESHOLD_SCORE:
            rejected_list.append(job)
            role = job["title"]
            company = job["company"]
            job_id = job["id"]
            data = {
                "type": "rejected",
                "message": f"Application for {role} in {company} has been discarded.",
                "job_id": f"{job_id}"
            }
            await websocket_manager.send_personal_message(user_id , data)

        elif int(score) <= CLARIFY_THRESHOLD_SCORE:
            clarify_list.append(job)
        else:
            applied_jobs.append(job)

    # 3. Append to files (Reading existing data first to avoid overwriting)
    def append_to_file(filename, new_data):
        path = os.path.join(user_dir, filename)
        current_data = []
        lock_path = path + ".lock"

        lock = FileLock(lock_path , timeout=10)

        with lock : 
            # load current data from file 
            if os.path.exists(path):
                with open(path, 'r') as f:
                    try: current_data = json.load(f)
                    except: current_data = []
            
            current_data.extend(new_data)
            with open(path, 'w') as f:
                json.dump(current_data, f, indent=4)

    if rejected_list: append_to_file('rejected_jobs.json', rejected_list)
    if clarify_list: append_to_file('clarify_jobs.json', clarify_list)

    # 4. Sort applied jobs by score descending
    applied_jobs.sort(key=lambda x: x['match_score'], reverse=True)

    return applied_jobs
    

def generate_resume(user:User , job:dict , user_data=None):
    if not user_data:
        raise Exception("user data is required")

    if not user.is_active:
        print("User is not active")
        return

    print(f"Generating tailored resume for: {user.user_id}" , job.get("company"))

    # 1. Prepare User Data 
    # The LLM needs a string representation of the JSON
    user_json = json.dumps(user_data)
    job_json = json.dumps(job)

    print("Calling chain")
    # 2. Initialize the Chain
    # Assuming 'model' is your ChatHuggingFace(llm=llm) instance
    chain = RESUME_PROMPT | model

    # 3. Invoke LLM
    try:
        response = chain.invoke({
            "user_json": user_json,
            "job_json": job_json
        })
        
        # 4. Extract Content
        # result.content contains the raw Markdown text
        resume_markdown = response.content if hasattr(response, 'content') else str(response)
        
        print("created resume for ", job.get("company"))
        return resume_markdown.strip()

    except Exception as e:
        print(f"Error generating resume: {e}")
        raise Exception("Failed to generate resume. Please check your LLM connection.")


def generate_cover_letter(user:User , job:dict , user_data=None):
    if not user_data:
        raise Exception("user data is required")

    if not user.is_active:
        print("User is not active")
        return

    print(f"Generating cover letter for: {user.user_id}" , job.get("company"))

    # 1. Prepare User Data 
    # The LLM needs a string representation of the JSON
    user_json = json.dumps(user_data)
    job_json = json.dumps(job)

    print("Calling chain")
    # 2. Initialize the Chain
    # Assuming 'model' is your ChatHuggingFace(llm=llm) instance
    chain = COVER_LETTER_PROMPT | model

    # 3. Invoke LLM
    try:
        response = chain.invoke({
            "user_json": user_json,
            "job_json": job_json
        })
        
        # 4. Extract Content
        # result.content contains the raw Markdown text
        cover_letter_markdown = response.content if hasattr(response, 'content') else str(response)
        
        print("cover letter for ", job.get("company"))

        return cover_letter_markdown.strip()

    except Exception as e:
        print(f"Error generating cover letter: {e}")
        raise Exception("Failed to generate cover letter. Please check your LLM connection.")


def generate_evidence_points(user:User , job:dict , user_data=None):
    if not user_data:
        raise Exception("user data is required")

    if not user.is_active:
        print("User is not active")
        return
        
    print(f"Generating evidence points for: {user.user_id}" , job.get("company"))

    # 1. Prepare User Data 
    # The LLM needs a string representation of the JSON
    user_json = json.dumps(user_data)
    job_json = json.dumps(job)

    print("Calling chain")
    # 2. Initialize the Chain
    # Assuming 'model' is your ChatHuggingFace(llm=llm) instance
    chain = EVIDENCE_POINTS_PROMPT | model

    # 3. Invoke LLM
    try:
        response = chain.invoke({
            "user_json": user_json,
            "job_json": job_json
        })
        
        # 4. Extract Content
        # result.content contains the raw Markdown text
        evidence_points_markdown = response.content if hasattr(response, 'content') else str(response)
        
        print("created evidence for ", job.get("company"))
        return evidence_points_markdown.strip()

    except Exception as e:
        print(f"Error generating evidence points: {e}")
        raise Exception("Failed to generate evidence points. Please check your LLM connection.")


if __name__ == "__main__":

    user_id = "69834eb4f44210db096c223c"
    # query = generate_query_for_job_search(user_id)

    # print(query)
    user = User(user_id)
    # jobs = [
    #     {
    #     "id": "job_041",
    #     "title": "Power BI Developer",
    #     "company": "EY India",
    #     "cities": ["Kochi"],
    #     "countries": ["India"],
    #     "is_remote": True,
    #     "is_hybride": False,
    #     "is_onsite": False,
    #     "salary_offered": 850000,
    #     "visa_sponsorship_offered": False,
    #     "start_date": "Immediate",
    #     "required_skills": ["Power BI", "DAX", "SQL"],
    #     "description": "Building dashboards and reports."
    #   },
    #   {
    #     "id": "job_045",
    #     "title": "SAP ABAP Developer",
    #     "company": "Birlasoft",
    #     "cities": ["Nagpur"],
    #     "countries": ["India"],
    #     "is_remote": False,
    #     "is_hybride": False,
    #     "is_onsite": True,
    #     "salary_offered": 1100000,
    #     "visa_sponsorship_offered": False,
    #     "start_date": "Within 1 month",
    #     "required_skills": ["SAP ABAP", "Reports", "Enhancements"],
    #     "description": "Custom SAP development."
    #   },
    #   {
    #     "id": "job_046",
    #     "title": "Technical Program Manager",
    #     "company": "Intel India",
    #     "cities": ["Bengaluru"],
    #     "countries": ["India"],
    #     "is_remote": False,
    #     "is_hybride": True,
    #     "is_onsite": False,
    #     "salary_offered": 2400000,
    #     "visa_sponsorship_offered": False,
    #     "start_date": "Within 2 months",
    #     "required_skills": ["Program Management", "Agile", "Coordination"],
    #     "description": "Managing large technical programs."
    #   },
    #   {
    #     "id": "job_002",
    #     "title": "Frontend Developer",
    #     "company": "Infosys",
    #     "cities": ["Pune"],
    #     "countries": ["India"],
    #     "is_remote": True,
    #     "is_hybride": False,
    #     "is_onsite": False,
    #     "salary_offered": 900000,
    #     "visa_sponsorship_offered": False,
    #     "start_date": "Immediate",
    #     "required_skills": ["React", "TypeScript", "HTML", "CSS"],
    #     "description": "Building responsive and scalable frontend applications."
    #   },
    #   {
    #     "id": "job_005",
    #     "title": "Cloud Engineer",
    #     "company": "HCL",
    #     "cities": ["Noida"],
    #     "countries": ["India"],
    #     "is_remote": False,
    #     "is_hybride": True,
    #     "is_onsite": False,
    #     "salary_offered": 1100000,
    #     "visa_sponsorship_offered": False,
    #     "start_date": "Within 1 month",
    #     "required_skills": ["AWS", "Azure", "Terraform"],
    #     "description": "Designing and maintaining cloud infrastructure."
    #   },
    # ]
    user_data = db.get_user_profile(user_id=user_id)

    # applied_jobs = separate_and_rank_jobs(user , jobs)
    # print("Confirmed jobs" , applied_jobs)

    job = {
        "id": "job_001",
        "title": "DevOps Engineer",
        "company": "TechMahindra",
        "cities": ["Bengaluru"],
        "countries": ["India"],
        "is_remote": False,
        "is_hybride": True,
        "is_onsite": False,
        "salary_offered": 1200000,
        "visa_sponsorship_offered": False,
        "start_date": "Within 1 month",
        "required_skills": ["AWS", "Docker", "CI/CD"],
        "description": "Managing cloud infrastructure and deployment pipelines."
    }

    print(generate_clarification(user , job , user_data))
