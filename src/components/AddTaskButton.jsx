import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const AddEditTaskButton = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      shape="circle"
      type="primary"
      icon={<PlusOutlined />}
    />
  );
};

export default AddEditTaskButton;
