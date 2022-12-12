import React, { useContext, useMemo } from "react";
import { orderBy } from "lodash";
import styled from "styled-components";
import { Space, Typography } from "antd";

import Task from "./Task";

import DaysContext from "../contexts/DaysContext";
import DateContext from "../contexts/DateContext";

const StyledTaskList = styled.div`
  margin: 20px 0;
`;

const TaskList = ({ permanent, tasks }) => {
  const [date] = useContext(DateContext);
  const [days] = useContext(DaysContext);

  const currentDay = useMemo(
    () => days.find((d) => d.date === date),
    [date, days]
  );

  const isDateToday = useMemo(
    () => new Date().toLocaleDateString() === date,
    [date]
  );

  const thisDaysTasks = useMemo(() => {
    if (permanent) return orderBy(tasks, ["urgent", "money"], ["desc", "desc"]);

    const dailyTaskIds = currentDay.dailyTasks.map((t) => t.taskId);
    return orderBy(
      tasks.filter((t) => dailyTaskIds.includes(t.id)),
      ["urgent", "money"],
      ["desc", "desc"]
    );
  }, [date, tasks, days]);

  return (
    <StyledTaskList>
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
      {!!thisDaysTasks?.length ? (
        <Space size="middle" direction="vertical" style={{ display: "flex" }}>
          {thisDaysTasks.map((task, i) => (
            <Task task={task} key={task.name} even={i % 2 === 0} />
          ))}
        </Space>
      ) : (
        <Typography.Text>No tasks</Typography.Text>
      )}
    </StyledTaskList>
  );
};

export default TaskList;
