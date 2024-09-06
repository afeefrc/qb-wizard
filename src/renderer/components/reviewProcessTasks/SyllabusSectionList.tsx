import React, { useContext, useState } from 'react';
import type { TableProps } from 'antd';
import { Select } from 'antd';
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
  questionPart: number;
}

// const originData: Item[] = [];
// for (let i = 0; i < 10; i++) {
//   originData.push({
//     key: i.toString(),
//     name: `Edward ${i}`,
//     age: 32,
//     address: `London Park no. ${i}`,
//   });
// }
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
  let inputNode;
  if (inputType === 'number') {
    inputNode = <InputNumber />;
  } else if (inputType === 'select') {
    inputNode = (
      <Select>
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
    questions,
    pendingChanges,
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
        questionPart: section.questionPart,
        questionsCount: section.questionsCount,
      }))
      .sort((a, b) => a.serialNumber - b.serialNumber),
  );

  console.log('data', data);

  const isEditing = (record: Item) => record.key === editingKey;

  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({
      ...record,
    });
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
            questionPart: newData[index].questionPart,
            unitName: unitName,
          });
          setIsNewRow(false);
        } else {
          handleUpdateSyllabusSection(key, {
            // serialNumber: newData[index].serialNumber,
            title: newData[index].title,
            minWeightage: newData[index].minWeightage,
            maxWeightage: newData[index].maxWeightage,
            questionPart: newData[index].questionPart,
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
      questionPart: 1,
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
      width: '8%',
      render: (_: any, __: any, index: number) => index + 1,
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
      title: 'Part',
      dataIndex: 'questionPart',
      width: '10%',
      editable: true,
      render: (questionPart: number) =>
        questionPart === 1 ? 'Part A' : 'Part B',
    },
    {
      title: 'Number of Questions',
      dataIndex: 'key',
      width: '10%',
      render: (key: string) => {
        const sectionQuestions = questions.filter(
          (q) =>
            q.syllabusSectionId === key &&
            q.unitName === unitName &&
            !q.isDeleted,
        );
        return sectionQuestions.length;
      },
    },
    {
      title: 'No. of New questions proposed',
      dataIndex: 'key',
      width: '10%',
      render: (key: string) => {
        const newSectionQuestions = pendingChanges.filter(
          (q) =>
            q.data.syllabusSectionId === key &&
            q.data.unitName === unitName &&
            !q.data.isDeleted &&
            q.type === 'add',
        );
        return newSectionQuestions.length;
      },
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        const canDelete =
          questions.filter(
            (q) =>
              q.syllabusSectionId === record.key &&
              q.unitName === unitName &&
              !q.isDeleted,
          ).length === 0 &&
          pendingChanges.filter(
            (change) =>
              change.data.syllabusSectionId === record.key &&
              change.data.unitName === unitName &&
              !change.data.isDeleted,
          ).length === 0;

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
    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
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
          dataSource={data.sort((a, b) => a.serialNumber - b.serialNumber)}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
            // position: ['bottomCenter'],
          }}
        />
      </Form>
      <div>
        <Button
          onClick={handleAdd}
          type="primary"
          style={{ marginBottom: '50px' }}
        >
          Add a new section
        </Button>
      </div>
    </div>
  );
}

export default SyllabusSectionList;
