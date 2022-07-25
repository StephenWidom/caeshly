import React from "react";
import { Button } from "antd";
import { UpOutlined } from "@ant-design/icons";

const BackToTop = () => {
  const returnToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return <Button onClick={returnToTop} icon={<UpOutlined />} />;
};

export default BackToTop;
