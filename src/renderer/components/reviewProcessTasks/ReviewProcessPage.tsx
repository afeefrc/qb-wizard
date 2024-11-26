import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal, Button, Tabs, Card, Tag, Switch, Alert } from 'antd';
import { ProfileTwoTone, LayoutTwoTone } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import SyllabusSectionList from './SyllabusSectionList';
import QuestionBankEditTask from './QuestionBankEditTask';
import { AppContext } from '../../context/AppContext';

interface LocationState {
  unit: string;
  renderContent: {
    id: string;
    unit: string;
    description: string;
    members: string[];
    chairman: string;
    status: string;
  };
}

const onChange = (key: string) => {
  console.log(key);
};

function ReviewProcessPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const appContext = React.useContext(AppContext);
  const {
    examiners,
    syllabusSections,
    handleUpdateReviewPanel,
    handleAddUserActivityLog,
  } = appContext || {};
  const matchingChairman = examiners.find(
    (examiner: any) => examiner.id === state.renderContent.chairman,
  );
  const matchingExaminers = examiners.filter(
    (examiner: any) =>
      state.renderContent.members.includes(examiner.id) &&
      examiner.id !== state.renderContent.chairman,
  );

  console.log('syllabusSections', syllabusSections);

  useEffect(() => {
    console.log('Location object:', location);
    console.log('State:', location.state);
  }, [location]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [reviewStatus, setReviewStatus] = useState(state.renderContent.status);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Syllabus and weightage',
      children: <SyllabusSectionList unitName={state.unit} />,
      icon: <ProfileTwoTone twoToneColor="#eb2f96" />,
    },
    {
      key: '2',
      label: 'Question Bank',
      children: <QuestionBankEditTask unitName={state.unit} />,
      icon: <LayoutTwoTone twoToneColor="#eb2f96" />,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        minWidth: '100vw',
        backgroundColor: '#f0f2f5',
        // overflowY: 'auto',
        // maxHeight: '100vh',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100vh',
          // maxWidth: '800px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          // boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Card title="Question Bank Review Process">
          {/* <h2>Review Process</h2> */}
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
              <div className="create-review-panel-unitname">{state.unit}</div>
              <div>
                <div>
                  Panel Members: {matchingChairman?.examinerName} ( Chairman ),{' '}
                  {matchingExaminers
                    .map((examiner: any) => examiner.examinerName)
                    .join(' , ')}
                </div>
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
                  {reviewStatus === 'In Progress' ? (
                    <Tag
                      color="success"
                      style={{
                        fontSize: '16px',
                        border: 'none',
                        padding: '4px 8px',
                      }}
                    >
                      {reviewStatus}
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
                      {reviewStatus}
                    </Tag>
                  )}
                </div>
              </div>
              {/* <ul> */}
              {/* <li>ID: {state.renderContent.id}</li> */}
              {/* {state.renderContent.description && (
                  <li>Description: {state.renderContent.description}</li>
                )}
                <li>Chairman: {matchingChairman?.examinerName}</li>
                <li>
                  Members:{' '}
                  {matchingExaminers
                    .map((examiner: any) => examiner.examinerName)
                    .join(', ')}
                </li> */}
              {/* <li>Status: {state.renderContent.status}</li> */}
              {/* </ul> */}
            </div>
          ) : (
            <p>No state information available</p>
          )}
          <div>
            <Button onClick={handleBackClick}>Go Back</Button>
            {/* <Button
              onClick={() => {
                console.log('save draft');
              }}
            >
              Save Draft
            </Button> */}
            {/* <Button onClick={}>Submit </Button> */}
            <Button
              type="primary"
              onClick={() => {
                console.log('Forward to Training Incharge');
                // Add logic here to handle forwarding to Training Incharge
                handleUpdateReviewPanel(state.renderContent.id, {
                  status: 'Submitted',
                });
                handleAddUserActivityLog({
                  user: matchingChairman?.examinerName,
                  members: matchingExaminers
                    .map((examiner: any) => examiner.examinerName)
                    .join(', '),
                  action: `Question bank review process for ${state.renderContent.unit}`,
                  targetType: 'questionBank',
                  unit: state.renderContent.unit,
                  description: 'Review process submitted',
                });
                navigate('/review-panel');
              }}
              style={{ marginLeft: '10px' }}
            >
              Submit to Training Incharge
            </Button>
          </div>
        </Card>

        {/* <Empty
        description={`Question Bank review process page`}
        style={{ padding: '50px' }}
      /> */}

        <Tabs
          type="card"
          defaultActiveKey="2"
          items={items}
          onChange={onChange}
          indicator={{ size: (origin) => origin - 20, align: 'center' }}
        />
      </div>
      <Modal
        title="Start Question Bank review process"
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
              // backgroundColor: 'red',
              margin: '0px 50px',
            }}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p>
                <strong>Unit:</strong> {state.renderContent.unit}
              </p>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p>
                <strong>Chairman:</strong> {matchingChairman?.examinerName}
              </p>
              <p>
                <strong>Members:</strong>{' '}
                {matchingExaminers
                  .map((examiner: any) => examiner.examinerName)
                  .join(', ')}
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
                  Ensure you are part of this review panel.
                </span>
              }
              type="warning"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            {reviewStatus.toLowerCase() === 'initiated' && (
              <>
                <span style={{ marginRight: '10px', fontSize: '16px' }}>
                  Switch the status to start the process
                </span>
                <Switch
                  style={{ boxShadow: 'none' }}
                  checkedChildren="In Progress"
                  unCheckedChildren="Initiated"
                  checked={reviewStatus === 'In Progress'}
                  onChange={(checked) => {
                    setReviewStatus(checked ? 'In Progress' : 'Initiated');
                    handleUpdateReviewPanel(state.renderContent.id, {
                      status: checked ? 'In Progress' : 'Initiated',
                    });
                    handleAddUserActivityLog({
                      user: matchingChairman?.examinerName,
                      members: matchingExaminers
                        .map((examiner: any) => examiner.examinerName)
                        .join(', '),
                      action: `Question bank review process for ${state.renderContent.unit}`,
                      targetType: 'questionBank',
                      unit: state.renderContent.unit,
                      description: 'Review process started',
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
            disabled={reviewStatus !== 'In Progress'}
          >
            Proceed
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default ReviewProcessPage;
