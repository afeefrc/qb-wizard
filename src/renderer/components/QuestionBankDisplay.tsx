import React, { useContext, useMemo, useState, useCallback } from 'react';
import {
  Table,
  Tag,
  Empty,
  Typography,
  Collapse,
  Button,
  Form,
  Alert,
  Image,
} from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import ExportQuestionBank from './utils/ExportQuestionBank';
import QuestionFeedbackSection from './QuestionFeedbackSection';
import QuestionBankFeedbackBtn from './QuestionBankFeedbackBtn';
import { AppContext } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { renderAnswerKey } from './utils/tableRenderers';

const { Text } = Typography;
const { Panel } = Collapse;

interface ColumnDataType {
  id: string;
  unitName: string;
  serialNumber: string;
  questionText: string;
  answerText: string;
  marks: number;
  questionType: string;
  difficultyLevel: string;
  syllabusSectionId: string;
  answerList?: string[];
  correctOption?: string;
  mandatory?: boolean;
  showCommentForm?: boolean;
}

interface QuestionBankDisplayProps {
  unitName: string;
}

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

function QuestionBankDisplay({
  unitName,
}: QuestionBankDisplayProps): React.ReactElement {
  const appContext = useContext(AppContext);
  const {
    questions,
    syllabusSections,
    // examiners,
    // handleDeleteQuestion,
    // handleUpdateQuestion,
    handleAddComment,
    // handleDeleteAllComments,
    handleDeleteComment,
    feedback,
  } = appContext || {};

  const { user } = useUser();

  // Filter syllabusSections by unitName
  const filteredSyllabusSections = useMemo(() => {
    return (
      syllabusSections
        ?.filter((section) => section.unitName === unitName)
        .sort((a, b) => a.serialNumber - b.serialNumber) || []
    );
  }, [syllabusSections, unitName]);

  // Filter questions based on unitName, isDeleted, and isLatestVersion
  const filteredQuestions = useMemo(() => {
    return (
      questions?.filter(
        (q) => q.unitName === unitName && !q.isDeleted && q.isLatestVersion,
      ) || []
    );
  }, [questions, unitName]);

  // Group questions by syllabusSectionId
  const groupedQuestions = useMemo(() => {
    const group: { [key: string]: ColumnDataType[] } = {};
    filteredQuestions.forEach((question) => {
      if (!group[question.syllabusSectionId]) {
        group[question.syllabusSectionId] = [];
      }
      group[question.syllabusSectionId].push(question);
    });
    return group;
  }, [filteredQuestions]);

  const [commentFormVisibility, setCommentFormVisibility] = useState<{
    [key: string]: boolean;
  }>({});
  const [form] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const handleToggleComment = useCallback(
    (record: ColumnDataType) => {
      console.log('Toggle comment for:', record.id);
      setCommentFormVisibility((prev) => {
        const newVisibility = !prev[record.id];
        setExpandedRowKeys(newVisibility ? [record.id] : []);

        if (!newVisibility) {
          // Reset form fields when closing the comment form
          form.resetFields();
        }

        return { ...prev, [record.id]: newVisibility };
      });
    },
    [form],
  );

  const handleSubmitComment = useCallback(
    (values: { comment: string }, record: ColumnDataType) => {
      handleAddComment('questionComment', {
        questionId: record.id,
        comment: values.comment,
        examinerId: values.examiner,
      });
      // Here you would typically send the comment to your backend
      // After successful submission, close the form
      form.resetFields();
    },
    [form, handleAddComment],
  );

  const onDeleteComment = useCallback(
    (commentId: string) => {
      // Call the handleDeleteComment function from your context
      handleDeleteComment('questionComment', commentId);
    },
    [handleDeleteComment],
  );

  const renderQuestionFeedbackSection = useCallback(
    (record: ColumnDataType) => {
      return (
        <QuestionFeedbackSection
          form={form}
          onSubmit={(values) => handleSubmitComment(values, record)}
          onCancel={() => handleToggleComment(record)}
          questionId={record.id}
          onDeleteComment={onDeleteComment}
          canDeleteComment={user?.role === 'trgIncharge'}
        />
      );
    },
    [
      form,
      handleSubmitComment,
      handleToggleComment,
      onDeleteComment,
      user?.role,
    ],
  );

  const columns: TableColumnsType<ColumnDataType> = [
    {
      title: 'Question ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: any, record: any) => {
        const serialPart = record.serialNumber
          ? record.serialNumber.toString().padStart(3, '0')
          : '****';
        // Assuming record has a 'year' field. If not, adjust accordingly.
        return `${record.unitName}.${record.year || '00'}.${serialPart}`;
      },
      width: '10%',
      sorter: (a: any, b: any) => a.serialNumber - b.serialNumber,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      width: '40%',
      render: (text: string, record: ColumnDataType) => (
        <div>
          {renderQuestionContent(text, record)}
          {renderImage(record)}
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
              {commentFormVisibility[record.id]
                ? 'Hide Feedback'
                : 'View/Add Feedback'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Answer Key',
      dataIndex: 'answerText',
      key: 'answerText',
      width: '20%',
      render: renderAnswerKey,
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
      width: '5%',
      sorter: (a: any, b: any) => a.marks - b.marks,
      sortDirections: ['ascend', 'descend'],
      render: (marks: number) => (
        <Text style={{ fontSize: '16px', fontWeight: 400 }}>{marks}</Text>
      ),
    },
    {
      title: 'Question Type',
      dataIndex: 'questionType',
      key: 'questionType',
      width: '8%',
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
      width: '8%',
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
    // {
    //   title: 'Action',
    //   key: 'action',
    //   render: (_: any, record: ColumnDataType) => (
    //     <Button
    //       type="primary"
    //       ghost
    //       icon={<CommentOutlined />}
    //       onClick={() => handleToggleComment(record)}
    //       size="small"
    //     >
    //       {commentFormVisibility[record.id] ? 'Cancel' : 'Add Comment'}
    //     </Button>
    //   ),
    // },
  ];

  const expandableConfig = {
    expandedRowRender: (record: ColumnDataType) =>
      commentFormVisibility[record.id]
        ? renderQuestionFeedbackSection(record)
        : null,
    expandedRowKeys,
    onExpand: (expanded: boolean, record: ColumnDataType) => {
      if (!expanded) {
        handleToggleComment(record);
      }
    },
    showExpandColumn: false,
    // expandRowByClick: true,
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {user?.role === 'trgIncharge' && (
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <ExportQuestionBank
            questions={filteredQuestions}
            syllabusSections={filteredSyllabusSections}
            unitName={unitName}
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          width: '100%',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '250px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '5px 10px',
              marginBottom: '5px',
            }}
          >
            <QuestionBankFeedbackBtn unitName={unitName} />
          </div>
          {filteredQuestions.length > 0 ? (
            <Collapse
              accordion
              defaultActiveKey={filteredSyllabusSections[0]?.id}
            >
              {filteredSyllabusSections.map((section) => (
                <Panel
                  header={section.title || section.sectionName}
                  key={section.id}
                >
                  {groupedQuestions[section.id]?.length > 0 ? (
                    <Table
                      dataSource={groupedQuestions[section.id]}
                      columns={columns}
                      rowKey="id"
                      pagination={false}
                      bordered
                      size="middle"
                      scroll={{ y: '50vh' }}
                      expandable={expandableConfig}
                    />
                  ) : (
                    <Empty description="No questions found in this section" />
                  )}
                </Panel>
              ))}
            </Collapse>
          ) : (
            <Empty description={`No questions found for ${unitName}`} />
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionBankDisplay;
