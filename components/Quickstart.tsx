'use client';

import React, { useState } from 'react';
import { copy } from '@/lib/copy';
import { Terminal, Code, LayoutDashboard } from 'lucide-react';

type Tab = 'claude' | 'codex' | 'cursor' | 'dashboard';

export default function Quickstart() {
  const [activeTab, setActiveTab] = useState<Tab>('claude');

  const tabs = [
    { id: 'claude' as Tab, label: 'Claude Code', icon: Code },
    { id: 'codex' as Tab, label: 'Codex CLI', icon: Terminal },
    { id: 'cursor' as Tab, label: 'Cursor', icon: Code },
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', animationDelay: '0.2s', opacity: 0 }}>
      <div className="card-hover" style={{ background: '#FFFFFF', borderRadius: '1rem', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)', transition: 'all 0.3s ease' }}>

        <h2 className="text-2xl md:text-3xl text-primary font-semibold tracking-tight" style={{ marginBottom: '3rem' }}>
          Get Started
        </h2>

        <div>
          <h3 className="text-lg md:text-xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
            1. Configure Your Client
          </h3>

          {/* Tab Navigation */}
          <div className="flex gap-2" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(15, 23, 42, 0.1)', paddingBottom: '0.5rem' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-accent'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  <Icon style={{ width: '1rem', height: '1rem' }} strokeWidth={2} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'claude' && (
              <div>
                <p className="text-secondary text-sm md:text-base" style={{ marginBottom: '0.75rem' }}>
                  Register with Claude Code CLI:
                </p>
                <pre
                  className="font-mono text-sm md:text-base leading-relaxed text-primary overflow-x-auto"
                  style={{
                    background: 'rgba(15, 23, 42, 0.04)',
                    borderRadius: '0.5rem',
                    padding: '1.25rem',
                    border: '1px solid rgba(15, 23, 42, 0.08)'
                  }}
                >
                  {copy.quickstart.claudeCode}
                </pre>
              </div>
            )}

            {activeTab === 'codex' && (
              <div>
                <p className="text-secondary text-sm md:text-base" style={{ marginBottom: '0.75rem' }}>
                  Register with Codex CLI:
                </p>
                <pre
                  className="font-mono text-sm md:text-base leading-relaxed text-primary overflow-x-auto"
                  style={{
                    background: 'rgba(15, 23, 42, 0.04)',
                    borderRadius: '0.5rem',
                    padding: '1.25rem',
                    border: '1px solid rgba(15, 23, 42, 0.08)'
                  }}
                >
                  {copy.quickstart.codex}
                </pre>
              </div>
            )}

            {activeTab === 'cursor' && (
              <div>
                <p className="text-secondary text-sm md:text-base" style={{ marginBottom: '0.75rem' }}>
                  Edit your Cursor MCP configuration:
                </p>
                <pre
                  className="font-mono text-sm md:text-base leading-relaxed text-primary overflow-x-auto"
                  style={{
                    background: 'rgba(15, 23, 42, 0.04)',
                    borderRadius: '0.5rem',
                    padding: '1.25rem',
                    border: '1px solid rgba(15, 23, 42, 0.08)'
                  }}
                >
                  {copy.quickstart.cursor}
                </pre>
                <p className="text-secondary text-sm" style={{ marginTop: '0.75rem' }}>
                  <strong>Note:</strong> <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">uvx</code> must be in your PATH. If it's not found, use the full path (e.g., <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">~/.local/bin/uvx</code> on Linux/macOS).
                </p>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div>
                <p className="text-secondary text-sm md:text-base" style={{ marginBottom: '0.75rem' }}>
                  Launch the local dashboard:
                </p>
                <pre
                  className="font-mono text-sm md:text-base leading-relaxed text-primary overflow-x-auto"
                  style={{
                    background: 'rgba(15, 23, 42, 0.04)',
                    borderRadius: '0.5rem',
                    padding: '1.25rem',
                    border: '1px solid rgba(15, 23, 42, 0.08)'
                  }}
                >
                  {copy.quickstart.dashboard}
                </pre>
                <p className="text-secondary text-sm" style={{ marginTop: '0.75rem' }}>
                  View at{' '}
                  <a href="http://127.0.0.1:8080" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                    http://127.0.0.1:8080
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Documentation Links */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(15, 23, 42, 0.1)' }}>
          <p className="text-secondary text-sm">
            For more details, see the{' '}
            <a
              href="https://github.com/mostlyharmless-ai/watercooler-cloud/blob/main/docs/SETUP_AND_QUICKSTART.md"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              setup guide
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
            .
          </p>
        </div>
      </div>
    </div>
  );
}
