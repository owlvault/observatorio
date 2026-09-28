/**
 * hero_cifras.js
 * Cifras del encabezado de la Res. CRA 1038 de 2026, con su anillo.
 * Se calculan desde CRA_NMTPP_DATA: ninguna se escribe a mano en el HTML.
 */

(function(window) {
  'use strict';

  const fmtPct = n => n.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  const HeroNmtpp = {
    resumen() {
      const d = window.CRA_NMTPP_DATA;
      if (!d || !d.prestadores) return null;
      const adop = d.adopcion_esperada || {};
      let universo = 0, inicial = 0, recalculo = 0;
      Object.keys(adop).forEach(k => {
        universo += adop[k].U || 0;
        inicial += adop[k].ADO01_inicial || 0;
        recalculo += adop[k].ADO04_recalculo_2028_en_ventana || 0;
      });
      const aps = d.prestadores.reduce((acc, p) => acc + (p.aps ? p.aps.length : 0), 0);
      return { prestadores: d.prestadores.length, universo, inicial, recalculo, aps };
    },

    render(pp) {
      pp = pp || this.resumen();
      if (!pp) return;
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      set('nmtpp-kpi-universo', pp.prestadores);
      set('nmtpp-kpi-aps', pp.aps);
      if (pp.universo > 0) {
        set('nmtpp-kpi-inicial', fmtPct(pp.inicial / pp.universo * 100));
        set('nmtpp-kpi-inicial-frac', `(${pp.inicial}/${pp.universo})`);
        set('nmtpp-kpi-recalculo', fmtPct(pp.recalculo / pp.universo * 100));
        set('nmtpp-kpi-recalculo-frac', `(${pp.recalculo}/${pp.universo})`);
        this.miniRing('nmtpp-kpi-inicial', pp.inicial / pp.universo, 'ring-nmtpp-inicial');
        this.miniRing('nmtpp-kpi-recalculo', pp.recalculo / pp.universo, 'ring-nmtpp-recalculo');
      }
    },

    miniRing(valueId, fraction, gradId) {
      const card = document.getElementById(valueId)?.closest('.hero-metric-card');
      if (!card || card.querySelector('.cx-mini-ring') || !window.CineKit) return;
      const r = 32, c = 2 * Math.PI * r;
      card.classList.add('cx-has-ring');
      card.insertAdjacentHTML('afterbegin', `
        <svg class="cx-mini-ring" viewBox="0 0 76 76" aria-hidden="true">
          <defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#1664b0"/></linearGradient></defs>
          <circle class="t" cx="38" cy="38" r="${r}"/>
          <circle class="v" cx="38" cy="38" r="${r}" stroke="url(#${gradId})" stroke-dasharray="${c}" stroke-dashoffset="${c}"/>
        </svg>`);
      const arc = card.querySelector('.cx-mini-ring .v');
      // La tarjeta puede cargar oculta: el anillo se llena cuando entra en pantalla
      window.CineKit.onceInView(card, () => { arc.style.strokeDashoffset = c * (1 - fraction); });
    }
  };

  window.HeroNmtpp = HeroNmtpp;
})(window);
