import React, { useContext } from 'react';
import {
  Typography,
  Button,
  Form,
  Input,
  Select,
  Space,
  List,
  Empty,
} from 'antd';
import { SendOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

const { Text } = Typography;

interface QuestionFeedbackSectionProps {
  form: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  questionId: string;
  onDeleteComment: (commentId: string) => void;
  canDeleteComment: boolean;
}

function QuestionFeedbackSection({
  form,
  onSubmit,
  onCancel,
  questionId,
  onDeleteComment,
  canDeleteComment = false,
}: QuestionFeedbackSectionProps) {
  const appContext = useContext(AppContext);
  const { examiners, feedback } = appContext || {};
  // function to get examiner info
  const getExaminerInfo = (examinerId: string) => {
    const examiner = examiners?.find((e) => e.id === examinerId);
    return examiner
      ? `${examiner.examinerName}, ${examiner.examinerDesignation} (ATM)`
      : examinerId;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '0px 100px',
      }}
    >
      <div style={{ width: '40%' }}>
        <List
          dataSource={feedback.questionComment.filter(
            (comment: any) => comment.questionId === questionId,
          )}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>No feedback available for this question.</span>
                }
              />
            ),
          }}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                canDeleteComment && (
                  <Button
                    type="primary"
                    danger
                    ghost
                    icon={<DeleteOutlined />}
                    onClick={() => onDeleteComment(item.id)}
                    size="small"
                    style={{ boxShadow: 'none' }}
                  >
                    Clear
                  </Button>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                description={
                  <>
                    <Text style={{ fontSize: '16px', fontWeight: 400 }}>
                      {item.comment}
                    </Text>
                    {item.tags && item.tags.length > 0 && (
                      <>
                        <br />
                        <Text type="secondary">
                          Tags: {item.tags.join(', ')}
                        </Text>
                      </>
                    )}
                    <br />
                    <Text>{getExaminerInfo(item.examinerId)}</Text>
                    <br />
                    <Text type="secondary">
                      {new Date(item.commentTime).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </div>
      <Form
        form={form}
        onFinish={onSubmit}
        style={{ marginTop: '5px', width: '40%' }}
      >
        <Form.Item
          name="examiner"
          rules={[{ required: true, message: 'Please select your name!' }]}
        >
          <Select placeholder="Select your name">
            {examiners?.map((examiner) => (
              <Select.Option key={examiner.id} value={examiner.id}>
                {examiner.examinerName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="comment"
          rules={[{ required: true, message: 'Please input your comment!' }]}
        >
          <Input.TextArea rows={2} placeholder="Enter your comment" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
              Submit Comment
            </Button>
            <Button onClick={onCancel} icon={<CloseOutlined />}>
              Close
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export default QuestionFeedbackSection;
