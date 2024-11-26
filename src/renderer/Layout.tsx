import React from 'react';
import { Dropdown, Button, Space, Avatar, Typography } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import { useEffect, useState } from 'react';

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

// eslint-disable-next-line react/function-component-definition
const Footer: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Get current version from electron
    window.electron.ipcRenderer.invoke('get-app-version').then((version) => {
      setCurrentVersion(version);
    });

    // Check for updates
    window.electron.ipcRenderer.invoke('check-for-updates').then((latest) => {
      setLatestVersion(latest);
      setUpdateAvailable(latest !== currentVersion);
    });
  }, [currentVersion]);

  useEffect(() => {
    const handleDownloadProgress = (_, progress: number) => {
      setDownloadProgress(progress);
      setIsDownloading(true);
    };

    const handleUpdateDownloaded = () => {
      setIsDownloaded(true);
      setIsDownloading(false);
    };

    window.electron.ipcRenderer.on('download-progress', handleDownloadProgress);
    window.electron.ipcRenderer.on('update-downloaded', handleUpdateDownloaded);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'download-progress',
        handleDownloadProgress,
      );
      window.electron.ipcRenderer.removeListener(
        'update-downloaded',
        handleUpdateDownloaded,
      );
    };
  }, []);

  useEffect(() => {
    const handleUpdateError = (_, errorType: string) => {
      if (errorType === 'uninstall-error') {
        setUpdateError('Please close and reopen the app to update');
      }
    };

    window.electron.ipcRenderer.on('update-error', handleUpdateError);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'update-error',
        handleUpdateError,
      );
    };
  }, []);

  const handleUpdate = () => {
    if (isDownloaded) {
      // If update is downloaded, quit and install
      window.electron.ipcRenderer.invoke('quit-and-install');
    } else {
      // Start downloading the update
      window.electron.ipcRenderer.invoke('start-update');
    }
  };

  const getUpdateButtonText = () => {
    if (updateError) return updateError;
    if (isDownloaded) return 'Click to install update';
    if (isDownloading) {
      const progress = Math.round(downloadProgress);
      return !Number.isNaN(progress)
        ? `Downloading... ${progress}%`
        : 'Downloading...';
    }
    return `Update to version ${latestVersion}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '8px 12px',
        borderRadius: '6px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        {updateAvailable && (
          <Button
            type="link"
            size="small"
            onClick={handleUpdate}
            disabled={isDownloading || updateError !== null}
            style={{
              fontSize: '14px',
              padding: '20px 0px',
              boxShadow: 'none',
              cursor: isDownloading ? 'default' : 'pointer',
            }}
          >
            {getUpdateButtonText()}
          </Button>
        )}
        <Typography.Text style={{ fontSize: '12px' }}>
          version {currentVersion}
        </Typography.Text>
      </div>
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
      <Footer />
    </div>
  );
};

export default Layout;
