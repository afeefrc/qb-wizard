import React from 'react';
// import MenuItem from './MenuItem';

interface Button {
  id: string;
  label: string;
}

interface MenuItem {
  id: number;
  title: string;
  buttons: Button[];
}

interface MenuColumnProps {
  menuItems: MenuItem[];
  onButtonClick: (buttonId: string, menuItemId: number) => void;
}

function MenuColumn({ menuItems, onButtonClick }: MenuColumnProps) {
  const handleButtonClick = (buttonId: string, menuItemId: number) => {
    onButtonClick(buttonId, menuItemId);
  };

  return (
    <ul>
      {menuItems.map((menuItem) => (
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
      ))}
    </ul>
  );
}

export default MenuColumn;
