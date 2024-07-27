import React from 'react';
import './RolePage.css';

interface ButtonProps {
  id: string;
  label: string;
  onClick: () => void;
}

interface MenuItemProps {
  title: string;
  buttons: ButtonProps[];
}

function MenuItem({ title, buttons }: MenuItemProps) {
  return (
    <li>
      <div className="menu-section-title">{title}</div>
      <div className="menu-section-container">
        {buttons.map((button) => (
          <div className="menu-btn-container">
            <button
              key={button.id}
              type="button"
              className="menu-buttons"
              onClick={button.onClick}
            >
              {button.label}
            </button>
          </div>
        ))}
      </div>
    </li>
  );
}

export default MenuItem;
