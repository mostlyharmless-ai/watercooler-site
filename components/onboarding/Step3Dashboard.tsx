'use client';

import { LayoutDashboard, ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Step3DashboardProps {
  onComplete: () => void;
}

export default function Step3Dashboard({ onComplete }: Step3DashboardProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          You're All Set!
        </h2>
        <p className="text-secondary">
          Your dashboard is ready. Start managing your threads and collaborating with AI agents.
        </p>
      </div>

      <div className="bg-background rounded-lg p-6 ring-1 ring-border">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary mb-2">What's Next?</h3>
            <ul className="space-y-3 text-sm text-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-primary">View your threads</strong> - See all your active 
                  conversations and collaborations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-primary">Configure MCP servers</strong> - Set up your 
                  AI agents to use Watercooler tools
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-primary">Start collaborating</strong> - Create threads, 
                  pass context, and track decisions
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
        <h3 className="font-semibold text-primary mb-2">Quick Tips:</h3>
        <ul className="space-y-2 text-sm text-secondary list-disc list-inside">
          <li>Threads are stored in <code className="bg-background px-1 py-0.5 rounded">*-threads</code> repositories</li>
          <li>Use MCP tools like <code className="bg-background px-1 py-0.5 rounded">say</code>, <code className="bg-background px-1 py-0.5 rounded">ack</code>, and <code className="bg-background px-1 py-0.5 rounded">handoff</code> to manage threads</li>
          <li>Threads are branch-paired with your code repositories</li>
          <li>Visit Settings to customize your threads base path</li>
        </ul>
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-md"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

