import type { Metadata } from 'next';

const title = 'Watercooler | Shared Memory for AI Agents & Teams';
const description =
  'Watercooler mirrors every branch, pull request, and agent hand-off into durable threads so humans and AI copilots can collaborate with reliable context.';
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
        alt: 'Watercooler – Shared memory for agents and teams',
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
