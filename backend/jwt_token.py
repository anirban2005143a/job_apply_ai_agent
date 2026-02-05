import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import jwt

from fastapi import HTTPException
from bson import ObjectId

import db.mongo_db as db

load_dotenv()


JWT_SECRET = os.getenv("JWT_SECRET", "change-this-secret")
JWT_ALGORITHM = "HS256"
JWT_EXP_DAYS = 7

def create_token(payload: dict, days: int = JWT_EXP_DAYS):
    """
    Create JWT with expiry
    """
    data = payload.copy()
    exp = datetime.utcnow() + timedelta(days=days)
    data.update({"exp": exp})
    token = jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_jwt_token(auth_header: str):
    """
    Verifies a JWT token from the Authorization header.
    Returns the user payload if valid.
    Raises HTTPException if invalid.
    """
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token format")
    
    token = auth_header.split(" ")[1]
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_signature": True, "verify_exp": True}
        )
        
        user_id_str = payload.get("user_id")
        if not user_id_str:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Convert string ID to MongoDB ObjectId
        try:
            user_id_obj = ObjectId(user_id_str)
        except Exception:
            raise HTTPException(status_code=400, detail="Malformed User ID")
        
        
        if db.profile_collection is None:
            print("db.profile_collection is none")
        else:
            print("db.profile_collection is ready")
        
        
        # Verify user exists in DB
        user = db.profile_collection.find_one({"_id": user_id_obj})
        if not user:
            raise HTTPException(status_code=401, detail="User no longer exists")
        
        return payload  # Return the whole payload if needed
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")