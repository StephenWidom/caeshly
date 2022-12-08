import React, { useContext } from "react";
import { Tag as AntTag } from "antd";

import TagsContext from "../contexts/TagsContext";

import { getTagFromTask } from "../utils";

const Tag = ({ tagId }) => {
  const { tags } = useContext(TagsContext);
  const thisTag = getTagFromTask(tags, tagId);

  return !!thisTag && <AntTag color={thisTag.color}>{thisTag.name}</AntTag>;
};

export default Tag;
