'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Step1Welcome from '@/components/onboarding/Step1Welcome';
import Step2GitHub from '@/components/onboarding/Step2GitHub';
import Step3Dashboard from '@/components/onboarding/Step3Dashboard';
import Container from '@/components/Container';

// Make this page dynamic (no static generation)
export const dynamic = 'force-dynamic';

function OnboardingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Check if onboarding is already completed and sync GitHub token
    const checkOnboarding = async () => {
      try {
        // First, sync the GitHub token from Account to GitHubToken table
        // Wait for this to complete before checking credentials
        const syncResponse = await fetch('/api/auth/sync-token', { method: 'POST' });
        if (!syncResponse.ok) {
          console.warn('Token sync failed, but continuing...');
        }

        // Small delay to ensure token is available
        await new Promise(resolve => setTimeout(resolve, 500));

        // Then check onboarding status
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.onboardingCompleted) {
            router.push('/dashboard');
            return;
          }
        }

        // Check URL params for step (e.g., after GitHub redirect)
        const stepParam = searchParams.get('step');
        if (stepParam) {
          const step = parseInt(stepParam, 10);
          if (step >= 1 && step <= 3) {
            setCurrentStep(step);
            return; // Don't check credentials if step is explicitly set
          }
        }

        // Check if GitHub is already connected - if so, start at step 2
        // Retry a few times in case token sync is still processing
        let retries = 3;
        while (retries > 0) {
          try {
            const credentialsResponse = await fetch('/api/mcp/credentials');
            if (credentialsResponse.ok) {
              // GitHub is connected, advance to step 2
              setCurrentStep(2);
              return;
            }
          } catch (error) {
            // Retry after a short delay
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    if (session) {
      checkOnboarding();
    }
  }, [session, router, searchParams]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingCompleted: true }),
      });

      if (response.ok) {
        setOnboardingCompleted(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

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
      <Container className="py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex-1 h-2 rounded-full ${
                currentStep >= 1 ? 'bg-accent' : 'bg-surface'
              }`} />
              <div className={`flex-1 h-2 rounded-full mx-2 ${
                currentStep >= 2 ? 'bg-accent' : 'bg-surface'
              }`} />
              <div className={`flex-1 h-2 rounded-full ${
                currentStep >= 3 ? 'bg-accent' : 'bg-surface'
              }`} />
            </div>
            <div className="flex items-center justify-between text-sm text-secondary">
              <span className={currentStep >= 1 ? 'text-accent font-medium' : ''}>
                Welcome
              </span>
              <span className={currentStep >= 2 ? 'text-accent font-medium' : ''}>
                Connect GitHub
              </span>
              <span className={currentStep >= 3 ? 'text-accent font-medium' : ''}>
                Dashboard
              </span>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-surface rounded-2xl shadow-xl p-8 ring-1 ring-border">
            {currentStep === 1 && (
              <Step1Welcome onNext={handleNext} />
            )}
            {currentStep === 2 && (
              <Step2GitHub onNext={handleNext} />
            )}
            {currentStep === 3 && (
              <Step3Dashboard onComplete={handleComplete} />
            )}

            {onboardingCompleted && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  Welcome to Watercooler!
                </h2>
                <p className="text-secondary">Redirecting to your dashboard...</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-secondary">Loading...</div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

