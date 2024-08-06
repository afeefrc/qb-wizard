import React from 'react';
import DashboardCard from './DashBoardCardComponent';
import '../RolePage.css';
import { AppContext } from '../context/AppContext';

interface DashBoardProps {
  contentList: string[];
}

function DashBoard({ contentList }: DashBoardProps) {
  const appContext = React.useContext(AppContext);
  const { reviewPanels } = appContext || {};
  return (
    <div className="scroll-view">
      <div>Dash Board</div>
      {reviewPanels?.map(
        (reviewPanel, index) => (
          console.log('reviewPanel', reviewPanel),
          (
            <DashboardCard
              key={index}
              content={reviewPanel}
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
