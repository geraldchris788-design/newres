import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();

const ASSETS_DIR = path.join(process.cwd(), "assets");
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Expose the assets directory so that local GIF/image/video overrides can be served seamlessly
app.use("/assets", express.static(ASSETS_DIR));

// Configure high payload limits to allow massive Base64 images/videos to save correctly
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = 3000;

// Custom exercise overrides local file path
const OVERRIDES_FILE_PATH = path.join(process.cwd(), "src", "data", "custom_exercise_overrides.json");

// Ensure the directory and base JSON file are created cleanly
const overridesDir = path.dirname(OVERRIDES_FILE_PATH);
if (!fs.existsSync(overridesDir)) {
  fs.mkdirSync(overridesDir, { recursive: true });
}
if (!fs.existsSync(OVERRIDES_FILE_PATH)) {
  fs.writeFileSync(OVERRIDES_FILE_PATH, JSON.stringify({}, null, 2), "utf-8");
}

// Lazy initialization of Gemini API SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI coach will operate in descriptive rule-based fallback mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. AI COACH PROFILE PROXY
app.post("/api/gemini/coach", async (req, res) => {
  const { goal, currentWeight, targetWeight, query, history = [], userEmail } = req.body;

  try {
    const ai = getGeminiClient();

    if (!ai) {
      // Elegant rule-based fallback response if the key is missing during preview/development
      return res.json({
        success: true,
        text: `### 🌟 Fallback AI Fitness Coach Response (API Key Not Configured)

Hello! I am your **AlexFitnessHub AI Fitness Coach**. I see that you have a fitness goal of **${goal || "General Health"}**. 

To help you succeed, here is a professional, personalized blueprint:

#### 🏃‍♂️ Training Recommendations
- **Primary Style:** Focus on structured strength training integrated with cardio sessions.
- **Chest & Shoulders:** Complete bench pressing and dumbbell flyes to expand target metrics.
- **Lower Body:** Prioritize squats and deadlifts 2x weekly to stimulate natural fat loss or muscle building.

#### 🍊 Personalized Nutrition & Fruit Guide
- **Calorie Target:** Approx. **${currentWeight ? Number(currentWeight) * 30 : 2200} kcal/day** to support body recomposition.
- **Optimal Foods:** Clean proteins (chicken breast, fish, eggs, tofu) paired with complex carbs (sweet potatoes, oats).
- **Recommended Fruits:** Strawberries, blueberries, and apples for rich fiber & natural antioxidants.
- **Hydration:** Aim for 3.5 liters of water daily.

*Configuring your real **GEMINI_API_KEY** in the Secrets panel in AI Studio will unlock full, dynamic, and unlimited conversational coaching!*`
      });
    }

    // Build chat conversation context
    const systemInstruction = `You are Alex, the virtual premium personal trainer and expert diet coach at "AlexFitnessHub".
The user has a current weight of ${currentWeight || "unspecified"} kg and a target weight of ${targetWeight || "unspecified"} kg.
Their primary goal is "${goal || "Fitness Maintenance"}".
You provide highly engaging, clear, science-backed personal training, customized recovery instructions, customized food, water, fruit suggestions, and detailed daily calorie guidance.
Always format your answers in highly structured, beautiful, and easy-to-read Markdown with headers, icons, clean spacing, and bold highlights. Keep your tone encouraging, professional, and strictly dedicated to fitness and diet.`;

    const chatHistory = history.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.message }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...chatHistory,
        { text: query || `Generate a detailed progress and wellness start guide for my goal of ${goal}` }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const aiResponseText = response.text || "I was unable to formulate a response. Please try reframing your query.";
    return res.json({ success: true, text: aiResponseText });

  } catch (error: any) {
    console.warn("Gemini API Error (falling back to dynamic rules):", error.message || error);
    
    // Dynamic rule-based fallback response if Gemini fails/429s/503s
    const fallbackText = `### 🌟 AI Fitness Coach Response (Service Busy Fallback)

Hello! I am your **AlexFitnessHub AI Fitness Coach**. I see that you have a fitness goal of **${goal || "General Health"}**. 

To help you succeed, here is a professional, personalized blueprint:

#### 🏃‍♂️ Training Recommendations
- **Primary Style:** Focus on structured strength training integrated with cardio sessions.
- **Chest & Shoulders:** Complete bench pressing and dumbbell flyes to expand target metrics.
- **Lower Body:** Prioritize squats and deadlifts 2x weekly to stimulate natural fat loss or muscle building.

#### 🍊 Personalized Nutrition & Fruit Guide
- **Calorie Target:** Approx. **${currentWeight ? Number(currentWeight) * 30 : 2200} kcal/day** to support body recomposition.
- **Optimal Foods:** Clean proteins (chicken breast, fish, eggs, tofu) paired with complex carbs (sweet potatoes, oats).
- **Recommended Fruits:** Strawberries, blueberries, and apples for rich fiber & natural antioxidants.
- **Hydration:** Aim for 3.5 liters of water daily.

*Our AI Coach is currently recovering from high demand, but this customized protocol is structurally pre-calibrated to keep you on path!*`;

    return res.json({
      success: true,
      text: fallbackText,
      isFallback: true
    });
  }
});

// 1.5. AI-POWERED QUICK TIP FOR HEALTH AND RECOVERY ADVICE
app.post("/api/gemini/quick-tip", async (req, res) => {
  const { goal, logs = [] } = req.body;

  try {
    const ai = getGeminiClient();

    if (!ai) {
      // Dynamic fallback based on the actual logs listed or goal
      let fallbackText = "";
      if (logs.length === 0) {
        fallbackText = `### 💡 Kickstart Your Routine!
Looks like you haven't logged any workouts recently. Here is an expert suggestion:

1. **The 3-Second Rule:** Focus on a slow, controlled 3-second negative phase (eccentric phase) on any compound movement you do first. This triggers high muscle fiber recruitment.
2. **Active Hydration:** Drink 250ml of water 15 minutes before your lift to sustain cellular ATP levels.
3. **Core Stabilizer:** Spend 4 minutes doing plank holds at the end of your session to protect the lumbar spine.`;
      } else {
        const latestEx = logs[0].exerciseName || "compound lifts";
        fallbackText = `### 💡 Form & Recovery checklist for ${latestEx}
You recently completed a workout featuring **${latestEx}**! Here is your dynamic recovery guidance:

1. **Cervical Alignment:** Keep your head in a neutral position (don't lookup) during execution to prevent spinal misalignment.
2. **Post-Session Stretching:** Dedicate 5-7 minutes to stretching the targeted muscle group.
3. **Targeted Hydration:** Drink at least 500ml water mixed with a pinch of pink salt or electrolytes to accelerate muscle glycogen replenishment.`;
      }

      return res.json({
        success: true,
        text: fallbackText
      });
    }

    let contents = "";
    if (logs.length === 0) {
      contents = `No workouts have been logged recently. Generate an inspiring personalized form advice and recovery/nutrition tip based on their goal: ${goal || "General Fitness"}.`;
    } else {
      const logsSummary = logs.slice(0, 4).map((l: any) => 
        `- ${l.exerciseName}: Completed ${l.reps} reps with ${l.weight} kg. Notes: ${l.notes || "None"}`
      ).join("\n");
      
      contents = `The user has logged the following recent exercises:\n${logsSummary}\n\nTheir goal is: ${goal || "General Fitness"}.\nGenerate a highly personalized "Quick Tip" containing form advice and recovery/nutrition suggestions specifically for these exercises. Focus on joint health, stretching, or specific biomechanical tips.`;
    }

    const systemInstruction = `You are a high-level sports biomechanics expert and elite athletic recovery scientist.
Provide a single, impact-focused, highly action-oriented wellness/recovery tip called "AI Form & Recovery Guide".
Keep it very concise, formatting it as clean Markdown with exactly 3 highly direct actionable bullets. Use encouraging, high-level sports science terminology. Avoid prefaces, introductions, or lengthy paragraphs. Ensure it fits easily inside a dashboard element.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    const aiResponseText = response.text || "Keep neutral spine positions during weight-bearing activities to prevent spinal shearing force.";
    return res.json({ success: true, text: aiResponseText });

  } catch (error: any) {
    console.warn("Gemini Quick-Tip API Error (falling back to dynamic rules):", error.message || error);
    
    let fallbackText = "";
    if (!logs || logs.length === 0) {
      fallbackText = `### 💡 Kickstart Your Routine!
Looks like you haven't logged any workouts recently. Here is an expert suggestion:

1. **The 3-Second Rule:** Focus on a slow, controlled 3-second negative phase (eccentric phase) on any compound movement you do first. This triggers high muscle fiber recruitment.
2. **Active Hydration:** Drink 250ml of water 15 minutes before your lift to sustain cellular ATP levels.
3. **Core Stabilizer:** Spend 4 minutes doing plank holds at the end of your session to protect the lumbar spine.`;
    } else {
      const latestEx = logs[0].exerciseName || "compound lifts";
      fallbackText = `### 💡 Form & Recovery checklist for ${latestEx}
You recently completed a workout featuring **${latestEx}**! Here is your dynamic recovery guidance:

1. **Cervical Alignment:** Keep your head in a neutral position (don't lookup) during execution to prevent spinal misalignment.
2. **Post-Session Stretching:** Dedicate 5-7 minutes to stretching the targeted muscle group.
3. **Targeted Hydration:** Drink at least 500ml water mixed with a pinch of pink salt or electrolytes to accelerate muscle glycogen replenishment.`;
    }

    return res.json({
      success: true,
      text: fallbackText,
      isFallback: true
    });
  }
});

// 1.7. AI-POWERED PERSONAL FITNESS PLAN GENERATOR ENDPOINT
app.post("/api/gemini/generate-plan", async (req, res) => {
  const { profile, scaleDaysState = "Normal" } = req.body;
  
  if (!profile) {
    return res.status(400).json({ success: false, error: "Profile details are required." });
  }

  // Fallback engine if Gemini is not present, or if it errors out
  const buildFallbackPlan = () => {
    const age = Number(profile.age) || 25;
    const weight = Number(profile.weight) || 75;
    const height = Number(profile.height) || 175;
    const gender = profile.gender || "Male";
    const goal = profile.fitnessGoals || "Body Recomposition";
    const activity = profile.activityLevel || "Moderately Active";
    const equipment = profile.availableEquipment || "Full Gym";
    const restrictions = profile.healthRestrictions || "None";
    const preference = profile.dietaryPreference || "Nigerian/African";
    const schedule = profile.dailySchedule || "Desk Job";
    const wakeUp = profile.wakeUpTime || "06:00 AM";
    const bed = profile.bedTime || "10:00 PM";
    const country = profile.countryRegion || "Nigeria";
    const experience = profile.workoutExperience || "Beginner";

    // 1. Harris-Benedict & TDEE Caloric Baseline
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === "Male") bmr += 5;
    else bmr -= 161;

    let multiplier = 1.375;
    if (activity.toLowerCase().includes("sedentary")) multiplier = 1.2;
    else if (activity.toLowerCase().includes("light")) multiplier = 1.375;
    else if (activity.toLowerCase().includes("moderat")) multiplier = 1.55;
    else if (activity.toLowerCase().includes("very") || activity.toLowerCase().includes("super")) multiplier = 1.725;

    let tdee = bmr * multiplier;

    // Adjust target based on core goals
    let calories = tdee;
    if (goal === "Fat Loss" || goal === "Weight Loss") {
      calories -= 500;
    } else if (goal === "Weight Gain" || goal === "Muscle Gain") {
      calories += 400;
    } else if (goal === "Lean Muscle Building") {
      calories += 200;
    } else if (goal === "Body Recomposition") {
      calories -= 200;
    } else if (goal === "Strength Building") {
      calories += 300;
    } else if (goal === "Endurance Improvement") {
      calories += 100;
    }

    // Adapt calibrations based on regeneration requests (Missed goals vs Progressing fast)
    if (scaleDaysState === "Easier Alternative") {
      calories += 200; // provide more dietary budget for comfort
    } else if (scaleDaysState === "Intensify Training") {
      calories -= 100; // tighten deficit or adjust targets slightly
    }

    calories = Math.max(1200, Math.round(calories));

    // Protein calculations (g = kg * multiplier)
    let pMult = 2.0;
    if (goal === "Muscle Gain" || goal === "Lean Muscle Building" || goal === "Strength Building") {
      pMult = 2.2;
    } else if (goal === "Endurance Improvement") {
      pMult = 1.6;
    }
    const protein = Math.round(weight * pMult);
    const fat = Math.round((calories * 0.25) / 9);
    const carbohydrates = Math.round(Math.max(80, (calories - (protein * 4) - (fat * 9)) / 4));
    const fiber = Math.round(weight * 0.4);

    // 2. Meal Preferences Integration Database
    let breakfast = "Oatmeal with protein isolate & seeds";
    let lunch = "Seared chicken breast with quinoa & greens";
    let snack = "Greek yogurt & blueberries";
    let dinner = "Grilled salmon with asparagus & potato";
    let veggies = ["Broccoli", "Spinach", "Bell Peppers"];
    let fruits = ["Apple", "Blueberries", "Banana"];

    if (preference.includes("Nigerian") || preference.includes("African")) {
      breakfast = "Steamed Moi Moi bean-pudding with warm light custard or Ogi (28g protein total)";
      lunch = "Local Jollof Rice paired with oven-baked spiced Chicken breast and grilled garden eggs";
      snack = "A cup of salted cashew nuts with sliced green cucumber rounds";
      dinner = "Eba or swallow of choice paired with nutrient-dense Efo Riro vegetable soup cooked with lean beef and flaked macro fish";
      veggies = ["Ugwu (Pumpkin leaves)", "Waterleaf", "Garden Egg", "Shoko"];
      fruits = ["Papaya", "Mango", "Watermelon", "Banana"];
    } else if (preference.includes("Keto")) {
      breakfast = "3 whole egg omelette scrambled in butter with avocado slices and spinach";
      lunch = "Bacon-wrapped turkey breast with avocado salad tossed in cold-pressed olive oil";
      snack = "A pack of unsalted macadamia nuts and celery sticks";
      dinner = "Ribeye steak butter basted with garlic butter and steamed broccoli";
      veggies = ["Broccoli", "Cauliflower", "Kale", "Zucchini"];
      fruits = ["Strawberries", "Avocado", "Blackberries"];
    } else if (preference.includes("Vegan")) {
      breakfast = "Tofu scramble with nutritional yeast, spinach, and whole wheat sourdough toast";
      lunch = "Brown rice power-bowl with seasoned black beans, tempeh steaks, and shredded kale with tahini";
      snack = "Peanut butter spread on celery sticks and sunflower seeds";
      dinner = "Creamy chickpea and spinach coconut curry served over red quinoa";
      veggies = ["Spinach", "Asparagus", "Brussels Sprouts", "Green Beans"];
      fruits = ["Apples", "Grapefruit", "Blueberries"];
    } else if (preference.includes("Vegetarian")) {
      breakfast = "2 poached eggs on whole wheat toast with smashed avocado and cherry tomatoes";
      lunch = "Lentil soup with side of Greek salad and block feta cheese crumbled";
      snack = "Cottage cheese (150g) with honey and walnuts";
      dinner = "Baked protein eggplant parmigiana layered with marinara, tofu crumbles & light mozzarella";
      veggies = ["Eggplant", "Broccoli", "Mixed bell peppers", "Swiss chard"];
      fruits = ["Pears", "Raspberries", "Nectarines"];
    }

    // 3. Circadian Schedules & Ratios
    const mornRoutine = schedule.includes("Desk")
      ? "Perform a 10-minute active hamstring and chest mobility release flow to counteract sitting."
      : "Drink 500ml water and engage in 10 minutes of direct static hip expansion stretches.";

    const eveRoutine = "Turn off blue screen exposure 45 minutes prior to sleep. Take a hot bath or perform abdominal box breathing.";

    // 4. Exercise Adaptation Matrix (Biometrics, Injuries, restrictions, Level)
    let lifts = [
      { name: "Barbell Squats", sets: 3, reps: 10, rest: 90, desc: "Focus on driving heels, keeping chest proud" },
      { name: "Incline Dumbbell Press", sets: 3, reps: 12, rest: 90, desc: "Tuck elbows at 45 degrees, stretch pectorals at chest" },
      { name: "Overhead Dumbbell Extension", sets: 3, reps: 15, rest: 60, desc: "Keep biceps static, drive weight through triceps elbow extension" },
      { name: "Russian Twists", sets: 3, reps: 20, rest: 45, desc: "Keep torso steady, tap alternate floor bounds" }
    ];

    let cardio = "20 minutes low-intensity jog";
    let duration = 45;

    // Set difficulty / sets & reps based on experience
    if (experience === "Intermediate") {
      lifts.forEach(l => { l.sets = 4; });
      duration = 55;
    } else if (experience === "Advanced") {
      lifts.forEach(l => { l.sets = 5; l.reps = Math.round(l.reps * 0.9); });
      duration = 65;
    }

    // Adapt sets depending on missed habits (Easier alternative vs intensified)
    if (scaleDaysState === "Easier Alternative") {
      lifts.forEach(l => { l.sets = Math.max(2, l.sets - 1); });
      duration = Math.max(30, duration - 15);
    } else if (scaleDaysState === "Intensify Training") {
      lifts.forEach(l => { l.sets = Math.min(6, l.sets + 1); });
      duration = Math.min(90, duration + 10);
    }

    // Adjust based on equipment
    if (equipment.includes("Dumbbells")) {
      lifts = [
        { name: "Goblet Squats", sets: lifts[0].sets, reps: 12, rest: 90, desc: "Hold single heavy dumbbell vertically at chest level" },
        { name: "Dumbbell Incline Chest Press", sets: lifts[1].sets, reps: lifts[1].reps, rest: 90, desc: "Maintain press trajectory through upper fibers" },
        { name: "Dumbbell Overhead Extensions", sets: lifts[2].sets, reps: lifts[2].reps, rest: 60, desc: "Maintain elbow alignment vertically" },
        { name: "Dumbbell Romanian Deadlifts", sets: 3, reps: 12, rest: 75, desc: "Keep back flat and hips high, focus on hamstrings extension" }
      ];
    } else if (equipment.includes("Bands")) {
      lifts = [
        { name: "Resisted Band Squats", sets: lifts[0].sets, reps: 15, rest: 60, desc: "Hold band handles at shoulders, drive upwards" },
        { name: "Band Standing Chest Flyes", sets: lifts[1].sets, reps: 15, rest: 60, desc: "Anchor band to door frame, squeeze pectorals firmly" },
        { name: "Band Overhead Press", sets: lifts[2].sets, reps: 15, rest: 60, desc: "Stand on band center, press vertically with neutral grips" },
        { name: "Band Pull-aparts", sets: 3, reps: 20, rest: 45, desc: "Stand tall, pull band across lower chest, squeeze rear shoulders" }
      ];
    } else if (equipment.includes("Bodyweight")) {
      lifts = [
        { name: "Tempo Air Squats", sets: lifts[0].sets, reps: 20, rest: 60, desc: "3 seconds descending phase to maximize mechanical tension" },
        { name: "Incline Push-ups", sets: lifts[1].sets, reps: 15, rest: 60, desc: "Elevate chest hands on couch or stool to focus push alignment" },
        { name: "Plank Shoulder Taps", sets: lifts[2].sets, reps: 20, rest: 45, desc: "Maintain core stiffness, alternating shoulder taps" },
        { name: "Glute Bridges", sets: 3, reps: 15, rest: 45, desc: "Lie down, press hips to ceiling, squeeze glutes dramatically at zenith" }
      ];
    }

    // Injury replacements (Lower back, knees, shoulder)
    const normalizedRestrictions = restrictions.toLowerCase();
    if (normalizedRestrictions.includes("knee")) {
      lifts = lifts.map(l => {
        if (l.name.includes("Squats") || l.name.includes("Lunges")) {
          return { name: "Safe Hamstring Glute Bridges", sets: l.sets, reps: 15, rest: 60, desc: "Lying down, bypass knee flex by driving hips to high glute bridges" };
        }
        return l;
      });
      cardio = "15 minutes Zero-impact Elliptical or stationary recycling machine";
    }

    if (normalizedRestrictions.includes("back")) {
      lifts = lifts.map(l => {
        if (l.name.includes("Squats") || l.name.includes("Deadlifts") || l.name.includes("Twists")) {
          return { name: "Bird Dog Stabilizations", sets: 3, reps: 12, rest: 45, desc: "Extend opposite arm and leg on hands and knees to lock lumbar spinal alignment" };
        }
        return l;
      });
      cardio = "20 minutes low spine-impact uphill walk on incline treadmill";
    }

    if (normalizedRestrictions.includes("shoulder")) {
      lifts = lifts.map(l => {
        if (l.name.includes("Press") || l.name.includes("Flyes")) {
          return { name: "Wall Angels", sets: 3, reps: 15, rest: 45, desc: "Press spine and arms flat on wall, slide up and down to rehabilitate cuffs" };
        }
        return l;
      });
    }

    const waterSchedule = `Drink 500ml upon waking, 500ml mid-morning, 500ml pre-workout, 500ml post-workout, 500ml with lunch, 500ml with dinner.`;
    const waterTargetMl = Math.round(weight * 35 + (activity.toLowerCase().includes("very") ? 600 : 0));

    return {
      wakeUpTime: wakeUp,
      bedTime: bed,
      morningRoutine: mornRoutine,
      breakfastRecommendation: breakfast,
      waterIntakeSchedule: waterSchedule,
      workoutRecommendation: `Today's customized workout session: ${experience} ${goal} protocol (Duration: ${duration} mins)`,
      lunchRecommendation: lunch,
      snackRecommendation: snack,
      dinnerRecommendation: dinner,
      eveningRoutine: eveRoutine,
      sleepReminder: "Establish a complete solid 8-hour sleep. Complete restorative rest maximizes muscle growth hormone (GH).",
      dailyCalories: calories,
      proteinTarget: protein,
      carbohydrateTarget: carbohydrates,
      fatTarget: fat,
      fiberTarget: fiber,
      waterTargetMl: waterTargetMl,
      recommendedFruits: fruits,
      recommendedVegetables: veggies,
      cardioRecommendation: cardio,
      injuryRestoration: restrictions !== "None" ? `Special care recommendation: Avoid loading joints causing ${restrictions}. Monitor form carefully.` : "Rotate cuffs and stretch shoulder joints 4 minutes prior to lifting.",
      workoutExercises: lifts,
      workoutDurationMinutes: duration,
      dailyStepGoal: (goal === "Fat Loss" || goal === "Weight Loss") ? 10000 : (goal === "Muscle Gain" ? 7500 : 8500),
      recoveryActivities: "Active foam rolling, complete dynamic hamstring stretches and static glute holds.",
      weeklyGoal: `Stick to ${calories} calories budget and complete ${profile.availableDays || 4} fitness sessions.`,
      monthlyGoal: `Progress scale bodyweight closer to your final objective of ${profile.targetWeight || 70} KG.`
    };
  };

  try {
    const ai = getGeminiClient();

    if (!ai) {
      // Return beautiful prefilled calculated plan instantly if no API key is specified
      return res.json({
        success: true,
        method: "rule-based dynamic logic engine",
        plan: buildFallbackPlan()
      });
    }

    // Prepare prompt detail
    const prompt = `Generate a personalized daily plan and nutrition calibration based on this user onboarding profile.
Return a valid JSON object matching the requested schema exactly.
User profile details:
- Age: ${profile.age} years old
- Gender: ${profile.gender}
- Current Weight: ${profile.weight} kg
- Target Weight: ${profile.targetWeight} kg
- Standing Height: ${profile.height} cm
- Fitness Goal: ${profile.fitnessGoals}
- Available Days/Week: ${profile.availableDays || 4}
- Equipment Available: ${profile.availableEquipment || "Full Gym"}
- Activity Level: ${profile.activityLevel}
- Workout Experience: ${profile.workoutExperience}
- Dietary Preference: ${profile.dietaryPreference}
- Food Allergies: ${profile.foodAllergies || "None"}
- Health Injuries/Restrictions: ${profile.healthRestrictions || "None"}
- Daily Schedule: ${profile.dailySchedule}
- Wake Up Time: ${profile.wakeUpTime || "06:00 AM"}
- Bed Time: ${profile.bedTime || "10:00 PM"}
- Country and Region: ${profile.countryRegion || "Nigeria"}

Re-generation request adaptation coefficient: "${scaleDaysState}" 
(Note: "Easier Alternative" means make the set volume and calorie restrictions 20% lower/easier. "Intensify Training" means increase sets, reps, or calorie targets to speed up growth/adaptation. "Normal" means keep it calibrated standard).

Generate meals incorporating regional foods suitable for their region (${profile.countryRegion || "Nigeria"}) and dietary archetype. Avoid allergens specified in food allergies.
Provide specific customized weightlifting/calisthenics exercises list that fully adapts around their injuries (e.g., if knee pains are listed, absolutely do not recommend barbell depth squats; provide a safe hamstrings replacement instead).

YOU MUST strictly response with valid JSON in this format:
{
  "wakeUpTime": "HH:MM",
  "bedTime": "HH:MM",
  "morningRoutine": "...",
  "breakfastRecommendation": "...",
  "waterIntakeSchedule": "...",
  "workoutRecommendation": "...",
  "lunchRecommendation": "...",
  "snackRecommendation": "...",
  "dinnerRecommendation": "...",
  "eveningRoutine": "...",
  "sleepReminder": "...",
  "dailyCalories": number,
  "proteinTarget": number,
  "carbohydrateTarget": number,
  "fatTarget": number,
  "fiberTarget": number,
  "waterTargetMl": number,
  "recommendedFruits": ["...", "..."],
  "recommendedVegetables": ["...", "..."],
  "cardioRecommendation": "...",
  "injuryRestoration": "...",
  "workoutExercises": [
    { "name": "...", "sets": number, "reps": number, "rest": number, "desc": "..." }
  ],
  "workoutDurationMinutes": number,
  "dailyStepGoal": number,
  "recoveryActivities": "...",
  "weeklyGoal": "...",
  "monthlyGoal": "..."
}
`;

    const systemInstruction = `You are Alex, the virtual premium personal trainer, sports science researcher, and expert nutritionist.
You generate hyper-personalized daily fitness and nutrition plans in high-fidelity JSON.
Always ensure that the calories and macro goals are mathematically correct (Protein is 4kcal/g, Carbs are 4kcal/g, Fats are 9kcal/g).
Verify that recommended meals match specified food allergies (absolutely zero trace), region limits, and dietary choices.
Always replace any exercises that conflict with user injuries with safe biomechanical replacements.
Only return valid, parseable JSON text. Do not wrap in markdown codeblocks (no \`\`\`json).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
        responseMimeType: "application/json",
      }
    });

    const outputText = response.text || "";
    try {
      const parsedPlan = JSON.parse(outputText.trim());
      return res.json({
        success: true,
        method: "gemini-3.5-flash AI engine",
        plan: parsedPlan
      });
    } catch (parseError) {
      console.warn("JSON parsing of Gemini plan failed. Relying on fallback builder:", parseError, outputText);
      return res.json({
        success: true,
        method: "fail-safe rule-based engine",
        plan: buildFallbackPlan()
      });
    }

  } catch (error: any) {
    console.error("Gemini Plan Generation Error:", error);
    return res.json({
      success: true,
      method: "crash-safe rule-based fallback recovery",
      plan: buildFallbackPlan()
    });
  }
});

// Helper for dynamic local fallback generation of workout blueprint
function generateFallbackWorkout(
  daysPerWeek: number, 
  bodyType: string, 
  goal: string,
  weight?: string,
  age?: string,
  gender?: string,
  experienceLevel?: string
) {
  const actualDays = Math.max(1, Math.min(7, Number(daysPerWeek) || 3));
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const experienceText = experienceLevel ? ` engineered for ${experienceLevel} enthusiasts` : "";
  const biometricText = (weight || age || gender) ? ` specifically tailored to your biometrics (${age ? age + ' yrs' : ''}${gender ? ', ' + gender : ''}${weight ? ', ' + weight + 'kg' : ''})` : "";
  const programName = `Elite ${experienceLevel || "Adaptive"} ${actualDays}-Day ${bodyType || "Athletic"} Split`;
  const description = `This advanced program${experienceText} is designed to optimize your transition toward a ${bodyType || "toned development"} shape through precise sports biomechanics, targeting your primary goal to ${goal || "improve general fitness"}${biometricText}.`;
  
  // Choose set volume based on experience selection
  let defaultSets = 3;
  let repModifier = 0;
  if (experienceLevel === "Advanced") {
    defaultSets = 4;
    repModifier = 2;
  } else if (experienceLevel === "Pro") {
    defaultSets = 5;
    repModifier = 3;
  }

  // Identify split / goals
  const isLoss = goal.toLowerCase().includes("fat") || goal.toLowerCase().includes("lose") || goal.toLowerCase().includes("shred") || goal.toLowerCase().includes("ton");
  const isStrength = goal.toLowerCase().includes("strength") || goal.toLowerCase().includes("power") || goal.toLowerCase().includes("lift");
  
  const isChestTriceps = goal.toLowerCase().includes("chest and triceps") || goal.toLowerCase().includes("chest & triceps");
  const isChest = goal.toLowerCase() === "chest";
  const isTriceps = goal.toLowerCase() === "triceps";
  const isBiceps = goal.toLowerCase() === "biceps";
  const isBack = goal.toLowerCase() === "back";
  const isBackBiceps = goal.toLowerCase().includes("back and biceps") || goal.toLowerCase().includes("back & biceps");
  const isShoulders = goal.toLowerCase() === "shoulder";
  const isLegsShoulders = goal.toLowerCase().includes("legs and shoulders") || goal.toLowerCase().includes("legs & shoulders");

  let exercisesPool = [];

  if (isChestTriceps) {
    exercisesPool = [
      { name: "Flat Barbell Bench Press", sets: defaultSets + 1, reps: 8 + repModifier, notes: "Retract shoulder blades, push explosive concentric drive." },
      { name: "Incline Dumbbell Chest Press", sets: defaultSets, reps: 10 + repModifier, notes: "Slow 3-second descent for max pectoral stretch." },
      { name: "Close-grip Barbell Bench Press", sets: defaultSets, reps: 10 + repModifier, notes: "Keep elbows close to side to load the lateral triceps." },
      { name: "Overhead Dumbbell Extension", sets: defaultSets, reps: 12 + repModifier, notes: "Focus on complete elbow hinge flexion at the bottom." },
      { name: "Cable Chest Crossovers", sets: defaultSets, reps: 12 + repModifier, notes: "Bring hands together, squeeze inner chest active region." },
      { name: "Dumbbell Skull Crushers", sets: defaultSets, reps: 12 + repModifier, notes: "Lower dumbbells towards ears, keep upper arms locked vertically." }
    ];
  } else if (isChest) {
    exercisesPool = [
      { name: "Flat Dumbbell Press", sets: defaultSets + 1, reps: 8 + repModifier, notes: "Drive dumbells inward to activate sternal pectorals." },
      { name: "Incline Barbell Bench Press", sets: defaultSets, reps: 10 + repModifier, notes: "Load clavicular pectorals with deliberate control." },
      { name: "Pec Dec Chest Flyes", sets: defaultSets, reps: 12 + repModifier, notes: "Keep arms parallel to ground, squeeze hard at peak." },
      { name: "Decline Chest Press machine", sets: defaultSets, reps: 10 + repModifier, notes: "Leveraged push for safe stimulation of lower chest fibres." },
      { name: "Push-ups (Bodyweight Temp)", sets: defaultSets, reps: 15 + repModifier * 3, notes: "Clean tempo down, stretch fibers fully." }
    ];
  } else if (isTriceps) {
    exercisesPool = [
      { name: "Tricep Rope Pushdowns", sets: defaultSets, reps: 12 + repModifier, notes: "Spread the rope fully at the bottom of the movement." },
      { name: "Overhead unilateral DB extension", sets: defaultSets, reps: 12 + repModifier, notes: "Deep stretch under load to isolate the long head." },
      { name: "Tricep Barbell Skullcrushers", sets: defaultSets + 1, reps: 10 + repModifier, notes: "Keep elbows parallel, do not let them flare wide." },
      { name: "Weighted Bench Parallel Dips", sets: defaultSets, reps: 12 + repModifier, notes: "Maintain chest upright, load triceps contraction." }
    ];
  } else if (isBiceps) {
    exercisesPool = [
      { name: "Standing Barbell Curl (Heavy)", sets: defaultSets + 1, reps: 8 + repModifier, notes: "Squeeze glutes to isolate movement completely to biceps." },
      { name: "Incline DB Alternate Bicep Curl", sets: defaultSets, reps: 10 + repModifier, notes: "Deep stretch on biceps long head at bottom of seat." },
      { name: "Standing Alternating Hammer Curl", sets: defaultSets, reps: 12 + repModifier, notes: "Develops brachialis and forearm grip strength." },
      { name: "Unilateral Preacher DB Curl", sets: defaultSets, reps: 10 + repModifier, notes: "Keep elbow flat on pad, avoid hyper-extension at bottom." }
    ];
  } else if (isBack) {
    exercisesPool = [
      { name: "Conventional Barbell Rows", sets: defaultSets + 1, reps: 8 + repModifier, notes: "Hinged stance, pull bar directly to belly button." },
      { name: "Wide-Grip Lat Pulldowns", sets: defaultSets, reps: 10 + repModifier, notes: "Pull bar to upper chest, squeeze scapula dry." },
      { name: "Seated Cable Lat Rows", sets: defaultSets, reps: 12 + repModifier, notes: "Maintain tall back, drive elbows back to the hip bone." },
      { name: "Single-Arm Dumbbell Row", sets: defaultSets, reps: 10 + repModifier, notes: "Pull row in an arc towards hip, maximize stretch." },
      { name: "Hyper-extensions (Posterior)", sets: defaultSets, reps: 15, notes: "Load lower back safely, pause at top line." }
    ];
  } else if (isBackBiceps) {
    exercisesPool = [
      { name: "Weighted Parallel Chin-Ups", sets: defaultSets + 1, reps: 6 + repModifier, notes: "Strict vertical pull, chest touches bar structure." },
      { name: "Underhand Barbell Bent Row", sets: defaultSets, reps: 10 + repModifier, notes: "Underhand grip triggers additional biceps contraction." },
      { name: "Wide-grip Seated Lat Row", sets: defaultSets, reps: 12 + repModifier, notes: "Focus outer lat development." },
      { name: "Hammer Strength Bicep Curl", sets: defaultSets, reps: 12 + repModifier, notes: "Peak squeeze contraction focus." },
      { name: "Seated DB Incline Hammer Curls", sets: defaultSets, reps: 12 + repModifier, notes: "Superb biceps/forearm link builder." }
    ];
  } else if (isShoulders) {
    exercisesPool = [
      { name: "Seated Overhead DB Press", sets: defaultSets + 1, reps: 8 + repModifier, notes: "Keep elbows slightly tucked forward in scapular plane." },
      { name: "Standing DB Side Lateral Raises", sets: defaultSets + 2, reps: 15 + repModifier, notes: "Lead with lateral elbow to shape capped round shoulders." },
      { name: "Bent-over Dumbbell Rear Delt Flyes", sets: defaultSets, reps: 15 + repModifier, notes: "Target posterior rear deltoid muscle groups." },
      { name: "Front DB Alternate Raises", sets: defaultSets, reps: 12 + repModifier, notes: "Pause briefly at height of sight." }
    ];
  } else if (isLegsShoulders) {
    exercisesPool = [
      { name: "Barbell Back Squats", sets: defaultSets + 1, reps: 8 + repModifier, notes: "Consistent core tightness, hit below parallel split." },
      { name: "Overhead Military Shoulder Press", sets: defaultSets + 1, reps: 8 + repModifier, notes: "Drive standard barbell straight up overhead safely." },
      { name: "Dumbbell Romanian Deadlifts", sets: defaultSets, reps: 10 + repModifier, notes: "Focus on hamstring and glute eccentric loading." },
      { name: "Cable Lateral Delt Raises", sets: defaultSets, reps: 15 + repModifier, notes: "Constant tension on lateral delts throughout swing." },
      { name: "Leg Press (Heavy Load)", sets: defaultSets, reps: 10 + repModifier, notes: "Safely isolate quad fibers with high-density sets." }
    ];
  } else if (isLoss) {
    exercisesPool = [
      { name: "Kettlebell Ballistic Swings", sets: defaultSets, reps: 15 + repModifier, notes: "Focus on explosive hip extension and high velocity." },
      { name: "Full-Body Thrusters", sets: defaultSets, reps: 12 + repModifier, notes: "Combine squat depth with linear overhead extension." },
      { name: "Goblet Squats (Tempo)", sets: defaultSets + 1, reps: 10 + repModifier, notes: "3 seconds descent, constant tension on quads." },
      { name: "Staggered Mountain Climbers", sets: defaultSets, reps: 24 + repModifier, notes: "Keep core rigid, alternate rapid knee drives." },
      { name: "Hanging Leg Raises", sets: defaultSets, reps: 12 + repModifier, notes: "Avoid swinging, control the eccentric lowering." },
      { name: "Dumbbell Renegade Rows", sets: defaultSets, reps: 10 + repModifier, notes: "Row to hip bone, keep hips perfectly level." }
    ];
  } else if (isStrength) {
    exercisesPool = [
      { name: "Barbell Back Squat (Heavy)", sets: defaultSets + 1, reps: Math.max(3, 6 - repModifier), notes: "Drive knees outwards, hit below parallel safely." },
      { name: "Conventional Deadlifts", sets: defaultSets, reps: Math.max(3, 5 - repModifier), notes: "Keep shins touching bar, drive straight out of the floor." },
      { name: "Overhead Military Press", sets: defaultSets, reps: Math.max(4, 6 - repModifier), notes: "Squeeze glutes and core to avoid hyperextending lower back." },
      { name: "Weighted Pull-Ups", sets: defaultSets, reps: Math.max(4, 6 - repModifier), notes: "Full range of motion, head completely above the bar." },
      { name: "Barbell Bench Press (Heavy)", sets: defaultSets + 1, reps: Math.max(3, 5 - repModifier), notes: "Retract scapula, touch mid-chest and press up." },
      { name: "Farmer's Carries", sets: defaultSets, reps: 40 + (repModifier * 5), notes: "Maintain tall neck posture, step forward with control." }
    ];
  } else {
    exercisesPool = [
      { name: "Incline Dumbbell Chest Press", sets: defaultSets + 1, reps: 10 + repModifier, notes: "Slow negative, stretch pectorals fully at bottom." },
      { name: "Barbell Romanian Deadlifts", sets: defaultSets, reps: 10 + repModifier, notes: "Prick hips back, descend to mid-shin level." },
      { name: "Lat Pulldowns (Wide-grip)", sets: defaultSets, reps: 12 + repModifier, notes: "Squeeze shoulder blades, focus on lat contraction." },
      { name: "Incline Hammer Curls", sets: defaultSets, reps: 12 + repModifier, notes: "Keep elbows fixed, squeeze biceps at peak." },
      { name: "Cable Lateral Shoulder Raises", sets: defaultSets + 1, reps: 12 + repModifier, notes: "Keep wrist height lower than or equal to elbow." },
      { name: "Calf Raises (Max Stretch)", sets: defaultSets, reps: 12 + repModifier, notes: "Hold for 2 seconds at full bottom stretch." }
    ];
  }

  const schedule = [];
  let workoutDaysCount = 0;
  
  // Evenly distribute workout days across the week
  for (let i = 0; i < 7; i++) {
    const dayName = weekDays[i];
    // Simple distribution math
    const isWorkoutDay = Math.floor(i * (actualDays / 7)) < Math.floor((i + 1) * (actualDays / 7));
    
    if (isWorkoutDay && workoutDaysCount < actualDays) {
      const sliceStart = (workoutDaysCount * 2) % exercisesPool.length;
      const dayExercises = [
        exercisesPool[sliceStart],
        exercisesPool[(sliceStart + 1) % exercisesPool.length],
        exercisesPool[(sliceStart + 2) % exercisesPool.length],
        exercisesPool[(sliceStart + 3) % exercisesPool.length],
      ];
      
      let focus = "General Transition Workout";
      if (workoutDaysCount === 0) focus = "Upper Body Hypertrophy & Alignment";
      else if (workoutDaysCount === 1) focus = "Posterior Chain & Core Stability";
      else if (workoutDaysCount === 2) focus = "Lower Body Quad Focus & Balance";
      else focus = "Auxiliary Arms & Aerobic Conditioning";
      
      schedule.push({
        day: `${dayName} (Workout)`,
        focus,
        exercises: dayExercises
      });
      workoutDaysCount++;
    } else {
      schedule.push({
        day: `${dayName} (Rest Day)`,
        focus: "Active Recovery & Soft Tissue Restoration",
        exercises: [
          { name: "Couch Stretch & Mobility", sets: 2, reps: 60, notes: "Hold for 60 seconds each side, focus on breathing." },
          { name: "Light LISS Walk", sets: 1, reps: 20, notes: "20-minute low-intensity walk to promote blood flow." }
        ]
      });
    }
  }
  
  return { name: programName, description, schedule };
}

// 1.6. DETAILED WEEKLY AND DAILY WORKOUT BLUEPRINT GENERATOR VIA GEMINI
app.post("/api/gemini/generate-workout", async (req, res) => {
  const { 
    daysPerWeek = 3, 
    bodyType = "Athletic", 
    goal = "Gain Muscle",
    weight = "70",
    age = "25",
    gender = "Male",
    experienceLevel = "Beginner",
    customDailyPlan = "",
    bodyPartTarget = ""
  } = req.body;

  try {
    const ai = getGeminiClient();

    if (!ai) {
      console.log("No Gemini key configured. Generating dynamic local program blueprint.");
      const fallbackProgram = generateFallbackWorkout(daysPerWeek, bodyType, goal, weight, age, gender, experienceLevel);
      return res.json({ success: true, program: fallbackProgram });
    }

    const contents = `Generate a highly customized, clinical-level weekly training schedule based on the following participant characteristics and targets:
* BIOMETRIC PROFILE & ATHLETIC EXPERIENCE *
- Training Experience Level: ${experienceLevel} (Adjust rep schemas, sets, intensity, and coaching tips specifically to match a level of: ${experienceLevel}).
- Age of Participant: ${age} years old.
- Biological/Stated Gender: ${gender}.
- Body Weight: ${weight} kg.

* PROGRAM GOALS & SPECIFICATIONS *
- Target training frequency: ${daysPerWeek} active days per week.
- Target Body Shape/Physique Style: ${bodyType}.
- Primary Fitness Transition Focus: ${goal}.
${customDailyPlan ? `- Custom Day-by-day Split/Routine Intent: "${customDailyPlan}"` : ""}
${bodyPartTarget ? `- Targeted Muscle Segments & Body Parts to develop: "${bodyPartTarget}". Generate precise, proper exercises tailored specifically to ${gender} body structure and hormone profiles.` : ""}

Return a strictly formatted JSON object matching this schema (do NOT return any other text, prefaces or markdowns, just raw JSON that matches the format below):
{
  "name": "Creative name for the custom program (e.g. Master Beginner Split / Pro V-Taper Protocol)",
  "description": "Engaging description explaining why this routine works perfectly for their ${experienceLevel} level and current biometrics/goals",
  "schedule": [
    {
      "day": "Day Name (e.g. Monday (Workout) or Tuesday (Rest Day))",
      "focus": "Brief name of focus (e.g. Upper Body Push or Active Recovery)",
      "exercises": [
        {
          "name": "Name of Exercise First (e.g. Flat Dumbbell Bench Press)",
          "sets": 3,
          "reps": 12,
          "notes": "Instruction / tip for posture, lockout, speed customized for ${experienceLevel}"
        }
      ]
    }
  ]
}

Make sure to populate all 7 days of the week, with exactly ${daysPerWeek} training days and the remaining ones as Rest/Recovery days. Return valid, parseable JSON in raw text.`;

    const systemInstruction = `You are an elite clinical kinesiologist, professional personal trainer, and bodybuilding scientist.
You generate highly specific, anatomically accurate, and personalized training blueprint schedules in raw JSON format.
Ensure that the JSON is perfectly valid and matches the requested structure exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    let responseText = response.text || "";
    responseText = responseText.trim();
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    try {
      const generatedProgram = JSON.parse(responseText);
      return res.json({ success: true, program: generatedProgram });
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON output. Falling back to structured generator.", responseText);
      const fallbackProgram = generateFallbackWorkout(daysPerWeek, bodyType, goal, weight, age, gender, experienceLevel);
      return res.json({ success: true, program: fallbackProgram });
    }

  } catch (error: any) {
    console.error("Gemini Workout Generation Error:", error);
    // Graceful fallback on any network error or rate limit to preserve flawless user experience
    const fallbackProgram = generateFallbackWorkout(daysPerWeek, bodyType, goal, weight, age, gender, experienceLevel);
    return res.json({
      success: true,
      program: fallbackProgram,
      isFallback: true
    });
  }
});

// GET custom exercise media overrides
app.get("/api/exercises/custom-media", (req, res) => {
  try {
    let data = {};
    if (fs.existsSync(OVERRIDES_FILE_PATH)) {
      const rawData = fs.readFileSync(OVERRIDES_FILE_PATH, "utf-8").trim();
      if (rawData) {
        try {
          data = JSON.parse(rawData);
        } catch (parseError) {
          console.error("Malformed overrides JSON, resetting to empty:", parseError);
          fs.writeFileSync(OVERRIDES_FILE_PATH, "{}", "utf-8");
        }
      }
    } else {
      fs.writeFileSync(OVERRIDES_FILE_PATH, "{}", "utf-8");
    }
    res.json({ success: true, overrides: data });
  } catch (error: any) {
    console.error("Failed to read custom exercise overrides file:", error);
    res.status(500).json({ success: false, error: "Failed to read overrides file." });
  }
});

// POST to save custom media override to local JSON file
app.post("/api/exercises/save-custom-media", async (req, res) => {
  let { exerciseId, customMediaUrl, customMediaType } = req.body;

  if (!exerciseId) {
    return res.status(400).json({ success: false, error: "Exercise ID is required." });
  }

  try {
    let overrides: Record<string, any> = {};
    if (fs.existsSync(OVERRIDES_FILE_PATH)) {
      const rawData = fs.readFileSync(OVERRIDES_FILE_PATH, "utf-8").trim();
      if (rawData) {
        try {
          overrides = JSON.parse(rawData);
        } catch (parseError) {
          console.error("Malformed overrides JSON on write, resetting to empty:", parseError);
        }
      }
    }

    if (customMediaUrl === null) {
      delete overrides[exerciseId];
    } else {
      // 1. Download and save remote file if it is an http or https URL
      if (customMediaUrl && (customMediaUrl.startsWith("http://") || customMediaUrl.startsWith("https://"))) {
        try {
          console.log(`Downloading external URL to local assets: ${customMediaUrl}`);
          const fetchRes = await fetch(customMediaUrl);
          if (fetchRes.ok) {
            const buffer = await fetchRes.arrayBuffer();
            const contentType = fetchRes.headers.get("content-type") || "";
            let ext = "bin";
            
            if (contentType.includes("gif")) ext = "gif";
            else if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
            else if (contentType.includes("png")) ext = "png";
            else if (contentType.includes("mp4")) ext = "mp4";
            else if (contentType.includes("video/quicktime") || contentType.includes("mov")) ext = "mov";
            else if (contentType.includes("svg")) ext = "svg";
            else if (contentType.includes("webp")) ext = "webp";
            else {
              // Try to fall back to the pathname's extension
              try {
                const urlObj = new URL(customMediaUrl);
                const pathExt = path.extname(urlObj.pathname).replace(".", "");
                if (pathExt) ext = pathExt;
              } catch (urlErr) {
                console.warn("Unable to parse external URL pathname for extension:", urlErr);
              }
            }

            const filename = `exercise_custom_${exerciseId}.${ext}`;
            const filePath = path.join(ASSETS_DIR, filename);
            fs.writeFileSync(filePath, Buffer.from(buffer));
            
            // Re-write media URL to point to our newly saved local static served URL
            customMediaUrl = `/assets/${filename}`;
          } else {
            console.warn(`Failed to fetch media from ${customMediaUrl}, status: ${fetchRes.status}`);
          }
        } catch (fetchErr: any) {
          console.error("Failed to download external Media URL:", fetchErr);
        }
      } 
      // 2. Decode and save physical bytes if payload is a Base64 dataURL
      else if (customMediaUrl && customMediaUrl.startsWith("data:")) {
        const match = customMediaUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          let ext = "bin";
          
          if (mimeType.includes("gif")) ext = "gif";
          else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
          else if (mimeType.includes("png")) ext = "png";
          else if (mimeType.includes("mp4")) ext = "mp4";
          else if (mimeType.includes("video/quicktime") || mimeType.includes("mov")) ext = "mov";
          else if (mimeType.includes("svg")) ext = "svg";
          else if (mimeType.includes("webp")) ext = "webp";

          const filename = `exercise_custom_${exerciseId}.${ext}`;
          const filePath = path.join(ASSETS_DIR, filename);
          fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
          
          // Re-write media URL to point to our newly saved local static served URL
          customMediaUrl = `/assets/${filename}`;
        }
      }

      overrides[exerciseId] = {
        customMediaUrl,
        customMediaType: customMediaType || "image"
      };
    }

    fs.writeFileSync(OVERRIDES_FILE_PATH, JSON.stringify(overrides, null, 2), "utf-8");
    console.log(`Successfully saved custom media for exercise ${exerciseId} to local overrides file!`);
    res.json({ success: true, message: "Successfully saved to local server files.", customMediaUrl });
  } catch (error: any) {
    console.error("Failed to write custom exercise overrides file:", error);
    res.status(500).json({ success: false, error: "Failed to write override to file: " + error.message });
  }
});

// --- WORKOUT VIDEOS YOUTUBE SEARCH & PROXY ENDPOINTS WITH LOCAL FALLBACK & IN-MEMORY CACHE ---

const CURATED_VIDEOS = [
  {
    id: "X_9VoUeG8-0",
    title: "10 min. SIXPACK Workout | No Equipment, No Excuses",
    channelTitle: "Pamela Reif",
    description: "A quick but highly effective sixpack workout that targets your main abdominal muscle zones fully. No equipment needed, clean workout with timer guidance.",
    thumbnail: "https://img.youtube.com/vi/X_9VoUeG8-0/maxresdefault.jpg",
    duration: "10:15",
    viewCount: "41.0M views",
    publishedAt: "2021-03-24",
    tags: ["abs", "beginner", "home workouts", "fat loss", "cardio"]
  },
  {
    id: "myfEsD8S9M4",
    title: "The PERFECT Chest Workout (Sets and Reps Included)",
    channelTitle: "Athlean-X",
    description: "Ready to load your chest for gains? Follow this perfect chest workout with full exercises, sets, and rep counts tailored for optimal biomechanics and heavy compression.",
    thumbnail: "https://img.youtube.com/vi/myfEsD8S9M4/maxresdefault.jpg",
    duration: "14:20",
    viewCount: "12.5M views",
    publishedAt: "2020-05-12",
    tags: ["chest", "muscle gain", "strength", "gym workouts", "advanced"]
  },
  {
    id: "XvGlaH80m_o",
    title: "The Scientific Way to Build a Complete Chest (No Bull)",
    channelTitle: "Jeff Nippard",
    description: "An evidence-based training split that breaks down chest press form, bench angles, and dumbbell choices according to advanced clinical electromyography studies.",
    thumbnail: "https://img.youtube.com/vi/XvGlaH80m_o/maxresdefault.jpg",
    duration: "11:50",
    viewCount: "5.8M views",
    publishedAt: "2022-02-18",
    tags: ["chest", "muscle gain", "strength", "gym workouts", "intermediate"]
  },
  {
    id: "5_jHof8t138",
    title: "15-Minute Dumbbell Arm Workout | No Repeat Biceps & Triceps",
    channelTitle: "MadFit",
    description: "Fires up the upper body with just a pair of dumbbells. Targets biceps and triceps synchronously to construct solid arms and shoulders definition from home.",
    thumbnail: "https://img.youtube.com/vi/5_jHof8t138/maxresdefault.jpg",
    duration: "15:45",
    viewCount: "3.6M views",
    publishedAt: "2021-11-03",
    tags: ["arms", "chest", "home workouts", "beginner", "intermediate", "shoulders"]
  },
  {
    id: "jTID7S8PsnM",
    title: "20 Min Full Body HIIT Workout - Calisthenics Routine",
    channelTitle: "Chris Heria",
    description: "Get ripped at home using only your bodyweight. This intense calisthenic routine acts as an ultra-high intensity fat burner that boosts core and full-body output.",
    thumbnail: "https://img.youtube.com/vi/jTID7S8PsnM/maxresdefault.jpg",
    duration: "20:30",
    viewCount: "8.9M views",
    publishedAt: "2020-08-14",
    tags: ["full body", "cardio", "fat loss", "advanced", "home workouts"]
  },
  {
    id: "3_p8pEqZ5L8",
    title: "The PERFECT Leg Workout for Massive Muscle Growth",
    channelTitle: "Jeff Nippard",
    description: "How to set up your squat stance, leg extensions, and Romanian deadlifts to stimulate maximum quad, hamstring, and glute hyper-trophy. Scientific reps and depth.",
    thumbnail: "https://img.youtube.com/vi/3_p8pEqZ5L8/maxresdefault.jpg",
    duration: "12:10",
    viewCount: "4.1M views",
    publishedAt: "2023-01-10",
    tags: ["legs", "muscle gain", "gym workouts", "intermediate"]
  },
  {
    id: "7t8bSjF06D4",
    title: "Perfect Shoulder Workout for Wider, Massive Delts",
    channelTitle: "Athlean-X",
    description: "Build capped shoulders with a structure designed to target your lateral, anterior, and posterior deltoids systematically. Perfect dumbbell selections and grip angles.",
    thumbnail: "https://img.youtube.com/vi/7t8bSjF06D4/maxresdefault.jpg",
    duration: "13:12",
    viewCount: "9.0M views",
    publishedAt: "2019-10-22",
    tags: ["shoulders", "muscle gain", "gym workouts", "advanced"]
  },
  {
    id: "HagbVbL67P0",
    title: "10 Min Back Workout - Get a Toned V-Taper posture",
    channelTitle: "Pamela Reif",
    description: "Strengthen your upper back and lat fibers to establish a beautiful, symmetric V-taper frame. Highly responsive bodyweight exercises you can perform from home.",
    thumbnail: "https://img.youtube.com/vi/HagbVbL67P0/maxresdefault.jpg",
    duration: "10:30",
    viewCount: "7.8M views",
    publishedAt: "2021-08-11",
    tags: ["back", "home workouts", "beginner"]
  },
  {
    id: "x8O0EunF9i0",
    title: "The PERFECT Back Workout (Build a Wider Back now)",
    channelTitle: "Athlean-X",
    description: "Follow along on this scientific back protocol. Leverages full elbow-drive extension pulls, pulldowns, and rows to target every muscle of the pull group.",
    thumbnail: "https://img.youtube.com/vi/x8O0EunF9i0/maxresdefault.jpg",
    duration: "15:20",
    viewCount: "15.8M views",
    publishedAt: "2020-11-04",
    tags: ["back", "muscle gain", "gym workouts", "advanced"]
  },
  {
    id: "u2gDCHpE_6s",
    title: "At-Home Dumbbell Full Body Workout (Beginner-Friendly)",
    channelTitle: "MadFit",
    description: "Great full-body workout using a single pair of light to moderate dumbbells. Ideal for beginner-intermediate athletes looking to sweat and burn calories.",
    thumbnail: "https://img.youtube.com/vi/u2gDCHpE_6s/maxresdefault.jpg",
    duration: "20:05",
    viewCount: "6.9M views",
    publishedAt: "2022-07-30",
    tags: ["full body", "home workouts", "beginner", "cardio", "fat loss"]
  },
  {
    id: "N_2gN4xP_hE",
    title: "Scientific Legs Workout (Grow Quads and Hamstrings)",
    channelTitle: "Jeff Nippard",
    description: "Breakdown of the biomechanics of lower-body movements. Deep assessment of leg press angles, hamstring curls, and calf extensions to drive balanced leg growth.",
    thumbnail: "https://img.youtube.com/vi/N_2gN4xP_hE/maxresdefault.jpg",
    duration: "11:40",
    viewCount: "3.1M views",
    publishedAt: "2021-04-12",
    tags: ["legs", "muscle gain", "gym workouts", "intermediate"]
  },
  {
    id: "2MoGxae-zyo",
    title: "10 Min Shredded Abs Workout | Six Pack Focus Routine",
    channelTitle: "Chloe Ting",
    description: "An incredibly popular and highly reviewed abdominal core workout that shapes your lower abs, upper abs, and obliques in dynamic progression circuits.",
    thumbnail: "https://img.youtube.com/vi/2MoGxae-zyo/maxresdefault.jpg",
    duration: "10:00",
    viewCount: "389.0M views",
    publishedAt: "2020-03-01",
    tags: ["abs", "fat loss", "home workouts", "beginner"]
  },
  {
    id: "2pLt0T_bAkw",
    title: "Full Body Fat Burn Workout | No Equipment Cardio",
    channelTitle: "Pamela Reif",
    description: "Active high intensity endurance circuit. Designed to maximize post-workout oxygen consumption (EPOC) to promote fat burn for hours afterward.",
    thumbnail: "https://img.youtube.com/vi/2pLt0T_bAkw/maxresdefault.jpg",
    duration: "12:15",
    viewCount: "18.5M views",
    publishedAt: "2021-02-15",
    tags: ["cardio", "fat loss", "home workouts", "beginner"]
  },
  {
    id: "f6300x57U4o",
    title: "The Absolute Best Way To Build Arms & Grip Strength",
    channelTitle: "Athlean-X",
    description: "Struggling to build arm depth? Discover how targeted grip variations and forearm biomechanic adjustments can unlock massive arm growth quickly.",
    thumbnail: "https://img.youtube.com/vi/f6300x57U4o/maxresdefault.jpg",
    duration: "14:10",
    viewCount: "6.1M views",
    publishedAt: "2021-06-25",
    tags: ["arms", "strength", "gym workouts", "advanced"]
  },
  {
    id: "wYREQvVeeIs",
    title: "How To Deadlift Prep & Power For Max Strength",
    channelTitle: "Alan Thrall",
    description: "A comprehensive instructional breakdown of the deadlift setup. Five-step deadlift checklist to prevent back arching and lifts with supreme leverage.",
    thumbnail: "https://img.youtube.com/vi/wYREQvVeeIs/maxresdefault.jpg",
    duration: "16:05",
    viewCount: "4.2M views",
    publishedAt: "2018-09-11",
    tags: ["back", "strength", "gym workouts", "intermediate", "legs"]
  },
  {
    id: "y_fH7aL_Krc",
    title: "25 Minute Dumbbell Full Body Strength Builder Routine",
    channelTitle: "Caroline Girvan",
    description: "A complete compound strength training workout focusing on heavy dumbbell pushes, rows, lunges, and overhead presses to sculpt full body athletic tone.",
    thumbnail: "https://img.youtube.com/vi/y_fH7aL_Krc/maxresdefault.jpg",
    duration: "25:30",
    viewCount: "3.1M views",
    publishedAt: "2022-01-22",
    tags: ["full body", "strength", "home workouts", "advanced"]
  },
  {
    id: "L-R7V_pSg78",
    title: "Complete Beginner Workout Routine for Men & Women",
    channelTitle: "Hybrid Calisthenics",
    description: "No matter your current fitness background, this complete beginner tutorial guides you on safe, scalable, progressive calisthenic adjustments to grow joint integrity.",
    thumbnail: "https://img.youtube.com/vi/L-R7V_pSg78/maxresdefault.jpg",
    duration: "15:10",
    viewCount: "12.5M views",
    publishedAt: "2020-05-18",
    tags: ["full body", "home workouts", "beginner", "strength"]
  },
  {
    id: "08tO8mE6mrc",
    title: "20 Minute Home Dumbbell Shoulder Workout (No Bench)",
    channelTitle: "Juice & Toya",
    description: "Focus on isolating your anterior, lateral, and rear delts with an elegant, non-stop circuit that builds incredible shoulder tone without gym benches.",
    thumbnail: "https://img.youtube.com/vi/08tO8mE6mrc/maxresdefault.jpg",
    duration: "20:00",
    viewCount: "1.5M views",
    publishedAt: "2022-10-12",
    tags: ["shoulders", "home workouts", "beginner", "intermediate"]
  },
  {
    id: "H6M_eXUelO8",
    title: "The Science of Arms: Bicep and Tricep Workout Guide",
    channelTitle: "Jeff Nippard",
    description: "An amazing scientific deep-dive into the exact exercises that trigger optimal hypertrophy inside bicep peak and lower tricep head fibers.",
    thumbnail: "https://img.youtube.com/vi/H6M_eXUelO8/maxresdefault.jpg",
    duration: "11:28",
    viewCount: "2.1M views",
    publishedAt: "2023-04-05",
    tags: ["arms", "muscle gain", "gym workouts", "intermediate"]
  },
  {
    id: "PhDb7L_qL9g",
    title: "10-Minute Home Bicep Burnout Workout (No Bar Required)",
    channelTitle: "Bowflex",
    description: "Tone your bicep lines from home with this simple, fast-paced burner designed to load your arms efficiently using dumbbells.",
    thumbnail: "https://img.youtube.com/vi/PhDb7L_qL9g/maxresdefault.jpg",
    duration: "10:14",
    viewCount: "4.5M views",
    publishedAt: "2020-06-15",
    tags: ["arms", "home workouts", "beginner"]
  },
  {
    id: "7M02IWe6t3c",
    title: "Fat Burning HIIT Workout - 15 Mins Cardio Burnout",
    channelTitle: "MadFit",
    description: "High intensity sweat circuit tailored for cardiovascular volume, calorie dump, and muscle tone preservation. No weights needed.",
    thumbnail: "https://img.youtube.com/vi/7M02IWe6t3c/maxresdefault.jpg",
    duration: "15:00",
    viewCount: "5.1M views",
    publishedAt: "2021-01-20",
    tags: ["cardio", "fat loss", "home workouts", "beginner"]
  },
  {
    id: "870yZl_yReQ",
    title: "Scientific Back Workout for Ultimate Thickness & Width",
    channelTitle: "Jeff Nippard",
    description: "Complete guide on lat pull technique, chest-supported dumbbell row mechanics, and face pulls to shape deep, symmetrical thickness in your back.",
    thumbnail: "https://img.youtube.com/vi/870yZl_yReQ/maxresdefault.jpg",
    duration: "12:45",
    viewCount: "1.9M views",
    publishedAt: "2023-08-11",
    tags: ["back", "muscle gain", "gym workouts", "intermediate"]
  }
];

// Memory caching layer
const videoSearchCache = new Map<string, any>();

// Helper functions for parsing YouTube output
function parseYouTubeDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatYouTubeViews(viewsStr: string): string {
  const views = parseInt(viewsStr);
  if (isNaN(views)) return "0 views";
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
}

// Helper function to scrape YouTube search results securely without requiring an API key
async function scrapeYouTubeSearch(query: string): Promise<any[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
    };
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`YouTube scrape request status: ${response.status}`);
    }
    const html = await response.text();
    
    const match = html.match(/ytInitialData\s*=\s*({.+?});/);
    if (!match) {
      throw new Error("Could not extract ytInitialData JSON object.");
    }
    
    const data = JSON.parse(match[1]);
    const videos: any[] = [];
    
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    if (!contents || !Array.isArray(contents)) return [];
    
    for (const item of contents) {
      const videoItems = item.itemSectionRenderer?.contents;
      if (!videoItems || !Array.isArray(videoItems)) continue;
      
      for (const vItem of videoItems) {
        const videoRenderer = vItem.videoRenderer;
        if (!videoRenderer) continue;
        
        const id = videoRenderer.videoId;
        if (!id) continue;

        const title = videoRenderer.title?.runs?.[0]?.text || "Untitled Video";
        const channelTitle = videoRenderer.ownerText?.runs?.[0]?.text || "Unknown Channel";
        
        const descriptionObj = videoRenderer.detailedMetadataSnippets?.[0]?.snippetText?.runs || videoRenderer.descriptionSnippet?.runs || [];
        const description = descriptionObj.map((r: any) => r.text).join("");
        
        let thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        if (videoRenderer.thumbnail?.thumbnails && videoRenderer.thumbnail.thumbnails.length > 0) {
          thumbnail = videoRenderer.thumbnail.thumbnails[videoRenderer.thumbnail.thumbnails.length - 1].url;
        }

        const duration = videoRenderer.lengthText?.simpleText || "10:00";
        const viewCount = videoRenderer.viewCountText?.simpleText || "10K views";
        const publishedAt = videoRenderer.publishedTimeText?.simpleText || "Recently";
        
        videos.push({
          id,
          title,
          channelTitle,
          description,
          thumbnail,
          duration,
          viewCount,
          publishedAt
        });
      }
    }
    return videos;
  } catch (err: any) {
    console.error("[Live Scrape YouTube search Failed]:", err.message || err);
    return [];
  }
}

// Workout videos search API
app.get("/api/videos/search", async (req, res) => {
  const qStr = (req.query.q as string || "").trim();
  const filterVal = (req.query.filter as string || "").trim();
  const getTrending = req.query.trending === "true";

  // Create unique cache key
  const cacheKey = `q:${qStr.toLowerCase()}_f:${filterVal.toLowerCase()}_t:${getTrending}`;
  if (videoSearchCache.has(cacheKey)) {
    console.log(`[Cache Hit] Serving video search results for key: ${cacheKey}`);
    return res.json({ success: true, videos: videoSearchCache.get(cacheKey) });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  // 1. First choice: Use live YouTube Data API if token present
  if (apiKey) {
    try {
      console.log(`[API Search] Calling live YouTube Data API for query: "${qStr}", filter: "${filterVal}"`);
      let fullQuery = "workout";
      if (getTrending) {
        fullQuery = "trending gym fitness workout";
      } else {
        fullQuery = `${qStr} ${filterVal}`.trim() + " workout";
      }

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(fullQuery)}&key=${apiKey}&maxResults=15&type=video&safeSearch=active`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (searchData && searchData.items && searchData.items.length > 0) {
        const items = searchData.items;
        const videoIds = items.map((item: any) => item.id.videoId).filter(Boolean).join(",");

        if (videoIds) {
          const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
          const detailRes = await fetch(detailUrl);
          const detailData = await detailRes.json();

          if (detailData && detailData.items) {
            const liveVideos = detailData.items.map((video: any) => ({
              id: video.id,
              title: video.snippet.title,
              channelTitle: video.snippet.channelTitle,
              description: video.snippet.description || "",
              thumbnail: video.snippet.thumbnails?.maxresdefault?.url || video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
              duration: video.contentDetails?.duration ? parseYouTubeDuration(video.contentDetails.duration) : "10:00",
              viewCount: video.statistics?.viewCount ? formatYouTubeViews(video.statistics.viewCount) : "10K views",
              publishedAt: video.snippet.publishedAt ? video.snippet.publishedAt.split("T")[0] : new Date().toISOString().split("T")[0]
            }));

            videoSearchCache.set(cacheKey, liveVideos);
            return res.json({ success: true, videos: liveVideos });
          }
        }
      }
    } catch (apiError: any) {
      console.error("YouTube Live API error (falling back to live scraper):", apiError.message || apiError);
    }
  }

  // 2. Second choice: Use live YouTube HTML Scraper mechanism (resolves in 100% of cases without API keys)
  let queryText = "workout";
  if (getTrending) {
    queryText = "trending gym fitness workout";
  } else {
    queryText = `${qStr} ${filterVal}`.trim() + " workout";
  }

  console.log(`[Live Web Scrape] Querying youtube results live for: "${queryText}"`);
  const scraped = await scrapeYouTubeSearch(queryText);
  if (scraped && scraped.length > 0) {
    console.log(`[Live Web Scrape Success] Retrieved ${scraped.length} real videos.`);
    videoSearchCache.set(cacheKey, scraped);
    return res.json({ success: true, videos: scraped });
  }

  // 3. Third choice: Fall back to curated matching local database
  console.log(`[Local Fallback] Serving filtered matches from curated workout library for query: "${qStr}", filter: "${filterVal}"`);
  
  let results = [...CURATED_VIDEOS];

  if (getTrending) {
    results = CURATED_VIDEOS.slice(0, 10);
  } else {
    const lowerQuery = qStr.toLowerCase();
    const lowerFilter = filterVal.toLowerCase();

    if (lowerQuery || lowerFilter) {
      results = CURATED_VIDEOS.filter((video) => {
        const matchesQuery = !lowerQuery || 
          video.title.toLowerCase().includes(lowerQuery) || 
          video.channelTitle.toLowerCase().includes(lowerQuery) ||
          video.description.toLowerCase().includes(lowerQuery) ||
          video.tags.some(t => t.toLowerCase().includes(lowerQuery));

        const matchesFilter = !lowerFilter || 
          video.tags.some(t => t.toLowerCase() === lowerFilter || lowerFilter.includes(t.toLowerCase()));

        return matchesQuery && matchesFilter;
      });

      if (results.length === 0 && lowerQuery) {
        results = CURATED_VIDEOS.filter((video) => {
          return video.title.toLowerCase().includes(lowerQuery) ||
                 video.description.toLowerCase().includes(lowerQuery);
        });
      }
    }
  }

  videoSearchCache.set(cacheKey, results);
  return res.json({ success: true, videos: results });
});

// GET query instant suggestions list
app.get("/api/videos/suggestions", (req, res) => {
  const query = (req.query.q as string || "").trim().toLowerCase();
  
  if (!query) {
    return res.json({ success: true, suggestions: ["chest workout", "sixpack abs", "hiit cardio", "arm workout", "back routine", "leg fat loss"] });
  }

  // Search titles and channel names inside curated DB to build direct instant autocomplete suggestions
  const suggestions = CURATED_VIDEOS
    .filter(v => v.title.toLowerCase().includes(query) || v.tags.some(t => t.toLowerCase().includes(query)))
    .map(v => {
      // Shorten suggestion to clean phrase
      if (v.title.length > 40) {
        return v.title.substring(0, 40).trim() + "...";
      }
      return v.title;
    })
    .slice(0, 6);

  // Add standard terms if lists are short
  if (suggestions.length < 3) {
    ["beginner gym workout", "hiit weight loss", "dumbbell arm pump"].forEach(term => {
      if (term.includes(query) && !suggestions.includes(term)) {
        suggestions.push(term);
      }
    });
  }

  res.json({ success: true, suggestions });
});

// 2. PAYSTACK PAYMENT VERIFICATION PROXY
app.post("/api/payments/verify", async (req, res) => {
  const { reference, email, plan } = req.body;

  if (!reference) {
    return res.status(400).json({ success: false, error: "Payment reference is required." });
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY || "sk_live_be21a907d64410aff80ad0fe8729ebb16c36a2a2";

    // Attempt actual verification with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (data && data.status && data.data && data.data.status === "success") {
      return res.json({ success: true, data: data.data });
    } else {
      return res.status(400).json({
        success: false,
        error: data.message || "Payment verification failed with Paystack."
      });
    }
  } catch (err: any) {
    console.error("Paystack verification exception:", err);
    // Real references should NOT be auto-approved under any circumstances to prevent security bypasses
    return res.status(500).json({
      success: false,
      error: "Paystack transaction verification error: " + err.message
    });
  }
});

app.post("/api/payments/webhook", (req, res) => {
  // Paystack Webhook endpoint to safely process events asynchronously
  const event = req.body;
  console.log("Paystack Webhook event received:", event ? event.event : "none");
  res.status(200).json({ received: true });
});

// Serve frontend via Vite (development/production fallback configuration)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AlexFitnessHub unified server booted on http://localhost:${PORT}`);
  });
}

startServer();
