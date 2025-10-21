"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserSignup(BaseModel):
    fullName: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    age: str
    gender: str
    allergies: Optional[List[str]] = []
    medications: Optional[List[str]] = []
    conditions: Optional[List[str]] = []

class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=100)
    password: str

class UserResponse(BaseModel):
    id: str
    firstName: str
    email: str
    createdAt: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserProfile(BaseModel):
    name: str
    age: Optional[str] = None
    gender: Optional[str] = None
    allergies: List[str] = []
    medications: List[str] = []
    conditions: List[str] = []
    language: str = "en"

