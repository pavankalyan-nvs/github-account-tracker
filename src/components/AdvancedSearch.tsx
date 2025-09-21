import React, { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { SearchFilters as SearchFiltersType, SortOptions } from '../types/github';
import { useDebounceSearch } from '../hooks/useDebounceSearch';
import { SearchFilters } from './SearchFilters';
import { SortSelector } from './SortSelector';
import { getDefaultFilters, getDefaultSortOptions, isFilterActive } from '../utils/searchUtils';

interface AdvancedSearchProps {
  onSearchChange: (searchTerm: string) => void;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSortChange: (sortOptions: SortOptions) => void;
  placeholder?: string;
  activeTab: 'following' | 'followers' | 'starred' | 'topics';
  initialFilters?: SearchFiltersType;
  initialSort?: SortOptions;
  resultCount?: number;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearchChange,
  onFiltersChange,
  onSortChange,
  placeholder = 'Search...',
  activeTab,
  initialFilters = getDefaultFilters(),
  initialSort = getDefaultSortOptions(),
  resultCount
}) => {
  const {
    searchTerm,
    debouncedSearchTerm,
    updateSearchTerm,
    clearSearch,
    isSearching
  } = useDebounceSearch(initialFilters.text);

  const [filters, setFilters] = React.useState<SearchFiltersType>(initialFilters);
  const [sortOptions, setSortOptions] = React.useState<SortOptions>(initialSort);

  // Update parent when debounced search term changes
  React.useEffect(() => {
    const updatedFilters = { ...filters, text: debouncedSearchTerm };
    setFilters(updatedFilters);
    onSearchChange(debouncedSearchTerm);
    onFiltersChange(updatedFilters);
  }, [debouncedSearchTerm, filters, onSearchChange, onFiltersChange]);

  // Update parent when filters change
  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Update parent when sort changes
  const handleSortChange = (newSortOptions: SortOptions) => {
    setSortOptions(newSortOptions);
    onSortChange(newSortOptions);
  };

  const clearAllFilters = () => {
    const defaultFilters = { text: searchTerm };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = useMemo(() => isFilterActive(filters), [filters]);

  const getPlaceholderText = () => {
    switch (activeTab) {
      case 'starred':
        return 'Search repositories...';
      case 'topics':
        return 'Search topics...';
      default:
        return 'Search users...';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder={placeholder || getPlaceholderText()}
          value={searchTerm}
          onChange={(e) => updateSearchTerm(e.target.value)}
          className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Filter and sort controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            activeTab={activeTab}
          />
          
          <SortSelector
            sortOptions={sortOptions}
            onSortChange={handleSortChange}
            activeTab={activeTab}
          />

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {resultCount !== undefined && (
          <div className="text-sm text-slate-400">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Active filters chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (key === 'text' || value === undefined) return null;
            
            let displayValue = value;
            let displayKey = key;
            
            // Format display values
            if (typeof value === 'boolean') {
              displayValue = value ? 'Yes' : 'No';
            }
            
            // Format display keys
            if (key === 'minFollowers') displayKey = 'Min Followers';
            if (key === 'maxFollowers') displayKey = 'Max Followers';
            if (key === 'minFollowing') displayKey = 'Min Following';
            if (key === 'maxFollowing') displayKey = 'Max Following';
            if (key === 'minStars') displayKey = 'Min Stars';
            if (key === 'maxStars') displayKey = 'Max Stars';
            if (key === 'minForks') displayKey = 'Min Forks';
            if (key === 'maxForks') displayKey = 'Max Forks';
            if (key === 'hasDescription') displayKey = 'Has Description';
            if (key === 'isArchived') displayKey = 'Archived';
            if (key === 'accountType') displayKey = 'Account Type';
            
            return (
              <span
                key={key}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
              >
                <span>{displayKey}: {String(displayValue)}</span>
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters[key as keyof SearchFiltersType];
                    handleFiltersChange(newFilters);
                  }}
                  className="hover:bg-blue-700 rounded-full p-0.5 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};