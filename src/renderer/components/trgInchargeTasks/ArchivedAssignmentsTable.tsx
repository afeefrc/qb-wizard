import React, { useState, useContext } from 'react';
import {
  Table,
  Button,
  Space,
  List,
  Form,
  Select,
  Input,
  Row,
  Col,
  Empty,
  Typography,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import QuestionPaperPDF from '../utils/QuestionPaperPDF';
import { AppContext } from '../../context/AppContext';
import { useUser } from '../../context/UserContext';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;
interface ExaminerAssignment {
  id: string;
  unit: string;
  examiner: string;
  status: string;
  examiner_invigilator?: string;
  isArchived: boolean;
  archivedQuestionPaper?: {
    content: any[];
    syllabusSections: any[];
    examiner: string;
    archivedAt: string;
    invigilatorWithDesignation: string;
    examinerWithDesignation: string;
    examinationDate: string;
    year: number;
    serialNumber: number;
  };
}

interface ArchivedAssignmentsTableProps {
  assignments: ExaminerAssignment[];
  onView: (assignment: ExaminerAssignment) => void;
  onRestore: (assignment: ExaminerAssignment) => void;
}

type ExpandedMode = 'feedback' | 'view';

interface ExpandedRowContentProps {
  record: ExaminerAssignment;
  feedback: any;
  examiners: any;
  handleAddComment: any;
  handleDeleteComment: any;
  user: any;
  closeExpanded: (id: string) => void;
  mode: ExpandedMode;
}

function ExpandedRowContent({
  record,
  feedback,
  examiners,
  handleAddComment,
  handleDeleteComment,
  user,
  closeExpanded,
  mode,
}: ExpandedRowContentProps) {
  const [form] = Form.useForm();

  const getExaminerName = (examinerId: string) => {
    const examiner = examiners?.find((examiner) => examiner.id === examinerId);
    return examiner
      ? `${examiner.examinerName} ${examiner.examinerDesignation} (ATM)`.trim()
      : examinerId;
  };

  const handleFeedbackSubmit = (
    values: { examiner: string; comment: string },
    recordId: string,
  ) => {
    if (values.examiner && values.comment) {
      handleAddComment('questionPaperComments', {
        examinerId: values.examiner,
        comment: values.comment,
        examinerAssignmentId: recordId,
      });
      form.resetFields();
    }
  };

  return mode === 'feedback' ? (
    <Row gutter={16}>
      <Col span={12}>
        <List
          dataSource={(feedback?.questionPaperComments || []).filter(
            (comment) => comment.examinerAssignmentId === record.id,
          )}
          locale={{ emptyText: <Empty description="No feedback yet" /> }}
          header={<Text>Evaluation Feedback</Text>}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                user?.role === 'trgIncharge' && (
                  <Button
                    onClick={() =>
                      handleDeleteComment('questionPaperComments', item.id)
                    }
                    type="link"
                    danger
                  >
                    Delete
                  </Button>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={getExaminerName(item.examinerId)}
                description={item.comment}
              />
            </List.Item>
          )}
        />
      </Col>
      <Col span={12}>
        <Form
          form={form}
          onFinish={(values) => handleFeedbackSubmit(values, record.id)}
          layout="vertical"
        >
          <Form.Item name="examiner" label="Examiner (Evaluation)">
            <Select placeholder="Select your name">
              {examiners?.map((examiner) => (
                <Option key={examiner.id} value={examiner.id}>
                  {getExaminerName(examiner.id)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="comment" label="Feedback">
            <TextArea rows={4} placeholder="Enter your feedback" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Feedback
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={() => closeExpanded(record.id)}
                type="default"
              >
                Close
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  ) : (
    <QuestionPaperPDF
      examinerAssignmentId={record.id}
      downloadButtonDisabled={user?.role !== 'trgIncharge'}
    />
  );

  // return (

  // );
}

function ArchivedAssignmentsTable({
  assignments,
  onView,
  onRestore,
}: ArchivedAssignmentsTableProps) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [expandedMode, setExpandedMode] = useState<
    Record<string, ExpandedMode>
  >({});
  const appContext = useContext(AppContext);
  const { feedback, examiners, handleAddComment, handleDeleteComment } =
    appContext || {};
  const { user } = useUser();
  const [form] = Form.useForm();

  const toggleExpand = (recordId: string, mode: ExpandedMode) => {
    setExpandedRowKeys((prevKeys) => {
      const isExpanded = prevKeys.includes(recordId);
      if (isExpanded && expandedMode[recordId] === mode) {
        return [];
      }
      return [recordId];
    });
    setExpandedMode((prev) => ({ ...prev, [recordId]: mode }));
  };

  const closeExpanded = (recordId: string) => {
    setExpandedRowKeys((prevKeys) =>
      prevKeys.filter((key) => key !== recordId),
    );
  };

  const columns = [
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Exam Date',
      dataIndex: ['archivedQuestionPaper', 'examinationDate'],
      key: 'examinationDate',
      render: (date: string) => {
        return date ? dayjs(date).format('DD.MM.YYYY') : '-';
      },
      sorter: (a: ExaminerAssignment, b: ExaminerAssignment) => {
        const dateA = a.archivedQuestionPaper?.examinationDate;
        const dateB = b.archivedQuestionPaper?.examinationDate;
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dayjs(dateB).unix() - dayjs(dateA).unix();
      },
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Document No.',
      // dataIndex: ['archivedQuestionPaper', 'serialNumber'],
      key: 'documentNumber',
      render: (record: ExaminerAssignment) => {
        const year = record.archivedQuestionPaper?.year;
        const serialNumber = record.archivedQuestionPaper?.serialNumber;
        if (year && serialNumber) {
          return `...${year}/${serialNumber.toString().padStart(3, '0')}`;
        }
        return '-';
      },
    },
    {
      title: 'Examiner',
      dataIndex: ['archivedQuestionPaper', 'examinerWithDesignation'],
      key: 'examiner',
    },
    {
      title: 'Invigilator',
      dataIndex: ['archivedQuestionPaper', 'invigilatorWithDesignation'],
      key: 'invigilator',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      // width: '30%',
      render: (_: any, record: ExaminerAssignment) => (
        <Space direction="horizontal">
          {/* <QuestionPaperPDF
            examinerAssignmentId={record.id}
            downloadButtonDisabled={user?.role !== 'trgIncharge'}
          /> */}
          <Button
            onClick={() => toggleExpand(record.id, 'view')}
            style={{ padding: '20px', borderRadius: '10px' }}
          >
            View Paper
          </Button>
          <Button
            onClick={() => toggleExpand(record.id, 'feedback')}
            style={{ padding: '20px', borderRadius: '10px' }}
          >
            Feedback
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={assignments}
      columns={columns}
      rowKey="id"
      expandable={{
        expandedRowKeys,
        expandedRowRender: (record) => (
          <ExpandedRowContent
            record={record}
            feedback={feedback}
            examiners={examiners}
            handleAddComment={handleAddComment}
            handleDeleteComment={handleDeleteComment}
            user={user}
            closeExpanded={closeExpanded}
            mode={expandedMode[record.id] || 'feedback'}
          />
        ),
        rowExpandable: (record) => true,
        showExpandColumn: false,
      }}
    />
  );
}

export default ArchivedAssignmentsTable;
