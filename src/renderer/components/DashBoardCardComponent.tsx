import React from 'react';

interface CardProps {
  title: string;
  onClick: () => void;
}

function DashboardCard({ title, onClick }: CardProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      onClick();
    }
  };

  return (
    <div
      className="card"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
    >
      <h3>{title}</h3>
      <p>Click me!</p>
    </div>
  );
}

export default DashboardCard;
