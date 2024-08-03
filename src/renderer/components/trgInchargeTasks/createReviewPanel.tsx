import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, DatePicker, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

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

function CreateReviewPanel({ unit = '', close }: CreateReviewPanelProps) {
  const appContext = React.useContext(AppContext);
  const { handleAddReviewPanel, examiners } = appContext || {};
  const [form] = Form.useForm();
  const [selectedValues, setSelectedValues] = useState([]);
  // const [chairman, setChairman] = useState('');

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

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    const content = {
      unit: unit,
      members: [values.chairman, ...values.names],
      chairman: values.chairman,
      status: 'initiated',
      comments_initiate: values.comments || '',
      deadline: values.date || null,
    };
    handleAddReviewPanel(content);
    form.resetFields();
    close();
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
    errorInfo,
  ) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div style={{ margin: '20px' }}>
      <Card title={''}>
        <div className="create-review-panel-header">
          <div className="crate-review-panel-unitname">{unit}</div>
          Create question bank review panel for {unit}
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
                      {/* <Input
                        placeholder="Select Panel Member"
                        style={{ width: '60%' }}
                      /> */}
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
                  {/* <Button
                    type="dashed"
                    onClick={() => {
                      add('The head item', 0);
                    }}
                    style={{ width: '60%', marginTop: '20px' }}
                    icon={<PlusOutlined />}
                  >
                    Add field at head
                  </Button> */}
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter the title' }]}
          >
            <Input />
          </Form.Item> */}
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
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button htmlType="reset">Reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateReviewPanel;
