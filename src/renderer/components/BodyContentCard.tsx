import React, { JSX } from 'react';

interface BodyContentCardProps {
  children: React.ReactNode;
  onClose?: () => void;
}

function BodyContentCard({
  children,
  onClose,
}: BodyContentCardProps): JSX.Element {
  return (
    <div className="body-content-card">
      <div className="body-content-button-container">
        <button
          className="body-content-close-button"
          type="button"
          onClick={onClose}
        >
          &times; close
        </button>
      </div>

      <div className="body-content-card-content">{children}</div>
    </div>
  );
}

export default BodyContentCard;
