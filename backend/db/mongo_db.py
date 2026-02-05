import os
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import json

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

def get_user_profile(user_id):
    # Convert string ID to MongoDB ObjectId
    try:
        user_id_obj = ObjectId(user_id)
    except Exception:
        raise Exception("Malformed User ID")


    if profile_collection is None:
        raise Exception("profile_collection is none")
    else:
        print("profile_collection is ready")

    print("Finding user")
    user = profile_collection.find_one({"_id": user_id_obj})

    if not user:
        raise Exception("User not found")

    user.pop("password", None)
    user.pop("_id", None)
    user.pop("created_at", None)

    return user


# connect_to_db()

# print(get_user_profile("69834eb4f44210db096c223c")["skills"])