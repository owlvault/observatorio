/**
 * timeline_ocde.js
 * Ciclo regulatorio E0 a E9 como anillo interactivo (mismo lenguaje que el anillo de la portada)
 * Requisitos: RF-NMT-01, RF-NMT-11. Estados y fechas salen de CRA_NMT_DATA.metadata.ciclo_regulatorio_ocde.
 */

window.TimelineOCDE = {
  estados: { cumplida: 'Cumplida', en_curso: 'En curso', pendiente: 'Prevista' },

  fmtFecha: function(iso) {
    if (!iso) return 'Por definir';
    const [y, m, d] = String(iso).split('-').map(Number);
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return d && m ? `${d} ${meses[m - 1]} ${y}` : String(iso);
  },

  // Reutiliza la tabla de tildes y los nombres cortos de la portada si están cargados (solo lectura)
  tildes: function(s) {
    if (window.Portada && window.Portada.tildes && window.PORTADA_COPY) return window.Portada.tildes(s);
    return String(s || '');
  },

  render: function(containerId, activeProvider = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const metadata = window.CRA_NMT_DATA?.metadata;
    if (!metadata || !metadata.ciclo_regulatorio_ocde) {
      container.innerHTML = '<p class="text-muted">No se cargaron los hitos del ciclo regulatorio.</p>';
      return;
    }

    const ciclo = metadata.ciclo_regulatorio_ocde;
    const copy = (window.PORTADA_COPY && window.PORTADA_COPY.ciclo) || { etapas: {} };

    // Si hay un prestador seleccionado, se evalúa su hito individual
    const providerStage = activeProvider?.nmt_tracking?.etapa_actual || null;
    const provNum = providerStage ? parseInt(providerStage.replace('E', '')) : null;
    const pasos = ciclo.map(step => {
      let estado = step.estado; // cumplida, en_curso, pendiente
      let rotulo = this.estados[estado] || estado;
      if (activeProvider && provNum !== null) {
        const stepNum = parseInt(step.codigo.replace('E', ''));
        if (stepNum < provNum) { estado = 'cumplida'; rotulo = 'Cumplida (prestador)'; }
        else if (stepNum === provNum) { estado = 'en_curso'; rotulo = 'Etapa actual del prestador'; }
        else { estado = 'pendiente'; rotulo = 'Pendiente'; }
      }
      const fecha = step.fecha || step.fecha_limite || step.fecha_prevista;
      return {
        step, estado, rotulo, fecha,
        rotuloFecha: step.fecha ? 'Fecha' : (step.fecha_limite ? 'Fecha límite' : 'Fecha prevista'),
        corto: (copy.etapas[step.codigo] || {}).corto || this.tildes(step.nombre),
        descripcion: (copy.etapas[step.codigo] || {}).descripcion || this.tildes(step.descripcion)
      };
    });

    const CX = 300, CY = 300, R1 = 284, R0 = 196, GAP = 2.2;
    const paso = 360 / pasos.length;
    const pt = (r, deg) => {
      const a = (deg - 90) * Math.PI / 180;
      return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
    };
    const arco = i => {
      const a0 = i * paso + GAP / 2, a1 = (i + 1) * paso - GAP / 2;
      const [x0, y0] = pt(R1, a0), [x1, y1] = pt(R1, a1), [x2, y2] = pt(R0, a1), [x3, y3] = pt(R0, a0);
      return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${R1} ${R1} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}A${R0} ${R0} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)}Z`;
    };
    const inicial = Math.max(0, pasos.findIndex(p => p.estado === 'en_curso'));
    const enCurso = pasos.filter(p => p.estado === 'en_curso').length;
    const quien = activeProvider ? (activeProvider.sigla || activeProvider.prestador_nombre) : '';

    const titular = document.getElementById('ciclo-ocde-titular');
    if (titular) titular.textContent = enCurso ? (activeProvider ? `${quien} en ${providerStage}` : 'una en curso') : 'ninguna en curso';

    // Ids de degradado propios: el anillo de la portada comparte el documento
    container.innerHTML = `
      <div class="cx-cycle-ring">
        <svg viewBox="0 0 600 600" role="group" aria-label="Etapas del ciclo regulatorio, de E0 a E9${activeProvider ? ', según la etapa de ' + quien : ''}">
          <defs>
            <radialGradient id="cxo-ciclo-cumplida" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R1}"><stop offset=".68" stop-color="#5d9fe6"/><stop offset=".86" stop-color="#1f6fc4"/><stop offset="1" stop-color="#0f4273"/></radialGradient>
            <radialGradient id="cxo-ciclo-en_curso" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R1}"><stop offset=".68" stop-color="#ffffff"/><stop offset=".84" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0ea5e9"/></radialGradient>
            <radialGradient id="cxo-ciclo-pendiente" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R1}"><stop offset=".68" stop-color="#2c4a6c"/><stop offset="1" stop-color="#132e4d"/></radialGradient>
          </defs>
          ${pasos.map((p, i) => {
            const [tx, ty] = pt((R0 + R1) / 2, (i + 0.5) * paso);
            return `<g class="cx-seg-arc is-${p.estado}" role="button" tabindex="0" data-i="${i}" aria-pressed="${i === inicial}" aria-label="${p.step.codigo}, ${p.corto}: ${p.rotulo}">
              <path d="${arco(i)}" fill="url(#cxo-ciclo-${p.estado})"/>
              <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" ${p.estado === 'en_curso' ? 'style="fill:#06223d"' : ''}>${p.step.codigo}</text>
            </g>`;
          }).join('')}
        </svg>
        <div class="cx-cycle-center" aria-hidden="true">
          <span class="cx-cycle-code cx-grad-light" data-ciclo-codigo></span>
          <span class="cx-cycle-state" data-ciclo-estado></span>
        </div>
      </div>
      <div class="cx-cycle-detail" aria-live="polite">
        ${pasos.map((p, i) => `
          <div class="cx-cycle-panel" data-i="${i}" ${i === inicial ? '' : 'hidden'}>
            <span class="cx-eyebrow">${p.step.codigo} · ${this.tildes(p.step.fase)}${quien ? ' · ' + quien : ''}</span>
            <h3 class="cx-display-3">${p.corto}</h3>
            <p>${p.descripcion}</p>
            <ul class="cx-cycle-meta">
              <li><b>${p.rotulo}</b></li>
              <li>${p.rotuloFecha}: <b>${this.fmtFecha(p.fecha)}</b></li>
              <li>Responsable: <b>${this.tildes(p.step.responsable)}</b></li>
            </ul>
          </div>`).join('')}
        <ul class="cx-cycle-legend" aria-hidden="true">
          <li><i style="background:linear-gradient(90deg,#5d9fe6,#1f6fc4)"></i>Cumplida</li>
          <li><i style="background:linear-gradient(90deg,#fff,#38bdf8)"></i>${activeProvider ? 'Etapa del prestador' : 'En curso'}</li>
          <li><i style="background:#2c4a6c"></i>Prevista</li>
        </ul>
      </div>
    `;

    const arcos = [...container.querySelectorAll('.cx-seg-arc')];
    const activar = i => {
      arcos.forEach(g => g.setAttribute('aria-pressed', String(Number(g.dataset.i) === i)));
      container.querySelectorAll('.cx-cycle-panel').forEach(pn => { pn.hidden = Number(pn.dataset.i) !== i; });
      container.querySelector('[data-ciclo-codigo]').textContent = pasos[i].step.codigo;
      container.querySelector('[data-ciclo-estado]').textContent = pasos[i].rotulo;
    };
    arcos.forEach(g => {
      g.addEventListener('click', () => activar(Number(g.dataset.i)));
      g.addEventListener('keydown', e => {
        const i = Number(g.dataset.i);
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activar(i);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          // Flechas: recorren el anillo en el sentido del reloj o en contra
          e.preventDefault();
          const n = (i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + arcos.length) % arcos.length;
          arcos[n].focus();
          activar(n);
        }
      });
    });
    activar(inicial);
  }
};
