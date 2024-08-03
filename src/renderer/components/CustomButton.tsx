// src/components/CustomButton.tsx
import React from 'react';
import './CustomButton.css'; // Import CSS for styling

interface CustomButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  type?: 'button' | 'active' | 'submit' | 'reset' | 'close';
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

// eslint-disable-next-line react/function-component-definition
const CustomButton: React.FC<CustomButtonProps> = ({
  onClick,
  children,
  type = 'button',
  className = '',
  disabled = false,
  style = {}, // Default to an empty object
}) => {
  const typeClass = type !== 'button' ? `custom-button-${type}` : '';
  return (
    <button
      onClick={onClick}
      type={type}
      className={`custom-button ${typeClass} ${className}`}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

export default CustomButton;
