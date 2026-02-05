import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Load Mongo URI
MONGO_URI = os.getenv("MONGO_URI")

# Global variable to hold the collection
profile_collection = None

def connect_to_db():
    global profile_collection
    try:
        client = MongoClient(MONGO_URI)
        print("Connected to database:", MONGO_URI)

        # Get database and collection
        db = client["job_apply_agent"]
        profile_collection = db["user_profiles"]
        print(profile_collection)
        
        return profile_collection
    except Exception as e:
        print("Error while connecting to database:", e)
        raise e

def get_profile(email):
    if profile_collection is None:
        raise Exception("Database not connected. Call connect_to_db() first.")
    return profile_collection.find_one({"email": email})


