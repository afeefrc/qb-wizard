import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuColumn from './components/MenuColumn';
import { trgInchargeMenuContent as menuItems } from './SampleData'; // Import the sample data
import DashBoard from './components/DashBoard';
import ListOfExaminers from './components/ListOfExaminers';
import StationSettings from './components/StationSettings';
import './RolePage.css';
import BodyContentCard from './components/BodyContentCard';

const contentList = Array.from({ length: 3 }, (_, i) => `Content ${i + 1}`); // sample data

function TrgIncharge() {
  const [isEditStationSettings, setIsEditStationSettings] = useState(false);
  const [showListOfExaminers, setShowListOfExaminers] = useState(false);

  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const handleButtonClick = (buttonId: string, menuItemId: number) => {
    console.log(`Button clicked: ${buttonId} and menu item: ${menuItemId}`);
    // Add your logic here for handling button clicks
  };

  const handleStationSettingsBtn = () => {
    setIsEditStationSettings(!isEditStationSettings);
    setShowListOfExaminers(false);
  };

  const handleListOfExaminersBtn = () => {
    setIsEditStationSettings(false);
    setShowListOfExaminers(!showListOfExaminers);
  };

  const handleClose = () => {
    setIsEditStationSettings(false);
    setShowListOfExaminers(false);
  };

  const renderContent = () => {
    if (showListOfExaminers) {
      return (
        <BodyContentCard onClose={handleClose} title="List of Examiners">
          <ListOfExaminers />
        </BodyContentCard>
      );
    }
    if (isEditStationSettings) {
      return (
        <BodyContentCard onClose={handleClose} title="Station Settings">
          <StationSettings />
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
          <MenuColumn menuItems={menuItems} onButtonClick={handleButtonClick} />
          {/* Settings buttons below */}
          <div className="menu-section-title">Settings</div>
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
          </div>
        </div>
        <div className="content-box">
          <div className="rolepage-hello">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default TrgIncharge;
