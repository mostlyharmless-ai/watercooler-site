/**
 * Parse markdown into semantic blocks for gradual reveal
 * Treats multi-line constructs (lists, code blocks) as single units
 */
export function parseMarkdownBlocks(markdown: string): string[] {
  if (!markdown) return [];

  const blocks: string[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines at the start of iteration
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Code block (``` or indented)
    if (line.trim().startsWith('```')) {
      const codeBlockLines = [line];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeBlockLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        codeBlockLines.push(lines[i]); // closing ```
        i++;
      }
      blocks.push(codeBlockLines.join('\n'));
      continue;
    }

    // Heading
    if (line.match(/^#{1,6}\s/)) {
      blocks.push(line);
      i++;
      continue;
    }

    // List item (-, *, +, or numbered)
    if (line.match(/^(\s*)[-*+]\s/) || line.match(/^(\s*)\d+\.\s/)) {
      const listLines = [line];
      const indent = line.match(/^(\s*)/)?.[1] || '';
      i++;

      // Collect continuation lines (indented or blank lines within list)
      while (i < lines.length) {
        const nextLine = lines[i];

        // Another list item at same or lesser indent ends this item
        if (nextLine.match(/^(\s*)[-*+]\s/) || nextLine.match(/^(\s*)\d+\.\s/)) {
          const nextIndent = nextLine.match(/^(\s*)/)?.[1] || '';
          if (nextIndent.length <= indent.length) {
            break;
          }
        }

        // Non-list line without proper indent ends the list item
        if (nextLine.trim() !== '' && !nextLine.startsWith(indent + '  ') && !nextLine.match(/^(\s*)[-*+]\s/) && !nextLine.match(/^(\s*)\d+\.\s/)) {
          break;
        }

        listLines.push(nextLine);
        i++;

        // Stop at blank line followed by non-indented content
        if (nextLine.trim() === '' && i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith(indent + '  ')) {
          break;
        }
      }

      blocks.push(listLines.join('\n'));
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      const quoteLines = [line];
      i++;
      while (i < lines.length && (lines[i].trim().startsWith('>') || lines[i].trim() === '')) {
        quoteLines.push(lines[i]);
        if (lines[i].trim() === '') {
          i++;
          break;
        }
        i++;
      }
      blocks.push(quoteLines.join('\n'));
      continue;
    }

    // Horizontal rule
    if (line.match(/^(\*{3,}|-{3,}|_{3,})$/)) {
      blocks.push(line);
      i++;
      continue;
    }

    // Paragraph - split into individual lines for gradual reveal
    const paraLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^#{1,6}\s/) && !lines[i].match(/^(\s*)[-*+]\s/) && !lines[i].match(/^(\s*)\d+\.\s/) && !lines[i].trim().startsWith('```')) {
      paraLines.push(lines[i]);
      i++;
    }
    // Push each line as a separate block for varied timing
    paraLines.forEach(paraLine => blocks.push(paraLine));
  }

  return blocks;
}
