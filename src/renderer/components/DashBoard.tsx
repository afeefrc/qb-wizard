import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider, Button } from 'antd';
import DashboardCard from './DashBoardCardComponent';
import ApprovalProcessPage from './trgInchargeTasks/ApprovalProcessPage';
import QPapprovalProcessPage from './trgInchargeTasks/QPapprovalProcessPage';
import '../RolePage.css';
import { AppContext } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import BodyContentCard from './BodyContentCard';

// interface DashBoardProps {
//   contentList: string[];
// }

function DashBoard() {
  const appContext = React.useContext(AppContext);
  const { reviewPanels, examinerAssignments } = appContext || {};
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedContent, setSelectedContent] = useState(null);

  const handleNavigation = (
    path: string,
    state: { unit: string; renderContent: any },
  ) => {
    navigate(path, { state });
  };

  const handleCloseApprovalProcess = () => {
    setCurrentView('dashboard');
    setSelectedContent(null);
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

  let renderContents = null;
  if (user && (user.role === 'review-panel' || user.role === 'trg-incharge')) {
    renderContents =
      user.role === 'review-panel'
        ? reviewPanels?.filter(
            (panel) =>
              panel.status.toLowerCase() === 'initiated' ||
              panel.status.toLowerCase() === 'in progress',
          )
        : reviewPanels;
  }

  let examinerAssignmentsContents = null;
  if (user && (user.role === 'examiner' || user.role === 'trg-incharge')) {
    if (user.role === 'examiner') {
      examinerAssignmentsContents = examinerAssignments?.filter(
        (assignment) =>
          assignment.status.toLowerCase() === 'initiated' ||
          assignment.status.toLowerCase() === 'in progress',
      );
    } else {
      examinerAssignmentsContents = examinerAssignments;
    }
  }

  if (currentView === 'QBapprovalProcess') {
    return (
      <div>
        <BodyContentCard
          title={`${selectedContent?.unit} Question bank review (for approval)`}
          onClose={handleCloseApprovalProcess}
        >
          {selectedContent && (
            <ApprovalProcessPage
              content={selectedContent}
              onClose={handleCloseApprovalProcess}
            />
          )}
        </BodyContentCard>
      </div>
    );
  }
  if (currentView === 'QPapprovalProcess') {
    return (
      <div>
        <BodyContentCard
          title={`${selectedContent?.unit} Question paper preparation (for approval)`}
          onClose={handleCloseApprovalProcess}
        >
          {selectedContent && (
            <QPapprovalProcessPage
              content={selectedContent}
              onClose={handleCloseApprovalProcess}
            />
          )}
        </BodyContentCard>
      </div>
    );
  }

  return (
    <div className="scroll-view">
      <div>Dash Board</div>
      {renderContents && (
        <Divider
          orientation="right"
          // plain
          style={{
            borderRadius: '5px',
            padding: '0px 10px',
            color: 'rgba(0, 0, 0, 0.6)',
            fontStyle: 'italic',
            // backgroundColor: '#002C58',
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
              onClick={() => {
                console.log(`card clicked ${renderContent.unit}`);
                if (user?.role === 'review-panel') {
                  handleNavigation('/review-process', {
                    unit: renderContent.unit,
                    renderContent,
                  });
                }
                if (
                  user?.role === 'trg-incharge' &&
                  renderContent.status.toLowerCase() === 'submitted'
                ) {
                  setCurrentView('QBapprovalProcess');
                  setSelectedContent(renderContent);
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
          // plain
          style={{
            borderRadius: '5px',
            padding: '0px 10px',
            color: 'rgba(0, 0, 0, 0.6)',
            fontStyle: 'italic',
            // backgroundColor: '#002C58',
          }}
        >
          Question Paper Preparation Tasks
        </Divider>
      )}

      {examinerAssignmentsContents
        ?.filter((content) => content.status.toLowerCase() !== 'approved')
        .map((renderContent, index) => (
          <DashboardCard
            key={index}
            content={renderContent}
            onClick={(unit) => {
              if (user?.role === 'examiner') {
                handleNavigation('/examiner-process', {
                  unit,
                  renderContent,
                });
              }
              if (
                user?.role === 'trg-incharge' &&
                renderContent.status.toLowerCase() === 'submitted'
              ) {
                setCurrentView('QPapprovalProcess');
                setSelectedContent(renderContent);
              }
            }}
            cardType={'questionPaperAssignment'}
          />
        ))}
    </div>
  );
}

export default DashBoard;
