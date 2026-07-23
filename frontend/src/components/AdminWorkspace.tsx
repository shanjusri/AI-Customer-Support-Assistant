/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BarChart3, ShieldAlert, BookOpen, Download, UserCheck, 
  MessageSquare, Star, Clock, Heart, Search, CheckCircle2, 
  Trash2, Plus, ArrowRight, LogOut, Check, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Ticket, KnowledgeArticle, AnalyticsSnapshot, SentimentType } from "../types";

export function AdminWorkspace() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"analytics" | "queue" | "knowledge">("analytics");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  
  // Selected state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");

  // New Article Form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Billing");
  const [newTags, setNewTags] = useState("");
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);

  // Search KB
  const [kbSearchQuery, setKbSearchQuery] = useState("");

  // Load Admin Data
  const loadAdminState = async () => {
    try {
      const tRes = await fetch("https://ai-customer-support-assistant-q4br.onrender.com/api/ticket");
      const kRes = await fetch("https://ai-customer-support-assistant-q4br.onrender.com/api/knowledge");
      const aRes = await fetch("https://ai-customer-support-assistant-q4br.onrender.com/api/analytics");
      
      if (tRes.ok) setTickets(await tRes.json());
      if (kRes.ok) setArticles(await kRes.json());
      if (aRes.ok) setAnalytics(await aRes.json());
    } catch (err) {
      console.error("Admin: failed to sync states:", err);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadAdminState();
      const interval = setInterval(loadAdminState, 8000); // Poll every 8s for live ticket queues
      return () => clearInterval(interval);
    }
  }, [isAdminLoggedIn]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("https://ai-customer-support-assistant-q4br.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      if (res.ok) {
        setIsAdminLoggedIn(true);
      } else {
        const data = await res.json();
        setAuthError(data.error || "Login failed.");
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication server.");
    }
  };

  const handleAdminLogout = async () => {
    await fetch("https://ai-customer-support-assistant-q4br.onrender.com/api/logout", { method: "POST" });
    setIsAdminLoggedIn(false);
    setAdminEmail("");
    setAdminPassword("");
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReply.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/ticket/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminReply,
          status: selectedStatus || selectedTicket.status,
          priority: selectedPriority || selectedTicket.priority,
          assignee: "Sarah Jenkins (Lead Agent)"
        })
      });

      if (res.ok) {
        setAdminReply("");
        await loadAdminState();
        // Sync detail panel
        const updated = await fetch(`/api/ticket/${selectedTicket.id}`);
        if (updated.ok) {
          setSelectedTicket(await updated.json());
        }
      }
    } catch (err) {
      console.error("Failed to submit admin reply:", err);
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateTicketMeta = async (status: string, priority: string) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(`/api/ticket/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority })
      });
      if (res.ok) {
        await loadAdminState();
        const updated = await fetch(`/api/ticket/${selectedTicket.id}`);
        if (updated.ok) {
          setSelectedTicket(await updated.json());
        }
      }
    } catch (err) {
      console.error("Failed to update ticket metadata:", err);
    }
  };

  const handleCreateKnowledgeArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !newCategory) return;

    setIsCreatingArticle(true);
    try {
      const tagsArray = newTags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch("https://ai-customer-support-assistant-q4br.onrender.com/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          tags: tagsArray
        })
      });

      if (res.ok) {
        setNewTitle("");
        setNewContent("");
        setNewTags("");
        await loadAdminState();
      }
    } catch (err) {
      console.error("Failed to insert knowledge base article:", err);
    } finally {
      setIsCreatingArticle(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ article from the knowledge base? This will de-index it from active AI retrieval.")) return;
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadAdminState();
      }
    } catch (err) {
      console.error("Failed to delete FAQ article:", err);
    }
  };

  const getSentimentEmoji = (sentiment?: SentimentType) => {
    switch (sentiment) {
      case "positive": return "😊";
      case "neutral": return "😐";
      case "frustrated": return "😟";
      case "negative": return "😣";
      case "angry": return "😠";
      case "urgent": return "🚨";
      default: return "😐";
    }
  };

  // Filter KB articles by search
  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(kbSearchQuery.toLowerCase()) ||
    art.content.toLowerCase().includes(kbSearchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(kbSearchQuery.toLowerCase())
  );

  if (!isAdminLoggedIn) {
    return (
      <div id="admin-login-gate" className="max-w-md mx-auto my-16 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="bg-[#0f172a] p-8 text-center text-white relative border-b border-slate-800">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldAlert className="w-24 h-24 text-blue-500" />
          </div>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4 shadow-sm">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Agent Command Desk</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">Sign in with agent credentials to manage queues, update grounding indexes, and inspect live analytics.</p>
        </div>
        <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-pulse">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Agent Email</label>
            <input 
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="e.g. admin@company.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Security Password</label>
            <input 
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Authorize Administrator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="pt-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200">Demo Account: admin@company.com / admin123</span>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 h-[calc(100vh-180px)] min-h-[580px]">
      {/* 1. Admin Control Sidebar - DARK SIDEBAR AS REQUESTED */}
      <div className="xl:col-span-1 bg-[#0f172a] rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between overflow-hidden text-slate-300">
        <div>
          <div className="p-4 border-b border-slate-800 bg-[#0b0f19] flex items-center justify-between">
            <div className="overflow-hidden pr-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enterprise Desk</h3>
              <p className="text-sm font-bold text-white mt-0.5 truncate">Sarah Jenkins</p>
            </div>
            <button onClick={handleAdminLogout} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer" title="Log Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 space-y-1.5">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === "analytics" 
                  ? "bg-[#1e293b] border-slate-700 text-blue-400 shadow-sm" 
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/40"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span>Real-Time Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("queue")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all justify-between border cursor-pointer ${
                activeTab === "queue" 
                  ? "bg-[#1e293b] border-slate-700 text-blue-400 shadow-sm" 
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Ticket Inbox Queue</span>
              </div>
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 text-[9px] rounded-full font-bold">
                {tickets.filter(t => t.status !== "resolved").length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("knowledge")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === "knowledge" 
                  ? "bg-[#1e293b] border-slate-700 text-blue-400 shadow-sm" 
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/40"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Grounding FAQ Base</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#0b0f19]">
          <a
            href="/api/export"
            className="w-full py-2.5 bg-[#1e293b] hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Tickets CSV</span>
          </a>
        </div>
      </div>

      {/* 2. Admin Workspace Main Panel - WHITE AND BLUE COLOR PALETTE */}
      <div className="xl:col-span-4 h-full flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {/* TAB A: ANALYTICS DASHBOARD */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 flex-1 overflow-y-auto pr-1"
            >
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Chats</h4>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{analytics?.totalChats ?? "..."}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Resolved</h4>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{analytics?.resolvedChats ?? "..."}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl flex items-center justify-center shadow-sm animate-pulse">
                    <ShieldAlert className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Escalated</h4>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{analytics?.escalatedChats ?? "..."}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Heart className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sentiment Index</h4>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">
                      {analytics ? `${Math.round(analytics.avgSentimentScore * 100)}%` : "..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Graphical Analysis Dashboard Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Ticket Intent Distribution Visual widget */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span>Inquiry Intent Distributions (AI Triage)</span>
                  </h3>
                  
                  {analytics && analytics.intentDistribution ? (
                    <div className="space-y-4 pt-1">
                      {Object.entries(analytics.intentDistribution).map(([intent, count], i) => {
                        const total = (Object.values(analytics.intentDistribution) as number[]).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5">
                              <span className="font-bold text-slate-800">{intent}</span>
                              <span className="font-mono text-slate-500">{count} chats ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full shadow-sm"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-xs text-slate-500">Computing intents...</div>
                  )}
                </div>

                {/* 2. Sentiment Indicators chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-blue-600" />
                    <span>Customer Emotional Sentiment Index</span>
                  </h3>

                  {analytics ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(analytics.sentimentDistribution).map(([sentiment, count], i) => {
                        let color = "bg-slate-50 border-slate-200/60 text-slate-600";
                        if (sentiment === "positive") color = "bg-emerald-50/70 border border-emerald-100 text-emerald-700";
                        if (sentiment === "angry" || sentiment === "urgent") color = "bg-rose-50/70 border border-rose-100 text-rose-700";
                        if (sentiment === "frustrated" || sentiment === "negative") color = "bg-amber-50/70 border border-amber-100 text-amber-700";

                        return (
                          <div key={i} className={`p-3.5 rounded-2xl border text-center ${color}`}>
                            <div className="text-2xl mb-1">{getSentimentEmoji(sentiment as SentimentType)}</div>
                            <div className="text-xs font-bold capitalize">{sentiment}</div>
                            <div className="text-sm font-mono font-black mt-1">{count}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-xs text-slate-500">Summarizing sentiments...</div>
                  )}
                </div>

                {/* 3. Daily Chat Volume widget */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>7-Day Support Activity & Chat Volume</span>
                  </h3>

                  {analytics ? (
                    <div className="h-44 flex items-end gap-3 pt-6 border-b border-slate-100 px-4">
                      {analytics.dailyUsage.map((day, i) => {
                        const maxChats = Math.max(...analytics.dailyUsage.map(d => d.chats), 1);
                        const chatHeight = (day.chats / maxChats) * 100;
                        
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center group relative">
                            {/* Hover tooltip */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-mono transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-md">
                              {day.chats} chats, {day.tickets} tickets
                            </div>

                            <div className="w-full flex justify-center gap-1 items-end h-32">
                              {/* Chats column */}
                              <div 
                                className="w-full sm:w-10 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg shadow-sm hover:from-blue-700 hover:to-indigo-600 transition-all cursor-pointer"
                                style={{ height: `${chatHeight}%` }}
                              />
                            </div>
                            
                            <span className="text-[10px] text-slate-500 mt-2 font-mono">
                              {day.date.split("-").slice(1).join("/")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-xs text-slate-500">Aggregating chat timelines...</div>
                  )}
                  <div className="flex justify-end gap-4 mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider px-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
                      <span>Chats Volume</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB B: ACTIVE TICKET QUEUE */}
          {activeTab === "queue" && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full flex-1 overflow-hidden"
            >
              {/* Left Tickets list queue: 5 columns */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-900">Support Inbox Queue</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Live monitoring of AI Triage and Human handoffs</p>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                  {tickets.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-xs text-slate-500 font-medium">No tickets found in DB.</p>
                    </div>
                  ) : (
                    tickets.map((t) => {
                      const isSelected = selectedTicket?.id === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSelectedTicket(t);
                            setSelectedStatus(t.status);
                            setSelectedPriority(t.priority);
                          }}
                          className={`w-full text-left p-4 rounded-xl transition-all border cursor-pointer ${
                            isSelected 
                              ? "bg-blue-50/70 border-blue-150 text-slate-900 shadow-sm"
                              : "hover:bg-slate-50 border-transparent text-slate-600"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-mono text-slate-400 text-[10px] font-bold">{t.id}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                                t.priority === "urgent" 
                                  ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" 
                                  : t.priority === "high"
                                  ? "bg-amber-50 text-amber-600 border-amber-100"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>
                                {t.priority}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                                t.status === "resolved" 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : t.status === "escalated"
                                  ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
                                  : "bg-blue-50 text-blue-600 border-blue-150"
                              }`}>
                                {t.status}
                              </span>
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 truncate mb-1.5">{t.title}</h4>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                            <span className="text-slate-600">{t.customerName}</span>
                            <span>{getSentimentEmoji(t.sentiment)} {t.sentiment}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Message details panel: 7 columns */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-md flex flex-col h-full overflow-hidden">
                {selectedTicket ? (
                  <div className="flex flex-col h-full">
                    {/* Header Details */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-900">{selectedTicket.title}</h2>
                            <span className="text-[10px] font-mono bg-slate-200 border border-slate-300 px-1.5 py-0.5 rounded text-slate-600 font-bold">{selectedTicket.id}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Customer: <span className="font-bold text-slate-700">{selectedTicket.customerName}</span> ({selectedTicket.customerEmail})
                          </p>
                        </div>
                        {selectedTicket.satisfactionRating && (
                          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-xs text-amber-700 font-bold shadow-sm">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>Rated {selectedTicket.satisfactionRating}/5</span>
                          </div>
                        )}
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center gap-3 text-xs pt-1.5">
                        <div className="flex items-center gap-1.5">
                          <label className="text-slate-400 uppercase tracking-wide text-[9px] font-bold">Status</label>
                          <select 
                            value={selectedStatus}
                            onChange={(e) => {
                              setSelectedStatus(e.target.value);
                              handleUpdateTicketMeta(e.target.value, selectedPriority);
                            }}
                            className="bg-white border border-slate-200 text-slate-800 rounded-xl text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer"
                          >
                            <option value="open">Open</option>
                            <option value="escalated">Escalated</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <label className="text-slate-400 uppercase tracking-wide text-[9px] font-bold">Priority</label>
                          <select 
                            value={selectedPriority}
                            onChange={(e) => {
                              setSelectedPriority(e.target.value);
                              handleUpdateTicketMeta(selectedStatus, e.target.value);
                            }}
                            className="bg-white border border-slate-200 text-slate-800 rounded-xl text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>

                        {selectedTicket.assignee && (
                          <div className="flex items-center gap-1 text-blue-600 font-bold">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Assigned to you</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat History Flow */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                      {selectedTicket.messages.map((m, index) => {
                        const isCustomer = m.role === "customer";
                        return (
                          <div key={m.id || index} className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}>
                            <div className="max-w-[85%]">
                              <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 ${isCustomer ? "justify-start" : "justify-end"}`}>
                                <span className="font-bold text-slate-700">
                                  {isCustomer ? selectedTicket.customerName : m.role === "admin" ? "Lead Coordinator (You)" : "Support AI"}
                                </span>
                                <span>•</span>
                                <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className={`p-4 rounded-2xl text-xs leading-relaxed border shadow-sm ${
                                isCustomer 
                                  ? "bg-white border-slate-200 text-slate-800 rounded-tl-none" 
                                  : m.role === "admin"
                                  ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white border-transparent rounded-tr-none"
                                  : "bg-slate-100 border-slate-200 text-slate-600 rounded-tr-none"
                              }`}>
                                <p className="whitespace-pre-line">{m.content}</p>
                                
                                {isCustomer && m.intent && (
                                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                    <span>Intent: <span className="text-blue-600 font-extrabold">{m.intent}</span></span>
                                    <span>•</span>
                                    <span>Sentiment: <span className="text-slate-700 font-extrabold">{m.sentiment}</span></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Reply Form */}
                    <form onSubmit={handleSendAdminReply} className="p-4 border-t border-slate-100 bg-white">
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={adminReply}
                          disabled={isReplying}
                          onChange={(e) => setAdminReply(e.target.value)}
                          placeholder="Type an official administrative dispatch..."
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400 resize-none leading-relaxed"
                        />
                        <button
                          type="submit"
                          disabled={!adminReply.trim() || isReplying}
                          className="px-5 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all flex items-center justify-center cursor-pointer"
                        >
                          Send Dispatch
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="m-auto text-center py-20 px-4">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700">Select Support Ticket</h3>
                    <p className="text-xs text-slate-500 mt-2.5 max-w-xs mx-auto leading-relaxed">Select any conversation from the support inbox list on the left to read history, update metadata, or dispatch replies directly.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB C: FAQ KNOWLEDGE BASE */}
          {activeTab === "knowledge" && (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full flex-1 overflow-hidden"
            >
              {/* Left Column: Form to create Article: 4 columns */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col overflow-y-auto h-full">
                <div className="pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Insert Grounded Article</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Index new enterprise directives directly into AI context.</p>
                </div>

                <form onSubmit={handleCreateKnowledgeArticle} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Article Title</label>
                    <input 
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., Refund Processing Delay"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Billing">Billing</option>
                      <option value="Account">Account</option>
                      <option value="Orders">Orders</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tags (comma-separated)</label>
                    <input 
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="refund, processing, gateway"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Article Content (Source Truth)</label>
                    <textarea 
                      rows={5}
                      required
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Type official enterprise instruction. This exact content will be segments-parsed, embedded, and queried by the support AI."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 resize-none leading-relaxed transition-colors"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isCreatingArticle}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Index & Embed Article</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Search & List: 8 columns */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-md flex flex-col overflow-hidden h-full">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Indexed Knowledge Articles ({articles.length})</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Semantic documents currently parsed into active RAG databases.</p>
                  </div>
                  
                  {/* Search box */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search active articles..."
                      value={kbSearchQuery}
                      onChange={(e) => setKbSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-48 sm:w-60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-xs text-slate-400 font-bold">No matching documents indexed.</p>
                    </div>
                  ) : (
                    filteredArticles.map((art) => (
                      <div key={art.id} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm relative group hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <span className="text-[10px] px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-bold uppercase tracking-wider">
                            {art.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">ID: {art.id}</span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mb-2">{art.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                          {art.content}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {art.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded font-bold font-mono">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Delete action */}
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="absolute top-4 right-4 p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
