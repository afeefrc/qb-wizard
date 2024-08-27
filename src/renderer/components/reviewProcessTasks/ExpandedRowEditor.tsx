import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Space } from 'antd';

interface ExpandedRowEditorProps {
  record: ColumnDataType;
  onSave: (updatedRecord: ColumnDataType) => void;
  onCancel: () => void;  // New prop for handling cancellation
}

function ExpandedRowEditor({ record, onSave, onCancel }: ExpandedRowEditorProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSave({ ...record, ...values });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();  // Call the onCancel prop to close the expansion
  };

  return (
    <div
      style={{
        // padding: '30px 10px',
        // border: '1px solid #e0e0e0',
        // backgroundColor: '#f0f0f0',
        width: '70%',
        margin: '0 auto', // Center horizontally
        display: 'flex',
        justifyContent: 'center', // Center content horizontally
        alignItems: 'center', // Center content vertically
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={record}
        onFinish={handleSubmit}
        style={{ width: '90%' }}
      >
        <Form.Item name="questionText" label="Question">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="answerText" label="Answer">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="marks" label="Marks">
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item name="questionType" label="Question Type">
          <Select>
            <Select.Option value="MCQ">MCQ</Select.Option>
            <Select.Option value="Short Answer">Short Answer</Select.Option>
            <Select.Option value="Long Answer">Long Answer</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="difficultyLevel" label="Difficulty Level">
          <Select>
            <Select.Option value="easy">Easy</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="hard">Hard</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export default ExpandedRowEditor;
