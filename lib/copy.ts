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
    install: string;
    claudeCode: string;
    codex: string;
    dashboard: string;
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
        description: "Chat logs aren't collaboration artifacts.",
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
    install: `git clone https://github.com/mostlyharmless-ai/watercooler-cloud.git
cd watercooler-cloud
pip install -e .[mcp]`,
    claudeCode: `claude mcp add --transport stdio watercooler-cloud --scope user \\
  -e WATERCOOLER_AGENT="Claude@Code" \\
  -e WATERCOOLER_THREADS_PATTERN="https://github.com/{org}/{repo}-threads.git" \\
  -e WATERCOOLER_AUTO_BRANCH=1 \\
  -- python -m watercooler_mcp`,
    codex: `codex mcp add watercooler-cloud \\
  -e WATERCOOLER_AGENT="Codex" \\
  -e WATERCOOLER_THREADS_PATTERN="https://github.com/{org}/{repo}-threads.git" \\
  -e WATERCOOLER_AUTO_BRANCH=1 \\
  -- python -m watercooler_mcp`,
    dashboard: `python -m watercooler_dashboard.local_app`,
  },
  footer: {
    tagline: 'Watercooler — persistent shared memory for product teams.',
  },
};

