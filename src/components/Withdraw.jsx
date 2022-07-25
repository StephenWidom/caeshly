import React, { useContext, useState, useRef } from "react";
import produce from "immer";
import { uniqueId } from "lodash";
import { Modal, Button, Form, InputNumber, Input, message } from "antd";

import CashContext from "../contexts/CashContext";
import WithdrawalsContext from "../contexts/WithdrawalsContext";

import { formatAsCash } from "../utils";

const Withdraw = () => {
  const [cash, setCash] = useContext(CashContext);
  const [withdrawals, setWithDrawals] = useContext(WithdrawalsContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const formRef = useRef();

  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  const WithdrawMessage = () => {
    message.info("Withdrawal made");
  };

  const withdrawCash = ({ money, note }) => {
    setCash(
      produce(cash, (draft) => {
        draft.current -= money;
      })
    );
    formRef.current?.resetFields();
    hideModal();

    const withdrawal = {
      date: new Date(),
      amount: money,
      note,
    };
    setWithDrawals(
      produce(withdrawals, (draft) => {
        draft.unshift(withdrawal);
      })
    );
    WithdrawMessage();
  };

  return (
    <>
      <Button onClick={showModal} type="primary">
        Withdraw Cash
      </Button>
      <Modal
        visible={isModalVisible}
        title={`Available cash: ${formatAsCash(cash.current)}`}
        onCancel={hideModal}
        footer={[
          <Button onClick={hideModal} key={`cw${uniqueId()}`}>
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
    </>
  );
};

export default Withdraw;
