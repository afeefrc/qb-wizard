import React, { useState } from 'react';
import { Card, Avatar, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AppContext } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import CreateReviewPanel from './trgInchargeTasks/createReviewPanel';
import ExaminerAssignment from './trgInchargeTasks/AssignExaminer';

interface CardProps {
  content: {
    [key: string]: any;
  };
  onClick: () => void;
  cardType: string;
}

function DashboardCard({ content, onClick, cardType }: CardProps) {
  const appContext = React.useContext(AppContext);
  const { examiners, handleDeleteReviewPanel, handleDeleteExaminerAssignment } =
    appContext || {};

  const [editBtnPressed, setEditBtnPressed] = useState(false);
  const { user } = useUser();

  let title = '';
  let memberTitle = '';
  switch (cardType) {
    case 'reviewPanel':
      title = 'Question Bank review panel';
      memberTitle = 'Panel members';
      break;
    case 'questionPaperAssignment':
      title = 'Question Paper Assignment';
      memberTitle = 'Examiner';
      break;
    default:
      break;
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      onClick(content.unit);
    }
  };
  // console.log('examiners', examiners);

  const handleDeleteBtn = () => {
    if (cardType === 'reviewPanel') {
      handleDeleteReviewPanel(content.id);
    } else if (cardType === 'questionPaperAssignment') {
      handleDeleteExaminerAssignment(content.id);
    }
  };

  let matchingExaminers;
  if (cardType === 'reviewPanel') {
    matchingExaminers = examiners.filter((examiner: any) =>
      content.members.includes(examiner.id),
    );
  } else if (cardType === 'questionPaperAssignment') {
    matchingExaminers = examiners.filter((examiner: any) =>
      content.examiner.includes(examiner.id),
    );
  }

  // Function to determine tag color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'initiated':
        return 'processing';
      case 'in progress':
        return 'success';
      case 'submitted':
        return 'orange';
      // case 'rejected':
      //   return 'red';
      default:
        return 'default';
    }
  };

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
              margin: '15px',
              backgroundColor: '#f0f0f0',
              // justifyContent: 'center',
              minHeight: '125px',
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
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '400',
                    paddingBottom: '5px',
                  }}
                >
                  {title}
                </div>
                <div>
                  Status:{' '}
                  <Tag
                    bordered={false}
                    color={getStatusColor(content.status)}
                    style={{ fontSize: '16px' }}
                  >
                    {content.status}
                  </Tag>
                </div>
                {content.deadline && (
                  <div>
                    Deadline: {dayjs(content.deadline).format('DD-MM-YYYY')}
                  </div>
                )}
                {content.comments_initiate && (
                  <div>Comments: {content.comments_initiate}</div>
                )}
              </div>

              <ul
                style={{
                  minWidth: '35%',
                  margin: '5px 0px',
                }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    paddingBottom: '2px',
                  }}
                >
                  {memberTitle} :
                </div>
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
            {editBtnPressed && cardType === 'reviewPanel' && (
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
            {editBtnPressed && cardType === 'questionPaperAssignment' && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: 'default' }}
              >
                <ExaminerAssignment
                  unit={content.unit}
                  close={() => {
                    setEditBtnPressed(false);
                  }}
                  editValues={content}
                />
                {/* <CreateQuestionPaperAssignment
                  unit={content.unit}
                  close={() => {
                    setEditBtnPressed(false);
                  }}
                  editValues={content}
                /> */}
              </div>
            )}
          </Card>
        </div>
        {user && user.role === 'trg-incharge' && (
          <div style={{}}>
            <Avatar
              size="small"
              icon={<EditOutlined />}
              style={{ margin: '10px 0px', cursor: 'pointer' }}
              onClick={() => setEditBtnPressed(!editBtnPressed)}
            />
            <Avatar
              size="small"
              icon={<DeleteOutlined />}
              style={{ margin: '10px 0px', cursor: 'pointer' }}
              onClick={handleDeleteBtn}
            />
            {/* <div>Edit</div> */}
            {/* <div>Delete</div> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardCard;
