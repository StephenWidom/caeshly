import React from "react";
import styled from "styled-components";

import DailyTaskList from "./DailyTaskList";
import DayCard from "./DayCard";
import AppHeader from "./AppHeader";
import Actions from "./Actions";

const StyledHome = styled.div`
  padding: 0 0 10px;
`;

const Home = () => {
  return (
    <StyledHome>
      <AppHeader />
      <DayCard />
      <DailyTaskList />
      <Actions />
    </StyledHome>
  );
};

export default Home;
