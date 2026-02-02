import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import logging

# Configure logging to see retries in your terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_jobs_with_retry(student_email, base_url="http://localhost:5000/"):
    """
    Fetches jobs from the sandbox and filters out already-applied ones.
    Includes a 3-retry policy for network resilience.
    """
    session = requests.Session()
    
    # 1. Define Retry Strategy (3 tries, wait longer each time)
    retry_strategy = Retry(
        total=3,
        backoff_factor=1, # Wait 1s, 2s, 4s between tries
        status_forcelist=[429, 500, 502, 503, 504], # Retry on these errors
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    try:
        # 2. Fetch Job List
        logger.info("Fetching jobs from Sandbox...")
        response = session.get(f"{base_url}/api/jobs", params={"limit": 30}, timeout=10)
        response.raise_for_status()
        all_jobs = response.json().get("jobs", [])

        # 3. Filter Already Applied Jobs
        final_queue = []
        for job in all_jobs:
            status_res = session.get(
                f"{base_url}/api/application-status", 
                params={"email": student_email, "jobId": job["id"]},
                timeout=5
            )
            if not status_res.json().get("applied"):
                final_queue.append(job)
            else:
                logger.info(f"Skipping {job['id']} - Already Applied.")

        return final_queue

    except Exception as e:
        logger.error(f"Critical Error after retries: {e}")
        return [] # Return empty list so the graph doesn't crash


# print(fetch_jobs_with_retry("123@gmail.com"))