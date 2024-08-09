import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Empty } from 'antd';

const ReviewProcessPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* <h1>Title</h1> */}
      <Empty
        description={`Question Bank review process page`}
        style={{ padding: '50px' }}
      />
      <button onClick={handleBackClick}>Go Back</button>
    </div>
  );
};

export default ReviewProcessPage;
