import { useEffect, useState } from "react";

export default function MotivationPopup({
  name,
  streak,
  xp,
  level,
  pendingTasks,
  missedTasks,
  urgentTasks,
  studiedToday,
  onClose,
}) {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    let messages = [];

    // 🔥 PRESSURE MODE
    if (!studiedToday && pendingTasks > 0) {
      messages.push(
        "🚨 You haven’t studied today. Start NOW before the day ends.",
      );
      messages.push("⏳ You have pending tasks. Discipline is built TODAY.");
      messages.push(
        "⚠️ Your streak is at risk. Even 20 minutes is better than nothing.",
      );
    }

    // ❄️ MISSED TASK WARNING
    if (missedTasks > 0) {
      messages.push("😤 You missed tasks. That’s dangerous. Fix it today.");
      messages.push(
        "🚨 Missed tasks detected. Do not allow procrastination to win.",
      );
    }

    // ⏰ URGENT TASK WARNING
    if (urgentTasks > 0) {
      messages.push(
        "⏳ Deadline is close. Your urgent tasks must be done TODAY.",
      );
      messages.push("🚨 Urgent tasks detected! Stop delaying and focus now.");
    }

    // 🔥 STREAK BOOST
    if (streak >= 14) {
      messages.push("👑 14+ days streak? You are elite. Keep going!");
      messages.push("🔥 You are becoming unstoppable. Maintain the streak!");
    } else if (streak >= 7) {
      messages.push("🔥 7 days streak! You’re building a serious habit!");
      messages.push("🏆 Keep your streak alive. You’re doing what most can’t.");
    } else if (streak >= 3) {
      messages.push("⚡ 3+ day streak. This is how champions are made.");
      messages.push("🔥 Your streak is growing. Protect it like gold.");
    } else if (streak === 0) {
      messages.push(
        "😤 No streak yet. Start today. A real student doesn’t wait.",
      );
      messages.push("🚀 Start now. One session today changes everything.");
    }

    // 🎯 LEVEL CLOSE CHECK
    const xpToNext = 100 - (xp % 100);

    if (xpToNext <= 15) {
      messages.push("🎯 You are VERY close to leveling up. Don’t stop now!");
      messages.push(`🔥 Only ${xpToNext} XP left to level up. Go get it!`);
    } else if (xpToNext <= 40) {
      messages.push("⚡ You are close to the next level. Push harder today!");
    } else {
      messages.push("⭐ Every session counts. Earn XP today.");
    }

    // If nothing added
    if (messages.length === 0) {
      messages = [
        "😊 Today is a fresh chance to improve yourself.",
        "💪 Start small. Progress is progress.",
        "📌 Study today so tomorrow becomes easier.",
      ];
    }

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setQuote(randomMessage);

    // ✅ AUTO CLOSE AFTER 30 SECONDS
    const timer = setTimeout(() => {
      onClose();
    }, 30000);

    return () => clearTimeout(timer);
  }, [streak, xp, pendingTasks, missedTasks, urgentTasks, studiedToday]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border-2 border-purple-200 animate-[pop_0.4s_ease-in-out]">
        <h2 className="text-xl font-bold text-purple-700">Hey {name}! 🦌✨</h2>

        <p className="text-gray-800 mt-3 font-semibold text-lg">{quote}</p>

        <div className="mt-5 bg-gray-100 p-4 rounded-xl space-y-2">
          <p className="font-semibold text-gray-800">
            🔥 Streak:{" "}
            <span className="text-orange-600 font-bold">{streak} days</span>
          </p>

          <p className="font-semibold text-gray-800">
            🏆 Level: <span className="text-blue-700 font-bold">{level}</span>
          </p>

          <p className="font-semibold text-gray-800">
            ⚡ XP: <span className="text-green-700 font-bold">{xp}</span>
          </p>

          <div className="w-full bg-gray-300 rounded-full h-3 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${xp % 100}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-600 font-semibold mt-2">
            {100 - (xp % 100)} XP left to reach the next level 🚀
          </p>

          <div className="mt-3 text-sm font-semibold text-gray-700 space-y-1">
            <p>📌 Pending Tasks: {pendingTasks}</p>
            <p>⚠️ Missed Tasks: {missedTasks}</p>
            <p>⏳ Urgent Tasks: {urgentTasks}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition"
        >
          Start Studying Now 💪
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          Later 😅
        </button>
      </div>

      <style>
        {`
          @keyframes pop {
            0% { transform: scale(0.7); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
