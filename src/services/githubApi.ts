import { GitHubUser, GitHubApiError, AuthConfig, GitHubRepository, GitHubRateLimit, GitHubTopic, GitHubTopicsSearchResponse } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubApiService {
  private config: AuthConfig;
  private userDetailCache: Map<string, { user: GitHubUser; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: AuthConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string): Promise<unknown> {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const error: GitHubApiError = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<GitHubUser> {
    return this.makeRequest('/user') as Promise<GitHubUser>;
  }

  async getUserDetails(username: string): Promise<GitHubUser | null> {
    // Check cache first
    const cached = this.userDetailCache.get(username);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      return cached.user;
    }

    try {
      const user = await this.makeRequest(`/users/${username}`) as GitHubUser;
      // Cache the result
      this.userDetailCache.set(username, { user, timestamp: Date.now() });
      return user;
    } catch {
      // If we can't fetch details, return null
      return null;
    }
  }

  async getFollowing(page: number = 1, perPage: number = 30): Promise<GitHubUser[]> {
    return this.makeRequest(`/user/following?page=${page}&per_page=${perPage}`) as Promise<GitHubUser[]>;
  }

  async getAllFollowing(): Promise<GitHubUser[]> {
    const allFollowing: GitHubUser[] = [];
    let page = 1;
    const perPage = 100; // Maximum allowed per page

    while (true) {
      const following = await this.getFollowing(page, perPage);
      
      if (following.length === 0) {
        break;
      }

      // Use basic user data from list endpoint - no additional API calls needed
      allFollowing.push(...following);
      
      if (following.length < perPage) {
        break; // Last page
      }
      
      page++;
    }

    return allFollowing;
  }

  async getFollowers(page: number = 1, perPage: number = 30): Promise<GitHubUser[]> {
    return this.makeRequest(`/user/followers?page=${page}&per_page=${perPage}`) as Promise<GitHubUser[]>;
  }

  async getAllFollowers(): Promise<GitHubUser[]> {
    const allFollowers: GitHubUser[] = [];
    let page = 1;
    const perPage = 100; // Maximum allowed per page

    while (true) {
      const followers = await this.getFollowers(page, perPage);
      
      if (followers.length === 0) {
        break;
      }

      // Use basic user data from list endpoint - no additional API calls needed
      allFollowers.push(...followers);
      
      if (followers.length < perPage) {
        break; // Last page
      }
      
      page++;
    }

    return allFollowers;
  }

  async getRateLimit(): Promise<GitHubRateLimit> {
    return this.makeRequest('/rate_limit') as Promise<GitHubRateLimit>;
  }

  async checkIfUserFollowsMe(username: string): Promise<boolean> {
    try {
      await this.makeRequest(`/user/following/${username}`);
      return true;
    } catch {
      // GitHub returns 404 if not following
      return false;
    }
  }

  async checkIfIAmFollowedBy(username: string): Promise<boolean> {
    try {
      // Check if the user follows me by checking if they appear in my followers list
      const response = await fetch(`${GITHUB_API_BASE}/users/${username}/following/${this.config.username || 'me'}`, {
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      return response.status === 204; // 204 means they follow me, 404 means they don't
    } catch {
      return false;
    }
  }

  async unfollowUser(username: string): Promise<void> {
    const response = await fetch(`${GITHUB_API_BASE}/user/following/${username}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const error: GitHubApiError = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message);
    }
  }

  async getStarredRepos(page: number = 1, perPage: number = 30): Promise<GitHubRepository[]> {
    return this.makeRequest(`/user/starred?page=${page}&per_page=${perPage}`) as Promise<GitHubRepository[]>;
  }

  async getAllStarredRepos(): Promise<GitHubRepository[]> {
    const allStarredRepos: GitHubRepository[] = [];
    let page = 1;
    const perPage = 100; // Maximum allowed per page

    while (true) {
      const starredRepos = await this.getStarredRepos(page, perPage);
      
      if (starredRepos.length === 0) {
        break;
      }

      allStarredRepos.push(...starredRepos);
      
      if (starredRepos.length < perPage) {
        break; // Last page
      }
      
      page++;
    }

    return allStarredRepos;
  }

  async unstarRepository(owner: string, repo: string): Promise<void> {
    const response = await fetch(`${GITHUB_API_BASE}/user/starred/${owner}/${repo}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const error: GitHubApiError = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message);
    }
  }

  async searchTopics(query: string, page: number = 1, perPage: number = 30): Promise<GitHubTopicsSearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    return this.makeRequest(`/search/topics?q=${encodedQuery}&page=${page}&per_page=${perPage}`) as Promise<GitHubTopicsSearchResponse>;
  }

  async getPopularTopics(): Promise<GitHubTopic[]> {
    try {
      // Search for featured topics (most popular/curated ones)
      const response = await this.searchTopics('is:featured', 1, 30);
      return response.items;
    } catch {
      // Fallback to general popular topics if featured search fails
      const response = await this.searchTopics('repositories:>1000', 1, 30);
      return response.items;
    }
  }
}