import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  Table,
  Typography,
  Card,
  Tag,
  Collapse,
  Modal,
  Switch,
  Alert,
} from 'antd';
import { SyncOutlined, CompassTwoTone } from '@ant-design/icons';
import { AppContext } from '../../context/AppContext';

interface LocationState {
  unit: string;
  renderContent: {
    id: string;
    unit: string;
    description: string;
    examiner: string;
    examiner_invigilator: string;
    examiner_evaluation: string;
    status: string;
    content: any[];
    deadline: Date | null;
    comments_initiate: string;
    comments_submit: string;
    comments_approval: string;
    comments_forward: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

const { Title, Text } = Typography;
const { Panel } = Collapse;

function QuestionPaperProcessPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const appContext = React.useContext(AppContext);
  const {
    examiners,
    questions,
    syllabusSections,
    handleUpdateExaminerAssignment,
  } = appContext || {};

  const state = location.state as LocationState;
  const { unit, renderContent } = state;
  const [questionPaper, setQuestionPaper] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [examinerAssignmentStatus, setExaminerAssignmentStatus] = useState(
    renderContent.status,
  );

  console.log('questionPaper', questionPaper);

  const handleBackClick = () => {
    navigate(-1);
  };

  const getExaminerInfo = (examinerId: string) => {
    const matchingExaminer = examiners?.find(
      (examiner) => examiner.id === examinerId,
    );
    return matchingExaminer
      ? `${matchingExaminer.examinerName}, ${matchingExaminer.examinerDesignation} (ATM)`
      : 'Unknown';
  };

  const generateQuestionPaper = () => {
    const filteredQuestions = questions.filter((q) => q.unitName === unit);
    const filteredSyllabusSections = syllabusSections.filter(
      (s) => s.unitName === unit,
    );

    const mandatoryQuestions = filteredQuestions.filter((q) => q.mandatory);
    const nonMandatoryQuestions = filteredQuestions.filter((q) => !q.mandatory);

    let questionPaper = [...mandatoryQuestions];
    let totalMarks = mandatoryQuestions.reduce((sum, q) => sum + q.marks, 0);

    const sectionMarks = filteredSyllabusSections.map((section) => {
      const minMarks = (section.minWeightage / 100) * 100;
      const maxMarks = (section.maxWeightage / 100) * 100;
      return { sectionId: section.id, minMarks, maxMarks, currentMarks: 0 };
    });

    const addQuestionToPaper = (question) => {
      questionPaper.push(question);
      totalMarks += question.marks;
      const section = sectionMarks.find(
        (s) => s.sectionId === question.syllabusSectionId,
      );
      if (section) section.currentMarks += question.marks;
    };

    const isValidQuestion = (question) => {
      if (questionPaper.some((q) => q.id === question.id)) return false;
      if (
        question.linkedQuestion.some((id) =>
          questionPaper.some((q) => q.id === id),
        )
      )
        return false;
      return true;
    };

    while (totalMarks < 100) {
      const remainingMarks = 100 - totalMarks;
      const validQuestions = nonMandatoryQuestions.filter(
        (q) => isValidQuestion(q) && q.marks <= remainingMarks,
      );
      if (validQuestions.length === 0) break;

      const randomQuestion =
        validQuestions[Math.floor(Math.random() * validQuestions.length)];
      addQuestionToPaper(randomQuestion);
    }

    setQuestionPaper(questionPaper);
  };

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      width: '35%',
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
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
    {
      title: 'Difficulty',
      dataIndex: 'difficultyLevel',
      key: 'difficultyLevel',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Button type="default" onClick={() => console.log('Edit')}>
          <SyncOutlined /> Recycle
        </Button>
      ),
    },
  ];

  const totalMarks = questionPaper.reduce(
    (sum, question) => sum + question.marks,
    0,
  );

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // minHeight: '100vh',
        minWidth: '100vw',
        // backgroundColor: '#f0f2f5',
        overflowY: 'auto',
        maxHeight: '100vh',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100vh',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          // boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Card title="Question Paper Preparation">
          {/* <div style={{ fontSize: '18px', fontWeight: '500' }}>
            Question Paper Preparation
          </div> */}
          {state ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: '70%',
              }}
            >
              <div className="create-review-panel-unitname">{unit}</div>
              <div>
                <div>Examiner: {getExaminerInfo(renderContent.examiner)}</div>
                <div>Description: {state.renderContent.description}</div>
                <div>
                  Deadline:{' '}
                  {state.renderContent.deadline
                    ? state.renderContent.deadline
                        .toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                        .split('/')
                        .join('-')
                    : 'N/A'}
                </div>
                <div>
                  Status:{' '}
                  {examinerAssignmentStatus === 'In Progress' ? (
                    <Tag
                      color="success"
                      style={{
                        fontSize: '16px',
                        border: 'none',
                        padding: '4px 8px',
                      }}
                    >
                      {examinerAssignmentStatus}
                    </Tag>
                  ) : (
                    <Tag
                      color="processing"
                      style={{
                        fontSize: '16px',
                        border: 'none',
                        padding: '4px 8px',
                      }}
                    >
                      {examinerAssignmentStatus}
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p>No state information available</p>
          )}

          <div style={{ marginTop: '20px' }}>
            <Button onClick={handleBackClick}>Go Back</Button>
            <Button
              ghost
              type="primary"
              onClick={() => {
                generateQuestionPaper();
                console.log('quesion paper generated');
              }}
              style={{ marginLeft: '20px' }}
            >
              <CompassTwoTone twoToneColor="#eb2f96" />
              {questionPaper.length > 0
                ? 'Regenerate Question Paper'
                : 'Generate Question Paper'}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                console.log('Forward to Training Incharge');
                handleUpdateExaminerAssignment(renderContent.id, {
                  ...renderContent,
                  status: 'Submitted',
                });
                navigate(-1);
              }}
              style={{ marginLeft: '20px' }}
            >
              Submit to Training Incharge
            </Button>
          </div>
        </Card>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              overflowY: 'auto',
              maxHeight: '800px',
              width: '80%',
            }}
          >
            {questionPaper
              .reduce((acc, item) => {
                const section = acc.find(
                  (section) =>
                    section.syllabusSectionId === item.syllabusSectionId,
                );
                if (section) {
                  section.questions.push(item);
                } else {
                  acc.push({
                    syllabusSectionId: item.syllabusSectionId,
                    questions: [item],
                  });
                }
                return acc;
              }, [])
              .map((section) => (
                <div key={section.syllabusSectionId}>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '500',
                      marginBottom: '10px',
                      marginTop: '10px',
                    }}
                  >
                    Syllabus Section:{' '}
                    {syllabusSections.find(
                      (s) => s.id === section.syllabusSectionId,
                    )?.title || section.syllabusSectionId}
                  </div>
                  <Table
                    dataSource={section.questions.sort(
                      (a, b) => a.marks - b.marks,
                    )}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                  />
                  <div
                    style={{
                      marginTop: '10px',
                      marginBottom: '20px',
                      textAlign: 'right',
                      marginRight: '20px',
                    }}
                  >
                    Total Marks for this Section:{' '}
                    {section.questions.reduce(
                      (sum, question) => sum + question.marks,
                      0,
                    )}
                  </div>
                </div>
              ))}
            <div
              style={{
                marginTop: '20px',
                fontWeight: 'bold',
                textAlign: 'right',
                marginRight: '20px',
                marginBottom: '40px',
              }}
            >
              Total Marks for Question Paper:{totalMarks}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Question paper preparation process"
        open={isModalOpen}
        onOk={handleOk}
        okText="Confirm"
        onCancel={handleCancel}
        footer={null}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '0px 50px',
            }}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p>
                <strong>Unit:</strong> {renderContent.unit}
              </p>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p>
                <strong>Examiner:</strong>{' '}
                {getExaminerInfo(renderContent.examiner)}
              </p>
            </div>
          </div>
          {/* <p style={{ marginBottom: '20px', fontSize: '16px', color: 'green' }}>
            Ensure you are part of this review panel.
          </p> */}
          <div style={{ marginBottom: '20px' }}>
            <Alert
              message={
                <span style={{ fontSize: '16px' }}>
                  Ensure this task is assigned to you
                </span>
              }
              type="warning"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            {examinerAssignmentStatus.toLowerCase() === 'initiated' && (
              <>
                <span style={{ marginRight: '10px', fontSize: '16px' }}>
                  Switch the status to start the process
                </span>
                <Switch
                  style={{ boxShadow: 'none' }}
                  checkedChildren="In Progress"
                  unCheckedChildren="Initiated"
                  checked={examinerAssignmentStatus === 'In Progress'}
                  onChange={(checked) => {
                    setExaminerAssignmentStatus(
                      checked ? 'In Progress' : 'Initiated',
                    );
                    handleUpdateExaminerAssignment(renderContent.id, {
                      status: checked ? 'In Progress' : 'Initiated',
                    });
                  }}
                />
              </>
            )}
          </div>
          <Button onClick={handleCancel} style={{ marginRight: '10px' }}>
            Go back
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            disabled={examinerAssignmentStatus !== 'In Progress'}
          >
            Proceed
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default QuestionPaperProcessPage;
