import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const ViolinIcon: React.FC<IconProps> = ({ className, size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Violin body */}
      <path d="M12 3v18" />
      <path d="M9 6c0 0 1.5-1.5 3-1.5S15 6 15 6c1 1 1 3 0 4L9 16c-1 1-3 1-4 0c0 0-1.5-1.5-1.5-3S6 9 6 9" />
      <path d="M15 10c1 1 3 1 4 0c0 0 1.5-1.5 1.5-3S18 3 18 3" />
      {/* Violin strings */}
      <line x1="8" y1="16" x2="16" y2="8" />
      <line x1="10" y1="18" x2="18" y2="10" />
      {/* Violin bow */}
      <path d="M19 19l-5-5" />
      <path d="M21 21l-1-1" />
    </svg>
  );
};

export default ViolinIcon;