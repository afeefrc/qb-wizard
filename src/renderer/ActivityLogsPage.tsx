import React, { useState, useEffect, useContext } from 'react';
import { Tabs, Space, List, Button, Typography, Empty } from 'antd';
import { HomeFilled, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// import QuestionBankFeedbackBtn from './components/QuestionBankFeedbackBtn';
import ActivityLogs from './components/trgInchargeTasks/ActivityLogs';
import { AppContext } from './context/AppContext';
import { useUser } from './context/UserContext';
import './ToolbarPage.css'; // Import the CSS file for styling

const { Text } = Typography;

function ActivityLogsPage() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const appContext = useContext(AppContext);
  const { settings, examiners, feedback, handleDeleteComment } =
    appContext || {};
  const { user } = useUser();

  const units = settings?.unitsApplicable || [];

  const onChange = (activeKey: string) => {
    console.log('Active tab:', activeKey);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div className="rolepage-header">
        <div className="button-container">
          <button type="button" onClick={handleBackClick}>
            <Space>
              <HomeFilled style={{ padding: '0px 5px', color: '#002C58' }} />
              Back to Home
            </Space>
          </button>
        </div>
        <div className="rolepage-title">Activity Logs</div>
      </div>
      <div className="rolepage-container">
        <div style={{ width: '95%' }}>
          <Tabs
            // type="card"
            size="large"
            centered
            defaultActiveKey="2"
            items={units.map((unit: string) => ({
              key: unit,
              label: (
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    borderRadius: '5px',
                    padding: '5px',
                  }}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;{unit}&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              ),
              children: (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '80%',
                    }}
                  >
                    <div className="scroll-view">
                      <ActivityLogs unitName={unit} />
                    </div>
                  </div>
                </div>
              ),
            }))}
            onChange={onChange}
            indicator={{ size: (origin) => origin - 20, align: 'center' }}
          />
        </div>
      </div>
    </div>
  );
}

export default ActivityLogsPage;
