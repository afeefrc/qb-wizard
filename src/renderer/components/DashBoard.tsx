import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from './DashBoardCardComponent';
import { Divider } from 'antd';
import '../RolePage.css';
import { AppContext } from '../context/AppContext';
import { useUser } from '../context/UserContext';

// interface DashBoardProps {
//   contentList: string[];
// }

function DashBoard() {
  const appContext = React.useContext(AppContext);
  const { reviewPanels, examinerAssignments } = appContext || {};
  const { user } = useUser();
  const navigate = useNavigate();

  const handleNavigation = (path: string, state: any) => {
    navigate(path, state);
  };

  console.log('examinerAssignments', examinerAssignments);

  // const cardShell = {
  //   reviewPanelsCard: {
  //     title: 'Question Bank Review Panel',
  //     cardType: 'reviewPanel',
  //   },
  //   examinerAssignmentsCard: {
  //     title: 'Question Paper preparation assignment',
  //     cardType: 'questionPaperAssignment',
  //   },
  // }; // Add other cards as needed;

  const renderContents =
    user && (user.role === 'review-panel' || user.role === 'trg-incharge')
      ? reviewPanels
      : null;
  const examinerAssignmentsContents =
    (user && user.role === 'examiner') || user.role === 'trg-incharge'
      ? examinerAssignments
      : null;

  return (
    <div className="scroll-view">
      <div>Dash Board</div>
      {renderContents && (
        <Divider
          orientation="right"
          plain
          style={{
            margin: '0px',
            color: 'rgba(0, 0, 0, 0.6)',
            fontStyle: 'italic',
          }}
        >
          Question Bank Review Tasks
        </Divider>
      )}

      {renderContents?.map(
        (renderContent, index) => (
          console.log('renderContent', renderContent),
          (
            <DashboardCard
              key={index}
              content={renderContent}
              onClick={(unit) => {
                console.log(`card clicked ${unit}`);
                if (user?.role === 'review-panel') {
                  handleNavigation('/review-process', { unit });
                }
              }}
              cardType={'reviewPanel'}
            />
          )
        ),
      )}
      {examinerAssignmentsContents && (
        <Divider
          orientation="right"
          plain
          style={{
            margin: '0px',
            color: 'rgba(0, 0, 0, 0.6)',
            fontStyle: 'italic',
          }}
        >
          Question Paper Preparation Tasks
        </Divider>
      )}

      {examinerAssignmentsContents?.map((renderContent, index) => {
        console.log('renderContent', renderContent);
        return (
          <DashboardCard
            key={index}
            content={renderContent}
            onClick={(unit) => {
              console.log(`card clicked ${unit}`);
              if (user?.role === 'examiner') {
                handleNavigation('/examiner-process', { unit });
              }
            }}
            cardType={'questionPaperAssignment'}
          />
        );
      })}
    </div>
  );
}

export default DashBoard;
