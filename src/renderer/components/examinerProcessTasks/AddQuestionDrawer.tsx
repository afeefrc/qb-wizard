import React, { useState, useEffect, useContext } from 'react';
import { Drawer, Collapse, Table, Button, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { renderAnswerKey } from '../utils/tableRenderers';
import { AppContext } from '../../context/AppContext';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface Question {
  id: string;
  questionText: string;
  answerText: string;
  questionType: string;
  answerList: string[];
  marks: number;
  syllabusSectionId: string;
}

interface AddQuestionDrawerProps {
  visible: boolean;
  onClose: () => void;
  // availableQuestions: any[];
  onAddQuestions: (selectedQuestionIds: string[]) => void;
  currentSectionId: string;
  currentQuestionPaper: Question[];
  currentSectionTitle: string;
}

function AddQuestionDrawer({
  visible,
  onClose,
  onAddQuestions,
  currentSectionId,
  currentQuestionPaper,
  currentSectionTitle,
}: AddQuestionDrawerProps) {
  const { activeQuestions, syllabusSections } = useContext(AppContext);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  // const [groupedQuestions, setGroupedQuestions] = useState<any[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Create a set of IDs from currentQuestionPaper for efficient lookup
    const currentQuestionIds = new Set(currentQuestionPaper.map((q) => q.id));

    // Filter activeQuestions based on currentSectionId and exclude those already in currentQuestionPaper
    const filtered = activeQuestions.filter(
      (question) =>
        question.syllabusSectionId === currentSectionId &&
        !currentQuestionIds.has(question.id),
    );

    setFilteredQuestions(filtered);
  }, [activeQuestions, currentSectionId, currentQuestionPaper]);

  const columns = [
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: 'Answer Key',
      dataIndex: 'answerText',
      key: 'answerText',
      render: renderAnswerKey,
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
    },
    {
      title: 'Type',
      dataIndex: 'questionType',
      key: 'questionType',
    },
  ];

  const rowSelection = {
    type: 'checkbox' as const,
    selectedRowKeys: selectedQuestions,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedQuestions(selectedRowKeys as string[]);
    },
  };

  const handleAddQuestions = () => {
    // console.log(selectedQuestions);
    onAddQuestions(selectedQuestions);
    onClose();
    setSelectedQuestions([]);
  };
  const handleCancel = () => {
    onClose();
    setSelectedQuestions([]);
  };

  return (
    <Drawer
      title="Add Questions to Section"
      placement="right"
      onClose={onClose}
      visible={visible}
      width={800}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          // justifyContent: 'flex-start',
        }}
      >
        <Title level={5}>{currentSectionTitle}</Title>
        <Text type="secondary" style={{ marginBottom: 16 }}>
          Select questions to add to this section.
        </Text>
      </div>
      <Table
        dataSource={filteredQuestions}
        columns={columns}
        rowKey="id"
        size="small"
        // pagination={{ pageSize: 10 }}
        pagination={false}
        rowSelection={rowSelection}
      />
      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleAddQuestions}
          style={{ marginTop: 16 }}
          disabled={selectedQuestions.length === 0}
        >
          Add Selected Questions
        </Button>
        <Button onClick={handleCancel} style={{ marginTop: 16 }}>
          Cancel
        </Button>
      </div>
    </Drawer>
  );
}

export default AddQuestionDrawer;
