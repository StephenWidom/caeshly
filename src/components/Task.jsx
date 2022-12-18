import React, { useContext, useMemo } from "react";
import styled from "styled-components";
import produce from "immer";
import { Card, Typography, Collapse, Checkbox, message, Space } from "antd";
import {
  CheckSquareOutlined,
  DollarOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import TaskActions from "./TaskActions";
import Tag from "./Tag";

import DateContext from "../contexts/DateContext";
import DaysContext from "../contexts/DaysContext";
import CashContext from "../contexts/CashContext";
import SubtasksContext from "../contexts/SubtasksContext";

import {
  formatAsCash,
  getCurrentDayObj,
  getTaskFromDay,
  getSubtask,
} from "../utils";

const StyledTask = styled(Card)`
  border-radius: 3px;
  border: 0;
  transition: all 0.2s ease;
  box-shadow: 0 1px 0 #091e4240;

  ${({ $urgent }) =>
    !!$urgent &&
    `
  background: #fadada;
`}

  ${({ $complete }) =>
    !!$complete &&
    `
    opacity: 0.65;
  `}
`;

const StyledCardContent = styled.div`
  display: flex;
  flex: row wrap;
  gap: 15px;
  padding: 12px;
`;

const Task = ({ task }) => {
  const [date] = useContext(DateContext);
  const [days, setDays] = useContext(DaysContext);
  const { subtasks } = useContext(SubtasksContext);
  const [cash, setCash] = useContext(CashContext);

  const { Panel } = Collapse;

  const { name, money } = task;
  const taskFromDay = useMemo(
    () => getTaskFromDay(task, getCurrentDayObj(date, days)),
    [task, days, date]
  );

  const updateSubtask = (e, subtask) => {
    if (e.target.checked) {
      // Subtask has been completed
      setDays(
        produce(days, (draft) => {
          const todayIndex = days.findIndex((d) => d.date === date);
          if (todayIndex === -1)
            return console.error("Could not find todayIndex");

          draft[todayIndex].cash += subtask.money;

          const thisSubtaskInDayIndex = draft[
            todayIndex
          ].dailySubtasks.findIndex((s) => s.subtaskId === subtask.id);
          if (thisSubtaskInDayIndex === -1)
            return console.error("Could not find thisSubtaskInDayIndex");

          draft[todayIndex].dailySubtasks[thisSubtaskInDayIndex].done = 1;
        })
      );
      setCash(
        produce(cash, (draft) => {
          draft.current += subtask.money;
          draft.total += subtask.money;
        })
      );
      message.success(`${formatAsCash(subtask?.money)} added!`);
    } else {
      // Subtask un-completed
      setDays(
        produce(days, (draft) => {
          const todayIndex = days.findIndex((d) => d.date === date);
          if (todayIndex === -1)
            return console.error("Could not find todayIndex");

          draft[todayIndex].cash -= subtask.money;

          const thisSubtaskInDayIndex = draft[
            todayIndex
          ].dailySubtasks.findIndex((s) => s.subtaskId === subtask.id);
          if (thisSubtaskInDayIndex === -1)
            return console.error("Could not find thisSubtaskInDayIndex");

          draft[todayIndex].dailySubtasks[thisSubtaskInDayIndex].done = 0;
        })
      );
      setCash(
        produce(cash, (draft) => {
          draft.current -= subtask.money;
          draft.total -= subtask.money;
        })
      );
      message.warning(`${formatAsCash(subtask?.money)} removed`);
    }
  };

  const todayObject = useMemo(() => getCurrentDayObj(date, days), [date, days]);

  const subtaskComplete = (subtaskId) =>
    !!todayObject?.dailySubtasks &&
    todayObject?.dailySubtasks.find((s) => s.subtaskId === subtaskId)?.done;

  return (
    taskFromDay && (
      <StyledTask
        title={name}
        size="small"
        extra={<TaskActions task={task} />}
        bodyStyle={{ padding: 0 }}
        $complete={taskFromDay.done && !task.repeatable}
        $urgent={task.urgent}
      >
        <StyledCardContent>
          <Typography.Text>
            <DollarOutlined /> {formatAsCash(money, false)}
          </Typography.Text>
          <Typography.Text>
            <CheckSquareOutlined /> {taskFromDay.done} (
            {formatAsCash(taskFromDay.done * task.money)})
          </Typography.Text>
          {task.repeatable && (
            <Typography.Text>
              <SyncOutlined />
            </Typography.Text>
          )}
          <Typography.Text>
            {!!task?.tags.length &&
              task?.tags.map((tagId) => (
                <Tag tagId={tagId} key={`${tagId}-id`} />
              ))}
          </Typography.Text>
        </StyledCardContent>
        {!!task?.subtasks.length && (
          <Collapse bordered={false}>
            <Panel header="Subtasks">
              <Space direction="vertical">
                {task.subtasks.map((subtaskId) => {
                  const thisSubtask = getSubtask(subtaskId, subtasks);
                  return (
                    !!thisSubtask && (
                      <Checkbox
                        onChange={(e) => updateSubtask(e, thisSubtask)}
                        key={subtaskId + task.id}
                        checked={subtaskComplete(subtaskId)}
                      >
                        {thisSubtask.name} ({formatAsCash(thisSubtask.money)})
                      </Checkbox>
                    )
                  );
                })}
              </Space>
            </Panel>
          </Collapse>
        )}
      </StyledTask>
    )
  );
};

export default Task;
