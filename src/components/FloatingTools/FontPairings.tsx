import { useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { FONT_PAIRINGS, AVAILABLE_FONTS } from '../../constants/fontPairings';

export default function FontPairings() {
  const [advancedMode, setAdvancedMode] = useState(false);

  const fontPairingId = useEditorStore((s) => s.fontPairingId);
  const customHeadingFont = useEditorStore((s) => s.customHeadingFont);
  const customBodyFont = useEditorStore((s) => s.customBodyFont);
  const setFontPairing = useEditorStore((s) => s.setFontPairing);
  const setCustomFonts = useEditorStore((s) => s.setCustomFonts);
  const clearFontPairing = useEditorStore((s) => s.clearFontPairing);

  const activePreset = FONT_PAIRINGS.find((p) => p.id === fontPairingId);

  const insertFontCss = useCallback(() => {
    const heading = activePreset?.headingFont ?? customHeadingFont;
    const body = activePreset?.bodyFont ?? customBodyFont;
    if (!heading && !body) return;

    const lines: string[] = [];
    if (heading) lines.push(`font-family: '${heading}', sans-serif;`);
    if (body && body !== heading) lines.push(`/* body: font-family: '${body}', sans-serif; */`);

    window.dispatchEvent(
      new CustomEvent('webcanvas-insert', {
        detail: { pane: 'css', text: lines.join('\n') },
      }),
    );
  }, [activePreset, customHeadingFont, customBodyFont]);

  if (advancedMode) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-neutral-600">Fonts:</span>
        <select
          value={customHeadingFont ?? ''}
          onChange={(e) => setCustomFonts(e.target.value || null, customBodyFont)}
          className="text-[10px] bg-wc-elevated border border-wc rounded px-1.5 py-1 text-neutral-400 outline-none max-w-[110px]"
        >
          <option value="">Heading...</option>
          {AVAILABLE_FONTS.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>
        <select
          value={customBodyFont ?? ''}
          onChange={(e) => setCustomFonts(customHeadingFont, e.target.value || null)}
          className="text-[10px] bg-wc-elevated border border-wc rounded px-1.5 py-1 text-neutral-400 outline-none max-w-[110px]"
        >
          <option value="">Body...</option>
          {AVAILABLE_FONTS.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>
        <button
          onClick={insertFontCss}
          disabled={!customHeadingFont && !customBodyFont}
          className="text-[10px] px-2 py-1 rounded bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors disabled:opacity-30"
        >
          Insert
        </button>
        <button
          onClick={() => setAdvancedMode(false)}
          className="text-[10px] px-1.5 py-1 text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          Presets
        </button>
        {(customHeadingFont || customBodyFont) && (
          <button
            onClick={clearFontPairing}
            className="text-[10px] px-1 text-neutral-600 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-neutral-600">Fonts:</span>
      <select
        value={fontPairingId ?? ''}
        onChange={(e) => {
          const id = e.target.value;
          if (id) setFontPairing(id);
          else clearFontPairing();
        }}
        className="text-[10px] bg-wc-elevated border border-wc rounded px-1.5 py-1 text-neutral-400 outline-none max-w-[130px]"
      >
        <option value="">None</option>
        {FONT_PAIRINGS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.description}
          </option>
        ))}
      </select>
      {activePreset && (
        <span className="text-[9px] text-neutral-600 truncate max-w-[140px]">
          {activePreset.headingFont} + {activePreset.bodyFont}
        </span>
      )}
      <button
        onClick={insertFontCss}
        disabled={!fontPairingId}
        className="text-[10px] px-2 py-1 rounded bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors disabled:opacity-30"
      >
        Insert
      </button>
      <button
        onClick={() => setAdvancedMode(true)}
        className="text-[10px] px-1.5 py-1 text-neutral-600 hover:text-neutral-400 transition-colors"
        title="Custom font selection"
      >
        Custom
      </button>
    </div>
  );
}
