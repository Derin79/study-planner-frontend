import { useEffect } from "react";

export default function ReminderPopup({ task, minutesLeft, onClose }) {
  useEffect(() => {
    // auto close after 10 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600">⏰ Study Reminder!</h2>

        <p className="mt-3 text-gray-700 font-semibold text-lg">{task.title}</p>

        <p className="text-gray-500 text-sm">{task.subject}</p>

        <p className="mt-4 font-bold text-purple-700 text-lg">
          Starts in {minutesLeft} minutes
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700"
        >
          Okay ✅
        </button>
      </div>
    </div>
  );
}
