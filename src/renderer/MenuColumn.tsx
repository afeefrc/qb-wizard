import React from 'react';
import MenuItem from './MenuItem';

interface MenuItemProps {
  id: string;
  title: string;
  buttons: { id: string; label: string; onClick: () => void }[];
}

interface MenuColumnProps {
  menuItems: MenuItemProps[];
}

function MenuColumn({ menuItems }: MenuColumnProps) {
  return (
    <ul>
      {menuItems.map((item) => (
        <MenuItem key={item.id} title={item.title} buttons={item.buttons} />
      ))}
    </ul>
  );
}

export default MenuColumn;
