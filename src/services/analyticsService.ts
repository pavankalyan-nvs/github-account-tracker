import { 
  GitHubUser, 
  GitHubRepository, 
  UserWithFollowStatus,
  AnalyticsData,
  ChartData,
  LanguageStats,
  LocationStats,
  EngagementData,
  GrowthTrendData,
  DateRange,
  AnalyticsConfig
} from '../types/github';
import { subDays, format, startOfDay, differenceInDays } from 'date-fns';

export class AnalyticsService {
  
  private generateColorPalette(count: number): string[] {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
      '#14B8A6', '#F472B6', '#8B5CF6', '#EAB308', '#22C55E'
    ];
    
    if (count <= colors.length) {
      return colors.slice(0, count);
    }
    
    // Generate additional colors if needed
    const extraColors = [];
    for (let i = 0; i < count - colors.length; i++) {
      const hue = (i * 137.508) % 360; // Golden angle approximation for good distribution
      extraColors.push(`hsl(${hue}, 70%, 50%)`);
    }
    
    return [...colors, ...extraColors];
  }

  private simulateGrowthTrends(
    currentFollowing: number,
    currentFollowers: number,
    currentStarredRepos: number,
    dateRange: DateRange
  ): GrowthTrendData[] {
    const trends: GrowthTrendData[] = [];
    const days = differenceInDays(dateRange.end, dateRange.start);
    
    // Simulate historical growth with some realistic patterns
    for (let i = days; i >= 0; i--) {
      const date = subDays(dateRange.end, i);
      const progressRatio = (days - i) / days;
      
      // Simulate organic growth patterns
      const followingGrowth = Math.floor(currentFollowing * (0.3 + progressRatio * 0.7) + Math.random() * 10 - 5);
      const followerGrowth = Math.floor(currentFollowers * (0.2 + progressRatio * 0.8) + Math.random() * 8 - 4);
      const starredGrowth = Math.floor(currentStarredRepos * (0.1 + progressRatio * 0.9) + Math.random() * 15 - 7);
      
      trends.push({
        date: format(date, 'yyyy-MM-dd'),
        following: Math.max(0, followingGrowth),
        followers: Math.max(0, followerGrowth),
        starredRepos: Math.max(0, starredGrowth),
      });
    }
    
    return trends;
  }

  private createChartData(
    trends: GrowthTrendData[],
    field: 'following' | 'followers' | 'starredRepos',
    label: string,
    color: string
  ): ChartData {
    return {
      labels: trends.map(trend => format(new Date(trend.date), 'MMM dd')),
      datasets: [
        {
          label,
          data: trends.map(trend => trend[field]),
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }

  public analyzeLanguageDistribution(repositories: GitHubRepository[]): LanguageStats[] {
    const languageCounts = new Map<string, number>();
    let totalRepos = 0;

    repositories.forEach(repo => {
      const language = repo.language || 'Unknown';
      languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
      totalRepos++;
    });

    const colors = this.generateColorPalette(languageCounts.size);
    const languages: LanguageStats[] = [];

    let colorIndex = 0;
    languageCounts.forEach((count, language) => {
      languages.push({
        language,
        count,
        percentage: totalRepos > 0 ? (count / totalRepos) * 100 : 0,
        color: colors[colorIndex % colors.length],
      });
      colorIndex++;
    });

    return languages.sort((a, b) => b.count - a.count);
  }

  public analyzeGeographicDistribution(users: GitHubUser[]): LocationStats[] {
    const locationCounts = new Map<string, number>();
    let totalUsersWithLocation = 0;

    users.forEach(user => {
      if (user.location && user.location.trim()) {
        const cleanLocation = user.location.trim();
        locationCounts.set(cleanLocation, (locationCounts.get(cleanLocation) || 0) + 1);
        totalUsersWithLocation++;
      }
    });

    const locations: LocationStats[] = [];
    locationCounts.forEach((count, location) => {
      locations.push({
        location,
        count,
        percentage: totalUsersWithLocation > 0 ? (count / totalUsersWithLocation) * 100 : 0,
      });
    });

    return locations.sort((a, b) => b.count - a.count);
  }

  public calculateEngagementMetrics(
    following: UserWithFollowStatus[],
    followers: GitHubUser[]
  ): EngagementData {
    const mutualFollows = following.filter(user => user.isMutualFollow);
    const totalMutualFollows = mutualFollows.length;
    const mutualFollowPercentage = following.length > 0 ? (totalMutualFollows / following.length) * 100 : 0;

    // Calculate average followers per following
    const followersWithCount = following.filter(user => user.followers !== undefined);
    const averageFollowersPerFollowing = followersWithCount.length > 0
      ? followersWithCount.reduce((sum, user) => sum + (user.followers || 0), 0) / followersWithCount.length
      : 0;

    // Simulate top active followers (would need additional API calls for real data)
    const topActiveFollowers = followers.slice(0, 5);

    // Simulate inactive followers count (users who haven't been active recently)
    const inactiveFollowersCount = Math.floor(followers.length * 0.15); // Assume 15% inactive

    // Calculate follow back rate
    const followBackRate = followers.length > 0 ? (totalMutualFollows / followers.length) * 100 : 0;

    return {
      totalMutualFollows,
      mutualFollowPercentage,
      averageFollowersPerFollowing,
      topActiveFollowers,
      inactiveFollowersCount,
      followBackRate,
    };
  }

  public generateAnalytics(
    currentUser: GitHubUser,
    following: UserWithFollowStatus[],
    followers: GitHubUser[],
    starredRepos: GitHubRepository[],
    config: AnalyticsConfig
  ): AnalyticsData {
    
    // Generate growth trends (simulated since we don't have historical data)
    const growthTrends = this.simulateGrowthTrends(
      following.length,
      followers.length,
      starredRepos.length,
      config.dateRange
    );

    // Create chart data for different metrics
    const followingGrowth = this.createChartData(
      growthTrends,
      'following',
      'Following',
      '#3B82F6'
    );

    const followerGrowth = this.createChartData(
      growthTrends,
      'followers',
      'Followers',
      '#10B981'
    );

    const starredReposGrowth = this.createChartData(
      growthTrends,
      'starredRepos',
      'Starred Repositories',
      '#F59E0B'
    );

    // Analyze language distribution
    const languageDistribution = this.analyzeLanguageDistribution(starredRepos);
    const topLanguages = languageDistribution.slice(0, 10);

    // Analyze geographic distribution
    const geographicData = this.analyzeGeographicDistribution([...following, ...followers]);

    // Calculate engagement metrics
    const engagementMetrics = this.calculateEngagementMetrics(following, followers);

    // Calculate repository statistics
    const totalRepositoryStars = starredRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const averageStarsPerRepo = starredRepos.length > 0 ? totalRepositoryStars / starredRepos.length : 0;

    // Simulate time of day activity (would need actual activity data)
    const timeOfDayActivity: ChartData = {
      labels: ['0-2', '2-4', '4-6', '6-8', '8-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22', '22-24'],
      datasets: [{
        label: 'Activity',
        data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 10),
        backgroundColor: '#8B5CF620',
        borderColor: '#8B5CF6',
        borderWidth: 2,
      }],
    };

    const mutualFollowRate = engagementMetrics.mutualFollowPercentage;

    return {
      followingGrowth,
      followerGrowth,
      starredReposGrowth,
      mutualFollowRate,
      languageDistribution,
      geographicData,
      engagementMetrics,
      growthTrends,
      totalRepositoryStars,
      averageStarsPerRepo,
      topLanguages,
      timeOfDayActivity,
    };
  }

  public exportAnalyticsToCSV(analyticsData: AnalyticsData): string {
    const rows = [
      ['Metric', 'Value'],
      ['Mutual Follow Rate', `${analyticsData.mutualFollowRate.toFixed(2)}%`],
      ['Total Repository Stars', analyticsData.totalRepositoryStars.toString()],
      ['Average Stars Per Repo', analyticsData.averageStarsPerRepo.toFixed(2)],
      ['Total Mutual Follows', analyticsData.engagementMetrics.totalMutualFollows.toString()],
      ['Follow Back Rate', `${analyticsData.engagementMetrics.followBackRate.toFixed(2)}%`],
      ['Inactive Followers', analyticsData.engagementMetrics.inactiveFollowersCount.toString()],
      [''],
      ['Top Languages', 'Count', 'Percentage'],
      ...analyticsData.topLanguages.map(lang => [
        lang.language,
        lang.count.toString(),
        `${lang.percentage.toFixed(2)}%`
      ]),
      [''],
      ['Top Locations', 'Count', 'Percentage'],
      ...analyticsData.geographicData.slice(0, 10).map(loc => [
        loc.location,
        loc.count.toString(),
        `${loc.percentage.toFixed(2)}%`
      ]),
    ];

    return rows.map(row => row.join(',')).join('\n');
  }
}