import React, { useState, useContext, useEffect } from 'react';
import {
  BuildFilled,
  SettingFilled,
  BookFilled,
  SignalFilled,
  ProductFilled,
  FileTextFilled,
  CodeFilled,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { AppContext } from '../context/AppContext';
import { useUser } from '../context/UserContext';

interface MenuColumnProps {
  BtnPressed: { MenuItem?: string; BtnName?: string };
  handleButtonClick: (menuItem: string, BtnName: string) => void;
  menuTitles: string[];
}

// eslint-disable-next-line react/function-component-definition
function MenuList({
  BtnPressed,
  handleButtonClick,
  menuTitles = [],
}: MenuColumnProps) {
  const appContext = useContext(AppContext);
  const { settings } = appContext || {};
  const { user } = useUser();
  const units = settings?.unitsApplicable || [];
  const [selectedKeys, setSelectedKeys] = useState(['dashboard']);

  const onClick: MenuProps['onClick'] = (e) => {
    const { key } = e;
    setSelectedKeys([key]);
    const [menuItem, btnName] = key.split('-');
    handleButtonClick(menuItem, btnName || 'dashboard');
  };

  // useEffect to watch BtnPressed and set selectedKeys to ['dashboard'] if BtnPressed.MenuItem is 'dashboard'
  useEffect(() => {
    if (BtnPressed.MenuItem === 'dashboard') {
      setSelectedKeys(['dashboard']);
    }
  }, [BtnPressed]);

  return (
    <div>
      <Menu
        onClick={onClick}
        style={{ border: 'none', marginTop: '20px' }}
        selectedKeys={selectedKeys}
        mode="inline"
        items={[
          { key: 'dashboard', label: 'Dashboard', icon: <ProductFilled /> },
          {
            type: 'divider',
          },
        ]}
      />
      {menuTitles.map((title, index) => (
        <Menu
          onClick={onClick}
          style={{ border: 'none', marginTop: '10px' }}
          selectedKeys={selectedKeys}
          mode="inline"
          items={[
            {
              key: `grp${index}`,
              label: (
                <span
                  style={{
                    color: '#002C58',
                    whiteSpace: 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '90%',
                    lineHeight: '1.7',
                  }}
                >
                  {title}
                </span>
              ),
              icon:
                // eslint-disable-next-line no-nested-ternary
                index === 0 ? (
                  <BookFilled style={{ color: '#002C58' }} />
                ) : index === 1 ? (
                  <FileTextFilled style={{ color: '#002C58' }} />
                ) : index === 2 ? (
                  <BuildFilled style={{ color: '#002C58' }} />
                ) : (
                  <CodeFilled style={{ color: '#002C58' }} />
                ),
              children: units.map((unit: any) => ({
                // key: `${index}${unit}`,
                key: `${index}-${unit}`,
                label: unit,
              })),
            },
            {
              type: 'divider',
            },
          ]}
        />
      ))}
      {user?.role === 'trg-incharge' && (
        <Menu
          onClick={onClick}
          style={{ border: 'none', marginTop: '10px' }}
          selectedKeys={selectedKeys}
          mode="inline"
          items={[
            {
              key: 'settings',
              label: <span style={{ color: '#002C58' }}>Settings</span>,
              icon: <SettingFilled style={{ color: '#002C58' }} />,
              children: [
                { key: 'settings-examinerList', label: 'List of Examiners' },
                { key: 'settings-stationSettings', label: 'Station Settings' },
                {
                  key: 'settings-databaseBackupRestore',
                  label: 'Database Backup/Restore',
                },
              ],
            },
            {
              type: 'divider',
            },
          ]}
        />
      )}
      {user?.role === 'trg-incharge' && (
        <Menu
          onClick={onClick}
          style={{ border: 'none', marginTop: '10px' }}
          selectedKeys={selectedKeys}
          mode="inline"
          items={[
            {
              key: 'informations',
              label: <span style={{ color: '#002C58' }}>Informations</span>,
              icon: <SignalFilled style={{ color: '#002C58' }} />,
              children: [
                { key: 'informations-logs', label: 'Activity logs' },
                { key: 'informations-questionLogs', label: 'Question Logs' },
                { key: 'informations-reports', label: 'Reports' },
              ],
            },
            {
              type: 'divider',
            },
          ]}
        />
      )}
    </div>
  );
}

export default MenuList;
