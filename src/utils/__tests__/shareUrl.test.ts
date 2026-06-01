import { describe, it, expect } from 'vitest';
import { encodeProjectToHash, decodeProjectFromHash } from '../shareUrl';

const baseState = {
  htmlCode: '<div>Hello</div>',
  cssCode: 'div { color: blue; }',
  jsCode: 'console.log(1);',
  activeLibraries: [] as { id: string }[],
};

describe('shareUrl', () => {
  it('round-trips a minimal project payload', () => {
    const hash = encodeProjectToHash(baseState);
    expect(hash.length).toBeGreaterThan(0);
    const decoded = decodeProjectFromHash(`#${hash}`);
    expect(decoded).toEqual({
      html: baseState.htmlCode,
      css: baseState.cssCode,
      js: baseState.jsCode,
    });
  });

  it('includes optional libraries and font fields when set', () => {
    const hash = encodeProjectToHash({
      ...baseState,
      activeLibraries: [{ id: 'tailwind' }, { id: 'gsap' }],
      fontPairingId: 'modern-sans',
      customHeadingFont: 'Playfair Display',
      customBodyFont: 'Inter',
    });
    const decoded = decodeProjectFromHash(hash);
    expect(decoded?.libs).toEqual(['tailwind', 'gsap']);
    expect(decoded?.fp).toBe('modern-sans');
    expect(decoded?.hf).toBe('Playfair Display');
    expect(decoded?.bf).toBe('Inter');
  });

  it('omits empty optional fields from payload', () => {
    const hash = encodeProjectToHash(baseState);
    const decoded = decodeProjectFromHash(hash);
    expect(decoded?.libs).toBeUndefined();
    expect(decoded?.fp).toBeUndefined();
  });

  it('returns null for empty or invalid hash', () => {
    expect(decodeProjectFromHash('')).toBeNull();
    expect(decodeProjectFromHash('#')).toBeNull();
    expect(decodeProjectFromHash('#not-valid-lz-data')).toBeNull();
  });

  it('handles hash with or without leading #', () => {
    const hash = encodeProjectToHash(baseState);
    expect(decodeProjectFromHash(`#${hash}`)).toEqual(decodeProjectFromHash(hash));
  });

  it('preserves unicode and special characters in code', () => {
    const state = {
      ...baseState,
      htmlCode: '<p>Emoji 🎨 &amp; symbols</p>',
      cssCode: '/* comment */ .x::before { content: "→"; }',
      jsCode: 'const s = `template ${1 + 1}`;',
    };
    const decoded = decodeProjectFromHash(encodeProjectToHash(state));
    expect(decoded?.html).toBe(state.htmlCode);
    expect(decoded?.css).toBe(state.cssCode);
    expect(decoded?.js).toBe(state.jsCode);
  });
});
