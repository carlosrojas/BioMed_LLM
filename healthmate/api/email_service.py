"""
Email service for sending chat conversations to healthcare providers
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

load_dotenv()


def format_chat_for_email(
    chat_title: str,
    messages: List[Dict[str, Any]],
    user_name: str = "User",
    user_email: str = "",
) -> str:
    """
    Format and clean up chat conversation for email
    
    Args:
        chat_title: Title of the conversation
        messages: List of message dictionaries with role, content, timestamp
        user_name: Name of the user
        user_email: Email of the user
        
    Returns:
        Formatted HTML email content
    """
    # Clean up messages - remove unnecessary fields and format properly
    formatted_messages = []
    for msg in messages:
        role = msg.get("role", msg.get("type", "user"))
        content = msg.get("content", "").strip()
        
        # Skip empty messages
        if not content:
            continue
        
        # Format timestamp if available
        timestamp_str = ""
        timestamp = msg.get("timestamp")
        if timestamp:
            try:
                if isinstance(timestamp, str):
                    dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                else:
                    dt = timestamp
                timestamp_str = dt.strftime("%Y-%m-%d %H:%M:%S")
            except:
                timestamp_str = ""
        
        # Clean role name for display
        role_display = "Patient" if role == "user" else "AI Assistant"
        
        formatted_messages.append({
            "role": role_display,
            "content": content,
            "timestamp": timestamp_str
        })
    
    # Build HTML email
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #2563eb;
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .info-section {{
                background-color: #f3f4f6;
                padding: 15px;
                border-left: 4px solid #2563eb;
                margin: 20px 0;
            }}
            .info-section p {{
                margin: 5px 0;
            }}
            .message {{
                margin: 20px 0;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #e5e7eb;
            }}
            .message.patient {{
                background-color: #eff6ff;
                border-left-color: #3b82f6;
            }}
            .message.assistant {{
                background-color: #f9fafb;
                border-left-color: #9ca3af;
            }}
            .message-header {{
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 8px;
                font-size: 14px;
            }}
            .message-time {{
                font-size: 12px;
                color: #6b7280;
                margin-top: 8px;
            }}
            .message-content {{
                white-space: pre-wrap;
                word-wrap: break-word;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Health Conversation Report</h1>
        </div>
        
        <div class="info-section">
            <p><strong>Conversation Title:</strong> {chat_title}</p>
            <p><strong>Patient:</strong> {user_name}</p>
            {f'<p><strong>Patient Email:</strong> {user_email}</p>' if user_email else ''}
            <p><strong>Report Date:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            <p><strong>Total Messages:</strong> {len(formatted_messages)}</p>
        </div>
        
        <h2>Conversation History</h2>
        <div class="messages">
    """
    
    # Add each message
    for msg in formatted_messages:
        role_class = "patient" if msg["role"] == "Patient" else "assistant"
        timestamp_html = f'<div class="message-time">{msg["timestamp"]}</div>' if msg["timestamp"] else ""
        
        html_content += f"""
            <div class="message {role_class}">
                <div class="message-header">{msg["role"]}</div>
                <div class="message-content">{escape_html(msg["content"])}</div>
                {timestamp_html}
            </div>
        """
    
    html_content += """
        </div>
        
        <div class="footer">
            <p>This report was generated from HealthMate AI Chat System.</p>
            <p>This is an automated message. Please review all information carefully.</p>
        </div>
    </body>
    </html>
    """
    
    return html_content


def escape_html(text: str) -> str:
    """Escape HTML special characters"""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#x27;")
    )


def create_plain_text_version(html_content: str) -> str:
    """Create a plain text version of the email"""
    # Simple plain text extraction - in production, you might want to use html2text
    plain_text = html_content
    # Remove HTML tags (basic approach)
    import re
    plain_text = re.sub(r'<[^>]+>', '', plain_text)
    plain_text = plain_text.replace('&amp;', '&')
    plain_text = plain_text.replace('&lt;', '<')
    plain_text = plain_text.replace('&gt;', '>')
    plain_text = plain_text.replace('&quot;', '"')
    plain_text = plain_text.replace('&#x27;', "'")
    return plain_text.strip()


async def send_chat_to_provider(
    provider_email: str,
    chat_title: str,
    messages: List[Dict[str, Any]],
    user_name: str = "User",
    user_email: str = "",
    email_subject: Optional[str] = None,
) -> bool:
    """
    Send formatted chat conversation to healthcare provider via email
    
    Args:
        provider_email: Email address of the healthcare provider
        chat_title: Title of the conversation (used in email body)
        messages: List of message dictionaries
        user_name: Name of the user
        user_email: Email of the user
        email_subject: Optional custom subject line for email (defaults to chat_title)
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Get email configuration from environment variables
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME", "healthmate67@gmail.com")
        smtp_password = os.getenv("SMTP_PASSWORD", "gazf xlsn jkxo aajv")
        from_email = os.getenv("FROM_EMAIL", smtp_username)
        
        if not smtp_username or not smtp_password:
            print("Warning: SMTP credentials not configured. Email sending disabled.")
            return False
        
        # Format the chat content
        html_content = format_chat_for_email(chat_title, messages, user_name, user_email)
        plain_text = create_plain_text_version(html_content)
        
        # Create message
        msg = MIMEMultipart("alternative")
        # Use custom email_subject if provided, otherwise use chat_title
        subject = email_subject if email_subject else chat_title
        msg["Subject"] = f"Health Conversation Report: {subject}"
        msg["From"] = from_email
        msg["To"] = provider_email
        
        # Add both plain text and HTML versions
        part1 = MIMEText(plain_text, "plain")
        part2 = MIMEText(html_content, "html")
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        print(f"Email sent successfully to {provider_email}")
        return True
        
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

