import { describe, it, expect } from 'vitest';
import { assembleSource } from '../assembleSource';
import type { CDNLibrary } from '../../types/editor.types';

const tailwind: CDNLibrary = {
  id: 'tailwind',
  name: 'Tailwind CSS',
  category: 'css',
  version: '4.0',
  tag: '<script src="https://cdn.tailwindcss.com"></script>',
};

const gsap: CDNLibrary = {
  id: 'gsap',
  name: 'GSAP',
  category: 'js',
  version: '3.12.5',
  tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>',
};

describe('assembleSource', () => {
  it('includes user html, css, and js in preview document', () => {
    const src = assembleSource('<h1>Hi</h1>', 'h1{}', 'init();', []);
    expect(src).toContain('<h1>Hi</h1>');
    expect(src).toContain('h1{}');
    expect(src).toContain('init();');
    expect(src).toContain('liveview-console');
  });

  it('injects active CDN library tags in head', () => {
    const src = assembleSource('', '', '', [tailwind, gsap]);
    expect(src).toContain('cdn.tailwindcss.com');
    expect(src).toContain('gsap.min.js');
  });

  it('adds Google Fonts link and css variables when font pairing set', () => {
    const src = assembleSource('', 'p{}', '', [], {
      headingFont: 'Roboto',
      bodyFont: 'Open Sans',
    });
    expect(src).toContain('fonts.googleapis.com/css2');
    expect(src).toContain('family=Roboto');
    expect(src).toContain('family=Open+Sans');
    expect(src).toContain('--font-heading');
    expect(src).toContain('--font-body');
  });

  it('deduplicates font families when heading and body match', () => {
    const src = assembleSource('', '', '', [], {
      headingFont: 'Inter',
      bodyFont: 'Inter',
    });
    const matches = src.match(/family=Inter/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it('wraps user js in try/catch for runtime error reporting', () => {
    const src = assembleSource('', '', 'throw new Error("x");', []);
    expect(src).toContain('try { throw new Error("x"); }');
    expect(src).toContain('[Runtime Error]');
  });
});
