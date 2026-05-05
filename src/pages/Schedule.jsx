import { useEffect, useState } from "react";
import api from "../api/api";
import BottomNav from "../components/BottomNav";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState("");

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
    <div className="min-h-screen bg-transparent p-4 pb-28">
      <h1 className="text-2xl font-bold mb-2">Weekly Schedule</h1>
      <p className="text-gray-600 mb-4 text-sm">
        Tap blocks to mark as Busy or Free.
      </p>

      {message && (
        <p className="bg-white/70 backdrop-blur-lg p-3 rounded-xl shadow mb-4 font-semibold border border-white/40">
          {message}
        </p>
      )}

      {/* MOBILE VIEW */}
      <div className="block md:hidden space-y-5">
        {days.map((day) => (
          <div
            key={day}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/40"
          >
            <h2 className="font-bold text-lg mb-3">{day}</h2>

            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 24 }).map((_, hour) => {
                const cell = schedule.find(
                  (s) => s.day === day && s.hour === hour,
                );

                const isBusy = cell?.status === "busy";

                return (
                  <button
                    key={hour}
                    onClick={() => toggleStatus(day, hour)}
                    className={`p-2 rounded-xl text-xs font-bold shadow-sm ${
                      isBusy
                        ? "bg-red-500 text-white"
                        : "bg-green-200 text-gray-900"
                    }`}
                  >
                    {hour}:00
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto bg-white/70 backdrop-blur-lg shadow-lg rounded-2xl border border-white/40 p-5">
        <table className="border-collapse w-full text-sm min-w-[800px]">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">Hour</th>
              {days.map((day) => (
                <th key={day} className="border p-2 bg-gray-100">
                  {day}
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
        className="mt-5 w-full bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 shadow-lg"
      >
        Save Schedule
      </button>

      <BottomNav />
    </div>
  );
}
