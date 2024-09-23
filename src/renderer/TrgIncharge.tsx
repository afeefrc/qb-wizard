import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuList from './components/MenuAntd';
import { Empty, message } from 'antd';
import DashBoard from './components/DashBoard';
import ListOfExaminers from './components/ListOfExaminers';
import StationSettings from './components/StationSettings';
import './RolePage.css';
import BodyContentCard from './components/BodyContentCard';
import CreateReviewPanel from './components/trgInchargeTasks/createReviewPanel';
import ExaminerAssignment from './components/trgInchargeTasks/AssignExaminer';
import ActivityLogs from './components/trgInchargeTasks/ActivityLogs';
import QuestionLogs from './components/trgInchargeTasks/QuestionLogs';
import QuestionBankDisplay from './components/QuestionBankDisplay';
import ViewQuestionPapers from './components/ViewQuestionPapers';
// import { useUser } from './context/UserContext';

const trgInchargeMenuTitles = [
  'View Question Banks',
  'View Question Papers',
  'Create Review Panel',
  'Assign Examiner to prepare Question Paper',
];

function TrgIncharge() {
  // const [isEditStationSettings, setIsEditStationSettings] = useState(false);
  // const [showListOfExaminers, setShowListOfExaminers] = useState(false);
  const [BtnPressed, setBtnPressed] = useState<{
    MenuItem?: string;
    BtnName?: string;
  }>({ MenuItem: 'dashboard', BtnName: 'dashboard' });

  console.log('BtnPressed', BtnPressed);

  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };
  const [messageApi, contextHolder] = message.useMessage();
  // const { user } = useUser();

  const handleButtonClick = (MenuItem: string, BtnName: string) => {
    setBtnPressed({ MenuItem, BtnName });
  };

  const handleClose = () => {
    setBtnPressed({ MenuItem: 'dashboard', BtnName: 'dashboard' });
  };

  const renderContent = (menuTitles: string[] = []) => {
    const contentMap = {
      '0': {
        title: menuTitles[0],
        component: (
          // <Empty description={`Under development ${BtnPressed.BtnName}`} />
          <QuestionBankDisplay unitName={BtnPressed.BtnName} />
        ),
      },
      '1': {
        title: menuTitles[1],
        component: <ViewQuestionPapers unitName={BtnPressed.BtnName} />,
      },
      '2': {
        title: menuTitles[2],
        component: (
          <CreateReviewPanel unit={BtnPressed.BtnName} close={handleClose} />
        ),
      },
      '3': {
        title: menuTitles[3],
        component: (
          <ExaminerAssignment unit={BtnPressed.BtnName} close={handleClose} />
        ),
      },
      settings: (() => {
        if (BtnPressed.BtnName === 'examinerList') {
          return { component: <ListOfExaminers />, title: 'List of Examiners' };
        }
        if (BtnPressed.BtnName === 'stationSettings') {
          return { component: <StationSettings />, title: 'Station Settings' };
        }
        return null;
      })(),
      informations: (() => {
        if (BtnPressed.BtnName === 'logs') {
          return {
            component: <ActivityLogs />,
            title: 'Activity logs',
          };
        }
        if (BtnPressed.BtnName === 'questionLogs') {
          return {
            component: <QuestionLogs />,
            title: 'Questions change Log',
          };
        }
        if (BtnPressed.BtnName === 'reports') {
          return {
            component: (
              <Empty description={`Under development ${BtnPressed.BtnName}`} />
            ),
            title: 'reports',
          };
        }
        return null;
      })(),
      // Add more mappings as needed
    };

    // const key = `${BtnPressed.MenuId}-${BtnPressed.BtnName}`;
    const key = `${BtnPressed.MenuItem}`;
    const content = contentMap[key];

    if (content) {
      return (
        <BodyContentCard onClose={handleClose} title={content.title}>
          {content.component}
        </BodyContentCard>
      );
    }

    return <DashBoard />;
  };

  return (
    <div>
      {contextHolder}
      <div className="rolepage-header">
        <div className="button-container">
          <button type="button" onClick={handleBackClick}>
            Back to Home
          </button>
        </div>
        <div className="rolepage-title">Training incharge section</div>
      </div>
      <div className="rolepage-container">
        <div className="menu-box">
          <MenuList
            BtnPressed={BtnPressed}
            handleButtonClick={handleButtonClick}
            menuTitles={trgInchargeMenuTitles}
          />
        </div>
        <div className="content-box">
          <div className="rolepage-hello">
            {renderContent(trgInchargeMenuTitles)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrgIncharge;
