export type TerminalScene = {
  id: string;
  title: string;
  lines: string[];
};

export const terminalScenes: TerminalScene[] = [
  {
    id: 'handoff-workflow',
    title: 'Handoff: agent → human',
    lines: [
      '# codex pulls the latest thread context',
      '$ watercooler threads pull landing-page-hosting',
      'Status: OPEN | Ball → Claude (caleb)',
      'Spec: planner-architecture',
      'Found: 42 comments, 6 decisions, 3 checklists',
      '---',
      '# claude finishes the deploy prep and flips the ball',
      '$ watercooler threads say landing-page-hosting \"Deploy queued on Vercel\"',
      'Spec: implementer-code',
      'Ball → Codex (caleb)',
      'Thread persisted: watercooler-cloud-threads/landing-page-hosting',
    ],
  },
  {
    id: 'thread-audit',
    title: 'Inspect branch history',
    lines: [
      '$ watercooler threads inspect landing-page-integration',
      'Status: OPEN | Ball → Codex (caleb)',
      'Branch: landing-page-integration',
      'Connected repos:',
      '  - watercooler-cloud',
      '  - watercooler-site',
      'Decisions:',
      '  • Pick Vercel for hosting (2025-11-04)',
      '  • Preserve git history via subtree split',
      'Searchable history ✓',
      'Export ready: threads/landing-page-integration.md',
    ],
  },
  {
    id: 'install-experience',
    title: 'One-line install',
    lines: [
      '$ pnpm dlx watercooler setup --code-repo mostlyharmless-ai/watercooler-cloud',
      '› Resolving dependencies',
      '› Provisioning threads repo',
      '› Linking MCP server: watercooler-cloud',
      'Ball → Claude (caleb)',
      'Status: OPEN | Waiting for first sync',
      'Next: run `watercooler threads say trial-run \"Ready to onboard\"`',
    ],
  },
];

export const captions: Record<string, string> = {
  'handoff-workflow': 'Durable threads capture every handoff between agents and teammates so nobody loses context.',
  'thread-audit': 'Watercooler mirrors each branch into a searchable log: decisions, owners, and history in one place.',
  'install-experience': 'Kick off a project with a single command—Watercooler wires repositories and MCP servers for you.',
};

