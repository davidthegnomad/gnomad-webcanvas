import { describe, it, expect } from 'vitest';
import { parseFileContent } from '../fileContent';

describe('parseFileContent', () => {
  it('routes css files to css pane', () => {
    const result = parseFileContent('body { margin: 0; }', '/tmp/style.css');
    expect(result.css).toBe('body { margin: 0; }');
    expect(result.js).toBe('');
  });

  it('routes js files to js pane', () => {
    const result = parseFileContent('console.log(1);', '/tmp/app.js');
    expect(result.js).toBe('console.log(1);');
  });

  it('parses html via DOMParser path', () => {
    const html = '<!DOCTYPE html><html><head><style>h1{color:red}</style></head><body><p>Hi</p></body></html>';
    const result = parseFileContent(html, '/tmp/page.html');
    expect(result.html).toContain('<p>Hi</p>');
    expect(result.css).toContain('color:red');
  });
});
