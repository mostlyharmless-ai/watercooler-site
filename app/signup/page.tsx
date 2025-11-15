'use client';

import { signIn } from 'next-auth/react';
import { Github } from 'lucide-react';
import Container from '@/components/Container';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  // Signup is the same as login - redirect to GitHub OAuth
  // NextAuth v5 uses redirectTo instead of callbackUrl
  const handleSignup = () => {
    signIn('github', { redirectTo: '/onboarding' });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container className="max-w-md w-full">
        <div className="bg-surface rounded-2xl shadow-xl p-8 ring-1 ring-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Get Started</h1>
            <p className="text-secondary">
              Create your account with GitHub to start using Watercooler
            </p>
          </div>

          <button
            onClick={handleSignup}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover hover:scale-105 transition-all shadow-md"
            style={{ boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.3), 0 2px 4px -1px rgba(13, 148, 136, 0.2)' }}
          >
            <Github className="w-5 h-5" />
            Sign up with GitHub
          </button>

          <div className="mt-6 space-y-3 text-sm text-secondary">
            <p className="font-medium text-primary">What you'll get:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Access to your personal dashboard</li>
              <li>Thread management across your repositories</li>
              <li>Secure GitHub integration</li>
              <li>Multi-agent collaboration tools</li>
            </ul>
          </div>

          <p className="mt-6 text-center text-xs text-secondary">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-accent hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </Container>
    </div>
  );
}

