import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Radio,
  Switch,
} from 'antd';

interface ColumnDataType {
  id: string;
  serialNumber: string;
  questionText: string;
  answerText: string;
  marks: number;
  questionType: string;
  difficultyLevel: string;
  answerList?: string[];
  trueAnswer?: boolean;
  correctOption?: string;
  matchPairs?: Array<{ item: string; match: string }>;
  mandatory?: boolean;
}

interface ExpandedRowEditorProps {
  record: ColumnDataType;
  onSave: (updatedRecord: ColumnDataType) => void;
  onCancel: () => void; // New prop for handling cancellation
}

function ExpandedRowEditor({
  record,
  onSave,
  onCancel,
}: ExpandedRowEditorProps) {
  const [form] = Form.useForm();

  // Set initial values when the component mounts or when the record changes
  useEffect(() => {
    form.setFieldsValue({
      ...record,
      answerList:
        record.questionType === 'mcq' ||
        record.questionType === 'fillInTheBlanks'
          ? record.answerList || []
          : undefined,
      correctOption:
        record.questionType === 'mcq' ? record.correctOption : undefined,
    });
  }, [form, record]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const updatedRecord = { ...record, ...values };
        return onSave(updatedRecord);
      })
      .catch((errorInfo) => {
        // Validation failed
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel(); // Call the onCancel prop to close the expansion
  };

  const renderFormFields = () => {
    switch (record.questionType) {
      case 'oneWord':
      case 'shortAnswer':
      case 'longAnswer':
        return (
          <>
            <Form.Item
              name="questionText"
              label="Question"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="answerText"
              label="Answer"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </>
        );
      case 'mcq':
        return (
          <>
            <Form.Item
              name="questionText"
              label="Question"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.List
              name="answerList"
              rules={[
                {
                  validator: async (_, answerList) => {
                    if (!answerList || answerList.length < 2) {
                      return Promise.reject(
                        new Error('At least 2 options are required'),
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item required={false} key={field.key}>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            message:
                              'Please input the option or delete this field.',
                          },
                        ]}
                        noStyle
                      >
                        <Input
                          placeholder={`Option ${index + 1}`}
                          style={{ width: '60%' }}
                        />
                      </Form.Item>
                      {fields.length > 2 && (
                        <Button type="link" onClick={() => remove(field.name)}>
                          Delete
                        </Button>
                      )}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      Add Option
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.answerList !== currentValues.answerList
              }
            >
              {({ getFieldValue }) => {
                const answerList = getFieldValue('answerList') || [];
                return (
                  <Form.Item
                    name="correctOption"
                    label="Correct Answer"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      {answerList.map((option: string, index: number) => (
                        <Select.Option key={index} value={index}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </>
        );
      case 'fillInTheBlanks':
        return (
          <>
            <Form.Item
              name="questionText"
              label="Question (Use '_' for blanks)"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter the question with _ for blanks."
              />
            </Form.Item>
            <Form.List
              name="answerList"
              rules={[
                {
                  validator: async (_, answerList) => {
                    if (!answerList || answerList.length < 1) {
                      return Promise.reject(
                        new Error('At least one answer is required'),
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      required={false}
                      key={field.key}
                      label={index === 0 ? 'Answers' : ''}
                    >
                      <Space>
                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              required: true,
                              message:
                                'Please input the answer or delete this field.',
                            },
                          ]}
                          noStyle
                        >
                          <Input
                            placeholder={`Answer for blank ${index + 1}`}
                            style={{ width: '200px' }}
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <Button
                            type="link"
                            onClick={() => remove(field.name)}
                          >
                            Delete
                          </Button>
                        )}
                      </Space>
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      Add Answer
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </>
        );

      case 'matchTheFollowing':
        return (
          <>
            <Form.Item
              name="questionText"
              label="Question"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.List
              name="matchPairs"
              rules={[
                {
                  validator: async (_, matchPairs) => {
                    if (!matchPairs || matchPairs.length < 2) {
                      return Promise.reject(
                        new Error('At least two pairs are required'),
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      required={false}
                      key={field.key}
                      label={index === 0 ? 'Match Pairs' : ''}
                    >
                      <Input.Group compact>
                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message:
                                'Please input the item or delete this pair.',
                            },
                          ]}
                          noStyle
                          name={[field.name, 'item']}
                        >
                          <Input style={{ width: '45%' }} placeholder="Item" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message:
                                'Please input the match or delete this pair.',
                            },
                          ]}
                          noStyle
                          name={[field.name, 'match']}
                        >
                          <Input style={{ width: '45%' }} placeholder="Match" />
                        </Form.Item>
                        {fields.length > 2 && (
                          <Button
                            type="link"
                            onClick={() => remove(field.name)}
                            style={{ width: '10%' }}
                          >
                            Delete
                          </Button>
                        )}
                      </Input.Group>
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      Add Pair
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </>
        );

      case 'trueFalse':
        return (
          <>
            <Form.Item
              name="questionText"
              label="Question"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="trueAnswer"
              label="Correct Answer"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value={true}>True</Select.Option>
                <Select.Option value={false}>False</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.trueAnswer !== currentValues.trueAnswer
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('trueAnswer') === false ? (
                  <Form.Item
                    name="answerText"
                    label="Answer Text"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter the answer text for False',
                      },
                    ]}
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        // padding: '30px 10px',
        // border: '1px solid #e0e0e0',
        // backgroundColor: '#f0f0f0',
        width: '70%',
        margin: '0 auto', // Center horizontally
        display: 'flex',
        justifyContent: 'center', // Center content horizontally
        alignItems: 'center', // Center content vertically
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ width: '90%' }}
      >
        {renderFormFields()}
        <Form.Item name="marks" label="Marks">
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item name="difficultyLevel" label="Difficulty Level">
          <Select>
            <Select.Option value="easy">Easy</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="hard">Hard</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="mandatory"
          label="Toggle if question is mandatory to appear in the question paper"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              Save Changes
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export default ExpandedRowEditor;
