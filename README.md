# 🤖 AI Customer Support Assistant

An AI-powered Customer Support Assistant built using React, FastAPI, Google Gemini AI, and RAG (Retrieval-Augmented Generation). It provides intelligent customer support, ticket management, sentiment analysis, and knowledge-based responses through a modern chat interface.

🌐 **Live Demo:**  
<https://ai-customer-support-assistant-xi.vercel.app>

⚙️ **Backend API:**  
<https://ai-customer-support-assistant-d4br.onrender.com>

📚 **API Documentation:**  
<https://ai-customer-support-assistant-d4br.onrender.com/docs>
---

## 🎯 Objectives

The core objectives of the SupportSuite project are:
- **Instant Resolution**: Deliver fast, accurate, and contextually grounded answers to common customer inquiries using Gemini AI coupled with a local semantic knowledge base (RAG).
- **Automated Triage**: Classify customer intent, evaluate emotional sentiment, prioritize urgency, and route tickets with zero manual effort.
- **Safety First**: Intercept and filter malicious inputs (toxic speech, spam, prompt injection attacks) and audit generated responses for grounding to prevent hallucinations.
- **Inclusion & Accessibility**: Support customer interactions in multiple regional Indian languages with natural, context-aware translations.
- **Seamless Human Escalation**: Facilitate smooth transitions from automated AI help to human coordinator management when complex or negative sentiment indicators are detected.
- **Operational Intelligence**: Empower support leads with real-time dashboards to analyze ticket volume, agent performance, customer satisfaction ratings, and customer sentiment distribution.

---

## ✨ Features

### 👤 Customer Workspace
- **Intelligent Multilingual Chatbot**: Direct chat with an AI assistant that dynamically adapts to conversational tone and maintains contextual memory.
- **Regional Translation**: One-click switching or automated language recognition for:
  - English (`en`)
  - Hindi (`hi` - हिंदी)
  - Telugu (`te` - తెలుగు)
  - Tamil (`ta` - தமிழ்)
  - Kannada (`kn` - ಕನ್ನಡ)
  - Malayalam (`ml` - മലയാളം)
- **Document & Image Attachment Preview**: Upload mock invoices, screenshots, or receipts. The server-side Gemini multi-modal engine reads, parses, and resolves issues directly from image details.
- **Account Registration & Multi-Ticket Logs**: Users can log in, view historical support inquiries, and check active ticket resolutions.

### 👮 Agent Command Desk (Admin)
- **Real-Time Operational Analytics**: Comprehensive telemetry displaying:
  - Ticket priority distribution (low, medium, high, urgent).
  - Customer sentiment distribution metrics.
  - Interactive charts tracking daily volume and resolution metrics.
  - Performance SLA averages (average response times and satisfaction ratings).
- **Interactive Support Queue**: View, sort, delete, and filter active issues by status (`open`, `escalated`, `resolved`).
- **Manual Ticket Assignment & Title Customization**: Allows managers to delegate tickets to specific agents, update priority, and re-title items.
- **Direct Reply Interface**: Agents can override AI actions by sending manual replies directly into the customer's chat thread.
- **Knowledge Base (KB) Hot-Swapping**: View current official support articles. Create or delete articles on the fly. The system automatically updates the semantic RAG index instantly!
- **Data Export**: Single-click export of all system ticket records to a clean CSV file.

### 🛡️ Dual-Stage Enterprise Guardrails
- **Input Sanitization**: Filters out empty sequences, repetitive spam patterns, explicit profanity, and prompt injection/jailbreak keywords.
- **Response Grounding Checker**: Audits AI outputs. If a generated answer lacks substantial overlap with retrieved articles or triggers fallback phrases, the system intercepts the message and falls back to a warm, human-escalation offer.

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

## 🛠️ Technologies Used

### Frontend (Client-Side)
- **React 19**: Modern declarative UI library.
- **Tailwind CSS v4**: Ultra-fast utility-first styling for layout grid, typography, spacing, and SaaS themes.
- **Lucide Icons**: Elegant, lightweight iconography.
- **Recharts**: Modular D3-based interactive charting library for dashboard telemetry.
- **Motion (Framer)**: Smooth components entrance transitions and status changes.

### Backend (Server-Side)
- **Node.js**: Asynchronous event-driven JavaScript runtime environment.
- **Express.js**: Fast, minimalist web framework for building server API endpoints.
- **tsx**: TypeScript-native execute utility for streamlined dev workflows.
- **esbuild**: High-performance bundler used to compile backend TS server files into clean CommonJS chunks.

### AI Integration
- **Google Gen AI SDK (`@google/genai`)**: Modern, official SDK used for LLM operations.
- **gemini-3.1-flash-lite**: Chosen model for lightning-fast structured classification, intent evaluations, and text completions.
- **gemini-embedding-2-preview**: Cutting-edge embedding model for dense 768-dimension semantic vector mapping.

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
