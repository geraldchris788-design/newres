import React, { useState, useEffect } from "react";
import { Sparkles, RotateCw, Lightbulb, Activity, HeartPulse, ShieldCheck, ClipboardCheck } from "lucide-react";
import { ActivityLog } from "../types";

interface QuickTipProps {
  activityLogs: ActivityLog[];
  goal: string;
}

export default function QuickTipAdvocate({ activityLogs, goal }: QuickTipProps) {
  const [tip, setTip] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuickTip = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/quick-tip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          logs: activityLogs,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTip(data.text);
      } else {
        throw new Error(data.error || "Failed to retrieve suggestion");
      }
    } catch (err: any) {
      console.error("Quicktip fetch error:", err);
      setError("AI coach is compiling energy. Click to refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickTip();
  }, [activityLogs, goal]);

  const latestLog = activityLogs[0];

  return (
    <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/10 dark:from-slate-950 dark:to-emerald-950/25 p-6 rounded-3xl border border-slate-200 dark:border-emerald-500/10 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-900">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">
                AI Form & Recovery Advisor
              </h3>
              <span className="text-[8px] font-mono font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded leading-none border border-emerald-500/20 uppercase">
                Gemini Active
              </span>
            </div>
            <p className="text-[10px] text-slate-505 dark:text-slate-400">
              Personalized athletic tips generated dynamically from your recent training patterns.
            </p>
          </div>
        </div>

        <button
          onClick={fetchQuickTip}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-mono font-bold uppercase text-[9px] tracking-wider border border-slate-200 dark:border-slate-800 rounded-xl transition cursor-pointer"
        >
          <RotateCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Tip</span>
        </button>
      </div>

      {loading ? (
        <div className="py-4 space-y-3">
          <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-md w-3/4 animate-pulse" />
          <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-md w-5/6 animate-pulse" />
          <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-md w-2/3 animate-pulse" />
        </div>
      ) : error ? (
        <div className="py-3 text-center">
          <p className="text-xs text-rose-500 font-mono font-semibold">{error}</p>
          <button
            onClick={fetchQuickTip}
            className="mt-2 text-[10px] text-emerald-500 hover:underline font-mono uppercase font-bold"
          >
            Retry compilation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            {/* Convert simple markdown bullet points cleanly */}
            {tip.split("\n").map((line, idx) => {
              if (line.trim().startsWith("###")) {
                return (
                  <h4 key={idx} className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-emerald-500 shrink-0" />
                    {line.replace("###", "").trim()}
                  </h4>
                );
              }
              if (line.trim().startsWith("1.") || line.trim().startsWith("2.") || line.trim().startsWith("3.")) {
                const parts = line.split(":**");
                if (parts.length > 1) {
                  const numAndTitle = parts[0].replace(/^\d+\.\s+\*\*/, "").trim();
                  const remainingText = parts.slice(1).join(":**").trim();
                  return (
                    <div key={idx} className="flex gap-2.5 items-start bg-white/40 dark:bg-slate-900/20 p-2.5 rounded-xl border border-slate-150/50 dark:border-slate-900/40 mb-2">
                      <span className="h-5 w-5 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-mono font-black shrink-0">
                        {line.match(/^\d+/)?.[0]}
                      </span>
                      <p className="text-[11px] leading-relaxed text-slate-650 dark:text-slate-350">
                        <strong className="text-slate-855 dark:text-white uppercase font-bold text-[10.5px] block sm:inline mr-1">{numAndTitle}:</strong>
                        {remainingText}
                      </p>
                    </div>
                  );
                }
              }
              if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
                return (
                  <div key={idx} className="flex gap-2 items-start pl-2 mb-1.5">
                    <span className="text-emerald-500 pt-0.5">•</span>
                    <p className="text-[11.5px] text-slate-650 dark:text-slate-350 leading-relaxed">{line.replace(/^[-*]\s*/, "").replace(/\*\*/g, "")}</p>
                  </div>
                );
              }
              if (!line.trim()) return null;
              return <p key={idx} className="mb-2 text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-normal">{line.replace(/\*\*/g, "")}</p>;
            })}
          </div>

          {/* Context indicator footer strip */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-900 text-[9px] font-mono text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>
                {latestLog 
                  ? `Recent Session: ${latestLog.exerciseName} (${latestLog.reps} reps @ ${latestLog.weight} kg)` 
                  : "Status: Awaiting first logged exercise"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8.5px] text-emerald-500/75">
              <ShieldCheck className="w-3 h-3" />
              <span>Telemetry Connected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
