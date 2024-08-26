import React, { useContext, useMemo } from 'react';
import { Button, Table, Collapse } from 'antd';
import { AppContext } from '../../context/AppContext';

interface QuestionBankEditTaskProps {
  unitName: string;
}

const sampleData = {
  type: 'update',
  data: {
    unitName: 'ADC',
    marks: 1,
    questionType: 'MCQ',
    syllabusSectionId: '03a02c8e-79bd-4544-926e-30a291ecfa96',
    questionText: 'What is the square root of 144?',
    answerText: '12',
    mandatory: true,
    difficultyLevel: 'medium',
    moduleNumber: 1,
    comments: 'This is a sample comment',
    isDeleted: false,
    isReviewed: false,
  },
};

function QuestionBankEditTask({
  unitName = '',
}: QuestionBankEditTaskProps): React.ReactElement {
  const appContext = useContext(AppContext);
  const {
    questions,
    handleAddPendingChange,
    pendingChanges,
    handleAddQuestion,
    handleApplyPendingChange,
    syllabusSections,
  } = appContext || {};

  // Filter syllabusSections by unitName
  const filteredSyllabusSections = useMemo(() => {
    return (
      syllabusSections?.filter((section) => section.unitName === unitName) || []
    );
  }, [syllabusSections, unitName]);

  console.log('pendingChanges', pendingChanges);
  console.log('questions', questions);
  console.log('syllabusSections', filteredSyllabusSections);

  const handleAddSampleData = () => {
    handleAddQuestion(sampleData.data);
  };

  const handleUpdateQuestions = () => {
    handleApplyPendingChange(pendingChanges[0].id);
  };

  const columns = [
    {
      title: 'S.No.',
      dataIndex: (record: any) =>
        `${record.unitName}/${record.year}/${record.serialNumber.toString().padStart(3, '0')}`,
      render: (text: any, record: any) =>
        `${record.unitName}/${record.year}/${record.serialNumber.toString().padStart(3, '0')}`,
      key: 'serialNumber',
      width: '15%',
    },
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      width: '40%',
    },
    {
      title: 'Answer key',
      dataIndex: 'answerText',
      key: 'answerText',
      width: '30%',
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
      width: '5%',
    },
    {
      title: 'Question Type',
      dataIndex: 'questionType',
      key: 'questionType',
      width: '10%',
    },
    {
      title: 'Difficulty Level',
      dataIndex: 'difficultyLevel',
      key: 'difficultyLevel',
      width: '10%',
    },
  ];

  const filteredQuestions =
    questions?.filter((q) => q.unitName === unitName) || [];

  const groupedQuestions = useMemo(() => {
    const filtered = questions?.filter((q) => q.unitName === unitName) || [];
    return filteredSyllabusSections.map((section) => ({
      ...section,
      questions: filtered.filter((q) => q.syllabusSectionId === section.id),
    }));
  }, [questions, filteredSyllabusSections, unitName]);

  return (
    <div>
      <Button type="primary" onClick={handleAddSampleData}>
        Add Sample Test Data
      </Button>
      <Button type="primary" onClick={handleUpdateQuestions}>
        Update Questions
      </Button>

      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <Collapse accordion>
          {groupedQuestions.map((section) => (
            <Collapse.Panel
              key={section.id}
              header={
                filteredSyllabusSections.find((s) => s.id === section.id)
                  ?.title || section.sectionName
              }
            >
              <Table
                dataSource={section.questions}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
}

export default QuestionBankEditTask;
