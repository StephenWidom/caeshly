import React from "react";
import styled from "styled-components";
import { Card } from "antd";

import { Container } from "./Layout";
import Day from "./Day";
import DayCash from "./DayCash";

const StyledCard = styled(Card)`
  margin: 10px 0;
`;

const DayCard = () => {
  return (
    <Container>
      <StyledCard>
        <Day />
        <DayCash />
      </StyledCard>
    </Container>
  );
};

export default DayCard;
