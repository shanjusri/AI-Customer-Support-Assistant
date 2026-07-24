# -*- coding: utf-8 -*-
"""
FastAPI Application Entry Point for AI Customer Support Assistant
Replaces backend/server.ts with a complete FastAPI startup setup.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.api import api_router
from retrieval.rag import RAGService


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: initialize RAG knowledge base
    try:
        print("Starting up FastAPI application...")
        print("Initializing RAG Knowledge Base...")
        await RAGService.initializeIndex()
        print("RAG Knowledge Base initialized successfully.")
    except Exception as err:
        print(f"Failed to initialize RAG index during startup: {err}")
    yield
    print("Shutting down FastAPI application...")


app = FastAPI(
    title="AI Customer Support Assistant API",
    description="Backend API for AI Customer Support Assistant",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-customer-support-assistant-577czxitj-shanjusris-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
   

# Include the main API router
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "AI Customer Support Assistant API",
        "status": "running"
    }


# Serve React frontend static files in production mode
dist_path = os.path.join(os.getcwd(), "dist")

if os.path.exists(dist_path):
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not override API endpoints
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found."})
        
        target_file = os.path.join(dist_path, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        
        index_file = os.path.join(dist_path, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        
        return JSONResponse(status_code=404, content={"detail": "Frontend build not found."})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=3000, reload=True)
