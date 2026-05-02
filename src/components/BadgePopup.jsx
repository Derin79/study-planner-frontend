export default function BadgePopup({ badgeName, level, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center">
        <h2 className="text-2xl font-bold text-purple-700">🎉 Level Up!</h2>

        <p className="text-gray-600 mt-2">
          You reached <span className="font-bold">Level {level}</span>
        </p>

        <div className="mt-5 flex justify-center">
          <div className="w-32 h-32 rounded-full bg-yellow-100 flex items-center justify-center shadow-md">
            <span className="text-5xl">🏅</span>
          </div>
        </div>

        <p className="mt-4 text-lg font-bold text-green-700">
          Badge Unlocked: {badgeName}
        </p>

        <p className="text-gray-500 mt-2">
          Your Study Deer is proud of you 🦌💜
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700"
        >
          Continue 🚀
        </button>
      </div>
    </div>
  );
}
