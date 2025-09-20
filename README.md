# GitHub Following Tracker

A beautiful React application to track and manage your GitHub following and followers lists using the GitHub REST API with CSV export functionality.

## Features

- **Complete Following & Followers Lists**: Fetches all GitHub accounts you're following and your followers with pagination
- **Detailed User Info**: Shows username, display name, bio, and statistics
- **CSV Export**: Download your following and followers data as CSV files for analysis
- **Real-time Search**: Filter users by username, display name, or bio
- **Rate Limit Monitoring**: Displays current API rate limit status
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Error Handling**: Comprehensive error handling for API failures

## GitHub API Details

### API Endpoint Used
- **Primary**: `GET /user/following` - Gets the list of users you're following
- **Secondary**: `GET /user/followers` - Gets the list of your followers
- **Detail**: `GET /users/{username}` - Gets detailed user information
- **Rate Limit**: `GET /rate_limit` - Monitors API usage

### CSV Export Features

The CSV export includes comprehensive user data:
- Username and Display Name
- Bio and Profile Information  
- Account Statistics (repos, followers, following)
- Profile URLs and Avatar URLs
- Account metadata (creation date, location, company, etc.)
- Hireable status and contact information

**File Format**: `username-github-following-YYYY-MM-DD.csv` or `username-github-followers-YYYY-MM-DD.csv`

### Authentication Setup

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "Following Tracker"
4. Select the **`user`** scope (required to access your following list)
5. Click "Generate token"
6. Copy the token immediately (you won't be able to see it again)

### API Considerations

- **Rate Limits**: 5,000 requests per hour for authenticated requests
- **Pagination**: GitHub returns max 100 users per request
- **Permissions**: Requires `user` scope to access your following list
- **Data Freshness**: Results are real-time from GitHub's API

### Sample Output Format

```json
{
  "login": "octocat",
  "name": "The Octocat",
  "bio": "GitHub's mascot and Git guru",
  "avatar_url": "https://github.com/images/error/octocat_happy.gif",
  "html_url": "https://github.com/octocat",
  "public_repos": 8,
  "followers": 4000,
  "following": 9
}
```

## Usage

1. Enter your GitHub Personal Access Token
2. Switch between Following and Followers tabs
3. View complete user lists with detailed information
4. Search and filter users by name or bio
5. Download data as CSV files for analysis
6. Click on external link icons to visit user profiles
7. Monitor your API rate limit in the header

## Error Handling

The application handles common issues:
- **Invalid Token**: Clear error message with setup instructions
- **Rate Limit Exceeded**: Shows current limit status
- **Network Errors**: Graceful fallback with retry options
- **Missing User Data**: Handles cases where user details can't be fetched

## Development

Built with:
- React 18 + TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- GitHub REST API v3
- CSV export functionality

The application is fully typed and includes comprehensive error handling for production use.