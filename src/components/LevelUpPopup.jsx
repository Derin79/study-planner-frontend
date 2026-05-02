import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import useSound from "use-sound";
import successSound from "../assets/success.mp3";

export default function LevelUpPopup({ level, onClose }) {
  const [showConfetti, setShowConfetti] = useState(true);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [play, { stop }] = useSound(successSound, { volume: 0.8 });

  useEffect(() => {
    play();

    const timer = setTimeout(() => setShowConfetti(false), 5000);

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      stop(); // ✅ stops the sound when popup unmounts
      window.removeEventListener("resize", handleResize);
    };
  }, [play, stop]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          numberOfPieces={250}
          gravity={0.3}
        />
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center animate-[fadeIn_0.4s_ease-in-out]">
        <h1 className="text-3xl font-bold text-purple-700">LEVEL UP! 🎉</h1>

        <p className="mt-3 text-gray-700 font-semibold text-lg">
          You reached Level {level}!
        </p>

        <div className="text-7xl mt-6 animate-[pop_0.6s_ease-in-out]">🦌🏅</div>

        <p className="text-gray-500 mt-4 font-semibold">
          Your deer buddy is proud of you 💜
        </p>

        <button
          onClick={() => {
            stop(); // ✅ stop immediately when user clicks continue
            onClose();
          }}
          className="mt-6 w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700"
        >
          Continue 🚀
        </button>
      </div>
    </div>
  );
}
