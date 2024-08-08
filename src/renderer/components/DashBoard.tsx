import React from 'react';
import DashboardCard from './DashBoardCardComponent';
import '../RolePage.css';
import { AppContext } from '../context/AppContext';
import { useUser } from '../context/UserContext';

// interface DashBoardProps {
//   contentList: string[];
// }

function DashBoard() {
  const appContext = React.useContext(AppContext);
  const { reviewPanels } = appContext || {};
  const { user } = useUser();

  const renderContents =
    user && (user.role === 'review-panel' || user.role === 'trg-incharge')
      ? reviewPanels
      : null;

  return (
    <div className="scroll-view">
      <div>Dash Board</div>
      {renderContents?.map(
        (renderContent, index) => (
          console.log('renderContent', renderContent),
          (
            <DashboardCard
              key={index}
              content={renderContent}
              onClick={(unit) => {
                console.log(`card clicked ${unit}`);
              }}
            />
          )
        ),
      )}
    </div>
  );
}

export default DashBoard;
