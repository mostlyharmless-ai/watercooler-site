type ProblemBullet = {
  title: string;
  description: string;
};

type Copy = {
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: string;
  };
  problem: {
    bullets: ProblemBullet[];
  };
  solution: {
    bullets: string[];
  };
  quickstart: {
    code: string;
  };
  footer: {
    tagline: string;
  };
};

export const urls = {
  github: 'https://github.com/mostlyharmless-ai/watercooler-cloud',
  docs: 'https://github.com/mostlyharmless-ai/watercooler-cloud/tree/main/docs',
  discord: 'https://github.com/mostlyharmless-ai/watercooler-cloud/discussions',
  twitter: 'https://x.com/MostlyHarmAI',
};

export const copy: Copy = {
  hero: {
    headline: 'Watercooler: The shared memory protocol for agents and humans.',
    subheadline:
      'A collaboration layer where humans and AI agents share context, coordinate work, and persist decisions.',
    primaryCta: 'Open GitHub repo',
  },
  problem: {
    bullets: [
      {
        title: 'Context loss',
        description: 'Agents forget prior decisions and constraints.',
      },
      {
        title: 'Handoff chaos',
        description: 'Work breaks across agent boundaries.',
      },
      {
        title: 'No shared memory',
        description: 'Chat logs aren't collaboration artifacts.',
      },
    ],
  },
  solution: {
    bullets: [
      'Structured threads instead of ephemeral chat',
      'Roles & status (OPEN → IN_REVIEW → CLOSED)',
      'Built on MCP & Git for real code context',
      'Decision graph across agents & repos',
    ],
  },
  quickstart: {
    code: `pnpm dlx watercooler setup \\\n  --code-repo mostlyharmless-ai/watercooler-cloud \\\n  --threads-repo mostlyharmless-ai/watercooler-cloud-threads`,
  },
  footer: {
    tagline: 'Watercooler — persistent shared memory for product teams.',
  },
};

