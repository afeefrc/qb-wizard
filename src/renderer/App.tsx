import React, { useEffect, useContext } from 'react';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';
// import { useUser } from './context/UserContext';
import { Dropdown, Button, Space, Avatar, message } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Login } from './Login';
// import icon from '../../assets/icon.svg';
import logo from '../../assets/logo.svg';
import './App.css';
import Examiner from './Examiner';
import ReviewPanel from './ReviewPanel';
import TrgIncharge from './TrgIncharge';
import { AppProvider, AppContext } from './context/AppContext';
import { DemoModeProvider, useDemoMode } from './context/DemoModeContext';
import { UserProvider, useUser } from './context/UserContext';
import QuestionBank from './QuestionBank';
import QuestionPapers from './QuestionPapers';
import Feedbacks from './Feedbacks';
import ActivityLogs from './ActivityLogsPage';
import ReviewProcessPage from './components/reviewProcessTasks/ReviewProcessPage';
import QuestionPaperProcessPage from './components/examinerProcessTasks/QuestionPaperProcessPage';
import UserSettings from './UserSettings';
import Layout from './Layout';

// Protected Route Component
const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  allowedRoles?: string[];
}> = ({ element, allowedRoles }) => {
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated) {
    message.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    message.error(
      `Access restricted. This page is only accessible to Training Incharge.`,
    );
    return <Navigate to="/" replace />;
  }

  return element;
};

function Hello() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const appContext = useContext(AppContext);
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  // db test button case

  const { questions, handleAddQuestion, handleDeleteQuestion } =
    appContext || {};
  const { setUser } = useUser();

  // const addItem = () => {
  //   const newItem = {
  //     unitName: 'Unit1',
  //     marks: 1,
  //     questionType: 'MCQ',
  //     questionText: 'Sample Question?',
  //     trueAnswer: true,
  //     answerText: 'Sample Answer',
  //     keyValuePairs: {},
  //     image: null,
  //     linkedQuestion: [],
  //     mandatory: false,
  //     difficultyLevel: 'Easy',
  //     moduleNumber: 1,
  //     comments: '',
  //     isReviewed: false,
  //   };
  //   if (handleAddQuestion) {
  //     handleAddQuestion(newItem);
  //   }
  // };

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

  const handleNavigation = (path: string) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };
  const handleLogout = () => {
    // Clear the user from context
    setUser(null);

    // Clear any stored tokens or session data
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Optional: Clear any other user-related data from storage
    localStorage.removeItem('userData');

    // Redirect to login page
    navigate('/');
  };

  const userMenuItems = {
    items: [
      {
        key: 'settings',
        label: 'User settings',
        icon: <SettingOutlined />,
        onClick: () => handleNavigation('/user-settings'),
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <div>
      {/* Add this new user info box at the top */}
      {/* {isAuthenticated ? (
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
          <Dropdown menu={userMenuItems} placement="bottomRight">
            <Button
              type="text"
              size="large"
              style={{
                color: '#002C58',
                padding: '30px 20px',
                boxShadow: 'none',
              }}
            >
              <Space size={20}>
                {user?.name}
                <Avatar
                  style={{ backgroundColor: '#002C58' }}
                  icon={<UserOutlined />}
                  size={50}
                />
              </Space>
            </Button>
          </Dropdown>
        </div>
      ) : (
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#002C58',
              padding: '0 20px',
            }}
          >
            Login
          </Button>
        </div>
      )} */}
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
  useEffect(() => {
    if (!window.indexedDB) {
      console.log(
        "Your browser doesn't support a stable version of IndexedDB.",
      );
    } else {
      console.log('IndexedDB is supported.');
    }
  }, []);

  useEffect(() => {
    const closeIndexedDB = () => {
      if (window.indexedDB) {
        const dbName = 'YourDatabaseName'; // Replace with your actual database name
        const request = indexedDB.open(dbName);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          db.close();
          console.log('IndexedDB connection closed');
        };
      }
    };

    window.addEventListener('beforeunload', closeIndexedDB);

    return () => {
      window.removeEventListener('beforeunload', closeIndexedDB);
    };
  }, []);

  return (
    <AppProvider>
      <DemoModeProvider>
        <UserProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Hello />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/examiner"
                  element={
                    <ProtectedRoute
                      element={<Examiner />}
                      allowedRoles={['examiner', 'trgIncharge', 'admin']}
                    />
                  }
                />
                <Route
                  path="/review-panel"
                  element={
                    <ProtectedRoute
                      element={<ReviewPanel />}
                      allowedRoles={[
                        'review-panel',
                        'examiner',
                        'trgIncharge',
                        'admin',
                      ]}
                    />
                  }
                />
                <Route
                  path="/trg-incharge"
                  element={
                    <ProtectedRoute
                      element={<TrgIncharge />}
                      allowedRoles={['trgIncharge', 'admin']}
                    />
                  }
                />
                <Route
                  path="/question-bank"
                  element={<ProtectedRoute element={<QuestionBank />} />}
                />
                <Route
                  path="/question-papers"
                  element={<ProtectedRoute element={<QuestionPapers />} />}
                />
                <Route
                  path="/feedbacks"
                  element={<ProtectedRoute element={<Feedbacks />} />}
                />
                <Route
                  path="/activity-logs"
                  element={<ProtectedRoute element={<ActivityLogs />} />}
                />
                <Route
                  path="/review-process"
                  element={<ProtectedRoute element={<ReviewProcessPage />} />}
                />
                <Route
                  path="/examiner-process"
                  element={
                    <ProtectedRoute element={<QuestionPaperProcessPage />} />
                  }
                />
                <Route
                  path="/user-settings"
                  element={<ProtectedRoute element={<UserSettings />} />}
                />
              </Routes>
            </Layout>
          </Router>
        </UserProvider>
      </DemoModeProvider>
    </AppProvider>
  );
}
