import React, { useState } from 'react';
import { ExternalLink, Users, GitBranch, User, UserMinus, Heart, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { UserWithFollowStatus } from '../types/github';
import { GitHubApiService } from '../services/githubApi';

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

  const handleUnfollow = () => {
    if (onUnfollow && !user.isMutualFollow) {
      if (window.confirm(`Are you sure you want to unfollow @${user.login}?`)) {
        onUnfollow(user);
      }
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
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start space-x-4">
        <img
          src={detailedUser.avatar_url}
          alt={`${detailedUser.login}'s avatar`}
          className="w-16 h-16 rounded-full border-2 border-slate-600"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <h3 className="font-semibold text-white truncate">
                {detailedUser.name || detailedUser.login}
              </h3>
              {user.isMutualFollow && (
                <div className="flex items-center space-x-1 text-pink-400" title="Mutual follow">
                  <Heart className="w-4 h-4" />
                </div>
              )}
              <a
                href={detailedUser.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            
            <div className="flex items-center space-x-2">
              {apiService && (
                <button
                  onClick={toggleDetails}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title={showDetails ? "Hide details" : "Show details"}
                >
                  {isLoadingDetails ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MoreHorizontal className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {showUnfollowButton && (
                <div>
                  {user.isMutualFollow ? (
                    <div className="flex items-center space-x-1 text-amber-400 text-xs" title="Cannot unfollow mutual connections">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="hidden sm:inline">Mutual</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleUnfollow}
                      disabled={isUnfollowing}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Unfollow user"
                    >
                      {isUnfollowing ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <UserMinus className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-slate-400 text-sm mb-2">@{detailedUser.login}</p>
          
          {showDetails && detailedUser.bio && (
            <p className="text-slate-300 text-sm mb-3 line-clamp-2">{detailedUser.bio}</p>
          )}
          
          {showDetails && (
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <GitBranch className="w-3 h-3" />
                <span>{detailedUser.public_repos ?? '?'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{detailedUser.followers ?? '?'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{detailedUser.following ?? '?'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};