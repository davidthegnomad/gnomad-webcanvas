import { useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { isDesktop } from '../utils/platformBridge';
import { PRODUCT_NAME } from '../constants/branding';
import { basename } from '../utils/pathUtils';

function fileDisplayName(filePath: string | null): string {
  if (!filePath) return 'Untitled';
  return basename(filePath);
}

export function useDesktopWindowTitle(): void {
  const currentFilePath = useEditorStore((s) => s.currentFilePath);
  const isDirty = useEditorStore((s) => s.isDirty);

  useEffect(() => {
    if (!isDesktop()) return;
    const name = fileDisplayName(currentFilePath);
    document.title = `${PRODUCT_NAME} — ${name}${isDirty ? ' *' : ''}`;
  }, [currentFilePath, isDirty]);
}
