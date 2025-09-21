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

export interface SearchFilters {
  text: string;
  minFollowers?: number;
  maxFollowers?: number;
  minFollowing?: number;
  maxFollowing?: number;
  location?: string;
  company?: string;
  accountType?: 'user' | 'organization';
  verified?: boolean;
  language?: string;
  minStars?: number;
  maxStars?: number;
  minForks?: number;
  maxForks?: number;
  dateRange?: {
    start: Date;
    end: Date;
    type: 'created' | 'updated' | 'pushed';
  };
  hasDescription?: boolean;
  isArchived?: boolean;
  isFork?: boolean;
}

export interface SortOptions {
  field: 'followers' | 'following' | 'stars' | 'forks' | 'updated' | 'created' | 'name' | 'login';
  direction: 'asc' | 'desc';
}

export interface SearchState {
  filters: SearchFilters;
  sort: SortOptions;
  searchHistory: string[];
  savedSearches: SavedSearch[];
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  sort: SortOptions;
  createdAt: Date;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface LanguageStats {
  language: string;
  count: number;
  percentage: number;
  color: string;
}

export interface LocationStats {
  location: string;
  count: number;
  percentage: number;
  countryCode?: string;
}

export interface EngagementData {
  totalMutualFollows: number;
  mutualFollowPercentage: number;
  averageFollowersPerFollowing: number;
  topActiveFollowers: GitHubUser[];
  inactiveFollowersCount: number;
  followBackRate: number;
}

export interface GrowthTrendData {
  date: string;
  following: number;
  followers: number;
  starredRepos: number;
  mutualFollows?: number;
}

export interface AnalyticsData {
  followingGrowth: ChartData;
  followerGrowth: ChartData;
  starredReposGrowth: ChartData;
  mutualFollowRate: number;
  languageDistribution: LanguageStats[];
  geographicData: LocationStats[];
  engagementMetrics: EngagementData;
  growthTrends: GrowthTrendData[];
  totalRepositoryStars: number;
  averageStarsPerRepo: number;
  topLanguages: LanguageStats[];
  timeOfDayActivity: ChartData;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AnalyticsConfig {
  dateRange: DateRange;
  includeHistoricalData: boolean;
  groupBy: 'day' | 'week' | 'month';
  showPredictions: boolean;
}