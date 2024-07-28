import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuColumn from './MenuColumn';
import { trgInchargeMenuContent as menuItems } from './SampleData'; // Import the sample data
import DashBoard from './Dashboard';
import EditUnits from './EditUnits';
import './RolePage.css'; // Import the CSS file for styling

const contentList = Array.from({ length: 3 }, (_, i) => `Content ${i + 1}`); // sample data

function TrgIncharge() {
  const [isEditUnits, setIsEditUnits] = useState(false);

  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const handleButtonClick = (buttonId: string, menuItemId: number) => {
    console.log(`Button clicked: ${buttonId} and menu item: ${menuItemId}`);
    // Add your logic here for handling button clicks
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
          <div>settings</div>
          <button type="button" onClick={() => setIsEditUnits(!isEditUnits)}>
            Edit Units
          </button>
        </div>
        <div className="content-box">
          <div className="rolepage-hello">
            {isEditUnits ? (
              <EditUnits />
            ) : (
              <DashBoard contentList={contentList} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrgIncharge;
