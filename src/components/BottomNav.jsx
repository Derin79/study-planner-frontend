import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Home,
  CalendarDays,
  ListTodo,
  Timer,
  Trophy,
  Settings,
} from "lucide-react";

import { Target } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();

  const [guideStep, setGuideStep] = useState(
    localStorage.getItem("guideStep") || "",
  );

  const [firstTimeUser, setFirstTimeUser] = useState(
    localStorage.getItem("firstTimeUser") || "false",
  );

  useEffect(() => {
    const validSteps = ["tasks", "planner", "timer", "reflection", "dashboard"];

    const step = localStorage.getItem("guideStep");

    if (!validSteps.includes(step)) {
      localStorage.setItem("guideStep", "dashboard");
    }
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Home", icon: <Home size={22} /> },
    { path: "/planner", label: "Plan", icon: <CalendarDays size={22} /> },
    { path: "/tasks", label: "Tasks", icon: <ListTodo size={22} /> },
    { path: "/timer", label: "Timer", icon: <Timer size={22} /> },
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
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg flex justify-around items-center py-2 z-50">
      {navItems.map((item) => {
        const active = location.pathname === item.path;

        // ✅ Bounce ONLY if user is new
        const bounceClass =
          firstTimeUser === "true"
            ? guideStep === "tasks" && item.path === "/tasks"
              ? "animate-bounce text-purple-700"
              : guideStep === "planner" && item.path === "/planner"
                ? "animate-bounce text-blue-700"
                : guideStep === "timer" && item.path === "/timer"
                  ? "animate-bounce text-green-700"
                  : guideStep === "rewards" && item.path === "/rewards"
                    ? "animate-bounce text-yellow-600"
                    : ""
            : "";

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center text-xs font-semibold ${
              active ? "text-purple-600" : "text-gray-500"
            } ${bounceClass}`}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
