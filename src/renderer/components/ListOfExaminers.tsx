import React, { useState, useContext, useEffect } from 'react';
import { Button, List, Avatar, Space, Card, Drawer, Popconfirm } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import _ from 'lodash';
import dayjs from 'dayjs';
// import VirtualList from 'rc-virtual-list';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './ListOfExaminers.css';
import { AppContext } from '../context/AppContext';
import ExaminerForm from './ExaminerForm';
import CustomButton from './CustomButton';

type FieldType = {
  id?: string;
  examinerName?: string;
  examinerEmpId?: number;
  examinerDesignation?: string;
  examinerUnits?: {
    unit: string;
    validityDate: Date | null;
  }[];
};

function ListOfExaminers() {
  const appContext = useContext(AppContext);
  const {
    examiners,
    handleAddExaminer,
    handleDeleteExaminer,
    handleUpdateExaminer,
  } = appContext || {};
  const [editExaminer, setEditExaminer] = useState<FieldType | undefined>();
  const [isCardVisible, setIsCardVisible] = useState(false);

  const handleEditExaminer = (examiner: FieldType) => {
    const validityDates =
      Array.isArray(examiner.examinerUnits) && examiner.examinerUnits.length > 0
        ? examiner.examinerUnits.reduce((acc, { unit, validityDate }) => {
            // console.log('unit:', unit, 'validityDate:', validityDate);
            if (validityDate) {
              acc[`validity_${unit}`] = dayjs(validityDate);
            }
            console.log('acc', acc);
            return acc;
          }, {})
        : {};
    setEditExaminer({
      id: examiner.id,
      examinerName: examiner.examinerName,
      employeeId: examiner.examinerEmpId,
      designation: examiner.examinerDesignation,
      // unitsApplicable: currentUnits,
      ...validityDates,
    });
    setIsCardVisible(true);
  };

  const handleButtonClick = () => {
    setIsCardVisible(true);
  };

  const closeCard = () => {
    setEditExaminer(undefined);
    setIsCardVisible(false);
  };

  return (
    console.log('examiners ', examiners),
    (
      <div>
        <CustomButton onClick={handleButtonClick} style={{ marginLeft: 115 }}>
          Add Examiner
        </CustomButton>
        <div className="examiner-list-container">
          <CSSTransition
            in={isCardVisible}
            timeout={250}
            classNames="card-transition"
            unmountOnExit
          >
            <Card
              title="Enter Examiner details"
              style={{ margin: '5px 100px' }}
            >
              <ExaminerForm
                editExaminer={editExaminer}
                setEditExaminer={setEditExaminer}
                handleAddExaminer={handleAddExaminer}
                handleUpdateExaminer={handleUpdateExaminer}
                closeCard={closeCard}
              />
            </Card>
          </CSSTransition>

          <TransitionGroup
            component={List}
            itemLayout="horizontal"
            dataSource={examiners.sort(
              (a, b) => b.examinerUnits.length - a.examinerUnits.length,
            )}
          >
            {examiners.map((item, index) => (
              <CSSTransition
                key={JSON.stringify(item)}
                timeout={500}
                classNames="fade"
              >
                <List.Item style={{ marginLeft: 100, marginRight: 100 }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}
                        icon={<UserOutlined />}
                      />
                    }
                    title={`${item.examinerName?.toUpperCase()}, ${item.examinerDesignation?.toUpperCase()} (ATM)`}
                    description={`Examiner for ${item.examinerUnits
                      ?.map(
                        (unitItem) =>
                          `${unitItem.unit?.toUpperCase()}, ${
                            unitItem.validityDate instanceof Date
                              ? `Valid upto ${unitItem.validityDate.toLocaleDateString('en-IN')}`
                              : 'Validity date not available'
                          }`,
                      )
                      .join(', ')}`}
                  />
                  <List.Item
                    actions={[
                      <Popconfirm
                        title="Reset Authentication"
                        description="Are you sure you want to reset this examiner's password and TOTP settings?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() =>
                          handleUpdateExaminer(item.id, {
                            ...item,
                            isFirstLogin: true,
                            authMethod: 'none' as const,
                            hasPassword: false,
                            password: null,
                            totpEnabled: false,
                            totpSecret: null,
                            backupCodes: [],
                            loginAttempts: 0,
                          })
                        }
                      >
                        <Button size="small" type="default">
                          Reset Password and TOTP
                        </Button>
                      </Popconfirm>,
                      <Button
                        size="small"
                        type="default"
                        onClick={() => handleEditExaminer(item)}
                      >
                        Edit
                      </Button>,
                      item.examinerEmpId !== 1 &&
                        item.role !== 'trgInCharge' && (
                          <Popconfirm
                            title="Archive Examiner"
                            description="Are you sure you want to archive this examiner?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() =>
                              handleUpdateExaminer(item.id, {
                                ...item,
                                isArchived: true,
                              })
                            }
                          >
                            <Button ghost size="small" danger>
                              Archive
                            </Button>
                          </Popconfirm>
                        ),
                    ]}
                  />
                </List.Item>
              </CSSTransition>
            ))}
          </TransitionGroup>

          {/* <List
          itemLayout="horizontal"
          dataSource={_.cloneDeep(examiners)}
          renderItem={(item, index) => (
            <List.Item key={item.examinerEmpId || index}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}
                    icon={<UserOutlined />}
                  />
                }
                title={`${item.examinerName?.toUpperCase()}, ${item.examinerDesignation?.toUpperCase()} (ATM)`}
                description={`Examiner for ${item.examinerUnits
                  ?.map(
                    (unitItem) =>
                      `${unitItem.unit.toUpperCase()}, ${
                        unitItem.validityDate
                          ? `Valid upto ${unitItem.validityDate.toLocaleDateString('en-IN')}`
                          : 'Validity date not available'
                      }`,
                  )
                  .join(', ')}`}
              />
              <List.Item
                actions={[
                  <Button
                    size="small"
                    type="default"
                    onClick={() => handleEditExaminer(item)}
                  >
                    Edit
                  </Button>,
                  <Button
                    ghost
                    size="small"
                    danger
                    onClick={() => handleDeleteExaminer(item.id)}
                  >
                    Delete
                  </Button>,
                ]}
              />
            </List.Item>
          )}
        /> */}
        </div>
      </div>
    )
  );
}

export default ListOfExaminers;
