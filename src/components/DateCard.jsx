import React, { useContext, useMemo } from "react";
import styled from "styled-components";
import moment from "moment";
import produce from "immer";
import { Button, Card, Space, Typography } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import { Container } from "./Layout";

import DateContext from "../contexts/DateContext";
import DaysContext from "../contexts/DaysContext";
import TasksContext from "../contexts/TasksContext";

import {
  doesDateExist,
  formatAsCash,
  formatAsDate,
  getCurrentDayObj,
  getStartingDailySubtasks,
  getStartingDailyTasks,
} from "../utils";

const StyledDateCard = styled(Card)`
  margin: 10px 0;
  border-color: #999;

  h3 {
    margin-bottom: 0;
  }
`;

const StyledDateAndButtons = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DateCard = () => {
  const [date, setDate] = useContext(DateContext);
  const [days, setDays] = useContext(DaysContext);
  const { tasks } = useContext(TasksContext);

  const currentDay = useMemo(() => getCurrentDayObj(date, days), [date, days]);

  const goToPrevDay = () => {
    const dayBefore = new Date(
      moment(date).subtract(1, "days")
    ).toLocaleDateString();

    if (!doesDateExist(days, dayBefore)) {
      setDays(
        produce(days, (draft) => {
          draft.unshift({
            date: dayBefore,
            dailyTasks: getStartingDailyTasks(tasks),
            dailySubtasks: getStartingDailySubtasks(tasks),
            cash: 0,
          });
        })
      );
    }
    setDate(dayBefore);
  };

  const goToNextDay = () => {
    const nextDay = new Date(moment(date).add(1, "days")).toLocaleDateString();
    if (!doesDateExist(days, nextDay)) {
      setDays(
        produce(days, (draft) => {
          draft.push({
            date: nextDay,
            dailyTasks: getStartingDailyTasks(tasks),
            dailySubtasks: getStartingDailySubtasks(tasks),
            cash: 0,
          });
        })
      );
    }
    setDate(nextDay);
  };

  return (
    <Container>
      <StyledDateCard>
        {!!days.length ? (
          <>
            <StyledDateAndButtons>
              <Typography.Title level={5}>
                {formatAsDate(date)}
              </Typography.Title>
              <Space>
                <Button
                  type="ghost"
                  icon={<LeftOutlined />}
                  onClick={goToPrevDay}
                />
                <Button
                  type="ghost"
                  icon={<RightOutlined />}
                  onClick={goToNextDay}
                />
              </Space>
            </StyledDateAndButtons>
            <Typography.Title level={3}>
              {formatAsCash(currentDay?.cash)}
            </Typography.Title>
          </>
        ) : (
          <>NO DATE</>
        )}
      </StyledDateCard>
    </Container>
  );
};

export default DateCard;
