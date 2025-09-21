import React from 'react';

export const TopicCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {/* Hash icon skeleton */}
            <div className="w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded"></div>
            {/* Topic name skeleton */}
            <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-32"></div>
            {/* Badges skeleton */}
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
          </div>
          {/* Topic slug skeleton */}
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-24 mb-1"></div>
          {/* Description skeleton */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-2/3"></div>
          </div>
        </div>
        {/* External link skeleton */}
        <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded ml-2"></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Created by skeleton */}
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-20"></div>
          {/* Score skeleton */}
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-8"></div>
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