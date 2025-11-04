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
    headline: 'Shared memory for your AI agents and human teammates.',
    subheadline:
      'Watercooler keeps long-running product work organized in durable threads so AI agents, operators, and customers stay aligned.',
    primaryCta: 'Open GitHub repo',
  },
  problem: {
    bullets: [
      {
        title: 'Context resets break momentum',
        description:
          'Most dev loops lose the conversation every time you hand work between agents or humans, forcing everyone to rebuild understanding.',
      },
      {
        title: 'Knowledge fragments across tools',
        description:
          'Specs live in docs, progress hides in chat, commits ship without history, making audits and onboarding painful.',
      },
      {
        title: 'No audit trail for agent work',
        description:
          'Teams can’t verify who did what, when, or why—blocking adoption of AI copilots in regulated or multi-stakeholder environments.',
      },
    ],
  },
  solution: {
    bullets: [
      'Durable threads mirror every branch so work stays inspectable and searchable forever.',
      'Structured handoffs capture status, assignees, and decisions—no more guesswork between humans and agents.',
      'Lightweight APIs let your MCP servers or bespoke bots plug in without re-architecting your stack.',
    ],
  },
  quickstart: {
    code: `pnpm dlx watercooler setup \\\n  --code-repo mostlyharmless-ai/watercooler-cloud \\\n  --threads-repo mostlyharmless-ai/watercooler-cloud-threads`,
  },
  footer: {
    tagline: 'Watercooler — persistent shared memory for product teams.',
  },
};

