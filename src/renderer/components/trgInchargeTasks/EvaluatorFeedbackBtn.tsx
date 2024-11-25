import React, { useState, useContext } from 'react';
import { Button, Modal, Form, Select, Input, Divider, List } from 'antd';
import { AppContext } from '../../context/AppContext';
import { useUser } from '../../context/UserContext';

const { Option } = Select;
const { TextArea } = Input;

interface EvaluatorFeedbackBtnProps {
  examinerAssignmentId: string;
}

function EvaluatorFeedbackBtn({
  examinerAssignmentId,
}: EvaluatorFeedbackBtnProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const appContext = useContext(AppContext);
  const { user } = useUser();
  const { feedback, handleAddComment, handleDeleteComment, examiners } =
    appContext;
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values: { examiner: string; comment: string }) => {
    const { examiner, comment } = values;
    if (examiner && comment) {
      handleAddComment('questionPaperComments', {
        examinerId: examiner,
        comment,
        examinerAssignmentId,
      });
      setIsModalVisible(false);
      form.resetFields(); // Reset the form fields after submission
    }
  };

  const getExaminerName = (examinerId: string) => {
    const examiner = examiners?.find((examiner) => examiner.id === examinerId);
    return examiner
      ? `${examiner.examinerName} ${examiner.examinerDesignation} (ATM)`.trim()
      : examinerId;
  };

  return (
    <>
      <Button
        onClick={showModal}
        style={{ padding: '20px', borderRadius: '10px' }}
      >
        Feedback
      </Button>
      <Modal
        title="Add Evaluator Feedback"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item name="examiner" label="Examiner">
            <Select placeholder="Select your name">
              {examiners?.map((examiner) => (
                <Option key={examiner.id} value={examiner.id}>
                  {getExaminerName(examiner.id)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="comment" label="Feedback">
            <TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
        <Divider>Question Paper Feedbacks</Divider>
        <List
          dataSource={(feedback?.questionPaperComments || []).filter(
            (comment) => comment.examinerAssignmentId === examinerAssignmentId,
          )}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                user?.role === 'trgIncharge' && (
                  <Button
                    onClick={() =>
                      handleDeleteComment('questionPaperComments', item.id)
                    }
                    type="link"
                    danger
                  >
                    Delete
                  </Button>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={getExaminerName(item.examiner)}
                description={item.comment}
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
}

export default EvaluatorFeedbackBtn;
