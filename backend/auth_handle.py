from fastapi import HTTPException
import db.mongo_db as db
import bcrypt
from jwt import encode
from datetime import datetime, timedelta
from jwt_token import create_token

def login_user(email: str, password: str):
    """
    Validates user credentials and returns user data and token.
    Raises HTTPException on failure.
    """
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required.")

    if db.profile_collection is None:
        print("db.profile_collection is none")
    else:
        print("db.profile_collection is ready")
    
    # Find user in DB
    user = db.profile_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check password
    hashed = user.get("password")
    if not hashed or not bcrypt.checkpw(password.encode(), hashed.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Remove sensitive fields
    user.pop("password", None)
    user_id = str(user.get("_id")) if user.get("_id") else None
    if user_id:
        user["_id"] = user_id

    # Create JWT token
    token = create_token({"user_id": user_id, "email": email})

    return {"user": user, "token": token}


def register_user(user: dict, password: str):
    """
    Registers a new user, hashes the password, and returns user info + JWT token.
    Raises HTTPException on failure.
    """
    email = user.get("email")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required.")

    # Check if email already exists
    if db.profile_collection.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered.")

    # Hash password
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_to_store = {**user, "password": hashed, "created_at": datetime.utcnow().isoformat()}

    # Insert user into DB
    res = db.profile_collection.insert_one(user_to_store)

    # Prepare user info for return (without password)
    user_to_return = {**user, "created_at": user_to_store["created_at"], "_id": str(res.inserted_id)}

    # Create JWT token
    token = create_token({"user_id": user_to_return["_id"], "email": email})

    return {"user": user_to_return, "token": token}