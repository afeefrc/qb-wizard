/* eslint-disable react/function-component-definition */
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Space,
  Alert,
} from 'antd';
import { FormInstance, FormProps } from 'antd';
import dayjs from 'dayjs';
import { AppContext } from '../context/AppContext';
import { designationList } from '../SampleData';

interface Unit {
  unit: string;
  validityDate: Date | null;
}

type FieldType = {
  id?: string;
  examinerName?: string;
  examinerEmpId?: number;
  examinerDesignation?: string;
  examinerUnits?: Unit[];
  unitsApplicable?: string[];
};

interface SubmitButtonProps {
  form: FormInstance;
}

const createOptions = (array: string[]) => {
  return array.map((item) => ({
    value: item.toLowerCase(),
    label: item,
  }));
};

const SubmitButton: React.FC<React.PropsWithChildren<SubmitButtonProps>> = ({
  form,
  children,
}) => {
  const [submittable, setSubmittable] = useState<boolean>(false);

  const values = Form.useWatch([], form);

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  return (
    <Button type="primary" htmlType="submit" disabled={!submittable}>
      {children}
    </Button>
  );
};

interface ExaminerFormProps {
  editExaminer: FieldType | undefined;
  setEditExaminer: React.Dispatch<React.SetStateAction<FieldType | undefined>>;
  handleAddExaminer: (examinerInfo: FieldType) => void;
  handleUpdateExaminer: (
    id: string | undefined,
    examinerInfo: FieldType,
  ) => void;
}

const ExaminerForm: React.FC<ExaminerFormProps> = ({
  editExaminer,
  setEditExaminer,
  handleAddExaminer,
  handleUpdateExaminer,
  closeCard,
}) => {
  const appContext = useContext(AppContext);
  const { settings, examiners } = appContext || {};
  const [form] = Form.useForm();
  const [unitsChange, setUnitsChange] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // useEffect(() => {
  //   setEditExaminer(undefined);
  //   form.resetFields();
  //   setUnitsChange([]);
  //   setErrorMessage('');
  // }, [examiners, form, setEditExaminer]);

  // on submit form
  const onFinish = useCallback<FormProps<FieldType>['onFinish']>(
    async (values) => {
      const units =
        values.unitsApplicable?.map((unit) => ({
          unit,
          validityDate: values[`validity_${unit}`]?.toDate() || null,
        })) || [];

      const examinerInfo = {
        examinerName: values.examinerName,
        examinerEmpId: values.employeeId,
        examinerDesignation: values.designation,
        examinerUnits: units,
      };
      if (editExaminer === undefined) {
        if (handleAddExaminer) {
          try {
            const result = await handleAddExaminer(examinerInfo);
            if (
              typeof result === 'string' &&
              result ===
                'Examiner with the same employee Id already exists. Edit or delete the existing examiner.'
            ) {
              setErrorMessage(result);
            } else {
              form.resetFields();
              closeCard();
            }
          } catch (error) {
            console.error('Failed to add examiner at form level', error);
            // form.resetFields();
          }
        }
      } else {
        handleUpdateExaminer(editExaminer?.id, examinerInfo);
        form.resetFields();
        closeCard();
      }
      // form.resetFields();
      setEditExaminer(undefined);
      setUnitsChange([]);
    },
    [
      editExaminer,
      form,
      setEditExaminer,
      handleAddExaminer,
      closeCard,
      handleUpdateExaminer,
    ],
  );

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
    errorInfo,
  ) => {
    console.log('Failed:', errorInfo);
  };

  const handleUnitsChange = (value: string | string[]) => {
    setUnitsChange(value as string[]);
  };

  const handleResetBtn = () => {
    setEditExaminer(undefined);
    setUnitsChange([]);
    setErrorMessage('');
  };

  const handleCloseBtn = () => {
    closeCard();
    setUnitsChange([]);
    setErrorMessage('');
  };

  useEffect(() => {
    if (editExaminer) {
      const validityDates =
        Array.isArray(editExaminer.examinerUnits) &&
        editExaminer.examinerUnits.length > 0
          ? editExaminer.examinerUnits.reduce(
              (acc, { unit, validityDate }) => {
                if (validityDate) {
                  acc[`validity_${unit}`] = dayjs(validityDate);
                }
                return acc;
              },
              {} as { [key: string]: dayjs.Dayjs },
            )
          : {};

      form.setFieldsValue({ ...editExaminer, ...validityDates });
      // setUnitsChange(editExaminer.unitsApplicable || []);
    }
  }, [editExaminer, form]);

  return (
    <Form
      form={form}
      size="small"
      name="validateOnly"
      // layout="vertical"
      labelCol={{ span: 10 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={editExaminer}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: 10 }}
          closable
        />
      )}

      <Form.Item<FieldType>
        label="Examiner Name"
        name="examinerName"
        rules={[{ required: true, message: 'Please input Examiner Name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Employee ID"
        name="employeeId"
        rules={[
          { required: true, message: 'Please input Examiner Employee ID!' },
        ]}
      >
        <InputNumber controls={false} />
      </Form.Item>

      <Form.Item<FieldType>
        label="Designation"
        name="designation"
        rules={[
          { required: true, message: 'Please input Examiner Designation!' },
        ]}
      >
        <Select
          placeholder="Please select designation"
          options={createOptions(designationList)}
        />
      </Form.Item>

      <Form.Item<FieldType>
        label="Units Applicable"
        name="unitsApplicable"
        rules={[{ required: true, message: 'Please input units !' }]}
      >
        <Select
          mode="multiple"
          allowClear
          // style={{ width: '100%' }}
          placeholder="Please select units"
          options={createOptions(settings.unitsApplicable)}
          onChange={handleUnitsChange}
        />
      </Form.Item>

      {unitsChange.map((unit) => (
        <Form.Item
          key={unit}
          label={`Date of validity for ${unit.toUpperCase()}`}
          name={`validity_${unit}`}
        >
          <DatePicker format="DD-MM-YYYY" />
        </Form.Item>
      ))}

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Space>
          <SubmitButton form={form}>Submit</SubmitButton>
          <Button htmlType="reset" onClick={handleResetBtn}>
            Reset
          </Button>
          <Button danger onClick={handleCloseBtn}>
            Close
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ExaminerForm;
