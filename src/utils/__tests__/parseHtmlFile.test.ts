import { describe, it, expect } from 'vitest';
import { parseHtmlFile, assembleFullHtml } from '../parseHtmlFile';

describe('parseHtmlFile', () => {
  it('extracts css, js, and body html from a standard saved file', () => {
    const input = assembleFullHtml(
      '<h1>Hello</h1>',
      'h1 { color: red; }',
      'console.log("hi");',
    );
    const result = parseHtmlFile(input);
    expect(result.html).toContain('<h1>Hello</h1>');
    expect(result.css).toBe('h1 { color: red; }');
    expect(result.js).toBe('console.log("hi");');
  });

  it('handles multiple style tags', () => {
    const input = `<!DOCTYPE html><html><head>
      <style> .a { color: red; } </style>
      <style data-extra="1"> .b { margin: 0; } </style>
    </head><body><p>Text</p></body></html>`;
    const result = parseHtmlFile(input);
    expect(result.css).toContain('.a { color: red; }');
    expect(result.css).toContain('.b { margin: 0; }');
    expect(result.html).toBe('<p>Text</p>');
  });

  it('ignores external script tags and parses inline scripts with attributes', () => {
    const input = `<!DOCTYPE html><html><body>
      <script src="https://cdn.example.com/lib.js"></script>
      <script type="text/javascript" defer>
        const x = 1;
      </script>
      <script nomodule>
        legacy();
      </script>
      <div>Content</div>
    </body></html>`;
    const result = parseHtmlFile(input);
    expect(result.js).toContain('const x = 1');
    expect(result.js).toContain('legacy()');
    expect(result.js).not.toContain('cdn.example.com');
    expect(result.html).toContain('<div>Content</div>');
    expect(result.html).not.toContain('<script');
  });

  it('handles reordered attributes and extra whitespace', () => {
    const input = `<html>
      <head><style   type="text/css"  >body{margin:0}</style></head>
      <body  class="page"  >
        <span> OK </span>
      </body>
    </html>`;
    const result = parseHtmlFile(input);
    expect(result.css).toBe('body{margin:0}');
    expect(result.html).toContain('<span> OK </span>');
  });

  it('returns empty html when body is missing', () => {
    const result = parseHtmlFile('<html><head><style>x{}</style></head></html>');
    expect(result.html).toBe('');
    expect(result.css).toBe('x{}');
    expect(result.js).toBe('');
  });

  it('handles empty style and script blocks', () => {
    const input = `<!DOCTYPE html><html><head><style></style></head>
      <body><p>Only HTML</p><script></script></body></html>`;
    const result = parseHtmlFile(input);
    expect(result.css).toBe('');
    expect(result.js).toBe('');
    expect(result.html).toBe('<p>Only HTML</p>');
  });

  it('round-trips through assembleFullHtml', () => {
    const html = '<button id="btn">Click</button>';
    const css = 'button { padding: 1rem; }';
    const js = 'document.getElementById("btn").onclick = () => {};';
    const saved = assembleFullHtml(html, css, js);
    const parsed = parseHtmlFile(saved);
    expect(parsed.html).toContain('button id="btn"');
    expect(parsed.css).toBe(css);
    expect(parsed.js).toBe(js);
  });
});

describe('assembleFullHtml', () => {
  it('embeds css and js in a valid html document', () => {
    const out = assembleFullHtml('<main />', 'main{}', 'init();');
    expect(out).toContain('<style>');
    expect(out).toContain('main{}');
    expect(out).toContain('<script>');
    expect(out).toContain('init();');
    expect(out).toContain('<main />');
  });
});
