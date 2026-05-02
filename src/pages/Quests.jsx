import { useEffect, useState } from "react";
import api from "../api/api";
import BottomNav from "../components/BottomNav";
import QuestRewardPopup from "../components/QuestRewardPopup";

export default function Quests() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  const [loadingQuestId, setLoadingQuestId] = useState(null);

  // ✅ POPUP STATE
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [rewardData, setRewardData] = useState({
    rewardXP: 0,
    rewardPoints: 0,
    level: 1,
  });

  const fetchQuests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/quests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data);
    } catch (error) {
      console.log("FETCH QUEST ERROR:", error.response?.data || error.message);
    }
  };

  const completeQuest = async (questId) => {
    try {
      setMessage("");
      setLoadingQuestId(questId);

      const token = localStorage.getItem("token");

      const res = await api.post(
        "/quests/complete",
        { questId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // ✅ update quests instantly (no refresh needed)
      setData((prev) => ({
        ...prev,
        quests: prev.quests.map((q) =>
          q.questId?._id === questId ? { ...q, completed: true } : q,
        ),
      }));

      // ✅ show popup reward
      setRewardData({
        rewardXP: res.data.rewardXP || 0,
        rewardPoints: res.data.rewardPoints || 0,
        level: res.data.level || 1,
      });

      setShowRewardPopup(true);

      // optional refresh to sync backend
      fetchQuests();
    } catch (error) {
      setMessage(error.response?.data?.message || "Quest completion failed ❌");
    } finally {
      setLoadingQuestId(null);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-bold text-gray-600">Loading quests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Daily Quests 🎯</h1>

      <p className="text-gray-600 mb-5">
        Complete quests today to earn XP and Points!
      </p>

      {message && (
        <p className="mb-4 text-center font-bold text-red-600">{message}</p>
      )}

      <div className="space-y-4">
        {data.quests.map((q, index) => {
          if (!q.questId) {
            return (
              <div
                key={q._id || index}
                className="bg-white shadow rounded-xl p-5 opacity-60"
              >
                <p className="text-red-500 font-bold">
                  ⚠️ This quest is missing
                </p>
              </div>
            );
          }

          return (
            <div
              key={q.questId._id}
              className="bg-white shadow rounded-xl p-5 flex justify-between items-center"
            >
              <div>
                <h2 className="font-bold text-lg">{q.questId.title}</h2>

                <p className="text-sm mt-2 font-semibold text-blue-600">
                  Reward: {q.questId.rewardXP} XP + {q.questId.rewardPoints}{" "}
                  Points
                </p>
              </div>

              {q.completed ? (
                <span className="text-green-600 font-bold">✅ Done</span>
              ) : (
                <button
                  disabled={loadingQuestId === q.questId._id}
                  onClick={() => completeQuest(q.questId._id)}
                  className={`px-4 py-2 rounded-lg font-bold text-white ${
                    loadingQuestId === q.questId._id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {loadingQuestId === q.questId._id
                    ? "Checking..."
                    : "Complete"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />

      {showRewardPopup && (
        <QuestRewardPopup
          rewardXP={rewardData.rewardXP}
          rewardPoints={rewardData.rewardPoints}
          level={rewardData.level}
          onClose={() => setShowRewardPopup(false)}
        />
      )}
    </div>
  );
}
