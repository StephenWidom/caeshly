import React, { useContext, useEffect, useMemo } from "react";
import moment from "moment";
import produce from "immer";
import { message, Dropdown } from "antd";
import {
  ArrowRightOutlined,
  CheckOutlined,
  DeleteFilled,
  EditOutlined,
  UndoOutlined,
} from "@ant-design/icons";

import TasksContext from "../contexts/TasksContext";
import DaysContext from "../contexts/DaysContext";
import CashContext from "../contexts/CashContext";
import DateContext from "../contexts/DateContext";

import {
  formatAsCash,
  getCurrentDayObj,
  getStartingDailySubtasks,
  getStartingDailyTasks,
  getTaskFromDay,
} from "../utils";

const TaskActions = ({ task }) => {
  const { tasks, setTasks, setAddModalVisibility, setTask } =
    useContext(TasksContext);
  const [days, setDays] = useContext(DaysContext);
  const [cash, setCash] = useContext(CashContext);
  const [date] = useContext(DateContext);

  const isDateToday = useMemo(
    () => date === new Date().toLocaleDateString(),
    [date]
  );

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "delete":
        return deleteTask();
      case "edit":
        return editTask();
      case "move":
        return moveTask(
          new Date(moment(date).add(1, "days")).toLocaleDateString()
        );
      case "move-today":
        return moveTask();
      case "undo":
        return undoTask();
    }
  };

  const taskFromDay = useMemo(
    () => getTaskFromDay(task, getCurrentDayObj(date, days)),
    [days, date]
  );

  const completeTask = () => {
    // No way to just disable the check button
    // Antd disables the whole task menu when passed 'disabled'
    if (taskFromDay.done && !task.repeatable)
      return message.warning("Task already completed");

    setDays(
      produce(days, (draft) => {
        const todayIndex = days.findIndex((day) => day.date === date);
        if (todayIndex === -1)
          return console.error("Could not find todayIndex");
        const thisTaskIndex = days[todayIndex].dailyTasks.findIndex(
          (t) => t.taskId === task.id
        );
        if (thisTaskIndex === -1)
          return console.error("Could not find thisTaskIndex");

        draft[todayIndex].cash += task.money;
        draft[todayIndex].dailyTasks[thisTaskIndex].done += 1;
      })
    );
    setCash(
      produce(cash, (draft) => {
        draft.current += task.money;
        draft.total += task.money;
      })
    );
    message.success(`${formatAsCash(task?.money)} added!`);

    // Check for streak
    if (task.permanent && taskFromDay.done === 0) {
      // Only check on the first completion of a task
      let streak = 1;
      const todayIndex = days.findIndex((day) => day.date === date);
      if (todayIndex === -1) return console.error("Could not find todayIndex");
      for (let i = todayIndex - 1; i >= 0; i--) {
        const tempTaskFromDay = getTaskFromDay(task, days[i]);
        if (tempTaskFromDay.done) {
          streak++;
        } else {
          break;
        }
      }

      for (let i = todayIndex + 1; i <= days.length; i++) {
        if (!days[i]) break;
        const tempTaskFromDay = getTaskFromDay(task, days[i]);
        if (tempTaskFromDay.done) {
          streak++;
        } else {
          break;
        }
      }

      if (streak > 1) message.success(`${streak} day streak!`);
    }
  };

  const undoTask = () => {
    if (taskFromDay.done === 0) return;

    setDays(
      produce(days, (draft) => {
        const todayIndex = days.findIndex((d) => d.date === date);
        if (todayIndex === -1)
          return console.error("Could not find todayIndex");
        const thisTaskIndex = days[todayIndex].dailyTasks.findIndex(
          (t) => t.taskId === task.id
        );
        if (thisTaskIndex === -1)
          return console.error("Could not find thisTaskIndex");
        draft[todayIndex].cash -= task.money;
        draft[todayIndex].dailyTasks[thisTaskIndex].done -= 1;
      })
    );
    setCash(
      produce(cash, (draft) => {
        draft.current -= task.money;
        draft.total -= task.money;
      })
    );
    message.warning(`${formatAsCash(task?.money)} removed`);
  };

  const moveTask = (
    targetDate = new Date().toLocaleDateString(),
    newDate = date,
    newDaysArr = days
  ) => {
    const nextDay = new Date(
      moment(newDate).add(1, "days")
    ).toLocaleDateString();
    let updatedDaysArr = [...newDaysArr];
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
        return moveTask(targetDate, nextDay);
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
        return moveTask(targetDate, nextDay, updatedDaysArr);
      }
    }

    // Remove task from current day
    const todayIndex = days.findIndex((day) => day.date === date);
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

    setDays(newTempDaysArr);
    message.success("Task moved");
  };

  const editTask = () => {
    setTask(task);
    setAddModalVisibility(true);
  };

  const deleteTask = () => {
    setTasks(tasks.filter((t) => t.id !== task.id));
    return message.error("Task deleted");
  };

  const menuProps = {
    items: [
      { key: "edit", icon: <EditOutlined />, label: "Edit task" },
      {
        key: "undo",
        icon: <UndoOutlined />,
        label: "Undo task",
        disabled: !taskFromDay.done,
      },
      {
        key: "move-parent",
        icon: <ArrowRightOutlined />,
        label: "Move task",
        children: [
          { key: "move", label: "Move one day" },
          { key: "move-today", label: "Move to today", disabled: isDateToday },
        ],
        disabled: task.permanent,
      },
      {
        key: "delete-parent",
        icon: <DeleteFilled />,
        label: "Delete task",
        children: [{ key: "delete", label: "Delete task" }],
      },
    ],
    onClick: handleMenuClick,
  };

  return (
    <>
      <Dropdown.Button
        destroyPopupOnHide={true}
        trigger={["click"]}
        menu={menuProps}
        onClick={() => {
          if (taskFromDay.done && !task.repeatable) {
            undoTask();
          } else {
            completeTask();
          }
        }}
        size="small"
      >
        {taskFromDay.done && !task.repeatable ? (
          <UndoOutlined />
        ) : (
          <CheckOutlined />
        )}
      </Dropdown.Button>
    </>
  );
};

export default TaskActions;
