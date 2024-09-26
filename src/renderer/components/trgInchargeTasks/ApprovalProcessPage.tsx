import React, { useState } from 'react';
import { Card, Button, Tabs, Tag, message } from 'antd';
import type { TabsProps } from 'antd';
import { AppContext } from '../../context/AppContext';
import SyllabusSectionList from '../reviewProcessTasks/SyllabusSectionList';
import QuestionBankEditTask from '../reviewProcessTasks/QuestionBankEditTask';
import CreateReviewPanel from './createReviewPanel';

interface RenderContent {
  id: string;
  unit: string;
  description: string;
  members: string[];
  chairman: string;
  status: string;
  deadline?: Date;
}

interface ApprovalProcessPageProps {
  content: RenderContent;
  onClose: () => void;
}

function ApprovalProcessPage({
  content,
  onClose,
}: ApprovalProcessPageProps): React.ReactElement {
  const appContext = React.useContext(AppContext);
  const {
    examiners,
    handleUpdateReviewPanel,
    handleApplyAllPendingChanges,
    handleDeleteReviewPanel,
    handleAddUserActivityLog,
  } = appContext || {};

  const [messageApi, contextHolder] = message.useMessage();
  const [isForwardedBtnPressed, setIsForwardedBtnPressed] = useState(false);

  const successMessage = (messageContent: string = 'Operation successful') => {
    messageApi.open({
      type: 'success',
      content: messageContent,
    });
  };

  const matchingChairman = examiners.find(
    (examiner: any) => examiner.id === content.chairman,
  );
  const matchingExaminers = examiners.filter(
    (examiner: any) =>
      content.members.includes(examiner.id) && examiner.id !== content.chairman,
  );

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Syllabus and weightage',
      children: <SyllabusSectionList unitName={content.unit} />,
    },
    {
      key: '2',
      label: 'Question Bank',
      // children: <QuestionBankApprovalTask unitName={content.unit} />,
      children: <QuestionBankEditTask unitName={content.unit} />,
    },
  ];

  const handleForwardToNewReviewPanel = () => {
    handleUpdateReviewPanel(content.id, {
      status: 'Forwarded',
      isArchived: true,
    });
    handleAddUserActivityLog({
      user: 'Trg Incharge',
      action: `Question bank review process for ${content.unit}`,
      targetType: 'questionBank',
      unit: content.unit,
      description: `Terminated the review panel. Members: ${matchingChairman?.examinerName} (Chairman), ${matchingExaminers
        .map((examiner: any) => examiner.examinerName)
        .join(', ')}`,
    });
    successMessage('Forwarded to new Review Panel');

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        // width: '100vw',
        // height: '95vh',
        marginTop: '10px',
      }}
    >
      {contextHolder}
      <div
        style={{
          width: '90%',
          padding: '20px',
          // backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <Card bordered={false}>
          {/* <h3>Approval Process</h3> */}
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
                Panel Members: {matchingChairman?.examinerName} (Chairman),{' '}
                {matchingExaminers
                  .map((examiner: any) => examiner.examinerName)
                  .join(', ')}
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
            {/* <Button onClick={onClose}>Close</Button> */}
            <Button
              ghost
              type="primary"
              onClick={() => {
                handleUpdateReviewPanel(content.id, { status: 'In Progress' });
                handleAddUserActivityLog({
                  user: 'Trg Incharge',
                  action: `Question bank review process for ${content.unit}`,
                  targetType: 'questionBank',
                  unit: content.unit,
                  description: `Question bank review returned back to the panel for rework, Panel Members: ${matchingChairman?.examinerName} (Chairman), ${matchingExaminers
                    .map((examiner: any) => examiner.examinerName)
                    .join(', ')}`,
                });
                successMessage('Question Bank updation sent back to the panel');
                setTimeout(() => {
                  onClose();
                }, 1000);
              }}
              style={{ marginLeft: '20px' }}
            >
              Send back to the panel
            </Button>
            <Button
              ghost
              type="primary"
              onClick={() => setIsForwardedBtnPressed(true)}
              style={{ marginLeft: '25px' }}
            >
              Forward to new Review Panel
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleApplyAllPendingChanges();
                // handleDeleteReviewPanel(content.id);
                handleUpdateReviewPanel(content.id, {
                  status: 'Approved',
                  isArchived: true,
                });
                handleAddUserActivityLog({
                  user: 'Trg Incharge',
                  action: `Question bank review process for ${content.unit}`,
                  targetType: 'questionBank',
                  unit: content.unit,
                  description:
                    'Question bank updated and approved by Training Incharge',
                });
                successMessage('Question Bank updation approved');
                // Delay closing to allow the message to be shown
                setTimeout(() => {
                  onClose();
                }, 1000); // Adjust the delay as needed
                console.log('Approve Question Bank');
                // handleUpdateReviewPanel(content.id, {
                //   status: 'Approved',
                // });
                // onClose();
              }}
              style={{ marginLeft: '25px' }}
            >
              Approve Question Bank
            </Button>
          </div>
          {isForwardedBtnPressed && (
            <div>
              <CreateReviewPanel
                unit={content.unit}
                close={() => setIsForwardedBtnPressed(false)}
                mode="forward"
                onForwarded={handleForwardToNewReviewPanel}
                // editValues={content}
              />
            </div>
          )}
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
        // indicator={{ size: (origin) => origin - 20, align: 'center' }}
      />
    </div>
  );
}

export default ApprovalProcessPage;
