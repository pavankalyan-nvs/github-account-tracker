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
    <div className="card-base hover:translate-y-[-2px] hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Hash className="w-5 h-5 text-accent-blue flex-shrink-0" />
            <h3 className="text-lg font-semibold text-dark-text-primary truncate">
              {topic.display_name || topic.name}
            </h3>
            {topic.featured && (
              <Award className="w-4 h-4 text-accent-yellow flex-shrink-0" title="Featured topic" aria-label="Featured topic" />
            )}
            {topic.curated && (
              <Star className="w-4 h-4 text-accent-purple fill-current flex-shrink-0" title="Curated topic" aria-label="Curated topic" />
            )}
          </div>
          <p className="text-sm text-dark-text-tertiary mb-1">
            #{topic.name}
          </p>
          {topic.short_description && (
            <p className="text-sm text-dark-text-secondary line-clamp-2 mb-3">
              {topic.short_description}
            </p>
          )}
        </div>
        <a
          href={getTopicUrl(topic.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="icon-btn ml-2 flex-shrink-0"
          aria-label="View topic on GitHub"
          title="View topic on GitHub"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="flex items-center justify-between text-sm text-dark-text-tertiary flex-wrap gap-2">
        <div className="flex items-center gap-4">
          {topic.created_by && (
            <div className="flex items-center gap-1">
              <span className="text-xs">Created by {topic.created_by}</span>
            </div>
          )}
          {topic.score && (
            <div className="flex items-center gap-1" title="Topic score">
              <Star className="w-4 h-4 text-accent-yellow" />
              <span>{topic.score.toFixed(1)}</span>
            </div>
          )}
        </div>
        {topic.created_at && (
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {formatDate(topic.created_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};