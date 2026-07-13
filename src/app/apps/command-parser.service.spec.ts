import { TestBed } from '@angular/core/testing';
import { CommandParserService } from './command-parser.service';
import { THOUGHTS } from '../thoughts-content/thoughts-data';

describe('CommandParserService', () => {
  let service: CommandParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommandParserService);
  });

  it('parse("help") should return help text listing all commands', () => {
    const result = service.parse('help');
    expect(result.output).toContain('help');
    expect(result.output).toContain('about');
    expect(result.output).toContain('clear');
    expect(result.output).toContain('echo');
    expect(result.output).toContain('thoughts');
    expect(result.output).toContain('ls');
  });

  it('parse("about") should return the about text', () => {
    const result = service.parse('about');
    expect(result.output).toContain('Paul Sumido');
    expect(result.output).toContain('Software Engineer');
  });

  it('parse("clear") should return a clear signal', () => {
    const result = service.parse('clear');
    expect(result.output).toBe('');
    expect(result.clear).toBe(true);
  });

  it('parse("echo hello world") should return "hello world"', () => {
    const result = service.parse('echo hello world');
    expect(result.output).toBe('hello world');
  });

  it('parse("thoughts") should return the list of all thought entry titles', () => {
    const result = service.parse('thoughts');
    for (const thought of THOUGHTS) {
      expect(result.output).toContain(thought.title);
    }
  });

  it('parse("thoughts signals") should return the matching thought entry', () => {
    const result = service.parse('thoughts signals');
    expect(result.output).toContain('Why Angular Signals Changed Everything');
    expect(result.output).toContain('2026-06-15');
  });

  it('parse("thoughts nonexistent") should return "not found"', () => {
    const result = service.parse('thoughts nonexistent');
    expect(result.output.toLowerCase()).toContain('not found');
  });

  it('parse("ls") should return a directory listing', () => {
    const result = service.parse('ls');
    expect(result.output).toContain('README.md');
    expect(result.output).toContain('Projects');
    expect(result.output).toContain('Thoughts');
  });

  it('parse("unknown-cmd") should return "command not found: unknown-cmd"', () => {
    const result = service.parse('unknown-cmd');
    expect(result.output).toContain('command not found: unknown-cmd');
  });
});
