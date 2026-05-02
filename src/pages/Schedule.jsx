import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState("");

  // Create default schedule (all free)
  useEffect(() => {
    const defaultSchedule = [];
    days.forEach((day) => {
      for (let hour = 0; hour < 24; hour++) {
        defaultSchedule.push({ day, hour, status: "free" });
      }
    });
    setSchedule(defaultSchedule);
  }, []);

  // Load schedule from DB
  useEffect(() => {
    const defaultSchedule = [];
    days.forEach((day) => {
      for (let hour = 0; hour < 24; hour++) {
        defaultSchedule.push({ day, hour, status: "free" });
      }
    });
    setSchedule(defaultSchedule);
  }, []);

  const toggleStatus = (day, hour) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day && item.hour === hour
          ? { ...item, status: item.status === "free" ? "busy" : "free" }
          : item,
      ),
    );
  };

  const saveSchedule = async () => {
    try {
      setMessage("");
      const token = localStorage.getItem("token");

      await api.post(
        "/schedule",
        { schedule },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessage("Schedule saved successfully ✅");
    } catch (error) {
      setMessage("Failed to save schedule ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Weekly Schedule</h1>
      <p className="text-gray-600 mb-4">Click blocks to mark as Busy/Free.</p>

      {message && (
        <p className="bg-white p-3 rounded-lg shadow mb-4 font-semibold">
          {message}
        </p>
      )}

      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="border-collapse w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2">Hour</th>
              {days.map((day) => (
                <th key={day} className="border p-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 24 }).map((_, hour) => (
              <tr key={hour}>
                <td className="border p-2 font-semibold">{hour}:00</td>

                {days.map((day) => {
                  const cell = schedule.find(
                    (s) => s.day === day && s.hour === hour,
                  );

                  return (
                    <td
                      key={day}
                      className={`border p-2 cursor-pointer text-center ${
                        cell?.status === "busy"
                          ? "bg-red-400 text-white"
                          : "bg-green-200"
                      }`}
                      onClick={() => toggleStatus(day, hour)}
                    >
                      {cell?.status}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={saveSchedule}
        className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        Save Schedule
      </button>
      <BottomNav />
    </div>
  );
}
