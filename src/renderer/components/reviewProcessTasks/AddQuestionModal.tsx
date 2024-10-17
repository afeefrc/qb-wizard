import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Tabs,
  Upload,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';

const { TabPane } = Tabs;

interface AddQuestionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

interface ImageFile extends UploadFile {
  blob?: Blob;
}

function AddQuestionModal({
  visible,
  onCancel,
  onSubmit,
}: AddQuestionModalProps) {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('oneWord');
  const [mcqOptions, setMcqOptions] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);

  const handleSubmit = () => {
    // Get all form fields
    const allFields = form.getFieldsValue();

    // Define required fields for each tab
    const requiredFields = {
      oneWord: ['questionText', 'answerText', 'marks'],
      mcq: ['questionText', 'answerList', 'correctOption', 'marks'],
      shortAnswer: ['questionText', 'answerText', 'marks'],
      longAnswer: ['questionText', 'answerText', 'marks'],
      trueFalse: ['questionText', 'trueAnswer', 'answerText', 'marks'],
      fillInTheBlanks: ['questionText', 'answerList', 'marks'],
      matchTheFollowing: ['questionText', 'matchPairs', 'marks'],
    };

    // Filter only the fields for the active tab
    const activeTabFields = requiredFields[
      activeTab as keyof typeof requiredFields
    ].reduce(
      (acc, field) => {
        acc[field] = allFields[field];
        return acc;
      },
      {} as Record<string, any>,
    );

    // Validate only the active tab fields
    form
      .validateFields(requiredFields[activeTab as keyof typeof requiredFields])
      .then((values) => {
        const submissionData = {
          questionType: activeTab,
          ...activeTabFields,
          image: imageFile?.blob || null,
        };

        // Handle the True/False case
        if (activeTab === 'trueFalse' && values.trueAnswer === true) {
          delete submissionData.answerText;
        }

        console.log(submissionData);
        onSubmit(submissionData);
        form.resetFields();
        setMcqOptions([]);
        setImageFile(null);
      })
      .catch((error) => {
        console.error('Form validation failed:', error);
      });
  };

  const handleTabChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab);
    setMcqOptions([]);
    form.resetFields();
  };

  const handleImageUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }

    setImageFile({
      uid: file.uid,
      name: file.name,
      status: 'done',
      blob: file, // Store the actual file (Blob) here
    });
    return false; // Prevent default upload behavior
  };

  const renderImageUpload = () => (
    <Form.Item name="image" label="Upload Image">
      <Upload
        accept="image/*"
        beforeUpload={handleImageUpload}
        fileList={imageFile ? [imageFile] : []}
      >
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
    </Form.Item>
  );

  return (
    <Modal
      title="Add New Question"
      visible={visible}
      onCancel={onCancel}
      width={850}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit
        </Button>,
      ]}
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
        <TabPane tab="One Word" key="oneWord">
          <Form form={form} layout="vertical">
            <Form.Item
              name="questionText"
              label="Question"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="answerText"
              label="Answer"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="marks" label="Marks" rules={[{ required: true }]}>
              <InputNumber min={1} />
            </Form.Item>
            {renderImageUpload()}
          </Form>
        </TabPane>
        <TabPane tab="MCQ" key="mcq">
          <Form form={form} layout="vertical">
            <Form.Item
              name="questionText"
              label="Question"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
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
                          onChange={(e) => {
                            const newOptions = [...mcqOptions];
                            newOptions[index] = e.target.value;
                            setMcqOptions(newOptions);
                            // Update form values
                            const currentAnswerList =
                              form.getFieldValue('answerList') || [];
                            currentAnswerList[index] = e.target.value;
                            form.setFieldsValue({
                              answerList: currentAnswerList,
                            });
                          }}
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
              name="correctOption"
              label="Correct Answer"
              rules={[{ required: true }]}
            >
              <Select>
                {mcqOptions.map((option, index) => (
                  <Select.Option key={index} value={index}>
                    {option || `Option ${index + 1}`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="marks" label="Marks" rules={[{ required: true }]}>
              <InputNumber min={1} />
            </Form.Item>
            {renderImageUpload()}
          </Form>
        </TabPane>
        <TabPane tab="Short Answer" key="shortAnswer">
          <Form form={form} layout="vertical">
            <Form.Item
              name="questionText"
              label="Question"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="answerText"
              label="Answer key"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="marks" label="Marks" rules={[{ required: true }]}>
              <InputNumber min={1} />
            </Form.Item>
            {renderImageUpload()}
          </Form>
        </TabPane>
        <TabPane tab="Long Answer" key="longAnswer">
          <Form form={form} layout="vertical">
            <Form.Item
              name="questionText"
              label="Question"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="answerText"
              label="Answer key"
              rules={[
                { required: true, message: 'Please enter the answer key' },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="marks" label="Marks" rules={[{ required: true }]}>
              <InputNumber min={1} />
            </Form.Item>
            {renderImageUpload()}
          </Form>
        </TabPane>
        <TabPane tab="True/False" key="trueFalse">
          <Form form={form} layout="vertical">
            <Form.Item
              name="questionText"
              label="Question"
              rules={[{ required: true, message: 'Please enter the question' }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="trueAnswer"
              label="Correct Answer"
              rules={[
                { required: true, message: 'Please select the correct answer' },
              ]}
            >
              <Select
                onSelect={(value) => {
                  // set answer text defult for true answer. to avoid validation error
                  if (activeTab === 'trueFalse' && value === true) {
                    form.setFieldsValue({
                      answerText: 'true',
                    });
                  }
                }}
              >
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
                    <Input.TextArea />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
            <Form.Item
              name="marks"
              label="Marks"
              rules={[{ required: true, message: 'Please enter the marks' }]}
            >
              <InputNumber min={1} />
            </Form.Item>
            {renderImageUpload()}
          </Form>
        </TabPane>
        <TabPane tab="Fill in the Blanks" key="fillInTheBlanks">
          <Form form={form} layout="vertical">
            <Form.Item
              name="questionText"
              label="Question (Use '_' for blanks)"
              rules={[{ required: true, message: 'Please enter the question' }]}
            >
              <Input.TextArea placeholder="Write the question ___." />
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
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      required={false}
                      key={field.key}
                      label={index === 0 ? 'Answers' : ''}
                    >
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message:
                              'Please input the answer or delete this field.',
                          },
                        ]}
                        noStyle
                      >
                        <Input placeholder="Answer" style={{ width: '60%' }} />
                      </Form.Item>
                      {fields.length > 1 && (
                        <Button type="link" onClick={() => remove(field.name)}>
                          Delete
                        </Button>
                      )}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      Add Answer
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item
              name="marks"
              label="Marks"
              rules={[{ required: true, message: 'Please enter the marks' }]}
            >
              <InputNumber min={1} />
            </Form.Item>
            {renderImageUpload()}
          </Form>
        </TabPane>
        <TabPane tab="Match the Following" key="matchTheFollowing">
          <Form form={form} layout="vertical">
            <Form.Item
              name="questionText"
              label="Question"
              rules={[{ required: true, message: 'Please enter the question' }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.List
              name="matchPairs"
              rules={[
                {
                  validator: async (_, pairs) => {
                    if (!pairs || pairs.length < 2) {
                      return Promise.reject(
                        new Error('At least two pairs are required'),
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
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
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item
              name="marks"
              label="Marks"
              rules={[{ required: true, message: 'Please enter the marks' }]}
            >
              <InputNumber min={1} />
            </Form.Item>
            {renderImageUpload()}
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
}

export default AddQuestionModal;
