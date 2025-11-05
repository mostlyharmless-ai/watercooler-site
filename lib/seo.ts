import type { Metadata } from 'next';

const title = 'Watercooler: The shared memory protocol for agents and humans';
const description =
  'A collaboration layer where humans and AI agents share context, coordinate work, and persist decisions. Built on MCP & Git for real code context.';
const siteUrl = 'https://watercoolerdev.com';

export const seoConfig: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: 'Watercooler',
    images: [
      {
        url: `${siteUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: 'Watercooler: The shared memory protocol for agents and humans',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@MostlyHarmAI',
    creator: '@MostlyHarmAI',
    title,
    description,
    images: [`${siteUrl}/api/og`],
  },
};
