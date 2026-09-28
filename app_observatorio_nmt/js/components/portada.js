/**
 * portada.js
 * Portada visual del Observatorio CRA: escena de agua, bento de cifras, mensajes y anillo del ciclo E0-E9.
 * Todas las cifras se calculan desde CRA_NMT_DATA y CRA_NMTPP_DATA; ninguna se escribe a mano.
 * Los textos viven en portada_contenido.js (PORTADA_COPY).
 * Salvaguardas: sin rankings ni puntajes compuestos (RN-PORTAL-05), tarifas solo por estrato (RN-PORTAL-04),
 * comparaciones dentro de cada segmento (RN-NMT-02), semáforo con color + forma + texto (RF-PORTAL-05).
 */

window.Portada = {
  fmtInt: n => n.toLocaleString('es-CO'),
  fmtPct: n => n.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %',
  fmtFecha: function(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d} ${meses[m - 1]} ${y}`;
  },
  tildes: function(s) {
    const map = window.PORTADA_COPY.tildes;
    return String(s || '').replace(/[A-Za-z]+/g, w => map[w] || w);
  },
  irA: ir => `window.AppNMT.goTo(${ir.map(x => `'${x}'`).join(', ')})`,

  median: function(arr) {
    const a = [...arr].sort((x, y) => x - y);
    const m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  },

  resumenNmtpp: () => window.HeroNmtpp.resumen(),

  render: function() {
    const P = window.CRA_NMT_DATA?.prestadores || [];
    const meta = window.CRA_NMT_DATA?.metadata || {};
    const pp = this.resumenNmtpp();

    window.HeroNmtpp.render(pp);
    this.renderHero(P, pp);
    this.renderCifras(P, pp);
    this.renderMensajes(P, meta);
    this.renderCiclo(meta);
    if (window.CineKit) window.CineKit.initReveal();
  },

  // ------------------------------------------------------------------ Hero
  renderHero: function(P, pp) {
    const deptos = new Set(P.map(p => p.departamento_nombre));
    if (pp) (window.CRA_NMTPP_DATA.prestadores || []).forEach(p => p.departamento?.nombre && deptos.add(p.departamento.nombre));
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    // Cada marco con su propia cifra: nunca se suman (regla de oro 10)
    set('hero-pilar-1032', this.fmtInt(P.length));
    set('hero-pilar-1038', this.fmtInt(pp ? pp.prestadores : 0));
    set('hero-pilar-deptos', deptos.size);

    const canvas = document.getElementById('hero-canvas');
    if (canvas && window.CineKit) window.CineKit.escenaAgua(canvas);
  },

  // ---------------------------------------------------------------- Cifras
  renderCifras: function(P, pp) {
    const el = document.getElementById('portada-cifras');
    if (!el || P.length === 0) return;
    const C = window.PORTADA_COPY.cifras;

    const total1032 = P.length;
    const adoptaron = P.filter(p => p.nmt_tracking.estudio_costos_reportado).length;
    const suscriptores = P.reduce((a, p) => a + (p.suscriptores_acueducto || 0), 0);
    const deptos = new Set(P.map(p => p.departamento_nombre));
    if (pp) (window.CRA_NMTPP_DATA.prestadores || []).forEach(p => p.departamento?.nombre && deptos.add(p.departamento.nombre));
    const n1038 = pp ? pp.prestadores : 0;
    const suscM = (suscriptores / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 });

    const marcos = {
      '1032': { n: adoptaron, total: total1032 },
      '1038': { n: pp ? pp.inicial : 0, total: pp ? pp.universo : 0 }
    };
    const R = 118, CIRC = 2 * Math.PI * R;
    const dots = (a, b) => Array.from({ length: a + b }, (_, i) => `<i class="${i < a ? 'a' : 'b'}" style="transition-delay:${i * 5}ms"></i>`).join('');

    el.innerHTML = `
      <article class="cx-tile cx-tile-deep cx-span-6 cx-on-dark" data-reveal>
        <span class="cx-tile-label">${C.adopcion.etiqueta}</span>
        <h3 class="cx-display-3">${C.adopcion.titular}</h3>
        <div class="cx-seg" role="group" aria-label="Marco tarifario">
          ${Object.keys(marcos).map((k, i) => `<button type="button" data-marco="${k}" aria-pressed="${i === 0}">${C.adopcion.marcos[k].boton}</button>`).join('')}
        </div>
        <div class="cx-ring-wrap">
          <div class="cx-ring" id="cifras-ring" role="img" aria-label="">
            <svg viewBox="0 0 280 280" aria-hidden="true">
              <defs><linearGradient id="cifras-ring-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#7dd3fc"/><stop offset="1" stop-color="#2a78d6"/></linearGradient></defs>
              <circle class="cx-ring-track" cx="140" cy="140" r="${R}" stroke-width="22"/>
              <circle class="cx-ring-value" cx="140" cy="140" r="${R}" stroke-width="22" stroke="url(#cifras-ring-grad)" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/>
            </svg>
            <div class="cx-ring-center" aria-hidden="true">
              <span class="cx-ring-number cx-grad-light" id="cifras-ring-number"></span>
              <span class="cx-ring-frac" id="cifras-ring-frac"></span>
            </div>
          </div>
          <div class="cx-ring-panels" aria-live="polite">
            ${Object.keys(marcos).map((k, i) => `
              <div data-panel="${k}" ${i === 0 ? '' : 'hidden'}>
                <p><strong>${marcos[k].n} de ${marcos[k].total}</strong> ${C.adopcion.marcos[k].apoyo}</p>
                <button class="cx-link" onclick="${this.irA(C.adopcion.marcos[k].ir)}">${C.adopcion.marcos[k].cta}</button>
              </div>`).join('')}
          </div>
        </div>
      </article>

      <article class="cx-tile cx-span-3" data-reveal data-reveal-delay="1">
        <span class="cx-tile-label">${C.prestadores.etiqueta}</span>
        <h3 class="cx-display-3">${C.prestadores.titular}</h3>
        <div class="cx-dots-pair" id="cifras-dots" role="img" aria-label="${total1032} grandes prestadores de la Res. 1032 y, aparte, ${n1038} pequeños prestadores y gestores comunitarios de la Res. 1038, en ${deptos.size} departamentos">
          <div class="cx-dots">${dots(total1032, 0)}</div>
          <div class="cx-dots">${dots(0, n1038)}</div>
        </div>
        <ul class="cx-legend">
          <li><span class="cx-key cx-key-a"></span><b>${total1032}</b> ${C.prestadores.leyenda1032}</li>
          <li><span class="cx-key cx-key-b"></span><b>${n1038}</b> ${C.prestadores.leyenda1038}</li>
        </ul>
        <div class="cx-tile-foot"><button class="cx-link" onclick="${this.irA(C.prestadores.ir)}">${C.prestadores.cta}</button></div>
      </article>

      <article class="cx-tile cx-tile-fill cx-span-3 cx-on-dark" data-reveal data-reveal-delay="2">
        <span class="cx-tile-label">${C.suscriptores.etiqueta}</span>
        <div class="cx-stat">${suscM}</div>
        <h3 class="cx-display-3">${C.suscriptores.unidad}</h3>
        <p class="cx-tile-note">${C.suscriptores.apoyo}</p>
        <div class="cx-tile-foot"><button class="cx-link" onclick="${this.irA(C.suscriptores.ir)}">${C.suscriptores.cta}</button></div>
      </article>
    `;

    const ring = el.querySelector('#cifras-ring');
    const arc = ring.querySelector('.cx-ring-value');
    let visto = false;
    const pintar = k => {
      const m = marcos[k];
      const frac = m.total ? m.n / m.total : 0;
      el.querySelector('#cifras-ring-number').textContent = m.total ? this.fmtPct(frac * 100) : '—';
      el.querySelector('#cifras-ring-frac').textContent = `${m.n} de ${m.total}`;
      ring.setAttribute('aria-label', `${this.fmtPct(frac * 100)}: ${m.n} de ${m.total} ${C.adopcion.marcos[k].apoyo}`);
      if (visto) arc.style.strokeDashoffset = CIRC * (1 - frac);
      el.querySelectorAll('[data-marco]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.marco === k)));
      el.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== k; });
    };
    el.querySelectorAll('[data-marco]').forEach(b => b.addEventListener('click', () => pintar(b.dataset.marco)));
    pintar('1032');
    window.CineKit.onceInView(ring, () => { visto = true; pintar(el.querySelector('[data-marco][aria-pressed="true"]').dataset.marco); });
    const campo = el.querySelector('#cifras-dots');
    window.CineKit.onceInView(campo, () => campo.querySelectorAll('.cx-dots').forEach(d => d.classList.add('is-on')));
  },

  // -------------------------------------------------------------- Mensajes
  iconoCalidad: {
    VERIFIED: '<svg class="cx-qicon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#059669"/><path d="M5.8 10.4l2.8 2.8 5.6-6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    WARNING: '<svg class="cx-qicon" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.2l8.4 15H1.6z" fill="#b45309" stroke="#b45309" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 8v4.4M10 14.8v.2" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
    QUARANTINE: '<svg class="cx-qicon" viewBox="0 0 20 20" aria-hidden="true"><rect x="3.6" y="3.6" width="12.8" height="12.8" rx="2" transform="rotate(45 10 10)" fill="#dc2626"/><path d="M6.6 10h6.8" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
    NO_REPORT: '<svg class="cx-qicon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="#64748b" stroke-width="2.2" stroke-dasharray="3 3"/></svg>'
  },

  renderMensajes: function(P, meta) {
    const el = document.getElementById('portada-mensajes');
    if (!el || P.length === 0) return;
    const M = window.PORTADA_COPY.mensajes;

    // 1. Pérdidas por segmento frente a la meta de referencia (comparación dentro de cada segmento)
    const segs = ['Segmento 1', 'Segmento 2', 'Segmento 3', 'Segmento 4'];
    const meta6 = P[0].nmt_tracking.estandares_servicio.ipuf_meta_m3_susc_mes;
    const segSobre = segs.filter(s => {
      const x = P.filter(p => p.segmento_cra === s).map(p => p.nmt_tracking.estandares_servicio.ipuf_ird1_m3_susc_mes);
      return x.length && this.median(x) > meta6;
    }).length;
    const provSobre = P.filter(p => p.nmt_tracking.estandares_servicio.ipuf_ird1_m3_susc_mes > meta6).length;

    // 2. Tarifas: mediana por estrato (nunca promedio general)
    const sg = v => (v > 0 ? '+' : '') + v.toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' %';
    const estratos = [1, 2, 3, 4, 5, 6].map(e => ({ e, v: this.median(P.map(p => p.nmt_tracking.variacion_tarifaria_transicion[`estrato_${e}_pct`])) }));
    const maxAbs = Math.max(...estratos.map(x => Math.abs(x.v))) || 1;

    // 3. Calidad del dato
    const orden = ['VERIFIED', 'WARNING', 'QUARANTINE', 'NO_REPORT'];
    const cuenta = {};
    orden.forEach(k => { cuenta[k] = P.filter(p => p.calidad.quality_flag === k).length; });

    const dots = Array.from({ length: P.length }, (_, i) => `<i class="${i < provSobre ? 'b' : 'c'}" style="transition-delay:${i * 7}ms"></i>`).join('');

    el.innerHTML = `
      <article class="cx-tile cx-tile-deep cx-span-3 cx-row-2 cx-on-dark" data-reveal>
        <span class="cx-tile-label">${M.perdidas.etiqueta}</span>
        <h3 class="cx-display-3">${M.perdidas.titular(provSobre, P.length)}</h3>
        <div class="cx-dots cx-dots-14" id="mensaje-perdidas" role="img" aria-label="${M.perdidas.detalle(provSobre, P.length, meta6, segSobre)}">${dots}</div>
        <ul class="cx-legend">
          <li><span class="cx-key cx-key-b"></span><b>${provSobre}</b> ${M.perdidas.leyendaSobre}</li>
          <li><span class="cx-key cx-key-c"></span><b>${P.length - provSobre}</b> ${M.perdidas.leyendaEn}</li>
        </ul>
        <details class="cx-more"><summary>Cómo leer este dato</summary><p>${M.perdidas.detalle(provSobre, P.length, meta6, segSobre)}</p></details>
        <div class="cx-tile-foot"><button class="cx-link" onclick="${this.irA(M.perdidas.ir)}">Ver datos</button></div>
      </article>

      <article class="cx-tile cx-span-3" data-reveal data-reveal-delay="1">
        <span class="cx-tile-label">${M.tarifas.etiqueta}</span>
        <h3 class="cx-display-3">${M.tarifas.titular}</h3>
        <ul class="cx-bars" id="mensaje-tarifas" aria-label="Mediana de la variación tarifaria de transición por estrato, frente a la Res. 688 de 2014">
          ${estratos.map(x => `<li><span class="cx-bar-value">${sg(x.v)}</span><span class="cx-bar" style="height:${Math.max(8, Math.abs(x.v) / maxAbs * 100 * 0.72).toFixed(1)}%"></span><span class="cx-bar-label">Estrato ${x.e}</span></li>`).join('')}
        </ul>
        <details class="cx-more"><summary>Cómo leer este dato</summary><p>${M.tarifas.detalle(sg(estratos[0].v), sg(estratos[5].v))}</p></details>
        <div class="cx-tile-foot"><button class="cx-link" onclick="${this.irA(M.tarifas.ir)}">Ver datos</button></div>
      </article>

      <article class="cx-tile cx-span-3" data-reveal data-reveal-delay="2">
        <span class="cx-tile-label">${M.calidad.etiqueta}</span>
        <h3 class="cx-display-3">${M.calidad.titular(cuenta.VERIFIED, cuenta.NO_REPORT)}</h3>
        <div>
          <div class="cx-stack" id="mensaje-calidad" role="img" aria-label="${orden.map(k => `${cuenta[k]} ${M.calidad.estados[k].toLowerCase()}`).join(', ')}">
            ${orden.map(k => `<span class="cx-q-${k}" style="flex:${cuenta[k]}"></span>`).join('')}
          </div>
          <ul class="cx-qlist">
            ${orden.map(k => `<li>${this.iconoCalidad[k]}<b>${cuenta[k]}</b> ${M.calidad.estados[k]}</li>`).join('')}
          </ul>
        </div>
        <details class="cx-more"><summary>Cómo leer este dato</summary><p>${M.calidad.detalle(cuenta.VERIFIED, cuenta.NO_REPORT)}</p></details>
        <div class="cx-tile-foot"><button class="cx-link" onclick="${this.irA(M.calidad.ir)}">Ver metodología</button></div>
      </article>
    `;

    ['mensaje-perdidas', 'mensaje-tarifas', 'mensaje-calidad'].forEach(id => {
      const g = document.getElementById(id);
      window.CineKit.onceInView(g, () => g.classList.add('is-on'));
    });
  },

  // ------------------------------------------------------ Ciclo E0–E9 (anillo)
  renderCiclo: function(meta) {
    const el = document.getElementById('portada-ciclo');
    const ciclo = meta.ciclo_regulatorio_ocde;
    if (!el || !ciclo) return;
    const K = window.PORTADA_COPY.ciclo;

    const CX = 300, CY = 300, R1 = 284, R0 = 196, GAP = 2.2;
    const paso = 360 / ciclo.length;
    const pt = (r, deg) => {
      const a = (deg - 90) * Math.PI / 180;
      return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
    };
    const arco = i => {
      const a0 = i * paso + GAP / 2, a1 = (i + 1) * paso - GAP / 2;
      const [x0, y0] = pt(R1, a0), [x1, y1] = pt(R1, a1), [x2, y2] = pt(R0, a1), [x3, y3] = pt(R0, a0);
      return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${R1} ${R1} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}A${R0} ${R0} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)}Z`;
    };
    const fecha = s => s.fecha || s.fecha_limite || s.fecha_prevista;
    const rotuloFecha = s => s.fecha ? 'Fecha' : (s.fecha_limite ? 'Fecha límite' : 'Fecha prevista');
    const corto = s => (K.etapas[s.codigo] || {}).corto || this.tildes(s.nombre);
    const inicial = Math.max(0, ciclo.findIndex(s => s.estado === 'en_curso'));

    el.innerHTML = `
      <div class="cx-cycle-ring">
        <svg viewBox="0 0 600 600" role="group" aria-label="Etapas del ciclo de implementación, de E0 a E9">
          <defs>
            <radialGradient id="ciclo-cumplida" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R1}"><stop offset=".68" stop-color="#5d9fe6"/><stop offset=".86" stop-color="#1f6fc4"/><stop offset="1" stop-color="#0f4273"/></radialGradient>
            <radialGradient id="ciclo-en_curso" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R1}"><stop offset=".68" stop-color="#ffffff"/><stop offset=".84" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0ea5e9"/></radialGradient>
            <radialGradient id="ciclo-pendiente" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R1}"><stop offset=".68" stop-color="#2c4a6c"/><stop offset="1" stop-color="#132e4d"/></radialGradient>
          </defs>
          ${ciclo.map((s, i) => {
            const [tx, ty] = pt((R0 + R1) / 2, (i + 0.5) * paso);
            return `<g class="cx-seg-arc is-${s.estado}" role="button" tabindex="0" data-i="${i}" aria-pressed="${i === inicial}" aria-label="${s.codigo}, ${corto(s)}: ${K.estados[s.estado] || s.estado}">
              <path d="${arco(i)}" fill="url(#ciclo-${s.estado})"/>
              <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" ${s.estado === 'en_curso' ? 'style="fill:#06223d"' : ''}>${s.codigo}</text>
            </g>`;
          }).join('')}
        </svg>
        <div class="cx-cycle-center" aria-hidden="true">
          <span class="cx-cycle-code cx-grad-light" id="ciclo-centro-codigo"></span>
          <span class="cx-cycle-state" id="ciclo-centro-estado"></span>
        </div>
      </div>
      <div class="cx-cycle-detail" aria-live="polite">
        ${ciclo.map((s, i) => `
          <div class="cx-cycle-panel" data-i="${i}" ${i === inicial ? '' : 'hidden'}>
            <span class="cx-eyebrow">${s.codigo} · ${this.tildes(s.fase)}</span>
            <h3 class="cx-display-3">${corto(s)}</h3>
            <p>${(K.etapas[s.codigo] || {}).descripcion || this.tildes(s.descripcion)}</p>
            <ul class="cx-cycle-meta">
              <li><b>${K.estados[s.estado] || s.estado}</b></li>
              <li>${rotuloFecha(s)}: <b>${this.fmtFecha(fecha(s))}</b></li>
              <li>Responsable: <b>${this.tildes(s.responsable)}</b></li>
            </ul>
          </div>`).join('')}
        <ul class="cx-cycle-legend" aria-hidden="true">
          <li><i style="background:linear-gradient(90deg,#5d9fe6,#1f6fc4)"></i>Cumplida</li>
          <li><i style="background:linear-gradient(90deg,#fff,#38bdf8)"></i>En curso</li>
          <li><i style="background:#2c4a6c"></i>Prevista</li>
        </ul>
        <button class="cx-link" onclick="window.AppNMT.goTo('ciclo', 'ciclo')">Ver el detalle de cada etapa</button>
      </div>
    `;

    const activar = i => {
      el.querySelectorAll('.cx-seg-arc').forEach(g => g.setAttribute('aria-pressed', String(Number(g.dataset.i) === i)));
      el.querySelectorAll('.cx-cycle-panel').forEach(p => { p.hidden = Number(p.dataset.i) !== i; });
      el.querySelector('#ciclo-centro-codigo').textContent = ciclo[i].codigo;
      el.querySelector('#ciclo-centro-estado').textContent = K.estados[ciclo[i].estado] || ciclo[i].estado;
    };
    el.querySelectorAll('.cx-seg-arc').forEach(g => {
      g.addEventListener('click', () => activar(Number(g.dataset.i)));
      g.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activar(Number(g.dataset.i));
        }
      });
    });
    activar(inicial);
  }
};
