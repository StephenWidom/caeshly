import React, { useContext } from "react";
import produce from "immer";
import styled from "styled-components";
import { Drawer, Space, Typography, Button, Popconfirm, List } from "antd";
import { DeleteFilled, EditOutlined } from "@ant-design/icons";

import { tagColors } from "./AddEditTagModal";
import { AlignRight } from "./Layout";

import TagsContext from "../contexts/TagsContext";
import TasksContext from "../contexts/TasksContext";

const StyledListItem = styled.li`
  border-right: 1px solid;
  border-left: 8px solid;
  padding: 12px;
  border-color: ${(props) => `${props.$tagColor}`};
`;

const TagsMenu = ({ open, closeDrawer }) => {
  const { tags, setTags, setTagModalVisibility, setTag } =
    useContext(TagsContext);
  const { tasks, setTasks } = useContext(TasksContext);

  const deleteTag = (tagId) => {
    setTasks(
      produce(tasks, (draft) => {
        tasks.forEach((task, index) => {
          const thisTagIndex = task?.tags.findIndex((tag) => tag === tagId);
          if (thisTagIndex !== -1) {
            draft[index].tags.splice(thisTagIndex, 1);
          }
        });
      })
    );
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  const editThisTag = (tag) => {
    setTag(tag);
    setTagModalVisibility(true);
  };

  const getTagColorHex = (thisTagColor) => tagColors[thisTagColor];

  return (
    <Drawer
      open={open}
      onClose={closeDrawer}
      title="Tags"
      extra={[
        <Button
          key="addtagbutton-1"
          type="primary"
          onClick={() => setTagModalVisibility(true)}
        >
          Add tag
        </Button>,
      ]}
    >
      {!!tags?.length ? (
        <List
          dataSource={tags}
          renderItem={(tag) => (
            <StyledListItem
              className="ant-list-item ant-list-item-no-flex"
              // antd's List.Item is undefined. No idea why
              key={`tag-${tag.id}`}
              $tagColor={getTagColorHex(tag.color)}
            >
              <Typography.Text>{tag.name}</Typography.Text>
              <AlignRight>
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => editThisTag(tag)}
                  />
                  <Popconfirm
                    title="Delete this tag?"
                    onConfirm={() => deleteTag(tag.id)}
                  >
                    <Button danger={true} icon={<DeleteFilled />}></Button>
                  </Popconfirm>
                </Space>
              </AlignRight>
            </StyledListItem>
          )}
        />
      ) : (
        <>No tags, bruh</>
      )}
    </Drawer>
  );
};

export default TagsMenu;
