import React, { useContext, useMemo } from "react";
import styled from "styled-components";
import { Space, Typography, Button, Affix } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

import AddTaskButton from "./AddTaskButton";
import MainMenu from "./MainMenu";
import { FlexContainer } from "./Layout";

import TasksContext from "../contexts/TasksContext";
import DateContext from "../contexts/DateContext";

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

const AppHeader = () => {
  const { setAddModalVisibility } = useContext(TasksContext);
  const [date, setDate] = useContext(DateContext);

  const isDateToday = useMemo(
    () => new Date().toLocaleDateString() === date,
    [date]
  );

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
              onClick={() => setDate(new Date().toLocaleDateString())}
            />
            <MainMenu />
          </Space>
        </FlexContainer>
      </StyledHeader>
    </Affix>
  );
};

export default AppHeader;
