from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from uuid import uuid4
from datetime import datetime
import random
import json
import os
import threading
import uvicorn

from search_jobs import search_top_jobs , get_vector_db , init_bm25

app = FastAPI(title="Job Portal Server")

# CORS (allow all for convenience)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(__file__)
APPLIED_FILE = os.path.join(BASE_DIR, "applied_jobs.json")
ACCEPTED_FILE = os.path.join(BASE_DIR, "accepted_jobs.json")
REJECTED_FILE = os.path.join(BASE_DIR, "rejected_jobs.json")
PENDING_FILE = os.path.join(BASE_DIR, "pending_jobs.json")

_lock = threading.Lock()


def ensure_file(path: str):
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump([], f)


def read_json(path: str):
    ensure_file(path)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def append_json(path: str, item: dict):
    with _lock:
        data = read_json(path)
        data.append(item)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)


# Ensure files exist at startup
for p in (APPLIED_FILE, ACCEPTED_FILE, REJECTED_FILE, PENDING_FILE):
    ensure_file(p)


class ApplyRequest(BaseModel):
    name: str = Field(..., example="Alice Example")
    email: EmailStr
    phone: Optional[str] = None
    job_id: str
    resume: str = Field(..., example="Base64 or text of resume")
    cover_letter: Optional[str] = None
    evidence_points: Optional[str] = None


class ApplyResponse(BaseModel):
    application_id: str
    status: str

class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 20
    
# Initialize vector store (do this once)
vector_db = get_vector_db()

# Initialize BM25 (do this once)
init_bm25(vector_db)

def job_exists(job_id: str, jobs_file: str = "./jobs.json") -> bool:
    try:
        with open(jobs_file, "r") as f:
            jobs = json.load(f)

        return any(str(job.get("id")) == str(job_id) for job in jobs)

    except Exception:
        # If jobs file is unreadable, fail safe
        return False


def already_applied(applied_file: str, job_id: str, email: str) -> bool:
    if not os.path.exists(applied_file):
        return False

    with open(applied_file, "r") as f:
        try:
            applied_jobs = json.load(f)
        except json.JSONDecodeError:
            return False

    return any(
        job.get("job_id") == job_id and job.get("email") == email
        for job in applied_jobs
    )

@app.post("/search")
async def search_jobs(request: SearchRequest):
    """Return top matching jobs for a user query."""
    try:
        results = search_top_jobs(
            query=request.query,
            vector_db=vector_db,
        )
        return {
            "query": request.query,
            "results": results
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/apply", response_model=ApplyResponse)
async def apply_job(payload: ApplyRequest):
    """Apply for a job and store application; randomly accept or reject immediately."""
    
    # ---- Validate job ID ----
    if not job_exists(payload.job_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid job_id: job does not exist"
        )
    
    # ---- prevent duplicate application ----
    if already_applied(APPLIED_FILE, payload.job_id, str(payload.email)):
        raise HTTPException(
            status_code=409,
            detail="You have already applied for this job with this email"
        )
    
    application_id = str(uuid4())
    timestamp = datetime.utcnow().isoformat()

    application = {
        "application_id": application_id,
        "job_id": payload.job_id,
        "name": payload.name,
        "email": str(payload.email),
        "phone": payload.phone,
        "resume": payload.resume,
        "cover_letter": payload.cover_letter,
        "evidence_points": payload.evidence_points,
        "applied_at": timestamp,
    }

    # 1) store in applied
    try:
        append_json(APPLIED_FILE, application)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store application: {e}")

    # 2) randomly decide acceptance, rejection, or pending
    decision = random.choice(["accepted", "rejected", "pending"])
    record = {
        "application_id": application_id,
        "job_id": payload.job_id,
        "email": str(payload.email),
        "decision_at": timestamp,
        "decision": decision,
    }

    try:
        if decision == "accepted":
            append_json(ACCEPTED_FILE, record)
        elif decision == "rejected":
            append_json(REJECTED_FILE, record)
        else:
            append_json(PENDING_FILE, record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store decision: {e}")

    return ApplyResponse(application_id=application_id, status="pending")


@app.get("/status")
async def application_status(email: EmailStr, job_id: str):
    """Check the status of a job application for a given email and job id."""
    email = str(email)

    # search accepted
    accepted = read_json(ACCEPTED_FILE)
    for rec in accepted:
        if rec.get("email") == email and rec.get("job_id") == job_id:
            return {"status": "accepted", "record": rec}

    # search rejected
    rejected = read_json(REJECTED_FILE)
    for rec in rejected:
        if rec.get("email") == email and rec.get("job_id") == job_id:
            return {"status": "rejected", "record": rec}

    # search pending
    pending = read_json(PENDING_FILE)
    for rec in pending:
        if rec.get("email") == email and rec.get("job_id") == job_id:
            return {"status": "pending", "record": rec}

    # otherwise no record found -> pending
    raise HTTPException(status_code=400 , detail="Application not found") 

@app.get("/")
async def root():
    return {"message": "Job Portal Server is running"}


if __name__ == "__main__":

    uvicorn.run("server:app", host="0.0.0.0", port=5000, reload=True)
