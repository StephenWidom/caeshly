import sortBy from "lodash/sortBy";

export const getNextArrId = (arr) => {
  if (!Array.isArray(arr)) throw new Error("Argument provided is not an array");
  return arr.length ? Number(sortBy(arr, ["id"])[arr.length - 1].id + 1) : 1;
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

export const getStartingDailySubtasks = (tasks) =>
  tasks.reduce((acc, curr) => {
    curr.subtasks.map((subtaskId) => {
      acc.push({ subtaskId, done: 0 });
    });
    return acc;
  }, []);

export const getCurrentDayObj = (date, days) => {
  return days.find((d) => d.date === date);
};

export const getTaskFromDay = (task, day) => {
  return day?.dailyTasks.find((t) => t.taskId === task.id);
};

export const formatAsCash = (number, includeSymbol = true) => {
  if (isNaN(number)) return false;
  const moneyString = number.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return includeSymbol ? moneyString : moneyString.slice(1);
};

export const formatAsDate = (date) => {
  return new Date(date).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const doesDateExist = (days, date) => {
  return days.some((d) => d.date === date);
};

export const createDay = (date, tasks) => {
  const nextDay = new Date(moment(date).add(1, "days")).toLocaleDateString();
  if (!days.some((d) => d.date === nextDay)) {
    setDays(
      produce(days, (draft) => {
        draft.push({
          date: nextDay,
          dailyTasks: getStartingDailyTasks(tasks),
          cash: 0,
        });
      })
    );
  }
};

export const isDateToday = (date) => {
  return new Date(date).toLocaleDateString() === getTodayString();
};

export const getTodayString = () => new Date().toLocaleDateString();

export const getTagFromTask = (tags, tagId) =>
  tags.find((tag) => tag.id === tagId);

export const getSubtask = (subtaskId, subtasks) =>
  subtasks.find((s) => s.id === subtaskId);
