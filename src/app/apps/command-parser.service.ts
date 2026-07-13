import { Injectable } from '@angular/core';
import { THOUGHTS } from '../thoughts-content/thoughts-data';

export interface ParseResult {
  output: string;
  clear?: boolean;
  action?: string;
}

@Injectable({ providedIn: 'root' })
export class CommandParserService {
  parse(input: string): ParseResult {
    const trimmed = input.trim();
    const [cmd, ...args] = trimmed.split(/\s+/);

    switch (cmd) {
      case 'help':
        return {
          output: [
            'Available commands:',
            '  help               Show this help message',
            '  about              About the developer',
            '  clear              Clear the terminal',
            '  echo <text>        Print text to the terminal',
            '  thoughts [slug]    List thoughts or view a specific entry',
            '  ls                 List desktop items',
          ].join('\n'),
        };

      case 'about':
        return {
          output:
            'Paul Sumido — Software Engineer\nBuilding for the web with Angular, TypeScript, and more.',
        };

      case 'clear':
        return { output: '', clear: true };

      case 'echo':
        return { output: args.join(' ') };

      case 'thoughts':
        return this.handleThoughts(args[0]);

      case 'ls':
        return { output: 'README.md    Projects    Thoughts' };

      default:
        return { output: `command not found: ${cmd}` };
    }
  }

  private handleThoughts(slug?: string): ParseResult {
    if (!slug) {
      const lines = THOUGHTS.map((t) => `  ${t.slug.padEnd(16)} ${t.title}`);
      return { output: ['Thoughts:', ...lines].join('\n') };
    }

    const entry = THOUGHTS.find((t) => t.slug === slug);
    if (!entry) {
      return { output: `Thought not found: "${slug}"` };
    }

    return {
      output: [`${entry.title}`, `Date: ${entry.date}`, '', entry.summary].join('\n'),
      action: `openThought:${slug}`,
    };
  }
}
