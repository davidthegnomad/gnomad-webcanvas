import { useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { HoverTip, TipButton } from '../HoverTip';
import { TOOL_HINTS } from '../../constants/uiHints';

export default function ColorPicker() {
  const [color, setColor] = useState('#6366f1');
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const activePane = useEditorStore((s) => s.activePane);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToHsl = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const getFormattedColor = useCallback(() => {
    switch (format) {
      case 'rgb': return hexToRgb(color);
      case 'hsl': return hexToHsl(color);
      default: return color;
    }
  }, [color, format]);

  const insertColor = useCallback(() => {
    const formatted = getFormattedColor();
    const targetPane = activePane === 'html' ? 'html' : 'css';

    window.dispatchEvent(
      new CustomEvent('liveview-insert', {
        detail: { pane: targetPane, text: formatted },
      }),
    );
  }, [getFormattedColor, activePane]);

  return (
    <div className="flex items-center gap-2">
      <HoverTip tip={TOOL_HINTS.colorPicker}>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          title={TOOL_HINTS.colorPicker}
          className="w-7 h-7 rounded cursor-pointer border ui-border bg-transparent"
        />
      </HoverTip>
      <HoverTip tip={TOOL_HINTS.colorFormat}>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as 'hex' | 'rgb' | 'hsl')}
          title={TOOL_HINTS.colorFormat}
          className="text-[10px] ui-bg-elevated border ui-border rounded px-1.5 py-1 ui-text-muted outline-none"
        >
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
      </HoverTip>
      <span className="text-[10px] ui-text-faint font-mono min-w-[100px]">
        {getFormattedColor()}
      </span>
      <TipButton
        tip={TOOL_HINTS.colorInsert}
        onClick={insertColor}
        className="text-[10px] px-2 py-1 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 transition-colors"
      >
        Insert
      </TipButton>
    </div>
  );
}
