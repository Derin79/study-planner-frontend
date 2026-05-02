import { useEffect, useState } from "react";
import api from "../api/api";
import BottomNav from "../components/BottomNav";

export default function Rewards() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/rewards", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const buyFreeze = async () => {
    try {
      setMessage("");

      const token = localStorage.getItem("token");

      const res = await api.post(
        "/rewards/buy-freeze",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMessage(res.data.message);

      setData((prev) => ({
        ...prev,
        points: res.data.points,
        freezeCount: res.data.freezeCount,
      }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Error buying freeze");
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-bold text-gray-600">Loading rewards...</p>
      </div>
    );
  }

  const canBuy = data.points >= 50;

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Rewards Shop 🎁</h1>

      <div className="bg-white rounded-xl shadow p-5 space-y-2 mb-6">
        <p>⭐ Points: {data.points}</p>
        <p>🔥 Streak: {data.streak}</p>
        <p>🧠 XP: {data.xp}</p>
        <p>🏆 Level: {data.level}</p>
        <p>❄️ Freeze Count: {data.freezeCount}</p>
      </div>

      {message && (
        <p className="mb-4 text-center font-bold text-purple-700">{message}</p>
      )}

      <div className="bg-white rounded-xl shadow p-6 text-center">
        <h2 className="text-xl font-bold">Streak Freeze ❄️</h2>

        <p className="text-gray-600 mt-2">
          Protect your streak if you miss a day.
        </p>

        <p className="mt-3 font-bold text-purple-700 text-lg">
          Cost: 50 Points
        </p>

        <button
          onClick={buyFreeze}
          disabled={!canBuy}
          className={`mt-5 w-full py-3 rounded-xl font-bold ${
            !canBuy
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          Buy Freeze ❄️
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
