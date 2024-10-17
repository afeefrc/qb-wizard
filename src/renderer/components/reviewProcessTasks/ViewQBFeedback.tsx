import React, { useContext, useEffect } from 'react';
import { List, Button, Empty, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { AppContext } from '../../context/AppContext';

interface ViewQBFeedbackProps {
  unitName: string;
}

const { Text } = Typography;

function ViewQBFeedback({ unitName }: ViewQBFeedbackProps) {
  console.log(unitName);
  const appContext = useContext(AppContext);
  const { feedback, examiners, handleDeleteComment } = appContext || {};

  const canDeleteComment = true;

  const unitFeedback = feedback?.questionBankComments?.find(
    (comment: any) => comment.unit === unitName,
  );

  const getExaminerInfo = (examinerId: string) => {
    const examiner = examiners?.find((e: any) => e.id === examinerId);
    return examiner
      ? `${examiner.examinerName}, ${examiner.examinerDesignation} (ATM)`
      : 'Unknown Examiner';
  };

  return (
    <div>
      {unitFeedback && unitFeedback.length > 0 ? (
        <List
          dataSource={feedback?.questionBankComments?.filter(
            (f) => f.unit === unit,
          )}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    No feedbacks available for this {unitName} Question Bank.
                  </span>
                }
              />
            ),
          }}
          renderItem={(item: any) => (
            <List.Item
              actions={
                canDeleteComment
                  ? [
                      <Button
                        type="primary"
                        danger
                        ghost
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          handleDeleteComment('questionBankComments', item.id)
                        }
                        size="small"
                        style={{ boxShadow: 'none' }}
                      >
                        Clear
                      </Button>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                description={
                  <>
                    <Text
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                      }}
                    >
                      {item.comment}
                    </Text>
                    <br />
                    <Text>{getExaminerInfo(item.examinerId)}</Text>
                    <br />
                    <Text type="secondary">
                      {new Date(item.commentTime).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description={`No feedback available for ${unitName} question bank`}
        />
      )}
    </div>
  );
}

export default ViewQBFeedback;
