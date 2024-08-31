import React, { useState, useEffect } from 'react';
import { Drawer, Collapse, Table, Button, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;
const { Panel } = Collapse;

interface LinkSimilarQuestionsDrawerProps {
  visible: boolean;
  onClose: () => void;
  groupedQuestions: any[];
  onLinkQuestions: (linkedQuestionIds: string[]) => void;
  currentQuestionId: string;
  initialLinkedQuestions: string[];
}

function LinkSimilarQuestionsDrawer({
  visible,
  onClose,
  groupedQuestions,
  onLinkQuestions,
  currentQuestionId,
  initialLinkedQuestions,
}: LinkSimilarQuestionsDrawerProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSelectedQuestions(initialLinkedQuestions || []);

    // Find the section containing the first initialLinkedQuestion
    const firstLinkedQuestionId = initialLinkedQuestions?.[0];
    const sectionWithLinkedQuestion = groupedQuestions.find((section) =>
      section.questions.some((q: any) => q.id === firstLinkedQuestionId),
    );

    // Set the active key to the found section or the first section
    setActiveKey(sectionWithLinkedQuestion?.id || groupedQuestions[0]?.id);
  }, [initialLinkedQuestions, groupedQuestions]);

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
      <Text type="success" style={{ marginBottom: 16 }}>
        Note: linked questions will be automatically linked back to the current
        question.
      </Text>
      <Collapse
        accordion
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key as string)}
      >
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
