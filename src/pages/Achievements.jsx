import { useEffect, useState } from "react";
import api from "../api/api";
import BottomNav from "../components/BottomNav";

export default function Achievements() {
  const [userBadges, setUserBadges] = useState([]);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  const badgeCatalog = [
    { name: "50 Points Badge", requirement: "Reach 50 points", icon: "🥉" },
    { name: "100 Points Badge", requirement: "Reach 100 points", icon: "🥈" },
    { name: "200 Points Badge", requirement: "Reach 200 points", icon: "🥇" },
    {
      name: "3 Day Streak Badge",
      requirement: "Maintain 3-day streak",
      icon: "🔥",
    },
    {
      name: "7 Day Streak Badge",
      requirement: "Maintain 7-day streak",
      icon: "⚡",
    },
    { name: "Level 5 Badge", requirement: "Reach Level 5", icon: "🚀" },
    { name: "Level 10 Badge", requirement: "Reach Level 10", icon: "👑" },
  ];

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserBadges(res.data.badges || []);
      setLevel(res.data.level || 1);
      setXp(res.data.xp || 0);
      setPoints(res.data.points || 0);
      setStreak(res.data.streak || 0);
    } catch (error) {
      console.log("Achievements Error:", error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getProgress = (badgeName) => {
    if (badgeName.includes("Points")) {
      const target = parseInt(badgeName);
      return Math.min((points / target) * 100, 100);
    }

    if (badgeName.includes("Streak")) {
      const target = parseInt(badgeName);
      return Math.min((streak / target) * 100, 100);
    }

    if (badgeName.includes("Level")) {
      const target = parseInt(badgeName.split(" ")[1]);
      return Math.min((level / target) * 100, 100);
    }

    return 0;
  };

  return (
    <div className="min-h-screen p-4 pb-28">
      <h1 className="text-2xl font-bold mb-2">Achievements 🏆</h1>
      <p className="text-gray-600 mb-6">
        Level {level} • {xp} XP • {points} Points • {streak} Streak 🔥
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badgeCatalog.map((badge, index) => {
          const unlocked = userBadges.includes(badge.name);
          const progress = getProgress(badge.name);

          return (
            <div
              key={index}
              className={`p-5 rounded-xl shadow border-l-8 ${
                unlocked
                  ? "bg-white border-green-500"
                  : "bg-gray-200 border-gray-400 opacity-70"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{badge.icon}</div>

                <div>
                  <h2 className="font-bold text-lg">{badge.name}</h2>
                  <p className="text-gray-600 text-sm">{badge.requirement}</p>
                </div>
              </div>

              {/* Progress bar */}
              {!unlocked && (
                <div className="mt-4">
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-purple-600 h-3 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-700 mt-2 font-semibold">
                    Progress: {Math.floor(progress)}%
                  </p>
                </div>
              )}

              {unlocked && (
                <p className="mt-3 font-bold text-green-600">Unlocked ✅</p>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
