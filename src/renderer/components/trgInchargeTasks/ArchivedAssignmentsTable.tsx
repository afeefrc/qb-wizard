import React from 'react';
import { Table, Button, Space } from 'antd';
// import { ExaminerAssignment } from '../../types/examinerAssignment';
import dayjs from 'dayjs';
import QuestionPaperPDF from '../utils/QuestionPaperPDF';

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

function ArchivedAssignmentsTable({
  assignments,
  onView,
  onRestore,
}: ArchivedAssignmentsTableProps) {
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
      width: '30%',
      render: (_: any, record: ExaminerAssignment) => (
        // <Space size="middle">
        //   <Button onClick={() => onView(record)}>View</Button>
        //   <Button onClick={() => onRestore(record)}>Restore</Button>
        // </Space>
        <QuestionPaperPDF
          examinerAssignmentId={record.id}
          downloadButtonDisabled
        />
      ),
    },
  ];

  return <Table dataSource={assignments} columns={columns} rowKey="id" />;
}

export default ArchivedAssignmentsTable;
