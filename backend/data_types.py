from pydantic import BaseModel , EmailStr

class RegisterRequest(BaseModel):
    user: dict
    password: str
    

class LoginRequest(BaseModel):
    email: EmailStr
    password: str