/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { MessageSquare, ShieldAlert, Sparkles, HelpCircle, ArrowLeft } from "lucide-react";
import { CustomerWorkspace } from "./components/CustomerWorkspace";
import { AdminWorkspace } from "./components/AdminWorkspace";

export default function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<"customer" | "admin">("customer");
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <div id="app-workspace-root" className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Premium Master Header Navigation */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-4 sm:px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          
          {/* Logo Brand Frame or Global Back Button */}
          <div className="flex items-center gap-2.5 justify-center md:justify-start min-h-[40px]">
            {activeWorkspace === "customer" && isRegistered ? (
              <button
                onClick={() => setIsRegistered(false)}
                className="flex items-center justify-center w-9 h-9 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-sm"
                title="Return to login screen"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
              </button>
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/10 flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xs font-extrabold tracking-wider text-slate-800 font-mono uppercase">SupportSuite</span>
                </div>
              </>
            )}
          </div>

          {/* Centered Main Title Header */}
          <div className="text-center flex flex-col items-center justify-center">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
              AI Customer Support Assistant
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5 justify-center">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              Powered by Gemini AI + RAG
            </p>
          </div>

          {/* Workspace Switches */}
          <div className="flex justify-center md:justify-end">
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveWorkspace("customer")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeWorkspace === "customer"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Customer Center</span>
              </button>

              <button
                onClick={() => setActiveWorkspace("admin")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeWorkspace === "admin"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Agent Command Desk</span>
              </button>
            </div>
          </div>
          
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeWorkspace === "customer" ? (
          <CustomerWorkspace isRegistered={isRegistered} setIsRegistered={setIsRegistered} />
        ) : (
          <AdminWorkspace />
        )}
      </main>

      {/* Footer System Credits */}
      <footer className="py-5 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5 text-slate-400">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>AI Customer Support System • B.Tech Capstone Project Portfolio</span>
          </div>
          <div className="font-mono text-[10px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-slate-600 shadow-sm">
            Node.js • Gemini 3.5 Flash • Vector Similarity Embeddings
          </div>
        </div>
      </footer>
      
    </div>
  );
}
