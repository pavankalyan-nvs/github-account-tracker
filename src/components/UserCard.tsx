import React, { useState } from 'react';
import { ExternalLink, Users, GitBranch, User, UserMinus, Heart, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { UserWithFollowStatus } from '../types/github';
import { GitHubApiService } from '../services/githubApi';
import { Modal } from './Modal/Modal';
import { LoadingSpinner } from './LoadingSpinner/LoadingSpinner';

interface UserCardProps {
  user: UserWithFollowStatus;
  onUnfollow?: (user: UserWithFollowStatus) => void;
  isUnfollowing?: boolean;
  showUnfollowButton?: boolean;
  apiService?: GitHubApiService;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onUnfollow,
  isUnfollowing = false,
  showUnfollowButton = false,
  apiService
}) => {
  const [detailedUser, setDetailedUser] = useState<UserWithFollowStatus>(user);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  const handleUnfollow = () => {
    if (onUnfollow && !user.isMutualFollow) {
      onUnfollow(user);
      setShowUnfollowModal(false);
    }
  };

  const loadUserDetails = async () => {
    if (!apiService || isLoadingDetails || detailedUser.bio !== undefined) {
      return; // Already have details or no API service
    }

    setIsLoadingDetails(true);
    try {
      const details = await apiService.getUserDetails(user.login);
      if (details) {
        setDetailedUser({ ...user, ...details });
      }
    } catch (error) {
      console.warn(`Failed to load details for user ${user.login}:`, error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const toggleDetails = () => {
    if (!showDetails && apiService) {
      loadUserDetails();
    }
    setShowDetails(!showDetails);
  };

  return (
    <>
      <div className="card-base hover:translate-y-[-2px] hover:scale-[1.01]">
        <div className="flex items-start gap-4">
          <img
            src={detailedUser.avatar_url}
            alt={`${detailedUser.login}'s avatar`}
            className="w-16 h-16 rounded-full border-2 border-dark-border-primary ring-2 ring-dark-border-primary/50 hover:ring-accent-blue-light transition-all duration-250"
          />
        
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-dark-text-primary truncate">
                  {detailedUser.name || detailedUser.login}
                </h3>
                {user.isMutualFollow && (
                  <div className="flex items-center gap-1 text-accent-pink" title="Mutual follow" aria-label="Mutual follow">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                )}
                <a
                  href={detailedUser.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dark-text-tertiary hover:text-accent-blue transition-colors duration-200"
                  aria-label={`View ${detailedUser.login}'s GitHub profile`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            
              <div className="flex items-center gap-2">
                {apiService && (
                  <button
                    onClick={toggleDetails}
                    className="icon-btn"
                    aria-label={showDetails ? "Hide details" : "Show details"}
                    title={showDetails ? "Hide details" : "Show details"}
                  >
                    {isLoadingDetails ? (
                      <LoadingSpinner size="xs" color="primary" />
                    ) : (
                      <MoreHorizontal className="w-4 h-4" />
                    )}
                  </button>
                )}

                {showUnfollowButton && (
                  <div>
                    {user.isMutualFollow ? (
                      <div className="flex items-center gap-1 text-accent-yellow text-xs" title="Cannot unfollow mutual connections" aria-label="Mutual connection">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="hidden sm:inline font-medium">Mutual</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowUnfollowModal(true)}
                        disabled={isUnfollowing}
                        className="p-2 text-dark-text-tertiary hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        aria-label="Unfollow user"
                        title="Unfollow user"
                      >
                        {isUnfollowing ? (
                          <LoadingSpinner size="xs" color="red" />
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          
            <p className="text-sm text-dark-text-tertiary mb-2">@{detailedUser.login}</p>

            {showDetails && detailedUser.bio && (
              <p className="text-sm text-dark-text-secondary mb-3 line-clamp-2">{detailedUser.bio}</p>
            )}

            {showDetails && (
              <div className="flex items-center gap-4 text-xs text-dark-text-tertiary">
                <div className="flex items-center gap-1" title="Public repositories">
                  <GitBranch className="w-3 h-3" />
                  <span>{detailedUser.public_repos ?? '?'}</span>
                </div>
                <div className="flex items-center gap-1" title="Followers">
                  <Users className="w-3 h-3" />
                  <span>{detailedUser.followers ?? '?'}</span>
                </div>
                <div className="flex items-center gap-1" title="Following">
                  <User className="w-3 h-3" />
                  <span>{detailedUser.following ?? '?'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unfollow Confirmation Modal */}
      <Modal
        isOpen={showUnfollowModal}
        onClose={() => setShowUnfollowModal(false)}
        title="Unfollow User"
        description={`Are you sure you want to unfollow @${user.login}? You can always follow them again later.`}
        variant="confirm"
        confirmText="Unfollow"
        confirmVariant="danger"
        onConfirm={handleUnfollow}
      />
    </>
  );
};