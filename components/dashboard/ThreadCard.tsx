'use client';

import { ThreadData } from '@/lib/threadParser';

interface ThreadCardProps {
  thread: ThreadData;
  onClick?: () => void;
}

export default function ThreadCard({ thread, onClick }: ThreadCardProps) {
  const statusEmoji = getStatusEmoji(thread.status);
  const newMarker = thread.has_new ? ' ✨' : '';
  const ballMarker = thread.ball_owner !== 'Unknown' ? ' 🎾' : '';

  const formatTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-lg p-4 ring-1 ring-border hover:ring-accent transition-all cursor-pointer ${
        onClick ? 'hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <span>{statusEmoji}</span>
          <span>{thread.topic}</span>
          {newMarker && <span className="text-accent">{newMarker}</span>}
          {ballMarker && <span>{ballMarker}</span>}
        </h3>
      </div>

      {thread.last_title && (
        <p className="text-sm text-secondary mb-2 line-clamp-2">
          {thread.last_title}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-secondary">
        <span>
          Ball: <strong className="text-primary">{thread.ball_owner}</strong>
        </span>
        <span>Entries: {thread.entry_count}</span>
        <span>Last: {formatTimestamp(thread.last_update)}</span>
      </div>

      {thread.repo && (
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-xs text-secondary">Repo: {thread.repo}</span>
        </div>
      )}
    </div>
  );
}

function getStatusEmoji(status: string): string {
  const emojiMap: Record<string, string> = {
    OPEN: '🟢',
    IN_REVIEW: '🟡',
    BLOCKED: '🔴',
    CLOSED: '✅',
  };
  return emojiMap[status] || '❓';
}

