import React from 'react';
import { ExternalLink, Star, GitFork, Calendar, Lock, StarOff } from 'lucide-react';
import { GitHubRepository } from '../types/github';

interface RepositoryCardProps {
  repository: GitHubRepository;
  onUnstar?: (repository: GitHubRepository) => void;
  isUnstarring?: boolean;
  showUnstarButton?: boolean;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ 
  repository, 
  onUnstar, 
  isUnstarring = false, 
  showUnstarButton = false 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLanguageColor = (language?: string) => {
    const colors: { [key: string]: string } = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'C++': 'bg-pink-500',
      'C#': 'bg-purple-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-700',
      'PHP': 'bg-indigo-500',
      'Ruby': 'bg-red-500',
    };
    return colors[language || ''] || 'bg-gray-500';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
              {repository.name}
            </h3>
            {repository.private && (
              <Lock className="w-4 h-4 text-amber-500" title="Private repository" />
            )}
            {repository.archived && (
              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                Archived
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            by {repository.owner.login}
          </p>
          {repository.description && (
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-3">
              {repository.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-2">
          {showUnstarButton && onUnstar && (
            <button
              onClick={() => onUnstar(repository)}
              disabled={isUnstarring}
              className="p-2 text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Unstar repository"
            >
              {isUnstarring ? (
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <StarOff className="w-4 h-4" />
              )}
            </button>
          )}
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="View repository on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-4">
          {repository.language && (
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${getLanguageColor(repository.language)}`}></div>
              <span>{repository.language}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>{repository.stargazers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GitFork className="w-4 h-4" />
            <span>{repository.forks_count.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>Updated {formatDate(repository.updated_at)}</span>
        </div>
      </div>
    </div>
  );
};