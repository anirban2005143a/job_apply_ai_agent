from langchain_huggingface import HuggingFaceEndpoint , ChatHuggingFace
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import db.mongo_db as db
from bson import ObjectId
import os
import json

load_dotenv()

db.connect_to_db()

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


llm = HuggingFaceEndpoint(
    repo_id="meta-llama/Llama-3.1-8B-Instruct",
    huggingfacehub_api_token=os.environ["HUGGINGFACEHUB_API_TOKEN"]
)
model = ChatHuggingFace(llm = llm)


def generate_query_for_job_search(user_id):
    if not user_id:
        raise Exception("User id is required")
    
    # Convert string ID to MongoDB ObjectId
    try:
        user_id_obj = ObjectId(user_id)
    except Exception:
        raise Exception("Malformed User ID")
    
    if db.profile_collection is None:
        raise Exception("db.profile_collection is none")
    else:
        print("db.profile_collection is ready")

    print("Finding user")
    user = db.profile_collection.find_one({"_id": user_id_obj})

    if not user:
        raise Exception("User not found")

    user.pop("password", None)
    user.pop("_id", None)
    user.pop("created_at", None)

    # Convert MongoDB specific fields like ObjectId or datetime to strings for the LLM
    # user["_id"] = str(user["_id"])
    # if "created_at" in user:
    #     user["created_at"] = str(user["created_at"])

    # The LLM needs a string representation of the JSON
    user_json_str = json.dumps(user, indent=2)

    print("Invoke chain")

    chain = JOB_QUERY_PROMPT | model
    result = chain.invoke({"user_json": user_json_str})

    # If result is a ChatMessage object (typical in LangChain), extract the content string
    query_string = result.content if hasattr(result, 'content') else str(result)    

    return query_string.strip()


user_id = "69834eb4f44210db096c223c"
query = generate_query_for_job_search(user_id)

print(query)