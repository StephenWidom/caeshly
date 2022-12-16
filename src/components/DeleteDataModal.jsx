import React, { useContext } from "react";
import { Modal, message, Typography } from "antd";

import TasksContext from "../contexts/TasksContext";
import CashContext from "../contexts/CashContext";
import DaysContext from "../contexts/DaysContext";
import TagsContext from "../contexts/TagsContext";
import SubtasksContext from "../contexts/SubtasksContext";
import WithdrawalsContext from "../contexts/WithdrawalsContext";
import DateContext from "../contexts/DateContext";

const DeleteDataModal = ({ isDeleteModalVisible, setDeleteVisibility }) => {
  const { setTasks } = useContext(TasksContext);
  const [, setCash] = useContext(CashContext);
  const [, setDays] = useContext(DaysContext);
  const { setTags } = useContext(TagsContext);
  const { setSubtasks } = useContext(SubtasksContext);
  const [, setWithdrawals] = useContext(WithdrawalsContext);
  const [, setDate] = useContext(DateContext);

  const deleteData = () => {
    const today = new Date().toLocaleDateString();
    setTasks([]);
    setCash({ current: 0, total: 0 });
    setSubtasks([]);
    setWithdrawals([]);
    setDays([
      {
        date: today,
        dailyTasks: [],
        cash: 0,
      },
    ]);
    setTags([]);
    setDate(today);

    message.success("All data deleted");
    setDeleteVisibility(false);
  };

  return (
    <Modal
      open={isDeleteModalVisible}
      onCancel={() => setDeleteVisibility(false)}
      title="Delete all data?"
      onOk={deleteData}
      okText="Delete all data"
      okType="danger"
    >
      <Typography.Text>
        This will delete ALL data: tasks, tags, cash breakdown, etc. This cannot
        be undone.
      </Typography.Text>
    </Modal>
  );
};

export default DeleteDataModal;
