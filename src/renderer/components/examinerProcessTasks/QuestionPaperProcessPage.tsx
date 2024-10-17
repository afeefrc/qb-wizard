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
import QuestionPaperDisplay2 from './QuestionPaperDisplay2';
import QuestionPaperPDF from '../utils/QuestionPaperPDF';
import { renderAnswerKey } from '../utils/tableRenderers';
import generateArchivedQuestionPaper from './questionPaperGenerator';

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
  // Remove this line:
  // const [questionPaper, setQuestionPaper] = useState<any[]>(
  //   renderContent.archivedQuestionPaper.content,
  // );
  // Ids of questions that are added to the paper
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [examinerAssignmentStatus, setExaminerAssignmentStatus] = useState(
    renderContent.status,
  );
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const addedQuestions =
    renderContent.archivedQuestionPaper.addedQuestions || [];

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
    // const filteredQuestions = questions.filter((q) => q.unitName === unit);
    // const filteredSyllabusSections = syllabusSections.filter(
    //   (s) => s.unitName === unit,
    // );

    // const generatePart = (partQuestions, targetMarks) => {
    //   let partPaper = [];
    //   let partTotalMarks = 0;

    //   const mandatoryQuestions = partQuestions.filter((q) => q.mandatory);
    //   const nonMandatoryQuestions = partQuestions.filter((q) => !q.mandatory);

    //   partPaper = [...mandatoryQuestions];
    //   partTotalMarks = mandatoryQuestions.reduce((sum, q) => sum + q.marks, 0);

    //   const isValidQuestion = (question) => {
    //     if (partPaper.some((q) => q.id === question.id)) return false;
    //     if (!question.linkedQuestion || question.linkedQuestion.length === 0)
    //       return true;
    //     return !question.linkedQuestion.some((id) =>
    //       partPaper.some((q) => q.id === id),
    //     );
    //   };

    //   while (partTotalMarks < targetMarks) {
    //     const remainingMarks = targetMarks - partTotalMarks;
    //     const validQuestions = nonMandatoryQuestions.filter(
    //       (q) => isValidQuestion(q) && q.marks <= remainingMarks,
    //     );
    //     if (validQuestions.length === 0) break;

    //     const randomQuestion =
    //       validQuestions[Math.floor(Math.random() * validQuestions.length)];
    //     partPaper.push(randomQuestion);
    //     partTotalMarks += randomQuestion.marks;
    //   }

    //   return partPaper;
    // };

    // const partASections = filteredSyllabusSections.filter(
    //   (s) => s.questionPart === 1,
    // );
    // const partBSections = filteredSyllabusSections.filter(
    //   (s) => s.questionPart === 2,
    // );

    // const partAQuestions = filteredQuestions.filter((q) =>
    //   partASections.some((s) => s.id === q.syllabusSectionId),
    // );
    // const partBQuestions = filteredQuestions.filter((q) =>
    //   partBSections.some((s) => s.id === q.syllabusSectionId),
    // );

    // const partA = generatePart(partAQuestions, 100);
    // const partB = generatePart(partBQuestions, 50);

    // // below is the upadte to implement the questionPaperBySections
    // const questionPaperBySections = {
    //   'Part A': {},
    //   'Part B': {},
    // };
    // // const processQuestions = (part, questions, sections) => {
    // //   let globalQuestionNumber = 1;

    // //   // Sort sections by serialNumber
    // //   const sortedSections = sections.sort(
    // //     (a, b) => a.serialNumber - b.serialNumber,
    // //   );

    // //   sortedSections.forEach((section) => {
    // //     const sectionId = section.id;
    // //     const sectionQuestions = questions.filter(
    // //       (q) => q.syllabusSectionId === sectionId,
    // //     );

    // //     if (sectionQuestions.length === 0) return;

    // //     questionPaperBySections[part][sectionId] = {};

    // //     // Group fillInTheBlanks questions
    // //     const fillInTheBlanks = sectionQuestions.filter(
    // //       (q) => q.questionType === 'fillInTheBlanks',
    // //     );
    // //     if (fillInTheBlanks.length > 0) {
    // //       questionPaperBySections[part][sectionId][globalQuestionNumber] =
    // //         fillInTheBlanks;
    // //       globalQuestionNumber++;
    // //     }

    // //     // Group trueFalse questions
    // //     const trueFalse = sectionQuestions.filter(
    // //       (q) => q.questionType === 'trueFalse',
    // //     );
    // //     if (trueFalse.length > 0) {
    // //       questionPaperBySections[part][sectionId][globalQuestionNumber] =
    // //         trueFalse;
    // //       globalQuestionNumber++;
    // //     }

    // //     // Process other question types
    // //     sectionQuestions
    // //       .filter(
    // //         (q) =>
    // //           q.questionType !== 'fillInTheBlanks' &&
    // //           q.questionType !== 'trueFalse',
    // //       )
    // //       .forEach((question) => {
    // //         questionPaperBySections[part][sectionId][globalQuestionNumber] = [
    // //           question,
    // //         ];
    // //         globalQuestionNumber++;
    // //       });
    // //   });
    // // };;

    // const processQuestions = (part, questions, sections) => {
    //   // Sort sections by serialNumber
    //   const sortedSections = sections.sort(
    //     (a, b) => a.serialNumber - b.serialNumber,
    //   );

    //   sortedSections.forEach((section) => {
    //     const sectionId = section.id;
    //     const sectionQuestions = questions.filter(
    //       (q) => q.syllabusSectionId === sectionId,
    //     );

    //     if (sectionQuestions.length === 0) return;

    //     questionPaperBySections[part][sectionId] = {
    //       sectionInfo: section,
    //       questions: [],
    //     };

    //     // Group fillInTheBlanks questions
    //     const fillInTheBlanks = sectionQuestions.filter(
    //       (q) => q.questionType === 'fillInTheBlanks',
    //     );
    //     if (fillInTheBlanks.length > 0) {
    //       questionPaperBySections[part][sectionId].questions.push({
    //         type: 'group',
    //         questionType: 'fillInTheBlanks',
    //         questions: fillInTheBlanks,
    //       });
    //     }

    //     // Group trueFalse questions
    //     const trueFalse = sectionQuestions.filter(
    //       (q) => q.questionType === 'trueFalse',
    //     );
    //     if (trueFalse.length > 0) {
    //       questionPaperBySections[part][sectionId].questions.push({
    //         type: 'group',
    //         questionType: 'trueFalse',
    //         questions: trueFalse,
    //       });
    //     }

    //     // Process other question types
    //     sectionQuestions
    //       .filter(
    //         (q) =>
    //           q.questionType !== 'fillInTheBlanks' &&
    //           q.questionType !== 'trueFalse',
    //       )
    //       .forEach((question) => {
    //         questionPaperBySections[part][sectionId].questions.push({
    //           type: 'single',
    //           question,
    //         });
    //       });
    //   });
    // };
    // processQuestions('Part A', partA, partASections);
    // processQuestions('Part B', partB, partBSections);

    // const updatedRenderContent = {
    //   ...renderContent,
    //   // questionPaper: [...partA, ...partB],
    //   archivedQuestionPaper: {
    //     content: [...partA, ...partB],
    //     syllabusSections: [...partASections, ...partBSections],
    //     questionPaperBySections,
    //     addedQuestions: [],
    //   },
    // };

    const archivedQuestionPaper = generateArchivedQuestionPaper(
      questions,
      syllabusSections,
      unit,
    );

    const updatedRenderContent = {
      ...renderContent,
      archivedQuestionPaper,
    };

    handleUpdateExaminerAssignment(renderContent.id, updatedRenderContent);
    // update the local state with the new render content
    setRenderContent(updatedRenderContent);
  };

  // // function to replace a question with another question
  // /**
  //  * Replaces a question in the questionPaper array, updates the global store using handleUpdateExaminerAssignment,
  //  * and updates the local state variables questionPaper and renderContent.
  //  *
  //  * @param {string} questionId - The ID of the question to be replaced.
  //  * @param {any} newQuestion - The new question object to replace the existing one.
  //  */
  // const replaceQuestion = (questionId: string, newQuestion: any) => {
  //   // Replace the question in the local questionPaper state
  //   const updatedQuestionPaper = questionPaper.map((question) =>
  //     question.id === questionId ? newQuestion : question,
  //   );
  //   // Update the renderContent with the new questionPaper
  //   const updatedRenderContent = {
  //     ...renderContent,
  //     archivedQuestionPaper: {
  //       ...renderContent.archivedQuestionPaper,
  //       content: updatedQuestionPaper,
  //     },
  //   };

  //   // update the store
  //   handleUpdateExaminerAssignment(renderContent.id, updatedRenderContent);
  //   // update the local state
  //   setQuestionPaper(updatedQuestionPaper);
  //   setRenderContent(updatedRenderContent);
  // };

  /**
   * Adds a new question to the questionPaper array, updates the global store using handleUpdateExaminerAssignment,
   * and updates the local state variables questionPaper and renderContent.
   *
   */
  const addQuestionsToPaper = (newQuestions: Question[]) => {
    const updatedQuestionPaperBySections = {
      ...renderContent.archivedQuestionPaper.questionPaperBySections,
    };

    newQuestions.forEach((question) => {
      const section = syllabusSections.find(
        (s) => s.id === question.syllabusSectionId,
      );
      if (!section) {
        console.error(`Section not found for question: ${question.id}`);
        return; // Skip this question if we can't find its section
      }

      const part = section.questionPart === 1 ? 'Part A' : 'Part B';
      const sectionId = question.syllabusSectionId;

      if (!updatedQuestionPaperBySections[part][sectionId]) {
        updatedQuestionPaperBySections[part][sectionId] = {
          sectionInfo: section,
          questions: [],
        };
      }

      const sectionQuestions =
        updatedQuestionPaperBySections[part][sectionId].questions;

      switch (question.questionType) {
        case 'fillInTheBlanks':
        case 'trueFalse':
          // Find existing group for this question type
          let group = sectionQuestions.find(
            (q) =>
              q.type === 'group' && q.questionType === question.questionType,
          );
          if (!group) {
            // If no group exists, create a new one
            group = {
              type: 'group',
              questionType: question.questionType,
              questions: [],
            };
            sectionQuestions.push(group);
          }
          // Add the question to the group
          group.questions.push(question);
          break;
        default:
          // For all other types, add as a single question
          sectionQuestions.push({ type: 'single', question: question });
      }
    });

    const updatedRenderContent = {
      ...renderContent,
      archivedQuestionPaper: {
        ...renderContent.archivedQuestionPaper,
        questionPaperBySections: updatedQuestionPaperBySections,
        addedQuestions: [
          ...new Set([
            ...(renderContent.archivedQuestionPaper.addedQuestions || []),
            ...newQuestions.map((q) => q.id),
          ]),
        ],
      },
    };

    // Update the global store with the updated renderContent
    handleUpdateExaminerAssignment(renderContent.id, updatedRenderContent);

    // Update the local state with the new renderContent
    setRenderContent(updatedRenderContent);
  };

  const removeQuestionFromPaper = (questionId: string) => {
    console.log('Removing question with ID:', questionId);

    const updatedQuestionPaperBySections = JSON.parse(
      JSON.stringify(
        renderContent.archivedQuestionPaper.questionPaperBySections,
      ),
    );
    let questionRemoved = false;

    for (const part of ['Part A', 'Part B'] as const) {
      for (const sectionId in updatedQuestionPaperBySections[part]) {
        const section = updatedQuestionPaperBySections[part][sectionId];

        section.questions = section.questions.reduce(
          (acc: any[], item: any) => {
            if (item.type === 'single') {
              if (item.question.id !== questionId) {
                acc.push(item);
              } else {
                questionRemoved = true;
              }
            } else if (item.type === 'group') {
              const updatedGroupQuestions = item.questions.filter(
                (q: Question) => q.id !== questionId,
              );
              if (updatedGroupQuestions.length !== item.questions.length) {
                questionRemoved = true;
              }
              if (updatedGroupQuestions.length > 0) {
                acc.push({ ...item, questions: updatedGroupQuestions });
              }
            } else {
              acc.push(item);
            }
            return acc;
          },
          [],
        );

        // Remove the section if it becomes empty
        if (section.questions.length === 0) {
          delete updatedQuestionPaperBySections[part][sectionId];
        }
      }

      // Remove the part if it becomes empty
      if (Object.keys(updatedQuestionPaperBySections[part]).length === 0) {
        delete updatedQuestionPaperBySections[part];
      }
    }

    if (questionRemoved) {
      const updatedRenderContent = {
        ...renderContent,
        archivedQuestionPaper: {
          ...renderContent.archivedQuestionPaper,
          questionPaperBySections: updatedQuestionPaperBySections,
          addedQuestions:
            renderContent.archivedQuestionPaper.addedQuestions.filter(
              (id) => id !== questionId,
            ),
        },
      };

      console.log('Updated question paper:', updatedQuestionPaperBySections);
      handleUpdateExaminerAssignment(renderContent.id, updatedRenderContent);
      setRenderContent(updatedRenderContent);
    } else {
      console.warn(
        `Question with id ${questionId} not found in the question paper.`,
      );
    }
  };

  const replaceQuestion = (questionId: string) => {
    // First, find the question to be replaced
    let questionToReplace: Question | null = null;
    let questionPart: 'Part A' | 'Part B' | null = null;
    let questionSectionId: string | null = null;

    const updatedQuestionPaperBySections = JSON.parse(
      JSON.stringify(
        renderContent.archivedQuestionPaper.questionPaperBySections,
      ),
    );

    // Find the question to replace
    outerLoop: for (const part of ['Part A', 'Part B'] as const) {
      for (const sectionId in updatedQuestionPaperBySections[part]) {
        const section = updatedQuestionPaperBySections[part][sectionId];
        for (const item of section.questions) {
          if (item.type === 'single' && item.question.id === questionId) {
            questionToReplace = item.question;
            questionPart = part;
            questionSectionId = sectionId;
            break outerLoop;
          } else if (item.type === 'group') {
            const foundQuestion = item.questions.find(
              (q) => q.id === questionId,
            );
            if (foundQuestion) {
              questionToReplace = foundQuestion;
              questionPart = part;
              questionSectionId = sectionId;
              break outerLoop;
            }
          }
        }
      }
    }

    if (!questionToReplace || !questionPart || !questionSectionId) {
      console.error(
        `Question with id ${questionId} not found in the question paper.`,
      );
      return;
    }

    // Get all questions for this unit
    const unitQuestions = questions.filter((q) => q.unitName === unit);

    // Helper function to check if a question is already in the paper
    const isQuestionInPaper = (qId: string): boolean => {
      for (const part of ['Part A', 'Part B'] as const) {
        for (const sectionId in updatedQuestionPaperBySections[part]) {
          const section = updatedQuestionPaperBySections[part][sectionId];
          for (const item of section.questions) {
            if (item.type === 'single' && item.question.id === qId) {
              return true;
            } else if (
              item.type === 'group' &&
              item.questions.some((q) => q.id === qId)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    };

    const prospectiveQuestions = unitQuestions.filter(
      (q) =>
        q.id !== questionId && // Exclude the current question
        q.marks === questionToReplace!.marks && // Same marks
        q.syllabusSectionId === questionToReplace!.syllabusSectionId && // Same section
        !q.linkedQuestion?.includes(questionId) && // Not linked to the current question
        !isQuestionInPaper(q.id) && // Not already in the paper (using our new helper function)
        !unitQuestions.some((uq) => uq.linkedQuestion?.includes(q.id)) && // Not linked to any question in the paper
        ((questionToReplace!.questionType === 'fillInTheBlanks' &&
          q.questionType === 'fillInTheBlanks') ||
          (questionToReplace!.questionType === 'trueFalse' &&
            q.questionType === 'trueFalse') ||
          (questionToReplace!.questionType !== 'fillInTheBlanks' &&
            questionToReplace!.questionType !== 'trueFalse' &&
            q.questionType !== 'fillInTheBlanks' &&
            q.questionType !== 'trueFalse')),
    );

    if (prospectiveQuestions.length === 0) {
      console.error(`No suitable replacement found for question ${questionId}`);
      return;
    }

    // Randomly select a replacement question
    const replacementQuestion =
      prospectiveQuestions[
        Math.floor(Math.random() * prospectiveQuestions.length)
      ];

    // Replace the question in the structure
    const section =
      updatedQuestionPaperBySections[questionPart][questionSectionId];
    section.questions = section.questions.map((item) => {
      if (item.type === 'single' && item.question.id === questionId) {
        return { type: 'single', question: replacementQuestion };
      } else if (item.type === 'group') {
        item.questions = item.questions.map((q) =>
          q.id === questionId ? replacementQuestion : q,
        );
        return item;
      }
      return item;
    });

    // Update the render content
    const updatedRenderContent = {
      ...renderContent,
      archivedQuestionPaper: {
        ...renderContent.archivedQuestionPaper,
        questionPaperBySections: updatedQuestionPaperBySections,
        addedQuestions: [
          ...renderContent.archivedQuestionPaper.addedQuestions.filter(
            (id) => id !== questionId,
          ),
          replacementQuestion.id,
        ],
      },
    };

    // Update the global store with the updated renderContent
    handleUpdateExaminerAssignment(renderContent.id, updatedRenderContent);

    // Update the local state with the new renderContent
    setRenderContent(updatedRenderContent);
  };

  // const columns = [
  //   {
  //     title: 'S.No',
  //     dataIndex: 'serialNumber',
  //     key: 'serialNumber',
  //     render: (text, record, index) => index + 1,
  //   },
  //   {
  //     title: 'Question',
  //     dataIndex: 'questionText',
  //     key: 'questionText',
  //     width: '35%',
  //     render: (text) => <Typography.Text strong>{text}</Typography.Text>,
  //   },
  //   {
  //     title: 'Answer Key',
  //     dataIndex: 'answerText',
  //     key: 'answerText',
  //     width: '30%',
  //     render: renderAnswerKey,
  //   },
  //   {
  //     title: 'Marks',
  //     dataIndex: 'marks',
  //     key: 'marks',
  //   },
  //   {
  //     title: 'Type',
  //     dataIndex: 'questionType',
  //     key: 'questionType',
  //   },
  //   {
  //     title: 'Difficulty',
  //     dataIndex: 'difficultyLevel',
  //     key: 'difficultyLevel',
  //   },
  //   {
  //     title: 'Action',
  //     dataIndex: 'action',
  //     key: 'action',
  //     render: (text, record) => (
  //       <Button type="default" onClick={() => console.log('Edit')}>
  //         <SyncOutlined /> Recycle
  //       </Button>
  //     ),
  //   },
  // ];

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
                generateQuestionPaper();
                console.log('question paper generated');
              }}
              style={{ marginLeft: '20px' }}
            >
              <CompassTwoTone twoToneColor="#eb2f96" />
              {renderContent.archivedQuestionPaper.questionPaperBySections &&
              Object.keys(
                renderContent.archivedQuestionPaper.questionPaperBySections,
              ).length > 0
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
                  archivedQuestionPaper: {
                    ...renderContent.archivedQuestionPaper,
                    addedQuestions: [],
                  },
                });
                navigate(-1);
              }}
              style={{ marginLeft: '20px' }}
              disabled={isSubmitDisabled}
            >
              Submit to Training Incharge
            </Button>
            {isSubmitDisabled && (
              <Alert
                showIcon
                message="Please ensure total marks are correct."
                type="error"
                style={{ width: '90%', marginTop: '10px' }}
              />
            )}
          </div>
        </Card>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '90%' }}>
            <QuestionPaperPDF
              // questionPaperBySections={
              //   renderContent.archivedQuestionPaper.questionPaperBySections
              // }
              // syllabusSections={
              //   renderContent.archivedQuestionPaper.syllabusSections
              // }
              examinerAssignmentId={renderContent.id}
            />
          </div>
          {/* {questionPaper.length > 0 && (
            <QuestionPaperDisplay
              questionPaper={questionPaper}
              syllabusSections={
                renderContent.archivedQuestionPaper.syllabusSections
              }
              columns={columns}
              addQuestionsToPaper={addQuestionsToPaper}
              setIsSubmitDisabled={setIsSubmitDisabled}
            />
          )} */}
          <div>
            {renderContent?.archivedQuestionPaper?.questionPaperBySections && (
              <QuestionPaperDisplay2
                questionPaperBySections={
                  renderContent.archivedQuestionPaper.questionPaperBySections
                }
                syllabusSections={
                  renderContent.archivedQuestionPaper.syllabusSections || []
                }
                addQuestionsToPaper={addQuestionsToPaper}
                addedQuestions={
                  renderContent.archivedQuestionPaper.addedQuestions || []
                }
                removeQuestionFromPaper={removeQuestionFromPaper}
                replaceQuestion={replaceQuestion}
                setIsSubmitDisabled={setIsSubmitDisabled}
              />
            )}
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
