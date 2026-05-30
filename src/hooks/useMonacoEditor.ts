import { useRef, useCallback } from 'react';
import type { editor } from 'monaco-editor';

export function useMonacoEditor() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount = useCallback((editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;
  }, []);

  const insertText = useCallback((text: string) => {
    const ed = editorRef.current;
    if (!ed) return;

    const selection = ed.getSelection();
    const range = selection ?? {
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    };

    ed.executeEdits('floating-tool', [
      {
        range,
        text,
        forceMoveMarkers: true,
      },
    ]);

    ed.getAction('editor.action.formatDocument')?.run();
  }, []);

  const focusEditor = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  return { editorRef, handleEditorMount, insertText, focusEditor };
}
