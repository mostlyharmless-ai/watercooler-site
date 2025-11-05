import { urls } from '@/lib/copy';

export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Watercooler',
    description:
      'A collaboration layer where humans and AI agents share context, coordinate work, and persist decisions.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux, macOS, Windows',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'MostlyHarmless AI',
      url: 'https://github.com/mostlyharmless-ai',
    },
    codeRepository: urls.github,
    programmingLanguage: 'Python',
    license: 'https://opensource.org/licenses/MIT',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
