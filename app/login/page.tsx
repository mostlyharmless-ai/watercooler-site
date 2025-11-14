'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Github } from 'lucide-react';
import Container from '@/components/Container';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if onboarding is completed
      const checkOnboarding = async () => {
        try {
          setCheckingOnboarding(true);
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const data = await response.json();
            if (data.onboardingCompleted) {
              router.push('/dashboard');
            } else {
              router.push('/onboarding');
            }
          } else {
            // If preferences don't exist yet, go to onboarding
            router.push('/onboarding');
          }
        } catch (error) {
          console.error('Error checking onboarding:', error);
          // On error, default to onboarding
          router.push('/onboarding');
        } finally {
          setCheckingOnboarding(false);
        }
      };
      checkOnboarding();
    }
  }, [status, session, router]);

  // Show loading state while checking
  if (status === 'loading' || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  // Don't show login form if already authenticated (will redirect)
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-secondary">Redirecting...</div>
      </div>
    );
  }

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
            onClick={() => signIn('github', { callbackUrl: '/onboarding' })}
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

