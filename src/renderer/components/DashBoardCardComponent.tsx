import React, { useState } from 'react';
import { Card, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AppContext } from '../context/AppContext';
import CreateReviewPanel from './trgInchargeTasks/createReviewPanel';

interface CardProps {
  content: {
    [key: string]: any;
  };
  onClick: () => void;
}

function DashboardCard({ content, onClick }: CardProps) {
  const appContext = React.useContext(AppContext);
  const { examiners, handleDeleteReviewPanel } = appContext || {};

  const [editBtnPressed, setEditBtnPressed] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      onClick(content.unit);
    }
  };
  // console.log('examiners', examiners);

  const matchingExaminers = examiners.filter((examiner: any) =>
    content.members.includes(examiner.id),
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          className="card"
          onClick={() => onClick(content.unit)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          style={{ width: '100%' }}
        >
          {/* <h3>Question Bank review panel</h3> */}
          <Card
            title=""
            bordered={false}
            hoverable
            size="small"
            style={{
              // display: 'flex',
              margin: '20px',
              backgroundColor: '#f0f0f0',
              // justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}
            >
              <div className="create-review-panel-unitname">{content.unit}</div>
              <div style={{ width: '60%' }}>
                <div>Question Bank review panel</div>
                <div>Status: {content.status}</div>
                {content.deadline && (
                  <div>
                    Deadline: {dayjs(content.deadline).format('DD-MM-YYYY')}
                  </div>
                )}
                {content.comments_initiate && (
                  <div>Comments: {content.comments_initiate}</div>
                )}
              </div>
              <ul style={{ minWidth: '35%' }}>
                <div>Panel members:</div>
                {matchingExaminers
                  .sort((a: any, b: any) =>
                    // eslint-disable-next-line no-nested-ternary
                    a.id === content.chairman
                      ? -1
                      : b.id === content.chairman
                        ? 1
                        : 0,
                  )
                  .map((examiner: any) => (
                    <li key={examiner.id}>
                      {examiner.examinerName.toUpperCase()} ,{' '}
                      {examiner.examinerDesignation.toUpperCase()} (ATM)
                      {examiner.id === content.chairman ? ' (Chairman)' : ''}
                    </li>
                  ))}
              </ul>
            </div>
            {editBtnPressed && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: 'default' }}
              >
                <CreateReviewPanel
                  unit={content.unit}
                  close={() => {
                    setEditBtnPressed(false);
                  }}
                  editValues={content}
                />
              </div>
            )}
          </Card>
        </div>
        <div style={{}}>
          <Avatar
            size="small"
            icon={<EditOutlined />}
            style={{ margin: '10px 0px' }}
            onClick={() => setEditBtnPressed(!editBtnPressed)}
          />
          <Avatar
            size="small"
            icon={<DeleteOutlined />}
            style={{ margin: '10px 0px', cursor: 'pointer' }}
            onClick={() => handleDeleteReviewPanel(content.id)}
          />
          {/* <div>Edit</div> */}
          {/* <div>Delete</div> */}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;
