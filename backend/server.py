from fastapi import FastAPI, HTTPException, UploadFile, File, Request 
from fastapi import WebSocket , WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
from filelock import FileLock

import json
import asyncio
import time
import os
import jwt
import bcrypt
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId

from document_loader import parser
import db.mongo_db as db
from data_types import RegisterRequest , LoginRequest
from jwt_token import create_token, verify_jwt_token
from auth_handle import login_user , register_user
from websocker_handle import websocket_manager
from job_manager import job_manager

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

db.connect_to_db()

@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.post("/parse-resumes")
async def parse_resumes(files: List[UploadFile] = File(...)):
    """Accept multiple resume files (PDF), parse them via LLM and return extracted user data."""
    print(f"[server] Received /parse-resumes request with {len(files) if files else 0} files.")
    print(f"[server] /parse-resumes: {len(files) if files else 0} files received.")
    if not files or len(files) == 0:
        print("[server] No files uploaded to /parse-resumes.")
        raise HTTPException(status_code=400, detail="No files uploaded")

    from io import BytesIO

    uploads = []
    for f in files:
        contents = await f.read()
        print(f"[server] Processing file: {f.filename}, size: {len(contents)} bytes.")
        bio = BytesIO(contents)
        bio.name = f.filename
        uploads.append(type("U", (), {"filename": f.filename, "file": bio}))

    try:
        print("[server] Invoking parser.parse_resumes_from_uploads...")
        result = parser.parse_resumes_from_uploads(uploads)
        print("[server] Parsing successful. Returning user data.")
        return {"ok": True, "user": result}
    except Exception as e:
        print(f"[server] Error in /parse-resumes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/register")
async def register(req: RegisterRequest):
    """
    Register endpoint: create a new user and return JWT token.
    """
    try:
        result = register_user(req.user, req.password)
        return {"success": True, "user": result["user"], "token": result["token"]}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[server] Error in /api/register: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/api/login")
async def login(req: LoginRequest):
    """
    Login endpoint: validate email/password and return token.
    """
    try:
        result = login_user(req.email, req.password)
        return {"success": True, "user": result["user"], "token": result["token"]}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[server] Error in /api/login: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/verify-token")
async def verify_token(request: Request):
    """Checks if the JWT token in the Authorization header is valid."""
    auth_header = request.headers.get("Authorization")
    # print("auth_header " , auth_header)
    
    payload = verify_jwt_token(auth_header)
    return {"valid": True, "user_id": payload.get("user_id")}
    

@app.get("/jobs/{user_id}/applied")
def get_applied_jobs(user_id: str):
    """
    Reads {user_id}/applied_jobs.json with a lock and returns the jobs.
    """
    jobs_file = os.path.join(user_id, "applied_jobs.json")
    lock_file = jobs_file + ".lock"  # create a lock file alongside the JSON

    if not os.path.exists(jobs_file):
        return {"jobs": []}

    try:
        with FileLock(lock_file):
            with open(jobs_file, "r") as f:
                try:
                    jobs = json.load(f)
                except json.JSONDecodeError:
                    jobs = []  # empty or invalid file -> treat as empty list

        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/jobs/{user_id}/rejected")
def get_rejected_jobs(user_id: str):
    """
    Reads {user_id}/rejected_jobs.json with a lock and returns the jobs.
    """
    jobs_file = os.path.join(user_id, "rejected_jobs.json")
    lock_file = jobs_file + ".lock"

    if not os.path.exists(jobs_file):
        return {"jobs": []}

    try:
        with FileLock(lock_file):
            with open(jobs_file, "r") as f:
                try:
                    jobs = json.load(f)
                except json.JSONDecodeError:
                    jobs = []  # empty or invalid file -> treat as empty list

        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/jobs/{user_id}/pending")
def get_rejected_jobs(user_id: str):
    """
    Reads {user_id}/pending_jobs.json with a lock and returns the jobs.
    """
    jobs_file = os.path.join(user_id, "pending_jobs.json")
    lock_file = jobs_file + ".lock"

    if not os.path.exists(jobs_file):
        return {"jobs": []}

    try:
        with FileLock(lock_file):
            with open(jobs_file, "r") as f:
                try:
                    jobs = json.load(f)
                except json.JSONDecodeError:
                    jobs = []  # empty or invalid file -> treat as empty list

        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/jobs/{user_id}/calrify")
def get_rejected_jobs(user_id: str):
    """
    Reads {user_id}/clarify_jobs.json with a lock and returns the jobs.
    """
    jobs_file = os.path.join(user_id, "clarify_jobs.json")
    lock_file = jobs_file + ".lock"

    if not os.path.exists(jobs_file):
        return {"jobs": []}

    try:
        with FileLock(lock_file):
            with open(jobs_file, "r") as f:
                try:
                    jobs = json.load(f)
                except json.JSONDecodeError:
                    jobs = []  # empty or invalid file -> treat as empty list

        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/user/{user_id}/start")
def start_user(user_id: str):
    """
    Start processing jobs for a user.
    """
    try:
        job_manager.start_user(user_id)
        return {"status": "success", "message": f"User {user_id} started."}
    except Exception as e:
        print("Error in user start api" , e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/user/{user_id}/stop")
def stop_user(user_id: str):
    """
    Stop processing jobs for a user.
    """
    try:
        job_manager.stop_user(user_id)
        return {"status": "success", "message": f"User {user_id} stopped."}
    except Exception as e:
        print("Error in user stop api" , e)
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/{user_id}")
async def websocket_connection(websocket: WebSocket, user_id: str):
    await websocket_manager.connect(user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            print("Recieve from user" , user_id , "data" , data)
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(user_id)


if __name__ == "__main__":
    
    uvicorn.run("server:app", host="0.0.0.0", port=int(os.getenv('PORT', 8000)), reload=True)
