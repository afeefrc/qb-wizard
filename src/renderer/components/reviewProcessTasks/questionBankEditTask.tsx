import React, {
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  Button,
  Table,
  Collapse,
  Tag,
  Popconfirm,
  Typography,
  Switch,
  Alert,
  List,
  Empty,
  Image,
} from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import {
  EditTwoTone,
  PlusSquareTwoTone,
  DeleteTwoTone,
  CommentOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import ExpandedRowEditor from './ExpandedRowEditor';
import AddQuestionModal from './AddQuestionModal';
import LinkSimilarQuestionsDrawer from './LinkSimilarQuestionsDrawer';
import QuestionFeedbackSection from '../QuestionFeedbackSection';
import { renderAnswerKey } from '../utils/tableRenderers';
import { AppContext } from '../../context/AppContext';

const { Text } = Typography;

interface QuestionBankEditTaskProps {
  unitName: string;
}

interface ColumnDataType {
  id: string;
  serialNumber: string;
  questionText: string;
  image?: Blob;
  answerText: string;
  marks: number;
  questionType: string;
  difficultyLevel: string;
  answerList?: string[];
  trueAnswer?: boolean;
  correctOption?: string;
  matchPairs?: Array<{ item: string; match: string }>;
  mandatory?: boolean;
}

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
        <Text style={{ fontSize: '16px', fontWeight: 400 }}>{text}</Text>
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
              <Text style={{ fontSize: '14px', fontWeight: 400 }}>
                {`${String.fromCharCode(65 + index)}. ${answer}`}
              </Text>
            </div>
          ))}
        </div>
      </>
    );
  }
  return <Text style={{ fontSize: '16px', fontWeight: 400 }}>{text}</Text>;
};

const renderImage = (record: ColumnDataType) => {
  if (record.image && record.image instanceof Blob) {
    const imageUrl = URL.createObjectURL(record.image);
    console.log('Image URL created:', imageUrl); // Debugging log
    return (
      <div style={{ marginTop: '10px' }}>
        <Image
          src={imageUrl}
          alt="Question Image"
          style={{ maxWidth: '100%', maxHeight: '200px' }}
          onError={(e) => {
            console.error('Error loading image:', e);
          }}
        />
      </div>
    );
  }
  return null;
};

function QuestionBankEditTask({
  unitName = '',
}: QuestionBankEditTaskProps): React.ReactElement {
  const appContext = useContext(AppContext);
  const {
    questions,
    handleAddPendingChange,
    pendingChanges,
    linkedQuestions,
    handleAddLinkedQuestions,
    // handleDeleteLinkedQuestions,
    handleUpdateLinkedQuestions,
    // handleAddQuestion,
    // handleDeleteQuestion,
    handleUpdatePendingChange,
    handleDeletePendingChange,
    // handleApplyPendingChange,
    // handleApplyAllPendingChanges,
    syllabusSections,
    handleAddComment,
    handleDeleteComment,
    feedback,
    examiners,
  } = appContext || {};

  // Filter syllabusSections by unitName
  const filteredSyllabusSections = useMemo(() => {
    return (
      syllabusSections?.filter((section) => section.unitName === unitName) || []
    );
  }, [syllabusSections, unitName]);

  // console.log('pendingChanges', pendingChanges);
  // console.log('questions', questions);

  // In your component:
  useEffect(() => {
    return () => {
      // Revoke all object URLs when the component unmounts
      questions.forEach((question) => {
        if (question.image && question.image instanceof Blob) {
          console.log(question.image.name);
          URL.revokeObjectURL(URL.createObjectURL(question.image));
        }
      });
    };
  }, [questions]);

  // question comments related states and functions
  const [showQuestionComments, setShowQuestionComments] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  // function to get examiner info
  const getExaminerInfo = (examinerId: string) => {
    const examiner = examiners?.find((e) => e.id === examinerId);
    return examiner
      ? `${examiner.examinerName}, ${examiner.examinerDesignation} (ATM)`
      : examinerId;
  };

  const handleToggleComment = useCallback((record: ColumnDataType) => {
    // console.log('Toggle comment for:', record.id);
    setShowQuestionComments((prev) => {
      const newVisibility = !prev[record.id];
      setExpandedRowKeys(newVisibility ? [record.id] : []);

      // if (!newVisibility) {
      //   // Reset form fields when closing the comment form
      //   form.resetFields();
      // }

      return { ...prev, [record.id]: newVisibility };
    });
  }, []);

  const onDeleteComment = useCallback(
    (commentId: string) => {
      // Call the handleDeleteComment function from your context
      handleDeleteComment('questionComment', commentId);
    },
    [handleDeleteComment],
  );

  const renderQuestionFeedbackSection = useCallback(
    (record: ColumnDataType) => {
      return <Text>Here goes the comments list</Text>;
    },
    [
      // form,
      // handleSubmitComment,
      // handleToggleComment,
      // onDeleteComment,
    ],
  );

  const toggleExpand = (record: ColumnDataType) => {
    setExpandedRowKeys((prevKeys) =>
      prevKeys.includes(record.id)
        ? prevKeys.filter((key) => key !== record.id)
        : [...prevKeys, record.id],
    );
  };

  const groupedQuestions = useMemo(() => {
    const filtered =
      questions?.filter(
        (q) => q.unitName === unitName && !q.isDeleted && q.isLatestVersion,
      ) || [];
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

  // this is to filter out the deleted questions. then pass it to the LinkSimilarQuestionsDrawer
  const filteredGroupedQuestions = useMemo(() => {
    return groupedQuestions.map((section) => ({
      ...section,
      questions: section.questions.filter((q) => !q.isDeleted),
    }));
  }, [groupedQuestions]);

  const expandedRowRender = (
    record: ColumnDataType,
    showQuestionComments: boolean = false,
  ) => {
    if (showQuestionComments) {
      const questionFeedback =
        feedback?.questionComment?.filter(
          (comment) => comment.questionId === record.id,
        ) || [];

      return (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div
            style={{
              width: '50%',
              backgroundColor: '#f0f2f3',
              borderRadius: '10px',
              padding: '0px 100px',
            }}
          >
            <List
              dataSource={questionFeedback}
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
                    </Button>,
                  ]}
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
        </div>
      );
    }

    const updatedRecord =
      groupedQuestions
        .flatMap((section) => section.questions)
        .find((q) => q.id === record.id) || record;

    // Ensure the record has the correct structure for MCQ questions
    const preparedRecord = {
      ...updatedRecord,
      answerList:
        updatedRecord.questionType === 'mcq' ||
        updatedRecord.questionType === 'fillInTheBlanks'
          ? updatedRecord.answerList || []
          : undefined,
      correctOption:
        updatedRecord.questionType === 'mcq'
          ? updatedRecord.correctOption
          : undefined,
    };

    console.log('Prepared record for ExpandedRowEditor:', preparedRecord);

    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '75%',
            backgroundColor: '#f0f2f3',
            borderRadius: '10px',
            padding: '0px 20px',
          }}
        >
          <ExpandedRowEditor
            record={preparedRecord}
            onSave={(updatedRecord) => {
              // Update the record using AppContext functions
              const existingChange = pendingChanges.find(
                (change) => change.data.id === updatedRecord.id,
              );
              if (existingChange) {
                handleUpdatePendingChange(existingChange.id, {
                  data: updatedRecord,
                });
              } else {
                handleAddPendingChange({
                  type: 'update',
                  data: { ...updatedRecord, isEdited: false },
                });
              }
              toggleExpand(record);
            }}
            onCancel={() => toggleExpand(record)}
          />
        </div>
      </div>
    );
  };

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null,
  );
  const [initialLinkedQuestions, setInitialLinkedQuestions] = useState<
    string[]
  >([]);

  const showDrawer = (questionId: string) => {
    setCurrentQuestionId(questionId);

    // Create the initialLinkedQuestions list
    const currentQuestion = questions?.find(
      (q) => q.id === questionId && !q.isDeleted,
    );

    const linkedQuestionIds = currentQuestion?.linkedQuestion || [];
    const linkedQuestionsFromState =
      linkedQuestions
        ?.filter((link) => link.questionId === questionId)
        .map((link) => link.linkedQuestionIds)
        .flat() || [];
    console.log('linkedQuestions', linkedQuestions);
    console.log('linkedQuestionsFromState', linkedQuestionsFromState);

    const combinedLinkedQuestions = Array.from(
      new Set([...linkedQuestionIds, ...linkedQuestionsFromState]),
    );

    const filteredLinkedQuestions = combinedLinkedQuestions.filter((id) => {
      const linkedQuestion = questions?.find((q) => q.id === id);
      const existsInLinkedQuestions = linkedQuestionsFromState.includes(id);
      return (
        (linkedQuestion && !linkedQuestion.isDeleted) || existsInLinkedQuestions
      );
    });

    setInitialLinkedQuestions(filteredLinkedQuestions);
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
    setCurrentQuestionId(null);
  };

  const handleLinkQuestions = (linkedQuestionIds: string[]) => {
    if (currentQuestionId) {
      console.log('currentQuestionId', currentQuestionId);
      console.log('linkedQuestionIds', linkedQuestionIds);

      // Find existing linked questions for the current question
      const existingLinkedQuestions = linkedQuestions?.find(
        (lq) => lq.questionId === currentQuestionId,
      );

      if (existingLinkedQuestions) {
        // Update existing linked questions
        handleUpdateLinkedQuestions(existingLinkedQuestions.id, {
          questionId: currentQuestionId,
          linkedQuestionIds,
        });
      } else {
        // Add new linked questions
        handleAddLinkedQuestions({
          questionId: currentQuestionId,
          linkedQuestionIds,
        });
      }
    }
  };

  const columns: TableColumnsType<ColumnDataType> = [
    {
      title: 'Question Id',
      dataIndex: 'id',
      key: 'id',
      render: (text: any, record: any) => {
        const serialPart = record.serialNumber
          ? record.serialNumber.toString().padStart(3, '0')
          : '****';
        return `${record.unitName}.${record.year}.${serialPart}`;
      },
      width: '8%',
      showSorterTooltip: { target: 'full-header' },
      defaultSortOrder: 'descend',
      sorter: (a: any, b: any) => {
        if (a.serialNumber === undefined && b.serialNumber === undefined)
          return 0;
        if (a.serialNumber === undefined) return 1;
        if (b.serialNumber === undefined) return -1;
        return a.serialNumber - b.serialNumber; // Changed to b - a for descending order
      },
      sortDirections: ['descend', 'ascend'],
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
                  bordered={false}
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
                      bordered={false}
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
          {renderImage(record)}
          {/* question feedback comments section */}
          <div style={{ textAlign: 'right', marginTop: '0px', padding: 0 }}>
            {(() => {
              const commentCount =
                feedback?.questionComment?.filter(
                  (comment) => comment.questionId === record.id,
                ).length || 0;
              return commentCount > 0 ? (
                <Alert
                  message={`${commentCount} comment${commentCount !== 1 ? 's' : ''} available`}
                  type="warning"
                  style={{
                    marginRight: '8px',
                    padding: '0px 15px',
                    fontSize: '12px',
                    display: 'inline-block',
                  }}
                />
              ) : null;
            })()}
            <Button
              type="link"
              icon={<CommentOutlined />}
              onClick={() => handleToggleComment(record)}
              style={{
                padding: 0,
                margin: 0,
                color: 'darkblue',
                opacity: 0.6,
                boxShadow: 'none',
                fontStyle: 'italic',
              }}
            >
              {showQuestionComments[record.id]
                ? 'Hide Feedback'
                : 'View/Add Feedback'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Answer key',
      dataIndex: 'answerText',
      key: 'answerText',
      width: '25%',
      render: renderAnswerKey,
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
      width: '6%',
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'ascend',
      sorter: (a: any, b: any) => a.marks - b.marks,
      render: (marks: number) => (
        <Text style={{ fontSize: '16px', fontWeight: 400 }}>{marks}</Text>
      ),
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
      render: (questionType: string) => {
        const typeMap: { [key: string]: string } = {
          oneWord: 'One Word',
          mcq: 'MCQ',
          shortAnswer: 'Short Answer',
          longAnswer: 'Long Answer',
          trueFalse: 'True/False',
          fillInTheBlanks: 'Fill in the Blanks',
          matchTheFollowing: 'Match the Following',
        };
        return typeMap[questionType] || questionType;
      },
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
      render: (difficultyLevel: string) => {
        const colorMap: { [key: string]: string } = {
          easy: 'green',
          medium: 'orange',
          hard: 'red',
        };
        return (
          <Tag
            color={colorMap[difficultyLevel.toLowerCase()] || 'default'}
            bordered={false}
            style={{ fontSize: '14px', padding: '2px 8px' }}
          >
            {difficultyLevel}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) =>
        !record.isDeleted && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <Button
              size="small"
              type="link"
              ghost
              onClick={() => showDrawer(record.id)}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                size="small"
                checked={record.mandatory}
                onChange={(checked) => {
                  const updatedRecord = { ...record, mandatory: checked };
                  const existingChange = pendingChanges.find(
                    (change) => change.data.id === record.id,
                  );
                  if (existingChange) {
                    handleUpdatePendingChange(existingChange.id, {
                      data: updatedRecord,
                    });
                  } else {
                    handleAddPendingChange({
                      type: 'update',
                      data: updatedRecord,
                    });
                  }
                }}
                style={{ boxShadow: 'none' }}
              />
              <span style={{ fontSize: '12px' }}>Mandatory Question</span>
            </div>
          </div>
        ),
    },
  ];

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
      handleAddPendingChange({
        type: 'add',
        data: {
          ...values,
          unitName,
          syllabusSectionId: currentSectionId,
        },
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
        // height: '100%',
      }}
    >
      {/* <Button type="primary" onClick={handleApplyAllPendingChanges}>
        Apply all pending changes
      </Button> */}
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
              <div style={{ margin: '16px 0px' }}>
                <Button
                  type="primary"
                  ghost
                  onClick={() => showModal(section.id)}
                >
                  Add New Question
                </Button>
              </div>
              <Table
                dataSource={section.questions}
                columns={columns}
                bordered
                rowKey="id"
                onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }}
                size="small"
                pagination={false}
                expandable={{
                  expandedRowRender: (record) =>
                    expandedRowRender(record, showQuestionComments[record.id]),
                  expandedRowKeys,
                  onExpand: (_, record) => toggleExpand(record),
                  expandIconColumnIndex: -1,
                }}
              />
              <div style={{ margin: '16px 0px' }}>
                <Button
                  type="primary"
                  ghost
                  onClick={() => showModal(section.id)}
                >
                  Add New Question
                </Button>
              </div>
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
      <LinkSimilarQuestionsDrawer
        visible={isDrawerVisible}
        onClose={handleCloseDrawer}
        groupedQuestions={filteredGroupedQuestions}
        onLinkQuestions={handleLinkQuestions}
        currentQuestionId={currentQuestionId || ''}
        initialLinkedQuestions={initialLinkedQuestions}
      />
    </div>
  );
}

export default QuestionBankEditTask;
