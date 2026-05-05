import { useState } from "react";
import BottomNav from "../components/BottomNav";

export default function Settings() {
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const saveSettings = () => {
    setMessage("Settings saved successfully ✅");
  };

  return (
    <div className="min-h-screen bg-transparent p-4 pb-28">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="bg-white/70 backdrop-blur-lg shadow-lg rounded-2xl border border-white/40 p-5">
        <p className="font-semibold mb-3">User Profile</p>

        <p className="text-gray-700 mb-2">
          Name: <span className="font-bold">{user?.name}</span>
        </p>

        <p className="text-gray-700 mb-4">
          Email: <span className="font-bold">{user?.email}</span>
        </p>

        <button
          onClick={saveSettings}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          Save Settings
        </button>

        {message && (
          <p className="mt-4 text-green-600 font-semibold">{message}</p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
