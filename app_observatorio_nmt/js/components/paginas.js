/**
 * paginas.js
 * Cifras de las páginas Metodología y Datos abiertos. El texto vive en index.html;
 * aquí solo se completan los conteos, que salen de los datos y nunca se escriben a mano.
 */

window.Paginas = {
  render() {
    this.renderCalidad();
    this.renderConteos();
    if (this.rotularSubsegmentos) this.rotularSubsegmentos();
  },

  // Semáforo de calidad de los grandes prestadores: conteo, anillo de proporción e ícono
  renderCalidad() {
    const el = document.getElementById('metodologia-calidad');
    const P = window.CRA_NMT_DATA?.prestadores || [];
    if (!el || !P.length || !window.CineKit) return;
    const iconos = window.Portada?.iconoCalidad || {};
    el.querySelectorAll('[data-q]').forEach(tile => {
      const q = tile.dataset.q;
      const n = P.filter(p => p.calidad.quality_flag === q).length;
      const nombre = tile.querySelector('h3').textContent;
      tile.querySelector('.cx-q-count').textContent = n.toLocaleString('es-CO');
      tile.querySelector('.cx-q-icon').innerHTML = iconos[q] || '';
      if (!tile.querySelector('.cx-ring-anim')) {
        tile.insertAdjacentHTML('beforeend', window.CineKit.ring(n / P.length, {
          size: 72, stroke: 9, label: `${nombre}: ${n} de ${P.length} grandes prestadores`
        }));
      }
    });
    window.CineKit.animateIn(el);
  },

  renderConteos() {
    const set = (sel, v) => document.querySelectorAll(sel).forEach(e => { e.textContent = v; });
    set('[data-cx-count="1032"]', (window.CRA_NMT_DATA?.prestadores || []).length.toLocaleString('es-CO'));
    set('[data-cx-count="1038"]', (window.CRA_NMTPP_DATA?.prestadores || []).length.toLocaleString('es-CO'));
    const estados = (window.CRA_NMTPP_DATA?.estados_esperados || []).length;
    set('[data-cx-count="estados"]', estados ? `(${estados.toLocaleString('es-CO')})` : '');
  }
};

// Rótulos del filtro de tamaño de la Res. 1038, leídos de los parámetros (INV-02):
// el texto estático de index.html es solo respaldo si el JS no carga.
window.Paginas.rotularSubsegmentos = function() {
  const sel = document.getElementById('filtro-subsegmento');
  const segs = window.CRA_NMTPP_PARAMS?.segmentos || [];
  if (!sel || !segs.length) return;
  const n = v => Number(v).toLocaleString('es-CO');
  segs.forEach(seg => (seg.subsegmentos || []).forEach(s => {
    const opt = sel.querySelector(`option[value="${s.id}"]`);
    if (!opt) return;
    const quien = seg.id === 'S1' ? 'Empresas' : 'Comunitarios';
    const rango = s.min_exclusivo == null ? `hasta ${n(s.max_inclusivo)}`
      : s.max_inclusivo == null ? `más de ${n(s.min_exclusivo)}`
      : `${n(s.min_exclusivo + 1)} a ${n(s.max_inclusivo)}`;
    opt.textContent = `${quien}: ${rango} suscriptores (${s.id})`;
  }));
};
