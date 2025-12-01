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
    fullName: str
    email: str
    createdAt: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserProfile(BaseModel):
    fullName: str = Field(..., min_length=1, max_length=100)
    age: str
    gender: str
    allergies: Optional[List[str]] = []
    medications: Optional[List[str]] = []
    conditions: Optional[List[str]] = []

class UserProfileResponse(BaseModel):
    id: str
    fullName: str
    email: str
    age: str
    gender: str
    allergies: List[str]
    medications: List[str]
    conditions: List[str]
    createdAt: datetime

class Message(BaseModel):
    role: str
    content: str
    timestamp: datetime

class SaveChatRequest(BaseModel):
    title: Optional[str] = None
    messages: List[dict]  # Accept flexible message format from frontend

class Conversation(BaseModel):
    userEmail: str
    title: str
    messages: List[Message]
    createdAt: datetime


class SendEmailRequest(BaseModel):
    provider_email: str = Field(..., min_length=3, max_length=100)
    conversation_id: str
    email_subject: Optional[str] = None  # Optional custom email subject, defaults to chat title


