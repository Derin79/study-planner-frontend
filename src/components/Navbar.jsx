import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="bg-white shadow p-4 flex flex-wrap gap-3 justify-center">
      <Link className="text-blue-600 font-semibold" to="/dashboard">
        Dashboard
      </Link>
      <Link className="text-blue-600 font-semibold" to="/schedule">
        Schedule
      </Link>
      <Link className="text-blue-600 font-semibold" to="/tasks">
        Tasks
      </Link>
      <Link className="text-blue-600 font-semibold" to="/planner">
        Planner
      </Link>
      <Link className="text-blue-600 font-semibold" to="/timer">
        Timer
      </Link>
      <Link className="text-blue-600 font-semibold" to="/badges">
        Badges
      </Link>
      <Link className="text-blue-600 font-semibold" to="/rewards">
        Rewards
      </Link>
      <Link className="text-blue-600 font-semibold" to="/settings">
        Settings
      </Link>

      <button onClick={logout} className="text-red-600 font-semibold">
        Logout
      </button>
    </div>
  );
}
