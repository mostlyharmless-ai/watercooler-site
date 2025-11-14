'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Step1Welcome from '@/components/onboarding/Step1Welcome';
import Step2GitHub from '@/components/onboarding/Step2GitHub';
import Step3Dashboard from '@/components/onboarding/Step3Dashboard';
import Container from '@/components/Container';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Check if onboarding is already completed
    const checkOnboarding = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.onboardingCompleted) {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    if (session) {
      checkOnboarding();
    }
  }, [session, router]);

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

