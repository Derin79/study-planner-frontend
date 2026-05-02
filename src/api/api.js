import axios from "axios";

const api = axios.create({
  baseURL: "https://study-planner-backend-lp2y.onrender.com/api",
});

export default api;
