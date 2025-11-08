#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Parse a thread markdown file into structured data
 */
function parseThread(content, filename) {
  const lines = content.split('\n');

  const metadata = {
    id: filename.replace('.md', ''),
    title: filename.replace('.md', '').replace(/-/g, ' '),
    entries: []
  };

  let currentEntry = null;
  let currentBody = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse metadata from header
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
        metadata.entries.push(currentEntry);
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
      if (!line.includes('Entry-ID:') && !line.includes('<!--') && !line.includes('-->')) {
        currentBody.push(line);
      }
    }
  }

  // Save last entry
  if (currentEntry && currentEntry.author) {
    currentEntry.body = currentBody.join('\n').trim();
    metadata.entries.push(currentEntry);
  }

  return metadata;
}

/**
 * Load all threads from the watercooler-cloud-threads directory
 */
function loadAllThreads(threadsDir) {
  const threads = [];

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
        thread.title = `[archived] ${thread.title}`;
        threads.push(thread);
      }
    }
  } catch (error) {
    console.error('Error loading threads:', error);
  }

  return threads;
}

// Main execution
const threadsDir = path.join(__dirname, '../../watercooler-cloud-threads');
const outputFile = path.join(__dirname, '../lib/generatedThreads.json');

console.log(`Loading threads from: ${threadsDir}`);
const threads = loadAllThreads(threadsDir);

console.log(`Found ${threads.length} threads`);
console.log(`Writing to: ${outputFile}`);

fs.writeFileSync(outputFile, JSON.stringify(threads, null, 2));

console.log('✅ Thread data generated successfully!');
