import { useEffect, useState } from "react";
import api from "../api/api";
import BottomNav from "../components/BottomNav";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function WeeklyProgress() {
  const [weeklyData, setWeeklyData] = useState([]);

  const fetchWeeklyData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/timer/weekly-progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeklyData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const labels = weeklyData.map((d) => d.day); // ['Mon', 'Tue', ...]
  const studyTimes = weeklyData.map((d) => d.totalStudyMinutes);
  const completedTasks = weeklyData.map((d) => d.completedTasks);

  const barData = {
    labels,
    datasets: [
      {
        label: "Study Time (minutes)",
        data: studyTimes,
        backgroundColor: "#6366F1",
      },
      {
        label: "Completed Tasks",
        data: completedTasks,
        backgroundColor: "#10B981",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Weekly Progress 📊</h1>

      <div className="bg-white p-5 rounded-xl shadow">
        <Bar data={barData} />
      </div>

      <BottomNav />
    </div>
  );
}
