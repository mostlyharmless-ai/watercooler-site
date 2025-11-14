'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Github, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  if (status === 'loading') {
    return (
      <div className="inline-flex items-center rounded-lg bg-surface px-4 py-2 text-sm text-secondary">
        Loading...
      </div>
    );
  }

  if (session?.user) {
    const user = session.user as any;
    const displayName = user.name || user.githubUsername || user.email || 'User';

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="inline-flex items-center gap-2 rounded-lg bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-surface/80 ring-1 ring-border transition-all"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{displayName}</span>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg ring-1 ring-border py-1 z-50">
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-medium text-primary">{displayName}</p>
              {user.githubUsername && (
                <p className="text-xs text-secondary">@{user.githubUsername}</p>
              )}
            </div>
            <a
              href="/dashboard"
              className="block px-4 py-2 text-sm text-secondary hover:bg-surface/80 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/dashboard/settings"
              className="block px-4 py-2 text-sm text-secondary hover:bg-surface/80 transition-colors"
            >
              Settings
            </a>
            <button
              onClick={() => signOut({ redirectTo: '/' })}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:bg-surface/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => signIn('github', { redirectTo: '/onboarding' })}
        className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-2 font-medium hover:bg-accent-hover hover:scale-105 transition-all shadow-md"
        style={{ boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.3), 0 2px 4px -1px rgba(13, 148, 136, 0.2)' }}
      >
        <Github className="w-4 h-4" />
        Sign in
      </button>
    </div>
  );
}

