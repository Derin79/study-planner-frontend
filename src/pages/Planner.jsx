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

      let count = parseInt(localStorage.getItem("guideCount") || "0");

      if (count < 2) {
        count += 1;
        localStorage.setItem("guideCount", count.toString());
      }

      // guide step logic
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

      const nowMinutes = currentHour * 60 + currentMinute;

      tasks.forEach((task) => {
        task.assignedSlots?.forEach((slot) => {
          if (slot.fullDate !== todayDate) return;

          const startMinutes = slot.hour * 60;
          const diff = startMinutes - nowMinutes;

          // ✅ RANGE-BASED SYSTEM (prevents missed reminders)
          const reminderWindows = [
            { target: 60, range: 2 },
            { target: 30, range: 2 },
            { target: 5, range: 1 },
            { target: 0, range: 1 },
          ];

          reminderWindows.forEach(({ target, range }) => {
            if (diff <= target && diff >= target - range) {
              const reminderKey = `${task._id}-${slot.fullDate}-${slot.hour}-${target}`;

              if (shownReminders.current.has(reminderKey)) return;

              shownReminders.current.add(reminderKey);

              setReminderTask(task);
              setMinutesLeft(target);
              setShowReminder(true);

              // stop previous sound
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }

              const audio = new Audio(reminderSound);
              audioRef.current = audio;

              audio.play().catch(() => console.log("Sound blocked"));

              if (Notification.permission === "granted") {
                new Notification("Study Reminder ⏰", {
                  body:
                    target === 0
                      ? `${task.title} starts NOW!`
                      : `${task.title} starts in ${target} minutes`,
                });
              }
            }
          });
        });
      });
    };

    const interval = setInterval(checkReminder, 30000);

    return () => clearInterval(interval);
  }, [tasks]);

  const bounceClass =
    guideCount < 2 && guideStep === "planner"
      ? "animate-bounce ring-4 ring-purple-300"
      : "";

  const closeReminder = () => {
    setShowReminder(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 pb-28">
      <h1 className="text-2xl font-bold mb-2">Weekly Planner</h1>

      <p className="text-gray-600 mb-4 text-sm">
        Your tasks are automatically placed into your schedule.
      </p>

      <button
        onClick={generateWeeklyPlan}
        className={`w-full bg-purple-600 text-white px-4 py-3 rounded-2xl font-semibold hover:bg-purple-700 mb-5 shadow-lg ${bounceClass}`}
      >
        Generate Weekly Plan 🤖
      </button>

      {/* MOBILE TIMETABLE VIEW */}
      <div className="block md:hidden overflow-x-auto">
        <div className="min-w-[650px] bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 p-2">
          {/* HEADER */}
          <div className="grid grid-cols-8 text-xs font-bold text-center mb-2">
            <div className="text-gray-600">Time</div>
            {days.map((d) => (
              <div key={d.fullDate} className="text-gray-700">
                {d.dayName}
              </div>
            ))}
          </div>

          {/* BODY */}
          {Array.from({ length: 18 }).map((_, index) => {
            const hour = index + 6;

            return (
              <div key={hour} className="grid grid-cols-8 text-[11px]">
                {/* TIME COLUMN */}
                <div className="border p-2 font-semibold bg-gray-100 text-center">
                  {hour}:00
                </div>

                {/* DAYS */}
                {days.map((dayObj) => {
                  const task = getTaskForSlot(dayObj, hour);

                  return (
                    <div
                      key={dayObj.fullDate + hour}
                      className={`border p-2 text-center ${
                        task
                          ? `${getTaskColor(task)} rounded-md`
                          : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      {task ? (
                        <div className="leading-tight">
                          <p className="font-bold text-[10px]">
                            {task.title.length > 10
                              ? task.title.slice(0, 10) + "…"
                              : task.title}
                          </p>
                          <p className="text-[9px] opacity-80">
                            {task.subject}
                          </p>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* LAPTOP VIEW */}
      <div className="hidden md:block overflow-x-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-3 border border-white/50">
        <table className="border-collapse w-full text-[12px] min-w-[900px]">
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
                          <p className="text-[11px] font-bold leading-tight">
                            {task.title}
                          </p>
                          <p className="text-[10px] opacity-90 leading-tight">
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
