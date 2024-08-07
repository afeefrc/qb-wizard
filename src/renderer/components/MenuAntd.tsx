import React, { useState, useContext } from 'react';
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
  TableOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { AppContext } from '../context/AppContext';

type MenuItem = Required<MenuProps>['items'][number];

const menuTitles = [
  'View Question Banks',
  'Comments and Feedbacks',
  'Change logs',
  // 'Group',
];

const getMenuItems = (units) => {
  const items: MenuItem[] = menuTitles.map((title, index) => {
    if (title === 'Group') {
      return {
        key: 'grp',
        label: title,
        type: 'group',
        children: units.map((unit) => ({
          key: `grp${unit}`,
          label: unit,
        })),
      };
    }
    return {
      key: `sub${index}`,
      label: title,
      icon:
        // eslint-disable-next-line no-nested-ternary
        index === 0 ? (
          <MailOutlined style={{ color: '#002C58' }} />
        ) : index === 1 ? (
          <AppstoreOutlined style={{ color: '#002C58' }} />
        ) : (
          <SettingOutlined style={{ color: '#002C58' }} />
        ),
      children: units.map((unit) => ({
        key: `${index}${unit}`,
        label: unit,
      })),
    };
  });
  return items.flatMap((item) => [item, { type: 'divider' }]);
};

const items: MenuItem[] = [
  {
    key: 'sub1',
    label: 'View Question Banks',
    icon: <MailOutlined style={{ color: '#002C58' }} />,
    children: [
      { key: '1', label: 'ADC' },
      { key: '2', label: 'ACC' },
      { key: '3', label: 'Option 11' },
      { key: '4', label: 'Option 12' },
    ],
  },
  {
    type: 'divider',
  },
  {
    key: 'sub2',
    label: 'Comments and Feedbacks',
    icon: <AppstoreOutlined style={{ color: '#002C58' }} />,
    children: [
      { key: '5', label: 'Option 9' },
      { key: '6', label: 'Option 10' },
      { key: '7', label: 'Option 11' },
      { key: '8', label: 'Option 12' },
    ],
  },
  {
    type: 'divider',
  },
  {
    key: 'sub3',
    label: 'Change logs',
    icon: <SettingOutlined style={{ color: '#002C58' }} />,
    children: [
      { key: '9', label: 'Option 9' },
      { key: '10', label: 'Option 10' },
      { key: '11', label: 'Option 11' },
      { key: '12', label: 'Option 12' },
    ],
  },
  {
    type: 'divider',
  },
  {
    key: 'grp',
    label: 'Group',
    type: 'group',
    children: [
      { key: '13', label: 'Option 13' },
      { key: '14', label: 'Option 14' },
    ],
  },
];

// eslint-disable-next-line react/function-component-definition
const MenuList: React.FC = () => {
  const appContext = useContext(AppContext);
  const { settings } = appContext || {};
  const units = settings?.unitsApplicable || [];
  const [selectedKeys, setSelectedKeys] = useState([]);
  // console.log('items', getMenuItems(units));
  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e.key);
    setSelectedKeys([e.key]);
  };

  return (
    <div>
      <Menu
        onClick={onClick}
        style={{ border: 'none', marginTop: '20px' }}
        selectedKeys={selectedKeys}
        mode="inline"
        items={[
          { key: 'dashboard', label: 'Dashboard', icon: <HomeOutlined /> },
          {
            type: 'divider',
          },
        ]}
      />
      {menuTitles.map((title, index) => (
        <Menu
          onClick={onClick}
          style={{ border: 'none', marginTop: '10px' }}
          // defaultSelectedKeys={['00']}
          // defaultOpenKeys={['sub0']}
          selectedKeys={selectedKeys}
          mode="inline"
          items={[
            {
              key: `grp${index}`,
              label: title,
              icon:
                // eslint-disable-next-line no-nested-ternary
                index === 0 ? (
                  <MailOutlined style={{ color: '#002C58' }} />
                ) : index === 1 ? (
                  <AppstoreOutlined style={{ color: '#002C58' }} />
                ) : (
                  <SettingOutlined style={{ color: '#002C58' }} />
                ),
              children: units.map((unit) => ({
                // key: `${index}${unit}`,
                key: `${index}${unit}`,
                label: unit,
              })),
            },
            {
              type: 'divider',
            },
          ]}
        />
      ))}
    </div>
  );
};

export default MenuList;
