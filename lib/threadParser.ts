import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';

export interface ThreadEntry {
  meta: Record<string, string>;
  body: string;
  author: string | null;
  actor: string | null;
  timestamp: string | null;
  title: string | null;
  role: string | null;
  type: string | null;
  spec: string | null;
  is_new: boolean;
}

export interface ThreadData {
  topic: string;
  title: string;
  status: string;
  priority: string;
  ball_owner: string;
  spec: string | null;
  created: string | null;
  last_update: string | null;
  entry_count: number;
  has_new: boolean;
  file_path: string;
  last_title: string | null;
  metadata: Record<string, string>;
  header_order: string[];
  entries: ThreadEntry[];
  repo?: string;
}

export class ThreadParser {
  private threadsBase: string;

  constructor(threadsBase?: string) {
    this.threadsBase = this.resolveThreadsBase(threadsBase);
  }

  private resolveThreadsBase(threadsBase?: string): string {
    if (threadsBase) {
      return threadsBase;
    }
    const envBase = process.env.WATERCOOLER_THREADS_BASE;
    if (envBase) {
      return envBase;
    }
    return join(process.env.HOME || process.env.USERPROFILE || '', '.watercooler-threads');
  }

  async listRepositories(): Promise<string[]> {
    try {
      const entries = await readdir(this.threadsBase, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory() && entry.name.endsWith('-threads'))
        .map(entry => entry.name)
        .sort();
    } catch (error) {
      return [];
    }
  }

  private repoDisplayName(repoPath: string): string {
    const name = repoPath.split(/[/\\]/).pop() || repoPath;
    return name.endsWith('-threads') ? name.slice(0, -8) : name;
  }

  async getThreadsByRepo(): Promise<Record<string, ThreadData[]>> {
    const repos = await this.listRepositories();
    const grouped: Record<string, ThreadData[]> = {};

    for (const repo of repos) {
      const repoPath = join(this.threadsBase, repo);
      const repoName = this.repoDisplayName(repo);
      grouped[repoName] = await this.collectThreads(repoPath, repoName);
    }

    return grouped;
  }

  async getThreadsForRepo(repoName: string): Promise<ThreadData[]> {
    const repos = await this.listRepositories();
    for (const repo of repos) {
      if (this.repoDisplayName(repo) === repoName) {
        const repoPath = join(this.threadsBase, repo);
        return this.collectThreads(repoPath, repoName);
      }
    }
    return [];
  }

  async getAllThreads(): Promise<ThreadData[]> {
    const repos = await this.listRepositories();
    const threads: ThreadData[] = [];

    for (const repo of repos) {
      const repoPath = join(this.threadsBase, repo);
      const repoName = this.repoDisplayName(repo);
      const repoThreads = await this.collectThreads(repoPath, repoName);
      threads.push(...repoThreads);
    }

    return threads.sort((a, b) => a.topic.localeCompare(b.topic));
  }

  private async collectThreads(repoPath: string, repoName: string): Promise<ThreadData[]> {
    const threads: ThreadData[] = [];
    
    try {
      const files = await this.findMarkdownFiles(repoPath);
      
      for (const filePath of files) {
        const threadData = await this.parseThreadFile(filePath);
        if (threadData) {
          threadData.repo = repoName;
          threads.push(threadData);
        }
      }
    } catch (error) {
      console.error(`Error collecting threads from ${repoPath}:`, error);
    }

    return threads;
  }

  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && extname(entry.name) === '.md') {
          if (entry.name !== 'README.md' && entry.name !== 'INDEX.md') {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }

    return files;
  }

  private async parseThreadFile(filePath: string): Promise<ThreadData | null> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const [headerLines, bodyText] = this.splitHeaderAndBody(content);
      const defaultTitle = filePath.split(/[/\\]/).pop()?.replace(/\.md$/, '') || 'Untitled';
      const [title, metadata, order] = this.parseHeaderLines(headerLines, defaultTitle);
      const entries = this.parseEntries(bodyText);

      const status = metadata.Status || 'UNKNOWN';
      const priority = metadata.Priority || 'P2';
      const ballOwnerRaw = metadata.Ball || null;
      const ballOwner = ballOwnerRaw || 'Unknown';
      const created = metadata.Created || null;
      const spec = metadata.Spec || null;
      const topic = metadata.Topic || defaultTitle;

      const normalize = (name: string | null): string => {
        if (!name) return '';
        return name.replace(/\s*\(.*\)\s*$/, '').trim().toLowerCase();
      };

      const normalizedBall = normalize(ballOwnerRaw);
      const lastAuthor = entries.length > 0 
        ? entries.slice().reverse().find(e => e.author)?.author || ''
        : '';
      const normalizedAuthor = normalize(lastAuthor);
      const hasNewFlag = 
        entries.length > 0 &&
        normalizedAuthor &&
        normalizedAuthor !== normalizedBall &&
        status.toUpperCase() !== 'CLOSED';

      // Mark entries as new
      entries.forEach(entry => {
        entry.is_new = false;
      });
      if (hasNewFlag && entries.length > 0) {
        entries[entries.length - 1].is_new = true;
      }

      const timestamps = entries
        .map(e => e.timestamp)
        .filter((t): t is string => t !== null);
      const lastUpdate = timestamps.length > 0 
        ? timestamps[timestamps.length - 1] 
        : created;

      const lastTitle = entries
        .slice()
        .reverse()
        .find(e => e.title)?.title || null;

      return {
        topic,
        title,
        status,
        priority,
        ball_owner: ballOwner,
        spec,
        created,
        last_update: lastUpdate,
        entry_count: entries.length,
        has_new: entries.length > 0 && entries[entries.length - 1].is_new,
        file_path: filePath,
        last_title: lastTitle,
        metadata,
        header_order: order,
        entries,
      };
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return null;
    }
  }

  private splitHeaderAndBody(content: string): [string[], string] {
    const lines = content.split('\n');
    const headerLines: string[] = [];
    const bodyLines: string[] = [];
    let inHeader = true;

    for (const line of lines) {
      if (inHeader && line.trim() === '---') {
        inHeader = false;
        continue;
      }

      if (inHeader) {
        headerLines.push(line);
      } else {
        bodyLines.push(line);
      }
    }

    // Remove trailing empty lines from header
    while (headerLines.length > 0 && !headerLines[headerLines.length - 1].trim()) {
      headerLines.pop();
    }

    // Remove leading '---' from body
    while (bodyLines.length > 0 && bodyLines[0].trim() === '---') {
      bodyLines.shift();
    }

    const bodyText = bodyLines.join('\n').trim();
    return [headerLines, bodyText];
  }

  private parseHeaderLines(
    headerLines: string[],
    defaultTitle: string
  ): [string, Record<string, string>, string[]] {
    if (headerLines.length === 0) {
      return [defaultTitle, {}, []];
    }

    const titleLine = headerLines[0].trim();
    let title = defaultTitle;
    let metaLines = headerLines.slice(1);

    if (titleLine.startsWith('#')) {
      title = titleLine.replace(/^#+\s*/, '').trim() || defaultTitle;
    } else {
      metaLines = headerLines;
    }

    const metadata: Record<string, string> = {};
    const order: string[] = [];
    const pattern = /^([\w \-]+):\s*(.+)$/;

    for (const line of metaLines) {
      const stripped = line.trim();
      if (!stripped) continue;

      const match = pattern.exec(stripped);
      if (!match) continue;

      const key = match[1].trim();
      const value = match[2].trim();
      metadata[key] = value;
      order.push(key);
    }

    return [title, metadata, order];
  }

  private parseEntries(bodyText: string): ThreadEntry[] {
    const entries: ThreadEntry[] = [];
    if (!bodyText) return entries;

    const segments = bodyText.split(/\n---\s*\n(?=Entry:)/);
    
    for (const rawSegment of segments) {
      const segment = rawSegment.trim();
      if (!segment) continue;

      const lines = segment.split('\n');
      const meta: Record<string, string> = {};
      let cursor = 0;
      const pattern = /^([\w \-]+):\s*(.*)$/;

      while (cursor < lines.length) {
        const line = lines[cursor];
        if (!line.trim()) {
          cursor++;
          break;
        }

        const match = pattern.exec(line);
        if (!match) break;

        const key = match[1].trim();
        const value = match[2].trim();
        meta[key] = value;
        cursor++;
      }

      const body = lines.slice(cursor).join('\n').trim();

      let author: string | null = null;
      let actor: string | null = null;
      let timestamp: string | null = null;

      const entryLine = meta.Entry;
      if (entryLine) {
        const entryPattern = /^(.+?)(?:\s+\((.+?)\))?\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)$/;
        const match = entryPattern.exec(entryLine);
        if (match) {
          author = match[1].trim();
          actor = match[2] ? match[2].trim() : null;
          timestamp = match[3].trim();
        } else {
          author = entryLine;
        }
      }

      entries.push({
        meta,
        body,
        author,
        actor,
        timestamp,
        title: meta.Title || null,
        role: meta.Role || null,
        type: meta.Type || null,
        spec: meta.Spec || null,
        is_new: (meta.Type || '').includes('NEW'),
      });
    }

    return entries;
  }
}

