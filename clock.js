// ─── Palette ─────────────────────────────────────────────────────────────────

const PALETTE = [
  { name: 'White',      hex: '#ffffff' },
  { name: 'Light grey', hex: '#f0f0f0' },
  { name: 'Silver',     hex: '#cccccc' },
  { name: 'Grey',       hex: '#888888' },
  { name: 'Dark grey',  hex: '#555555' },
  { name: 'Charcoal',   hex: '#222222' },
  { name: 'Near black', hex: '#111111' },
  { name: 'Black',      hex: '#000000' },
  { name: 'Red 1',      hex: '#ff4444' },
  { name: 'Red 2',      hex: '#ff0000' },
  { name: 'Red 3',      hex: '#cc0000' },
  { name: 'Orange 1',   hex: '#ff8800' },
  { name: 'Orange 2',   hex: '#ff6600' },
  { name: 'Yellow 1',   hex: '#ffdd00' },
  { name: 'Yellow 2',   hex: '#ffcc00' },
  { name: 'Yellow 3',   hex: '#ffe066' },
  { name: 'Green 1',    hex: '#44ff88' },
  { name: 'Green 2',    hex: '#00cc44' },
  { name: 'Green 3',    hex: '#009933' },
  { name: 'Cyan 1',     hex: '#00ffff' },
  { name: 'Cyan 2',     hex: '#00ccff' },
  { name: 'Cyan 3',     hex: '#0099cc' },
  { name: 'Blue 1',     hex: '#4488ff' },
  { name: 'Blue 2',     hex: '#0066ff' },
  { name: 'Blue 3',     hex: '#0044cc' },
  { name: 'Purple 1',   hex: '#aa44ff' },
  { name: 'Purple 2',   hex: '#8800ff' },
  { name: 'Purple 3',   hex: '#660099' },
];

// ─── Background palettes ──────────────────────────────────────────────────────

const PALETTE_BG_DARK = [
  { name: 'Pure black',  value: '#000000' },
  { name: 'Near black',  value: '#0a0a0a' },
  { name: 'Dark grey',   value: '#1a1a1a' },
  { name: 'Charcoal',    value: 'linear-gradient(135deg, #1c1c1c, #0a0a0a)' },
  { name: 'Midnight',    value: 'linear-gradient(135deg, #0d0d1a, #000000)' },
  { name: 'Night sky',   value: 'linear-gradient(180deg, #0a0a2e, #000000)' },
  { name: 'Dark blue',   value: 'linear-gradient(135deg, #000814, #001d3d)' },
  { name: 'Deep purple', value: 'linear-gradient(135deg, #0d0010, #1a0030)' },
  { name: 'Dark teal',   value: 'linear-gradient(135deg, #001a1a, #000000)' },
  { name: 'Dark green',  value: 'linear-gradient(135deg, #001a0a, #000000)' },
];

const PALETTE_BG_LIGHT = [
  { name: 'Off white',  value: '#f5f5f5' },
  { name: 'Pure white', value: '#ffffff' },
  { name: 'Cool grey',  value: 'linear-gradient(135deg, #ffffff, #b8bcc2)' },
  { name: 'Warm cream', value: 'linear-gradient(135deg, #fffdf5, #c8a84a)' },
  { name: 'Sky',        value: 'linear-gradient(135deg, #f0f8ff, #7ab4d4)' },
  { name: 'Lavender',   value: 'linear-gradient(135deg, #f8f0ff, #9e72cc)' },
  { name: 'Blush',      value: 'linear-gradient(135deg, #fff0f5, #d0709c)' },
  { name: 'Mint',       value: 'linear-gradient(135deg, #f0fff8, #6ab888)' },
  { name: 'Honey',      value: 'linear-gradient(135deg, #fffff0, #c8b030)' },
  { name: 'Peach',      value: 'linear-gradient(135deg, #fff8f0, #d88850)' },
];

// ─── Defaults ────────────────────────────────────────────────────────────────

const THEME_COLORS = {
  dark:  { colorHours: '#f0f0f0', colorMinutes: '#f0f0f0', colorSeconds: '#ff4444' },
  light: { colorHours: '#111111', colorMinutes: '#111111', colorSeconds: '#cc0000' },
};

const DEFAULTS = {
  theme: 'dark',
  clockStyle: 'digital',   // 'digital' | 'analog'
  digitalStyle: 'default', // 'default' | 'flip' | 'thin' | 'mono'
  analogStyle: 'classic',  // 'classic' | 'minimal'
  showBoth: false,
  showColons: true,
  timeFormat: '24',
  showSeconds: true,
  showAmPm: true,
  showDate: false,
  datePosition: 'below',
  dateFormat: 'DD/MM/YYYY',
  colorsCustomized: false,
  colorHours: THEME_COLORS.dark.colorHours,
  colorMinutes: THEME_COLORS.dark.colorMinutes,
  colorSeconds: THEME_COLORS.dark.colorSeconds,
  bgDark:  '#0a0a0a',
  bgLight: '#f5f5f5',
};

// ─── State ────────────────────────────────────────────────────────────────────

let settings = { ...DEFAULTS };
let fsHideTimer = null;
const prevDigits = {};

// ─── Storage ──────────────────────────────────────────────────────────────────

function loadSettings() {
  try {
    const raw = localStorage.getItem('clock-settings');
    if (raw) {
      const saved = JSON.parse(raw);
      // Migrate old combined clockStyle format
      if (saved.clockStyle === 'analog-classic') { saved.clockStyle = 'analog'; saved.analogStyle = 'classic'; }
      if (saved.clockStyle === 'analog-minimal') { saved.clockStyle = 'analog'; saved.analogStyle = 'minimal'; }
      settings = { ...DEFAULTS, ...saved };
    }
  } catch (_) {}
}

function saveSettings() {
  localStorage.setItem('clock-settings', JSON.stringify(settings));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(n) {
  return String(n).padStart(2, '0');
}

function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ─── Analog clock builder ────────────────────────────────────────────────────

function buildAnalogClock() {
  const svg = document.getElementById('analog-clock');
  svg.innerHTML = '';

  const isClassic = settings.analogStyle === 'classic';
  const fg = 'currentColor';

  // Face
  svg.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 95, fill: 'none', stroke: fg, 'stroke-width': 1.5 }));

  // All 60 tick marks for both styles (classic gets numbers on top)
  for (let n = 0; n < 60; n++) {
    const a = (n / 60) * Math.PI * 2 - Math.PI / 2;
    const isMajor = n % 5 === 0;
    const r1 = isMajor ? (isClassic ? 86 : 82) : 90;
    svg.appendChild(svgEl('line', {
      x1: (Math.cos(a) * r1).toFixed(3),
      y1: (Math.sin(a) * r1).toFixed(3),
      x2: (Math.cos(a) * 94).toFixed(3),
      y2: (Math.sin(a) * 94).toFixed(3),
      stroke: fg,
      'stroke-width': isMajor ? 2 : 0.75,
      'stroke-linecap': 'round',
    }));
  }

  if (isClassic) {
    for (let n = 1; n <= 12; n++) {
      const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
      const x = (Math.cos(a) * 75).toFixed(3);
      const y = (Math.sin(a) * 75).toFixed(3);
      const text = svgEl('text', {
        x, y,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'font-size': 13,
        fill: fg,
        'font-family': 'system-ui, sans-serif',
        'font-weight': 300,
      });
      text.textContent = n;
      svg.appendChild(text);
    }
  }

  // Hands (with IDs for per-tick update)
  const handDefs = [
    { id: 'hand-h', y2: -55, w: 5,   tail: 12, stroke: 'var(--color-hours, currentColor)' },
    { id: 'hand-m', y2: -75, w: 3,   tail: 14, stroke: 'var(--color-minutes, currentColor)' },
    { id: 'hand-s', y2: -82, w: 1.5, tail: 18, stroke: 'var(--color-seconds, currentColor)' },
  ];

  for (const { id, y2, w, tail, stroke } of handDefs) {
    const line = svgEl('line', {
      x1: 0, y1: tail, x2: 0, y2,
      stroke,
      'stroke-width': w,
      'stroke-linecap': 'round',
    });
    line.id = id;
    svg.appendChild(line);
  }

  // Center cap
  svg.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 4, fill: fg }));
  svg.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 2, fill: 'var(--color-seconds, currentColor)' }));
}

// ─── Digit update (handles flip animation) ───────────────────────────────────

function updateDigit(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  if (prevDigits[id] === val) return;

  const isFirst = prevDigits[id] === undefined;
  prevDigits[id] = val;

  if (!isFirst && settings.digitalStyle === 'flip') {
    // Swap text at midpoint so old digit flips out, new digit flips in
    el.classList.remove('flipping');
    void el.offsetWidth;
    el.classList.add('flipping');
    setTimeout(() => { el.textContent = val; }, 175);
  } else {
    el.textContent = val;
  }
}

// ─── Render: digital ─────────────────────────────────────────────────────────

function renderDigital(now) {
  let h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  if (settings.timeFormat === '12') {
    h = h % 12 || 12;
  }

  const hStr = pad(h);
  const mStr = pad(m);
  const sStr = pad(s);

  updateDigit('d0', hStr[0]);
  updateDigit('d1', hStr[1]);
  updateDigit('d2', mStr[0]);
  updateDigit('d3', mStr[1]);
  updateDigit('d4', sStr[0]);
  updateDigit('d5', sStr[1]);
}

// ─── Render: analog ──────────────────────────────────────────────────────────

function renderAnalog(now) {
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();

  const hourDeg   = (h + m / 60) / 12 * 360;
  const minuteDeg = (m + s / 60) / 60 * 360;
  const secondDeg = s / 60 * 360;

  document.getElementById('hand-h').setAttribute('transform', `rotate(${hourDeg})`);
  document.getElementById('hand-m').setAttribute('transform', `rotate(${minuteDeg})`);

  const handS = document.getElementById('hand-s');
  handS.toggleAttribute('hidden', !settings.showSeconds);
  if (settings.showSeconds) {
    handS.setAttribute('transform', `rotate(${secondDeg})`);
  }
}

// ─── Render: AM/PM ───────────────────────────────────────────────────────────

function renderAmPm(now) {
  const el = document.getElementById('ampm-display');
  if (!el || el.hidden) return;
  el.textContent = now.getHours() >= 12 ? 'pm' : 'am';
}

// ─── Render: date ────────────────────────────────────────────────────────────

function renderDate(now) {
  const el = document.getElementById('date-display');
  if (!el || el.hidden) return;

  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const d   = now.getDate();
  const mon = now.getMonth();
  const y   = now.getFullYear();

  switch (settings.dateFormat) {
    case 'DD/MM/YYYY': el.textContent = `${pad(d)}/${pad(mon + 1)}/${y}`; break;
    case 'MM/DD/YYYY': el.textContent = `${pad(mon + 1)}/${pad(d)}/${y}`; break;
    case 'YYYY-MM-DD': el.textContent = `${y}-${pad(mon + 1)}-${pad(d)}`; break;
    case 'long':       el.textContent = `${days[now.getDay()]}, ${d} ${months[mon]} ${y}`; break;
    case 'medium':     el.textContent = `${d} ${months[mon]} ${y}`; break;
    default:           el.textContent = `${pad(d)}/${pad(mon + 1)}/${y}`;
  }
}

// ─── Tick ─────────────────────────────────────────────────────────────────────

function tick() {
  const now = new Date();
  const isAnalog    = settings.clockStyle === 'analog';
  const showDigital = !isAnalog || settings.showBoth;
  const showAnalog  =  isAnalog || settings.showBoth;

  if (showAnalog)  renderAnalog(now);
  if (showDigital) renderDigital(now);

  renderAmPm(now);
  renderDate(now);
}

// ─── Apply settings → DOM ────────────────────────────────────────────────────

function applySettings() {
  Object.keys(prevDigits).forEach(k => { prevDigits[k] = undefined; });

  const s            = settings;
  const isAnalog     = s.clockStyle === 'analog';
  const analogOnly   = isAnalog && !s.showBoth;
  const analogVisible = isAnalog || s.showBoth;
  const is12hr       = s.timeFormat === '12';

  // Theme
  document.body.dataset.theme = s.theme;

  // Clock face visibility
  const dc = document.getElementById('digital-clock');
  const ac = document.getElementById('analog-clock');
  dc.hidden = analogOnly;
  ac.toggleAttribute('hidden', !analogVisible);

  // show-both layout modifier
  document.getElementById('clock-wrapper').classList.toggle('show-both', s.showBoth);

  // Digital style class
  dc.className = `style-${s.digitalStyle}`;

  // Colons: hidden in analog-only mode, or when user turned them off
  const colonsHidden = analogOnly || !s.showColons;
  document.querySelectorAll('#digital-clock .sep').forEach(el => {
    el.hidden = colonsHidden;
  });
  document.getElementById('sep-s').hidden = colonsHidden || !s.showSeconds;

  // Seconds digit group
  document.getElementById('grp-s').hidden = !s.showSeconds;

  // AM/PM display
  document.getElementById('ampm-display').hidden = !(is12hr && s.showAmPm && !analogOnly);

  // Date display and ordering
  const dateEl = document.getElementById('date-display');
  dateEl.hidden = !s.showDate;
  dateEl.style.order = s.datePosition === 'above' ? '-1' : '2';

  // Colors
  const root = document.documentElement;
  root.style.setProperty('--color-hours',   s.colorHours);
  root.style.setProperty('--color-minutes', s.colorMinutes);
  root.style.setProperty('--color-seconds', s.colorSeconds);

  // Background
  const isDark = s.theme === 'dark';
  root.style.setProperty('--page-bg', isDark ? s.bgDark : s.bgLight);
  document.getElementById('row-bg-dark').hidden    = !isDark;
  document.getElementById('palette-bg-dark').hidden = !isDark;
  const labelDark = document.getElementById('palette-label-bg-dark');
  if (labelDark) labelDark.hidden = !isDark;
  document.getElementById('row-bg-light').hidden    = isDark;
  document.getElementById('palette-bg-light').hidden = isDark;
  const labelLight = document.getElementById('palette-label-bg-light');
  if (labelLight) labelLight.hidden = isDark;

  // Rebuild analog SVG when analog is visible
  if (analogVisible) buildAnalogClock();

  // Sync controls
  document.getElementById('setting-theme').value          = s.theme;
  document.getElementById('setting-style').value          = s.clockStyle;
  document.getElementById('setting-digital-style').value  = s.digitalStyle;
  document.getElementById('setting-analog-style').value   = s.analogStyle;
  document.getElementById('setting-format').value         = s.timeFormat;
  document.getElementById('setting-ampm').checked         = s.showAmPm;
  document.getElementById('setting-show-colons').checked  = s.showColons;
  document.getElementById('setting-seconds').checked      = s.showSeconds;
  document.getElementById('setting-date').checked         = s.showDate;
  document.getElementById('setting-date-position').value  = s.datePosition;
  document.getElementById('setting-date-format').value    = s.dateFormat;
  document.getElementById('setting-show-both').checked    = s.showBoth;
  syncColorUI('colorHours',   s.colorHours);
  syncColorUI('colorMinutes', s.colorMinutes);
  syncColorUI('colorSeconds', s.colorSeconds);
  syncBgUI('bgDark',  s.bgDark);
  syncBgUI('bgLight', s.bgLight);

  // Show/hide conditional rows
  document.getElementById('row-digital-style').hidden  = analogOnly && !s.showBoth;
  document.getElementById('row-analog-style').hidden   = !isAnalog && !s.showBoth;
  document.getElementById('row-format').hidden         = analogOnly;
  document.getElementById('row-ampm').hidden           = analogOnly || !is12hr;
  document.getElementById('row-show-colons').hidden    = analogOnly;
  document.getElementById('row-date-position').hidden  = !s.showDate;
  document.getElementById('row-date-format').hidden    = !s.showDate;
  document.getElementById('color-seconds-group').hidden = !s.showSeconds;
}

// ─── Settings listeners ──────────────────────────────────────────────────────

function initSettingsListeners() {
  function on(id, key, transform) {
    document.getElementById(id).addEventListener('change', e => {
      settings[key] = transform ? transform(e.target) : e.target.value;
      saveSettings();
      applySettings();
      tick();
    });
  }

  on('setting-theme', 'theme', null);
  on('setting-style', 'clockStyle', null);
  on('setting-digital-style', 'digitalStyle', null);
  on('setting-analog-style', 'analogStyle', null);
  on('setting-show-both', 'showBoth', t => t.checked);
  on('setting-format', 'timeFormat', null);
  on('setting-ampm', 'showAmPm', t => t.checked);
  on('setting-show-colons', 'showColons', t => t.checked);
  on('setting-seconds', 'showSeconds', t => t.checked);
  on('setting-date', 'showDate', t => t.checked);
  on('setting-date-position', 'datePosition', null);
  on('setting-date-format', 'dateFormat', null);

  // colour pickers are wired in buildColorPickers()

  document.getElementById('btn-reset-colors').addEventListener('click', () => {
    const tc = THEME_COLORS[settings.theme];
    settings.colorHours   = tc.colorHours;
    settings.colorMinutes = tc.colorMinutes;
    settings.colorSeconds = tc.colorSeconds;
    settings.colorsCustomized = false;
    saveSettings();
    applySettings();
  });

  document.getElementById('btn-reset-bg').addEventListener('click', () => {
    settings.bgDark  = DEFAULTS.bgDark;
    settings.bgLight = DEFAULTS.bgLight;
    saveSettings();
    applySettings();
  });

  // When theme changes and colors haven't been customized, reset to theme defaults
  document.getElementById('setting-theme').addEventListener('change', () => {
    if (!settings.colorsCustomized) {
      const tc = THEME_COLORS[settings.theme];
      settings.colorHours   = tc.colorHours;
      settings.colorMinutes = tc.colorMinutes;
      settings.colorSeconds = tc.colorSeconds;
      saveSettings();
      applySettings();
    }
  });
}

// ─── Colour picker helpers ───────────────────────────────────────────────────

function syncColorUI(key, hex) {
  const id = key === 'colorHours' ? 'hours' : key === 'colorMinutes' ? 'minutes' : 'seconds';
  const swatchEl = document.getElementById(`swatch-${id}`);
  const hexEl    = document.getElementById(`hex-${id}`);
  if (swatchEl) swatchEl.style.background = hex;
  if (hexEl)    hexEl.value = hex;
  const normalizedHex = hex.toLowerCase();
  const match = PALETTE.find(p => p.hex === normalizedHex);
  document.querySelectorAll(`#palette-${id} .palette-swatch`).forEach(el => {
    if (el.classList.contains('custom-swatch')) {
      el.classList.toggle('active', !match);
    } else {
      el.classList.toggle('active', el.dataset.color === normalizedHex);
    }
  });
  const labelEl = document.getElementById(`palette-label-${id}`);
  if (labelEl) {
    labelEl.textContent = match ? `${match.name} (${match.hex})` : `Custom (${normalizedHex})`;
  }
}

function buildColorPickers() {
  const defs = [
    { id: 'hours',   key: 'colorHours',   cssVar: '--color-hours' },
    { id: 'minutes', key: 'colorMinutes', cssVar: '--color-minutes' },
    { id: 'seconds', key: 'colorSeconds', cssVar: '--color-seconds' },
  ];

  for (const { id, key, cssVar } of defs) {
    const palette = document.getElementById(`palette-${id}`);

    PALETTE.forEach(({ name, hex }) => {
      const btn = document.createElement('button');
      btn.className = 'palette-swatch';
      btn.dataset.color = hex;
      btn.style.background = hex;
      btn.title = `${name} (${hex})`;
      btn.addEventListener('mouseenter', () => {
        const labelEl = document.getElementById(`palette-label-${id}`);
        if (labelEl) labelEl.textContent = `${name} (${hex})`;
      });
      btn.addEventListener('click', () => {
        settings[key] = hex;
        settings.colorsCustomized = true;
        saveSettings();
        document.documentElement.style.setProperty(cssVar, hex);
        syncColorUI(key, hex);
      });
      palette.appendChild(btn);
    });

    // Hidden native colour picker — triggered by the custom swatch
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:0;height:0;';
    palette.appendChild(colorInput);
    colorInput.addEventListener('input', e => {
      const val = e.target.value;
      settings[key] = val;
      settings.colorsCustomized = true;
      saveSettings();
      document.documentElement.style.setProperty(cssVar, val);
      syncColorUI(key, val);
    });

    // Custom swatch — opens native colour picker
    const customBtn = document.createElement('button');
    customBtn.className = 'palette-swatch custom-swatch';
    customBtn.title = 'Custom colour';
    customBtn.addEventListener('mouseenter', () => {
      const labelEl = document.getElementById(`palette-label-${id}`);
      if (labelEl) labelEl.textContent = 'Custom';
    });
    customBtn.addEventListener('click', () => {
      colorInput.value = settings[key];
      colorInput.click();
    });
    palette.appendChild(customBtn);

    // Label showing the hovered / selected colour name
    const label = document.createElement('div');
    label.className = 'palette-label';
    label.id = `palette-label-${id}`;
    palette.after(label);

    // Restore label to selected colour name on mouse-out
    palette.addEventListener('mouseleave', () => {
      syncColorUI(key, settings[key]);
    });

    // Hex text input — direct entry
    document.getElementById(`hex-${id}`).addEventListener('input', e => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        settings[key] = val;
        settings.colorsCustomized = true;
        saveSettings();
        document.documentElement.style.setProperty(cssVar, val);
        syncColorUI(key, val);
      }
    });
  }
}

// ─── Background picker helpers ───────────────────────────────────────────────

function syncBgUI(key, value) {
  const id = key === 'bgDark' ? 'bg-dark' : 'bg-light';
  const pal = key === 'bgDark' ? PALETTE_BG_DARK : PALETTE_BG_LIGHT;
  const swatchEl = document.getElementById(`swatch-${id}`);
  if (swatchEl) swatchEl.style.background = value;
  const match = pal.find(p => p.value === value);
  document.querySelectorAll(`#palette-${id} .palette-swatch`).forEach(el => {
    if (el.classList.contains('custom-swatch')) {
      el.classList.toggle('active', !match);
    } else {
      el.classList.toggle('active', el.dataset.bg === value);
    }
  });
  const labelEl = document.getElementById(`palette-label-${id}`);
  if (labelEl) labelEl.textContent = match ? match.name : `Custom (${value.length > 24 ? value.slice(0, 24) + '…' : value})`;
}

function buildBgPickers() {
  const defs = [
    { id: 'bg-dark',  key: 'bgDark',  pal: PALETTE_BG_DARK,  fallback: '#0a0a0a' },
    { id: 'bg-light', key: 'bgLight', pal: PALETTE_BG_LIGHT, fallback: '#f5f5f5' },
  ];

  for (const { id, key, pal, fallback } of defs) {
    const paletteEl = document.getElementById(`palette-${id}`);

    pal.forEach(({ name, value }) => {
      const btn = document.createElement('button');
      btn.className = 'palette-swatch';
      btn.dataset.bg = value;
      btn.style.background = value;
      btn.title = name;
      btn.addEventListener('mouseenter', () => {
        const labelEl = document.getElementById(`palette-label-${id}`);
        if (labelEl) labelEl.textContent = name;
      });
      btn.addEventListener('click', () => {
        settings[key] = value;
        saveSettings();
        if ((key === 'bgDark' && settings.theme === 'dark') || (key === 'bgLight' && settings.theme === 'light')) {
          document.documentElement.style.setProperty('--page-bg', value);
        }
        syncBgUI(key, value);
      });
      paletteEl.appendChild(btn);
    });

    // Hidden native colour picker for custom solid
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:0;height:0;';
    paletteEl.appendChild(colorInput);
    colorInput.addEventListener('input', e => {
      const val = e.target.value;
      settings[key] = val;
      saveSettings();
      if ((key === 'bgDark' && settings.theme === 'dark') || (key === 'bgLight' && settings.theme === 'light')) {
        document.documentElement.style.setProperty('--page-bg', val);
      }
      syncBgUI(key, val);
    });

    // Custom swatch — opens native colour picker
    const customBtn = document.createElement('button');
    customBtn.className = 'palette-swatch custom-swatch';
    customBtn.title = 'Custom solid colour';
    customBtn.addEventListener('mouseenter', () => {
      const labelEl = document.getElementById(`palette-label-${id}`);
      if (labelEl) labelEl.textContent = 'Custom';
    });
    customBtn.addEventListener('click', () => {
      colorInput.value = /^#[0-9a-fA-F]{6}$/.test(settings[key]) ? settings[key] : fallback;
      colorInput.click();
    });
    paletteEl.appendChild(customBtn);

    // Hover label
    const label = document.createElement('div');
    label.className = 'palette-label';
    label.id = `palette-label-${id}`;
    paletteEl.after(label);

    paletteEl.addEventListener('mouseleave', () => syncBgUI(key, settings[key]));
  }
}

// ─── Fullscreen & Wake Lock ───────────────────────────────────────────────────

let wakeLock = null;

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (_) {}
}

async function releaseWakeLock() {
  if (wakeLock) { await wakeLock.release(); wakeLock = null; }
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}

function initFullscreen() {
  document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);

  document.addEventListener('keydown', e => {
    if (e.key === 'f' || e.key === 'F') {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;
      toggleFullscreen();
    }
  });

  document.addEventListener('mousemove', () => {
    if (!document.fullscreenElement) return;
    document.body.classList.add('fs-cursor');
    clearTimeout(fsHideTimer);
    fsHideTimer = setTimeout(() => document.body.classList.remove('fs-cursor'), 750);
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      requestWakeLock();
    } else {
      clearTimeout(fsHideTimer);
      document.body.classList.remove('fs-cursor');
      releaseWakeLock();
    }
  });

  // Re-acquire wake lock if the tab becomes visible again while still fullscreen
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && document.fullscreenElement && !wakeLock) {
      requestWakeLock();
    }
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  loadSettings();
  buildColorPickers();
  buildBgPickers();
  applySettings();
  initSettingsListeners();
  initFullscreen();
  tick();
  setInterval(tick, 1000);
}

init();
