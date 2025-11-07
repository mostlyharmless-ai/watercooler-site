'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Section from './Section';
import { terminalScenes, TerminalScene, captions } from '@/lib/terminalScenes';

interface QuietTerminalProps {
  open: boolean;
  onClose: () => void;
}

export default function QuietTerminal({ open, onClose }: QuietTerminalProps) {
  const [currentSceneId, setCurrentSceneId] = useState('handoff-workflow');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const currentScene = terminalScenes.find((s: TerminalScene) => s.id === currentSceneId) || terminalScenes[0];
  const lines = currentScene.lines;
  const maxVisibleLines = 8;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setCurrentLineIndex(0);
      setDisplayedText('');
      setIsPlaying(true);
      return;
    }

    if (prefersReducedMotion) {
      setCurrentLineIndex(lines.length);
      setDisplayedText('');
      return;
    }

    if (!isPlaying || currentLineIndex >= lines.length) return;

    const currentLine = lines[currentLineIndex];
    const isBallFlip = currentLine.includes('Ball →');
    const isAgentEntry = currentLine.includes('[CODEX]') || currentLine.includes('[CLAUDE]');
    const isCommand = currentLine.startsWith('$');

    // Line-by-line scrolling - show entire line at once
    const delay = isBallFlip ? 700 : isAgentEntry ? 400 : isCommand ? 200 : 150;

    const timeout = setTimeout(() => {
      setCurrentLineIndex(currentLineIndex + 1);
      setDisplayedText('');
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentLineIndex, isPlaying, lines, prefersReducedMotion, open]);

  useEffect(() => {
    setCurrentLineIndex(0);
    setDisplayedText('');
    setIsPlaying(true);
  }, [currentSceneId]);

  const handleSceneChange = (sceneId: string) => {
    setCurrentSceneId(sceneId);
  };

  if (!open) return null;

  const displayedLines = lines.slice(0, currentLineIndex);
  const visibleLines = displayedLines.slice(-maxVisibleLines);

  const isBallFlipLine = (line: string) => line.includes('Ball →');
  const isAgentLine = (line: string) => line.includes('[CODEX]') || line.includes('[CLAUDE]');
  const isCodexLine = (line: string) => line.includes('[CODEX]');
  const isClaudeLine = (line: string) => line.includes('[CLAUDE]');

  const getLineClass = (line: string) => {
    if (line.startsWith('#')) return 'line-comment';
    if (line.includes('Ball →')) return 'line-ball';
    if (line.startsWith('Status:') || line.startsWith('Topic:')) return 'line-status';
    if (line.startsWith('---')) return 'line-separator';
    if (isAgentLine(line)) return 'line-agent';
    return '';
  };

  const formatLine = (line: string) => {
    // Color-code [CODEX] in amber/yellow
    if (line.includes('[CODEX]')) {
      const parts = line.split('[CODEX]');
      return (
        <>
          <span className="text-amber-400 font-semibold">[CODEX]</span>
          <span className="text-secondary">{parts[1]}</span>
        </>
      );
    }
    // Color-code [CLAUDE] in cyan/blue
    if (line.includes('[CLAUDE]')) {
      const parts = line.split('[CLAUDE]');
      return (
        <>
          <span className="text-cyan-400 font-semibold">[CLAUDE]</span>
          <span className="text-secondary">{parts[1]}</span>
        </>
      );
    }
    return line;
  };
  
  const currentCaption = captions[currentSceneId] || '';

  return (
    <Section className="py-12 md:py-16">
      {currentCaption && (
        <div className="text-center mb-6 text-secondary text-sm md:text-base max-w-2xl mx-auto">
          {currentCaption}
        </div>
      )}
      <div className="mx-auto w-full rounded-xl ring-1 ring-border bg-surface shadow-md group">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border/50">
          <div className="text-xs text-secondary font-medium">Terminal Demo</div>
          <div className="flex items-center gap-2">
            <select
              value={currentSceneId}
              onChange={(e) => handleSceneChange(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-md ring-1 ring-border bg-background text-primary cursor-pointer hover:ring-accent transition-colors"
            >
              {terminalScenes.map((scene: TerminalScene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="relative h-[300px] md:h-[350px] overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, #000, #000 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000, #000 92%, transparent)',
          }}
        >
          <div className="p-8 space-y-2 leading-relaxed font-mono text-sm">
            {visibleLines.map((line: string, index: number) => {
              const isCommand = line.startsWith('$');
              const isBallFlip = isBallFlipLine(line);
              const lineClass = getLineClass(line);
              const displayContent = line.replace('$ ', '');

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-start gap-2 ${lineClass}`}
                >
                  {isBallFlip && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-0.5 h-5 bg-accent rounded shrink-0"
                    />
                  )}
                  {isCommand && <span className="text-accent shrink-0">$</span>}
                  <span className={isCommand ? 'text-primary' : 'text-secondary pl-3'}>
                    {formatLine(displayContent)}
                  </span>
                </motion.div>
              );
            })}

            {currentLineIndex < lines.length && displayedText && (
              <div className={`flex items-start gap-2 ${getLineClass(lines[currentLineIndex])}`}>
                {isBallFlipLine(lines[currentLineIndex]) && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-0.5 h-5 bg-accent rounded shrink-0"
                  />
                )}
                {lines[currentLineIndex].startsWith('$') && <span className="text-accent shrink-0">$</span>}
                <span className={lines[currentLineIndex].startsWith('$') ? 'text-primary' : 'text-secondary pl-3'}>
                  {formatLine(displayedText.replace('$ ', ''))}
                </span>
                {!prefersReducedMotion && isPlaying && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-1.5 h-4 bg-accent ml-0.5"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
