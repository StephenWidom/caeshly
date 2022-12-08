import React, { useState, useContext } from "react";
import { Button, Drawer, Menu, message } from "antd";
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

const MainMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCashOpen, setIsCashOpen] = useState(false);
  const [isWithdrawalsOpen, setIsWithdrawalsOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  const { tasks } = useContext(TasksContext);
  const [cash] = useContext(CashContext);
  const [days] = useContext(DaysContext);
  const { tags } = useContext(TagsContext);
  const [subtasks] = useContext(SubtasksContext);
  const [withdrawals] = useContext(WithdrawalsContext);
  const [date] = useContext(DateContext);

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

  return (
    <>
      <Button shape="circle" icon={<MenuOutlined />} onClick={openMenu} />
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setIsMenuOpen(false)}
        open={isMenuOpen}
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
    </>
  );
};

export default MainMenu;
