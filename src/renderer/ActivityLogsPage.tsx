import React from 'react';
import { useNavigate } from 'react-router-dom';

function ActivityLogsPage() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="Hello">
        <button type="button" onClick={handleBackClick}>
          Home
        </button>
        <h1>Welcome to ActivityLogsPage</h1>
      </div>
    </div>
  );
}

export default ActivityLogsPage;
