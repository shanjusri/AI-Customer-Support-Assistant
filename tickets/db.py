# -*- coding: utf-8 -*-
"""
Python Translation of tickets/db.ts
This module implements the mock JSON database manager for SupportSuite.
"""

import os
import json
import time
from datetime import datetime, timedelta
from typing import List, Optional, Any, Dict

DB_FILE = os.path.join(os.getcwd(), "db.json")


def get_iso_timestamp_relative(hours_ago: float) -> str:
    """Helper to generate an ISO UTC timestamp offset by a number of hours."""
    dt = datetime.utcnow() - timedelta(hours=hours_ago)
    return dt.isoformat() + "Z"


def get_default_knowledge() -> List[Dict[str, Any]]:
    return [
        {
            "id": "kb-1",
            "title": "Refund Policy and Processing Times",
            "content": "Our standard refund policy offers a 30-day money-back guarantee on all software subscriptions and unused physical products. To request a refund, please contact customer support or file a billing dispute through your account dashboard. Once approved, refunds are processed immediately but can take 5 to 7 business days to appear on your bank statement or card statement, depending on your financial institution. Subscriptions cancelled mid-cycle are not eligible for partial refunds but will remain active until the end of the current billing cycle.",
            "category": "Billing",
            "tags": ["refund", "billing", "money-back", "processing"],
            "createdAt": "2026-06-01T00:00:00.000Z",
        },
        {
            "id": "kb-2",
            "title": "How to Cancel Your Premium Subscription",
            "content": "You can cancel your Premium subscription at any time. Log into your account portal, navigate to Settings > Billing, and click 'Cancel Subscription'. Follow the prompts until you receive a cancellation confirmation email. Note that cancellation halts automatic renewal, but your Premium access continues until your current billing term expires. There are no cancellation fees. If you downgrade, your account defaults back to the Free plan, and your saved workspaces will be locked to read-only mode.",
            "category": "Account",
            "tags": ["cancel", "subscription", "billing", "downgrade"],
            "createdAt": "2026-06-05T00:00:00.000Z",
        },
        {
            "id": "kb-3",
            "title": "Tracking Orders and Shipping Speeds",
            "content": "Once an order is shipped, we send an email containing your tracking number and carrier link (e.g., FedEx, UPS, or DHL). Standard Shipping takes 3 to 5 business days, while Express Shipping takes 1 to 2 business days. If your tracking states 'Delivered' but you cannot find the package: check surrounding areas, inquire with neighbors, and wait up to 24 hours as carriers sometimes mark items as delivered prematurely. If still missing, file a claim with our support within 7 days of the delivery timestamp.",
            "category": "Orders",
            "tags": ["shipping", "tracking", "order status", "fedex", "ups"],
            "createdAt": "2026-06-10T00:00:00.000Z",
        },
        {
            "id": "kb-4",
            "title": "Technical Support: Resetting Password and Login Errors",
            "content": "If you encounter login errors, first ensure your Caps Lock is off and you are entering the correct registered email. To reset your password, click 'Forgot Password' on the login screen, enter your email address, and verify your inbox for a secure recovery link. This link expires in 30 minutes for security reasons. If you do not receive the email, search your spam or promotions folder, or contact security support. Common browser issues can be solved by clearing cookies and cache or testing in incognito mode.",
            "category": "Technical Support",
            "tags": ["password", "login", "reset", "troubleshoot", "security"],
            "createdAt": "2026-06-15T00:00:00.000Z",
        },
        {
            "id": "kb-5",
            "title": "Billing Cycle, Invoices, and Payment Options",
            "content": "Subscriptions are billed on a recurring basis, either monthly or annually, starting from the exact date you upgrade. Invoices are automatically generated and emailed to you at the start of each cycle. We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Google Pay. Card details can be updated securely in your billing panel. If a payment fails, our automatic system retries the charge after 3, 7, and 14 days. If payment fails on the final attempt, your subscription will be paused automatically.",
            "category": "Billing",
            "tags": ["invoice", "payment", "credit card", "billing cycle"],
            "createdAt": "2026-06-20T00:00:00.000Z",
        }
    ]


def get_default_users() -> List[Dict[str, Any]]:
    return [
        { "id": "u-admin", "email": "admin@company.com", "name": "Sarah Jenkins (Lead Agent)", "role": "admin", "password": "admin123" },
        { "id": "u-cust1", "email": "john.doe@gmail.com", "name": "John Doe", "role": "customer", "password": "password123" },
        { "id": "u-cust2", "email": "alice.smith@example.com", "name": "Alice Smith", "role": "customer", "password": "password123" }
    ]


def get_default_tickets() -> List[Dict[str, Any]]:
    return [
        {
            "id": "t-1001",
            "customerId": "u-cust1",
            "customerName": "John Doe",
            "customerEmail": "john.doe@gmail.com",
            "title": "Double charge on monthly billing invoice",
            "category": "Billing",
            "priority": "high",
            "status": "open",
            "createdAt": get_iso_timestamp_relative(36),
            "updatedAt": get_iso_timestamp_relative(12),
            "sentiment": "frustrated",
            "messages": [
                {
                    "id": "m-1",
                    "role": "customer",
                    "content": "Hello, I checked my bank statement today and I see two charges of $29.99 for my subscription. I only have one account, and the system should only charge me once. Can you check this and refund the extra transaction?",
                    "timestamp": get_iso_timestamp_relative(36),
                    "sentiment": "frustrated",
                    "intent": "Billing",
                },
                {
                    "id": "m-2",
                    "role": "assistant",
                    "content": "Hi John, I understand your frustration. I am looking into your account billing logs. I see that on July 15, there was a duplicate transaction processed due to a temporary gateway retry. Let me flag this to our billing supervisor to issue an immediate credit.",
                    "timestamp": get_iso_timestamp_relative(35),
                },
                {
                    "id": "m-3",
                    "role": "customer",
                    "content": "Okay, thank you. How long will the refund take to get back to my Visa card? I need to make sure this gets resolved as quickly as possible.",
                    "timestamp": get_iso_timestamp_relative(12),
                    "sentiment": "neutral",
                    "intent": "Refund",
                }
            ],
            "assignee": "Sarah Jenkins (Lead Agent)"
        },
        {
            "id": "t-1002",
            "customerId": "u-cust2",
            "customerName": "Alice Smith",
            "customerEmail": "alice.smith@example.com",
            "title": "Unable to sync Google Calendar with dashboard",
            "category": "Technical Support",
            "priority": "medium",
            "status": "open",
            "createdAt": get_iso_timestamp_relative(100),
            "updatedAt": get_iso_timestamp_relative(98),
            "sentiment": "neutral",
            "messages": [
                {
                    "id": "m-10",
                    "role": "customer",
                    "content": "Hi support team, I upgraded to Premium primarily to sync my schedule, but every time I click 'Sync Google Calendar', the popup closes immediately and shows error code CAL-403. My email is registered.",
                    "timestamp": get_iso_timestamp_relative(100),
                    "sentiment": "neutral",
                    "intent": "Technical Support",
                },
                {
                    "id": "m-11",
                    "role": "assistant",
                    "content": "Hello Alice! I'd be happy to help resolve the calendar sync error. The CAL-403 error usually points to Google Workspace OAuth permissions. Could you verify if your admin has allowed external application integrations, or try disconnecting and re-authorizing the account?",
                    "timestamp": get_iso_timestamp_relative(98),
                }
            ],
            "assignee": "Sarah Jenkins (Lead Agent)"
        },
        {
            "id": "t-1003",
            "customerId": "u-anonymous",
            "customerName": "Robert Miller",
            "customerEmail": "robert.miller@yahoo.com",
            "title": "Urgent: Charged after cancelling my subscription",
            "category": "Billing",
            "priority": "urgent",
            "status": "escalated",
            "createdAt": get_iso_timestamp_relative(4),
            "updatedAt": get_iso_timestamp_relative(4),
            "sentiment": "angry",
            "messages": [
                {
                    "id": "m-20",
                    "role": "customer",
                    "content": "This is unacceptable! I cancelled my subscription last month, but I was just charged $199 today! I demand an immediate refund and deletion of my card data. I have already sent a cancel confirmation email earlier, this is illegal!",
                    "timestamp": get_iso_timestamp_relative(4),
                    "sentiment": "angry",
                    "intent": "Refund",
                }
            ]
        },
        {
            "id": "t-1004",
            "customerId": "u-cust1",
            "customerName": "John Doe",
            "customerEmail": "john.doe@gmail.com",
            "title": "Praise for the new layout!",
            "category": "Feedback",
            "priority": "low",
            "status": "resolved",
            "createdAt": get_iso_timestamp_relative(120),
            "updatedAt": get_iso_timestamp_relative(110),
            "sentiment": "positive",
            "messages": [
                {
                    "id": "m-30",
                    "role": "customer",
                    "content": "Just wanted to say the new update is fantastic! The UI is extremely clean and pages load at least twice as fast as before. Hats off to the design team!",
                    "timestamp": get_iso_timestamp_relative(120),
                    "sentiment": "positive",
                    "intent": "Feedback",
                },
                {
                    "id": "m-31",
                    "role": "assistant",
                    "content": "Wow John, thank you so much for the wonderful feedback! The team put a lot of effort into optimization and redesign. We are thrilled you love the results!",
                    "timestamp": get_iso_timestamp_relative(110),
                }
            ],
            "satisfactionRating": 5
        }
    ]


def get_default_escalations() -> List[Dict[str, Any]]:
    return [
        {
            "id": "e-1",
            "ticketId": "t-1003",
            "reason": "Severe negative customer sentiment ('angry') coupled with a refund demand for post-cancellation charge.",
            "timestamp": get_iso_timestamp_relative(4),
            "severity": "critical"
        }
    ]


class Database:
    _data: Optional[Dict[str, Any]] = None

    @classmethod
    def load(cls):
        if cls._data is not None:
            return

        try:
            if os.path.exists(DB_FILE):
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    cls._data = json.load(f)
                # Ensure all key properties are defined and are lists
                if "users" not in cls._data or not isinstance(cls._data["users"], list):
                    cls._data["users"] = []
                if "tickets" not in cls._data or not isinstance(cls._data["tickets"], list):
                    cls._data["tickets"] = []
                if "knowledge" not in cls._data or not isinstance(cls._data["knowledge"], list):
                    cls._data["knowledge"] = []
                if "escalationLogs" not in cls._data or not isinstance(cls._data["escalationLogs"], list):
                    cls._data["escalationLogs"] = []
            else:
                cls.initializeDefault()
        except Exception as e:
            print("Failed to read database, resetting with defaults:", e)
            cls.initializeDefault()

    @classmethod
    def initializeDefault(cls):
        cls._data = {
            "users": get_default_users(),
            "tickets": get_default_tickets(),
            "knowledge": get_default_knowledge(),
            "escalationLogs": get_default_escalations()
        }
        cls.save()

    @classmethod
    def save(cls):
        try:
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(cls._data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print("Failed to save database file:", e)

    # --- User Operations ---
    @classmethod
    def getUsers(cls) -> List[Dict[str, Any]]:
        cls.load()
        return cls._data["users"]

    @classmethod
    def getUserByEmail(cls, email: str) -> Optional[Dict[str, Any]]:
        cls.load()
        email_lower = email.lower()
        for u in cls._data["users"]:
            if u.get("email", "").lower() == email_lower:
                return u
        return None

    @classmethod
    def createUser(cls, user: Dict[str, Any]) -> Dict[str, Any]:
        cls.load()
        new_user = dict(user)
        new_user["id"] = f"u-{int(time.time() * 1000)}"
        cls._data["users"].append(new_user)
        cls.save()
        return new_user

    # --- Ticket Operations ---
    @classmethod
    def getTickets(cls) -> List[Dict[str, Any]]:
        cls.load()
        return cls._data["tickets"]

    @classmethod
    def getTicket(cls, id: str) -> Optional[Dict[str, Any]]:
        cls.load()
        for t in cls._data["tickets"]:
            if t.get("id") == id:
                return t
        return None

    @classmethod
    def createTicket(cls, ticket: Dict[str, Any]) -> Dict[str, Any]:
        cls.load()
        now = datetime.utcnow().isoformat() + "Z"
        ticket_id = f"t-{1000 + len(cls._data['tickets']) + 1}"

        new_ticket = {
            "id": ticket_id,
            "customerId": ticket.get("customerId") or "u-anonymous",
            "customerName": ticket.get("customerName"),
            "customerEmail": ticket.get("customerEmail"),
            "title": ticket.get("title") or "Support Request",
            "category": ticket.get("category") or "General Question",
            "priority": ticket.get("priority") or "medium",
            "status": ticket.get("status") or "open",
            "createdAt": now,
            "updatedAt": now,
            "sentiment": ticket.get("sentiment") or "neutral",
            "messages": [ticket["initialMessage"]] if ticket.get("initialMessage") else [],
            "assignee": ticket.get("assignee"),
            "satisfactionRating": ticket.get("satisfactionRating")
        }

        # unshift equivalent (insert at index 0 to place new tickets at the top)
        cls._data["tickets"].insert(0, new_ticket)
        cls.save()
        return new_ticket

    @classmethod
    def updateTicket(cls, id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        cls.load()
        idx = -1
        for i, t in enumerate(cls._data["tickets"]):
            if t.get("id") == id:
                idx = i
                break

        if idx == -1:
            return None

        old = cls._data["tickets"][idx]
        updated = dict(old)

        for k, v in updates.items():
            if k not in ("id", "createdAt"):
                updated[k] = v

        updated["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        cls._data["tickets"][idx] = updated
        cls.save()
        return updated

    @classmethod
    def addMessage(cls, ticketId: str, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        cls.load()
        ticket = cls.getTicket(ticketId)
        if not ticket:
            return None

        new_message = dict(message)
        new_message["id"] = f"m-{int(time.time() * 1000)}"
        new_message["timestamp"] = datetime.utcnow().isoformat() + "Z"

        if "messages" not in ticket or ticket["messages"] is None:
            ticket["messages"] = []
        ticket["messages"].append(new_message)

        ticket_sentiment = ticket.get("sentiment", "neutral")
        if message.get("role") == "customer" and message.get("sentiment"):
            ticket_sentiment = message.get("sentiment")

        cls.updateTicket(ticketId, {
            "messages": ticket["messages"],
            "sentiment": ticket_sentiment
        })

        return new_message

    @classmethod
    def deleteTicket(cls, id: str) -> bool:
        cls.load()
        old_length = len(cls._data["tickets"])
        cls._data["tickets"] = [t for t in cls._data["tickets"] if t.get("id") != id]
        cls._data["escalationLogs"] = [e for e in cls._data["escalationLogs"] if e.get("ticketId") != id]
        if len(cls._data["tickets"]) != old_length:
            cls.save()
            return True
        return False

    # --- Knowledge Operations ---
    @classmethod
    def getKnowledge(cls) -> List[Dict[str, Any]]:
        cls.load()
        return cls._data["knowledge"]

    @classmethod
    def createKnowledge(cls, article: Dict[str, Any]) -> Dict[str, Any]:
        cls.load()
        new_article = dict(article)
        new_article["id"] = f"kb-{int(time.time() * 1000)}"
        new_article["createdAt"] = datetime.utcnow().isoformat() + "Z"
        cls._data["knowledge"].append(new_article)
        cls.save()
        return new_article

    @classmethod
    def deleteKnowledge(cls, id: str) -> bool:
        cls.load()
        old_length = len(cls._data["knowledge"])
        cls._data["knowledge"] = [k for k in cls._data["knowledge"] if k.get("id") != id]
        if len(cls._data["knowledge"]) != old_length:
            cls.save()
            return True
        return False

    # --- Escalation Operations ---
    @classmethod
    def getEscalationLogs(cls) -> List[Dict[str, Any]]:
        cls.load()
        return cls._data["escalationLogs"]

    @classmethod
    def createEscalation(cls, log: Dict[str, Any]) -> Dict[str, Any]:
        cls.load()
        new_log = dict(log)
        new_log["id"] = f"e-{int(time.time() * 1000)}"
        new_log["timestamp"] = datetime.utcnow().isoformat() + "Z"
        cls._data["escalationLogs"].append(new_log)
        cls.save()
        return new_log
