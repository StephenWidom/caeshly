import styled from "styled-components";

export const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 10px;
`;

export const FlexContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  flex: column nowrap;
`;
