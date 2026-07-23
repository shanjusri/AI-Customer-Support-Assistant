# -*- coding: utf-8 -*-
"""
Python Implementation of retrieval/rag.py
Provides vector space RAG (Retrieval-Augmented Generation) retrieval services
for SupportSuite knowledge base articles.
"""

import sys
import math
import re
from typing import List, Dict, Any, Optional

from tickets.db import Database
from chatbot.gemini import GeminiService


def _log(*args, **kwargs):
    kwargs["file"] = sys.stderr
    print(*args, **kwargs)


class RAGService:
    vector_store: List[Dict[str, Any]] = []
    is_indexing: bool = False

    @classmethod
    async def initializeIndex(cls):
        """Initializes and builds the semantic vector store from database knowledge articles."""
        if cls.is_indexing:
            return
        cls.is_indexing = True
        _log("RAG: Building semantic vector index...")

        try:
            cls.vector_store = []
            articles = Database.getKnowledge()

            for article in articles:
                await cls.indexArticle(article)

            _log(f"RAG: Vector store ready with {len(cls.vector_store)} chunks indexed.")
        except Exception as e:
            _log("RAG: Initialization failed:", e)
        finally:
            cls.is_indexing = False

    @classmethod
    async def indexArticle(cls, article: Dict[str, Any]):
        """Generates embeddings and indexes a single knowledge base article."""
        try:
            content = article.get("content", "")
            article_id = article.get("id", "")
            title = article.get("title", "")
            category = article.get("category", "")

            # Chunking: for small KB articles, indexing the title + body is most effective
            chunks = cls.chunkText(content, 400)

            for i, chunk_text in enumerate(chunks):
                composite_text = f"Title: {title}\nCategory: {category}\nContent: {chunk_text}"
                
                try:
                    embedding = await GeminiService.getEmbedding(composite_text)
                except Exception as ex:
                    _log(f"RAG Warning: Failed to get embedding for chunk {i} of article {article_id}: {ex}")
                    embedding = [0.0] * 768
                
                cls.vector_store.append({
                    "articleId": article_id,
                    "title": title,
                    "category": category,
                    "content": chunk_text,
                    "embedding": embedding,
                })
        except Exception as e:
            _log(f"RAG: Failed to index article {article.get('id')}:", e)

    @classmethod
    def deindexArticle(cls, article_id: str):
        """Clears an article from the vector store index."""
        cls.vector_store = [c for c in cls.vector_store if c.get("articleId") != article_id]
        _log(f"RAG: De-indexed article {article_id}.")

    @classmethod
    async def retrieveRelevantContext(cls, query: str, limit: int = 3) -> List[str]:
        """Performs semantic vector search on the knowledge base to find top-k matches."""
        _log("Query:", query)
        _log("Vector Store Size: ", len(cls.vector_store))
        if len(cls.vector_store) == 0:
            # Trigger lazy index building if empty
            await cls.initializeIndex()

        try:
            try:
                query_embedding = await GeminiService.getEmbedding(query)
            except Exception as ex:
                _log("RAG Warning: Failed to generate query embedding:", ex)
                query_embedding = [0.0] * 768

            scored_chunks = []
            for chunk in cls.vector_store:
                score = cls.cosineSimilarity(query_embedding, chunk.get("embedding", []))
                scored_chunks.append({
                    "chunk": chunk,
                    "score": score
                })

            # Hybrid keyword/synonym booster
            lowercase_query = query.lower()
            booster_keywords = [
                { "keywords": ["refund", "money back", "money-back", "reimburse", "returned money", "processing time", "day limit", "cycle"], "articleId": "kb-1" },
                { "keywords": ["cancel", "membership", "subscription", "stop payment", "downgrade", "deactivate", "delete account"], "articleId": "kb-2" },
                { "keywords": ["track", "shipping", "fedex", "ups", "dhl", "carrier", "delivered", "missing package", "lost item", "deliver"], "articleId": "kb-3" },
                { "keywords": ["password", "login", "reset", "forgot", "credentials", "error CAL-403", "cannot sign in", "change password"], "articleId": "kb-4" },
                { "keywords": ["invoice", "payment", "credit card", "billing", "failed payment", "charged", "visa", "paypal"], "articleId": "kb-5" }
            ]

            for rule in booster_keywords:
                if any(kw in lowercase_query for kw in rule["keywords"]):
                    # Boost matching chunks
                    for item in scored_chunks:
                        if item["chunk"].get("articleId") == rule["articleId"]:
                            item["score"] = max(item["score"], 0.95)

            # Sort by similarity descending
            scored_chunks.sort(key=lambda x: x["score"], reverse=True)

            # Return text of top chunks with high relevance (e.g., above threshold)
            threshold = 0.40  # Lower threshold to capture rewordings & synonyms
            candidate_matches = [item for item in scored_chunks if item["score"] >= threshold][:limit]

            if not candidate_matches:
                _log(f"RAG Retrieval: Query \"{query}\" matched 0 articles above threshold {threshold}.")
                return []

            # Semantic Verification with Gemini to allow synonyms/rewordings while avoiding unrelated matches
            candidates = [{
                "title": item["chunk"].get("title"),
                "content": item["chunk"].get("content")
            } for item in candidate_matches]

            relevance_flags = []
            try:
                relevance_flags = await GeminiService.verifyRelevance(query, candidates)
            except Exception as ex:
                _log("RAG Warning: verifyRelevance failed. Defaulting to True:", ex)
                relevance_flags = [True] * len(candidate_matches)

            matches = []
            for i, item in enumerate(candidate_matches):
                is_verified = False
                if i < len(relevance_flags):
                    is_verified = relevance_flags[i] or item["score"] >= 0.70
                else:
                    is_verified = item["score"] >= 0.70

                if is_verified:
                    matches.append(
                        f"[Article: {item['chunk'].get('title')} ({item['chunk'].get('category')})] "
                        f"{item['chunk'].get('content')} (Relevance: {round(item['score'] * 100)}%)"
                    )

            # Ensure we don't return empty if we have very high-scoring matches
            if len(matches) == 0 and len(candidate_matches) > 0:
                top_item = candidate_matches[0]
                if top_item["score"] >= 0.45:
                    _log(f"RAG Retrieval Fallback: Using top candidate \"{top_item['chunk'].get('title')}\" due to rejection fallback.")
                    matches.append(
                        f"[Article: {top_item['chunk'].get('title')} ({top_item['chunk'].get('category')})] "
                        f"{top_item['chunk'].get('content')} (Relevance: {round(top_item['score'] * 100)}%)"
                    )

            _log(f"RAG Retrieval: Query \"{query}\" matched {len(matches)} verified articles.")
            _log("Matches: ", matches)
            return matches
        except Exception as e:
            _log("RAG Retrieval Error:", e)
            return []

    @classmethod
    def chunkText(cls, text: str, max_words: int = 350) -> List[str]:
        """Splitting helper to divide longer articles into manageable semantic chunks."""
        paragraphs = [p.strip() for p in re.split(r'\n+', text) if p.strip()]
        chunks = []
        current_chunk = []
        current_words_count = 0

        for paragraph in paragraphs:
            words = len(paragraph.split())
            if current_words_count + words > max_words and len(current_chunk) > 0:
                chunks.append("\n\n".join(current_chunk))
                current_chunk = []
                current_words_count = 0
            current_chunk.append(paragraph)
            current_words_count += words

        if len(current_chunk) > 0:
            chunks.append("\n\n".join(current_chunk))

        if len(chunks) == 0 and text.strip():
            chunks.append(text)

        return chunks

    @classmethod
    def dotProduct(cls, a: List[float], b: List[float]) -> float:
        """Vector Math: Dot Product of two lists."""
        dot = 0.0
        length = min(len(a), len(b))
        for i in range(length):
            dot += a[i] * b[i]
        return dot

    @classmethod
    def magnitude(cls, a: List[float]) -> float:
        """Vector Math: Magnitude of a list."""
        val = sum(x * x for x in a)
        return math.sqrt(val)

    @classmethod
    def cosineSimilarity(cls, a: List[float], b: List[float]) -> float:
        """Calculates cosine similarity between two high-dimensional vectors."""
        mag_a = cls.magnitude(a)
        mag_b = cls.magnitude(b)
        if mag_a == 0.0 or mag_b == 0.0:
            return 0.0
        return cls.dotProduct(a, b) / (mag_a * mag_b)

    # --- Snake Case Aliases for Pythonic conformity ---
    @classmethod
    async def initialize_index(cls):
        return await cls.initializeIndex()

    @classmethod
    async def index_article(cls, article: Dict[str, Any]):
        return await cls.indexArticle(article)

    @classmethod
    def deindex_article(cls, article_id: str):
        return cls.deindexArticle(article_id)

    @classmethod
    async def retrieve_relevant_context(cls, query: str, limit: int = 3) -> List[str]:
        return await cls.retrieveRelevantContext(query, limit)

    @classmethod
    def chunk_text(cls, text: str, max_words: int = 350) -> List[str]:
        return cls.chunkText(text, max_words)

    @classmethod
    def dot_product(cls, a: List[float], b: List[float]) -> float:
        return cls.dotProduct(a, b)

    @classmethod
    def cosine_similarity(cls, a: List[float], b: List[float]) -> float:
        return cls.cosineSimilarity(a, b)

