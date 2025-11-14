'use client';

import { ThreadData } from '@/lib/threadParser';
import ThreadCard from './ThreadCard';
import { useState } from 'react';

interface ThreadListProps {
  threads: ThreadData[];
  onThreadClick?: (thread: ThreadData) => void;
}

export default function ThreadList({ threads, onThreadClick }: ThreadListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Group threads by status
  const statusGroups: Record<string, ThreadData[]> = {
    OPEN: [],
    IN_REVIEW: [],
    BLOCKED: [],
    CLOSED: [],
    OTHER: [],
  };

  threads.forEach(thread => {
    const status = thread.status;
    if (status in statusGroups) {
      statusGroups[status].push(thread);
    } else {
      statusGroups.OTHER.push(thread);
    }
  });

  // Filter threads
  const filteredThreads = threads.filter(thread => {
    const matchesStatus = statusFilter === 'ALL' || thread.status === statusFilter;
    const matchesSearch = 
      !searchQuery ||
      thread.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (thread.last_title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Re-group filtered threads
  const filteredGroups: Record<string, ThreadData[]> = {
    OPEN: [],
    IN_REVIEW: [],
    BLOCKED: [],
    CLOSED: [],
    OTHER: [],
  };

  filteredThreads.forEach(thread => {
    const status = thread.status;
    if (status in filteredGroups) {
      filteredGroups[status].push(thread);
    } else {
      filteredGroups.OTHER.push(thread);
    }
  });

  const activeCount = statusGroups.OPEN.length;
  const reviewCount = statusGroups.IN_REVIEW.length;
  const blockedCount = statusGroups.BLOCKED.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-surface rounded-lg p-4 ring-1 ring-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">
            {threads.length} total threads
          </h2>
          <div className="flex items-center gap-4 text-sm text-secondary">
            <span>{activeCount} active</span>
            <span>{reviewCount} in review</span>
            <span>{blockedCount} blocked</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="BLOCKED">Blocked</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Thread Groups */}
      {Object.entries(filteredGroups).map(([status, statusThreads]) => {
        if (statusThreads.length === 0) return null;

        return (
          <div key={status} className="space-y-3">
            <h3 className="text-md font-semibold text-primary flex items-center gap-2">
              <span>{getStatusEmoji(status)}</span>
              <span>{status}</span>
            </h3>
            <div className="grid gap-3">
              {statusThreads.map((thread) => (
                <ThreadCard
                  key={thread.topic}
                  thread={thread}
                  onClick={() => onThreadClick?.(thread)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {filteredThreads.length === 0 && (
        <div className="text-center py-12 text-secondary">
          <p>No threads found.</p>
          {searchQuery && (
            <p className="text-sm mt-2">Try adjusting your search or filter.</p>
          )}
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
    OTHER: '❓',
  };
  return emojiMap[status] || '❓';
}

