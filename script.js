const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
const isCompact = window.matchMedia('(max-width: 720px)');

const loader = document.querySelector('.page-loader');
const closeLoader = () => {
  window.setTimeout(() => loader?.classList.add('is-hidden'), 450);
};
window.addEventListener('load', closeLoader, { once: true });
window.setTimeout(closeLoader, 2400);

const header = document.querySelector('.site-header');
const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const navPanel = document.querySelector('.nav-panel');
const navLinks = [...document.querySelectorAll('.nav-link')];
const backToTop = document.querySelector('.back-to-top');

backToTop?.addEventListener('click', (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
});

function toggleMenu(forceOpen) {
  const open = typeof forceOpen === 'boolean' ? forceOpen : !navPanel.classList.contains('open');
  navPanel.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  document.body.classList.toggle('menu-open', open);
}

// A filtered fixed header becomes a containing block on some mobile browsers.
// Portal menu to body below 720px so it always covers viewport after scrolling.
function syncMobileMenuLayer() {
  if (!navPanel || !navbar) return;
  if (isCompact.matches) {
    if (navPanel.parentElement !== document.body) document.body.append(navPanel);
    return;
  }
  if (navPanel.parentElement !== navbar) navbar.append(navPanel);
  toggleMenu(false);
}

syncMobileMenuLayer();
if (typeof isCompact.addEventListener === 'function') {
  isCompact.addEventListener('change', syncMobileMenuLayer);
} else {
  isCompact.addListener(syncMobileMenuLayer);
}

menuToggle?.addEventListener('click', () => toggleMenu());
navLinks.forEach((link) => link.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navPanel?.classList.contains('open')) {
    toggleMenu(false);
    menuToggle?.focus();
  }
});

function updateHeader() {
  const scrolled = window.scrollY > 24;
  header?.classList.toggle('scrolled', scrolled);
  backToTop?.classList.toggle('show', window.scrollY > 640);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const observedSections = [...document.querySelectorAll('main section[id]')];
const activeObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
  if (!visible.length) return;
  const id = visible[0].target.id;
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
}, { rootMargin: '-28% 0px -58% 0px', threshold: [0.05, 0.2, 0.5] });
observedSections.forEach((section) => activeObserver.observe(section));

const roleTarget = document.querySelector('.role-switcher');
const roles = ['Software Developer', 'Java Developer', 'Frontend Developer', 'Problem Solver'];
let roleIndex = 0;
if (roleTarget && !prefersReducedMotion.matches) {
  window.setInterval(() => {
    roleTarget.classList.remove('entering');
    roleTarget.classList.add('leaving');
    window.setTimeout(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      roleTarget.textContent = roles[roleIndex];
      roleTarget.classList.remove('leaving');
      roleTarget.classList.add('entering');
    }, 220);
  }, 2800);
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -45px' });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

function animateCount(element) {
  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || '';
  if (!Number.isFinite(target)) return;
  const duration = 1350;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    element.textContent = Math.floor(target * eased).toLocaleString('en-IN') + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    if (prefersReducedMotion.matches) {
      const suffix = entry.target.dataset.suffix || '';
      entry.target.textContent = `${entry.target.dataset.count}${suffix}`;
    } else {
      animateCount(entry.target);
    }
    observer.unobserve(entry.target);
  });
}, { threshold: 0.45 });
document.querySelectorAll('[data-count]').forEach((element) => countObserver.observe(element));

if (canHover.matches && !prefersReducedMotion.matches) {
  const cursorGlow = document.querySelector('.cursor-glow');
  const position = { x: window.innerWidth * .5, y: window.innerHeight * .5 };
  const rendered = { ...position };
  let cursorFrame = 0;
  const renderCursor = () => {
    rendered.x += (position.x - rendered.x) * .12;
    rendered.y += (position.y - rendered.y) * .12;
    cursorGlow.style.transform = `translate3d(${rendered.x}px, ${rendered.y}px, 0) translate3d(-50%, -50%, 0)`;
    cursorFrame = requestAnimationFrame(renderCursor);
  };
  window.addEventListener('pointermove', (event) => {
    position.x = event.clientX;
    position.y = event.clientY;
  }, { passive: true });
  document.body.classList.add('cursor-ready');
  cursorFrame = requestAnimationFrame(renderCursor);

  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const box = button.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width - .5) * 7;
      const y = ((event.clientY - box.top) / box.height - .5) * 7;
      button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(1100px) rotateX(${y * -3.3}deg) rotateY(${x * 3.3}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

async function initializeThreeScene() {
  if (prefersReducedMotion.matches || !document.querySelector('#three-canvas')) return;
  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js');
  } catch (error) {
    document.documentElement.classList.add('three-unavailable');
    return;
  }

  const mount = document.querySelector('#three-canvas');
  const art = document.querySelector('.hero-art');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isCompact.matches, powerPreference: 'high-performance' });
  } catch (error) {
    document.documentElement.classList.add('three-unavailable');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompact.matches ? 1.15 : 1.65));
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 1, .1, 100);
  camera.position.set(0, 0, 7.2);

  const network = new THREE.Group();
  network.rotation.set(.35, -.34, .08);
  scene.add(network);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.5, 2),
    new THREE.MeshBasicMaterial({ color: 0xa51623, wireframe: true, transparent: true, opacity: .45 })
  );
  network.add(core);
  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.09, 1),
    new THREE.MeshBasicMaterial({ color: 0x6f0d16, wireframe: true, transparent: true, opacity: .22 })
  );
  network.add(inner);

  const nodeCount = isCompact.matches ? 26 : 48;
  const nodePositions = [];
  const pointPositions = new Float32Array(nodeCount * 3);
  for (let index = 0; index < nodeCount; index += 1) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    const radius = 1.7 + Math.random() * 1.2;
    const point = new THREE.Vector3(
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.sin(phi)
    );
    nodePositions.push(point);
    pointPositions[index * 3] = point.x;
    pointPositions[index * 3 + 1] = point.y;
    pointPositions[index * 3 + 2] = point.z;
  }
  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
  const nodes = new THREE.Points(nodeGeometry, new THREE.PointsMaterial({ color: 0xfff0d9, size: .048, transparent: true, opacity: .88, sizeAttenuation: true }));
  network.add(nodes);

  const connectionVertices = [];
  nodePositions.forEach((node, index) => {
    for (let other = index + 1; other < nodePositions.length; other += 1) {
      if (node.distanceTo(nodePositions[other]) < 1.55) {
        connectionVertices.push(node.x, node.y, node.z, nodePositions[other].x, nodePositions[other].y, nodePositions[other].z);
      }
    }
  });
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionVertices, 3));
  const lines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0xb31625, transparent: true, opacity: .25 }));
  network.add(lines);

  const rings = new THREE.Group();
  [2.15, 2.64].forEach((radius, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .009, 5, 100), new THREE.MeshBasicMaterial({ color: index ? 0x680914 : 0xc21b29, transparent: true, opacity: index ? .18 : .32 }));
    ring.rotation.set(index ? 1.1 : .46, index ? -.4 : .2, index ? .7 : 0);
    rings.add(ring);
  });
  network.add(rings);

  const starsGeometry = new THREE.BufferGeometry();
  const starCount = isCompact.matches ? 60 : 125;
  const starPositions = new Float32Array(starCount * 3);
  for (let index = 0; index < starCount * 3; index += 3) {
    starPositions[index] = (Math.random() - .5) * 10;
    starPositions[index + 1] = (Math.random() - .5) * 8;
    starPositions[index + 2] = (Math.random() - .5) * 5 - 1;
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xd8585f, size: .018, transparent: true, opacity: .48 }));
  scene.add(stars);

  const targetPointer = new THREE.Vector2(0, 0);
  const currentPointer = new THREE.Vector2(0, 0);
  if (canHover.matches) {
    art.addEventListener('pointermove', (event) => {
      const rect = art.getBoundingClientRect();
      targetPointer.x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      targetPointer.y = ((event.clientY - rect.top) / rect.height - .5) * 2;
    }, { passive: true });
    art.addEventListener('pointerleave', () => targetPointer.set(0, 0), { passive: true });
  }

  function resize() {
    const { width, height } = mount.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  resize();

  const clock = new THREE.Clock();
  function renderScene() {
    if (document.hidden) {
      requestAnimationFrame(renderScene);
      return;
    }
    const elapsed = clock.getElapsedTime();
    currentPointer.lerp(targetPointer, .035);
    network.rotation.y += .0018;
    network.rotation.x = .35 + Math.sin(elapsed * .4) * .035 + currentPointer.y * .09;
    network.rotation.z = .08 + currentPointer.x * .11;
    network.position.x += (currentPointer.x * .22 - network.position.x) * .035;
    network.position.y += (-currentPointer.y * .18 - network.position.y) * .035;
    core.rotation.y -= .0024;
    inner.rotation.x += .002;
    rings.rotation.z -= .0014;
    stars.rotation.y = elapsed * .011;
    renderer.render(scene, camera);
    requestAnimationFrame(renderScene);
  }
  renderScene();
}

initializeThreeScene();
 
// Login / Signup preview tab switcher
document.querySelectorAll('.auth-tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const parentVisual = btn.closest('.login-visual');
    if (!parentVisual) return;
    parentVisual.querySelectorAll('.auth-tab-btn').forEach((b) => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    parentVisual.querySelectorAll('.auth-screen-layer').forEach((layer) => {
      layer.classList.toggle('active', layer.dataset.view === target);
    });
  });
});

// ─── Spider-Man Scroll Companion ───
(function initSpidey() {
  if (prefersReducedMotion.matches) return;
  if (isCompact.matches) return;

  const rig    = document.getElementById('spidey-rig');
  const figure = document.getElementById('spidey-figure');
  const wall   = document.getElementById('spidey-wall');
  const webSvg = document.getElementById('spidey-web-svg');
  const webLine = document.getElementById('spidey-web-line');
  if (!rig || !figure || !wall || !webSvg || !webLine) return;

  // Config
  const FIGURE_HEIGHT   = 68;   // px — matches CSS
  const VIEWPORT_HEIGHT = () => window.innerHeight;
  const DESCENT_RATIO   = 0.55; // how far down in viewport Spidey hangs (55% from top)
  const CLIMB_SPEED     = 0.18; // lerp factor for climbing up
  const DESCEND_SPEED   = 0.12; // lerp factor for descending

  let prevScrollY    = window.scrollY;
  let mode           = 'descend'; // 'descend' | 'climb'
  let figureY        = VIEWPORT_HEIGHT() * DESCENT_RATIO;  // current rendered Y
  let targetY        = figureY;
  let rafId          = null;
  let modeTimeout    = null;
  let directionBuffer = 0;  // frames in same direction before mode switch

  // Scroll progress 0–1 across full document
  function scrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  }

  // Map scroll position to Spidey Y in viewport (descent mode)
  function descentTargetY() {
    // Spidey tracks scroll: near top = high in viewport, near bottom = low
    const vh = VIEWPORT_HEIGHT();
    const p  = scrollProgress();
    // Range: 8% vh to 80% vh
    return vh * (0.08 + p * 0.72);
  }

  function updateWebLine(y) {
    // Web goes from viewport top to figure top
    const svgH = VIEWPORT_HEIGHT();
    webSvg.setAttribute('viewBox', `0 0 40 ${svgH}`);
    webLine.setAttribute('y2', Math.max(0, y));
  }

  function setMode(newMode) {
    if (mode === newMode) return;
    mode = newMode;

    clearTimeout(modeTimeout);
    modeTimeout = setTimeout(() => {
      if (mode === 'climb') {
        rig.classList.add('climb-mode');
        wall.classList.add('is-visible');
      } else {
        rig.classList.remove('climb-mode');
        wall.classList.remove('is-visible');
      }
    }, mode === 'climb' ? 80 : 200);
  }

  function tick() {
    const curY = window.scrollY;
    const delta = curY - prevScrollY;

    // Determine direction (filter tiny jitter < 1.5px)
    if (Math.abs(delta) > 1.5) {
      if (delta > 0) {
        directionBuffer = Math.min(directionBuffer + 1, 8);
      } else {
        directionBuffer = Math.max(directionBuffer - 1, -8);
      }
    }

    if (directionBuffer >= 3 && mode !== 'descend') setMode('descend');
    if (directionBuffer <= -3 && mode !== 'climb')   setMode('climb');

    prevScrollY = curY;

    const vh = VIEWPORT_HEIGHT();

    if (mode === 'descend') {
      targetY = descentTargetY();
      // Lerp figure toward target
      figureY += (targetY - figureY) * DESCEND_SPEED;

      // Clamp within viewport
      figureY = Math.max(0, Math.min(figureY, vh - FIGURE_HEIGHT));

      figure.style.transform = `translateY(${figureY}px)`;
      updateWebLine(figureY);

      // Subtle sway tied to scroll velocity
      const sway = Math.sin(curY * 0.03) * 3;
      figure.style.transform = `translateY(${figureY}px) translateX(${sway}px)`;

    } else {
      // Climb mode: figure moves UP as scrollY decreases
      targetY = descentTargetY();
      figureY += (targetY - figureY) * CLIMB_SPEED;

      figureY = Math.max(0, Math.min(figureY, vh - FIGURE_HEIGHT));
      figure.style.transform = `translateY(${figureY}px)`;
    }

    rafId = requestAnimationFrame(tick);
  }

  // Start loop
  rafId = requestAnimationFrame(tick);

  // Pause when tab hidden — save CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(tick);
    }
  });

  // Hide if viewport becomes compact (e.g. device rotation)
  if (typeof isCompact.addEventListener === 'function') {
    isCompact.addEventListener('change', (e) => {
      rig.style.display = e.matches ? 'none' : '';
    });
  }
})();

