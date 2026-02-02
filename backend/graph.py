import os
import re
import json
import sqlite3
import operator
import requests
from typing import Annotated, List, TypedDict, Literal, Union

from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.tools import tool
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.sqlite import SqliteSaver

# Existing logic imports
from fetch_jobs import fetch_jobs_with_retry 
from dotenv import load_dotenv

load_dotenv()

# --- Helpers for job log access (used by server.get_user_jobs) ---

def _sanitize_userid(uid: str) -> str:
    """Sanitize a user identifier for use in file paths (lowercase, safe chars).

    Examples:
      dasanirban268@gmail.com -> dasanirban268_gmail_com
    """
    if not uid:
        return "anonymous"
    s = uid.lower()
    # replace non-alphanumeric with underscore
    s = re.sub(r"[^a-z0-9_\-]", "_", s)
    return s


def _read_list(uid: str, kind: str):
    """Read a list file from job_logs/<sanitized_userid>/<kind>.json safely.

    Returns an empty list on errors or if the file does not exist.
    """
    try:
        uid_s = _sanitize_userid(uid)
        path = os.path.join("job_logs", uid_s, f"{kind}.json")
        if not os.path.exists(path):
            return []
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            # Common pattern: wrap object in a list
            # If dict contains top-level 'items', return that
            if 'items' in data and isinstance(data['items'], list):
                return data['items']
            return [data]
        return [data]
    except Exception as e:
        print(f"[graph._read_list] Error reading {uid}/{kind}: {e}")
        return []

# --- 1. STATE DEFINITION ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    user_profile: dict
    direct_apply_queue: List[dict]
    clarification_queue: List[dict]
    daily_app_count: int
    current_mode: str  # 'chat', 'sourcing', or 'applying'

# --- 2. TOOLS FOR FILE SEARCH & ACTIONS ---

@tool
def get_job_logs(status: Literal["pending", "applied", "rejected"]):
    """
    Query the local file system for jobs based on their status. 
    Use this when the user asks to see their history, pending requests, or rejected jobs.
    """
    # This pulls from your existing file-based storage logic
    from __main__ import _read_list, _get_user_id_from_state # Assuming helpers are accessible
    # In a real script, move _read_list to a shared utils file
    return f"Fetching {status} jobs from local records..."

@tool
def trigger_new_search():
    """
    Starts a fresh search for new job postings. 
    Use this when the user says 'find me jobs', 'start search', or 'look for work'.
    """
    return "SIGNAL_START_SEARCH"

@tool
def trigger_apply_pending():
    """
    Begins the process of applying to jobs currently in the 'pending' list.
    Use this when the user says 'apply to pending', 'process my list', or 'start applying'.
    """
    return "SIGNAL_PROCESS_PENDING"

tools = [get_job_logs, trigger_new_search, trigger_apply_pending]
tool_node = ToolNode(tools)

# --- 3. LLM SETUP ---
llm_endpoint = HuggingFaceEndpoint(
    repo_id="Qwen/Qwen2.5-7B-Instruct", 
    huggingfacehub_api_token=os.environ["HUGGINGFACEHUB_API_TOKEN"],
)
model = ChatHuggingFace(llm=llm_endpoint).bind_tools(tools)

def personalize_and_submit(job, state):
    """Encapsulated logic to generate artifacts and POST to API.

    Always returns a dict with keys: status ('ok'|'failed'), reason (optional), receipt (optional), job.
    This makes downstream processing and frontend rendering predictable.
    """
    def _safe_job_id(j):
        return j.get("id") or j.get("job_id") or j.get("ref") or None

    job_id = _safe_job_id(job) or "unknown"
    full_name = (state.get("user_profile") or {}).get("full_name") or (state.get("user_profile") or {}).get("name") or "Unknown"
    student_email = (state.get("user_profile") or {}).get("email") or ""

    prompt = [
        {
            "role": "system",
            "content": (
                """
                    You are a job-application generator in a production pipeline.

                    CRITICAL RULES:
                    - Return ONLY valid JSON.
                    - DO NOT explain anything.
                    - DO NOT include markdown or code.
                    - DO NOT invent facts.
                    - Use ONLY the provided student profile.
                    - NEVER return placeholders such as "string", "text", "example", or empty values.
                    - Every field must contain real, relevant content.
                """
            )
        },
        {
            "role": "user",
            "content": f"""
                Student Profile:
                {json.dumps(state.get('user_profile', {}), indent=2)}

                Job:
                {json.dumps(job, indent=2)}

                    TASK:
                    Generate a grounded job application using ONLY the student profile.

                    Return EXACTLY this JSON structure:

                    {{
                        "tailoredResume": "A concise resume summary tailored to the job, referencing real projects or skills from the profile",
                        "recruiterNote": "A short personalized cover letter paragraph written to the recruiter",
                        "evidenceMap": [
                            {{
                            "requirement": "One requirement from the job",
                            "bullet": "A specific bullet mapped to real skills or projects from the student profile"
                            }}
                        ]
                    }}

                    VALIDATION RULES:
                    - All fields must contain real text derived from the student profile.
                    - If the student profile does NOT support a requirement, omit it from evidenceMap.
                    - DO NOT use placeholder words.
                    - Output MUST be valid JSON and nothing else.

                """
        }
    ]

    try:
        raw_resp = model.invoke(prompt)
        raw = getattr(raw_resp, 'content', raw_resp)
        print("Raw LLM Response:", raw)

        parsed = None
        if isinstance(raw, (dict, list)):
            parsed = raw
        else:
            cleaned = re.sub(r"```json|```", "", str(raw)).strip()
            try:
                parsed = json.loads(cleaned)
            except Exception:
                s = cleaned
                start_idx = s.find('{')
                end_idx = s.rfind('}')
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    candidate = s[start_idx:end_idx+1]
                    try:
                        parsed = json.loads(candidate)
                    except Exception:
                        parsed = None

        if not parsed or not isinstance(parsed, dict):
            reason = 'LLM did not return a valid JSON application package'
            print(f"[personalize] Invalid LLM output for job {job_id}: {raw}")
            return {"status": "failed", "reason": reason, "receipt": None, "job": job}

        # Validate required fields
        if not parsed.get('tailoredResume') or not parsed.get('recruiterNote'):
            return {"status": "failed", "reason": "missing_fields_in_LLM_output", "receipt": None, "job": job}

        payload = {
            "jobId": job_id,
            "fullName": full_name,
            "studentEmail": student_email,
            "workAuthStatus": (state.get('user_profile') or {}).get('visaType'),
            "tailoredResume": parsed.get('tailoredResume'),
            "recruiterNote": parsed.get('recruiterNote'),
            "evidenceMap": parsed.get('evidenceMap') or []
        }

        base = os.environ.get('API_BASE_URL')
        if not base:
            return {"status": "failed", "reason": "missing_api_base_url", "receipt": None, "job": job}

        try:
            res = requests.post(f"{base.rstrip('/')}/api/apply", json=payload, timeout=10)
            j = res.json() if res.content else {}
            if res.status_code == 201:
                receipt = j.get('receipt') or j
                return {"status": "ok", "receipt": receipt, "job": job}
            else:
                return {"status": "failed", "reason": f"api_error_{res.status_code}", "details": j, "receipt": None, "job": job}
        except Exception as e:
            print(f"[personalize] HTTP error applying for job {job_id}: {e}")
            return {"status": "failed", "reason": str(e), "receipt": None, "job": job}

    except Exception as e:
        print(f"Error processing job {job_id}: {e}")
        return {"status": "failed", "reason": str(e), "receipt": None, "job": job}


# --- 4. NODE FUNCTIONS ---

def agent_router(state: AgentState):
    """The entry node that interprets the user's message."""
    response = model.invoke(state["messages"])
    # Normalize response content: convert non-string content to JSON string so frontend
    # never receives raw Python objects in message content.
    try:
        content = getattr(response, "content", response)
        if not isinstance(content, str):
            content = json.dumps(content, default=str)
        response = AIMessage(content=content)
    except Exception:
        response = AIMessage(content=str(getattr(response, "content", response)))
    return {"messages": [response]} 

def sourcing_node(state: AgentState):
    """Fetches jobs and sorts them into Direct or Clarify queues."""
    email = state["user_profile"].get("email")
    raw_jobs = fetch_jobs_with_retry(email)
    
    direct = []
    to_clarify = []
    
    # Simple logic: for now, we just populate the queue
    for job in raw_jobs:
        # You can re-insert your scoring logic here
        direct.append({"job": job, "score": 100})
        
    # Sanitize job list for frontend: keep company/title/id and raw for details
    sanitized = []
    for job in raw_jobs:
        j = {
            "company": job.get("company") or job.get("company_name") or job.get("org") or job.get("employer") or None,
            "title": job.get("title") or job.get("job_title") or job.get("position") or job.get("role") or None,
            "id": job.get("id") or job.get("job_id") or job.get("ref") or None,
            "raw": job
        }
        sanitized.append(j)
        
    if len(raw_jobs) == 0:
        # Friendly, actionable message when there are no matches to avoid terse zero-count phrasing
        message_obj = {"text": "No matching jobs were found. Would you like me to start a fresh search for openings?", "kind": "matches", "count": 0}
    else:
        message_obj = {"text": f"I found {len(raw_jobs)} potential jobs.", "kind": "matches", "count": len(raw_jobs)}
    return {
        "direct_apply_queue": direct,
        "listed_kind": "matches",
        "listed_items": sanitized,
        "messages": [AIMessage(content=json.dumps(message_obj))]
    }

def apply_node(state: AgentState):
    """Processes the queue and performs the actual API submission."""
    from __main__ import personalize_and_submit # Use your existing submission logic

    results = []
    queue = state.get("direct_apply_queue", []) or []

    def normalize_receipt(r, job_hint=None):
        # r may be a dict returned from personalize_and_submit or an API receipt
        try:
            if not isinstance(r, dict):
                return {"status": "failed", "reason": str(r), "receipt": str(r), "company": None, "title": None, "appId": None}

            # If this is the wrapper with an inner 'receipt'
            inner = r.get('receipt') if isinstance(r.get('receipt'), dict) else None
            job = r.get('job') or (inner.get('job') if inner else {}) or job_hint or {}

            company = (r.get('company') or job.get('company') or job.get('company_name') or job.get('org'))
            title = (r.get('title') or job.get('title') or job.get('job_title') or job.get('position'))
            appId = (r.get('appId') or r.get('app_id') or (inner and inner.get('appId')) or None)
            status = r.get('status') or (inner and inner.get('status')) or 'failed' if r.get('status') == 'failed' else r.get('status') or 'ok'

            return {
                "company": company,
                "title": title,
                "appId": appId,
                "status": r.get('status') or (inner and inner.get('status')) or 'ok',
                "reason": r.get('reason') or r.get('details') or None,
                "submittedAt": r.get('submittedAt') or r.get('submitted_at') or (inner and inner.get('submittedAt')),
                "receipt": inner or r.get('receipt') or r
            }
        except Exception as e:
            return {"status": "failed", "reason": f"normalize_error: {e}", "receipt": str(r), "company": None, "title": None, "appId": None}

    applied_count = 0
    failed_count = 0

    for item in queue:
        try:
            receipt = personalize_and_submit(item.get("job") or item)
            normalized = normalize_receipt(receipt, job_hint=item.get('job') if isinstance(item, dict) else None)
            results.append(normalized)
            if normalized.get('status') == 'ok':
                applied_count += 1
            else:
                failed_count += 1
        except Exception as e:
            results.append({"status": "failed", "reason": str(e), "receipt": None, "company": None, "title": None, "appId": None})
            failed_count += 1

    message_obj = {"text": f"Applied: {applied_count}, Failed: {failed_count}", "applied_count": applied_count, "failed_count": failed_count}
    return {
        "direct_apply_queue": [], # Clear queue after processing
        "results": results,
        "messages": [AIMessage(content=json.dumps(message_obj, default=str))]
    }

# --- 5. CONDITIONAL ROUTING ---

def route_after_agent(state: AgentState):
    msgs = state.get("messages") or []
    if len(msgs) == 0:
        return END

    last_msg = msgs[-1]

    # Defensive: some message types may not have 'tool_calls'
    try:
        if getattr(last_msg, "tool_calls", False):
            return "tools"
    except Exception:
        pass

    # Check for specific tool signals in the conversation
    full_history = str(msgs)
    if "SIGNAL_START_SEARCH" in full_history:
        return "sourcing"
    if "SIGNAL_PROCESS_PENDING" in full_history:
        return "apply_direct"

    return END

# --- 6. GRAPH CONSTRUCTION ---

def get_job_agent():
    memory = SqliteSaver(sqlite3.connect("checkpoints.db", check_same_thread=False))
    workflow = StateGraph(AgentState)

    workflow.add_node("agent", agent_router)
    workflow.add_node("tools", tool_node)
    workflow.add_node("sourcing", sourcing_node)
    workflow.add_node("apply_direct", apply_node)

    workflow.add_edge(START, "agent")
    
    workflow.add_conditional_edges(
        "agent",
        route_after_agent,
        {
            "tools": "tools",
            "sourcing": "sourcing",
            "apply_direct": "apply_direct",
            END: END
        }
    )

    workflow.add_edge("tools", "agent") # Return to agent to explain tool output
    workflow.add_edge("sourcing", "apply_direct") # Auto-apply after sourcing
    workflow.add_edge("apply_direct", END)

    return workflow.compile(checkpointer=memory)

agent_executor = get_job_agent()