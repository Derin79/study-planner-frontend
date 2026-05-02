import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Onboarding() {
  const navigate = useNavigate();

  const [busyDays, setBusyDays] = useState([]);
  const [preferredStudyTime, setPreferredStudyTime] = useState("evening");
  const [dailyGoalHours, setDailyGoalHours] = useState(2);
  const [maxSessionMinutes, setMaxSessionMinutes] = useState(60);

  const [message, setMessage] = useState("");

  const toggleBusyDay = (day) => {
    if (busyDays.includes(day)) {
      setBusyDays(busyDays.filter((d) => d !== day));
    } else {
      setBusyDays([...busyDays, day]);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/preferences",
        {
          busyDays,
          preferredStudyTime,
          dailyGoalHours,
          maxSessionMinutes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMessage("Preferences saved successfully ✅");

      // ✅ Now guide should start from tasks
      // localStorage.setItem("firstTimeUser", "true");
      // localStorage.setItem("guideStep", "tasks");

      localStorage.setItem("firstTimeUser", "false");
      localStorage.setItem("guideStep", "done");

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Error saving preferences");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome 🎉</h1>
        <p className="text-gray-600 text-center mb-6">
          Let’s personalize your study planner (One-time setup)
        </p>

        <div className="mb-5">
          <h2 className="font-semibold mb-2">Select your busy days:</h2>

          <div className="grid grid-cols-4 gap-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => toggleBusyDay(day)}
                className={`p-2 rounded-lg font-semibold ${
                  busyDays.includes(day)
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <h2 className="font-semibold mb-2">Preferred study period:</h2>
          <select
            value={preferredStudyTime}
            onChange={(e) => setPreferredStudyTime(e.target.value)}
            className="w-full border p-3 rounded-lg"
          >
            <option value="morning">Morning 🌅</option>
            <option value="afternoon">Afternoon ☀️</option>
            <option value="evening">Evening 🌙</option>
            <option value="night">Night 🌌</option>
          </select>
        </div>

        <div className="mb-5">
          <h2 className="font-semibold mb-2">Daily study goal (hours):</h2>
          <input
            type="number"
            min="1"
            max="10"
            value={dailyGoalHours}
            onChange={(e) => setDailyGoalHours(Number(e.target.value))}
            className="w-full border p-3 rounded-lg"
          />
        </div>

        <div className="mb-5">
          <h2 className="font-semibold mb-2">
            Max study session length (minutes):
          </h2>
          <select
            value={maxSessionMinutes}
            onChange={(e) => setMaxSessionMinutes(Number(e.target.value))}
            className="w-full border p-3 rounded-lg"
          >
            <option value={30}>30 mins</option>
            <option value={45}>45 mins</option>
            <option value={60}>60 mins</option>
            <option value={90}>90 mins</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
        >
          Save & Continue 🚀
        </button>

        {message && (
          <p className="text-center text-blue-600 font-semibold mt-4">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
