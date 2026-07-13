import { Component, inject, signal } from '@angular/core';
import { CommandParserService } from './command-parser.service';

interface TerminalEntry {
  command: string;
  output: string;
}

@Component({
  selector: 'app-terminal',
  template: `
    <div class="terminal">
      <div class="terminal-history">
        @for (entry of history(); track $index) {
          <div class="terminal-entry">
            <div class="terminal-command">
              <span class="terminal-prompt">$</span> {{ entry.command }}
            </div>
            <pre class="terminal-output">{{ entry.output }}</pre>
          </div>
        }
      </div>
      <div class="terminal-input-line">
        <span class="terminal-prompt">$</span>
        <input
          class="terminal-input"
          type="text"
          [value]="currentInput()"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
          spellcheck="false"
          autocomplete="off"
        />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .terminal {
      height: 100%;
      background: #1a1a1a;
      color: #e0e0e0;
      font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .terminal-history {
      flex: 1;
    }

    .terminal-entry {
      margin-bottom: 8px;
    }

    .terminal-command {
      color: #e0e0e0;
    }

    .terminal-output {
      margin: 2px 0 0;
      white-space: pre-wrap;
      color: #b0b0b0;
      font-family: inherit;
      font-size: inherit;
    }

    .terminal-prompt {
      color: #4caf50;
      margin-right: 8px;
      user-select: none;
    }

    .terminal-input-line {
      display: flex;
      align-items: center;
    }

    .terminal-input {
      flex: 1;
      background: none;
      border: none;
      color: #e0e0e0;
      font-family: inherit;
      font-size: inherit;
      outline: none;
      caret-color: #4caf50;
    }
  `,
})
export class TerminalApp {
  private readonly parser = inject(CommandParserService);

  readonly history = signal<TerminalEntry[]>([]);
  readonly currentInput = signal('');

  onInput(event: Event) {
    this.currentInput.set((event.target as HTMLInputElement).value);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const value = this.currentInput().trim();
      if (value) {
        this.submitCommand(value);
        this.currentInput.set('');
        (event.target as HTMLInputElement).value = '';
      }
    }
  }

  submitCommand(command: string) {
    const result = this.parser.parse(command);

    if (result.clear) {
      this.history.set([]);
      return;
    }

    this.history.update((h) => [...h, { command, output: result.output }]);
  }
}
