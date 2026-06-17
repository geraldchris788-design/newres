import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  User, Weight, Sparkles, PlusCircle, CheckCircle, Calendar, Trash2, ShieldAlert, Award, ChevronRight, Bookmark,
  Dumbbell, Utensils, MessageSquare, ShieldCheck, Home, X, ChevronDown, ChevronUp, Lock, CheckCircle2, Clipboard,
  ArrowLeft, Info, Check, Bell, BookOpen, Clock, Activity, CheckSquare
} from "lucide-react";
import CustomProgramBuilder from "./CustomProgramBuilder";
import WorkoutVisual from "./WorkoutVisual";
import QuickTipAdvocate from "./QuickTipAdvocate";

interface DashboardProps {
  setView?: (view: string) => void;
}

export default function DashboardView({ setView }: DashboardProps) {
  const { 
    user, 
    savedWorkouts, 
    activityLogs, 
    weightLogs, 
    transactions,
    addWeightLogAction, 
    updateProfileDetails,
    cancelSubscription,
    updateWaterIntake,
    exercises,
    customPrograms,
    deleteCustomProgram,
    logWorkoutCompletion,
    toggleSaveWorkout,
    chatMessages
  } = useApp();


  // Dismissed notifications local retention state
  const [dismissedNotifs, setDismissedNotifs] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`fit_dismissed_notifs_${user?.uid || "guest"}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleDismissNotif = (id: string) => {
    const updated = [...dismissedNotifs, id];
    setDismissedNotifs(updated);
    try {
      localStorage.setItem(`fit_dismissed_notifs_${user?.uid || "guest"}`, JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage item saving error:", err);
    }
  };

  const handleResetNotifications = () => {
    setDismissedNotifs([]);
    try {
      localStorage.removeItem(`fit_dismissed_notifs_${user?.uid || "guest"}`);
    } catch (err) {
      console.warn("Storage reset item error:", err);
    }
  };

  // Custom workout program builder states
  const [isBuildingProgram, setIsBuildingProgram] = useState(false);
  const [expandedProgId, setExpandedProgId] = useState<string | null>(null);
  
  // Technique detail overlay states
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [loggedReps, setLoggedReps] = useState("12");
  const [loggedWeight, setLoggedWeight] = useState("80");
  const [loggedNotes, setLoggedNotes] = useState("");
  const [logSuccess, setLogSuccess] = useState(false);

  const selectedExercise = React.useMemo(() => {
    if (!selectedExerciseId) return null;
    return exercises.find(ex => ex.id === selectedExerciseId) || null;
  }, [selectedExerciseId, exercises]);

  const handleOpenDetail = (exId: string) => {
    setSelectedExerciseId(exId);
    setLogSuccess(false);
    setLoggedNotes("");
  };

  const handleLogCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;
    logWorkoutCompletion(
      selectedExercise.id,
      parseInt(loggedReps) || 0,
      parseFloat(loggedWeight) || 0,
      loggedNotes
    );
    setLogSuccess(true);
    setTimeout(() => {
      setLogSuccess(false);
      setSelectedExerciseId(null);
    }, 1800);
  };

  const [weightInput, setWeightInput] = useState("");
  const [fatInput, setFatInput] = useState("");
  const [editGoals, setEditGoals] = useState(user?.fitnessGoals || "Weight Loss & Muscle Gain");
  const [editHeight, setEditHeight] = useState(user?.height?.toString() || "178");
  const [editWeight, setEditWeight] = useState(user?.weight?.toString() || "80");
  const [editGender, setEditGender] = useState(user?.gender || "Male");
  
  const [showStatusMsg, setShowStatusMsg] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowStatusMsg("");
    try {
      await updateProfileDetails({
        fitnessGoals: editGoals,
        height: parseFloat(editHeight) || undefined,
        weight: parseFloat(editWeight) || undefined,
        gender: editGender
      });
      setShowStatusMsg("Profile details dynamically updated successfully!");
      setTimeout(() => setShowStatusMsg(""), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddWeightLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;
    try {
      await addWeightLogAction(
        parseFloat(weightInput),
        fatInput ? parseFloat(fatInput) : undefined
      );
      setWeightInput("");
      setFatInput("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Extract saved exercises objects
  const bookmarkedExercises = exercises.filter(e => savedWorkouts.includes(e.id));

  // Dynamic SVG Chart Coordinates Builder
  const chartPoints = React.useMemo(() => {
    if (weightLogs.length === 0) return "";
    
    // SVG Dimensions: 500w x 150h
    const width = 500;
    const height = 150;
    const padding = 20;
    
    const weights = weightLogs.map(w => w.weight);
    const maxW = Math.max(...weights) + 2;
    const minW = Math.min(...weights) - 2;
    const rangeW = maxW - minW || 1;

    const points = weightLogs.map((log, index) => {
      const x = padding + (index / (weightLogs.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - ((log.weight - minW) / rangeW) * (height - padding * 2);
      return `${x},${y}`;
    });

    return points.join(" ");
  }, [weightLogs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ALWAYS-VISIBLE TOP NAVIGATION MENU (Instead of 3 line / hamburger nav) */}
      <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-emerald-400 to-sky-400" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-950 dark:text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Interactive Hub Menu
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Instant workspace controller — skip the mobile 3-line hamburger menu
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl self-start md:self-auto">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Session Focus: <strong className="text-slate-900 dark:text-white font-extrabold">Active Profile</strong>
            </span>
          </div>
        </div>

        {/* Modular responsive buttons block */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          
          <button
            type="button"
            onClick={() => setView?.("home")}
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 text-left transition-all duration-200 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-850 group-hover:bg-emerald-500/10 transition-colors">
              <Home className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                Homepage
              </div>
              <span className="text-[9px] text-slate-400 font-sans hidden sm:block">Public Hub</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setView?.("library")}
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 text-left transition-all duration-200 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-850 group-hover:bg-emerald-500/10 transition-colors">
              <Dumbbell className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                Workouts
              </div>
              <span className="text-[9px] text-slate-400 font-sans hidden sm:block">Routines & Sets</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setView?.("nutrition")}
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 text-left transition-all duration-200 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-850 group-hover:bg-rose-500/10 transition-colors">
              <Utensils className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                Nutrition
              </div>
              <span className="text-[9px] text-slate-400 font-sans hidden sm:block">Meal Configurator</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setView?.("daily-plan")}
            className="flex items-center gap-3 p-3 rounded-2xl border border-[#10B981]/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-all duration-200 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 transition-colors">
              <Calendar className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-emerald-555 dark:text-emerald-400 font-mono">
                My Plan
              </div>
              <span className="text-[9px] text-emerald-555/80 dark:text-emerald-500/80 font-sans hidden sm:block">Daily Schedules</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setView?.("coach")}
            className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-all duration-200 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 transition-colors">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-[#10B981] font-mono">
                AI Coach
              </div>
              <span className="text-[9px] text-emerald-500/80 font-sans hidden sm:block">AI Optimization</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setView?.("community")}
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 text-left transition-all duration-200 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-850 group-hover:bg-sky-500/10 transition-colors">
              <MessageSquare className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                Community
              </div>
              <span className="text-[9px] text-slate-400 font-sans hidden sm:block">Discuss & Post</span>
            </div>
          </button>

          {/* ACTIVE VIEW INDICATOR - Dashboard (Highlighted) */}
          <button
            type="button"
            className="flex items-center gap-3 p-3 rounded-2xl border-2 border-emerald-500 bg-slate-900 dark:bg-emerald-950/40 text-left transition-all duration-200 shadow-md shadow-emerald-500/10 scale-[1.01]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15">
              <User className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-white dark:text-emerald-405 font-mono">
                Dashboard
              </div>
              <span className="text-[9px] text-slate-300 dark:text-emerald-500/80 font-sans font-medium hidden sm:block">Active View</span>
            </div>
          </button>

        </div>

        {/* Conditional Admin direct button for admins */}
        {user?.role === "admin" && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-150 dark:border-slate-900 flex justify-end">
            <button
              type="button"
              onClick={() => setView?.("admin")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-rose-500 text-[10px] font-mono uppercase tracking-widest transition-all duration-200 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Security Console Panel • Enter Admin CPU
            </button>
          </div>
        )}
      </div>

      {/* 1. HERO PROFILE HEADING */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 bg-radial-[circle_at_center,_rgba(37,99,235,0.03)_10%,_transparent_60%]" />
        
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 p-0.5 shadow-lg">
            <div className="h-full w-full bg-slate-100 dark:bg-slate-900 rounded-[14px] flex items-center justify-center font-bold text-2xl text-blue-600 dark:text-emerald-400 font-mono">
              {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "AT"}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {user?.displayName}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              ATHLETE ID: <span className="text-blue-500">{user?.uid.substring(0, 8)}...</span>
            </p>
          </div>
        </div>

        {/* Subscription Status Board */}
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/40 text-left min-w-[200px]">
          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">MEMBERSHIP:</span>
          {user?.subscriptionStatus === "premium" ? (
            <div className="mt-1">
              <span className="text-emerald-500 font-bold text-sm tracking-wide flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                PREMIUM ACTIVE
              </span>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                CYCLE: {user.subscriptionTier?.toUpperCase()}
              </p>
              <button 
                onClick={cancelSubscription}
                className="text-[10px] text-rose-500 hover:underline hover:text-rose-600 font-mono mt-2 uppercase font-semibold"
              >
                Cancel Auto-Renewal
              </button>
            </div>
          ) : (
            <div className="mt-1">
              <span className="text-slate-500 font-bold text-sm">FREE ACCESS</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Explore standard routines only</p>
            </div>
          )}
        </div>
      </div>

      {/* PSYCHOLOGICAL ENGAGEMENT BANNER (PREMIUM CONTEXT) */}
      <div id="premium-psychology-metric-banner" className="relative group overflow-hidden rounded-3xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 shadow-sm">
        {/* Ambient neon decorative background elements */}
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl group-hover:scale-110 transition-all duration-700 pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl group-hover:scale-110 transition-all duration-700 pointer-events-none" />
        
        {user?.subscriptionStatus === "premium" ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Elite Member Hub Activated
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                Your Raw Access Includes <span className="text-emerald-500 dark:text-emerald-400">{exercises.length} HD Biomechanical Routines</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                You have completely removed biological guesswork from your progression loops. Every single dynamic video, isometric peak cue, and certified meal schedule is fully active. Let's make today's metabolic session count.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView?.("library")}
              className="px-6 py-3 shrink-0 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-widest font-mono shadow-sm transition hover:scale-[1.02] duration-200"
            >
              Launch Routines
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShieldAlert className="w-3.5 h-3.5" />
                Performance Constraint Detected ({exercises.filter(e => e.isPremium).length} Locked Streams)
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                Are you training for elite results, or just wasting metabolic energy?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-semibold">
                Your current muscle density and cardiac endurance is the exact visual sum of your previous physical boundaries. Doing the same standard exercises while expecting elite transformations is a mathematically failed strategy. True aesthetic reconstruction is not about training harder—it's about removing the biological guesswork. Unlock <strong className="text-emerald-600 dark:text-emerald-450 font-extrabold">{exercises.filter(e => e.isPremium).length} customized premium exercises</strong> and meal blueprints today.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 font-mono text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><span className="text-emerald-500">✔</span> {exercises.filter(e => e.isPremium).length}+ Elite Bio-drills Active</span>
                <span className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Custom Trajectory Meal Schedules</span>
                <span className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Private Telemetry Dashboard Access</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setView?.("home")}
              className="px-6 py-3.5 shrink-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs uppercase tracking-widest font-mono shadow-md shadow-emerald-500/10 transition hover:scale-[1.02] duration-200"
            >
              Claim Premium Access
            </button>
          </div>
        )}
      </div>

      {/* --- RECONSTRUCTED DYNAMIC NOTIFICATION CENTER, ACTIVITY CHECKLIST, & APPLICATION BLUEPRINT --- */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: LIVE RUNTIME NOTIFICATIONS & CHECKLIST */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* A. NOTIFICATION CENTER (LIVE ALERTS BOX) */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-amber-500/10 dark:bg-amber-500/15 rounded-xl flex items-center justify-center text-amber-500">
                  <Bell className="w-4 h-4 animate-swing" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Athlete Notifications Center
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Real-time biomechanical and hydration triggers</p>
                </div>
              </div>
              
              {dismissedNotifs.length > 0 && (
                <button
                  onClick={handleResetNotifications}
                  className="text-[9px] font-mono uppercase bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-205 dark:border-slate-800 px-2 py-1 rounded-lg transition"
                >
                  Reload Dismissed
                </button>
              )}
            </div>

            {(() => {
              const todaysDateStr = new Date().toISOString().substring(0, 10);
              const customPremiumCount = exercises.filter(e => e.isPremium).length;
              
              // Define all raw alert criteria
              const rawAlerts = [
                {
                  id: "notif-premium-tier",
                  title: user?.subscriptionStatus === "premium" ? "Premium Status: Elite Bio-Access Active" : "Performance Constraint Level Active",
                  message: user?.subscriptionStatus === "premium" 
                    ? `Elite unlocked! You have persistent access to all ${exercises.length} exercises (including ${customPremiumCount} premium-exclusive drills).`
                    : `Your account is on Free access. ${customPremiumCount} of our ${exercises.length} exclusive biomechanical drill instructions are currently locked.`,
                  type: user?.subscriptionStatus === "premium" ? "success" : "warning",
                  icon: user?.subscriptionStatus === "premium" ? "⭐" : "🔒"
                },
                {
                  id: "notif-hydration-balance",
                  title: "Anabolic Hydration Snapshot",
                  message: (user?.waterIntakeToday || 0) < (user?.waterGoal || 2600)
                    ? `Fluid deficit flagged. Logged ${user?.waterIntakeToday || 0} ML of your ${user?.waterGoal || 2600} ML quota. Add water below to prevent cardiovascular stagnation.`
                    : `Optimal cellular salinity! Your water goal of ${user?.waterGoal || 2600} ML is fully completed for today.`,
                  type: (user?.waterIntakeToday || 0) < (user?.waterGoal || 2600) ? "info" : "success",
                  icon: "💧"
                },
                {
                  id: "notif-consistency-chain",
                  title: "Consistency Chain Index",
                  message: activityLogs.some(l => l.date.substring(0, 10) === todaysDateStr)
                    ? "Great alignment! Your daily performance routine target has been logged and synchronized."
                    : "No completed workout sets have been logged today. Open any exercise in your library to records reps and protect your streak.",
                  type: activityLogs.some(l => l.date.substring(0, 10) === todaysDateStr) ? "success" : "info",
                  icon: "🏋️"
                },
                {
                  id: "notif-weight-snapshot",
                  title: "Biometrics Index Tracking",
                  message: weightLogs.some(l => l.date === todaysDateStr)
                    ? `Today's physical bodyweight (${weightLogs.find(l => l.date === todaysDateStr)?.weight} kg) is captured.`
                    : "Today's reference weight scale snapshot is pending. Input your weight in the trajectory board below.",
                  type: weightLogs.some(l => l.date === todaysDateStr) ? "success" : "warning",
                  icon: "⚖️"
                },
                {
                  id: "notif-custom-split",
                  title: "Structured Split Protocol Alert",
                  message: customPrograms.length > 0
                    ? `You have active custom program splits configured: "${customPrograms[0].name}" leads your schedule.`
                    : "You haven't built custom splits! Design custom splits to align multi-exercise patterns tailored for your biometrics.",
                  type: customPrograms.length > 0 ? "success" : "info",
                  icon: "📋"
                }
              ];

              // Filter out dismissed notification triggers
              const activeAlerts = rawAlerts.filter(a => !dismissedNotifs.includes(a.id));

              if (activeAlerts.length === 0) {
                return (
                  <div className="p-5 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-900 space-y-2">
                    <span className="text-2xl block">🎉</span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                      All Systems Clear
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans max-w-sm mx-auto">
                      You have read or dismissed all daily diagnostic notifications. Complete your checklist checkpoints to keep physical parameters fully optimal!
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {activeAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 relative transition-all duration-200 hover:scale-[1.005] ${
                        alert.type === "success" 
                          ? "bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/10 text-emerald-800 dark:text-emerald-400"
                          : alert.type === "warning"
                          ? "bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/15 text-amber-800 dark:text-amber-400"
                          : alert.type === "info"
                          ? "bg-blue-500/5 dark:bg-blue-950/10 border-blue-500/10 text-blue-800 dark:text-blue-400"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-800"
                      }`}
                    >
                      <span className="text-lg shrink-0 mt-0.5">{alert.icon}</span>
                      <div className="flex-1 pr-6 text-left">
                        <h4 className="text-xs font-extrabold uppercase font-mono tracking-tight leading-snug">
                          {alert.title}
                        </h4>
                        <p className="text-[10.5px] font-medium leading-relaxed mt-0.5 opacity-90">
                          {alert.message}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDismissNotif(alert.id)}
                        className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* B. DAILY REMINDERS & ACTIVITIES CHECKLIST */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />
            
            {(() => {
              const todaysDateStr = new Date().toISOString().substring(0, 10);
              
              // Evaluate actual real-time checklist status
              const hasHydratedCheck = (user?.waterIntakeToday || 0) >= (user?.waterGoal || 2600);
              const didLogWorkoutCheck = activityLogs.some(l => l.date.substring(0, 10) === todaysDateStr);
              const didLogWeightCheck = weightLogs.some(l => l.date === todaysDateStr);
              const hasCustomSplitCheck = customPrograms.length > 0;
              const didBriefWithCoachCheck = chatMessages && chatMessages.some(msg => msg.timestamp && msg.timestamp.substring(0, 10) === todaysDateStr);

              const checklistItems = [
                {
                  id: "check-water",
                  label: "Meet Hydro Quota Goal",
                  value: `${user?.waterIntakeToday || 0} / ${user?.waterGoal || 2600} ML logged`,
                  status: hasHydratedCheck,
                  desc: "Keeps skeletal fibers ready for muscle hypertrophy."
                },
                {
                  id: "check-workout",
                  label: "Log Completed Exercises",
                  value: didLogWorkoutCheck ? "Completed & Synced" : "0 sets stored today",
                  status: didLogWorkoutCheck,
                  desc: "Record your lifts or cardiovascular routine inside public catalog."
                },
                {
                  id: "check-weight",
                  label: "Metric Scale Snapshot",
                  value: didLogWeightCheck ? "Captured" : "Add scale reference below",
                  status: didLogWeightCheck,
                  desc: "Recalibrates metabolic resting equations accurately."
                },
                {
                  id: "check-split",
                  label: "Define Custom Training Splits",
                  value: hasCustomSplitCheck ? "Splits active" : "0 splits configured",
                  status: hasCustomSplitCheck,
                  desc: "Build muscle groupings specific to personal recovery thresholds."
                },
                {
                  id: "check-coach",
                  label: "Sync with Alex Coach AI Today",
                  value: didBriefWithCoachCheck ? "Synced" : "Pending daily coaching briefing",
                  status: didBriefWithCoachCheck,
                  desc: "Align dietary targets with active LLM parameters."
                }
              ];

              const completedCount = checklistItems.filter(item => item.status).length;
              const percent = Math.round((completedCount / checklistItems.length) * 100);

              return (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-rose-500/10 pb-0.5">
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                        Daily Athlete Activity Reminders
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Persistent real checklist synced with your active database</p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#10B981] font-mono leading-none">
                        Checklist Completion: {completedCount}/{checklistItems.length}
                      </span>
                    </div>
                  </div>

                  {/* Real-time bar percentage */}
                  <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-850">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Checklist grid list */}
                  <div className="space-y-2.5">
                    {checklistItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all duration-150 ${
                          item.status 
                            ? "bg-emerald-500/[0.02] border-emerald-500/15" 
                            : "bg-slate-50/50 dark:bg-slate-900/10 border-slate-150 dark:border-slate-900"
                        }`}
                      >
                        <div className="flex gap-3 items-center text-left">
                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border ${
                            item.status 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                              : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                          }`}>
                            {item.status ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className={`text-xs font-black uppercase font-sans tracking-tight leading-none ${
                              item.status ? "text-emerald-500" : "text-slate-800 dark:text-slate-200"
                            }`}>
                              {item.label}
                            </span>
                            <p className="text-[9.5px] text-slate-505 dark:text-slate-400 mt-0.5 italic leading-tight">{item.desc}</p>
                          </div>
                        </div>

                        <span className={`text-[9px] font-mono font-bold uppercase shrink-0 px-2 py-0.5 rounded ${
                          item.status 
                            ? "bg-emerald-500/10 text-emerald-500" 
                            : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                        }`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {percent === 100 && (
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-2xl text-center text-white text-xs font-black uppercase font-mono tracking-widest leading-none py-3.5 animate-pulse shadow-md">
                      🏆 Perfect Trajectory Achieved for Today! Standard Maintained.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

        </div>

        {/* RIGHT COLUMN: SITE DESIGN FLOW & DETAILED USAGE HANDBOOK */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between h-full">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-sky-400" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-blue-500/10 dark:bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-500">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Alex Fitness Hub Handbook
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Website benefits and how to use guide</p>
                </div>
              </div>

              {/* Total Premium items details */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850/60 rounded-2xl flex items-center justify-between text-left">
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Interactive Asset Library:</span>
                  <p className="text-sm font-black text-[#1E3A8A] dark:text-emerald-400 uppercase tracking-tight leading-tight mt-0.5">
                    {exercises.length} Total Exercises Mapped
                  </p>
                </div>
                <div className="bg-[#10B981]/15 text-[#10B981] border border-emerald-500/20 rounded-xl px-3 py-1 text-right">
                  <span className="text-[8px] font-mono block font-black leading-none">PREMIUM DRILLS</span>
                  <strong className="text-base font-extrabold font-mono leading-none flex items-center justify-end gap-0.5">
                    ★ {exercises.filter(e => e.isPremium).length}
                  </strong>
                </div>
              </div>

              {/* Usage Guide details */}
              <div className="space-y-3.5 text-xs text-left">
                
                <div className="group border-b border-slate-100 dark:border-slate-900 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-extrabold uppercase text-[11px] text-slate-850 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                    <span className="text-[#10B981]">01 •</span> Workouts Catalog & Tracker
                  </h4>
                  <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                    <strong>Benefit:</strong> Guides muscle hypertrophy using precise step-by-step starting and peak cues.
                  </p>
                  <p className="text-[10.5px] text-slate-450 italic mt-0.5 font-mono">
                    <strong>How to Use:</strong> Click Workouts tab, click desired exercise, inspect instructions and target anatomy maps, and input sets directly into log form.
                  </p>
                </div>

                <div className="group border-b border-slate-100 dark:border-slate-900 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-extrabold uppercase text-[11px] text-slate-850 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                    <span className="text-[#10B981]">02 •</span> AI Coach Alignment Consultation
                  </h4>
                  <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                    <strong>Benefit:</strong> Instant server-side Gemini powered smart alignment regarding meal planning, recoveries and sets advice.
                  </p>
                  <p className="text-[10.5px] text-slate-450 italic mt-0.5 font-mono">
                    <strong>How to Use:</strong> Head to AI Coach view in hub menu. Input custom queries detailing current fatigue layers to calibrate customized recovery guidelines.
                  </p>
                </div>

                <div className="group border-b border-slate-100 dark:border-slate-900 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-extrabold uppercase text-[11px] text-slate-850 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                    <span className="text-[#10B981]">03 •</span> Interactive Video Stream Search
                  </h4>
                  <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                    <strong>Benefit:</strong> Resolves missing videos into real-time matching YouTube streams using live API matching.
                  </p>
                  <p className="text-[10.5px] text-slate-450 italic mt-0.5 font-mono">
                    <strong>How to Use:</strong> Access the Videos navigation tab, insert focus keys like "shoulder", or apply predefined tags to instantly start playing real execution videos.
                  </p>
                </div>

                <div className="group border-b border-slate-100 dark:border-slate-900 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-extrabold uppercase text-[11px] text-slate-850 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                    <span className="text-[#10B981]">04 •</span> Nutrition & Calorie Planner
                  </h4>
                  <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                    <strong>Benefit:</strong> Dynamic tracker indicating active hydration index, baseline calorie limits and custom food schedules.
                  </p>
                  <p className="text-[10.5px] text-slate-450 italic mt-0.5 font-mono">
                    <strong>How to Use:</strong> Tap Nutrition from header. View customized macros targets, calculate custom meal recipes, and track hydration status continuously.
                  </p>
                </div>

                <div className="group border-b border-slate-100 dark:border-slate-900 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-extrabold uppercase text-[11px] text-slate-850 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                    <span className="text-[#10B981]">05 •</span> Community Forum & Milestones
                  </h4>
                  <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                    <strong>Benefit:</strong> Connect, review success stories, append transformation photos and comment on posts.
                  </p>
                  <p className="text-[10.5px] text-slate-450 italic mt-0.5 font-mono">
                    <strong>How to Use:</strong> Open Community route, search transformation success boards or submit your own performance snapshots.
                  </p>
                </div>

              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center gap-3.5 mt-4 self-stretch text-left">
              <span className="text-xl">💡</span>
              <p className="text-[10px] text-slate-500 leading-snug font-mono">
                <strong>Pro Coach Tip:</strong> Log exercises and biometrics unbroken to trigger high-level achievements automatically!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 2. CORE STATS BENTO ROW (Water tracker, Consistency Streaks, Badges) */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* WATER TRACKER COMPONENT */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase font-mono tracking-widest flex items-center gap-1.5">
                <span className="text-sky-555 font-bold">💧</span> Hydration Balance
              </h4>
              <span className="text-[10px] font-mono font-bold text-sky-500">
                {user?.waterIntakeToday || 0} / {user?.waterGoal || 2600} ML
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mb-4 leading-normal">
              Keep muscles fully hydrated to peak overall hypertrophy and lift heavier.
            </p>

            {/* Cylinder progress animation filled water */}
            <div className="relative w-full h-10 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-850">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-550 flex items-center justify-end px-3" 
                style={{ width: `${Math.min(100, ((user?.waterIntakeToday || 0) / (user?.waterGoal || 2600)) * 100)}%` }}
              >
                <span className="text-[9px] font-mono font-black text-white mix-blend-difference whitespace-nowrap">
                  {Math.round(Math.min(100, ((user?.waterIntakeToday || 0) / (user?.waterGoal || 2600)) * 100))}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex gap-1.5 justify-between">
            <button 
              type="button"
              onClick={() => updateWaterIntake(250)}
              className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-[10px] font-bold font-mono text-slate-700 dark:text-slate-300 rounded-xl transition border border-slate-150 dark:border-slate-800"
            >
              +250ml
            </button>
            <button 
              type="button"
              onClick={() => updateWaterIntake(500)}
              className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-[10px] font-bold font-mono text-slate-700 dark:text-slate-300 rounded-xl transition border border-slate-150 dark:border-slate-800"
            >
              +500ml
            </button>
            <button 
              type="button"
              onClick={() => updateWaterIntake(-250)}
              className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-bold font-mono rounded-xl transition"
              title="Remove 250ml"
            >
              -250
            </button>
          </div>
        </div>

        {/* CONSISTENCY ENGINE STREAKS */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase font-mono tracking-widest flex items-center gap-1.5 mb-1">
              ⚡ Consistency Streaks
            </h4>
            <p className="text-[10px] text-slate-500 mb-4 leading-normal">
              Log workouts and updates daily to compound stamina. Do not break the chain!
            </p>

            <div className="flex gap-2 items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 mb-3">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white font-mono leading-none">
                  {Math.max(1, Math.round(activityLogs.length * 0.4 + weightLogs.length * 0.6))} Days Unbroken
                </div>
                <span className="text-[8px] font-mono text-emerald-500 font-bold tracking-widest uppercase mt-1 block">Leveling up smoothly</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-100 dark:border-slate-900 pt-3">
            <span>CHALLENGE: UNBROKEN WEEKS</span>
            <strong className="text-slate-700 dark:text-white font-bold">ACTIVE</strong>
          </div>
        </div>

        {/* RECOGNITION BADGES Unclaimed */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase font-mono tracking-widest flex items-center gap-1.5 mb-2">
              🏆 Unlocked Achievements
            </h4>
            
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <span className="text-xs">🎖️</span>
                <div>
                  <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Fast Starter Onboarded</div>
                  <p className="text-[8px] text-slate-500 font-mono mt-0.5">Profile successfully synced & structured.</p>
                </div>
              </div>
              <div className="flex gap-2 items-center opacity-70">
                <span className="text-xs">{activityLogs.length >= 1 ? "💪" : "🔒"}</span>
                <div>
                  <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Gladiator Milestone</div>
                  <p className="text-[8px] text-slate-500 font-mono mt-0.5">{activityLogs.length >= 1 ? "Completed first direct muscle set!" : "Log 1 exercise set to unlock."}</p>
                </div>
              </div>
            </div>
          </div>

          <span className="text-[8px] font-mono text-amber-500 font-bold tracking-widest uppercase block mt-3 text-right">
            Level 2 Elite Badge Pending
          </span>
        </div>

      </div>

      <div className="grid lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: TRAJECTORY CHART AND PROFILE BUILDER */}
        <div className="lg:col-span-8 space-y-8">

          {/* AI-POWERED QUICK TIP FOR HEALTH AND RECOVERY ADVICE */}
          <QuickTipAdvocate activityLogs={activityLogs} goal={editGoals} />
          
          {/* PREMIUM CUSTOM SPLITS blue ribbon section */}
          {isBuildingProgram ? (
            <CustomProgramBuilder 
              onClose={() => setIsBuildingProgram(false)} 
              onSuccess={() => {
                setIsBuildingProgram(false);
              }} 
            />
          ) : (
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight font-sans">
                      My Tailored Splits
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Construct and run targeted schedules. Available exclusively to Premium athlethes.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsBuildingProgram(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold uppercase text-[10px] tracking-wider border border-slate-200 dark:border-emerald-500/20 rounded-xl transition duration-150 cursor-pointer w-full sm:w-auto text-center"
                >
                  + Design Training Split
                </button>
              </div>

              {customPrograms.length === 0 ? (
                <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-900 rounded-2xl space-y-3">
                  <div className="h-11 w-11 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                      Design Custom Protocols
                    </h4>
                    <p className="text-[11px] text-slate-550 max-w-sm mx-auto leading-relaxed px-4">
                      Escape standard catalog maps! Put together muscle groupings, reps, sets and specific technique notes tailored for your form.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsBuildingProgram(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-95 text-[10px] font-black uppercase font-mono tracking-wider rounded-xl cursor-pointer shadow-xs transition"
                  >
                    Build My Custom Program
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customPrograms.map((prog) => {
                    const isExpanded = expandedProgId === prog.id;
                    return (
                      <div 
                        key={prog.id}
                        className="border border-slate-150 dark:border-slate-900 rounded-2xl overflow-hidden transition-all duration-200 bg-slate-50/30 dark:bg-slate-900/10"
                      >
                        {/* Header bar */}
                        <div 
                          onClick={() => setExpandedProgId(isExpanded ? null : prog.id)}
                          className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition duration-150"
                        >
                          <div className="space-y-1">
                            <span className="text-[8px] font-mono font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 border border-emerald-500/15 rounded-full uppercase">
                              Premium Structured Routine
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                              {prog.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 max-w-sm sm:max-w-md line-clamp-1">
                              {prog.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                if (confirm("Remove this custom workout split?")) {
                                  deleteCustomProgram(prog.id);
                                }
                              }}
                              className="p-1.5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-500 rounded-lg transition shrink-0 cursor-pointer"
                              title="Delete split"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExpandedProgId(isExpanded ? null : prog.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 transition shrink-0"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded detail routines */}
                        {isExpanded && (
                          <div className="p-4 border-t border-slate-150 dark:border-slate-900 bg-white dark:bg-slate-950 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                              {prog.schedule.map((day, dIdx) => (
                                <div 
                                  key={dIdx}
                                  className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-850 rounded-xl space-y-3 flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex justify-between items-start border-b border-slate-150 dark:border-slate-800 pb-2">
                                      <div>
                                        <span className="text-[9px] font-mono text-emerald-500 font-extrabold block">
                                          {day.day}
                                        </span>
                                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none mt-1">
                                          {day.focus}
                                        </h5>
                                      </div>
                                      <span className="text-[8.5px] font-mono bg-slate-150 dark:bg-slate-950 px-1.5 py-0.5 rounded text-slate-550 font-semibold shrink-0">
                                        {day.exercises.length} Exercises
                                      </span>
                                    </div>

                                    <div className="space-y-2.5 mt-3">
                                      {day.exercises.map((ex, eIdx) => (
                                        <div 
                                          key={eIdx}
                                          className="text-[11px] pb-2.5 border-b border-dotted border-slate-200 dark:border-slate-800 last:border-0 last:pb-0 text-slate-700 dark:text-slate-300 space-y-1"
                                        >
                                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                              {ex.name}
                                            </span>
                                            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 font-black px-1 rounded hover:scale-105 transition leading-none py-0.5">
                                              {ex.sets}s × {ex.reps}r
                                            </span>
                                          </div>
                                          {ex.notes && (
                                            <p className="text-[9.5px] italic text-slate-505 dark:text-slate-450 leading-snug">
                                              {ex.notes}
                                            </p>
                                          )}

                                          <button
                                            onClick={() => handleOpenDetail(ex.id)}
                                            className="text-[9px] font-mono text-emerald-500 hover:text-emerald-400 flex items-center gap-0.5 uppercase tracking-wide cursor-pointer font-bold pt-1"
                                          >
                                            <Dumbbell className="w-3 h-3" />
                                            View Technique & Log
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TRACK PROGRESS INTERACTIVE CHART */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Weight Trajectory Index
                </h3>
                <p className="text-xs text-slate-550">Incremental tracking is key to calorie adjustments.</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-full text-[10px] font-bold font-mono uppercase">
                <Weight className="w-3.5 h-3.5" />
                {weightLogs.length > 0 ? `${weightLogs[weightLogs.length - 1].weight} kg Current` : "No logs"}
              </div>
            </div>

            {/* Render direct SVG line graph */}
            {weightLogs.length > 1 ? (
              <div className="py-2">
                <svg className="w-full h-44 text-slate-300 dark:text-slate-850" viewBox="0 0 500 150">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid background lines */}
                  <line x1="20" y1="20" x2="480" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.1" />
                  <line x1="20" y1="75" x2="480" y2="75" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.1" />
                  <line x1="20" y1="130" x2="480" y2="130" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.1" />

                  {/* Gradient Area under line */}
                  <path 
                    d={`M 20,130 L ${chartPoints} L 480,130 Z`} 
                    fill="url(#chartGradient)" 
                  />

                  {/* Weight Line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartPoints}
                  />

                  {/* Plot Dots */}
                  {weightLogs.map((log, index) => {
                    const width = 500;
                    const height = 150;
                    const padding = 20;
                    const weights = weightLogs.map(w => w.weight);
                    const maxW = Math.max(...weights) + 2;
                    const minW = Math.min(...weights) - 2;
                    const rangeW = maxW - minW || 1;
                    const x = padding + (index / (weightLogs.length - 1 || 1)) * (width - padding * 2);
                    const y = height - padding - ((log.weight - minW) / rangeW) * (height - padding * 2);
                    
                    return (
                      <g key={log.id} className="group/dot cursor-pointer">
                        <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#1e293b" strokeWidth="1" />
                        <text x={x} y={y - 8} textAnchor="middle" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">
                          {log.weight}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono px-2 pt-2">
                  <span>START: {weightLogs[0].date}</span>
                  <span>LATEST SECURE AUDIT</span>
                  <span>CURRENT: {weightLogs[weightLogs.length - 1].date}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                Insufficient progress snapshots. Please record at least two logs below to map your trajectory!
              </div>
            )}

            {/* WEIGHT LOG INPUT FORM */}
            <form onSubmit={handleAddWeightLog} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-900">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Scale Weight (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="78.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Bodyfat % (Optional)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="14.2"
                  value={fatInput}
                  onChange={(e) => setFatInput(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-bold uppercase text-[10px] tracking-widest font-mono flex items-center justify-center gap-1.5 shadow"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Append Snapshot
                </button>
              </div>
            </form>
          </div>

          {/* DYNAMIC PROFILE CONTROLLER EDIT FORM */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Biometric Parameters Configurator
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-sans">
              Adjusting these enables Alex Coach AI to calibrate recommended foods, fruit baskets and recovery ratios.
            </p>

            {showStatusMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-820">
                {showStatusMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Athlete Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Recomposition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Height (CM)</label>
                  <input
                    type="number"
                    value={editHeight}
                    onChange={(e) => setEditHeight(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Reference Weight (KG)</label>
                  <input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Ultimate Fitness Goal Instructions</label>
                <textarea
                  rows={2}
                  value={editGoals}
                  placeholder="Describe your current targets: e.g. lower body recomposition, elite calisthenics wide back..."
                  onChange={(e) => setEditGoals(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded focus:outline-none font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-lg text-xs font-bold uppercase tracking-widest font-mono shadow-md hover:shadow-lg transition-all"
                >
                  Save Biometrics
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: BOOKMARKED SAVES AND LOGGED COMPLETIONS */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* BOOKMARKED WORKOUTS LIST */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono tracking-widest flex items-center gap-2 mb-4">
              <Bookmark className="w-4 h-4 text-rose-500" />
              Saved Workouts ({bookmarkedExercises.length})
            </h4>

            {bookmarkedExercises.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No marked exercises. Search workouts to add bookmarks.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {bookmarkedExercises.map((ex) => (
                  <div key={ex.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex justify-between items-center">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">{ex.name}</h5>
                      <span className="text-[10px] text-slate-500 font-mono">{ex.category}</span>
                    </div>
                    <span className="text-[9px] font-mono border border-emerald-500/20 text-emerald-500 uppercase px-1.5 py-0.5 rounded">
                      {ex.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REPS COMPLETION ACTIVITY ARCHIVES */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono tracking-widest flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Sets Completed Logs ({activityLogs.length})
            </h4>

            {activityLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs leading-relaxed">
                You haven't logged any exercises yet. Open any routine in Workouts to record sets immediately.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-96 overflow-y-auto">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs">
                    <div className="flex justify-between font-mono mb-1.5">
                      <span className="font-extrabold text-slate-850 dark:text-white truncate max-w-[150px]">{log.exerciseName}</span>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(log.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mb-1">
                      <span>LOAD EXECUTED: <strong className="text-blue-600 dark:text-emerald-400">{log.weight} KG</strong></span>
                      <span>REPS: <strong className="text-slate-900 dark:text-white">{log.reps}</strong></span>
                    </div>
                    {log.notes && (
                      <p className="text-[10px] text-slate-400 italic bg-amber-500/5 p-1 px-2 rounded border border-amber-500/10 mt-1">
                        Note: {log.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECURE BILLING STATEMENTS */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono tracking-widest mb-4">
              Paystack Invoice Logs
            </h4>
            
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500">No active billing transactions logged yet.</p>
            ) : (
              <div className="space-y-2 font-mono text-[10px]">
                {transactions.map((t) => (
                  <div key={t.id} className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{t.plan} TIER</span>
                      <p className="text-slate-500 tracking-wider">REF: {t.reference.substring(0, 10)}...</p>
                    </div>
                    <span className="text-emerald-500 font-extrabold">₦{(t.amount / 100).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* DETAILED BIOMECHANICAL OVERLAY MODAL */}
      {selectedExercise && (
        <div 
          id="dashboard-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedExerciseId(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm cursor-pointer animate-fade-in p-2 sm:p-4"
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col cursor-default animate-slide-down">
            
            {/* Header control banner */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                  {selectedExercise.category}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Custom Training Integration</span>
              </div>
              <button
                onClick={() => setSelectedExerciseId(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-805 dark:hover:bg-slate-700 text-slate-505 dark:text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-12 gap-8">
                
                {/* Visual side */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Execution Demonstration Loop
                  </h4>
                  <WorkoutVisual 
                    exerciseId={selectedExercise.id}
                    category={selectedExercise.category} 
                    muscleGroups={selectedExercise.muscleGroups} 
                    exerciseName={selectedExercise.name} 
                    className="h-72 w-full rounded-2xl overflow-hidden" 
                    customMediaUrl={selectedExercise.customMediaUrl}
                    customMediaType={selectedExercise.customMediaType}
                  />

                  <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-850/40">
                    <h5 className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Target Anatomy Map Activation</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedExercise.musclesWorked.map((muscle) => (
                        <span key={muscle} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[10px] font-sans font-bold px-2.5 py-1 rounded">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info & tracking side */}
                <div className="md:col-span-5 space-y-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-sans font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                      {selectedExercise.name}
                    </h2>
                    
                    <div className="mt-3 flex flex-wrap gap-1.5 pb-4 border-b border-slate-150 dark:border-slate-855">
                      {selectedExercise.equipment.map((eq) => (
                        <span key={eq} className="bg-slate-100 border border-slate-205 dark:bg-slate-900 dark:border-slate-800 text-[10px] font-sans font-bold text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          {eq}
                        </span>
                      ))}
                      <span className="bg-slate-100 border border-slate-205 dark:bg-slate-900 dark:border-slate-800 text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                        {selectedExercise.difficulty}
                      </span>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <h4 className="text-[10px] font-mono font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-2">Step-by-step Execution</h4>
                        <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                          {selectedExercise.instructions.map((inst, i) => (
                            <li key={i} className="pl-1 text-slate-650 dark:text-slate-350"><span className="font-semibold text-slate-800 dark:text-white">{inst}</span></li>
                          ))}
                        </ol>
                      </div>

                      <div className="mt-6 space-y-3.5 pt-4 border-t border-slate-150 dark:border-slate-855">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">Position:</span>
                          <span className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">{selectedExercise.startingPosition}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block">Execution:</span>
                          <span className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">{selectedExercise.movementExecution}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logger form inside dashboard overlay */}
                  <div className="mt-8 pt-6 border-t border-slate-150 dark:border-slate-855 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-850">
                    <div className="flex items-center gap-2 mb-4">
                      <Clipboard className="w-4 h-4 text-emerald-450" />
                      <h4 className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none">Record Log Training Set</h4>
                    </div>

                    <form onSubmit={handleLogCompletion} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block mb-1">Reps Performed</label>
                          <input 
                            type="number" 
                            value={loggedReps}
                            onChange={(e) => setLoggedReps(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block mb-1">Load / Weight (KG)</label>
                          <input 
                            type="number" 
                            value={loggedWeight}
                            onChange={(e) => setLoggedWeight(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block mb-1">Performance Form Notes</label>
                        <textarea 
                          rows={2}
                          placeholder="e.g., felt solid elbow lockout, slow negative velocity."
                          value={loggedNotes}
                          onChange={(e) => setLoggedNotes(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-black text-[10px] uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submit Session Log</span>
                      </button>
                    </form>

                    {logSuccess && (
                      <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-mono flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0" />
                        <span>Session logged and synchronized perfectly!</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal footer controls */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedExerciseId(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
