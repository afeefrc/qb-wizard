import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Tabs, Tag } from 'antd';
import type { TabsProps } from 'antd';
import { AppContext } from '../../context/AppContext';
import SyllabusSectionList from '../reviewProcessTasks/SyllabusSectionList';
import QuestionBankApprovalTask from './QuestionBankApprovalTask';

interface LocationState {
  unit: string;
  renderContent: {
    id: string;
    unit: string;
    description: string;
    members: string[];
    chairman: string;
    status: string;
    deadline?: Date;
  };
}

function ApprovalProcessPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const appContext = React.useContext(AppContext);
  const { examiners, handleUpdateReviewPanel } = appContext || {};

  const matchingChairman = examiners.find(
    (examiner: any) => examiner.id === state.renderContent.chairman,
  );
  const matchingExaminers = examiners.filter(
    (examiner: any) =>
      state.renderContent.members.includes(examiner.id) &&
      examiner.id !== state.renderContent.chairman,
  );

  const handleBackClick = () => {
    navigate(-1);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Syllabus and weightage',
      children: <SyllabusSectionList unitName={state.unit} />,
    },
    {
      key: '2',
      label: 'Question Bank',
      children: <QuestionBankApprovalTask unitName={state.unit} />,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100vw',
        height: '95vh',
        // backgroundColor: 'red',
      }}
    >
      <div
        style={{
          width: '90%',
          // maxWidth: '800px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Card>
          <h2>Approval Process</h2>
          {state && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: '70%',
              }}
            >
              <div className="create-review-panel-unitname">{state.unit}</div>
              <div>
                <div>
                  Panel Members: {matchingChairman?.examinerName} (Chairman),{' '}
                  {matchingExaminers
                    .map((examiner: any) => examiner.examinerName)
                    .join(', ')}
                </div>
                <div>Description: {state.renderContent.description}</div>
                <div>
                  Deadline:{' '}
                  {state.renderContent.deadline
                    ? new Date(state.renderContent.deadline).toLocaleDateString(
                        'en-IN',
                        {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        },
                      )
                    : 'N/A'}
                </div>
                <div>
                  Status:{' '}
                  <Tag
                    color={
                      state.renderContent.status === 'Submitted'
                        ? 'orange'
                        : 'success'
                    }
                  >
                    {state.renderContent.status}
                  </Tag>
                </div>
              </div>
            </div>
          )}
          <div style={{ marginTop: '20px' }}>
            <Button onClick={handleBackClick}>Go Back</Button>
            <Button
              type="primary"
              onClick={() => {
                console.log('Approve Question Bank');
                // handleUpdateReviewPanel(state.renderContent.id, {
                //   status: 'Approved',
                // });
                // navigate('/trg-incharge');
              }}
              style={{ marginLeft: '10px' }}
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
        style={{ marginTop: '20px', width: '90%' }}
      />
    </div>
  );
}

export default ApprovalProcessPage;
