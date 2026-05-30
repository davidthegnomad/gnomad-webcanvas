import { useEffect } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';

/** Keeps all Monaco editor instances in sync when the theme changes. */
export default function MonacoThemeSync() {
  const monaco = useMonaco();
  const editorTheme = useEditorStore((s) => s.editorTheme);

  useEffect(() => {
    monaco?.editor.setTheme(editorTheme);
  }, [monaco, editorTheme]);

  return null;
}
