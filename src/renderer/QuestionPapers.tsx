import React, { useContext } from 'react';
import { Tabs, Space } from 'antd';
import { HomeFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import './ToolbarPage.css'; // Import the CSS file for styling
import QuestionBankDisplay from './components/QuestionBankDisplay';
import ViewQuestionPapers from './components/ViewQuestionPapers';

function QuestionPapers() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const appContext = useContext(AppContext);
  const { settings, questions, handleDeleteQuestion } = appContext || {};

  const units = settings?.unitsApplicable || [];
  console.log(units);

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
        <div className="rolepage-title">Previous Question Papers</div>
      </div>
      <div className="rolepage-container">
        <div style={{ width: '95%', marginLeft: '2.5%' }}>
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
                <div className="scroll-view">
                  <ViewQuestionPapers unitName={unit} />
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

export default QuestionPapers;
