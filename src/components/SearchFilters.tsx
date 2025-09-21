import React, { useState } from 'react';
import { ChevronDown, X, Filter } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types/github';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  activeTab: 'following' | 'followers' | 'starred' | 'topics';
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  activeTab
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof SearchFiltersType>(
    key: K,
    value: SearchFiltersType[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilter = (key: keyof SearchFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({ text: filters.text });
  };

  const isUserTab = activeTab === 'following' || activeTab === 'followers';
  const isRepoTab = activeTab === 'starred';
  const isTopicTab = activeTab === 'topics';

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'text' && filters[key as keyof SearchFiltersType] !== undefined
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
          hasActiveFilters 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="bg-blue-800 text-xs px-2 py-0.5 rounded-full">
            {Object.keys(filters).filter(key => key !== 'text' && filters[key as keyof SearchFiltersType] !== undefined).length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* User-specific filters */}
              {isUserTab && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Followers Range
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minFollowers || ''}
                        onChange={(e) => updateFilter('minFollowers', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxFollowers || ''}
                        onChange={(e) => updateFilter('maxFollowers', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Following Range
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minFollowing || ''}
                        onChange={(e) => updateFilter('minFollowing', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxFollowing || ''}
                        onChange={(e) => updateFilter('maxFollowing', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA"
                      value={filters.location || ''}
                      onChange={(e) => updateFilter('location', e.target.value || undefined)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GitHub, Google"
                      value={filters.company || ''}
                      onChange={(e) => updateFilter('company', e.target.value || undefined)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    />
                  </div>
                </>
              )}

              {/* Repository-specific filters */}
              {isRepoTab && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Programming Language
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JavaScript, Python"
                      value={filters.language || ''}
                      onChange={(e) => updateFilter('language', e.target.value || undefined)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Stars Range
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minStars || ''}
                        onChange={(e) => updateFilter('minStars', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxStars || ''}
                        onChange={(e) => updateFilter('maxStars', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Forks Range
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minForks || ''}
                        onChange={(e) => updateFilter('minForks', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxForks || ''}
                        onChange={(e) => updateFilter('maxForks', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Repository Status
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.hasDescription === true}
                          onChange={(e) => updateFilter('hasDescription', e.target.checked ? true : undefined)}
                          className="rounded bg-slate-700 border-slate-600 text-blue-600"
                        />
                        <span className="text-sm text-slate-300">Has description</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.isArchived === false}
                          onChange={(e) => updateFilter('isArchived', e.target.checked ? false : undefined)}
                          className="rounded bg-slate-700 border-slate-600 text-blue-600"
                        />
                        <span className="text-sm text-slate-300">Not archived</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="border-t border-slate-700 p-4">
              <div className="text-xs text-slate-400 mb-2">Active filters:</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (key === 'text' || value === undefined) return null;
                  
                  let displayValue = value;
                  if (typeof value === 'boolean') {
                    displayValue = value ? 'Yes' : 'No';
                  }
                  
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                    >
                      <span>{key}: {String(displayValue)}</span>
                      <button
                        onClick={() => clearFilter(key as keyof SearchFiltersType)}
                        className="hover:bg-blue-700 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};