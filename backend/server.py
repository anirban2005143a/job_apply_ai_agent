from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from typing import List, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

import os
import jwt
import bcrypt
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId

from document_loader import parser
from db.mongo_db import profile_collection
from data_types import RegisterRequest , LoginRequest
from jwt_token import create_token, JWT_ALGORITHM , JWT_EXP_DAYS , JWT_SECRET 

# WebSocket manager for live job updates
from fastapi import WebSocket, WebSocketDisconnect

# Registration endpoint
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Job Apply Agent API")

# Allow CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.post("/parse-resumes")
async def parse_resumes(files: List[UploadFile] = File(...)):
    """Accept multiple resume files (PDF/DOCX/TXT), parse them via LLM and return extracted user data."""
    print(f"[server] Received /parse-resumes request with {len(files) if files else 0} files.")
    print(f"[server] /parse-resumes: {len(files) if files else 0} files received.")
    if not files or len(files) == 0:
        print("[server] No files uploaded to /parse-resumes.")
        print("[server] No files uploaded to /parse-resumes.")
        raise HTTPException(status_code=400, detail="No files uploaded")

    from io import BytesIO

    uploads = []
    for f in files:
        contents = await f.read()
        print(f"[server] Processing file: {f.filename}, size: {len(contents)} bytes.")
        print(f"[server] Processing file: {f.filename}, size: {len(contents)} bytes.")
        bio = BytesIO(contents)
        bio.name = f.filename
        uploads.append(type("U", (), {"filename": f.filename, "file": bio}))

    try:
        print("[server] Invoking parser.parse_resumes_from_uploads...")
        print("[server] Invoking parser.parse_resumes_from_uploads...")
        result = parser.parse_resumes_from_uploads(uploads)
        print("[server] Parsing successful. Returning user data.")
        print("[server] Parsing successful. Returning user data.")
        return {"ok": True, "user": result}
    except Exception as e:
        print(f"[server] Error in /parse-resumes: {e}")
        print(f"[server] Error in /parse-resumes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/register")
async def register(req: RegisterRequest):
    try:
        user = req.user
        password = req.password
        email = user.get("email")
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required.")
        # Check for existing email
        if profile_collection.find_one({"email": email}):
            raise HTTPException(status_code=409, detail="Email already registered.")
        # Hash password
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        user_to_store = {**user, "password": hashed, "created_at": datetime.utcnow().isoformat()}
        res = profile_collection.insert_one(user_to_store)

        # Create token and return it along with user info (without password)
        user_to_return = {**user, "created_at": user_to_store["created_at"], "_id": str(res.inserted_id)}
        token = create_token({"user_id": user_to_return["_id"], "email": email})

        return {"success": True, "user": user_to_return, "token": token}
    except HTTPException as e:
        print(e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[server] Error in /api/register: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/login")
async def login(req: LoginRequest):
    """Login endpoint: validate email/password against stored user and return token."""
    try:
        email = req.email
        password = req.password
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required.")

        user = profile_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        hashed = user.get("password")
        if not hashed or not bcrypt.checkpw(password.encode(), hashed.encode()):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Remove sensitive fields before returning
        user.pop("password", None)
        user_id = str(user.get("_id")) if user.get("_id") else None
        if user_id:
            user["_id"] = user_id

        token = create_token({"user_id": user_id, "email": email})

        return {"success": True, "user": user, "token": token}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[server] Error in /api/login: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Add this near your other routes in server.py

@app.get("/api/verify-token")
async def verify_token(request: Request):
    """Checks if the JWT token in the Authorization header is valid."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token format")
    
    token = auth_header.split(" ")[1]
        
    try:
        # Decode the token using your existing JWT settings
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        print("payload " , payload)
        
        user_id_str = payload.get("user_id")
        
        if not user_id_str:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # CRITICAL FIX: Convert string ID to MongoDB ObjectId
        try:
            user_id_obj = ObjectId(user_id_str)
        except Exception:
            raise HTTPException(status_code=400, detail="Malformed User ID")
        
        
        # Optionally: Verify user still exists in DB
        user = profile_collection.find_one({"_id": user_id_obj})
        
        if not user:
            raise HTTPException(status_code=401, detail="User no longer exists")

        return {"valid": True, "user_id": payload.get("user_id")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=int(os.getenv('PORT', 8000)), reload=True)
