'use client';

import React, { useState } from 'react';
import { copy } from '@/lib/copy';

const codeBlockClasses =
  'rounded-2xl ring-1 ring-border bg-code-bg/95 p-6 md:p-7 text-sm md:text-base leading-relaxed font-mono whitespace-pre-wrap break-words text-primary shadow-sm';

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
      className="animate-fade-in-up max-w-5xl mx-auto px-5 sm:px-6 md:px-10"
      style={{ animationDelay: '0.2s', opacity: 0 }}
    >
      <div className="rounded-[32px] border border-border/70 bg-white/95 shadow-xl shadow-slate-200/40 backdrop-blur-sm px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12 space-y-10">
        <header className="space-y-3">
          <h2 className="text-2xl md:text-3xl text-primary font-semibold tracking-tight">Get Started</h2>
          <p className="text-secondary text-base md:text-lg max-w-2xl">
            Two simple steps to clone the repo and wire the Watercooler MCP server into your AI client.
          </p>
        </header>

        <section className="space-y-5">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
              Step 1
            </span>
            <h3 className="text-xl md:text-2xl font-semibold text-primary">Clone & Install</h3>
            <p className="text-secondary text-sm md:text-base max-w-3xl">
              Grab the repository and install the server locally. The same command works for Claude, Codex, or the local dashboard.
            </p>
          </div>
          <pre className={`${codeBlockClasses}`}>{copy.quickstart.install}</pre>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
              Step 2
            </span>
            <h3 className="text-xl md:text-2xl font-semibold text-primary">Configure your AI client</h3>
            <p className="text-secondary text-sm md:text-base max-w-3xl">
              Pick the client you use and paste the snippet below. Tabs remember your last selection.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-border/70 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  activeTab === tab.id
                    ? 'bg-accent/12 text-accent'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeTab === 'claude' && (
              <article className="space-y-3">
                <p className="text-secondary text-sm md:text-base">Register the server with Claude Code CLI:</p>
                <pre className={codeBlockClasses}>{copy.quickstart.claudeCode}</pre>
              </article>
            )}

            {activeTab === 'codex' && (
              <article className="space-y-3">
                <p className="text-secondary text-sm md:text-base">Register the server with Codex CLI:</p>
                <pre className={codeBlockClasses}>{copy.quickstart.codex}</pre>
              </article>
            )}

            {activeTab === 'dashboard' && (
              <article className="space-y-3">
                <p className="text-secondary text-sm md:text-base">Run the local dashboard to inspect threads:</p>
                <pre className={codeBlockClasses}>{copy.quickstart.dashboard}</pre>
                <p className="text-secondary text-sm md:text-base">
                  Dashboard available at{' '}
                  <a
                    href="http://127.0.0.1:8080"
                    className="text-accent hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    http://127.0.0.1:8080
                  </a>
                </p>
              </article>
            )}
          </div>
        </section>

        <footer className="pt-6 border-t border-border/60">
          <p className="text-secondary text-sm md:text-base">
            Need more detail? Read the{' '}
            <a
              href="https://github.com/mostlyharmless-ai/watercooler-cloud/blob/main/docs/SETUP_AND_QUICKSTART.md"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              full setup guide
            </a>
            {' '}or the{' '}
            <a
              href="https://github.com/mostlyharmless-ai/watercooler-cloud/blob/main/docs/mcp-server.md"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              MCP server docs
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
