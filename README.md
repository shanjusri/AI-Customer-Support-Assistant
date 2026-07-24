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
# 🏗️ Project Architecture


                    React Frontend
                           │
                           ▼
                  FastAPI Backend
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
 Authentication      RAG Retrieval        Ticket System
      │                    │                    │
      ▼                    ▼                    ▼
 User Database     Knowledge Base      Ticket Database
                           │
                           ▼
                  Google Gemini AI
                           │
                           ▼
                  AI Response Generation







---
# 📁 Project Structure

REMIX_AI_CUSTOMER_SUPPORT_ASSISTANT/
│
├── analytics/
│   └── analytics.py
│
├── assets/
│
├── backend/
│   ├── api.py
│   ├── main.py
│   └── server.ts
│
├── chatbot/
│   └── gemini.py
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AdminWorkspace.tsx
│       │   ├── CustomerWorkspace.tsx
│       │   └── ...
│       ├── App.tsx
│       ├── index.css
│       ├── main.tsx
│       └── types.ts
│
├── prompts/
│
├── retrieval/
│
├── tests/
│
├── tickets/
│
├── validators/
│
├── .env.example
├── .gitignore
├── bun.lock
├── db.json
├── index.html
├── metadata.json
├── package.json
├── README.md
├── requirements.txt
├── tsconfig.json
└── vite.config.ts





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

# ⚙️ Installation

Clone repository

git clone https://github.com/<YOUR_GITHUB_USERNAME>/AI-Customer-Support-Assistant.git

Move into project

cd AI-Customer-Support-Assistant

Install requirements

pip install -r requirements.txt

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
