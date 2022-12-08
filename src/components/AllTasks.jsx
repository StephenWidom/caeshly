import React, { useContext } from "react";
import produce from "immer";
import flatten from "lodash/flatten";
import { message, Typography, Card, Divider } from "antd";

import TaskList from "./TaskList";
import { Container } from "./Layout";

import TasksContext from "../contexts/TasksContext";
import DaysContext from "../contexts/DaysContext";
import TagsContext from "../contexts/TagsContext";
import DateContext from "../contexts/DateContext";

const AllTasks = ({ groupedTasks }) => {
  const { setTasks, setSubtasks } = useContext(TasksContext);
  const [days, setDays] = useContext(DaysContext);
  const { setTags } = useContext(TagsContext);
  const [date] = useContext(DateContext);

  const importData = () => {
    message.success("imported!");
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
        draft[todayIndex].dailyTasks = todaysTasks;
        draft.forEach((day, index) => {
          if (index !== todayIndex) draft[index].dailyTasks = permTasks;
        });
      })
    );
  };

  return (
    <Container>
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
    </Container>
  );
};

export default AllTasks;
