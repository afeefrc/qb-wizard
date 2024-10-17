import React, { useContext, useState } from 'react';
import { Card, Form, Input, Button, List, Avatar, Checkbox, Space } from 'antd';
import { AppContext } from '../context/AppContext';
import { unitOptions, getUnitNameById } from '../SampleData';

interface FormData {
  stationCode: string;
  stationName: string;
  stationCity: string;
  unitsApplicable: string[];
}

function StationSettings() {
  const appContext = useContext(AppContext);
  const { settings, handleSaveSetting } = appContext || {};
  const [isEditingStn, setIsEditingStn] = useState(false);
  const [isEditingUnits, setIsEditingUnits] = useState(false);
  const [stationForm] = Form.useForm();
  const [unitsForm] = Form.useForm();

  const onSubmitStation = (values: FormData) => {
    if (handleSaveSetting) {
      handleSaveSetting({ ...settings, ...values });
    }
    setIsEditingStn(false);
  };

  const onSubmitUnits = (values: { unitsApplicable: string[] }) => {
    if (handleSaveSetting) {
      handleSaveSetting({ ...settings, ...values });
    }
    setIsEditingUnits(false);
  };

  const title = `Units applicable to ${settings?.stationCode}`;
  const unitList = settings?.unitsApplicable || [];

  return (
    <div>
      <Card title="ATS station name" style={{ margin: 10 }}>
        <Form
          form={stationForm}
          onFinish={onSubmitStation}
          layout="vertical"
          initialValues={{
            stationCode: settings?.stationCode || '',
            stationName: settings?.stationName || '',
            stationCity: settings?.stationCity || '',
          }}
        >
          <div className="station-settings-horizontal-container">
            <div className="station-settings-stationCode">
              {settings?.stationCode}
              <div className="station-settings-stationName">
                {settings?.stationName}
                <div className="station-settings-stationName">
                  {settings?.stationCity}
                </div>
              </div>
            </div>
            <div className="station-settings-edit-container">
              {isEditingStn ? (
                <div>
                  <Form.Item
                    name="stationCode"
                    label="Station Code"
                    rules={[
                      { required: true, message: 'Station Code is required' },
                      {
                        pattern: /^[A-Za-z]{4}$/,
                        message: 'Station Code must be exactly 4 letters',
                      },
                      {
                        transform: (value: string) => value.toUpperCase(),
                      },
                    ]}
                    normalize={(value: string) => value.toUpperCase()}
                  >
                    <Input maxLength={4} />
                  </Form.Item>
                  <Form.Item
                    name="stationName"
                    label="Station Name"
                    rules={[
                      { required: true, message: 'Station Name is required' },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="stationCity"
                    label="Station City"
                    rules={[
                      { required: true, message: 'Station City is required' },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item>
                    <Space direction="horizontal">
                      <Button type="primary" htmlType="submit">
                        Save Station
                      </Button>
                      <Button onClick={() => setIsEditingStn(false)}>
                        Cancel
                      </Button>
                    </Space>
                  </Form.Item>
                </div>
              ) : (
                <div
                  className="edit-text"
                  onClick={() => setIsEditingStn(true)}
                  style={{ cursor: 'pointer', textAlign: 'right' }}
                >
                  Click to edit
                </div>
              )}
            </div>
          </div>
        </Form>
      </Card>

      <Card title={title} style={{ margin: 10 }}>
        <Form
          form={unitsForm}
          onFinish={onSubmitUnits}
          initialValues={{
            unitsApplicable: settings?.unitsApplicable || [],
          }}
        >
          <div className="station-settings-horizontal-container">
            <div className="station-settings-units-container">
              <List
                size="large"
                bordered={false}
                dataSource={unitList}
                renderItem={(item) => (
                  <List.Item>
                    <Avatar
                      shape="square"
                      style={{
                        backgroundColor: 'lightcoral',
                        verticalAlign: 'middle',
                      }}
                      size="large"
                      gap={4}
                    >
                      {item}
                    </Avatar>
                    <div className="station-settings-unit-list">
                      {getUnitNameById(item)}
                    </div>
                  </List.Item>
                )}
              />
            </div>
            {isEditingUnits ? (
              <div>
                <Form.Item name="unitsApplicable">
                  <Checkbox.Group options={unitOptions} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Save Units
                  </Button>
                </Form.Item>
              </div>
            ) : (
              <div
                className="edit-text"
                onClick={() => setIsEditingUnits(true)}
              >
                Click to edit
              </div>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default StationSettings;
