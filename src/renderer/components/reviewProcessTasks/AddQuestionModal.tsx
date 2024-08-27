import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button } from 'antd';

interface AddQuestionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  visible,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Add New Question"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="questionText"
          label="Question"
          rules={[{ required: true }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="answerText"
          label="Answer"
          rules={[{ required: true }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="marks" label="Marks" rules={[{ required: true }]}>
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name="questionType"
          label="Question Type"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="MCQ">MCQ</Select.Option>
            <Select.Option value="Short Answer">Short Answer</Select.Option>
            <Select.Option value="Long Answer">Long Answer</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="difficultyLevel"
          label="Difficulty Level"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="easy">Easy</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="hard">Hard</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddQuestionModal;
