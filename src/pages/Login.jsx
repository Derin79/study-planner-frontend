import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const prefRes = await api.get("/preferences", {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });

      // ✅ If no onboarding preferences, go onboarding
      if (!prefRes.data || prefRes.data === null) {
        // localStorage.setItem("firstTimeUser", "true");
        // localStorage.setItem("guideStep", "tasks");

        navigate("/onboarding");
        return;
      }

      // ✅ If onboarding exists but not complete
      if (!prefRes.data.preferredStudyTime) {
        localStorage.setItem("firstTimeUser", "true");
        localStorage.setItem("guideStep", "tasks");

        navigate("/onboarding");
        return;
      }

      // ✅ Old user normal mode
      localStorage.setItem("firstTimeUser", "false");
      localStorage.setItem("guideStep", "done");

      navigate("/dashboard");
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data);
      setMessage(
        error.response?.data?.msg ||
          error.response?.data?.message ||
          "Login failed",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          Deer Dawn Planner
        </h1>
        <p className="text-gray-500 text-center mb-6">Login to continue</p>

        {message && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-3 text-center">
            {message}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          />

          <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700">
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <Link className="text-blue-600 font-semibold" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
