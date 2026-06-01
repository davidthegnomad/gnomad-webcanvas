import type { FontPairingPreset } from '../types/editor.types';

export const FONT_PAIRINGS: FontPairingPreset[] = [
  { id: 'modern', name: 'Modern', description: 'Clean geometric sans', headingFont: 'Inter', bodyFont: 'Source Serif 4', category: 'mixed' },
  { id: 'editorial', name: 'Editorial', description: 'Classic editorial feel', headingFont: 'Playfair Display', bodyFont: 'Lato', category: 'mixed' },
  { id: 'technical', name: 'Technical', description: 'Sharp and precise', headingFont: 'Space Grotesk', bodyFont: 'IBM Plex Sans', category: 'sans' },
  { id: 'elegant', name: 'Elegant', description: 'Refined serif pairing', headingFont: 'Cormorant Garamond', bodyFont: 'Proza Libre', category: 'mixed' },
  { id: 'bold', name: 'Bold', description: 'High-impact headlines', headingFont: 'Sora', bodyFont: 'DM Sans', category: 'sans' },
  { id: 'creative', name: 'Creative', description: 'Expressive and playful', headingFont: 'Outfit', bodyFont: 'Nunito', category: 'sans' },
  { id: 'newspaper', name: 'Newspaper', description: 'Traditional press style', headingFont: 'Libre Baskerville', bodyFont: 'Source Sans 3', category: 'mixed' },
  { id: 'minimal', name: 'Minimal', description: 'Understated and neutral', headingFont: 'Manrope', bodyFont: 'Karla', category: 'sans' },
];

export interface AvailableFont {
  name: string;
  category: 'sans-serif' | 'serif' | 'display';
}

export const AVAILABLE_FONTS: AvailableFont[] = [
  { name: 'Inter', category: 'sans-serif' },
  { name: 'Lato', category: 'sans-serif' },
  { name: 'DM Sans', category: 'sans-serif' },
  { name: 'Nunito', category: 'sans-serif' },
  { name: 'Karla', category: 'sans-serif' },
  { name: 'Manrope', category: 'sans-serif' },
  { name: 'IBM Plex Sans', category: 'sans-serif' },
  { name: 'Source Sans 3', category: 'sans-serif' },
  { name: 'Space Grotesk', category: 'sans-serif' },
  { name: 'Sora', category: 'sans-serif' },
  { name: 'Outfit', category: 'sans-serif' },
  { name: 'Proza Libre', category: 'sans-serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Source Serif 4', category: 'serif' },
  { name: 'Cormorant Garamond', category: 'serif' },
  { name: 'Libre Baskerville', category: 'serif' },
];
