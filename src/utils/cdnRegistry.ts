import type { CDNLibrary } from '../types/editor.types';

export const CDN_REGISTRY: CDNLibrary[] = [
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'css',
    version: '4.0',
    tag: '<script src="https://cdn.tailwindcss.com"></script>',
  },
  {
    id: 'fontawesome',
    name: 'Font Awesome',
    category: 'css',
    version: '6.5.1',
    tag: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" />',
  },
  {
    id: 'animate-css',
    name: 'Animate.css',
    category: 'css',
    version: '4.1.1',
    tag: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />',
  },
  {
    id: 'bootstrap',
    name: 'Bootstrap',
    category: 'css',
    version: '5.3.2',
    tag: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" crossorigin="anonymous" />',
  },
  {
    id: 'gsap',
    name: 'GSAP',
    category: 'js',
    version: '3.12.5',
    tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>',
  },
  {
    id: 'three',
    name: 'Three.js',
    category: 'js',
    version: 'r170',
    tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
  },
  {
    id: 'p5',
    name: 'p5.js',
    category: 'js',
    version: '1.9.4',
    tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"></script>',
  },
  {
    id: 'chartjs',
    name: 'Chart.js',
    category: 'js',
    version: '4.4.1',
    tag: '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>',
  },
];
