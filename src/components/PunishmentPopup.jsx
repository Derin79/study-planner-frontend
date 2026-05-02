import { useEffect } from "react";

export default function PunishmentPopup({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border-2 border-red-300 animate-[pop_0.4s_ease-in-out]">
        <h2 className="text-xl font-bold text-red-600">⚠️ Discipline Alert</h2>

        <p className="text-gray-800 mt-3 font-semibold">{message}</p>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700"
        >
          I Understand 😤
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
