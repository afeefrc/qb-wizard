import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Select,
  Button,
  Typography,
  DatePicker,
  Alert,
  Popconfirm,
  InputNumber,
  Input,
  message,
  Modal,
} from 'antd';
import {
  FilePdfOutlined,
  UndoOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { AppContext } from '../../context/AppContext';

interface QuestionPaper {
  content: [];
  syllabusSections: [];
  examiner: string;
  archivedAt: string;
  invigilatorWithDesignation: string;
  examinerWithDesignation: string;
  examinationDate: string;
  year: number;
  serialNumber: number;
}

interface Assignment {
  id: string;
  examiner: string;
  examiner_invigilator: string;
  isArchived: boolean;
  status: string;
  unit: string;
  archivedQuestionPaper: QuestionPaper;
}

interface IssueQuestionPaperProps {
  // paper: QuestionPaper;
  assignment: Assignment;
  onClose: () => void;
  // onUpdate: (updatedPaper: QuestionPaper) => void;
}

const { Text } = Typography;

function IssueQuestionPaper({
  // paper,
  assignment,
  onClose,
  // onUpdate,
}: IssueQuestionPaperProps) {
  const [form] = Form.useForm();
  const appContext = React.useContext(AppContext);
  const {
    examiners,
    handleUpdateExaminerAssignment,
    handleDeleteExaminerAssignment,
    settings,
    examinerAssignments,
    handleAddUserActivityLog,
  } = appContext || {};

  // const invigilator = Form.useWatch('invigilator', form);
  const examinationDate = Form.useWatch('examinationDate', form);

  // const [showWarning, setShowWarning] = useState(false);
  const [showSkipSerialNumber, setShowSkipSerialNumber] = useState(false);
  const [customSerialNumber, setCustomSerialNumber] = useState<number | null>(
    null,
  );
  // const [skipComment, setSkipComment] = useState<string | null>('');
  const [serialNumber, setSerialNumber] = useState<number | null>(
    assignment.archivedQuestionPaper.serialNumber || null,
  );
  const [year, setYear] = useState<number | null>(
    new Date(examinationDate).getFullYear() ||
      new Date(
        assignment.archivedQuestionPaper.examinationDate,
      ).getFullYear() ||
      new Date().getFullYear(),
  );

  let newSerialNumber = serialNumber;

  useEffect(() => {
    if (examinationDate) {
      setYear(new Date(examinationDate).getFullYear());
    } else {
      setYear(new Date().getFullYear());
    }
  }, [examinationDate]);

  // Use an effect to update serialNumber when necessary
  useEffect(() => {
    if (serialNumber === null) {
      // Find the maximum serial number for the year
      const maxSerialNumber = examinerAssignments?.reduce((max, a) => {
        if (
          a.archivedQuestionPaper &&
          a.archivedQuestionPaper.examinationDate &&
          new Date(a.archivedQuestionPaper.examinationDate).getFullYear() ===
            year
        ) {
          return Math.max(max, a.archivedQuestionPaper.serialNumber || 0);
        }
        return max;
      }, 0);

      setSerialNumber(maxSerialNumber + 1);
    }
  }, [examinerAssignments, year, serialNumber]);

  const createExaminerNameWithDesignation = useCallback(
    (examinerId: string) => {
      if (!examiners) return null;

      const examiner = examiners.find((e) => e.id === examinerId);
      if (!examiner) return null;

      return `${examiner.examinerName}, ${examiner.examinerDesignation} (ATM)`;
    },
    [examiners],
  );

  const generateDocumentNumber = useCallback(
    (assignment: Assignment) => {
      const stationCode = settings?.stationCode;
      // let newSerialNumber = serialNumber;

      if (newSerialNumber === null) {
        // This case should not occur as serialNumber is initialized in the useEffect
        console.warn('Serial number is null when generating document number');
        newSerialNumber = 1;
      }

      // Apply customSerialNumber if it exists
      if (customSerialNumber !== null) {
        newSerialNumber += customSerialNumber;
      }

      const paddedSerialNumber = newSerialNumber.toString().padStart(3, '0');
      return `AAI/${stationCode}/ATM/TRG/${year}/${assignment.unit}-${paddedSerialNumber}`;
    },
    [
      serialNumber,
      customSerialNumber,
      year,
      settings?.stationCode,
      examinationDate,
    ],
  );

  const handleReturnToExaminer = useCallback(() => {
    try {
      const updatedAssignment = {
        ...assignment,
        status: 'In Progress',
        isArchived: false,
      };
      handleUpdateExaminerAssignment(updatedAssignment.id, updatedAssignment);
      handleAddUserActivityLog({
        user: 'TRG Incharge',
        action: `Returned question paper for ${assignment.unit} to examiner`,
        targetType: 'questionPaper',
        unit: assignment.unit,
        description: `Question paper returned to examiner for revision`,
      });
      message.success('Question paper returned to examiner successfully');
      onClose();
    } catch (error) {
      console.error('Error returning question paper to examiner:', error);
      message.error('Failed to return question paper to examiner');
    }
  }, [
    assignment,
    handleUpdateExaminerAssignment,
    handleAddUserActivityLog,
    onClose,
  ]);

  const handleCancelQuestionPaper = useCallback(() => {
    Modal.confirm({
      title: 'Are you sure you want to cancel this question paper?',
      content: 'This action cannot be undone.',
      onOk: () => {
        try {
          handleDeleteExaminerAssignment(assignment.id);
          handleAddUserActivityLog({
            user: 'TRG Incharge',
            action: `Cancelled question paper for ${assignment.unit}`,
            targetType: 'questionPaper',
            unit: assignment.unit,
            description: `Question paper cancelled and deleted`,
          });
          message.success('Question paper cancelled successfully');
          onClose();
        } catch (error) {
          console.error('Error cancelling question paper:', error);
          message.error('Failed to cancel question paper');
        }
      },
      onCancel() {
        // Do nothing if canceled
      },
    });
  }, [
    assignment,
    handleDeleteExaminerAssignment,
    handleAddUserActivityLog,
    onClose,
  ]);

  const handleSubmit = (values: any) => {
    console.log('values', values);
    // if (!invigilator || !examinationDate) {
    //   setShowWarning(true);
    //   return;
    // }
    try {
      const updatedAssignment = {
        ...assignment,
        examiner_invigilator: values.invigilator,
        isArchived: true,
        status: 'Archived',
        archivedQuestionPaper: {
          ...assignment.archivedQuestionPaper,
          examinationDate: values.examinationDate?.toDate() || null, // Changed from values.archivedQuestionPaper.examinationDate
          invigilatorWithDesignation: createExaminerNameWithDesignation(
            values.invigilator,
          ),
          examinerWithDesignation: createExaminerNameWithDesignation(
            assignment.examiner,
          ),
          archivedAt: new Date(),
          year,
          serialNumber: newSerialNumber,
          skipComment: values.skipComment || null,
        },
      };
      console.log('updatedAssignment', updatedAssignment);
      handleUpdateExaminerAssignment(updatedAssignment.id, updatedAssignment);
      handleAddUserActivityLog({
        user: 'TRG Incharge',
        action: `Issued question paper for ${assignment.unit}`,
        targetType: 'questionPaper',
        unit: assignment.unit,
        description: `Question paper issued to invigilator, Serial number assigned: ${year}/${assignment.unit}/${newSerialNumber?.toString().padStart(3, '0') || 'N/A'}`,
      });
      message.success('Question paper issued successfully');
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleReset = () => {
    form.resetFields();
    form.setFieldValue('invigilator', null);
    setCustomSerialNumber(null);
    setShowSkipSerialNumber(false);
  };

  return (
    <div className="issue-question-paper">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Form
          form={form}
          initialValues={{
            ...assignment.archivedQuestionPaper,
            invigilator: assignment.examiner_invigilator,
            examinationDate: null,
            skipComment: '',
          }}
          onFinish={handleSubmit}
          layout="horizontal"
          style={{
            width: '100%',
            padding: '10px 100px',
            // backgroundColor: 'red',
            paddingBottom: '0px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              // backgroundColor: 'red',
              // marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                // justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  marginRight: '10px',
                  fontSize: '40px',
                  fontWeight: 100,
                  borderRight: '0.1px solid grey',
                  paddingRight: '10px',
                }}
              >
                {assignment.unit}
              </Text>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'baseline',
                }}
              >
                <Text style={{ margin: 5 }}>Question Paper prepared by:</Text>
                <Text
                  style={{ fontWeight: 'bold', fontSize: '16px', margin: 5 }}
                >
                  {createExaminerNameWithDesignation(assignment.examiner)}
                </Text>
              </div>
            </div>

            <Form.Item
              name="examinationDate"
              label="Date of Examination"
              required
              rules={[
                { required: true, message: 'Please select examination date' },
              ]}
            >
              <DatePicker style={{ width: 200 }} />
            </Form.Item>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                // marginLeft: '10px',
              }}
            >
              <Button
                type="primary"
                ghost
                style={{
                  margin: '10px 15px 10px 0px',
                  padding: '15px',
                }}
                size="small"
                icon={<FilePdfOutlined />}
                onClick={() => console.log('View Question Paper')}
              >
                View Question Paper
              </Button>
              <Button
                type="primary"
                ghost
                danger
                size="small"
                style={{ margin: '10px 15px 10px 0px', padding: '15px' }}
                icon={<UndoOutlined />}
                onClick={handleReturnToExaminer}
              >
                Return back to examiner
              </Button>
              <Button
                type="primary"
                danger
                style={{ margin: '10px 15px 10px 0px', padding: '15px' }}
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={handleCancelQuestionPaper}
              >
                Cancel this Paper
              </Button>
            </div>
            <Form.Item
              name="invigilator"
              label="Invigilator"
              required
              rules={[{ required: true, message: 'Please select invigilator' }]}
              // style={{ flex: 1, marginRight: '10px' }}
            >
              <Select
                style={{ width: 250 }}
                placeholder="Select a person"
                showSearch
              >
                {examiners.map((examiner) => (
                  <Select.Option key={examiner.id} value={examiner.id}>
                    {createExaminerNameWithDesignation(examiner.id)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <Text style={{ alignSelf: 'flex-start', marginBottom: '5px' }}>
                  Note: Next Document Number available:{' '}
                  {generateDocumentNumber(assignment)}
                </Text>
                {!showSkipSerialNumber ? (
                  <Button
                    type="link"
                    onClick={() => setShowSkipSerialNumber(true)}
                    style={{
                      boxShadow: 'none',
                      fontStyle: 'italic',
                      margin: '0px',
                      padding: '0px',
                    }}
                  >
                    skip serial number
                  </Button>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <InputNumber
                      min={1}
                      placeholder="Select"
                      value={customSerialNumber}
                      // style={{ marginLeft: '10px' }}
                      onChange={(value) => {
                        // setCustomSerialNumber(value);
                        setCustomSerialNumber(value);
                        // setSerialNumber(
                        //   (prevSerialNumber) => prevSerialNumber + value,
                        // );
                      }}
                      addonAfter={
                        <Button
                          type="link"
                          style={{
                            boxShadow: 'none',
                            fontStyle: 'italic',
                            padding: '0px',
                            margin: '0px',
                          }}
                          onClick={() => {
                            setShowSkipSerialNumber(false);
                            setCustomSerialNumber(null);
                          }}
                        >
                          cancel
                        </Button>
                      }
                    />
                    <Form.Item
                      name="skipComment"
                      label="Comment"
                      rules={[
                        {
                          required: showSkipSerialNumber,
                          message: 'Please enter a comment',
                        },
                      ]}
                      style={{
                        margin: '0px',
                        marginLeft: '10px',
                        width: '100%',
                      }}
                    >
                      <Input
                        placeholder="Enter reason for skipping"
                        // value={skipComment}
                        // onChange={(e) => setSkipComment(e.target.value)}
                      />
                    </Form.Item>
                  </div>
                )}
              </div>
              <div>
                <Button onClick={handleReset}>Reset</Button>
                {/* {!showWarning ? ( */}
                <Popconfirm
                  title="Issue Question Paper"
                  description="Confirm to issue this question paper?"
                  onConfirm={form.submit}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary" style={{ marginLeft: '10px' }}>
                    Issue Question Paper
                  </Button>
                </Popconfirm>
                {/* ) : (
                  <Button
                    type="primary"
                    onClick={() => setShowWarning(true)}
                    style={{ marginLeft: '10px' }}
                  >
                    Issue Question Paper
                  </Button>
                )} */}
              </div>
            </div>
          </Form.Item>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            {/* {showWarning && (
              <Alert
                message="Please fill in all required fields"
                type="error"
                showIcon
                closable
                onClose={() => setShowWarning(false)}
                style={{ marginBottom: '20px', width: '25%' }}
              />
            )} */}
          </div>
        </Form>
      </div>
    </div>
  );
}

export default IssueQuestionPaper;
