import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuColumn from './components/MenuColumn';
import MenuList from './components/MenuAntd';
import { trgInchargeMenuContent as menuItems } from './SampleData'; // Import the sample data
import DashBoard from './components/DashBoard';
import ListOfExaminers from './components/ListOfExaminers';
import StationSettings from './components/StationSettings';
import './RolePage.css';
import BodyContentCard from './components/BodyContentCard';
import CreateReviewPanel from './components/trgInchargeTasks/createReviewPanel';
import { useUser } from './context/UserContext';

const contentList = Array.from({ length: 3 }, (_, i) => `Content ${i + 1}`); // sample data

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
  const { user } = useUser();

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
        component: <div>Build component here {BtnPressed.BtnName}</div>,
      },
      '1': {
        title: menuTitles[1],
        component: <div>Build component here {BtnPressed.BtnName}</div>,
      },
      '2': {
        title: menuTitles[2],
        component: (
          <CreateReviewPanel unit={BtnPressed.BtnName} close={handleClose} />
        ),
      },
      '3': {
        title: menuTitles[3],
        component: <div>Build component here {BtnPressed.BtnName}</div>,
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
