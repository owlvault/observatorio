/**
 * cinematica_kit.js
 * Motor de movimiento de la capa visual: entradas al hacer scroll, lienzo autodimensionado
 * y disparo único al entrar en pantalla. Sin módulos ES: el prototipo debe abrir con doble clic.
 * Todo respeta prefers-reduced-motion y se pausa fuera de pantalla.
 */

(function(window) {
  'use strict';

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let revealObserver = null;

  // El HTML llega visible; solo se oculta bajo html.reveal-ready y después de marcar lo que ya se ve.
  // Se vuelve a llamar tras cambiar de pestaña o insertar contenido.
  function initReveal() {
    if (reducedMotion() || !('IntersectionObserver' in window)) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', '');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px' });
    }
    requestAnimationFrame(() => {
      document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach(el => {
        const rect = el.getBoundingClientRect();
        const hiddenPane = rect.width === 0 && rect.height === 0;
        if (hiddenPane) return; // pestaña oculta: se evalúa cuando se muestre
        if (rect.top < window.innerHeight) el.setAttribute('data-revealed', '');
        else revealObserver.observe(el);
      });
      document.documentElement.classList.add('reveal-ready');
    });
  }

  // draw({ ctx, width, height, time }) recibe píxeles CSS y segundos
  function autoCanvas(canvas, draw, opts) {
    const animate = opts && opts.animate !== undefined ? opts.animate : !reducedMotion();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const start = performance.now();
    let width = 0, height = 0, frame = 0, visible = true;

    const paint = () => {
      frame = 0;
      if (width > 1 && height > 1) draw({ ctx, width, height, time: (performance.now() - start) / 1000 });
      if (animate && visible) frame = requestAnimationFrame(paint);
    };

    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      if (Math.abs(rect.width - width) < 1 && Math.abs(rect.height - height) < 1) return;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!frame) paint();
    };

    new ResizeObserver(fit).observe(canvas);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && animate && !frame) frame = requestAnimationFrame(paint);
    }).observe(canvas);
    fit();
  }

  // Para anillos, rejillas y barras que se llenan al verse. Con movimiento reducido dispara ya.
  function onceInView(element, callback, amount) {
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      callback();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        callback();
      }
    }, { threshold: amount === undefined ? 0.3 : amount });
    observer.observe(element);
  }

  // Superficie de agua en perspectiva. Geometría determinista: idéntica en cada carga.
  function escenaAgua(canvas) {
    const COLS = 84, ROWS = 34, D = 1.6;
    const puntos = [];
    for (let r = 0; r < ROWS; r++) {
      const z = 0.25 + Math.pow(r / (ROWS - 1), 1.7) * 9; // filas más juntas cerca del horizonte
      for (let c = 0; c < COLS; c++) {
        puntos.push({ x: (c / (COLS - 1) - 0.5) * 9, z, faro: (r * COLS + c) % 53 === 0 });
      }
    }

    let tilt = 0, tiltTarget = 0;
    const hero = canvas.closest('.cx-hero');
    if (hero && !reducedMotion()) {
      hero.addEventListener('pointermove', e => {
        const rect = hero.getBoundingClientRect();
        tiltTarget = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      }, { passive: true });
    }

    autoCanvas(canvas, ({ ctx, width, height, time }) => {
      tilt += (tiltTarget - tilt) * 0.04;
      const t = time * 0.55;
      const horizonte = height * 0.06;
      const cx = width / 2 - tilt * 26;
      const escalaX = Math.max(width, 900) * 0.62;
      const escalaY = height * 1.05;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < puntos.length; i++) {
        const p = puntos[i];
        const ola = Math.sin(p.x * 1.15 + t) * 0.11 + Math.sin(p.z * 1.6 - t * 1.3) * 0.09 + Math.sin((p.x + p.z) * 0.7 + t * 0.6) * 0.06;
        const f = D / (D + p.z);
        const sx = cx + p.x * f * escalaX;
        const sy = horizonte + (0.92 + ola) * f * escalaY;
        if (sx < -20 || sx > width + 20 || sy > height + 20) continue;

        const cresta = (ola + 0.26) / 0.52; // 0 valle, 1 cresta
        const radio = Math.max(0.7, f * 4.8);
        const alfa = Math.min(1, 0.3 + f * 1.3) * (0.5 + cresta * 0.5);
        const g = Math.round(140 + cresta * 80);
        ctx.fillStyle = `rgba(${Math.round(40 + cresta * 90)}, ${g}, 255, ${alfa.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, radio, 0, 6.2832);
        ctx.fill();

        if (p.faro) {
          const latido = 0.55 + 0.45 * Math.sin(t * 2.2 + i);
          const halo = radio * 7;
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, halo);
          grad.addColorStop(0, `rgba(190, 235, 255, ${(0.55 * latido * Math.min(1, f * 2)).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, halo, 0, 6.2832);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    });
  }

  // ---------------------------------------------------------------------------
  // Piezas de dato para tableros. Devuelven HTML/SVG como texto para insertarlo en las
  // plantillas de los componentes; animateIn() las enciende cuando entran en pantalla.
  // ---------------------------------------------------------------------------
  let uid = 0;
  const clamp01 = v => Math.max(0, Math.min(1, Number(v) || 0));

  // Anillo que se llena hasta frac (0-1). tone: 'ink' sobre fondo claro, 'light' sobre Deep Navy.
  function ring(frac, opts) {
    const o = Object.assign({ size: 88, stroke: 10, tone: 'ink', label: '' }, opts || {});
    const r = (o.size - o.stroke) / 2, c = 2 * Math.PI * r, id = 'cxr' + (++uid);
    const stops = o.tone === 'light'
      ? '<stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#7dd3fc"/><stop offset="1" stop-color="#2a78d6"/>'
      : '<stop offset="0" stop-color="#38bdf8"/><stop offset=".55" stop-color="#1664b0"/><stop offset="1" stop-color="#0a2f55"/>';
    return `<svg class="cx-ring-anim cx-ring-${o.tone}" data-cx-anim viewBox="0 0 ${o.size} ${o.size}" width="${o.size}" height="${o.size}" ${o.label ? `role="img" aria-label="${o.label}"` : 'aria-hidden="true"'} style="--c:${c.toFixed(2)};--to:${(c * (1 - clamp01(frac))).toFixed(2)}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient></defs>
      <circle class="t" cx="${o.size / 2}" cy="${o.size / 2}" r="${r}" stroke-width="${o.stroke}"/>
      <circle class="v" cx="${o.size / 2}" cy="${o.size / 2}" r="${r}" stroke-width="${o.stroke}" stroke="url(#${id})"/>
    </svg>`;
  }

  // Barra horizontal que crece hasta frac; marker (0-1) dibuja una línea de meta.
  function meter(frac, opts) {
    const o = Object.assign({ marker: null, markerLabel: '', tone: 'ink' }, opts || {});
    return `<div class="cx-meter cx-meter-${o.tone}" data-cx-anim aria-hidden="true">
      <i style="width:${(clamp01(frac) * 100).toFixed(1)}%"></i>
      ${o.marker !== null ? `<b style="left:${(clamp01(o.marker) * 100).toFixed(1)}%" data-label="${o.markerLabel}"></b>` : ''}
    </div>`;
  }

  // Columnas pequeñas para una serie corta (estratos, subsegmentos). values: [{v, label, hi}]
  function columns(values, opts) {
    const o = Object.assign({ height: 72, label: '' }, opts || {});
    const max = Math.max(...values.map(x => Math.abs(x.v || 0))) || 1;
    return `<div class="cx-cols" data-cx-anim style="height:${o.height}px" ${o.label ? `role="img" aria-label="${o.label}"` : 'aria-hidden="true"'}>
      ${values.map(x => `<span class="${x.hi ? 'hi' : ''}" style="height:${Math.max(6, Math.abs(x.v || 0) / max * 100).toFixed(1)}%"><em>${x.label || ''}</em></span>`).join('')}
    </div>`;
  }

  // Enciende las piezas [data-cx-anim] de root cuando entran en pantalla (una vez).
  function animateIn(root) {
    (root || document).querySelectorAll('[data-cx-anim]:not(.is-on)').forEach(el => {
      if (el._cxWatch) return;
      el._cxWatch = true;
      onceInView(el, () => el.classList.add('is-on'), 0.2);
    });
  }

  window.CineKit = { reducedMotion, initReveal, autoCanvas, onceInView, escenaAgua, ring, meter, columns, animateIn };
})(window);
