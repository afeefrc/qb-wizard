import React, { useEffect, useContext } from 'react';

import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
// import icon from '../../assets/icon.svg';
import logo from '../../assets/logo.svg';
import './App.css';
import Examiner from './Examiner';
import ReviewPanel from './ReviewPanel';
import TrgIncharge from './TrgIncharge';
import { AppProvider, AppContext } from './AppContext';
import { DemoModeProvider, useDemoMode } from './DemoModeContext';
import QuestionBank from './QuestionBank';
import QuestionPapers from './QuestionPapers';
import Feedbacks from './Feedbacks';
import ActivityLogs from './ActivityLogs';

function Hello() {
  // db test button case

  const appContext = useContext(AppContext);
  const { questions, handleAddQuestion, handleDeleteQuestion } =
    appContext || {};

  const addItem = () => {
    const newItem = {
      unitName: 'Unit1',
      marks: 1,
      questionType: 'MCQ',
      questionText: 'Sample Question?',
      trueAnswer: true,
      answerText: 'Sample Answer',
      keyValuePairs: {},
      image: null,
      linkedQuestion: [],
      mandatory: false,
      difficultyLevel: 'Easy',
      moduleNumber: 1,
      comments: '',
      isReviewed: false,
    };
    if (handleAddQuestion) {
      handleAddQuestion(newItem);
    }
  };

  const { isDemoMode, toggleDemoMode } = useDemoMode();
  useEffect(() => {
    if (isDemoMode) {
      document.body.classList.add('demo-mode');
    } else {
      document.body.classList.remove('demo-mode');
    }
  }, [isDemoMode]);
  // const handleDemoModeClick = () => {
  //   setIsDemoMode(!isDemoMode);
  // };
  const navigate = useNavigate();
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  return (
    <div>
      <div className="Hello">
        <img width="100" alt="icon" src={logo} />
      </div>
      <div className="Hello">
        <div className="centered-heading">
          Welcome to Question Bank Management Suite
        </div>
      </div>
      <div className="Hello">
        <div className="icon-button-container">
          <button
            type="button"
            className="icon-button"
            onClick={() => handleNavigation('/question-bank')}
          >
            <span role="img" aria-label="books">
              📚
            </span>
          </button>
          <div className="icon-button-text">Question Bank</div>
        </div>

        <div className="icon-button-container">
          <button
            type="button"
            className="icon-button"
            onClick={() => handleNavigation('/question-papers')}
          >
            <span role="img" aria-label="paper">
              📜
            </span>
          </button>
          <div className="icon-button-text">Question Papers</div>
        </div>

        <div className="icon-button-container">
          <button
            type="button"
            className="icon-button"
            onClick={() => handleNavigation('/feedbacks')}
          >
            <span role="img" aria-label="folded hands">
              📝
            </span>
          </button>
          <div className="icon-button-text">Feedbacks</div>
        </div>

        <div className="icon-button-container">
          <button
            type="button"
            className="icon-button"
            onClick={() => handleNavigation('/activity-logs')}
          >
            <span role="img" aria-label="folded hands">
              📇
            </span>
          </button>
          <div className="icon-button-text">Activity Log</div>
        </div>

        <div className="icon-button-container">
          <button
            type="button"
            className={`icon-button ${isDemoMode ? 'active' : ''}`}
            onClick={toggleDemoMode}
          >
            <span role="img" aria-label="folded hands">
              🧑‍🏫️
            </span>
          </button>
          <div className="icon-button-text">Demo mode</div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          height: '2px',
          opacity: 0.25,
        }}
      />

      <div className="Hello">
        <button
          type="button"
          className="role-button"
          onClick={() => handleNavigation('/examiner')}
        >
          Examiner
        </button>
        <button
          type="button"
          className="role-button"
          onClick={() => handleNavigation('/review-panel')}
        >
          Review Panel
        </button>
        <button
          type="button"
          className="role-button"
          onClick={() => handleNavigation('/trg-incharge')}
        >
          Trg in-charge
        </button>
      </div>
      <div>
        {/* <button type="button" className="role-button" onClick={addItem}>
          db test button
        </button> */}
        {/* <ul>
          {questions?.map((item) => (
            <li key={item.id}>
              {item.questionText}
              <button
                type="button"
                onClick={() =>
                  handleDeleteQuestion && handleDeleteQuestion(item.id)
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul> */}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DemoModeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Hello />} />
            <Route path="/examiner" element={<Examiner />} />
            <Route path="/review-panel" element={<ReviewPanel />} />
            <Route path="/trg-incharge" element={<TrgIncharge />} />
            <Route path="/question-bank" element={<QuestionBank />} />
            <Route path="/question-papers" element={<QuestionPapers />} />
            <Route path="/feedbacks" element={<Feedbacks />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
          </Routes>
        </Router>
      </DemoModeProvider>
    </AppProvider>
  );
}
