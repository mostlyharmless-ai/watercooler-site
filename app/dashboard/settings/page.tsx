'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Github, Save, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [threadsBasePath, setThreadsBasePath] = useState('');
  const [defaultProjectId, setDefaultProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkGitHubConnection();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setThreadsBasePath(data.threadsBasePath || '');
        setDefaultProjectId(data.defaultProjectId || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkGitHubConnection = async () => {
    try {
      const response = await fetch('/api/mcp/credentials');
      setGithubConnected(response.ok);
    } catch (error) {
      setGithubConnected(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadsBasePath: threadsBasePath || null,
          defaultProjectId: defaultProjectId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReconnectGitHub = () => {
    window.location.href = '/api/auth/signin/github';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-secondary">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-secondary mt-1">Manage your account preferences</p>
      </div>

      {/* GitHub Connection */}
      <div className="bg-surface rounded-lg p-6 ring-1 ring-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Connection
            </h2>
            <p className="text-sm text-secondary mt-1">
              Connect your GitHub account to enable repository access
            </p>
          </div>
          <div className="flex items-center gap-3">
            {githubConnected ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Connected
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Not Connected
              </span>
            )}
          </div>
        </div>
        {!githubConnected && (
          <button
            onClick={handleReconnectGitHub}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Github className="w-4 h-4" />
            Connect GitHub
          </button>
        )}
        {githubConnected && (
          <button
            onClick={handleReconnectGitHub}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-primary rounded-lg hover:bg-surface/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reconnect GitHub
          </button>
        )}
      </div>

      {/* User Preferences */}
      <div className="bg-surface rounded-lg p-6 ring-1 ring-border">
        <h2 className="text-lg font-semibold text-primary mb-4">Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Threads Base Path
            </label>
            <input
              type="text"
              value={threadsBasePath}
              onChange={(e) => setThreadsBasePath(e.target.value)}
              placeholder={process.env.WATERCOOLER_THREADS_BASE || '~/.watercooler-threads'}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-secondary mt-1">
              Base directory where your threads repositories are stored
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Default Project ID
            </label>
            <input
              type="text"
              value={defaultProjectId}
              onChange={(e) => setDefaultProjectId(e.target.value)}
              placeholder="watercooler-cloud"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-secondary mt-1">
              Default project to use when not specified
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {message && (
            <div
              className={`px-4 py-2 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="bg-surface rounded-lg p-6 ring-1 ring-border">
        <h2 className="text-lg font-semibold text-primary mb-4">Account Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary">Name:</span>
            <span className="text-primary">{session?.user?.name || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Email:</span>
            <span className="text-primary">{session?.user?.email || 'Not set'}</span>
          </div>
          {(session?.user as any)?.githubUsername && (
            <div className="flex justify-between">
              <span className="text-secondary">GitHub:</span>
              <span className="text-primary">@{(session?.user as any).githubUsername}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

