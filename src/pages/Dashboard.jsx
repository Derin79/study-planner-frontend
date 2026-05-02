import MotivationPopup from "../components/MotivationPopup";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";
import AvatarBuddy from "../components/AvatarBuddy";
import BottomNav from "../components/BottomNav";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [records, setRecords] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [streakFreeze, setStreakFreeze] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("motivationPopupShown");
    navigate("/login");
  };

  const enableNotifications = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Notifications Enabled ✅", {
        body: "You will now receive study reminders.",
      });
    } else {
      alert("Notifications not allowed");
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const taskRes = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const recordRes = await api.get("/timer/records", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileRes = await api.get("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(taskRes.data);
      setRecords(recordRes.data);

      setXp(profileRes.data.xp || 0);
      setPoints(profileRes.data.points || 0);
      setStreak(profileRes.data.streak || 0);
      setStreakFreeze(profileRes.data.freezeCount || 0);

      const calcLevel = Math.floor((profileRes.data.xp || 0) / 100) + 1;
      setLevel(calcLevel);
    } catch (error) {
      console.log(
        "Dashboard Error:",
        error.response?.data?.message || error.message,
      );
    }
  };

  useEffect(() => {
    fetchData();

    const sessionPopupShown = sessionStorage.getItem("motivationPopupShown");

    if (!sessionPopupShown) {
      setShowPopup(true);
      sessionStorage.setItem("motivationPopupShown", "true");
    }
  }, []);

  const totalStudyTime = records.reduce(
    (sum, rec) => sum + (rec.actualDuration || 0),
    0,
  );

  const completedSessions = records.filter((rec) => rec.completed).length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const missedTasks = tasks.filter((t) => t.status === "missed").length;

  // ✅ Studied today?
  const today = new Date().toDateString();
  const studiedToday = records.some(
    (rec) => new Date(rec.start).toDateString() === today && rec.completed,
  );

  // ============================
  // ✅ SUBJECT BREAKDOWN FIX
  // ============================
  const subjectMap = {};
  records.forEach((rec) => {
    const subject = rec.taskId?.subject || "Unknown";
    subjectMap[subject] =
      (subjectMap[subject] || 0) + (rec.actualDuration || 0);
  });

  // Convert subjectMap to sorted array
  const subjectArray = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]);

  // Take Top 5 subjects
  const topSubjects = subjectArray.slice(0, 5);

  // Remaining subjects become "Others"
  const othersSubjects = subjectArray.slice(5);
  const othersMinutes = othersSubjects.reduce((sum, item) => sum + item[1], 0);

  // Final chart labels + data
  const subjectLabels = topSubjects.map((s) => s[0]);
  const subjectMinutes = topSubjects.map((s) => s[1]);

  if (othersMinutes > 0) {
    subjectLabels.push("Others");
    subjectMinutes.push(othersMinutes);
  }

  // urgent tasks
  const urgentTasks = tasks.filter((t) => {
    if (t.status !== "pending") return false;

    const deadline = new Date(t.deadline);
    const now = new Date();

    const diffHours = (deadline - now) / (1000 * 60 * 60);

    return diffHours <= 24 && diffHours > 0;
  });

  // ============================
  // ✅ TASK COMPLETION BAR
  // ============================
  const barData = {
    labels: ["Completed Sessions", "Pending Tasks", "Missed Tasks"],
    datasets: [
      {
        label: "Tasks",
        data: [completedSessions, pendingTasks, missedTasks],
        backgroundColor: ["#34D399", "#FBBF24", "#F87171"],
      },
    ],
  };

  // ============================
  // ✅ SUBJECT BREAKDOWN BAR
  // ============================
  const colors = [
    "#6366F1",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#6B7280",
  ];

  const subjectBarData = {
    labels: subjectLabels,
    datasets: [
      {
        label: "Minutes Studied",
        data: subjectMinutes,
        backgroundColor: subjectLabels.map(
          (_, index) => colors[index % colors.length],
        ),
      },
    ],
  };

  const subjectBarOptions = {
    indexAxis: "y", // ✅ horizontal bar chart
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      {/* TOP BAR */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {showPopup && (
        <MotivationPopup
          name={user?.name || "Student"}
          streak={streak}
          xp={xp}
          level={level}
          pendingTasks={pendingTasks}
          missedTasks={missedTasks}
          urgentTasks={urgentTasks.length}
          studiedToday={studiedToday}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* XP CARD */}
      <div className="bg-white p-5 rounded-xl shadow mt-6 max-w-md">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-purple-700">Level {level}</h2>
          <p className="text-gray-600 font-semibold">{xp} XP</p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full"
            style={{ width: `${xp % 100}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {100 - (xp % 100)} XP to reach next level 🚀
        </p>
      </div>

      {user && (
        <p className="text-gray-600 mt-4">
          Welcome, <span className="font-semibold">{user.name}</span> 🎉
        </p>
      )}

      <button
        onClick={enableNotifications}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
      >
        Enable Notifications
      </button>

      <div className="bg-white p-5 rounded-xl shadow mt-6 max-w-md">
        <h2 className="font-bold text-lg">Freeze Count</h2>
        <p className="text-3xl font-bold mt-2">{streakFreeze} ❄️</p>
      </div>

      {/* STATS */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-bold text-lg">Total Study Time</h2>
          <p className="text-3xl font-bold mt-2">{totalStudyTime} mins</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-bold text-lg">Reward Points</h2>
          <p className="text-3xl font-bold mt-2">{points}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-bold text-lg">Streak</h2>
          <p className="text-3xl font-bold mt-2">{streak} days</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-bold text-lg">Completed Sessions</h2>
          <p className="text-3xl font-bold mt-2">{completedSessions}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-bold text-lg">Pending Tasks</h2>
          <p className="text-3xl font-bold mt-2">{pendingTasks}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-bold text-lg">Missed Tasks</h2>
          <p className="text-3xl font-bold mt-2">{missedTasks}</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-bold text-lg mb-4">Task Completion</h2>
          <Bar data={barData} />
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-bold text-lg mb-4">
            Subject Breakdown (Top 5 Subjects)
          </h2>
          <Bar data={subjectBarData} options={subjectBarOptions} />
        </div>
      </div>

      {/* AvatarBuddy */}
      <AvatarBuddy
        completed={completedSessions}
        missed={missedTasks}
        streak={streak}
        urgent={urgentTasks.length}
      />

      <BottomNav />
    </div>
  );
}
