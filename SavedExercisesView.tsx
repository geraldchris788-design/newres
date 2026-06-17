import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Dumbbell, CheckCircle2, ChevronRight, ChevronLeft, Target, Scale, Ruler, 
  MapPin, Calendar, Compass, User, Clock, ShieldAlert, Heart, Settings
} from "lucide-react";

export default function OnboardingWizard() {
  const { user, completeOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Onboarding states
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("25");
  const [fitnessGoals, setFitnessGoals] = useState("Body Recomposition");
  const [weight, setWeight] = useState("80");
  const [targetWeight, setTargetWeight] = useState("72");
  const [height, setHeight] = useState("175");
  const [activityLevel, setActivityLevel] = useState("Moderately Active");
  const [workoutExperience, setWorkoutExperience] = useState("Beginner");
  const [availableEquipment, setAvailableEquipment] = useState("Full Gym");
  const [dietaryPreference, setDietaryPreference] = useState("Nigerian/African");
  const [foodAllergies, setFoodAllergies] = useState("None");
  const [healthRestrictions, setHealthRestrictions] = useState("None");
  const [dailySchedule, setDailySchedule] = useState("Desk Job");
  const [wakeUpTime, setWakeUpTime] = useState("06:00 AM");
  const [bedTime, setBedTime] = useState("10:00 PM");
  const [countryRegion, setCountryRegion] = useState("Nigeria");
  const [availableDays, setAvailableDays] = useState(4);
  const [trainingLocation, setTrainingLocation] = useState<"Home" | "Gym">("Gym");

  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (step < totalSteps) setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await completeOnboarding({
        gender,
        age: parseInt(age) || 25,
        fitnessGoals,
        weight: weight ? parseFloat(weight) : undefined,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        height: height ? parseFloat(height) : undefined,
        activityLevel,
        workoutExperience,
        availableEquipment,
        dietaryPreference,
        foodAllergies,
        healthRestrictions,
        dailySchedule,
        wakeUpTime,
        bedTime,
        countryRegion,
        availableDays,
        trainingLocation
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong while customizing your program. Let's try again.");
    } finally {
      setSaving(false);
    }
  };

  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8">
      
      {/* Container Card */}
      <div id="onboarding_wizard_container" className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300">
        
        {/* Background Ambient Glow */}
        <div id="glow_effects" className="absolute -top-32 -left-32 w-64 h-64 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Progress Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              ALEXFITNESSHUB ONBOARDING
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            STEP {step} OF {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Contents */}
        <div className="min-h-[340px] flex flex-col justify-center">
          
          {/* STEP 1: GENDER, AGE, REGION, SCHEDULE */}
          {step === 1 && (
            <div id="onboarding_step_1" className="space-y-5 animate-fade-in text-left">
              <div className="space-y-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" /> Tell Us About Yourself
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We collect this basic biochemical info to customize your baseline resting energy budgets and regional food plans.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Age (years)</label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      placeholder="25"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Country / Region</label>
                    <input
                      type="text"
                      value={countryRegion}
                      onChange={(e) => setCountryRegion(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold"
                      placeholder="Nigeria"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Daily Work Schedule</label>
                    <select
                      value={dailySchedule}
                      onChange={(e) => setDailySchedule(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Desk Job">Desk Job (Sedentary)</option>
                      <option value="Active Job">Active Job (On Feet)</option>
                      <option value="Heavy Labor">Heavy Labor (Severe Strain)</option>
                      <option value="Shift Work">Shift Work / Student</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STAGE-GOALS & OBJECTIVES */}
          {step === 2 && (
            <div id="onboarding_step_2" className="space-y-4 animate-fade-in text-left">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" /> Select Your Core Objective
                </h2>
                <p className="text-xs text-slate-500">
                  Choose from our list of supported goal models. Weekly routines are engineered around this target.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {[
                  { tag: "Fat Loss", label: "Fat Loss", desc: "Aggressive calorie deficits and high cardio prioritization." },
                  { tag: "Weight Loss", label: "Weight Loss", desc: "Safe, progressive drop in scale metrics." },
                  { tag: "Weight Gain", label: "Weight Gain", desc: "Calorie surplus focusing on size and skeletal force." },
                  { tag: "Muscle Gain", label: "Muscle Gain", desc: "For hypertrophic focus on targeted muscular tissues." },
                  { tag: "Lean Muscle Building", label: "Lean Muscle Building", desc: "Clean bulking protocols to minimize fat accumulation." },
                  { tag: "Body Recomposition", label: "Body Recomposition", desc: "Simultaneous fat reduction and muscle amplification." },
                  { tag: "Strength Building", label: "Strength Building", desc: "High intensity compound sets & long rest frames." },
                  { tag: "Endurance Improvement", label: "Endurance Improvement", desc: "Cardiovascular thresholds, lactate threshold expansion." },
                  { tag: "General Fitness", label: "General Fitness", desc: "Consistent general physical health and heart safety." }
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => setFitnessGoals(item.tag)}
                    className={`p-2.5 text-left rounded-xl border transition-all text-xs ${
                      fitnessGoals === item.tag
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-extrabold"
                        : "border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: METRIC ANTHROPOMETRY */}
          {step === 3 && (
            <div id="onboarding_step_3" className="space-y-5 animate-fade-in text-left">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-500" /> Body Metrics Definition
                </h2>
                <p className="text-xs text-slate-550 dark:text-slate-400">
                  We use weight and heights to establish metabolic coefficients and targets.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" /> Weight (KG)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-slate-400" /> Target Weight (KG)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-slate-400" /> Standing Height (CM)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: EXPERIENCE, GEAR & INJURIES */}
          {step === 4 && (
            <div id="onboarding_step_4" className="space-y-4 animate-fade-in text-left">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-500" /> Training & Restrictions Setup
                </h2>
                <p className="text-xs text-slate-500">
                  Tailors physical lift mechanics block according to available equipment and health triggers.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Experience Level</label>
                    <select
                      value={workoutExperience}
                      onChange={(e) => setWorkoutExperience(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Beginner">Beginner (&lt; 1 Year)</option>
                      <option value="Intermediate">Intermediate (1-3 Years)</option>
                      <option value="Advanced">Advanced (3+ Years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Available Equipment</label>
                    <select
                      value={availableEquipment}
                      onChange={(e) => setAvailableEquipment(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Full Gym">Full Loaded Gym (Barbell, Cables, Lats)</option>
                      <option value="Dumbbells Only">Dumbbells & Bench Only</option>
                      <option value="Resistance Bands">Resistance Bands Only</option>
                      <option value="Bodyweight Only">Bodyweight Only / Calisthenics</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Training Location</label>
                    <select
                      value={trainingLocation}
                      // @ts-ignore
                      onChange={(e) => setTrainingLocation(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Gym">Gym</option>
                      <option value="Home">Home Space</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Available Sessions</label>
                    <select
                      value={availableDays}
                      onChange={(e) => setAvailableDays(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="2">2 Days per Week</option>
                      <option value="3">3 Days per Week</option>
                      <option value="4">4 Days per Week</option>
                      <option value="5">5 Days per Week</option>
                      <option value="6">6 Days per Week</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black hover:text-rose-500 transition text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Health Restrictions & Injuries
                  </label>
                  <input
                    type="text"
                    value={healthRestrictions}
                    onChange={(e) => setHealthRestrictions(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="None, Knee pain, Shoulder injury, Asthma, lower back pain..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DIET PREFERENCE, ALLERGIES, WAKE UP & BED TIMES */}
          {step === 5 && (
            <div id="onboarding_step_5" className="space-y-4 animate-fade-in text-left">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-500" /> Nutrition & Circadian Schedule
                </h2>
                <p className="text-xs text-slate-550 dark:text-slate-400">
                  Defines food schedules, sleep targets, and allergen blocks.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Dietary Preference</label>
                    <select
                      value={dietaryPreference}
                      onChange={(e) => setDietaryPreference(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Nigerian/African">Nigerian & African</option>
                      <option value="Standard Mixed">International / Standard</option>
                      <option value="Keto">Keto (Low-Carb High-Fat)</option>
                      <option value="Vegan">Vegan (Plant-based)</option>
                      <option value="Vegetarian">Vegetarian (Egg/Dairy OK)</option>
                      <option value="High Protein">High Protein / Hypertrophy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Food Allergies</label>
                    <input
                      type="text"
                      value={foodAllergies}
                      onChange={(e) => setFoodAllergies(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      placeholder="None, Nuts, Lactose, Gluten..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Average Wake Up Time
                    </label>
                    <input
                      type="text"
                      value={wakeUpTime}
                      onChange={(e) => setWakeUpTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      placeholder="06:00 AM"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Average Bed Time
                    </label>
                    <input
                      type="text"
                      value={bedTime}
                      onChange={(e) => setBedTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      placeholder="10:00 PM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Consistency Activity Target Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Sedentary">Sedentary (desk job, minimal walk)</option>
                    <option value="Lightly Active">Lightly Active (active errands, 5k steps)</option>
                    <option value="Moderately Active">Moderately Active (exercises 3-4x weekly, 8k steps)</option>
                    <option value="Very Active">Very Active (heavy drills 5x weekly, 12k steps)</option>
                    <option value="Super Active">Super Active (Professional Athlete physical load)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: AI-PLAN GENERATION COMMENCEMENT */}
          {step === 6 && (
            <div id="onboarding_step_6" className="space-y-5 animate-fade-in text-left">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Assemble Smart Coach Model
                </h2>
                <p className="text-xs text-slate-500">
                  Ready to trigger our server-side engine to construct your customized daily plans, water scheduler and athletic routines!
                </p>
              </div>

              <div id="summary_metrics_box" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-150 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5"><span className="text-slate-400 font-mono">FITNESS TARGET:</span><strong className="text-emerald-500 uppercase font-black">{fitnessGoals}</strong></div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5"><span className="text-slate-400 font-mono">BIOMETRICS:</span><strong className="text-slate-900 dark:text-white">{weight} KG &bull; {height} CM (Target: {targetWeight} KG)</strong></div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5"><span className="text-slate-400 font-mono">EQUIPMENT & SPACE:</span><strong className="text-slate-900 dark:text-white">{availableEquipment} ({trainingLocation})</strong></div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5"><span className="text-slate-400 font-mono">DIET & ALLERGIES:</span><strong className="text-slate-900 dark:text-white">{dietaryPreference} (Allergies: {foodAllergies})</strong></div>
                <div className="flex justify-between"><span className="text-slate-400 font-mono">DAILY REST FRAME:</span><strong className="text-blue-500 font-mono">{wakeUpTime} - {bedTime}</strong></div>
              </div>
            </div>
          )}

        </div>

        {/* Buttons Nav Footer */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-150 dark:border-slate-850">
          {step > 1 && (
            <button
              id="onboarding_btn_back"
              onClick={handleBack}
              disabled={saving}
              className="py-3 px-5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              BACK
            </button>
          )}

          {step < totalSteps ? (
            <button
              id="onboarding_btn_next"
              onClick={handleNext}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl text-xs font-black font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow"
            >
              CONTINUE
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="onboarding_btn_submit"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-black font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/20"
            >
              {saving ? "GENERATING COACH BLUEPRINT..." : "LAUNCH PERSONAL FITNESS COACH"}
              <CheckCircle2 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
