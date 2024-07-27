import React from 'react';
import { useNavigate } from 'react-router-dom';

function QuestionPapers() {
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
        <h1>Welcome to QuestionPapers</h1>
      </div>
    </div>
  );
}

export default QuestionPapers;
