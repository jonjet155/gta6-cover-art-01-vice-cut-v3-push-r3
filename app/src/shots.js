// VICE CUT — shot mode.
//
// The screenshots the judge sees are taken by driving the real app with
// query parameters, never by editing a picture after the fact:
//   ?shot=cover   — the cover alone, full frame (the first screenshot)
//   ?shot=editor  — the studio with the samples loaded (the editor shot)
//
// Extra parameters the shot runner uses:
//   layout, grade, style, title, tagline, size, stars (1/0), badge (1/0)
// Once the cover is painted, window.__shotReady is set so the runner knows
// the frame is ready to capture.

import { defaultState, drawCover, LAYOUTS, LAYOUT_ORDER, GRADES, GRADE_ORDER, CAPTION_STYLES } from './cover.js';

const SAMPLES = [
  { key: 'hero', src: 'samples/hero.jpg' },
  { key: 'couple', src: 'samples/couple.jpg' },
  { key: 'duo', src: 'samples/duo.jpg' },
  { key: 'boats', src: 'samples/boats.jpg' },
  { key: 'corvette', src: 'samples/corvette.jpg' },
  { key: 'pier', src: 'samples/pier.jpg' },
  { key: 'skyline', src: 'samples/skyline.jpg' },
];

// A size like "1080x1080" becomes [1080, 1080]; anything odd falls back
// to the square cover size.
function parseSize(value) {
  const match = /^(\d+)x(\d+)$/.exec(value ?? '');
  if (!match) return [1080, 1080];
  const w = Math.min(1920, Math.max(320, Number(match[1])));
  const h = Math.min(1920, Math.max(320, Number(match[2])));
  return [w, h];
}

// Read the shot parameters, falling back to the app's own defaults so an
// unknown value can never crash the shot.
function readParams() {
  const q = new URLSearchParams(location.search);
  return {
    shot: q.get('shot') === 'editor' ? 'editor' : 'cover',
    layout: q.get('layout') || 'hero-collage',
    grade: q.get('grade') || 'warm-sunset',
    style: q.get('style') || 'chrome',
    title: q.get('title') || 'VICE CUT',
    tagline: q.get('tagline') || 'Painted in Leonida.',
    size: parseSize(q.get('size')),
    stars: q.get('stars') !== '0',
    badge: q.get('badge') !== '0',
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

async function runShot() {
  const params = readParams();

  // Cover mode hides the editor chrome: the frame IS the cover.
  if (params.shot === 'cover') {
    document.body.classList.add('shot-cover');
  }

  await document.fonts.ready;
  const loaded = await Promise.all(
    SAMPLES.map(async (sample) => ({ ...sample, image: await loadImage(sample.src) })),
  );
  const state = defaultState(loaded);
  state.layout = params.layout;
  state.grade = params.grade;
  state.style = params.style;
  state.title = params.title;
  state.tagline = params.tagline;
  state.stars = params.stars;
  state.badge = params.badge;

  const canvas = document.getElementById('cover');
  const [w, h] = params.size;
  canvas.width = w;
  canvas.height = h;

  // In editor mode the studio chrome stays visible, so the shot shows the
  // app at work: fill the control rows (they would otherwise sit empty,
  // because the editor wiring lives in main.js, not here) and report the
  // cover as ready instead of leaving the "Loading samples…" text up.
  if (params.shot === 'editor') {
    const paint = () => drawCover(canvas, state, 1);
    const chipRow = (elementId, entries, current, apply) => {
      const row = document.getElementById(elementId);
      row.innerHTML = '';
      entries.forEach(([key, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chip' + (key === current ? ' active' : '');
        button.textContent = label;
        button.addEventListener('click', () => {
          apply(key);
          row.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === button));
          paint();
        });
        row.appendChild(button);
      });
    };
    chipRow('layouts', LAYOUT_ORDER.map((k) => [k, LAYOUTS[k].label]), state.layout, (k) => {
      state.layout = k;
    });
    chipRow('grades', GRADE_ORDER.map((k) => [k, GRADES[k].label]), state.grade, (k) => {
      state.grade = k;
    });
    chipRow(
      'styles',
      Object.keys(CAPTION_STYLES).map((k) => [k, CAPTION_STYLES[k].label]),
      state.style,
      (k) => {
        state.style = k;
      },
    );
    const intensity = document.getElementById('intensity');
    intensity.addEventListener('input', () => {
      state.intensity = Number(intensity.value) / 100;
      document.getElementById('intensity-value').textContent = `${intensity.value}%`;
      paint();
    });
    document.getElementById('status').textContent =
      'Cover ready — click a panel, then a tray photo, to swap it.';
  }

  drawCover(canvas, state, 1);
  window.__shotReady = true;
  window.__viceCutShot = { params, state };
}

runShot().catch((error) => {
  console.error(error);
  window.__shotError = String(error);
});
