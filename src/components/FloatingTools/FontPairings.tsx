import { useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { FONT_PAIRINGS, AVAILABLE_FONTS } from '../../constants/fontPairings';
import { HoverTip, TipButton } from '../HoverTip';
import { TOOL_HINTS } from '../../constants/uiHints';

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
      new CustomEvent('liveview-insert', {
        detail: { pane: 'css', text: lines.join('\n') },
      }),
    );
  }, [activePreset, customHeadingFont, customBodyFont]);

  if (advancedMode) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] ui-text-faint">Fonts:</span>
        <HoverTip tip={TOOL_HINTS.fontAdvanced}>
          <select
            value={customHeadingFont ?? ''}
            onChange={(e) => setCustomFonts(e.target.value || null, customBodyFont)}
            title={TOOL_HINTS.fontAdvanced}
            className="text-[10px] ui-bg-elevated border ui-border rounded px-1.5 py-1 ui-text-muted outline-none max-w-[110px]"
          >
            <option value="">Heading...</option>
            {AVAILABLE_FONTS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </HoverTip>
        <HoverTip tip={TOOL_HINTS.fontAdvanced}>
          <select
            value={customBodyFont ?? ''}
            onChange={(e) => setCustomFonts(customHeadingFont, e.target.value || null)}
            title={TOOL_HINTS.fontAdvanced}
            className="text-[10px] ui-bg-elevated border ui-border rounded px-1.5 py-1 ui-text-muted outline-none max-w-[110px]"
          >
            <option value="">Body...</option>
            {AVAILABLE_FONTS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </HoverTip>
        <TipButton
          tip={TOOL_HINTS.fontInsert}
          onClick={insertFontCss}
          disabled={!customHeadingFont && !customBodyFont}
          className="text-[10px] px-2 py-1 rounded bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors disabled:opacity-30"
        >
          Insert
        </TipButton>
        <TipButton
          tip={TOOL_HINTS.fontPreset}
          onClick={() => setAdvancedMode(false)}
          className="text-[10px] px-1.5 py-1 ui-text-faint hover:ui-text-muted transition-colors"
        >
          Presets
        </TipButton>
        {(customHeadingFont || customBodyFont) && (
          <TipButton
            tip={TOOL_HINTS.fontClear}
            onClick={clearFontPairing}
            className="text-[10px] px-1 ui-text-faint hover:text-red-400 transition-colors"
          >
            ✕
          </TipButton>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] ui-text-faint">Fonts:</span>
      <HoverTip tip={TOOL_HINTS.fontPreset}>
        <select
          value={fontPairingId ?? ''}
          onChange={(e) => {
            const id = e.target.value;
            if (id) setFontPairing(id);
            else clearFontPairing();
          }}
          title={TOOL_HINTS.fontPreset}
          className="text-[10px] ui-bg-elevated border ui-border rounded px-1.5 py-1 ui-text-muted outline-none max-w-[130px]"
        >
          <option value="">None</option>
          {FONT_PAIRINGS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.description}
            </option>
          ))}
        </select>
      </HoverTip>
      {activePreset && (
        <span className="text-[9px] ui-text-faint truncate max-w-[140px]">
          {activePreset.headingFont} + {activePreset.bodyFont}
        </span>
      )}
      <TipButton
        tip={TOOL_HINTS.fontInsert}
        onClick={insertFontCss}
        disabled={!fontPairingId}
        className="text-[10px] px-2 py-1 rounded bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors disabled:opacity-30"
      >
        Insert
      </TipButton>
      <TipButton
        tip={TOOL_HINTS.fontAdvanced}
        onClick={() => setAdvancedMode(true)}
        className="text-[10px] px-1.5 py-1 ui-text-faint hover:ui-text-muted transition-colors"
      >
        Custom
      </TipButton>
    </div>
  );
}
