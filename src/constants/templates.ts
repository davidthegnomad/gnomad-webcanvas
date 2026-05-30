import type { CDNLibrary } from '../types/editor.types';

export interface Template {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
  libraries: CDNLibrary[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Marketing hero with CTA',
    html: `<header class="hero">
  <nav class="nav">
    <span class="logo">Your Brand</span>
    <div class="nav-links">
      <a href="#">Features</a>
      <a href="#">Pricing</a>
      <a href="#" class="cta-link">Get Started</a>
    </div>
  </nav>
  <div class="hero-content">
    <h1>Build something amazing</h1>
    <p>The modern toolkit for creators who ship fast and iterate faster.</p>
    <div class="hero-buttons">
      <button class="btn-primary" id="cta-btn">Start Free Trial</button>
      <button class="btn-secondary">Watch Demo</button>
    </div>
  </div>
</header>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0a0a0a;
  color: #fafafa;
  min-height: 100vh;
}

.hero {
  min-height: 100vh;
  background: radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0a 70%);
  padding: 2rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo { font-size: 1.5rem; font-weight: 700; }

.nav-links { display: flex; gap: 2rem; align-items: center; }
.nav-links a { color: #888; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
.nav-links a:hover { color: #fff; }
.cta-link { color: #818cf8 !important; }

.hero-content {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  padding-top: 15vh;
}

h1 {
  font-size: 3.5rem;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #fff, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-content p {
  font-size: 1.2rem;
  color: #888;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.hero-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

.btn-primary {
  padding: 0.8rem 2rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover { background: #4f46e5; }

.btn-secondary {
  padding: 0.8rem 2rem;
  background: transparent;
  color: #ccc;
  border: 1px solid #333;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.btn-secondary:hover { border-color: #666; color: #fff; }`,
    js: `document.getElementById('cta-btn')?.addEventListener('click', () => {
  console.log('CTA clicked — ready for your action');
});`,
    libraries: [],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Showcase work and skills',
    html: `<div class="page">
  <header class="intro">
    <p class="eyebrow">Portfolio</p>
    <h1>Hi, I'm Alex Rivera</h1>
    <p class="tagline">Designer & front-end developer building thoughtful digital experiences.</p>
  </header>

  <section class="projects">
    <h2>Selected Work</h2>
    <div class="grid">
      <article class="card">
        <div class="thumb" style="background: linear-gradient(135deg, #667eea, #764ba2)"></div>
        <h3>Brand Refresh</h3>
        <p>Identity system for a growing SaaS startup.</p>
      </article>
      <article class="card">
        <div class="thumb" style="background: linear-gradient(135deg, #f093fb, #f5576c)"></div>
        <h3>E-commerce UI</h3>
        <p>Mobile-first checkout flow redesign.</p>
      </article>
      <article class="card">
        <div class="thumb" style="background: linear-gradient(135deg, #4facfe, #00f2fe)"></div>
        <h3>Marketing Site</h3>
        <p>High-converting landing page for a local agency.</p>
      </article>
    </div>
  </section>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
}

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: #818cf8;
  margin-bottom: 0.75rem;
}

h1 { font-size: 2.75rem; margin-bottom: 0.75rem; }
.tagline { color: #94a3b8; max-width: 540px; line-height: 1.6; }

.projects { margin-top: 3rem; }
.projects h2 { font-size: 1.25rem; margin-bottom: 1.25rem; color: #cbd5e1; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.card {
  background: #1e293b;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

.thumb { height: 140px; }
.card h3 { padding: 1rem 1rem 0.25rem; font-size: 1rem; }
.card p { padding: 0 1rem 1rem; font-size: 0.85rem; color: #94a3b8; }`,
    js: `document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    card.style.outline = '2px solid #818cf8';
    setTimeout(() => { card.style.outline = ''; }, 800);
  });
});`,
    libraries: [],
  },
  {
    id: 'business',
    name: 'Local Business',
    description: 'Service business homepage',
    html: `<div class="page">
  <nav class="topbar">
    <strong>Harbor Coffee Co.</strong>
    <span>Open daily 7am – 6pm</span>
  </nav>

  <section class="hero">
    <h1>Fresh roasts. Warm welcomes.</h1>
    <p>Neighborhood coffee shop serving single-origin espresso, pastries, and good conversation since 2012.</p>
    <button class="btn" id="order-btn">View Menu</button>
  </section>

  <section class="features">
    <div class="feature">
      <h3>☕ Specialty Drinks</h3>
      <p>Lattes, cold brew, seasonal pours.</p>
    </div>
    <div class="feature">
      <h3>🥐 Fresh Pastries</h3>
      <p>Baked locally every morning.</p>
    </div>
    <div class="feature">
      <h3>📍 Downtown Location</h3>
      <p>142 Main Street — free Wi‑Fi.</p>
    </div>
  </section>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: Georgia, 'Times New Roman', serif;
  background: #faf7f2;
  color: #3d2c1e;
}

.page { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 3rem; }

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #7c6a58;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hero { text-align: center; margin-bottom: 3rem; }
.hero h1 { font-size: 2.5rem; margin-bottom: 1rem; line-height: 1.2; }
.hero p { max-width: 520px; margin: 0 auto 1.5rem; color: #6b5744; line-height: 1.7; }

.btn {
  padding: 0.75rem 1.75rem;
  background: #8b5e34;
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn:hover { background: #6f4a28; }

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.feature {
  background: #fff;
  border: 1px solid #e8dfd3;
  border-radius: 0.75rem;
  padding: 1.25rem;
  text-align: center;
}
.feature h3 { font-size: 1rem; margin-bottom: 0.5rem; }
.feature p { font-size: 0.9rem; color: #7c6a58; }`,
    js: `document.getElementById('order-btn')?.addEventListener('click', () => {
  console.log('Menu link — replace with your menu page');
});`,
    libraries: [],
  },
  {
    id: 'blog',
    name: 'Blog / Article',
    description: 'Content-focused reading layout',
    html: `<article class="post">
  <header>
    <p class="meta">May 30, 2026 · 5 min read</p>
    <h1>How to prototype faster with live preview</h1>
    <p class="deck">A practical workflow for testing HTML/CSS ideas before you commit to a full build.</p>
  </header>

  <figure class="cover"></figure>

  <div class="content">
    <p>Live preview tools remove the guesswork from front-end experiments. Instead of saving, refreshing, and context-switching, you see every change as you type.</p>
    <h2>Start with structure</h2>
    <p>Sketch your HTML first — headings, sections, and calls to action. Style comes second once the content hierarchy feels right.</p>
    <blockquote>Good prototypes answer questions cheaply.</blockquote>
    <p>Iterate in small loops: edit, preview, adjust. Ship when the layout communicates clearly on mobile and desktop.</p>
  </div>
</article>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, sans-serif;
  background: #fff;
  color: #1e293b;
  line-height: 1.7;
}

.post {
  max-width: 680px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
}

.meta {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

h1 {
  font-size: 2.25rem;
  line-height: 1.2;
  margin-bottom: 0.75rem;
}

.deck {
  font-size: 1.15rem;
  color: #475569;
  margin-bottom: 2rem;
}

.cover {
  height: 220px;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #c7d2fe, #fbcfe8);
  margin-bottom: 2rem;
}

.content p { margin-bottom: 1.25rem; }
.content h2 { font-size: 1.35rem; margin: 2rem 0 0.75rem; }

blockquote {
  border-left: 4px solid #6366f1;
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: #475569;
  font-style: italic;
}`,
    js: '',
    libraries: [],
  },
  {
    id: 'contact',
    name: 'Contact Page',
    description: 'Form with validation',
    html: `<div class="page">
  <header class="header">
    <h1>Get in touch</h1>
    <p>Tell us about your project — we typically reply within one business day.</p>
  </header>

  <form id="contact-form" novalidate>
    <div class="field">
      <label for="name">Name</label>
      <input type="text" id="name" placeholder="Your name" required>
      <span class="error" id="name-error"></span>
    </div>
    <div class="field">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="you@example.com" required>
      <span class="error" id="email-error"></span>
    </div>
    <div class="field">
      <label for="message">Message</label>
      <textarea id="message" rows="5" placeholder="How can we help?" required></textarea>
      <span class="error" id="message-error"></span>
    </div>
    <button type="submit">Send Message</button>
  </form>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}

.page {
  width: 100%;
  max-width: 440px;
  background: #1e293b;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

.header { margin-bottom: 1.5rem; }
.header h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
.header p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }

.field { margin-bottom: 1.1rem; }

label {
  display: block;
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.35rem;
}

input, textarea {
  width: 100%;
  padding: 0.7rem 0.9rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  font: inherit;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
}
input:focus, textarea:focus { border-color: #6366f1; }
input.invalid, textarea.invalid { border-color: #ef4444; }

.error {
  display: block;
  font-size: 0.75rem;
  color: #ef4444;
  min-height: 1rem;
  margin-top: 0.25rem;
}

button {
  width: 100%;
  padding: 0.8rem;
  margin-top: 0.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover { background: #4f46e5; }`,
    js: `const form = document.getElementById('contact-form');

function showError(field, errorEl, ok, message) {
  field.classList.toggle('invalid', !ok);
  errorEl.textContent = ok ? '' : message;
  return ok;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const message = document.getElementById('message');

  const v1 = showError(name, document.getElementById('name-error'), name.value.trim().length >= 2, 'Enter your name');
  const v2 = showError(email, document.getElementById('email-error'), /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.value), 'Enter a valid email');
  const v3 = showError(message, document.getElementById('message-error'), message.value.trim().length >= 10, 'Message must be at least 10 characters');

  if (v1 && v2 && v3) {
    console.log('Form ready to submit:', { name: name.value, email: email.value, message: message.value });
  }
});`,
    libraries: [],
  },
];
