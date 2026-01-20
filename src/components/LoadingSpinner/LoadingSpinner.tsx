import React from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink';
  label?: string;
  className?: string;
}

const sizeStyles = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
};

const colorStyles = {
  primary: 'border-accent-blue border-t-transparent',
  white: 'border-white border-t-transparent',
  blue: 'border-accent-blue border-t-transparent',
  green: 'border-accent-green border-t-transparent',
  red: 'border-accent-red border-t-transparent',
  yellow: 'border-accent-yellow border-t-transparent',
  purple: 'border-accent-purple border-t-transparent',
  pink: 'border-accent-pink border-t-transparent',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`} role="status">
      <div
        className={`
          rounded-full
          ${sizeStyles[size]}
          ${colorStyles[color]}
          ${prefersReducedMotion ? '' : 'animate-spin'}
        `}
        aria-hidden="true"
      />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
};
