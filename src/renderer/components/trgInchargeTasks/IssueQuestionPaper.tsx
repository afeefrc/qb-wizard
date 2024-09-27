import React, { useState } from 'react';
import {
  Form,
  Select,
  Button,
  Typography,
  DatePicker,
  Alert,
  Popconfirm,
} from 'antd';
import {
  FilePdfOutlined,
  UndoOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { AppContext } from '../../context/AppContext';

interface QuestionPaper {
  id: string;
  questionPaper: string;
  subject: string;
  examiner: string;
}

interface IssueQuestionPaperProps {
  paper: QuestionPaper;
  onClose: () => void;
  onUpdate: (updatedPaper: QuestionPaper) => void;
}

const { Title, Text } = Typography;

function IssueQuestionPaper({
  paper,
  onClose,
  onUpdate,
}: IssueQuestionPaperProps) {
  const [form] = Form.useForm();
  const appContext = React.useContext(AppContext);
  const { examinerAssignments, examiners } = appContext || {};

  const invigilator = Form.useWatch('invigilator', form);
  const examinationDate = Form.useWatch('examinationDate', form);

  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = (values: any) => {
    if (!invigilator || !examinationDate) {
      setShowWarning(true);
      return;
    }
    const updatedPaper = { ...paper, ...values };
    onUpdate(updatedPaper);
    onClose();
    console.log(values);
  };

  const handleReset = () => {
    form.resetFields();
    setShowWarning(false);
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
          initialValues={paper}
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
                {paper.subject}
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
                  {paper.examiner}
                </Text>
              </div>
            </div>

            <Form.Item
              name="examinationDate"
              label="Date of Examination"
              required
              // style={{ flex: 1, marginLeft: '10px' }}
            >
              <DatePicker style={{ width: 200 }} />
            </Form.Item>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                // marginLeft: '10px',
              }}
            >
              <Button
                type="primary"
                ghost
                style={{ margin: '10px', marginLeft: '0px' }}
                icon={<FilePdfOutlined />}
                onClick={() => console.log('View Question Paper')}
              >
                View Question Paper
              </Button>
              <Button
                type="primary"
                ghost
                danger
                style={{ margin: '10px' }}
                icon={<UndoOutlined />}
                onClick={() => console.log('Return back to examiner')}
              >
                Return back to examiner
              </Button>
              <Button
                type="primary"
                danger
                style={{ margin: '10px' }}
                icon={<CloseCircleOutlined />}
                onClick={() => console.log('Cancel this Question Paper')}
              >
                Cancel this Paper
              </Button>
            </div>
            <Form.Item
              name="invigilator"
              label="Invigilator"
              required
              // style={{ flex: 1, marginRight: '10px' }}
            >
              <Select style={{ width: 250 }}>
                {examiners.map((examiner) => (
                  <Select.Option key={examiner.id} value={examiner.id}>
                    {examiner.examinerName}, {examiner.examinerDesignation}{' '}
                    (ATM)
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button onClick={handleReset}>Reset</Button>
            {!showWarning ? (
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
            ) : (
              <Button
                type="primary"
                onClick={() => setShowWarning(true)}
                style={{ marginLeft: '10px' }}
              >
                Issue Question Paper
              </Button>
            )}
          </Form.Item>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            {showWarning && (
              <Alert
                message="Please fill in all required fields"
                type="error"
                showIcon
                closable
                onClose={() => setShowWarning(false)}
                style={{ marginBottom: '20px', width: '25%' }}
              />
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}

export default IssueQuestionPaper;
