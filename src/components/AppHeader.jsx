import React, { useContext, useMemo } from "react";
import produce from "immer";
import styled from "styled-components";
import { Space, Typography, Button, Affix } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

import AddTaskButton from "./AddTaskButton";
import MainMenu from "./MainMenu";
import { FlexContainer } from "./Layout";

import TasksContext from "../contexts/TasksContext";
import DateContext from "../contexts/DateContext";
import DaysContext from "../contexts/DaysContext";

import { doesDateExist, getStartingDailyTasks, getNextDayObj } from "../utils";

const StyledHeader = styled.div`
  padding: 12px 0;
  background: #fff;
  box-shadow: 0 0 12px #eee;

  h3 {
    margin-bottom: 0;
  }

  & > div {
    align-items: center;
  }
`;

const AppHeader = ({ setDeleteVisibility }) => {
  const { tasks, setAddModalVisibility } = useContext(TasksContext);
  const [date, setDate] = useContext(DateContext);
  const [days, setDays] = useContext(DaysContext);

  const isDateToday = useMemo(
    () => new Date().toLocaleDateString() === date,
    [date]
  );

  const goToToday = () => {
    const todayDateObj = new Date();
    const today = todayDateObj.toLocaleDateString();
    let nextDayObj = getNextDayObj(date);
    let daysToAdd = [];

    while (nextDayObj <= todayDateObj) {
      let nextDay = nextDayObj.toLocaleDateString();
      if (!doesDateExist(days, nextDay)) {
        daysToAdd.push({
          date: nextDay,
          dailyTasks: getStartingDailyTasks(tasks),
          cash: 0,
        });
      }
      nextDayObj = getNextDayObj(nextDayObj);
    }

    setDays(
      produce(days, (draft) => {
        draft.push(...daysToAdd);
      })
    );

    setDate(today);
  };

  return (
    <Affix offsetTop={0} className="AppHeader">
      <StyledHeader>
        <FlexContainer>
          <Typography.Title level={3}>Cæshly</Typography.Title>
          <Space size="small">
            <AddTaskButton onClick={() => setAddModalVisibility(true)} />
            <Button
              icon={<CalendarOutlined />}
              shape="circle"
              disabled={isDateToday}
              onClick={goToToday}
            />
            <MainMenu setDeleteVisibility={setDeleteVisibility} />
          </Space>
        </FlexContainer>
      </StyledHeader>
    </Affix>
  );
};

export default AppHeader;
