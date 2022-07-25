import React from "react";
import { Space } from "antd";
import styled from "styled-components";

import { Container } from "./Layout";
import Add from "./Add";
import Clear from "./Clear";
import Export from "./Export";
import BackToTop from "./BackToTop";

const StyledContainer = styled(Container)`
  text-align: center;
  margin: 10px auto 20px;

  & .ant-space {
    justify-content: space-around;
  }
`;
const Actions = () => {
  return (
    <StyledContainer>
      <Space wrap={true}>
        <Add />
        <Clear />
        <Export />
        <BackToTop />
      </Space>
    </StyledContainer>
  );
};

export default Actions;
