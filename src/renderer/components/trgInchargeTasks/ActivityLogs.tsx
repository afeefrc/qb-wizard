import React from 'react';
import { Tag, Table, Button, DatePicker } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { format, isWithinInterval } from 'date-fns';
import { AppContext } from '../../context/AppContext';

function ActivityLogs() {
  const appContext = React.useContext(AppContext);
  const { userActivityLogs } = appContext || {};

  const targetTypeLabels = {
    questionBank: (
      <Tag color="geekblue">
        <div style={{ fontSize: '14px' }}>Question Bank</div>
      </Tag>
    ),
    questionPaper: (
      <Tag color="volcano">
        <div style={{ fontSize: '14px' }}>Question Paper</div>
      </Tag>
    ),
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'activityTime',
      key: 'activityTime',
      render: (activityTime: string) =>
        format(new Date(activityTime), 'dd/MM/yyyy HH:mm:ss'),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '40%',
      render: (action: string, record: any) => (
        <>
          <div style={{ fontWeight: 'bold', lineHeight: '2' }}>{action}</div>
          <div style={{ lineHeight: '1.75' }}>{record.description}</div>
        </>
      ),
      filters: Array.from(
        new Set(userActivityLogs?.map((log) => log.unit) || []),
      ).map((unit) => ({
        text: unit,
        value: unit,
      })),
      onFilter: (value: string, record: any) =>
        record.unit.indexOf(value) === 0,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: string, record: any) => (
        <>
          <div style={{ fontWeight: 'bold' }}>{user}</div>
          {/* {record.members && (
            <div
              style={{ fontSize: '12px' }}
            >{`Members: ${record.members}`}</div>
          )} */}
        </>
      ),
      filters: Array.from(
        new Set(userActivityLogs?.map((log) => log.user) || []), // TODO: Trg incharge text case
      ).map((user) => ({ text: user, value: user })),
      onFilter: (value: string, record: any) =>
        record.user.indexOf(value) === 0,
    },
    {
      title: 'Task',
      dataIndex: 'targetType',
      key: 'targetType',
      render: (targetType: keyof typeof targetTypeLabels) =>
        targetTypeLabels[targetType] || targetType,
      filters: Array.from(
        new Set(userActivityLogs?.map((log) => log.targetType) || []),
      ).map((targetType) => ({
        text: targetType,
        value: targetType,
      })),
      onFilter: (value: string, record: any) =>
        record.targetType.indexOf(value) === 0,
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      width: '20%',
    },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '85%', margin: 0, padding: 10 }}>
        <Table
          columns={columns}
          dataSource={userActivityLogs}
          rowKey={(record) => record.activityTime}
          pagination={{ pageSize: 30 }}
        />
      </div>
    </div>
  );
}

export default ActivityLogs;
