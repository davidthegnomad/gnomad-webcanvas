import { describe, expect, it } from 'vitest';
import { formatUpdateCheckMessage } from '../updateStatus';
import type { UpdateCheckResult } from '../updater';

const base: UpdateCheckResult = {
  available: false,
  currentVersion: '0.1.0-beta.5',
  channel: 'beta',
};

describe('formatUpdateCheckMessage', () => {
  it('shows version when update available', () => {
    const msg = formatUpdateCheckMessage({
      ...base,
      available: true,
      version: '0.1.0-beta.6',
    });
    expect(msg).toBe('Update available: v0.1.0-beta.6');
  });

  it('shows current version when up to date', () => {
    const msg = formatUpdateCheckMessage(base);
    expect(msg).toContain('0.1.0-beta.5');
  });

  it('appends beta feed warning when present', () => {
    const msg = formatUpdateCheckMessage({
      ...base,
      warning: 'Beta release feed unavailable.',
    });
    expect(msg).toContain('Beta release feed unavailable.');
  });
});
