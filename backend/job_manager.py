from typing import Dict
import threading
import time
import os
import json
import requests
from dotenv import load_dotenv

API_BASE_URL = os.environ["API_BASE_URL"]

class User:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.is_active = False

def job_retry_worker(user , job):
    print("In the job_retry_worker function" , job["id"])

def find_jobs(user):
    try:
        url = f"{API_BASE_URL}/search"

        # generate query using llm 
        query = generate_query_for_job_search(user.user_id)

        payload = {
            "query": "python backend developer"
        }

        response = requests.post(url, json=payload)

        if response.status_code == 200:
            data = response.json()
            print(data["results"])
        else:
            print("Error:", response.status_code, response.text)

    except :
        print("jobs json not found" , e)
        return []

    # 2. Slice the jobs
    # Jobs 0 to 5 (exclusive of 5, so 5 items total)
    first_five = jobs[0:5]
    
    # Jobs 5 to 20 (exclusive of 20, so 15 items total)
    next_fifteen = jobs[5:20]

    # 3. Handle the storage for the user-specific file
    user_dir = str(user.user_id)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    storage_path = os.path.join(user_dir, 'jobs.json')
    
    with open(storage_path, 'w') as f:
        json.dump(next_fifteen, f, indent=4)

    # 4. Return the first 5 jobs
    return first_five


def user_worker(user):

    PROCESS_INTERVAL = 4 * 3600
    READ_JOBS_INTERVAL = 20

    jobs_file = f"./{user.user_id}/jobs.json"

    print(f"Worker started for User {user.user_id}")

    # 🔹 Call find_jobs ONLY ONCE
    top_jobs = find_jobs(user)

    # while user.is_active:

    # Process jobs currently in memory
    while top_jobs and user.is_active:

        for job in top_jobs:

            if not user.is_active:
                return

            thread = threading.Thread(
                target=job_retry_worker,
                args=(user, job),
                daemon=True
            )
            thread.start()

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


        # time.sleep(PROCESS_INTERVAL)  # wait before next cycle


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