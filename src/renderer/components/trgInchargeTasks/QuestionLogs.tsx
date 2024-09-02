import React from 'react';
import { Table, Tag } from 'antd';

function QuestionLogs(): React.ReactElement {
  const sampleData = [
    {
      id: 'ADC/2024/005',
      question: 'What 4 + 4 = ?',
      action: 'Updated',
      date: '01-09-2024',
    },
    {
      id: 'ADC/2024/006',
      question: 'Question number?',
      action: 'Deleted',
      date: '01-09-2024',
    },
    {
      id: 'ADC/2024/007',
      question: 'What is the chemical symbol for gold?',
      action: 'Added',
      date: '01-09-2024',
    },
    {
      id: 'ADC/2024/008',
      question: 'What is the capital of France?',
      action: 'Added',
      date: '02-09-2024',
    },
    {
      id: 'ADC/2024/009',
      question: 'Who wrote "Romeo and Juliet"?',
      action: 'Updated',
      date: '02-09-2024',
    },
    {
      id: 'ADC/2024/010',
      question: 'What is the boiling point of water?',
      action: 'Deleted',
      date: '03-09-2024',
    },
  ];

  const columns = [
    {
      title: 'Question ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      width: '35%',
      render: (question: string, record: any) => (
        <span
          style={{
            textDecoration:
              record.action === 'Deleted' ? 'line-through' : 'none',
          }}
        >
          {question}
        </span>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag
          color={
            action === 'Updated'
              ? 'blue'
              : action === 'Deleted'
                ? 'red'
                : 'green'
          }
          style={{ fontSize: '14px', width: '75px' }}
        >
          {action.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      {/* <h2>Question Logs</h2> */}
      <Table
        dataSource={sampleData}
        columns={columns}
        style={{ width: '85%' }}
      />
    </div>
  );
}

export default QuestionLogs;
