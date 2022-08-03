import React, { useState, useContext } from "react";
import { Space, Typography, Button, Drawer, List, Affix } from "antd";
import styled from "styled-components";
import uniqueId from "lodash/uniqueId";

import Withdraw from "./Withdraw";
import Add from "./Add";
import { FlexContainer } from "./Layout";

import DayContext from "../contexts/DayContext";
import DaysContext from "../contexts/DaysContext";
import CashContext from "../contexts/CashContext";
import WithdrawalsContext from "../contexts/WithdrawalsContext";

import { formatAsCash, formatAsDate } from "../utils";

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

const AlignRight = styled.span`
  float: right;
`;

const CashButton = styled(Button)`
  background: #1b8366;
  border-color: #1b8366;
  &:hover,
  &:active {
    background: #3e7342;
    border-color: #3e7342;
  }
`;

const AppHeader = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWithdrawalsVisible, setIsWithdrawlsVisible] = useState(false);
  const [days] = useContext(DaysContext);
  const [, setDate] = useContext(DayContext);
  const [cash] = useContext(CashContext);
  const [withdrawals] = useContext(WithdrawalsContext);

  const goToDate = (date) => {
    setDate(date);
    setIsSidebarVisible(false);
  };

  return (
    <Affix offsetTop={0} className="AppHeader">
      <StyledHeader>
        <FlexContainer>
          <Typography.Title level={3}>Cæshly</Typography.Title>
          <>
            <Space>
              <Add inHeader={true} />
              <Button
                shape="circle"
                onClick={() => setIsWithdrawlsVisible(true)}
                size="large"
              >
                W
              </Button>
              <CashButton
                shape="circle"
                size="large"
                type="primary"
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              >
                $
              </CashButton>
            </Space>
          </>
        </FlexContainer>
        <Drawer
          visible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
          title="Cash Breakdown"
          footer={
            <Typography.Title level={5}>
              Total Earned: <AlignRight>{formatAsCash(cash.total)}</AlignRight>
            </Typography.Title>
          }
        >
          <List
            size="small"
            header={
              <Typography.Title level={5}>
                Total Available:{" "}
                <AlignRight>{formatAsCash(cash.current)}</AlignRight>
              </Typography.Title>
            }
            dataSource={days}
            renderItem={(day) => (
              <List.Item>
                <Typography.Text underline onClick={() => goToDate(day.date)}>
                  {formatAsDate(day.date)}
                </Typography.Text>
                <Typography.Text>{formatAsCash(day.cash)}</Typography.Text>
              </List.Item>
            )}
          />
        </Drawer>
        <Drawer
          visible={isWithdrawalsVisible}
          onClose={() => setIsWithdrawlsVisible(false)}
          title="Withdrawals"
          footer={<Withdraw />}
        >
          <List
            size="small"
            dataSource={withdrawals}
            itemLayout="horizontal"
            renderItem={(w) => (
              <List.Item key={`w-${uniqueId()}`}>
                <List.Item.Meta
                  title={<>{formatAsDate(w.date)}</>}
                  description={<>{w.note}</>}
                />
                <Typography.Text>{formatAsCash(w.amount)}</Typography.Text>
              </List.Item>
            )}
          />
        </Drawer>
      </StyledHeader>
    </Affix>
  );
};

export default AppHeader;
