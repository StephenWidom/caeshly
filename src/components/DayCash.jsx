import React, { useContext } from "react";
import { Typography } from "antd";

import DayContext from "../contexts/DayContext";
import DaysContext from "../contexts/DaysContext";

import { formatAsCash, getCurrentDayObj } from "../utils";

const DayCash = () => {
  const [days] = useContext(DaysContext);
  const [date] = useContext(DayContext);

  const currentDay = getCurrentDayObj(date, days);

  return (
    <>
      <Typography.Title level={3} style={{ marginBottom: 0 }}>
        {formatAsCash(currentDay?.cash)}
      </Typography.Title>
    </>
  );
};

export default DayCash;
