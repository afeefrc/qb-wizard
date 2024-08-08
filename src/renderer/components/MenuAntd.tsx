import React, { useState, useContext, useEffect } from 'react';
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
import { useUser } from '../context/UserContext';
import BodyContentCard from './BodyContentCard';

type MenuItem = Required<MenuProps>['items'][number];

interface MenuColumnProps {
  BtnPressed: { MenuItem?: string; BtnName?: string };
  handleButtonClick: (menuItem: string, BtnName: string) => void;
  menuTitles: string[];
}

// const renderContent = (selectedKeys: string[]) => {
//   const selectedKey = selectedKeys[0];
//   const contentMap = {
//     '0': {
//       title: 'View Question Banks',
//       component: <div>Build component here {selectedKey}</div>,
//     },
//     '1': {
//       title: 'View Question Papers',
//       component: <div>Build component here {BtnPressed.BtnName}</div>,
//     },
//     '2': {
//       title: 'Create Review Panel',
//       component: (
//         <CreateReviewPanel unit={BtnPressed.BtnName} close={handleClose} />
//       ),
//     },
//     '3': {
//       title: 'Assign examiner to prepare Question Paper',
//       component: <div>Build component here {BtnPressed.BtnName}</div>,
//     },
//     '4': (() => {
//       if (BtnPressed.BtnName === 'examiner-list') {
//         return { component: <ListOfExaminers />, title: 'List of Examiners' };
//       }
//       if (BtnPressed.BtnName === 'station-settings') {
//         return { component: <StationSettings />, title: 'List of Examiners' };
//       }
//       return null;
//     })(),
//     // Add more mappings as needed
//   };

//   // const key = `${BtnPressed.MenuId}-${BtnPressed.BtnName}`;
//   const key = `${BtnPressed.MenuId}`;
//   const content = contentMap[key];

//   if (content) {
//     return (
//       <BodyContentCard onClose={handleClose} title={content.title}>
//         {content.component}
//       </BodyContentCard>
//     );
//   }

//   return <DashBoard contentList={contentList} />;
// };

// const renderContent = (selectedKeys: string[]) => {
//   // console.log('selectedKeys', selectedKeys[0]);
//   // if (selectedKeys[0] === 'dashboard') {
//   //   console.log('Dashboard');
//   // }
//   if (content) {
//       return (
//         <BodyContentCard onClose={handleClose} title={content.title}>
//           {content.component}
//         </BodyContentCard>
//       );
// };

// const getMenuItems = (units) => {
//   const items: MenuItem[] = reviewPanelMenuTitles.map((title, index) => {
//     if (title === 'Group') {
//       return {
//         key: 'grp',
//         label: title,
//         type: 'group',
//         children: units.map((unit) => ({
//           key: `grp${unit}`,
//           label: unit,
//         })),
//       };
//     }
//     return {
//       key: `sub${index}`,
//       label: title,
//       icon:
//         // eslint-disable-next-line no-nested-ternary
//         index === 0 ? (
//           <MailOutlined style={{ color: '#002C58' }} />
//         ) : index === 1 ? (
//           <AppstoreOutlined style={{ color: '#002C58' }} />
//         ) : (
//           <SettingOutlined style={{ color: '#002C58' }} />
//         ),
//       children: units.map((unit) => ({
//         key: `${index}${unit}`,
//         label: unit,
//       })),
//     };
//   });
//   return items.flatMap((item) => [item, { type: 'divider' }]);
// };

// const items: MenuItem[] = [
//   {
//     key: 'sub1',
//     label: 'View Question Banks',
//     icon: <MailOutlined style={{ color: '#002C58' }} />,
//     children: [
//       { key: '1', label: 'ADC' },
//       { key: '2', label: 'ACC' },
//       { key: '3', label: 'Option 11' },
//       { key: '4', label: 'Option 12' },
//     ],
//   },
//   {
//     type: 'divider',
//   },
//   {
//     key: 'sub2',
//     label: 'Comments and Feedbacks',
//     icon: <AppstoreOutlined style={{ color: '#002C58' }} />,
//     children: [
//       { key: '5', label: 'Option 9' },
//       { key: '6', label: 'Option 10' },
//       { key: '7', label: 'Option 11' },
//       { key: '8', label: 'Option 12' },
//     ],
//   },
//   {
//     type: 'divider',
//   },
//   {
//     key: 'sub3',
//     label: 'Change logs',
//     icon: <SettingOutlined style={{ color: '#002C58' }} />,
//     children: [
//       { key: '9', label: 'Option 9' },
//       { key: '10', label: 'Option 10' },
//       { key: '11', label: 'Option 11' },
//       { key: '12', label: 'Option 12' },
//     ],
//   },
//   {
//     type: 'divider',
//   },
//   {
//     key: 'grp',
//     label: 'Group',
//     type: 'group',
//     children: [
//       { key: '13', label: 'Option 13' },
//       { key: '14', label: 'Option 14' },
//     ],
//   },
// ];

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
          selectedKeys={selectedKeys}
          mode="inline"
          items={[
            {
              key: `grp${index}`,
              label: <span style={{ color: '#002C58' }}>{title}</span>,
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
              icon: <TableOutlined style={{ color: '#002C58' }} />,
              children: [
                { key: 'settings-examinerList', label: 'List of Examiners' },
                { key: 'settings-stationSettings', label: 'Station Settings' },
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
