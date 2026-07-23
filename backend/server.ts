import express, { Request, Response } from "express";
import path from "path";
import { execSync } from "child_process";
import { createServer as createViteServer } from "vite";
function callPyAnalytics(method: string, ...args: any[]): any {
  const argsJson = JSON.stringify(args);
  const pyCode = `import json, sys; from analytics.analytics import ${method}; args = json.loads(sys.argv[1]); res = ${method}(*args); print(json.dumps(res))`;
  const output = execSync(`python3 -c ${JSON.stringify(pyCode)} ${JSON.stringify(argsJson)}`, {
    encoding: "utf-8",
    cwd: process.cwd()
  });
  return JSON.parse(output.trim());
}

export function computeAnalytics(tickets: any[]): any {
  return callPyAnalytics("computeAnalytics", tickets);
}

function callPyValidators(clsName: string, method: string, ...args: any[]): any {
  const argsJson = JSON.stringify(args);
  const pyCode = `import json, sys; from validators.validators import ${clsName}; args = json.loads(sys.argv[1]); fn = getattr(${clsName}, "${method}"); res = fn(*args); print(json.dumps(res))`;
  const output = execSync(`python3 -c ${JSON.stringify(pyCode)} ${JSON.stringify(argsJson)}`, {
    encoding: "utf-8",
    cwd: process.cwd()
  });
  return JSON.parse(output.trim());
}

export class EmailValidator {
  static validate(email: string): { isValid: boolean; error?: string } {
    return callPyValidators("EmailValidator", "validate", email);
  }
}

export class InputValidator {
  static validate(text: string): { isValid: boolean; error?: string } {
    return callPyValidators("InputValidator", "validate", text);
  }
}

export class ResponseValidator {
  static validateResponse(
    response: string,
    context: string[],
    isConversational: boolean,
    isEscalated: boolean
  ): {
    isValid: boolean;
    confidence: number;
    isGrounded: boolean;
    isFallbackOrEscalationTriggered: boolean;
    error?: string;
    finalResponse: string;
  } {
    return callPyValidators("ResponseValidator", "validateResponse", response, context, isConversational, isEscalated);
  }
}

function callPyDb(method: string, ...args: any[]): any {
  const argsJson = JSON.stringify(args);
  const pyCode = `import json, sys; from tickets.db import Database; args = json.loads(sys.argv[1]); res = getattr(Database, "${method}")(*args); print(json.dumps(res))`;
  const output = execSync(`python3 -c ${JSON.stringify(pyCode)} ${JSON.stringify(argsJson)}`, {
    encoding: "utf-8",
    cwd: process.cwd()
  });
  return JSON.parse(output.trim());
}

function callPyGemini(method: string, ...args: any[]): any {
  const argsJson = JSON.stringify(args);
  const pyCode = `import json, sys, asyncio; from chatbot.gemini import GeminiService; args = json.loads(sys.argv[1]); fn = getattr(GeminiService, "${method}"); res = asyncio.run(fn(*args)) if asyncio.iscoroutinefunction(fn) else fn(*args); print(json.dumps(res))`;
  const output = execSync(`python3 -c ${JSON.stringify(pyCode)} ${JSON.stringify(argsJson)}`, {
    encoding: "utf-8",
    cwd: process.cwd()
  });
  return JSON.parse(output.trim());
}

function callPyRAG(method: string, ...args: any[]): any {
  const argsJson = JSON.stringify(args);
  const pyCode = `import json, sys, asyncio; from retrieval.rag import RAGService; args = json.loads(sys.argv[1]); fn = getattr(RAGService, "${method}"); res = asyncio.run(fn(*args)) if asyncio.iscoroutinefunction(fn) else fn(*args); print(json.dumps(res))`;
  const output = execSync(`python3 -c ${JSON.stringify(pyCode)} ${JSON.stringify(argsJson)}`, {
    encoding: "utf-8",
    cwd: process.cwd()
  });
  return JSON.parse(output.trim());
}

export class RAGService {
  static async initializeIndex(): Promise<void> {
    return callPyRAG("initializeIndex");
  }

  static async indexArticle(article: any): Promise<void> {
    return callPyRAG("indexArticle", article);
  }

  static deindexArticle(articleId: string): void {
    return callPyRAG("deindexArticle", articleId);
  }

  static async retrieveRelevantContext(query: string, limit = 3): Promise<string[]> {
    return callPyRAG("retrieveRelevantContext", query, limit);
  }
}

export class GeminiService {
  static async getEmbedding(text: string): Promise<number[]> {
    return callPyGemini("getEmbedding", text);
  }
  static async verifyRelevance(query: string, candidates: { title: string; content: string }[]): Promise<boolean[]> {
    return callPyGemini("verifyRelevance", query, candidates);
  }
  static async analyzeMessage(content: string): Promise<any> {
    return callPyGemini("analyzeMessage", content);
  }
  static async translateResponse(englishText: string, targetLanguageCode: string): Promise<string> {
    return callPyGemini("translateResponse", englishText, targetLanguageCode);
  }
  static async generateGroundedResponse(
    userMessage: string,
    history: any[],
    retrievedContext: string[],
    systemAnalysis: any,
    image?: any,
    language?: string
  ): Promise<string> {
    return callPyGemini("generateGroundedResponse", userMessage, history, retrievedContext, systemAnalysis, image, language);
  }
}

export class Database {
  static getUsers() { return callPyDb("getUsers"); }
  static getUserByEmail(email: string) { return callPyDb("getUserByEmail", email); }
  static createUser(user: any) { return callPyDb("createUser", user); }
  static getTickets() { return callPyDb("getTickets"); }
  static getTicket(id: string) { return callPyDb("getTicket", id); }
  static createTicket(ticket: any) { return callPyDb("createTicket", ticket); }
  static updateTicket(id: string, updates: any) { return callPyDb("updateTicket", id, updates); }
  static addMessage(ticketId: string, message: any) { return callPyDb("addMessage", ticketId, message); }
  static deleteTicket(id: string) { return callPyDb("deleteTicket", id); }
  static getKnowledge() { return callPyDb("getKnowledge"); }
  static createKnowledge(article: any) { return callPyDb("createKnowledge", article); }
  static deleteKnowledge(id: string) { return callPyDb("deleteKnowledge", id); }
  static getEscalationLogs() { return callPyDb("getEscalationLogs"); }
  static createEscalation(log: any) { return callPyDb("createEscalation", log); }
}

const apiRouter = express.Router();

// 1. Auth Endpoints
apiRouter.post("/register", (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
    return res.status(400).json({ detail: "All registration fields are required." });
  }
  const emailVal = EmailValidator.validate(email);
  if (!emailVal.isValid) {
    return res.status(400).json({ detail: emailVal.error || "Please enter a valid email address." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ detail: "Passwords do not match." });
  }
  const trimmedEmail = email.trim();
  const existingUser = Database.getUserByEmail(trimmedEmail);
  if (existingUser) {
    return res.status(400).json({ detail: "Email is already registered." });
  }
  const newUser = Database.createUser({
    name: name.trim(),
    email: trimmedEmail.toLowerCase(),
    password,
    role: "customer"
  });
  return res.status(201).json({
    success: true,
    message: "Registration successful.",
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
  });
});

apiRouter.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ detail: "Email and password are required." });
  }
  const user = Database.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ detail: "Email is not registered." });
  }
  if (user.password !== password) {
    return res.status(401).json({ detail: "Password is incorrect." });
  }
  return res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

apiRouter.post("/logout", (req: Request, res: Response) => {
  return res.json({ success: true });
});

// 2. Health Check
apiRouter.get("/health", (req: Request, res: Response) => {
  return res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 3. Conversational AI Chat Endpoint
apiRouter.post("/chat", async (req: Request, res: Response) => {
  const { ticketId, customerName, customerEmail, customerId, image, language, message } = req.body;
  let finalMessage = (message || "").trim();
  if (!finalMessage && image?.data && image?.mimeType) {
    finalMessage = "[Uploaded image analysis request]";
  }
  const validation = InputValidator.validate(finalMessage);
  if (!validation.isValid) {
    return res.status(400).json({ detail: validation.error });
  }
  try {
    const context = await RAGService.retrieveRelevantContext(finalMessage, 3);
    const analysis = await GeminiService.analyzeMessage(finalMessage);
    const conversationalType = analysis.conversationalType;
    const isConversational = conversationalType && conversationalType !== "none";
    const activeContext = isConversational ? [] : context;

    const existingTicket = ticketId ? Database.getTicket(ticketId) : null;
    const name = customerName || "Anonymous Customer";
    const email = customerEmail || "anonymous@example.com";
    const cId = customerId || "u-anonymous";

    let customerMsgContent = (message || "").trim();
    if (image?.data && image?.mimeType) {
      customerMsgContent = customerMsgContent
        ? `${customerMsgContent} [Attachment: Image/Document]`
        : "[Attachment: Image/Document]";
    }

    const customerMessagePart = {
      id: `m-${Date.now()}-c`,
      role: "customer" as const,
      content: customerMsgContent,
      timestamp: new Date().toISOString(),
      sentiment: analysis.sentiment,
      intent: analysis.intent,
      category: analysis.category,
      priority: analysis.priority,
      conversationalType,
    };

    const geminiImage = image?.data && image?.mimeType ? { inlineData: { data: image.data, mimeType: image.mimeType } } : undefined;
    const history = existingTicket?.messages ? existingTicket.messages.slice(-5) : [];

    const groundedAiAnswer = await GeminiService.generateGroundedResponse(
      finalMessage,
      history,
      activeContext,
      analysis,
      geminiImage,
      language
    );

    const validationResult = ResponseValidator.validateResponse(
      groundedAiAnswer,
      activeContext,
      isConversational,
      analysis.escalate
    );

    const validatedAiAnswer = validationResult.finalResponse;
    const aiMessagePart = {
      id: `m-${Date.now()}-ai`,
      role: "assistant" as const,
      content: validatedAiAnswer,
      timestamp: new Date().toISOString(),
    };

    const targetTicketId = existingTicket ? existingTicket.id : `t-${1000 + Database.getTickets().length + 1}`;
    const shouldEscalate = analysis.escalate || validationResult.isFallbackOrEscalationTriggered;

    let ticketPreview: any = {};
    if (existingTicket) {
      const statusPreview = (shouldEscalate && existingTicket.status === "open") ? "escalated" : existingTicket.status;
      ticketPreview = {
        ...existingTicket,
        status: statusPreview,
        updatedAt: new Date().toISOString(),
        sentiment: analysis.sentiment,
        messages: [...existingTicket.messages, customerMessagePart, aiMessagePart],
      };
    } else {
      ticketPreview = {
        id: targetTicketId,
        customerId: cId,
        customerName: name,
        customerEmail: email,
        title: analysis.suggestedTicketTitle,
        category: analysis.category,
        priority: analysis.priority,
        status: shouldEscalate ? "escalated" : "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sentiment: analysis.sentiment,
        messages: [customerMessagePart, aiMessagePart],
      };
    }

    res.json({
      success: true,
      response: validatedAiAnswer,
      ticketId: targetTicketId,
      sentiment: analysis.sentiment,
      intent: analysis.intent,
      escalated: shouldEscalate,
      ticket: ticketPreview,
    });

    setTimeout(() => {
      try {
        if (existingTicket) {
          Database.addMessage(existingTicket.id, customerMessagePart);
          if (shouldEscalate && existingTicket.status === "open") {
            Database.updateTicket(existingTicket.id, { status: "escalated" });
          }
          Database.addMessage(existingTicket.id, aiMessagePart);
        } else {
          Database.createTicket({
            customerId: cId,
            customerName: name,
            customerEmail: email,
            title: analysis.suggestedTicketTitle,
            category: analysis.category,
            priority: analysis.priority,
            status: shouldEscalate ? "escalated" : "open",
            sentiment: analysis.sentiment,
            initialMessage: customerMessagePart,
          });
          Database.addMessage(targetTicketId, aiMessagePart);
        }

        if (shouldEscalate) {
          const reasonMsg = `Automated flow flagged: intent='${analysis.intent}', sentiment='${analysis.sentiment}', escalationTriggered=${analysis.escalate}`;
          Database.createEscalation({
            ticketId: targetTicketId,
            reason: reasonMsg,
            severity: analysis.sentiment === "angry" ? "critical" : "high",
          });
        }
      } catch (err) {
        console.error("Async DB ticket state update failed:", err);
      }
    }, 0);

  } catch (error) {
    console.error("Express /chat endpoint error:", error);
    res.status(500).json({ detail: "An internal support server error occurred." });
  }
});

// 4. Ticket Management Endpoints
apiRouter.get("/ticket", (_req: Request, res: Response) => {
  return res.json(Database.getTickets());
});

apiRouter.get("/ticket/:id", (req: Request, res: Response) => {
  const ticket = Database.getTicket(req.params.id);
  if (!ticket) return res.status(404).json({ detail: "Ticket not found." });
  return res.json(ticket);
});

apiRouter.post("/ticket", (req: Request, res: Response) => {
  const { customerName, customerEmail, title, category, priority, description } = req.body;
  if (!customerName || !customerEmail || !description) {
    return res.status(400).json({ detail: "Name, email, and description are required to open a ticket." });
  }
  const initialMsg = {
    id: `m-${Date.now()}`,
    role: "customer" as const,
    content: description,
    timestamp: new Date().toISOString(),
    sentiment: "neutral" as const,
    intent: "General Question"
  };
  const ticket = Database.createTicket({
    customerId: `u-${Date.now()}`,
    customerName,
    customerEmail,
    title: title || "Support Request",
    category: category || "General Inquiry",
    priority: priority || "medium",
    status: "open",
    sentiment: "neutral",
    initialMessage: initialMsg
  });
  return res.status(201).json({ success: true, ticket });
});

apiRouter.put("/ticket/:id", (req: Request, res: Response) => {
  const { status, priority, assignee, rating, adminReply, title } = req.body;
  const ticket = Database.getTicket(req.params.id);
  if (!ticket) return res.status(404).json({ detail: "Ticket not found." });
  const updates: any = {};
  if (status !== undefined) updates.status = status;
  if (priority !== undefined) updates.priority = priority;
  if (assignee !== undefined) updates.assignee = assignee;
  if (rating !== undefined) updates.satisfactionRating = parseInt(rating, 10);
  if (title !== undefined) updates.title = title;

  if (adminReply && adminReply.trim()) {
    Database.addMessage(ticket.id, {
      role: "admin",
      content: adminReply,
    });
  }
  const updatedTicket = Database.updateTicket(req.params.id, updates);
  return res.json({ success: true, ticket: updatedTicket });
});

apiRouter.delete("/ticket/:id", (req: Request, res: Response) => {
  const success = Database.deleteTicket(req.params.id);
  if (success) return res.json({ success: true });
  return res.status(404).json({ detail: "Ticket not found." });
});

// 5. Customer History Endpoint
apiRouter.get("/history", (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ detail: "Email query parameter is required." });
  const userTickets = Database.getTickets().filter(t => t.customerEmail.toLowerCase() === email.toLowerCase());
  return res.json(userTickets);
});

// 6. Analytics Metrics Aggregator
apiRouter.get("/analytics", (_req: Request, res: Response) => {
  return res.json(computeAnalytics(Database.getTickets()));
});

// 7. CSV Export
apiRouter.get("/export", (_req: Request, res: Response) => {
  const tickets = Database.getTickets();
  const csvLines = [
    "Ticket ID,Customer Name,Customer Email,Title,Category,Priority,Status,Sentiment,Created At,Rating"
  ];
  for (const t of tickets) {
    const nameEsc = `"${(t.customerName || "").replace(/"/g, '""')}"`;
    const emailEsc = `"${(t.customerEmail || "").replace(/"/g, '""')}"`;
    const titleEsc = `"${(t.title || "").replace(/"/g, '""')}"`;
    const rating = t.satisfactionRating ?? "N/A";
    csvLines.push(`${t.id},${nameEsc},${emailEsc},${titleEsc},${t.category},${t.priority},${t.status},${t.sentiment},${t.createdAt},${rating}`);
  }
  const csvContent = csvLines.join("\n") + "\n";
  const todayStr = new Date().toISOString().split("T")[0];
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=AI_Support_Tickets_Export_${todayStr}.csv`);
  return res.send(csvContent);
});

// 8. Knowledge Management Endpoints
apiRouter.get("/knowledge", (_req: Request, res: Response) => {
  return res.json(Database.getKnowledge());
});

apiRouter.post("/knowledge", async (req: Request, res: Response) => {
  const { title, content, category, tags } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ detail: "Title, content, and category are required." });
  }
  const article = Database.createKnowledge({ title, content, category, tags: tags || [] });
  await RAGService.indexArticle(article);
  return res.status(201).json({ success: true, article });
});

apiRouter.delete("/knowledge/:id", (req: Request, res: Response) => {
  const success = Database.deleteKnowledge(req.params.id);
  if (success) {
    RAGService.deindexArticle(req.params.id);
    return res.json({ success: true });
  }
  return res.status(404).json({ detail: "Article not found." });
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure CORS
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(express.json({ limit: "20mb" }));

  // Root endpoint
  app.get("/", (req, res, next) => {
    if (req.headers.accept?.includes("text/html")) {
      return next();
    }
    res.json({
      message: "AI Customer Support Assistant API",
      status: "running"
    });
  });

  // Mount API router FIRST under /api
  app.use("/api", apiRouter);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

