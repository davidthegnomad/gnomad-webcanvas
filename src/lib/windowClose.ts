/** Ask Rust to close the window after unsaved-changes checks pass. */
export async function finishWindowClose(): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core');
  await invoke('finish_close');
}
