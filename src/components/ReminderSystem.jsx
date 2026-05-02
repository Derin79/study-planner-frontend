import { useEffect } from "react";
import api from "../api/api";

const dayMap = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getNextDateForDay(day, hour) {
  const now = new Date();
  const targetDay = dayMap[day];

  const result = new Date(now);
  result.setHours(hour, 0, 0, 0);

  const diff = (targetDay - now.getDay() + 7) % 7;
  result.setDate(now.getDate() + diff);

  // if time already passed today, move to next week
  if (result < now) {
    result.setDate(result.getDate() + 7);
  }

  return result;
}

import { useEffect } from "react";

export default function ReminderSystem() {
  useEffect(() => {
    const requestPermission = async () => {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          new Notification("Test Notification", {
            body: "It works!",
          });
        }
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    let interval;

    const checkReminders = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get("/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tasks = res.data;

        const now = new Date();

        tasks.forEach((task) => {
          if (!task.assignedSlots || task.assignedSlots.length === 0) return;
          if (task.status !== "pending") return;

          task.assignedSlots.forEach((slot) => {
            const taskTime = getNextDateForDay(slot.day, slot.hour);

            const diffMinutes = Math.floor((taskTime - now) / 60000);

            // notify 5 minutes before
            if (diffMinutes === 5) {
              if (Notification.permission === "granted") {
                new Notification("Study Reminder 📚", {
                  body: `Your task "${task.title}" starts in 5 minutes.`,
                });
              }
            }
          });
        });
      } catch (error) {
        console.log("Reminder Error:", error);
      }
    };

    interval = setInterval(checkReminders, 60000); // check every 1 minute

    return () => clearInterval(interval);
  }, []);

  return null;
}
