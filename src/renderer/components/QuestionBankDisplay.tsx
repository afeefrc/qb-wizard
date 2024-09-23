import React, { useContext, useMemo, useRef } from 'react';
import { Table, Tag, Empty, Typography, Collapse, Button } from 'antd';
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import type { TableColumnsType, TableProps } from 'antd';
import ExportQuestionBank from './utils/ExportQuestionBank';
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

function QuestionBankDisplay({
  unitName,
}: QuestionBankDisplayProps): React.ReactElement {
  const appContext = useContext(AppContext);
  const {
    questions,
    syllabusSections,
    handleDeleteQuestion,
    handleUpdateQuestion,
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
      render: (text: string, record: ColumnDataType) =>
        renderQuestionContent(text, record),
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
      width: '10%',
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
      width: '10%',
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
    //     <div style={{ display: 'flex', gap: '8px' }}>
    //       <Button
    //         size="small"
    //         type="link"
    //         onClick={() =>
    //           handleUpdateQuestion && handleUpdateQuestion(record.id)
    //         }
    //         style={{ padding: '0' }}
    //       >
    //         <EditTwoTone twoToneColor="#52c41a" /> Edit
    //       </Button>
    //       <Button
    //         size="small"
    //         type="link"
    //         onClick={() =>
    //           handleDeleteQuestion && handleDeleteQuestion(record.id)
    //         }
    //         style={{ padding: '0' }}
    //       >
    //         <DeleteTwoTone twoToneColor="#ff4d4f" /> Delete
    //       </Button>
    //     </div>
    //   ),
    // },
  ];

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
      {user?.role === 'trg-incharge' && (
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
