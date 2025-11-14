'use client';

import { signIn } from 'next-auth/react';
import { Github } from 'lucide-react';
import Container from '@/components/Container';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container className="max-w-md w-full">
        <div className="bg-surface rounded-2xl shadow-xl p-8 ring-1 ring-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome to Watercooler</h1>
            <p className="text-secondary">
              Sign in to access your dashboard and manage your threads
            </p>
          </div>

          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover hover:scale-105 transition-all shadow-md"
            style={{ boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.3), 0 2px 4px -1px rgba(13, 148, 136, 0.2)' }}
          >
            <Github className="w-5 h-5" />
            Sign in with GitHub
          </button>

          <p className="mt-6 text-center text-sm text-secondary">
            By signing in, you agree to connect your GitHub account to Watercooler.
            We'll only access the repositories you grant permission to.
          </p>
        </div>
      </Container>
    </div>
  );
}

