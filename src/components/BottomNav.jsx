import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Home,
  CalendarDays,
  ListTodo,
  Timer,
  Trophy,
  Settings,
  MoreHorizontal,
  Target,
  X,
} from "lucide-react";

export default function BottomNav() {
  const location = useLocation();

  const [guideStep, setGuideStep] = useState(
    localStorage.getItem("guideStep") || "",
  );

  const [firstTimeUser, setFirstTimeUser] = useState(
    localStorage.getItem("firstTimeUser") || "false",
  );

  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    const validSteps = ["tasks", "planner", "timer", "reflection", "dashboard"];
    const step = localStorage.getItem("guideStep");

    if (!validSteps.includes(step)) {
      localStorage.setItem("guideStep", "dashboard");
    }
  }, []);

  // ✅ LIVE UPDATE guideStep + firstTimeUser
  useEffect(() => {
    const interval = setInterval(() => {
      setGuideStep(localStorage.getItem("guideStep") || "");
      setFirstTimeUser(localStorage.getItem("firstTimeUser") || "false");
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Close sheet when route changes
  useEffect(() => {
    setShowSheet(false);
  }, [location.pathname]);

  const navItems = [
    { path: "/dashboard", label: "Home", icon: <Home size={22} /> },
    { path: "/planner", label: "Plan", icon: <CalendarDays size={22} /> },
    { path: "/tasks", label: "Tasks", icon: <ListTodo size={22} /> },
    { path: "/timer", label: "Timer", icon: <Timer size={22} /> },
  ];

  const moreItems = [
    { path: "/rewards", label: "Rewards", icon: <Trophy size={22} /> },
    {
      path: "/achievements",
      label: "Achievements",
      icon: <Trophy size={22} />,
    },
    { path: "/quests", label: "Quests", icon: <Target size={22} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={22} /> },
  ];

  return (
    <>
      {/* DARK BACKDROP */}
      {showSheet && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setShowSheet(false)}
        />
      )}

      {/* SLIDING SHEET */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-2xl z-50 transform transition-transform duration-300 border border-white/40 ${
          showSheet ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ minHeight: "250px" }}
      >
        {/* SHEET HEADER */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/30">
          <h2 className="text-lg font-bold text-gray-800">More</h2>
          <button
            onClick={() => setShowSheet(false)}
            className="p-2 rounded-full hover:bg-white/60"
          >
            <X size={22} />
          </button>
        </div>

        {/* SHEET MENU ITEMS */}
        <div className="p-4 grid grid-cols-2 gap-4">
          {moreItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border font-semibold text-sm shadow-sm ${
                  active
                    ? "bg-purple-200/70 border-purple-300 text-purple-800"
                    : "bg-white/60 border-white/40 text-gray-700"
                } hover:bg-white/70`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* MAIN BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-lg border-t border-white/40 shadow-lg flex justify-around items-center py-2 z-30">
        {navItems.map((item) => {
          const active = location.pathname === item.path;

          const bounceClass =
            firstTimeUser === "true"
              ? guideStep === "tasks" && item.path === "/tasks"
                ? "animate-bounce text-purple-700"
                : guideStep === "planner" && item.path === "/planner"
                  ? "animate-bounce text-blue-700"
                  : guideStep === "timer" && item.path === "/timer"
                    ? "animate-bounce text-green-700"
                    : guideStep === "dashboard" && item.path === "/dashboard"
                      ? "animate-bounce text-purple-700"
                      : ""
              : "";

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center text-xs font-semibold ${
                active ? "text-purple-700" : "text-gray-500"
              } ${bounceClass}`}
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}

        {/* MORE BUTTON */}
        <button
          onClick={() => setShowSheet(true)}
          className="flex flex-col items-center text-xs font-semibold text-gray-500"
        >
          <MoreHorizontal size={22} />
          <span className="mt-1">More</span>
        </button>
      </div>
    </>
  );
}
