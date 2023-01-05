import React, { useState, useContext } from "react";
import { Button, Drawer, Menu, message, Typography } from "antd";
import { MenuOutlined } from "@ant-design/icons";

import CashMenu from "./CashMenu";
import WithdrawalsMenu from "./WithdrawalsMenu";
import TagsMenu from "./TagsMenu";

import TasksContext from "../contexts/TasksContext";
import CashContext from "../contexts/CashContext";
import DaysContext from "../contexts/DaysContext";
import TagsContext from "../contexts/TagsContext";
import SubtasksContext from "../contexts/SubtasksContext";
import WithdrawalsContext from "../contexts/WithdrawalsContext";
import DateContext from "../contexts/DateContext";

import { version as appVersion } from "../../package.json";

const MainMenu = ({ setDeleteVisibility }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCashOpen, setIsCashOpen] = useState(false);
  const [isWithdrawalsOpen, setIsWithdrawalsOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  const { tasks, setTasks } = useContext(TasksContext);
  const [cash, setCash] = useContext(CashContext);
  const [days, setDays] = useContext(DaysContext);
  const { tags, setTags } = useContext(TagsContext);
  const { subtasks, setSubtasks } = useContext(SubtasksContext);
  const [withdrawals, setWithdrawals] = useContext(WithdrawalsContext);
  const [date, setDate] = useContext(DateContext);

  const openMenu = () => setIsMenuOpen(true);
  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "tags":
        return setIsTagsOpen(true);
      case "cash":
        return setIsCashOpen(true);
      case "withdrawals":
        return setIsWithdrawalsOpen(true);
      case "export":
        return exportData();
      case "import":
        return showFileSelector();
      case "delete":
        return setDeleteVisibility(true);
    }
  };

  const exportData = () => {
    let data = {
      tasks,
      cash,
      days,
      date,
      withdrawals,
      tags,
      subtasks,
      version: appVersion,
    };
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "caeshly.json";
    link.click();
    message.success("Data exported");
  };

  const showFileSelector = () => document.querySelector("#importFile").click();

  const importData = (e) => {
    // TODO: Move to utils, or otherwise define ONCE
    const file = e?.target?.files[0];
    if (!file) return message.error("Please provide a file");
    if (file.type !== "application/json")
      return message.error("Only JSON files allowed");

    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (e) => {
      if (!e?.target?.result)
        return message.error("Does not seem like a valid Caeshly file");

      const data = JSON.parse(e.target.result);
      if (data?.version[0] !== "2")
        return message.error(
          `Outdate file version: ${data?.version}. Must be at least v2.0.0`
        );
      const { tasks, cash, days, date, withdrawals, tags, subtasks } = data;
      setTasks(tasks);
      setCash(cash);
      setDays(days);
      setDate(date);
      setWithdrawals(withdrawals);
      setTags(tags);
      setSubtasks(subtasks);
      return message.success("Data imported");
    };
  };

  return (
    <>
      <Button shape="circle" icon={<MenuOutlined />} onClick={openMenu} />
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setIsMenuOpen(false)}
        open={isMenuOpen}
        footer={<Typography.Text>Cæshly v{appVersion}</Typography.Text>}
      >
        <Menu
          mode="inline"
          items={[
            { key: "cash", label: "Cash Breakdown" },
            { key: "withdrawals", label: "Withdrawals" },
            { key: "tags", label: "Tags" },
            {
              key: "data",
              label: "Data",
              type: "group",
              children: [
                { key: "export", label: "Export JSON" },
                { key: "import", label: "Import JSON" },
              ],
            },
            { key: "delete", label: "Delete Data", danger: true },
          ]}
          onClick={handleMenuClick}
        />
        <CashMenu
          open={isCashOpen}
          closeDrawer={() => setIsCashOpen(false)}
          closeMenu={() => setIsMenuOpen(false)}
        />
        <WithdrawalsMenu
          open={isWithdrawalsOpen}
          closeDrawer={() => setIsWithdrawalsOpen(false)}
          closeMenu={() => setIsMenuOpen(false)}
        />
        <TagsMenu open={isTagsOpen} closeDrawer={() => setIsTagsOpen(false)} />
      </Drawer>
      <div style={{ display: "none" }}>
        <input type="file" id="importFile" onChange={importData} />
      </div>
    </>
  );
};

export default MainMenu;
