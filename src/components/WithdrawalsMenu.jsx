import React, { useContext, useRef, useState } from "react";
import produce from "immer";
import {
  Drawer,
  Typography,
  Button,
  Form,
  List,
  Modal,
  message,
  Input,
  InputNumber,
} from "antd";
import uniqueId from "lodash/uniqueId";

import { AlignRight } from "./Layout";

import CashContext from "../contexts/CashContext";
import WithdrawalsContext from "../contexts/WithdrawalsContext";
import DateContext from "../contexts/DateContext";

import { formatAsCash, formatAsDate } from "../utils";

const WithdrawalsMenu = ({ open, closeDrawer, closeMenu }) => {
  const [cash, setCash] = useContext(CashContext);
  const [withdrawals, setWithdrawals] = useContext(WithdrawalsContext);
  const [, setDate] = useContext(DateContext);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const formRef = useRef();

  const resetAndHide = () => {
    if (formRef?.current) formRef.current.resetFields();
    setIsModalVisible(false);
  };

  const withdrawCash = ({ money, note }) => {
    setCash(
      produce(cash, (draft) => {
        draft.current -= money;
      })
    );

    const withdrawal = {
      date: new Date().toLocaleDateString(),
      amount: money,
      note,
    };
    setWithdrawals(
      produce(withdrawals, (draft) => {
        draft.unshift(withdrawal);
      })
    );
    message.success("Withdrawal made!");
    resetAndHide();
  };

  const goToDate = (date) => {
    setDate(date);
    closeDrawer();
    closeMenu();
  };

  return (
    <Drawer
      open={open}
      onClose={closeDrawer}
      title="Withdrawals"
      extra={
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Withdraw
        </Button>
      }
    >
      <List
        size="small"
        header={
          <Typography.Title level={5}>
            Total available:{" "}
            <AlignRight>{formatAsCash(cash.current)}</AlignRight>
          </Typography.Title>
        }
        dataSource={withdrawals}
        renderItem={(w) => (
          <li
            className="ant-list-item"
            // antd's List.Item is undefined. No idea why
            key={`w-${uniqueId()}`}
          >
            {/* List.Item.Meta also undefined now */}
            <div className="ant-list-item-meta">
              <div className="ant-list-item-meta-content">
                <Typography.Text underline onClick={() => goToDate(w.date)}>
                  {formatAsDate(w.date)}
                </Typography.Text>
                <div className="ant-list-item-meta-description">{w.note}</div>
              </div>
            </div>
            <AlignRight>
              <Typography.Text>{formatAsCash(w.amount)}</Typography.Text>
            </AlignRight>
          </li>
        )}
      />
      <Modal
        open={isModalVisible}
        title="Withdraw cash"
        onCancel={resetAndHide}
        footer={[
          <Button onClick={resetAndHide} key={`cw${uniqueId()}`}>
            Cancel
          </Button>,
          <Button
            type="primary"
            form="withdrawForm"
            key="submit"
            htmlType="submit"
          >
            Withdraw
          </Button>,
        ]}
      >
        <Form
          name="withdrawForm"
          labelCol={{ span: 3 }}
          ref={formRef}
          onFinish={withdrawCash}
        >
          <Form.Item label="Value" name="money" rules={[{ required: true }]}>
            <InputNumber
              prefix="$"
              min={0.25}
              autoFocus={true}
              step={0.25}
              max={cash.current}
            />
          </Form.Item>
          <Form.Item label="Note" name="note">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};

export default WithdrawalsMenu;
