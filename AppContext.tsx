import React, { useState, useMemo, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Exercise, PROGRAMS, Program } from "../data/exercises";
import { 
  Search, SlidersHorizontal, Lock, CheckCircle, PlusCircle, Sparkles, X, 
  ChevronRight, HelpCircle, AlertTriangle, Play, Shield, Calendar, Apple, Dumbbell, ArrowRight, Clipboard,
  Compass, CheckCircle2, UploadCloud, FileVideo, FileImage, Trash2, ArrowLeft
} from "lucide-react";
import WorkoutVisual from "./WorkoutVisual";
import AiWorkoutGenerator from "./AiWorkoutGenerator";

export default function WorkoutLibrary({ setView }: { setView?: (view: string) => void }) {
  const { user, exercises, toggleSaveWorkout, savedWorkouts, logWorkoutCompletion, uploadExerciseMedia } = useApp();
  const isUserPremium = user?.subscriptionStatus === "premium";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // Keep track of scroll offset before navigating into dedicated exercise detail page
  const libraryScrollPosRef = useRef<number>(0);

  useEffect(() => {
    if (!selectedExerciseId) {
      const targetPos = libraryScrollPosRef.current;
      if (targetPos > 0) {
        // Double-RAF ensures layout paint is finished before restoration
        const restore = () => {
          window.scrollTo({ top: targetPos, behavior: "instant" });
        };
        requestAnimationFrame(() => {
          requestAnimationFrame(restore);
        });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [selectedExerciseId]);

  const selectedExercise = useMemo(() => {
    if (!selectedExerciseId) return null;
    return exercises.find(ex => ex.id === selectedExerciseId) || null;
  }, [exercises, selectedExerciseId]);

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  useEffect(() => {
    if (selectedExerciseId || selectedProgram) {
      // Reset scroll position of the backdrop container to top immediately and on next frame
      const resetScroll = () => {
        const cabinetBackdrop = document.getElementById("exercise-cabinet-drawer");
        if (cabinetBackdrop) {
          cabinetBackdrop.scrollTop = 0;
        }
        const programBackdrop = document.getElementById("program-cohort-detail");
        if (programBackdrop) {
          programBackdrop.scrollTop = 0;
        }
      };

      resetScroll();
      const timer = setTimeout(resetScroll, 50);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [selectedExerciseId, selectedProgram]);

  // Active view tabs for search results
  const [activeSearchTab, setActiveSearchTab] = useState<"exercises" | "mealplans" | "generator">("exercises");

  // Pagination for heavy exercise cards lists
  const [visibleCount, setVisibleCount] = useState(12);

  // Reset pagination count on search query or filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Completed set logger inputs
  const [loggedReps, setLoggedReps] = useState("12");
  const [loggedWeight, setLoggedWeight] = useState("50");
  const [loggedNotes, setLoggedNotes] = useState("");
  const [logSuccess, setLogSuccess] = useState(false);

  // Dynamic filter lists
  const categoriesList = useMemo(() => {
    const list = new Set(exercises.map(e => e.category));
    return ["All", ...Array.from(list)];
  }, [exercises]);

  // Unified Smart Search Engine and organizing matches
  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      // Keep premium items out of sight from free tier users
      if (ex.isPremium && !isUserPremium) return false;

      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        ex.name.toLowerCase().includes(query) ||
        ex.category.toLowerCase().includes(query) ||
        ex.instructions.some(inst => inst.toLowerCase().includes(query)) ||
        ex.equipment.some(eq => eq.toLowerCase().includes(query)) ||
        ex.muscleGroups.some(mg => mg.toLowerCase().includes(query));
        
      const matchesCategory = selectedCategory === "All" || ex.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "All" || ex.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [exercises, searchQuery, selectedCategory, selectedDifficulty, isUserPremium]);

  // Paginated exercises derived for render throttling
  const displayedExercises = useMemo(() => {
    return filteredExercises.slice(0, visibleCount);
  }, [filteredExercises, visibleCount]);

  // Programs mapping for the search term
  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return PROGRAMS;
    const query = searchQuery.toLowerCase();
    
    // Exact requested search specifications:
    // - "Chest" -> pull Programs mentioning Chest, V-Taper, hypertrophy
    // - "Home Workout" -> pull programs matching home, bodyweight, no equipment
    // - "Weight Loss" -> pull weight loss, shred, lean toning, fat loss
    return PROGRAMS.filter(prog => {
      const matchesName = prog.name.toLowerCase().includes(query);
      const matchesDesc = prog.description.toLowerCase().includes(query);
      const matchesTags = prog.searchTags.some(tag => tag.toLowerCase().includes(query));
      const matchesCategory = prog.category.toLowerCase().includes(query);
      
      let contextualMatch = false;
      if (query === "chest") {
        contextualMatch = prog.name.toLowerCase().includes("v taper") || prog.name.toLowerCase().includes("muscle");
      } else if (query === "home workout") {
        contextualMatch = prog.category.toLowerCase().includes("home") || prog.searchTags.includes("bodyweight");
      } else if (query === "weight loss") {
        contextualMatch = prog.name.toLowerCase().includes("shred") || prog.name.toLowerCase().includes("fat") || prog.name.toLowerCase().includes("toning") || prog.searchTags.includes("shred");
      }

      return matchesName || matchesDesc || matchesTags || matchesCategory || contextualMatch;
    });
  }, [searchQuery]);

  // Meal Plans derived from filtered programs for requested "Weight Loss" search mapping
  const filteredMealPlans = useMemo(() => {
    return filteredPrograms.filter(p => p.schedule.some(s => s.mealPlan));
  }, [filteredPrograms]);

  const handleOpenDetail = (ex: Exercise) => {
    libraryScrollPosRef.current = window.scrollY;
    setSelectedExerciseId(ex.id);
    setLogSuccess(false);
    setLoggedNotes("");
  };

  const handleOpenProgram = (prog: Program) => {
    setSelectedProgram(prog);
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
    }, 3000);
  };

  // Moved isUserPremium definition to the top of component

  const handleTriggerQuickSearch = (term: string) => {
    setSearchQuery(term);
    if (term === "Weight Loss") {
      setActiveSearchTab("mealplans");
    } else {
      setActiveSearchTab("exercises");
    }
  };

  if (selectedExercise) {
    return (
      <div id="exercise-technique-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-slate-900 dark:text-slate-100 space-y-8">
        
        {/* Navigation Head Back Button */}
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => setSelectedExerciseId(null)}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Workout Library
          </button>

          <span className="text-[10px] font-mono uppercase bg-slate-200/50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 py-1.5 px-3 border border-slate-300 dark:border-slate-850 rounded-full">
            KINESIOLOGY CORE PORTAL
          </span>
        </div>

        {/* Title Block Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs">
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-500 py-0.5 px-2.5 border border-emerald-500/20 rounded-full">
              {selectedExercise.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white leading-none mt-2">
              {selectedExercise.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 pt-4 text-xs font-mono">
              <span className="text-slate-550 dark:text-slate-400">DIFFICULTY LEVEL:</span>
              <span className={`px-2.5 py-0.5 rounded font-extrabold text-[10px] uppercase border ${
                selectedExercise.difficulty === "Beginner"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : selectedExercise.difficulty === "Intermediate"
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : "bg-rose-500/10 text-rose-500 border-rose-500/20"
              }`}>
                {selectedExercise.difficulty}
              </span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-blue-500/5 to-transparent pointer-events-none opacity-50" />
        </div>

        {selectedExercise.isPremium && !isUserPremium ? (
          <div className="space-y-6">
            {/* Visual Media Block (Blurred / Locked overlay) */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 h-64 bg-slate-950">
              <WorkoutVisual 
                category={selectedExercise.category} 
                muscleGroups={selectedExercise.muscleGroups} 
                exerciseName={selectedExercise.name} 
                className="h-full w-full filter blur-lg opacity-30" 
                customMediaUrl={selectedExercise.customMediaUrl}
                customMediaType={selectedExercise.customMediaType}
                isCard={true}
              />
              <div className="absolute inset-0 bg-slate-950/70 flex flex-col justify-center items-center text-center p-6">
                <div className="h-12 w-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-widest">BIOMECHANICAL DEMO LOCKED</span>
                <span className="text-xs text-slate-400 mt-2 max-w-sm">HD video loop and kinesis align-track restricted to Premium members</span>
              </div>
            </div>

            {/* Locked Parameter Indicators Checklist */}
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <h4 className="text-base font-black text-slate-900 dark:text-white uppercase mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400 fill-emerald-400 animate-pulse" />
                Locked Kinesiology Parameters
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Your current free-tier account is restricted from reading the 11 key training parameters for **{selectedExercise.name}**:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { num: "01", name: "HD Demonstration Loop", desc: "Interactive full range of motion." },
                  { num: "02", name: "Starting Alignment Position", desc: "Skeletal setups and joint angles." },
                  { num: "03", name: "Concentric Execution", desc: "Optimal force speed and direction." },
                  { num: "04", name: "Peak Finishing Squeeze", desc: "Holding concentric active tension." },
                  { num: "05", name: "Target Muscle Groups", desc: "Deep anatomical muscle breakdowns." },
                  { num: "06", name: "Form Warning Mistakes", desc: "Safety callouts protecting tendons." },
                  { num: "07", name: "Progression Variations", desc: "Complex muscular loading styles." },
                  { num: "08", name: "Alternative Exercises", desc: "Sub-swaps for versatile equipment." }
                ].map((item) => (
                  <div key={item.num} className="p-4 rounded-2xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/60 text-xs flex gap-3 shadow-xs">
                    <span className="font-mono text-emerald-500 font-extrabold text-[12px] mt-0.5">{item.num}</span>
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-white leading-tight uppercase text-[9px] font-mono">{item.name}</p>
                      <p className="text-[9px] text-slate-450 dark:text-slate-400 leading-snug mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Benefits Box */}
            <div className="p-6 rounded-3xl border border-emerald-500/10 bg-emerald-500/5 text-xs sm:text-sm">
              <h5 className="font-extrabold uppercase font-mono text-[9px] tracking-widest text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                AlexFitnessHub Premium Benefits
              </h5>
              <ul className="space-y-2 font-sans leading-relaxed text-slate-705 dark:text-emerald-300/80 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-extrabold">&#10004;</span> Full access to <strong>1,200+ clinical exercises</strong> with biomechanical details.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-extrabold">&#10004;</span> Dedicated <strong>AI Fitness Coach</strong> for 24/7 posture checks.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-extrabold">&#10004;</span> Special <strong>Celebrity & Military Training Programs</strong> guides.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-extrabold">&#10004;</span> <strong>African & Global Meal Generators</strong> with regional macro-tailored options.
                </li>
              </ul>
            </div>

            {/* Secure Checkout CTA */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider font-mono text-emerald-400">Unlock Master kinesis library</h4>
                <p className="text-xs text-slate-400 mt-1 lines-snug">
                  Activate your premium features securely via Paystack. Cancel anytime.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedExerciseId(null);
                  setView?.("home");
                  setTimeout(() => {
                    const pricingSec = document.getElementById("pricing_anchor_block");
                    if (pricingSec) pricingSec.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase rounded-xl tracking-wider shadow hover:shadow-lg transition-all shrink-0 cursor-pointer"
              >
                Upgrade via Paystack
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Visual Media & Logger */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-[11px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                  KINESIOLOGY MOVEMENT DEMO
                </h4>
                
                <div className="rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-850">
                  <WorkoutVisual 
                    exerciseId={selectedExercise.id}
                    category={selectedExercise.category} 
                    muscleGroups={selectedExercise.muscleGroups} 
                    exerciseName={selectedExercise.name} 
                    className="h-64 sm:h-72 w-full" 
                    customMediaUrl={selectedExercise.customMediaUrl}
                    customMediaType={selectedExercise.customMediaType}
                  />
                </div>

                {/* Performance media drag & drop uploader */}
                {user && (user.email === "alexfitnesshub@gmail.com" || user.email === "muzikworld08@gmail.com") && (
                  <CustomPerformanceUpload 
                    exercise={selectedExercise}
                    uploadExerciseMedia={uploadExerciseMedia}
                  />
                )}
              </div>

              {/* LOG COMPLETION STATE CONFORM LOGIC */}
              {user ? (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider font-mono">
                    Log Workout Performance
                  </h4>

                  {logSuccess ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/22 rounded-2xl text-xs text-emerald-605 dark:text-emerald-405 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      Form submission recorded cleanly. Sync completed with user dashboard index!
                    </div>
                  ) : (
                    <form onSubmit={handleLogCompletion} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-505 uppercase font-mono mb-1.5">Target Reps</label>
                        <input
                          type="number"
                          value={loggedReps}
                          onChange={(e) => setLoggedReps(e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-201 dark:border-slate-850 text-slate-950 dark:text-white rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase font-mono mb-1.5">Target Load (KG)</label>
                        <input
                          type="number"
                          value={loggedWeight}
                          onChange={(e) => setLoggedWeight(e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-201 dark:border-slate-850 text-slate-950 dark:text-white rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase font-mono mb-1.5">Coaching notes and performance index</label>
                        <input
                          type="text"
                          placeholder="Felt excellent contraction. Joint movement felt completely stable."
                          value={loggedNotes}
                          onChange={(e) => setLoggedNotes(e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-201 dark:border-slate-850 text-slate-950 dark:text-white rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="sm:col-span-2 py-3 bg-[#1E3A8A] hover:bg-[#1E40AF] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest font-mono flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Log Workout Set
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center rounded-3xl bg-white dark:bg-slate-900 text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800/80">
                  Please sign-in to enroll, save routines, track sets, and compile dynamic history charts.
                </div>
              )}

            </div>

            {/* Right Column: Biomechanics, Checklist, Equipment & Variations */}
            <div className="lg:col-span-7 space-y-6">

              {/* HOW TO PERFORM & TARGET MUSCLES */}
              <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 shadow-xs">
                <h4 className="text-sm font-extrabold text-blue-600 dark:text-emerald-400 uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-500 dark:text-emerald-400" />
                  Kinesiological Execution Guide
                </h4>

                <div className="space-y-4 text-xs leading-relaxed">
                  {/* Starting Position */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                    <span className="font-extrabold text-blue-700 dark:text-blue-400 block uppercase text-[10px] font-mono tracking-wider">Starting Setup Alignment:</span>
                    <p className="text-slate-650 dark:text-slate-300 mt-1 leading-relaxed">{selectedExercise.startingPosition}</p>
                  </div>

                  {/* Movement Execution */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                    <span className="font-extrabold text-orange-655 dark:text-orange-400 block uppercase text-[10px] font-mono tracking-wider">Active Range Execution:</span>
                    <p className="text-slate-655 dark:text-slate-300 mt-1 leading-relaxed">{selectedExercise.movementExecution}</p>
                  </div>

                  {/* Finishing Position */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                    <span className="font-extrabold text-purple-655 dark:text-purple-400 block uppercase text-[10px] font-mono tracking-wider">Finishing Lock & Squeeze:</span>
                    <p className="text-slate-655 dark:text-slate-300 mt-1 leading-relaxed">{selectedExercise.finishingPosition}</p>
                  </div>

                  {/* Muscles Worked */}
                  <div>
                    <span className="font-extrabold text-slate-500 dark:text-slate-400 block uppercase text-[10px] font-mono tracking-wider mb-2">Prime Target Muscle Groups:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.musclesWorked.map((muscle) => (
                        <span key={muscle} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold px-3 py-1.5 rounded-lg uppercase font-mono">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* EQUIPMENT CHECKLIST */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                <h4 className="text-xs font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
                  EQUIPMENT SPECIFICATION
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedExercise.equipment.map((eq) => (
                    <div key={eq} className="flex items-center gap-3 p-3 rounded-xl bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 text-xs">
                      <div className="bg-emerald-500/10 text-emerald-500 opacity-90 rounded-full p-1 border border-emerald-500/10">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white uppercase text-[10px] font-mono leading-tight">{eq}</p>
                        <p className="text-[8px] text-slate-450 dark:text-slate-500 leading-none mt-1">Verified equipment alignment</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMMON MISTAKES & SAFETY TIPS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Common Mistakes */}
                <div className="p-5 rounded-3xl bg-rose-500/5 border border-rose-500/15">
                  <h5 className="text-xs font-bold text-rose-600 dark:text-rose-455 uppercase font-mono tracking-wider flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Forms to Avoid
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-655 dark:text-rose-350 leading-relaxed">
                    {selectedExercise.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="shrink-0 text-rose-500 font-extrabold">&#10006;</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Safety Tips */}
                <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/15">
                  <h5 className="text-xs font-bold text-amber-600 dark:text-amber-455 uppercase font-mono tracking-wider flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 shrink-0" />
                    Safety Callouts
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-655 dark:text-amber-350 leading-relaxed">
                    {selectedExercise.safetyTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="shrink-0 text-amber-600 dark:text-amber-500 font-extrabold">&#10004;</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* EXERCISE VARIATIONS */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                <h5 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-850 pb-2">
                  Clinical Training Variations
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Alternative Swaps</span>
                    <p className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 leading-snug">
                      {selectedExercise.alternativeExercises.join(" / ") || "Standard swaps apply"}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Advanced Progression</span>
                    <p className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 leading-snug">
                      {selectedExercise.progressionVariations.join(" / ") || "High density loads"}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Regression Options</span>
                    <p className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 leading-snug">
                      {selectedExercise.regressionVariations.join(" / ") || "Knee assisted splits"}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    );
  }

  return (
    <div id="workout-library-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. HEADER TITLE SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold font-mono text-emerald-500 uppercase tracking-widest leading-none">Verified Library</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            AlexFitnessHub Training Core
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mt-1 leading-relaxed">
            Every movement on AlexFitnessHub is designed by certified clinical kinesiologists. Premium athletes unlock professional target V-Taper programs, heavy neck harness isolation systems, and celebrity-inspired physique metrics.
          </p>
        </div>
        
        {/* Core database metrics */}
        <div id="core-database-metrics" className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] text-slate-550 dark:text-slate-400 font-mono tracking-wide flex items-center gap-4 shrink-0 shadow-sm font-sans">
          <div><span className="text-slate-900 dark:text-white font-extrabold">{isUserPremium ? exercises.length : exercises.filter(e => !e.isPremium).length}</span> EXERCISES LOADED</div>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
          <div><span className="text-indigo-500 dark:text-emerald-400 font-extrabold">{PROGRAMS.length}</span> ENROLLABLE PROGRAMS</div>
        </div>
      </div>

      {/* 2. INSTANT SEARCH ENGINE BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        
        {/* Search input field */}
        <div className="lg:col-span-6 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search e.g., 'Chest', 'Home Workout', 'Weight Loss', 'Dumbbells', 'Abs', etc..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Proactively switch tabs when specialized searches take place to focus results
              if (e.target.value.toLowerCase().includes("weight") || e.target.value.toLowerCase().includes("loss")) {
                setActiveSearchTab("mealplans");
              } else {
                setActiveSearchTab("exercises");
              }
            }}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 placeholder:text-slate-400 font-sans shadow-xs transition-colors"
          />
        </div>

        {/* Dynamic Category Selector */}
        <div className="lg:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none transition-colors"
          >
            <option value="All">All Movements & Styles</option>
            {categoriesList.filter(c => c !== "All").map(cat => (
              <option key={cat} value={cat}>{cat} Routines</option>
            ))}
          </select>
        </div>

        {/* Difficulty Selector */}
        <div className="lg:col-span-3">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none transition-colors"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner Level</option>
            <option value="Intermediate">Intermediate Level</option>
            <option value="Advanced">Advanced Level</option>
          </select>
        </div>

      </div>

      {/* 3. QUICK SUGGESTIONS TRIGGER BAITS */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center uppercase py-1 select-none">SEARCH SUGGESTIONS:</span>
        {[
          { label: "Chest Training", term: "Chest" },
          { label: "Home Workouts", term: "Home Workout" },
          { label: "Weight Loss / Shreds", term: "Weight Loss" },
          { label: "Calisthenics", term: "Calisthenics" },
          { label: "Arm Sculpting", term: "Biceps" },
          { label: "Compound Legs", term: "Legs" }
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleTriggerQuickSearch(item.term)}
            className={`px-3.5 py-1.5 border hover:border-slate-350 dark:hover:border-slate-700 text-[10px] rounded-full font-mono transition shadow-xs flex items-center gap-1 ${
              searchQuery === item.term
                ? "bg-slate-950 text-white border-transparent dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : "bg-white text-slate-650 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
            }`}
          >
            {searchQuery === item.term && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {item.label}
          </button>
        ))}
      </div>

      {/* 4. MULTIPLEX INSTANT ORGANIZER TABS (Visible especially when searching) */}
      <div id="search-multiplex-tabs" className="mb-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSearchTab("exercises")}
            className={`pb-3 text-xs uppercase tracking-wider font-bold font-mono transition-all flex items-center gap-2 border-b-2 relative ${
              activeSearchTab === "exercises" 
                ? "text-slate-900 dark:text-white border-blue-500 dark:border-emerald-500" 
                : "text-slate-400 border-transparent hover:text-slate-600"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            Exercises Matching ({filteredExercises.length})
          </button>
          
          <button
            onClick={() => setActiveSearchTab("generator")}
            className={`pb-3 text-xs uppercase tracking-wider font-bold font-mono transition-all flex items-center gap-2 border-b-2 relative ${
              activeSearchTab === "generator" 
                ? "text-slate-900 dark:text-white border-blue-500 dark:border-emerald-500" 
                : "text-slate-400 border-transparent hover:text-slate-600"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
            AI Workout Architect
          </button>
          
          {searchQuery && (searchQuery.toLowerCase().includes("weight") || searchQuery.toLowerCase().includes("loss")) && (
            <button
              onClick={() => setActiveSearchTab("mealplans")}
              className={`pb-3 text-xs uppercase tracking-wider font-bold font-mono transition-all flex items-center gap-2 border-b-2 relative ${
                activeSearchTab === "mealplans" 
                  ? "text-emerald-500 dark:text-emerald-400 border-emerald-500" 
                  : "text-slate-400 border-transparent hover:text-slate-600"
              }`}
            >
              <Apple className="w-4 h-4" />
              Weight Loss Meal Plans ({filteredMealPlans.length})
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="text-[10px] text-slate-500 font-mono tracking-wide uppercase select-none pb-3 hidden sm:block">
            Found {filteredExercises.length} drills & {filteredPrograms.length} premium tracks for <span className="font-extrabold text-blue-500 dark:text-emerald-400">"{searchQuery}"</span>
          </div>
        )}
      </div>

      {/* 5. MATCHING EXERCISES TAB RENDER */}
      {activeSearchTab === "exercises" && (
        <div>
          {filteredExercises.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
              <HelpCircle className="w-10 h-10 text-slate-450 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">No compound exercises match the query</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">Reset filters or browse other sections using the recommendations above.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedDifficulty("All"); }}
                className="mt-4 px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-[10px] font-bold rounded-lg uppercase tracking-widest font-mono transition-all"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedExercises.map((ex) => {
                  const isSaved = savedWorkouts.includes(ex.id);
                  const needsUpgrade = ex.isPremium && !isUserPremium;
                  
                  return (
                    <div 
                      key={ex.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750 hover:shadow-lg transition-all"
                    >
                      {/* Visual Media Block */}
                      <div className="relative">
                        <WorkoutVisual 
                          exerciseId={ex.id}
                          category={ex.category} 
                          muscleGroups={ex.muscleGroups} 
                          exerciseName={ex.name} 
                          className="h-44 w-full" 
                          customMediaUrl={ex.customMediaUrl}
                          customMediaType={ex.customMediaType}
                          isCard={true}
                        />
                        
                        {/* Premium Badge */}
                        {ex.isPremium && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
                            PREMIUM
                          </div>
                        )}

                        {/* Difficulty Label */}
                        <div className="absolute top-3 right-3 bg-slate-900/90 text-white text-[9px] font-sans font-bold uppercase px-2.5 py-1 rounded border border-slate-700/40">
                          {ex.difficulty}
                        </div>
                      </div>

                      {/* Content Body Block */}
                      <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-sans tracking-wide mb-1.5 font-bold">{ex.category}</div>
                          <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-blue-500 dark:group-hover:text-emerald-450 transition-colors">
                            {ex.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {ex.instructions[0]} Focus on perfect execution.
                          </p>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {ex.equipment.map((eq) => (
                              <span key={eq} className="bg-slate-100 dark:bg-slate-900 text-[9px] font-sans font-bold text-slate-600 dark:text-slate-400 px-2 py-1 rounded uppercase">
                                {eq}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action trigger footer */}
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSaveWorkout(ex.id); }}
                            className={`text-[10px] px-3.5 py-2 rounded-lg font-bold uppercase transition-all ${
                              isSaved 
                                ? "bg-slate-200 dark:bg-emerald-500/10 text-slate-800 dark:text-emerald-400 cursor-pointer"
                                : "border border-slate-200 dark:border-slate-800 hover:bg-slate-150 dark:hover:bg-slate-900 text-slate-500 hover:text-white cursor-pointer"
                            }`}
                          >
                            {isSaved ? "Saved" : "Save Exercise"}
                          </button>

                          <button
                            onClick={() => handleOpenDetail(ex)}
                            className="px-4 py-2 rounded-lg text-[10px] font-bold text-white uppercase bg-[#1E3A8A] hover:bg-[#1E40AF] dark:bg-emerald-600 dark:hover:bg-emerald-700 flex items-center gap-1.5 transition shadow-sm hover:shadow cursor-pointer"
                          >
                            {needsUpgrade ? (
                              <>
                                <Lock className="w-3.5 h-3.5 text-emerald-300" />
                                Premium Unlock
                              </>
                            ) : (
                              <>
                                View Technique
                                <ChevronRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Premium Upgrade Overlay if free */}
                      {needsUpgrade && (
                        <div className="absolute inset-0 z-10 bg-slate-950/85 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center text-white">
                          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                            <Lock className="w-5 h-5 animate-pulse" />
                          </div>
                          <h4 className="text-xs font-black tracking-wider uppercase text-emerald-400">Premium Locked</h4>
                          <p className="text-[10px] text-slate-350 max-w-xs mt-1 leading-snug">
                            Unlock step-by-step master tutorials, target anatomy maps, and interactive performance tracking.
                          </p>
                          <button
                            onClick={() => handleOpenDetail(ex)}
                            className="mt-3 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase rounded-lg shadow-sm transition-all cursor-pointer"
                          >
                            Preview Benefits
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Show more button if filtered exercises exceeds visibleCount */}
              {filteredExercises.length > visibleCount && (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-extrabold text-[11px] font-mono uppercase tracking-wider rounded-xl transition shadow hover:shadow-md cursor-pointer"
                  >
                    Load More Exercises ({filteredExercises.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}



      {/* 7. WEIGHT LOSS MEAL PLANS TAB (Visible strictly when searching weight loss) */}
      {activeSearchTab === "mealplans" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-950/5 text-xs text-slate-650 dark:text-emerald-400/90 flex gap-2">
            <Apple className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-extrabold uppercase font-mono text-[10px] tracking-wider leading-none mb-1">SHRED MEAL PLANS IDENTIFIED</p>
              These meal guidelines correspond dynamically to the Weight Loss, Fat Loss, and Lean Toning programs. They are formatted with optimal macro divisions favoring rapid metabolization.
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredMealPlans.map(prog => (
              <div key={prog.id} className="p-5 rounded-2xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                      MEAL TEMPLATE FOR: {prog.name}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">Pro Shredding Nutrition Formula</h4>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 mb-4 leading-normal">
                    This profile focuses on continuous metabolic processing while keeping energy substrates replenished.
                  </p>

                  {/* Render the program specific meal details */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-920 text-xs">
                    <p className="font-mono text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Clipboard className="w-3.5 h-3.5" />
                      MEAL SPLITS
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans mt-2 whitespace-pre-line">
                      {prog.schedule.find(s => s.mealPlan)?.mealPlan || "Macro Strategy: High Protein Lean Shred Plan. Minimize high carbohydrates; prioritize leafy greens, egg whites, raw veggies and lean poultry targets."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between gap-4">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">MACROS: Lean Deficit Formula</span>
                  <button 
                    onClick={() => handleOpenProgram(prog)}
                    className="text-xs font-bold text-blue-500 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    View Associated Exercises
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI WORKOUT BLUEPRINT GENERATOR TAB */}
      {activeSearchTab === "generator" && (
        <AiWorkoutGenerator />
      )}

       {/* 8. COMPLETE KINESIOLOGY EXERCISE CABINET DETAILS (SPLIT DRUMS) */}
       {selectedExercise && (
        <div 
          id="exercise-cabinet-drawer" 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedExerciseId(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm cursor-pointer animate-fade-in p-2 sm:p-4"
        >
          <div className="w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col rounded-3xl relative cursor-default animate-slide-down">
            
            {/* Header section with category and meta details */}
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 flex-shrink-0">
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-500 py-0.5 px-2.5 border border-emerald-500/20 rounded-full">
                  {selectedExercise.category}
                </span>
                <h3 className="text-xl font-black text-slate-950 dark:text-white mt-1.5 leading-none">
                  {selectedExercise.name}
                </h3>
              </div>
              
              <button 
                type="button"
                onClick={() => setSelectedExerciseId(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core content with ALL 11 required parameters */}
            <div id="drawer-scroll-container" className="p-6 space-y-6 text-slate-850 dark:text-slate-200 overflow-y-auto flex-1">
              
              {selectedExercise.isPremium && !isUserPremium ? (
                <div className="space-y-6">
                  {/* Visual Media Block (Blurred / Locked overlay) */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-48 bg-slate-950">
                    <WorkoutVisual 
                      category={selectedExercise.category} 
                      muscleGroups={selectedExercise.muscleGroups} 
                      exerciseName={selectedExercise.name} 
                      className="h-full w-full filter blur-lg opacity-30" 
                      customMediaUrl={selectedExercise.customMediaUrl}
                      customMediaType={selectedExercise.customMediaType}
                      isCard={true}
                    />
                    <div className="absolute inset-0 bg-slate-950/70 flex flex-col justify-center items-center text-center p-4">
                      <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-5 h-5 animate-bounce" />
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest">BIOMECHANICAL DEMO LOCKED</span>
                      <span className="text-[10px] text-slate-450 mt-1">HD video loop and kinesis align-track restricted to Premium members</span>
                    </div>
                  </div>

                  {/* Locked Parameter Indicators Checklist */}
                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase mb-2.5 flex items-center gap-1.5 leading-none">
                      <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                      Locked Kinesiology Parameters
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      Your current free-tier account is restricted from reading the 11 key training parameters for **{selectedExercise.name}**:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { num: "01", name: "HD Demonstration Loop", desc: "Interactive full range of motion." },
                        { num: "02", name: "Starting Alignment Position", desc: "Skeletal setups and joint angles." },
                        { num: "03", name: "Concentric Execution", desc: "Optimal force speed and direction." },
                        { num: "04", name: "Peak Finishing Squeeze", desc: "Holding concentric active tension." },
                        { num: "05", name: "Target Muscle Groups", desc: "Deep anatomical muscle breakdowns." },
                        { num: "06", name: "Form Warning Mistakes", desc: "Safety callouts protecting tendons." },
                        { num: "07", name: "Progression Variations", desc: "Complex muscular loading styles." },
                        { num: "08", name: "Alternative Exercises", desc: "Sub-swaps for versatile equipment." }
                      ].map((item) => (
                        <div key={item.num} className="p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-white dark:bg-slate-900 text-xs flex gap-2 shadow-xs">
                          <span className="font-mono text-emerald-500 font-extrabold text-[10px]">{item.num}</span>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white leading-tight uppercase text-[9px]">{item.name}</p>
                            <p className="text-[8px] text-slate-450 leading-none mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Premium Benefits Box */}
                  <div className="p-5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-xs">
                    <h5 className="font-extrabold uppercase font-mono text-[9px] tracking-widest text-emerald-500 dark:text-emerald-400 mb-2 leading-none flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      👑 AlexFitnessHub Premium Benefits
                    </h5>
                    <ul className="space-y-1.5 font-sans leading-relaxed text-slate-650 dark:text-emerald-300/80 text-[10.5px]">
                      <li className="flex items-start gap-1">
                        <span className="text-emerald-500 font-bold">&#10004;</span> Full access to **1,200+ clinical exercises** with biomechanical details.
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-emerald-500 font-bold">&#10004;</span> Dedicated **AI Fitness Coach** for 24/7 posture checks.
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-emerald-500 font-bold">&#10004;</span> Special **Celebrity & Military Training Programs** guides.
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-emerald-500 font-bold">&#10004;</span> **African & Global Meal Generators** with regional macro-tailored options.
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-emerald-500 font-bold">&#10004;</span> Interactive weight tracking charts and daily consistency logs.
                      </li>
                    </ul>
                  </div>

                  {/* Secure Checkout CTA */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-400">Unlock Master kinesis library</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        Activate your premium features securely via Paystack. Cancel anytime.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedExerciseId(null);
                        setView?.("home");
                        setTimeout(() => {
                          const pricingSec = document.getElementById("pricing_anchor_block");
                          if (pricingSec) pricingSec.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase rounded-lg tracking-wider shadow transition-all shrink-0"
                    >
                      Upgrade via Paystack
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* EXERCISE DEMONSTRATION MULTIMEDIA PLAYER */}
                  <div id="instruction-param-demo">
                    <h4 className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      Exercise Demo
                    </h4>
                    <WorkoutVisual 
                      exerciseId={selectedExercise.id}
                      category={selectedExercise.category} 
                      muscleGroups={selectedExercise.muscleGroups} 
                      exerciseName={selectedExercise.name} 
                      className="h-64 w-full" 
                      customMediaUrl={selectedExercise.customMediaUrl}
                      customMediaType={selectedExercise.customMediaType}
                    />

                    {/* Performance media drag & drop uploader */}
                    {user && (user.email === "alexfitnesshub@gmail.com" || user.email === "muzikworld08@gmail.com") && (
                      <CustomPerformanceUpload 
                        exercise={selectedExercise}
                        uploadExerciseMedia={uploadExerciseMedia}
                      />
                    )}
                  </div>

                  {/* HOW TO PERFORM & TARGET MUSCLES */}
                  <div id="instruction-param-biomechanics" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-4">
                    <h4 className="text-xs font-extrabold text-blue-600 dark:text-emerald-405 uppercase tracking-wide border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                      <Compass className="w-4 h-4" />
                      How To Perform
                    </h4>

                    <div className="space-y-3.5 text-xs leading-relaxed">
                      {/* Starting Position */}
                      <div>
                        <span className="font-extrabold text-blue-650 dark:text-blue-400 block uppercase text-[10px]">Starting Setup:</span>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">{selectedExercise.startingPosition}</p>
                      </div>

                      {/* Movement Execution */}
                      <div>
                        <span className="font-extrabold text-orange-600 dark:text-orange-400 block uppercase text-[10px]">Execution Guide:</span>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">{selectedExercise.movementExecution}</p>
                      </div>

                      {/* Finishing Position */}
                      <div>
                        <span className="font-extrabold text-purple-650 dark:text-purple-400 block uppercase text-[10px]">Finishing Lock & Squeeze:</span>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">{selectedExercise.finishingPosition}</p>
                      </div>

                      {/* Muscles Worked */}
                      <div>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-500 block uppercase text-[10px]">Muscles Worked:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {selectedExercise.musclesWorked.map((muscle) => (
                            <span key={muscle} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold px-2.5 py-1 rounded uppercase">
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EQUIPMENT CHECKLIST */}
                  <div id="instruction-param-equip">
                    <h4 className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">
                      Equipment Needed
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedExercise.equipment.map((eq) => (
                        <div key={eq} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white uppercase text-[10px] leading-none">{eq}</p>
                            <p className="text-[8px] text-slate-500 leading-none mt-0.5">Verified functional gear</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COMMON MISTAKES & SAFETY TIPS */}
                  <div id="instruction-param-safety" className="grid md:grid-cols-2 gap-4">
                    
                    {/* Common Mistakes */}
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15">
                      <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Common Mistakes
                      </h5>
                      <ul className="space-y-1.5 text-xs text-slate-650 dark:text-rose-400/90 leading-relaxed">
                        {selectedExercise.commonMistakes.map((mistake, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="shrink-0 text-rose-500 font-bold">&#10006;</span>
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Safety Tips */}
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <h5 className="text-xs font-bold text-amber-600 dark:text-amber-450 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                        <Shield className="w-4 h-4" />
                        Safety & Protection Tips
                      </h5>
                      <ul className="space-y-1.5 text-xs text-slate-650 dark:text-amber-400/90 leading-relaxed">
                        {selectedExercise.safetyTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="shrink-0 text-amber-600 dark:text-amber-400 font-bold">&#10004;</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* EXERCISE VARIATIONS */}
                  <div id="instruction-param-variations" className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3.5 text-xs bg-slate-50/50 dark:bg-transparent">
                    <h5 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5">
                      Exercise Variations
                    </h5>

                    {/* Alternatives, Progression & Regression */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="block text-[8px] font-bold uppercase text-slate-450 dark:text-slate-500">Alternative Swaps</span>
                        <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5 leading-snug">
                          {selectedExercise.alternativeExercises.join(" / ") || "Standard swaps applies"}
                        </p>
                      </div>

                      {/* Progression */}
                      <div>
                        <span className="block text-[8px] font-bold uppercase text-slate-450 dark:text-slate-500">Advanced Progression</span>
                        <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5 leading-snug">
                          {selectedExercise.progressionVariations.join(" / ") || "High density loads"}
                        </p>
                      </div>

                      {/* Regression */}
                      <div>
                        <span className="block text-[8px] font-bold uppercase text-slate-450 dark:text-slate-500">Regression Options</span>
                        <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5 leading-snug">
                          {selectedExercise.regressionVariations.join(" / ") || "Knee assisted splits"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* LOG COMPLETION STATE CONFORM LOGIC */}
                  {user ? (
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                      <h4 className="text-xs font-bold text-slate-650 dark:text-slate-300 uppercase mb-3">
                        Log Workout Performance
                      </h4>

                      {logSuccess ? (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Form submission recorded cleanly. Sync completed with user dashboard index!
                        </div>
                      ) : (
                        <form onSubmit={handleLogCompletion} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Target Reps</label>
                            <input
                              type="number"
                              value={loggedReps}
                              onChange={(e) => setLoggedReps(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white rounded focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Target Load (KG)</label>
                            <input
                              type="number"
                              value={loggedWeight}
                              onChange={(e) => setLoggedWeight(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white rounded focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Coaching notes and performance index</label>
                            <input
                              type="text"
                              placeholder="Felt excellent contraction. Joint movement felt completely stable."
                              value={loggedNotes}
                              onChange={(e) => setLoggedNotes(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white rounded focus:outline-none"
                            />
                          </div>
                          <button
                            type="submit"
                            className="sm:col-span-3 py-3 bg-[#1E3A8A] hover:bg-[#1E40AF] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest font-mono flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Log Workout Set
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-950/60 text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800/80">
                      Please sign-in to enroll, save routines, track sets, and compile dynamic history charts.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. PREMIUM PROGRAM DETAILS OVERLAY / MODAL SCHEDULES */}
      {selectedProgram && (
        <div 
          id="program-cohort-detail" 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedProgram(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm cursor-pointer animate-fade-in p-2 sm:p-4"
        >
          <div className="w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-slate-900 border border-slate-805 rounded-3xl shadow-2xl flex flex-col relative cursor-default animate-slide-down">
            
            {/* Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-850 flex items-center justify-between flex-shrink-0">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  {selectedProgram.category}
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">{selectedProgram.name}</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-805"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-6 text-slate-300 overflow-y-auto flex-1">
              
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest mb-1">PROGRAM DESCRIPTION</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedProgram.description}</p>
              </div>

              {/* Weekly Schedule with Associated Exercises */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">WEEKLY TRAINING SCHEDULE</h5>
                
                <div className="space-y-3">
                  {selectedProgram.schedule.map((sch, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-xs text-left">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                        <span className="font-extrabold text-emerald-400 uppercase font-mono tracking-wider">{sch.day}</span>
                        <span className="text-[10px] font-semibold text-slate-200">{sch.focus}</span>
                      </div>

                      <div className="space-y-2 mt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">TARGET EXERCISES:</p>
                        <div className="flex flex-wrap gap-2">
                          {sch.exercises.map((exName, idx) => {
                            // Find matching exercise in DB
                            const match = exercises.find(ex => ex.name.toLowerCase() === exName.toLowerCase() || ex.id.toLowerCase().includes(exName.toLowerCase().replace(/\s+/g, "-")));
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  if (match) {
                                    handleOpenDetail(match);
                                  } else {
                                    alert(`To practice ${exName}, browse the Exercises lists. Keep form strict!`);
                                  }
                                }}
                                className="px-3 py-1 bg-slate-900 hover:bg-slate-850 text-white font-sans text-[11px] rounded border border-slate-800 transition flex items-center gap-1 group"
                              >
                                <Play className="w-2.5 h-2.5 text-emerald-400 group-hover:scale-110" />
                                {exName}
                                <span className="text-[8px] text-slate-500 group-hover:text-emerald-400 ml-1">→ VIEW</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Display Nutrition integration plan inside program! */}
                      {sch.mealPlan && (
                        <div className="mt-4 pt-3 border-t border-slate-900">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase font-mono flex items-center gap-1 mb-1">
                            <Apple className="w-3.5 h-3.5 text-emerald-400" />
                            INTEGRATED DIET & MACRO LOGS:
                          </p>
                          <p className="text-[11px] text-slate-350 bg-slate-900 p-2.5 rounded-lg border border-slate-850 leading-relaxed italic">
                            {sch.mealPlan}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Active Sign-In checks */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-white uppercase font-mono tracking-wider leading-none">READY FOR DEPLOYMENT</p>
                  <p className="text-slate-400 mt-1 leading-none">Press below to save schedules directly to dashboard charts.</p>
                </div>
                {user ? (
                  <button
                    onClick={() => {
                      alert(`Congratulations! You have successfully enrolled in: ${selectedProgram.name}! Check your Dashboard schedule page for today's logs.`);
                      setSelectedProgram(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-extrabold uppercase text-[10px] font-mono tracking-wide text-white rounded transition shadow"
                  >
                    Start Training Now
                  </button>
                ) : (
                  <span className="text-slate-500 italic text-[10px]">Sign-in to trigger tracking</span>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// CUSTOM WORKOUT PERFORMANCE FILE UPLOADER
// ==========================================
function CustomPerformanceUpload({ 
  exercise, 
  uploadExerciseMedia 
}: { 
  exercise: Exercise;
  uploadExerciseMedia: (exerciseId: string, mediaUrl: string | null, mediaType?: "image" | "video") => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    setLoading(true);
    setErrorMsg("");

    const fileType = file.type;
    const isVideo = fileType.startsWith("video/");
    const isImage = fileType.startsWith("image/");

    if (!isVideo && !isImage) {
      setErrorMsg("Please upload an image, GIF, or video file.");
      setLoading(false);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("File size exceeds 15MB. Please upload a smaller clip or GIF.");
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const mediaUrl = event.target.result as string;
        const mediaType = isVideo ? "video" : "image";
        uploadExerciseMedia(exercise.id, mediaUrl, mediaType);
      } else {
        setErrorMsg("Failed to read file.");
      }
      setLoading(false);
    };
    reader.onerror = () => {
      setErrorMsg("An error occurred reading the file.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    uploadExerciseMedia(exercise.id, null);
  };

  return (
    <div 
      id={`upload-zone-${exercise.id}`}
      className="mt-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-705 dark:text-slate-300 flex items-center gap-1.5">
          <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />
          Workout Performance Media
        </h5>
        {exercise.customMediaUrl && (
          <button
            type="button"
            id={`reset-media-btn-${exercise.id}`}
            onClick={handleReset}
            className="p-1 px-2 hover:bg-red-500/10 hover:text-red-500 text-slate-400 text-[10px] uppercase font-mono font-bold rounded flex items-center gap-1 transition"
          >
            <Trash2 className="w-3 h-3" />
            Reset Custom Media
          </button>
        )}
      </div>

      {exercise.customMediaUrl ? (
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-3">
          {exercise.customMediaType === "video" ? (
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <FileVideo className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <FileImage className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">Custom Demonstration Active</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Format: base64 {exercise.customMediaType}</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold py-0.5 px-2 rounded uppercase">
            Active
          </span>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-6 border border-dashed rounded-lg text-center cursor-pointer transition ${
            dragActive 
              ? "border-emerald-500 bg-emerald-500/51" 
              : "border-slate-300 dark:border-slate-800 hover:border-slate-450 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-950/35"
          }`}
          onClick={() => document.getElementById(`file-upload-input-${exercise.id}`)?.click()}
        >
          <input
            type="file"
            id={`file-upload-input-${exercise.id}`}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileInput}
          />
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-slate-500">Reading media data...</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Drag & drop your demo performance clip, GIF, or photo
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                or <span className="text-emerald-500 dark:text-emerald-400 font-bold decoration-dotted underline">browse local drive</span> (max 15MB)
              </p>
            </>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-[10px] font-bold text-rose-500 mt-2 font-sans flex items-center gap-1">
          <span>&#9888;</span> {errorMsg}
        </p>
      )}
    </div>
  );
}
