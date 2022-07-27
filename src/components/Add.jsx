import React, { useContext, useState, useRef } from "react";
import produce from "immer";
import {
  Modal,
  Button,
  Form,
  InputNumber,
  Input,
  Checkbox,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import TasksContext from "../contexts/TasksContext";
import DayContext from "../contexts/DayContext";
import DaysContext from "../contexts/DaysContext";

import { getNextTaskId } from "../utils";
import { uniqueId } from "lodash";

const Add = ({ inHeader }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showUrgent, setShowUrgent] = useState(true);
  const [showRepeatPerm, setShowRepeatPerm] = useState(true);
  const [date] = useContext(DayContext);
  const [days, setDays] = useContext(DaysContext);
  const [tasks, setTasks] = useContext(TasksContext);

  const formRef = useRef();

  const checkUrgent = (changedFields, allFields) => {
    setShowRepeatPerm(
      !allFields.some((f) => f.name[0] === "urgent" && f.value)
    );
    setShowUrgent(
      !allFields.some(
        (f) => ["permanent", "repeatable"].includes(f.name[0]) && f.value
      )
    );
  };

  const addTask = ({ name, money, repeatable, permanent, urgent }) => {
    const newTaskId = getNextTaskId(tasks);
    const task = {
      id: newTaskId,
      name,
      money,
      repeatable: !!repeatable,
      permanent: !!permanent,
      urgent: !!urgent,
    };
    setTasks(
      produce(tasks, (draft) => {
        draft.push(task);
      })
    );
    if (task.permanent) {
      setDays(
        days.map((d) => {
          return {
            ...d,
            dailyTasks: [...d.dailyTasks, { taskId: newTaskId, done: 0 }],
          };
        })
      );
    } else {
      setDays(
        produce(days, (draft) => {
          const todayIndex = days.findIndex((d) => d.date === date);
          draft[todayIndex].dailyTasks.push({ taskId: newTaskId, done: 0 });
        })
      );
    }
    formRef?.current.resetFields();
    message.success("Task added");
    hideModal();
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      {inHeader ? (
        <Button
          onClick={() => setIsModalVisible(true)}
          shape="circle"
          type="primary"
          size={`${inHeader ? "large" : "medium"}`}
          icon={<PlusOutlined />}
        ></Button>
      ) : (
        <Button onClick={() => setIsModalVisible(true)} type="primary">
          Add task
        </Button>
      )}
      <Modal
        title="Add a task"
        visible={isModalVisible}
        onCancel={hideModal}
        footer={[
          <Button key={`cancel-${uniqueId()}`} onClick={hideModal}>
            Cancel
          </Button>,
          <Button
            type="primary"
            form={`addTask${inHeader ? "Header" : ""}`}
            key="submit"
            htmlType="submit"
          >
            Add Task
          </Button>,
        ]}
      >
        <Form
          name={`addTask${inHeader ? "Header" : ""}`}
          onFinish={addTask}
          onFieldsChange={checkUrgent}
          labelCol={{ span: 3 }}
          initialValues={{ money: 0.25 }}
          ref={formRef}
        >
          <Form.Item label="Task" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Value" name="money" rules={[{ required: true }]}>
            <InputNumber
              prefix="$"
              min={0.25}
              step={0.25}
              max={5}
              controls={true}
            />
          </Form.Item>
          {showRepeatPerm && (
            <>
              <Form.Item name="repeatable" valuePropName="checked">
                <Checkbox>Repeatable</Checkbox>
              </Form.Item>
              <Form.Item name="permanent" valuePropName="checked">
                <Checkbox>Permanent</Checkbox>
              </Form.Item>
            </>
          )}
          {showUrgent && (
            <Form.Item name="urgent" valuePropName="checked">
              <Checkbox>Urgent</Checkbox>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default Add;
