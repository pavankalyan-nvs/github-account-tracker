import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactElement<{ className?: string }>;
  rightIcon?: React.ReactElement<{ className?: string }>;
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-accent-blue hover:bg-accent-blue-hover text-white focus:ring-accent-blue',
  secondary: 'bg-dark-bg-tertiary hover:bg-dark-border-primary text-dark-text-primary focus:ring-dark-border-primary',
  outline: 'border border-dark-border-primary hover:bg-dark-bg-tertiary text-dark-text-primary focus:ring-accent-blue',
  ghost: 'hover:bg-dark-bg-tertiary text-dark-text-secondary hover:text-dark-text-primary focus:ring-accent-blue',
  danger: 'bg-accent-red hover:bg-accent-red-hover text-white focus:ring-accent-red',
  success: 'bg-accent-green hover:bg-accent-green-hover text-white focus:ring-accent-green',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const clonedLeftIcon = leftIcon
    ? React.cloneElement(leftIcon, { className: iconSizes[size] })
    : null;

  const clonedRightIcon = rightIcon
    ? React.cloneElement(rightIcon, { className: iconSizes[size] })
    : null;

  return (
    <button
      className={`
        btn-base
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {isLoading ? (
          <span
            className={`border-2 border-current border-t-transparent rounded-full animate-spin ${iconSizes[size]}`}
            aria-hidden="true"
          />
        ) : (
          clonedLeftIcon
        )}
        {children}
        {!isLoading && clonedRightIcon}
      </span>
    </button>
  );
};
