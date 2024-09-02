import React from 'react';
import { Card, Button, Tabs, Tag, message } from 'antd';
import type { TabsProps } from 'antd';
import { AppContext } from '../../context/AppContext';
// import SyllabusSectionList from '../reviewProcessTasks/SyllabusSectionList';

interface RenderContent {
  id: string;
  unit: string;
  description: string;
  examiner: string;
  examiner_invigilator: string;
  examiner_evaluation: string;
  status: string;
  content: any[];
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
  const { examiners } = appContext || {};

  const [messageApi, contextHolder] = message.useMessage();

  console.log('content', content);

  const successMessage = () => {
    messageApi.open({
      type: 'success',
      content: 'This is a success message',
    });
  };

  // const matchingChairman = examiners.find(
  //   (examiner: any) => examiner.id === content.chairman,
  // );
  // const matchingExaminers = examiners.filter(
  //   (examiner: any) =>
  //     content.members.includes(examiner.id) && examiner.id !== content.chairman,
  // );

  const items: TabsProps['items'] = [
    {
      key: '2',
      label: 'Question Paper',
      children: <div>Question Paper</div>,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: '10px',
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
              type="primary"
              onClick={() => {
                // handleApplyAllPendingChanges();
                // handleDeleteReviewPanel(content.id);
                successMessage();
                setTimeout(() => {
                  onClose();
                }, 1000);
                console.log('Approve Question Bank');
              }}
              style={{ marginLeft: '25px' }}
            >
              Approve Question Bank
            </Button>
          </div>
        </Card>
      </div>

      <Tabs
        type="card"
        defaultActiveKey="2"
        items={items}
        style={{
          width: '90%',
          backgroundColor: 'white',
          padding: '10px 20px',
        }}
      />
    </div>
  );
}

export default QPapprovalProcessPage;
