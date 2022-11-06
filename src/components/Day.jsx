import React, { useContext } from "react";
import produce from "immer";
import moment from "moment";
import styled from "styled-components";
import { Space, Button, Typography } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import DayContext from "../contexts/DayContext";
import DaysContext from "../contexts/DaysContext";
import TasksContext from "../contexts/TasksContext";

import { formatAsDate, getStartingDailyTasks } from "../utils";

const StyledDay = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Day = () => {
  const [date, setDate] = useContext(DayContext);
  const [days, setDays] = useContext(DaysContext);
  const [tasks] = useContext(TasksContext);

  const prevDay = () => {
    const dayBefore = new Date(
      moment(date).subtract(1, "days")
    ).toLocaleDateString();
    if (!days.some((d) => d.date === dayBefore)) {
      setDays(
        produce(days, (draft) => {
          draft.unshift({
            date: dayBefore,
            dailyTasks: getStartingDailyTasks(tasks),
            cash: 0,
          });
        })
      );
    }
    setDate(dayBefore);
  };

  const nextDay = () => {
    const nextDay = new Date(moment(date).add(1, "days")).toLocaleDateString();
    if (!days.some((d) => d.date === nextDay)) {
      setDays(
        produce(days, (draft) => {
          draft.push({
            date: nextDay,
            dailyTasks: getStartingDailyTasks(tasks),
            cash: 0,
          });
        })
      );
    }
    setDate(nextDay);
  };

  if (!days.length) return null;

  return (
    <StyledDay>
      <Typography.Title level={5}>{formatAsDate(date)}</Typography.Title>
      <Space>
        <Button type="ghost" onClick={prevDay} size="small">
          <LeftOutlined />
        </Button>
        <Button type="ghost" onClick={nextDay} size="small">
          <RightOutlined />
        </Button>
      </Space>
    </StyledDay>
  );
};

export default Day;
