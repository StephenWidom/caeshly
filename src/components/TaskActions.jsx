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
  moveTask,
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
      case "move-one":
        return moveTaskBoi(
          new Date(moment(date).add(1, "days")).toLocaleDateString()
        );
      case "move-today":
        return moveTaskBoi();
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

  const moveTaskBoi = (targetDate = new Date().toLocaleDateString()) => {
    setDays(moveTask(targetDate, date, task, tasks, days, date));
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
          { key: "move-one", label: "Move one day" },
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
