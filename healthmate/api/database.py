"""
Database connection and user management for HealthMate
Uses MongoDB Atlas with pymongo
"""
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, Dict, Any, List
from bson import ObjectId
from datetime import datetime
from dotenv import load_dotenv
import os
load_dotenv()

from healthmate.api.models import UserProfile, Conversation, Message

uri = os.getenv("MONGO_URI")

# Create async MongoDB client
client = AsyncIOMotorClient(uri)

# Database and collection references
db = client["healthmate"]
users_collection = db["users"]
conversations_collection = db["conversations"]
print("✅ MongoDB Atlas client initialized (async mode)")



async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get user by email address
    
    Args:
        email: User's email address
        
    Returns:
        User document if found, None otherwise
    """
    try:
        user = await users_collection.find_one({"email": email})
        if user:
            # Convert ObjectId to string for JSON serialization
            user["_id"] = str(user["_id"])
        return user
    except Exception as e:
        print(f"Error fetching user by email: {e}")
        return None


async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get user by user ID
    
    Args:
        user_id: User's unique ID
        
    Returns:
        User document if found, None otherwise
    """
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
        return user
    except Exception as e:
        print(f"Error fetching user by ID: {e}")
        return None


async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new user in the database
    
    Args:
        user_data: Dictionary containing user information
                  
    Returns:
        Created user document with _id
        
    Raises:
        Exception if user creation fails (e.g., duplicate email)
    """
    try:
        # Add timestamp if not provided
        if "createdAt" not in user_data:
            user_data["createdAt"] = datetime.utcnow()
        
        # Insert the user
        result = await users_collection.insert_one(user_data)
        
        # Add the generated ID to the user data
        user_data["_id"] = str(result.inserted_id)
        
        print(f"✅ User created successfully: {user_data['email']}")
        return user_data
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        raise Exception(f"Failed to create user: {str(e)}")


async def email_exists(email: str) -> bool:
    """
    Check if an email already exists in the database
    
    Args:
        email: Email address to check
        
    Returns:
        True if email exists, False otherwise
    """
    try:
        user = await users_collection.find_one({"email": email})
        return user is not None
    except Exception as e:
        print(f"Error checking email existence: {e}")
        return False



async def update_user_profile_by_email(email: str, profile_data: dict) -> dict:
    """
    Update user profile by email and return the updated user document
    
    Args:
        email: User's email address
        profile_data: Dictionary containing profile fields to update
        
    Returns:
        Updated user document or None if not found/error
    """
    try:
        # Update the user document
        result = await users_collection.update_one(
            {"email": email},
            {"$set": {**profile_data, "updatedAt": datetime.utcnow()}}
        )
        
        if result.modified_count > 0:
            # Return the updated user document
            updated_user = await users_collection.find_one({"email": email})
            return updated_user
        else:
            return None
    except Exception as e:
        print(f"Error updating user profile by email: {e}")
        return None

async def save_chat_history(user_email: str, title: str, messages: List[Message]) -> Optional[dict]:
    try: 
        chat_history = Conversation(userEmail=user_email, title=title, messages=messages, createdAt=datetime.utcnow())
        chat_dict = chat_history.model_dump()
        result = await conversations_collection.insert_one(chat_dict)
        chat_dict["_id"] = str(result.inserted_id)
        return chat_dict
    except Exception as e:
        print(f"Error saving chat history: {e}")
        return None
async def get_chat_history_by_user_email(user_email: str) -> list:
    try:
        conversations = await conversations_collection.find({"userEmail": user_email}).sort("createdAt", -1).to_list(length=None)

        for chat in conversations:
            chat["_id"] = str(chat["_id"])
        return conversations

    
    except Exception as e:
        print(f"Error getting chat history by user email: {e}")
        return None

async def get_conversation_by_id(conversation_id: str, user_email: str) -> Optional[dict]:
    try:
        conversation = await conversations_collection.find_one({"_id": ObjectId(conversation_id), "userEmail": user_email})
        if conversation:
            conversation["_id"] = str(conversation["_id"])
            return conversation
        else:
            return None
    except Exception as e:
        print(f"Error getting chat history by id: {e}")
        return None

async def update_conversation_by_id(conversation_id: str, user_email: str, conversation_data: dict) -> Optional[dict]:
    try:
        # Prepare update data
        update_data = {**conversation_data, "updatedAt": datetime.utcnow()}
        
        # If messages are provided, convert them to dict format
        if "messages" in update_data and isinstance(update_data["messages"], list):
            update_data["messages"] = [
                msg.model_dump() if hasattr(msg, "model_dump") else msg
                for msg in update_data["messages"]
            ]
        
        result = await conversations_collection.update_one(
            {"_id": ObjectId(conversation_id), "userEmail": user_email}, 
            {"$set": update_data}
        )
        if result.modified_count > 0:
            updated = await conversations_collection.find_one({"_id": ObjectId(conversation_id), "userEmail": user_email})
            if updated:
                updated["_id"] = str(updated["_id"])
            return updated
        else:
            print(f"No conversation found to update")
            return None
    except Exception as e:
        print(f"Error updating conversation by id: {e}")
        return None
