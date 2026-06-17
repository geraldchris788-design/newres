import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Users, Sparkles, Dumbbell, ShieldCheck, UserCheck, Trash2, ArrowUpDown, Key, ToggleLeft, ToggleRight 
} from "lucide-react";

export default function AdminDashboard() {
  const { user, exercises, allSystemUsers, adminTogglePremium, adminUpdateUserTier } = useApp();
  
  const [userQuery, setUserQuery] = useState("");
  const [exerciseQuery, setExerciseQuery] = useState("");

  // Safeguard view access
  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xl space-y-4">
          <div className="h-12 w-12 bg-rose-500/10 text-rose-500 border border-rose-550/20 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-rose-500">Access Restricted</h4>
          <p className="text-xs text-slate-500">
            This module represents the primary administrative dashboard, accessible strictly to the admin email profile (<code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded font-bold text-slate-950 dark:text-white">alexfitnesshub@gmail.com</code>).
          </p>
        </div>
      </div>
    );
  }

  // Aggregate stats calculations
  const totalUsers = allSystemUsers.length;
  const premiumCount = allSystemUsers.filter(u => u.subscriptionStatus === "premium").length;
  const estimatedMonthlyRevenue = premiumCount * 19999;
  const totalPremiumExercises = exercises.filter(e => e.isPremium).length;

  const filteredUsers = allSystemUsers.filter(u => 
    u.displayName.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userQuery.toLowerCase())
  );

  const filteredExercises = exercises.filter(e => 
    e.name.toLowerCase().includes(exerciseQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(exerciseQuery.toLowerCase())
  );

  const handleToggleUserPremium = (uid: string, currentStatus: "free" | "premium") => {
    const nextStatus = currentStatus === "premium" ? "free" : "premium";
    const nextTier = nextStatus === "premium" ? "monthly" : "none";
    adminUpdateUserTier(uid, nextStatus, nextTier);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Title Panel */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-emerald-400">System Core Security Panel</span>
          <h2 className="text-2xl font-black tracking-tight mt-1 sm:text-3xl font-sans">
            AlexFitnessHub Administrative Terminal
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Perform global overrides, toggle exercise premium states, and directly promote student athletes to VIP tiers.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono font-bold uppercase">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Alex Admin Active
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
          <Users className="w-5 h-5 text-blue-500 mb-2" />
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Total Active Users</span>
          <h4 className="text-2xl font-black text-slate-950 dark:text-white mt-1">{totalUsers}</h4>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
          <Sparkles className="w-5 h-5 text-emerald-500 mb-2" />
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Premium Members</span>
          <h4 className="text-2xl font-black text-emerald-400 mt-1">{premiumCount}</h4>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
          <span className="text-emerald-500 font-bold text-xs font-mono block mb-2">₦</span>
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Monthly Revenue Rate</span>
          <h4 className="text-2xl font-black text-slate-950 dark:text-white mt-1">₦{estimatedMonthlyRevenue.toLocaleString()}</h4>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
          <Dumbbell className="w-5 h-5 text-violet-500 mb-2" />
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Premium Exercises</span>
          <h4 className="text-2xl font-black text-slate-950 dark:text-white mt-1">{totalPremiumExercises}</h4>
        </div>

      </div>

      {/* ADMIN WORKBenches */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ACTIVE USER DIRECTORY OVERRIDES */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Active Athlete Profiles</h3>
              <p className="text-[11px] text-slate-500 leading-normal">Database student record catalog with direct account upgrade override toggles.</p>
            </div>
            
            <input
              type="text"
              placeholder="Filter email / names..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 max-w-[200px]"
            />
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-500">No matching athlete records identified.</p>
            ) : (
              filteredUsers.map((userProfile) => {
                const isUserPremium = userProfile.subscriptionStatus === "premium";
                return (
                  <div key={userProfile.uid} className="p-3.5 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-slate-50 dark:bg-slate-900/40 flex justify-between items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {userProfile.displayName}
                        {userProfile.role === "admin" && (
                          <span className="text-[8px] font-bold bg-blue-500/10 text-blue-500 px-1 py-0.2 rounded uppercase font-mono">ROOT</span>
                        )}
                      </h5>
                      <span className="text-[10px] text-slate-500 font-mono tracking-wide">{userProfile.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono uppercase font-bold py-0.5 px-1.5 rounded ${
                        isUserPremium 
                          ? "bg-emerald-500/15 text-emerald-500" 
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}>
                        {userProfile.subscriptionStatus || "free"}
                      </span>
                      
                      {/* Only toggle non-root admin accounts */}
                      {userProfile.role !== "admin" && (
                        <button
                          onClick={() => handleToggleUserPremium(userProfile.uid, userProfile.subscriptionStatus)}
                          className="p-1 px-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white text-[10px] font-bold rounded uppercase font-mono transition"
                        >
                          Toggle Sub
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ROUTINE LOCK AND RELEASE OVERRIDES */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Database Exercises</h3>
              <p className="text-[11px] text-slate-500 leading-normal">Toggle exercises as standard Free or locked under Premium.</p>
            </div>
            
            <input
              type="text"
              placeholder="Filter names..."
              value={exerciseQuery}
              onChange={(e) => setExerciseQuery(e.target.value)}
              className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500 max-w-[150px]"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredExercises.map((ex) => (
              <div key={ex.id} className="p-2.5 border border-slate-100 dark:border-slate-900 rounded-lg flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                <div className="truncate max-w-[200px]">
                  <h5 className="font-semibold text-slate-900 dark:text-slate-200 truncate">{ex.name}</h5>
                  <span className="text-[9px] text-slate-400 font-mono italic">{ex.category}</span>
                </div>

                <button
                  onClick={() => adminTogglePremium(ex.id)}
                  title={ex.isPremium ? "Click to set standard FREE" : "Click to lock under PREMIUM"}
                  className="flex items-center gap-1.5 focus:outline-none"
                >
                  {ex.isPremium ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-bold">
                      <ToggleRight className="w-6 h-6 text-emerald-500" />
                      Premium
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                      <ToggleLeft className="w-6 h-6" />
                      Standard Lite
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
