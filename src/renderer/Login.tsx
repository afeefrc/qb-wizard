import React, { useState, useContext } from 'react';
import { Form, Input, Button, Select, message, Card, Steps } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './context/UserContext';
import { AppContext } from './context/AppContext';
import { initialTrgInChargeProfile } from './StaticData';

const { Step } = Steps;

interface SetupData {
  examinerEmpId?: number;
  authMethod?: 'password' | 'totp';
  totpSecret?: string;
  backupCodes?: string[];
  // isFirstLogin?: boolean;
  hasPassword?: boolean;
  totpEnabled?: boolean;
}

// eslint-disable-next-line import/prefer-default-export, react/function-component-definition
export const Login: React.FC = () => {
  const appContext = useContext(AppContext);
  const { examiners, handleAddExaminer } = appContext || {};
  const { login, setupAuth, setupTOTPAuth, setupPasswordAuth } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState<SetupData>({});

  // Get the redirect path from location state, default to dashboard
  const from = (location.state as { from?: string })?.from || '/';

  // Updated handleBack function with proper navigation flow
  const handleBack = () => {
    switch (currentStep) {
      case 1: // From auth method selection
        setCurrentStep(0); // Go back to employee ID input
        break;
      case 2: // From password setup
      case 3: // From TOTP setup
      case 4: // From final login
        setCurrentStep(1); // Go back to auth method selection
        break;
      default:
        setCurrentStep(0);
    }
  };

  // Handle initial login attempt
  const handleInitialLogin = async (values: { examinerEmpId: string }) => {
    try {
      const result = await login(Number(values.examinerEmpId), {});
      console.log('Initial login result:', result);

      if (result.success) {
        // User is already logged in with valid credentials
        navigate(from, { replace: true });
        return;
      }

      // Check if examiner exists but needs authentication
      if (result.examiner) {
        // Store examiner data including auth status
        setSetupData({
          examinerEmpId: Number(values.examinerEmpId),
          // isFirstLogin: result.isFirstLogin,
          hasPassword: result.examiner.hasPassword || false,
          totpEnabled: result.examiner.totpEnabled || false,
          authMethod: result.examiner.authMethod || 'none',
        });

        // Go to auth method selection
        setCurrentStep(1);
        message.info('Please select your authentication method.');
      } else {
        message.error('Employee ID not found');
      }
    } catch (err) {
      console.error('Login error:', err);
      message.error('An error occurred during login');
    }
  };

  // Handle auth method selection
  const handleAuthMethodSelect = async (values: {
    authMethod: 'password' | 'totp';
  }) => {
    try {
      console.log('Selected auth method:', values.authMethod);

      // Update the setupData state with the chosen auth method
      setSetupData((prev) => ({
        ...prev,
        authMethod: values.authMethod,
      }));

      if (values.authMethod === 'password') {
        if (!setupData.hasPassword) {
          setCurrentStep(2); // Go to password setup
          message.info('Please set up your password');
        } else {
          setCurrentStep(4); // Go directly to password login
        }
      } else if (values.authMethod === 'totp') {
        if (!setupData.totpEnabled) {
          // Use the new setupTOTPAuth function
          const result = await setupTOTPAuth(setupData.examinerEmpId!);

          if (!result.success || !result.totpSecret) {
            throw new Error(result.message || 'Failed to setup TOTP');
          }

          setSetupData((prev) => ({
            ...prev,
            totpSecret: result.totpSecret,
            backupCodes: result.backupCodes,
          }));
          setCurrentStep(3); // Go to TOTP setup (QR code)
          message.info('Please scan the QR code with your authenticator app');
        } else {
          setCurrentStep(4); // Go directly to TOTP login
        }
      }
    } catch (error) {
      console.error('Auth method selection error:', error);
      message.error(error.message || 'Failed to setup authentication method');
    }
  };

  // Handle password setup
  const handlePasswordSetup = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    try {
      if (!setupData.examinerEmpId) {
        throw new Error('Employee ID not found');
      }

      // Use the new setupPasswordAuth function
      const setupResult = await setupPasswordAuth(
        setupData.examinerEmpId,
        values.password,
      );

      if (!setupResult.success) {
        throw new Error(setupResult.message || 'Failed to setup password');
      }

      setSetupData((prev) => ({
        ...prev,
        hasPassword: true,
      }));
      message.success('Password setup successful');
      setCurrentStep(4); // Go to login
    } catch (error) {
      console.error('Password setup error:', error);
      message.error(
        error.message || 'An error occurred while setting up password',
      );
    }
  };

  // Handle TOTP setup completion
  const handleTOTPSetupComplete = async () => {
    try {
      if (!setupData.examinerEmpId || !setupData.totpSecret) {
        throw new Error('Missing required TOTP setup data');
      }

      const setupResult = await setupAuth(setupData.examinerEmpId, {
        authMethod: 'totp',
        setupTOTP: true,
        totpSecret: setupData.totpSecret,
      });

      if (!setupResult.success) {
        throw new Error(setupResult.message || 'Failed to complete TOTP setup');
      }

      setSetupData((prev) => ({
        ...prev,
        totpEnabled: true,
      }));
      message.success('TOTP setup completed successfully');
      setCurrentStep(4); // Go to login
    } catch (error) {
      console.error('TOTP setup completion error:', error);
      message.error(error.message || 'Failed to complete TOTP setup');
    }
  };

  // Handle final login
  const handleCredentialLogin = async (values: {
    password?: string;
    totpToken?: string;
  }) => {
    try {
      if (!setupData.examinerEmpId) {
        throw new Error('Employee ID not found');
      }

      const credentials =
        setupData.authMethod === 'password'
          ? { password: values.password }
          : { totpToken: values.totpToken };

      console.log('Attempting login with:', {
        examinerEmpId: setupData.examinerEmpId,
        authMethod: setupData.authMethod,
        hasCredentials:
          setupData.authMethod === 'password'
            ? !!values.password
            : !!values.totpToken,
      });

      const result = await login(setupData.examinerEmpId, credentials);

      if (result.success) {
        message.success('Login successful');
        navigate(from, { replace: true });
      } else {
        // Show the specific error message from the server
        message.error(result.message || 'Login failed');

        // // If the examiner needs to set up authentication, reset to the appropriate step
        // if (result.isFirstLogin) {
        //   setCurrentStep(1);
        // }
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.message || 'Login failed');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Initial Employee ID input
        return (
          <Form form={form} onFinish={handleInitialLogin} layout="vertical">
            <Form.Item
              name="examinerEmpId"
              label="Select Employee"
              rules={[
                { required: true, message: 'Please select an employee!' },
              ]}
            >
              <Select
                showSearch
                placeholder="Select an employee"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={examiners?.map((examiner) => ({
                  value: examiner.examinerEmpId,
                  label: `${examiner.examinerName}, ${examiner.examinerDesignation}${
                    examiner.examinerDesignation.toLowerCase() !== 'admin'
                      ? ' (ATM)'
                      : ''
                  }`,
                }))}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Continue
              </Button>
            </Form.Item>
            {(!examiners || examiners.length === 0) && (
              <Form.Item>
                <Button
                  block
                  onClick={() => {
                    handleAddExaminer(initialTrgInChargeProfile);
                  }}
                >
                  Create Training Incharge login
                </Button>
              </Form.Item>
            )}
          </Form>
        );

      case 1: // Auth Method Selection
        return (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
          >
            <div className="ant-form-item-label">
              <label>Select Authentication Method</label>
            </div>
            <Button
              block
              size="large"
              type="primary"
              onClick={() => handleAuthMethodSelect({ authMethod: 'password' })}
            >
              Password
            </Button>
            <Button
              block
              size="large"
              type="primary"
              onClick={() => handleAuthMethodSelect({ authMethod: 'totp' })}
            >
              Authenticator App (TOTP)
            </Button>
            <Button block onClick={handleBack}>
              Back
            </Button>
          </div>
        );

      case 2: // Password Setup
        return (
          <Form onFinish={handlePasswordSetup} layout="vertical">
            <Form.Item
              name="password"
              label="Choose Password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters!' },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={handleBack} style={{ flex: 1 }}>
                  Back
                </Button>
                <Button type="primary" htmlType="submit" style={{ flex: 1 }}>
                  Set Password
                </Button>
              </div>
            </Form.Item>
          </Form>
        );

      case 3: // TOTP QR Display
        return (
          <Card>
            <h3>Scan QR Code with your Authenticator App</h3>
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              {setupData.totpSecret && (
                <QRCodeSVG
                  value={`otpauth://totp/QB-Wizard:${setupData.examinerEmpId}?secret=${setupData.totpSecret}&issuer=QB-Wizard`}
                  size={200}
                />
              )}
            </div>
            {/* {setupData.backupCodes && (
              <>
                <h3>Backup Codes</h3>
                <div className="backup-codes">
                  {setupData.backupCodes.map((code, index) => (
                    <div key={index} className="backup-code">
                      {code}
                    </div>
                  ))}
                </div>
                <p className="warning">
                  Save these backup codes securely. They can be used if you lose
                  access to your authenticator app.
                </p>
              </>
            )} */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <Button onClick={handleBack} style={{ flex: 1 }}>
                Back
              </Button>
              <Button
                type="primary"
                onClick={handleTOTPSetupComplete}
                style={{ flex: 1 }}
              >
                Continue to Login
              </Button>
            </div>
          </Card>
        );

      case 4: // Final Login
        return (
          <Form onFinish={handleCredentialLogin} layout="vertical">
            {setupData.authMethod === 'password' ? (
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                ]}
              >
                <Input.Password />
              </Form.Item>
            ) : setupData.authMethod === 'totp' ? (
              <Form.Item
                name="totpToken"
                label="Authentication Code"
                rules={[
                  {
                    required: true,
                    message: 'Please input your authentication code!',
                  },
                ]}
              >
                <Input maxLength={6} />
              </Form.Item>
            ) : (
              <div>Authentication method not set</div>
            )}
            <Form.Item>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={handleBack} style={{ flex: 1 }}>
                  Back
                </Button>
                <Button type="primary" htmlType="submit" style={{ flex: 1 }}>
                  Login
                </Button>
              </div>
            </Form.Item>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      title="Login"
      className="login-card"
      extra={
        <Button
          type="text"
          onClick={() => navigate(from, { replace: true })}
          icon={<CloseOutlined />}
        />
      }
      style={{
        maxWidth: 600,
        margin: '50px auto',
        padding: '50px',
        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Steps current={currentStep} style={{ marginBottom: 30 }}>
        <Step title="ID" />
        <Step title="Method" />
        <Step title="Setup" />
        <Step title="Verify" />
      </Steps>
      {renderStep()}
    </Card>
  );
};
