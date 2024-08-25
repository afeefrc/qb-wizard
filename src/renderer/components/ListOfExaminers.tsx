/* eslint-disable react/function-component-definition */
// import React, { useState, useContext, useCallback, useEffect } from 'react';
// import type { FormProps } from 'antd';
// import type { FormInstance } from 'antd';
// import {
//   Flex,
//   Button,
//   Checkbox,
//   Form,
//   Input,
//   InputNumber,
//   Select,
//   DatePicker,
//   Avatar,
//   List,
//   Space,
// } from 'antd';
// import { UserOutlined } from '@ant-design/icons';
// import type { DatePickerProps } from 'antd';
// import dayjs from 'dayjs';
// import { useForm, Resolver, set } from 'react-hook-form';
// import _ from 'lodash';
// import { AppContext } from '../context/AppContext';
// import { designationList } from '../SampleData';

// function createOptions(array: string[]) {
//   return array.map((item) => ({
//     value: item.toLowerCase(),
//     label: item,
//   }));
// }

// interface Unit {
//   unit: string;
//   validityDate: Date | null;
// }

// type FieldType = {
//   id?: string;
//   examinerName?: string;
//   examinerEmpId?: number;
//   examinerDesignation?: string;
//   examinerUnits?: Unit[];
// };

// interface SubmitButtonProps {
//   form: FormInstance;
// }

// const SubmitButton: React.FC<React.PropsWithChildren<SubmitButtonProps>> = ({
//   form,
//   children,
// }) => {
//   const [submittable, setSubmittable] = React.useState<boolean>(false);

//   // Watch all values
//   const values = Form.useWatch([], form);

//   React.useEffect(() => {
//     form
//       .validateFields({ validateOnly: true })
//       .then(() => setSubmittable(true))
//       .catch(() => setSubmittable(false));
//   }, [form, values]);

//   return (
//     <Button type="primary" htmlType="submit" disabled={!submittable}>
//       {children}
//     </Button>
//   );
// };

// function ListOfExaminers() {
//   const appContext = useContext(AppContext);
//   const { settings, examiners, handleAddExaminer, handleDeleteExaminer } =
//     appContext || {};
//   // const { register, handleSubmit, reset } = useForm();
//   // const [info, setInfo] = useState<FieldType | undefined>();
//   const [editExaminer, setEditExaminer] = useState<FieldType | undefined>();
//   const [unitsChange, setUnitsChange] = useState<string[]>([]);
//   const [form] = Form.useForm();

//   // const onSubmit = (data: any) => {
//   //   console.log(typeof data);
//   //   // Process the form data here

//   //   reset();
//   // };

//   const onFinish = useCallback<FormProps<FieldType>['onFinish']>((values) => {
//     const units = values.unitsApplicable.map((unit: string) => ({
//       unit,
//       validityDate: values[`validity_${unit}`]?.toDate() || null,
//     }));

//     const examinerInfo = {
//       examinerName: values.examinerName,
//       examinerEmpId: values.employeeId,
//       examinerDesignation: values.designation,
//       examinerUnits: units,
//     };

//     if (handleAddExaminer) {
//       handleAddExaminer(examinerInfo);
//       // setInfo(examinerInfo);
//       form.resetFields();
//       setEditExaminer(undefined);
//     }
//   }, []);

//   const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
//     errorInfo,
//   ) => {
//     console.log('Failed:', errorInfo);
//   };

//   const handleEditExaminer = (examiner: FieldType) => {
//     console.log('handle edit examiner', examiner);
//     // const currentUnits = Array.isArray(examiner.examinerUnits)
//     //   ? examiner.examinerUnits.map((item) => item.unit.toUpperCase())
//     //   : [];
//     const validityDates =
//       Array.isArray(examiner.examinerUnits) && examiner.examinerUnits.length > 0
//         ? examiner.examinerUnits.reduce((acc, { unit, validityDate }) => {
//             // console.log('unit:', unit, 'validityDate:', validityDate);
//             if (validityDate) {
//               acc[`validity_${unit}`] = dayjs(validityDate);
//             }
//             console.log('acc', acc);
//             return acc;
//           }, {})
//         : {};
//     // console.log('validityDates', validityDates);
//     setEditExaminer({
//       id: examiner.id,
//       examinerName: examiner.examinerName,
//       employeeId: examiner.examinerEmpId,
//       designation: examiner.examinerDesignation,
//       // unitsApplicable: currentUnits,
//       ...validityDates,
//     });
//     // setUnitsChange(currentUnits);
//   };

//   useEffect(() => {
//     if (editExaminer) {
//       form.setFieldsValue(editExaminer);
//     }
//   }, [editExaminer, form]);

//   const handleUnitsChange = (value: string | string[]) => {
//     // console.log(`Selected: ${value}`);
//     setUnitsChange(value as string[]);
//   };

//   const handleResetBtn = () => {
//     setEditExaminer(undefined);
//     setUnitsChange([]);
//   };

//   return (
//     <div>
//       {console.log('top of form ', editExaminer)}
//       <Form
//         form={form}
//         name="validateOnly"
//         labelCol={{ span: 6 }}
//         wrapperCol={{ span: 15 }}
//         style={{ maxWidth: 600 }}
//         initialValues={editExaminer}
//         onFinish={onFinish}
//         onFinishFailed={onFinishFailed}
//         autoComplete="off"
//       >
//         <Form.Item<FieldType>
//           label="Examiner Name"
//           name="examinerName"
//           rules={[{ required: true, message: 'Please input Examiner Name!' }]}
//         >
//           <Input />
//         </Form.Item>

//         <Form.Item
//           label="Employee ID"
//           name="employeeId"
//           rules={[
//             { required: true, message: 'Please input Examiner Employee ID!' },
//           ]}
//         >
//           <InputNumber controls={false} />
//         </Form.Item>

//         <Form.Item
//           label="Designation"
//           name="designation"
//           rules={[
//             { required: true, message: 'Please input Examiner Designation!' },
//           ]}
//         >
//           <Select
//             // defaultValue="JGM"
//             // style={{ width: 120 }}
//             placeholder="Please select designation"
//             options={createOptions(designationList)}
//           />
//         </Form.Item>

//         <Form.Item
//           label="Units Applicable"
//           name="unitsApplicable"
//           rules={[{ required: true, message: 'Please input units !' }]}
//         >
//           <Select
//             mode="multiple"
//             allowClear
//             style={{ width: '100%' }}
//             placeholder="Please select units"
//             // defaultValue={['a10', 'c12']}
//             // onChange={handleChange}
//             options={createOptions(settings.unitsApplicable)}
//             onChange={handleUnitsChange}
//           />
//         </Form.Item>

//         {unitsChange.map((unit) => (
//           <Form.Item
//             label={`Date of validity for ${unit.toUpperCase()}`}
//             name={`validity_${unit}`}
//           >
//             <DatePicker
//               format="DD-MM-YYYY"
//               // onChange={onDateChange}
//               // defaultValue={dayjs('2015-06-06', 'DD-MM-YYYY')}
//             />
//           </Form.Item>
//         ))}

//         <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
//           <Space>
//             <SubmitButton form={form}>Submit</SubmitButton>
//             <Button htmlType="reset" onClick={handleResetBtn}>
//               Reset
//             </Button>
//           </Space>
//         </Form.Item>
//       </Form>
//       <List
//         itemLayout="horizontal"
//         dataSource={_.cloneDeep(examiners)}
//         renderItem={(item, index) => (
//           <List.Item key={item.examinerEmpId || index}>
//             <List.Item.Meta
//               avatar={
//                 <Avatar
//                   style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}
//                   icon={<UserOutlined />}
//                 />
//               }
//               title={`${item.examinerName.toUpperCase()}, ${item.examinerDesignation.toUpperCase()} (ATM)`}
//               description={`Examiner for ${item.examinerUnits
//                 .map(
//                   (unitItem) =>
//                     `${unitItem.unit.toUpperCase()},  ${
//                       unitItem.validityDate
//                         ? `Valid upto ${unitItem.validityDate.toLocaleDateString('en-IN')}`
//                         : 'Validity date not available'
//                     }`,
//                 )
//                 .join(', ')}`}
//             />
//             <List.Item
//               actions={[
//                 <Button
//                   ghost
//                   size="small"
//                   type="primary"
//                   onClick={() => handleEditExaminer(item)}
//                 >
//                   Edit
//                 </Button>,
//                 <Button
//                   ghost
//                   size="small"
//                   danger
//                   onClick={() => handleDeleteExaminer(item.id)}
//                 >
//                   Delete
//                 </Button>,
//               ]}
//             />
//           </List.Item>
//         )}
//       />
//     </div>
//   );
// }

// export default ListOfExaminers;

import React, { useState, useContext, useEffect } from 'react';
import { Button, List, Avatar, Space, Card, Drawer } from 'antd';
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

const ListOfExaminers: React.FC = () => {
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
};

export default ListOfExaminers;
