'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import threadsData from '@/lib/generatedThreads.json';
import { parseMarkdownBlocks } from '@/lib/parseMarkdownBlocks';

interface QuietTerminalProps {
  open: boolean;
  onClose: () => void;
}

interface ThreadEntry {
  author: string;
  role: string;
  type: string;
  title: string;
  body: string;
  timestamp: string;
  isCodex: boolean;
  isClaude: boolean;
}

interface Thread {
  id: string;
  title: string;
  status?: string;
  ball?: string;
  topic?: string;
  created?: string;
  priority?: string;
  entries: ThreadEntry[];
}

export default function QuietTerminal({ open, onClose }: QuietTerminalProps) {
  const [currentThreadId, setCurrentThreadId] = useState(threadsData[0]?.id || '');
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastVisibleRef = useRef<HTMLDivElement>(null);

  const threads = threadsData as Thread[];
  const currentThread = threads.find((t: Thread) => t.id === currentThreadId) || threads[0];
  const entries = currentThread?.entries || [];

  // Reset when opening or changing threads
  useEffect(() => {
    if (open) {
      setCurrentEntryIndex(0);
      setCurrentBlockIndex(0);
      setIsPlaying(true);
    }
  }, [open, currentThreadId]);

  // Scroll animation - wait until content reaches BOTTOM before scrolling
  useEffect(() => {
    if (!scrollContainerRef.current || !lastVisibleRef.current) return;

    const container = scrollContainerRef.current;
    const lastVisible = lastVisibleRef.current;

    // Check if last visible content has reached the bottom of viewport
    const containerRect = container.getBoundingClientRect();
    const visibleRect = lastVisible.getBoundingClientRect();

    // Only scroll if the bottom of the last visible element is below the bottom of the container
    if (visibleRect.bottom > containerRect.bottom) {
      lastVisible.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [currentEntryIndex, currentBlockIndex]);

  // Block-by-block playback
  useEffect(() => {
    if (!isPlaying || !open || currentEntryIndex >= entries.length) return;

    const currentEntry = entries[currentEntryIndex];
    if (!currentEntry || !currentEntry.body) {
      // No body, move to next entry immediately
      const timeout = setTimeout(() => {
        setCurrentEntryIndex(currentEntryIndex + 1);
        setCurrentBlockIndex(0);
      }, 2500);
      return () => clearTimeout(timeout);
    }

    const bodyBlocks = parseMarkdownBlocks(currentEntry.body);

    if (currentBlockIndex < bodyBlocks.length) {
      // Random delay between 111ms and 200ms (5-9 blocks per second)
      const delay = Math.floor(Math.random() * 90) + 111; // 111-200ms

      const timeout = setTimeout(() => {
        setCurrentBlockIndex(currentBlockIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else {
      // All blocks shown, pause 2.5 seconds before next entry
      const timeout = setTimeout(() => {
        setCurrentEntryIndex(currentEntryIndex + 1);
        setCurrentBlockIndex(0);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [currentEntryIndex, currentBlockIndex, isPlaying, entries, open]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentEntryIndex < entries.length - 1) {
          setCurrentEntryIndex(currentEntryIndex + 1);
          setCurrentBlockIndex(0);
        } else if (currentEntryIndex < entries.length) {
          // Skip to end of current entry
          const currentEntry = entries[currentEntryIndex];
          if (currentEntry?.body) {
            const bodyBlocks = parseMarkdownBlocks(currentEntry.body);
            setCurrentBlockIndex(bodyBlocks.length);
          }
        }
      } else if (e.key === 'ArrowLeft' && currentEntryIndex > 0) {
        e.preventDefault();
        setCurrentEntryIndex(currentEntryIndex - 1);
        setCurrentBlockIndex(0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, isPlaying, currentEntryIndex, currentBlockIndex, entries]);

  const handleThreadChange = (threadId: string) => {
    setCurrentThreadId(threadId);
    setCurrentEntryIndex(0);
    setCurrentBlockIndex(0);
    setIsPlaying(true);
  };

  if (!open) return null;

  // Build list of entries to display
  const displayedEntries = entries.slice(0, currentEntryIndex + 1).map((entry, idx) => {
    if (idx < currentEntryIndex) {
      // Completed entries - show fully
      return { ...entry, visibleBlocks: entry.body ? parseMarkdownBlocks(entry.body).length : 0 };
    } else {
      // Current entry - show up to currentBlockIndex
      return { ...entry, visibleBlocks: currentBlockIndex };
    }
  });

  return (
    <div style={{ marginTop: '3rem', marginBottom: '5rem', padding: '0 1.5rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        {/* Clean card matching Get Started aesthetic */}
        <div
          className="card-hover"
          style={{
            background: '#FFFFFF',
            borderRadius: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.3s ease',
            overflow: 'hidden'
          }}
        >
          {/* Header with thread selector */}
          <div
            style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <h3 className="text-lg font-semibold text-primary" style={{ marginBottom: '0.25rem' }}>
                Live Thread Collaboration
              </h3>
              <p className="text-sm text-secondary" style={{ marginBottom: '0.25rem' }}>
                Real threads from watercooler-cloud development
              </p>
              <p className="text-sm text-secondary">
                If you decide to build on watercooler repo, these threads will get your agent up to speed in seconds.
              </p>
            </div>

            <select
              value={currentThreadId}
              onChange={(e) => handleThreadChange(e.target.value)}
              className="text-sm px-3 py-2 rounded-md border border-border bg-background text-primary cursor-pointer hover:border-accent transition-colors"
              style={{ minWidth: '200px' }}
            >
              {threads.map((thread: Thread) => (
                <option key={thread.id} value={thread.id}>
                  {thread.title}
                </option>
              ))}
            </select>
          </div>

          {/* Thread metadata */}
          {currentThread && (
            <div
              style={{
                padding: '1rem 2rem',
                background: 'rgba(15, 23, 42, 0.02)',
                borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
                fontSize: '0.875rem',
                color: '#64748b'
              }}
            >
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {currentThread.status && (
                  <span><strong>Status:</strong> {currentThread.status}</span>
                )}
                {currentThread.ball && (
                  <span><strong>Ball:</strong> {currentThread.ball}</span>
                )}
                {currentThread.priority && (
                  <span><strong>Priority:</strong> {currentThread.priority}</span>
                )}
                {currentThread.created && (
                  <span><strong>Created:</strong> {new Date(currentThread.created).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}

          {/* Scrollable thread content */}
          <div
            ref={scrollContainerRef}
            style={{
              height: '500px',
              overflowY: 'auto',
              padding: '2rem',
              background: '#FFFFFF'
            }}
          >
            <AnimatePresence>
              {displayedEntries.map((entry, index) => {
                const bodyBlocks = entry.body ? parseMarkdownBlocks(entry.body) : [];
                const visibleBodyBlocks = bodyBlocks.slice(0, entry.visibleBlocks);
                const isLastEntry = index === displayedEntries.length - 1;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginBottom: index < displayedEntries.length - 1 ? '2.5rem' : '0' }}
                  >
                    {/* Entry header - appears instantly */}
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '0.5rem',
                        background: entry.isClaude
                          ? 'rgba(59, 130, 246, 0.08)' // Blue for Claude
                          : entry.isCodex
                          ? 'rgba(139, 92, 246, 0.08)' // Purple for Codex
                          : 'rgba(15, 23, 42, 0.04)',
                        border: '1px solid ' + (
                          entry.isClaude
                            ? 'rgba(59, 130, 246, 0.2)'
                            : entry.isCodex
                            ? 'rgba(139, 92, 246, 0.2)'
                            : 'rgba(15, 23, 42, 0.1)'
                        ),
                        marginBottom: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {/* Agent badge */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: entry.isClaude
                              ? '#3b82f6'
                              : entry.isCodex
                              ? '#8b5cf6'
                              : '#64748b',
                            color: '#FFFFFF'
                          }}
                        >
                          {entry.author}
                        </span>

                        {/* Role & Type */}
                        <span className="text-secondary text-sm">
                          {entry.role && <span>{entry.role}</span>}
                          {entry.role && entry.type && <span> · </span>}
                          {entry.type && <span>{entry.type}</span>}
                        </span>

                        {/* Timestamp */}
                        <span className="text-secondary text-sm" style={{ marginLeft: 'auto' }}>
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Entry title */}
                      {entry.title && (
                        <h4 className="text-base font-semibold text-primary" style={{ marginTop: '0.75rem' }}>
                          {entry.title}
                        </h4>
                      )}
                    </div>

                    {/* Entry body - renders block-by-block */}
                    {visibleBodyBlocks.length > 0 && (
                      <div
                        ref={isLastEntry ? lastVisibleRef : null}
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.6',
                          color: '#64748b'
                        }}
                      >
                        {visibleBodyBlocks.map((block, blockIndex) => (
                          <ReactMarkdown
                            key={blockIndex}
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-lg font-semibold text-primary mt-4 mb-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-base font-semibold text-primary mt-3 mb-2" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-sm font-semibold text-primary mt-2 mb-1" {...props} />,
                              p: ({node, ...props}) => <p style={{ marginBottom: '0.75rem' }} {...props} />,
                              code: ({node, inline, ...props}: any) =>
                                inline ? (
                                  <code
                                    style={{
                                      display: 'inline',
                                      background: 'rgba(15, 23, 42, 0.08)',
                                      padding: '0.125rem 0.375rem',
                                      borderRadius: '0.25rem',
                                      fontSize: '0.85em',
                                      fontFamily: 'monospace',
                                      whiteSpace: 'nowrap'
                                    }}
                                    {...props}
                                  />
                                ) : (
                                  <code
                                    style={{
                                      display: 'block',
                                      background: 'rgba(15, 23, 42, 0.04)',
                                      padding: '0.75rem',
                                      borderRadius: '0.375rem',
                                      border: '1px solid rgba(15, 23, 42, 0.08)',
                                      fontSize: '0.85em',
                                      fontFamily: 'monospace',
                                      overflowX: 'auto',
                                      margin: '1rem 0'
                                    }}
                                    {...props}
                                  />
                                ),
                              ul: ({node, ...props}) => <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', marginBottom: '0.75rem' }} {...props} />,
                              ol: ({node, ...props}) => <ol style={{ listStyleType: 'decimal', paddingLeft: '1.25rem', marginBottom: '0.75rem' }} {...props} />,
                              li: ({node, ...props}) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                              a: ({node, ...props}) => <a className="text-accent hover:underline" {...props} />,
                              blockquote: ({node, ...props}) => (
                                <blockquote
                                  style={{
                                    borderLeft: '3px solid rgba(59, 130, 246, 0.3)',
                                    paddingLeft: '1rem',
                                    marginLeft: '0',
                                    marginBottom: '1rem',
                                    fontStyle: 'italic',
                                    color: '#64748b'
                                  }}
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {block}
                          </ReactMarkdown>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Loading indicator */}
            {isPlaying && currentEntryIndex < entries.length && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-secondary text-sm"
                >
                  {currentBlockIndex === 0 ? 'Loading next entry...' : 'Typing...'}
                </motion.div>
              </div>
            )}

            {/* End indicator */}
            {currentEntryIndex >= entries.length && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p className="text-secondary text-sm">
                  End of thread • <button onClick={() => { setCurrentEntryIndex(0); setCurrentBlockIndex(0); setIsPlaying(true); }} className="text-accent hover:underline">Replay</button>
                </p>
              </div>
            )}
          </div>

          {/* Controls footer */}
          <div
            style={{
              padding: '1rem 2rem',
              borderTop: '1px solid rgba(15, 23, 42, 0.1)',
              background: 'rgba(15, 23, 42, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              fontSize: '0.875rem'
            }}
          >
            <div className="text-secondary">
              Entry {Math.min(currentEntryIndex + 1, entries.length)} of {entries.length}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-sm px-3 py-1.5 rounded-md border border-border bg-background text-primary hover:border-accent transition-colors"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>

              <button
                onClick={() => { setCurrentEntryIndex(0); setCurrentBlockIndex(0); setIsPlaying(true); }}
                className="text-sm px-3 py-1.5 rounded-md border border-border bg-background text-primary hover:border-accent transition-colors"
              >
                ↺ Restart
              </button>

              <span className="text-secondary text-xs">
                Space: pause • ← →: navigate • Esc: close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
