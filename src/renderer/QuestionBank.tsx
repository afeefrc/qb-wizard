import React, { useContext } from 'react';
import { Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import './ToolbarPage.css'; // Import the CSS file for styling
import QuestionBankDisplay from './components/QuestionBankDisplay';

function QuestionBank() {
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
            Back to Home
          </button>
        </div>
        <div className="rolepage-title">Question Bank</div>
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
                  <QuestionBankDisplay unitName={unit} />
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

export default QuestionBank;
