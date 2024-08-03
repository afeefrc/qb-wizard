import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuColumn from './components/MenuColumn';
import { trgInchargeMenuContent as menuItems } from './SampleData'; // Import the sample data
import DashBoard from './components/DashBoard';
import ListOfExaminers from './components/ListOfExaminers';
import StationSettings from './components/StationSettings';
import './RolePage.css';
import BodyContentCard from './components/BodyContentCard';
import CreateReviewPanel from './components/trgInchargeTasks/createReviewPanel';

const contentList = Array.from({ length: 3 }, (_, i) => `Content ${i + 1}`); // sample data

function TrgIncharge() {
  // const [isEditStationSettings, setIsEditStationSettings] = useState(false);
  // const [showListOfExaminers, setShowListOfExaminers] = useState(false);
  const [BtnPressed, setBtnPressed] = useState<{
    MenuId?: number;
    BtnId?: number;
  }>({});

  console.log(BtnPressed);

  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const handleButtonClick = (menuId: number, btnId: number) => {
    setBtnPressed({ MenuId: menuId, BtnId: btnId });
  };

  const handleClose = () => {
    setBtnPressed({});
  };

  const renderContent = () => {
    const contentMap = {
      '0-0': {
        title: 'Update title here',
        component: <div />,
      },
      '2-0': {
        title: 'Create Review Panel',
        component: <CreateReviewPanel unit="ADC" close={handleClose} />,
      },
      '4-0': {
        title: 'List of Examiners',
        component: <ListOfExaminers />,
      },
      '4-1': {
        title: 'Station Settings',
        component: <StationSettings />,
      },
      // Add more mappings as needed
    };

    const key = `${BtnPressed.MenuId}-${BtnPressed.BtnId}`;
    const content = contentMap[key];

    if (content) {
      return (
        <BodyContentCard onClose={handleClose} title={content.title}>
          {content.component}
        </BodyContentCard>
      );
    }

    return <DashBoard contentList={contentList} />;
  };

  return (
    <div>
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
          <MenuColumn
            BtnPressed={BtnPressed}
            handleButtonClick={handleButtonClick}
          />
          {/* Settings buttons below */}
          {/* <div className="menu-section-title">Settings</div>
          <div className="menu-section-container">
            <div className="menu-btn-container">
              <button
                type="button"
                className="menu-buttons"
                onClick={handleListOfExaminersBtn}
              >
                List of Examiners
              </button>
            </div>
            <div className="menu-btn-container">
              <button
                type="button"
                className="menu-buttons"
                onClick={handleStationSettingsBtn}
              >
                Station Settings
              </button>
            </div>
          </div> */}
        </div>
        <div className="content-box">
          <div className="rolepage-hello">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default TrgIncharge;
