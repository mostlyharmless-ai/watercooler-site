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
    <div
      className="animate-fade-in-up max-w-4xl mx-auto px-6 md:px-8"
      style={{ animationDelay: '0.2s', opacity: 0 }}
    >
      <div className="bg-white/95 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 backdrop-blur-sm p-8 md:p-10 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl text-primary font-semibold tracking-tight">Get Started</h2>
          <p className="text-secondary text-base md:text-lg">
            Clone the repo and register the MCP server with your AI client.
          </p>
        </div>

        <div className="space-y-5">
          <h3 className="text-lg md:text-xl font-semibold text-primary">Step 1 · Clone and Install</h3>
          <pre className="rounded-2xl ring-1 ring-border bg-code-bg/90 p-5 md:p-6 text-sm md:text-base leading-7 font-mono overflow-x-auto text-primary shadow-sm">
            {copy.quickstart.install}
          </pre>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg md:text-xl font-semibold text-primary">Step 2 · Configure Your AI Client</h3>

          <div className="flex flex-wrap gap-2 border-b border-border/80 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent/10 text-accent'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {activeTab === 'claude' && (
              <div className="space-y-3">
                <p className="text-secondary text-sm">Register the MCP server with Claude Code CLI:</p>
                <pre className="rounded-2xl ring-1 ring-border bg-code-bg/90 p-5 md:p-6 text-sm md:text-base leading-7 font-mono overflow-x-auto text-primary shadow-sm">
                  {copy.quickstart.claudeCode}
                </pre>
              </div>
            )}

            {activeTab === 'codex' && (
              <div className="space-y-3">
                <p className="text-secondary text-sm">Register the MCP server with Codex CLI:</p>
                <pre className="rounded-2xl ring-1 ring-border bg-code-bg/90 p-5 md:p-6 text-sm md:text-base leading-7 font-mono overflow-x-auto text-primary shadow-sm">
                  {copy.quickstart.codex}
                </pre>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-3">
                <p className="text-secondary text-sm">Launch the local dashboard to view and manage threads:</p>
                <pre className="rounded-2xl ring-1 ring-border bg-code-bg/90 p-5 md:p-6 text-sm md:text-base leading-7 font-mono overflow-x-auto text-primary shadow-sm">
                  {copy.quickstart.dashboard}
                </pre>
                <p className="text-secondary text-sm">
                  Dashboard will be available at{' '}
                  <a
                    href="http://127.0.0.1:8080"
                    className="text-accent hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    http://127.0.0.1:8080
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-border/70">
          <p className="text-secondary text-sm md:text-base">
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
