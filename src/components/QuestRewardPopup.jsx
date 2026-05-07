import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import useSound from "use-sound";
import successSound from "../assets/success.mp3";

export default function QuestRewardPopup({
  rewardXP,
  rewardPoints,
  level,
  onClose,
}) {
  const [showConfetti, setShowConfetti] = useState(true);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // ✅ FIX: get stop() too
  const [play, { stop }] = useSound(successSound, {
    volume: 0.7,
    interrupt: true, // ✅ important
  });

  useEffect(() => {
    // play sound
    play();

    // stop confetti after 4 seconds
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    audio.pause();
    audio.currentTime = 0;

    // resize confetti
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      stop(); // ✅ stop sound when popup closes/unmounts
      window.removeEventListener("resize", handleResize);
    };
  }, [play, stop]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center animate-[fadeIn_0.4s_ease-in-out]">
        <h1 className="text-2xl font-bold text-purple-700">
          Quest Completed! 🎉
        </h1>

        <p className="mt-3 text-gray-700 font-semibold">
          You earned rewards 🏆
        </p>

        <div className="mt-6 space-y-3">
          <p className="text-lg font-bold text-green-600">+{rewardXP} XP ⚡</p>

          <p className="text-lg font-bold text-blue-600">
            +{rewardPoints} Points ⭐
          </p>

          <p className="text-md font-semibold text-purple-600">
            Level: {level} 🏅
          </p>
        </div>

        <button
          onClick={() => {
            stop(); // ✅ stop immediately on button click
            onClose();
          }}
          className="mt-6 w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700"
        >
          Continue 🚀
        </button>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}
