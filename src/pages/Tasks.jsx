import { useEffect, useState } from "react";
import api from "../api/api";
import BottomNav from "../components/BottomNav";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    deadline: "",
    subject: "",
  });

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ SORT TASKS (Pending Scheduled -> Pending Not Scheduled -> Missed -> Completed)
      const sortedTasks = res.data.sort((a, b) => {
        const statusOrder = {
          pending: 1,
          missed: 2,
          completed: 3,
        };

        // 1) sort by status
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }

        // 2) if both are pending, scheduled ones come first
        if (a.status === "pending" && b.status === "pending") {
          const aScheduled = a.assignedSlots?.length > 0 ? 0 : 1;
          const bScheduled = b.assignedSlots?.length > 0 ? 0 : 1;

          if (aScheduled !== bScheduled) {
            return aScheduled - bScheduled;
          }
        }

        // 3) sort by deadline (earliest first)
        return new Date(a.deadline) - new Date(b.deadline);
      });

      setTasks(sortedTasks);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await api.post("/tasks", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ GUIDE SYSTEM (ONLY 2 TIMES TOTAL)
      const guideCount = parseInt(localStorage.getItem("guideCount") || "0");

      if (guideCount < 2) {
        localStorage.setItem("guideStep", "planner");
      } else {
        localStorage.setItem("guideStep", "");
      }

      setMessage("Task created successfully ✅");
      setFormData({ title: "", duration: "", deadline: "", subject: "" });

      fetchTasks();
    } catch (error) {
      setMessage(error.response?.data?.message || "Task creation failed ❌");
    }
  };

  // ============================
  // ✅ REDO MISSED TASK
  // ============================
  const redoTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.patch(
        `/tasks/redo/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMessage(res.data.message);

      fetchTasks();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to redo task ❌");
    }
  };

  const getStatusColor = (status) => {
    if (status === "pending") return "text-green-600";
    if (status === "missed") return "text-red-600";
    if (status === "completed") return "text-gray-500";
    return "text-blue-600";
  };

  const getCardBorder = (task) => {
    if (task.status === "pending" && task.assignedSlots?.length > 0) {
      return "border-l-4 border-blue-600";
    }

    if (task.status === "pending") return "border-l-4 border-green-500";
    if (task.status === "missed") return "border-l-4 border-red-500";
    if (task.status === "completed") return "border-l-4 border-gray-400";
    return "";
  };

  const getScheduleText = (task) => {
    // completed tasks should not show red ❌
    if (task.status === "completed") {
      return "Completed ✔";
    }

    // missed tasks
    if (task.status === "missed") {
      return task.assignedSlots?.length > 0
        ? task.assignedSlots
            .map((slot) => `${slot.day} ${slot.hour}:00`)
            .join(", ")
        : "Missed (not scheduled)";
    }

    // pending tasks
    if (!task.assignedSlots || task.assignedSlots.length === 0) {
      return "Not scheduled ❌";
    }

    return task.assignedSlots
      .map((slot) => `${slot.day} ${slot.hour}:00`)
      .join(", ");
  };

  return (
    <div className="min-h-screen bg-transparent p-4 pb-28">
      <h1 className="text-2xl font-bold mb-4">Study Tasks</h1>

      {message && (
        <p className="bg-white shadow p-3 rounded mb-4 font-semibold">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white/70 backdrop-blur-lg shadow-lg rounded-2xl p-4 space-y-3 max-w-lg border border-white/50"
      >
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        />

        <input
          type="number"
          name="duration"
          placeholder="Duration (minutes)"
          value={formData.duration}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        />

        <input
          type="datetime-local"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        />

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700">
          Add Task
        </button>
      </form>

      <h2 className="text-xl font-bold mt-8 mb-3">Your Tasks</h2>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-gray-600">No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`bg-white shadow rounded-xl p-4 flex justify-between items-center ${getCardBorder(task)}`}
            >
              <div>
                <h3 className="font-bold">{task.title}</h3>

                <p className="text-gray-600 text-sm">
                  {task.subject} • {task.duration} mins
                </p>

                <p className="text-gray-500 text-xs mt-1">
                  Deadline: {new Date(task.deadline).toLocaleString()}
                </p>

                <p className="text-gray-500 text-xs mt-1">
                  Scheduled Slots: {getScheduleText(task)}
                </p>

                {/* ✅ REDO BUTTON ONLY FOR MISSED TASKS */}
                {task.status === "missed" && (
                  <button
                    onClick={() => redoTask(task._id)}
                    className="mt-2 bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-purple-700"
                  >
                    Redo Task 🔁
                  </button>
                )}
              </div>

              <span
                className={`text-sm font-bold capitalize ${getStatusColor(task.status)}`}
              >
                {task.status}
              </span>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
