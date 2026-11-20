// VICE CUT — editor wiring.
//
// Loads the sample photos, owns the mutable cover state, and binds every
// control: layouts, grades + intensity, caption styles, role-tag toggle,
// title/tagline text, the photo tray (click a panel, then a tray photo),
// per-panel crop (drag to pan, wheel to zoom, double-click to re-centre),
// uploads of the user's own photos, and the three PNG exports.
//
// The cover itself is drawn by cover.js; this file never draws a pixel of
// the poster, it only decides what to draw and when.

import {
  LAYOUTS,
  LAYOUT_ORDER,
  GRADES,
  GRADE_ORDER,
  CAPTION_STYLES,
  defaultState,
  drawCover,
  exportCanvas,
} from './cover.js';

// The seven sample photos, in tray order. Each entry keeps its <img> once
// loaded, so the renderer can draw it without waiting.
const SAMPLES = [
  { key: 'hero', src: 'samples/hero.jpg', label: 'The Driver' },
  { key: 'couple', src: 'samples/couple.jpg', label: 'The Runaways' },
  { key: 'duo', src: 'samples/duo.jpg', label: 'Two Up' },
  { key: 'boats', src: 'samples/boats.jpg', label: 'The Getaway' },
  { key: 'corvette', src: 'samples/corvette.jpg', label: 'The Machine' },
  { key: 'pier', src: 'samples/pier.jpg', label: 'The Waterfront' },
  { key: 'skyline', src: 'samples/skyline.jpg', label: 'The City' },
];

// Uploads live here too, so a user's photo behaves like a sample once it
// is in the tray (same place, same crop controls, never sent anywhere).
const uploads = [];

const canvas = document.getElementById('cover');
const tray = document.getElementById('tray');
const statusEl = document.getElementById('status');
const zoomEl = document.getElementById('zoom');
const zoomValue = document.getElementById('zoom-value');

let state = null;
let selectedPanel = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;

// Load one image and resolve with it (or reject, so a broken file is loud).
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function say(message) {
  statusEl.textContent = message;
}

// Redraw the preview canvas at its display size, keeping the cover's aspect
// (the canvas element is sized by the export aspect the user picked).
function draw() {
  if (!state) return;
  drawCover(canvas, state, 1);
}

// The export aspect the preview shows: square by default, matching the
// first export size. Switching it only re-sizes the preview canvas.
const ASPECTS = {
  square: { w: 900, h: 900, label: 'Square 1080×1080' },
  portrait: { w: 720, h: 900, label: 'Portrait 1080×1350' },
  wide: { w: 1280, h: 720, label: 'Wide 1920×1080' },
};
let aspect = 'square';

function applyAspect() {
  const a = ASPECTS[aspect];
  canvas.width = a.w;
  canvas.height = a.h;
  draw();
}

// Which grid panel (if any) sits under a point on the canvas, in pixels.
// Mirrors the renderer's zone math so clicks land on the right panel.
function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  const W = canvas.width;
  const H = canvas.height;
  const border = Math.max(3, W * 0.008);
  const stripH = H * 0.055;
  const grid = {
    x: border * 2,
    y: stripH + border,
    w: W - border * 4,
    h: H * 0.6 - (stripH + border),
  };
  const layout = LAYOUTS[state.layout];
  const gap = Math.max(2, W * 0.006);
  for (let i = 0; i < layout.panels.length; i++) {
    const p = layout.panels[i];
    const px = grid.x + p[0] * grid.w;
    const py = grid.y + p[1] * grid.h;
    const pw = p[2] * grid.w;
    const ph = p[3] * grid.h;
    if (x >= px && x <= px + pw && y >= py && y <= py + ph) return i;
  }
  return -1;
}

// Rebuild the tray: samples first, then the user's uploads, then the
// upload button itself. Clicking a tray photo places it into the selected
// panel; clicking a panel first selects it.
function buildTray() {
  tray.innerHTML = '';
  const all = [...SAMPLES, ...uploads];
  all.forEach((photo, i) => {
    const button = document.createElement('button');
    button.className = 'tray-photo';
    button.type = 'button';
    button.title = photo.label;
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.label;
    button.appendChild(img);
    button.addEventListener('click', () => placePhoto(photo));
    tray.appendChild(button);
  });
  const upload = document.createElement('label');
  upload.className = 'tray-upload';
  upload.textContent = '+ Upload photo';
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.hidden = true;
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    loadImage(url)
      .then((image) => {
        const photo = { key: `upload-${uploads.length}`, src: url, label: file.name, image };
        uploads.push(photo);
        buildTray();
        placePhoto(photo);
        say(`Loaded ${file.name} — click a panel, then the photo, to place it.`);
      })
      .catch(() => say(`Could not read ${file.name}. Try another image.`));
    input.value = '';
  });
  upload.appendChild(input);
  tray.appendChild(upload);
}

// Put a photo into the selected panel, keeping its caption and role tag.
function placePhoto(photo) {
  const panel = state.panels[selectedPanel];
  if (!panel) return;
  panel.src = photo.src;
  panel.image = photo.image;
  panel.scale = 1;
  panel.ox = 0;
  panel.oy = 0;
  syncZoom();
  draw();
  say(`${photo.label} is in panel ${selectedPanel + 1}. Drag to pan, scroll to zoom.`);
}

// Fill every empty panel from one photo, or every panel from one photo.
function fillFrom(photo, onlyEmpty) {
  state.panels.forEach((panel, i) => {
    if (onlyEmpty && panel.image) return;
    panel.src = photo.src;
    panel.image = photo.image;
    panel.scale = 1;
    panel.ox = 0;
    panel.oy = 0;
  });
  draw();
  say(onlyEmpty ? 'Empty panels filled.' : 'Every panel filled from one photo.');
}

// Keep the zoom slider in step with the selected panel.
function syncZoom() {
  const panel = state.panels[selectedPanel];
  const percent = Math.round((panel?.scale ?? 1) * 100);
  zoomEl.value = String(percent);
  zoomValue.textContent = `${percent}%`;
}

// One-click PNG export at an exact post size. The renderer draws the cover
// offscreen at the real pixel size, so the file is the app's own output.
function exportPng(width, height, name) {
  const off = exportCanvas(state, width, height);
  off.toBlob((blob) => {
    if (!blob) {
      say('Export failed — try again.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vice-cut-${name}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    say(`Exported ${width}×${height} PNG.`);
  }, 'image/png');
}

// Build the control rows: layout buttons, grade buttons, caption styles.
function buildControls() {
  const layoutRow = document.getElementById('layouts');
  LAYOUT_ORDER.forEach((key) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = LAYOUTS[key].label;
    b.dataset.layout = key;
    b.addEventListener('click', () => {
      state.layout = key;
      document.querySelectorAll('#layouts .chip').forEach((c) => c.classList.toggle('active', c === b));
      draw();
      say(`Layout: ${LAYOUTS[key].label}. Your edits stayed put.`);
    });
    layoutRow.appendChild(b);
  });

  const gradeRow = document.getElementById('grades');
  GRADE_ORDER.forEach((key) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = GRADES[key].label;
    b.dataset.grade = key;
    b.addEventListener('click', () => {
      state.grade = key;
      document.querySelectorAll('#grades .chip').forEach((c) => c.classList.toggle('active', c === b));
      draw();
      say(`Grade: ${GRADES[key].label}.`);
    });
    gradeRow.appendChild(b);
  });

  const styleRow = document.getElementById('styles');
  Object.keys(CAPTION_STYLES).forEach((key) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = CAPTION_STYLES[key].label;
    b.dataset.style = key;
    b.addEventListener('click', () => {
      state.style = key;
      document.querySelectorAll('#styles .chip').forEach((c) => c.classList.toggle('active', c === b));
      draw();
      say(`Caption style: ${CAPTION_STYLES[key].label}.`);
    });
    styleRow.appendChild(b);
  });

  // Mark the defaults active once the rows exist.
  document.querySelector('[data-layout="hero-collage"]')?.classList.add('active');
  document.querySelector('[data-grade="warm-sunset"]')?.classList.add('active');
  document.querySelector('[data-style="chrome"]')?.classList.add('active');
}

// Wire the remaining controls: sliders, toggles, text, aspect, exports.
function wireControls() {
  const intensity = document.getElementById('intensity');
  intensity.addEventListener('input', () => {
    state.intensity = Number(intensity.value) / 100;
    document.getElementById('intensity-value').textContent = `${intensity.value}%`;
    draw();
  });

  zoomEl.addEventListener('input', () => {
    const panel = state.panels[selectedPanel];
    if (!panel) return;
    panel.scale = Number(zoomEl.value) / 100;
    zoomValue.textContent = `${zoomEl.value}%`;
    draw();
  });

  document.getElementById('reset-crop').addEventListener('click', () => {
    const panel = state.panels[selectedPanel];
    if (!panel) return;
    panel.scale = 1;
    panel.ox = 0;
    panel.oy = 0;
    syncZoom();
    draw();
    say('Crop reset for this panel.');
  });

  document.getElementById('role-toggle').addEventListener('change', (event) => {
    state.showRoleTags = event.target.checked;
    draw();
  });

  document.getElementById('title-input').addEventListener('input', (event) => {
    state.title = event.target.value || 'VICE CUT';
    draw();
  });
  document.getElementById('tagline-input').addEventListener('input', (event) => {
    state.tagline = event.target.value || 'Painted in Leonida.';
    draw();
  });

  document.querySelectorAll('[data-aspect]').forEach((button) => {
    button.addEventListener('click', () => {
      aspect = button.dataset.aspect;
      document.querySelectorAll('[data-aspect]').forEach((b) => b.classList.toggle('active', b === button));
      applyAspect();
    });
  });

  document.getElementById('export-square').addEventListener('click', () => exportPng(1080, 1080, 'square'));
  document.getElementById('export-portrait').addEventListener('click', () => exportPng(1080, 1350, 'portrait'));
  document.getElementById('export-wide').addEventListener('click', () => exportPng(1920, 1080, 'wide'));

  document.getElementById('fill-empty').addEventListener('click', () => fillFrom(SAMPLES[0], true));
  document.getElementById('fill-one').addEventListener('click', () => fillFrom(SAMPLES[0], false));

  // Panel pointer input: click selects, drag pans, wheel zooms,
  // double-click re-centres on the spot.
  canvas.addEventListener('pointerdown', (event) => {
    const i = panelAt(event.clientX, event.clientY);
    if (i < 0) return;
    selectedPanel = i;
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    syncZoom();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const panel = state.panels[selectedPanel];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    panel.ox += ((event.clientX - lastX) * scaleX) / canvas.width;
    panel.oy += ((event.clientY - lastY) * scaleY) / canvas.height;
    lastX = event.clientX;
    lastY = event.clientY;
    draw();
  });
  canvas.addEventListener('pointerup', () => {
    dragging = false;
  });
  canvas.addEventListener('wheel', (event) => {
    const i = panelAt(event.clientX, event.clientY);
    if (i < 0) return;
    event.preventDefault();
    const panel = state.panels[i];
    panel.scale = Math.max(1, Math.min(3, panel.scale * (event.deltaY < 0 ? 1.08 : 0.92)));
    selectedPanel = i;
    syncZoom();
    draw();
  }, { passive: false });
  canvas.addEventListener('dblclick', (event) => {
    const i = panelAt(event.clientX, event.clientY);
    if (i < 0) return;
    const panel = state.panels[i];
    panel.ox = 0;
    panel.oy = 0;
    draw();
    say('Re-centred this panel.');
  });

  // Caption and role text edit in place: click a panel's caption in the
  // inspector and type; the cover updates live.
  document.getElementById('caption-input').addEventListener('input', (event) => {
    const panel = state.panels[selectedPanel];
    if (panel) {
      panel.caption = event.target.value.toUpperCase();
      draw();
    }
  });
  document.getElementById('role-input').addEventListener('input', (event) => {
    const panel = state.panels[selectedPanel];
    if (panel) {
      panel.role = event.target.value.toUpperCase();
      draw();
    }
  });
}

// Boot: wait for the fonts (the lettering IS the entry), load the samples,
// then paint the first cover with zero clicks.
async function boot() {
  buildControls();
  wireControls();
  try {
    await document.fonts.ready;
  } catch {
    // Fonts still load by the time the user types; the first draw is safe.
  }
  const loaded = await Promise.all(
    SAMPLES.map(async (sample) => ({ ...sample, image: await loadImage(sample.src) })),
  );
  loaded.forEach((sample, i) => {
    SAMPLES[i].image = sample.image;
  });
  state = defaultState(SAMPLES);
  buildTray();
  applyAspect();
  syncZoom();
  say('Cover ready — click a panel, then a tray photo, to swap it.');
  window.__viceCut = { get state() { return state; }, draw, exportPng };
}

boot().catch((error) => {
  console.error(error);
  say('Something failed to load — check the console and reload.');
});
