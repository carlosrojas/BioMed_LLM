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
    UserProfile,
    SaveChatRequest,
    Message as MessageModel,
    SendEmailRequest
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
    save_chat_history,
    update_user_profile_by_email,
    create_llm_interaction,
    update_llm_interaction_feedback,
    get_llm_interaction_stats,
    get_chat_history_by_user_email,
    get_conversation_by_id as db_get_conversation_by_id,
    update_conversation_by_id as db_update_conversation_by_id
)
from healthmate.api.email_service import send_chat_to_provider

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

@app.post("/chat/save")
async def save_chat(
    chat_data: SaveChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Save the current chat conversation
    Requires: Authorization header with Bearer token
    """
    # Get user from token
    try:
        payload = decode_token(credentials.credentials)
        email = payload.get("sub")
        
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
    
    try:
        # Convert frontend message format (type) to backend format (role)
        # Frontend sends: {type: "user" | "ai", content: string, timestamp: Date}
        # Backend expects: {role: string, content: string, timestamp: datetime}
        converted_messages = []
        for msg in chat_data.messages:
            # Handle timestamp - it might be a string or datetime
            timestamp = msg.get("timestamp")
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            elif isinstance(timestamp, datetime):
                pass  # Already datetime
            else:
                timestamp = datetime.utcnow()
            
            converted_messages.append(MessageModel(
                role=msg.get("type", "user"),  # Map "type" to "role"
                content=msg.get("content", ""),
                timestamp=timestamp
            ))
        
        # Auto-generate title from first user message if not provided
        title = chat_data.title
        if not title and converted_messages:
            first_user_msg = next((m for m in converted_messages if m.role == "user"), None)
            if first_user_msg:
                title = first_user_msg.content[:50] + ("..." if len(first_user_msg.content) > 50 else "")
        
        if not title:
            title = "Untitled Chat"
        
        saved_chat = await save_chat_history(email, title, converted_messages)
        
        if not saved_chat:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save chat"
            )
        
        # Return the saved chat with _id as string
        saved_chat["_id"] = str(saved_chat["_id"])
        return saved_chat
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save chat: {str(e)}"
        )

@app.get("/chat/history")
async def get_chat_history(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get all saved chats for the authenticated user
    Requires: Authorization header with Bearer token
    """
    try:
        payload = decode_token(credentials.credentials)
        email = payload.get("sub")
        
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
    
    try:
        chat_history = await get_chat_history_by_user_email(email)
        return chat_history or []
    except Exception as e:
        print(f"Error getting chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get chat history"
        )

@app.get("/chat/history/{conversation_id}")
async def get_conversation_by_id(
    conversation_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get a specific chat conversation by ID
    Requires: Authorization header with Bearer token
    """
    try:
        payload = decode_token(credentials.credentials)
        email = payload.get("sub")
        
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
    
    try:
        conversation = await db_get_conversation_by_id(conversation_id, email)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        # Convert _id to string if present
        if "_id" in conversation and not isinstance(conversation["_id"], str):
            conversation["_id"] = str(conversation["_id"])
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting conversation by id: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get conversation by id"
        )
@app.put("/chat/history/{conversation_id}")
async def update_conversation_by_id(
    conversation_id: str,
    conversation_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Update a chat conversation by ID
    Requires: Authorization header with Bearer token
    """
    try:
        payload = decode_token(credentials.credentials)
        email = payload.get("sub")
        
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
    
    try:
        # Convert frontend message format if messages are provided
        if "messages" in conversation_data:
            converted_messages = []
            for msg in conversation_data["messages"]:
                timestamp = msg.get("timestamp")
                if isinstance(timestamp, str):
                    timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                elif isinstance(timestamp, datetime):
                    pass
                else:
                    timestamp = datetime.utcnow()
                
                converted_messages.append(MessageModel(
                    role=msg.get("role", msg.get("type", "user")),
                    content=msg.get("content", ""),
                    timestamp=timestamp
                ))
            conversation_data["messages"] = converted_messages
        
        updated_conversation = await db_update_conversation_by_id(conversation_id, email, conversation_data)
        if not updated_conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        # Convert _id to string if present
        if "_id" in updated_conversation and not isinstance(updated_conversation["_id"], str):
            updated_conversation["_id"] = str(updated_conversation["_id"])
        return updated_conversation
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating conversation by id: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update conversation: {str(e)}"
        )

@app.post("/chat/send-email")
async def send_chat_email(
    email_request: SendEmailRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Send a chat conversation to a healthcare provider via email
    Requires: Authorization header with Bearer token
    """
    try:
        payload = decode_token(credentials.credentials)
        email = payload.get("sub")
        
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
    
    try:
        # Get the conversation
        conversation = await db_get_conversation_by_id(email_request.conversation_id, email)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Get user information
        user = await get_user_by_email(email)
        user_name = user.get("fullName", "User") if user else "User"
        
        # Convert messages to dict format for email service
        messages_dict = []
        for msg in conversation.get("messages", []):
            messages_dict.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
                "timestamp": msg.get("timestamp")
            })
        
        # Get email subject - use provided subject or fall back to chat title
        chat_title = conversation.get("title", "Untitled Chat")
        email_subject = email_request.email_subject if email_request.email_subject else chat_title
        
        # Send email
        success = await send_chat_to_provider(
            provider_email=email_request.provider_email,
            chat_title=chat_title,
            messages=messages_dict,
            user_name=user_name,
            user_email=email,
            email_subject=email_subject
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send email. Please check email configuration."
            )
        
        return {"ok": True, "message": "Email sent successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending chat email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )