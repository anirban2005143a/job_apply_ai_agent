import json
import os

def get_user_folder(user_id):
    """Creates a folder based on the unique user ID."""
    path = f"data/{user_id}"
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)
    return path

def log_job_status(user_id, status, job_data):
    """
    Logs job to applied.json, rejected.json, or pending.json.
    status: 'applied' | 'rejected' | 'pending'
    """
    path = get_user_folder(user_id)
    filepath = os.path.join(path, f"{status}.json")
    
    # For 'pending', we usually overwrite the whole list, 
    # for 'applied/rejected', we append.
    if status == "pending":
        with open(filepath, 'w') as f:
            json.dump(job_data, f, indent=4)
        return

    existing = []
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            try: existing = json.load(f)
            except: existing = []
    
    existing.append(job_data)
    with open(filepath, 'w') as f:
        json.dump(existing, f, indent=4)