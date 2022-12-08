import React, { useContext } from "react";
import styled from "styled-components";
import { Drawer, Typography, List } from "antd";

import { AlignRight } from "./Layout";

import CashContext from "../contexts/CashContext";
import DaysContext from "../contexts/DaysContext";
import DateContext from "../contexts/DateContext";

import { formatAsCash, formatAsDate } from "../utils";

const StyledListItem = styled.li``;

const CashMenu = ({ open, closeDrawer, closeMenu }) => {
  const [cash] = useContext(CashContext);
  const [days] = useContext(DaysContext);
  const [, setDate] = useContext(DateContext);

  const goToDate = (date) => {
    setDate(date);
    closeDrawer();
    closeMenu();
  };

  return (
    <Drawer
      open={open}
      onClose={closeDrawer}
      title="Cash Breakdown"
      footer={
        <Typography.Title level={5}>
          Total earned: {formatAsCash(cash.total)}
        </Typography.Title>
      }
    >
      {!!days?.length ? (
        <List
          size="small"
          header={
            <Typography.Title level={5}>
              Total available:{" "}
              <AlignRight>{formatAsCash(cash.current)}</AlignRight>
            </Typography.Title>
          }
          dataSource={days}
          renderItem={(day) => (
            <StyledListItem
              className="ant-list-item ant-list-item-no-flex"
              // antd's List.Item is undefined. No idea why
              key={`day-${day.date}`}
            >
              <Typography.Text underline onClick={() => goToDate(day.date)}>
                {formatAsDate(day.date)}
              </Typography.Text>
              <AlignRight>
                <Typography.Text>{formatAsCash(day.cash)}</Typography.Text>
              </AlignRight>
            </StyledListItem>
          )}
        />
      ) : (
        <>No days, bruh</>
      )}
    </Drawer>
  );
};

export default CashMenu;
