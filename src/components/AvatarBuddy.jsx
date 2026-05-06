import { useEffect, useState } from "react";
import happyDeer from "../assets/deer/happy.mp4";
import sadDeer from "../assets/deer/sad.mp4";

export default function AvatarBuddy({ completed, missed, streak, urgent }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [mood, setMood] = useState("happy");

  useEffect(() => {
    // ✅ Wait until motivation popup has already shown
    const popupShown = sessionStorage.getItem("motivationPopupShown");
    if (!popupShown) return;

    let msg = "";

    if (missed > 0) {
      msg =
        "🚨 You missed tasks. Fix them today or your streak and progress will collapse.";
    } else if (urgent > 0) {
      msg =
        "⏳ Urgent deadline! Don’t play with time. Start your most urgent task NOW.";
    } else if (streak >= 14) {
      msg = "👑 14+ streak! That’s elite. Keep proving you’re serious.";
    } else if (streak >= 7) {
      msg = "🔥 7-day streak! Keep going. Don’t let laziness steal this.";
    } else if (streak >= 3) {
      msg = "⚡ Streak growing! Stay disciplined. One lazy day can destroy it.";
    } else if (completed > 0) {
      msg =
        "🎉 Nice! You studied today. Keep going and complete another session.";
    } else {
      msg =
        "📌 You haven’t studied today. Even 15 minutes now is better than regret tonight.";
    }

    let mood = "happy";

    if (missed > 0 || urgent > 0) {
      mood = "sad";
    }

    setMessage(msg);
    setMood(mood);

    if (missed > 0) mood = "sad";
    else if (urgent > 0) mood = "sad";

    const today = new Date().toISOString().split("T")[0];
    const lastShownDate = localStorage.getItem("buddyShownDate");

    if (lastShownDate === today) return;

    setVisible(true);
    localStorage.setItem("buddyShownDate", today);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, [completed, missed, streak, urgent]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 right-5 z-40 w-80 max-w-[90%]">
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/40 p-4 flex gap-4 relative animate-slideIn">
        <video
          src={mood === "sad" ? sadDeer : happyDeer}
          autoPlay
          loop
          muted
          playsInline
          className="w-16 h-16 object-contain rounded-lg"
        />

        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm">Study Buddy</p>
          <p className="text-sm text-gray-600 mt-1 leading-snug">{message}</p>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-3 text-gray-400 hover:text-red-500 font-bold"
        >
          ✕
        </button>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0px); }
          }

          .animate-slideIn {
            animation: slideIn 0.4s ease-out;
          }
        `}
      </style>
    </div>
  );
}
