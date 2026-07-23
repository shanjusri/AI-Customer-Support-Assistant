# -*- coding: utf-8 -*-
"""
Python Translation of analytics/analytics.ts
This module provides analytics aggregation and computation logic for the SupportSuite application.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional


def getSentimentScore(sentiment: str) -> float:
    """Returns the numeric score corresponding to a sentiment string."""
    if sentiment == "positive":
        return 1.0
    elif sentiment == "neutral":
        return 0.6
    elif sentiment == "frustrated":
        return 0.3
    elif sentiment == "negative":
        return 0.2
    elif sentiment == "angry":
        return 0.0
    elif sentiment == "urgent":
        return 0.4
    else:
        return 0.5


# Also define snake_case alias
get_sentiment_score = getSentimentScore


def computeAnalytics(tickets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Aggregates metrics across all support tickets, calculates categories, priority,
    sentiment distributions, and computes a list of daily usage statistics for the past 7 days.
    """
    total_tickets = len(tickets)
    resolved = len([t for t in tickets if t.get("status") == "resolved"])
    escalated = len([t for t in tickets if t.get("status") == "escalated"])

    # Sentiment distributions
    sentiment_counts = {
        "positive": 0,
        "neutral": 0,
        "frustrated": 0,
        "negative": 0,
        "angry": 0,
        "urgent": 0
    }
    sum_sentiment_score = 0.0

    # Intent distributions
    intent_counts = {}

    # Priority distributions
    priority_counts = {
        "low": 0,
        "medium": 0,
        "high": 0,
        "urgent": 0
    }

    # Category distributions & resolutions
    category_stats = {}

    for t in tickets:
        # Sentiment metrics
        sentiment = t.get("sentiment") or "neutral"
        sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
        sum_sentiment_score += getSentimentScore(sentiment)

        # Priority counts
        priority = t.get("priority") or "medium"
        priority_counts[priority] = priority_counts.get(priority, 0) + 1

        # Categories
        cat = t.get("category") or "General Inquiry"
        if cat not in category_stats:
            category_stats[cat] = {"total": 0, "resolved": 0}
        category_stats[cat]["total"] += 1
        if t.get("status") == "resolved":
            category_stats[cat]["resolved"] += 1

        # Intents tallies from messages
        messages = t.get("messages") or []
        for m in messages:
            if m.get("role") == "customer" and m.get("intent"):
                intent = m.get("intent")
                intent_counts[intent] = intent_counts.get(intent, 0) + 1

    avg_sentiment = sum_sentiment_score / total_tickets if total_tickets > 0 else 0.6

    # Daily usage counts (last 7 days helper)
    last_7_days = {}
    today = datetime.utcnow()
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        date_str = d.strftime("%Y-%m-%d")
        last_7_days[date_str] = {"date": date_str, "chats": 0, "tickets": 0}

    for t in tickets:
        created_at = t.get("createdAt") or ""
        ticket_date = created_at.split("T")[0]
        if ticket_date in last_7_days:
            last_7_days[ticket_date]["tickets"] += 1

        messages = t.get("messages") or []
        for m in messages:
            timestamp = m.get("timestamp") or ""
            msg_date = timestamp.split("T")[0]
            if msg_date in last_7_days:
                last_7_days[msg_date]["chats"] += 1

    total_chats = sum(len(t.get("messages") or []) for t in tickets)

    return {
        "totalChats": total_chats,
        "totalTickets": total_tickets,
        "resolvedChats": resolved,
        "escalatedChats": escalated,
        "avgResponseTimeSec": 285,  # Automated SLAs averages 4-5 mins
        "avgSentimentScore": round(avg_sentiment, 2),
        "intentDistribution": intent_counts,
        "priorityDistribution": priority_counts,
        "sentimentDistribution": sentiment_counts,
        "dailyUsage": list(last_7_days.values()),
        "resolutionRatesByCategory": category_stats
    }


# Also define snake_case alias
compute_analytics = computeAnalytics
