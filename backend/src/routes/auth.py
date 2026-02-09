from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/auth")

SECRET = os.getenv("BETTER_AUTH_SECRET", "")

class SigninRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str = ""

class AuthResponse(BaseModel):
    success: bool
    user: dict
    token: str

def generate_jwt_token(user_id: str, email: str) -> str:
    """Generate JWT token for user"""
    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(datetime.utcnow().timestamp()),
        "exp": int((datetime.utcnow() + timedelta(days=7)).timestamp())
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

@router.post("/signin")
async def signin(request: SigninRequest):
    """Sign in user - Generate JWT token"""
    try:
        # For MVP: Accept any email/password combination
        # In production: Validate against database with password hash

        # Generate user_id from email (simple approach)
        user_id = request.email.split("@")[0] + "-" + str(int(datetime.utcnow().timestamp()))[-6:]

        # Generate JWT token
        token = generate_jwt_token(user_id, request.email)

        return {
            "success": True,
            "user": {
                "id": user_id,
                "email": request.email,
                "name": request.email.split("@")[0]
            },
            "token": token
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/signup")
async def signup(request: SignupRequest):
    """Sign up user - Create account and generate JWT token"""
    try:
        # For MVP: Accept any email/password combination
        # In production: Validate email uniqueness, hash password, store in database

        # Generate user_id from email
        user_id = request.email.split("@")[0] + "-" + str(int(datetime.utcnow().timestamp()))[-6:]

        # Generate JWT token
        token = generate_jwt_token(user_id, request.email)

        return {
            "success": True,
            "user": {
                "id": user_id,
                "email": request.email,
                "name": request.name or request.email.split("@")[0]
            },
            "token": token
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
