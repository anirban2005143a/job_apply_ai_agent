from pydantic import BaseModel , EmailStr

class RegisterRequest(BaseModel):
    user: dict
    password: str
    

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class User:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.is_active = True