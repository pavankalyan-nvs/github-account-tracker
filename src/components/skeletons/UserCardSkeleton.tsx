import React from 'react';

export const UserCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 animate-pulse">
      <div className="flex items-start space-x-4">
        {/* Avatar skeleton */}
        <div className="w-16 h-16 bg-slate-600 rounded-full border-2 border-slate-600"></div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {/* Name skeleton */}
              <div className="h-5 bg-slate-600 rounded w-32"></div>
              {/* External link skeleton */}
              <div className="w-4 h-4 bg-slate-600 rounded"></div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* More button skeleton */}
              <div className="w-4 h-4 bg-slate-600 rounded"></div>
              {/* Unfollow button skeleton */}
              <div className="w-8 h-8 bg-slate-600 rounded-lg"></div>
            </div>
          </div>
          
          {/* Username skeleton */}
          <div className="h-4 bg-slate-600 rounded w-20 mb-2"></div>
          
          {/* Stats skeleton */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-slate-600 rounded"></div>
              <div className="h-3 bg-slate-600 rounded w-6"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-slate-600 rounded"></div>
              <div className="h-3 bg-slate-600 rounded w-8"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-slate-600 rounded"></div>
              <div className="h-3 bg-slate-600 rounded w-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};