import { GitHubUser, GitHubRepository, GitHubTopic } from '../types/github';

export const convertToCSV = (data: GitHubUser[]): string => {
  if (data.length === 0) {
    return 'No data available';
  }

  // CSV headers
  const headers = [
    'Username',
    'Display Name',
    'Bio',
    'Profile URL',
    'Avatar URL',
    'Public Repos',
    'Followers',
    'Following',
    'Account ID',
    'Created At',
    'Updated At',
    'Location',
    'Company',
    'Blog',
    'Email',
    'Hireable'
  ];

  // Convert data to CSV rows
  const rows = data.map(user => [
    escapeCSVField(user.login),
    escapeCSVField(user.name || ''),
    escapeCSVField(user.bio || ''),
    escapeCSVField(user.html_url),
    escapeCSVField(user.avatar_url),
    user.public_repos?.toString() || '0',
    user.followers?.toString() || '0',
    user.following?.toString() || '0',
    user.id.toString(),
    escapeCSVField(user.created_at || ''),
    escapeCSVField(user.updated_at || ''),
    escapeCSVField(user.location || ''),
    escapeCSVField(user.company || ''),
    escapeCSVField(user.blog || ''),
    escapeCSVField(user.email || ''),
    (user.hireable !== null && user.hireable !== undefined) 
      ? user.hireable.toString() 
      : ''
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};

const escapeCSVField = (field: string): string => {
  if (field == null) return '';
  
  // Convert to string and escape quotes by doubling them
  const stringField = String(field).replace(/"/g, '""');
  
  // Wrap in quotes if the field contains comma, newline, or quote
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField}"`;
  }
  
  return stringField;
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const convertReposToCSV = (data: GitHubRepository[]): string => {
  if (data.length === 0) {
    return 'No data available';
  }

  // CSV headers
  const headers = [
    'Repository Name',
    'Full Name',
    'Owner',
    'Description',
    'Repository URL',
    'Language',
    'Stars',
    'Forks',
    'Created At',
    'Updated At',
    'Last Push',
    'Private',
    'Archived',
    'Disabled',
    'Repository ID'
  ];

  // Convert data to CSV rows
  const rows = data.map(repo => [
    escapeCSVField(repo.name),
    escapeCSVField(repo.full_name),
    escapeCSVField(repo.owner.login),
    escapeCSVField(repo.description || ''),
    escapeCSVField(repo.html_url),
    escapeCSVField(repo.language || ''),
    repo.stargazers_count.toString(),
    repo.forks_count.toString(),
    escapeCSVField(repo.created_at),
    escapeCSVField(repo.updated_at),
    escapeCSVField(repo.pushed_at || ''),
    repo.private.toString(),
    repo.archived.toString(),
    repo.disabled.toString(),
    repo.id.toString()
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};

export const convertTopicsToCSV = (data: GitHubTopic[]): string => {
  if (data.length === 0) {
    return 'No data available';
  }

  // CSV headers
  const headers = [
    'Topic Name',
    'Display Name',
    'Short Description',
    'Description',
    'Created By',
    'Created At',
    'Updated At',
    'Featured',
    'Curated',
    'Score',
    'Topic URL'
  ];

  // Convert data to CSV rows
  const rows = data.map(topic => [
    escapeCSVField(topic.name),
    escapeCSVField(topic.display_name || ''),
    escapeCSVField(topic.short_description || ''),
    escapeCSVField(topic.description || ''),
    escapeCSVField(topic.created_by || ''),
    escapeCSVField(topic.created_at || ''),
    escapeCSVField(topic.updated_at || ''),
    topic.featured ? 'true' : 'false',
    topic.curated ? 'true' : 'false',
    topic.score?.toString() || '',
    escapeCSVField(`https://github.com/topics/${topic.name}`)
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};

export const getCSVFilename = (type: 'following' | 'followers' | 'starred' | 'topics', username?: string): string => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const userPrefix = username ? `${username}-` : '';
  return `${userPrefix}github-${type}-${date}.csv`;
};