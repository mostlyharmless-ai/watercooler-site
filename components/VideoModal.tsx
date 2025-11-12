'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Video from './Video';

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  youtubeId: string;
  title?: string;
}

export default function VideoModal({ open, onClose, youtubeId, title = 'Video Demo' }: VideoModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{ marginTop: '3rem', marginBottom: '5rem', padding: '0 1.5rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="card-hover"
          style={{
            background: '#FFFFFF',
            borderRadius: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Header with close button */}
          <div
            style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <h3 className="text-lg font-semibold text-primary" style={{ marginBottom: '0.25rem' }}>
                {title}
              </h3>
              <p className="text-sm text-secondary">
                Watch the Watercooler demo video
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-sm px-3 py-2 rounded-md border border-border bg-background text-primary cursor-pointer hover:border-accent transition-colors"
              aria-label="Close video"
            >
              Close
            </button>
          </div>

          {/* Video container */}
          <div style={{ padding: '0' }}>
            <Video youtubeId={youtubeId} title={title} noContainer />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

