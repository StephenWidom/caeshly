import React, { useContext, useRef } from "react";
import { Modal, Button, Form, message, Input, InputNumber } from "antd";

import SubtasksContext from "../contexts/SubtasksContext";

import { getNextArrId } from "../utils";

const AddEditSubtaskModal = (props) => {
  const {
    isSubtaskModalVisible,
    setSubtaskModalVisibility,
    selectedSubtasks,
    setCurrentSubtasks,
    subtasks,
  } = useContext(SubtasksContext);

  const formRef = useRef();

  const resetAndHide = () => {
    setSubtaskModalVisibility(false);
    formRef?.current.resetFields();
  };

  const addEditSubtask = ({ name, money }) => {
    const newSubtaskId = getNextArrId([...subtasks, ...selectedSubtasks]);
    setCurrentSubtasks([
      ...selectedSubtasks,
      {
        id: newSubtaskId,
        name,
        money,
      },
    ]);
    resetAndHide();
    message.success("Subtask added");
  };

  return (
    <Modal
      title="Add Subtask"
      open={isSubtaskModalVisible}
      onCancel={resetAndHide}
      footer={[
        <Button key="cancel-subtask" onClick={resetAndHide}>
          Cancel
        </Button>,
        <Button
          type="primary"
          form="addSubtaskForm"
          key="submit-subtask"
          htmlType="submit"
        >
          Add Subtask
        </Button>,
      ]}
      {...props}
    >
      <Form
        name="addSubtaskForm"
        onFinish={addEditSubtask}
        ref={formRef}
        layout="vertical"
      >
        <Form.Item label="Task" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Value" name="money" rules={[{ required: true }]}>
          <InputNumber
            prefix="$"
            min={0.25}
            step={0.25}
            max={100}
            controls={true}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditSubtaskModal;
