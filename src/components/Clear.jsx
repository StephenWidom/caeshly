import React, { useContext, useState } from "react";
import { Modal, Button, message } from "antd";
import { useLongPress } from "react-use";
import { uniqueId } from "lodash";

import WithdrawalsContext from "../contexts/WithdrawalsContext";
import TasksContext from "../contexts/TasksContext";
import DaysContext from "../contexts/DaysContext";
import DayContext from "../contexts/DayContext";
import CashContext from "../contexts/CashContext";

const Clear = () => {
  const [tasks, setTasks] = useContext(TasksContext);
  const [date, setDate] = useContext(DayContext);
  const [cash, setCash] = useContext(CashContext);
  const [days, setDays] = useContext(DaysContext);
  const [withdrawals, setWithDrawals] = useContext(WithdrawalsContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const clearTasks = () => {
    setTasks([]);
    hideModal();
    AllTasksDeleted();
  };

  const AllTasksDeleted = () => {
    message.info("All tasks deleted");
  };

  const AllDataCleared = () => {
    message.warn("All data reset");
  };

  const confirmResetEverything = () => setIsResetModalVisible(true);

  const resetEverything = () => {
    setTasks([]);
    setDate(null);
    setDays([]);
    setCash({ current: 0, total: 0 });
    setWithDrawals([]);
    AllDataCleared();
    setIsResetModalVisible(false);
  };

  const longPressEvent = useLongPress(confirmResetEverything, { delay: 800 });

  return (
    <>
      <Button
        {...longPressEvent}
        onClick={() => {
          if (tasks.length) showModal();
        }}
        danger={true}
        type={tasks.length ? "primary" : "ghost"}
      >
        Clear tasks
      </Button>
      <Modal
        visible={isModalVisible}
        title="Remove all tasks?"
        onCancel={hideModal}
        onOk={clearTasks}
        okText="Yes"
      >
        <p>Are you sure you want to remove all tasks and start all over?</p>
      </Modal>
      <Modal
        visible={isResetModalVisible}
        title="Reset EVERYTHING?"
        onCancel={() => setIsResetModalVisible(false)}
        onOk={resetEverything}
        footer={[
          <Button
            key={`c${uniqueId()}`}
            onClick={() => setIsResetModalVisible(false)}
          >
            Cancel
          </Button>,
          <Button
            key={`clr${uniqueId()}`}
            onClick={resetEverything}
            danger
            type="primary"
          >
            Reset all data
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete all data?</p>
      </Modal>
    </>
  );
};

export default Clear;
