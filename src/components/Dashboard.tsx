import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Users, RefreshCw, LogOut, AlertCircle, CheckCircle, Download, UserCheck, Heart, UserMinus, Shield, Star, StarOff, Hash } from 'lucide-react';
import { GitHubApiService } from '../services/githubApi';
import { GitHubUser, AuthConfig, UserWithFollowStatus, GitHubRepository, GitHubRateLimit, GitHubTopic } from '../types/github';
import { UserCard } from './UserCard';
import { RepositoryCard } from './RepositoryCard';
import { TopicCard } from './TopicCard';
import { ErrorBoundary } from './ErrorBoundary';
import { ComponentErrorFallback } from './ErrorFallback';
import { UserCardSkeleton } from './skeletons/UserCardSkeleton';
import { RepositoryCardSkeleton } from './skeletons/RepositoryCardSkeleton';
import { TopicCardSkeleton } from './skeletons/TopicCardSkeleton';
import { ProgressBar } from './ProgressBar';
import { convertToCSV, downloadCSV, getCSVFilename, convertReposToCSV, convertTopicsToCSV } from '../utils/csvExport';

interface DashboardProps {
  config: AuthConfig;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ config, onLogout }) => {
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(null);
  const [following, setFollowing] = useState<UserWithFollowStatus[]>([]);
  const [followers, setFollowers] = useState<GitHubUser[]>([]);
  const [starredRepos, setStarredRepos] = useState<GitHubRepository[]>([]);
  const [topics, setTopics] = useState<GitHubTopic[]>([]);
  const [topicsSearchQuery, setTopicsSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingStarred, setIsLoadingStarred] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isCheckingMutualFollows, setIsCheckingMutualFollows] = useState(false);
  const [unfollowingUsers, setUnfollowingUsers] = useState<Set<string>>(new Set());
  const [isBulkUnfollowing, setIsBulkUnfollowing] = useState(false);
  const [bulkUnfollowProgress, setBulkUnfollowProgress] = useState({ current: 0, total: 0 });
  const [unstarringRepos, setUnstarringRepos] = useState<Set<number>>(new Set());
  const [isBulkUnstarring, setIsBulkUnstarring] = useState(false);
  const [bulkUnstarProgress, setBulkUnstarProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'starred' | 'topics'>('following');
  const [rateLimit, setRateLimit] = useState<GitHubRateLimit | null>(null);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isSearchingTopics, setIsSearchingTopics] = useState(false);

  const apiService = useMemo(() => new GitHubApiService({
    ...config,
    username: currentUser?.login
  }), [config, currentUser?.login]);

  const filteredUsers = useMemo(() => {
    if (activeTab === 'starred' || activeTab === 'topics') return [];
    const users = activeTab === 'following' ? following : followers;
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [following, followers, searchTerm, activeTab]);

  const filteredRepos = useMemo(() => {
    if (activeTab !== 'starred') return [];
    if (!searchTerm) return starredRepos;
    
    return starredRepos.filter(repo => 
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.owner.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (repo.language && repo.language.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [starredRepos, searchTerm, activeTab]);

  const filteredTopics = useMemo(() => {
    if (activeTab !== 'topics') return [];
    if (!searchTerm) return topics;
    
    return topics.filter(topic => 
      topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (topic.display_name && topic.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (topic.short_description && topic.short_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [topics, searchTerm, activeTab]);

  const mutualFollowsCount = useMemo(() => {
    return following.filter(user => user.isMutualFollow).length;
  }, [following]);

  const nonMutualFollowsCount = useMemo(() => {
    return following.filter(user => !user.isMutualFollow).length;
  }, [following]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch current user and rate limit info
      const [user, rateLimitInfo] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getRateLimit()
      ]);

      setCurrentUser(user);
      setRateLimit(rateLimitInfo);

      // Fetch all following users
      const followingUsers = await apiService.getAllFollowing();
      setFollowing(followingUsers.map(user => ({ ...user, isFollowingMe: false, isMutualFollow: false })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const checkMutualFollows = useCallback(async () => {
    if (following.length === 0) return;
    
    try {
      setIsCheckingMutualFollows(true);
      setError(null);

      // Check rate limit before proceeding
      const rateLimitInfo = await apiService.getRateLimit();
      setRateLimit(rateLimitInfo);

      if (rateLimitInfo.rate.remaining < following.length + 50) {
        setError(`Insufficient API calls remaining (${rateLimitInfo.rate.remaining}) to check mutual follows. Please wait for rate limit reset.`);
        return;
      }

      // Check mutual follows in batches to avoid overwhelming the API
      const batchSize = 10;
      const updatedFollowing = [...following];
      
      for (let i = 0; i < following.length; i += batchSize) {
        const batch = following.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (user, batchIndex) => {
            try {
              const actualIndex = i + batchIndex;
              const isFollowingMe = await apiService.checkIfIAmFollowedBy(user.login);
              updatedFollowing[actualIndex] = {
                ...user,
                isFollowingMe,
                isMutualFollow: isFollowingMe
              };
            } catch {
              // If we can't check, assume not mutual
              console.warn(`Could not check mutual follow status for ${user.login}`);
            }
          })
        );
        
        // Small delay between batches to be respectful to the API
        if (i + batchSize < following.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setFollowing(updatedFollowing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while checking mutual follows');
    } finally {
      setIsCheckingMutualFollows(false);
    }
  }, [apiService, following]);
  const fetchFollowers = useCallback(async () => {
    if (followers.length > 0) return; // Already loaded
    
    try {
      setIsLoadingFollowers(true);
      setError(null);

      const followersUsers = await apiService.getAllFollowers();
      setFollowers(followersUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching followers');
    } finally {
      setIsLoadingFollowers(false);
    }
  }, [apiService, followers.length]);

  const fetchStarredRepos = useCallback(async () => {
    if (starredRepos.length > 0) return; // Already loaded
    
    try {
      setIsLoadingStarred(true);
      setError(null);

      const starred = await apiService.getAllStarredRepos();
      setStarredRepos(starred);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching starred repositories');
    } finally {
      setIsLoadingStarred(false);
    }
  }, [apiService, starredRepos.length]);

  const fetchPopularTopics = useCallback(async () => {
    if (topics.length > 0) return; // Already loaded
    
    try {
      setIsLoadingTopics(true);
      setError(null);

      const popularTopics = await apiService.getPopularTopics();
      setTopics(popularTopics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching topics');
    } finally {
      setIsLoadingTopics(false);
    }
  }, [apiService, topics.length]);

  const searchTopics = async (query: string) => {
    if (!query.trim()) {
      fetchPopularTopics();
      return;
    }
    
    try {
      setIsSearchingTopics(true);
      setError(null);

      const response = await apiService.searchTopics(query);
      setTopics(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching topics');
    } finally {
      setIsSearchingTopics(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === 'followers' && followers.length === 0) {
      fetchFollowers();
    } else if (activeTab === 'starred' && starredRepos.length === 0) {
      fetchStarredRepos();
    } else if (activeTab === 'topics' && topics.length === 0) {
      fetchPopularTopics();
    }
  }, [activeTab, followers.length, starredRepos.length, topics.length, fetchFollowers, fetchStarredRepos, fetchPopularTopics]);

  useEffect(() => {
    // Auto-check mutual follows after following list is loaded
    if (following.length > 0 && !following.some(user => user.isMutualFollow !== undefined)) {
      checkMutualFollows();
    }
  }, [following, checkMutualFollows]);
  const handleRefresh = () => {
    if (activeTab === 'following') {
      fetchData();
    } else if (activeTab === 'followers') {
      setFollowers([]);
      fetchFollowers();
    } else if (activeTab === 'starred') {
      setStarredRepos([]);
      fetchStarredRepos();
    } else if (activeTab === 'topics') {
      setTopics([]);
      if (topicsSearchQuery) {
        searchTopics(topicsSearchQuery);
      } else {
        fetchPopularTopics();
      }
    }
  };

  const handleUnfollow = async (user: UserWithFollowStatus) => {
    if (user.isMutualFollow) {
      alert('Cannot unfollow users who follow you back (mutual follows) for safety.');
      return;
    }

    try {
      setUnfollowingUsers(prev => new Set(prev).add(user.login));
      setError(null);

      // Check rate limit before unfollowing
      const rateLimitInfo = await apiService.getRateLimit();
      setRateLimit(rateLimitInfo);

      if (rateLimitInfo.rate.remaining < 10) {
        throw new Error('Insufficient API calls remaining. Please wait for rate limit reset.');
      }

      await apiService.unfollowUser(user.login);
      
      // Remove user from following list
      setFollowing(prev => prev.filter(u => u.login !== user.login));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while unfollowing');
    } finally {
      setUnfollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.login);
        return newSet;
      });
    }
  };

  const handleBulkUnfollow = async () => {
    const nonMutualUsers = following.filter(user => !user.isMutualFollow);
    
    if (nonMutualUsers.length === 0) {
      alert('No non-mutual follows to unfollow!');
      return;
    }

    const confirmMessage = `Are you sure you want to unfollow ${nonMutualUsers.length} users who don't follow you back? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsBulkUnfollowing(true);
      setBulkUnfollowProgress({ current: 0, total: nonMutualUsers.length });
      setError(null);

      // Check rate limit before starting
      const rateLimitInfo = await apiService.getRateLimit();
      setRateLimit(rateLimitInfo);

      if (rateLimitInfo.rate.remaining < nonMutualUsers.length + 10) {
        throw new Error(`Insufficient API calls remaining (${rateLimitInfo.rate.remaining}) to unfollow ${nonMutualUsers.length} users. Please wait for rate limit reset.`);
      }

      // Process unfollows in batches to respect rate limits
      const batchSize = 5;
      let unfollowedCount = 0;
      const unfollowedUsers = new Set<string>();
      
      for (let i = 0; i < nonMutualUsers.length; i += batchSize) {
        const batch = nonMutualUsers.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (user) => {
            try {
              await apiService.unfollowUser(user.login);
              unfollowedUsers.add(user.login);
              unfollowedCount++;
              setBulkUnfollowProgress({ current: unfollowedCount, total: nonMutualUsers.length });
            } catch (error) {
              console.error(`Failed to unfollow ${user.login}:`, error);
            }
          })
        );
        
        // Small delay between batches to be respectful to the API
        if (i + batchSize < nonMutualUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Update following list by removing unfollowed users
      setFollowing(prev => prev.filter(user => !unfollowedUsers.has(user.login)));
      
      // Show success message
      if (unfollowedCount > 0) {
        alert(`Successfully unfollowed ${unfollowedCount} users!`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during bulk unfollow');
    } finally {
      setIsBulkUnfollowing(false);
      setBulkUnfollowProgress({ current: 0, total: 0 });
    }
  };

  const handleUnstar = async (repository: GitHubRepository) => {
    try {
      setUnstarringRepos(prev => new Set(prev).add(repository.id));
      setError(null);

      // Check rate limit before unstarring
      const rateLimitInfo = await apiService.getRateLimit();
      setRateLimit(rateLimitInfo);

      if (rateLimitInfo.rate.remaining < 10) {
        throw new Error('Insufficient API calls remaining. Please wait for rate limit reset.');
      }

      await apiService.unstarRepository(repository.owner.login, repository.name);
      
      // Remove repository from starred list
      setStarredRepos(prev => prev.filter(repo => repo.id !== repository.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while unstarring');
    } finally {
      setUnstarringRepos(prev => {
        const newSet = new Set(prev);
        newSet.delete(repository.id);
        return newSet;
      });
    }
  };

  const handleBulkUnstar = async () => {
    if (starredRepos.length === 0) {
      alert('No starred repositories to unstar!');
      return;
    }

    const confirmMessage = `Are you sure you want to unstar all ${starredRepos.length} starred repositories? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsBulkUnstarring(true);
      setBulkUnstarProgress({ current: 0, total: starredRepos.length });
      setError(null);

      // Check rate limit before starting
      const rateLimitInfo = await apiService.getRateLimit();
      setRateLimit(rateLimitInfo);

      if (rateLimitInfo.rate.remaining < starredRepos.length + 10) {
        throw new Error(`Insufficient API calls remaining (${rateLimitInfo.rate.remaining}) to unstar ${starredRepos.length} repositories. Please wait for rate limit reset.`);
      }

      // Process unstars in batches to respect rate limits
      const batchSize = 5;
      let unstarredCount = 0;
      const unstarredRepos = new Set<number>();
      
      for (let i = 0; i < starredRepos.length; i += batchSize) {
        const batch = starredRepos.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (repo) => {
            try {
              await apiService.unstarRepository(repo.owner.login, repo.name);
              unstarredRepos.add(repo.id);
              unstarredCount++;
              setBulkUnstarProgress({ current: unstarredCount, total: starredRepos.length });
            } catch (error) {
              console.error(`Failed to unstar ${repo.full_name}:`, error);
            }
          })
        );
        
        // Small delay between batches to be respectful to the API
        if (i + batchSize < starredRepos.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Update starred repos list by removing unstarred repos
      setStarredRepos(prev => prev.filter(repo => !unstarredRepos.has(repo.id)));
      
      // Show success message
      if (unstarredCount > 0) {
        alert(`Successfully unstarred ${unstarredCount} repositories!`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during bulk unstar');
    } finally {
      setIsBulkUnstarring(false);
      setBulkUnstarProgress({ current: 0, total: 0 });
    }
  };

  const handleTopicsSearch = (query: string) => {
    setTopicsSearchQuery(query);
    if (query !== searchTerm) {
      searchTopics(query);
    }
  };

  const handleDownloadCSV = async (type: 'following' | 'followers' | 'starred' | 'topics') => {
    try {
      setIsExportingCSV(true);
      setError(null);
      
      // Add a small delay to show loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (type === 'starred') {
        const csvContent = convertReposToCSV(starredRepos);
        const filename = getCSVFilename(type, currentUser?.login);
        downloadCSV(csvContent, filename);
      } else if (type === 'topics') {
        const csvContent = convertTopicsToCSV(topics);
        const filename = getCSVFilename(type, currentUser?.login);
        downloadCSV(csvContent, filename);
      } else {
        const data = type === 'following' ? following : followers;
        const csvContent = convertToCSV(data);
        const filename = getCSVFilename(type, currentUser?.login);
        downloadCSV(csvContent, filename);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during CSV export');
    } finally {
      setIsExportingCSV(false);
    }
  };

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Fetching your GitHub data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <img
                    src={currentUser.avatar_url}
                    alt="Your avatar"
                    className="w-8 h-8 rounded-full border-2 border-slate-600"
                  />
                  <div>
                    <h1 className="text-lg font-semibold text-white">
                      {currentUser.name || currentUser.login}
                    </h1>
                    <p className="text-xs text-slate-400">@{currentUser.login}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {activeTab === 'following' && !isCheckingMutualFollows && following.length > 0 && (
                <button
                  onClick={checkMutualFollows}
                  className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
                  title="Check which followers follow you back"
                >
                  <Shield className="w-3 h-3 inline mr-1" />
                  Check Mutual
                </button>
              )}
              {activeTab === 'following' && nonMutualFollowsCount > 0 && !isBulkUnfollowing && !isCheckingMutualFollows && (
                <button
                  onClick={handleBulkUnfollow}
                  className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  title="Unfollow all users who don't follow you back"
                >
                  <UserMinus className="w-3 h-3 inline mr-1" />
                  Bulk Unfollow ({nonMutualFollowsCount})
                </button>
              )}
              {activeTab === 'starred' && starredRepos.length > 0 && !isBulkUnstarring && (
                <button
                  onClick={handleBulkUnstar}
                  className="text-xs px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors"
                  title="Unstar all starred repositories"
                >
                  <StarOff className="w-3 h-3 inline mr-1" />
                  Bulk Unstar ({starredRepos.length})
                </button>
              )}
              {rateLimit && (
                <div className="text-xs text-slate-400 hidden sm:block">
                  Rate limit: {rateLimit.rate.remaining}/{rateLimit.rate.limit}
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={isLoading || isCheckingMutualFollows || isBulkUnstarring || isLoadingTopics}
                className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${(isLoading || isCheckingMutualFollows || isBulkUnstarring || isLoadingTopics) ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isCheckingMutualFollows && (
          <div className="mb-6 flex items-center space-x-2 text-blue-400 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span>Checking mutual follows... This may take a moment due to rate limiting.</span>
          </div>
        )}

        {isBulkUnfollowing && (
          <div className="mb-6 text-orange-400 bg-orange-900/20 border border-orange-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span>Bulk unfollowing users... Please don't close this tab.</span>
            </div>
            <ProgressBar
              current={bulkUnfollowProgress.current}
              total={bulkUnfollowProgress.total}
              barClassName="bg-gradient-to-r from-orange-500 to-orange-600"
              className="text-orange-300"
            />
          </div>
        )}

        {isBulkUnstarring && (
          <div className="mb-6 text-yellow-400 bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span>Bulk unstarring repositories... Please don't close this tab.</span>
            </div>
            <ProgressBar
              current={bulkUnstarProgress.current}
              total={bulkUnstarProgress.total}
              barClassName="bg-gradient-to-r from-yellow-500 to-yellow-600"
              className="text-yellow-300"
            />
          </div>
        )}


        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700 w-fit">
            <button
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'following'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Following ({following.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'followers'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4" />
                <span>Followers ({followers.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('starred')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'starred'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Starred ({starredRepos.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'topics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4" />
                <span>Topics ({topics.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  {activeTab === 'following' ? 'Following' : activeTab === 'followers' ? 'Followers' : activeTab === 'starred' ? 'Starred Repos' : 'Topics'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {activeTab === 'following' ? following.length : activeTab === 'followers' ? followers.length : activeTab === 'starred' ? starredRepos.length : topics.length}
                </p>
              </div>
              {activeTab === 'following' ? (
                <Users className="w-8 h-8 text-blue-400" />
              ) : activeTab === 'followers' ? (
                <UserCheck className="w-8 h-8 text-green-400" />
              ) : activeTab === 'starred' ? (
                <Star className="w-8 h-8 text-yellow-400" />
              ) : (
                <Hash className="w-8 h-8 text-purple-400" />
              )}
            </div>
          </div>

          {activeTab === 'following' && (
            <>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Mutual Follows</p>
                    <p className="text-2xl font-bold text-white">{mutualFollowsCount}</p>
                  </div>
                  <Heart className="w-8 h-8 text-pink-400" />
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Non-Mutual</p>
                    <p className="text-2xl font-bold text-white">{nonMutualFollowsCount}</p>
                  </div>
                  <UserMinus className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </>
          )}

          {(activeTab === 'following' || activeTab === 'followers') && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">With Display Names</p>
                  <p className="text-2xl font-bold text-white">
                    {(activeTab === 'following' ? following : followers).filter(user => user.name).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          )}

          {activeTab === 'topics' && (
            <>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Featured Topics</p>
                    <p className="text-2xl font-bold text-white">
                      {topics.filter(topic => topic.featured).length}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Curated Topics</p>
                    <p className="text-2xl font-bold text-white">
                      {topics.filter(topic => topic.curated).length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </>
          )}

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex flex-col items-center justify-center h-full">
              <button
                onClick={() => handleDownloadCSV(activeTab)}
                disabled={
                  (activeTab === 'following' ? following.length === 0 : 
                   activeTab === 'followers' ? followers.length === 0 : 
                   activeTab === 'starred' ? starredRepos.length === 0 :
                   topics.length === 0) ||
                  isLoading || 
                  isLoadingFollowers ||
                  isLoadingStarred ||
                  isLoadingTopics ||
                  isExportingCSV
                }
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isExportingCSV ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            {isSearchingTopics && activeTab === 'topics' ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin absolute left-3 top-1/2 transform -translate-y-1/2" />
            ) : (
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            )}
            <input
              type="text"
              placeholder={activeTab === 'starred' ? 'Search repositories...' : activeTab === 'topics' ? 'Search topics...' : 'Search users...'}
              value={activeTab === 'topics' ? topicsSearchQuery : searchTerm}
              onChange={(e) => {
                if (activeTab === 'topics') {
                  handleTopicsSearch(e.target.value);
                } else {
                  setSearchTerm(e.target.value);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && activeTab === 'topics') {
                  searchTopics(topicsSearchQuery);
                }
              }}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Content Grid */}
        <ErrorBoundary 
          fallback={ComponentErrorFallback}
          isolate={true}
          onError={(error) => console.error(`${activeTab} content error:`, error)}
        >
          {((isLoading && activeTab === 'following') || (isLoadingFollowers && activeTab === 'followers') || (isLoadingStarred && activeTab === 'starred') || (isLoadingTopics && activeTab === 'topics') || (isSearchingTopics && activeTab === 'topics')) ? (
            // Show skeleton loaders during initial loading
            activeTab === 'starred' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <RepositoryCardSkeleton key={i} />
                ))}
              </div>
            ) : activeTab === 'topics' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }, (_, i) => (
                  <TopicCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }, (_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            )
          ) : (isCheckingMutualFollows || isBulkUnstarring) ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-300">
                {isCheckingMutualFollows 
                  ? 'Checking mutual follows...' 
                  : 'Bulk unstarring repositories...'
                }
              </p>
            </div>
          ) : activeTab === 'starred' ? (
            <ErrorBoundary 
              fallback={ComponentErrorFallback}
              isolate={true}
              onError={(error) => console.error('Starred repos error:', error)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRepos.map((repo) => (
                  <ErrorBoundary 
                    key={repo.id}
                    fallback={ComponentErrorFallback}
                    isolate={true}
                    onError={(error) => console.error(`Repo ${repo.name} error:`, error)}
                  >
                    <RepositoryCard 
                      repository={repo}
                      onUnstar={handleUnstar}
                      isUnstarring={unstarringRepos.has(repo.id)}
                      showUnstarButton={true}
                    />
                  </ErrorBoundary>
                ))}
              </div>
            </ErrorBoundary>
          ) : activeTab === 'topics' ? (
            <ErrorBoundary 
              fallback={ComponentErrorFallback}
              isolate={true}
              onError={(error) => console.error('Topics error:', error)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic) => (
                  <ErrorBoundary 
                    key={topic.name}
                    fallback={ComponentErrorFallback}
                    isolate={true}
                    onError={(error) => console.error(`Topic ${topic.name} error:`, error)}
                  >
                    <TopicCard 
                      topic={topic}
                    />
                  </ErrorBoundary>
                ))}
              </div>
            </ErrorBoundary>
          ) : (
            <ErrorBoundary 
              fallback={ComponentErrorFallback}
              isolate={true}
              onError={(error) => console.error('User list error:', error)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <ErrorBoundary 
                    key={user.id}
                    fallback={ComponentErrorFallback}
                    isolate={true}
                    onError={(error) => console.error(`User ${user.login} error:`, error)}
                  >
                    <UserCard 
                      user={user} 
                      onUnfollow={activeTab === 'following' ? handleUnfollow : undefined}
                      isUnfollowing={unfollowingUsers.has(user.login)}
                      showUnfollowButton={activeTab === 'following'}
                      apiService={apiService}
                    />
                  </ErrorBoundary>
                ))}
              </div>
            </ErrorBoundary>
          )}
        </ErrorBoundary>

        {!isLoading && !isLoadingFollowers && !isLoadingStarred && !isLoadingTopics && !isCheckingMutualFollows && !isBulkUnstarring && 
         ((activeTab === 'starred' && filteredRepos.length === 0 && starredRepos.length > 0) ||
          (activeTab === 'topics' && filteredTopics.length === 0 && topics.length > 0) ||
          ((activeTab === 'following' || activeTab === 'followers') && filteredUsers.length === 0 && (activeTab === 'following' ? following.length > 0 : followers.length > 0))) && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {activeTab === 'starred' ? 'No repositories found matching your search.' : 
               activeTab === 'topics' ? 'No topics found matching your search.' : 
               'No users found matching your search.'}
            </p>
          </div>
        )}

        {!isLoading && !isLoadingFollowers && !isLoadingStarred && !isLoadingTopics && !isCheckingMutualFollows && !isBulkUnstarring && 
         ((activeTab === 'following' && following.length === 0) ||
          (activeTab === 'followers' && followers.length === 0) ||
          (activeTab === 'starred' && starredRepos.length === 0) ||
          (activeTab === 'topics' && topics.length === 0)) && (
          <div className="text-center py-12">
            {activeTab === 'following' ? (
              <>
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">You're not following anyone yet.</p>
              </>
            ) : activeTab === 'followers' ? (
              <>
                <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">You don't have any followers yet.</p>
              </>
            ) : activeTab === 'starred' ? (
              <>
                <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">You haven't starred any repositories yet.</p>
              </>
            ) : (
              <>
                <Hash className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No topics found. Try searching for topics like "javascript", "machine-learning", or "web-development".</p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};