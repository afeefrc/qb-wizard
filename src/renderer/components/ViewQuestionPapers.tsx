import React, { useState, useEffect } from 'react';
import { List, Typography, Card } from 'antd';
import { AppContext } from '../context/AppContext';

interface ViewQuestionPapersProps {
  unitName: string;
}

function ViewQuestionPapers({
  unitName,
}: ViewQuestionPapersProps): React.ReactElement {
  const appContext = React.useContext(AppContext);
  const { examinerAssignments, examiners } = appContext || {};

  const questionPapers = React.useMemo(() => {
    if (!examinerAssignments || !examiners) return [];

    return examinerAssignments
      .filter((assignment) => assignment.unit === unitName)
      .map((assignment) => ({
        id: assignment.id,
        // title: assignment.archivedQuestionPaper.content.title,
        subject: assignment.unit,
        // date: assignment.archivedQuestionPaper.content.date,
        examiner:
          examiners.find((e) => e.id === assignment.examiner)?.examinerName ||
          'Unknown',
      }));
  }, [examinerAssignments, examiners, unitName]);

  return (
    <Card
      title={
        <Typography.Title
          level={2}
        >{`Question Papers - ${unitName}`}</Typography.Title>
      }
      style={{ width: '90%', margin: '20px auto' }}
    >
      <List
        dataSource={questionPapers}
        renderItem={(paper) => (
          <List.Item key={paper.id}>
            <List.Item.Meta
              // title={paper.title}
              description={
                <>
                  <div>{`Subject: ${paper.subject}`}</div>
                  <div>{`Examiner: ${paper.examiner}`}</div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}

export default ViewQuestionPapers;
