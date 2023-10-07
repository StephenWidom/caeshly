import sortBy from "lodash/sortBy";
import cloneDeep from "lodash/cloneDeep";
import moment from "moment";

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
    if (curr.permanent) {
      curr.subtasks.map((subtaskId) => {
        acc.push({ subtaskId, done: 0 });
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

export const isDateToday = (date) => {
  return new Date(date).toLocaleDateString() === getTodayString();
};

export const getTodayString = () => new Date().toLocaleDateString();

export const getTagFromTask = (tags, tagId) =>
  tags.find((tag) => tag.id === tagId);

export const getSubtask = (subtaskId, subtasks) =>
  subtasks.find((s) => s.id === subtaskId);

export const getNextDayObj = (date) => new Date(moment(date).add(1, "days"));

export const getNextDay = (date) =>
  new Date(moment(date).add(1, "days")).toLocaleDateString();

export const moveTask = (
  targetDate,
  currentDate,
  task,
  tasks,
  days,
  initialDate = currentDate
) => {
  // TODO: add unit test
  // Get date of following day
  const nextDay = getNextDay(currentDate);

  // Clone days array
  let updatedDaysArr = cloneDeep(days);

  // Get index of following day within days array
  const nextDayIndex = days.findIndex((day) => day.date === nextDay);

  if (nextDayIndex !== -1) {
    // The following day DOES exist
    if (targetDate === nextDay) {
      // If we've reached our target date
      // Add task to today's tasks
      const newTasksArr = [
        ...days[nextDayIndex].dailyTasks,
        {
          taskId: task.id,
          done: 0,
          // TODO: maintain done status
        },
      ];
      updatedDaysArr[nextDayIndex].dailyTasks = newTasksArr;

      // Same for subtasks
      const subTasksInQuestion = task.subtasks.map((subtaskId) => ({
        subtaskId,
        done: 0,
      }));

      const newSubtasksArr = [
        ...days[nextDayIndex].dailySubtasks,
        ...subTasksInQuestion,
      ];
      updatedDaysArr[nextDayIndex].dailySubtasks = newSubtasksArr;
    } else {
      // If we're still not at our target date
      // Go again, create more days till we reach our target
      return moveTask(
        targetDate,
        nextDay,
        task,
        tasks,
        updatedDaysArr,
        initialDate
      );
    }
  } else {
    // If the following day DOES NOT exist yet
    if (targetDate === nextDay) {
      // If we've reached our target date
      // Add the task
      const newTasksArr = [...getStartingDailyTasks(tasks)];
      newTasksArr.push({ taskId: task.id, done: 0 });

      // Same for subtasks
      const newSubtasksArr = [...getStartingDailySubtasks(tasks)];
      const subTasksInQuestion = task.subtasks.map((subtaskId) => ({
        subtaskId,
        done: 0,
      }));

      updatedDaysArr = [
        ...days,
        {
          date: nextDay,
          dailyTasks: newTasksArr,
          dailySubtasks: [...newSubtasksArr, ...subTasksInQuestion],
          cash: 0,
        },
      ];
    } else {
      // Go again, create more days
      return moveTask(
        targetDate,
        nextDay,
        task,
        tasks,
        updatedDaysArr,
        initialDate
      );
    }
  }

  // Remove task from initial day
  const todayIndex = days.findIndex((day) => day.date === initialDate);
  if (todayIndex === -1) return console.error("Cant find todayIndex");
  const newTasksArr = days[todayIndex].dailyTasks.filter(
    (t) => t.taskId !== task.id
  );
  const newSubtasksArr = days[todayIndex].dailySubtasks.filter(
    (subtask) => !task.subtasks.includes(subtask.subtaskId)
  );
  let newTempDaysArr = [...updatedDaysArr];
  newTempDaysArr[todayIndex] = {
    ...newTempDaysArr[todayIndex],
    dailyTasks: newTasksArr,
    dailySubtasks: newSubtasksArr,
  };

  return newTempDaysArr;
};
