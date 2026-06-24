import { invoke } from '@tauri-apps/api/core';
import { isDesktop } from '../utils/platformBridge';

export interface UpdateCheckResult {
  available: boolean;
  currentVersion: string;
  version?: string;
  notes?: string;
  date?: string;
  channel: string;
  warning?: string;
}

export interface InstallUpdateResult {
  installed: boolean;
  restartRequired: boolean;
  version?: string;
}

export async function checkForUpdates(channel = 'beta'): Promise<UpdateCheckResult> {
  if (!isDesktop()) {
    return {
      available: false,
      currentVersion: 'web',
      channel,
    };
  }
  return invoke<UpdateCheckResult>('check_for_updates', { channel });
}

export async function installUpdate(channel = 'beta'): Promise<InstallUpdateResult> {
  if (!isDesktop()) {
    return { installed: false, restartRequired: false };
  }
  return invoke<InstallUpdateResult>('install_update', { channel });
}

export async function restartApp(): Promise<void> {
  if (!isDesktop()) return;
  await invoke('restart_app');
}
