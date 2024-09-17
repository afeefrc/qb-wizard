import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Empty, Button } from 'antd';
import DashBoard from './components/DashBoard';
import BodyContentCard from './components/BodyContentCard';
import MenuList from './components/MenuAntd';
import './RolePage.css'; // Import the CSS file for styling
import { useUser } from './context/UserContext';
import QuestionBankDisplay from './components/QuestionBankDisplay';

function ReviewPanel() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate('/');
  };
  const [BtnPressed, setBtnPressed] = useState<{
    MenuItem?: string;
    BtnName?: string;
  }>({ MenuItem: 'dashboard', BtnName: 'dashboard' }); // Initialize the BtnPressed state

  const { user } = useUser();

  const reviewPanelMenuTitles = [
    'View Question Banks',
    'Comments and Feedbacks',
    'Activity logs',
    // 'Group',
  ];

  const handleButtonClick = (MenuItem: string, BtnName: string) => {
    setBtnPressed({ MenuItem: MenuItem, BtnName: BtnName });
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
        component: (
          <Empty description={`Under development ${BtnPressed.BtnName}`} />
        ),
      },
      '2': {
        title: menuTitles[2],
        component: (
          <Empty description={`Under development ${BtnPressed.BtnName}`} />
        ),
      },
      // '3': {
      //   title: 'Assign examiner to prepare Question Paper',
      //   component: <div>Build component here {BtnPressed.BtnName}</div>,
      // },
      // 'settings': (() => {
      //   if (BtnPressed.BtnName === 'examiner-list') {
      //     return {
      //       component: <ListOfExaminers />,
      //       title: 'List of Examiners',
      //     };
      //   }
      //   if (BtnPressed.BtnName === 'station-settings') {
      //     return {
      //       component: <StationSettings />,
      //       title: 'List of Examiners',
      //     };
      //   }
      //   return null;
      // })(),
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
      <div className="rolepage-header">
        <div className="button-container">
          <button type="button" onClick={handleBackClick}>
            Back to Home
          </button>
        </div>
        <div className="rolepage-title">QB review panel section</div>
      </div>
      <div className="rolepage-container">
        <div className="menu-box">
          {/* <MenuColumn BtnPressed={} handleButtonClick={} /> */}
          <MenuList
            BtnPressed={BtnPressed}
            handleButtonClick={handleButtonClick}
            menuTitles={reviewPanelMenuTitles}
          />
        </div>
        <div className="content-box">
          <div className="rolepage-hello">
            <div className="rolepage-hello">
              {renderContent(reviewPanelMenuTitles)}
            </div>
            {/* <DashBoard /> */}
            {/* Pass the contentList prop */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewPanel;
