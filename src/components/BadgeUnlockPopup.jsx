import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import useSound from "use-sound";
import successSound from "../assets/success.mp3";

export default function BadgeUnlockPopup({
  badgeName,
  xpEarned = 20,
  onClose,
}) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [play] = useSound(successSound, { volume: 0.7 });

  useEffect(() => {
    play();

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => setShowConfetti(false), 5000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          numberOfPieces={300}
          gravity={0.3}
        />
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center animate-[fadeIn_0.5s_ease-in-out] relative overflow-hidden">
        <h1 className="text-2xl font-bold text-purple-700">
          Badge Unlocked! 🏆
        </h1>

        <p className="mt-4 text-gray-700 font-semibold text-lg">{badgeName}</p>

        {/* Deer Celebration */}
        <div className="text-7xl mt-6 animate-[pop_0.6s_ease-in-out]">🦌🎉</div>

        <p className="text-gray-500 mt-4 font-semibold">
          Your study deer is celebrating you! Keep going 🚀
        </p>

        {/* XP Floating Text */}
        <div className="absolute top-6 right-6 bg-green-600 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-[floatUp_1.2s_ease-in-out]">
          +{xpEarned} XP
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700"
        >
          Continue
        </button>
      </div>

      {/* Custom Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes pop {
            0% { transform: scale(0.5); }
            70% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }

          @keyframes floatUp {
            0% { opacity: 0; transform: translateY(20px); }
            50% { opacity: 1; transform: translateY(0px); }
            100% { opacity: 0; transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
}
