/**
 * kpi_cards.js
 * Indicadores de seguimiento NMT como bento: una cifra y su gráfico por casilla
 * Requisitos: RF-NMT-02 a RF-NMT-09, ADR-0003, RN-PORTAL-04/05/06
 * Las metas se leen de los datos de cada prestador; ninguna se escribe en el código.
 */

window.KpiCards = {
  fmt: (n, d = 1) => Number(n).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }),
  median: arr => {
    const a = [...arr].sort((x, y) => x - y);
    const m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  },

  // Casilla común: código, semáforo (texto + punto), titular, cifra, gráfico y pie con fuente y ficha
  tile: function(o) {
    return `
      <article class="kpi-card cx-kpi ${o.cls || ''}">
        <div class="kpi-header">
          <span class="kpi-code">${o.code}</span>
          <span class="quality-badge ${o.badge}">${o.badgeText}</span>
        </div>
        <div class="kpi-label">${o.label}</div>
        <div class="kpi-value-row">
          <span class="kpi-value mono">${o.value}</span>
          <span class="kpi-unit">${o.unit}</span>
        </div>
        ${o.insight ? `<div class="kpi-insight">${o.insight}</div>` : ''}
        <div class="cx-kpi-visual">${o.visual}</div>
        <div class="kpi-subinfo">
          <span><span class="source-tier-pill ${o.tierCls}" title="${o.tierTitle}">${o.tier}</span> ${o.source}</span>
          <a class="kpi-footer-link" role="button" tabindex="0" onclick="window.ModalsFichas.open('${o.code}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.ModalsFichas.open('${o.code}')}">Ver ficha</a>
        </div>
      </article>`;
  },

  render: function(containerId, filteredProviders) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const K = window.CineKit;

    const total = filteredProviders.length;
    if (total === 0) {
      container.innerHTML = '<div class="gap-alert-box">No se encontraron prestadores con los filtros seleccionados.</div>';
      return;
    }
    const t = p => p.nmt_tracking;

    // 1. Tasa de Adopción NMT-ADO-01
    const reportaron = filteredProviders.filter(p => t(p).estudio_costos_reportado).length;
    const fAdop = reportaron / total;

    // 2. Oportunidad de Adopción NMT-ADO-02: distribución en cinco tramos de días
    const dias = filteredProviders.map(p => t(p).dias_oportunidad_adopcion).filter(v => v != null);
    const promDias = dias.length ? Math.round(dias.reduce((a, b) => a + b, 0) / dias.length) : null;
    let tramos = [];
    if (dias.length) {
      const min = Math.min(...dias), max = Math.max(...dias), paso = Math.max(1, Math.ceil((max - min + 1) / 5));
      tramos = Array.from({ length: 5 }, (_, i) => {
        const a = min + i * paso, b = a + paso - 1;
        return { v: dias.filter(d => d >= a && d <= b).length, label: `${a}`, rango: `${a} a ${b} días` };
      });
    }
    const tramoMayor = tramos.reduce((m, x, i) => (x.v > tramos[m].v ? i : m), 0);

    // 3. Variación Tarifaria de Transición NMT-TAR-01: siempre por estrato; se destaca el estrato 3
    const estratos = [1, 2, 3, 4, 5, 6].map(e => {
      const arr = filteredProviders.map(p => t(p).variacion_tarifaria_transicion[`estrato_${e}_pct`]);
      return { e, v: arr.reduce((a, b) => a + b, 0) / total };
    });
    const varE3 = estratos[2].v;

    // 4. Cobertura de Línea Base NMT-LB-01
    const lbCompleta = filteredProviders.filter(p => t(p).linea_base_2026 === 'completa').length;

    // 5. Continuidad IDH2 NMT-EST-01 (meta leída de los datos)
    const cont = filteredProviders.map(p => t(p).estandares_servicio.continuidad_idh2_hdia);
    const promCont = cont.reduce((a, b) => a + b, 0) / total;
    const metaCont = this.median(filteredProviders.map(p => t(p).estandares_servicio.continuidad_meta_hdia));
    const enMetaCont = filteredProviders.filter(p => t(p).estandares_servicio.continuidad_estado === 'en_meta').length;

    // 6. Brecha de Pérdidas IPUF NMT-EST-02 (meta de referencia leída de los datos, sujeta a Q-NMT-01)
    const ipuf = filteredProviders.map(p => t(p).estandares_servicio.ipuf_ird1_m3_susc_mes);
    const promIpuf = ipuf.reduce((a, b) => a + b, 0) / total;
    const metaIpuf = this.median(filteredProviders.map(p => t(p).estandares_servicio.ipuf_meta_m3_susc_mes));
    const brecha = promIpuf - metaIpuf;
    const escalaIpuf = Math.max(...ipuf, metaIpuf) * 1.05;

    // 7. Descuentos NMT-INC-01
    const conDescuento = filteredProviders.filter(p => t(p).descuentos_incentivos.descuento_calidad_pct > 0).length;

    // 8. Riesgo IUS NMT-RIE-01: distribución por nivel (a mayor nivel, mayor riesgo; escala no invertida)
    const niveles = [1, 2, 3, 4, 5].map(n => ({ n, v: filteredProviders.filter(p => t(p).riesgo_ius.nivel_ius === n).length }));
    const riesgoAlto = niveles[3].v + niveles[4].v;

    // Semáforo general del conjunto filtrado
    const verifiedPct = Math.round(filteredProviders.filter(p => p.calidad.quality_flag === 'VERIFIED').length / total * 100);
    const generalFlag = verifiedPct >= 80 ? 'badge-verified' : (verifiedPct >= 50 ? 'badge-warning' : 'badge-quarantine');
    const flagText = verifiedPct >= 80 ? 'VERIFICADO' : (verifiedPct >= 50 ? 'OBSERVADO' : 'EN REVISIÓN');
    const sg = v => (v >= 0 ? '+' : '') + this.fmt(v);

    container.innerHTML = [
      this.tile({
        cls: 'cx-kpi-hero', code: 'NMT-ADO-01', badge: generalFlag, badgeText: flagText,
        label: 'Adopción del marco 1032',
        value: `${this.fmt(fAdop * 100)} %`, unit: `${reportaron} de ${total} prestadores con estudio de costos radicado`,
        insight: `${reportaron} prestadores en SURICATA en ruta hacia costos eficientes auditados.`,
        visual: K.ring(fAdop, { size: 150, stroke: 16, tone: 'light', label: `${this.fmt(fAdop * 100)} % con estudio radicado` }),
        tier: 'Tier 2 · SURICATA', tierCls: 'tier-2', tierTitle: 'Factibilidad 1: captura en proceso bajo el nuevo marco', source: 'Radicación SURICATA / RUD (etapa E5)'
      }),
      this.tile({
        code: 'NMT-ADO-02', badge: 'badge-verified', badgeText: 'VERIFICADO',
        label: 'Oportunidad de adopción',
        value: promDias === null ? '—' : promDias, unit: 'días en promedio',
        insight: 'Velocidad de respuesta regulatoria desde la expedición hasta la primera factura emitida.',
        visual: tramos.length ? K.columns(tramos.map((x, i) => ({ v: x.v, label: x.label, hi: i === tramoMayor })),
          { height: 64, label: 'Prestadores por tramo de días: ' + tramos.map(x => `${x.rango}: ${x.v}`).join('; ') }) : '',
        tier: 'Tier 2 · SURICATA', tierCls: 'tier-2', tierTitle: 'Factibilidad 1: fecha de expedición frente a primera factura', source: 'SURICATA + SUI comercial'
      }),
      this.tile({
        code: 'NMT-TAR-01', badge: 'badge-warning', badgeText: 'DESAGREGADO',
        label: 'Variación tarifaria, estrato 3',
        value: `${sg(varE3)} %`, unit: 'pesos constantes de 2024, frente a la Res. 688',
        insight: 'Sin promedios ciegos: variación focalizada con subsidio de la Ley 142 en estrato 3.',
        visual: K.columns(estratos.map(x => ({ v: x.v, label: `E${x.e}`, hi: x.e === 3 })),
          { height: 64, label: 'Variación por estrato: ' + estratos.map(x => `estrato ${x.e} ${sg(x.v)} %`).join(', ') }),
        tier: 'Tier 1 → Tier 2', tierCls: 'tier-1', tierTitle: 'Factibilidad 2 para Res. 688; Factibilidad 1 para Res. 1032', source: 'TARIFAS_AA2015 → SURICATA'
      }),
      this.tile({
        code: 'NMT-LB-01', badge: 'badge-warning', badgeText: 'EN ALISTAMIENTO',
        label: 'Línea base 2026 completa',
        value: `${this.fmt(lbCompleta / total * 100)} %`, unit: `${lbCompleta} de ${total} prestadores`,
        insight: 'Alistamiento de contabilidad regulatoria e información histórica para cierre quinquenal.',
        visual: `<div class="cx-kpi-ring">${K.ring(lbCompleta / total, { size: 84, stroke: 11, label: `${lbCompleta} de ${total} con línea base completa` })}</div>`,
        tier: 'Tier 2 · SURICATA', tierCls: 'tier-2', tierTitle: 'Factibilidad 1: cierre de línea base al término de 2026', source: 'SURICATA'
      }),
      this.tile({
        code: 'NMT-EST-01', badge: 'badge-verified', badgeText: 'VERIFICADO',
        label: 'Continuidad del servicio (IDH2)',
        value: this.fmt(promCont), unit: `horas/día · ${enMetaCont} de ${total} en meta`,
        insight: `${enMetaCont} prestadores cumplen o superan la meta de horas de agua continua al día.`,
        visual: K.meter(promCont / 24, { marker: metaCont / 24, markerLabel: `meta ${this.fmt(metaCont, 0)} h` }) + '<div class="cx-kpi-scale"><span>0 h</span><span>24 h</span></div>',
        tier: 'Tier 1 · SUI Oracle', tierCls: 'tier-1', tierTitle: 'Factibilidad 2: datos físicos confirmados en Oracle SUI', source: 'SUI_AGUAS.CAR_T1057'
      }),
      this.tile({
        code: 'NMT-EST-02', badge: 'badge-verified', badgeText: 'VERIFICADO',
        label: 'Pérdidas por suscriptor (IPUF)',
        value: this.fmt(promIpuf, 2), unit: `m³/susc/mes · brecha ${sg(brecha)} frente a la meta`,
        insight: `Brecha de ${sg(brecha)} m³ que orienta planes de sectorización y reducción de fugas.`,
        visual: K.meter(promIpuf / escalaIpuf, { marker: metaIpuf / escalaIpuf, markerLabel: `meta ${this.fmt(metaIpuf)}` }) + `<div class="cx-kpi-scale"><span>0</span><span>${this.fmt(escalaIpuf, 0)} m³</span></div>`,
        tier: 'Tier 1 · SUI Oracle', tierCls: 'tier-1', tierTitle: 'Factibilidad 2: balances de volúmenes en SUI_AGUAS', source: 'SUI_AGUAS · meta sujeta a Q-NMT-01'
      }),
      this.tile({
        code: 'NMT-INC-01', badge: 'badge-warning', badgeText: 'EN TRÁMITE',
        label: 'Prestadores con descuento de servicio',
        value: `${this.fmt(conDescuento / total * 100)} %`, unit: `${conDescuento} de ${total} prestadores`,
        insight: 'Compensaciones aplicables al usuario por fallas o rezagos en la calidad del servicio.',
        visual: `<div class="cx-kpi-ring">${K.ring(conDescuento / total, { size: 84, stroke: 11, label: `${conDescuento} de ${total} con descuento` })}</div>`,
        tier: 'Tier 2 · SURICATA', tierCls: 'tier-2', tierTitle: 'Factibilidad 1 / bloqueado por Q-NMT-02', source: 'Tabla 31 · regla SSPD pendiente (Q-NMT-02)'
      }),
      this.tile({
        code: 'NMT-RIE-01', badge: 'badge-verified', badgeText: 'SSPD IUS',
        label: 'Prestadores en riesgo alto (IUS 4 y 5)',
        value: `${this.fmt(riesgoAlto / total * 100)} %`, unit: `${riesgoAlto} de ${total} prestadores`,
        insight: `Vigilancia preventiva SSPD: ${riesgoAlto} prestadores en observación para asegurar viabilidad.`,
        visual: K.columns(niveles.map(x => ({ v: x.v, label: `N${x.n}`, hi: x.n >= 4 })),
          { height: 64, label: 'Prestadores por nivel IUS: ' + niveles.map(x => `nivel ${x.n}: ${x.v}`).join(', ') }),
        tier: 'Tier 1 · SUI Oracle', tierCls: 'tier-1', tierTitle: 'Factibilidad 2: esquema AA_IUS_906', source: 'AA_IUS_906 · publicación anual SSPD'
      })
    ].join('');

    K.animateIn(container);
  }
};
