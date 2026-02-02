from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from typing import List, Optional
from langgraph.types import Command
from datetime import datetime

import os
import bcrypt
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from document_loader import parser
from db.mongo_db import profile_collection
from graph import agent_executor
from scheduler import scheduler , scheduled_job_task

# WebSocket manager for live job updates
from fastapi import WebSocket, WebSocketDisconnect
from ws import manager as ws_manager



# Registration endpoint
from pydantic import BaseModel

class RegisterRequest(BaseModel):
    user: dict
    password: str

app = FastAPI(title="Job Apply Agent API")

# Allow CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Input model for the API
class ChatInput(BaseModel):
    user_id: str
    thread_id: str
    user_profile: Optional[dict] = None
    user_response: Optional[str] = None  # Used when replying to a clarification
    user_intent_hint: Optional[str] = None  # Optional hint from client (e.g., 'CHAT')
    simple: Optional[bool] = False  # When true, pass input directly to model and return its reply



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
        profile_collection.insert_one(user_to_store)
        return {"success": True}
    except HTTPException as e:
        print(e)
        raise e
    except Exception as e:
        print(f"[server] Error in /api/register: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=int(os.getenv('PORT', 8000)), reload=True)
