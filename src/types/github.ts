export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at?: string;
  updated_at?: string;
  location?: string;
  company?: string;
  blog?: string;
  email?: string;
  hireable?: boolean;
}

export interface GitHubApiError {
  message: string;
  documentation_url?: string;
}

export interface AuthConfig {
  token: string;
  username?: string;
}

export interface TokenStoragePreferences {
  rememberToken: boolean;
  storageType: 'localStorage' | 'sessionStorage' | 'memory';
  expiresInHours: number;
}

export interface AuthConfigWithStorage extends AuthConfig {
  storagePreferences?: TokenStoragePreferences;
}

export interface StoredTokenInfo {
  hasStoredToken: boolean;
  storageType?: TokenStoragePreferences['storageType'];
  storedAt?: number;
  expiresAt?: number;
  maskedToken?: string;
}

export interface UserWithFollowStatus extends GitHubUser {
  isFollowingMe?: boolean;
  isMutualFollow?: boolean;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  language?: string;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at?: string;
  private: boolean;
  archived: boolean;
  disabled: boolean;
}

export interface GitHubRateLimit {
  rate: {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  };
}

export interface GitHubTopic {
  name: string;
  display_name?: string;
  short_description?: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  featured?: boolean;
  curated?: boolean;
  score?: number;
}

export interface GitHubTopicsSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubTopic[];
}