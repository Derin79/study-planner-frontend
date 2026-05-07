import { Link } from "react-router-dom";
import deer2 from "../assets/deer2.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
        <h1 className="text-3xl font-bold mb-3">Deer Planner 📚</h1>
        <p className="text-gray-600 mb-6 flex items-center justify-center gap-2 flex-wrap">
          Plan your studies, track your time, earn rewards and stay motivated
          with your deer buddy
          <img
            src={deer2}
            alt="Deer"
            className="w-6 h-6 object-contain inline-block"
          />
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
