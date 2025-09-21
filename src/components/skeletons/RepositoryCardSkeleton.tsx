import React from 'react';

export const RepositoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {/* Repository name skeleton */}
            <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-40"></div>
            {/* Badges skeleton */}
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
          </div>
          {/* Owner skeleton */}
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-24 mb-1"></div>
          {/* Description skeleton */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          {/* Action buttons skeleton */}
          <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
          <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Language indicator skeleton */}
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-16"></div>
          </div>
          {/* Stars skeleton */}
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-8"></div>
          </div>
          {/* Forks skeleton */}
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-6"></div>
          </div>
        </div>
        {/* Date skeleton */}
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};