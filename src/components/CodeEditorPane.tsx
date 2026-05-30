import { memo, useCallback, useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { EDITOR_OPTIONS, LANGUAGE_MAP } from '../constants/editorConfig';
import type { PaneType } from '../types/editor.types';
import type { editor } from 'monaco-editor';

interface CodeEditorPaneProps {
  pane: PaneType;
}

const CODE_SELECTORS = {
  html: (s: ReturnType<typeof useEditorStore.getState>) => s.htmlCode,
  css: (s: ReturnType<typeof useEditorStore.getState>) => s.cssCode,
  js: (s: ReturnType<typeof useEditorStore.getState>) => s.jsCode,
};

function CodeEditorPaneInner({ pane }: CodeEditorPaneProps) {
  const code = useEditorStore(CODE_SELECTORS[pane]);
  const setCode = useEditorStore((s) => s.setCode);
  const setActivePane = useEditorStore((s) => s.setActivePane);
  const editorTheme = useEditorStore((s) => s.editorTheme);
  const fontSize = useEditorStore((s) => s.fontSize);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const initialValueRef = useRef(code);

  const debouncedSetCode = useDebouncedCallback(
    (value: string) => setCode(pane, value),
    150,
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        debouncedSetCode(value);
      }
    },
    [debouncedSetCode],
  );

  const handleMount: OnMount = useCallback(
    (editorInstance, monaco) => {
      editorRef.current = editorInstance;
      monacoRef.current = monaco;
      monaco.editor.setTheme(editorTheme);
      editorInstance.onDidFocusEditorWidget(() => {
        setActivePane(pane);
      });
    },
    [pane, setActivePane, editorTheme],
  );

  useEffect(() => {
    monacoRef.current?.editor.setTheme(editorTheme);
  }, [editorTheme]);

  useEffect(() => {
    editorRef.current?.updateOptions({ fontSize });
  }, [fontSize]);

  // Listen for floating tool insertions
  useEffect(() => {
    const handler = (e: CustomEvent<{ pane: PaneType; text: string }>) => {
      if (e.detail.pane !== pane || !editorRef.current) return;

      const ed = editorRef.current;
      const selection = ed.getSelection();
      const range = selection ?? {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1,
      };

      ed.executeEdits('floating-tool', [
        { range, text: e.detail.text, forceMoveMarkers: true },
      ]);
      ed.getAction('editor.action.formatDocument')?.run();
    };

    window.addEventListener('webcanvas-insert' as never, handler as never);
    return () => window.removeEventListener('webcanvas-insert' as never, handler as never);
  }, [pane]);

  // Listen for format-on-demand
  useEffect(() => {
    const handler = (e: CustomEvent<{ pane: PaneType }>) => {
      if (e.detail.pane !== pane || !editorRef.current) return;
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    };

    window.addEventListener('webcanvas-format' as never, handler as never);
    return () => window.removeEventListener('webcanvas-format' as never, handler as never);
  }, [pane]);

  const editorOptions = { ...EDITOR_OPTIONS, fontSize };

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        defaultValue={initialValueRef.current}
        language={LANGUAGE_MAP[pane]}
        theme={editorTheme}
        options={editorOptions}
        onChange={handleChange}
        onMount={handleMount}
        loading={
          <div className="flex items-center justify-center h-full text-wc-faint text-sm">
            Loading editor...
          </div>
        }
      />
    </div>
  );
}

const CodeEditorPane = memo(CodeEditorPaneInner);
export default CodeEditorPane;
