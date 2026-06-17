import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Mail, Lock, User, Sparkles, MessageSquare, AlertCircle, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginEmail, signUpEmail, loginWithGoogle, loginWithApple, sendPasswordReset } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      if (isForgot) {
        await sendPasswordReset(email);
        setMessage("A password recovery link has been pushed to your email.");
      } else if (isSignUp) {
        if (!name.trim()) {
          throw new Error("Please specify your athlete name.");
        }
        await signUpEmail(email, password, name);
        onClose();
      } else {
        await loginEmail(email, password);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "An authentication error occurred. Please verify your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setError("");
    setSubmitting(true);
    try {
      if (provider === "google") {
        await loginWithGoogle();
      } else {
        await loginWithApple();
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "OAuth exception occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFastSignIn = async (role: "admin" | "demo") => {
    setError("");
    setMessage("");
    setSubmitting(true);
    const targetEmail = role === "admin" ? "alexfitnesshub@gmail.com" : "demo@user.com";
    const defaultPassword = "Password123!";
    const defaultName = role === "admin" ? "Admin Alex" : "Active Athlete";

    try {
      await loginEmail(targetEmail, defaultPassword);
      onClose();
    } catch (err: any) {
      try {
        await signUpEmail(targetEmail, defaultPassword, defaultName);
        onClose();
      } catch (signUpErr: any) {
        setError(signUpErr?.message || err?.message || "Fast Sign-In custom exception.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        
        {/* Aesthetic design strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-emerald-500 to-emerald-400" />
        
        <div className="px-6 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold font-sans text-slate-900 dark:text-white">
                {isForgot ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isForgot 
                  ? "Enter your email to receive recovery parameters" 
                  : isSignUp ? "Build your personal AlexFitnessHub profile" : "Gain instant workout ecosystem credentials"}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Account Alert Helper */}
          {!isSignUp && !isForgot && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-400 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Administrator Access:</span> Log in with email <code className="bg-emerald-500/20 px-1 py-0.5 rounded font-mono font-bold">alexfitnesshub@gmail.com</code> to access the live administrative console, audit student rosters, and configure exercise metadata.
              </div>
            </div>
          )}

          {/* Fast Demo Sign In Section */}
          {!isForgot && (
            <div id="fast-signin-section" className="mb-5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-center">
              <p className="text-[10px] font-mono tracking-wider font-bold mb-2.5 text-[#1E3A8A] dark:text-emerald-400 uppercase flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                ⚡ Fast Credentials Sign-In
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="fast-signin-admin-btn"
                  onClick={() => handleFastSignIn("admin")}
                  disabled={submitting}
                  className="py-2 px-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition duration-150 flex flex-col items-center justify-center text-center shadow-sm select-none"
                >
                  <span className="opacity-90 text-[8px] uppercase tracking-wide font-mono mb-0.5">Admin Account</span>
                  <span>Alex Console</span>
                </button>
                <button
                  type="button"
                  id="fast-signin-athlete-btn"
                  onClick={() => handleFastSignIn("demo")}
                  disabled={submitting}
                  className="py-2 px-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition duration-150 flex flex-col items-center justify-center text-center shadow-sm select-none"
                >
                  <span className="opacity-90 text-[8px] uppercase tracking-wide font-mono mb-0.5">Premium Tier</span>
                  <span>Active Athlete</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
              {message}
            </div>
          )}

          {/* Primary Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && !isForgot && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">YOUR ATHLETE NAME</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono uppercase">EMAIL ADDRESS</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500"
                />
              </div>
            </div>

            {!isForgot && (
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase">PASSWORD</label>
                  <button
                    type="button"
                    onClick={() => { setIsForgot(true); setError(""); setMessage(""); }}
                    className="text-xs text-blue-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white uppercase tracking-wider bg-[#1E3A8A] hover:bg-[#1E40AF] transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? "Processing..." : isForgot ? "Recover Account" : isSignUp ? "Build My Profile" : "Accredited Sign In"}
            </button>
          </form>

          {/* Social Single Sign On Options */}
          {!isForgot && (
            <div className="mt-6">
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute w-full border-t border-slate-200 dark:border-slate-800" />
                <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] text-slate-400 font-mono tracking-wider uppercase">OR ACCELERATE WITH</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleOAuth("google")}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  Connect with Google
                </button>
              </div>
            </div>
          )}

          {/* Bottom toggle controls */}
          <div className="mt-8 text-center">
            {isForgot ? (
              <button
                type="button"
                onClick={() => { setIsForgot(false); setError(""); }}
                className="text-xs text-blue-600 dark:text-emerald-400 hover:underline"
              >
                Back to Sign In
              </button>
            ) : (
              <p className="text-xs text-slate-500">
                {isSignUp ? "Already have a profile?" : "New to AlexFitnessHub?"}{" "}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                  className="font-semibold text-blue-600 dark:text-emerald-400 hover:underline"
                >
                  {isSignUp ? "Sign In Instead" : "Create Account Now"}
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
