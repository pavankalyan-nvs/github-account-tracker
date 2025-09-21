import React, { useState } from 'react';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortOptions } from '../types/github';

interface SortSelectorProps {
  sortOptions: SortOptions;
  onSortChange: (sortOptions: SortOptions) => void;
  activeTab: 'following' | 'followers' | 'starred' | 'topics';
}

export const SortSelector: React.FC<SortSelectorProps> = ({
  sortOptions,
  onSortChange,
  activeTab
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSortOptionsForTab = () => {
    const isUserTab = activeTab === 'following' || activeTab === 'followers';
    const isRepoTab = activeTab === 'starred';
    const isTopicTab = activeTab === 'topics';

    const options: { value: SortOptions['field']; label: string }[] = [];

    if (isUserTab) {
      options.push(
        { value: 'followers', label: 'Followers' },
        { value: 'following', label: 'Following' },
        { value: 'login', label: 'Username' },
        { value: 'created', label: 'Join Date' }
      );
    } else if (isRepoTab) {
      options.push(
        { value: 'stars', label: 'Stars' },
        { value: 'forks', label: 'Forks' },
        { value: 'name', label: 'Name' },
        { value: 'created', label: 'Created Date' },
        { value: 'updated', label: 'Last Updated' }
      );
    } else if (isTopicTab) {
      options.push(
        { value: 'name', label: 'Name' }
      );
    }

    return options;
  };

  const currentLabel = getSortOptionsForTab().find(
    option => option.value === sortOptions.field
  )?.label || 'Sort';

  const handleFieldChange = (field: SortOptions['field']) => {
    onSortChange({
      ...sortOptions,
      field
    });
    setIsOpen(false);
  };

  const handleDirectionToggle = () => {
    onSortChange({
      ...sortOptions,
      direction: sortOptions.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Sort Field Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium bg-slate-800 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <span>Sort by: {currentLabel}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
            <div className="py-1">
              {getSortOptionsForTab().map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFieldChange(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortOptions.field === option.value
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sort Direction Toggle */}
      <button
        onClick={handleDirectionToggle}
        className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
          sortOptions.direction === 'desc'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
        }`}
        title={`Sort ${sortOptions.direction === 'desc' ? 'Descending' : 'Ascending'}`}
      >
        {sortOptions.direction === 'desc' ? (
          <ArrowDown className="w-4 h-4" />
        ) : (
          <ArrowUp className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};