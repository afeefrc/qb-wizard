import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, List, Typography, Card, Tag } from 'antd';
import { AppContext } from '../../context/AppContext';

interface LocationState {
  unit: string;
  renderContent: {
    id: string;
    unit: string;
    description: string;
    examiner: string;
    examiner_invigilator: string;
    examiner_evaluation: string;
    status: string;
    content: any[];
    deadline: Date | null;
    comments_initiate: string;
    comments_submit: string;
    comments_approval: string;
    comments_forward: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

const { Title, Text } = Typography;

function QuestionPaperProcessPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const appContext = React.useContext(AppContext);
  const { examiners } = appContext || {};

  const state = location.state as LocationState;
  const { unit, renderContent } = state;
  const [questionPaper, setQuestionPaper] = useState<string[]>([]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleGenerateQuestionPaper = () => {
    // Mock question generation (replace with actual logic to fetch from questions store)
    const generatedQuestions = [
      'What is the difference between a compiler and an interpreter?',
      'Explain the concept of object-oriented programming.',
      'Describe the main components of a computer system.',
      // Add more questions as needed
    ];
    setQuestionPaper(generatedQuestions);
  };

  // Add this function to find the matching examiner
  const getExaminerInfo = (examinerId: string) => {
    const matchingExaminer = examiners?.find(
      (examiner) => examiner.id === examinerId,
    );
    return matchingExaminer
      ? `${matchingExaminer.examinerName}, ${matchingExaminer.examinerDesignation} (ATM)`
      : 'Unknown';
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        minWidth: '100vw',
        backgroundColor: '#f0f2f5',
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
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Card>
          <h2>Review Process</h2>
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
              <div className="create-review-panel-unitname">{unit}</div>
              <div>
                <div>Examiner: {getExaminerInfo(renderContent.examiner)}</div>
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
                  {renderContent.status === 'In Progress' ? (
                    <Tag
                      color="success"
                      style={{
                        fontSize: '16px',
                        border: 'none',
                        padding: '4px 8px',
                      }}
                    >
                      {renderContent.status}
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
                      {renderContent.status}
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
            <Button
              type="primary"
              onClick={() => {
                console.log('Forward to Training Incharge');
                // Add logic here to handle forwarding to Training Incharge

                // navigate('/examiner-process');
                console.log('question paper submitted', renderContent.examiner);
              }}
              style={{ marginLeft: '10px' }}
            >
              Submit to Training Incharge
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default QuestionPaperProcessPage;
