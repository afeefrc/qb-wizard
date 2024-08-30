import React, { useState } from 'react';
import { Drawer, Collapse, Table, Button, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

interface LinkSimilarQuestionsDrawerProps {
  visible: boolean;
  onClose: () => void;
  groupedQuestions: any[];
  onLinkQuestions: (linkedQuestionIds: string[]) => void;
  currentQuestionId: string;
  initialLinkedQuestions?: string[];
}

function LinkSimilarQuestionsDrawer({
  visible,
  onClose,
  groupedQuestions,
  onLinkQuestions,
  currentQuestionId,
  initialLinkedQuestions = [],
}: LinkSimilarQuestionsDrawerProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(
    initialLinkedQuestions,
  );

  console.log('selectedQuestions', selectedQuestions);
  const columns = [
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
    },
    {
      title: 'Answer Key',
      dataIndex: 'answerText',
      key: 'answerText',
    },
  ];

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    );
  };

  const handleLinkQuestions = () => {
    onLinkQuestions(selectedQuestions);
    onClose();
  };

  return (
    <Drawer
      title="Link Similar Questions"
      placement="right"
      onClose={onClose}
      visible={visible}
      width={600}
    >
      <Collapse accordion>
        {groupedQuestions.map((section) => (
          <Panel header={section.title} key={section.id}>
            <Table
              dataSource={section.questions.filter(
                (q: any) => q.id !== currentQuestionId,
              )}
              columns={columns}
              rowKey="id"
              size="small"
              pagination={false}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectedQuestions,
                onChange: (selectedRowKeys) =>
                  setSelectedQuestions(selectedRowKeys as string[]),
              }}
            />
          </Panel>
        ))}
      </Collapse>
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={handleLinkQuestions}
        style={{ marginTop: 16 }}
      >
        Link Selected Questions
      </Button>
    </Drawer>
  );
}

export default LinkSimilarQuestionsDrawer;
