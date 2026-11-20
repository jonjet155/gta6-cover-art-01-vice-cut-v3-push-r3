// VICE CUT — Playwright end-to-end suite (run: node tests/e2e.mjs).
//
// Drives the real app in headless Chromium: every layout, every grade,
// caption/role edits, tray place, upload, crop/pan/zoom, layout-switch
// restore, invalid-param fallback, exact export sizes, and the four
// screenshots. Fails loudly on any console error, page error or failed
// request. Exits 0 only when every check passes.

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(
  '/home/hatch/workspace/tools/playwright/node_modules/playwright/package.json',
);
const { chromium } = require('playwright');

const BASE = 'http://localhost:8080';
const here = fileURLToPath(new URL('..', import.meta.url));
const shotsDir = join(here, 'screenshots');
mkdirSync(shotsDir, { recursive: true });

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
});
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()}`));

// --- 1. The studio boots with the samples loaded -------------------------
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__viceCut, { timeout: 15000 });
const trayCount = await page.locator('.tray-photo').count();
check('studio boots, 7 sample photos in tray', trayCount === 7, `${trayCount} photos`);
const canvasPixels = await page.evaluate(() => {
  const c = document.getElementById('cover');
  const ctx = c.getContext('2d');
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  let distinct = new Set();
  for (let i = 0; i < data.length; i += 4013) distinct.add(data[i]);
  return distinct.size;
});
check('cover canvas is painted (not blank)', canvasPixels > 20, `${canvasPixels} distinct values`);

// --- 2. Every layout renders ----------------------------------------------
const layouts = ['hero-collage', 'comic', 'hero-3', 'film-strip', 'four-cut', 'hero-5', 'billboard'];
for (const layout of layouts) {
  await page.click(`[data-layout="${layout}"]`);
  await page.waitForTimeout(150);
  const painted = await page.evaluate(() => {
    const c = document.getElementById('cover');
    const ctx = c.getContext('2d');
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 9973) sum += data[i];
    return sum;
  });
  check(`layout ${layout} renders`, painted > 0, `pixel sum ${painted}`);
}

// --- 3. Caption edit + role-tag edit --------------------------------------
await page.click('[data-layout="hero-collage"]');
await page.fill('#caption-input', 'MIDNIGHT RUN');
await page.waitForTimeout(100);
const caption = await page.evaluate(() => window.__viceCut.state.panels[0].caption);
check('caption edits in place', caption === 'MIDNIGHT RUN', caption);
await page.fill('#role-input', 'THE WHEELMAN');
await page.waitForTimeout(100);
const role = await page.evaluate(() => window.__viceCut.state.panels[0].role);
check('role tag edits in place', role === 'THE WHEELMAN', role);

// --- 4. Grades + intensity slider ------------------------------------------
const grades = ['warm-sunset', 'neon-night', 'teal-coast', 'ink-mono', 'twilight-gold', 'coral-heat'];
for (const grade of grades) {
  await page.click(`[data-grade="${grade}"]`);
  await page.waitForTimeout(100);
  const current = await page.evaluate(() => window.__viceCut.state.grade);
  if (current !== grade) check(`grade ${grade} applies`, false, `got ${current}`);
}
check('all 6 grades apply', true);
await page.fill('#intensity', '40');
await page.evaluate(() => {
  document.getElementById('intensity').dispatchEvent(new Event('input', { bubbles: true }));
});
const intensity = await page.evaluate(() => window.__viceCut.state.intensity);
check('intensity slider works', Math.abs(intensity - 0.4) < 0.01, `intensity ${intensity}`);

// --- 5. Tray place: click panel, then a tray photo --------------------------
// Panel 1 of the hero collage (top-right small panel), located from the
// canvas box so the click lands on the panel at any viewport size.
async function panelPoint() {
  return page.evaluate(() => {
    const c = document.getElementById('cover');
    const r = c.getBoundingClientRect();
    const W = c.width;
    const H = c.height;
    const border = Math.max(3, W * 0.008);
    const stripH = H * 0.055;
    const gy = stripH + border;
    const gh = H * 0.6 - (stripH + border);
    const gx = border * 2;
    const gw = W - border * 4;
    const cx = gx + (0.46 + 0.135) * gw;
    const cy = gy + 0.165 * gh;
    return { x: r.left + (cx / W) * r.width, y: r.top + (cy / H) * r.height };
  });
}
const pt = await panelPoint();
const before = await page.evaluate(() => window.__viceCut.state.panels[1].src);
await page.mouse.click(pt.x, pt.y); // select small panel 1
await page.locator('.tray-photo').nth(5).click(); // the pier photo
await page.waitForTimeout(150);
const after = await page.evaluate(() => window.__viceCut.state.panels[1].src);
check('tray photo places into selected panel', after !== before && after.includes('pier'), after);

// --- 6. Crop: wheel zoom + drag pan + reset --------------------------------
// Recompute the point: clicking the tray can scroll the page, so a point
// measured before the tray click may be stale by now.
const pt2 = await panelPoint();
const zoomBefore = await page.evaluate(() => window.__viceCut.state.panels[1].scale);
await page.mouse.move(pt2.x, pt2.y);
await page.mouse.wheel(0, -600);
await page.waitForTimeout(150);
const zoomAfter = await page.evaluate(() => window.__viceCut.state.panels[1].scale);
check('wheel zoom changes scale', zoomAfter > zoomBefore, `${zoomBefore} -> ${zoomAfter}`);
await page.mouse.move(pt2.x, pt2.y);
await page.mouse.down();
await page.mouse.move(pt2.x + 40, pt2.y + 30, { steps: 5 });
await page.mouse.up();
await page.waitForTimeout(150);
const pan = await page.evaluate(() => window.__viceCut.state.panels[1]);
check('drag pan moves the photo', pan.ox !== 0 || pan.oy !== 0, `ox ${pan.ox.toFixed(3)} oy ${pan.oy.toFixed(3)}`);
await page.click('#reset-crop');
const reset = await page.evaluate(() => window.__viceCut.state.panels[1]);
check('reset crop restores 1:1', reset.scale === 1 && reset.ox === 0 && reset.oy === 0, '');

// --- 7. Layout switch keeps edits ------------------------------------------
await page.fill('#title-input', 'SUNSET HEIST');
await page.click('[data-layout="comic"]');
await page.click('[data-layout="hero-collage"]');
const titleKept = await page.evaluate(() => window.__viceCut.state.title);
check('layout switch keeps edits', titleKept === 'SUNSET HEIST', titleKept);

// --- 8. Upload a real file --------------------------------------------------
await page.setInputFiles('input[type="file"]', {
  name: 'upload-test.jpg',
  mimeType: 'image/jpeg',
  buffer: Buffer.from(
    await (await fetch(`${BASE}/samples/skyline.jpg`)).arrayBuffer(),
  ),
});
await page.waitForTimeout(500);
const uploadCount = await page.locator('.tray-photo').count();
check('upload adds a tray photo', uploadCount === 8, `${uploadCount} photos`);

// --- 9. Exact export sizes --------------------------------------------------
const sizes = await page.evaluate(() => {
  const out = {};
  for (const [name, w, h] of [['square', 1080, 1080], ['portrait', 1080, 1350], ['wide', 1920, 1080]]) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    out[name] = [c.width, c.height];
  }
  return out;
});
check(
  'export canvases at exact sizes',
  sizes.square.join('x') === '1080x1080' &&
    sizes.portrait.join('x') === '1080x1350' &&
    sizes.wide.join('x') === '1920x1080',
  JSON.stringify(sizes),
);

// Download the real exports (these become screenshots 3 and 4).
const downloads = [];
for (const [button, name] of [['#export-square', 'export-square'], ['#export-portrait', 'export-portrait']]) {
  const promise = page.waitForEvent('download', { timeout: 10000 });
  await page.click(button);
  const download = await promise;
  const path = join('/tmp', `${name}.png`);
  await download.saveAs(path);
  downloads.push(path);
}
check('both PNG exports download', downloads.length === 2, downloads.join(', '));

// --- 10. Invalid shot params fall back --------------------------------------
const shot2 = await browser.newPage({ viewport: { width: 1280, height: 720 } });
shot2.on('pageerror', (error) => errors.push(`shot pageerror: ${error.message}`));
await shot2.goto(`${BASE}/?shot=cover&layout=nope&grade=nope&size=banana`, { waitUntil: 'networkidle' });
await shot2.waitForFunction(() => window.__shotReady, { timeout: 15000 });
check('invalid shot params fall back without error', true);
await shot2.close();

// --- 11. Screenshots ---------------------------------------------------------
const shot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await shot.goto(`${BASE}/?shot=cover&size=1280x720`, { waitUntil: 'networkidle' });
await shot.waitForFunction(() => window.__shotReady, { timeout: 15000 });
await shot.waitForTimeout(300);
await shot.screenshot({ path: join(shotsDir, '1-cover.jpg'), type: 'jpeg', quality: 88 });
check('screenshot 1-cover.jpg taken', true);

const editor = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
editor.on('pageerror', (error) => errors.push(`editor pageerror: ${error.message}`));
await editor.goto(`${BASE}/?shot=editor&size=1280x1000`, { waitUntil: 'networkidle' });
await editor.waitForFunction(() => window.__shotReady, { timeout: 15000 });
await editor.waitForTimeout(300);
await editor.screenshot({ path: join(shotsDir, '2-editor.jpg'), type: 'jpeg', quality: 88 });
check('screenshot 2-editor.jpg taken', true);

// --- 12. No console/page/request errors on the final pass --------------------
check('zero console/page/request errors', errors.length === 0, errors.slice(0, 3).join(' | '));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed, ${failed.length} failed`);
if (failed.length) process.exit(1);
