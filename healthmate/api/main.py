from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


from healthmate.retriever.search import hybrid_search
from healthmate.llm.rag import answer_with_context
from healthmate.api.safety import safety_gate

# Authentication imports
from healthmate.api.models import (
    UserSignup,
    UserLogin,
    TokenResponse,
    UserResponse,
    UserProfileResponse,
    UserProfile
)
from healthmate.api.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_token,
)
from healthmate.api.database import (
    get_user_by_email,
    create_user,
    update_user_profile_by_email,
    create_llm_interaction,
    update_llm_interaction_feedback,
    get_llm_interaction_stats,
)

# Security
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

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
    history: list | None = None
    user_id: Optional[str] = None


class FeedbackPayload(BaseModel):
    interaction_id: str
    feedback: int
    feedback_comment: Optional[str] = None


@app.get("/health")
def health():
    return {"ok": True}


# @app.post("/extract")
# def extract(q: Query):
#     return {"entities": parse_clinical(q.text), "medications": extract_medications(q.text)}


@app.post("/chat")
async def chat(
    q: Query,
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security),
):
    user_id = q.user_id
    if credentials:
        payload = decode_token(credentials.credentials)
        token_user_id = payload.get("user_id") or payload.get("sub")
        if token_user_id:
            user_id = token_user_id

    history_text = (
        "\n".join([f"{m['type'].capitalize()}: {m['content']}" for m in q.history])
        if q.history
        else ""
    )
    full_prompt = f"{history_text}\nUser: {q.text}" if history_text else q.text
    hits = hybrid_search(full_prompt, k=3)
    llm_result = answer_with_context(full_prompt, hits)
    answer = llm_result["answer"]
    gated = safety_gate(q.text, answer, hits)

    interaction_id = None
    try:
        interaction_id = await create_llm_interaction(
            user_id=user_id,
            user_input=q.text,
            full_prompt=full_prompt,
            system_prompt=llm_result["system_prompt"],
            final_prompt=llm_result["final_prompt"],
            model_response=answer,
            model_name=llm_result["model"],
            retrieved_documents=hits,
            history=q.history,
        )
    except Exception as exc:
        print(f"Error logging LLM interaction: {exc}")

    response_payload = {
        "interaction_id": interaction_id,
        "retrieved": hits,
        **gated,
    }
    return response_payload


@app.post(
    "/auth/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def signup(user_data: UserSignup):
    """
    Create a new user account
    """
    # Check if user already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
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
        "createdAt": datetime.utcnow(),
    }

    # Save to database
    try:
        created_user = await create_user(user_doc)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}",
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
        createdAt=created_user["createdAt"],
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
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
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
        createdAt=user["createdAt"],
    )

    return TokenResponse(access_token=access_token, user=user_response)


@app.get("/user/profile", response_model=UserProfileResponse)
async def get_user_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
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
                detail="Invalid token: email not found",
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    # Fetch user from database by email
    user = await get_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
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
        createdAt=user["createdAt"],
    )

    return user_profile

@app.put("/user/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Update user profile by email from JWT token
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
    
    # Get user by email
    user = await get_user_by_email(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user profile
    try:
        updated_user = await update_user_profile_by_email(email, profile_data)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile"
            )
        
        # Prepare response
        user_profile = UserProfileResponse(
            id=str(updated_user["_id"]),
            fullName=updated_user["fullName"],
            email=updated_user["email"],
            age=updated_user.get("age", ""),
            gender=updated_user.get("gender", ""),
            allergies=updated_user.get("allergies", []),
            medications=updated_user.get("medications", []),
            conditions=updated_user.get("conditions", []),
            createdAt=updated_user["createdAt"]
        )
        
        return user_profile
        
    except Exception as e:
        print(f"Error updating profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@app.post("/llm/feedback")
async def record_llm_feedback(payload: FeedbackPayload):
    if payload.feedback not in (-1, 1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback must be +1 or -1",
        )

    updated = await update_llm_interaction_feedback(
        payload.interaction_id,
        payload.feedback,
        payload.feedback_comment,
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interaction not found or feedback unchanged",
        )

    return {"ok": True}


@app.get("/llm/analytics")
async def llm_analytics():
    stats = await get_llm_interaction_stats()
    return stats
