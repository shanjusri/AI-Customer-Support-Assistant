/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "admin" | "customer";
export type TicketStatus = "open" | "escalated" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type SentimentType = "positive" | "neutral" | "negative" | "frustrated" | "angry" | "urgent";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface Message {
  id: string;
  role: "customer" | "assistant" | "admin" | "system";
  content: string;
  timestamp: string; // ISO string
  sentiment?: SentimentType;
  intent?: string;
  escalated?: boolean;
  category?: string;
  priority?: string;
  conversationalType?: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  title: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  sentiment: SentimentType;
  messages: Message[];
  assignee?: string;
  satisfactionRating?: number; // 1-5 scale
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export interface AnalyticsSnapshot {
  totalChats: number;
  resolvedChats: number;
  escalatedChats: number;
  avgResponseTimeSec: number;
  avgSentimentScore: number; // 0 (worst) to 1 (best)
  intentDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  sentimentDistribution: Record<string, number>;
  dailyUsage: { date: string; chats: number; tickets: number }[];
  resolutionRatesByCategory: Record<string, { total: number; resolved: number }>;
}

export interface EscalationLog {
  id: string;
  ticketId: string;
  reason: string;
  timestamp: string;
  severity: "medium" | "high" | "critical";
}
