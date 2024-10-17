import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Button, Divider, Tag, Empty } from 'antd';
import {
  SyncOutlined,
  // CompassTwoTone,
  PlusSquareOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
// import QuestionPaperPDF from '../utils/QuestionPaperPDF';
import AddQuestionDrawer from './AddQuestionDrawer';
import { renderAnswerKey } from '../utils/tableRenderers';
import { useUser } from '../../context/UserContext';

const { Title } = Typography;

// Add this helper function at the top of your file or in a separate utility file
function toRoman(num: number): string {
  const romanNumerals = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' },
  ];

  let result = '';
  for (let i = 0; i < romanNumerals.length; i++) {
    while (num >= romanNumerals[i].value) {
      result += romanNumerals[i].numeral;
      num -= romanNumerals[i].value;
    }
  }
  return result;
}

interface Question {
  id: string;
  questionText: string;
  answerText: string;
  marks: number;
  questionType: string;
  // Add other properties as needed
}

interface GroupedQuestion {
  type: 'group';
  questionType: string;
  questions: Question[];
}

interface SingleQuestion {
  type: 'single';
  question: Question;
}

interface SectionInfo {
  id: string;
  title: string;
  serialNumber: number;
  // Add other properties as needed
}

interface SectionData {
  sectionInfo: SectionInfo;
  questions: (SingleQuestion | GroupedQuestion)[];
}

interface QuestionPaperDisplay2Props {
  questionPaperBySections: {
    'Part A': { [sectionId: string]: SectionData };
    'Part B': { [sectionId: string]: SectionData };
  };
  syllabusSections: SectionInfo[];
  addQuestionsToPaper: (questionIds: string[]) => void;
  addedQuestions: any[];
  removeQuestionFromPaper: (questionId: string) => void;
  replaceQuestion: (questionId: string) => void;
  setIsSubmitDisabled: (disabled: boolean) => void;
}

// interface RenderSectionProps {
//   sectionId: string;
//   questions: { [questionNumber: number]: any[] };
//   columns: any[];
//   validateSectionMarks: (
//     questions: any[],
//     section: any,
//   ) => { isValid: boolean; message: string };
//   handleAddButtonClick: (sectionId: string) => void;
//   syllabusSections: any[];
//   user: any;
// }

// const RenderSection = React.memo(
//   ({
//     sectionId,
//     questions,
//     columns,
//     validateSectionMarks,
//     handleAddButtonClick,
//     syllabusSections,
//     user,
//   }: RenderSectionProps) => {
//     const section = syllabusSections.find((s) => s.id === sectionId);
//     const flatQuestions = Object.values(questions).flat();
//     const sectionMarksValidation = validateSectionMarks(flatQuestions, section);

//     console.log('questions', questions);

//     return (
//       <div key={sectionId}>
//         <div
//           style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'flex-end',
//             padding: '5px 0px',
//             paddingRight: '20px',
//           }}
//         >
//           <Title level={4}>
//             Syllabus Section: {section?.title || sectionId}
//           </Title>
//           {user?.role === 'examiner' && (
//             <Button
//               type="primary"
//               ghost
//               icon={<PlusSquareOutlined />}
//               onClick={() => handleAddButtonClick(sectionId)}
//             >
//               Add question to this section
//             </Button>
//           )}
//         </div>
//         <Table
//           dataSource={flatQuestions.sort((a, b) => a.marks - b.marks)}
//           columns={columns}
//           rowKey="id"
//           pagination={false}
//         />
//         <div
//           style={{
//             textAlign: 'right',
//             marginTop: '10px',
//             marginBottom: '5px',
//             paddingRight: '20px',
//           }}
//         >
//           Total Marks for this Section:{' '}
//           {flatQuestions.reduce((sum, question) => sum + question.marks, 0)}
//         </div>
//         <div
//           style={{
//             textAlign: 'right',
//             paddingRight: '20px',
//           }}
//         >
//           {!sectionMarksValidation.isValid && (
//             <Typography.Text type="danger" style={{ marginLeft: '10px' }}>
//               {sectionMarksValidation.message}
//             </Typography.Text>
//           )}
//         </div>
//       </div>
//     );
//   },
// );

function RenderQuestionActions({
  question,
  replaceQuestion,
  removeQuestionFromPaper,
}: {
  question: { id: string; mandatory?: boolean };
  replaceQuestion: (id: string) => void;
  removeQuestionFromPaper: (id: string) => void;
}) {
  if (question.mandatory) {
    return <Tag color="blue">Mandatory</Tag>;
  }
  return (
    <div>
      <Button
        type="primary"
        size="small"
        style={{ marginLeft: '10px' }}
        icon={<SyncOutlined />}
        onClick={() => replaceQuestion(question.id)}
      >
        Replace
      </Button>
      <Button
        type="primary"
        size="small"
        danger
        style={{ marginLeft: '10px' }}
        icon={<DeleteOutlined />}
        onClick={() => removeQuestionFromPaper(question.id)}
      >
        Remove
      </Button>
    </div>
  );
}

// Helper components for rendering questions
function RenderSingleQuestion({
  question,
  addedQuestions,
  replaceQuestion,
  removeQuestionFromPaper,
}: {
  question: any;
  addedQuestions: any;
  replaceQuestion: any;
  removeQuestionFromPaper: any;
}) {
  return (
    <Typography.Text strong>
      {question.questionText}
      {addedQuestions.includes(question.id) && (
        <Tag color="red" style={{ marginLeft: '10px' }}>
          manually added
        </Tag>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0% 5%',
        }}
      >
        <Typography.Text style={{ width: '70%' }}>
          {'Answerkey: '}
          {renderAnswerKey(question.answerText, question, {
            fontSize: '14px',
            fontWeight: 200,
            fontStyle: 'italic',
          })}
        </Typography.Text>
        <RenderQuestionActions
          question={question}
          replaceQuestion={replaceQuestion}
          removeQuestionFromPaper={removeQuestionFromPaper}
        />
      </div>

      <Divider style={{ margin: '10px' }} />
    </Typography.Text>
  );
}

// RenderGroupedQuestions for fill inthe blanks, true false,
function RenderGroupedQuestions({
  groupedQuestions,
  addedQuestions,
  replaceQuestion,
  removeQuestionFromPaper,
}: {
  groupedQuestions: any;
  addedQuestions: any;
  replaceQuestion: any;
  removeQuestionFromPaper: any;
}) {
  return (
    <>
      <Typography.Text strong>
        {(() => {
          switch (groupedQuestions.questionType) {
            case 'fillInTheBlanks':
              return 'Fill in the blanks: ';
            case 'trueFalse':
              return 'State True or False, if False provide correct answer: ';
            default:
              return 'Answer the following: ';
          }
        })()}
      </Typography.Text>
      {groupedQuestions.questions.map((question, index) => (
        <div
          key={question.id}
          style={{ marginLeft: '20px', marginTop: '10px' }}
        >
          <Typography.Text strong>
            {String.fromCharCode(97 + index)}. {question.questionText}
            <Typography.Text type="secondary">
              &nbsp;&nbsp;&nbsp;&nbsp; ({question.marks} marks)
              {addedQuestions.includes(question.id) && (
                <Tag color="red" style={{ marginLeft: '10px' }}>
                  manually added
                </Tag>
              )}
            </Typography.Text>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0% 5%',
              }}
            >
              <Typography.Text style={{ width: '70%' }}>
                {'Answerkey: '}
                {renderAnswerKey(question.answerText, question, {
                  fontSize: '14px',
                  fontWeight: 200,
                  fontStyle: 'italic',
                })}
              </Typography.Text>
              <RenderQuestionActions
                question={question}
                replaceQuestion={replaceQuestion}
                removeQuestionFromPaper={removeQuestionFromPaper}
              />
            </div>
            <Divider style={{ margin: '10px' }} />
          </Typography.Text>
        </div>
      ))}
    </>
  );
}

function QuestionPaperDisplay2({
  questionPaperBySections,
  syllabusSections,
  addQuestionsToPaper,
  addedQuestions,
  removeQuestionFromPaper,
  replaceQuestion,
  setIsSubmitDisabled,
}: QuestionPaperDisplay2Props) {
  const { user } = useUser();
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [currentSectionId, setCurrentSectionId] = useState<any>(null);

  console.log('addedQuestions', addedQuestions);

  // Calculate partAMarks and partBMarks
  const [partAMarks, partBMarks] = useMemo(() => {
    const calculatePartMarks = (part: 'Part A' | 'Part B') =>
      Object.values(questionPaperBySections?.[part] || {}).reduce(
        (sum, section) =>
          sum +
          (section?.questions?.reduce(
            (sectionSum, questionItem) =>
              sectionSum +
              (questionItem?.type === 'group'
                ? questionItem.questions?.reduce(
                    (groupSum, q) => groupSum + (q?.marks || 0),
                    0,
                  ) || 0
                : questionItem?.question?.marks || 0),
            0,
          ) || 0),
        0,
      );

    return [calculatePartMarks('Part A'), calculatePartMarks('Part B')];
  }, [questionPaperBySections]);

  const totalMarks = useMemo(
    () => partAMarks + partBMarks,
    [partAMarks, partBMarks],
  );

  const validateSectionMarks = useCallback(
    (questions: any[], syllabusSection: any) => {
      if (!syllabusSection) return { isValid: true, message: '' };
      const sectionMarks = questions.reduce(
        (sum, q) => sum + (q?.marks || 0),
        0,
      );
      const { minWeightage, maxWeightage } = syllabusSection;
      if (sectionMarks < minWeightage) {
        return {
          isValid: false,
          message: `Total marks (${sectionMarks}) are below the minimum required (${minWeightage})`,
        };
      }
      if (sectionMarks > maxWeightage) {
        return {
          isValid: false,
          message: `Total marks (${sectionMarks}) exceed the maximum allowed (${maxWeightage})`,
        };
      }
      return { isValid: true, message: '' };
    },
    [],
  );

  const invalidMarksSections = useMemo(() => {
    if (!questionPaperBySections || !Array.isArray(syllabusSections)) return [];
    const invalidSections = [];
    for (const part of ['Part A', 'Part B'] as const) {
      for (const [sectionId, sectionData] of Object.entries(
        questionPaperBySections[part] || {},
      )) {
        const section = syllabusSections.find((s) => s?.id === sectionId);
        if (section && sectionData?.questions) {
          const flatQuestions = sectionData.questions.flatMap((q) =>
            q?.type === 'group'
              ? q.questions || []
              : [q?.question].filter(Boolean),
          );
          const validation = validateSectionMarks(flatQuestions, section);
          if (!validation.isValid) {
            invalidSections.push({
              syllabusSectionId: sectionId,
              message: validation.message,
            });
          }
        }
      }
    }
    return invalidSections;
  }, [questionPaperBySections, syllabusSections, validateSectionMarks]);

  useEffect(() => {
    if (user?.role === 'examiner') {
      setIsSubmitDisabled(
        invalidMarksSections.length > 0 ||
          partAMarks !== 100 ||
          partBMarks !== 50,
      );
    }
  }, [invalidMarksSections, partAMarks, partBMarks, setIsSubmitDisabled, user]);

  const handleAddButtonClick = useCallback((sectionId: any) => {
    setCurrentSectionId(sectionId);
    setDrawerVisible(true);
  }, []);

  // Add this function at the top of your component or in a separate utility file
  const calculateSectionMarks = (questions: any) => {
    return (
      questions?.reduce(
        (total, questionItem) =>
          total +
          (questionItem?.type === 'group'
            ? questionItem.questions?.reduce(
                (sum, q) => sum + (q?.marks || 0),
                0,
              ) || 0
            : questionItem?.question?.marks || 0),
        0,
      ) || 0
    );
  };

  const renderQuestionPaper = useCallback(() => {
    if (!questionPaperBySections) return null;
    let sectionCount = 0;

    return ['Part A', 'Part B'].map((part) => (
      <div key={part}>
        <Title level={3}>{part}</Title>
        {Object.entries(
          questionPaperBySections[part as 'Part A' | 'Part B'] || {},
        )
          .sort(([aId], [bId]) => {
            const sectionA =
              questionPaperBySections[part as 'Part A' | 'Part B'][aId]
                ?.sectionInfo;
            const sectionB =
              questionPaperBySections[part as 'Part A' | 'Part B'][bId]
                ?.sectionInfo;
            return (
              (sectionA?.serialNumber || 0) - (sectionB?.serialNumber || 0)
            );
          })
          .map(([sectionId, sectionData]) => {
            const { sectionInfo, questions } = sectionData || {};
            sectionCount++;
            const romanNumeral = toRoman(sectionCount);
            const sectionMarks = calculateSectionMarks(questions);

            return (
              <div key={sectionId}>
                <Title level={4}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    {'Section '} {romanNumeral}. (
                    {sectionInfo?.title || sectionId})
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                      }}
                    >
                      {user?.role === 'examiner' && (
                        <Button
                          type="primary"
                          ghost
                          icon={<PlusSquareOutlined />}
                          onClick={() => handleAddButtonClick(sectionId)}
                        >
                          Add question to this section
                        </Button>
                      )}
                      <Typography.Text
                        style={{ alignSelf: 'flex-end', marginTop: '5px' }}
                      >
                        Total Marks in the section: {sectionMarks}
                      </Typography.Text>
                    </div>
                  </div>
                  <Divider style={{ borderWidth: 1, borderColor: '#000' }} />
                </Title>
                {questions?.map((questionItem, questionIndex) => (
                  <div key={questionIndex} style={{ marginBottom: '15px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Typography.Text strong>
                          {questionIndex + 1}.{' '}
                        </Typography.Text>
                        {questionItem?.type === 'single' ? (
                          <RenderSingleQuestion
                            question={questionItem.question}
                            addedQuestions={addedQuestions}
                            replaceQuestion={replaceQuestion}
                            removeQuestionFromPaper={removeQuestionFromPaper}
                          />
                        ) : (
                          <RenderGroupedQuestions
                            groupedQuestions={questionItem}
                            addedQuestions={addedQuestions}
                            replaceQuestion={replaceQuestion}
                            removeQuestionFromPaper={removeQuestionFromPaper}
                          />
                        )}
                      </div>

                      <Typography.Text
                        strong
                        style={{ margin: '0px 10px', whiteSpace: 'nowrap' }}
                      >
                        {questionItem?.type === 'single'
                          ? questionItem.question?.marks
                          : questionItem.questions?.reduce(
                              (sum, q) => sum + (q?.marks || 0),
                              0,
                            )}{' '}
                        marks
                      </Typography.Text>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        <div
          style={{
            textAlign: 'right',
            marginTop: '20px',
            marginBottom: '40px',
            fontWeight: 'bold',
            paddingRight: '10px',
          }}
        >
          Total Marks for {part}: {part === 'Part A' ? partAMarks : partBMarks}
        </div>
      </div>
    ));
  }, [questionPaperBySections, partAMarks, partBMarks, user]);

  // const questionPaperArray = useMemo(() => {
  //   if (!questionPaperBySections) return [];
  //   return Object.entries(questionPaperBySections).flatMap(([part, sections]) =>
  //     Object.entries(sections).map(([sectionId, sectionData]) => ({
  //       part,
  //       sectionId,
  //       ...sectionData,
  //     })),
  //   );
  // }, [questionPaperBySections]);

  if (!questionPaperBySections || !Array.isArray(syllabusSections)) {
    return (
      <Empty
        description="Click Generate Question Paper to generate a question paper"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '90%' }}>
        <div
          style={{ overflowY: 'auto', maxHeight: '800px', padding: '0px 30px' }}
        >
          {renderQuestionPaper()}
          <div
            style={{
              marginTop: '20px',
              fontWeight: 'bold',
              textAlign: 'right',
              marginRight: '10px',
              marginBottom: '40px',
            }}
          >
            Total Marks for Question Paper: {totalMarks}
          </div>
        </div>
        <AddQuestionDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          onAddQuestions={addQuestionsToPaper}
          currentSectionId={currentSectionId}
          currentSectionTitle={
            syllabusSections.find((s) => s?.id === currentSectionId)?.title ||
            currentSectionId
          }
          currentQuestionPaper={Object.values(questionPaperBySections)
            .flatMap((part) => Object.values(part))
            .flatMap((section) => section?.questions || [])
            .flatMap((questionItem) =>
              questionItem?.type === 'group'
                ? questionItem.questions || []
                : [questionItem?.question].filter(Boolean),
            )}
        />
      </div>
    </div>
  );
}

export default React.memo(QuestionPaperDisplay2);
