import { GitHubUser, GitHubRepository, GitHubTopic, SearchFilters, SortOptions, UserWithFollowStatus } from '../types/github';

export function filterUsers(users: (GitHubUser | UserWithFollowStatus)[], filters: SearchFilters): (GitHubUser | UserWithFollowStatus)[] {
  return users.filter(user => {
    // Text search
    if (filters.text) {
      const searchTerm = filters.text.toLowerCase();
      const matchesText = 
        user.login.toLowerCase().includes(searchTerm) ||
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.bio && user.bio.toLowerCase().includes(searchTerm)) ||
        (user.location && user.location.toLowerCase().includes(searchTerm)) ||
        (user.company && user.company.toLowerCase().includes(searchTerm));
      
      if (!matchesText) return false;
    }

    // Follower count range
    if (filters.minFollowers !== undefined && user.followers < filters.minFollowers) return false;
    if (filters.maxFollowers !== undefined && user.followers > filters.maxFollowers) return false;

    // Following count range
    if (filters.minFollowing !== undefined && user.following < filters.minFollowing) return false;
    if (filters.maxFollowing !== undefined && user.following > filters.maxFollowing) return false;

    // Location filter
    if (filters.location && (!user.location || !user.location.toLowerCase().includes(filters.location.toLowerCase()))) return false;

    // Company filter
    if (filters.company && (!user.company || !user.company.toLowerCase().includes(filters.company.toLowerCase()))) return false;

    // Account type filter (basic implementation - GitHub API doesn't always provide this info clearly)
    if (filters.accountType === 'organization' && user.login && !user.login.toLowerCase().includes('org')) {
      // This is a basic heuristic; proper implementation would need additional API calls
    }

    // Date range filter
    if (filters.dateRange && user.created_at) {
      const createdDate = new Date(user.created_at);
      if (filters.dateRange.type === 'created') {
        if (createdDate < filters.dateRange.start || createdDate > filters.dateRange.end) return false;
      }
    }

    return true;
  });
}

export function filterRepositories(repos: GitHubRepository[], filters: SearchFilters): GitHubRepository[] {
  return repos.filter(repo => {
    // Text search
    if (filters.text) {
      const searchTerm = filters.text.toLowerCase();
      const matchesText = 
        repo.name.toLowerCase().includes(searchTerm) ||
        repo.full_name.toLowerCase().includes(searchTerm) ||
        repo.owner.login.toLowerCase().includes(searchTerm) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm)) ||
        (repo.language && repo.language.toLowerCase().includes(searchTerm));
      
      if (!matchesText) return false;
    }

    // Language filter
    if (filters.language && (!repo.language || !repo.language.toLowerCase().includes(filters.language.toLowerCase()))) return false;

    // Stars range
    if (filters.minStars !== undefined && repo.stargazers_count < filters.minStars) return false;
    if (filters.maxStars !== undefined && repo.stargazers_count > filters.maxStars) return false;

    // Forks range
    if (filters.minForks !== undefined && repo.forks_count < filters.minForks) return false;
    if (filters.maxForks !== undefined && repo.forks_count > filters.maxForks) return false;

    // Description filter
    if (filters.hasDescription !== undefined) {
      if (filters.hasDescription && !repo.description) return false;
      if (!filters.hasDescription && repo.description) return false;
    }

    // Archived filter
    if (filters.isArchived !== undefined && repo.archived !== filters.isArchived) return false;

    // Date range filter
    if (filters.dateRange) {
      let targetDate: Date;
      switch (filters.dateRange.type) {
        case 'created':
          targetDate = new Date(repo.created_at);
          break;
        case 'updated':
          targetDate = new Date(repo.updated_at);
          break;
        case 'pushed':
          targetDate = repo.pushed_at ? new Date(repo.pushed_at) : new Date(repo.updated_at);
          break;
      }
      
      if (targetDate < filters.dateRange.start || targetDate > filters.dateRange.end) return false;
    }

    return true;
  });
}

export function filterTopics(topics: GitHubTopic[], filters: SearchFilters): GitHubTopic[] {
  return topics.filter(topic => {
    // Text search
    if (filters.text) {
      const searchTerm = filters.text.toLowerCase();
      const matchesText = 
        topic.name.toLowerCase().includes(searchTerm) ||
        (topic.display_name && topic.display_name.toLowerCase().includes(searchTerm)) ||
        (topic.short_description && topic.short_description.toLowerCase().includes(searchTerm)) ||
        (topic.description && topic.description.toLowerCase().includes(searchTerm));
      
      if (!matchesText) return false;
    }

    return true;
  });
}

export function sortData<T extends GitHubUser | GitHubRepository | GitHubTopic>(
  data: T[], 
  sortOptions: SortOptions
): T[] {
  return [...data].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortOptions.field) {
      case 'followers':
        aValue = (a as GitHubUser).followers || 0;
        bValue = (b as GitHubUser).followers || 0;
        break;
      case 'following':
        aValue = (a as GitHubUser).following || 0;
        bValue = (b as GitHubUser).following || 0;
        break;
      case 'stars':
        aValue = (a as GitHubRepository).stargazers_count || 0;
        bValue = (b as GitHubRepository).stargazers_count || 0;
        break;
      case 'forks':
        aValue = (a as GitHubRepository).forks_count || 0;
        bValue = (b as GitHubRepository).forks_count || 0;
        break;
      case 'updated':
        aValue = new Date((a as GitHubRepository).updated_at || (a as GitHubUser).updated_at || 0);
        bValue = new Date((b as GitHubRepository).updated_at || (b as GitHubUser).updated_at || 0);
        break;
      case 'created':
        aValue = new Date((a as GitHubRepository).created_at || (a as GitHubUser).created_at || 0);
        bValue = new Date((b as GitHubRepository).created_at || (b as GitHubUser).created_at || 0);
        break;
      case 'name':
        aValue = ((a as GitHubRepository).name || (a as GitHubTopic).name || '').toLowerCase();
        bValue = ((b as GitHubRepository).name || (b as GitHubTopic).name || '').toLowerCase();
        break;
      case 'login':
        aValue = ((a as GitHubUser).login || '').toLowerCase();
        bValue = ((b as GitHubUser).login || '').toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
}

export function getDefaultFilters(): SearchFilters {
  return {
    text: '',
  };
}

export function getDefaultSortOptions(): SortOptions {
  return {
    field: 'followers',
    direction: 'desc'
  };
}

export function isFilterActive(filters: SearchFilters): boolean {
  return Boolean(
    filters.text ||
    filters.minFollowers !== undefined ||
    filters.maxFollowers !== undefined ||
    filters.minFollowing !== undefined ||
    filters.maxFollowing !== undefined ||
    filters.location ||
    filters.company ||
    filters.accountType ||
    filters.verified !== undefined ||
    filters.language ||
    filters.minStars !== undefined ||
    filters.maxStars !== undefined ||
    filters.minForks !== undefined ||
    filters.maxForks !== undefined ||
    filters.dateRange ||
    filters.hasDescription !== undefined ||
    filters.isArchived !== undefined ||
    filters.isFork !== undefined
  );
}

export function clearAllFilters(): SearchFilters {
  return getDefaultFilters();
}