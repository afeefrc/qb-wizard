import React from 'react';
import { useNavigate } from 'react-router-dom';
import MenuColumn from './MenuColumn';
import './RolePage.css'; // Import the CSS file for styling

function Examiner() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const menuItems = [
    {
      id: 'item1',
      title: 'Generate Question Paper',
      buttons: [
        {
          id: 'btn1',
          label: 'ADC',
          onClick: () => console.log('Button 1 clicked'),
        },
        {
          id: 'btn2',
          label: 'ACC',
          onClick: () => console.log('Button 2 clicked'),
        },
      ],
    },
    {
      id: 'item2',
      title: 'View Question Bank',
      buttons: [
        {
          id: 'btn3',
          label: 'ADC',
          onClick: () => console.log('Button 3 clicked'),
        },
        {
          id: 'btn4',
          label: 'ACC',
          onClick: () => console.log('Button 4 clicked'),
        },
      ],
    },
  ];

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
          <MenuColumn menuItems={menuItems} />
        </div>
        <div className="content-box">
          <div className="rolepage-hello">
            <h3>Dash board</h3>
            <div className="scroll-view">
              {/* Add your scrollable content here */}
              <p>Content 1</p>
              <p>Content 2</p>
              <p>Content 3</p>
              <p>Content 4</p>
              <p>Content 5</p>
              <p>Content 6</p>
              <p>Content 7</p>
              <p>Content 8</p>
              <p>Content 9</p>
              <p>Content 10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Examiner;
