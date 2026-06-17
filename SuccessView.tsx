import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Sparkles, Dumbbell, Award, Shield, CheckCircle, ArrowRight, Zap, Flame, 
  Heart, Play, Users, X, HelpCircle, Clipboard, ChevronDown, Star, Lock, Info, CheckCircle2 
} from "lucide-react";
import WorkoutVisual from "./WorkoutVisual";

const workoutCategories = [
  {
    id: "chest",
    title: "Chest Isolation",
    desc: "Sculpt upper chest divisions using premium cable flyes & barbell press alignments.",
    exercises: "45 Drills",
    image: "https://workoutguru.fit/wp-content/uploads/2024/02/african-bodybuilder-posing-gym-1-edited.jpg",
    tag: "Upper Body",
  },
  {
    id: "back",
    title: "Lat & Back Columns",
    desc: "Build high flare lats and thick upper rhomboids with rows & pullup layouts.",
    exercises: "38 Drills",
    image: "data:image/jpeg;base64,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",
    tag: "V-Taper",
  },
  {
    id: "biceps",
    title: "Bicep Peak Triggers",
    desc: "Engage peak brachialis fibers under supreme tension with seated dumbbell curls.",
    exercises: "24 Drills",
    image: "https://learn.athleanx.com/wp-content/uploads/2024/06/HOW-TO-BICEPS.jpg",
    tag: "Hypertrophy",
  },
  {
    id: "triceps",
    title: "Tricep Horseshoe",
    desc: "Isolate lateral push heads utilizing heavy overhead rope extensions.",
    exercises: "28 Drills",
    image: "https://learn.athleanx.com/wp-content/uploads/2021/09/MAIN-IMAGE.png",
    tag: "Push Power",
  },
  {
    id: "shoulders",
    title: "Deltoid Cap Boulder",
    desc: "Target anterior and posterior caps with scapular plane stability guides.",
    exercises: "35 Drills",
    image: "https://i.ytimg.com/vi/yS80o90nm_k/maxresdefault.jpg",
    tag: "Symmetry",
  },
  {
    id: "legs",
    title: "Quad & Leg Pillars",
    desc: "Stimulate depth hypertrophy using back squats and clean hamstring curls.",
    exercises: "50 Drills",
    image: "https://guycounseling.com/wp-content/uploads/2014/10/leg-workout.jpg",
    tag: "Lower Body",
  },
  {
    id: "abs",
    title: "Abdominal Shred",
    desc: "Slam abdominal walls utilizing leg raises and controlled core compression.",
    exercises: "22 Drills",
    image: "https://learn.athleanx.com/wp-content/uploads/2021/08/MAIN-MAGE.png",
    tag: "Core Core",
  },
  {
    id: "cardio",
    title: "Cardio Endurance",
    desc: "Burn systemic sugars using the metabolic Treadmill 12-30-3 protocol.",
    exercises: "30 Drills",
    image: "https://i.ytimg.com/vi/bbHoGxckbyk/maxresdefault.jpg",
    tag: "Lung Capacity",
  },
  {
    id: "calisthenics",
    title: "Calisthenics Lever",
    desc: "Unlock absolute bodyweight power with gymnastics bars & parallel lines.",
    exercises: "18 Drills",
    image: "https://i.ytimg.com/vi/EQJbY3eFu90/maxresdefault.jpg",
    tag: "Body Control",
  },
  {
    id: "home_workouts",
    title: "Home Isolation",
    desc: "Achieve heavy muscle pump without weights utilizing resistance designs.",
    exercises: "40 Drills",
    image: "https://learn.athleanx.com/wp-content/uploads/2024/05/HOME-WORKOUT.jpg",
    tag: "No Equipment",
  },
  {
    id: "fat_loss",
    title: "Fat Shred Cycles",
    desc: "Maximize metabolic rate via high-intensity athletic circuits.",
    exercises: "32 Drills",
    image: "https://i.ytimg.com/vi/oo6a1mrbzao/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBc_gqjFRP1gaogNPjKNE8xyzJ7Ug",
    tag: "Metabolic",
  },
  {
    id: "muscle_gain",
    title: "Anabolic Bulk",
    desc: "Command physical loading with high tension hypertrophy exercises.",
    exercises: "42 Drills",
    image: "https://m.media-amazon.com/images/I/91Wa-FDT12L._UF1000,1000_QL80_DpWeblab_.jpg",
    tag: "Strength",
  },
  {
    id: "womens_fitness",
    title: "Women's Physique",
    desc: "Postural alignments and structural lifts designed by female coaches.",
    exercises: "26 Drills",
    image: "https://cdn.shopify.com/s/files/1/0744/0203/files/1.Header_2d655e5c-47a2-489d-9adb-5f99c471f2cb.jpg?v=1704207401",
    tag: "Aesthetics",
  },
  {
    id: "mens_fitness",
    title: "Men's Powerbuilding",
    desc: "Broad aesthetic V-Tapers and heavy compound barbell power moves.",
    exercises: "48 Drills",
    image: "https://i.ytimg.com/vi/fYzBmBScl1I/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBPHdqcrNoG-we35xMoryp6XrAYlg",
    tag: "Strength Hub",
  }
];

const getDisplayImageUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("instagram.com")) {
    // Matches /p/SHORTCODE/ or /reel/SHORTCODE/ in standard or branded Instagram urls
    const match = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    if (match && match[2]) {
      const shortcode = match[2];
      const instaMediaUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
      // Route through high-performance weserv proxy to bypass referrer and CORS limits
      return `https://images.weserv.nl/?url=${encodeURIComponent(instaMediaUrl)}`;
    }
  }
  return url;
};

interface HomeViewProps {
  setView: (view: string) => void;
  onOpenAuth: () => void;
}

export default function HomeView({ setView, onOpenAuth }: HomeViewProps) {
  const { user, upgradeWithPaystack } = useApp();
  const [submittingPlan, setSubmittingPlan] = useState<"monthly" | "yearly" | "multi" | null>(null);
  
  // Active checkout plan tracking state
  const [activePaymentModal, setActivePaymentModal] = useState<"monthly" | "yearly" | "multi" | null>(null);

  useEffect(() => {
    if (activePaymentModal) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [activePaymentModal]);

  const [payEmail, setPayEmail] = useState(user?.email || "");
  const [referenceInput, setReferenceInput] = useState("");

  // Interactive Multi Month Selector (2 to 6 months)
  const [selectedMonths, setSelectedMonths] = useState(3);

  // Accordion state for FAQs
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // Contact Form state engines
  const [contactName, setContactName] = useState(user?.displayName || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactGoal, setContactGoal] = useState("hypertrophy");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) {
      alert("Please provide valid name and email coordinate targets.");
      return;
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSubmitted(true);
      setContactMessage("");
    }, 950);
  };

  useEffect(() => {
    if (user) {
      setPayEmail(user.email || "");
      setContactEmail(user.email || "");
      setContactName(user.displayName || user.email?.split("@")[0] || "");
    }
  }, [user]);

  const handleInitiatePayment = async (plan: "monthly" | "yearly" | "multi") => {
    if (!user) {
      onOpenAuth();
      return;
    }
    
    setPayEmail(user.email);
    // Generate random secure Paystack reference in-app
    const ref = "ref_ps_" + Math.random().toString(36).substring(2, 14).toUpperCase();
    setReferenceInput(ref);

    setActivePaymentModal(plan);
  };

  const handleRealPaystackPayment = () => {
    if (!activePaymentModal || !user) return;

    // Calculate total amount in NGN
    let amountNGN = 19999;
    if (activePaymentModal === "yearly") {
      amountNGN = 215989;
    } else if (activePaymentModal === "multi") {
      amountNGN = 19999 * selectedMonths;
    }

    const amountInKobo = amountNGN * 100;
    const publicKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || "pk_live_4486ac34bd0e1b9532f7e0646164c5c23e0b7f25";

    if (!(window as any).PaystackPop) {
      alert("Paystack payment SDK is still loading or could be blocked by an adblocker. Please wait a second and retry, or disable your adblocker.");
      return;
    }

    setSubmittingPlan(activePaymentModal);

    try {
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: payEmail || user.email,
        amount: amountInKobo,
        ref: referenceInput,
        currency: "NGN",
        callback: async function(response: any) {
          try {
            const planToPass = activePaymentModal === "yearly" ? "yearly" : "monthly";
            await upgradeWithPaystack(response.reference, planToPass);
            setActivePaymentModal(null);
            alert("Payment successful! Your premium membership is active. Thank you for your support!");
            setView("dashboard");
          } catch (err: any) {
            alert("Verification error: " + err.message);
          } finally {
            setSubmittingPlan(null);
          }
        },
        onClose: function() {
          setSubmittingPlan(null);
        }
      });
      handler.openIframe();
    } catch (err: any) {
      setSubmittingPlan(null);
      alert("Error initializing Paystack popup: " + err.message);
    }
  };

  const featuredPrograms = [
    {
      title: "Gladiatorial Powerbuilding",
      desc: "An intensive synthesis of professional hypertrophy blocks paired with heavy powerlifting compound schedules.",
      level: "Intermediate",
      duration: "12 Weeks",
      muscle: "Powerlifting",
      isPremium: false,
    },
    {
      title: "Elite V-Taper Blueprint",
      desc: "Sculpt broad structural shoulders, a thick upper rhomboid shelf, and a narrow clinical waistline profile.",
      level: "Advanced",
      duration: "8 Weeks",
      muscle: "Lats & Delts",
      isPremium: true,
    },
    {
      title: "Military Calisthenics Routine",
      desc: "Unlock relative bodyweight power using complex parallel setups, weight vests, and structural bar levers.",
      level: "Advanced",
      duration: "6 Weeks",
      muscle: "Relative Strength",
      isPremium: true
    }
  ];

  // Dynamic calculations representing required original specs:
  // - Base Monthly: ₦19,999
  // - Multi-Month: Selected Month counts * 19,999
  // - Yearly: ₦215,989 (saves 10% on 12 months, normal ₦239,988, saving ₦23,999)
  const basePriceMonthly = 19999;
  const multiMonthTotal = basePriceMonthly * selectedMonths;
  const yearlyPriceAnnual = 215989;
  const yearlyNormalCost = basePriceMonthly * 12;
  const yearlySavingsAmt = yearlyNormalCost - yearlyPriceAnnual;

  const faqsList = [
    {
      q: "How does the Treadmill Walk 12-30-3 function?",
      a: "Treadmill Walk 12-30-3 is a globally verified kinesiologist protocol: 12% incline incline gradient, 3.0 mph speed pace, for 30 minutes continuous. This protocol maximizes oxygen consumption and targets local fat oxidation directly, bypassing standard systemic glycogen burn while protecting knee joints from impact damage."
    },
    {
      q: "Does Paystack secure my subscription auto-renewals safely?",
      a: "Yes. All transactions are securely routed through Paystack's PCI-DSS Compliant Tier-1 encryption gateway. AlexFitnessHub does not hold or log raw debit card information. Billing cycles are fully observable and can be closed dynamically with one click from your profile panel."
    },
    {
      q: "What is the differences between Free and Premium memberships?",
      a: "Free members have standard access to 25 base movements and basic progress logging. Premium members unlock our full 1,200+ scaled fitness database, complete HD anatomical movement loops with 0.5x Slow and 3s Eccentric coaching models, custom V-Taper curriculums, and unlimited multi-modal server-side AI coach calibrations."
    },
    {
      q: "Can I cancel or alter my multi-month selections?",
      a: "Absolutely. Standard multi-month selections are valid for the selected calendar span (e.g., 3 months) and are not bound by long-term legal liabilities. You can upgrade, downgrade, or return to the free athlete tier without any extra administrative penalties."
    },
    {
      q: "Are meal recommendation profiles customizable for local foods?",
      a: "Yes! Our multi-modal AI systems understand regional food databases (including high-protein African staples such as egg whites, plantains, lean beef, beans, local greens, and fish). The macros are calibrated dynamically onto your current biological weight targets."
    }
  ];

  return (
    <div id="home-view-root" className="bg-[#FAFBFD] dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200 overflow-hidden relative">      {/* 1. HERO SECTION - CLEAN AND PREMIUM */}
      <section id="hero-segment" className="relative h-screen min-h-[600px] flex items-center justify-center bg-slate-950 overflow-hidden">
        
        {/* FULL-WIDTH, FULL-HEIGHT FITNESS FILM LOOP BACKGROUND */}
        <div className="absolute inset-0 overflow-hidden z-0 bg-slate-950 pointer-events-none">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover opacity-80 select-none"
          >
            <source src="https://assets.mixkit.co/active_storage/video_items/100552/1725385923/100552-video-720.mp4" />
          </video>
          {/* Transparent dark overlay for text readability only */}
          <div className="absolute inset-0 bg-black/25 z-1" />
        </div>

        <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center z-10 relative space-y-8 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-black tracking-tight leading-none text-white uppercase">
            Forge Premium <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">
              Athletic Power
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white max-w-2xl mx-auto leading-relaxed font-sans font-medium">
            Experience world-class body sculpting. Unified by certified clinical kinesiologists, interactive progress logs, and advanced multi-modal Gemini AI coaching. Track actual metric goals with absolute precision.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => setView("library")}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5 active:scale-95"
            >
              Start Free Training
              <ArrowRight className="w-4.5 h-4.5 text-slate-950 stroke-[2.5]" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("pricing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 border-2 border-white/20 hover:border-white/60 text-white hover:bg-white/10 font-bold text-xs uppercase rounded-xl transition-all duration-350 transform hover:-translate-y-0.5 active:scale-95"
            >
              Subscription Pricing
            </button>
          </div>
        </div>
      </section>

      {/* 2. ACTIVE BENTO GRID OF POPULAR WORKOUT CATEGORIES */}
      <section id="categories-segment" className="py-20 lg:py-28 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] font-mono bg-[#10B981]/15 px-3.5 py-1.5 rounded-full border border-[#10B981]/25 inline-block">PHYSIQUE SPECIALIZATION INDEX</span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              Elite Workout Showcases
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans max-w-xl mx-auto">
              Unlock targeted kinesis blueprints styled with high-resolution anatomical guides, custom equipment splits, and precise movement thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workoutCategories.map((cat) => (
              <div 
                key={cat.id}
                className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between h-[360px]"
              >
                {/* Visual Image Header */}
                <div className="h-44 w-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
                  <img 
                    src={cat.image} 
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-800 text-[9px] font-bold tracking-wider text-emerald-400 px-2.5 py-1 rounded-lg uppercase font-mono z-20">
                    {cat.tag}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-[#10B981] text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg font-mono z-20">
                    {cat.exercises}
                  </span>
                </div>

                {/* Content description */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
                  <div className="space-y-1 text-left">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase leading-snug">
                      {cat.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                      {cat.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => setView("library")}
                    className="mt-4 w-full py-2.5 bg-slate-50 hover:bg-emerald-400 text-slate-900 hover:text-slate-950 dark:bg-slate-950 dark:hover:bg-emerald-400 dark:text-slate-100 hover:dark:text-slate-950 border border-slate-200 dark:border-slate-800 hover:border-transparent rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100"
                  >
                    <span>Deploy Routine</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. THREE-BLOCKED CLINICAL UTILITIES & STAGGERED PARALLAX BENEFITS */}
      <section id="benefits-segment" className="py-20 lg:py-28 bg-[#FAFBFD] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3 relative">
            <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] font-mono bg-[#10B981]/15 px-3.5 py-1.5 rounded-full border border-[#10B981]/25 inline-block">CLINICAL ADVANTAGES</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              Precision Engineering Meets human biology
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans max-w-xl mx-auto">
              No generic stick figures or wireframes. Every cell of AlexFitnessHub is calibrated to support professional strength transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Benefit Card 1 */}
            <div 
              className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:border-emerald-500/30"
            >
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-5 border border-emerald-500/15">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">1,200+ Kinesis Database</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Search physical compound moves by target equipment types or specific isolation groups. Unlock Treadmill 12-30-3 cardio fat loss models instantly.
              </p>
            </div>

            {/* Benefit Card 2 */}
            <div 
              className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:border-emerald-500/30"
            >
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-5 border border-emerald-500/15">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">Multi-Modal AI Engine</h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-sans">
                Our secure server-side model tracks weights, maps African diet ingredients under strict safety profiles, and adjusts training routines dynamically.
              </p>
            </div>

            {/* Benefit Card 3 */}
            <div 
              className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:border-emerald-500/30"
            >
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-5 border border-emerald-500/15">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">Gateway Paystack Checkout</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Secure transactions optimized for rapid clearance across local networks. Upgrade and modify periods instantly directly from your profile account.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. PREMIUM FEATURES - HIGH-PERFORMANCE PHYSIQUE TOOLS */}
      <section id="premium-features-section" className="py-20 lg:py-28 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-sans bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/15 inline-block">
              Premium Training Instruments
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              Designed For High Performance
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Unlock our complete high-definition biometric roster. Designed to give serious athletes absolute mechanical clarity on every lift and muscle split.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                <Play className="w-5 h-[18px] fill-current" />
              </div>
              <h4 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white mb-2 leading-snug">0.5x Slow-Mo Biomechanics</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Observe precision muscle insertions with ultra-slow performance playback. Lock perfect concentric angles easily.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white mb-2 leading-snug">3s Eccentric Coaching</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Focus on high-tension eccentric phases with dynamic countdown tools. Maximize motor unit recruitment safely.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                <Clipboard className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white mb-2 leading-snug">Anatomical Posturing Guides</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Prevent joints from high loads strain. See crystal clear muscle activation layouts for back, legs, and shoulder splits.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white mb-2 leading-snug">Paystack Secured System</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Direct dynamic clearances with complete transparent renewals management on-profile. Start or change terms instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MULTI-MODAL AI AI ASSISTANT SPECS PROMO */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-slate-950 to-[#1E3A8A] text-white border-b border-slate-900 relative overflow-hidden">
        
        {/* Aesthetic background graphics */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            
            {/* Promo text left */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold font-sans uppercase tracking-widest border border-blue-500/15">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Gemini Nutrition & Workout Guidance
              </div>

              <h3 className="text-3xl sm:text-4xl font-extrabold leading-none uppercase font-sans">
                AI Coach Tailored For Local African Foods
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Our model maps detailed macronutrients onto customized staples (plantains, yams, raw eggs, beans, pumpkin leaves, and localized fish indices). Gain real weight structures trajectory analysis and accurate kinesiologist recovery targets instantly.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (user) setView("coach");
                    else onOpenAuth();
                  }}
                  className="px-6 py-3 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase rounded-xl shadow-lg transition-all"
                >
                  Consult AI Coach Assistant
                </button>
              </div>
            </div>

            {/* Simulated active dynamic chat container right */}
            <div className="lg:col-span-6 mt-12 lg:mt-0 p-6 rounded-3xl bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                AI Consultation Live Demo
              </div>

              <div className="space-y-4 text-xs font-sans mt-2">
                <div className="flex gap-2 text-slate-400">
                  <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center font-bold font-sans text-white">U</div>
                  <div className="bg-slate-800 p-2.5 rounded-xl max-w-[85%] text-white">
                    "I am training home calisthenics 3 times weekly. Optimize recovery breakfast with yams or plantains."
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-black text-[9px]">AI</div>
                  <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl text-slate-200 leading-relaxed max-w-[85%]">
                    <p className="font-extrabold text-blue-600 dark:text-blue-400 text-xs mb-1">📋 Customized Local Meal Optimization</p>
                    <p className="mb-1.5 text-[10px] text-slate-400 select-none font-sans">Target Daily calories: 2,150 Kcal</p>
                    <p className="text-slate-300">• **Boiled Yam (150g):** High complex muscle glycogen refill substrates.</p>
                    <p className="text-slate-300">• **Scrambled Eggs (4 Whites, 1 Whole):** 24g pure amino-acid building targets.</p>
                    <p className="text-slate-303 mt-1 underline">Recovery Advice: Hydrate with 350ml lemon water to flush systemic lactic acid.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

         {/* Community Highlights */}
      <section id="community-highlights-section" className="py-20 lg:py-28 bg-[#FAFBFD] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-sans bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/15 inline-block">
              Interactive Community Circles
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              Connect with Fellow Athletes
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Join thousands of dedicated lifters sharing progress, posturing evaluations, local dietary combinations, and positive energy daily.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Challenge Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[340px]">
              <div>
                <span className="text-[10px] font-sans uppercase bg-rose-500/10 text-rose-500 px-2.5 py-1 rounded-md border border-rose-500/15 font-bold">
                  ACTIVE CHALLENGE
                </span>
                <h4 className="text-base font-extrabold uppercase text-slate-900 dark:text-white mt-4">30-Day V-Taper Core Blitz</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                  Maximize lat flared pull-up progressions combined with strict leg raises on parallel bars. Build real muscle width control.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-sans">1,824 PARTICIPANTS</span>
                <button onClick={() => setView("community")} className="text-xs uppercase font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1 font-sans hover:underline">
                  Join Circle <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Active Thread 1 */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[340px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center font-sans">MB</div>
                  <div>
                    <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white leading-none">Musa Bello</h5>
                    <span className="text-[8px] text-slate-400 font-sans">LAGOS HUB • 2 HOURS AGO</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                  "Just finished standard 12-30-3 on the treadmill and combined it with the local plantain macro profile recommended by the AI Coach. Energy levels are absolutely outstanding today!"
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-sans text-slate-400">
                <span>🔥 42 LIKES</span>
                <span>💬 12 COMMENTS</span>
              </div>
            </div>

            {/* Active Thread 2 */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[340px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center font-sans">SO</div>
                  <div>
                    <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white leading-none">Sade Shofela</h5>
                    <span className="text-[8px] text-slate-400 font-sans">ABUJA SQUAD • 5 HOURS AGO</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                  "Lifting with the slow-mo 0.5x eccentrics execution guides has completely fixed my posture form on the squats split. Finally pushing 95kg without any knee tendon strain."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-sans text-slate-400">
                <span>🔥 56 LIKES</span>
                <span>💬 8 COMMENTS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ADVANCED LAYERED ATHLETE PARALLAX TRANSFORM SHOWCASE */}
      <section id="parallax-showcase-segment" className="py-20 lg:py-28 bg-white dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] font-mono bg-[#10B981]/15 px-3.5 py-1.5 rounded-full border border-[#10B981]/25 inline-block">[6] TRANSFORMATION GALLERY</span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              REAL RESULTS, REAL TRANSFORMATION
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans max-w-xl mx-auto">
              Follow actual journeys from subscribers who transformed their strength, cardiac health, and physique using Alex's customized programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* STORY BLOCK 1: MARCUS (Lost 15kg & Muscle gain) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 p-6 flex flex-col justify-between overflow-hidden relative group shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-[#10B981] dark:text-emerald-400 px-3 py-1 rounded-lg font-mono">
                    BODY RECOMPOSITION
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">12 WEEKS</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-4">Marcus Adebayo</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-sans mt-2">
                  Marcus integrated Chest Press isolation tracks with certified meal planning to burn fat while stacking clean muscle columns.
                </p>
              </div>

              {/* Enhanced Visual split layout */}
              <div className="grid grid-cols-2 gap-2 mt-6 h-52 relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                {/* Before view */}
                <div className="relative overflow-hidden group">
                  <img 
                    src={getDisplayImageUrl("https://www.instagram.com/alexfitnesshub/p/DZSgXkxgLLt/")}
                    alt="Marcus Before"
                    className="w-full h-full object-cover grayscale opacity-75"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-[#EF4444] font-mono font-black">BEFORE</p>
                    <p className="text-lg font-black text-white leading-none mt-0.5">94 kg</p>
                    <p className="text-[7px] text-slate-300 mt-1 font-mono uppercase tracking-wider">28% body fat</p>
                  </div>
                </div>

                {/* After view */}
                <div className="relative overflow-hidden">
                  <img 
                    src={getDisplayImageUrl("https://www.instagram.com/alexfitnesshub/p/DZSghegAPhL/")}
                    alt="Marcus After"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-[#10B981] font-mono font-black animate-pulse">AFTER</p>
                    <p className="text-lg font-black text-emerald-400 leading-none mt-0.5">79 kg</p>
                    <p className="text-[7px] text-emerald-350 mt-1 font-mono uppercase tracking-wider">11% body fat</p>
                  </div>
                </div>
              </div>

              {/* Dynamic feedback indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">BENCHMAX INCREASE:</span>
                <span className="text-[#10B981] font-extrabold">+35 KG Compound</span>
              </div>
            </div>

            {/* STORY BLOCK 2: JESSICA (Rehabilitation & Core) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 p-6 flex flex-col justify-between overflow-hidden relative group shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-[#10B981] dark:text-emerald-400 px-3 py-1 rounded-lg font-mono">
                    STRENGTH RETRAINING
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">8 WEEKS</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-4">Jessica Okafor</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-sans mt-2">
                  Jessica combined posterior chain squat patterns and customized low-impact core drills to rebuild deep knee stabilization.
                </p>
              </div>

              {/* Split screen content */}
              <div className="grid grid-cols-2 gap-2 mt-6 h-52 relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                {/* Before view */}
                <div className="relative overflow-hidden">
                  <img 
                    src={getDisplayImageUrl("https://www.instagram.com/alexfitnesshub/p/DZSglCsAPAr/")}
                    alt="Jessica Before"
                    className="w-full h-full object-cover grayscale opacity-75"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-[#EF4444] font-mono font-black">BEFORE</p>
                    <p className="text-lg font-black text-white leading-none mt-0.5">Post-OP</p>
                    <p className="text-[7px] text-slate-300 mt-1 font-mono uppercase tracking-wider">tendon strain</p>
                  </div>
                </div>

                {/* After view */}
                <div className="relative overflow-hidden">
                  <img 
                    src={getDisplayImageUrl("https://www.instagram.com/alexfitnesshub/p/DZSgoqXALNe/")}
                    alt="Jessica After"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-[#10B981] font-mono font-black">AFTER</p>
                    <p className="text-lg font-black text-emerald-400 leading-none mt-0.5">Active</p>
                    <p className="text-[7px] text-emerald-350 mt-1 font-mono uppercase tracking-wider">95kg Hipthrust</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">MOBILITY RECOVERY:</span>
                <span className="text-[#10B981] font-extrabold">100% Pain-free Range</span>
              </div>
            </div>

            {/* STORY BLOCK 3: TIMOTHY (Calisthenics & Lean) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 p-6 flex flex-col justify-between overflow-hidden relative group shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-[#10B981] dark:text-emerald-400 px-3 py-1 rounded-lg font-mono">
                    CALISTHENICS ATHLETE
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">16 WEEKS</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-4">Timothy Smith</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-sans mt-2">
                  Timothy unlocked flawless biomechanical control on parallettes and pull-up systems using customized calisthenics ladders.
                </p>
              </div>

              {/* Split screen content */}
              <div className="grid grid-cols-2 gap-2 mt-6 h-52 relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                {/* Before view */}
                <div className="relative overflow-hidden">
                  <img 
                    src={getDisplayImageUrl("https://www.instagram.com/alexfitnesshub/p/DZSgN9CgI1G/")}
                    alt="Timothy Before"
                    className="w-full h-full object-cover grayscale opacity-75"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-[#EF4444] font-mono font-black">BEFORE</p>
                    <p className="text-lg font-black text-white leading-none mt-0.5">0 Reps</p>
                    <p className="text-[7px] text-slate-300 mt-1 font-mono uppercase tracking-wider">basic grip stall</p>
                  </div>
                </div>

                {/* After view */}
                <div className="relative overflow-hidden">
                  <img 
                    src={getDisplayImageUrl("https://www.instagram.com/alexfitnesshub/p/DZSgRbrALBN/")}
                    alt="Timothy After"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-[#10B981] font-mono font-black">AFTER</p>
                    <p className="text-lg font-black text-emerald-400 leading-none mt-0.5">12 Reps</p>
                    <p className="text-[7px] text-emerald-350 mt-1 font-mono uppercase tracking-wider">muscle-ups logged</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">PULLUP MAX STUCT:</span>
                <span className="text-[#10B981] font-extrabold">+25 kg Weighted</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION WITH DRIVEN PARALLAX OFFSETS */}
      <section id="testimonials-segment" className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-sans bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/15 inline-block mb-1">Athlete Testimonials</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
              REVIEWS FROM ACTIVE TRAINING HUBS
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
              Feedback from certified premium competitors who integrated our metric trajectories.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-6">
            
            {/* Review Block 1 (Aesthetic drift down align) */}
            <div 
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 shadow-sm hover:-translate-y-1.5 md:translate-y-3 transition-all duration-300"
            >
              <div className="flex items-center gap-1 text-amber-500 mb-3 select-none">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4.5 h-4.5 fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans mb-4 italic">
                "Finding structured bodybuilding exercises combined with strict kinesiology safety indicators saved my shoulder joints completely. The V-Taper exercises are beautifully charted!"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-850 pt-3">
                <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white font-bold text-xs flex items-center justify-center font-sans">MA</div>
                <div>
                  <h5 className="text-xs font-bold text-slate-950 dark:text-white uppercase leading-none mb-0.5">Marcus Adebayo</h5>
                  <p className="text-[9px] text-slate-400 font-sans">MEMBER SINCE 2026</p>
                </div>
              </div>
            </div>

            {/* Review Block 2 (Aesthetic drift up align) */}
            <div 
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 shadow-sm hover:-translate-y-1.5 md:-translate-y-3 transition-all duration-300"
            >
              <div className="flex items-center gap-1 text-amber-500 mb-3 select-none">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4.5 h-4.5 fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans mb-4 italic">
                "Checking my daily body weight trajectory daily holds me 100% accountable. The Paystack billing cleared immediately and my local African food recommendations are amazingly calibrated."
              </p>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-850 pt-3">
                <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white font-bold text-xs flex items-center justify-center font-sans">JO</div>
                <div>
                  <h5 className="text-xs font-bold text-slate-950 dark:text-white uppercase leading-none mb-0.5">Jessica Okafor</h5>
                  <p className="text-[9px] text-slate-400 font-sans">MEMBER SINCE 2026</p>
                </div>
              </div>
            </div>

            {/* Review Block 3 (Aesthetic drift stagger align) */}
            <div 
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 shadow-sm hover:-translate-y-1.5 md:translate-y-6 transition-all duration-300"
            >
              <div className="flex items-center gap-1 text-amber-500 mb-3 select-none">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4.5 h-4.5 fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans mb-4 italic">
                "The server-side integrated Gemini AI works brilliantly. It answers water index queries and calibrates precise nutrient fruit plans like grapefruit recovery targets after lifting. Flawless."
              </p>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-850 pt-3">
                <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white font-bold text-xs flex items-center justify-center font-sans">TS</div>
                <div>
                  <h5 className="text-xs font-bold text-slate-950 dark:text-white uppercase leading-none mb-0.5">Timothy Smith</h5>
                  <p className="text-[9px] text-slate-400 font-sans">MEMBER SINCE 2026</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

        {/* Premium Membership Plans */}
      <section id="pricing" className="py-20 lg:py-28 bg-[#F4F6F9] dark:bg-slate-950/45 border-b border-slate-200 dark:border-slate-900 relative">
        <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-sans bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/15 inline-block">Premium Membership Plans</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              Choose Your Training Level
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-sans">
              Choose your calibration depth. Seamless payments guarded by PCI-DSS secured Paystack clearances.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* PLAN CARD 1: BASE ROUTINES MONTHLY */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 hover:border-blue-500/50 hover:shadow-xl transition-all flex flex-col justify-between relative">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-350 font-sans border border-slate-200 dark:border-slate-805">
                  MONTHLY STARTER
                </span>
                
                <div className="mt-5">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">₦19,999</span>
                  <span className="text-slate-450 text-xs ml-1 font-sans">/ 1 Month</span>
                </div>
                
                <p className="text-xs text-slate-500 mt-2 font-sans leading-relaxed">
                  Excellent entry-level tier to experience the core ecosystem, log active routines, and calibrate baseline nutritional plans.
                </p>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-5 space-y-2.5 text-xs text-slate-650 dark:text-slate-350">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Complete Exercise Library
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Baseline Calorie Calibrator
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Private Progress History curve
                  </div>
                  <div className="flex items-center gap-2 opacity-40">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    HD slow-mo execution play
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-105 dark:border-slate-850">
                <button
                  onClick={() => handleInitiatePayment("monthly")}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs uppercase rounded-xl transition-all font-sans shadow-sm"
                >
                  Pay with Paystack
                </button>
              </div>
            </div>

            {/* PLAN CARD 2: INTERACTIVE FLEXIBLE MULTI-MONTH SELECTOR */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-900 hover:border-blue-500/50 hover:shadow-xl transition-all flex flex-col justify-between relative z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E3A8A] text-white text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-blue-500">
                FLEXIBLE DURATION STACK
              </div>
              
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-[#1E3A8A] dark:text-blue-300 font-mono border border-blue-500/20">
                  ALPHA SHIELD SPAN
                </span>
                
                <div className="mt-5">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    ₦{multiMonthTotal.toLocaleString()}
                  </span>
                  <span className="text-slate-450 text-xs ml-1 font-mono">/ total due</span>
                </div>

                <p className="text-xs text-slate-500 mt-2 font-sans leading-relaxed">
                  Tailor customized months to align precisely with your physique recomposition timeline targets.
                </p>

                {/* Live Interactive Month selector slider container */}
                <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono font-extrabold uppercase">
                    <span className="text-slate-450">CHOOSE TIMELINE:</span>
                    <span className="text-blue-500 dark:text-emerald-400 bg-blue-500/5 px-2.5 py-0.5 rounded-md border border-blue-500/10">
                      {selectedMonths} Months Training
                    </span>
                  </div>
                  
                  {/* Stepper Month Blocks Selector */}
                  <div className="flex justify-between gap-1 select-none">
                    {[2, 3, 4, 5, 6].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMonths(m)}
                        className={`flex-1 py-2 rounded text-xs font-mono font-black transition-all border ${
                          selectedMonths === m
                            ? "bg-[#1E3A8A] text-white border-transparent shadow shadow-blue-505/30"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-805"
                        }`}
                      >
                        {m}M
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-400 font-sans leading-none text-center">₦19,999 base fee multiplied by {selectedMonths} months</p>
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-slate-650 dark:text-slate-350">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Uncapped access over complete {selectedMonths} months
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Continuous AI Coach priority assistant features
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Dynamic Treadmill 12-30-3 module unlocks
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-850">
                <button
                  onClick={() => handleInitiatePayment("multi")}
                  className="w-full py-3 bg-[#1E3A8A] hover:bg-[#1E40AF] text-[#ffffff] font-extrabold text-xs uppercase rounded-xl transition-all font-sans shadow"
                >
                  Pay with Paystack
                </button>
              </div>
            </div>

            {/* PLAN CARD 3: HEAVY DISCOUNTED YEARLY PLAN (10% DISCOUNT) */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-650 dark:border-blue-500/50 shadow-2xl transition-all flex flex-col justify-between relative">
              
              {/* SPEC BADGES */}
              <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                <span className="bg-[#1E3A8A] text-white text-[8px] font-black uppercase py-0.5 px-2.5 rounded-full tracking-wider animate-bounce border border-blue-400/20">
                  ★ MOST POPULAR
                </span>
                <span className="bg-blue-600 text-white text-[8px] font-black uppercase py-0.5 px-2.5 rounded-full tracking-wider">
                  BEST VALUE
                </span>
              </div>
              
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-sans border border-blue-500/20">
                  YEARLY CHAMPION PRESTIGE
                </span>
                
                <div className="mt-5">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">₦215,989</span>
                  <span className="text-slate-450 text-xs ml-1 font-sans">/ 12 Months</span>
                </div>

                {/* Instant display of Savings and discount ratios */}
                <div className="mt-2.5 flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 rounded-lg p-2.5">
                  <span className="bg-blue-600 text-white text-[9px] font-sans font-black py-0.5 px-2 rounded">10% OFF</span>
                  <div className="text-[10px] font-sans leading-tight">
                    <p className="font-extrabold text-blue-600 dark:text-blue-400">SAVINGS ACTIVE</p>
                    <p className="text-slate-500">Annual Savings: ₦{yearlySavingsAmt.toLocaleString()}</p>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 mt-3 font-sans leading-relaxed">
                  Ultimate dedicated year-round program. Perfect for active physical transformations, tactical military preps, or bodybuilding goals.
                </p>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-5 space-y-2.5 text-xs text-slate-650 dark:text-slate-350">
                  <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Elite priority AI response queue
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Slow-Mo 0.5x execution biomechanical curves
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Full-year meal profiling & weight logs tracking
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    VIP Community post & forum unlock privileges
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-850">
                <button
                  onClick={() => handleInitiatePayment("yearly")}
                  className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-black text-xs uppercase rounded-xl transition-all font-sans shadow-md"
                >
                  Pay with Paystack
                </button>
              </div>
            </div>

          </div>

          {/* Feature Comparison Table */}
          <div className="mt-20 max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm relative">
            <h4 className="text-center font-bold font-sans text-xs uppercase text-blue-600 dark:text-blue-400 mb-1">Feature Comparison</h4>
            <h5 className="text-center font-extrabold text-xl text-slate-900 dark:text-white mb-8 uppercase font-sans">Standard Tier vs Premium Access</h5>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-sans text-[10px] font-bold">
                    <th className="pb-3 bg-transparent">CORE ATTRIBUTE FOCUS</th>
                    <th className="pb-3 text-center">FREE PLAN</th>
                    <th className="pb-3 text-blue-600 dark:text-blue-400 font-extrabold text-center">PREMIUM PLAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-250 font-sans text-left">
                  <tr>
                    <td className="py-3.5 font-semibold text-[10.5px] uppercase text-slate-600 dark:text-slate-400">Movement Database Depth</td>
                    <td className="py-3.5 text-center text-slate-550">25 Exercises</td>
                    <td className="py-3.5 text-center text-blue-600 dark:text-blue-400 font-bold">1,200+ Variations</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-semibold text-[10.5px] uppercase text-slate-600 dark:text-slate-400">Instructional Technique Guides</td>
                    <td className="py-3.5 text-center text-slate-400">Locked ✕</td>
                    <td className="py-3.5 text-center text-blue-600 dark:text-blue-400 font-bold">Fully Unlocked ✓</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-semibold text-[10.5px] uppercase text-slate-600 dark:text-slate-400">Advanced Demo Loops</td>
                    <td className="py-3.5 text-center text-slate-550">Standard Rate</td>
                    <td className="py-3.5 text-center text-blue-600 dark:text-blue-400 font-bold">Comprehensive Guided Video Loops ✓</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-semibold text-[10.5px] uppercase text-slate-600 dark:text-slate-400">AI Assistant Guidance</td>
                    <td className="py-3.5 text-center text-slate-550">3 Queries Daily</td>
                    <td className="py-3.5 text-center text-blue-600 dark:text-blue-400 font-bold">Unlimited Priority Responses ✓</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-semibold text-[10.5px] uppercase text-slate-600 dark:text-slate-400">Custom Progress Metrics</td>
                    <td className="py-3.5 text-center text-slate-550">Single History View</td>
                    <td className="py-3.5 text-center text-blue-600 dark:text-blue-400 font-bold">Interactive Dynamic Charts ✓</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-semibold text-[10.5px] uppercase text-slate-600 dark:text-slate-400">Community Social Interaction</td>
                    <td className="py-3.5 text-center text-slate-550">Read-Only Access</td>
                    <td className="py-3.5 text-center text-blue-600 dark:text-blue-400 font-bold">Create Post & Upload Photos ✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Secure Shield Protection Callout */}
          <div className="mt-12 max-w-md mx-auto p-6 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 text-center flex flex-col items-center">
            <Shield className="w-9 h-9 text-blue-600 dark:text-blue-400 mb-3 animate-pulse" />
            <h6 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">100% Risk-Free 14-Day Refund Match</h6>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-sans">
              Try premium with complete confidence. If our workout tracking or AI coaching does not upgrade your daily routine, request reimbursement within 14 days for rapid secure processing.
            </p>
          </div>

        </div>
      </section>

      {/* 8. DYNAMIC ACCORDION FAQS SYSTEM */}
      <section id="faqs-segment" className="py-20 lg:py-28 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 relative">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-sans bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/15 inline-block mb-1">Frequently Asked Questions</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
              FREQUENTLY ASKED INQUIRIES
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-450 font-sans">
              Learn how the security databases, treadmill models, and active subscriptions work.
            </p>
          </div>

          <div className="space-y-4">
            {faqsList.map((item, idx) => (
              <div 
                key={idx} 
                className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-sans font-extrabold text-[#0F172A] dark:text-white text-xs uppercase cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    {item.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${openFAQ === idx ? "rotate-180" : ""}`} />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openFAQ === idx ? "max-h-[300px] border-t border-slate-200 dark:border-slate-850 p-5 bg-white dark:bg-slate-950/40" : "max-h-0"
                  }`}
                >
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans select-all">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8.5 PREMIUM CONSULTATION HUB / CONTACT FORM */}
      <section id="contact" className="py-20 lg:py-28 bg-[#FAFBFD] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-sans bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/15 inline-block">Direct Contact Channel</span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              Connect With the Coaching Team
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans max-w-xl mx-auto">
              Ready to break plateaus or require tailored corporate/medical planning? Drop a direct note to Alex's coaching team.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-8 sm:p-10 rounded-[32px] shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />

            {contactSubmitted ? (
              <div className="text-center py-10 space-y-4 animate-scale-in text-left">
                <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase font-sans text-center">Message Synced Safely</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed text-center">
                  Excellent, <strong className="text-slate-700 dark:text-slate-300">{contactName}</strong>! Your inquiry regarding <strong className="text-slate-700 dark:text-slate-300">{contactGoal.toUpperCase()}</strong> has been captured. Alex's senior desk team will evaluate your physical background details and follow up via <span className="underline font-mono">{contactEmail}</span> within 24 standard working hours.
                </p>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setContactSubmitted(false)}
                    className="mt-4 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-855 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 transition inline-block mx-auto text-center"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6 relative z-10 text-left">
                <div className="grid sm:grid-cols-2 gap-6 text-left">
                  {/* Name field */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">YOUR FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition text-xs font-mono"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition text-xs font-mono"
                      placeholder="e.g. john@domain.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-1 gap-6 text-left">
                  {/* Goal category field */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">PRIMARY PHYSICAL GOAL</label>
                    <select
                      value={contactGoal}
                      onChange={(e) => setContactGoal(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition text-xs font-sans uppercase font-bold"
                    >
                      <option value="hypertrophy">Hypertrophy (Anabolic Muscle Gain)</option>
                      <option value="fat_loss">Fat Shred Cycles (Metabolic Burn)</option>
                      <option value="calisthenics">Bodyweight Leverage stability</option>
                      <option value="rehabilitation">Joint Posture Rehabilitation</option>
                      <option value="nutrition">Custom Macronutrient profiling</option>
                    </select>
                  </div>
                </div>

                {/* Message details field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">SPECIFIC ATHLETIC ENQUIRY</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition text-xs leading-relaxed"
                    placeholder="Describe your current lifting stats, weekly training splits, and any local dietary requirements..."
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-4 bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase cursor-pointer rounded-xl transition duration-200 flex items-center justify-center gap-2 tracking-widest shadow-lg shadow-emerald-500/10 active:scale-98"
                >
                  <Zap className="w-4 h-4 text-slate-950 animate-bounce" />
                  {isSubmittingContact ? "SECURELY TRANSMITTING INQUIRY..." : "SEND PRIORITY SIGNAL MESSAGE"}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* 9. FRICTIONLESS EMBEDDED PAYSTACK SECURE PORTAL OVERLAY */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl animate-scale-in">
            
            {/* HUD portal header */}
            <div className="bg-slate-900 p-5 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 bg-[#10B981] text-[10px] font-black text-slate-950 rounded-lg flex items-center justify-center font-mono">P</span>
                <span className="font-extrabold tracking-wider text-xs font-mono uppercase text-emerald-400">SECURE PAYSTACK PORTAL</span>
              </div>
              <button 
                onClick={() => setActivePaymentModal(null)} 
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 text-xs font-sans">
              
              {/* Receipt details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] border border-slate-200 dark:border-slate-850 space-y-2">
                <div className="flex justify-between font-mono text-[10px] uppercase text-slate-400">
                  <span>Selected Option:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {activePaymentModal === "yearly" ? "12 Months Tier" : activePaymentModal === "multi" ? `${selectedMonths} Months Stack` : "Monthly Entry Option"}
                  </span>
                </div>
                <div className="flex justify-between font-mono py-1.5 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 uppercase">CALCULATED TOTAL Amount:</span>
                  <span className="font-black text-blue-500 dark:text-emerald-400 text-sm">
                    ₦{activePaymentModal === "yearly" ? yearlyPriceAnnual.toLocaleString() : activePaymentModal === "multi" ? multiMonthTotal.toLocaleString() : basePriceMonthly.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal text-center italic">✓ PCI-DSS Tier 1 Encrypted Transmission</p>
              </div>

              {/* ACTION: PRIMARY SECURE HIGH-CONVERTING GATE ENTRY */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleRealPaystackPayment}
                  disabled={submittingPlan !== null}
                  className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[#090D16] bg-[#10B981] hover:bg-emerald-400 transition-all duration-250 flex items-center justify-center gap-2 font-mono shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  {submittingPlan ? "LAUNCHING SECURE POPUP..." : "PAY VIA PAYSTACK POPUP"}
                </button>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal text-center">
                    Pay securely using card, bank transfer, USSD, or QR code through Paystack's official SSL gateway.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 10. SYSTEM FOOTER */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-16 font-sans">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-sans font-bold text-lg text-white">
              <Dumbbell className="h-5 w-5 text-blue-500" />
              <span>AlexFitnessHub</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Deploying elite exercise kinesis benchmarks, absolute macronutrient nutrition tracking, and unified AI-powered consultation.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-3 font-sans">Training Libraries</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><button onClick={() => setView("library")} className="hover:text-blue-400 transition-colors">Treadmill Walk 12-30-3</button></li>
              <li><button onClick={() => setView("library")} className="hover:text-blue-400 transition-colors">Chest Isolation Press</button></li>
              <li><button onClick={() => setView("library")} className="hover:text-blue-400 transition-colors">Home Shred Workouts</button></li>
              <li><button onClick={() => setView("library")} className="hover:text-blue-400 transition-colors">Cervical Upper Neck Harness</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-3 font-sans">Premium Features</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><button onClick={() => setView("home")} className="hover:text-blue-400 transition-colors">Multi-Month Selectors</button></li>
              <li><button onClick={() => setView("dashboard")} className="hover:text-blue-400 transition-colors">Body Weight Tracker</button></li>
              <li><button onClick={() => setView("coach")} className="hover:text-blue-400 transition-colors">Gemini AI Assistant</button></li>
              <li><button onClick={() => setView("home")} className="hover:text-blue-400 transition-colors">Paystack Integration</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-3 font-sans">Customer Support</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-sans font-sans">
              Have questions or transaction inquiries? Contact our premium support ecosystem directly at:
              <br />
              <code className="text-[10px] text-blue-400 bg-slate-900 px-2 py-1 rounded inline-block mt-2 font-mono">support@alexfitnesshub.com</code>
            </p>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-8 mt-8 border-t border-slate-900 text-center text-xs flex flex-wrap justify-between items-center gap-4 text-slate-500">
          <p>© 2026 AlexFitnessHub Inc. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
