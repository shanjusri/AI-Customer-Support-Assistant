# -*- coding: utf-8 -*-
"""
Python Translation of validators/validators.ts
This module provides standard safety and grounding validation logic for the SupportSuite application.
"""

import re
from typing import List, Dict, Any, Optional


class EmailValidator:
    EMAIL_REGEX = re.compile(
        r"^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]*[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-])?@(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
    )

    @classmethod
    def validate(cls, email: str) -> Dict[str, Any]:
        if not email:
            return {"isValid": False, "error": "Please enter a valid email address."}
        trimmed = email.strip()
        if not trimmed:
            return {"isValid": False, "error": "Please enter a valid email address."}
        if not cls.EMAIL_REGEX.match(trimmed):
            return {"isValid": False, "error": "Please enter a valid email address."}
        return {"isValid": True}


class InputValidator:
    PROFANITY_LIST = [
        "f***k", "sh*t", "asshole", "bitch", "bastard", "cunt", "dick", "pussy", 
        "abuse", "sluts", "retard", "faggot", "motherfucker"
    ]  # Standard filter list matching common toxic triggers

    PROMPT_INJECTION_KEYWORDS = [
        "ignore previous instructions",
        "ignore all instructions",
        "you are now a hacker",
        "bypass safety",
        "jailbreak this",
        "system prompt override",
        "override system directives",
        "execute system command",
        "forget you are a support bot",
        "do anything now",
        "dan mode",
        "reveal your developer instructions",
        "output the raw system prompt"
    ]

    @classmethod
    def validate(cls, text: str) -> Dict[str, Any]:
        """
        Validates support inputs against standard safety and enterprise guidelines.
        """
        trimmed = (text or "").strip()

        # 1. Empty/Blank Check
        if not trimmed:
            return {"isValid": False, "error": "Input query cannot be empty or solely whitespace."}

        # 2. Length Check
        if len(trimmed) > 3000:
            return {"isValid": False, "error": "Your inquiry is too long (limit: 3000 characters). Please condense your message."}

        # 3. Spam Check (excessive repetitive sequences)
        if cls.isSpam(trimmed):
            return {"isValid": False, "error": "Input was flagged as potential spam. Please use normal sentences."}

        # 4. Profanity Check
        lower = trimmed.lower()
        cleaned_lower = re.sub(r'[^a-z]', '', lower)
        for word in cls.PROFANITY_LIST:
            cleaned_word = re.sub(r'[^a-z]', '', word.lower())
            if word in lower or (cleaned_word and cleaned_word in cleaned_lower):
                return {"isValid": False, "error": "Inappropriate language detected. Please maintain a professional tone."}

        # 5. Prompt Injection / Jailbreak Check
        for phrase in cls.PROMPT_INJECTION_KEYWORDS:
            if phrase in lower:
                return {"isValid": False, "error": "System query rejected: potential prompt injection or safety bypass detected."}

        return {"isValid": True}

    @classmethod
    def isSpam(cls, text: str) -> bool:
        """
        Checks if a string has patterns indicating repetitive garbage (spam).
        """
        # Check if the same word or character is repeated excessively
        words = text.split()
        if len(words) > 8:
            unique_words = {w.lower() for w in words}
            # If less than 15% of the words are unique in a longer text, it's highly repetitive spam
            if len(unique_words) / len(words) < 0.15:
                return True

        # Check for weird long character repetitions e.g. "aaaaaaa..."
        if re.search(r'(.)\1{15,}', text):
            return True

        return False

    is_spam = isSpam


class ResponseValidator:
    @classmethod
    def validateResponse(
        cls,
        response: str,
        context: List[str],
        isConversational: bool,
        isEscalated: bool
    ) -> Dict[str, Any]:
        """
        Validates the generated response and handles grounding, empty checks, confidence and fallback/escalation.
        """
        trimmed = (response or "").strip()

        # 1. Empty Check
        if not trimmed:
            return {
                "isValid": False,
                "confidence": 0.0,
                "isGrounded": False,
                "isFallbackOrEscalationTriggered": True,
                "error": "Generated response is empty.",
                "finalResponse": "I apologize, but I am unable to generate a response at the moment. Let me connect you with a support representative."
            }

        # 2. Check Fallback Or Escalation Indicators
        fallback_keywords = [
            "couldn't find",
            "not available in the knowledge base",
            "information is unavailable",
            "unable to answer",
            "do not have information",
            "cannot find",
            "please contact support"
        ]

        lower_response = trimmed.lower()
        has_fallback_indicator = any(keyword in lower_response for keyword in fallback_keywords)

        is_fallback_or_escalation_triggered = isEscalated or has_fallback_indicator or (len(context) == 0 and not isConversational)

        # 3. Grounding check
        is_grounded = True
        confidence = 1.0

        if len(context) > 0:
            if has_fallback_indicator:
                is_grounded = False
                confidence = 0.4
            else:
                # Evaluate word overlap to calculate a grounding confidence ratio
                response_words = set(re.findall(r'\b\w{4,}\b', trimmed.lower()))
                matched_words = 0
                all_context_words = " ".join(context).lower()
                
                for word in response_words:
                    if word in all_context_words:
                        matched_words += 1

                overlap_ratio = matched_words / len(response_words) if len(response_words) > 0 else 1.0
                confidence = min(1.0, max(0.5, overlap_ratio))
                is_grounded = confidence >= 0.45  # Match with a reasonable threshold
        else:
            if isConversational:
                is_grounded = True
                confidence = 1.0
            else:
                is_grounded = False
                confidence = 0.3

        # 4. Fallback replacement if response is ungrounded for factual queries
        final_response = trimmed
        if not is_grounded and not isConversational and not isEscalated:
            final_response = "I apologize, but I couldn't find specific instructions for your request in our official knowledge base. I have flagged this for our support team, and a human coordinator will reach out to assist you."

        return {
            "isValid": True,
            "confidence": confidence,
            "isGrounded": is_grounded,
            "isFallbackOrEscalationTriggered": is_fallback_or_escalation_triggered,
            "finalResponse": final_response
        }

    validate_response = validateResponse
