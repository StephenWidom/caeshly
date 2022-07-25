import React, { useContext } from "react";
import { Button, Popconfirm } from "antd";

import DayContext from "../contexts/DayContext";
import DaysContext from "../contexts/DaysContext";
import CashContext from "../contexts/CashContext";
import WithdrawalsContext from "../contexts/WithdrawalsContext";
import TasksContext from "../contexts/TasksContext";

const Export = () => {
  const [days] = useContext(DaysContext);
  const [date] = useContext(DayContext);
  const [cash] = useContext(CashContext);
  const [withdrawals] = useContext(WithdrawalsContext);
  const [tasks] = useContext(TasksContext);

  const exportData = () => {
    let data = {
      tasks,
      cash,
      days,
      date,
      withdrawals,
    };
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "caeshly.json";
    link.click();
  };

  return (
    <Popconfirm onConfirm={exportData} title="Export data?">
      <Button type="ghost" disabled={!tasks.length}>
        Export
      </Button>
    </Popconfirm>
  );
};

export default Export;
