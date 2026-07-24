# 🤖 AI Customer Support Assistant

An AI-powered Customer Support Assistant built using React, FastAPI, Google Gemini AI, and RAG (Retrieval-Augmented Generation). It provides intelligent customer support, ticket management, sentiment analysis, and knowledge-based responses through a modern chat interface.

🌐 **Live Demo:**  
[Open Application](https://ai-customer-support-assistant-xi.vercel.app)

⚙️ **Backend API:**  
[Backend Server](https://ai-customer-support-assistant-d4br.onrender.com)

📚 **API Documentation:**  
[Swagger API Docs](https://ai-customer-support-assistant-d4br.onrender.com/docs)

---

# 📖 Project Overview

The AI Customer Support Assistant is a web application designed to provide intelligent, fast, and reliable customer support using Artificial Intelligence. It helps customers resolve their queries through an interactive chat interface while assisting support teams with ticket management and knowledge-based responses.

The application provides:

- AI-powered Customer Support Chat
- User Registration & Secure Login
- Knowledge Base (RAG) Retrieval
- Intelligent FAQ Responses
- Ticket Creation & Management
- Sentiment Analysis
- Admin Dashboard
- Conversation History
- Human Support Escalation

It improves customer experience by delivering quick, accurate, and context-aware responses while reducing manual support effort through AI-powered automation.

---

# ✨ Features

The AI Customer Support Assistant offers the following features:

- User Registration & Secure Login
- AI-Powered Customer Support Chat
- Retrieval-Augmented Generation (RAG) for Knowledge-Based Responses
- Intelligent FAQ Retrieval and Answer Generation
- Automatic Ticket Classification
- Ticket Creation, Tracking & Management
- Sentiment Analysis for Customer Messages
- Human Support Escalation for Complex Queries
- Conversation History Management
- Admin Dashboard for Monitoring & Management
- FastAPI RESTful Backend APIs
- Responsive & User-Friendly Interface
- Real-Time AI Response Generation
- Secure Authentication & Session Management
- Deployed Frontend on Vercel
- Deployed Backend on Render

---
## 🏛️ System Architecture

SupportSuite uses a modern, layered, decoupled client-server architecture:

```
┌────────────────────────────────────────────────────────┐
│                   Customer / Agent Client               │
│               (React 19 / Tailwind / Recharts)         │
└───────────────────────────┬────────────────────────────┘
                            │  HTTPS JSON APIs
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Express Backend Router                 │
│                      (Node.js)                         │
└──────┬──────────────────────────────────────────┬──────┘
       │                                          │
       ▼                                          ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│       AI Chat Engine         │          │     Transactional DB         │
│  (Gemini-3.1-Flash-Lite)     │          │         (db.json)            │
└──────┬───────────────────────┘          └──────────────────────────────┘
       │
       ▼ RAG Semantic Index
┌──────────────────────────────┐
│      RAG Service Layer       │
│ (Gemini-Embedding-2-Preview) │
└──────────────────────────────┘
```

1. **Client Layer**: A highly responsive Single Page Application built with React and styled with Tailwind CSS. It communicates asynchronously with the backend server via JSON REST endpoints.
2. **Server/API Layer**: An Express.js application serving routes for user authentication, RAG searches, chat generation, ticket management, and analytics metrics.
3. **Retrieval Layer (RAG)**: At boot-up, the RAG service extracts text from all active knowledge base articles, chunks them, and generates high-dimensional vectors. User queries are compared against these vectors using Cosine Similarity, selecting candidates for the AI's grounding context.
4. **LLM/AI Service Layer**: Calls the official Google Gen AI SDK to perform multi-modal generation, real-time sentiment analysis, ticket triage classification, and localized translation.
5. **Database Layer**: A local, persistent transactional store maintaining record states for users, active tickets, and operational escalation logs.

---

## 📂 Folder Structure

The project strictly follows the required clean-folder paradigm separating logic, data structures, and assets:

```
project/
├── backend/            # Express web server, routing, & bootstrapping
│   ├── api.ts          # REST endpoints (auth, chat, ticketing, KB, analytics)
│   └── server.ts       # Express bootstrap, middlewares, & static build mount
├── frontend/           # React SPA client application
│   └── src/
│       ├── components/ # Split workspaces (CustomerWorkspace, AdminWorkspace)
│       ├── App.tsx     # Unified entry router and header layout
│       ├── index.css   # Typography configurations & custom Tailwind styling
│       ├── main.tsx    # React StrictMode bootstrap
│       └── types.ts    # Centralized static TypeScript model declarations
├── chatbot/            # Gemini AI service layer
│   └── gemini.ts       # Gemini SDK API wrappers for chat, embedding, and translation
├── retrieval/          # Semantic Retrieval-Augmented Generation (RAG)
│   └── rag.py          # Chunking utilities, cosine similarity vector index, & verification
├── prompts/            # Centralized system instructions
│   └── prompts.py      # Strictly structured prompt templates for LLMs
├── validators/         # Input/Output Guardrails
│   └── validators.py   # Profanity, spam, injection, and grounding validation checks
├── tickets/            # Local Transactional Storage
│   └── db.ts           # Read/write adapter managing mock db.json models
├── analytics/          # Business Intelligence Metrics
│   └── analytics.py    # Compiles statistics, counts, SLA metrics, and trends
├── tests/              # Verification & Quality Assurance
│   └── placeholder.test.ts # TS-native tests for validation compliance
└── README.md           # Unified system documentation
```

---

# 🛠️ Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- HTML5
- CSS3

### Backend
- FastAPI
- Python
- Uvicorn

### Artificial Intelligence
- Google Gemini AI
- Retrieval-Augmented Generation (RAG)
- Vector Embeddings
- Semantic Search

### Database
- PostgreSQL

### Authentication
- Email & Password Authentication
- JWT (JSON Web Tokens)

### Deployment
- Vercel (Frontend)
- Render (Backend)

### Version Control
- Git
- GitHub
---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- A valid Google Gemini API Key

### 1. Clone the Project & Install Dependencies
Run the command below from the project root to install all required dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or update the provided `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

---

## 🚀 Usage

### Running in Development Mode
Start the live development environment featuring the Express API proxy and Vite frontend compiler running in parallel on port `3000`:
```bash
npm run dev
```
Once loaded, navigate your web browser to `http://localhost:3000`.

### Production Build & Deployment
To package the application for high-performance production hosting:

1. **Compile & Bundle Assets**:
   ```bash
   npm run build
   ```
   This generates compiled production static files in `/dist` and compiles the Node backend server into `/dist/server.cjs`.

2. **Launch Production Server**:
   ```bash
   npm run start
   ```

---

## 📑 API Documentation

All routes are prefixed with `/api` and return standardized JSON formats.

### 🔐 Authentication
#### `POST /api/register`
Creates a new customer credentials profile.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword",
    "confirmPassword": "securepassword"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful.",
    "user": { "id": "u-12345", "email": "jane@example.com", "name": "Jane Doe", "role": "customer" }
  }
  ```

#### `POST /api/login`
Validates user or agent credentials and initializes session state.
- **Request Body**:
  ```json
  {
    "email": "admin@company.com",
    "password": "admin123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": { "id": "u-admin", "email": "admin@company.com", "name": "Sarah Jenkins", "role": "admin" }
  }
  ```

---

### 🤖 Conversational AI Chat
#### `POST /api/chat`
Proxies user inquiries through the RAG context, performs safety validations, generates grounded Gemini responses, and manages ticket persistence in the database.
- **Request Body**:
  ```json
  {
    "message": "How long does it take for a refund to process back to my card?",
    "ticketId": "t-1001",
    "customerId": "u-cust1",
    "customerName": "John Doe",
    "customerEmail": "john.doe@gmail.com",
    "language": "hi",
    "image": {
      "data": "base64_encoded_string_here",
      "mimeType": "image/png"
    }
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "response": "आपके रिफंड को आपके बैंक स्टेटमेंट पर दिखाई देने में आमतौर पर 5 से 7 कार्यदिवस लगते हैं...",
    "ticketId": "t-1001",
    "sentiment": "neutral",
    "intent": "Refund",
    "escalated": false,
    "ticket": { ... }
  }
  ```

---

### 🎟️ Ticket Management
#### `GET /api/ticket`
Fetches all tickets from the database (Agent Desk access).
- **Response (200 OK)**: Array of ticket models.

#### `POST /api/ticket`
Creates a manual ticket directly without passing through chatbot flows.
- **Request Body**:
  ```json
  {
    "customerName": "Alice Smith",
    "customerEmail": "alice@example.com",
    "title": "Broken payment window",
    "category": "Technical Support",
    "priority": "high",
    "description": "Getting error CAL-403 every time I link my profile."
  }
  ```

#### `PUT /api/ticket/:id`
Updates ticket configurations (status, priority, agent assignee) or appends a human agent's manual reply.
- **Request Body**:
  ```json
  {
    "status": "resolved",
    "priority": "medium",
    "assignee": "Lead Agent",
    "adminReply": "I have successfully processed your refund credit. Please check your bank statement in 5 days."
  }
  ```

#### `DELETE /api/ticket/:id`
Deletes a ticket and associated escalation logs from the database.

---

### 📊 System Operations
#### `GET /api/analytics`
Generates full business intelligence summaries on tickets, daily timelines, and sentiment.
- **Response (200 OK)**: Returns computed counts, daily chats timelines, satisfaction averages, and priority maps.

#### `GET /api/export`
Exports ticket spreadsheets in structured `.csv` format. Sets appropriate HTTP headers to trigger client browser downloads.

#### `POST /api/knowledge`
Creates a new support knowledge article and indices it directly into the vector store.
- **Request Body**:
  ```json
  {
    "title": "Configuring Two-Factor Authentication",
    "content": "To configure 2FA, navigate to Settings > Security and scan the barcode...",
    "category": "Security",
    "tags": ["2fa", "login", "security"]
  }
  ```

---

## 🖼️ Screenshots

*Below are placeholder layouts demonstrating the SupportSuite interfaces:*

### Customer Workspace - Dynamic AI Assistant
```
┌────────────────────────────────────────────────────────┐
│  SupportSuite                    [ Customer Center ]   │
├────────────────────────────────────────────────────────┤
│  Hello, John Doe!                                      │
│                                                        │
│  [Bot] Hi John! Welcome to SupportBot. How can I help? │
│  [User] Can you check on my invoice double-charge?     │
│  [Bot] Processing request... Sentiment: Frustrated     │
│                                                        │
│  Type your message here...                  [Send 🚀]  │
└────────────────────────────────────────────────────────┘
```

### Agent Command Desk - Analytics Dashboard
```
┌────────────────────────────────────────────────────────┐
│  SupportSuite Admin              [ Agent Command Desk] │
├────────────────────────────────────────────────────────┤
│  [Total Tickets: 15]   [Escalated: 3]   [Sentiment: 82%]│
│                                                        │
│  Active Queue:                                         │
│  ■ t-1001 | John Doe     | Double Billing  | HIGH      │
│  ■ t-1003 | Robert Miller| Cancel charge   | URGENT    │
│                                                        │
│  [View Analytics Charts]   [KB Hot-Swap]   [Export CSV]│
└────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

SupportSuite features TypeScript-native test scripts validating the logic of safety guardrails and input checkers.

To execute the local testing suite:
```bash
npm run dev
```
And inspect the server's backend console logs for test results. (Tests run synchronously during the initialization process).

Alternatively, compile and test specific scripts using the Node runtime:
```bash
npx tsx tests/placeholder.test.ts
```

---

## 🔮 Future Improvements

Proposed enhancements for future development cycles:
- **Relational SQL Database Integration**: Migrating from local `db.json` to persistent Cloud SQL/PostgreSQL storage to support heavy parallel transactional threads.
- **Live WebSocket Synchronization**: Implementing real-time event hooks to push new client messages instantly onto active agent dashboards.
- **Third-Party Integrations**: Connecting ticket details to external workflows like Jira, Zendesk, or Slack alerts.
- **Advanced OCR Document Scanning**: Supporting heavy-duty document uploads using specialized document-AI models to extract line-item invoicing directly.

---

## 🧑‍💻 Author

- **SupportSuite Development Team**
- Email: [shanjusri899@gmail.com](mailto:shanjusri899@gmail.com)
- Project Repository: [SupportSuite Dashboard](https://ai.studio/build)

---
*Developed as part of an advanced AI and Cloud Engineering portfolio.*
