import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [points, setPoints] = useState(0);

  const fetchBadges = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get("/badges", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setBadges(res.data.badges);
    setPoints(res.data.points);
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Badges</h1>

      <div className="bg-white shadow rounded-xl p-5 mb-6">
        <p className="text-lg font-semibold">Reward Points: {points}</p>
      </div>

      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="text-xl font-bold mb-3">Earned Badges</h2>

        {badges.length === 0 ? (
          <p className="text-gray-600">
            No badges yet. Complete tasks to earn.
          </p>
        ) : (
          <ul className="space-y-3">
            {badges.map((badge, index) => (
              <li
                key={index}
                className="p-3 bg-yellow-200 rounded-lg font-semibold"
              >
                🏆 {badge}
              </li>
            ))}
          </ul>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
