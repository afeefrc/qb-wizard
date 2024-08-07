import React, { useState, useContext } from 'react';
// import MenuItem from './MenuItem';
import CustomButton from './CustomButton';
import {
  trgInchargeMenuContentCopy,
  trgInchargeAccordionTitles,
} from '../SampleData';
import type { CollapseProps } from 'antd';
import { Collapse } from 'antd';
import { SettingOutlined, AuditOutlined } from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

// interface Button {
//   id: string;
//   label: string;
// }

// interface MenuItem {
//   id: number;
//   title: string;
//   buttons: Button[];
// }

interface MenuColumnProps {
  BtnPressed: { MenuId?: number; BtnName?: string };
  handleButtonClick: (menuItemId: number, BtnName: string) => void;
}

const items: CollapseProps['items'] = trgInchargeMenuContentCopy;

function MenuColumn({ BtnPressed, handleButtonClick }: MenuColumnProps) {
  const appContext = useContext(AppContext);
  const { settings } = appContext || {};

  const generateMenuItems = () => {  
    const units = settings?.unitsApplicable || [];

    const style = {
      background: 'white',
      border: 'none',
      borderRadius: '0',
      borderBottom: '2px solid #f0f0f0',
      boxShadow: 'none',
      padding: '0px',
      fontSize: '16px',
    };
    const buttonStyle = { width: '100%', border: 'none' };

    return trgInchargeAccordionTitles
      .map((title, index) => ({
        key: (index + 1).toString(),
        label: title,
        children: (
          <div>
            {units.map((unit, unitIndex) => (
              <div key={unitIndex}>
                <CustomButton
                  onClick={() => {
                    handleButtonClick(index, unit);
                  }}
                  style={buttonStyle}
                  type={
                    BtnPressed.MenuId === index && BtnPressed.BtnName === unit
                      ? 'active'
                      : 'button'
                  }
                >
                  {unit}
                </CustomButton>
              </div>
            ))}
          </div>
        ),
        style,
        extra: <AuditOutlined style={{ color: 'rgba(0, 0, 0, 0.3)' }} />,
      }))
      .concat({
        key: (trgInchargeAccordionTitles.length + 1).toString(),
        label: 'Settings',
        children: (
          <div>
            <CustomButton
              onClick={() => handleButtonClick(4, 'examiner-list')} // hardcoded menuId 4 for settings, buttonId 0 for List of Examiners
              style={buttonStyle}
            >
              List of Examiners
            </CustomButton>
            <CustomButton
              onClick={() => handleButtonClick(4, 'station-settings')} // hardcoded menuId 4 for settings, buttonId 1 for Station Settings
              style={buttonStyle}
            >
              Station Settings
            </CustomButton>
          </div>
        ),
        style,
        extra: <SettingOutlined style={{ color: 'rgba(0, 0, 0, 0.3)' }} />,
      });
  };

  // const handleButtonClick = (buttonId: string, menuItemId: number) => {
  //   onButtonClick(buttonId, menuItemId);
  // };

  const onCollapseChange = (key: string | string[]) => {
    console.log(key);
  };

  return (
    <ul>
      <Collapse
        // accordion
        ghost
        items={generateMenuItems()}
        defaultActiveKey={['1']}
        onChange={onCollapseChange}
        size="large"
      />
      {/* {menuItems.map((menuItem) => (
        // <MenuItem key={item.id} title={item.title} buttons={item.buttons} />
        <li>
          <div className="menu-section-title">{menuItem.title}</div>
          <div key={menuItem.id} className="menu-section-container">
            {menuItem.buttons.map((button) => (
              <div key={button.id} className="menu-btn-container">
                <button
                  type="button"
                  key={button.id}
                  className="menu-buttons"
                  onClick={() => handleButtonClick(button.id, menuItem.id)}
                >
                  {button.label}
                </button>
              </div>
            ))}
          </div>
        </li>
      ))} */}
    </ul>
  );
}

export default MenuColumn;
