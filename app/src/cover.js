// VICE CUT — cover renderer.
//
// One function, drawCover(canvas, state), paints the whole poster onto any
// canvas at any size: photo panels, top strip, title band, ribbon, billing.
// The editor preview and the PNG exports are the same drawing at different
// sizes, so the exported cover is exactly what the editor shows.
//
// Layouts are lists of panel rectangles in fractions of the photo-grid zone.
// Grades are a per-photo canvas filter plus a tinted overlay. Caption styles
// are text treatments. Nothing here touches the network: every photo is an
// already-loaded <img> (a sample from app/samples/ or the user's own file).

export const LAYOUTS = {
  'hero-collage': {
    label: 'Hero Collage',
    panels: [
      [0, 0, 0.46, 1],
      [0.46, 0, 0.27, 0.33],
      [0.73, 0, 0.27, 0.33],
      [0.46, 0.33, 0.27, 0.33],
      [0.73, 0.33, 0.27, 0.33],
      [0.46, 0.66, 0.54, 0.34],
    ],
    slant: 0,
  },
  comic: {
    label: 'Comic',
    panels: [
      [0, 0, 0.46, 1],
      [0.46, 0, 0.27, 0.33],
      [0.73, 0, 0.27, 0.33],
      [0.46, 0.33, 0.27, 0.33],
      [0.73, 0.33, 0.27, 0.33],
      [0.46, 0.66, 0.54, 0.34],
    ],
    slant: 0.045,
  },
  'hero-3': {
    label: 'Hero + 3',
    panels: [
      [0, 0, 0.55, 1],
      [0.55, 0, 0.45, 0.33],
      [0.55, 0.33, 0.45, 0.34],
      [0.55, 0.67, 0.45, 0.33],
    ],
    slant: 0,
  },
  'film-strip': {
    label: 'Film Strip',
    panels: [
      [0, 0, 1, 0.66],
      [0, 0.66, 0.2, 0.34],
      [0.2, 0.66, 0.2, 0.34],
      [0.4, 0.66, 0.2, 0.34],
      [0.6, 0.66, 0.2, 0.34],
      [0.8, 0.66, 0.2, 0.34],
    ],
    slant: 0,
  },
  'four-cut': {
    label: 'Four Cut',
    panels: [
      [0, 0, 0.5, 0.5],
      [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5],
    ],
    slant: 0,
  },
  'hero-5': {
    label: 'Hero + 5',
    panels: [
      [0, 0, 0.4, 1],
      [0.4, 0, 0.3, 0.33],
      [0.4, 0.33, 0.3, 0.34],
      [0.4, 0.67, 0.3, 0.33],
      [0.7, 0, 0.3, 0.5],
      [0.7, 0.5, 0.3, 0.5],
    ],
    slant: 0,
  },
  billboard: {
    label: 'Billboard',
    panels: [[0, 0, 1, 1]],
    slant: 0,
  },
};

export const LAYOUT_ORDER = [
  'hero-collage',
  'comic',
  'hero-3',
  'film-strip',
  'four-cut',
  'hero-5',
  'billboard',
];

// Grade = photo filter at full intensity + a tinted overlay. The intensity
// slider scales both back toward "no grade at all".
export const GRADES = {
  'warm-sunset': {
    label: 'Warm Sunset',
    filter: { saturate: 1.28, contrast: 1.06, sepia: 0.28, brightness: 1.02 },
    overlay: ['#ff7a18', '#ff2e88'],
    overlayAlpha: 0.2,
    blend: 'overlay',
  },
  'neon-night': {
    label: 'Neon Night',
    filter: { saturate: 1.65, contrast: 1.16, brightness: 0.94, hue: -18 },
    overlay: ['#7b2ff7', '#00e5ff'],
    overlayAlpha: 0.22,
    blend: 'overlay',
  },
  'teal-coast': {
    label: 'Teal Coast',
    filter: { saturate: 1.22, contrast: 1.05, hue: 12, brightness: 1.03 },
    overlay: ['#0e7c7b', '#a5e8d5'],
    overlayAlpha: 0.22,
    blend: 'soft-light',
  },
  'ink-mono': {
    label: 'Ink Mono',
    filter: { grayscale: 1, contrast: 1.16, brightness: 1.04 },
    overlay: ['#000000', '#ffffff'],
    overlayAlpha: 0,
    blend: 'overlay',
  },
  'twilight-gold': {
    label: 'Twilight Gold',
    filter: { saturate: 1.32, contrast: 1.06, sepia: 0.48, brightness: 1.0 },
    overlay: ['#ffb347', '#8a5a00'],
    overlayAlpha: 0.18,
    blend: 'overlay',
  },
  'coral-heat': {
    label: 'Coral Heat',
    filter: { saturate: 1.52, contrast: 1.08, sepia: 0.16, brightness: 1.02 },
    overlay: ['#ff5e62', '#ff9966'],
    overlayAlpha: 0.2,
    blend: 'overlay',
  },
};

export const GRADE_ORDER = [
  'warm-sunset',
  'neon-night',
  'teal-coast',
  'ink-mono',
  'twilight-gold',
  'coral-heat',
];

export const CAPTION_STYLES = {
  chrome: { label: 'Chrome', fill: '#ffffff', stroke: '#111111', glow: null },
  neon: { label: 'Neon', fill: '#ff5fd0', stroke: '#2b0033', glow: '#ff2ea6' },
  sunset: { label: 'Sunset', fill: null, stroke: '#3d0c02', glow: null },
  mono: { label: 'Mono', fill: '#f5f0e6', stroke: '#000000', glow: null },
};

export const ROLES = [
  'THE DRIVER',
  'THE BOSS',
  'THE RIDER',
  'THE COURIER',
  'THE FIXER',
  'THE CAPTAIN',
  'THE NAVIGATOR',
  'THE LOOKOUT',
  'THE MECHANIC',
  'THE WHEELMAN',
];

// A fresh default state: hero collage, warm sunset, six panels, the seven
// sample photos cycled across them, each with a role tag and a caption.
export function defaultState(samples) {
  const captions = [
    { role: 'THE DRIVER', line: 'OCEAN DR · 6:47 PM · no way back', caption: 'GOLDEN HOUR' },
    { role: 'THE BOSS', line: 'LEONIDA · DUSK · she runs it', caption: 'THE CREW' },
    { role: 'THE RIDER', line: 'BOARDWALK · 7:12 PM · two up', caption: 'THE RUNAWAYS' },
    { role: 'THE COURIER', line: 'THE BAY · LOW TIDE · quiet water', caption: 'THE GETAWAY' },
    { role: 'THE FIXER', line: 'GARAGE · NIGHT · low and loud', caption: 'THE MACHINE' },
    { role: 'THE CAPTAIN', line: 'THE WHARF · AFTER DARK · full house', caption: 'THE WATERFRONT' },
  ];
  const panels = captions.map((c, i) => ({
    src: samples[i % samples.length].src,
    image: samples[i % samples.length].image,
    scale: 1,
    ox: 0,
    oy: 0,
    ...c,
  }));
  return {
    layout: 'hero-collage',
    grade: 'warm-sunset',
    intensity: 0.85,
    style: 'chrome',
    showRoleTags: true,
    title: 'VICE CUT',
    tagline: 'Painted in Leonida.',
    stars: true,
    badge: true,
    panels,
  };
}

// Build the canvas filter string for a grade at a given intensity (0..1).
// Each knob interpolates from its neutral value toward the grade's value.
// An unknown grade name falls back to Warm Sunset instead of crashing,
// so a bad ?grade= parameter can never break a shot.
function gradeFilter(grade, intensity) {
  const g = GRADES[grade] ?? GRADES['warm-sunset'];
  const f = g.filter;
  const mix = (neutral, value) => neutral + (value - neutral) * intensity;
  const parts = [];
  if (f.saturate !== undefined) parts.push(`saturate(${mix(1, f.saturate)})`);
  if (f.contrast !== undefined) parts.push(`contrast(${mix(1, f.contrast)})`);
  if (f.brightness !== undefined) parts.push(`brightness(${mix(1, f.brightness)})`);
  if (f.sepia !== undefined) parts.push(`sepia(${mix(0, f.sepia)})`);
  if (f.grayscale !== undefined) parts.push(`grayscale(${mix(0, f.grayscale)})`);
  if (f.hue !== undefined) parts.push(`hue-rotate(${mix(0, f.hue)}deg)`);
  return parts.join(' ') || 'none';
}

// Cover-fit a photo into a panel rect, then apply the panel's zoom + pan.
// scale is a multiplier on the cover fit; ox/oy are pan fractions of the
// panel's width/height, clamped so the photo always covers the panel.
function drawPhoto(ctx, image, rect, scale, ox, oy) {
  const [x, y, w, h] = rect;
  const fit = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const s = fit * Math.max(1, scale);
  const dw = image.naturalWidth * s;
  const dh = image.naturalHeight * s;
  const maxOx = Math.max(0, (dw - w) / 2);
  const maxOy = Math.max(0, (dh - h) / 2);
  const dx = x + (w - dw) / 2 - Math.max(-maxOx, Math.min(maxOx, ox * w));
  const dy = y + (h - dh) / 2 - Math.max(-maxOy, Math.min(maxOy, oy * h));
  ctx.drawImage(image, dx, dy, dw, dh);
}

// A panel path: a rectangle, or a slanted comic cut when the layout asks.
function panelPath(ctx, rect, slant) {
  const [x, y, w, h] = rect;
  const s = slant * h;
  ctx.beginPath();
  ctx.moveTo(x + s, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - s, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

// Caption text at a panel's top, over a fading dark wash so it reads.
function drawPanelCaption(ctx, rect, text, style, scale) {
  const [x, y, w, h] = rect;
  const pad = Math.max(4, w * 0.03);
  const size = Math.max(9, h * 0.085 * scale);
  const wash = ctx.createLinearGradient(0, y, 0, y + h * 0.34);
  wash.addColorStop(0, 'rgba(8,4,20,0.72)');
  wash.addColorStop(1, 'rgba(8,4,20,0)');
  ctx.save();
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h * 0.34);
  ctx.restore();
  paintCaptionText(ctx, text, x + pad, y + pad + size * 0.9, size, style, 'left');
}

// Role tag: a black chip at the panel's bottom-left with the role in caps
// and a smaller second line beneath it.
function drawRoleTag(ctx, rect, role, line, scale) {
  const [x, y, w, h] = rect;
  const pad = Math.max(4, w * 0.03);
  const size = Math.max(8, h * 0.075 * scale);
  ctx.font = `700 ${size}px "Bebas Neue", sans-serif`;
  const roleW = ctx.measureText(role).width;
  ctx.font = `${Math.max(7, size * 0.62)}px system-ui, sans-serif`;
  const lineW = ctx.measureText(line).width;
  const chipW = Math.max(roleW, lineW) + pad * 2;
  const chipH = size * 2.1;
  const cx = x + pad;
  const cy = y + h - pad - chipH;
  ctx.save();
  ctx.fillStyle = 'rgba(5,2,14,0.88)';
  ctx.fillRect(cx, cy, chipW, chipH);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(cx, cy, 3, chipH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${size}px "Bebas Neue", sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(role, cx + pad, cy + size * 0.12);
  ctx.fillStyle = '#ffd166';
  ctx.font = `${Math.max(7, size * 0.62)}px system-ui, sans-serif`;
  ctx.fillText(line.toUpperCase(), cx + pad, cy + size * 1.18);
  ctx.restore();
}

// One caption in one of the four styles, left- or centre-aligned.
function paintCaptionText(ctx, text, cx, cy, size, style, align) {
  const st = CAPTION_STYLES[style];
  ctx.save();
  ctx.font = `400 ${size}px "Bebas Neue", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  if (st.glow) {
    ctx.shadowColor = st.glow;
    ctx.shadowBlur = size * 0.45;
  }
  if (style === 'sunset') {
    const g = ctx.createLinearGradient(0, cy - size, 0, cy + size * 0.2);
    g.addColorStop(0, '#ffe259');
    g.addColorStop(0.55, '#ffa751');
    g.addColorStop(1, '#ff5e62');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = st.fill;
  }
  ctx.lineWidth = Math.max(1.5, size * 0.09);
  ctx.strokeStyle = st.stroke;
  ctx.lineJoin = 'round';
  ctx.strokeText(text, cx, cy);
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

// The gold ORIGINAL COVER ART starburst seal.
function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#e8a91c';
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const a2 = ((i + 0.5) / 24) * Math.PI * 2;
    const outer = i % 2 === 0 ? r : r * 0.82;
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
    ctx.lineTo(Math.cos(a2) * r * 0.86, Math.sin(a2) * r * 0.86);
  }
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2);
  ctx.fillStyle = '#12081f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.66, 0, Math.PI * 2);
  ctx.strokeStyle = '#e8a91c';
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${r * 0.24}px "Bebas Neue", sans-serif`;
  ctx.fillText('ORIGINAL', 0, -r * 0.22);
  ctx.fillText('COVER ART', 0, r * 0.04);
  ctx.font = `${r * 0.16}px system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('★ ★ ★', 0, r * 0.32);
  ctx.restore();
}

// A deterministic barcode: bars from a fixed bit pattern, not random.
function drawBarcode(ctx, x, y, w, h) {
  const bits = '110100110011010100110110101001101001100101101100101101001101001101';
  ctx.save();
  ctx.fillStyle = '#ffffff';
  const bw = w / bits.length;
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') ctx.fillRect(x + i * bw, y, Math.max(1, bw * 0.7), h);
  }
  ctx.restore();
}

// Paint the whole cover. state.panels[i].image must be a loaded <img>.
// sizeScale lets the caller shrink text for tiny previews; 1 is full size.
export function drawCover(canvas, state, sizeScale = 1) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const s = sizeScale;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS['hero-collage'];
  const grade = GRADES[state.grade] ?? GRADES['warm-sunset'];

  // Outer frame: dark navy-purple border, then a gold hairline inside it.
  ctx.fillStyle = '#160a2e';
  ctx.fillRect(0, 0, W, H);
  const border = Math.max(3, W * 0.008);
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(border, border, W - border * 2, H - border * 2);
  ctx.strokeStyle = '#e8a91c';
  ctx.lineWidth = Math.max(1, W * 0.0016);
  ctx.strokeRect(border * 1.6, border * 1.6, W - border * 3.2, H - border * 3.2);

  // Zone edges (fractions of height).
  const stripH = H * 0.055;
  const gridTop = stripH + border;
  const gridBottom = H * 0.6;
  const bandTop = H * 0.6;
  const bandBottom = H * 0.79;
  const ribbonTop = H * 0.79;
  const ribbonBottom = H * 0.835;
  const grid = {
    x: border * 2,
    y: gridTop,
    w: W - border * 4,
    h: gridBottom - gridTop,
  };
  const gap = Math.max(2, W * 0.006);

  // Top strip: five gold stars, press quote, gazette name, VOL badge.
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(border, border, W - border * 2, stripH);
  const stripY = border + stripH * 0.62;
  const starSize = stripH * 0.52;
  ctx.fillStyle = '#ffd166';
  ctx.font = `${starSize}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const stars = state.stars === false ? '' : '★★★★★';
  ctx.fillText(stars, border * 2 + W * 0.008, stripY);
  const quote = '"A SUNSET THAT REFUSES TO END"';
  ctx.font = `700 ${stripH * 0.4}px "Bebas Neue", sans-serif`;
  ctx.fillStyle = '#f5f0e6';
  const quoteX = border * 2 + W * 0.008 + (stars ? starSize * 5.4 : 0);
  ctx.fillText(quote, quoteX, stripY);
  const gazette = '— THE LEONIDA LEDGER';
  const gw = ctx.measureText(gazette).width;
  ctx.fillStyle = '#ffd166';
  ctx.fillText(gazette, W - border * 2 - W * 0.008 - gw - W * 0.075, stripY);
  if (state.badge !== false) {
    const bx = W - border * 2 - W * 0.008 - W * 0.068;
    ctx.strokeStyle = '#e8a91c';
    ctx.lineWidth = Math.max(1, stripH * 0.05);
    ctx.strokeRect(bx, border + stripH * 0.16, W * 0.062, stripH * 0.68);
    ctx.fillStyle = '#ffd166';
    ctx.font = `700 ${stripH * 0.36}px "Bebas Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('VOL. 06', bx + W * 0.031, stripY);
    ctx.textAlign = 'left';
  }

  // Photo grid: each panel clipped, photo drawn graded, caption + role tag.
  const panels = layout.panels;
  panels.forEach((p, i) => {
    const px = grid.x + p[0] * grid.w + (p[0] > 0 ? gap / 2 : 0);
    const py = grid.y + p[1] * grid.h + (p[1] > 0 ? gap / 2 : 0);
    const pw = p[2] * grid.w - (p[0] > 0 ? gap / 2 : 0) - (p[0] + p[2] < 1 ? gap / 2 : 0);
    const ph = p[3] * grid.h - (p[1] > 0 ? gap / 2 : 0) - (p[1] + p[3] < 1 ? gap / 2 : 0);
    const rect = [px, py, pw, ph];
    const panel = state.panels[i % state.panels.length];
    ctx.save();
    panelPath(ctx, rect, layout.slant);
    ctx.clip();
    ctx.fillStyle = '#1b0f33';
    ctx.fillRect(px, py, pw, ph);
    if (panel && panel.image && panel.image.complete && panel.image.naturalWidth) {
      ctx.filter = gradeFilter(state.grade, state.intensity);
      drawPhoto(ctx, panel.image, rect, panel.scale, panel.ox, panel.oy);
      ctx.filter = 'none';
      if (grade.overlayAlpha > 0) {
        ctx.globalCompositeOperation = grade.blend;
        const og = ctx.createLinearGradient(px, py, px + pw, py + ph);
        og.addColorStop(0, grade.overlay[0]);
        og.addColorStop(1, grade.overlay[1]);
        ctx.globalAlpha = grade.overlayAlpha * state.intensity;
        ctx.fillStyle = og;
        ctx.fillRect(px, py, pw, ph);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    ctx.restore();
    // Gold frame around the panel.
    ctx.save();
    panelPath(ctx, rect, layout.slant);
    ctx.strokeStyle = '#e8c96a';
    ctx.lineWidth = Math.max(1, W * 0.002);
    ctx.stroke();
    ctx.restore();
    if (panel) {
      drawPanelCaption(ctx, rect, panel.caption, state.style, s);
      if (state.showRoleTags) drawRoleTag(ctx, rect, panel.role, panel.line, s);
    }
  });

  // Title band: clean dark band with gold rules; the giant striped title
  // sits across the lower-middle, overlapping the grid's bottom edge.
  ctx.fillStyle = '#12081f';
  ctx.fillRect(border, bandTop, W - border * 2, bandBottom - bandTop);
  ctx.fillStyle = '#e8a91c';
  ctx.fillRect(border, bandTop, W - border * 2, Math.max(1.5, H * 0.002));
  ctx.fillRect(border, bandBottom, W - border * 2, Math.max(1.5, H * 0.002));

  // Title: striped retro-chrome gradient, dark outline, neon glow.
  const titleSize = (bandBottom - bandTop) * 0.62 * s;
  ctx.save();
  ctx.font = `400 ${titleSize}px "Bebas Neue", sans-serif`;
  const title = (state.title || 'VICE CUT').toUpperCase();
  const titleW = ctx.measureText(title).width;
  const titleScale = Math.min(1, (W - border * 6) / titleW);
  const titleY = bandTop + (bandBottom - bandTop) * 0.52;
  ctx.translate(W / 2, titleY);
  ctx.scale(titleScale, 1);
  const tg = ctx.createLinearGradient(0, -titleSize * 0.55, 0, titleSize * 0.55);
  tg.addColorStop(0, '#ffffff');
  tg.addColorStop(0.22, '#ffe259');
  tg.addColorStop(0.45, '#ffa751');
  tg.addColorStop(0.68, '#ff5e62');
  tg.addColorStop(0.86, '#c86bff');
  tg.addColorStop(1, '#8a5cf6');
  ctx.shadowColor = '#ff2ea6';
  ctx.shadowBlur = titleSize * 0.22;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(2, titleSize * 0.07);
  ctx.strokeStyle = '#1a0526';
  ctx.lineJoin = 'round';
  ctx.strokeText(title, 0, 0);
  ctx.fillStyle = tg;
  ctx.fillText(title, 0, 0);
  ctx.restore();

  // Tagline in neon script, tucked tight under the title, overlapping its
  // bottom edge but never the title text itself.
  const tagSize = titleSize * 0.34;
  ctx.save();
  ctx.font = `700 ${tagSize}px Caveat, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff2ea6';
  ctx.shadowBlur = tagSize * 0.5;
  ctx.fillStyle = '#ff8fd6';
  ctx.fillText(state.tagline || 'Painted in Leonida.', W / 2, bandTop + (bandBottom - bandTop) * 0.86);
  ctx.restore();

  // Middle ribbon: gold caps line on dark.
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(border, ribbonTop, W - border * 2, ribbonBottom - ribbonTop);
  ctx.fillStyle = '#ffd166';
  ctx.font = `700 ${(ribbonBottom - ribbonTop) * 0.5}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'GOLDEN HOUR  ·  SIX RIDES  ·  NO WAY BACK',
    W / 2,
    (ribbonTop + ribbonBottom) / 2,
  );

  // Bottom billing: production line left, COMING SOON, barcode, gold seal.
  const billTop = ribbonBottom;
  const billH = H - billTop - border;
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(border, billTop, W - border * 2, billH);
  const bx = border * 2 + W * 0.01;
  const by = billTop + billH * 0.3;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f5f0e6';
  ctx.font = `700 ${billH * 0.2}px "Bebas Neue", sans-serif`;
  ctx.fillText('A SUNSET PICTURES PRODUCTION', bx, by);
  ctx.fillStyle = '#b8a8d8';
  ctx.font = `${billH * 0.15}px system-ui, sans-serif`;
  ctx.fillText('STARRING YOU  ·  SHOT ON YOUR OWN CAMERA  ·  GRADED BY HAND', bx, by + billH * 0.26);
  ctx.fillStyle = '#ffd166';
  ctx.font = `700 ${billH * 0.3}px "Bebas Neue", sans-serif`;
  ctx.fillText('COMING SOON', bx, by + billH * 0.62);
  const sealR = billH * 0.42;
  drawSeal(ctx, W - border * 2 - W * 0.01 - sealR, billTop + billH * 0.5, sealR);
  drawBarcode(
    ctx,
    W - border * 2 - W * 0.01 - sealR * 2 - W * 0.02 - W * 0.11,
    billTop + billH * 0.28,
    W * 0.11,
    billH * 0.44,
  );
}

// Render the cover offscreen at an exact export size and return the canvas.
export function exportCanvas(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, state, 1);
  return canvas;
}
