import React, { useContext } from "react";
import orderBy from "lodash/orderBy";

import { Container } from "./Layout";
import TaskList from "./TaskList";

import DayContext from "../contexts/DayContext";
import DaysContext from "../contexts/DaysContext";
import TasksContext from "../contexts/TasksContext";

const DailyTaskList = () => {
  const [date] = useContext(DayContext);
  const [days] = useContext(DaysContext);
  const [tasks] = useContext(TasksContext);

  if (!days.length) return null;

  const currentDay = days.find((d) => d.date === date);
  const dailyTaskIds = currentDay.dailyTasks.map((t) => t.taskId);
  const todaysTasks = tasks.filter((t) => dailyTaskIds.includes(t.id));

  const todaysTaskList = orderBy(
    todaysTasks,
    ["urgent", "permanent", "money"],
    ["desc", "asc", "desc"]
  );

  return (
    <Container>
      <TaskList list={todaysTaskList} />
    </Container>
  );
};

export default DailyTaskList;
