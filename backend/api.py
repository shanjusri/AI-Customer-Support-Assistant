# -*- coding: utf-8 -*-
"""
FastAPI Translation of backend/api.ts
This module implements the primary API router for the SupportSuite application.
"""

from datetime import datetime
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, HTTPException, BackgroundTasks, Response, status
from pydantic import BaseModel, Field

from tickets.db import Database
from chatbot.gemini import GeminiService
from retrieval.rag import RAGService
from validators.validators import InputValidator, ResponseValidator, EmailValidator
from analytics.analytics import computeAnalytics

api_router = APIRouter()

# Middleware to simulate session authentication (simple memory storage)
authenticated_admin: Optional[str] = None


# Helper utility to safely get attributes or keys from unmigrated objects
def safe_get(obj: Any, key: str, default: Any = None) -> Any:
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    try:
        return getattr(obj, key, default)
    except Exception:
        return default


# --- 1. Pydantic Models for Request Validation ---

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    confirmPassword: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ImagePayload(BaseModel):
    data: str
    mimeType: str


class ChatRequest(BaseModel):
    ticketId: Optional[str] = None
    customerName: Optional[str] = None
    customerEmail: Optional[str] = None
    customerId: Optional[str] = None
    image: Optional[ImagePayload] = None
    language: Optional[str] = None
    message: Optional[str] = ""


class CreateTicketRequest(BaseModel):
    customerName: str
    customerEmail: str
    title: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    description: str


class UpdateTicketRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[Any] = None
    rating: Optional[Any] = None
    adminReply: Optional[str] = None
    title: Optional[str] = None


class CreateKnowledgeRequest(BaseModel):
    title: str
    content: str
    category: str
    tags: Optional[List[str]] = Field(default_factory=list)


# --- 2. Endpoints ---

# 1. Auth Endpoints
@api_router.post("/register", status_code=status.HTTP_201_CREATED)
def register(request_data: RegisterRequest):
    name = request_data.name
    email = request_data.email
    password = request_data.password
    confirm_password = request_data.confirmPassword

    if not name or not name.strip() or not email or not email.strip() or not password or not confirm_password:
        raise HTTPException(status_code=400, detail="All registration fields are required.")

    # Validate email format
    email_validation = EmailValidator.validate(email)
    if not email_validation["isValid"]:
        raise HTTPException(status_code=400, detail=email_validation.get("error", "Please enter a valid email address."))

    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    trimmed_email = email.strip()

    # Check duplicate email
    # Database is expected to be imported from tickets.db once migrated
    existing_user = Database.getUserByEmail(trimmed_email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    # Create new user
    new_user = Database.createUser({
        "name": name.strip(),
        "email": trimmed_email.lower(),
        "password": password,
        "role": "customer"
    })

    return {
        "success": True,
        "message": "Registration successful.",
        "user": {
            "id": safe_get(new_user, "id"),
            "email": safe_get(new_user, "email"),
            "name": safe_get(new_user, "name"),
            "role": safe_get(new_user, "role")
        }
    }


@api_router.post("/login")
def login(request_data: LoginRequest):
    global authenticated_admin
    email = request_data.email
    password = request_data.password

    if not email or not email.strip() or not password or not password.strip():
        raise HTTPException(status_code=400, detail="Email and password are required.")

    # Find user by email (including admin)
    user = Database.getUserByEmail(email)
    if not user:
        raise HTTPException(status_code=401, detail="Email is not registered.")

    # Check password
    if safe_get(user, "password") != password:
        raise HTTPException(status_code=401, detail="Password is incorrect.")

    user_role = safe_get(user, "role")
    user_id = safe_get(user, "id")

    if user_role == "admin":
        authenticated_admin = user_id

    return {
        "success": True,
        "user": {
            "id": user_id,
            "email": safe_get(user, "email"),
            "name": safe_get(user, "name"),
            "role": user_role
        }
    }


@api_router.post("/logout")
def logout():
    global authenticated_admin
    authenticated_admin = None
    return {"success": True}


# 2. Health Check
@api_router.get("/health")
def health():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


# 3. Conversational AI Chat Endpoint
@api_router.post("/chat")
async def chat(request_data: ChatRequest, background_tasks: BackgroundTasks):
    ticket_id = request_data.ticketId
    customer_name = request_data.customerName
    customer_email = request_data.customerEmail
    customer_id = request_data.customerId
    image = request_data.image
    language = request_data.language
    message = request_data.message or ""

    final_message = message.strip()
    if not final_message and image and image.data and image.mimeType:
        final_message = "[Uploaded image analysis request]"

    # 1. Input Validation Stage
    validation = InputValidator.validate(final_message)
    if not safe_get(validation, "isValid", False):
        raise HTTPException(status_code=400, detail=safe_get(validation, "error"))

    try:
        # 2. Retrieval Layer (RAG) Stage
        context = await RAGService.retrieveRelevantContext(final_message, 3)

        # 3. LLM (Gemini) Stage (runs Analysis + Support Answer Generation)
        analysis = await GeminiService.analyzeMessage(final_message)
        conversational_type = safe_get(analysis, "conversationalType")
        is_conversational = conversational_type and conversational_type != "none"
        active_context = [] if is_conversational else context

        # Fetch or Initialize Support Ticket Context (for history/escalation)
        existing_ticket = None
        name = customer_name or "Anonymous Customer"
        email = customer_email or "anonymous@example.com"
        c_id = customer_id or "u-anonymous"

        if ticket_id:
            existing_ticket = Database.getTicket(ticket_id)

        # Format content for history log - include visual indicator for image upload
        customer_message_content = message.strip()
        if image and image.data and image.mimeType:
            customer_message_content = (
                f"{message.strip()} [Attachment: Image/Document]"
                if message.strip() else "[Attachment: Image/Document]"
            )

        customer_message_part = {
            "id": f"m-{int(datetime.now().timestamp() * 1000)}-c",
            "role": "customer",
            "content": customer_message_content,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "sentiment": safe_get(analysis, "sentiment"),
            "intent": safe_get(analysis, "intent"),
            "category": safe_get(analysis, "category"),
            "priority": safe_get(analysis, "priority"),
            "conversationalType": conversational_type,
        }

        gemini_image = None
        if image and image.data and image.mimeType:
            gemini_image = {
                "inlineData": {
                    "data": image.data,
                    "mimeType": image.mimeType
                }
            }

        # Get historical message context from the ticket
        existing_messages = safe_get(existing_ticket, "messages") or []
        history = existing_messages[-5:] if existing_ticket else []

        # Generate grounded support response
        grounded_ai_answer = await GeminiService.generateGroundedResponse(
            final_message,
            history,
            active_context,
            analysis,
            gemini_image,
            language
        )

        # 4. Response Validator Stage (Checks grounding, empty response, confidence, and escalation)
        validation_result = ResponseValidator.validateResponse(
            grounded_ai_answer,
            active_context,
            is_conversational,
            safe_get(analysis, "escalate", False)
        )

        validated_ai_answer = safe_get(validation_result, "finalResponse")

        ai_message_part = {
            "id": f"m-{int(datetime.now().timestamp() * 1000)}-ai",
            "role": "assistant",
            "content": validated_ai_answer,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

        # Construct the ticket ID and target preview state for immediate response
        target_ticket_id = (
            safe_get(existing_ticket, "id")
            if existing_ticket
            else f"t-{1000 + len(Database.getTickets()) + 1}"
        )
        should_escalate = (
            safe_get(analysis, "escalate", False) or
            safe_get(validation_result, "isFallbackOrEscalationTriggered", False)
        )

        ticket_preview = {}
        if existing_ticket:
            existing_status = safe_get(existing_ticket, "status")
            status_preview = "escalated" if (should_escalate and existing_status == "open") else existing_status
            ticket_preview = {
                "id": safe_get(existing_ticket, "id"),
                "customerId": safe_get(existing_ticket, "customerId"),
                "customerName": safe_get(existing_ticket, "customerName"),
                "customerEmail": safe_get(existing_ticket, "customerEmail"),
                "title": safe_get(existing_ticket, "title"),
                "category": safe_get(existing_ticket, "category"),
                "priority": safe_get(existing_ticket, "priority"),
                "status": status_preview,
                "createdAt": safe_get(existing_ticket, "createdAt"),
                "updatedAt": datetime.utcnow().isoformat() + "Z",
                "sentiment": safe_get(analysis, "sentiment"),
                "messages": list(existing_messages) + [customer_message_part, ai_message_part],
                "assignee": safe_get(existing_ticket, "assignee"),
                "satisfactionRating": safe_get(existing_ticket, "satisfactionRating")
            }
        else:
            ticket_preview = {
                "id": target_ticket_id,
                "customerId": c_id,
                "customerName": name,
                "customerEmail": email,
                "title": safe_get(analysis, "suggestedTicketTitle"),
                "category": safe_get(analysis, "category"),
                "priority": safe_get(analysis, "priority"),
                "status": "escalated" if should_escalate else "open",
                "createdAt": datetime.utcnow().isoformat() + "Z",
                "updatedAt": datetime.utcnow().isoformat() + "Z",
                "sentiment": safe_get(analysis, "sentiment"),
                "messages": [customer_message_part, ai_message_part]
            }

        # 5. Return Response to client immediately
        response_payload = {
            "success": True,
            "response": validated_ai_answer,
            "ticketId": target_ticket_id,
            "sentiment": safe_get(analysis, "sentiment"),
            "intent": safe_get(analysis, "intent"),
            "escalated": should_escalate,
            "ticket": ticket_preview,
        }

        # 6. Ticket Database Stage (executes asynchronously after response is returned to user)
        def run_db_updates():
            try:
                if existing_ticket:
                    existing_id = safe_get(existing_ticket, "id")
                    # Append customer and AI messages to existing ticket
                    Database.addMessage(existing_id, customer_message_part)
                    if should_escalate and safe_get(existing_ticket, "status") == "open":
                        Database.updateTicket(existing_id, {"status": "escalated"})
                    Database.addMessage(existing_id, ai_message_part)
                else:
                    # Create new ticket with customerMessagePart as the initial message
                    Database.createTicket({
                        "customerId": c_id,
                        "customerName": name,
                        "customerEmail": email,
                        "title": safe_get(analysis, "suggestedTicketTitle"),
                        "category": safe_get(analysis, "category"),
                        "priority": safe_get(analysis, "priority"),
                        "status": "escalated" if should_escalate else "open",
                        "sentiment": safe_get(analysis, "sentiment"),
                        "initialMessage": customer_message_part
                    })
                    # Append assistant response to newly created ticket
                    Database.addMessage(target_ticket_id, ai_message_part)

                # Register Escalation Log if escalated or fallback triggered
                if should_escalate:
                    reason_msg = (
                        f"Automated refactored flow flagged: "
                        f"intent='{safe_get(analysis, 'intent')}', "
                        f"sentiment='{safe_get(analysis, 'sentiment')}', "
                        f"escalationTriggered={safe_get(analysis, 'escalate')}, "
                        f"fallbackOrEscalationTriggered={safe_get(validation_result, 'isFallbackOrEscalationTriggered')}"
                    )
                    Database.createEscalation({
                        "ticketId": target_ticket_id,
                        "reason": reason_msg,
                        "severity": "critical" if safe_get(analysis, "sentiment") == "angry" else "high"
                    })
            except Exception as db_err:
                print("Asynchronous database ticket state update failed:", db_err)

        background_tasks.add_task(run_db_updates)

        return response_payload

    except Exception as error:
        print("Express /chat endpoint crash:", error)
        raise HTTPException(status_code=500, detail="An internal support server error occurred.")


# 4. Ticket Management Endpoints
@api_router.get("/ticket")
def get_tickets():
    return Database.getTickets()


@api_router.get("/ticket/{id}")
def get_ticket(id: str):
    ticket = Database.getTicket(id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    return ticket


@api_router.post("/ticket", status_code=status.HTTP_201_CREATED)
def create_ticket(request_data: CreateTicketRequest):
    customer_name = request_data.customerName
    customer_email = request_data.customerEmail
    title = request_data.title
    category = request_data.category
    priority = request_data.priority
    description = request_data.description

    if not customer_name or not customer_email or not description:
        raise HTTPException(status_code=400, detail="Name, email, and description are required to open a ticket.")

    initial_msg = {
        "id": f"m-{int(datetime.now().timestamp() * 1000)}",
        "role": "customer",
        "content": description,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "sentiment": "neutral",
        "intent": "General Question"
    }

    ticket = Database.createTicket({
        "customerId": f"u-{int(datetime.now().timestamp() * 1000)}",
        "customerName": customer_name,
        "customerEmail": customer_email,
        "title": title or "Support Request",
        "category": category or "General Inquiry",
        "priority": priority or "medium",
        "status": "open",
        "sentiment": "neutral",
        "initialMessage": initial_msg
    })

    return {"success": True, "ticket": ticket}


@api_router.put("/ticket/{id}")
def update_ticket(id: str, request_data: UpdateTicketRequest):
    status_val = request_data.status
    priority = request_data.priority
    assignee = request_data.assignee
    rating = request_data.rating
    admin_reply = request_data.adminReply
    title = request_data.title

    ticket = Database.getTicket(id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")

    updates = {}
    if status_val is not None:
        updates["status"] = status_val
    if priority is not None:
        updates["priority"] = priority
    if assignee is not None:
        updates["assignee"] = assignee
    if rating is not None:
        try:
            updates["satisfactionRating"] = int(rating)
        except (ValueError, TypeError):
            pass
    if title is not None:
        updates["title"] = title

    # If there's an admin reply, append it to the ticket messages thread
    if admin_reply and admin_reply.strip():
        Database.addMessage(safe_get(ticket, "id"), {
            "role": "admin",
            "content": admin_reply,
        })

    updated_ticket = Database.updateTicket(id, updates)
    return {"success": True, "ticket": updated_ticket}


@api_router.delete("/ticket/{id}")
def delete_ticket(id: str):
    success = Database.deleteTicket(id)
    if success:
        return {"success": True}
    else:
        raise HTTPException(status_code=404, detail="Ticket not found.")


# 5. Customer History Endpoint
@api_router.get("/history")
def get_history(email: Optional[str] = None):
    if not email:
        raise HTTPException(status_code=400, detail="Email query parameter is required.")

    user_tickets = [
        t for t in Database.getTickets()
        if safe_get(t, "customerEmail", "").lower() == email.lower()
    ]
    return user_tickets


# 6. Analytics Metrics Aggregator
@api_router.get("/analytics")
def get_analytics():
    tickets = Database.getTickets()
    analytics = computeAnalytics(tickets)
    return analytics


# 7. CSV Export
@api_router.get("/export")
def export_tickets(response: Response):
    tickets = Database.getTickets()

    # Create CSV Headers
    csv_lines = [
        "Ticket ID,Customer Name,Customer Email,Title,Category,Priority,Status,Sentiment,Created At,Rating"
    ]

    for t in tickets:
        t_id = safe_get(t, "id", "")
        customer_name = safe_get(t, "customerName", "")
        customer_email = safe_get(t, "customerEmail", "")
        title = safe_get(t, "title", "")
        category = safe_get(t, "category", "")
        priority = safe_get(t, "priority", "")
        status_val = safe_get(t, "status", "")
        sentiment = safe_get(t, "sentiment", "")
        created_at = safe_get(t, "createdAt", "")
        
        rating_val = safe_get(t, "satisfactionRating")
        rating = "N/A" if rating_val is None else str(rating_val)

        # Escape double quotes by doubling them, and wrap in double quotes
        name_esc = f'"{customer_name.replace(\'"\', \'""\')}"'
        email_esc = f'"{customer_email.replace(\'"\', \'""\')}"'
        title_esc = f'"{title.replace(\'"\', \'""\')}"'

        csv_lines.append(
            f"{t_id},{name_esc},{email_esc},{title_esc},{category},{priority},{status_val},{sentiment},{created_at},{rating}"
        )

    csv_content = "\n".join(csv_lines) + "\n"
    today_str = datetime.now().strftime("%Y-%m-%d")

    response.headers["Content-Type"] = "text/csv"
    response.headers["Content-Disposition"] = f"attachment; filename=AI_Support_Tickets_Export_{today_str}.csv"
    
    return Response(content=csv_content, media_type="text/csv")


# 8. Knowledge Management Endpoints
@api_router.get("/knowledge")
def get_knowledge():
    return Database.getKnowledge()


@api_router.post("/knowledge", status_code=status.HTTP_201_CREATED)
async def create_knowledge(request_data: CreateKnowledgeRequest):
    title = request_data.title
    content = request_data.content
    category = request_data.category
    tags = request_data.tags

    if not title or not content or not category:
        raise HTTPException(status_code=400, detail="Title, content, and category are required.")

    article = Database.createKnowledge({
        "title": title,
        "content": content,
        "category": category,
        "tags": tags or []
    })

    # Hot-swapping update: index immediately into vector search!
    await RAGService.indexArticle(article)

    return {"success": True, "article": article}


@api_router.delete("/knowledge/{id}")
def delete_knowledge(id: str):
    success = Database.deleteKnowledge(id)
    if success:
        # Hot-swapping update: remove from RAG memory index immediately
        RAGService.deindexArticle(id)
        return {"success": True}
    else:
        raise HTTPException(status_code=404, detail="Article not found.")
