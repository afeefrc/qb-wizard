import React from 'react';
import { Table, Typography, Button } from 'antd';
import { SyncOutlined, PlusSquareOutlined } from '@ant-design/icons';
import QuestionPaperPDF from '../utils/QuestionPaperPDF';

const { Title } = Typography;

interface QuestionPaperDisplayProps {
  questionPaper: any[];
  syllabusSections: any[];
  columns: any[];
  replaceQuestion: (question: any) => void;
}

function QuestionPaperDisplay({
  questionPaper,
  syllabusSections,
  columns,
  replaceQuestion,
}: QuestionPaperDisplayProps) {
  const totalMarks = questionPaper.reduce(
    (sum, question) => sum + question.marks,
    0,
  );

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
                      });
                    }
                  }
                  return acc;
                }, [])
                .sort((a, b) => a.serialNumber - b.serialNumber)
                .map((section) => (
                  <div key={section.syllabusSectionId}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingRight: '20px',
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
                          console.log('add question to this section');
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
                        marginBottom: '20px',
                        paddingRight: '20px',
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
      </div>
    </div>
  );
}

export default QuestionPaperDisplay;
