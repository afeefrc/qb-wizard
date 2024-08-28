import React, { useContext, useMemo, useState } from 'react';
import { Button, Table, Collapse, Tag, Popconfirm, Typography } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import {
  EditTwoTone,
  SaveTwoTone,
  LinkOutlined,
  PlusSquareTwoTone,
  DeleteTwoTone,
} from '@ant-design/icons';
import ExpandedRowEditor from './ExpandedRowEditor';
import AddQuestionModal from './AddQuestionModal';

import { AppContext } from '../../context/AppContext';

const { Text } = Typography;

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
  answerList?: string[];
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

const renderQuestionContent = (text: string, record: ColumnDataType) => {
  if (record.questionType === 'mcq' && record.answerList) {
    return (
      <>
        <Text>{text}</Text>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            marginTop: '2px',
            paddingLeft: '20px',
          }}
        >
          {record.answerList.map((answer: string, index: number) => (
            <div key={index} style={{ width: '50%', padding: '0' }}>
              <Text>{`${String.fromCharCode(65 + index)}. ${answer}`}</Text>
            </div>
          ))}
        </div>
      </>
    );
  }
  return <Text>{text}</Text>;
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
    handleDeleteQuestion,
    handleUpdatePendingChange,
    handleDeletePendingChange,
    handleApplyPendingChange,
    handleApplyAllPendingChanges,
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

  // const handleAddSampleData = () => {
  //   handleAddQuestion(sampleData.data);
  // };

  // const handleUpdateQuestions = () => {
  //   if (pendingChanges && pendingChanges.length > 0 && pendingChanges[0].id) {
  //     handleApplyPendingChange(pendingChanges[0].id);
  //   }
  // };

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
      width: '40%',
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
                <Tag
                  color="red"
                  style={{
                    fontSize: '12px',
                    fontWeight: 'lighter',
                    fontStyle: 'italic',
                  }}
                >
                  Deleted
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
                      if (pendingChange.type === 'update') {
                        handleUpdatePendingChange(pendingChange.id, {
                          ...pendingChange,
                          data: { ...pendingChange.data, isDeleted: false },
                        });
                      } else {
                        handleDeletePendingChange(pendingChange.id);
                      }
                    }
                  }}
                  style={{
                    marginLeft: '8px',
                    padding: '0',
                    boxShadow: 'none',
                    fontStyle: 'italic',
                    // fontSize: '12px',
                  }}
                >
                  Undo Delete
                </Button>
              </div>
              <div style={{ textDecoration: 'line-through' }}>
                {renderQuestionContent(text, record)}
              </div>
            </div>
          ) : (
            <>
              {/* render edit and delete buttons only if the question is not deleted */}
              <div>
                {!record.isDeleted && !expandedRowKeys.includes(record.id) && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      marginBottom: '5px',
                      gap: '5px',
                    }}
                  >
                    <Button
                      size="small"
                      type="link"
                      onClick={() => toggleExpand(record)}
                      style={{ boxShadow: 'none', fontStyle: 'italic' }}
                    >
                      <span>
                        <EditTwoTone twoToneColor="#eb2f96" /> Edit
                      </span>
                    </Button>
                    {record.status === 'new' ? (
                      <Popconfirm
                        title="Permanently delete this new entry?"
                        onConfirm={() => {
                          const pendingChange = pendingChanges.find(
                            (change) => change.data.id === record.id,
                          );
                          if (pendingChange) {
                            handleDeletePendingChange(pendingChange.id);
                          }
                        }}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          size="small"
                          type="link"
                          style={{ boxShadow: 'none', fontStyle: 'italic' }}
                        >
                          <span>
                            <DeleteTwoTone twoToneColor="#eb2f96" /> Delete
                          </span>
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Button
                        size="small"
                        type="link"
                        onClick={() => {
                          const existingChange = pendingChanges.find(
                            (change) => change.data.id === record.id,
                          );
                          if (existingChange) {
                            handleUpdatePendingChange(existingChange.id, {
                              data: { ...existingChange.data, isDeleted: true },
                            });
                          } else {
                            handleAddPendingChange({
                              type: 'delete',
                              data: { ...record, isDeleted: true },
                            });
                          }
                        }}
                        style={{ boxShadow: 'none', fontStyle: 'italic' }}
                      >
                        <span>
                          <DeleteTwoTone twoToneColor="#eb2f96" /> Delete
                        </span>
                      </Button>
                    )}
                  </div>
                )}
                <div style={{ fontSize: '16px', fontWeight: '400' }}>
                  {renderQuestionContent(text, record)}
                </div>
                {record.status && record.status !== 'original' ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: '5px',
                    }}
                  >
                    <Tag
                      color={record.status === 'edited' ? 'blue' : 'green'}
                      style={{
                        fontSize: '12px',
                        fontWeight: 'lighter',
                        fontStyle: 'italic',
                      }}
                    >
                      {record.status === 'edited' ? 'Edited' : 'New'}
                    </Tag>
                    {record.status === 'edited' && (
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
                          fontStyle: 'italic',
                        }}
                      >
                        Undo edit
                      </Button>
                    )}
                  </div>
                ) : (
                  <div style={{ height: '29px', marginTop: '5px' }}></div>
                )}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Answer key',
      dataIndex: 'answerText',
      key: 'answerText',
      width: '25%',
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
      filters: [
        { text: 'One Word', value: 'oneWord' },
        { text: 'MCQ', value: 'mcq' },
        { text: 'Short Answer', value: 'shortAnswer' },
        { text: 'Long Answer', value: 'longAnswer' },
        { text: 'True/False', value: 'trueFalse' },
        { text: 'Fill in the Blanks', value: 'fillInTheBlanks' },
        { text: 'Match the Following', value: 'matchTheFollowing' },
      ],
      onFilter: (value: string, record: ColumnDataType) =>
        record.questionType.toLowerCase() === value.toLowerCase(),
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
      // width: '10%',
      render: (_: any, record: any) =>
        !record.isDeleted && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-evenly',
              }}
            >
              <Button
                size="small"
                onClick={() => toggleExpand(record)}
                style={{ boxShadow: 'none' }}
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
                size="small"
                onClick={() => {
                  const existingChange = pendingChanges.find(
                    (change) => change.data.id === record.id,
                  );
                  if (existingChange) {
                    handleUpdatePendingChange(existingChange.id, {
                      data: { ...existingChange.data, isDeleted: true },
                    });
                  } else {
                    handleAddPendingChange({
                      type: 'delete',
                      data: { ...record, isDeleted: true },
                    });
                  }
                }}
                style={{ boxShadow: 'none' }}
              >
                <span>
                  <DeleteTwoTone twoToneColor="#eb2f96" /> Delete
                </span>
              </Button>
            </div> */}
            <Button
              size="small"
              type="link"
              ghost
              onClick={() => {}}
              style={{
                boxShadow: 'none',
                fontStyle: 'italic',
                lineHeight: '1.2',
                height: 'auto',
                padding: '4px 0',
              }}
            >
              <PlusSquareTwoTone twoToneColor="#eb2f96" />
              <span
                style={{
                  display: 'inline-block',
                  width: '100%',
                  whiteSpace: 'normal',
                  textAlign: 'left',
                }}
              >
                Link similar questions
              </span>
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
    <div
      style={{
        height: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Button type="primary" onClick={handleApplyAllPendingChanges}>
        Apply all pending changes
      </Button>
      <AddQuestionModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          marginBottom: '150px',
        }}
      >
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
                // scroll={{ x: 'max-content', y: 400 }}
                bordered
                rowKey="id"
                onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }}
                size="small"
                pagination={false}
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
