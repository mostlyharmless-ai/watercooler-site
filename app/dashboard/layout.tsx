'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Settings, Home } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-surface border-r border-border min-h-screen p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-primary">Watercooler</h1>
            <p className="text-sm text-secondary mt-1">Dashboard</p>
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-secondary hover:bg-surface/80 hover:text-primary transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Threads</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-secondary hover:bg-surface/80 hover:text-primary transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-secondary hover:bg-surface/80 hover:text-primary transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </nav>

          <div className="mt-8 pt-8 border-t border-border">
            <div className="text-sm text-secondary">
              <p className="font-medium text-primary">
                {session.user?.name || session.user?.email}
              </p>
              {(session.user as any)?.githubUsername && (
                <p className="text-xs mt-1">
                  @{(session.user as any).githubUsername}
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

