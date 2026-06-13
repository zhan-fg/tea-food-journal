"use client";

import React from "react";

interface MarkdownContentProps {
  content: string;
}

/**
 * Simple markdown-to-React renderer.
 * Handles: h2, h3, paragraphs, bold, italic, inline code, lists, blockquotes, horizontal rules.
 */
export function MarkdownContent({ content }: MarkdownContentProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip frontmatter (--- to ---)
    if (line.trim() === "---" && i === 0) {
      i++;
      while (i < lines.length && lines[i].trim() !== "---") i++;
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl font-semibold text-foreground mt-8 mb-3">
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-lg font-medium text-foreground mt-6 mb-2">
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-tea-400 dark:border-tea-600 pl-4 my-4 text-foreground/70 italic"
        >
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="mb-1 last:mb-0">{parseInline(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Table (basic: |---|---|)
    if (line.startsWith("|") && line.endsWith("|")) {
      const tableRows: string[][] = [];
      let hasHeader = false;

      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i].trim();
        if (row.match(/^\|[-:| ]+\|$/)) {
          hasHeader = true;
          i++;
          continue;
        }
        tableRows.push(
          row
            .split("|")
            .filter(Boolean)
            .map((c) => c.trim())
        );
        i++;
      }

      if (tableRows.length > 0) {
        elements.push(
          <div key={i} className="overflow-x-auto my-4">
            <table className="min-w-full text-sm border-collapse">
              <tbody>
                {tableRows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={
                      hasHeader && ri === 0
                        ? "bg-tea-50 dark:bg-tea-900/30 font-medium"
                        : "border-t border-tea-200 dark:border-tea-800"
                    }
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-foreground/80">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***") {
      elements.push(
        <hr key={i} className="my-6 border-tea-200 dark:border-tea-800" />
      );
      i++;
      continue;
    }

    // Image: ![alt](url)
    const imageMatch = line.match(/^!\[(.+?)\]\((.+?)\)$/);
    if (imageMatch) {
      elements.push(
        <div key={i} className="my-4 rounded-lg overflow-hidden max-w-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageMatch[2]}
            alt={imageMatch[1]}
            className="w-full rounded-lg"
            loading="lazy"
          />
        </div>
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        listItems.push(lines[i].replace(/^[-*]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1.5 my-4 text-foreground/80">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm leading-relaxed">{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-1.5 my-4 text-foreground/80">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm leading-relaxed">{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph (default)
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("|") && !lines[i].match(/^[-*>]/) && !lines[i].match(/^\d+\.\s/)) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      elements.push(
        <p key={i} className="text-sm text-foreground/80 leading-relaxed my-3">
          {paraLines.map((pl, pi) => (
            <React.Fragment key={pi}>
              {pi > 0 && <br />}
              {parseInline(pl)}
            </React.Fragment>
          ))}
        </p>
      );
    } else {
      // Safety: if nothing matched, skip this line to avoid infinite loop
      i++;
    }
  }

  return <div>{elements}</div>;
}

/**
 * Parse inline markdown: bold, italic, code, links.
 */
function parseInline(text: string): React.ReactNode {
  // Process inline formatting
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // Combined regex for bold, italic, code, link
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(remaining)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold
      parts.push(<strong key={++key} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3]) {
      // Italic
      parts.push(<em key={++key}>{match[4]}</em>);
    } else if (match[5]) {
      // Code
      parts.push(
        <code key={++key} className="px-1 py-0.5 rounded bg-tea-100 dark:bg-tea-900/40 text-xs font-mono text-tea-700 dark:text-tea-400">
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      // Link
      parts.push(
        <a
          key={++key}
          href={match[9]}
          className="text-tea-600 dark:text-tea-400 underline underline-offset-2 hover:text-tea-500"
        >
          {match[8]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}
