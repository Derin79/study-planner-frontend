import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import LevelUpPopup from "../components/LevelUpPopup";
import BadgeUnlockPopup from "../components/BadgeUnlockPopup";
import FreezePopup from "../components/FreezePopup";
import PunishmentPopup from "../components/PunishmentPopup";

export default function Reflection() {
  const location = useLocation();
  const navigate = useNavigate();

  const recordId = location.state?.recordId;

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);

  const [newBadge, setNewBadge] = useState(null);
  const [showFreezePopup, setShowFreezePopup] = useState(false);

  const [punishmentMessage, setPunishmentMessage] = useState(null);

  const [completed, setCompleted] = useState(true);
  const [reflection, setReflection] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [message, setMessage] = useState("");
  const [earnedXP, setEarnedXP] = useState(0);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/timer/reflection",
        {
          recordId,
          completed,
          reflection,
          difficulty,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMessage(res.data.punishmentMessage || "Reflection saved ✅");
      setEarnedXP(res.data.earnedXP || 0);

      // store popup data first
      const freezeUsed = res.data.freezeUsed;
      const punishment = res.data.punishmentMessage;
      const badge = res.data.newBadge;
      const level = res.data.level;

      // stop onboarding bounce
      localStorage.setItem("guideStep", "done");
      localStorage.setItem("firstTimeUser", "false");

      // ============================
      // ✅ POPUP PRIORITY ORDER
      // Freeze → Punishment → Badge → LevelUp
      // ============================

      if (freezeUsed) {
        setShowFreezePopup(true);
        return;
      }

      if (punishment) {
        setPunishmentMessage(punishment);
        return;
      }

      if (badge) {
        setNewBadge(badge);
        return;
      }

      if (level !== null) {
        setNewLevel(level);
        setShowLevelUp(true);
        return;
      }

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      console.log(error);
      setMessage(
        error.response?.data?.message || "Error submitting reflection",
      );
    }
  };

  if (!recordId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-bold">No record found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 pb-28">
      <h1 className="text-2xl font-bold mb-4">Reflection ✍️</h1>

      <div className="bg-white/70 backdrop-blur-lg shadow-lg rounded-2xl border border-white/40 p-5">
        <div>
          <label className="font-semibold">Did you complete the task?</label>
          <select
            value={completed ? "yes" : "no"}
            onChange={(e) => setCompleted(e.target.value === "yes")}
            className="w-full mt-2 border p-2 rounded-lg"
          >
            <option value="yes">Yes ✅</option>
            <option value="no">No ❌</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">How difficult was it?</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full mt-2 border p-2 rounded-lg"
          >
            <option value="easy">Easy 😌</option>
            <option value="medium">Medium 🙂</option>
            <option value="hard">Hard 😤</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">What did you learn today?</label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write something small..."
            className="w-full mt-2 border p-2 rounded-lg"
            rows="4"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
        >
          Submit Reflection 🚀
        </button>

        {message && (
          <p className="text-center font-semibold text-blue-600">{message}</p>
        )}
      </div>

      {/* ============================
          ✅ POPUPS ORDER (IMPORTANT)
          Freeze → Punishment → Badge → LevelUp
         ============================ */}

      {showFreezePopup && (
        <FreezePopup
          onClose={() => {
            setShowFreezePopup(false);
            navigate("/dashboard");
          }}
        />
      )}

      {punishmentMessage && (
        <PunishmentPopup
          message={punishmentMessage}
          onClose={() => {
            setPunishmentMessage(null);
            navigate("/dashboard");
          }}
        />
      )}

      {newBadge && (
        <BadgeUnlockPopup
          badgeName={newBadge}
          xpEarned={earnedXP}
          onClose={() => {
            setNewBadge(null);
            navigate("/dashboard");
          }}
        />
      )}

      {showLevelUp && (
        <LevelUpPopup
          level={newLevel}
          onClose={() => {
            setShowLevelUp(false);
            navigate("/dashboard");
          }}
        />
      )}
    </div>
  );
}
