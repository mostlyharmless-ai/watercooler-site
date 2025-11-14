'use client';

import { Sparkles, GitBranch, Users, Zap } from 'lucide-react';

interface Step1WelcomeProps {
  onNext: () => void;
}

export default function Step1Welcome({ onNext }: Step1WelcomeProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Welcome to Watercooler
        </h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          A shared memory protocol for AI agents and humans. Keep context, coordinate work, 
          and persist decisions—all built on Model Context Protocol & Git.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 my-8">
        <div className="bg-background rounded-lg p-6 ring-1 ring-border">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
            <GitBranch className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-semibold text-primary mb-2">Branch-Paired Context</h3>
          <p className="text-sm text-secondary">
            Discussions travel with your code branches, keeping context aligned.
          </p>
        </div>

        <div className="bg-background rounded-lg p-6 ring-1 ring-border">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-semibold text-primary mb-2">Multi-Agent Collaboration</h3>
          <p className="text-sm text-secondary">
            Humans and AI agents pass context, hand off work, and leave durable notes.
          </p>
        </div>

        <div className="bg-background rounded-lg p-6 ring-1 ring-border">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-semibold text-primary mb-2">Local-First & Git-Backed</h3>
          <p className="text-sm text-secondary">
            Works offline, syncs when you push. Zero lock-in, full control.
          </p>
        </div>
      </div>

      <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary mb-2">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-secondary list-disc list-inside">
              <li>Persistent memory layer for your development workflow</li>
              <li>Clean handoffs between humans and AI agents</li>
              <li>Decision tracking that doesn't evaporate with chat windows</li>
              <li>Branch-paired threads that stay with your code</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={onNext}
          className="px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-md"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

