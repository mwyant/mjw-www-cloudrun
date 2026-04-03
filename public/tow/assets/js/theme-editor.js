(function () {
  const panel = document.getElementById('themeDesigner');
  if (!panel) return;

  const storageKey = 'warrenThemeSettings';
  const orderKey = 'warrenSectionOrder';

  const panelToggle = document.getElementById('themePanelToggle');
  const orderList = panel.querySelector('[data-order-list]');
  const resetOrderBtn = panel.querySelector('[data-action=reset-order]');
  const resetThemeBtn = panel.querySelector('[data-action=reset-theme]');
  const exportCssBtn = panel.querySelector('[data-action=export-css]');

  const defaultOrder = ['hero', 'landscape', 'departments', 'notices', 'documents', 'about', 'contact'];
  const sectionLabels = {
    hero: 'Hero',
    landscape: 'Landscape',
    departments: 'Departments',
    notices: 'Notices',
    documents: 'Documents',
    about: 'About',
    contact: 'Contact',
  };

  const defaultVars = {
    '--radius-lg': '1.25rem',
    '--radius-md': '0.95rem',
    '--radius-sm': '0.8rem',
    '--section-gap': '3rem',
    '--page-pad-x': '1.5rem',
    '--page-pad-y': '2rem',
    '--card-pad': '1.5rem',
    '--border-alpha': '0.10',
    '--shadow-alpha': '0.12',
    '--bg': '#f2f5f4',
    '--bg-card': '#ffffff',
    '--text': '#16221c',
    '--muted': '#4b5a53',
    '--accent': '#1f5e84',
    '--accent-muted': '#2f7da6',
    '--accent-soft': 'rgba(31, 94, 132, 0.14)',
    '--accent-border': 'rgba(31, 94, 132, 0.22)',
    '--clay-soft': 'rgba(176, 100, 59, 0.14)',
  };

  const palettes = {
    natural: {
      id: 'natural',
      label: 'Lake + Field',
      vars: {
        '--accent': '#1f5e84',
        '--accent-muted': '#2f7da6',
        '--bg': '#f2f5f4',
        '--bg-card': '#ffffff',
        '--text': '#16221c',
        '--muted': '#4b5a53',
      },
    },
    classic: {
      id: 'classic',
      label: 'Navy + Stone',
      vars: {
        '--accent': '#1f3f5b',
        '--accent-muted': '#2b5c82',
        '--bg': '#f4f5f7',
        '--bg-card': '#ffffff',
        '--text': '#18222c',
        '--muted': '#51606b',
      },
    },
    heritage: {
      id: 'heritage',
      label: 'Forest + Clay',
      vars: {
        '--accent': '#2f6b4f',
        '--accent-muted': '#3e8563',
        '--bg': '#f5f2ec',
        '--bg-card': '#ffffff',
        '--text': '#1e1b16',
        '--muted': '#5b5045',
      },
    },
  };

  const safeJsonParse = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const toRgb = (hex) => {
    if (!hex || typeof hex !== 'string') return null;
    const cleaned = hex.replace('#', '').trim();
    if (cleaned.length !== 6) return null;
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  };

  const savedRaw = localStorage.getItem(storageKey) || 'null';
  const saved = safeJsonParse(savedRaw) || {};

  const settings = {
    vars: Object.assign({}, defaultVars, saved.vars || {}),
    shadowsOff: typeof saved.shadowsOff === 'boolean' ? saved.shadowsOff : false,
    paletteId: typeof saved.paletteId === 'string' ? saved.paletteId : 'natural',
  };

  const saveSettings = () => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  };

  const setAccentDerived = (accentHex) => {
    const rgb = toRgb(accentHex);
    if (!rgb) return;
    const soft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`;
    const border = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
    const muted = {
      r: Math.round(rgb.r + (255 - rgb.r) * 0.18),
      g: Math.round(rgb.g + (255 - rgb.g) * 0.18),
      b: Math.round(rgb.b + (255 - rgb.b) * 0.18),
    };
    const mutedHex = `#${[muted.r, muted.g, muted.b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')}`;
    document.documentElement.style.setProperty('--accent-soft', soft);
    document.documentElement.style.setProperty('--accent-border', border);
    document.documentElement.style.setProperty('--accent-muted', mutedHex);
    settings.vars['--accent-soft'] = soft;
    settings.vars['--accent-border'] = border;
    settings.vars['--accent-muted'] = mutedHex;
  };

  const applyVars = (vars) => {
    Object.entries(vars).forEach(([name, value]) => {
      if (typeof value === 'string') {
        document.documentElement.style.setProperty(name, value);
      }
    });
  };

  applyVars(settings.vars);
  document.documentElement.classList.toggle('theme-shadows-off', settings.shadowsOff);

  const rangeInputs = panel.querySelectorAll('[data-control=range]');
  const colorInputs = panel.querySelectorAll('[data-control=color]');

  const firstCssVar = (input) => {
    const vars = (input.dataset.cssVars || input.dataset.cssVar || '')
      .split(' ')
      .map((s) => s.trim())
      .filter(Boolean);
    return vars[0] || null;
  };

  const parseNumber = (raw) => {
    if (typeof raw !== 'string') return null;
    const num = parseFloat(raw.trim());
    return Number.isNaN(num) ? null : num;
  };

  const formatValue = (input) => {
    const unit = input.dataset.unit || '';
    if (!unit) return String(input.value);
    if (unit === 'rem') return `${Number(input.value).toFixed(2).replace(/\.00$/, '')}rem`;
    if (unit === 'px') return `${input.value}px`;
    return `${input.value}${unit}`;
  };
  const applyRange = (input, persist = true) => {
    const vars = (input.dataset.cssVars || input.dataset.cssVar || '')
      .split(' ')
      .map((s) => s.trim())
      .filter(Boolean);
    const formatted = formatValue(input);

    vars.forEach((cssVar) => {
      document.documentElement.style.setProperty(cssVar, formatted);
      settings.vars[cssVar] = formatted;
    });

    const display = panel.querySelector(`[data-value-for="${input.dataset.valueTarget}"]`);
    if (display) display.textContent = formatted;

    if (persist) saveSettings();
  };

  const applyColor = (input, persist = true) => {
    const cssVar = input.dataset.cssVar;
    if (!cssVar) return;

    document.documentElement.style.setProperty(cssVar, input.value);
    settings.vars[cssVar] = input.value;

    if (cssVar === '--accent') {
      setAccentDerived(input.value);
    }

    if (persist) saveSettings();
  };

  rangeInputs.forEach((input) => {
    const cssVar = firstCssVar(input);
    const stored = cssVar ? settings.vars[cssVar] : null;
    const parsed = parseNumber(stored);
    if (parsed !== null) input.value = String(parsed);

    applyRange(input, false);
    input.addEventListener('input', () => applyRange(input, true));
  });

  colorInputs.forEach((input) => {
    const cssVar = input.dataset.cssVar;
    if (!cssVar) return;

    const stored = settings.vars[cssVar];
    if (typeof stored === 'string' && stored.startsWith('#')) {
      input.value = stored;
    }

    applyColor(input, false);
    input.addEventListener('input', () => applyColor(input, true));
  });

  const paletteRadios = panel.querySelectorAll('input[name="themePalette"]');
  const applyPalette = (paletteId, persist = true) => {
    const palette = palettes[paletteId];
    if (!palette) return;

    applyVars(palette.vars);
    Object.entries(palette.vars).forEach(([name, value]) => {
      settings.vars[name] = value;
    });

    if (settings.vars['--accent']) {
      setAccentDerived(settings.vars['--accent']);
    }

    settings.paletteId = paletteId;
    if (persist) saveSettings();
  };

  paletteRadios.forEach((radio) => {
    radio.checked = radio.value === settings.paletteId;
    radio.addEventListener('change', () => {
      if (radio.checked) applyPalette(radio.value, true);
    });
  });

  applyPalette(settings.paletteId, false);

  const shadowToggle = panel.querySelector('[data-control=shadow]');
  const applyShadows = (enabled, persist = true) => {
    document.documentElement.classList.toggle('theme-shadows-off', !enabled);
    settings.shadowsOff = !enabled;
    if (persist) saveSettings();
  };

  if (shadowToggle) {
    shadowToggle.checked = !settings.shadowsOff;
    applyShadows(shadowToggle.checked, false);
    shadowToggle.addEventListener('change', () => applyShadows(shadowToggle.checked, true));
  }
  const savedOrder = safeJsonParse(localStorage.getItem(orderKey) || 'null');
  const order = Array.isArray(savedOrder)
    ? Array.from(new Set(savedOrder.filter((id) => defaultOrder.includes(id))))
    : [];

  defaultOrder.forEach((id) => {
    if (!order.includes(id)) order.push(id);
  });

  const renderOrder = () => {
    if (!orderList) return;

    orderList.innerHTML = order
      .map((sectionId, index) => {
        const label = sectionLabels[sectionId] || sectionId;
        return `
          <li data-section="${sectionId}">
            <span>${label}</span>
            <div class="order-controls">
              <button type="button" data-move="up" ${index === 0 ? 'disabled' : ''} aria-label="Move ${label} up">↑</button>
              <button type="button" data-move="down" ${index === order.length - 1 ? 'disabled' : ''} aria-label="Move ${label} down">↓</button>
            </div>
          </li>`;
      })
      .join('');
  };

  const applyOrder = () => {
    const main = document.querySelector('main');
    if (!main) return;

    order.forEach((sectionId) => {
      const section = document.querySelector(`[data-section="${sectionId}"]`);
      if (section) main.appendChild(section);
    });

    renderOrder();
    localStorage.setItem(orderKey, JSON.stringify(order));
  };

  if (orderList) {
    orderList.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-move]');
      if (!button) return;

      const li = button.closest('li');
      if (!li) return;

      const sectionId = li.dataset.section;
      const index = order.indexOf(sectionId);
      if (index === -1) return;

      const direction = button.dataset.move;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= order.length) return;

      order.splice(index, 1);
      order.splice(targetIndex, 0, sectionId);
      applyOrder();
    });
  }

  if (resetOrderBtn) {
    resetOrderBtn.addEventListener('click', () => {
      order.splice(0, order.length, ...defaultOrder);
      applyOrder();
    });
  }

  const resetTheme = () => {
    settings.vars = Object.assign({}, defaultVars);
    settings.shadowsOff = false;
    settings.paletteId = 'natural';

    applyVars(settings.vars);
    setAccentDerived(settings.vars['--accent']);
    document.documentElement.classList.remove('theme-shadows-off');

    paletteRadios.forEach((r) => (r.checked = r.value === settings.paletteId));

    rangeInputs.forEach((input) => {
      const cssVar = firstCssVar(input);
      const def = cssVar ? defaultVars[cssVar] : null;
      const parsed = parseNumber(def);
      if (parsed !== null) input.value = String(parsed);
      applyRange(input, false);
    });

    colorInputs.forEach((input) => {
      const cssVar = input.dataset.cssVar;
      const def = cssVar ? defaultVars[cssVar] : null;
      if (typeof def === 'string' && def.startsWith('#')) {
        input.value = def;
      }
      applyColor(input, false);
    });

    if (shadowToggle) {
      shadowToggle.checked = true;
      applyShadows(true, false);
    }

    applyPalette(settings.paletteId, false);
    saveSettings();
  };

  if (resetThemeBtn) {
    resetThemeBtn.addEventListener('click', resetTheme);
  }
  const exportOverrides = () => {
    const computed = getComputedStyle(document.documentElement);
    const varsToExport = [
      '--bg',
      '--bg-card',
      '--text',
      '--muted',
      '--accent',
      '--accent-muted',
      '--accent-soft',
      '--accent-border',
      '--clay-soft',
      '--radius-lg',
      '--radius-md',
      '--radius-sm',
      '--section-gap',
      '--page-pad-x',
      '--page-pad-y',
      '--card-pad',
      '--border-alpha',
      '--shadow-alpha',
    ];

    const lines = [
      '/* Exported theme overrides (drop into static/assets/css/theme-overrides.css) */',
      `/* Section order: ${order.join(' > ')} */`,
      `/* Drop shadows: ${settings.shadowsOff ? 'disabled' : 'enabled'} */`,
      '',
      ':root {',
    ];

    varsToExport.forEach((name) => {
      const value = computed.getPropertyValue(name).trim();
      if (value) lines.push(`  ${name}: ${value};`);
    });

    lines.push('}');
    lines.push('');

    const blob = new Blob([lines.join('\n')], { type: 'text/css' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `warren-theme-overrides-${new Date().toISOString().slice(0, 10)}.css`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  };

  if (exportCssBtn) {
    exportCssBtn.addEventListener('click', exportOverrides);
  }

  if (panelToggle) {
    panelToggle.addEventListener('click', () => {
      const isClosed = panel.classList.toggle('is-closed');
      panelToggle.textContent = isClosed ? 'Show' : 'Hide';
    });
  }

  applyOrder();
})();
