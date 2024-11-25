import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Divider,
  message,
  Space,
  Descriptions,
} from 'antd';
import {
  LockOutlined,
  KeyOutlined,
  LogoutOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useUser } from './context/UserContext'; // Adjust import path as needed

const { Title } = Typography;

// eslint-disable-next-line react/function-component-definition
const UserSettings: React.FC = () => {
  const {
    user,
    setUser,
    login,
    setupPasswordAuth,
    setupTOTPAuth,
    completeTOTPSetup,
  } = useUser();
  const navigate = useNavigate();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isResetTOTPModalVisible, setIsResetTOTPModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [totpSetupData, setTotpSetupData] = useState<{
    secret: string;
    backupCodes: string[];
  } | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const handlePasswordChange = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      // First verify the current password
      const authResult = await login(user.examinerEmpId, {
        password: values.currentPassword,
      });

      if (!authResult.success) {
        message.error('Current password is incorrect');
        return;
      }

      // If verification successful, proceed with password change
      const result = await setupPasswordAuth(
        user.examinerEmpId,
        values.newPassword,
      );

      if (result.success) {
        message.success('Password changed successfully');
        setIsPasswordModalVisible(false);
        form.resetFields();
      } else {
        message.error(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      message.error('Failed to change password');
    }
  };

  const handleResetTOTP = async () => {
    try {
      const result = await setupTOTPAuth(user.examinerEmpId);

      if (result.success && result.totpSecret && result.backupCodes) {
        setTotpSetupData({
          secret: result.totpSecret,
          backupCodes: result.backupCodes,
        });
        setIsResetTOTPModalVisible(false);
        setShowQRModal(true);
      } else {
        message.error(result.message || 'Failed to reset TOTP');
      }
    } catch (error) {
      console.error('TOTP reset error:', error);
      message.error('Failed to reset TOTP');
    }
  };

  const handleTOTPSetupComplete = async () => {
    if (!totpSetupData?.secret) return;

    try {
      const result = await completeTOTPSetup(
        user.examinerEmpId,
        totpSetupData.secret,
      );

      if (result.success) {
        message.success('Two-factor authentication reset successfully');
        setShowQRModal(false);
        setTotpSetupData(null);
      } else {
        message.error(result.message || 'Failed to complete TOTP setup');
      }
    } catch (error) {
      console.error('TOTP setup completion error:', error);
      message.error('Failed to complete TOTP setup');
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to logout?',
      onOk: () => {
        setUser(null);
        localStorage.removeItem('token');
        navigate('/login');
      },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '24px',
      }}
    >
      <div style={{ alignSelf: 'flex-end', marginBottom: '16px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          type="primary"
          ghost
          style={{ width: '100px' }}
        >
          Back
        </Button>
      </div>

      <Title level={2}>User Settings</Title>

      <Row gutter={[24, 24]} style={{ width: '77%', maxWidth: '800px' }}>
        {/* User Information Card */}
        <Col span={24}>
          <Card title="User Information">
            <Descriptions column={2}>
              <Descriptions.Item label="Name">{user?.name}</Descriptions.Item>
              <Descriptions.Item label="Employee ID">
                {user?.employeeId}
              </Descriptions.Item>
              <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
              <Descriptions.Item label="Role">{user?.role}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Security Settings Card */}
        <Col span={24}>
          <Card title="Security Settings">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Button
                icon={<LockOutlined />}
                block
                onClick={() => setIsPasswordModalVisible(true)}
              >
                Change Password
              </Button>

              <Button
                icon={<KeyOutlined />}
                block
                onClick={() => setIsResetTOTPModalVisible(true)}
              >
                Reset Two-Factor Authentication
              </Button>

              <Divider />

              <Button
                icon={<LogoutOutlined />}
                block
                danger
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={isPasswordModalVisible}
        onCancel={() => setIsPasswordModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handlePasswordChange} layout="vertical">
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              {
                required: true,
                message: 'Please input your current password!',
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              {
                required: true,
                message: 'Please confirm your new password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reset TOTP Confirmation Modal */}
      <Modal
        title="Reset Two-Factor Authentication"
        open={isResetTOTPModalVisible}
        onCancel={() => setIsResetTOTPModalVisible(false)}
        onOk={handleResetTOTP}
        okText="Reset TOTP"
        cancelText="Cancel"
      >
        <p>Are you sure you want to reset your two-factor authentication?</p>
        <p>You will need to set up a new TOTP device after this action.</p>
      </Modal>

      {/* TOTP Setup QR Code Modal */}
      <Modal
        title="Set Up Two-Factor Authentication"
        open={showQRModal}
        onCancel={() => {
          setShowQRModal(false);
          setTotpSetupData(null);
        }}
        onOk={handleTOTPSetupComplete}
        okText="Complete Setup"
        cancelText="Cancel"
      >
        {totpSetupData && (
          <div style={{ textAlign: 'center' }}>
            <p>Scan this QR code with your authenticator app:</p>
            <QRCodeSVG
              value={`otpauth://totp/${user.email}?secret=${totpSetupData.secret}&issuer=YourApp`}
              size={200}
            />
            <Divider />
            {/* <p>Your backup codes (save these somewhere safe):</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {totpSetupData.backupCodes.map((code, index) => (
                <li key={index}>{code}</li>
              ))}
            </ul> */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserSettings;
