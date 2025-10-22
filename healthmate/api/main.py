from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime


# from healthmate.nlp.pipeline import parse_clinical
# from healthmate.nlp.meds import extract_medications
# from healthmate.retriever.search import hybrid_search
# from healthmate.llm.rag import answer_with_context
# from healthmate.api.safety import safety_gate

# Authentication imports
from healthmate.api.models import UserSignup, UserLogin, TokenResponse, UserResponse, UserProfileResponse
from healthmate.api.auth import get_password_hash, verify_password, create_access_token, decode_token
from healthmate.api.database import get_user_by_email, create_user

# Security
security = HTTPBearer() 

app = FastAPI(title="HealthMate MVP")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"ok": True}

# @app.post("/extract")
# def extract(q: Query):
#     return {"entities": parse_clinical(q.text), "medications": extract_medications(q.text)}

# @app.post("/chat")
# def chat(q: Query):
#     hits = hybrid_search(q.text, k=3)
#     ans  = answer_with_context(q.text, hits)
#     gated = safety_gate(q.text, ans, hits)
#     return {"retrieved": hits, **gated}

@app.post("/auth/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """
    Create a new user account
    """
    # Check if user already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_doc = {
        "fullName": user_data.fullName,
        "email": user_data.email,
        "password": hashed_password,
        "age": user_data.age,
        "gender": user_data.gender,
        "allergies": user_data.allergies or [],
        "medications": user_data.medications or [],
        "conditions": user_data.conditions or [],
        "createdAt": datetime.utcnow()
    }
    
    # Save to database
    try:
        created_user = await create_user(user_doc)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )
    
    # Generate JWT token
    access_token = create_access_token(
        data={"sub": created_user["email"], "user_id": created_user["_id"]}
    )
    
    # Prepare response
    user_response = UserResponse(
        id=created_user["_id"],
        fullName=created_user["fullName"],
        email=created_user["email"],
        createdAt=created_user["createdAt"]
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@app.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Authenticate user and return JWT token (async)
    """
    # Find user by email
    user = await get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate JWT token
    access_token = create_access_token(
        data={"sub": user["email"], "user_id": str(user["_id"])}
    )
    
    # Prepare response
    user_response = UserResponse(
        id=str(user["_id"]),
        fullName=user["fullName"],
        email=user["email"],
        createdAt=user["createdAt"]
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@app.get("/user/profile", response_model=UserProfileResponse)
async def get_user_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get user profile by email from JWT token
    Requires: Authorization header with Bearer token
    """
    # Decode JWT token to get email
    try:
        payload = decode_token(credentials.credentials)
        email = payload.get("sub")  # "sub" contains the email
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: email not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    # Fetch user from database by email
    user = await get_user_by_email(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prepare and return user profile
    user_profile = UserProfileResponse(
        id=str(user["_id"]),
        fullName=user["fullName"],
        email=user["email"],
        age=user.get("age", ""),
        gender=user.get("gender", ""),
        allergies=user.get("allergies", []),
        medications=user.get("medications", []),
        conditions=user.get("conditions", []),
        createdAt=user["createdAt"]
    )
    
    return user_profile
