import sortBy from "lodash/sortBy";

export const getNextTaskId = (tasks) => {
  if (!Array.isArray(tasks)) throw new Error("tasks is not an array");
  return tasks.length
    ? Number(sortBy(tasks, ["id"])[tasks.length - 1].id + 1)
    : 1;
};

export const getStartingDailyTasks = (tasks) =>
  tasks.reduce((acc, curr) => {
    if (curr.permanent) {
      acc.push({
        taskId: curr.id,
        done: 0,
      });
    }
    return acc;
  }, []);

export const getCurrentDayObj = (date, days) => {
  return days.find((d) => d.date === date);
};

export const getTaskFromDay = (task, day) => {
  return day?.dailyTasks.find((t) => t.taskId === task.id);
};

export const formatAsCash = (number) => {
  if (isNaN(number)) return false;
  return number.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const formatAsDate = (date) => {
  return new Date(date).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
