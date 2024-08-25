import React, { useContext, useState } from 'react';
import type { TableProps } from 'antd';
import {
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  Typography,
  Button,
  Tooltip,
} from 'antd';

import { AppContext } from '../../context/AppContext';

interface SyllabusSectionListProps {
  unitName: string;
}

interface Item {
  key: string;
  serialNumber: number;
  title: string;
  minWeightage: number;
  maxWeightage: number;
  questionsCount: number;
}

const originData: Item[] = [];
for (let i = 0; i < 10; i++) {
  originData.push({
    key: i.toString(),
    name: `Edward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}
// const syllabusData: Item[] = [];

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
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
}: React.PropsWithChildren<EditableCellProps>) {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
}

function SyllabusSectionList({ unitName = '' }: SyllabusSectionListProps) {
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

  const filteredSections = syllabusSections.filter(
    (section) => section.unitName === unitName,
  );

  const [data, setData] = useState(() =>
    filteredSections
      .map((section) => ({
        key: section.id,
        serialNumber: section.serialNumber,
        title: section.title,
        minWeightage: section.minWeightage,
        maxWeightage: section.maxWeightage,
        questionsCount: section.questionsCount,
      }))
      .sort((a, b) => a.serialNumber - b.serialNumber),
  );

  console.log('data', data);

  const isEditing = (record: Item) => record.key === editingKey;

  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    const editingRecord = data.find((item) => item.key === editingKey);
    if (editingRecord && !editingRecord.title) {
      // Remove the empty row from the data
      setData(data.filter((item) => item.key !== editingKey));
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
            serialNumber: newData[index].serialNumber,
            title: newData[index].title,
            minWeightage: newData[index].minWeightage,
            maxWeightage: newData[index].maxWeightage,
            unitName: unitName,
          });
          setIsNewRow(false);
        } else {
          handleUpdateSyllabusSection(key, {
            serialNumber: newData[index].serialNumber,
            title: newData[index].title,
            minWeightage: newData[index].minWeightage,
            maxWeightage: newData[index].maxWeightage,
          });
        }
      }

      setEditingKey('');
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };
  const handleAdd = () => {
    const newKey = Date.now().toString();
    const newSerialNumber =
      data.length > 0
        ? Math.max(...data.map((item) => item.serialNumber)) + 1
        : 1;
    const newData: Item = {
      key: newKey, // Use timestamp as a unique key
      serialNumber: newSerialNumber,
      title: '',
      minWeightage: 0,
      maxWeightage: 0,
      questionsCount: 0,
    };
    setData([...data, newData]);
    setEditingKey(newData.key);
    setIsNewRow(true);
    form.setFieldsValue(newData);
    // Optionally, you can call handleUpdateSyllabusSection here to persist the new section
  };

  const handleDelete = (key: React.Key) => {
    const newData = data.filter((item) => item.key !== key);
    setData(newData);
    handleDeleteSyllabusSection(key);
  };

  const columns = [
    {
      title: 'Serial No.',
      dataIndex: 'serialNumber',
      width: '10%',
      // editable: true,
    },
    {
      title: 'title',
      dataIndex: 'title',
      width: '40%',
      editable: true,
    },
    {
      title: 'Minimum weightage',
      dataIndex: 'minWeightage',
      width: '10%',
      editable: true,
    },
    {
      title: 'Maximum weightage',
      dataIndex: 'maxWeightage',
      width: '10%',
      editable: true,
    },
    {
      title: 'Number of Questions',
      dataIndex: 'questionsCount',
      width: '10%',
      // editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        const canDelete = record.questionsCount === 0;

        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{ marginInlineEnd: 8 }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <Typography.Link
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
              style={{ marginInlineEnd: 8 }}
            >
              Edit
            </Typography.Link>
            {canDelete ? (
              <Popconfirm
                title="Are you sure you want to delete this section?"
                onConfirm={() => handleDelete(record.key)}
              >
                <Typography.Link disabled={editingKey !== ''}>
                  Delete
                </Typography.Link>
              </Popconfirm>
            ) : (
              <Tooltip
                title="Cannot delete sections with questions.
              Remove questions from this section or move questions to another section."
              >
                <Typography.Link disabled={true}>Delete</Typography.Link>
              </Tooltip>
            )}
          </span>
        );
      },
    },
  ];

  const mergedColumns: TableProps<Item>['columns'] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: col.dataIndex === 'title' ? 'text' : 'number',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <h3>Syllabus Sections for {unitName}</h3>
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add a new section
      </Button>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
            // position: ['bottomCenter'],
          }}
        />
      </Form>
    </div>
  );
}

export default SyllabusSectionList;
