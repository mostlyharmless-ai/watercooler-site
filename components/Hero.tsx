'use client';

import React from 'react';
import Container from './Container';
import { Button } from './Button';
import { copy } from '@/lib/copy';

interface HeroProps {
  onToggleTerminal: () => void;
  terminalOpen: boolean;
  onToggleVideo: () => void;
  videoOpen: boolean;
}

export default function Hero({ onToggleTerminal, terminalOpen, onToggleVideo, videoOpen }: HeroProps) {
  return (
    <section className="pb-16 md:pb-20" style={{ paddingTop: '4rem' }}>
      <Container className="text-center">
        <h1 className="mx-auto max-w-[24ch] text-primary">
          {copy.hero.headline}
        </h1>
        <p className="mx-auto mt-8 max-w-[60ch] text-lg md:text-xl text-secondary leading-relaxed">
          {copy.hero.subheadline}
        </p>

        <div
          className="mt-12 flex flex-col items-center gap-6"
          style={{ gap: '1rem' }}
        >
          <Button
            onClick={onToggleTerminal}
            variant="ghost"
            className="text-sm text-secondary hover:text-accent gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-accent/50 bg-surface/60 hover:bg-surface transition-all duration-200"
          >
            {terminalOpen ? '▾ Hide demo' : '▶ See it in action'}
          </Button>
          
          <Button
            onClick={onToggleVideo}
            variant="ghost"
            className="text-sm text-secondary hover:text-accent gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-accent/50 bg-surface/60 hover:bg-surface transition-all duration-200"
          >
            {videoOpen ? '▾ Hide video' : '▶ Watch demo'}
          </Button>
        </div>
      </Container>
    </section>
  );
}
