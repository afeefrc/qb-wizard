import React from 'react';
import { Timeline, Table } from 'antd';

interface ActivityLogsProps {
  logs: string[];
}

function ActivityLogs(logs: ActivityLogsProps) {
  const dataSource = [
    {
      key: '2024-08-01',
      log: 'Trg incharge Created a Task: Review panel for ADC, panel members: 1, 2, 3',
      comment: '',
    },
    {
      key: '2025-08-05 09:12:11',
      log: 'Trg incharge Created a Task: Question paper assignment, examiner: 1',
      comment: '',
    },
    {
      key: '2025-08-05 09:12:11',
      log: 'Task in progress: Qestion paper assignment, examiner: 1',
      comment: '',
    },
    {
      key: '2024-08-08 09:12:11',
      log: 'Task completed: Qestion paper assignment, examiner: 1',
      comment: '',
    },
    {
      key: '2024-08-09 09:12:11',
      log: 'Question Paper Approved by Trg incharge: Qestion paper assignment, examiner: 1',
      comment: '',
    },
  ];

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'log',
      dataIndex: 'log',
      key: 'log',
    },
    {
      title: 'comment',
      dataIndex: 'comment',
      key: 'comment',
    },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {/* <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul> */}
      <Table
        dataSource={dataSource}
        columns={columns}
        style={{ width: '80%', margin: 0 }}
      />
      {/* <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
        }}
      >
        <Timeline
          style={{ width: '40%' }}
          mode="left"
          items={[
            {
              label: '2024-08-01',
              children: '',
            },
            {
              label: '2025-08-05 09:12:11',
              children: '',
            },
            {
              label: '2025-08-05 09:12:11',
              children:
                'Task in progress: Qestion paper assignment, examiner: 1',
            },
            {
              label: '2024-08-08 09:12:11',
              children: '',
            },
            {
              label: '2024-08-08 09:12:11',
              children: '',
            },
          ]}
        />
      </div> */}
    </div>
  );
}

export default ActivityLogs;
