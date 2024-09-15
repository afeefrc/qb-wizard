import React from 'react';
import { Card, Button, Tag, message, Typography } from 'antd';
import { AppContext } from '../../context/AppContext';
import QuestionPaperDisplay from '../examinerProcessTasks/QuestionPaperDisplay';

const { Title } = Typography;

interface RenderContent {
  id: string;
  unit: string;
  description: string;
  examiner: string;
  examiner_invigilator: string;
  examiner_evaluation: string;
  status: string;
  questionPaper: any[];
  archivedQuestionPaper: {
    content: any[];
    syllabusSections: any[];
    archivedAt: Date | null;
  };
  deadline?: Date | null;
  comments_initiate: string;
  comments_submit: string;
  comments_approval: string;
  comments_forward: string;
  createdAt: Date;
  updatedAt: Date;
}

interface QPapprovalProcessPageProps {
  content: RenderContent;
  onClose: () => void;
}

function QPapprovalProcessPage({
  content,
  onClose,
}: QPapprovalProcessPageProps): React.ReactElement {
  const appContext = React.useContext(AppContext);
  const { examiners, syllabusSections, handleUpdateExaminerAssignment } =
    appContext || {};

  const [messageApi, contextHolder] = message.useMessage();

  console.log('content', content);

  const successMessage = () => {
    messageApi.open({
      type: 'success',
      content: 'This is a success message',
    });
  };

  // Define columns for the QuestionPaperDisplay component
  const columns = [
    {
      title: 'S.No',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text, record, index) => index + 1,
      width: '5%',
    },
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      width: '40%',
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
    // Add more columns as needed
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: '10px',
        overflowY: 'auto',
        maxHeight: '75vh',
        // width: '90%',
        // padding: '0px 40px',
      }}
    >
      {contextHolder}
      <div
        style={{
          width: '90%',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <Card bordered={false}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '70%',
            }}
          >
            <div className="create-review-panel-unitname">{content.unit}</div>
            <div>
              <div>
                Examiner:{' '}
                {examiners.find(
                  (examiner: any) => examiner.id === content.examiner,
                )
                  ? `${
                      examiners.find(
                        (examiner: any) => examiner.id === content.examiner,
                      )?.examinerName
                    },  ${
                      examiners.find(
                        (examiner: any) => examiner.id === content.examiner,
                      )?.examinerDesignation
                    } (ATM)`
                  : 'N/A'}
              </div>
              <div>Description: {content.description}</div>
              <div>
                Deadline:{' '}
                {content.deadline
                  ? new Date(content.deadline).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </div>
              <div>
                Status:{' '}
                <Tag
                  color={content.status === 'Submitted' ? 'orange' : 'success'}
                >
                  {content.status}
                </Tag>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Button
              onClick={() => {
                handleUpdateExaminerAssignment(content.id, {
                  ...content,
                  status: 'In Progress',
                });
                successMessage();
                setTimeout(() => {
                  onClose();
                }, 500);
                console.log('Status set to In Progress');
              }}
              style={{ marginRight: '10px' }}
            >
              Send back to Examiner
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleUpdateExaminerAssignment(content.id, {
                  ...content,
                  status: 'Approved',
                });
                successMessage();
                setTimeout(() => {
                  onClose();
                }, 500);
                console.log('Approve Question Bank');
              }}
              style={{ marginLeft: '25px' }}
            >
              Approve Question Paper
            </Button>
          </div>
        </Card>
      </div>

      <div>
        <QuestionPaperDisplay
          questionPaper={content.archivedQuestionPaper.content}
          syllabusSections={content.archivedQuestionPaper.syllabusSections} // You need to provide the syllabus sections data
          columns={columns}
        />
      </div>
    </div>
  );
}

export default QPapprovalProcessPage;
