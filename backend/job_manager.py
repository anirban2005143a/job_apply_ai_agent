from typing import Dict
import threading
import time
import os
import json
import requests
from dotenv import load_dotenv
from data_types import User
from uuid import uuid4
from datetime import datetime
import db.mongo_db as db

from llm_handle import separate_and_rank_jobs , generate_query_for_job_search , generate_resume , generate_cover_letter , generate_evidence_points

load_dotenv()

API_BASE_URL = os.environ["API_BASE_URL"]
MAX_RETRIES = 3
RETRY_DELAY = 10 # sec

def submit_application(user:User , job:dict , user_data , resume:str , cover_letter:str , evidence_points:str):
    job_id = job.get("job_id") or job.get("id")
    if not job_id:
        raise Exception("Job id is required")
    if not user_data:
        raise Exception("User data is required")
    
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
        else:
            raise Exception(f"API Error: {response.text}")
        
    except Exception as e:
        print("Error while applying " , e)
        raise Exception(f"Error while applying : {e}")


def job_retry_worker(user:User , job:dict):

    attempts = 0

    # 1. Prepare User Data 
    print("Getting user data")
    # Prepare User data for LLM (removing password for safety)
    user_data = db.get_user_profile(user.user_id)

    # 2. Generate AI Documents
    print(f"--- Generating Application for {job.get('company')} ---")
    print("Generting resume")
    resume = generate_resume(user , job , user_data=user_data)
    print("Generting cover letter")
    cover_letter = generate_cover_letter(user , job , user_data=user_data)
    print("Generting evidence points")
    evidence_points = generate_evidence_points(user , job , user_data=user_data)
    
    job_id = job.get("id")

    while attempts < MAX_RETRIES and user.is_active:
        try:
            user_dir = f"./{user.user_id}"
            os.makedirs(user_dir, exist_ok=True)

            submit_application(user, job , user_data=user_data , resume=resume , cover_letter=cover_letter , evidence_points=evidence_points)

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
        
            # Path to applied.json
            applied_file_path = os.path.join(user_dir, "applied.json")
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


def find_jobs(user):
    jobs = []
    try:
        url = f"{API_BASE_URL}/search"

        if not user.is_active:
            return []

        # generate query using llm 
        # query = generate_query_for_job_search(user.user_id)
        query = """
        frontend backend data science Full-stack developer React Node.js javascript C++ C HTML Docker Tailwind CSS Bootstrap Express.js Next.js gsap Firebase MongoDB PostgreSQL Kolkata Mumbai Delhi Pune Bangalore India United States United Kingdom Japan Google Facebook Metro tech internet remote hybrid onsite software scalable efficient competitive programming developer Full-stack engineer Next.js developer backend developer data engineer software engineer Full-stack engineer ism iit dhanbad iit bhu web development cybersecurity web application development data science data engineering
        """

        payload = {
            "query": "python backend developer"
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
            raise Exception(f"Error: {response.status_code} {response.text}")

    except Exception as e:
        print("jobs json not found" , e)
        return []

    # 2. Slice the jobs
    # Jobs 0 to 5 (exclusive of 5, so 5 items total)
    first_five = jobs[0:5]
    
    # Jobs 5 to last 
    next_fifteen = jobs[5:]

    if not user.is_active:
        return []
            
    # 3. Handle the storage for the user-specific file
    user_dir = str(user.user_id)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    storage_path = os.path.join(user_dir, 'jobs.json')
    
    with open(storage_path, 'w') as f:
        json.dump(next_fifteen, f, indent=4)

    print(first_five)

    # 4. Return the first 5 jobs
    return first_five


def user_worker(user:User):

    PROCESS_INTERVAL = 4 * 3600
    READ_JOBS_INTERVAL = 20

    jobs_file = f"./{user.user_id}/jobs.json"

    print(f"Worker started for User {user.user_id}")

    # 🔹 Call find_jobs ONLY ONCE
    top_jobs = find_jobs(user)
    
    # Process jobs currently in memory
    while user.is_active :

        while top_jobs and user.is_active:
            if not user.is_active:
                return

            top_jobs = separate_and_rank_jobs(user , top_jobs)

            if not user.is_active:
                return

            for job in top_jobs:

                if not user.is_active:
                    return

                thread = threading.Thread(
                    target=job_retry_worker,
                    args=(user, job),
                    daemon=True
                )
                thread.start()

            break # this line must be removed later
            time.sleep(READ_JOBS_INTERVAL)

            # 🔹 Read next batch of jobs from file
            if not os.path.exists(jobs_file):
                top_jobs = []
                break

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
                json.dump(remaining_jobs, file , indent=4)


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

        thread = threading.Thread(
            target=user_worker,
            args=(user,)
        )
        thread.start()

    def stop_user(self, user_id):
        self.users[user_id].is_active = False


job_manager = JobManager()

