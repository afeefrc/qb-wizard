import React from 'react';
import DashboardCard from './DashBoardCardComponent';
import '../RolePage.css';

interface DashBoardProps {
  contentList: string[];
}

function DashBoard({ contentList }: DashBoardProps) {
  return (
    <div className="scroll-view">
      <div>Dash Board</div>
      <DashboardCard title="card title" onClick={() => {}} />
      <div className="scroll-view">
        {contentList.map((content) => (
          <div key={content} className="dashboard-item-container">
            {content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashBoard;
