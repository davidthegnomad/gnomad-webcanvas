import { useState, useCallback } from 'react';
import { HoverTip, TipButton } from '../HoverTip';
import { TOOL_HINTS } from '../../constants/uiHints';

interface CssPreset {
  label: string;
  generate: (value: string) => string;
  type: 'range' | 'select';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string;
  options?: string[];
}

const CSS_PRESETS: CssPreset[] = [
  {
    label: 'Border Radius',
    type: 'range',
    min: 0,
    max: 50,
    step: 1,
    defaultValue: '8',
    generate: (v) => `border-radius: ${v}px;`,
  },
  {
    label: 'Box Shadow',
    type: 'select',
    defaultValue: 'medium',
    options: ['none', 'small', 'medium', 'large', 'xl'],
    generate: (v) => {
      const shadows: Record<string, string> = {
        none: 'box-shadow: none;',
        small: 'box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);',
        medium: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);',
        large: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);',
        xl: 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);',
      };
      return shadows[v] ?? shadows.medium;
    },
  },
  {
    label: 'Opacity',
    type: 'range',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: '100',
    generate: (v) => `opacity: ${Number(v) / 100};`,
  },
  {
    label: 'Flexbox Center',
    type: 'select',
    defaultValue: 'both',
    options: ['both', 'horizontal', 'vertical'],
    generate: (v) => {
      const base = 'display: flex;';
      switch (v) {
        case 'horizontal': return `${base}\njustify-content: center;`;
        case 'vertical': return `${base}\nalign-items: center;`;
        default: return `${base}\njustify-content: center;\nalign-items: center;`;
      }
    },
  },
];

export default function CssGenerator() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [value, setValue] = useState(CSS_PRESETS[0].defaultValue);

  const preset = CSS_PRESETS[selectedPreset];
  const generated = preset.generate(value);

  const handlePresetChange = useCallback((idx: number) => {
    setSelectedPreset(idx);
    setValue(CSS_PRESETS[idx].defaultValue);
  }, []);

  const insertCss = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('liveview-insert', {
        detail: { pane: 'css', text: generated },
      }),
    );
  }, [generated]);

  return (
    <div className="flex items-center gap-2">
      <HoverTip tip={TOOL_HINTS.cssPreset}>
        <select
          value={selectedPreset}
          onChange={(e) => handlePresetChange(Number(e.target.value))}
          title={TOOL_HINTS.cssPreset}
          className="text-[10px] ui-bg-elevated border ui-border rounded px-1.5 py-1 ui-text-muted outline-none"
        >
          {CSS_PRESETS.map((p, i) => (
            <option key={p.label} value={i}>
              {p.label}
            </option>
          ))}
        </select>
      </HoverTip>

      {preset.type === 'range' ? (
        <HoverTip tip={TOOL_HINTS.cssPreset}>
          <input
            type="range"
            min={preset.min}
            max={preset.max}
            step={preset.step}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            title={TOOL_HINTS.cssPreset}
            className="w-20 h-1 accent-indigo-500"
          />
        </HoverTip>
      ) : (
        <HoverTip tip={TOOL_HINTS.cssPreset}>
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            title={TOOL_HINTS.cssPreset}
            className="text-[10px] ui-bg-elevated border ui-border rounded px-1.5 py-1 ui-text-muted outline-none"
          >
            {preset.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </HoverTip>
      )}

      <span className="text-[10px] ui-text-faint font-mono max-w-[160px] truncate">
        {generated.split('\n')[0]}
      </span>

      <TipButton
        tip={TOOL_HINTS.cssInsert}
        onClick={insertCss}
        className="text-[10px] px-2 py-1 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 transition-colors"
      >
        Insert
      </TipButton>
    </div>
  );
}
