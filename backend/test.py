from job_manager import job_manager , submit_application , job_retry_worker
from data_types import User
import db.mongo_db as db
import json
import time

db.connect_to_db()

user_id = "69834eb4f44210db096c223c"

job_manager.add_user(user_id)

job_manager.start_user(user_id)

time.sleep(2*60)

job_manager.stop_user(user_id=user_id)

