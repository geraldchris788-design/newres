import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Exercise } from "../data/exercises";
import WorkoutVisual from "./WorkoutVisual";
import { 
  Sparkles, Lock, ChevronRight, Bookmark, Search, Trash2, 
  Dumbbell, CheckCircle2, Award, Calendar, HelpCircle, X, Check, Clipboard
} from "lucide-react";

interface SavedExercisesViewProps {
  setView: (view: string) => void;
}

export default function SavedExercisesView({ setView }: SavedExercisesViewProps) {
  const { 
    user, 
    exercises, 
    savedWorkouts, 
    toggleSaveWorkout, 
    logWorkoutCompletion 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedExerciseId) {
      // Reset scroll position of the backdrop container to top immediately and on next frame
      const resetScroll = () => {
        const backdrop = document.getElementById("saved-modal-backdrop");
        if (backdrop) {
          backdrop.scrollTop = 0;
        }
      };

      resetScroll();
      const timer = setTimeout(resetScroll, 50);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [selectedExerciseId]);

  // Form states for completion logger
  const [loggedReps, setLoggedReps] = useState("10");
  const [loggedWeight, setLoggedWeight] = useState("60");
  const [loggedNotes, setLoggedNotes] = useState("");
  const [logSuccess, setLogSuccess] = useState(false);

  const isUserPremium = user?.subscriptionStatus === "premium";

  // Filter bookmarked exercises
  const bookmarkedExercises = useMemo(() => {
    return exercises.filter((ex) => savedWorkouts.includes(ex.id));
  }, [exercises, savedWorkouts]);

  // Unique categories in saved list
  const categories = useMemo(() => {
    const list = new Set(bookmarkedExercises.map((e) => e.category));
    return ["All", ...Array.from(list)];
  }, [bookmarkedExercises]);

  // Filter and Search saved list
  const filteredExercises = useMemo(() => {
    return bookmarkedExercises.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscleGroups.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || ex.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [bookmarkedExercises, searchQuery, selectedCategory]);

  const selectedExercise = useMemo(() => {
    if (!selectedExerciseId) return null;
    return exercises.find(ex => ex.id === selectedExerciseId) || null;
  }, [exercises, selectedExerciseId]);

  const handleOpenDetail = (ex: Exercise) => {
    setSelectedExerciseId(ex.id);
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
    }, 3000);
  };

  const needsUpgrade = (ex: Exercise) => ex.isPremium && !isUserPremium;

  return (
    <div id="saved-exercises-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* 1. HERO TITLE BLOCK */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Bookmark className="w-48 h-48 text-emerald-500" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                Dynamic Saved Vault ({bookmarkedExercises.length} Exercises)
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-sans font-black tracking-tight text-white leading-tight">
              YOUR SAVED <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-450 to-blue-400">WORKOUTS & EXERCISES</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-2 font-sans leading-relaxed">
              Curate and master your core biomechanical patterns. Pin your favorites here, preview video templates, and log performance history.
            </p>
          </div>
          <button
            onClick={() => setView("library")}
            className="self-start md:self-center px-5 py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer"
          >
            <Dumbbell className="w-4 h-4" />
            <span>Discover Exercises</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & RECOMMENDATION SECTION */}
      {bookmarkedExercises.length > 0 && (
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          {/* Custom Styled Input bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search by exercise name or primary muscle family..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 transition-all outline-hidden font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-black px-1.5"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. EXERCISES GRID LISTING */}
      {bookmarkedExercises.length === 0 ? (
        <div className="py-20 px-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950/40 max-w-3xl mx-auto flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-850 flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-200">
            <Bookmark className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-sans font-extrabold text-slate-900 dark:text-white leading-tight">Your Saved Vault is Empty</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            As you explore the workout library, bookmark technical movements so you can store tips, record practice sets, and customize coaching media.
          </p>
          <button
            onClick={() => setView("library")}
            className="mt-6 px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#1E40AF] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-[10px] font-mono font-black uppercase tracking-widest rounded-xl transition shadow-md active:scale-95 cursor-pointer"
          >
            Go to Workout Library
          </button>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950/40 shadow-xs">
          <HelpCircle className="w-10 h-10 text-slate-450 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No saved matches found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">Try adapting your search tag or filter query.</p>
          <button 
            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            className="mt-4 px-5 py-2 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white text-[10px] font-bold rounded-lg uppercase tracking-widest font-mono hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((ex) => {
            const hasUpgrade = needsUpgrade(ex);
            return (
              <div 
                key={ex.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-755 hover:shadow-lg transition-all"
              >
                {/* Visual Media Header Block */}
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
                  
                  {/* Premium Tag */}
                  {ex.isPremium && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
                      PREMIUM
                    </div>
                  )}

                  {/* Difficulty Tag */}
                  <div className="absolute top-3 right-3 bg-slate-900/90 text-white text-[9px] font-sans font-bold uppercase px-2.5 py-1 rounded border border-slate-700/40">
                    {ex.difficulty}
                  </div>
                </div>

                {/* Content Body Block */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-sans tracking-wide mb-1.5 font-bold">{ex.category}</div>
                    <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-emerald-500 transition-colors">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {ex.instructions[0]} Focus on high structural execution on every repetition.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {ex.equipment.map((eq) => (
                        <span key={eq} className="bg-slate-100 dark:bg-slate-900 text-[9px] font-sans font-bold text-slate-600 dark:text-slate-400 px-2 py-1 rounded uppercase">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleSaveWorkout(ex.id)}
                      className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-[10px] px-3.5 py-2 rounded-lg font-bold uppercase transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      title="Remove from saved list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>

                    <button
                      onClick={() => handleOpenDetail(ex)}
                      className="px-4 py-2 rounded-lg text-[10px] font-bold text-white uppercase bg-[#1E3A8A] hover:bg-[#1E40AF] dark:bg-emerald-600 dark:hover:bg-emerald-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      {hasUpgrade ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-emerald-300" />
                          Premium Limit
                        </>
                      ) : (
                        <>
                          View & Log
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Protected Upgrade Overlay for Premium variants */}
                {hasUpgrade && (
                  <div className="absolute inset-0 z-10 bg-slate-950/85 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center text-white">
                    <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                      <Lock className="w-5 h-5 animate-pulse" />
                    </div>
                    <h4 className="text-xs font-black tracking-wider uppercase text-emerald-400">Premium Locked</h4>
                    <p className="text-[10px] text-slate-300 max-w-xs mt-1.5 leading-snug">
                      Access precise instructions, multi-angle biomechanical loops, and active performance trackers.
                    </p>
                    <button
                      onClick={() => handleOpenDetail(ex)}
                      className="mt-3.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      Preview Benefits
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL DETAILED OVERLAY ZONE */}
      {selectedExercise && (
        <div 
          id="saved-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedExerciseId(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm cursor-pointer animate-fade-in p-2 sm:p-4"
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col cursor-default animate-slide-down">
            
            {/* Header control banner */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-[#1E3A8A]/10 text-[#1E3A8A]/90 dark:bg-emerald-500/10 dark:text-emerald-404 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                  {selectedExercise.category}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Saved Target ID</span>
              </div>
              <button
                onClick={() => setSelectedExerciseId(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Core Content */}
            <div id="saved-modal-scroll-container" className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-12 gap-8">
                
                {/* Standard Media Visual Column */}
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

                  {/* Muscles Worked Matrix Map */}
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

                {/* Right Metadata and Logging Panel */}
                <div className="md:col-span-5 space-y-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-sans font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                      {selectedExercise.name}
                    </h2>
                    
                    {/* Equipment labels */}
                    <div className="mt-3 flex flex-wrap gap-1.5 pb-4 border-b border-slate-150 dark:border-slate-850">
                      {selectedExercise.equipment.map((eq) => (
                        <span key={eq} className="bg-slate-105 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-[10px] font-sans font-bold text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          {eq}
                        </span>
                      ))}
                      <span className="bg-slate-105 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                        {selectedExercise.difficulty}
                      </span>
                    </div>

                    {/* Check if upgrade required */}
                    {needsUpgrade(selectedExercise) ? (
                      <div className="mt-6 p-5 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/[0.03] space-y-4">
                        <div className="flex gap-3">
                          <Lock className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-450">Biomechanical Upgrade Required</h4>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Upgrade to unlocked master accounts to read precise instructions, alternative setups, injury prevention tips, and complete logs.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setView("pricing")}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-mono font-black uppercase tracking-widest shadow-lg transition"
                        >
                          Unlock All Premium Exercises
                        </button>
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {/* Dynamic Step Instructions */}
                        <div>
                          <h4 className="text-[10px] font-mono font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-2">Step-by-step Execution</h4>
                          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                            {selectedExercise.instructions.map((inst, i) => (
                              <li key={i} className="pl-1 text-slate-650 dark:text-slate-350"><span className="font-semibold text-slate-800 dark:text-white">{inst}</span></li>
                            ))}
                          </ol>
                        </div>

                        {/* Starting/Execution states */}
                        <div className="mt-6 space-y-3.5 pt-4 border-t border-slate-150 dark:border-slate-850">
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
                    )}
                  </div>

                  {/* Practice Completion Logger */}
                  {!needsUpgrade(selectedExercise) && (
                    <div className="mt-8 pt-6 border-t border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-850">
                      <div className="flex items-center gap-2 mb-4">
                        <Clipboard className="w-4 h-4 text-[#1E3A8A] dark:text-emerald-400" />
                        <h4 className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none">Record Log Training Set</h4>
                      </div>

                      <form onSubmit={handleLogCompletion} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Reps Performed</label>
                            <input 
                              type="number" 
                              value={loggedReps}
                              onChange={(e) => setLoggedReps(e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none" 
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Load / Weight (KG)</label>
                            <input 
                              type="number" 
                              value={loggedWeight}
                              onChange={(e) => setLoggedWeight(e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Performance Form Notes</label>
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
                          className="w-full py-2 bg-[#1E3A8A] hover:bg-[#1E40AF] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Submit Session Log</span>
                        </button>
                      </form>

                      {logSuccess && (
                        <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-mono flex items-center gap-1">
                          <Check className="w-3 h-3 shrink-0" />
                          <span>Session successfully logged in your personal analytics!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom standard quick footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedExerciseId(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition"
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
