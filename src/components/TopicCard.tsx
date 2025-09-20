import React from 'react';
import { Hash, Star, Calendar, Award, ExternalLink } from 'lucide-react';
import { GitHubTopic } from '../types/github';

interface TopicCardProps {
  topic: GitHubTopic;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getTopicUrl = (topicName: string) => {
    return `https://github.com/topics/${topicName}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <Hash className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
              {topic.display_name || topic.name}
            </h3>
            {topic.featured && (
              <Award className="w-4 h-4 text-yellow-500" title="Featured topic" />
            )}
            {topic.curated && (
              <Star className="w-4 h-4 text-purple-500" title="Curated topic" />
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            #{topic.name}
          </p>
          {topic.short_description && (
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-3">
              {topic.short_description}
            </p>
          )}
        </div>
        <a
          href={getTopicUrl(topic.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-2"
          title="View topic on GitHub"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-4">
          {topic.created_by && (
            <div className="flex items-center space-x-1">
              <span>Created by {topic.created_by}</span>
            </div>
          )}
          {topic.score && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>{topic.score.toFixed(1)}</span>
            </div>
          )}
        </div>
        {topic.created_at && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(topic.created_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};