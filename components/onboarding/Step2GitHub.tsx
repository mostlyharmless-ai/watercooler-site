'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Github, CheckCircle, AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface Step2GitHubProps {
  onNext: () => void;
  sessionReady: boolean;
}

export default function Step2GitHub({ onNext, sessionReady }: Step2GitHubProps) {
  const [githubConnected, setGithubConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelays = [0, 2000, 5000, 10000, 15000];

  const clearRetryTimeout = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!sessionReady) {
      setChecking(true);
      setGithubConnected(false);
      setLastError(null);
      clearRetryTimeout();
      return;
    }
    setAttempt(0);
    setLastError(null);
  }, [sessionReady]);

  const scheduleRetry = useCallback(
    (nextAttempt: number) => {
      clearRetryTimeout();
      const delay = retryDelays[Math.min(nextAttempt, retryDelays.length - 1)];
      retryTimeoutRef.current = setTimeout(() => {
        setAttempt(nextAttempt);
      }, delay);
    },
    [retryDelays]
  );

  const checkGitHubConnection = useCallback(async () => {
    if (!sessionReady) {
      return;
    }

    try {
      setChecking(true);
      // First, try to sync the token (in case it's not synced yet)
      const syncResponse = await fetch('/api/auth/sync-token', { method: 'POST' });
      if (!syncResponse.ok) {
        throw new Error('Waiting for GitHub token to sync');
      }

      // Small delay to ensure token is persisted
      await new Promise(resolve => setTimeout(resolve, 300));

      // Then check if credentials are available
      const response = await fetch('/api/mcp/credentials');
      if (response.ok) {
        setGithubConnected(true);
        setChecking(false);
        setLastError(null);
        clearRetryTimeout();
        setTimeout(() => {
          onNext();
        }, 1000);
      } else {
        throw new Error('Credentials not ready yet');
      }
    } catch (error) {
      setGithubConnected(false);
      setChecking(false);
      setLastError(error instanceof Error ? error.message : 'Still waiting for GitHub authorization');
      const nextAttempt = attempt + 1;
      if (nextAttempt < retryDelays.length) {
        scheduleRetry(nextAttempt);
      }
    }
  }, [attempt, onNext, retryDelays, scheduleRetry, sessionReady]);

  useEffect(() => {
    if (!sessionReady) {
      return;
    }
    checkGitHubConnection();
  }, [sessionReady, attempt, checkGitHubConnection]);

  useEffect(() => () => clearRetryTimeout(), []);

  const handleConnectGitHub = () => {
    // Redirect to onboarding with step 2 in the URL so we can restore state
    // NextAuth v5 uses redirectTo instead of callbackUrl
    signIn('github', { redirectTo: '/onboarding?step=2' });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Connect Your GitHub Account
        </h2>
        <p className="text-secondary">
          Watercooler needs access to your GitHub repositories to manage threads
        </p>
      </div>

      <div className="bg-background rounded-lg p-6 ring-1 ring-border">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Github className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary mb-2">Why GitHub?</h3>
            <p className="text-sm text-secondary mb-4">
              We use GitHub OAuth to securely access your repositories. This allows us to:
            </p>
            <ul className="space-y-2 text-sm text-secondary list-disc list-inside mb-4">
              <li>Create and manage thread repositories</li>
              <li>Sync threads with your code branches</li>
              <li>Enable MCP servers to access your repositories</li>
            </ul>
            <p className="text-xs text-secondary">
              We only request the minimum permissions needed and never store your password.
            </p>
          </div>
        </div>
      </div>

      {checking ? (
        <div className="text-center py-8">
          <div className="text-secondary">Checking connection...</div>
        </div>
      ) : githubConnected ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-green-800">GitHub Connected!</h3>
          </div>
          <p className="text-sm text-green-700 mb-4">
            Your GitHub account is successfully connected. You can now proceed to the dashboard.
          </p>
          <button
            onClick={onNext}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Not Connected</h3>
            </div>
            <p className="text-sm text-yellow-700">
              Please connect your GitHub account to continue.
            </p>
            {lastError && (
              <p className="text-xs text-yellow-600 mt-2">
                {lastError} — retrying automatically.
              </p>
            )}
          </div>

          <button
            onClick={handleConnectGitHub}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-md"
          >
            <Github className="w-5 h-5" />
            Connect with GitHub
          </button>
        </div>
      )}
    </div>
  );
}


