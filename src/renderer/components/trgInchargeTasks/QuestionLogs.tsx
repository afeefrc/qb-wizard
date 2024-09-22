import React from 'react';
import { Table, Tag } from 'antd';
import { AppContext } from '../../context/AppContext';

function QuestionLogs(): React.ReactElement {
  const appContext = React.useContext(AppContext);
  const { questions } = appContext || {};

  // const sampleData = [
  //   {
  //     id: 'ADC/2024/005',
  //     question: 'What 4 + 4 = ?',
  //     action: 'Updated',
  //     date: '01-09-2024',
  //   },
  //   {
  //     id: 'ADC/2024/006',
  //     question: 'Question number?',
  //     action: 'Deleted',
  //     date: '01-09-2024',
  //   },
  //   {
  //     id: 'ADC/2024/007',
  //     question: 'What is the chemical symbol for gold?',
  //     action: 'Added',
  //     date: '01-09-2024',
  //   },
  //   {
  //     id: 'ADC/2024/008',
  //     question: 'What is the capital of France?',
  //     action: 'Added',
  //     date: '02-09-2024',
  //   },
  //   {
  //     id: 'ADC/2024/009',
  //     question: 'Who wrote "Romeo and Juliet"?',
  //     action: 'Updated',
  //     date: '02-09-2024',
  //   },
  //   {
  //     id: 'ADC/2024/010',
  //     question: 'What is the boiling point of water?',
  //     action: 'Deleted',
  //     date: '03-09-2024',
  //   },
  // ];

  const generateQuestionId = (
    unitName: string,
    year: number,
    serialNumber: number,
  ): string => {
    const paddedSerialNumber = serialNumber.toString().padStart(3, '0');
    return `${unitName}/${year}/${paddedSerialNumber}`;
  };

  const columns = [
    {
      title: 'Question ID',
      dataIndex: 'questionId',
      key: 'questionId',
      width: '10%',
      render: (questionId: string, record: any) => (
        <span>
          {generateQuestionId(
            record.unitName,
            record.year,
            record.serialNumber,
          )}
        </span>
      ),
    },
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      width: '35%',
      render: (question: string, record: any) => (
        <span
          style={{
            textDecoration: record.isDeleted === true ? 'line-through' : 'none',
          }}
        >
          {question}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '200px',
      }}
    >
      {/* <h2>Question Logs</h2> */}
      <Table
        dataSource={questions}
        columns={columns}
        style={{ width: '85%' }}
        pagination={{ pageSize: 50 }}
      />
    </div>
  );
}

export default QuestionLogs;
