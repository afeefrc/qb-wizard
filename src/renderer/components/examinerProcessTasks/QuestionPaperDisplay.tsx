import React, { useState, useEffect, useMemo } from 'react';
import { Table, Typography, Button } from 'antd';
import { SyncOutlined, PlusSquareOutlined } from '@ant-design/icons';
import QuestionPaperPDF from '../utils/QuestionPaperPDF';
import AddQuestionDrawer from './AddQuestionDrawer';

const { Title } = Typography;

interface QuestionPaperDisplayProps {
  questionPaper: any[];
  syllabusSections: any[];
  columns: any[];
  addQuestionsToPaper: (questionIds: string[]) => void;
}

function QuestionPaperDisplay({
  questionPaper,
  syllabusSections,
  columns,
  addQuestionsToPaper,
}: QuestionPaperDisplayProps) {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [currentSectionId, setCurrentSectionId] = useState<any>(null);
  const [invalidMarksSections, setInvalidMarksSections] = useState<any[]>([]);

  const partAMarks = useMemo(() => {
    return questionPaper.reduce((sum, question) => {
      const section = syllabusSections.find(
        (s) => s.id === question.syllabusSectionId,
      );
      return section && section.questionPart === 1 ? sum + question.marks : sum;
    }, 0);
  }, [questionPaper, syllabusSections]);

  const partBMarks = useMemo(() => {
    return questionPaper.reduce((sum, question) => {
      const section = syllabusSections.find(
        (s) => s.id === question.syllabusSectionId,
      );
      return section && section.questionPart === 2 ? sum + question.marks : sum;
    }, 0);
  }, [questionPaper, syllabusSections]);

  const totalMarks = useMemo(() => {
    return partAMarks + partBMarks;
  }, [partAMarks, partBMarks]);

  /**
   * Checks if the total marks for a section are within the min and max weightage constraints.
   *
   * @param {any[]} questions - The list of questions in the section.
   * @param {any} syllabusSection - The syllabus section containing min and max weightage.
   * @returns {{ isValid: boolean; message: string }} - Validation result and message.
   */
  const validateSectionMarks = (questions: any[], syllabusSection: any) => {
    const sectionMarks = questions.reduce((sum, q) => sum + q.marks, 0);
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
  };

  useEffect(() => {
    const newInvalidMarksSections = questionPaper.reduce((acc, item) => {
      const section = syllabusSections.find(
        (s) => s.id === item.syllabusSectionId,
      );
      if (section) {
        const existingSection = acc.find(
          (s) => s.syllabusSectionId === item.syllabusSectionId,
        );
        if (existingSection) {
          existingSection.questions.push(item);
        } else {
          acc.push({
            syllabusSectionId: item.syllabusSectionId,
            questions: [item],
            serialNumber: section.serialNumber,
            minWeightage: section.minWeightage,
            maxWeightage: section.maxWeightage,
          });
        }
      }
      return acc;
    }, [] as any[]);

    const validations = newInvalidMarksSections.map((section) =>
      validateSectionMarks(section.questions, section),
    );

    const filteredInvalidSections = newInvalidMarksSections
      .map((section, index) => ({
        section,
        validation: validations[index],
      }))
      .filter(({ validation }) => !validation.isValid)
      .map(({ section, validation }) => ({
        syllabusSectionId: section.syllabusSectionId,
        message: validation.message,
      }));

    setInvalidMarksSections(filteredInvalidSections);
  }, [questionPaper, syllabusSections]);

  const handleAddButtonClick = (sectionId: any) => {
    setCurrentSectionId(sectionId);
    setDrawerVisible(true);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '90%' }}>
        <QuestionPaperPDF
          questionPaper={questionPaper}
          syllabusSections={syllabusSections}
        />
        <div
          style={{
            overflowY: 'auto',
            maxHeight: '800px',
            // width: '90%',
            // padding: '0px 40px',
          }}
        >
          {['Part A', 'Part B'].map((part, partIndex) => (
            <div key={part}>
              <Title level={3}>{part}</Title>
              {questionPaper
                .reduce((acc, item) => {
                  const section = syllabusSections.find(
                    (s) => s.id === item.syllabusSectionId,
                  );
                  if (section && section.questionPart === partIndex + 1) {
                    const existingSection = acc.find(
                      (s) => s.syllabusSectionId === item.syllabusSectionId,
                    );
                    if (existingSection) {
                      existingSection.questions.push(item);
                    } else {
                      acc.push({
                        syllabusSectionId: item.syllabusSectionId,
                        questions: [item],
                        serialNumber: section.serialNumber,
                        minWeightage: section.minWeightage,
                        maxWeightage: section.maxWeightage,
                      });
                    }
                  }
                  return acc;
                }, [])
                .sort((a, b) => a.serialNumber - b.serialNumber)
                .map((section) => {
                  const sectionMarksValidation = validateSectionMarks(
                    section.questions,
                    section,
                  );
                  return (
                    <div key={section.syllabusSectionId}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          padding: '10px 0px',
                          paddingRight: '20px',
                          // backgroundColor: 'lightgray',
                          // borderRadius: '10px',
                        }}
                      >
                        <Title level={4}>
                          Syllabus Section:{' '}
                          {syllabusSections.find(
                            (s) => s.id === section.syllabusSectionId,
                          )?.title || section.syllabusSectionId}
                        </Title>
                        <Button
                          type="primary"
                          ghost
                          icon={<PlusSquareOutlined />}
                          onClick={() => {
                            handleAddButtonClick(section.syllabusSectionId);
                            // call prop function to add question to this section
                          }}
                        >
                          Add question to this section
                        </Button>
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
                          textAlign: 'right',
                          marginTop: '10px',
                          marginBottom: '5px',
                          paddingRight: '20px',
                        }}
                      >
                        Total Marks for this Section:{' '}
                        {section.questions.reduce(
                          (sum, question) => sum + question.marks,
                          0,
                        )}
                      </div>
                      <div
                        style={{
                          textAlign: 'right',
                          // marginTop: '10px',
                          // marginBottom: '20px',
                          paddingRight: '20px',
                        }}
                      >
                        {!sectionMarksValidation.isValid && (
                          <Typography.Text
                            type="danger"
                            style={{ marginLeft: '10px' }}
                          >
                            {sectionMarksValidation.message}
                          </Typography.Text>
                        )}
                      </div>
                    </div>
                  );
                })}
              <div
                style={{
                  textAlign: 'right',
                  marginTop: '20px',
                  marginBottom: '40px',
                  fontWeight: 'bold',
                  paddingRight: '20px',
                }}
              >
                Total Marks for {part}:{' '}
                {questionPaper
                  .filter((q) => {
                    const section = syllabusSections.find(
                      (s) => s.id === q.syllabusSectionId,
                    );
                    return section && section.questionPart === partIndex + 1;
                  })
                  .reduce((sum, question) => sum + question.marks, 0)}
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
            Total Marks for Question Paper: {totalMarks}
          </div>
        </div>
        <AddQuestionDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          onAddQuestions={addQuestionsToPaper}
          currentSectionId={currentSectionId}
          currentSectionTitle={
            syllabusSections.find((s) => s.id === currentSectionId)?.title ||
            currentSectionId
          }
          currentQuestionPaper={questionPaper}
        />
      </div>
    </div>
  );
}

export default QuestionPaperDisplay;
