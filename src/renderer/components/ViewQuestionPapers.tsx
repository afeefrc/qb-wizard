import React, { useState, useEffect } from 'react';
import { List, Typography, Card, Table } from 'antd';
import IssueQuestionPaper from './trgInchargeTasks/IssueQuestionPaper';
import ArchivedAssignmentsTable from './trgInchargeTasks/ArchivedAssignmentsTable';
import { AppContext } from '../context/AppContext';
import { useUser } from '../context/UserContext';

interface ViewQuestionPapersProps {
  unitName: string;
}

function ViewQuestionPapers({
  unitName,
}: ViewQuestionPapersProps): React.ReactElement {
  const appContext = React.useContext(AppContext);
  const { examinerAssignments, examiners } = appContext || {};
  const { user } = useUser();

  console.log('user', user);

  // Separate examinerAssignments based on isArchived
  const [activeAssignments, archivedAssignments] = React.useMemo(() => {
    if (!examinerAssignments) return [[], []];

    return examinerAssignments.reduce(
      ([active, archived], assignment) => {
        if (assignment.unit !== unitName) return [active, archived];
        if (assignment.isArchived) {
          archived.push(assignment);
        } else if (assignment.status === 'Approved') {
          active.push(assignment);
        }
        return [active, archived];
      },
      [[], []] as [typeof examinerAssignments, typeof examinerAssignments],
    );
  }, [examinerAssignments, unitName]);

  // const createQuestionPapers = React.useCallback(
  //   (assignments: typeof examinerAssignments) => {
  //     if (!assignments || !examiners) return [];

  //     return assignments
  //       .filter((assignment) => assignment.unit === unitName)
  //       .map((assignment) => ({
  //         id: assignment.id,
  //         questionPaper: assignment.archivedQuestionPaper.content,
  //         subject: assignment.unit,
  //         examiner:
  //           examiners.find((e) => e.id === assignment.examiner)?.id || '',
  //         invigilator:
  //           examiners.find((e) => e.id === assignment.examiner_invigilator)
  //             ?.id || '',
  //         // examinerDesignation:
  //         //   examiners.find((e) => e.id === assignment.examiner)
  //         //     ?.examinerDesignation || '',
  //         // invigilatorDesignation:
  //         //   examiners.find((e) => e.id === assignment.examiner_invigilator)
  //         //     ?.examinerDesignation || '',
  //       }));
  //   },
  //   [examiners, unitName],
  // );

  // const activeQuestionPapers = React.useMemo(
  //   () => createQuestionPapers(activeAssignments),
  //   [activeAssignments, createQuestionPapers],
  // );

  // const archivedQuestionPapers = React.useMemo(
  //   () => createQuestionPapers(archivedAssignments),
  //   [archivedAssignments, createQuestionPapers],
  // );

  return (
    <div>
      {user?.role === 'trg-incharge' && (
        <Card
          title={
            <Typography.Title
              level={4}
            >{`Active Question Papers (${unitName})`}</Typography.Title>
          }
          style={{ width: '95%', margin: '10px auto' }}
        >
          <List
            dataSource={activeAssignments}
            renderItem={(assignment) => (
              <List.Item
                key={assignment.id}
                style={{
                  margin: '20px 0px',
                  paddingBottom: '0px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '10px',
                  boxShadow: '0px 0px 1px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <List.Item.Meta
                  // title={paper.subject}
                  description={
                    <IssueQuestionPaper
                      assignment={assignment}
                      onClose={() => {}}
                      onUpdate={() => {}}
                    />
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
      <Card
        title={
          <Typography.Title
            level={4}
          >{`Archived Question Papers (${unitName})`}</Typography.Title>
        }
        style={{ width: '95%', margin: '10px auto' }}
      >
        <ArchivedAssignmentsTable
          assignments={archivedAssignments}
          onView={() => {
            console.log('view');
          }}
          onRestore={() => {
            console.log('restore');
          }}
        />
      </Card>
    </div>
  );
}

export default ViewQuestionPapers;
