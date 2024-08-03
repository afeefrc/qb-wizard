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
    BtnName?: string;
  }>({});

  console.log('BtnPressed', BtnPressed);

  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const handleButtonClick = (MenuId: number, BtnName: string) => {
    setBtnPressed({ MenuId: MenuId, BtnName: BtnName });
  };

  const handleClose = () => {
    setBtnPressed({});
  };

  const renderContent = () => {
    const contentMap = {
      '0': {
        title: 'View Question Banks',
        component: <div>Build component here {BtnPressed.BtnName}</div>,
      },
      '1': {
        title: 'View Question Papers',
        component: <div>Build component here {BtnPressed.BtnName}</div>,
      },
      '2': {
        title: 'Create Review Panel',
        component: (
          <CreateReviewPanel unit={BtnPressed.BtnName} close={handleClose} />
        ),
      },
      '3': {
        title: 'Assign examiner to prepare Question Paper',
        component: <div>Build component here {BtnPressed.BtnName}</div>,
      },
      '4': (() => {
        if (BtnPressed.BtnName === 'examiner-list') {
          return { component: <ListOfExaminers />, title: 'List of Examiners' };
        }
        if (BtnPressed.BtnName === 'station-settings') {
          return { component: <StationSettings />, title: 'List of Examiners' };
        }
        return null;
      })(),
      // Add more mappings as needed
    };

    // const key = `${BtnPressed.MenuId}-${BtnPressed.BtnName}`;
    const key = `${BtnPressed.MenuId}`;
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
