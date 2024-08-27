import React, { useContext, useMemo, useState } from 'react';
import { Button, Table, Collapse, Tag } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { EditTwoTone, SaveTwoTone, LinkOutlined } from '@ant-design/icons';
import ExpandedRowEditor from './ExpandedRowEditor';
import AddQuestionModal from './AddQuestionModal';

import { AppContext } from '../../context/AppContext';

interface QuestionBankEditTaskProps {
  unitName: string;
}

interface ColumnDataType {
  id: string;
  serialNumber: string;
  questionText: string;
  answerText: string;
  marks: number;
  questionType: string;
  difficultyLevel: string;
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

const onChange: TableProps<ColumnDataType>['onChange'] = (
  pagination,
  filters,
  sorter,
  extra,
) => {
  console.log('params', pagination, filters, sorter, extra);
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
    handleUpdatePendingChange,
    handleDeletePendingChange,
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
    if (pendingChanges && pendingChanges.length > 0 && pendingChanges[0].id) {
      handleApplyPendingChange(pendingChanges[0].id);
    }
  };

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const toggleExpand = (record: ColumnDataType) => {
    setExpandedRowKeys((prevKeys) =>
      prevKeys.includes(record.id)
        ? prevKeys.filter((key) => key !== record.id)
        : [...prevKeys, record.id],
    );
  };

  const expandedRowRender = (record: ColumnDataType) => (
    <ExpandedRowEditor
      record={record}
      onSave={(updatedRecord) => {
        // Handle saving the updated record
        console.log('Saving updated record:', updatedRecord);
        // Update the record using AppContext functions
        const existingChange = pendingChanges.find(
          (change) => change.data.id === updatedRecord.id,
        );
        if (existingChange) {
          handleUpdatePendingChange(existingChange.id, { data: updatedRecord });
        } else {
          handleAddPendingChange({ type: 'update', data: updatedRecord });
        }
        toggleExpand(record);
      }}
      onCancel={() => toggleExpand(record)}
    />
  );

  const columns: TableColumnsType<ColumnDataType> = [
    // {
    //   title: 'S.No',
    //   key: 'serial',
    //   render: (_: any, __: any, index: number) => index + 1,
    //   width: '5%',
    // },
    {
      title: 'Question Id',
      dataIndex: 'id',
      key: 'id',
      render: (text: any, record: any) => {
        const serialPart = record.serialNumber
          ? record.serialNumber.toString().padStart(3, '0')
          : '****';
        return `${record.unitName}/${record.year}/${serialPart}`;
      },
      width: '8%',
      showSorterTooltip: { target: 'full-header' },
      defaultSortOrder: 'ascend',
      sorter: (a: any, b: any) => {
        if (a.serialNumber === undefined && b.serialNumber === undefined)
          return 0;
        if (a.serialNumber === undefined) return 1;
        if (b.serialNumber === undefined) return -1;
        return a.serialNumber - b.serialNumber;
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      width: '50%',
      render: (text: string, record: ColumnDataType) => (
        <div>
          {record.isDeleted ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <Tag color="red">Deleted</Tag>
                <Button
                  type="link"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    const pendingChange = pendingChanges.find(
                      (change) => change.data.id === record.id,
                    );
                    if (pendingChange) {
                      handleDeletePendingChange(pendingChange.id);
                    }
                  }}
                  style={{ marginLeft: '8px', padding: '0', boxShadow: 'none' }}
                >
                  Undo Delete
                </Button>
              </div>
              <div style={{ textDecoration: 'line-through' }}>{text}</div>
            </div>
          ) : (
            <>
              <div>{text}</div>
              {record.status && record.status !== 'original' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '10px',
                  }}
                >
                  <Tag color={record.status === 'edited' ? 'blue' : 'green'}>
                    {record.status === 'edited' ? 'Edited' : 'New'}
                  </Tag>
                  <Button
                    type="link"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      const pendingChange = pendingChanges.find(
                        (change) => change.data.id === record.id,
                      );
                      if (pendingChange) {
                        handleDeletePendingChange(pendingChange.id);
                      }
                    }}
                    style={{
                      marginLeft: '8px',
                      padding: '0',
                      boxShadow: 'none',
                    }}
                  >
                    Undo
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ),
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
      width: '6%',
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'ascend',
      sorter: (a: any, b: any) => a.marks - b.marks,
    },
    {
      title: 'Question Type',
      dataIndex: 'questionType',
      key: 'questionType',
      width: '10%',
      filters: [{ text: 'MCQ', value: 'MCQ' }],
      onFilter: (value: any, record: any) => record.questionType === value,
    },
    {
      title: 'Difficulty Level',
      dataIndex: 'difficultyLevel',
      key: 'difficultyLevel',
      width: '10%',
      filters: [
        { text: 'Easy', value: 'easy' },
        { text: 'Medium', value: 'medium' },
        { text: 'Hard', value: 'hard' },
      ],
      onFilter: (value: any, record: any) => record.difficultyLevel === value,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            type="link"
            onClick={() => toggleExpand(record)}
            style={{ boxShadow: 'none', marginRight: '8px' }}
          >
            {expandedRowKeys.includes(record.id) ? (
              <span>
                <SaveTwoTone twoToneColor="#eb2f96" /> Save
              </span>
            ) : (
              <span>
                <EditTwoTone twoToneColor="#eb2f96" /> Edit
              </span>
            )}
          </Button>
          <Button
            type="link"
            onClick={() => {
              /* Add link functionality here */
            }}
            style={{ boxShadow: 'none' }}
          >
            <div
              style={{
                width: '100px',
                whiteSpace: 'normal',
                lineHeight: '1.3',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <LinkOutlined style={{ marginRight: '4px' }} /> Link similar
                questions
              </span>
            </div>
          </Button>
        </div>
      ),
    },
  ];

  // const filteredQuestions =
  //   questions?.filter((q) => q.unitName === unitName) || [];

  const groupedQuestions = useMemo(() => {
    const filtered =
      questions?.filter((q) => q.unitName === unitName && !q.isDeleted) || [];
    const pendingChangesMap = new Map(
      pendingChanges?.map((change) => [change.data.id, change.data]) || [],
    );

    const mergedQuestions = filtered.map((q) => {
      const pendingQuestion = pendingChangesMap.get(q.id);
      return pendingQuestion
        ? { ...pendingQuestion, status: 'edited' }
        : { ...q, status: 'original' };
    });

    const newQuestions = Array.from(pendingChangesMap.values())
      .filter(
        (pendingQuestion) =>
          pendingQuestion.unitName === unitName &&
          !filtered.some((q) => q.id === pendingQuestion.id),
      )
      .map((q) => ({ ...q, status: 'new' }));

    const allQuestions = [...mergedQuestions, ...newQuestions];

    return filteredSyllabusSections.map((section) => ({
      ...section,
      questions: allQuestions.filter((q) => q.syllabusSectionId === section.id),
    }));
  }, [questions, pendingChanges, filteredSyllabusSections, unitName]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  const showModal = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentSectionId(null);
  };

  const handleSubmit = (values: any) => {
    if (currentSectionId) {
      handleAddQuestion({
        ...values,
        unitName,
        syllabusSectionId: currentSectionId,
      });
    }
    setIsModalVisible(false);
    setCurrentSectionId(null);
  };

  return (
    <div>
      {/* <Button type="primary" onClick={handleUpdateQuestions}>
        Update Questions
      </Button> */}

      <AddQuestionModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />

      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <Collapse accordion defaultActiveKey={groupedQuestions[0]?.id}>
          {groupedQuestions.map((section) => (
            <Collapse.Panel
              key={section.id}
              header={
                filteredSyllabusSections.find((s) => s.id === section.id)
                  ?.title || section.sectionName
              }
            >
              <div style={{ marginBottom: '16px' }}>
                <Button type="primary" onClick={() => showModal(section.id)}>
                  Add New Question
                </Button>
              </div>
              <Table
                dataSource={section.questions}
                columns={columns}
                rowKey="id"
                onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }}
                size="small"
                expandable={{
                  expandedRowRender,
                  expandedRowKeys,
                  onExpand: (_, record) => toggleExpand(record),
                  expandIconColumnIndex: -1,
                }}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
}

export default QuestionBankEditTask;
