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
  // NEXT 7 DAYS HEADER SYSTEM
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

      const pendingOnly = res.data.filter((task) => task.status === "pending");
      setTasks(pendingOnly);
    } catch (error) {
      console.log("FETCH TASKS ERROR:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchTasks();

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

      localStorage.setItem("guideStep", "timer");

      let count = parseInt(localStorage.getItem("guideCount") || "0");

      if (count < 2) {
        count += 1;
        localStorage.setItem("guideCount", count.toString());
      }

      if (count >= 2) {
        localStorage.setItem("guideStep", "");
        setGuideStep("");
      } else {
        setGuideStep("timer");
      }

      setGuideCount(count);

      fetchTasks();
    } catch (error) {
      console.log("PLANNER ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to generate weekly plan");
    }
  };

  // ============================
  // URGENT CHECK
  // ============================
  const isUrgentTask = (deadline) => {
    const now = new Date();
    const d = new Date(deadline);

    const diffHours = (d - now) / (1000 * 60 * 60);

    return diffHours <= 24 && diffHours > 0;
  };

  // ============================
  // SUBJECT COLOR SYSTEM
  // ============================
  const subjectColors = [
    "bg-blue-600 text-white",
    "bg-purple-600 text-white",
    "bg-green-600 text-white",
    "bg-yellow-500 text-black",
    "bg-pink-600 text-white",
    "bg-indigo-600 text-white",
    "bg-teal-600 text-white",
    "bg-orange-600 text-white",
    "bg-cyan-600 text-white",
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

  const getTaskForSlot = (dayObj, hour) => {
    return tasks.find((task) =>
      task.assignedSlots?.some(
        (slot) => slot.fullDate === dayObj.fullDate && slot.hour === hour,
      ),
    );
  };

  const getTaskColor = (task) => {
    if (!task) return "";

    if (isUrgentTask(task.deadline)) {
      return "bg-red-600 text-white font-bold";
    }

    return `${getSubjectColor(task.subject)} font-semibold`;
  };

  // =============================
  // REMINDER SYSTEM
  // =============================
  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const todayDate = now.toISOString().split("T")[0];

      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      tasks.forEach((task) => {
        task.assignedSlots?.forEach((slot) => {
          if (slot.fullDate !== todayDate) return;

          const nowMinutes = currentHour * 60 + currentMinute;
          const startMinutes = slot.hour * 60;

          const diff = startMinutes - nowMinutes;

          const reminderTimes = [60, 30, 5, 0];

          if (reminderTimes.includes(diff)) {
            const reminderKey = `${task._id}-${slot.fullDate}-${slot.hour}-${diff}`;

            if (shownReminders.current.has(reminderKey)) return;

            shownReminders.current.add(reminderKey);

            setReminderTask(task);
            setMinutesLeft(diff);
            setShowReminder(true);

            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }

            const audio = new Audio(reminderSound);
            audioRef.current = audio;

            audio.play().catch(() => console.log("Sound blocked by browser"));

            if (Notification.permission === "granted") {
              new Notification("Study Reminder ⏰", {
                body:
                  diff === 0
                    ? `${task.title} starts NOW!`
                    : `${task.title} starts in ${diff} minutes`,
              });
            }
          }
        });
      });
    };

    const interval = setInterval(checkReminder, 30000);

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

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-28">
      <h1 className="text-2xl font-bold mb-2">Weekly Planner</h1>

      <p className="text-gray-600 mb-4 text-sm">
        Your tasks are automatically placed into your schedule.
      </p>

      <button
        onClick={generateWeeklyPlan}
        className={`w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-purple-700 mb-5 ${bounceClass}`}
      >
        Generate Weekly Plan 🤖
      </button>

      {/* MOBILE VIEW */}
      <div className="block md:hidden space-y-5">
        {days.map((dayObj) => (
          <div
            key={dayObj.fullDate}
            className="bg-white rounded-2xl shadow p-4"
          >
            <h2 className="font-bold text-lg mb-3 text-gray-800">
              {dayObj.fullLabel}
            </h2>

            <div className="space-y-3">
              {Array.from({ length: 24 }).map((_, hour) => {
                const task = getTaskForSlot(dayObj, hour);

                return (
                  <div
                    key={hour}
                    className={`flex justify-between items-center p-3 rounded-xl border ${
                      task ? getTaskColor(task) : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <p className="font-bold text-sm">{hour}:00</p>

                    {task ? (
                      <div className="text-right">
                        <p className="text-sm font-bold">{task.title}</p>
                        <p className="text-xs opacity-90">{task.subject}</p>
                      </div>
                    ) : (
                      <p className="text-xs italic opacity-60">Free</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* LAPTOP VIEW */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="border-collapse w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-200">Hour</th>

              {days.map((dayObj) => (
                <th key={dayObj.fullLabel} className="border p-2 bg-gray-200">
                  {dayObj.fullLabel}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 24 }).map((_, hour) => (
              <tr key={hour}>
                <td className="border p-2 font-semibold bg-gray-50">
                  {hour}:00
                </td>

                {days.map((dayObj) => {
                  const task = getTaskForSlot(dayObj, hour);

                  return (
                    <td
                      key={dayObj.fullLabel + hour}
                      className={`border p-2 text-center ${getTaskColor(task)}`}
                    >
                      {task ? (
                        <div>
                          <p className="text-xs font-bold">{task.title}</p>
                          <p className="text-[10px] opacity-90">
                            {task.subject}
                          </p>
                        </div>
                      ) : (
                        ""
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
