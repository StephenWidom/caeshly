import React, { useContext, useMemo } from "react";
import _, { orderBy } from "lodash";
import styled from "styled-components";
import { Dropdown, message, Space, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

import Task from "./Task";

import DaysContext from "../contexts/DaysContext";
import DateContext from "../contexts/DateContext";
import TasksContext from "../contexts/TasksContext";
import SubtasksContext from "../contexts/SubtasksContext";

import { getCurrentDayObj, getTaskFromDay, moveTask } from "../utils";

const StyledTaskList = styled.div`
  margin: 20px 0;
  padding: 8px 8px 16px;
  background: #ebecf0;
  border-radius: 3px;

  .ant-typography {
    padding: 4px;
  }
`;

const TaskListTitle = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;

  .ant-dropdown-button {
    width: auto;
  }
`;

const TaskList = ({ permanent, tasks }) => {
  const [date] = useContext(DateContext);
  const [days, setDays] = useContext(DaysContext);
  const { tasks: allTasks } = useContext(TasksContext);
  const { subtasks } = useContext(SubtasksContext);

  const currentDay = useMemo(
    () => days.find((d) => d.date === date),
    [date, days, tasks]
  );

  const isDateToday = useMemo(
    () => new Date().toLocaleDateString() === date,
    [date]
  );

  const thisDaysTasks = useMemo(() => {
    if (!currentDay) return console.error("currentDay is undefined");
    if (permanent) return orderBy(tasks, ["urgent", "money"], ["desc", "desc"]);

    const dailyTaskIds = currentDay.dailyTasks.map((t) => t.taskId);
    return orderBy(
      tasks.filter((t) => dailyTaskIds.includes(t.id)),
      ["urgent", "money"],
      ["desc", "desc"]
    );
  }, [date, tasks, days]);

  const handleMenuClick = async ({ key }) => {
    if (key === "move-all") {
      let numberOfTasks = 0;
      const today = new Date().toLocaleDateString();
      let newDaysArr = days;

      for (const task of thisDaysTasks) {
        const taskFromDay = getTaskFromDay(task, getCurrentDayObj(date, days));
        if (!taskFromDay) return console.error("Cannot retrieve taskFromDay");

        if (!taskFromDay.done) {
          newDaysArr = moveTask(today, date, task, allTasks, newDaysArr);
          numberOfTasks++;
        }
      }
      setDays(newDaysArr);
      message.success(
        `${numberOfTasks} task${numberOfTasks > 1 ? "s" : ""} moved`
      );
    }
  };

  const menuProps = {
    items: [
      {
        key: "move-all",
        icon: <ArrowRightOutlined />,
        label: "Move all undone tasks to today",
      },
    ],
    onClick: handleMenuClick,
  };

  return currentDay ? (
    <StyledTaskList>
      <TaskListTitle>
        <Typography.Title level={5}>
          {permanent
            ? "Daily"
            : isDateToday
            ? "Today's"
            : `${new Date(date).toLocaleString("en-us", {
                weekday: "long",
              })}'s`}{" "}
          Tasks
        </Typography.Title>
        {!permanent && !isDateToday && (
          <Dropdown.Button
            destroyPopupOnHide={true}
            trigger={["click"]}
            menu={menuProps}
            size="small"
            disabled={!thisDaysTasks.length}
          ></Dropdown.Button>
        )}
      </TaskListTitle>
      {!!thisDaysTasks?.length ? (
        <Space size="middle" direction="vertical" style={{ display: "flex" }}>
          {thisDaysTasks.map((task) => (
            <Task task={task} key={task.name} />
          ))}
        </Space>
      ) : (
        <Typography.Text>No tasks</Typography.Text>
      )}
    </StyledTaskList>
  ) : null;
};

export default TaskList;
