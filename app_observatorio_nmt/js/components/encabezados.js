/**
 * encabezados.js
 * Cifras-pilar del encabezado cinemático de cada página interna.
 * Todas se calculan desde CRA_NMT_DATA y CRA_NMTPP_DATA. Los marcos 1032 y 1038 nunca se suman
 * en una misma cifra (regla de oro 10, RN-NMTPP-02): cuando una página muestra ambos, van en pilares separados.
 */

window.Encabezados = {
  fmtInt: n => Number(n).toLocaleString('es-CO'),
  fmtPct: n => Number(n).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %',

  datos() {
    const P = window.CRA_NMT_DATA?.prestadores || [];
    const PP = window.CRA_NMTPP_DATA?.prestadores || [];
    return {
      P, PP,
      radicados: P.filter(p => p.nmt_tracking.estudio_costos_reportado).length,
      verificados: P.filter(p => p.calidad.quality_flag === 'VERIFIED').length,
      deptos: new Set([...P.map(p => p.departamento_nombre), ...PP.map(p => p.departamento?.nombre).filter(Boolean)]).size
    };
  },

  pilares(tab) {
    const d = this.datos();
    const { P, PP } = d;
    const pct = (a, b) => (b ? this.fmtPct(a / b * 100) : '—');
    switch (tab) {
      case 'tablero': {
        const susc = P.reduce((a, p) => a + (p.suscriptores_acueducto || 0), 0);
        return [
          { v: this.fmtInt(P.length), l: 'grandes prestadores, segmentos 1 a 4' },
          { v: pct(d.radicados, P.length), l: 'con estudio de costos radicado' },
          { v: (susc / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' M', l: 'suscriptores de acueducto' }
        ];
      }
      case 'nmtpp': {
        const pp = window.HeroNmtpp ? window.HeroNmtpp.resumen() : null;
        const sub = Object.keys(window.CRA_NMTPP_DATA?.adopcion_esperada || {}).length;
        const q = (window.CRA_NMTPP_DATA?._meta?.aclaraciones_abiertas || []).length;
        return [
          { v: this.fmtInt(PP.length), l: 'prestadores y gestores comunitarios (datos sintéticos)' },
          { v: pp ? this.fmtInt(pp.aps) : '—', l: 'áreas de prestación del servicio' },
          { v: this.fmtInt(sub), l: 'subsegmentos con metas propias' },
          { v: this.fmtInt(q), l: 'aclaraciones normativas abiertas' }
        ];
      }
      case 'ciclo': {
        const ciclo = window.CRA_NMT_DATA?.metadata?.ciclo_regulatorio_ocde || [];
        const actual = ciclo.find(s => s.estado === 'en_curso');
        const cumplidas = ciclo.filter(s => s.estado === 'cumplida').length;
        return [
          { v: actual ? actual.codigo : '—', l: 'etapa en curso del ciclo E0–E9' },
          { v: `${cumplidas} de ${ciclo.length}`, l: 'etapas cumplidas' },
          { v: '12', l: 'principios de gobernanza del agua de la OCDE' }
        ];
      }
      case 'prestadores':
        return [
          { v: this.fmtInt(P.length), l: 'grandes prestadores · Res. 1032' },
          { v: this.fmtInt(PP.length), l: 'pequeños y comunitarios · Res. 1038 (sintéticos)' },
          { v: this.fmtInt(d.deptos), l: 'departamentos' }
        ];
      case 'mapa':
        return [
          { v: this.fmtInt(d.radicados), l: 'grandes con estudio radicado' },
          { v: this.fmtInt(P.length - d.radicados), l: 'grandes con reporte pendiente' },
          { v: this.fmtInt(PP.length), l: 'pequeños y comunitarios (sintéticos)' }
        ];
      case 'metodologia': {
        const f1032 = Object.keys(window.ModalsFichas?.fichasData || {}).length;
        const f1038 = (window.Fichas?.FICHAS_CATALOGO || []).length;
        return [
          { v: this.fmtInt(f1032), l: 'fichas de indicadores · Res. 1032' },
          { v: this.fmtInt(f1038), l: 'fichas de indicadores · Res. 1038' },
          { v: pct(d.verificados, P.length), l: 'de grandes prestadores con dato verificado' }
        ];
      }
      case 'datos':
        return [
          { v: this.fmtInt(P.length), l: 'registros · Res. 1032' },
          { v: this.fmtInt(PP.length), l: 'prestadores · Res. 1038 (sintéticos)' },
          { v: 'CSV · JSON', l: 'formatos abiertos, con fecha de corte y semáforo' }
        ];
      default:
        return [];
    }
  }
};
