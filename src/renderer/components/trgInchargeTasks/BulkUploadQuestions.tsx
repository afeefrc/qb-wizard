import React, { useContext, useState } from 'react';
import {
  Collapse,
  Button,
  Table,
  Upload,
  message,
  Form,
  Select,
  Input,
  InputNumber,
  Typography,
  Popconfirm,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { AppContext } from '../../context/AppContext';

const { Panel } = Collapse;

interface Item {
  key: string;
  serialNumber: number;
  title: string;
  minWeightage: number;
  maxWeightage: number;
  questionPart: number;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' | 'select';
  record: Item;
  index: number;
  children: React.ReactNode;
}

function EditableCell({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}: EditableCellProps) {
  let inputNode;
  if (inputType === 'number') {
    inputNode = <InputNumber />;
  } else if (inputType === 'select') {
    inputNode = (
      <Select style={{ width: '100%' }}>
        <Select.Option value={1}>Part A</Select.Option>
        <Select.Option value={2}>Part B</Select.Option>
      </Select>
    );
  } else {
    inputNode = <Input />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please Input ${title}!` }]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
}

function SectionTable({ unitName }: { unitName: string }) {
  const appContext = useContext(AppContext);
  const {
    syllabusSections,
    handleUpdateSyllabusSection,
    handleAddSyllabusSection,
    handleDeleteSyllabusSection,
  } = appContext || {};
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [isNewRow, setIsNewRow] = useState(false);

  const [data, setData] = useState(() =>
    syllabusSections
      .filter((section) => section.unitName === unitName)
      .map((section) => ({
        key: section.id,
        serialNumber: section.serialNumber,
        title: section.title,
        minWeightage: section.minWeightage,
        maxWeightage: section.maxWeightage,
        questionPart: section.questionPart,
      }))
      .sort((a, b) => a.serialNumber - b.serialNumber),
  );

  const isEditing = (record: Item) => record.key === editingKey;

  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    if (isNewRow) {
      setData(data.filter((item) => item.key !== editingKey));
      setIsNewRow(false);
    }
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as Item;
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);

        if (isNewRow) {
          handleAddSyllabusSection({
            ...row,
            unitName,
          });
          setIsNewRow(false);
        } else {
          handleUpdateSyllabusSection(key, row);
        }
      }
      setEditingKey('');
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleUpload = (sectionId: string) => {
    // TODO: Implement CSV upload logic
    message.info(`Upload CSV for section ${sectionId}`);
  };

  const handleAdd = () => {
    const newKey = Date.now().toString();
    const newSerialNumber =
      data.length > 0
        ? Math.max(...data.map((item) => item.serialNumber)) + 1
        : 1;

    const newData: Item = {
      key: newKey,
      serialNumber: newSerialNumber,
      title: '',
      minWeightage: 0,
      maxWeightage: 0,
      questionPart: 1,
    };

    setData([...data, newData]);
    setEditingKey(newKey);
    setIsNewRow(true);
    form.setFieldsValue(newData);
  };

  const columns = [
    {
      title: 'Serial No.',
      dataIndex: 'serialNumber',
      width: '8%',
      render: (_: any, __: any, index: number) => index + 1,
      editable: false,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: '30%',
      editable: true,
    },
    {
      title: 'Part',
      dataIndex: 'questionPart',
      width: '10%',
      editable: true,
      render: (part: number) => (part === 1 ? 'Part A' : 'Part B'),
    },
    {
      title: 'Min Weightage',
      dataIndex: 'minWeightage',
      width: '15%',
      editable: true,
    },
    {
      title: 'Max Weightage',
      dataIndex: 'maxWeightage',
      width: '15%',
      editable: true,
    },
    {
      title: 'Upload',
      width: '12%',
      editable: false,
      render: (_: any, record: any) => (
        <Upload
          beforeUpload={(file) => {
            const isCsv = file.type === 'text/csv';
            if (!isCsv) {
              message.error('Please upload a CSV file only!');
            }
            return isCsv || Upload.LIST_IGNORE;
          }}
          onChange={(info) => {
            if (info.file.status === 'done') {
              handleUpload(record.key);
            }
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>CSV</Button>
        </Upload>
      ),
    },
    {
      title: 'Actions',
      width: '10%',
      editable: false,
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              type="link"
              onClick={() => save(record.key)}
              style={{ marginRight: 8, padding: 0 }}
            >
              Save
            </Button>
            <Popconfirm title="Cancel editing?" onConfirm={cancel}>
              <Button type="link" danger style={{ padding: 0 }}>
                Cancel
              </Button>
            </Popconfirm>
          </span>
        ) : (
          <Button
            type="link"
            disabled={editingKey !== ''}
            onClick={() => {
              edit(record);
              setIsNewRow(false);
            }}
            style={{ padding: 0 }}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: (() => {
          if (col.dataIndex === 'questionPart') return 'select';
          if (col.dataIndex === 'title') return 'text';
          return 'number';
        })(),
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div>
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add Section
      </Button>
      <Form form={form} component={false}>
        <Table
          components={{
            body: { cell: EditableCell },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
        />
      </Form>
    </div>
  );
}

function BulkUploadQuestions() {
  const appContext = useContext(AppContext);
  const { settings } = appContext || {};
  const unitNames = settings.unitsApplicable;

  return (
    <div style={{ padding: '20px', marginBottom: '150px' }}>
      <h2>Bulk Upload Questions</h2>
      <p>
        Select a unit and upload a CSV file containing questions for the
        corresponding syllabus section. Please ensure your CSV file follows the
        required format.
      </p>

      <Collapse>
        {unitNames.map((unitName: string) => (
          <Panel header={`Unit: ${unitName}`} key={unitName}>
            <SectionTable unitName={unitName} />
          </Panel>
        ))}
      </Collapse>
    </div>
  );
}

export default BulkUploadQuestions;
