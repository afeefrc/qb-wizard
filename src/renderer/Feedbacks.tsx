import React, { useState, useEffect, useContext } from 'react';
import { Tabs, Space, List, Button, Typography, Empty } from 'antd';
import { HomeFilled, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import QuestionBankFeedbackBtn from './components/QuestionBankFeedbackBtn';
import { AppContext } from './context/AppContext';
import { useUser } from './context/UserContext';
import './ToolbarPage.css'; // Import the CSS file for styling

const { Text } = Typography;

function Feedbacks() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const appContext = useContext(AppContext);
  const { settings, examiners, feedback, handleDeleteComment } =
    appContext || {};
  const { user } = useUser();

  const [canDeleteComment, setCanDeleteComment] = useState(false);

  useEffect(() => {
    if (user?.role === 'trgIncharge') {
      setCanDeleteComment(true);
    }
  }, [user?.role]);

  const units = settings?.unitsApplicable || [];
  console.log(units);

  const onChange = (activeKey: string) => {
    console.log('Active tab:', activeKey);
  };
  const onDeleteComment = (id: string) => {
    console.log('Deleting comment with id:', id);
    handleDeleteComment('questionBankComments', id);
  };

  const getExaminerInfo = (examinerId: string) => {
    const examiner = examiners?.find((e) => e.id === examinerId);
    return examiner
      ? `${examiner.examinerName}, ${examiner.examinerDesignation} (ATM)`
      : examinerId;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div className="rolepage-header">
        <div className="button-container">
          <button type="button" onClick={handleBackClick}>
            <Space>
              <HomeFilled style={{ padding: '0px 5px', color: '#002C58' }} />
              Back to Home
            </Space>
          </button>
        </div>
        <div className="rolepage-title">Feedbacks</div>
      </div>
      <div className="rolepage-container">
        <div style={{ width: '95%' }}>
          <Tabs
            // type="card"
            size="large"
            centered
            defaultActiveKey="2"
            items={units.map((unit: string) => ({
              key: unit,
              label: (
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    borderRadius: '5px',
                    padding: '5px',
                  }}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;{unit}&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              ),
              children: (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '60%',
                    }}
                  >
                    <div style={{ margin: '20px' }}>
                      <QuestionBankFeedbackBtn unitName={unit} />
                    </div>
                    <div className="scroll-view">
                      <div
                        style={{
                          marginTop: '20px',
                          backgroundColor: 'rgba(0, 44, 88, 0.1)',
                          borderRadius: '10px',
                          padding: '20px',
                        }}
                      >
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
                                    No feedbacks available for this {unit}{' '}
                                    Question Bank.
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
                                        onClick={() => onDeleteComment(item.id)}
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
                                    <Text>
                                      {getExaminerInfo(item.examinerId)}
                                    </Text>
                                    <br />
                                    <Text type="secondary">
                                      {new Date(
                                        item.commentTime,
                                      ).toLocaleString('en-IN', {
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
                      </div>
                    </div>
                  </div>
                </div>
              ),
            }))}
            onChange={onChange}
            indicator={{ size: (origin) => origin - 20, align: 'center' }}
          />
        </div>
      </div>
    </div>
  );
}

export default Feedbacks;
