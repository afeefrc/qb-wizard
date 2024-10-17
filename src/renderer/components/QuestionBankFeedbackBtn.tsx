import React, { useState, useContext } from 'react';
import { Button, Modal, Form, Input, Select, Space } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

const { Option } = Select;

interface Examiner {
  id: string;
  examinerName: string;
  examinerDesignation: string;
}

function QuestionBankFeedbackBtn({
  unitName,
  buttonText = 'Add Feedback / Suggestions to Question Bank',
}: {
  unitName: string;
  buttonText: string;
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const appContext = useContext(AppContext);
  const { examiners, handleAddComment, feedback } = appContext || {};
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values: {
    examinerId: string;
    unit: string;
    comment: string;
  }) => {
    const newComment = {
      examinerId: values.examinerId,
      unit: unitName,
      comment: values.comment,
    };
    console.log('newComment', newComment);
    handleAddComment?.('questionBankComments', newComment);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <Button
        type="primary"
        ghost
        icon={<CommentOutlined />}
        onClick={showModal}
      >
        {buttonText}
      </Button>
      <Modal
        title="Add Feedback to Question Bank"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <div>
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item
              name="examinerId"
              rules={[{ required: true, message: 'Please select an examiner' }]}
            >
              <Select placeholder="Select your name">
                {examiners?.map((examiner: Examiner) => (
                  <Option key={examiner.id} value={examiner.id}>
                    {`${examiner.examinerName}, ${examiner.examinerDesignation} (ATM)`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="comment"
              rules={[
                { required: true, message: 'Please enter your feedback' },
              ]}
            >
              <Input.TextArea rows={4} placeholder="Enter your feedback here" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Submit Feedback
                </Button>
                <Button
                  type="primary"
                  htmlType="button"
                  ghost
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                {/* TODO: Add a button to navigate to the feedback page */}
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default QuestionBankFeedbackBtn;
