import React, { useContext, useMemo } from "react";
import styled from "styled-components";
import { Card, Typography, Collapse } from "antd";
import {
  CheckSquareOutlined,
  DollarOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import TaskActions from "./TaskActions";
import Tag from "./Tag";

import DateContext from "../contexts/DateContext";
import DaysContext from "../contexts/DaysContext";
import TasksContext from "../contexts/TasksContext";

import {
  formatAsCash,
  getCurrentDayObj,
  getTaskFromDay,
  getSubtask,
} from "../utils";

const StyledTask = styled(Card)`
  border-radius: 0;
`;

const StyledCardContent = styled.div`
  display: flex;
  flex: row wrap;
  gap: 15px;
  padding: 12px;
`;

const Task = ({ task }) => {
  const [date] = useContext(DateContext);
  const [days] = useContext(DaysContext);
  const { subtasks } = useContext(TasksContext);

  const { Panel } = Collapse;

  const { name, money, permanent, repeatable, urgent } = task;
  const taskFromDay = useMemo(
    () => getTaskFromDay(task, getCurrentDayObj(date, days)),
    [task, days]
  );

  return (
    taskFromDay && (
      <StyledTask
        title={name}
        size="small"
        extra={<TaskActions task={task} />}
        bodyStyle={{ padding: 0 }}
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
              {task.subtasks.map((subtaskId) => {
                const thisSubtask = getSubtask(subtaskId, subtasks);
                return <div key={subtaskId + task.id}>{thisSubtask.name}</div>;
              })}
            </Panel>
          </Collapse>
        )}
      </StyledTask>
    )
  );
};

export default Task;
