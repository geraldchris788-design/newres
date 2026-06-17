import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Menu, X, Dumbbell, Sparkles, User, Sun, Moon, LogOut, 
  ShieldCheck, TrendingUp, MessageSquare, Utensils, HelpCircle, Phone, Award, DollarSign
} from "lucide-react";

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  onOpenAuth: () => void;
}

export default function Navbar({ currentView, setView, onOpenAuth }: NavbarProps) {
  const { user, logout, theme, setTheme } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  // Track active section for homepage scrolling
  const [activeHash, setActiveHash] = useState("");

  const isDark = theme === "dark";

  // Scroll listener with requestAnimationFrame to prevent layout thrashing and keep clicking smooth
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 30) {
            setIsScrolled(true);
          } else {
            setIsScrolled(false);
          }

          // Only compute bounding boxes when view is set to home
          if (currentView === "home") {
            const sections = ["pricing", "testimonials-segment", "contact"];
            let currentSection = "";
            for (const s of sections) {
              const el = document.getElementById(s);
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 120 && rect.bottom >= 120) {
                  currentSection = s;
                  break;
                }
              }
            }
            setActiveHash(currentSection);
          } else {
            setActiveHash("");
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentView]);

  const handleNav = (targetView: string, sectionId?: string) => {
    if (sectionId) {
      if (currentView !== "home") {
        setView("home");
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } else {
      if (currentView === targetView) {
        // If already on the view, smoothly scroll up to the top
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setView(targetView);
        // Kept scroll position when switching to other pages - do not force scroll to top
      }
    }
  };

  // Determine if the navigation link should be highlighted as active
  const isLinkActive = (view: string, sectionId?: string) => {
    if (sectionId) {
      return currentView === "home" && activeHash === sectionId;
    }
    return currentView === view && !activeHash;
  };

  // Centralized Navigation Menu definitions for desktop navigation bar and mobile interactive scroll strip
  const menuItems = user ? [
    { id: "home", label: "Home", action: () => handleNav("home"), active: isLinkActive("home") },
    { id: "daily-plan", label: "My Plan", action: () => handleNav("daily-plan"), active: isLinkActive("daily-plan") },
    { id: "library", label: "Workouts", action: () => handleNav("library"), active: isLinkActive("library") },
    { id: "workout-videos", label: "Videos", action: () => handleNav("workout-videos"), active: isLinkActive("workout-videos") },
    { id: "saved-exercises", label: "Saved", action: () => handleNav("saved-exercises"), active: isLinkActive("saved-exercises") },
    { id: "nutrition", label: "Nutrition", action: () => handleNav("nutrition"), active: isLinkActive("nutrition") },
    { id: "community", label: "Community", action: () => handleNav("community"), active: isLinkActive("community") },
    { id: "coach", label: "AI Coach", action: () => handleNav("coach"), active: isLinkActive("coach"), isSpecial: true },
  ] : [
    { id: "home", label: "Home", action: () => handleNav("home"), active: isLinkActive("home") },
    { id: "library", label: "Workouts", action: () => handleNav("library"), active: isLinkActive("library") },
    { id: "workout-videos", label: "Videos", action: () => handleNav("workout-videos"), active: isLinkActive("workout-videos") },
    { id: "pricing", label: "Pricing", action: () => handleNav("home", "pricing"), active: isLinkActive("home", "pricing") },
    { id: "testimonials-segment", label: "Reviews", action: () => handleNav("home", "testimonials-segment"), active: isLinkActive("home", "testimonials-segment") },
    { id: "contact", label: "Contact", action: () => handleNav("home", "contact"), active: isLinkActive("home", "contact") },
  ];

  if (user && user.role === "admin") {
    menuItems.push({
      id: "admin",
      label: "Admin CPU",
      action: () => handleNav("admin"),
      active: isLinkActive("admin"),
      isSpecial: false
    });
  }

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 shadow-sm h-[116px] lg:h-[76px] flex flex-col justify-center transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10">
          
          {/* Main Top Header: Brand Left, Theme and User actions Right */}
          <div className="flex h-16 items-center justify-between">
            
            {/* Brand Logo */}
            <button 
              onClick={() => handleNav("home")}
              className="flex items-center gap-2 font-sans font-extrabold text-xl tracking-tight transition-all active:scale-95 duration-150"
            >
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[#1E3A8A] text-white font-bold text-sm shadow-md">
                A
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white">
                Alex
              </span>
              <span className="font-normal text-blue-600 dark:text-blue-400">FitnessHub</span>
            </button>

            {/* Desktop-only Navigation Links Layout */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 font-sans text-xs">
              {menuItems.map((item) => {
                if (item.isSpecial) {
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="text-[11px] xl:text-xs font-bold uppercase tracking-wider relative py-2 transition-all active:scale-95 duration-150"
                    >
                      <span className={`flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/15 ${item.active ? "text-blue-600 font-extrabold border-blue-500/40" : "text-blue-650 dark:text-blue-400 font-bold"}`}>
                        <Sparkles className="w-3 h-3 text-blue-650 dark:text-blue-405 animate-pulse" />
                        {item.label}
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all relative py-2 ${
                      item.active
                        ? "text-blue-605 dark:text-blue-400 font-extrabold"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                    {item.active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Theme Toggle & Multi-Platform Authenticator Badge Stack */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              
              {/* Theme Switcher */}
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-505 hover:text-[#1E3A8A] dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-905 transition-all duration-150"
                title="Toggle Theme Mode"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-blue-400" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#1E3A8A]" />
                )}
              </button>

              {/* User Identity and Interactive Dropdowns */}
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  
                  {/* Subscription Identity badge (hidden on small mobile to fit snugly) */}
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight block">
                      {user.displayName?.split(" ")[0]}
                    </span>
                    <span className="text-[8px] font-sans tracking-wider uppercase leading-none mt-0.5">
                      {user.subscriptionStatus === "premium" ? (
                        <span className="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-0.5 justify-end">
                          <Sparkles className="w-2.5 h-2.5 text-blue-500" /> PREMIUM
                        </span>
                      ) : (
                        <span className="text-slate-405 dark:text-slate-500 block font-semibold">FREE MEMBER</span>
                      )}
                    </span>
                  </div>

                  {/* Profile Dashboard shortcut */}
                  <button
                    onClick={() => handleNav("dashboard")}
                    className={`flex h-8.5 w-8.5 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition-all duration-150 ${
                      currentView === "dashboard"
                        ? "bg-slate-100 border-slate-300 text-blue-600 dark:bg-blue-950/20 dark:border-blue-500/30 dark:text-blue-450"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100"
                    }`}
                    title="Athlete Profile & Stats Dashboard"
                  >
                    <User className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </button>

                  {/* Safely close session */}
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent transition-all duration-150"
                    title="Log Out Session"
                  >
                    <LogOut className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </button>

                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="text-[10px] sm:text-xs font-bold uppercase tracking-wider h-8.5 px-3.5 sm:h-11 sm:px-5 rounded-xl bg-[#1E3A8A] text-white hover:bg-blue-700 transition-all active:scale-95 duration-150 shadow cursor-pointer"
                >
                  Sign In
                </button>
              )}

            </div>

          </div>

          {/* Row 2: Mobile/Tablet Only Scrolling Ribbon Navigation Section */}
          <div className="flex lg:hidden items-center w-full overflow-x-auto scrollbar-none gap-2 py-2 border-t border-slate-150 dark:border-slate-900/40 flex-nowrap min-w-0">
            {menuItems.map((item) => {
              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      item.active
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-600"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    item.active
                      ? "bg-[#1E3A8A] border-[#1E3A8A] text-white dark:bg-white dark:border-white dark:text-slate-950 font-extrabold"
                      : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-905 dark:border-slate-800 dark:text-slate-350 font-semibold"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

        </div>
      </nav>

      {/* Content offset helper to prevent physical viewport contents overlapping or hiding below the solid navbar */}
      <div className="h-[116px] lg:h-[76px] transition-all bg-transparent" />
    </>
  );
}
