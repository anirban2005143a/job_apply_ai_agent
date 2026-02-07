from typing import Dict
import threading
import time
import os
import json
import requests
import asyncio
from dotenv import load_dotenv
from data_types import User
from uuid import uuid4
from datetime import datetime
import db.mongo_db as db
from filelock import FileLock

from websocker_handle import websocket_manager
from llm_handle import separate_and_rank_jobs , generate_clarification , generate_query_for_job_search , generate_resume , generate_cover_letter , generate_evidence_points

load_dotenv()

API_BASE_URL = os.environ["API_BASE_URL"]
MAX_RETRIES = 3
RETRY_DELAY = 10 # sec

async def submit_application(user:User , job:dict , user_data , resume:str , cover_letter:str , evidence_points:str):
    job_id = job.get("job_id") or job.get("id")
    if not job_id:
        print("Job id is required in function submit_application")
        return
    if not user_data:
        print("User data is required in function submit_application")
        return
    if not user.is_active:
        print("User is not active in function submit_application")
        return
    
    try:
        # The LLM needs a string representation of the JSON
        user_json = json.dumps(user_data)

        # 3. Prepare Payload for the API
        payload = {
            "job_id": str(job_id),
            "name": user_data.get("full_name"),
            "email": user_data.get("email"),
            "phone": user_data.get("phone"),
            "resume": resume,
            "cover_letter": cover_letter,
            "evidence_points": evidence_points
        }

        # 4. Call the FastAPI endpoint
        # Change URL to your actual deployment address
        API_URL = f"{API_BASE_URL}/apply" 
        response = requests.post(API_URL, json=payload)

        if response.status_code == 200:
            print(f"Successfully applied! Status: {response.json().get('status')}")
            data = response.json()
            print("Application result" , data)

            role = job.get("title") or job.get("role")
            company = job.get("company")
            job_id = job.get("job_id") or job.get("id")
            data = {
                "type": "applied",
                "message": f"Application for {role} in {company} has been successfully applied.",
                "job_id": f"{job_id}"
            }
            await websocket_manager.send_personal_message(user.user_id , data)
        else:
            print(f"API Error: {response.text}")
            return
        
    except Exception as e:
        print("Error while applying " , e)
        return


async def job_retry_worker(user:User , job:dict , user_data=None):
    
    if user_data is None  :
        print("User data not present in job_retry_worker fuction")
        return
    
    attempts = 0
    # 2. Generate AI Documents
    print(f"--- Generating Application for {job.get('company')} ---")

    print("Generting resume")
    if not user.is_active:
        print("User is not active")
        return
    resume = generate_resume(user , job , user_data=user_data)

    print("Generting cover letter")
    if not user.is_active:
        print("User is not active")
        return
    cover_letter = generate_cover_letter(user , job , user_data=user_data)

    print("Generting evidence points")
    if not user.is_active:
        print("User is not active")
        return
    evidence_points = generate_evidence_points(user , job , user_data=user_data)
    
    job_id = job.get("id")

    while attempts < MAX_RETRIES and user.is_active:
        try:
            if not user.is_active:
                print("User is not active")
                return

            user_dir = f"./{user.user_id}"
            os.makedirs(user_dir, exist_ok=True)

            await submit_application(user, job , user_data=user_data , resume=resume , cover_letter=cover_letter , evidence_points=evidence_points)

            print(f"User {user.user_id} applied to {job}")

            # write to the applied.json file
            print(f"--- Write the applied job for user : {user.user_id} ---")
            payload = {
                "job_id": str(job_id),
                "name": user_data.get("full_name"),
                "email": user_data.get("email"),
                "phone": user_data.get("phone"),
                "resume": resume,
                "cover_letter": cover_letter,
                "evidence_points": evidence_points
            }
        
            # Path to applied_jobs.json
            applied_file_path = os.path.join(user_dir, "applied_jobs.json")
            # Load existing applied jobs (if file exists)
            if os.path.exists(applied_file_path):
                with open(applied_file_path, "r") as f:
                    try:
                        applied_jobs = json.load(f)
                    except json.JSONDecodeError:
                        applied_jobs = []
            else:
                applied_jobs = []

            # Append new job
            payload["job"] = job
            applied_jobs.append(payload)

            # Save back to applied.json
            with open(applied_file_path, "w") as f:
                json.dump(applied_jobs, f, indent=4)

            return

        except Exception as e:
            attempts += 1
            print(f"{job} retry {attempts}" , e)
            time.sleep(RETRY_DELAY)

    print(f"Apply to {job_id} failed or stopped after {attempts} attemps")


def find_jobs(user , user_data=None):
    if user_data is None : 
        print("User data is required in ")
        return []

    jobs = []
    try:
        url = f"{API_BASE_URL}/search"

        if not user.is_active:
            return []

        # generate query using llm 
        # query = generate_query_for_job_search(user_data=user_data)
        query = """
        frontend backend data science Full-stack developer React Node.js javascript C++ C HTML Docker Tailwind CSS Bootstrap Express.js Next.js gsap Firebase MongoDB PostgreSQL Kolkata Mumbai Delhi Pune Bangalore India United States United Kingdom Japan Google Facebook Metro tech internet remote hybrid onsite software scalable efficient competitive programming developer Full-stack engineer Next.js developer backend developer data engineer software engineer Full-stack engineer ism iit dhanbad iit bhu web development cybersecurity web application development data science data engineering
        """

        payload = {
            "query": query
        }

        if not user.is_active:
            return []

        response = requests.post(url, json=payload)

        if response.status_code == 200:
            data = response.json()
            jobs = data["results"]

            # print(data["results"])
        else:
            print("Error:", response.status_code, response.text)
            return []

    except Exception as e:
        print("jobs json not found" , e)
        return []

    # 2. Slice the jobs
    # Jobs 0 to 5 (exclusive of 5, so 5 items total)
    # first_five = jobs[0:5]
    first_five = jobs
    
    # Jobs 5 to last 
    # next_fifteen = jobs[5:]
    next_fifteen = []

    if not user.is_active:
        return []
            
    # 3. Handle the storage for the user-specific file
    user_dir = str(user.user_id)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    storage_path = os.path.join(user_dir, 'pending_jobs.json')
    lock_path = storage_path + ".lock"

    lock = FileLock(lock_path , timeout=10)

    with lock:  # ⛔ blocks other processes until released
        # 1. Read existing jobs (if file exists)
        if os.path.exists(storage_path):
            with open(storage_path, "r") as f:
                try:
                    existing_jobs = json.load(f)
                except json.JSONDecodeError:
                    existing_jobs = []
        else:
            existing_jobs = []

        # 2. Merge jobs
        updated_jobs = existing_jobs + next_fifteen

        # 3. Write back to file
        with open(storage_path, "w") as f:
            json.dump(updated_jobs, f, indent=4)

    # print(first_five)

    # 4. Return the first 5 jobs
    return first_five


async def user_worker(user:User ):

    # 1. Prepare User Data 
    print("Getting user data" , user.user_id)
    # Prepare User data for LLM (removing password for safety)
    user_data = db.get_user_profile(user.user_id)

    if not user.is_active:
        return

    PROCESS_INTERVAL = 4 * 3600
    READ_JOBS_INTERVAL = 20

    jobs_file = f"./{user.user_id}/pending_jobs.json"
    clarify_jobs_path = f"./{user.user_id}/clarify_jobs.json"

    print(f"Worker started for User {user.user_id}")

    # 🔹 Call find_jobs ONLY ONCE
    top_jobs = find_jobs(user , user_data=user_data)
    # top_jobs = [
    #     {
    #         "id": "job_101",
    #         "title": "Backend Developer",
    #         "company": "Infosys",
    #         "cities": ["Bangalore"],
    #         "countries": ["India"],
    #         "is_remote": False,
    #         "is_hybride": True,
    #         "is_onsite": False,
    #         "salary_offered": 1200000,
    #         "visa_sponsorship_offered": False,
    #         "start_date": "Immediate",
    #         "required_skills": ["Node.js", "Express", "MongoDB", "PostgreSQL"],
    #         "description": "Building scalable backend APIs and database-driven applications."
    #     },
    #     {
    #         "id": "job_103",
    #         "title": "Software Engineer",
    #         "company": "Flipkart",
    #         "cities": ["Bangalore"],
    #         "countries": ["India"],
    #         "is_remote": False,
    #         "is_hybride": True,
    #         "is_onsite": False,
    #         "salary_offered": 1800000,
    #         "visa_sponsorship_offered": False,
    #         "start_date": "Within 2 months",
    #         "required_skills": ["JavaScript", "Node.js", "MongoDB", "React.js"],
    #         "description": "Work on scalable services and frontend integrations."
    #     },
    #     {
    #         "id": "job_201",
    #         "title": "Mechanical Design Engineer",
    #         "company": "Larsen & Toubro",
    #         "cities": ["Chennai"],
    #         "countries": ["India"],
    #         "is_remote": False,
    #         "is_hybride": False,
    #         "is_onsite": True,
    #         "salary_offered": 600000,
    #         "visa_sponsorship_offered": False,
    #         "start_date": "Within 1 month",
    #         "required_skills": ["AutoCAD", "SolidWorks", "Thermodynamics"],
    #         "description": "Design mechanical components and systems."
    #     },
    #     {
    #         "id": "job_401",
    #         "title": "QA Automation Engineer",
    #         "company": "Wipro",
    #         "cities": ["Bangalore"],
    #         "countries": ["India"],
    #         "is_remote": False,
    #         "is_hybride": True,
    #         "is_onsite": False,
    #         "salary_offered": 1000000,
    #         "visa_sponsorship_offered": False,
    #         "start_date": "Within 1 month",
    #         "required_skills": ["JavaScript", "Selenium", "Automation Testing"],
    #         "description": "Develop and maintain automated test suites for web applications."
    #     },
    #     {
    #         "id": "job_402",
    #         "title": "DevOps Engineer",
    #         "company": "Tech Mahindra",
    #         "cities": ["Pune"],
    #         "countries": ["India"],
    #         "is_remote": False,
    #         "is_hybride": True,
    #         "is_onsite": False,
    #         "salary_offered": 1400000,
    #         "visa_sponsorship_offered": False,
    #         "start_date": "Within 2 months",
    #         "required_skills": ["AWS", "CI/CD", "Linux", "Kubernetes"],
    #         "description": "Manage deployment pipelines and cloud infrastructure."
    #     }
    # ]
    
    # Process jobs currently in memory
    while user.is_active :

        while top_jobs and user.is_active:
            if not user.is_active:
                return
            
            try:
                print("Start separrating and scoring and rerank the jobs")
                top_jobs = await separate_and_rank_jobs(user , top_jobs , user_data=user_data)

                if not user.is_active:
                    return

                for job in top_jobs:

                    if not user.is_active:
                        return

                    print("Start apply for job", job["id"] , job.get("company"))
                    # thread = threading.Thread(
                    #     target=job_retry_worker,
                    #     args=(user, job , user_data),
                    #     daemon=True
                    # )
                    # thread.start()
                    await job_retry_worker(user=user , job=job , user_data=user_data)
                
                # process the jobs that need clarification
                print("process the jobs that need clarification")
                clarify_jobs = []
                # Check if file exists
                if not os.path.exists(clarify_jobs_path):
                    print(f"No clarify jobs file found for user {user.user_id}")
                    clarify_jobs = []
                    with lock :
                        with open(clarify_jobs_path, "w") as f:
                            json.dump([], f)

                lock_path = clarify_jobs_path + ".lock"
                lock = FileLock(lock_path, timeout=10)

                with lock:  # ensures no other process is reading/writing at the same time
                    with open(clarify_jobs_path, "r") as f:
                        try:
                            jobs = json.load(f)
                        except json.JSONDecodeError:
                            print(f"File {clarify_jobs_path} is empty or corrupted")
                            jobs = []


                for job in jobs:
                    if not user.is_active:
                        return

                    if "clarification" in job:
                        clarify_jobs.append(job)
                        continue

                    # Make a shallow copy without 'reason' to send to the function
                    job_for_clarification = {k: v for k, v in job.items() if k != "reason"}
                    
                    # Call function
                    clarification = generate_clarification(user, job_for_clarification, user_data)

                    job["clarification"] = clarification
                    clarify_jobs.append(job)

                    role = job.get("title") or job.get("role")
                    company = job.get("company")
                    job_id = job.get("job_id") or job.get("id")
                    data = {
                        "type": "clarify",
                        "message": f"Application for {role} in {company} need your clarification.",
                        "job_id": f"{job_id}"
                    }
                    await websocket_manager.send_personal_message(user.user_id , data)

                with lock:   
                    # Write back the updated array to file
                    with open(clarify_jobs_path, "w") as f:
                        json.dump(clarify_jobs, f, indent=4)

                break # this line must be removed later
                time.sleep(READ_JOBS_INTERVAL)
                
                if not user.is_active:
                    return

                # search for other pending top jobs
                if not os.path.exists(jobs_file):
                    top_jobs = []
                else:
                    lock = FileLock(jobs_file + ".lock" , timeout=10)

                    with lock:  # ⛔ other processes wait here
                        with open(jobs_file, "r+") as file:
                            try:
                                jobs = json.load(file)
                            except json.JSONDecodeError as e:
                                print(e)
                                jobs = []

                            # Take next 5 jobs
                            top_jobs = jobs[:5]
                            remaining_jobs = jobs[5:]

                            # Rewrite remaining jobs back to file
                            file.seek(0)
                            file.truncate()
                            json.dump(remaining_jobs, file, indent=4)
            
            except Exception as e:
                print("Error in User worker " ,e)
                break

        break  # this line must be removed later
        time.sleep(PROCESS_INTERVAL)  # wait before next cycle


class JobManager:
    def __init__(self):
        self.users: Dict[str, User] = {}

    def add_user(self, user_id):
        self.users[user_id] = User(user_id)

    
    def start_user(self, user_id):
        user = self.users[user_id]
        user.is_active = True

        def run_async_worker():
            asyncio.run(user_worker(user))

        thread = threading.Thread(
            target=run_async_worker,
            args=()
        )
        thread.start()

    def stop_user(self, user_id):
        self.users[user_id].is_active = False

    def get_user_status(self , user_id):
        return self.users[user_id].is_active


job_manager = JobManager()

