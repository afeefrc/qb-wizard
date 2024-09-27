import React, { useState, useEffect } from 'react';
import { List, Typography, Card } from 'antd';
import IssueQuestionPaper from './IssueQuestionPaper';
import { AppContext } from '../../context/AppContext';

interface ViewQuestionPapersProps {
  unitName: string;
}

function ViewQuestionPapers({
  unitName,
}: ViewQuestionPapersProps): React.ReactElement {
  const appContext = React.useContext(AppContext);
  const { examinerAssignments, examiners } = appContext || {};

  // Separate examinerAssignments based on isArchived
  const [activeAssignments, archivedAssignments] = React.useMemo(() => {
    if (!examinerAssignments) return [[], []];

    return examinerAssignments.reduce(
      ([active, archived], assignment) => {
        if (assignment.isArchived) {
          archived.push(assignment);
        } else {
          active.push(assignment);
        }
        return [active, archived];
      },
      [[], []] as [typeof examinerAssignments, typeof examinerAssignments],
    );
  }, [examinerAssignments]);

  const createQuestionPapers = React.useCallback(
    (assignments: typeof examinerAssignments) => {
      if (!assignments || !examiners) return [];

      return assignments
        .filter((assignment) => assignment.unit === unitName)
        .map((assignment) => ({
          id: assignment.id,
          questionPaper: assignment.archivedQuestionPaper.content,
          subject: assignment.unit,
          examiner:
            examiners.find((e) => e.id === assignment.examiner)?.examinerName ||
            'Unknown',
        }));
    },
    [examiners, unitName],
  );

  const activeQuestionPapers = React.useMemo(
    () => createQuestionPapers(activeAssignments),
    [activeAssignments, createQuestionPapers],
  );

  const archivedQuestionPapers = React.useMemo(
    () => createQuestionPapers(archivedAssignments),
    [archivedAssignments, createQuestionPapers],
  );

  console.log('activeQuestionPapers', activeQuestionPapers);
  console.log('archivedQuestionPapers', archivedQuestionPapers);

  return (
    <Card
      title={
        <Typography.Title
          level={3}
        >{`Question Papers - ${unitName}`}</Typography.Title>
      }
      style={{ width: '90%', margin: '10px auto' }}
    >
      <List
        dataSource={activeQuestionPapers}
        renderItem={(paper) => (
          <List.Item
            key={paper.id}
            style={{
              margin: '20px 0px',
              backgroundColor: '#f0f0f0',
              borderRadius: '10px',
              boxShadow: '0px 0px 1px 0px rgba(0, 0, 0, 0.1)',
            }}
          >
            <List.Item.Meta
              // title={paper.subject}
              description={
                <IssueQuestionPaper
                  paper={paper}
                  onClose={() => {}}
                  onUpdate={() => {}}
                />
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}

export default ViewQuestionPapers;
