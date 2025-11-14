'use client';

import { useEffect, useState } from 'react';
import { ThreadData } from '@/lib/threadParser';
import ThreadList from '@/components/dashboard/ThreadList';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<ThreadData | null>(null);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard/threads');
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }
      const data = await response.json();
      setThreads(data.threads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchThreads, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && threads.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-secondary">Loading threads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error loading threads</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchThreads}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary mt-1">
            Manage your watercooler threads and collaborations
          </p>
        </div>
        <button
          onClick={fetchThreads}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {threads.length === 0 ? (
        <div className="bg-surface rounded-lg p-12 text-center ring-1 ring-border">
          <p className="text-secondary mb-4">
            No threads found. Start a conversation in your Watercooler threads repository.
          </p>
          <p className="text-sm text-secondary">
            Threads will appear here once you create them using the Watercooler MCP tools.
          </p>
        </div>
      ) : (
        <ThreadList
          threads={threads}
          onThreadClick={(thread) => setSelectedThread(thread)}
        />
      )}

      {/* Thread Detail Modal (placeholder for future implementation) */}
      {selectedThread && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedThread(null)}
        >
          <div
            className="bg-surface rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto ring-1 ring-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">{selectedThread.topic}</h2>
              <button
                onClick={() => setSelectedThread(null)}
                className="text-secondary hover:text-primary"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary">Status: {selectedThread.status}</p>
                <p className="text-sm text-secondary">Ball: {selectedThread.ball_owner}</p>
              </div>
              <div className="prose prose-sm max-w-none">
                <h3>Entries ({selectedThread.entry_count})</h3>
                {selectedThread.entries.map((entry, idx) => (
                  <div key={idx} className="border-b border-border pb-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <strong className="text-primary">{entry.author}</strong>
                      {entry.role && (
                        <span className="text-xs text-secondary">({entry.role})</span>
                      )}
                      {entry.timestamp && (
                        <span className="text-xs text-secondary">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {entry.title && (
                      <h4 className="font-semibold text-primary mb-2">{entry.title}</h4>
                    )}
                    <div className="text-secondary whitespace-pre-wrap">{entry.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

