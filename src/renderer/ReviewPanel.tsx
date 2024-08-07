import React from 'react';
import { useNavigate } from 'react-router-dom';
import MenuColumn from './components/MenuColumn';
import DashBoard from './components/DashBoard';
import { reviewPanelMenuContent as menuItems } from './SampleData'; // Import the sample data
import './RolePage.css'; // Import the CSS file for styling
import { useUser } from './context/UserContext';

// const menuItems = reviewPanelMenuContent;
const contentList = Array.from({ length: 3 }, (_, i) => `Content ${i + 1}`); // sample data

function ReviewPanel() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const { user } = useUser();

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
        <div className="rolepage-title">QB review panel section</div>
      </div>
      <div className="rolepage-container">
        <div className="menu-box">
          {/* <MenuColumn menuItems={menuItems} onButtonClick={handleButtonClick} /> */}
        </div>
        <div className="content-box">
          <div className="rolepage-hello">
            <DashBoard contentList={contentList} />
            {/* Pass the contentList prop */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewPanel;
