import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: 'default' | 'elevated' | 'bordered' | 'minimal';
  className?: string;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  variant = 'default',
  className = '',
  onClick,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl';
      case 'bordered':
        return 'border-2 border-indigo-200 dark:border-indigo-900 bg-transparent hover:border-indigo-500 dark:hover:border-indigo-600';
      case 'minimal':
        return 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900';
      default:
        return 'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700';
    }
  };

  return (
    <div
      className={`feature-card group ${getVariantClasses()} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="feature-card__icon">
        <Icon size={24} />
      </div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>

      {onClick && (
        <div className="mt-4 flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:text-indigo-500">
          <span>Learn more</span>
          <svg
            className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;