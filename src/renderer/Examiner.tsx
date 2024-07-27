import React from 'react';
import { useNavigate } from 'react-router-dom';
import MenuColumn from './MenuColumn';
import { examinerMenuContent as menuItems } from './SampleData'; // Import the sample data
import DashBoard from './Dashboard';
import './RolePage.css'; // Import the CSS file for styling

const contentList = Array.from({ length: 3 }, (_, i) => `Content ${i + 1}`); // sample data

function Examiner() {
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
        <div className="rolepage-title">Examiners&#39; section</div>
      </div>
      <div className="rolepage-container">
        <div className="menu-box">
          <MenuColumn menuItems={menuItems} onButtonClick={handleButtonClick} />
        </div>
        <div className="content-box">
          <div className="rolepage-hello">
            <DashBoard contentList={contentList} />
            {/* Pass the content list as a prop */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Examiner;
