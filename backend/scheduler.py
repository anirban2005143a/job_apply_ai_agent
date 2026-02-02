from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

def scheduled_job_task(thread_id, user_profile):
    config = {"configurable": {"thread_id": thread_id}}
    # Check current state first
    current_state = agent_executor.get_state(config).values
    
    # Only run if the user hasn't "Stopped" it in the chat
    if current_state.get("is_active", False):
        print(f"Executing 4-hour background fetch for {thread_id}")
        agent_executor.invoke({"user_profile": user_profile}, config)

scheduler.start()