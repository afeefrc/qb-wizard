import React, { useState, useContext } from 'react';
import type { FormProps } from 'antd';
import {
  Flex,
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
} from 'antd';
import { useForm, Resolver, set } from 'react-hook-form';
import { AppContext } from '../context/AppContext';
import { designationList } from '../SampleData';

type FieldType = {
  examinerName?: string;
  employeeId?: number;
  designation?: string;
  units?: string[];
  dateOfValidity?: Date;
};

function createOptions(array) {
  return array.map((item) => ({
    value: item.toLowerCase(),
    label: item,
  }));
}

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
  console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

function ListOfExaminers() {
  const appContext = useContext(AppContext);
  const { settings } = appContext || {};
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    // Process the form data here
    reset();
  };

  return (
    <Form
      name="basic"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 15 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item<FieldType>
        label="Examiner Name"
        name="examinerName"
        rules={[{ required: true, message: 'Please input Examiner Name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Employee ID"
        name="employeeId"
        rules={[
          { required: true, message: 'Please input Examiner Employee ID!' },
        ]}
      >
        <InputNumber controls={false} />
      </Form.Item>

      <Form.Item
        label="Designation"
        name="designation"
        rules={[
          { required: true, message: 'Please input Examiner Designation!' },
        ]}
      >
        <Select
          // defaultValue="JGM"
          // style={{ width: 120 }}
          placeholder="Please select designation"
          options={createOptions(designationList)}
        />
      </Form.Item>

      <Form.Item
        label="Units Applicable"
        name="unitsApplicable"
        rules={[
          { required: true, message: 'Please input Examiner Designation!' },
        ]}
      >
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          placeholder="Please select units"
          // defaultValue={['a10', 'c12']}
          // onChange={handleChange}
          options={createOptions(settings.unitsApplicable)}
        />
      </Form.Item>

      <Form.Item label="Date of validity" name="validityDate">
        <DatePicker />
      </Form.Item>

      {/* <Form.Item<FieldType>
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password />
      </Form.Item> */}

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>

    // <div>
    //   <h2>List of Examiners</h2>
    //   <form onSubmit={handleSubmit(onSubmit)}>
    //     <div>
    //       <label htmlFor="examinerName">Examiner Name:</label>
    //       <input
    //         type="text"
    //         id="examinerName"
    //         {...register('examinerName', { required: true })}
    //       />
    //     </div>
    //     <div>
    //       <label htmlFor="employeeId">Employee ID:</label>
    //       <input
    //         type="text"
    //         id="employeeId"
    //         {...register('employeeId', { required: true })}
    //       />
    //     </div>
    //     <div>
    //       <label htmlFor="designation">Designation:</label>
    //       <input
    //         type="text"
    //         id="designation"
    //         {...register('designation', { required: true })}
    //       />
    //     </div>
    //     <div>
    //       <label htmlFor="units">List of Units:</label>
    //       {/* <input
    //         type="text"
    //         id="units"
    //         {...register('units', { required: true })}
    //       /> */}
    //       {settings.unitsApplicable.map((unit) => (
    //         <div key={unit} className="unit-options-container">
    //           <label>
    //             <input type="checkbox" {...register('units')} value={unit} />
    //             {unit}
    //           </label>
    //         </div>
    //       ))}
    //     </div>
    //     <div>
    //       <label htmlFor="validityDate">Date of Validity:</label>
    //       <input
    //         type="date"
    //         id="validityDate"
    //         {...register('validityDate', { required: true })}
    //       />
    //     </div>
    //     <button type="submit">Add Examiner</button>
    //   </form>
    // </div>
  );
}

export default ListOfExaminers;
