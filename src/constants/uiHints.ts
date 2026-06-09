/** Customer-facing helper copy for toolbar controls and tools. */

export function hintLine(description: string, shortcut?: string): string {
  return shortcut ? `${description} (${shortcut})` : description;
}

export const NAV_HINTS = {
  project: 'Open a saved workspace, rename it, or start a new project (up to 10).',
  projectNew: 'Create a blank project without changing your other saved workspaces.',
  projectRename: 'Rename this project.',
  projectDelete: 'Remove this project from your saved list.',
  projectSwitch: 'Load this project into the editor.',

  pause: 'Freeze the live preview so the iframe stops updating while you edit.',
  resume: 'Resume live preview updates as you type.',
  refresh: 'Reload the preview iframe with your latest HTML, CSS, and JavaScript.',
  format: 'Auto-format the code in the pane you are currently editing.',
  fontDecrease: 'Make editor text smaller for denser code.',
  fontIncrease: 'Make editor text larger for easier reading.',
  fontSize: 'Current Monaco editor font size in pixels.',
  theme: 'Change the editor and app chrome theme (dark, light, or high contrast).',
  layout: 'Switch editor panes between a vertical stack and side-by-side columns.',
  fullscreen: 'Expand the preview to fill the workspace; press Escape to exit.',
  exitFullscreen: 'Return to the normal editor + preview layout.',

  templates: 'Replace your project with a starter layout — landing page, gallery, forms, and more.',
  templatesMenu: 'Pick a starter layout. This overwrites the current project HTML, CSS, and JS.',

  libs: 'Toggle CDN libraries (Tailwind, GSAP, Three.js, etc.) injected into the preview.',
  libsMenu: 'Turn libraries on or off. Active libs load in the preview and are included when you export.',

  share: 'Copy a link that opens your project in the browser app — great for sharing demos.',
  export: 'Save your project as a ZIP with index.html, style.css, and script.js ready to deploy.',
  reset: 'Restore the default Welcome template. Click twice to confirm.',
  resetConfirm: 'Click again within 3 seconds to reset all editors to the default template.',
  help: 'View keyboard shortcuts for save, export, layout, and editor focus.',

  preview: 'Live output from your HTML, CSS, and JavaScript.',
  viewportFull: 'Preview at full width — no device frame.',
  viewportMobile: 'Preview at 375px width — phone-sized frame.',
  viewportTablet: 'Preview at 768px width — tablet-sized frame.',
  viewportDesktop: 'Preview at 1024px width — small laptop frame.',
  previewBackground: 'Cycle the preview backdrop between white, dark, and checkerboard.',
  console: 'Show JavaScript console output from the preview iframe (errors, logs).',

  paneMaximize: 'Maximize this editor pane; double-click the header to toggle.',
  paneRestore: 'Restore the split layout and show all editor panes again.',
  paneHtml: 'HTML pane — structure and content for your page.',
  paneCss: 'CSS pane — colors, layout, and visual styling.',
  paneJs: 'JavaScript pane — interactivity and logic for the preview.',

  modalClose: 'Close this dialog.',

  paneTab: 'Switch to this editor pane in horizontal layout.',
  exitFullscreenOverlay: 'Exit fullscreen preview and return to the split layout.',
  consoleClear: 'Clear all log entries from the preview console.',
  consoleClose: 'Hide the console panel.',

  aboutCheckUpdates: 'Look for a newer desktop build on GitHub Releases.',
  aboutInstallUpdate: 'Download and install the available update, then restart the app.',
  aboutBugReport: 'Open your email client with a pre-filled bug report template.',
} as const;

export const LIB_HINTS: Record<string, string> = {
  tailwind: 'Utility-first CSS — style with classes like flex, p-4, text-center.',
  fontawesome: 'Icon font library — use <i class="fa-solid fa-star"> in HTML.',
  'animate-css': 'Ready-made CSS animations — add classes like animate__bounce.',
  bootstrap: 'Component CSS framework — grids, buttons, and responsive utilities.',
  gsap: 'Professional animation timeline library for JavaScript.',
  three: '3D WebGL rendering — scenes, cameras, and meshes in the browser.',
  p5: 'Creative coding — canvas drawing and generative art helpers.',
  chartjs: 'Charts and graphs from JSON data — bar, line, pie, and more.',
};

export const TOOL_HINTS = {
  colors: 'Pick a color, choose HEX/RGB/HSL, then insert it into your active CSS or HTML pane.',
  colorPicker: 'Choose a color visually.',
  colorFormat: 'How the inserted color value is formatted.',
  colorInsert: 'Insert the formatted color at your cursor in CSS (or HTML if HTML is active).',
  cssGen: 'Generate common CSS snippets — shadows, radius, flex centering — and insert into CSS.',
  cssPreset: 'Adjust the value, then insert the generated CSS rule.',
  cssInsert: 'Insert the generated CSS at your cursor in the CSS pane.',
  fonts: 'Apply Google Font pairings to the preview, or pick heading/body fonts manually.',
  fontPreset: 'Curated heading + body font combinations for the live preview.',
  fontAdvanced: 'Pick individual heading and body fonts instead of a preset.',
  fontInsert: 'Insert font-family CSS for the active pairing.',
  fontClear: 'Remove font pairing overrides from the preview.',
} as const;
