import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  // Table,
  Typography,
  Card,
  Tag,
  // Collapse,
  Modal,
  Switch,
  Alert,
} from 'antd';
import { SyncOutlined, CompassTwoTone } from '@ant-design/icons';
import { AppContext } from '../../context/AppContext';
import QuestionPaperDisplay from './QuestionPaperDisplay';
import { renderAnswerKey } from '../utils/tableRenderers';

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
    // questionPaper: any[];
    archivedQuestionPaper: {
      content: any[];
      syllabusSections: any[];
      archivedAt: Date | null;
    };
    deadline: Date | null;
    comments_initiate: string;
    comments_submit: string;
    comments_approval: string;
    comments_forward: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// const { Title, Text } = Typography;
// const { Panel } = Collapse;

function QuestionPaperProcessPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const appContext = React.useContext(AppContext);
  const {
    examiners,
    questions,
    activeQuestions,
    syllabusSections,
    handleUpdateExaminerAssignment,
  } = appContext || {};

  const state = location.state as LocationState;
  const { unit } = state;
  const [renderContent, setRenderContent] = useState<any>(state.renderContent);
  const [questionPaper, setQuestionPaper] = useState<any[]>(
    renderContent.archivedQuestionPaper.content,
  );
  // Ids of questions that are added to the paper
  const [addedQuestions, setAddedQuestions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [examinerAssignmentStatus, setExaminerAssignmentStatus] = useState(
    renderContent.status,
  );
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

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

    const generatePart = (partQuestions, targetMarks) => {
      let partPaper = [];
      let partTotalMarks = 0;

      const mandatoryQuestions = partQuestions.filter((q) => q.mandatory);
      const nonMandatoryQuestions = partQuestions.filter((q) => !q.mandatory);

      partPaper = [...mandatoryQuestions];
      partTotalMarks = mandatoryQuestions.reduce((sum, q) => sum + q.marks, 0);

      const isValidQuestion = (question) => {
        if (partPaper.some((q) => q.id === question.id)) return false;
        if (!question.linkedQuestion || question.linkedQuestion.length === 0)
          return true;
        return !question.linkedQuestion.some((id) =>
          partPaper.some((q) => q.id === id),
        );
      };

      while (partTotalMarks < targetMarks) {
        const remainingMarks = targetMarks - partTotalMarks;
        const validQuestions = nonMandatoryQuestions.filter(
          (q) => isValidQuestion(q) && q.marks <= remainingMarks,
        );
        if (validQuestions.length === 0) break;

        const randomQuestion =
          validQuestions[Math.floor(Math.random() * validQuestions.length)];
        partPaper.push(randomQuestion);
        partTotalMarks += randomQuestion.marks;
      }

      return partPaper;
    };

    const partASections = filteredSyllabusSections.filter(
      (s) => s.questionPart === 1,
    );
    const partBSections = filteredSyllabusSections.filter(
      (s) => s.questionPart === 2,
    );

    const partAQuestions = filteredQuestions.filter((q) =>
      partASections.some((s) => s.id === q.syllabusSectionId),
    );
    const partBQuestions = filteredQuestions.filter((q) =>
      partBSections.some((s) => s.id === q.syllabusSectionId),
    );

    const partA = generatePart(partAQuestions, 100);
    const partB = generatePart(partBQuestions, 50);

    const updatedRenderContent = {
      ...renderContent,
      // questionPaper: [...partA, ...partB],
      archivedQuestionPaper: {
        content: [...partA, ...partB],
        syllabusSections: [...partASections, ...partBSections],
      },
    };
    handleUpdateExaminerAssignment(renderContent.id, updatedRenderContent);
    setQuestionPaper([...partA, ...partB]);
    // update the local state with the new render content
    setRenderContent(updatedRenderContent);
  };

  // function to replace a question with another question
  /**
   * Replaces a question in the questionPaper array, updates the global store using handleUpdateExaminerAssignment,
   * and updates the local state variables questionPaper and renderContent.
   *
   * @param {string} questionId - The ID of the question to be replaced.
   * @param {any} newQuestion - The new question object to replace the existing one.
   */
  const replaceQuestion = (questionId: string, newQuestion: any) => {
    // Replace the question in the local questionPaper state
    const updatedQuestionPaper = questionPaper.map((question) =>
      question.id === questionId ? newQuestion : question,
    );
    // Update the renderContent with the new questionPaper
    const updatedRenderContent = {
      ...renderContent,
      archivedQuestionPaper: {
        ...renderContent.archivedQuestionPaper,
        content: updatedQuestionPaper,
      },
    };

    // update the store
    handleUpdateExaminerAssignment(renderContent.id, updatedRenderContent);
    // update the local state
    setQuestionPaper(updatedQuestionPaper);
    setRenderContent(updatedRenderContent);
  };

  /**
   * Adds a new question to the questionPaper array, updates the global store using handleUpdateExaminerAssignment,
   * and updates the local state variables questionPaper and renderContent.
   *
   */
  const addQuestionsToPaper = (questionIds: string[]) => {
    // Find the corresponding questions from the 'questions' context using the provided IDs
    const newQuestions = activeQuestions.filter((q) =>
      questionIds.includes(q.id),
    );

    // Append the new questions to the existing questionPaper
    const updatedQuestionPaper = [...questionPaper, ...newQuestions];

    // Update the renderContent with the new questionPaper
    const updatedRenderContent = {
      ...renderContent,
      archivedQuestionPaper: {
        ...renderContent.archivedQuestionPaper,
        content: updatedQuestionPaper,
      },
    };

    // Update the global store with the updated renderContent
    handleUpdateExaminerAssignment(renderContent.id, updatedRenderContent);

    // Update the local state with the new questionPaper and renderContent
    setQuestionPaper(updatedQuestionPaper);
    setRenderContent(updatedRenderContent);
    setAddedQuestions((prevAddedQuestions) => [
      ...new Set([...prevAddedQuestions, ...questionIds]),
    ]);
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
      title: 'Answer Key',
      dataIndex: 'answerText',
      key: 'answerText',
      width: '30%',
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
                setAddedQuestions([]);
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
                setAddedQuestions([]);
                navigate(-1);
              }}
              style={{ marginLeft: '20px' }}
              // disabled={isSubmitDisabled}
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
          {questionPaper.length > 0 && (
            <QuestionPaperDisplay
              questionPaper={questionPaper}
              syllabusSections={
                renderContent.archivedQuestionPaper.syllabusSections
              }
              columns={columns}
              addQuestionsToPaper={addQuestionsToPaper}
              setIsSubmitDisabled={setIsSubmitDisabled}
            />
          )}
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
