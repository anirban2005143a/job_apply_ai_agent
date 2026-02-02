import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Setup connection
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

# Export the specific database/collection for use in nodes
db = client["job_apply_agent"]
profile_collection = db["user_profiles"]

def get_profile(email):
    return profile_collection.find_one({"email": email})