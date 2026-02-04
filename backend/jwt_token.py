import os
from dotenv import load_dotenv

load_dotenv()


JWT_SECRET = os.getenv("JWT_SECRET", "change-this-secret")
JWT_ALGORITHM = "HS256"
JWT_EXP_DAYS = 7

def create_token(payload: dict, days: int = JWT_EXP_DAYS):
    # Create JWT with expiry
    data = payload.copy()
    exp = datetime.utcnow() + timedelta(days=days)
    data.update({"exp": exp})
    token = jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token
