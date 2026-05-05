import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import BottomNav from "../components/BottomNav";

export default function Timer() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [recordId, setRecordId] = useState(null);

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const [message, setMessage] = useState("");

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Only pending tasks should be selectable
      const pendingTasks = res.data.filter((task) => task.status === "pending");

      setTasks(pendingTasks);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let timer;

    if (running) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running]);

  const startTimer = async () => {
    setMessage("");

    if (!selectedTask) {
      setMessage("⚠️ Please select a task first!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/timer/start",
        { taskId: selectedTask },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setRecordId(res.data.record._id);
      setRunning(true);
      setMessage("✅ Timer started! Stay focused 💪");
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Failed to start timer ❌");
    }
  };

  const stopTimer = async () => {
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/timer/stop",
        { recordId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setRunning(false);
      setSeconds(0);
      setRecordId(null);
      setSelectedTask("");

      // refresh tasks list
      fetchTasks();

      // ✅ GUIDE STEP FIX (ONLY FOR FIRST 2 WALKS)
      const guideCount = parseInt(localStorage.getItem("guideCount") || "0");

      if (guideCount < 2) {
        localStorage.setItem("guideStep", "reflection");
      }

      navigate("/reflection", { state: { recordId: res.data.record._id } });
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Failed to stop timer ❌");
    }
  };

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-transparent p-4 pb-28">
      <h1 className="text-2xl font-bold mb-4">Task Timer ⏳</h1>

      <div className="bg-white/70 backdrop-blur-lg shadow-lg rounded-2xl p-5 max-w-lg space-y-4 border border-white/50">
        {message && (
          <p className="bg-gray-100 p-3 rounded-lg font-semibold text-center text-purple-700">
            {message}
          </p>
        )}

        <div>
          <label className="block font-semibold mb-2">Select Task</label>

          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full border p-3 rounded-lg"
            disabled={running}
          >
            <option value="">-- Choose Task --</option>

            {tasks.length === 0 ? (
              <option disabled>No pending tasks available</option>
            ) : (
              tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title} ({task.subject})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="text-center">
          <p className="text-4xl font-bold">{formatTime()}</p>
          <p className="text-gray-500 mt-1">
            {running ? "Timer running... Stay locked in 🔥" : "Timer stopped"}
          </p>
        </div>

        <div className="flex gap-4">
          {!running ? (
            <button
              onClick={startTimer}
              className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Start
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="w-full bg-red-600 text-white p-3 rounded-lg font-semibold hover:bg-red-700"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
