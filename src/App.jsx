import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import api from "./api/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Schedule from "./pages/Schedule";
import Tasks from "./pages/Tasks";
import Planner from "./pages/Planner";
import Timer from "./pages/Timer";
import Badges from "./pages/Badges";
import Rewards from "./pages/Rewards";
import Settings from "./pages/Settings";
import Home from "./pages/Home";
import Quests from "./pages/Quests";
import Reflection from "./pages/Reflection";
import WeeklyProgress from "./pages/WeeklyProgress";
import Onboarding from "./pages/Onboarding";
import Achievements from "./pages/Achievements";

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if ("Notification" in window) {
      Notification.requestPermission();
    }

    const sendNotification = (title, body) => {
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      }
    };

    const checkReminders = async () => {
      try {
        const res = await api.get("/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tasks = res.data;

        const now = new Date();

        tasks.forEach((task) => {
          if (!task.assignedSlots || task.assignedSlots.length === 0) return;
          if (task.status !== "pending") return;

          task.assignedSlots.forEach((slot) => {
            if (!slot.fullDate) return;

            const slotTime = new Date(slot.fullDate);
            slotTime.setHours(slot.hour, 0, 0, 0);
            const diffMinutes = Math.round((slotTime - now) / 60000);

            const notifyKey = `notified_${task._id}_${slot.fullDate}`;

            // already notified
            if (localStorage.getItem(notifyKey)) return;

            // 60 min reminder
            if (diffMinutes <= 60 && diffMinutes >= 59) {
              sendNotification(
                "📚 Study Reminder (1 hour)",
                `Your task "${task.title}" starts in 1 hour.`,
              );
              localStorage.setItem(notifyKey, "true");
            }

            // 30 min reminder
            if (diffMinutes <= 30 && diffMinutes >= 29) {
              sendNotification(
                "⏳ Study Reminder (30 mins)",
                `Your task "${task.title}" starts in 30 minutes.`,
              );
              localStorage.setItem(notifyKey, "true");
            }

            // 5 min reminder
            if (diffMinutes <= 5 && diffMinutes >= 4) {
              sendNotification(
                "🚨 Study Reminder (5 mins)",
                `Your task "${task.title}" starts in 5 minutes. Get ready!`,
              );
              localStorage.setItem(notifyKey, "true");
            }
          });
        });
      } catch (error) {
        console.log("Reminder Error:", error.response?.data || error.message);
      }
    };

    // run every 60 seconds
    const interval = setInterval(() => {
      checkReminders();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/badges"
        element={
          <ProtectedRoute>
            <Badges />
          </ProtectedRoute>
        }
      />

      <Route
        path="/timer"
        element={
          <ProtectedRoute>
            <Timer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quests"
        element={
          <ProtectedRoute>
            <Quests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rewards"
        element={
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        }
      />

      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        }
      />

      <Route
        path="/planner"
        element={
          <ProtectedRoute>
            <Planner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reflection"
        element={
          <ProtectedRoute>
            <Reflection />
          </ProtectedRoute>
        }
      />

      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <Achievements />
          </ProtectedRoute>
        }
      />

      <Route
        path="/weekly-progress"
        element={
          <ProtectedRoute>
            <WeeklyProgress />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
