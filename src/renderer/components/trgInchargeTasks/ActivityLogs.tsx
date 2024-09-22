import React from 'react';
import { Tag, List } from 'antd';
import { format } from 'date-fns';
import { AppContext } from '../../context/AppContext';

// interface ActivityLogsProps {
//   logs: string[];
// }

function ActivityLogs() {
  const appContext = React.useContext(AppContext);
  const { userActivityLogs } = appContext || {};

  // console.log(userActivityLogs);

  const targetTypeLabels = {
    questionBank: <Tag color="geekblue">Question Bank</Tag>,
    questionPaper: <Tag color="volcano">Question Paper</Tag>,
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '80%', margin: 0, padding: 10 }}>
        {/* Custom header row */}
        <div
          style={{
            display: 'flex',
            fontWeight: 'bold',
            marginBottom: '10px',
            padding: '0 8px',
          }}
        >
          <div style={{ width: '20%', padding: '0 5px' }}>Timestamp</div>
          <div style={{ width: '40%', padding: '0 5px' }}>Action</div>
          <div style={{ width: '15%', padding: '0 5px' }}>User</div>
          <div style={{ width: '25%', padding: '0 5px' }}>Task</div>
          <div style={{ width: '15%', padding: '0 5px' }}>Comment</div>
        </div>

        <List
          itemLayout="horizontal"
          dataSource={userActivityLogs}
          pagination={false}
          renderItem={(item: any) => (
            <List.Item
              style={{
                display: 'flex',
                padding: '8px',
              }}
            >
              <div style={{ width: '20%', padding: '0 5px' }}>
                <List.Item.Meta
                  description={`${format(
                    new Date(item.activityTime),
                    'dd/MM/yyyy HH:mm:ss',
                  )}`}
                />
              </div>
              <div style={{ width: '40%', padding: '0 5px' }}>
                <List.Item.Meta
                  title={` ${item.action}`}
                  description={`${item.description}`}
                />
              </div>
              <div style={{ width: '15%', padding: '0 5px' }}>
                <List.Item.Meta
                  title={`${item.user}`}
                  // description={
                  //   item.members ? `Panel members: ${item.members}` : ''
                  // }
                />
              </div>
              <div style={{ width: '25%', padding: '0 5px' }}>
                <List.Item.Meta
                  description={
                    targetTypeLabels[
                      item.targetType as keyof typeof targetTypeLabels
                    ] || item.targetType
                  }
                />
              </div>
              <div style={{ width: '15%', padding: '0 5px' }}>
                {item.comment && (
                  <List.Item.Meta description={`${item.comment}`} />
                )}
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}

export default ActivityLogs;
