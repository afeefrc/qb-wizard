import React from 'react';
import { Dropdown, Button, Space, Avatar } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from './context/UserContext';

// eslint-disable-next-line react/function-component-definition
const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser } = useUser();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const userMenuItems = {
    items: [
      {
        key: 'settings',
        label: 'User settings',
        icon: <SettingOutlined />,
        onClick: () => navigate('/user-settings'),
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
      {isAuthenticated ? (
        <Dropdown menu={userMenuItems} placement="bottomRight">
          <Button
            type="text"
            size="large"
            style={{
              color: '#002C58',
              padding: '30px 20px',
              boxShadow: 'none',
            }}
          >
            <Space size={20}>
              {user?.name}
              <Avatar
                style={{ backgroundColor: '#002C58' }}
                icon={<UserOutlined />}
                size={50}
              />
            </Space>
          </Button>
        </Dropdown>
      ) : (
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/login')}
          style={{
            backgroundColor: '#002C58',
            padding: '0 20px',
          }}
        >
          Login
        </Button>
      )}
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

// eslint-disable-next-line react/function-component-definition
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default Layout;
