import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  setIsSubmitDisabled: (disabled: boolean) => void;
}

interface RenderSectionProps {
  section: {
    syllabusSectionId: string;
    questions: any[];
  };
  columns: any[];
  validateSectionMarks: (
    questions: any[],
    section: any,
  ) => { isValid: boolean; message: string };
  handleAddButtonClick: (sectionId: string) => void;
  syllabusSections: any[];
}

const RenderSection = React.memo(
  ({
    section,
    columns,
    validateSectionMarks,
    handleAddButtonClick,
    syllabusSections,
  }: RenderSectionProps) => {
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
          }}
        >
          <Title level={4}>
            Syllabus Section:{' '}
            {syllabusSections.find((s) => s.id === section.syllabusSectionId)
              ?.title || section.syllabusSectionId}
          </Title>
          <Button
            type="primary"
            ghost
            icon={<PlusSquareOutlined />}
            onClick={() => handleAddButtonClick(section.syllabusSectionId)}
          >
            Add question to this section
          </Button>
        </div>
        <Table
          dataSource={section.questions.sort((a, b) => a.marks - b.marks)}
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
          {section.questions.reduce((sum, question) => sum + question.marks, 0)}
        </div>
        <div
          style={{
            textAlign: 'right',
            paddingRight: '20px',
          }}
        >
          {!sectionMarksValidation.isValid && (
            <Typography.Text type="danger" style={{ marginLeft: '10px' }}>
              {sectionMarksValidation.message}
            </Typography.Text>
          )}
        </div>
      </div>
    );
  },
);

function QuestionPaperDisplay({
  questionPaper,
  syllabusSections,
  columns,
  addQuestionsToPaper,
  setIsSubmitDisabled,
}: QuestionPaperDisplayProps) {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [currentSectionId, setCurrentSectionId] = useState<any>(null);

  const validateSectionMarks = useCallback(
    (questions: any[], syllabusSection: any) => {
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
    },
    [],
  );

  const [partAMarks, partBMarks] = useMemo(() => {
    let partA = 0;
    let partB = 0;
    questionPaper.forEach((question) => {
      const section = syllabusSections.find(
        (s) => s.id === question.syllabusSectionId,
      );
      if (section) {
        if (section.questionPart === 1) partA += question.marks;
        else if (section.questionPart === 2) partB += question.marks;
      }
    });
    return [partA, partB];
  }, [questionPaper, syllabusSections]);

  const totalMarks = useMemo(
    () => partAMarks + partBMarks,
    [partAMarks, partBMarks],
  );

  const invalidMarksSections = useMemo(() => {
    const sectionMap = new Map();

    questionPaper.forEach((item) => {
      const section = syllabusSections.find(
        (s) => s.id === item.syllabusSectionId,
      );
      if (section) {
        if (!sectionMap.has(item.syllabusSectionId)) {
          sectionMap.set(item.syllabusSectionId, {
            syllabusSectionId: item.syllabusSectionId,
            questions: [],
            serialNumber: section.serialNumber,
            minWeightage: section.minWeightage,
            maxWeightage: section.maxWeightage,
          });
        }
        sectionMap.get(item.syllabusSectionId).questions.push(item);
      }
    });

    return Array.from(sectionMap.values())
      .map((section) => ({
        section,
        validation: validateSectionMarks(section.questions, section),
      }))
      .filter(({ validation }) => !validation.isValid)
      .map(({ section, validation }) => ({
        syllabusSectionId: section.syllabusSectionId,
        message: validation.message,
      }));
  }, [questionPaper, syllabusSections, validateSectionMarks]);

  useEffect(() => {
    setIsSubmitDisabled(
      invalidMarksSections.length > 0 ||
        partAMarks !== 100 ||
        partBMarks !== 50,
    );
  }, [invalidMarksSections, partAMarks, partBMarks, setIsSubmitDisabled]);

  const handleAddButtonClick = useCallback((sectionId: any) => {
    setCurrentSectionId(sectionId);
    setDrawerVisible(true);
  }, []);

  const renderQuestionPaper = useCallback(() => {
    const sectionMap = new Map();

    questionPaper.forEach((item) => {
      const section = syllabusSections.find(
        (s) => s.id === item.syllabusSectionId,
      );
      if (section) {
        if (!sectionMap.has(section.questionPart)) {
          sectionMap.set(section.questionPart, new Map());
        }
        const partMap = sectionMap.get(section.questionPart);
        if (!partMap.has(item.syllabusSectionId)) {
          partMap.set(item.syllabusSectionId, {
            ...section,
            questions: [],
          });
        }
        partMap.get(item.syllabusSectionId).questions.push(item);
      }
    });

    return ['Part A', 'Part B'].map((part, partIndex) => (
      <div key={part}>
        <Title level={3}>{part}</Title>
        {Array.from(sectionMap.get(partIndex + 1) || [])
          .sort(
            (a, b) => (a[1] as any).serialNumber - (b[1] as any).serialNumber,
          )
          .map(([syllabusSectionId, section]: [string, any]) => (
            <RenderSection
              key={syllabusSectionId}
              section={section}
              columns={columns}
              validateSectionMarks={validateSectionMarks}
              handleAddButtonClick={handleAddButtonClick}
              syllabusSections={syllabusSections}
            />
          ))}
        <div
          style={{
            textAlign: 'right',
            marginTop: '20px',
            marginBottom: '40px',
            fontWeight: 'bold',
            paddingRight: '20px',
          }}
        >
          Total Marks for {part}: {partIndex === 0 ? partAMarks : partBMarks}
        </div>
      </div>
    ));
  }, [
    questionPaper,
    syllabusSections,
    columns,
    validateSectionMarks,
    handleAddButtonClick,
    partAMarks,
    partBMarks,
  ]);

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
          }}
        >
          {renderQuestionPaper()}
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

export default React.memo(QuestionPaperDisplay);
