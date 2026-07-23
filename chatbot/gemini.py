# -*- coding: utf-8 -*-
"""
Python Implementation of chatbot/gemini.py
Provides integration with Google GenAI SDK and REST API fallback for message analysis,
grounded response generation, translation, image analysis, and semantic relevance checks.
"""

import os
import re
import json
import base64
import urllib.request
from typing import List, Dict, Any, Optional

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
    def Field(*args, **kwargs):
        return None


class GeminiRestClient:
    """Fallback REST API client using standard urllib when google-genai package is unavailable."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")

    def generate_content(
        self,
        model: str,
        contents: Any,
        system_instruction: Optional[str] = None,
        response_mime_type: Optional[str] = None
    ) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not provided")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"

        if isinstance(contents, str):
            contents_payload = [{"parts": [{"text": contents}]}]
        elif isinstance(contents, list):
            parts = []
            for item in contents:
                if isinstance(item, str):
                    parts.append({"text": item})
                elif isinstance(item, dict):
                    parts.append(item)
            contents_payload = [{"parts": parts}]
        else:
            contents_payload = [{"parts": [{"text": str(contents)}]}]

        payload: Dict[str, Any] = {"contents": contents_payload}

        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        gen_config = {}
        if response_mime_type:
            gen_config["responseMimeType"] = response_mime_type
        if gen_config:
            payload["generationConfig"] = gen_config

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

        with urllib.request.urlopen(req, timeout=15) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            candidates = res_data.get("candidates", [])
            if candidates and "content" in candidates[0]:
                parts = candidates[0]["content"].get("parts", [])
                text_pieces = [p.get("text", "") for p in parts if "text" in p]
                return "".join(text_pieces)
            return ""

    def embed_content(self, model: str, text: str) -> List[float]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not provided")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent?key={self.api_key}"
        payload = {"content": {"parts": [{"text": text}]}}

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

        with urllib.request.urlopen(req, timeout=15) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            embedding = res_data.get("embedding", {})
            return embedding.get("values", [])


# Initialize client
client = None
if genai:
    try:
        client = genai.Client(
            api_key=os.environ.get("GEMINI_API_KEY"),
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )
    except Exception as e:
        print("genai.Client init failed, trying REST client:", e)

if not client and os.environ.get("GEMINI_API_KEY"):
    client = GeminiRestClient(os.environ.get("GEMINI_API_KEY"))


# Primary model for customer support tasks
CHAT_MODEL = "gemini-3.1-flash-lite"
EMBED_MODEL = "gemini-embedding-2-preview"


from prompts.prompts import (
    ENTERPRISE_TRIAGE_INSTRUCTION,
    TRANSLATION_MANDATE_INSTRUCTION,
    CHITCHAT_BOT_INSTRUCTION,
    ESCALATION_SUPPORT_INSTRUCTION,
    STANDARD_SUPPORT_INSTRUCTION,
)


class MessageAnalysis(BaseModel):
    intent: str = Field(description="The primary purpose of the customer's message.")
    sentiment: str = Field(description="The tone/emotion of the user: positive, neutral, negative, frustrated, angry, or urgent.")
    escalate: bool = Field(description="True if any escalation rule is triggered.")
    escalationReason: str = Field(description="Explanation for why escalation was triggered, or blank if false.")
    category: str = Field(description="The support category representing this request.")
    priority: str = Field(description="Suggested priority for an automated ticket.")
    suggestedTicketTitle: str = Field(description="A short (4-8 words) title summarizing the core issue.")
    conversationalType: str = Field(description="One of: greeting, gratitude, farewell, compliment, meaningless, off-topic, personal-statement, or none.")
    detectedLanguage: str = Field(description="The language code of the customer's message: 'en', 'te', 'hi', 'ta', 'kn', or 'ml'.")


def heuristicDetectLanguage(text: str) -> str:
    """Fast regex-based heuristic for written script recognition of supported regional languages."""
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    if re.search(r'[\u0C00-\u0C7F]', text):
        return "te"
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "ta"
    if re.search(r'[\u0C80-\u0CFF]', text):
        return "kn"
    if re.search(r'[\u0D00-\u0D7F]', text):
        return "ml"
    return "en"


heuristic_detect_language = heuristicDetectLanguage


def heuristicAnalyze(content: str) -> Dict[str, Any]:
    """Robust rule-based heuristic for message triage when Gemini API is offline or rate-limited."""
    lower = content.lower()
    lang = heuristicDetectLanguage(content)

    if re.search(r'^(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b', lower):
        return {
            "intent": "Greeting", "sentiment": "positive", "escalate": False, "escalationReason": "",
            "category": "General Inquiry", "priority": "low", "suggestedTicketTitle": "Customer Greeting",
            "conversationalType": "greeting", "detectedLanguage": lang
        }
    if re.search(r'^(thanks|thank you|thanks a lot|thank you so much|appreciate it)\b', lower):
        return {
            "intent": "Gratitude", "sentiment": "positive", "escalate": False, "escalationReason": "",
            "category": "General Inquiry", "priority": "low", "suggestedTicketTitle": "Customer Gratitude",
            "conversationalType": "gratitude", "detectedLanguage": lang
        }
    if re.search(r'^(bye|goodbye|see you|take care)\b', lower):
        return {
            "intent": "Farewell", "sentiment": "positive", "escalate": False, "escalationReason": "",
            "category": "General Inquiry", "priority": "low", "suggestedTicketTitle": "Customer Farewell",
            "conversationalType": "farewell", "detectedLanguage": lang
        }
    if "refund" in lower or "money back" in lower or "reimburse" in lower:
        return {
            "intent": "Refund Request", "sentiment": "neutral", "escalate": False, "escalationReason": "",
            "category": "Billing", "priority": "medium", "suggestedTicketTitle": "Inquiry regarding refund processing timeline",
            "conversationalType": "none", "detectedLanguage": lang
        }
    if "password" in lower or "forgot" in lower or "reset" in lower or "credentials" in lower or "login" in lower:
        return {
            "intent": "Password Reset", "sentiment": "neutral", "escalate": False, "escalationReason": "",
            "category": "Technical Support", "priority": "medium", "suggestedTicketTitle": "Request for password reset assistance",
            "conversationalType": "none", "detectedLanguage": lang
        }
    if "cancel" in lower or "subscription" in lower or "membership" in lower or "stop payment" in lower:
        return {
            "intent": "Cancellation Request", "sentiment": "neutral", "escalate": False, "escalationReason": "",
            "category": "Subscription Management", "priority": "medium", "suggestedTicketTitle": "Subscription cancellation query",
            "conversationalType": "none", "detectedLanguage": lang
        }
    if "track" in lower or "shipping" in lower or "delivery" in lower or "package" in lower or "carrier" in lower:
        return {
            "intent": "Order Tracking", "sentiment": "neutral", "escalate": False, "escalationReason": "",
            "category": "Order Support", "priority": "medium", "suggestedTicketTitle": "Order tracking and delivery inquiry",
            "conversationalType": "none", "detectedLanguage": lang
        }
    if re.search(r'human|agent|representative|speak to|talk to|manager|supervisor|complaint|unhappy|furious|terrible', lower):
        return {
            "intent": "Escalation Request", "sentiment": "frustrated", "escalate": True, "escalationReason": "Customer requested human representative or expressed frustration.",
            "category": "Escalation", "priority": "high", "suggestedTicketTitle": "Escalated Customer Inquiry",
            "conversationalType": "none", "detectedLanguage": lang
        }

    return {
        "intent": "General Question", "sentiment": "neutral", "escalate": False, "escalationReason": "",
        "category": "General Inquiry", "priority": "medium", "suggestedTicketTitle": "General Support Query",
        "conversationalType": "none", "detectedLanguage": lang
    }


def format_fallback_grounded_response(user_message: str, retrieved_context: List[str], target_lang_code: str = "en") -> str:
    """Formats a structured, grounded answer directly from retrieved knowledge base context."""
    if not retrieved_context:
        return "I couldn't find that information in the knowledge base."

    parts = []
    lower_query = user_message.lower()

    for ctx in retrieved_context:
        match = re.search(r"\[Article:\s*([^(]+)\(([^)]+)\)\]\s*(.*)", ctx, re.DOTALL)
        if match:
            title = match.group(1).strip()
            content = re.sub(r"\(Relevance:\s*\d+%\)", "", match.group(3)).strip()
        else:
            title = "Knowledge Base Information"
            content = ctx.strip()

        parts.append(f"### {title}\n\n{content}")

        if "refund" in lower_query or "refund" in title.lower():
            parts.append("```\n[Submit Refund Request] ──> [Review & Verification] ──> [Approved] ──> [5-7 Days Bank Processing]\n```")
        elif "password" in lower_query or "password" in title.lower():
            parts.append("```\n[Click Forgot Password] ──> [Enter Account Email] ──> [Receive Reset Link] ──> [Set New Password]\n```")
        elif "cancel" in lower_query or "cancel" in title.lower():
            parts.append("```\n[Account Settings] ──> [Manage Subscriptions] ──> [Click Cancel] ──> [Confirm Cancellation]\n```")

    parts.append("Let me know if you need any further assistance.")
    return "\n\n".join(parts)


class GeminiService:
    @classmethod
    async def getEmbedding(cls, text: str) -> List[float]:
        """Generates a text embedding vector for semantic search."""
        cleaned_text = re.sub(r'\s+', ' ', text).strip()
        if not cleaned_text:
            return [0.0] * 768

        # 1. Try SDK Client
        if genai and hasattr(client, 'models'):
            try:
                response = client.models.embed_content(
                    model=EMBED_MODEL,
                    contents=cleaned_text,
                )
                if response.embeddings and len(response.embeddings) > 0:
                    values = response.embeddings[0].values
                    if values: return values
                if hasattr(response, 'embedding') and response.embedding and response.embedding.values:
                    return response.embedding.values
            except Exception as e:
                print("Gemini SDK Embedding Error:", e)

        # 2. Try REST Client
        if isinstance(client, GeminiRestClient):
            try:
                values = client.embed_content(EMBED_MODEL, cleaned_text)
                if values: return values
            except Exception as e:
                print("Gemini REST Embedding Error:", e)

        # 3. Deterministic hash-based vector fallback for offline environments
        import math
        vec = []
        words = cleaned_text.lower().split()
        for i in range(768):
            val = sum(hash(w + str(i)) % 1000 - 500 for w in words) if words else 0
            vec.append(val / 1000.0)
        norm = math.sqrt(sum(v*v for v in vec)) or 1.0
        return [v / norm for v in vec]

    @classmethod
    async def verifyRelevance(cls, query: str, candidates: List[Dict[str, str]]) -> List[bool]:
        """Verifies if candidates are relevant to the user query using Gemini semantic check."""
        if not candidates:
            return []

        candidates_str = "\n\n".join(
            f"{i + 1}. Title: {c.get('title', '')}\nContent: {c.get('content', '')}"
            for i, c in enumerate(candidates)
        )

        prompt = (
            f"Determine if each of the following candidate articles is relevant to the customer's question.\n"
            f"Customer's Question: \"{query}\"\n\n"
            f"Candidates:\n{candidates_str}"
        )
        sys_inst = "You are a highly precise relevance evaluator. Output a JSON array of booleans corresponding to the relevance of each candidate in order. Example: [true, false]."

        try:
            raw_text = ""
            if genai and hasattr(client, 'models'):
                response = client.models.generate_content(
                    model=CHAT_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=sys_inst,
                        response_mime_type="application/json"
                    )
                )
                raw_text = response.text or ""
            elif isinstance(client, GeminiRestClient):
                raw_text = client.generate_content(
                    CHAT_MODEL, prompt, system_instruction=sys_inst, response_mime_type="application/json"
                )

            if raw_text:
                parsed = json.loads(raw_text.strip())
                if isinstance(parsed, list):
                    return [bool(v) for v in parsed]
        except Exception as e:
            print("verifyRelevance error:", e)

        return [True] * len(candidates)

    @classmethod
    async def analyzeMessage(cls, content: str) -> Dict[str, Any]:
        """Performs real-time sentiment analysis, intent detection, and escalation rules checking."""
        if not content or not content.strip():
            return heuristicAnalyze("")

        safe_content = content.replace('"', '\\"')
        prompt = f'Analyze the following customer support message and return a structured JSON response categorizing the inquiry:\n\nCustomer Message: "{safe_content}"'

        try:
            raw_text = ""
            if genai and hasattr(client, 'models'):
                response = client.models.generate_content(
                    model=CHAT_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=ENTERPRISE_TRIAGE_INSTRUCTION,
                        response_mime_type="application/json"
                    )
                )
                raw_text = response.text or ""
            elif isinstance(client, GeminiRestClient):
                raw_text = client.generate_content(
                    CHAT_MODEL, prompt, system_instruction=ENTERPRISE_TRIAGE_INSTRUCTION, response_mime_type="application/json"
                )

            if raw_text:
                parsed = json.loads(raw_text.strip())
                sentiment = parsed.get("sentiment", "neutral")
                if sentiment not in ["positive", "neutral", "negative", "frustrated", "angry", "urgent"]:
                    sentiment = "neutral"

                priority = parsed.get("priority", "medium")
                if priority not in ["low", "medium", "high", "urgent"]:
                    priority = "medium"

                conversational_type = parsed.get("conversationalType", "none")
                if conversational_type not in ["greeting", "gratitude", "farewell", "compliment", "meaningless", "off-topic", "personal-statement", "none"]:
                    conversational_type = "none"

                detected_language = parsed.get("detectedLanguage", "en")
                if detected_language not in ["en", "te", "hi", "ta", "kn", "ml"]:
                    detected_language = "en"

                return {
                    "intent": parsed.get("intent") or "General Question",
                    "sentiment": sentiment,
                    "escalate": bool(parsed.get("escalate", False)),
                    "escalationReason": parsed.get("escalationReason") or "",
                    "category": parsed.get("category") or "General Inquiry",
                    "priority": priority,
                    "suggestedTicketTitle": parsed.get("suggestedTicketTitle") or "Support Query",
                    "conversationalType": conversational_type,
                    "detectedLanguage": detected_language
                }
        except Exception as e:
            print("Gemini Analyze Message Error:", e)

        return heuristicAnalyze(content)

    @classmethod
    async def translateResponse(cls, englishText: str, targetLanguageCode: str) -> str:
        """Translates a generated English support response into the target language."""
        language_map = {
            "te": "Telugu (తెలుగు)", "hi": "Hindi (हिंदी)", "ta": "Tamil (தமிழ்)",
            "kn": "Kannada (ಕನ್ನಡ)", "ml": "Malayalam (മലയാളം)"
        }

        target_lang_name = language_map.get(targetLanguageCode)
        if not target_lang_name:
            return englishText

        prompt = f'Translate the following English customer support response into {target_lang_name}:\n\n"{englishText}"'
        sys_inst = TRANSLATION_MANDATE_INSTRUCTION(target_lang_name)

        try:
            if genai and hasattr(client, 'models'):
                response = client.models.generate_content(
                    model=CHAT_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(system_instruction=sys_inst, temperature=0.1)
                )
                if response.text and response.text.strip():
                    return response.text.strip()
            elif isinstance(client, GeminiRestClient):
                res = client.generate_content(CHAT_MODEL, prompt, system_instruction=sys_inst)
                if res and res.strip():
                    return res.strip()
        except Exception as e:
            print(f"Gemini Translation Error to {targetLanguageCode}:", e)

        return englishText

    @classmethod
    async def generateGroundedResponse(
        cls,
        userMessage: str,
        history: List[Any],
        retrievedContext: List[str],
        systemAnalysis: Dict[str, Any],
        image: Optional[Dict[str, Any]] = None,
        language: Optional[str] = None
    ) -> str:
        """Generates a warm, professional, grounded response based strictly on retrieved knowledge."""
        try:
            detected_lang = systemAnalysis.get("detectedLanguage") or heuristicDetectLanguage(userMessage)
            target_lang_code = language or detected_lang
            if target_lang_code not in ["en", "te", "hi", "ta", "kn", "ml"]:
                target_lang_code = "en"

            formatted_history_list = []
            for h in history:
                role = h.get("role") if isinstance(h, dict) else getattr(h, "role", "customer")
                content = h.get("content") if isinstance(h, dict) else getattr(h, "content", "")
                role_label = "Customer" if role == "customer" else "Support Agent"
                formatted_history_list.append(f"{role_label}: {content}")

            formatted_history = "\n".join(formatted_history_list)
            has_context = len(retrievedContext) > 0

            # 1. Handle chitchat/conversational responses
            conversational_type = systemAnalysis.get("conversationalType", "none")
            if conversational_type and conversational_type != "none":
                conversation_prompt = ""
                if conversational_type == "greeting":
                    conversation_prompt = "The user is greeting you. Respond in a friendly, welcoming manner."
                elif conversational_type == "gratitude":
                    conversation_prompt = "The user is expressing gratitude. Respond warmly."
                elif conversational_type == "farewell":
                    conversation_prompt = "The user is saying goodbye. Respond politely."
                else:
                    conversation_prompt = "The user is making chitchat. Address politely and offer help with billing, orders, support."

                if client:
                    try:
                        sys_inst = CHITCHAT_BOT_INSTRUCTION(conversation_prompt)
                        res_text = ""
                        if genai and hasattr(client, 'models'):
                            resp = client.models.generate_content(
                                model=CHAT_MODEL, contents=f'User Message: "{userMessage}"',
                                config=types.GenerateContentConfig(system_instruction=sys_inst)
                            )
                            res_text = resp.text or ""
                        elif isinstance(client, GeminiRestClient):
                            res_text = client.generate_content(CHAT_MODEL, f'User Message: "{userMessage}"', system_instruction=sys_inst)

                        if res_text and res_text.strip():
                            english_res = res_text.strip()
                            if target_lang_code == "en": return english_res
                            return await cls.translateResponse(english_res, target_lang_code)
                    except Exception as e:
                        print("Chitchat error:", e)

                return "Hello! Welcome to SupportBot. How can I assist you today?"

            # 2. Check Escalation or Emotional states
            user_message_lower = userMessage.lower()
            has_escalation_keyword = bool(re.search(
                r'human|agent|representative|person|someone|speak\s*(with|to)|talk\s*(with|to)|support\s*(team|rep|staff|coordinator)|live\s*chat|contact\s*support|dissatisfied|unhappy|frustrated|angry|terrible|bad\s*service',
                user_message_lower
            ))

            is_escalation_or_emotional = (
                bool(systemAnalysis.get("escalate")) or
                systemAnalysis.get("sentiment") in ["frustrated", "angry", "negative"] or
                systemAnalysis.get("intent") in ["Complaint"] or
                has_escalation_keyword
            )

            if is_escalation_or_emotional:
                context_text = "\n\n".join(f"[Document {i+1}]:\n{c}" for i, c in enumerate(retrievedContext)) if has_context else "No relevant knowledge base articles available."
                prompt_text = (
                    f"Retrieved Context:\n{context_text}\n\n"
                    f"Current Customer Message: \"{userMessage}\"\n"
                    f"Detected Intent: {systemAnalysis.get('intent')}\n"
                    f"Detected Sentiment: {systemAnalysis.get('sentiment')}\n"
                    f"Is Escalating: Yes\n"
                )

                if client:
                    try:
                        res_text = ""
                        sys_inst = ESCALATION_SUPPORT_INSTRUCTION(formatted_history)
                        if genai and hasattr(client, 'models'):
                            contents_array = [prompt_text]
                            resp = client.models.generate_content(
                                model=CHAT_MODEL, contents=contents_array,
                                config=types.GenerateContentConfig(system_instruction=sys_inst)
                            )
                            res_text = resp.text or ""
                        elif isinstance(client, GeminiRestClient):
                            res_text = client.generate_content(CHAT_MODEL, prompt_text, system_instruction=sys_inst)

                        if res_text and res_text.strip():
                            english_res = res_text.strip()
                            if target_lang_code == "en": return english_res
                            return await cls.translateResponse(english_res, target_lang_code)
                    except Exception as e:
                        print("Escalation response error:", e)

                return "I understand your frustration and have escalated your request to a support representative who will assist you as soon as possible."

            # 3. Standard FAQ retrieval grounded responses for factual questions
            if not has_context:
                return "I couldn't find that information in the knowledge base."

            context_text = "\n\n".join(f"[Document {i+1}]:\n{c}" for i, c in enumerate(retrievedContext))
            prompt_text = (
                f"Retrieved Company Knowledge Base Context:\n"
                f"----------------------------------------\n"
                f"{context_text}\n"
                f"----------------------------------------\n\n"
                f"Current Customer Message: \"{userMessage}\"\n"
                f"Detected Intent: {systemAnalysis.get('intent')}\n"
                f"Detected Sentiment: {systemAnalysis.get('sentiment')}\n"
                f"Please generate the official response following our support instructions."
            )

            if client:
                try:
                    res_text = ""
                    sys_inst = STANDARD_SUPPORT_INSTRUCTION(formatted_history)
                    if genai and hasattr(client, 'models'):
                        contents_array = [prompt_text]
                        resp = client.models.generate_content(
                            model=CHAT_MODEL, contents=contents_array,
                            config=types.GenerateContentConfig(system_instruction=sys_inst)
                        )
                        res_text = resp.text or ""
                    elif isinstance(client, GeminiRestClient):
                        res_text = client.generate_content(CHAT_MODEL, prompt_text, system_instruction=sys_inst)

                    if res_text and res_text.strip() and "couldn't find" not in res_text.lower():
                        english_res = res_text.strip()
                        if target_lang_code == "en": return english_res
                        return await cls.translateResponse(english_res, target_lang_code)
                except Exception as e:
                    print("Grounded response error:", e)

            # Fallback when context IS present but API unavailable/failed
            return format_fallback_grounded_response(userMessage, retrievedContext, target_lang_code)

        except Exception as e:
            print("Gemini Generate Response Error:", e)
            if retrievedContext:
                return format_fallback_grounded_response(userMessage, retrievedContext)
            return "I apologize, I encountered a temporary connection issue. A support coordinator has been alerted to review your request immediately."


# Snake Case Aliases for Pythonic conformity
get_embedding = GeminiService.getEmbedding
verify_relevance = GeminiService.verifyRelevance
analyze_message = GeminiService.analyzeMessage
translate_response = GeminiService.translateResponse
generate_grounded_response = GeminiService.generateGroundedResponse
