import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { auth, db, isMockFirebase } from "../lib/firebase";
import { 
  UserProfile, 
  SavedWorkout, 
  ActivityLog, 
  WeightGoalLog, 
  PaystackTransaction, 
  ChatMessage,
  CommunityPost,
  Testimonial,
  CustomProgram
} from "../types";
import { EXERCISES, Exercise } from "../data/exercises";

interface AppContextType {
  user: UserProfile | null;
  loading: boolean;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  savedWorkouts: string[];
  activityLogs: ActivityLog[];
  weightLogs: WeightGoalLog[];
  transactions: PaystackTransaction[];
  chatMessages: ChatMessage[];
  exercises: Exercise[];
  
  // Custom interactive models
  communityPosts: CommunityPost[];
  testimonials: Testimonial[];
  
  // Auth Functions
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  signUpEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Profile Update Functions
  updateProfileDetails: (details: { weight?: number; height?: number; gender?: string; fitnessGoals?: string }) => Promise<void>;
  completeOnboarding: (onboardingData: Partial<UserProfile>) => Promise<void>;
  
  // Workout Interactions
  toggleSaveWorkout: (exerciseId: string) => Promise<void>;
  logWorkoutCompletion: (exerciseId: string, reps: number, weight: number, notes?: string) => Promise<void>;
  
  // Progress
  addWeightLogAction: (weight: number, bodyFat?: number) => Promise<void>;
  updateWaterIntake: (amountMl: number) => Promise<void>;
  
  // Subscriptions & Payments
  upgradeWithPaystack: (reference: string, plan: "monthly" | "yearly") => Promise<void>;
  cancelSubscription: () => Promise<void>;
  
  // AI Coach Chat
  sendCoachMessage: (message: string) => Promise<void>;
  clearCoachChat: () => void;
  
  // Community Forum & Testimonials
  addCommunityPost: (content: string, category: "Progress Picture" | "Workout Result" | "Transformation Story" | "Achievement" | "General Discussion" | "Challenge", imageUrl?: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, commentContent: string) => Promise<void>;
  reportPost: (postId: string) => Promise<void>;
  moderatePost: (postId: string, action: "approve" | "delete") => Promise<void>;
  submitTestimonial: (category: "Weight Loss" | "Muscle Building" | "General Journey" | "Transformation Story", rating: number, content: string, beforeImageUrl?: string, afterImageUrl?: string) => Promise<void>;
  approveTestimonial: (testimonialId: string) => Promise<void>;
  deleteTestimonial: (testimonialId: string) => Promise<void>;

  // Custom Programs Context Fields
  customPrograms: CustomProgram[];
  saveCustomProgram: (program: Omit<CustomProgram, "userId" | "id" | "createdAt">) => Promise<void>;
  deleteCustomProgram: (id: string) => Promise<void>;
  
  // Admin Operations
  adminTogglePremium: (exerciseId: string) => void;
  adminUpdateUserTier: (uid: string, level: "free" | "premium", tier: "monthly" | "yearly" | "none") => void;
  allSystemUsers: UserProfile[];
  uploadExerciseMedia: (exerciseId: string, mediaUrl: string | null, mediaType?: "image" | "video") => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`localStorage Quota Exceeded for key "${key}". Gracefully falling back without crashing.`, error);
    try {
      // Clear a potentially huge element that is not absolutely critical to active user profile session
      if (key !== "fit_exercises") {
        localStorage.removeItem("fit_exercises");
        localStorage.setItem(key, value);
      }
    } catch (retryError) {
      console.error("Critical: Retrying localStorage setItem after freeing space still failed:", retryError);
    }
  }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userState, setUserState] = useState<UserProfile | null>(null);

  const setUser = (profileOrFn: UserProfile | null | ((prev: UserProfile | null) => UserProfile | null)) => {
    const applyAdminOverride = (profile: UserProfile | null): UserProfile | null => {
      if (profile && (profile.email === "alexfitnesshub@gmail.com" || profile.email === "muzikworld08@gmail.com")) {
        return {
          ...profile,
          role: "admin",
          subscriptionStatus: "premium",
          subscriptionTier: "yearly"
        };
      }
      return profile;
    };

    if (typeof profileOrFn === "function") {
      setUserState(prev => applyAdminOverride(profileOrFn(prev)));
    } else {
      setUserState(applyAdminOverride(profileOrFn));
    }
  };

  const user = userState;
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [savedWorkouts, setSavedWorkouts] = useState<string[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightGoalLog[]>([]);
  const [transactions, setTransactions] = useState<PaystackTransaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [exercises, setExercisesState] = useState<Exercise[]>(EXERCISES);
  const [customPrograms, setCustomPrograms] = useState<CustomProgram[]>([]);

  // Admin view datasets (fallback analytics)
  const [allSystemUsers, setAllSystemUsers] = useState<UserProfile[]>([]);

  // Community & Testimonial states
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);


  // Apply visual theme to document body
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Handle local state tracking for sandboxed sessions
  useEffect(() => {
    const storedTheme = localStorage.getItem("fit_theme") as "light" | "dark";
    if (storedTheme) setTheme(storedTheme);

    const storedExercises = localStorage.getItem("fit_exercises");
    if (storedExercises) {
      setExercisesState(JSON.parse(storedExercises));
    }
  }, []);

  // Fetch and sync custom exercise overrides from Firestore and local Express server JSON file
  useEffect(() => {
    const fetchCustomDatabaseOverrides = async () => {
      try {
        // 1. Fetch from Local Express Server JSON file
        const apiRes = await fetch("/api/exercises/custom-media");
        const apiData = await apiRes.json();
        const serverOverrides = apiData.success ? apiData.overrides : {};
        
        // 2. Fetch from Cloud Firestore (primary cross-user database)
        let firestoreOverrides: Record<string, { customMediaUrl?: string; customMediaType?: "image" | "video" }> = {};
        if (!isMockFirebase) {
          try {
            const snap = await getDocs(collection(db, "exercises"));
            snap.docs.forEach(d => {
              const data = d.data();
              if (data.customMediaUrl) {
                firestoreOverrides[d.id] = {
                  customMediaUrl: data.customMediaUrl,
                  customMediaType: data.customMediaType || "image"
                };
              }
            });
          } catch (fErr) {
            console.warn("Firestore custom exercise overrides fetch failed, relying on server file:", fErr);
          }
        }

        // Merge sources (Firestore overrides take ultimate priority, server file is fallback/local server persistence)
        const mergedOverrides = { ...serverOverrides, ...firestoreOverrides };

        if (Object.keys(mergedOverrides).length > 0) {
          setExercisesState(prev => prev.map(ex => {
            const override = mergedOverrides[ex.id];
            if (override) {
              return {
                ...ex,
                customMediaUrl: override.customMediaUrl ?? ex.customMediaUrl,
                customMediaType: override.customMediaType ?? ex.customMediaType
              };
            }
            return ex;
          }));
        }
      } catch (err) {
        console.error("Error loading customized exercises overrides:", err);
      }
    };

    fetchCustomDatabaseOverrides();
  }, [isMockFirebase]);

  // Sync state data on Auth State Transitions
  useEffect(() => {
    setLoading(true);
    
    // Primary Firebase Session Management
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Attempt profile fetch from Firestore
          let profile: UserProfile | null = null;
          
          if (!isMockFirebase) {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userSnap = await getDoc(userDocRef);
            
            if (userSnap.exists()) {
              profile = userSnap.data() as UserProfile;
              // Cache in local storage for subsequent offline loads
              safeSetItem(`fit_user_${profile.uid}`, JSON.stringify(profile));
            } else {
              // Build clean profile
              profile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Athlete",
                photoURL: firebaseUser.photoURL || undefined,
                role: firebaseUser.email === "alexfitnesshub@gmail.com" ? "admin" : "user",
                subscriptionStatus: "free",
                subscriptionTier: "none",
                createdAt: new Date().toISOString(),
                onboarded: false,
              };
              await setDoc(userDocRef, profile);
              // Cache in local storage
              safeSetItem(`fit_user_${profile.uid}`, JSON.stringify(profile));
            }
          } else {
            // Local fallback extraction
            const localUser = localStorage.getItem(`fit_user_${firebaseUser.uid}`);
            if (localUser) {
              profile = JSON.parse(localUser);
            } else {
              profile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "Fallback User",
                role: firebaseUser.email === "alexfitnesshub@gmail.com" ? "admin" : "user",
                subscriptionStatus: "free",
                subscriptionTier: "none",
                createdAt: new Date().toISOString()
              };
              safeSetItem(`fit_user_${firebaseUser.uid}`, JSON.stringify(profile));
            }
          }
          
          setUser(profile);
          
          // Load User metadata records (saved Workouts, logs)
          loadUserData(firebaseUser.uid);
          
        } catch (err) {
          console.warn("Firestore profile read failed, resolving to local backup cache:", err);
          
          // Fallback to local cache if present
          const localUser = localStorage.getItem(`fit_user_${firebaseUser.uid}`);
          let profile: UserProfile;
          
          if (localUser) {
            try {
              profile = JSON.parse(localUser);
            } catch (parseErr) {
              profile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "local@alexfitness.com",
                displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Athlete",
                role: firebaseUser.email === "alexfitnesshub@gmail.com" ? "admin" : "user",
                subscriptionStatus: "free",
                subscriptionTier: "none",
                createdAt: new Date().toISOString()
              };
            }
          } else {
            profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "local@alexfitness.com",
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Athlete",
              role: firebaseUser.email === "alexfitnesshub@gmail.com" ? "admin" : "user",
              subscriptionStatus: "free",
              subscriptionTier: "none",
              createdAt: new Date().toISOString()
            };
            safeSetItem(`fit_user_${firebaseUser.uid}`, JSON.stringify(profile));
          }
          
          setUser(profile);
          loadUserData(firebaseUser.uid);
        }
      } else {
        // Explicitly logged out
        setUser(null);
        setSavedWorkouts([]);
        setActivityLogs([]);
        setWeightLogs([]);
        setTransactions([]);
        setChatMessages([]);
        setCustomPrograms([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = (uid: string) => {
    // Custom programs loading
    const pCustomProgs = localStorage.getItem(`fit_custom_programs_${uid}`);
    if (pCustomProgs) setCustomPrograms(JSON.parse(pCustomProgs));

    if (!isMockFirebase) {
      const q = query(collection(db, "custom_programs"), where("userId", "==", uid));
      getDocs(q)
        .then((snapshot) => {
          const list: CustomProgram[] = [];
          snapshot.forEach((d) => list.push(d.data() as CustomProgram));
          list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          setCustomPrograms(list);
          safeSetItem(`fit_custom_programs_${uid}`, JSON.stringify(list));
        })
        .catch((err) => {
          console.warn("Error fetching custom programs from firestore: ", err);
        });
    }

    // Standard Local Storage keys mapped to specific users so we survive any Firestore quotas/permissions
    const pSaves = localStorage.getItem(`fit_saves_${uid}`);
    if (pSaves) setSavedWorkouts(JSON.parse(pSaves));

    const pLogs = localStorage.getItem(`fit_activity_${uid}`);
    if (pLogs) setActivityLogs(JSON.parse(pLogs));

    const pWeights = localStorage.getItem(`fit_weights_${uid}`);
    if (pWeights) {
      setWeightLogs(JSON.parse(pWeights));
    } else {
      // Default logs to draw an initial pretty progress chart
      const initialLogs: WeightGoalLog[] = [
        { id: "1", date: "2026-06-01", weight: 81.2 },
        { id: "2", date: "2026-06-03", weight: 80.8 },
        { id: "3", date: "2026-06-06", weight: 80.5 },
        { id: "4", date: "2026-06-09", weight: 79.9 },
        { id: "5", date: "2026-06-12", weight: 79.2 },
      ];
      setWeightLogs(initialLogs);
      safeSetItem(`fit_weights_${uid}`, JSON.stringify(initialLogs));
    }

    const pTrans = localStorage.getItem(`fit_trans_${uid}`);
    if (pTrans) setTransactions(JSON.parse(pTrans));

    const pChats = localStorage.getItem(`fit_chats_${uid}`);
    if (pChats) setChatMessages(JSON.parse(pChats));

    // Load community posts
    if (!isMockFirebase) {
      getDocs(collection(db, "community_posts"))
        .then((snapshot) => {
          const list: CommunityPost[] = [];
          snapshot.forEach((d) => list.push(d.data() as CommunityPost));
          list.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
          if (list.length > 0) {
            setCommunityPosts(list);
            safeSetItem("fit_community_posts", JSON.stringify(list));
          } else {
            loadLocalCommunitySeed();
          }
        })
        .catch(() => loadLocalCommunitySeed());
    } else {
      loadLocalCommunitySeed();
    }

    // Load testimonials
    if (!isMockFirebase) {
      getDocs(collection(db, "testimonials"))
        .then((snapshot) => {
          const list: Testimonial[] = [];
          snapshot.forEach((d) => list.push(d.data() as Testimonial));
          list.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
          if (list.length > 0) {
            setTestimonials(list);
            safeSetItem("fit_testimonials", JSON.stringify(list));
          } else {
            loadLocalTestimonialSeed();
          }
        })
        .catch(() => loadLocalTestimonialSeed());
    } else {
      loadLocalTestimonialSeed();
    }

    // Gather overall admin analytics dataset safely
    const adminSavedUsers = localStorage.getItem("all_system_users");

    if (adminSavedUsers) {
      setAllSystemUsers(JSON.parse(adminSavedUsers));
    } else {
      // Seed some demo users in the admin dashboard to make the UI look alive
      const seeds: UserProfile[] = [
        { uid: "admin1", email: "alexfitnesshub@gmail.com", displayName: "Alex Admin", role: "admin", subscriptionStatus: "premium", subscriptionTier: "yearly" },
        { uid: "user1", email: "david.beck@gmail.com", displayName: "David Beck", role: "user", subscriptionStatus: "premium", subscriptionTier: "monthly" },
        { uid: "user2", email: "clara.fit@yahoo.com", displayName: "Clara Oswald", role: "user", subscriptionStatus: "free", subscriptionTier: "none" },
        { uid: "user3", email: "samuel.strong@gmail.com", displayName: "Sam Muscles", role: "user", subscriptionStatus: "premium", subscriptionTier: "yearly" }
      ];
      setAllSystemUsers(seeds);
      safeSetItem("all_system_users", JSON.stringify(seeds));
    }
  };

  const syncUserToStorageAndPlatform = async (updated: UserProfile) => {
    setUser(updated);
    safeSetItem(`fit_user_${updated.uid}`, JSON.stringify(updated));
    
    // Update admin analytics list
    setAllSystemUsers(prev => {
      const filtered = prev.filter(u => u.uid !== updated.uid);
      const nextList = [...filtered, updated];
      safeSetItem("all_system_users", JSON.stringify(nextList));
      return nextList;
    });

    if (!isMockFirebase && auth.currentUser) {
      // Fire-and-forget background synchronization to prevent UI main-thread latency or blockage from TCP offline retries
      updateDoc(doc(db, "users", updated.uid), { ...updated })
        .catch(err => {
          console.warn("Firestore background sync failed, relying on local state:", err);
        });
    }
  };

  // --- AUTH SERVICES ---
  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithApple = async () => {
    throw new Error("Apple login is not configured on this web domain. Please use Google or Email credentials.");
  };

  const signUpEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const profile: UserProfile = {
      uid: cred.user.uid,
      email: email,
      displayName: name,
      role: email === "alexfitnesshub@gmail.com" ? "admin" : "user",
      subscriptionStatus: "free",
      subscriptionTier: "none",
      createdAt: new Date().toISOString(),
      onboarded: false,
    };
    
    if (!isMockFirebase) {
      await setDoc(doc(db, "users", cred.user.uid), profile);
    }
    
    setUser(profile);
    loadUserData(cred.user.uid);
  };

  const loginEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    loadUserData(cred.user.uid);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setLoading(false);
  };

  // --- WORKOUT LOGIC ---

  const toggleSaveWorkout = async (exerciseId: string) => {
    if (!user) return;
    const isSaved = savedWorkouts.includes(exerciseId);
    let nextSaves: string[];
    if (isSaved) {
      nextSaves = savedWorkouts.filter(id => id !== exerciseId);
    } else {
      nextSaves = [...savedWorkouts, exerciseId];
    }
    setSavedWorkouts(nextSaves);
    safeSetItem(`fit_saves_${user.uid}`, JSON.stringify(nextSaves));
  };

  const logWorkoutCompletion = async (exerciseId: string, reps: number, weight: number, notes?: string) => {
    if (!user) return;
    const targetEx = exercises.find(e => e.id === exerciseId);
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(7),
      exerciseId,
      exerciseName: targetEx?.name || exerciseId,
      date: new Date().toISOString(),
      weight,
      reps,
      notes
    };
    const nextLogs = [newLog, ...activityLogs];
    setActivityLogs(nextLogs);
    safeSetItem(`fit_activity_${user.uid}`, JSON.stringify(nextLogs));
  };

  const addWeightLogAction = async (weight: number, bodyFat?: number) => {
    if (!user) return;
    const newLog: WeightGoalLog = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString().split("T")[0],
      weight,
      bodyFat
    };
    const nextLogs = [...weightLogs, newLog].sort((a,b) => a.date.localeCompare(b.date));
    setWeightLogs(nextLogs);
    safeSetItem(`fit_weights_${user.uid}`, JSON.stringify(nextLogs));
  };

  // --- ACTIONS & PAYMENTS HANDLERS ---

  const upgradeWithPaystack = async (reference: string, plan: "monthly" | "yearly") => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, email: user.email, plan })
      });
      const verifyRes = await res.json();
      
      if (verifyRes.success) {
        // Complete integration and active state
        const updated: UserProfile = {
          ...user,
          subscriptionStatus: "premium",
          subscriptionTier: plan,
          subscriptionExpiry: new Date(Date.now() + (plan === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
        };
        await syncUserToStorageAndPlatform(updated);
        
        // Add transaction log
        const transaction: PaystackTransaction = {
          id: reference,
          reference,
          amount: plan === "yearly" ? 490000 : 4900,
          plan,
          status: "success",
          paidAt: new Date().toISOString()
        };
        const nextTrans = [transaction, ...transactions];
        setTransactions(nextTrans);
        safeSetItem(`fit_trans_${user.uid}`, JSON.stringify(nextTrans));
      } else {
        throw new Error(verifyRes.error || "Payment verification declined.");
      }
    } catch (err: any) {
      console.error("Paystack verification failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      subscriptionStatus: "free",
      subscriptionTier: "none",
      subscriptionExpiry: null
    };
    await syncUserToStorageAndPlatform(updated);
  };

  const updateProfileDetails = async (details: { weight?: number; height?: number; gender?: string; fitnessGoals?: string }) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      ...details
    };
    await syncUserToStorageAndPlatform(updated);
  };

  // --- COACH AI ASSISTANT CHAT LINK ---

  const sendCoachMessage = async (messageText: string) => {
    if (!user) return;
    
    // 1. Save user query node
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      message: messageText,
      timestamp: new Date().toISOString()
    };
    
    const draftChats = [...chatMessages, userMsg];
    setChatMessages(draftChats);
    safeSetItem(`fit_chats_${user.uid}`, JSON.stringify(draftChats));

    try {
      // 2. Query Gemini-certified proxy
      const response = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: user.fitnessGoals || "General body improvement",
          currentWeight: user.weight,
          targetWeight: user.height ? Number(user.height) - 105 : 75, // intelligent math
          query: messageText,
          history: chatMessages.slice(-8), // send last 8 turns of context
          userEmail: user.email
        })
      });

      const resText = await response.json();
      
      const coachMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        message: resText.text || "I was unable to formulate a response. Let's try adjusting our routine direction!",
        timestamp: new Date().toISOString()
      };

      const finalChats = [...draftChats, coachMsg];
      setChatMessages(finalChats);
      safeSetItem(`fit_chats_${user.uid}`, JSON.stringify(finalChats));

    } catch (err: any) {
      console.error(err);
      const errMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        message: "Apologies, I'm experiencing high latency in my synthetic muscle-response cortex. Here's a quick coach tip: Focus on deep, slow concentric movements and ensure 1g of protein per pound of bodyweight today. Try sending again!",
        timestamp: new Date().toISOString()
      };
      setChatMessages([...draftChats, errMessage]);
    }
  };

  const clearCoachChat = () => {
    if (!user) return;
    setChatMessages([]);
    localStorage.removeItem(`fit_chats_${user.uid}`);
  };

  // --- ADMIN CUSTOMIZERS ---

  const adminTogglePremium = (exerciseId: string) => {
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, isPremium: !ex.isPremium };
      }
      return ex;
    });
    setExercisesState(updatedExercises);
    safeSetItem("fit_exercises", JSON.stringify(updatedExercises));
  };

  const uploadExerciseMedia = async (exerciseId: string, mediaUrl: string | null, mediaType?: "image" | "video") => {
    let finalMediaUrl = mediaUrl;

    // 1. Persist to local server-side JSON file (and translate physical Base64 payload into static files)
    try {
      const res = await fetch("/api/exercises/save-custom-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId,
          customMediaUrl: mediaUrl,
          customMediaType: mediaType
        })
      });
      const data = await res.json();
      if (!data.success) {
        console.error("Local server save error:", data.error);
      } else {
        console.log(`Saved custom exercise media to local server files.`);
        if (data.customMediaUrl) {
          finalMediaUrl = data.customMediaUrl;
        }
      }
    } catch (err) {
      console.error("Failed to save custom media to local server files:", err);
    }

    // 2. Update React Local Client State and LocalStorage with the clean local path
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { 
          ...ex, 
          customMediaUrl: finalMediaUrl || undefined, 
          customMediaType: mediaType || undefined 
        };
      }
      return ex;
    });
    setExercisesState(updatedExercises);
    safeSetItem("fit_exercises", JSON.stringify(updatedExercises));

    // 3. Persist same clean path to real Cloud Firestore (so other users see it instantly)
    if (!isMockFirebase) {
      try {
        const docRef = doc(db, "exercises", exerciseId);
        await setDoc(docRef, {
          id: exerciseId,
          customMediaUrl: finalMediaUrl || null,
          customMediaType: mediaType || null,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`Saved custom exercise media to Cloud Firestore!`);
      } catch (err) {
        console.error("Failed to save custom media to Cloud Firestore:", err);
      }
    }
  };

  const adminUpdateUserTier = (uid: string, level: "free" | "premium", tier: "monthly" | "yearly" | "none") => {
    const editIndex = allSystemUsers.findIndex(u => u.uid === uid);
    if (editIndex !== -1) {
      const list = [...allSystemUsers];
      list[editIndex] = {
        ...list[editIndex],
        subscriptionStatus: level,
        subscriptionTier: tier
      };
      setAllSystemUsers(list);
      safeSetItem("all_system_users", JSON.stringify(list));
      
      // If editing current user, sync immediately
      if (user && user.uid === uid) {
        setUser(list[editIndex]);
      }
    }
  };

  function setThemeAction(t: "light" | "dark") {
    setTheme(t);
    safeSetItem("fit_theme", t);
  }

  // --- SEED SECTIONS ---
  const loadLocalCommunitySeed = () => {
    const cached = localStorage.getItem("fit_community_posts");
    if (cached) {
      setCommunityPosts(JSON.parse(cached));
    } else {
      const seedPosts: CommunityPost[] = [
        {
          id: "seed_post_1",
          userId: "user1",
          userDisplayName: "David Beck",
          userEmail: "david.beck@gmail.com",
          content: "Just completed my second week of the Gladiator Powerbuilding routine. Down to 80.5kg and muscle definition is peaking! The customized training tips are so authentic.",
          category: "Transformation Story",
          likes: ["user2", "user3"],
          comments: [
            { id: "c1", userId: "user2", userDisplayName: "Clara Oswald", content: "Super proud of your consistency, David! Keep squeezing those traps!", createdAt: new Date(Date.now() - 3600000).toISOString() }
          ],
          status: "active",
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "seed_post_2",
          userId: "user3",
          userDisplayName: "Sam Muscles",
          userEmail: "samuel.strong@gmail.com",
          content: "First time hitting a solid 140kg barbell back squat squat bench series today! Absolute landmark performance. Let's conquer the weekend warriors!",
          category: "Achievement",
          likes: ["user1"],
          comments: [],
          status: "active",
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      setCommunityPosts(seedPosts);
      safeSetItem("fit_community_posts", JSON.stringify(seedPosts));
    }
  };

  const loadLocalTestimonialSeed = () => {
    const cached = localStorage.getItem("fit_testimonials");
    if (cached) {
      setTestimonials(JSON.parse(cached));
    } else {
      const seedStories: Testimonial[] = [
        {
          id: "story_1",
          userId: "user1",
          userDisplayName: "David Beck",
          userEmail: "david.beck@gmail.com",
          category: "Weight Loss",
          rating: 5,
          content: "AlexFitnessHub has revolutionized my approach to diet. As an African fitness enthusiast, getting macros calibrated around plantains, egusi soup, and sweet potatoes with accurate counts was impossible until this platform. The AI Coach recommendations are incredibly precise!",
          approved: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "story_2",
          userId: "user3",
          userDisplayName: "Sam Muscles",
          userEmail: "samuel.strong@gmail.com",
          category: "Muscle Building",
          rating: 5,
          content: "The custom exercise database is unmatched. Detailed instructions, alternative plans, and common error checklists kept me completely injury-free as I bulked to 90kg. Premium is gold standard!",
          approved: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setTestimonials(seedStories);
      safeSetItem("fit_testimonials", JSON.stringify(seedStories));
    }
  };

  // --- ACTIONS ---
  const completeOnboarding = async (onboardingData: Partial<UserProfile>) => {
    if (!user) return;
    const userWeight = onboardingData.weight || user.weight || 75;
    let baseGoal = userWeight * 35;
    if (onboardingData.activityLevel?.includes("Very") || onboardingData.activityLevel?.includes("Super")) {
      baseGoal += 500;
    }
    const finalWaterGoal = Math.round(baseGoal);

    const updated: UserProfile = {
      ...user,
      ...onboardingData,
      onboarded: true,
      waterGoal: finalWaterGoal,
      waterIntakeToday: 0,
      waterLastLogged: new Date().toISOString().split("T")[0]
    };
    await syncUserToStorageAndPlatform(updated);
  };

  const updateWaterIntake = async (amountMl: number) => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const isNewDay = user.waterLastLogged !== today;
    
    const currIntake = isNewDay ? 0 : (user.waterIntakeToday || 0);
    const updated: UserProfile = {
      ...user,
      waterIntakeToday: Math.max(0, currIntake + amountMl),
      waterLastLogged: today
    };
    await syncUserToStorageAndPlatform(updated);
  };

  const addCommunityPost = async (content: string, category: "Progress Picture" | "Workout Result" | "Transformation Story" | "Achievement" | "General Discussion" | "Challenge", imageUrl?: string) => {
    if (!user) return;
    const newPost: CommunityPost = {
      id: Math.random().toString(36).substring(7),
      userId: user.uid,
      userDisplayName: user.displayName,
      userEmail: user.email,
      content,
      category,
      imageUrl,
      likes: [],
      comments: [],
      reports: [],
      status: "active",
      createdAt: new Date().toISOString()
    };

    const nextPosts = [newPost, ...communityPosts];
    setCommunityPosts(nextPosts);
    safeSetItem("fit_community_posts", JSON.stringify(nextPosts));

    if (!isMockFirebase) {
      try {
        await setDoc(doc(db, "community_posts", newPost.id), newPost);
      } catch (err) {
        console.warn("Firestore sync failed, relying on local:", err);
      }
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;
    const nextPosts = communityPosts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(user.uid);
        const nextLikes = isLiked
          ? post.likes.filter(id => id !== user.uid)
          : [...post.likes, user.uid];
        const nextPost = { ...post, likes: nextLikes };

        if (!isMockFirebase) {
          updateDoc(doc(db, "community_posts", postId), { likes: nextLikes })
            .catch(err => console.warn(err));
        }
        return nextPost;
      }
      return post;
    });
    setCommunityPosts(nextPosts);
    safeSetItem("fit_community_posts", JSON.stringify(nextPosts));
  };

  const commentOnPost = async (postId: string, commentContent: string) => {
    if (!user) return;
    const nextComment = {
      id: Math.random().toString(36).substring(7),
      userId: user.uid,
      userDisplayName: user.displayName,
      content: commentContent,
      createdAt: new Date().toISOString()
    };

    const nextPosts = communityPosts.map(post => {
      if (post.id === postId) {
        const nextComments = [...post.comments, nextComment];
        const nextPost = { ...post, comments: nextComments };

        if (!isMockFirebase) {
          updateDoc(doc(db, "community_posts", postId), { comments: nextComments })
            .catch(err => console.warn(err));
        }
        return nextPost;
      }
      return post;
    });
    setCommunityPosts(nextPosts);
    safeSetItem("fit_community_posts", JSON.stringify(nextPosts));
  };

  const reportPost = async (postId: string) => {
    if (!user) return;
    const nextPosts = communityPosts.map(post => {
      if (post.id === postId) {
        const reportsList = post.reports || [];
        const nextReports = reportsList.includes(user.uid) ? reportsList : [...reportsList, user.uid];
        const autoMod = nextReports.length >= 3;
        const nextStatus = autoMod ? ("reported" as "active" | "moderated" | "reported") : post.status;
        const nextPost = { ...post, reports: nextReports, status: nextStatus };

        if (!isMockFirebase) {
          updateDoc(doc(db, "community_posts", postId), { reports: nextReports, status: nextStatus })
            .catch(err => console.warn(err));
        }
        return nextPost;
      }
      return post;
    });
    setCommunityPosts(nextPosts);
    safeSetItem("fit_community_posts", JSON.stringify(nextPosts));
  };

  const moderatePost = async (postId: string, action: "approve" | "delete") => {
    if (!user || user.role !== "admin") return;
    let nextPosts: CommunityPost[];
    if (action === "delete") {
      nextPosts = communityPosts.filter(p => p.id !== postId);
      if (!isMockFirebase) {
        deleteDoc(doc(db, "community_posts", postId)).catch(err => console.warn(err));
      }
    } else {
      nextPosts = communityPosts.map(post => {
        if (post.id === postId) {
          const nextPost: CommunityPost = { ...post, status: "active", reports: [] };
          if (!isMockFirebase) {
            updateDoc(doc(db, "community_posts", postId), { status: "active", reports: [] })
              .catch(err => console.warn(err));
          }
          return nextPost;
        }
        return post;
      });
    }
    setCommunityPosts(nextPosts);
    safeSetItem("fit_community_posts", JSON.stringify(nextPosts));
  };

  const submitTestimonial = async (category: "Weight Loss" | "Muscle Building" | "General Journey" | "Transformation Story", rating: number, content: string, beforeImageUrl?: string, afterImageUrl?: string) => {
    if (!user) return;
    const newTestimonial: Testimonial = {
      id: Math.random().toString(36).substring(7),
      userId: user.uid,
      userDisplayName: user.displayName,
      userEmail: user.email,
      category,
      rating,
      content,
      beforeImageUrl,
      afterImageUrl,
      approved: false,
      createdAt: new Date().toISOString()
    };

    const nextStories = [newTestimonial, ...testimonials];
    setTestimonials(nextStories);
    safeSetItem("fit_testimonials", JSON.stringify(nextStories));

    if (!isMockFirebase) {
      try {
        await setDoc(doc(db, "testimonials", newTestimonial.id), newTestimonial);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const approveTestimonial = async (testimonialId: string) => {
    if (!user || user.role !== "admin") return;
    const nextStories = testimonials.map(t => {
      if (t.id === testimonialId) {
        const nextT = { ...t, approved: true };
        if (!isMockFirebase) {
          updateDoc(doc(db, "testimonials", testimonialId), { approved: true })
            .catch(err => console.warn(err));
        }
        return nextT;
      }
      return t;
    });
    setTestimonials(nextStories);
    safeSetItem("fit_testimonials", JSON.stringify(nextStories));
  };

  const deleteTestimonial = async (testimonialId: string) => {
    if (!user || user.role !== "admin") return;
    const nextStories = testimonials.filter(t => t.id !== testimonialId);
    setTestimonials(nextStories);
    safeSetItem("fit_testimonials", JSON.stringify(nextStories));
    if (!isMockFirebase) {
      deleteDoc(doc(db, "testimonials", testimonialId)).catch(err => console.warn(err));
    }
  };

  const saveCustomProgram = async (programData: Omit<CustomProgram, "userId" | "id" | "createdAt">) => {
    if (!user) throw new Error("Please sign in to build a custom program.");
    if (user.subscriptionStatus !== "premium") {
      throw new Error("Custom Workout Program Builder is exclusive to Premium Elite Athletes. Please upgrade your tier.");
    }

    const newProgram: CustomProgram = {
      ...programData,
      id: "cust_prog_" + Math.random().toString(36).substring(7),
      userId: user.uid,
      createdAt: new Date().toISOString()
    };

    const nextPrograms = [newProgram, ...customPrograms];
    setCustomPrograms(nextPrograms);
    safeSetItem(`fit_custom_programs_${user.uid}`, JSON.stringify(nextPrograms));

    if (!isMockFirebase) {
      try {
        await setDoc(doc(db, "custom_programs", newProgram.id), newProgram);
      } catch (err) {
        console.warn("Firestore error saving custom program, relying on local cache:", err);
      }
    }
  };

  const deleteCustomProgram = async (id: string) => {
    if (!user) return;
    const nextPrograms = customPrograms.filter(p => p.id !== id);
    setCustomPrograms(nextPrograms);
    safeSetItem(`fit_custom_programs_${user.uid}`, JSON.stringify(nextPrograms));

    if (!isMockFirebase) {
      try {
        await deleteDoc(doc(db, "custom_programs", id));
      } catch (err) {
        console.warn("Firestore error deleting custom program:", err);
      }
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      theme,
      setTheme: setThemeAction,
      savedWorkouts,
      activityLogs,
      weightLogs,
      transactions,
      chatMessages,
      exercises,
      
      communityPosts,
      testimonials,
      
      loginWithGoogle,
      loginWithApple,
      signUpEmail,
      loginEmail,
      sendPasswordReset,
      logout,
      
      updateProfileDetails,
      completeOnboarding,
      toggleSaveWorkout,
      logWorkoutCompletion,
      addWeightLogAction,
      updateWaterIntake,
      
      upgradeWithPaystack,
      cancelSubscription,
      
      sendCoachMessage,
      clearCoachChat,
      
      addCommunityPost,
      likePost,
      commentOnPost,
      reportPost,
      moderatePost,
      submitTestimonial,
      approveTestimonial,
      deleteTestimonial,

      customPrograms,
      saveCustomProgram,
      deleteCustomProgram,
      
      adminTogglePremium,
      adminUpdateUserTier,
      allSystemUsers,
      uploadExerciseMedia
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be inside AppProvider");
  return context;
}
