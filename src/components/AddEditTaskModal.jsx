import React, { useState, useEffect, useRef, useContext } from "react";
import produce from "immer";
import {
  Modal,
  Button,
  Form,
  InputNumber,
  Input,
  Space,
  Checkbox,
  message,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { uniqueId } from "lodash";

import TasksContext from "../contexts/TasksContext";
import TagsContext from "../contexts/TagsContext";
import DaysContext from "../contexts/DaysContext";
import DateContext from "../contexts/DateContext";

import { getNextArrId } from "../utils";

const AddEditTaskModal = (props) => {
  const [selectedTags, setSelectedTags] = useState([]);

  const {
    tasks,
    setTasks,
    selectedTask,
    isAddTaskModalVisible,
    setAddModalVisibility,
    setTask,
  } = useContext(TasksContext);
  const { tags, setTagModalVisibility } = useContext(TagsContext);
  const [days, setDays] = useContext(DaysContext);
  const [date] = useContext(DateContext);

  const formRef = useRef();
  const { CheckableTag } = Tag;

  useEffect(() => {
    if (formRef.current && selectedTask) {
      const { name, money, permanent, repeatable, urgent } = selectedTask;
      formRef?.current.setFieldsValue({
        name,
        money,
        permanent,
        repeatable,
        urgent,
      });
      setSelectedTags(selectedTask?.tags);
    }
  }, [selectedTask]);

  const addEditTask = ({ name, money, repeatable, permanent, urgent }) => {
    if (selectedTask) {
      // We're editing an existing task
      const thisTaskIndex = tasks.findIndex((t) => t.id === selectedTask.id);
      if (thisTaskIndex === -1) return message.error("Error editing task");

      setTasks(
        produce(tasks, (draft) => {
          draft[thisTaskIndex] = {
            id: selectedTask.id,
            name,
            money,
            repeatable: !!repeatable,
            permanent: !!permanent,
            urgent: !!urgent,
            tags: selectedTags,
            subtasks: [],
          };
        })
      );
    } else {
      // We're adding a task
      const newTaskId = getNextArrId(tasks);
      const newTask = {
        id: newTaskId,
        name,
        money,
        repeatable: !!repeatable,
        permanent: !!permanent,
        urgent: !!urgent,
        tags: selectedTags,
        subtasks: [],
      };

      // Add new task to the tasks array
      setTasks([...tasks, newTask]);

      // Now we have to add this task ID to each relevant day
      if (permanent) {
        setDays(
          days.map((day) => ({
            ...day,
            dailyTasks: [...day.dailyTasks, { taskId: newTaskId, done: 0 }],
          }))
        );
      } else {
        setDays(
          produce(days, (draft) => {
            const todayIndex = days.findIndex((d) => d.date === date);
            if (todayIndex !== -1)
              draft[todayIndex].dailyTasks.push({ taskId: newTaskId, done: 0 });
          })
        );
      }
    }

    resetAndHide();
    message.success(`Task ${!!selectedTask ? "updated" : "added"}!`);
  };

  const handleTagCheck = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const resetAndHide = () => {
    setTask(null);
    formRef?.current.resetFields();
    setSelectedTags([]);
    setAddModalVisibility(false);
  };

  return (
    <Modal
      title={selectedTask ? "Edit task" : "Add task"}
      onCancel={resetAndHide}
      footer={[
        <Button key={`cancel-${uniqueId()}`} onClick={resetAndHide}>
          Cancel
        </Button>,
        <Button
          type="primary"
          form="addTaskForm"
          key="submit"
          htmlType="submit"
        >
          {!!selectedTask ? "Update" : "Add"} Task
        </Button>,
      ]}
      open={isAddTaskModalVisible}
      {...props}
    >
      <Form
        name="addTaskForm"
        onFinish={addEditTask}
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
        <Form.Item name="repeatable" valuePropName="checked">
          <Checkbox>Repeatable</Checkbox>
        </Form.Item>
        <Form.Item name="permanent" valuePropName="checked">
          <Checkbox>Permanent</Checkbox>
        </Form.Item>
        <Form.Item name="urgent" valuePropName="checked">
          <Checkbox>Urgent</Checkbox>
        </Form.Item>
        <>
          <Typography.Title level={5}>Tags</Typography.Title>
          {!!tags?.length ? (
            <Space wrap>
              {tags.map(({ name, id, color }) => (
                <CheckableTag
                  key={name}
                  color={color}
                  checked={selectedTags.includes(id)}
                  onChange={() => handleTagCheck(id)}
                >
                  {name}
                </CheckableTag>
              ))}
              <Button
                size="small"
                type="ghost"
                icon={<PlusOutlined />}
                onClick={() => setTagModalVisibility(true)}
              />
            </Space>
          ) : (
            <Typography>No tags.</Typography>
          )}
        </>
      </Form>
    </Modal>
  );
};

export default AddEditTaskModal;
