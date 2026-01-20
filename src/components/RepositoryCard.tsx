import React, { useState } from 'react';
import { ExternalLink, Star, GitFork, Calendar, Lock, StarOff } from 'lucide-react';
import { GitHubRepository } from '../types/github';
import { Modal } from './Modal/Modal';
import { LoadingSpinner } from './LoadingSpinner/LoadingSpinner';

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
  const [showUnstarModal, setShowUnstarModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLanguageColor = (language?: string) => {
    const colors: { [key: string]: string } = {
      'JavaScript': 'bg-accent-yellow',
      'TypeScript': 'bg-accent-blue',
      'Python': 'bg-accent-green',
      'Java': 'bg-accent-orange',
      'C++': 'bg-accent-pink',
      'C#': 'bg-accent-purple',
      'Go': 'bg-accent-blue-light',
      'Rust': 'bg-accent-orange-hover',
      'PHP': 'bg-accent-purple-light',
      'Ruby': 'bg-accent-red',
    };
    return colors[language || ''] || 'bg-dark-border-secondary';
  };

  const handleUnstar = () => {
    if (onUnstar) {
      onUnstar(repository);
      setShowUnstarModal(false);
    }
  };

  return (
    <>
      <div className="card-base hover:translate-y-[-2px] lg:col-span-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-lg font-semibold text-dark-text-primary truncate">
                {repository.name}
              </h3>
              {repository.private && (
                <Lock className="w-4 h-4 text-accent-yellow flex-shrink-0" title="Private repository" aria-label="Private repository" />
              )}
              {repository.archived && (
                <span className="px-2 py-0.5 text-xs font-medium bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30 rounded-full">
                  Archived
                </span>
              )}
            </div>
            <p className="text-sm text-dark-text-tertiary mb-1">
              by {repository.owner.login}
            </p>
            {repository.description && (
              <p className="text-sm text-dark-text-secondary line-clamp-2 mb-3">
                {repository.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {showUnstarButton && onUnstar && (
              <button
                onClick={() => setShowUnstarModal(true)}
                disabled={isUnstarring}
                className="p-2 text-accent-yellow hover:text-accent-yellow-light hover:bg-accent-yellow/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                aria-label="Unstar repository"
                title="Unstar repository"
              >
                {isUnstarring ? (
                  <LoadingSpinner size="xs" color="yellow" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
              </button>
            )}
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn"
              aria-label="View repository on GitHub"
              title="View repository on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-dark-text-tertiary flex-wrap gap-2">
          <div className="flex items-center gap-4">
            {repository.language && (
              <div className="flex items-center gap-1.5" title={`Language: ${repository.language}`}>
                <div className={`w-3 h-3 rounded-full ${getLanguageColor(repository.language)} transition-transform duration-200`}></div>
                <span className="font-medium">{repository.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1" title="Stars">
              <Star className="w-4 h-4 text-accent-yellow" />
              <span>{repository.stargazers_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1" title="Forks">
              <GitFork className="w-4 h-4" />
              <span>{repository.forks_count.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated {formatDate(repository.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Unstar Confirmation Modal */}
      <Modal
        isOpen={showUnstarModal}
        onClose={() => setShowUnstarModal(false)}
        title="Unstar Repository"
        description={`Are you sure you want to unstar "${repository.name}"? You can always star it again later.`}
        variant="confirm"
        confirmText="Unstar"
        confirmVariant="danger"
        onConfirm={handleUnstar}
      />
    </>
  );
};