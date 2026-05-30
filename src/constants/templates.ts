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
    id: 'blank',
    name: 'Blank',
    description: 'Empty canvas',
    html: '',
    css: '',
    js: '',
    libraries: [],
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Hero section with CTA',
    html: `<header class="hero">
  <nav class="nav">
    <span class="logo">Acme</span>
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
      <button class="btn-primary">Start Free Trial</button>
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

.hero-buttons { display: flex; gap: 1rem; justify-content: center; }

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
    js: `document.querySelector('.btn-primary').addEventListener('click', () => {
  alert('Starting your free trial!');
});`,
    libraries: [],
  },
  {
    id: 'canvas',
    name: 'Canvas Animation',
    description: 'Animated particles on HTML5 Canvas',
    html: `<canvas id="canvas"></canvas>`,
    css: `* { margin: 0; padding: 0; }
body { overflow: hidden; background: #000; }
canvas { display: block; }`,
    js: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
for (let i = 0; i < 100; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    r: Math.random() * 3 + 1,
  });
}

function draw() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = \`hsl(\${(p.x + p.y) * 0.1 % 360}, 70%, 60%)\`;
    ctx.fill();
  });

  particles.forEach((a, i) => {
    particles.slice(i + 1).forEach(b => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.strokeStyle = \`rgba(255, 255, 255, \${1 - dist / 120})\`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });
  });

  requestAnimationFrame(draw);
}
draw();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});`,
    libraries: [],
  },
  {
    id: 'grid-gallery',
    name: 'CSS Grid Gallery',
    description: 'Responsive image grid layout',
    html: `<div class="gallery">
  <div class="card card-wide">
    <div class="card-img" style="background: linear-gradient(135deg, #667eea, #764ba2)"></div>
    <h3>Featured Project</h3>
    <p>A showcase of modern design principles</p>
  </div>
  <div class="card">
    <div class="card-img" style="background: linear-gradient(135deg, #f093fb, #f5576c)"></div>
    <h3>Photography</h3>
    <p>Urban landscapes</p>
  </div>
  <div class="card">
    <div class="card-img" style="background: linear-gradient(135deg, #4facfe, #00f2fe)"></div>
    <h3>Illustration</h3>
    <p>Digital artwork</p>
  </div>
  <div class="card card-tall">
    <div class="card-img" style="background: linear-gradient(135deg, #43e97b, #38f9d7)"></div>
    <h3>Branding</h3>
    <p>Identity systems and guidelines</p>
  </div>
  <div class="card">
    <div class="card-img" style="background: linear-gradient(135deg, #fa709a, #fee140)"></div>
    <h3>Motion</h3>
    <p>Animation reel</p>
  </div>
  <div class="card">
    <div class="card-img" style="background: linear-gradient(135deg, #a18cd1, #fbc2eb)"></div>
    <h3>Print</h3>
    <p>Editorial design</p>
  </div>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, sans-serif;
  background: #111;
  color: #eee;
  padding: 2rem;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: #1a1a1a;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
}

.card-img { height: 180px; }
.card-wide { grid-column: span 2; }
.card-wide .card-img { height: 240px; }
.card-tall { grid-row: span 2; }
.card-tall .card-img { height: 100%; min-height: 200px; }

h3 { padding: 1rem 1rem 0.25rem; font-size: 1rem; }
p { padding: 0 1rem 1rem; font-size: 0.85rem; color: #888; }`,
    js: `document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    card.style.outline = '2px solid #818cf8';
    setTimeout(() => card.style.outline = '', 1000);
  });
});`,
    libraries: [],
  },
  {
    id: 'form-validation',
    name: 'Form + Validation',
    description: 'Styled form with JS validation',
    html: `<div class="form-container">
  <h2>Create Account</h2>
  <form id="signup-form" novalidate>
    <div class="field">
      <label for="name">Full Name</label>
      <input type="text" id="name" placeholder="John Doe" required>
      <span class="error" id="name-error"></span>
    </div>
    <div class="field">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="john@example.com" required>
      <span class="error" id="email-error"></span>
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input type="password" id="password" placeholder="Min 8 characters" required>
      <span class="error" id="password-error"></span>
    </div>
    <button type="submit">Sign Up</button>
  </form>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: #e2e8f0;
}

.form-container {
  background: #1e293b;
  padding: 2.5rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

h2 { margin-bottom: 1.5rem; font-size: 1.5rem; }

.field { margin-bottom: 1.25rem; }

label {
  display: block;
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.4rem;
}

input {
  width: 100%;
  padding: 0.7rem 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}
input:focus { border-color: #6366f1; }
input.invalid { border-color: #ef4444; }
input.valid { border-color: #22c55e; }

.error {
  display: block;
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.3rem;
  min-height: 1rem;
}

button {
  width: 100%;
  padding: 0.8rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}
button:hover { background: #4f46e5; }`,
    js: `const form = document.getElementById('signup-form');

function validate(field, errorEl, test, message) {
  if (!test) {
    field.classList.add('invalid');
    field.classList.remove('valid');
    errorEl.textContent = message;
    return false;
  }
  field.classList.remove('invalid');
  field.classList.add('valid');
  errorEl.textContent = '';
  return true;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');

  const v1 = validate(name, document.getElementById('name-error'),
    name.value.trim().length >= 2, 'Name must be at least 2 characters');
  const v2 = validate(email, document.getElementById('email-error'),
    /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.value), 'Enter a valid email');
  const v3 = validate(password, document.getElementById('password-error'),
    password.value.length >= 8, 'Password must be at least 8 characters');

  if (v1 && v2 && v3) {
    console.log('Form submitted:', { name: name.value, email: email.value });
  }
});`,
    libraries: [],
  },
  {
    id: 'threejs',
    name: 'Three.js Scene',
    description: 'Rotating cube with lighting',
    html: `<div id="three-container"></div>`,
    css: `* { margin: 0; padding: 0; }
body { overflow: hidden; background: #000; }
#three-container { width: 100vw; height: 100vh; }`,
    js: `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('three-container').appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({
  color: 0x6366f1,
  metalness: 0.3,
  roughness: 0.4,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambient);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});`,
    libraries: [
      {
        id: 'three',
        name: 'Three.js',
        category: 'js' as const,
        version: 'r170',
        tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
      },
    ],
  },
];
