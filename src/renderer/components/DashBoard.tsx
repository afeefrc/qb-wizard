import React from 'react';
import '../RolePage.css';

interface DashBoardProps {
  contentList: string[];
}

function DashBoard({ contentList }: DashBoardProps) {
  return (
    <div className="scroll-view">
      <div>Dash Board</div>
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
