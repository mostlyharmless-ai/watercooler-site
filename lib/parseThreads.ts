import fs from 'fs';
import path from 'path';

export interface ThreadEntry {
  author: string;
  role: string;
  type: string;
  title: string;
  body: string;
  timestamp: string;
  isCodex: boolean;
  isClaude: boolean;
}

export interface Thread {
  id: string;
  title: string;
  status: string;
  ball: string;
  topic: string;
  created: string;
  priority?: string;
  entries: ThreadEntry[];
}

/**
 * Parse a thread markdown file into structured data
 */
export function parseThread(content: string, filename: string): Thread {
  const lines = content.split('\n');

  // Parse metadata from header
  const metadata: any = {
    id: filename.replace('.md', ''),
    title: filename.replace('.md', '').replace(/-/g, ' '),
    entries: []
  };

  let currentEntry: Partial<ThreadEntry> | null = null;
  let currentBody: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse status, ball, topic, etc from header
    if (line.startsWith('Status:')) {
      metadata.status = line.replace('Status:', '').trim();
    } else if (line.startsWith('Ball:')) {
      metadata.ball = line.replace('Ball:', '').trim();
    } else if (line.startsWith('Topic:')) {
      metadata.topic = line.replace('Topic:', '').trim();
    } else if (line.startsWith('Created:')) {
      metadata.created = line.replace('Created:', '').trim();
    } else if (line.startsWith('Priority:')) {
      metadata.priority = line.replace('Priority:', '').trim();
    }

    // Start of new entry
    else if (line.startsWith('Entry:')) {
      // Save previous entry if exists
      if (currentEntry && currentEntry.author) {
        currentEntry.body = currentBody.join('\n').trim();
        metadata.entries.push(currentEntry as ThreadEntry);
      }

      // Parse entry header: "Entry: Claude (caleb) 2025-11-04T00:34:29Z"
      const match = line.match(/Entry:\s+(\w+)\s+\([^)]+\)\s+(.+)/);
      if (match) {
        const author = match[1];
        currentEntry = {
          author,
          timestamp: match[2],
          isCodex: author.toLowerCase() === 'codex',
          isClaude: author.toLowerCase() === 'claude',
          role: '',
          type: '',
          title: '',
          body: ''
        };
        currentBody = [];
      }
    }

    // Parse entry metadata
    else if (currentEntry && line.startsWith('Role:')) {
      currentEntry.role = line.replace('Role:', '').trim();
    } else if (currentEntry && line.startsWith('Type:')) {
      currentEntry.type = line.replace('Type:', '').trim();
    } else if (currentEntry && line.startsWith('Title:')) {
      currentEntry.title = line.replace('Title:', '').trim();
    }

    // Entry body content
    else if (currentEntry && currentEntry.title && line !== '---') {
      // Skip entry ID comments
      if (!line.includes('Entry-ID:') && !line.includes('<!--')) {
        currentBody.push(line);
      }
    }
  }

  // Save last entry
  if (currentEntry && currentEntry.author) {
    currentEntry.body = currentBody.join('\n').trim();
    metadata.entries.push(currentEntry as ThreadEntry);
  }

  return metadata as Thread;
}

/**
 * Load all threads from the watercooler-cloud-threads directory
 */
export function loadAllThreads(threadsDir: string): Thread[] {
  const threads: Thread[] = [];

  try {
    // Load main threads
    const mainFiles = fs.readdirSync(threadsDir)
      .filter(f => f.endsWith('.md') && f !== 'index.md' && f !== 'README.md');

    for (const file of mainFiles) {
      const content = fs.readFileSync(path.join(threadsDir, file), 'utf-8');
      threads.push(parseThread(content, file));
    }

    // Load archived threads if directory exists
    const archivedDir = path.join(threadsDir, 'archived');
    if (fs.existsSync(archivedDir)) {
      const archivedFiles = fs.readdirSync(archivedDir)
        .filter(f => f.endsWith('.md'));

      for (const file of archivedFiles) {
        const content = fs.readFileSync(path.join(archivedDir, file), 'utf-8');
        const thread = parseThread(content, file);
        thread.id = `archived/${thread.id}`;
        threads.push(thread);
      }
    }
  } catch (error) {
    console.error('Error loading threads:', error);
  }

  return threads;
}
