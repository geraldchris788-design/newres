import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, Send, Trash2, ShieldAlert, Cpu, Heart, CheckCircle2 } from "lucide-react";

export default function CoachView() {
  const { user, chatMessages, sendCoachMessage, clearCoachChat } = useApp();
  const [inputText, setInputText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, submitting]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const draftText = inputText;
    setInputText("");
    setSubmitting(true);
    
    try {
      await sendCoachMessage(draftText);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await sendCoachMessage(prompt);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isPremium = user?.subscriptionStatus === "premium";

  // 1. PREMIUM COACT PAYWALL BLOCK
  if (!isPremium) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="relative overflow-hidden p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 h-40 w-40 bg-radial-[circle_at_center,_rgba(16,185,129,0.04)_10%,_transparent_60%]" />
          
          <div className="h-14 w-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold font-mono text-emerald-500 uppercase tracking-widest">Premium Only Access</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Unlock Your Virtual Elite Diet Coach
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Unlock the advanced power-modules of **Gemini 3.5 Flash** for deep conversational biomechanics consulting, individualized water indexes, macro formulas, and nutrition charts.
            </p>
          </div>

          {/* Premium Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 align-left max-w-sm mx-auto space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full macronutrient calorie math templates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Personalized fruit-based micro-recovery logs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Step-by-step calisthenics forms coaching</span>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-slate-400 mb-2">Upgrade on the homepage billing cards to unlock coaching instantly.</p>
            <div className="inline-block p-1 bg-amber-500/10 border border-amber-550/20 rounded font-mono text-[9px] text-amber-500 uppercase tracking-wider">
              Requires Monthly Alpha or Yearly Champion tier
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. COACH CORE PANEL
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-10rem)] flex flex-col justify-between">
      
      {/* Top Coach Ribbon */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-emerald-400 rounded-xl flex items-center justify-center shadow">
            <Cpu className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Coach Alex Premium AI
              <span className="text-[8px] font-bold bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                Active
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">GEMINI 3.5 FLASH COGNITIVE CORE</p>
          </div>
        </div>

        <button
          onClick={clearCoachChat}
          title="Clear chat context"
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/10 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* CHAT LOG AREA */}
      <div className="flex-1 overflow-y-auto my-4 py-4 space-y-4 px-1 scrollbar-thin">
        
        {chatMessages.length === 0 ? (
          <div className="space-y-6 max-w-xl mx-auto py-12 text-center text-slate-500">
            <div className="h-12 w-12 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Start your Fitness Consultation session</h4>
              <p className="text-xs max-w-sm mx-auto">
                Hi! I am Alex. Ask me any specialized questions regarding target weights, metabolic calorie guide formulas, stretching routines and anti-inflammatory recovery.
              </p>
            </div>

            {/* Quick Suggestions grid */}
            <div className="grid sm:grid-cols-2 gap-3 pt-4 text-left">
              {[
                "Suggest an optimized leg-day stretching routine split",
                "Suggest a calculated daily calorie guide for body recomposition",
                "What minerals & fruits should I eat to decrease workout soreness?",
                "How can I transition standard bench pressing into bodyweight pushups?"
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="p-3 text-xs bg-white hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-350 hover:border-emerald-500/40 transition text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div 
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-4xl ${isUser ? "justify-end ml-auto" : "mr-auto"}`}
                >
                  {!isUser && (
                    <div className="h-8 w-8 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow">
                      A
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser 
                      ? "bg-[#1E3A8A] text-white rounded-tr-none px-4" 
                      : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-tl-none whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200"
                  }`}>
                    {/* Render simplistic Markdown paragraphs support without breaking react-markdown dependencies */}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {msg.message.split("\n").map((para, i) => {
                        // Very simple line formatting
                        if (para.startsWith("### ")) {
                          return <h4 key={i} className="text-sm font-bold text-slate-950 dark:text-white mt-3 mb-1 font-mono uppercase tracking-wide">{para.replace("### ", "")}</h4>;
                        }
                        if (para.startsWith("#### ")) {
                          return <h5 key={i} className="text-xs font-bold text-emerald-500 mt-2 mb-1 uppercase font-mono">{para.replace("#### ", "")}</h5>;
                        }
                        if (para.startsWith("- ") || para.startsWith("* ")) {
                          return <li key={i} className="ml-3 mt-1 text-slate-700 dark:text-slate-300 list-disc list-inside">{para.substring(2)}</li>;
                        }
                        return <p key={i} className="mt-1 leading-normal text-slate-700 dark:text-slate-350">{para}</p>;
                      })}
                    </div>
                    
                    <span className="block text-[8px] text-slate-450 dark:text-slate-500 text-right mt-2 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {isUser && (
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-900 text-slate-750 dark:text-slate-300 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300 dark:border-slate-800">
                      U
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic AI Generation loading pulse */}
        {submitting && (
          <div className="flex items-start gap-3 max-w-xl mr-auto">
            <div className="h-8 w-8 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center font-bold text-xs shrink-0 animate-ping" />
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-tl-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-200" />
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-500 tracking-wider ml-1">Alex Coach is generating Calorie indexes...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT CONTROLLER BLOCK */}
      <form onSubmit={handleSend} className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
        <input
          type="text"
          disabled={submitting}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={submitting ? "Alex is computing calories..." : "Ask Coach Alex: e.g. Suggest a fat-recomposting nutrition outline..."}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !inputText.trim()}
          className="p-2.5 rounded-xl bg-[#1E3A8A] text-white hover:bg-[#1E40AF] disabled:bg-slate-200 dark:disabled:bg-slate-900 disabled:text-slate-400 transition flex items-center justify-center shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
