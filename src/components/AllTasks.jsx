import React, { useContext } from "react";
import styled from "styled-components";
import produce from "immer";
import flatten from "lodash/flatten";
import { message, Typography, Card, Divider } from "antd";

import TaskList from "./TaskList";
import { Container } from "./Layout";

import TasksContext from "../contexts/TasksContext";
import DaysContext from "../contexts/DaysContext";
import TagsContext from "../contexts/TagsContext";
import DateContext from "../contexts/DateContext";
import CashContext from "../contexts/CashContext";
import WithdrawalsContext from "../contexts/WithdrawalsContext";

const StyledContainer = styled(Container)`
  padding-bottom: 20px;
`;

const AllTasks = ({ groupedTasks }) => {
  const { setTasks, setSubtasks } = useContext(TasksContext);
  const [days, setDays] = useContext(DaysContext);
  const { setTags } = useContext(TagsContext);
  const [date, setDate] = useContext(DateContext);
  const [cash, setCash] = useContext(CashContext);
  const [withdrawals, setWithdrawals] = useContext(WithdrawalsContext);

  const importData = (e) => {
    // TODO: Move to utils, or otherwise define ONCE
    const file = e?.target?.files[0];
    if (!file) return message.error("Please provide a file");
    if (file.type !== "application/json")
      return message.error("Only JSON files allowed");

    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (e) => {
      if (!e?.target?.result)
        return message.error("Does not seem like a valid Caeshly file");

      const data = JSON.parse(e.target.result);
      if (data?.version[0] !== "2")
        return message.error(
          `Outdate file version: ${data?.version}. Must be at least v2.0.0`
        );
      const { tasks, cash, days, date, withdrawals, tags, subtasks } = data;
      setTasks(tasks);
      setCash(cash);
      setDays(days);
      setDate(date);
      setWithdrawals(withdrawals);
      setTags(tags);
      setSubtasks(subtasks);
      return message.success("Data imported");
    };
  };

  const createExamples = async () => {
    const exampleTags = (await import("../exampleTags.js")).default;
    const exampleTasks = (await import("../exampleTasks.js")).default;
    const exampleSubtasks = (await import("../exampleSubtasks.js")).default;

    setTags(exampleTags);
    setTasks(exampleTasks);
    setSubtasks(exampleSubtasks);
    setDays(
      produce(days, (draft) => {
        const todayIndex = days.findIndex((d) => d.date === date);
        if (todayIndex === -1)
          return console.error("Could not find todayIndex");
        const permTasks = exampleTasks.reduce((acc, curr) => {
          if (curr.permanent) acc.push({ taskId: curr.id, done: 0 });
          return acc;
        }, []);
        const todaysTasks = exampleTasks.map((t) => {
          return { taskId: t.id, done: 0 };
        });
        const todaysSubtasks = exampleSubtasks.map((s) => ({
          subtaskId: s.id,
          done: 0,
        }));
        draft[todayIndex].dailyTasks = todaysTasks;
        draft[todayIndex].dailySubtasks = todaysSubtasks;
        draft.forEach((day, index) => {
          if (index !== todayIndex) {
            draft[index].dailyTasks = permTasks;
            draft[index].dailySubtasks = todaysSubtasks;
          }
        });
      })
    );
  };

  return (
    <StyledContainer>
      {!!flatten(groupedTasks)?.length ? (
        groupedTasks.map((group, index) => (
          <div key={`tasklistcontainer-${index}`}>
            <TaskList
              permanent={index}
              tasks={group}
              key={`tasklist-${index}`}
            />
            {index === 0 && <Divider />}
          </div>
        ))
      ) : (
        <Card>
          <Typography.Text>
            Add a task or{" "}
            <Typography.Link
              onClick={() => document.querySelector("#import").click()}
            >
              import data
            </Typography.Link>{" "}
            to get started!{" "}
            <Typography.Link onClick={createExamples}>
              Click here{" "}
            </Typography.Link>
            to create a few example tasks.
          </Typography.Text>
          <div style={{ display: "none" }}>
            <input type="file" id="import" onChange={importData} />
          </div>
        </Card>
      )}
    </StyledContainer>
  );
};

export default AllTasks;
