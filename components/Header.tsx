'use client';

import React, { useState, useEffect } from 'react';
import Container from './Container';
import { urls, copy } from '@/lib/copy';
import { Github } from 'lucide-react';
import AuthButton from './AuthButton';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ${isScrolled ? 'bg-surface/80 shadow-lg' : 'bg-background/60'}`} style={{ borderBottom: isScrolled ? '1px solid rgba(209, 213, 219, 0.3)' : 'none' }}>
      <Container className="flex items-center justify-between h-16">
        <a href="/" className="font-semibold text-primary hover:text-accent transition-colors">
          Watercooler
        </a>
        <nav className="flex items-center gap-3 text-sm">
          <a 
            href={urls.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-secondary hover:text-accent bg-surface hover:bg-surface/80 ring-1 ring-border hover:ring-accent hover:scale-105 no-underline transition-all shadow-sm"
          >
            <Github className="w-4 h-4" />
          </a>
          <AuthButton />
        </nav>
      </Container>
    </header>
  );
}
