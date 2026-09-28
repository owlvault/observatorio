/**
 * theme_charts.js
 * Tema editorial para Chart.js y tabla de datos equivalente para cada gráfica
 * Requisitos: RF-PORTAL-05 / INV-09 (toda gráfica tiene tabla equivalente), contraste WCAG 2.1 AA
 */

(function(window) {
  'use strict';

  // Paleta de gráficas: una familia de azules + neutros (ver css/portal.css)
  window.OBS_CHART = {
    ink: '#0f1b2d',
    text: '#44546a',
    muted: '#5f6f84',
    grid: '#e6ecf3',
    primary: '#1664b0',
    primaryDark: '#0a2f55',
    remainder: '#d3deea',
    reference: '#0f1b2d',
    // Secuencial (magnitud u orden): claro -> oscuro
    seq5: ['#b9d3ef', '#7fb0e2', '#3f86cf', '#1a5ea8', '#0a2f55'],
    surface: '#ffffff'
  };

  if (!window.Chart) return;
  const C = window.OBS_CHART;
  const d = Chart.defaults;

  d.font.family = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";
  d.font.size = 12;
  d.color = C.text;
  d.borderColor = C.grid;
  d.maintainAspectRatio = false;

  d.plugins.legend.labels.usePointStyle = true;
  d.plugins.legend.labels.pointStyle = 'rectRounded';
  d.plugins.legend.labels.boxWidth = 10;
  d.plugins.legend.labels.boxHeight = 10;
  d.plugins.legend.labels.padding = 16;
  d.plugins.legend.labels.color = C.text;

  d.plugins.tooltip.backgroundColor = '#0a2f55';
  d.plugins.tooltip.titleColor = '#ffffff';
  d.plugins.tooltip.bodyColor = '#e6eef8';
  d.plugins.tooltip.padding = 12;
  d.plugins.tooltip.cornerRadius = 8;
  d.plugins.tooltip.titleFont = { weight: '600', size: 12 };
  d.plugins.tooltip.bodyFont = { size: 12 };
  d.plugins.tooltip.boxPadding = 4;
  d.plugins.tooltip.usePointStyle = true;

  d.font.size = 13;
  d.animation.duration = 1100;
  d.animation.easing = 'easeOutQuart';
  d.elements.bar.borderRadius = 8;
  d.elements.bar.borderSkipped = 'start';
  d.datasets.bar.maxBarThickness = 56;
  d.datasets.bar.categoryPercentage = 0.72;
  d.elements.line.tension = 0.35;
  d.elements.line.borderWidth = 2.5;
  d.elements.point.backgroundColor = '#ffffff';
  d.elements.point.borderWidth = 2;
  d.elements.line.borderWidth = 2;
  d.elements.point.radius = 3;
  d.elements.point.hoverRadius = 5;
  d.elements.arc.borderWidth = 2;
  d.elements.arc.borderColor = C.surface;

  // Ejes recesivos: sin línea de borde, rejilla tenue
  ['category', 'linear'].forEach(type => {
    const s = Chart.defaults.scales[type];
    if (!s) return;
    s.border = Object.assign({}, s.border, { display: false });
    s.grid = Object.assign({}, s.grid, { color: C.grid, tickLength: 0 });
    s.ticks = Object.assign({}, s.ticks, { padding: 8, color: C.muted });
  });

  // Rejilla solo en el eje de valores: el de categorías queda limpio
  if (Chart.defaults.scales.category) {
    Chart.defaults.scales.category.grid = Object.assign({}, Chart.defaults.scales.category.grid, { display: false });
  }

  // ------------------------------------------------------------------
  // Profundidad: cada relleno plano pasa a degradado (lado de luz y lado de sombra).
  // Aplica a todas las gráficas del portal sin tocar sus componentes; el color base
  // de cada serie se conserva, así que la codificación semántica no cambia.
  // ------------------------------------------------------------------
  function parseColor(c) {
    if (typeof c !== 'string') return null;
    let m = c.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) {
      let h = m[1];
      if (h.length === 3) h = h.split('').map(x => x + x).join('');
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
    }
    m = c.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i);
    if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
    return null;
  }
  const mix = (c, t, k) => ({ r: Math.round(c.r + (t.r - c.r) * k), g: Math.round(c.g + (t.g - c.g) * k), b: Math.round(c.b + (t.b - c.b) * k), a: c.a });
  const css = c => `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
  const WHITE = { r: 255, g: 255, b: 255 }, NAVY = { r: 3, g: 22, b: 42 };

  function barGradient(chart, base, horizontal) {
    const area = chart.chartArea;
    const c = parseColor(base);
    if (!area || !c) return base;
    const g = horizontal
      ? chart.ctx.createLinearGradient(area.left, 0, area.right, 0)
      : chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
    g.addColorStop(0, css(mix(c, NAVY, 0.22)));
    g.addColorStop(0.55, css(c));
    g.addColorStop(1, css(mix(c, WHITE, 0.32)));
    return g;
  }

  function areaGradient(chart, base) {
    const area = chart.chartArea;
    const c = parseColor(base);
    if (!area || !c) return base;
    const g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, css({ ...c, a: Math.min(0.42, c.a + 0.15) }));
    g.addColorStop(1, css({ ...c, a: 0 }));
    return g;
  }

  const DepthPlugin = {
    id: 'cxDepth',
    beforeUpdate(chart) {
      const type = chart.config.type;
      const horizontal = chart.options.indexAxis === 'y';
      chart.data.datasets.forEach(ds => {
        const dsType = ds.type || type;
        if (dsType === 'bar') {
          const bg = ds.backgroundColor;
          if (typeof bg === 'string' || (Array.isArray(bg) && bg.every(x => typeof x === 'string'))) {
            ds._cxBase = bg;
            ds.backgroundColor = ctx => {
              const base = Array.isArray(ds._cxBase) ? ds._cxBase[ctx.dataIndex % ds._cxBase.length] : ds._cxBase;
              return barGradient(ctx.chart, base, horizontal);
            };
          }
        } else if (dsType === 'line' && ds.fill && typeof ds.backgroundColor === 'string') {
          ds._cxBase = ds.backgroundColor;
          ds.backgroundColor = ctx => areaGradient(ctx.chart, ds._cxBase);
        }
      });
    }
  };
  Chart.register(DepthPlugin);

  // ------------------------------------------------------------------
  // Tabla de datos equivalente (se agrega bajo cada gráfica de .chart-card)
  // ------------------------------------------------------------------
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = v => {
    if (v == null) return '—';
    if (typeof v === 'number') return v.toLocaleString('es-CO', { maximumFractionDigits: 2 });
    if (typeof v === 'object' && 'y' in v) return fmt(v.y);
    return esc(v);
  };

  function buildTable(chart) {
    const labels = chart.data.labels || [];
    const sets = chart.data.datasets || [];
    const title = chart.canvas.getAttribute('aria-label') || 'Datos de la gráfica';
    const singleUnnamed = sets.length === 1;
    const head = `<tr><th scope="col">Categoría</th>${sets.map(s => `<th scope="col">${esc(singleUnnamed ? (s.label || 'Valor') : s.label)}</th>`).join('')}</tr>`;
    const rows = labels.map((lab, i) => `<tr><th scope="row">${esc(Array.isArray(lab) ? lab.join(' ') : lab)}</th>${sets.map(s => `<td>${fmt(s.data[i])}</td>`).join('')}</tr>`).join('');
    return `<table class="obs-data-table"><caption class="sr-only">${esc(title)}</caption><thead>${head}</thead><tbody>${rows}</tbody></table>`;
  }

  const DataTablePlugin = {
    id: 'obsDataTable',
    afterUpdate(chart) {
      const card = chart.canvas.closest('.chart-card, .scorecard-section-card');
      if (!card) return;
      let details = card.querySelector(`details.obs-chart-table[data-for="${chart.canvas.id}"]`);
      if (!details) {
        details = document.createElement('details');
        details.className = 'obs-chart-table';
        details.setAttribute('data-for', chart.canvas.id);
        details.innerHTML = '<summary>Ver tabla de datos</summary><div class="obs-chart-table-body"></div>';
        const body = chart.canvas.closest('.chart-body, .radar-container') || chart.canvas.parentElement;
        body.insertAdjacentElement('afterend', details);
      }
      details.querySelector('.obs-chart-table-body').innerHTML = buildTable(chart);
    }
  };
  Chart.register(DataTablePlugin);
})(window);
