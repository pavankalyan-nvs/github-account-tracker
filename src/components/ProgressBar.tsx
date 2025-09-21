import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  showNumbers?: boolean;
  className?: string;
  barClassName?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  showPercentage = true,
  showNumbers = true,
  className = '',
  barClassName = ''
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className={`w-full ${className}`}>
      {(label || showNumbers || showPercentage) && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-slate-300">{label}</span>
          <div className="flex items-center space-x-2">
            {showNumbers && (
              <span className="text-slate-400">{current}/{total}</span>
            )}
            {showPercentage && (
              <span className="text-slate-300 font-medium">{percentage}%</span>
            )}
          </div>
        </div>
      )}
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ease-out ${
            barClassName || 'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};