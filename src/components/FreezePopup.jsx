import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import useSound from "use-sound";
import freezeSound from "../assets/freeze.mp3";

export default function FreezePopup({ onClose }) {
  const [showConfetti, setShowConfetti] = useState(true);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [play] = useSound(freezeSound, { volume: 0.8 });

  useEffect(() => {
    play(); // ✅ play freeze sound once popup appears

    const timer = setTimeout(() => setShowConfetti(false), 4000);

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [play]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      {showConfetti && (
        <Confetti width={dimensions.width} height={dimensions.height} />
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center animate-bounce">
        <h1 className="text-2xl font-bold text-cyan-700">Freeze Used! ❄️</h1>

        <p className="mt-4 text-gray-700 font-semibold text-lg">
          Your streak was protected!
        </p>

        <div className="text-7xl mt-6">🦌❄️🔥</div>

        <p className="text-gray-500 mt-4 font-semibold">
          Even though you missed a day, your streak is safe 💜
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-cyan-600 text-white py-3 rounded-xl font-bold hover:bg-cyan-700"
        >
          Continue 🚀
        </button>
      </div>
    </div>
  );
}
