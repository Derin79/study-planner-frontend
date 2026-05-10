import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import BottomNav from "../components/BottomNav";
import ReminderPopup from "../components/ReminderPopup";
import reminderSound from "../assets/reminder.mp3";

export default function Planner() {
  const [tasks, setTasks] = useState([]);

  const [guideStep, setGuideStep] = useState(
    localStorage.getItem("guideStep") || "",
  );

  const [guideCount, setGuideCount] = useState(
    parseInt(localStorage.getItem("guideCount") || "0"),
  );

  const [showReminder, setShowReminder] = useState(false);
  const [reminderTask, setReminderTask] = useState(null);
  const [minutesLeft, setMinutesLeft] = useState(0);

  const shownReminders = useRef(new Set());
  const audioRef = useRef(null);

  // ============================
  // SMART TIME RANGE SYSTEM 🔥
  // ============================
  const timeRanges = {
    morning: [6, 12],
    afternoon: [12, 17],
    evening: [17, 21],
    night: [21, 23],
  };

  const preferredStudyTime =
    localStorage.getItem("preferredStudyTime") || "evening";

  const [startPref, endPref] = timeRanges[preferredStudyTime] || [6, 23];

  const hoursToShow = [];

  for (let h = startPref; h <= endPref; h += 1) {
    hoursToShow.push(h);
  }

  // ============================
  // NEXT 7 DAYS
  // ============================
  const getNext7Days = () => {
    const today = new Date();
    let daysArr = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        d.getDay()
      ];

      const formattedDate = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      daysArr.push({
        dayName,
        fullLabel: `${dayName} (${formattedDate})`,
        fullDate: d.toISOString().split("T")[0],
      });
    }

    return daysArr;
  };

  const days = getNext7Days();

  // ============================
  // FETCH TASKS
  // ============================
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pendingOnly = res.data.filter((t) => t.status === "pending");
      setTasks(pendingOnly);
    } catch (error) {
      console.log("FETCH TASKS ERROR:", error.message);
    }
  };

  useEffect(() => {
    fetchTasks();

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      setGuideStep(localStorage.getItem("guideStep") || "");
      setGuideCount(parseInt(localStorage.getItem("guideCount") || "0"));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // ============================
  // GENERATE PLAN
  // ============================
  const generateWeeklyPlan = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/planner/generate",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert(res.data.message);

      let count = parseInt(localStorage.getItem("guideCount") || "0");

      if (count < 2) {
        count += 1;
        localStorage.setItem("guideCount", count.toString());
      }

      if (count >= 2) {
        localStorage.setItem("guideStep", "dashboard");
        setGuideStep("");
      } else {
        localStorage.setItem("guideStep", "timer");
        setGuideStep("timer");
      }

      setGuideCount(count);
      fetchTasks();
    } catch (error) {
      alert("Failed to generate weekly plan");
    }
  };

  // ============================
  // HELPERS
  // ============================

  const subjectColors = [
    "bg-blue-500 text-white",
    "bg-purple-500 text-white",
    "bg-green-500 text-white",
    "bg-yellow-400 text-black",
    "bg-pink-500 text-white",
    "bg-indigo-500 text-white",
    "bg-teal-500 text-white",
    "bg-orange-500 text-white",
  ];

  function hashSubject(subject) {
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  const getSubjectColor = (subject) => {
    if (!subject) return "bg-gray-200 text-black";
    const index = hashSubject(subject) % subjectColors.length;
    return subjectColors[index];
  };

  const isUrgentTask = (deadline) => {
    const now = new Date();
    const diff = (new Date(deadline) - now) / (1000 * 60 * 60);
    return diff <= 24 && diff > 0;
  };

  const getTaskForSlot = (dayObj, hour) => {
    return tasks.find((task) =>
      task.assignedSlots?.some(
        (slot) => slot.fullDate === dayObj.fullDate && slot.hour === hour,
      ),
    );
  };

  const getTaskColor = (task) => {
    if (!task) return "";
    if (isUrgentTask(task.deadline))
      return `${getSubjectColor(task.subject)} font-semibold`;
    return `${getSubjectColor(task.subject)} font-semibold`;
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // ============================
  // REMINDERS (unchanged)
  // ============================
  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      tasks.forEach((task) => {
        task.assignedSlots?.forEach((slot) => {
          if (slot.fullDate !== today) return;

          const diff = slot.hour * 60 - nowMinutes;

          const times = [
            { t: 60, r: 2 },
            { t: 30, r: 2 },
            { t: 5, r: 1 },
            { t: 0, r: 1 },
          ];

          times.forEach(({ t, r }) => {
            if (diff <= t && diff >= t - r) {
              const key = `${task._id}-${slot.hour}-${t}`;
              if (shownReminders.current.has(key)) return;

              shownReminders.current.add(key);

              setReminderTask(task);
              setMinutesLeft(t);
              setShowReminder(true);

              const audio = new Audio(reminderSound);
              audioRef.current = audio;
              audio.play().catch(() => {});

              if (Notification.permission === "granted") {
                new Notification("Study Reminder ⏰", {
                  body:
                    t === 0
                      ? `${task.title} starts NOW!`
                      : `${task.title} starts in ${t} mins`,
                });
              }
            }
          });
        });
      });
    };

    const interval = setInterval(checkReminder, 10000);
    return () => clearInterval(interval);
  }, [tasks]);

  const closeReminder = () => {
    setShowReminder(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const bounceClass =
    guideCount < 2 && guideStep === "planner"
      ? "animate-bounce ring-4 ring-purple-300"
      : "";

  // ============================
  // UI
  // ============================
  return (
    <div className="min-h-screen p-4 pb-28 bg-gradient-to-br from-purple-50 to-blue-50">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">Weekly Planner</h1>

      <p className="text-gray-600 text-sm mb-4">
        Showing {preferredStudyTime} schedule
      </p>

      <button
        onClick={generateWeeklyPlan}
        className={`w-full bg-purple-600 text-white py-3 rounded-2xl font-semibold shadow-md mb-5 ${bounceClass}`}
      >
        Generate Weekly Plan 🤖
      </button>

      {/* ================= MOBILE VIEW ================= */}
      <div className="md:hidden space-y-5">
        {days.map((dayObj) => (
          <div
            key={dayObj.fullDate}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md p-4 border border-white/50"
          >
            <h2 className="font-bold text-lg mb-3 text-gray-800">
              {dayObj.fullLabel}
            </h2>

            <div className="space-y-3">
              {hoursToShow.map((hour) => {
                const task = getTaskForSlot(dayObj, hour);

                return (
                  <div
                    key={hour}
                    className={`flex justify-between items-center p-4 rounded-xl shadow-sm ${
                      task ? getTaskColor(task) : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <p className="font-bold text-base">{hour}:00</p>

                    {task && (
                      <div>
                        <p className="text-sm font-bold">{task.title}</p>
                        <p className="text-xs opacity-80">{task.subject}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden md:block mt-6 overflow-x-auto">
        <table className="w-full border-separate border-spacing-3">
          <thead>
            <tr className="text-gray-700">
              <th className="p-4 text-sm font-semibold">Hour</th>

              {days.map((d) => (
                <th
                  key={d.fullDate}
                  className="p-4 text-sm font-semibold bg-gray-200 rounded-xl"
                >
                  {d.fullLabel}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {hoursToShow.map((hour) => (
              <tr key={hour} className="text-center">
                {/* TIME */}
                <td className="p-4 font-semibold bg-gray-100 rounded-xl">
                  {hour}:00
                </td>

                {/* DAYS */}
                {days.map((d) => {
                  const task = getTaskForSlot(d, hour);

                  return (
                    <td
                      key={d.fullDate + hour}
                      className={`p-4 rounded-xl shadow-sm transition ${
                        task ? getTaskColor(task) : "bg-white/70 backdrop-blur"
                      }`}
                    >
                      {task && (
                        <div>
                          <p className="text-sm font-bold">{task.title}</p>
                          <p className="text-xs opacity-80">{task.subject}</p>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BottomNav />

      {showReminder && (
        <ReminderPopup
          task={reminderTask}
          minutesLeft={minutesLeft}
          onClose={closeReminder}
        />
      )}
    </div>
  );
}
