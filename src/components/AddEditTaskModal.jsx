import React, { useState, useEffect, useRef, useContext } from "react";
import produce from "immer";
import styled from "styled-components";
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
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { uniqueId, differenceBy } from "lodash";

import TasksContext from "../contexts/TasksContext";
import TagsContext from "../contexts/TagsContext";
import DaysContext from "../contexts/DaysContext";
import DateContext from "../contexts/DateContext";
import SubtasksContext from "../contexts/SubtasksContext";

import { formatAsCash, getNextArrId, getSubtask } from "../utils";

const StyledModal = styled(Modal)`
  & .ant-form-item {
    margin-bottom: 15px;
  }
  & h5 {
    margin: 15px 0;
  }

  & .ant-typography button {
    margin-left: 5px;
  }
`;

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
  const {
    subtasks,
    setSubtasks,
    setSubtaskModalVisibility,
    setCurrentSubtasks,
    selectedSubtasks,
  } = useContext(SubtasksContext);

  const formRef = useRef();
  const { CheckableTag } = Tag;

  useEffect(() => {
    if (formRef.current && selectedTask) {
      const {
        name,
        money,
        permanent,
        repeatable,
        urgent,
        tags,
        subtasks: editingSubtasks,
      } = selectedTask;
      formRef?.current.setFieldsValue({
        name,
        money,
        permanent,
        repeatable,
        urgent,
      });
      setSelectedTags(tags);
      setCurrentSubtasks(
        editingSubtasks.map((subtaskId) => getSubtask(subtaskId, subtasks))
      );
    }
  }, [selectedTask]);

  const addEditTask = ({ name, money, repeatable, permanent, urgent }) => {
    if (selectedTask) {
      // We're editing an existing task
      const thisTaskIndex = tasks.findIndex((t) => t.id === selectedTask.id);
      if (thisTaskIndex === -1) return message.error("Error editing task");

      // Get subtasks that aren't already in subtasks array
      const subtasksToBeCreated = differenceBy(
        selectedSubtasks,
        subtasks,
        "id"
      );
      setSubtasks([...subtasks, ...subtasksToBeCreated]);

      const subtasksToAdd = subtasksToBeCreated.map((s) => ({
        subtaskId: s.id,
        done: 0,
      }));

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
            subtasks: selectedSubtasks.map((s) => s.id),
          };
        })
      );

      if (permanent) {
        setDays(
          days.map((day) => ({
            ...day,
            dailySubtasks: [...day.dailySubtasks, ...subtasksToAdd],
          }))
        );
      } else {
        setDays(
          produce(days, (draft) => {
            const todayIndex = days.findIndex((d) => d.date === date);
            if (todayIndex !== -1)
              draft[todayIndex].dailySubtasks.push(...subtasksToAdd);
          })
        );
      }
    } else {
      const thisTaskSubtasks = !!selectedSubtasks.length
        ? selectedSubtasks.map((s) => s.id)
        : [];
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
        subtasks: thisTaskSubtasks,
      };

      // Add subtasks
      setSubtasks([...subtasks, ...selectedSubtasks]);

      // Mapped for daily tracking of completion
      const subtasksToAdd = selectedSubtasks.map((s) => ({
        subtaskId: s.id,
        done: 0,
      }));

      // Add new task to the tasks array
      setTasks([...tasks, newTask]);

      // Now we have to add this task ID to each relevant day
      if (permanent) {
        setDays(
          days.map((day) => ({
            ...day,
            dailyTasks: [...day.dailyTasks, { taskId: newTaskId, done: 0 }],
            dailySubtasks: [...day.dailySubtasks, ...subtasksToAdd],
          }))
        );
      } else {
        setDays(
          produce(days, (draft) => {
            const todayIndex = days.findIndex((d) => d.date === date);
            if (todayIndex !== -1) {
              draft[todayIndex].dailyTasks.push({ taskId: newTaskId, done: 0 });
              draft[todayIndex].dailySubtasks.push(...subtasksToAdd);
            }
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
    setCurrentSubtasks([]);
    setAddModalVisibility(false);
  };

  const removeSubtask = (subtaskId) => {
    setCurrentSubtasks(selectedSubtasks.filter((s) => s.id !== subtaskId));
    if (subtasks.some((s) => s.id === subtaskId)) {
      // If the subtask exists in the subtask array
      setSubtasks(subtasks.filter((s) => s.id !== subtaskId));
      // Remove it
    }
    if (selectedTask) {
      const thisTaskIndex = tasks.findIndex((t) => t.id === selectedTask.id);
      if (thisTaskIndex === -1) return message.error("Error editing task");
      setTasks(
        produce(tasks, (draft) => {
          draft[thisTaskIndex].subtasks = draft[thisTaskIndex].subtasks.filter(
            (s) => s !== subtaskId
          );
        })
      );
    }
    message.error("Deleted subtask");
  };

  return (
    <StyledModal
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
        <>
          <Typography.Title level={5}>Subtasks</Typography.Title>
          {!!selectedSubtasks?.length && (
            <>
              {selectedSubtasks.map((s) => (
                <Typography.Paragraph key={`subtask-${s.id}`}>
                  {s.name} ({formatAsCash(s.money)})
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    danger={true}
                    size="small"
                    onClick={() => removeSubtask(s.id)}
                  />
                </Typography.Paragraph>
              ))}
            </>
          )}
          <Button onClick={() => setSubtaskModalVisibility(true)} size="small">
            Add subtask
          </Button>
        </>
      </Form>
    </StyledModal>
  );
};

export default AddEditTaskModal;
