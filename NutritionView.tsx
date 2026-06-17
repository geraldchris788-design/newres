import React, { useState } from "react";
import { 
  Sparkles, 
  RotateCw, 
  Dumbbell, 
  Calendar, 
  Plus, 
  ChevronRight, 
  Award, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  Flame,
  Heart,
  CheckCircle2,
  Info
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AiWorkoutGenerator() {
  const { saveCustomProgram, user } = useApp();

  // Generator Preferences States
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [bodyType, setBodyType] = useState<string>("V-Taper Athletic");
  const [goal, setGoal] = useState<string>("Gain Muscle");
  const [weight, setWeight] = useState<string>("70");
  const [age, setAge] = useState<string>("25");
  const [gender, setGender] = useState<string>("Male");
  const [experienceLevel, setExperienceLevel] = useState<string>("Beginner");
  const [customDailyPlan, setCustomDailyPlan] = useState<string>("");
  const [bodyPartTarget, setBodyPartTarget] = useState<string>("");

  const isUserPremium = user?.subscriptionStatus === "premium";

  // Interaction & Result States
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Trigger Gemini/Fallback API to run the high level blueprint formulation
  const handleGenerateWorkout = async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const response = await fetch("/api/gemini/generate-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          daysPerWeek,
          bodyType,
          goal,
          weight,
          age,
          gender,
          experienceLevel,
          customDailyPlan: isUserPremium ? customDailyPlan : "",
          bodyPartTarget: isUserPremium ? bodyPartTarget : "",
        }),
      });

      const data = await response.json();
      if (data.success && data.program) {
        setGeneratedResult(data.program);
      } else {
        throw new Error(data.error || "Failed to formulate weekly blueprint");
      }
    } catch (err: any) {
      console.error("AI program generation error:", err);
      setError("AI personal trainer is collecting oxygen. Please retry or adjust parameters.");
    } finally {
      setLoading(false);
    }
  };

  // Save the custom program into the User's persistent App state
  const handleSaveToMyPrograms = async () => {
    if (!generatedResult) return;
    try {
      // Map generated program schedule items so they have complete IDs to match TS definitions perfectly
      const programToSave = {
        name: generatedResult.name,
        description: generatedResult.description,
        schedule: generatedResult.schedule.map((sch: any, idx: number) => ({
          day: sch.day || `Day ${idx + 1}`,
          focus: sch.focus || "Specialized Conditioning",
          exercises: (sch.exercises || []).map((ex: any, exIdx: number) => ({
            id: `gen-ex-${idx}-${exIdx}-${Date.now()}`,
            name: ex.name || "Compound Movement",
            sets: Number(ex.sets) || 3,
            reps: Number(ex.reps) || 12,
            notes: ex.notes || "Keep optimal posture."
          }))
        }))
      };

      await saveCustomProgram(programToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to commit custom AI program:", err);
      alert("Please sign in first to store your customized AI programs permanently!");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dynamic Preferences Wizard Panel */}
      <div className="bg-gradient-to-br from-indigo-50/40 via-white to-emerald-50/30 dark:from-slate-900/40 dark:via-slate-950 dark:to-emerald-950/20 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/10">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">
              AI Workout Architect
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Formulate absolute hyper-personalized weekly blueprints engineered from clinical kinesiologist routines with Gemini.
            </p>
          </div>
        </div>

        {/* Input Parameters Form layout */}
        <div className="space-y-6 mb-8">
          
          {/* Section 1: Biometric Identity & Experience level */}
          <div className="space-y-4">
            <span id="biometrics-header-tag" className="text-[9px] font-mono font-extrabold uppercase bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 py-1 px-2.5 border border-indigo-500/20 rounded-full inline-block">
              01. Biometrics & Experience level
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Experience Level Selector - "Beginner", "Advanced", "Pro" */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
                  EXPERIENCE LEVEL
                </label>
                <div className="flex items-center gap-1.5">
                  {["Beginner", "Advanced", "Pro"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperienceLevel(level)}
                      className={`flex-1 py-2.5 rounded-xl border font-mono font-extrabold text-xs transition cursor-pointer ${
                        experienceLevel === level
                          ? "bg-indigo-600 border-transparent text-white shadow-md shadow-indigo-650/10"
                          : "bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200 border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-755"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                  Tailors set schemas and compound movement density.
                </span>
              </div>

              {/* Body Weight input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
                  BODY WEIGHT (KG)
                </label>
                <input
                  type="number"
                  min="10"
                  max="350"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors font-sans"
                  placeholder="e.g. 70"
                />
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                  Advises load distribution and kinetic force limits.
                </span>
              </div>

              {/* Age input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
                  PARTICIPANT AGE
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors font-sans"
                  placeholder="e.g. 25"
                />
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                  Calibrates cardiovascular recovery pace.
                </span>
              </div>

              {/* Gender input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
                  GENDER SELECTION
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors font-sans"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                  Informs structural posture recommendations in response.
                </span>
              </div>

            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-900 my-4" />

          {/* Section 2: Workout Parameters */}
          <div className="space-y-4">
            <span id="workout-header-tag" className="text-[9px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 py-1 px-2.5 border border-emerald-500/20 rounded-full inline-block">
              02. Workout Preferences
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Days selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
                  TRAINING FREQUENCY
                </label>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDaysPerWeek(num)}
                      className={`flex-1 py-2.5 rounded-xl border font-mono font-extrabold text-xs transition cursor-pointer ${
                        daysPerWeek === num
                          ? "bg-emerald-550 dark:bg-emerald-500 border-transparent text-white shadow-md shadow-emerald-505/10"
                          : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-755"
                      }`}
                    >
                      {num} Days
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                  Select count of active training days requested per week.
                </span>
              </div>

              {/* Desired Body Type selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
                  TARGET BODY TYPE PHYSIQUE
                </label>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors font-sans"
                >
                  <option value="V-Taper Athletic">V-Taper Athletic (Broad shoulders & tight core)</option>
                  <option value="Lean & Shredded">Lean & Shredded (Max weight tone & fiber definition)</option>
                  <option value="Massive & Muscular">Massive & Muscular (Maximize overall hypertrophy/gains)</option>
                  <option value="Symmetric Toned">Symmetric Toned (Aesthetic balance & clinical stance)</option>
                  <option value="Powerlifter Strength">Powerlifter Strength (Focus on raw bone density & lift ratios)</option>
                </select>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                  Targets secondary biomechanical focuses dynamically.
                </span>
              </div>

              {/* Goals Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
                  PRIMARY TRANSITION GOALS
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors font-sans"
                >
                  <option value="Gain Muscle">Gain Lean Muscle Mass</option>
                  <option value="Lose Fat">Lose Body Fat & Burn Fuel</option>
                  <option value="Build Max Strength">Build Maximum Raw Strength & Compound Power</option>
                  <option value="Conditioning & Cardio">Conditioning, Aerobic Flow & Stamina</option>
                  <option value="Longevity & Joint Health">Longevity, Injury Prevention & Posture</option>
                  <option value="chest and triceps">Chest & Triceps Power Split</option>
                  <option value="chest">Chest Isolation Hypertrophy</option>
                  <option value="triceps">Triceps Horseshoe Deep Focus</option>
                  <option value="biceps">Biceps Peak Definition</option>
                  <option value="back">Back Thickness & V-Width Blast</option>
                  <option value="back and biceps">Back & Biceps Ultimate Pull Split</option>
                  <option value="shoulder">Shoulder Clavicle Width & Density</option>
                  <option value="legs and shoulders">Legs & Shoulders Compound Master Split</option>
                </select>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                  Tailors rep structures, muscle groupings, and cardiovascular rest splits.
                </span>
              </div>

            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-900 my-4" />

          {/* Section 3: Premium Targeted Customization (Secured via Paystack) */}
          <div className="space-y-4 relative">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span id="premium-header-tag" className="text-[9px] font-mono font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 py-1 px-2.5 border border-amber-500/20 rounded-full inline-flex flex-items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                03. Premium Targeted Customization
              </span>
              {!isUserPremium && (
                <span className="text-[9px] font-mono font-bold text-amber-500 uppercase flex items-center gap-1 bg-amber-500/5 px-2 py-1 rounded-md border border-amber-500/10">
                  ⚠️ PREMIUM FEATURE
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative p-1 rounded-2xl">
              
              {/* Custom Daily Routine Textarea Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider font-mono block flex items-center gap-1">
                  Custom Daily Split Planner
                </label>
                <textarea
                  value={customDailyPlan}
                  onChange={(e) => setCustomDailyPlan(e.target.value)}
                  disabled={!isUserPremium}
                  rows={3}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:cursor-not-allowed text-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors font-sans placeholder-slate-400"
                  placeholder={isUserPremium 
                    ? "e.g., Monday: Upper chest focus, Tuesday: Heavy deadlifts but skip hamstring strains, Thursday: Active recovery arm splits..." 
                    : "🔒 Upgrade to Premium to plan dynamic daily targets for the AI generator"}
                />
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                  Optionally type what specifically you want to work out daily, and the system coordinates splits perfectly.
                </span>
              </div>

              {/* Specific Body Targets */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider font-mono block flex items-center gap-1">
                  Stuck? Enter Body Parts to Develop
                </label>
                <textarea
                  value={bodyPartTarget}
                  onChange={(e) => setBodyPartTarget(e.target.value)}
                  disabled={!isUserPremium}
                  rows={3}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:cursor-not-allowed text-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors font-sans placeholder-slate-400"
                  placeholder={isUserPremium 
                    ? "e.g., glutes shape, shoulder clavicle width, lower abdominal line" 
                    : "🔒 Upgrade to Premium to analyze and build clinical exercises targeting specific areas"}
                />
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                  If you aren't sure of splits, type what body area you want to develop. The system generates exercises tailored perfectly to {gender} shape mechanics.
                </span>
              </div>

              {/* Lockdown Overlay Trigger */}
              {!isUserPremium && (
                <div className="absolute inset-0 bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-xs flex flex-col justify-center items-center text-center p-4 rounded-3xl border border-dashed border-amber-500/25 z-10">
                  <span className="p-2 bg-amber-500/10 rounded-full text-amber-500 border border-amber-500/20 mb-1.5">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Unlock Premium Workout Architect
                  </h4>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-2.5">
                    Configure daily custom structures and target specific muscle groupings designed specifically for {gender} anatomy.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const pricingSec = document.getElementById("pricing_anchor_block");
                      if (pricingSec) {
                        pricingSec.scrollIntoView({ behavior: "smooth" });
                      } else {
                        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                      }
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:text-slate-950 text-white font-mono font-bold text-[9px] uppercase tracking-wider rounded-lg transition shrink-0 cursor-pointer shadow-sm"
                  >
                    Upgrade via Paystack
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Generate Button controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-150 dark:border-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-[10px] leading-relaxed">
              Program contains full daily focus outlines, target sets & reps, plus customized kinesiologist execution tips.
            </p>
          </div>
          
          <button
            onClick={handleGenerateWorkout}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-slate-950 font-bold uppercase text-[11px] tracking-wider rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Generating Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Formulate Weekly Program</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-rose-800 dark:text-rose-450 uppercase font-mono">Engine Interruption</p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* GENERATED CORE WORKING LAYOUT */}
      {generatedResult && (
        <div className="space-y-6">
          
          {/* Header Billboard Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-mono font-bold bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase">
                  {daysPerWeek} Days / Week
                </span>
                <span className="text-[9px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase">
                  {bodyType} Target
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {generatedResult.name}
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-450 leading-relaxed max-w-2xl font-medium">
                {generatedResult.description}
              </p>
            </div>

            {/* Commit / Save Blueprint Actions */}
            <div className="shrink-0 space-y-2">
              <button
                onClick={handleSaveToMyPrograms}
                className="w-full px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black font-sans uppercase text-[10.5px] tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                Save to My Custom Programs
              </button>
              
              {saveSuccess && (
                <div className="flex items-center gap-1.5 justify-center text-emerald-500 text-[10px] font-mono font-bold animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Program saved! Access on Dashboard</span>
                </div>
              )}
            </div>
          </div>

          {/* Agenda Weekly Board */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest">
                WEEKLY AGENDA & SEQUENCE
              </h4>
              <span className="text-[10px] text-slate-550 dark:text-slate-450 font-mono">
                Click "Save to My Programs" to load logs instantly
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {generatedResult.schedule.map((slot: any, idx: number) => {
                const isRest = slot.day.toLowerCase().includes("rest") || slot.focus.toLowerCase().includes("recovery");
                return (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px] ${
                      isRest 
                        ? "bg-slate-50 dark:bg-slate-900/40 border-slate-150 dark:border-slate-850/60 opacity-80"
                        : "bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white uppercase leading-none">
                          {slot.day.split(" ")[0]}
                        </span>
                        {isRest ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-600" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <h5 className={`text-[11px] font-extrabold uppercase tracking-tight leading-snug ${isRest ? "text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-white"}`}>
                        {isRest ? "Active Rest" : slot.focus}
                      </h5>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">
                        {isRest ? "Stretch Routine" : `${slot.exercises?.length || 0} Movements`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Daily Drills breakdowns */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest pl-1">
              DAILY DETAILS & MOVEMENT BLUEPRINT
            </h4>

            <div className="space-y-8">
              {generatedResult.schedule.map((slot: any, idx: number) => {
                const isRest = slot.day.toLowerCase().includes("rest") || slot.exercises?.length === 0;
                return (
                  <div 
                    key={idx}
                    className="p-6 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-850">
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-mono font-extrabold uppercase shrink-0 ${
                          isRest ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          D{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-950 dark:text-white uppercase leading-none font-sans">
                            {slot.day}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Focus: <strong className="text-slate-700 dark:text-slate-300 font-extrabold uppercase">{slot.focus}</strong>
                          </p>
                        </div>
                      </div>

                      {isRest && (
                        <span className="text-[9px] font-mono font-extrabold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-0.5 rounded uppercase leading-none border border-slate-150 dark:border-slate-750">
                          Rest & Restore
                        </span>
                      )}
                    </div>

                    {/* Drill cards list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(slot.exercises || []).map((ex: any, exIdx: number) => (
                        <div 
                          key={exIdx}
                          className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-150/60 dark:border-slate-850/60 hover:border-slate-250 dark:hover:border-slate-800 transition flex items-start gap-3.5"
                        >
                          <div className="h-8 w-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold text-xs shrink-0 shadow-xs">
                            <Dumbbell className="w-4 h-4 text-emerald-500" />
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-[11.5px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                                {ex.name}
                              </h5>
                              <div className="flex items-center gap-1 shrink-0 font-mono text-[9px] bg-slate-200/50 dark:bg-slate-900 text-slate-700 dark:text-slate-350 px-1.5 py-0.5 rounded leading-none">
                                <span className="font-extrabold text-slate-900 dark:text-white">{ex.sets}</span>×
                                <span className="font-extrabold text-slate-900 dark:text-white">{ex.reps}</span>
                              </div>
                            </div>

                            {ex.notes && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug bg-white/70 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-100 dark:border-slate-950 font-sans">
                                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-[8.5px] uppercase block mb-0.5 tracking-wider">FORM TIPS:</span>
                                {ex.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save panel nudge at bottom */}
          <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 dark:from-slate-950 dark:to-emerald-950/20 rounded-3xl border border-dashed border-emerald-500/20 text-center space-y-4">
            <Award className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Satisfied with your Custom Routine?
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Saving this program adds it permanently to your AlexFitnessHub profile. You can enroll, track daily progress, and log exercise repetition volume directly inside your active schedule!
              </p>
            </div>
            <button
              onClick={handleSaveToMyPrograms}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-slate-900 font-bold uppercase text-[10px] tracking-wider rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Commit & Store Routine
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
