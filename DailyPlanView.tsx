import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Search, Sparkles, BookOpen, 
  Dumbbell, Check, Calendar, ArrowLeft, ArrowRight, Save, Info, AlertTriangle
} from "lucide-react";
import { CustomProgram } from "../types";

interface CustomProgramBuilderProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomProgramBuilder({ onClose, onSuccess }: CustomProgramBuilderProps) {
  const { user, exercises, saveCustomProgram } = useApp();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<{
    day: string;
    focus: string;
    exercises: {
      id: string;
      name: string;
      sets: number;
      reps: number;
      notes: string;
    }[];
  }[]>([
    { day: "Day 1", focus: "Push Hypertrophy", exercises: [] }
  ]);

  // Exercise Search State (for a specific day index being edited)
  const [activeDayIndexForAdd, setActiveDayIndexForAdd] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");

  // Filter exercises based on search & muscle selection
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === "All" || ex.muscleGroups.includes(selectedMuscle);
    return matchesSearch && matchesMuscle;
  });

  const muscleGroupsList = ["All", "Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Cardio"];

  // Handlers for Days
  const handleAddDay = () => {
    const nextDayNum = days.length + 1;
    setDays([
      ...days,
      { day: `Day ${nextDayNum}`, focus: "New Target Session", exercises: [] }
    ]);
    setActiveDayIndexForAdd(days.length); // auto open picker for new day
  };

  const handleRemoveDay = (index: number) => {
    if (days.length <= 1) {
      setErrorMsg("A program must contain at least one day.");
      setTimeout(() => setErrorMsg(""), 3050);
      return;
    }
    const nextDays = days.filter((_, i) => i !== index).map((day, i) => ({
      ...day,
      day: `Day ${i + 1}` // normalize day numbers
    }));
    setDays(nextDays);
    if (activeDayIndexForAdd === index) {
      setActiveDayIndexForAdd(0);
    }
  };

  const handleDayFocusChange = (index: number, val: string) => {
    const nextDays = [...days];
    nextDays[index].focus = val;
    setDays(nextDays);
  };

  const handleAddExerciseToDay = (dayIndex: number, exId: string, exName: string) => {
    const nextDays = [...days];
    // Check if copy already exists in that day just to remind them
    const exists = nextDays[dayIndex].exercises.some(e => e.id === exId);
    nextDays[dayIndex].exercises.push({
      id: exId,
      name: exName,
      sets: 3,
      reps: 10,
      notes: ""
    });
    setDays(nextDays);
  };

  const handleRemoveExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
    const nextDays = [...days];
    nextDays[dayIndex].exercises = nextDays[dayIndex].exercises.filter((_, i) => i !== exerciseIndex);
    setDays(nextDays);
  };

  const handleExerciseFieldChange = (dayIndex: number, exerciseIndex: number, field: "sets" | "reps" | "notes", val: any) => {
    const nextDays = [...days];
    nextDays[dayIndex].exercises[exerciseIndex] = {
      ...nextDays[dayIndex].exercises[exerciseIndex],
      [field]: val
    };
    setDays(nextDays);
  };

  const handleMoveExercise = (dayIndex: number, exerciseIndex: number, direction: "up" | "down") => {
    const nextDays = [...days];
    const targetArray = nextDays[dayIndex].exercises;
    const targetIdx = direction === "up" ? exerciseIndex - 1 : exerciseIndex + 1;
    
    if (targetIdx < 0 || targetIdx >= targetArray.length) return;
    
    const temp = targetArray[exerciseIndex];
    targetArray[exerciseIndex] = targetArray[targetIdx];
    targetArray[targetIdx] = temp;
    
    setDays(nextDays);
  };

  const handleSaveProgram = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!name.trim()) {
      setErrorMsg("Please enter an elegant program name.");
      return;
    }

    const totalExercises = days.reduce((sum, d) => sum + d.exercises.length, 0);
    if (totalExercises === 0) {
      setErrorMsg("Your program needs at least one selected exercise added to a day.");
      return;
    }

    setLoading(true);
    try {
      await saveCustomProgram({
        name: name.trim(),
        description: description.trim() || "Custom Premium Workout Program",
        schedule: days
      });
      setSuccessMsg("Custom program compiled and synchronized successfully!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication gap prevented compiling.");
    } finally {
      setLoading(false);
    }
  };

  // Restrict access to premium users
  const isPremiumUser = user?.subscriptionStatus === "premium";

  if (!isPremiumUser) {
    return (
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-6 max-w-2xl mx-auto shadow-xl">
        <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-amber-400 to-emerald-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-md">
          <Sparkles className="w-8 h-8 animate-pulse text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black font-sans text-slate-900 dark:text-white uppercase tracking-tight">
            Elite Custom Program Builder
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-semibold">
            The multi-day custom builder is an premium system feature. Build personalized macro schedules, arrange sets and reps, and bypass generic pre-made splits.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-left text-xs space-y-3 font-mono">
          <div className="flex gap-2 items-start">
            <span className="text-emerald-500">✔</span>
            <span>Multi-Day Split Sequencing Blueprint</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-emerald-500">✔</span>
            <span>Search & Add from {exercises.length} Pro Biomechanical Drills</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-emerald-500">✔</span>
            <span>Custom Load, Target Sets & Precision Rep Allocations</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-xl font-mono text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={onClose} // Let them trigger direct billing or read premium highlights
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-mono text-xs uppercase tracking-widest transition shadow hover:scale-[1.01] cursor-pointer"
          >
            Upgrade Membership
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 space-y-6 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Visual Accent top ribbon */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-indigo-500 via-emerald-400 to-sky-400" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-5">
        <div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-emerald-400 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 mb-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-emerald-400" />
            Custom Program Builder
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Construct your ideal macro training blocks by searching the library, compiling days, and sequence details.
          </p>
        </div>

        <button
          onClick={handleSaveProgram}
          disabled={loading}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-950 font-black uppercase text-xs font-mono tracking-widest rounded-2xl shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? "Compiling..." : "Save Custom Program"}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex items-center gap-2 font-mono">
          <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
          {successMsg}
        </div>
      )}

      {/* Main Core Body Split Column grids */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left pane: Program Specs, Days builder */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Metadata entry */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-emerald-400 uppercase tracking-widest font-mono">
              Base Program Specs
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">PROGRAM TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Aesthetic Cut Split"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-sans text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">SHORT SPECIFICATION</label>
                <input
                  type="text"
                  placeholder="e.g. 6-Week High Volume hypertrophy protocol"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-sans text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Days Splits Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white uppercase font-mono">
                Workout Splits & Routine Sequence ({days.length} Days)
              </h3>
              <button
                onClick={handleAddDay}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 text-emerald-400 dark:text-sky-400 rounded-xl font-mono text-[10px] uppercase tracking-wider border border-slate-850 dark:border-sky-500/20 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Training Day
              </button>
            </div>

            <div className="space-y-4">
              {days.map((dayObj, dayIdx) => (
                <div 
                  key={dayIdx} 
                  className={`p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-950 ${
                    activeDayIndexForAdd === dayIdx 
                      ? "border-emerald-500/30 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/10" 
                      : "border-slate-200 dark:border-slate-900"
                  }`}
                >
                  {/* Day header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-900 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-18 flex items-center justify-center font-mono font-black text-xs uppercase bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-emerald-404 rounded-lg px-2">
                        {dayObj.day}
                      </span>
                      <input
                        type="text"
                        value={dayObj.focus}
                        onChange={(e) => handleDayFocusChange(dayIdx, e.target.value)}
                        className="text-xs font-extrabold uppercase font-sans text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-800 focus:border-emerald-400 py-1 outline-none w-full sm:w-48"
                        placeholder="Session focus / group..."
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setActiveDayIndexForAdd(dayIdx)}
                        className={`px-3 py-1 text-[10px] font-mono font-semibold uppercase rounded transition duration-150 cursor-pointer border ${
                          activeDayIndexForAdd === dayIdx
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : "bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                        }`}
                      >
                        {activeDayIndexForAdd === dayIdx ? "● Active Target" : "Select Day to Add"}
                      </button>
                      <button
                        onClick={() => handleRemoveDay(dayIdx)}
                        className="p-1 px-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded transition duration-150 cursor-pointer"
                        title="Remove training day"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Day Exercises Added List */}
                  {dayObj.exercises.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-900 rounded-xl">
                      <p className="text-[11px] text-slate-500">No exercises added to this day yet.</p>
                      <button
                        onClick={() => {
                          setActiveDayIndexForAdd(dayIdx);
                          const searchSection = document.getElementById("exercise-search-helper");
                          searchSection?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-[10px] font-bold text-emerald-400 hover:underline mt-1 font-mono uppercase cursor-pointer"
                      >
                        + Pick Exercises from side list
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {dayObj.exercises.map((exItem, exIdx) => (
                        <div 
                          key={exIdx} 
                          className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-900 rounded-xl space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4"
                        >
                          <div className="space-y-1 sm:max-w-xs">
                            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 p-0.5 px-1.5 uppercase font-bold tracking-wider leading-none">
                              Step {exIdx + 1}
                            </span>
                            <h5 className="text-xs font-extrabold text-slate-900 dark:text-white leading-none mt-1">
                              {exItem.name}
                            </h5>
                          </div>

                          {/* Detail selectors inside split */}
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-slate-500">SETS</span>
                              <input
                                type="number"
                                min="1"
                                max="15"
                                value={exItem.sets}
                                onChange={(e) => handleExerciseFieldChange(dayIdx, exIdx, "sets", parseInt(e.target.value) || 3)}
                                className="w-11 text-center p-1 font-mono text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded"
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-slate-500">REPS</span>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={exItem.reps}
                                onChange={(e) => handleExerciseFieldChange(dayIdx, exIdx, "reps", parseInt(e.target.value) || 10)}
                                className="w-12 text-center p-1 font-mono text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded"
                              />
                            </div>

                            <input
                              type="text"
                              value={exItem.notes || ""}
                              placeholder="Notes (e.g. 3 sec eccentric)"
                              onChange={(e) => handleExerciseFieldChange(dayIdx, exIdx, "notes", e.target.value)}
                              className="w-full sm:w-44 p-1 px-2.5 font-sans text-[11px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded placeholder-slate-500"
                            />
                          </div>

                          {/* Quick position manipulation arrows & removes */}
                          <div className="flex items-center gap-1 self-end sm:self-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-905 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                            <button
                              onClick={() => handleMoveExercise(dayIdx, exIdx, "up")}
                              disabled={exIdx === 0}
                              className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 rounded disabled:opacity-30 cursor-pointer"
                              title="Move step up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveExercise(dayIdx, exIdx, "down")}
                              disabled={exIdx === dayObj.exercises.length - 1}
                              className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 rounded disabled:opacity-30 cursor-pointer"
                              title="Move step down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemoveExerciseFromDay(dayIdx, exIdx)}
                              className="p-1 px-2 hover:bg-rose-500/15 text-slate-400 hover:text-rose-500 rounded transition cursor-pointer ml-1"
                              title="Remove exercise from day"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right pane: Exercise Library Browser picker (Fixed helper layout) */}
        <div id="exercise-search-helper" className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 sticky top-4 max-h-[85vh] overflow-y-auto space-y-4">
            
            <div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-black text-slate-900 dark:text-emerald-400 uppercase tracking-widest font-mono">
                  Biomechanical exercise Library
                </h4>
              </div>
              <p className="text-[10px] text-slate-550 leading-normal mt-1">
                {activeDayIndexForAdd !== null ? (
                  <span>Select drills below to append into <strong className="text-slate-900 dark:text-white uppercase font-mono bg-slate-200 dark:bg-slate-900 px-1 py-0.5 rounded">Day {activeDayIndexForAdd + 1} ({days[activeDayIndexForAdd]?.focus})</strong></span>
                ) : (
                  <span className="text-rose-500 font-medium">Please activate details on a day above to add.</span>
                )}
              </p>
            </div>

            {/* Internal search inputs */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Query exercise names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8.5 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-weights-900 rounded-xl focus:outline-none focus:border-emerald-400 text-slate-900 dark:text-white font-sans"
                />
              </div>

              {/* Muscle filter labels */}
              <div className="flex flex-wrap gap-1">
                {muscleGroupsList.map(muscle => (
                  <button
                    key={muscle}
                    onClick={() => setSelectedMuscle(muscle)}
                    className={`text-[9px] font-mono py-1 px-2.5 rounded-lg border uppercase tracking-wider transition ${
                      selectedMuscle === muscle
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 font-bold"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {muscle}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtered Exercises List container */}
            <div className="space-y-2 max-h-[45vh] overflow-y-auto border-t border-slate-150 dark:border-slate-900 pt-3">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">No matching biomechanical matches found.</div>
              ) : (
                filteredExercises.map(ex => (
                  <div 
                    key={ex.id}
                    className="p-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-900 rounded-xl flex items-center justify-between gap-3 group hover:border-emerald-400/20 transition duration-150"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h6 className="text-[11px] font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                          {ex.name}
                        </h6>
                        {ex.isPremium && (
                          <span className="text-[7px] font-sans bg-amber-500/15 text-amber-500 rounded p-0.5 px-1 font-black uppercase">
                            Pro
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5 text-[8.5px] font-mono text-slate-500 mt-1 uppercase">
                        <span>{ex.category}</span>
                        <span>•</span>
                        <span>{ex.difficulty}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (activeDayIndexForAdd === null) {
                          setErrorMsg("Please select a training Day splits focus above first.");
                          setTimeout(() => setErrorMsg(""), 3000);
                          return;
                        }
                        handleAddExerciseToDay(activeDayIndexForAdd, ex.id, ex.name);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850 text-emerald-400 rounded-lg text-[9px] font-mono uppercase tracking-wider font-extrabold border border-slate-800/80 hover:border-emerald-500/20 transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Add to Split
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
