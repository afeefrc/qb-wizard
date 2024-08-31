import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Typography } from 'antd';
import { AppContext } from '../../context/AppContext';

const { Text } = Typography;

interface Question {
  id: string;
  questionText: string;
  marks: number;
  difficulty: string;
  bloomsLevel: string;
  status: 'Approved' | 'Rejected' | 'Pending';
}

interface QuestionBankApprovalTaskProps {
  unitName: string;
}

function QuestionBankApprovalTask({ unitName }: QuestionBankApprovalTaskProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const appContext = React.useContext(AppContext);
  const { getQuestionsByUnit, updateQuestionStatus } = appContext || {};

  useEffect(() => {
    if (getQuestionsByUnit) {
      const fetchedQuestions = getQuestionsByUnit(unitName);
      setQuestions(fetchedQuestions);
    }
  }, [unitName, getQuestionsByUnit]);

  const handleApprove = (question: Question) => {
    if (updateQuestionStatus) {
      updateQuestionStatus(question.id, 'Approved');
      setQuestions(
        questions.map((q) =>
          q.id === question.id ? { ...q, status: 'Approved' } : q,
        ),
      );
    }
  };

  const handleReject = (question: Question) => {
    if (updateQuestionStatus) {
      updateQuestionStatus(question.id, 'Rejected');
      setQuestions(
        questions.map((q) =>
          q.id === question.id ? { ...q, status: 'Rejected' } : q,
        ),
      );
    }
  };

  const showQuestionDetails = (question: Question) => {
    setSelectedQuestion(question);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      render: (text: string) => (
        <a
          onClick={() =>
            showQuestionDetails(questions.find((q) => q.questionText === text)!)
          }
        >
          {text.substring(0, 50)}...
        </a>
      ),
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
    },
    {
      title: "Bloom's Level",
      dataIndex: 'bloomsLevel',
      key: 'bloomsLevel',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Text
          type={
            status === 'Approved'
              ? 'success'
              : status === 'Rejected'
                ? 'danger'
                : 'warning'
          }
        >
          {status}
        </Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Question) => (
        <Space size="middle">
          <Button
            onClick={() => handleApprove(record)}
            disabled={record.status === 'Approved'}
          >
            Approve
          </Button>
          <Button
            onClick={() => handleReject(record)}
            disabled={record.status === 'Rejected'}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h3>Question Bank Approval for {unitName}</h3>
      <Table columns={columns} dataSource={questions} rowKey="id" />
      <Modal
        title="Question Details"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedQuestion && (
          <div>
            <p>
              <strong>Question:</strong> {selectedQuestion.questionText}
            </p>
            <p>
              <strong>Marks:</strong> {selectedQuestion.marks}
            </p>
            <p>
              <strong>Difficulty:</strong> {selectedQuestion.difficulty}
            </p>
            <p>
              <strong>Bloom's Level:</strong> {selectedQuestion.bloomsLevel}
            </p>
            <p>
              <strong>Status:</strong> {selectedQuestion.status}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default QuestionBankApprovalTask;
