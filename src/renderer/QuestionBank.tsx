import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import './ToolbarPage.css'; // Import the CSS file for styling

function QuestionBank() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const appContext = useContext(AppContext);
  const { questions, handleDeleteQuestion } = appContext || {};

  return (
    <div>
      <div className="rolepage-header">
        <div className="button-container">
          <button type="button" onClick={handleBackClick}>
            Back to Home
          </button>
        </div>
        <div className="rolepage-title">Question Bank</div>
      </div>
      <div className="rolepage-container">
        {/* <div className="menu-box">
          <MenuColumn menuItems={menuItems} />
        </div> */}
        <div className="toolbar-content-box">
          <div className="rolepage-hello">
            <h3>Dash board</h3>
            <div className="scroll-view">
              <ul>
                {questions?.map((item) => (
                  <li key={item.id}>
                    {item.questionText}
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteQuestion && handleDeleteQuestion(item.id)
                      }
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
              {/* Add your scrollable content here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionBank;
