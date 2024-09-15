import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, DatePicker, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { AppContext } from '../../context/AppContext';

type CreateReviewPanelProps = {
  unit?: string;
  close: () => void;
};

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};

function CreateReviewPanel({
  unit = '',
  close,
  editValues, //bring in the content if editing. if null it means we are creating a new panel
  // setEditBtnPressed, //set the edit button to true/false
}: CreateReviewPanelProps) {
  const appContext = React.useContext(AppContext);
  const {
    handleAddReviewPanel,
    handleUpdateReviewPanel,
    examiners,
    handleAddUserActivityLog,
  } = appContext || {};
  const [form] = Form.useForm();
  const [selectedValues, setSelectedValues] = useState([]);
  // const [chairman, setChairman] = useState('');

  useEffect(() => {
    if (editValues) {
      console.log('editValues', editValues);
      const data = {
        unit: editValues.unit,
        chairman: editValues.chairman,
        names: editValues.members.filter(
          (member) => member !== editValues.chairman,
        ),
        comments: editValues.comments_initiate,
        date: dayjs(editValues.deadline),
      };
      form.setFieldsValue(data);
    }
  }, [editValues, form]);

  const handleSelectChange = (value, index) => {
    const newSelectedValues = [...selectedValues];
    newSelectedValues[index] = value;
    setSelectedValues(newSelectedValues);
  };

  const examinerOptions = examiners.map((examiner) => ({
    value: examiner.id,
    label: examiner.examinerName,
  }));

  const filteredOptions = (index) => {
    return examinerOptions.filter(
      (option) =>
        !selectedValues.includes(option.value) ||
        selectedValues[index] === option.value,
    );
  };

  const getExaminerName = (id) =>
    examiners.find((e) => e.id === id)?.examinerName || id;

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    const content = {
      unit: unit,
      members: [values.chairman, ...values.names],
      chairman: values.chairman,
      status: 'Initiated',
      comments_initiate: values.comments || '',
      deadline: values.date?.toDate() || null,
    };
    handleAddReviewPanel(content);
    handleAddUserActivityLog({
      user: 'TRG Incharge',
      action: `Question bank review process for ${unit}`,
      targetType: 'questionBank',
      description: `Created review panel. Members: ${getExaminerName(values.chairman)} (Chairman), ${values.names.map(getExaminerName).join(', ')}`,
    });
    form.resetFields();
    close();
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
    errorInfo,
  ) => {
    console.log('Failed:', errorInfo);
  };

  const handleUpdateBtn = () => {
    const formValues = form.getFieldsValue();
    const content = {
      unit: unit,
      members: [formValues.chairman, ...formValues.names],
      chairman: formValues.chairman,
      status: editValues.status || 'initiated',
      comments_initiate: formValues.comments || '',
      deadline: formValues.date?.toDate() || null,
    };
    handleUpdateReviewPanel(editValues.id, content);
    form.resetFields();
    close();
  };

  const handleCancelBtn = () => {
    form.resetFields();
    close();
  };

  return (
    <div style={{ margin: '10px 20px' }}>
      <Card title={''}>
        <div className="create-review-panel-header">
          <div className="create-review-panel-unitname">{unit}</div>
          {editValues ? 'Edit ' : 'Create '}
          question bank review panel for {unit}
        </div>
        <Form
          form={form}
          {...formItemLayout}
          style={{ marginTop: '20px' }}
          name="createReviewPanel"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Panel Chairman"
            name="chairman"
            required
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Please select panel chairman',
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Search examiner"
              style={{ width: '60%' }}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={filteredOptions(0)}
              onChange={(value) => handleSelectChange(value, 0)}
            />
          </Form.Item>
          <Form.List
            name="names"
            rules={[
              {
                validator: async (_, names) => {
                  if (!names || names.length < 1) {
                    return Promise.reject(new Error('At least 1 Member'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    {...(index === 0
                      ? formItemLayout
                      : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Panel Members' : ''}
                    required={false}
                    key={field.key}
                  >
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: 'Please select panel member',
                        },
                      ]}
                      noStyle
                    >
                      <Select
                        showSearch
                        placeholder="Search examiner"
                        style={{ width: '60%' }}
                        filterOption={(input, option) =>
                          (option?.label ?? '')
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={filteredOptions(index + 1)} //+1 because we have already reserved first member (chairman)
                        onChange={(value) =>
                          handleSelectChange(value, index + 1)
                        }
                      />
                    </Form.Item>
                    {fields.length > 0 ? (
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                        style={{ margin: '0 8px', fontSize: '20px' }}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    style={{ width: '40%', marginLeft: '25%' }}
                    icon={<PlusOutlined />}
                  >
                    Add Panel Member
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item
            label="Comments"
            name="comments"
            // rules={[
            //   { required: true, message: 'Please enter the description' },
            // ]}
          >
            <Input.TextArea style={{ width: '60%' }} />
          </Form.Item>
          <Form.Item
            label="Deadline"
            name="date"
            // rules={[{ required: true, message: 'Please select the date' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item style={{ display: 'flex', justifyContent: 'center' }}>
            <Space>
              {editValues === undefined ? (
                <>
                  <Button type="primary" htmlType="submit">
                    Create
                  </Button>
                  <Button htmlType="reset">Reset</Button>
                </>
              ) : (
                <>
                  <Button type="primary" onClick={handleUpdateBtn}>
                    Update
                  </Button>
                  <Button htmlType="button" onClick={handleCancelBtn}>
                    Cancel
                  </Button>
                </>
              )}
              {/* <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button htmlType="reset">Reset</Button> */}
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateReviewPanel;
