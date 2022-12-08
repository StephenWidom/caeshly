import React, { useEffect, useRef, useContext } from "react";
import produce from "immer";
import { Modal, Button, Form, Input, Radio, message } from "antd";
import { uniqueId } from "lodash";

import TagsContext from "../contexts/TagsContext";

import { getNextArrId } from "../utils";

export const tagColors = {
  magenta: "#c41d7f",
  red: "#cf1322",
  volcano: "#d4380d",
  orange: "#d46b08",
  gold: "#d48806",
  lime: "#7cb305",
  green: "#389e0d",
  cyan: "#08979c",
  blue: "#096dd9",
  geekblue: "#1d39c4",
  purple: "#531dab",
};

const AddEditTagModal = (props) => {
  const {
    isTagModalVisible,
    tags,
    setTags,
    setTagModalVisibility,
    selectedTag,
    setTag,
  } = useContext(TagsContext);

  const formRef = useRef();

  useEffect(() => {
    if (formRef?.current && selectedTag) {
      const { name, color } = selectedTag;
      formRef?.current.setFieldsValue({
        name,
        color,
      });
    }
  }, [selectedTag]);

  const addEditTag = ({ name, color }) => {
    if (selectedTag) {
      // We're editing an existing tag
      const thisTagIndex = tags.findIndex((t) => t.id === selectedTag.id);
      if (thisTagIndex === -1) return message.error("Error editing tag");
      setTags(
        produce(tags, (draft) => {
          draft[thisTagIndex] = {
            id: selectedTag.id,
            name,
            color,
          };
        })
      );
    } else {
      const newTagId = getNextArrId(tags);
      const newTag = {
        id: newTagId,
        name,
        color,
      };
      setTags([...tags, newTag]);
    }
    resetAndHide();
  };

  const resetAndHide = () => {
    formRef?.current.resetFields();
    setTagModalVisibility(false);
    setTag(null);
  };

  return (
    <Modal
      open={isTagModalVisible}
      onCancel={() => setTagModalVisibility(false)}
      title="Add tag"
      footer={[
        <Button key={`cancel-${uniqueId()}`} onClick={resetAndHide}>
          Cancel
        </Button>,
        <Button type="primary" form="addTagForm" key="submit" htmlType="submit">
          {!!selectedTag ? "Update" : "Add"} Tag
        </Button>,
      ]}
      {...props}
    >
      <Form
        name="addTagForm"
        onFinish={addEditTag}
        ref={formRef}
        layout="vertical"
      >
        <Form.Item label="Tag name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Color" name="color">
          <Radio.Group>
            {Object.entries(tagColors).map((color) => (
              <Radio.Button
                value={color[0]}
                style={{ background: color[1] }}
                key={`tag-color-${color[0]}`}
              ></Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditTagModal;
