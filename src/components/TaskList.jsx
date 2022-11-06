import React, { useContext } from "react";
import produce from "immer";
import moment from "moment";
import styled from "styled-components";
import { Button, Card, Space, message, Popconfirm, Typography } from "antd";
import {
  ArrowRightOutlined,
  CheckOutlined,
  DeleteFilled,
  UndoOutlined,
} from "@ant-design/icons";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";

import TasksContext from "../contexts/TasksContext";
import DaysContext from "../contexts/DaysContext";
import DayContext from "../contexts/DayContext";
import CashContext from "../contexts/CashContext";
import WithdrawalsContext from "../contexts/WithdrawalsContext";

import {
  formatAsCash,
  getCurrentDayObj,
  getStartingDailyTasks,
  getTaskFromDay,
} from "../utils";

import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

const StyledTable = styled(Table)`
  @media screen and (max-width: 40em) {
    &.responsiveTable td.pivoted {
      padding-left: calc(21% + 10px) !important;
    }
  }

  &.responsiveTable td .tdBefore {
    width: calc(21% - 10px) !important;
  }

  border-collapse: collapse;
  font-size: 85%;

  th {
    text-transform: uppercase;
    padding: 12px 8px;
    background: #3c3c3c;
    color: #fefefe;
  }

  td {
    padding: 8px;
  }

  tr:not(:last-child) td {
    border-bottom: 1px dotted #dedede;
  }

  tr.perm td {
    background: #e6f7ff;
  }

  tr.perm:nth-child(even) td {
    background: #f1faff;
  }

  tr.urgent td {
    background: #fff1f0;
    color: #cf1322;
  }

  tr.urgent:nth-child(even) td {
    background: #ba3c3c;
    color: #fff;
  }

  tr.urgent.done td {
    background: inherit;
    color: inherit;
  }

  tr.urgent.done:nth-child(even) td {
    background: #fcfcfc;
  }

  tr:nth-child(even) td {
    background: #fcfcfc;
  }

  th:nth-child(1),
  td:nth-child(1),
  th:nth-child(4),
  td:nth-child(4) {
    text-align: left;
  }

  th:nth-child(2),
  td:nth-child(2),
  th:nth-child(3),
  td:nth-child(3) {
    text-align: right;
  }
`;

const TaskList = ({ list }) => {
  const [tasks, setTasks] = useContext(TasksContext);
  const [days, setDays] = useContext(DaysContext);
  const [date, setDate] = useContext(DayContext);
  const [cash, setCash] = useContext(CashContext);
  const [, setWithdrawals] = useContext(WithdrawalsContext);

  const createExamples = async () => {
    const examples = (await import("../examples.js")).default;
    setTasks(examples);
    setDays(
      produce(days, (draft) => {
        const todayIndex = days.findIndex((d) => d.date === date);
        const permTasks = examples.reduce((acc, curr) => {
          if (curr.permanent) acc.push({ taskId: curr.id, done: 0 });
          return acc;
        }, []);
        const todaysTasks = examples.map((t) => {
          return {
            taskId: t.id,
            done: 0,
          };
        });
        draft[todayIndex].dailyTasks = todaysTasks;
        draft.forEach((el, i) => {
          if (i !== todayIndex) {
            draft[i].dailyTasks = permTasks;
          }
        });
      })
    );
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file.type !== "application/json")
      return message.warn("Only JSON files allowed");

    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (e) => {
      if (!e?.target?.result)
        return message.warn("Doesn't seem like a valid Caeshly file");

      const data = JSON.parse(e.target.result);
      setTasks(data.tasks);
      setDays(data.days);
      setDate(data.date);
      setCash(data.cash);
      setWithdrawals(data.withdrawals);
      return message.success("Data imported!");
    };
  };

  const pushTask = (task) => {
    const nextDay = new Date(moment(date).add(1, "days")).toLocaleDateString();
    let updatedDays = [...days];
    const nextDayIndex = days.findIndex((d) => d.date === nextDay);
    if (nextDayIndex !== -1) {
      // If the following day DOES exist
      const newTasksArr = [
        ...days[nextDayIndex].dailyTasks,
        {
          taskId: task.id,
          done: 0,
        },
      ];
      updatedDays[nextDayIndex].dailyTasks = newTasksArr;
    } else {
      // If the following day DOES NOT exist yet
      updatedDays = [
        ...days,
        {
          date: nextDay,
          dailyTasks: [
            ...getStartingDailyTasks(tasks),
            {
              taskId: task.id,
              done: 0,
            },
          ],
          cash: 0,
        },
      ];
    }

    const todayIndex = days.findIndex((d) => d.date === date);
    const newTasksArr = days[todayIndex].dailyTasks.filter(
      (t) => t.taskId !== task.id
    );
    let newDays = [...updatedDays];
    newDays[todayIndex] = {
      ...newDays[todayIndex],
      dailyTasks: newTasksArr,
    };
    setDays(newDays);
  };

  const TaskCompleted = (task) => {
    message.success(
      `${task?.money.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })} added!`
    );
  };

  const TaskUndid = (task) => {
    message.warn(
      `${task?.money.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })} removed`
    );
  };

  const completeTask = (task) => {
    setDays(
      produce(days, (draft) => {
        const todayIndex = days.findIndex((d) => d.date === date);
        const thisTaskIndex = days[todayIndex].dailyTasks.findIndex(
          (t) => t.taskId === task.id
        );
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
    TaskCompleted(task);
  };

  const undoTask = (task) => {
    setDays(
      produce(days, (draft) => {
        const todayIndex = days.findIndex((d) => d.date === date);
        const thisTaskIndex = days[todayIndex].dailyTasks.findIndex(
          (t) => t.taskId === task.id
        );
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
    TaskUndid(task);
  };

  const TaskDeleted = () => {
    message.warn("Task deleted");
  };

  const removeTask = (currentTask) => {
    setTasks(tasks.filter((t) => t.name !== currentTask.name));
    setDays(
      produce(days, (draft) => {
        const todayIndex = draft.findIndex((d) => d.date === date);
        const thisTaskIndex = draft[todayIndex].dailyTasks.findIndex(
          (t) => t.taskId === currentTask.id
        );
        draft[todayIndex].dailyTasks.splice(thisTaskIndex, 1);
      })
    );
    TaskDeleted();
  };

  return (
    <Card bodyStyle={{ padding: 0 }}>
      <StyledTable>
        <Thead>
          <Tr>
            <Th>Task</Th>
            <Th>Cash</Th>
            <Th>Earned</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {!!list.length ? (
            list.map((task) => {
              const taskFromDay = getTaskFromDay(
                task,
                getCurrentDayObj(date, days)
              );
              return (
                <Tr
                  className={`${task.permanent ? "perm" : ""} ${
                    task?.urgent ? "urgent" : ""
                  } ${taskFromDay.done ? "done" : ""}`}
                  key={`task${task.id}`}
                >
                  <Td>{task.name}</Td>
                  <Td>{formatAsCash(task.money)}</Td>
                  <Td>{formatAsCash(taskFromDay.done * task.money)}</Td>
                  <Td>
                    <Space wrap={true}>
                      <Button
                        disabled={taskFromDay.done && !task.repeatable}
                        onClick={() => completeTask(task)}
                        icon={<CheckOutlined />}
                      ></Button>
                      <Button
                        disabled={!taskFromDay.done}
                        onClick={() => undoTask(task)}
                        icon={<UndoOutlined />}
                      ></Button>
                      <Popconfirm
                        title="Are you sure you want to delete this task?"
                        onConfirm={() => removeTask(task)}
                      >
                        <Button danger icon={<DeleteFilled />}></Button>
                      </Popconfirm>

                      {!task.permanent &&
                        !task.repeatable &&
                        !taskFromDay.done && (
                          <Popconfirm
                            title="Move this task to today?"
                            onConfirm={() => pushTask(task)}
                          >
                            <Button icon={<ArrowRightOutlined />}></Button>
                          </Popconfirm>
                        )}
                    </Space>
                  </Td>
                </Tr>
              );
            })
          ) : (
            <Tr>
              <Td colSpan="4">
                <Typography.Text style={{ padding: 8 }}>
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
              </Td>
            </Tr>
          )}
        </Tbody>
      </StyledTable>
      <div style={{ display: "none " }}>
        <input type="file" id="import" onChange={importData} />
      </div>
    </Card>
  );
};

export default TaskList;
