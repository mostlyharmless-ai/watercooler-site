'use client';

import React, { useState, useEffect } from 'react';
import Container from './Container';

interface VideoProps {
  /** YouTube video ID (e.g., "dQw4w9WgXcQ") or full YouTube URL */
  youtubeId?: string;
  /** Direct video file path (e.g., "/videos/demo.mp4") */
  src?: string;
  /** Poster image for direct video uploads */
  poster?: string;
  /** Video title for accessibility */
  title?: string;
  /** Aspect ratio (default: 16/9) */
  aspectRatio?: number;
  /** Additional className */
  className?: string;
  /** Whether to autoplay (muted autoplay for YouTube) */
  autoplay?: boolean;
  /** Whether to show controls */
  controls?: boolean;
  /** Whether to loop */
  loop?: boolean;
  /** Whether to skip Container wrapper (useful for modals) */
  noContainer?: boolean;
}

/**
 * Video component that supports both YouTube embeds and direct video uploads.
 * 
 * @example
 * // YouTube embed (recommended)
 * <Video youtubeId="dQw4w9WgXcQ" title="Product Demo" />
 * 
 * @example
 * // Direct upload
 * <Video src="/videos/demo.mp4" poster="/images/video-poster.jpg" title="Product Demo" />
 */
export default function Video({
  youtubeId,
  src,
  poster,
  title = 'Video',
  aspectRatio = 16 / 9,
  className = '',
  autoplay = false,
  controls = true,
  loop = false,
  noContainer = false,
}: VideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract YouTube ID from URL if full URL is provided
  const getYouTubeId = (idOrUrl: string): string => {
    if (!idOrUrl) return '';
    
    // If it's already just an ID (no slashes or dots), return as-is
    if (!idOrUrl.includes('/') && !idOrUrl.includes('.')) {
      return idOrUrl;
    }
    
    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = idOrUrl.match(pattern);
      if (match) return match[1];
    }
    
    return idOrUrl;
  };

  const videoId = youtubeId ? getYouTubeId(youtubeId) : '';

  // Fallback: show video after 2 seconds even if onLoad doesn't fire
  useEffect(() => {
    if (videoId || src) {
      const timeout = setTimeout(() => {
        setIsLoaded(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [videoId, src]);

  if (!videoId && !src) {
    console.warn('Video component requires either youtubeId or src prop');
    return (
      <div className="w-full p-8 text-center bg-code-bg rounded-lg">
        <p className="text-secondary">Video source not provided</p>
      </div>
    );
  }

  // Debug log
  useEffect(() => {
    if (videoId) {
      console.log('Video component rendering with ID:', videoId);
      console.log('Video URL:', `https://www.youtube.com/embed/${videoId}`);
    }
  }, [videoId]);

  const videoContent = videoId ? (
    <div
      className="relative w-full overflow-hidden"
      style={{
        width: '100%',
        aspectRatio: `${aspectRatio}`,
        height: noContainer ? '500px' : undefined,
        minHeight: '400px',
        backgroundColor: '#FFFFFF',
        position: 'relative',
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1${
          autoplay ? '&autoplay=1&mute=1' : ''
        }${loop ? '&loop=1&playlist=' + videoId : ''}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full border-0"
        style={{
          width: '100%',
          height: '100%',
        }}
        onLoad={() => {
          console.log('YouTube iframe onLoad fired');
          setIsLoaded(true);
        }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-code-bg pointer-events-none z-10">
          <div className="text-secondary text-lg">Loading video...</div>
        </div>
      )}
    </div>
  ) : (
    <div
      className="relative w-full overflow-hidden bg-surface"
      style={{
        paddingBottom: `${(1 / aspectRatio) * 100}%`,
      }}
    >
      <video
        src={src}
        poster={poster}
        title={title}
        controls={controls}
        autoPlay={autoplay}
        loop={loop}
        muted={autoplay}
        playsInline
        className="absolute top-0 left-0 w-full h-full object-contain"
        onLoadedData={() => setIsLoaded(true)}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in',
        }}
      >
        Your browser does not support the video tag.
      </video>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-code-bg">
          <div className="text-secondary">Loading video...</div>
        </div>
      )}
    </div>
  );

  if (noContainer) {
    return (
      <div 
        className={`w-full ${className}`} 
        style={{ 
          minHeight: '400px', 
          position: 'relative',
          width: '100%',
          display: 'block',
        }}
      >
        {videoContent}
      </div>
    );
  }

  return (
    <Container className={className}>
      <div className="rounded-lg shadow-lg overflow-hidden">{videoContent}</div>
    </Container>
  );
}

