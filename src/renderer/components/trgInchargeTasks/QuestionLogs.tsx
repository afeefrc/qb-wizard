import React, { useState } from 'react';
import { Table, Tag } from 'antd';
import { format } from 'date-fns';
import { AppContext } from '../../context/AppContext';

function QuestionLogs(): React.ReactElement {
  const appContext = React.useContext(AppContext);
  const { questions } = appContext || {};

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null,
  );

  const toggleExpand = (questionId: string) => {
    setExpandedQuestionId((prev) => (prev === questionId ? null : questionId));
  };

  const generateQuestionId = (
    unitName: string,
    year: number,
    serialNumber: number,
  ): string => {
    const paddedSerialNumber = serialNumber.toString().padStart(3, '0');
    return `${unitName}.${year}.${paddedSerialNumber}`;
  };

  const handleClick = (record) => {
    // Define the function logic here
    console.log(record);
  };

  const columns = [
    {
      title: 'Question ID',
      dataIndex: 'questionId',
      key: 'questionId',
      width: '10%',
      render: (questionId: string, record: any) => (
        <span style={{ fontWeight: 500 }}>
          {generateQuestionId(
            record.unitName,
            record.year,
            record.serialNumber,
          )}
        </span>
      ),
      sorter: (a: any, b: any) => {
        if (a.year !== b.year) {
          return b.year - a.year; // Sort by year descending
        }
        return b.serialNumber - a.serialNumber; // Then by serialNumber descending
      },
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Unit',
      dataIndex: 'unitName',
      key: 'unitName',
      width: '8%',
      filters: questions
        ? Array.from(new Set(questions.map((q) => q.unitName))).map(
            (unitName) => ({ text: unitName, value: unitName }),
          )
        : [],
      onFilter: (value: string, record: any) => record.unitName === value,
    },
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      width: '35%',
      render: (question: string, record: any) => {
        const questionId = generateQuestionId(
          record.unitName,
          record.year,
          record.serialNumber,
        );
        const isExpanded = expandedQuestionId === questionId;
        return (
          <span
            role="button"
            tabIndex={0}
            onClick={() => toggleExpand(questionId)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Call the same function as the click handler
                handleClick(record);
              }
            }}
            style={{
              fontSize: '15px',
              textDecoration:
                record.isDeleted === true || record.isLatestVersion === false
                  ? 'line-through'
                  : 'none',
              display: 'inline-block',
              maxWidth: isExpanded ? 'none' : '350px', // Adjust the width as needed
              whiteSpace: isExpanded ? 'normal' : 'nowrap',
              overflow: isExpanded ? 'visible' : 'hidden',
              textOverflow: isExpanded ? 'clip' : 'ellipsis',
              cursor: 'pointer',
            }}
            title={question} // This will show the full text on hover
          >
            {question}
          </span>
        );
      },
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string | undefined) => {
        if (!createdAt) {
          return '';
        }
        const date = new Date(createdAt);
        return format(date, 'dd.MM.yyyy');
      },
      width: '15%',
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      filters: [
        { text: 'Deleted', value: 'Deleted' },
        { text: 'Updated', value: 'Updated' },
        { text: 'Active', value: 'Active' },
      ],
      onFilter: (value: string, record: any) => {
        if (value === 'Deleted') {
          return record.isDeleted;
        }
        if (value === 'Updated') {
          return !record.isDeleted && !record.isLatestVersion;
        }
        if (value === 'Active') {
          return !record.isDeleted && record.isLatestVersion;
        }
        return false;
      },
      render: (text: string, record: any) => {
        const tagStyle = { fontSize: '14px', padding: '0px 15px' }; // Adjust the font size as needed

        if (record.isDeleted) {
          return (
            <Tag color="red" style={tagStyle}>
              Deleted
            </Tag>
          );
        }
        if (!record.isLatestVersion) {
          return (
            <Tag color="orange" style={tagStyle}>
              Updated
            </Tag>
          );
        }
        return (
          <Tag color="green" style={tagStyle}>
            Active
          </Tag>
        );
      },
      width: '10%',
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      // TODO: Add remarks column. for deleted questions, it should have deleted date.
      // for updated questions, it should have updated date.
      // else it should have empty string.
      render: (text: string, record: any) => {
        if (record.isDeleted) {
          return `Deleted on ${format(new Date(record.deletedAt), 'dd.MM.yyyy')}`;
        }
        if (!record.isLatestVersion) {
          return record.updatedAt
            ? `Replaced with new question on ${format(new Date(record.updatedAt), 'dd.MM.yyyy')}`
            : 'Replaced with new question';
        }
        return '';
      },
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
