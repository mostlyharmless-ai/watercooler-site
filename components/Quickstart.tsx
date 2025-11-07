'use client';

import React, { useState } from 'react';
import { copy } from '@/lib/copy';

type Tab = 'claude' | 'codex' | 'dashboard';

export default function Quickstart() {
  const [activeTab, setActiveTab] = useState<Tab>('claude');

  const tabs = [
    { id: 'claude' as Tab, label: 'Claude Code' },
    { id: 'codex' as Tab, label: 'Codex CLI' },
    { id: 'dashboard' as Tab, label: 'Local Dashboard' },
  ];

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', animationDelay: '0.2s', opacity: 0 }}>
      <div className="card-hover" style={{ background: '#FFFFFF', borderRadius: '1rem', padding: '2rem 2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)', transition: 'all 0.3s ease' }}>
        <h2 className="text-2xl md:text-3xl mb-4 text-primary font-semibold tracking-tight">Get Started</h2>
        <p className="text-secondary mb-6 text-base">Clone the repo and register the MCP server with your AI client</p>

        {/* Step 1: Clone and Install */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-primary mb-3">Step 1: Clone and Install</h3>
          <pre className="rounded-xl ring-1 ring-border bg-code-bg p-6 text-sm md:text-base leading-7 font-mono overflow-x-auto text-primary shadow-sm hover:ring-accent/50 transition-all">
            {copy.quickstart.install}
          </pre>
        </div>

        {/* Step 2: Configure MCP Client */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">Step 2: Configure Your AI Client</h3>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-accent'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'claude' && (
              <div>
                <p className="text-secondary text-sm mb-3">Register the MCP server with Claude Code CLI:</p>
                <pre className="rounded-xl ring-1 ring-border bg-code-bg p-6 text-sm md:text-base leading-7 font-mono overflow-x-auto text-primary shadow-sm hover:ring-accent/50 transition-all">
                  {copy.quickstart.claudeCode}
                </pre>
              </div>
            )}

            {activeTab === 'codex' && (
              <div>
                <p className="text-secondary text-sm mb-3">Register the MCP server with Codex CLI:</p>
                <pre className="rounded-xl ring-1 ring-border bg-code-bg p-6 text-sm md:text-base leading-7 font-mono overflow-x-auto text-primary shadow-sm hover:ring-accent/50 transition-all">
                  {copy.quickstart.codex}
                </pre>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div>
                <p className="text-secondary text-sm mb-3">Launch the local dashboard to view and manage threads:</p>
                <pre className="rounded-xl ring-1 ring-border bg-code-bg p-6 text-sm md:text-base leading-7 font-mono overflow-x-auto text-primary shadow-sm hover:ring-accent/50 transition-all">
                  {copy.quickstart.dashboard}
                </pre>
                <p className="text-secondary text-sm mt-3">
                  Dashboard will be available at{' '}
                  <a href="http://127.0.0.1:8080" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                    http://127.0.0.1:8080
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-secondary text-sm">
            Need more details? Check the{' '}
            <a
              href="https://github.com/mostlyharmless-ai/watercooler-cloud/blob/main/docs/SETUP_AND_QUICKSTART.md"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              full setup guide
            </a>
            {' '}or{' '}
            <a
              href="https://github.com/mostlyharmless-ai/watercooler-cloud/blob/main/docs/mcp-server.md"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              MCP server docs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
