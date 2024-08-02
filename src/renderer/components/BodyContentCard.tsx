import React, { JSX } from 'react';
import CustomButton from './CustomButton';

interface BodyContentCardProps {
  children: React.ReactNode;
  onClose?: () => void;
  title?: string;
}

function BodyContentCard({
  children,
  onClose,
  title = '',
}: BodyContentCardProps): JSX.Element {
  // Determine additional class based on type

  return (
    <div className="body-content-card">
      <div className="body-content-button-container">
        <div className="body-content-container-title">{title}</div>
        {/* <button
          className="body-content-close-button"
          type="button"
          onClick={onClose}
        >
          &times; close
        </button> */}
        <CustomButton onClick={onClose} type="close">
          &times; Close
        </CustomButton>
      </div>

      <div className="body-content-card-content">{children}</div>
    </div>
  );
}

export default BodyContentCard;
