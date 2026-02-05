from job_manager import job_manager , submit_application , job_retry_worker
from data_types import User

user_id = "69834eb4f44210db096c223c"
# query = generate_query_for_job_search(user_id)

# print(query)
user = User(user_id)

job = {
    "id": "job_003",
    "title": "Backend Developer",
    "company": "TCS",
    "cities": ["Chennai"],
    "countries": ["India"],
    "is_remote": False,
    "is_hybride": True,
    "is_onsite": False,
    "salary_offered": 1000000,
    "visa_sponsorship_offered": False,
    "start_date": "Within 2 months",
    "required_skills": ["Node.js", "Express", "MongoDB"],
    "description": "Developing backend services and APIs."
  }

print(job_retry_worker(user , job))
