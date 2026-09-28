/**
 * impacto_ocde.js
 * Seguimiento del nuevo marco tarifario con referentes de la OCDE
 * Regulación de Agua Potable y Saneamiento Básico — CRA
 *
 * Alcance: seguimiento informativo, sin efecto jurídico. No es una evaluación ex post formal
 * (etapa E9 del ciclo) ni califica el cumplimiento; la verificación es de la SSPD (AGENTS.md, fuera de alcance).
 *
 * Cumple con:
 * - Referentes OCDE de política regulatoria (AIR) y 12 Principios de Gobernanza del Agua
 * - Reglas de Oro del Context Lake: RN-NMT-01 (Sin rankings compuestos), RN-PORTAL-04 (Desagregación por estrato),
 *   RN-NMT-02 (No comparabilidad inter-segmentos), ADR-0003 (Compuerta de Calidad), ADR-0005 (Ficha por prestador).
 * Capa visual: bento de cifras (CineKit), radar por pilares, simulador de asequibilidad en escena Deep Navy.
 */

window.ImpactoOCDE = {
  activeSubtab: 'dimensiones', // 'dimensiones' | 'radar' | 'asequibilidad' | 'ciclo'
  radarChartInstance: null,

  // Parámetros de ingreso mensual estimado por estrato en Colombia (Pesos Corrientes 2026, base DANE / SMLMV ~ $1.600.000 COP)
  referenciaIngresosEstrato: {
    1: { nombre: 'Estrato 1 (Bajo-Bajo)', ingreso_medio: 1280000, subsidio_legal_pct: 65, factor_subsidio: 0.35 },
    2: { nombre: 'Estrato 2 (Bajo)', ingreso_medio: 2080000, subsidio_legal_pct: 35, factor_subsidio: 0.65 },
    3: { nombre: 'Estrato 3 (Medio-Bajo)', ingreso_medio: 3200000, subsidio_legal_pct: 12, factor_subsidio: 0.88 },
    4: { nombre: 'Estrato 4 (Medio)', ingreso_medio: 5120000, subsidio_legal_pct: 0, factor_subsidio: 1.00 },
    5: { nombre: 'Estrato 5 (Medio-Alto)', ingreso_medio: 8800000, aporte_legal_pct: 50, factor_subsidio: 1.50 },
    6: { nombre: 'Estrato 6 (Alto)', ingreso_medio: 14400000, aporte_legal_pct: 60, factor_subsidio: 1.60 }
  },

  // Umbral internacional OCDE / Banco Mundial para asequibilidad del agua
  umbralAsequibilidadOCDE_pct: 3.0,

  // El medidor del simulador llega a 4/3 del umbral: la línea del umbral queda al 75 % de la altura
  escalaMedidorFactor: 4 / 3,

  init: function() {
    console.log("Inicializando Módulo de Impacto Regulatorio OCDE...");
    this.setupSubtabNavigation();
    this.setupAffordabilityCalculatorListeners();
    this.renderGaugeScale();
  },

  // ---------------------------------------------------------------- utilidades
  num: function(v, dec) {
    return Number(v).toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  },
  pct: function(v, dec = 2) {
    return `${this.num(v, dec)} %`;
  },
  cop: function(v) {
    return `$${Math.round(v).toLocaleString('es-CO')}`;
  },

  // Estado informativo con doble codificación: color + forma + texto
  chip: function(tipo, texto) {
    const iconos = {
      ok: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7"/><path d="M4.8 8.2l2.1 2.1 4.3-4.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      warn: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.2l7 13H1z"/><path d="M8 6v3.6M8 11.6v.1" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
      alert: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.1 1h5.8L15 5.1v5.8L10.9 15H5.1L1 10.9V5.1z"/><path d="M8 4.4v4.4M8 11.3v.1" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
      info: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="1" width="14" height="14" rx="4"/><path d="M8 7.2v4.2M8 4.6v.1" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>'
    };
    return `<span class="cxo-chip cxo-chip-${tipo}">${iconos[tipo] || iconos.info}${texto}</span>`;
  },

  // Promedio simple de un campo numérico; null si no hay prestadores
  avg: function(providers, fn) {
    if (!providers.length) return null;
    return providers.reduce((a, p) => a + (Number(fn(p)) || 0), 0) / providers.length;
  },

  // Referencia común tomada de los datos (p. ej. meta de continuidad o de IPUF); fallback = configuración previa
  refDeDatos: function(providers, fn, fallback) {
    const v = providers.map(fn).find(x => typeof x === 'number' && isFinite(x));
    return v !== undefined ? v : fallback;
  },

  // ------------------------------------------------------------ subnavegación
  setupSubtabNavigation: function() {
    const navButtons = document.querySelectorAll('.ocde-subnav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchSubtab(btn.getAttribute('data-ocde-target'));
      });
    });
  },

  switchSubtab: function(targetId) {
    this.activeSubtab = targetId;
    document.querySelectorAll('.ocde-subnav-btn').forEach(b => {
      const on = b.getAttribute('data-ocde-target') === targetId;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    // Los paneles inactivos se ocultan con hidden: el texto sigue en el DOM
    document.querySelectorAll('.ocde-subpane').forEach(pane => {
      pane.hidden = pane.id !== `ocde-pane-${targetId}`;
      pane.style.display = '';
    });

    const activePane = document.getElementById(`ocde-pane-${targetId}`);

    // Si se activa el radar, redibujarlo para que tome dimensiones correctas del canvas
    if (targetId === 'radar' && window.AppNMT) {
      setTimeout(() => {
        this.renderRadarGobernanza(window.AppNMT.filteredProviders);
      }, 50);
    } else if (targetId === 'asequibilidad' && window.AppNMT) {
      setTimeout(() => {
        this.recalculateAffordability(window.AppNMT.filteredProviders, window.AppNMT.selectedProvider);
      }, 50);
    }
    if (activePane && window.CineKit) {
      window.CineKit.animateIn(activePane);
      window.CineKit.initReveal();
    }
  },

  setupAffordabilityCalculatorListeners: function() {
    const sliderConsumo = document.getElementById('calc-consumo-slider');
    const inputConsumo = document.getElementById('calc-consumo-value');
    const selectEstrato = document.getElementById('calc-estrato-select');
    const recalcular = () => {
      if (window.AppNMT) {
        this.recalculateAffordability(window.AppNMT.filteredProviders, window.AppNMT.selectedProvider);
      }
    };

    if (sliderConsumo && inputConsumo) {
      sliderConsumo.addEventListener('input', (e) => {
        inputConsumo.textContent = `${e.target.value} m³/mes`;
        sliderConsumo.setAttribute('aria-valuetext', `${e.target.value} metros cúbicos al mes`);
        recalcular();
      });
    }

    if (selectEstrato) {
      // Selector segmentado de estrato (botones con aria-pressed); admite también un <select>
      selectEstrato.querySelectorAll('button[data-estrato]').forEach(btn => {
        btn.addEventListener('click', () => {
          selectEstrato.dataset.value = btn.dataset.estrato;
          selectEstrato.querySelectorAll('button[data-estrato]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
          recalcular();
        });
      });
      selectEstrato.addEventListener('change', recalcular);
    }
  },

  // Escala del medidor derivada del umbral configurado (sin literales en el HTML)
  renderGaugeScale: function() {
    const u = this.umbralAsequibilidadOCDE_pct;
    const max = u * this.escalaMedidorFactor;
    const scale = document.querySelector('#calc-gauge .cxo-gauge-scale');
    if (scale) {
      scale.innerHTML = [4, 3, 2, 1, 0].map(k => {
        const v = max * k / 4;
        return `<span style="--p:${k / 4}"${k === 3 ? ' class="is-umbral"' : ''}>${this.num(v, v % 1 ? 1 : 0)} %</span>`;
      }).join('');
    }
    const linea = document.querySelector('#calc-gauge .cxo-umbral');
    if (linea) {
      linea.style.setProperty('--p', String(u / max));
      linea.querySelector('span').textContent = `Umbral ${this.pct(u, u % 1 ? 1 : 0)}`;
    }
  },

  /**
   * Renderiza todos los elementos del Modelo OCDE
   */
  render: function(filteredProviders, selectedProvider = null) {
    this.renderImpactDimensionsCards(filteredProviders, selectedProvider);
    this.renderAirExPostScorecard(filteredProviders, selectedProvider);
    this.renderRadarGobernanza(filteredProviders);
    this.recalculateAffordability(filteredProviders, selectedProvider);
  },

  /**
   * 1. Las 5 dimensiones: bento con una cifra protagonista y su gráfico frente a la referencia
   */
  renderImpactDimensionsCards: function(providers, selectedProvider) {
    const container = document.getElementById('ocde-dimensions-grid');
    if (!container) return;

    const total = providers.length;
    if (total === 0) {
      container.innerHTML = '<div class="gap-alert-box cx-span-6">No hay prestadores disponibles para el seguimiento con el filtro actual.</div>';
      return;
    }
    const K = window.CineKit;

    // D1: Eficiencia Económica (CU promedio y variación frente a la Res. 688)
    const cuAnterior = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.cu_anterior_688_cop_m3 || 0), 0) / total);
    const cuNuevo = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.cu_nuevo_1032_cop_m3 || 0), 0) / total);
    const deltaCu = cuAnterior > 0 ? ((cuNuevo - cuAnterior) / cuAnterior) * 100 : 0;
    const cmaProm = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia?.cma_susc_mes_cop || 0), 0) / total);
    const cmoProm = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia?.cmo_m3_cop || 0), 0) / total);

    // D2: Calidad de Servicio y Continuidad (meta de continuidad tomada de los datos)
    const contProm = this.avg(providers, p => p.nmt_tracking.estandares_servicio.continuidad_idh2_hdia);
    const metaCont = this.refDeDatos(providers, p => p.nmt_tracking.estandares_servicio.continuidad_meta_hdia, 24);
    const enMetaCont = providers.filter(p => p.nmt_tracking.estandares_servicio.continuidad_estado === 'en_meta').length;
    const pctEnMetaCont = Math.round((enMetaCont / total) * 100);
    const ircaProm = this.avg(providers, p => p.nmt_tracking.estandares_servicio.irca_idh5_pct);

    // D3: Asequibilidad y Equidad Social (Estrato 1 frente a ingreso de referencia)
    // Consumo básico canónico de 11 m3/mes
    const cmaUso = cmaProm || 6200;
    const cmoUso = cmoProm || 1850;
    const costoFacturaE1_bruto = (cmaUso + (cmoUso * 11));
    const facturaE1_neta = Math.round(costoFacturaE1_bruto * this.referenciaIngresosEstrato[1].factor_subsidio);
    const esfuerzoE1 = (facturaE1_neta / this.referenciaIngresosEstrato[1].ingreso_medio) * 100;
    const umbral = this.umbralAsequibilidadOCDE_pct;
    const alertaAsequibilidad = Number(esfuerzoE1.toFixed(2)) > umbral;
    const escalaMedidor = umbral * this.escalaMedidorFactor;

    // D4: Sostenibilidad Hídrica y Pérdidas (IPUF; meta tomada de los datos)
    const ipufProm = this.avg(providers, p => p.nmt_tracking.estandares_servicio.ipuf_ird1_m3_susc_mes);
    const metaIpuf = this.refDeDatos(providers, p => p.nmt_tracking.estandares_servicio.ipuf_meta_m3_susc_mes, 6.0);
    const brechaIpuf = ipufProm - metaIpuf;
    const enMetaIpuf = providers.filter(p => p.nmt_tracking.estandares_servicio.ipuf_ird1_m3_susc_mes <= metaIpuf).length;
    const pctEnMetaIpuf = Math.round((enMetaIpuf / total) * 100);

    // D5: Gobernanza, Adopción y Calidad del Dato
    const conEstudio = providers.filter(p => p.nmt_tracking.estudio_costos_reportado).length;
    const pctAdopcion = Math.round((conEstudio / total) * 100);
    const riesgoAltoIUS = providers.filter(p => p.nmt_tracking.riesgo_ius.nivel_ius >= 4).length;
    const pctRiesgoAlto = Math.round((riesgoAltoIUS / total) * 100);
    const verifiedData = providers.filter(p => p.calidad.quality_flag === 'VERIFIED').length;
    const pctVerified = Math.round((verifiedData / total) * 100);

    const ringFig = (frac, centro, sub, label, tone) => `
      <div class="cxo-ringfig">
        <div class="cxo-ringfig-ring">
          ${K ? K.ring(frac, { size: 148, stroke: 14, tone: tone || 'ink', label }) : ''}
          <span class="cxo-ringfig-center"><b>${centro}</b><small>${sub}</small></span>
        </div>
      </div>`;
    const ficha = (codigo, texto) => `<button type="button" class="cx-link" onclick="window.ModalsFichas.open('${codigo}')">${texto}</button>`;
    const pills = (arr) => `<span class="cxo-pills">${arr.map(([tier, t, title]) => `<span class="source-tier-pill ${tier}" title="${title}">${t}</span>`).join('')}</span>`;

    container.innerHTML = `
      <!-- D1: EFICIENCIA ECONÓMICA -->
      <article class="cx-tile cx-span-3 cxo-dim">
        <span class="cx-tile-label">D1 · Eficiencia económica</span>
        <div class="cxo-dim-fig">
          <span class="cx-insight-num">${this.cop(cuNuevo)}</span>
          <span class="cxo-unit">COP/m³ · costo unitario promedio vigente</span>
        </div>
        <div class="cxo-dim-viz">
          ${K ? K.columns([
            { v: cuAnterior, label: 'Res. 688' },
            { v: cuNuevo, label: 'Res. 1032', hi: true }
          ], { height: 96, label: `Costo unitario promedio: ${this.cop(cuAnterior)} con la Res. 688 y ${this.cop(cuNuevo)} COP por m³ con la Res. 1032` }) : ''}
        </div>
        <p class="cx-tile-note"><b>${deltaCu >= 0 ? '+' : '−'}${this.pct(Math.abs(deltaCu), 1)}</b> frente al marco anterior (Res. 688).</p>
        <div class="cx-tile-foot">
          <details class="cx-more">
            <summary>Leer más</summary>
            <p>Evolución del costo unitario (CU = CMA + CMO + CMI + CMT) bajo la Res. CRA 1032 frente al marco anterior Res. 688. Desglose promedio: CMA ${this.cop(cmaProm)}/suscriptor · CMO ${this.cop(cmoProm)}/m³.</p>
            <p>${pills([['tier-1', 'Tier 1: TARIFAS_AA2015', 'Factibilidad 2: 54 tablas de TARIFAS_AA2015 en Oracle SUI'], ['tier-2', 'Tier 2: SURICATA CRA', 'Factibilidad 1: Captura de estudios de costos en SURICATA']])}</p>
          </details>
          ${ficha('NMT-TAR-01', 'Ficha Res. 1032')}
        </div>
      </article>

      <!-- D2: CONTINUIDAD Y CALIDAD -->
      <article class="cx-tile cx-span-3 cxo-dim">
        <span class="cx-tile-label">D2 · Nivel de servicio</span>
        <div class="cxo-dim-split">
          ${ringFig(contProm / metaCont, `${this.num(contProm, 1)} h`, `de ${this.num(metaCont, 0)} h/día`, `Continuidad promedio de ${this.num(contProm, 1)} horas al día frente a la meta de ${this.num(metaCont, 0)} horas`)}
          <div class="cxo-dim-side">
            <h3 class="cxo-dim-title">Continuidad del suministro</h3>
            <p class="cx-tile-note">${enMetaCont} de ${total} prestadores en la meta (${pctEnMetaCont} %).</p>
            ${this.chip(pctEnMetaCont >= 70 ? 'ok' : 'warn', pctEnMetaCont >= 70 ? 'Mayoría en la meta' : 'Brecha frente a la meta')}
          </div>
        </div>
        <div class="cx-tile-foot">
          <details class="cx-more">
            <summary>Leer más</summary>
            <p>Horas de suministro continuo (IDH2) e Índice de Riesgo de la Calidad del Agua (IRCA / IDH5). IRCA promedio: ${this.pct(ircaProm, 2)} (fuente externa INS · Q-CAT-01).</p>
            <p>${pills([['tier-1', 'Tier 1: SUI_AGUAS (IDH2)', 'Factibilidad 2: SUI_AGUAS.CAR_T1057'], ['tier-external', 'Tier 3: INS SIVICAP (IRCA)', 'Factibilidad 3: Fuente externa INS/SIVICAP en homologación Q-CAT-01']])}</p>
          </details>
          ${ficha('NMT-EST-01', 'Ficha Res. 2115')}
        </div>
      </article>

      <!-- D3: ASEQUIBILIDAD (casilla protagonista; abre el simulador) -->
      <article class="cx-tile cx-span-2 cx-tile-deep cx-on-dark cxo-dim">
        <span class="cx-tile-label">D3 · Asequibilidad</span>
        <div class="cxo-dim-fig">
          <span class="cx-insight-num cxo-num-light">${this.pct(esfuerzoE1, 2)}</span>
          <span class="cxo-unit">del ingreso · estrato 1, 11 m³</span>
        </div>
        ${K ? K.meter(esfuerzoE1 / escalaMedidor, { marker: umbral / escalaMedidor, markerLabel: `Umbral ${this.pct(umbral, 0)}`, tone: 'light' }) : ''}
        <p class="cx-sr">Esfuerzo tarifario del estrato 1 de ${this.pct(esfuerzoE1, 2)} del ingreso, frente al umbral de referencia del ${this.pct(umbral, 0)}.</p>
        ${this.chip(alertaAsequibilidad ? 'alert' : 'ok', alertaAsequibilidad ? 'Sobre el umbral de referencia' : 'Bajo el umbral de referencia')}
        <div class="cx-tile-foot">
          <details class="cx-more">
            <summary>Leer más</summary>
            <p>Proporción del ingreso mensual del hogar de estrato 1 destinada al servicio básico, frente al umbral de referencia OCDE (${this.pct(umbral, 1)}). Factura neta E1 (11 m³): ~${this.cop(facturaE1_neta)} COP/mes con subsidio del ${this.referenciaIngresosEstrato[1].subsidio_legal_pct} %. Cálculo simplificado: CMA + CMO × 11 m³; el simulador suma también CMI y CMT.</p>
            <p>${pills([['tier-1', 'Tier 1: SUI Facturación', 'Factibilidad 2: Facturación comercial en SUI_AGUAS'], ['tier-external', 'Tier 3: DANE GEIH', 'Factibilidad 3: Microdatos GEIH DANE']])}</p>
          </details>
          <button type="button" class="cx-link" onclick="window.ImpactoOCDE.switchSubtab('asequibilidad')">Abrir el simulador</button>
        </div>
      </article>

      <!-- D4: SOSTENIBILIDAD HÍDRICA Y PÉRDIDAS -->
      <article class="cx-tile cx-span-2 cxo-dim">
        <span class="cx-tile-label">D4 · Sostenibilidad hídrica</span>
        <div class="cxo-dim-fig">
          <span class="cx-insight-num">${this.num(ipufProm, 2)}</span>
          <span class="cxo-unit">m³/suscriptor/mes · pérdidas (IPUF)</span>
        </div>
        ${K ? K.meter(ipufProm / (metaIpuf * 2), { marker: 0.5, markerLabel: `Meta ${this.num(metaIpuf, 1)}` }) : ''}
        <p class="cx-sr">IPUF promedio de ${this.num(ipufProm, 2)} m³ por suscriptor al mes frente a la meta de ${this.num(metaIpuf, 1)}.</p>
        ${this.chip(brechaIpuf > 0 ? 'warn' : 'ok', brechaIpuf > 0 ? `${this.num(brechaIpuf, 2)} m³ sobre la meta` : 'En la meta')}
        <div class="cx-tile-foot">
          <details class="cx-more">
            <summary>Leer más</summary>
            <p>Índice de Pérdidas por Usuario Facturado frente a la meta eficiente de ${this.num(metaIpuf, 1)} m³/susc/mes (Res. 1032), sujeta a ratificación (Q-NMT-01). En la meta: ${pctEnMetaIpuf} % (${enMetaIpuf} prestadores).</p>
            <p>${pills([['tier-1', 'Tier 1: SUI_AGUAS', 'Factibilidad 2: Formatos de volúmenes SUI_AGUAS'], ['tier-2', 'Meta sujeta a Q-NMT-01', 'Parámetro pendiente de ratificación de gradualidad Tabla 16']])}</p>
          </details>
          ${ficha('NMT-EST-02', 'Ficha IPUF')}
        </div>
      </article>

      <!-- D5: GOBERNANZA Y CALIDAD DEL DATO -->
      <article class="cx-tile cx-span-2 cxo-dim">
        <span class="cx-tile-label">D5 · Gobernanza y datos</span>
        <div class="cxo-dim-split cxo-dim-split-col">
          ${ringFig(pctAdopcion / 100, `${pctAdopcion} %`, 'radicaron', `${conEstudio} de ${total} prestadores radicaron el estudio de costos`)}
          <p class="cx-tile-note">${conEstudio} de ${total} radicaron el estudio de costos.</p>
        </div>
        <div class="cx-tile-foot">
          <details class="cx-more">
            <summary>Leer más</summary>
            <p>Radicación formal de estudios de costos y distribución del Índice Único de Supervisión (IUS, SSPD): ${pctRiesgoAlto} % en riesgo alto (${riesgoAltoIUS} prestadores, niveles 4-5). Confiabilidad de datos: ${pctVerified} % calificados VERIFIED (ADR-0003).</p>
            <p>${pills([['tier-2', 'Tier 2: SURICATA CRA', 'Factibilidad 1: Radicación en SURICATA'], ['tier-1', 'Tier 1: AA_IUS_906', 'Factibilidad 2: Esquema AA_IUS_906 con 67 tablas']])}</p>
          </details>
          ${ficha('NMT-RIE-01', 'Ficha IUS')}
        </div>
      </article>
    `;
    if (K) K.animateIn(container);
  },

  /**
   * 2. Matriz de seguimiento con referentes AIR (tabla: es dato)
   */
  renderAirExPostScorecard: function(providers, selectedProvider) {
    const tbody = document.getElementById('air-scorecard-tbody');
    if (!tbody) return;

    const total = providers.length;
    if (total === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No hay prestadores con el filtro actual.</td></tr>';
      return;
    }

    // Métricas para la tabla
    const cuAnterior = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.cu_anterior_688_cop_m3 || 0), 0) / total);
    const cuNuevo = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.cu_nuevo_1032_cop_m3 || 0), 0) / total);
    const contProm = (providers.reduce((a, p) => a + p.nmt_tracking.estandares_servicio.continuidad_idh2_hdia, 0) / total).toFixed(1);
    const ircaProm = (providers.reduce((a, p) => a + p.nmt_tracking.estandares_servicio.irca_idh5_pct, 0) / total).toFixed(2);
    const ipufProm = (providers.reduce((a, p) => a + p.nmt_tracking.estandares_servicio.ipuf_ird1_m3_susc_mes, 0) / total).toFixed(2);
    const adopcionPct = Math.round((providers.filter(p => p.nmt_tracking.estudio_costos_reportado).length / total) * 100);
    const riesgoBajoIusPct = Math.round((providers.filter(p => p.nmt_tracking.riesgo_ius.nivel_ius <= 2).length / total) * 100);

    const cmaProm = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia?.cma_susc_mes_cop || 0), 0) / total) || 6200;
    const cmoProm = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia?.cmo_m3_cop || 0), 0) / total) || 1850;
    const facturaE1 = Math.round((cmaProm + (cmoProm * 11)) * this.referenciaIngresosEstrato[1].factor_subsidio);
    const esfuerzoE1 = ((facturaE1 / this.referenciaIngresosEstrato[1].ingreso_medio) * 100).toFixed(2);
    const umbral = this.umbralAsequibilidadOCDE_pct;

    // tipo: ok / warn (doble codificación) o info (estado descriptivo, no semáforo)
    const scorecardItems = [
      {
        dimension: 'D1 · Eficiencia económica',
        indicador: 'Costo unitario CU de referencia',
        codigo: 'NMT-TAR-01',
        lineaBase: `$${cuAnterior.toLocaleString('es-CO')} COP/m³`,
        metaOCDE: 'Costos eficientes con incentivo de productividad (X-factor)',
        observado: `$${cuNuevo.toLocaleString('es-CO')} COP/m³`,
        estado: cuNuevo > cuAnterior ? 'Transición de costos' : 'Eficiencia absorbida',
        tipo: 'info',
        fuente: '<span class="source-tier-pill tier-1">TARIFAS_AA2015</span> → <span class="source-tier-pill tier-2">SURICATA</span>',
        norma: 'Res. CRA 1032/2026, art. 12-28'
      },
      {
        dimension: 'D2 · Calidad de servicio',
        indicador: 'Continuidad del suministro (IDH2)',
        codigo: 'NMT-EST-01',
        lineaBase: '21.4 horas/día',
        metaOCDE: '24.0 horas/día (continuidad 24/7)',
        observado: `${contProm} horas/día`,
        estado: parseFloat(contProm) >= 23.0 ? 'En la referencia' : 'Brecha moderada',
        tipo: parseFloat(contProm) >= 23.0 ? 'ok' : 'warn',
        fuente: '<span class="source-tier-pill tier-1">SUI_AGUAS.CAR_T1057</span>',
        norma: 'Res. CRA 1032/2026 Tabla 14'
      },
      {
        dimension: 'D2 · Calidad de servicio',
        indicador: 'Calidad del agua potable (IRCA / IDH5)',
        codigo: 'NMT-EST-01',
        lineaBase: '7.8% (Riesgo Bajo)',
        metaOCDE: '≤ 5.0% (Sin riesgo para consumo humano)',
        observado: `${ircaProm}%`,
        estado: parseFloat(ircaProm) <= 5.0 ? 'Sin riesgo' : 'Riesgo bajo / monitoreo',
        tipo: parseFloat(ircaProm) <= 5.0 ? 'ok' : 'warn',
        fuente: '<span class="source-tier-pill tier-external">INS SIVICAP (Q-CAT-01)</span>',
        norma: 'Res. 2115/2007 MinSalud/MinAmbiente'
      },
      {
        dimension: 'D3 · Asequibilidad social',
        indicador: 'Esfuerzo tarifario en estrato 1 (consumo básico 11 m³)',
        codigo: 'NMT-ASE-01',
        lineaBase: '2.1% del ingreso familiar',
        metaOCDE: `< ${umbral.toFixed(1)}% del ingreso mensual del hogar`,
        observado: `${esfuerzoE1}% del ingreso`,
        estado: parseFloat(esfuerzoE1) <= umbral ? 'Bajo el umbral de referencia' : 'Sobre el umbral de referencia',
        tipo: parseFloat(esfuerzoE1) <= umbral ? 'ok' : 'warn',
        fuente: '<span class="source-tier-pill tier-1">SUI_AGUAS</span> + <span class="source-tier-pill tier-external">DANE GEIH</span>',
        norma: 'Principio 6 OCDE / Ley 142/94 art. 99'
      },
      {
        dimension: 'D4 · Sostenibilidad hídrica',
        indicador: 'Índice de pérdidas por usuario (IPUF / IRD1)',
        codigo: 'NMT-EST-02',
        lineaBase: '12.8 m³/susc/mes',
        metaOCDE: '6.0 m³/susc/mes (nivel económico de pérdidas)',
        observado: `${ipufProm} m³/susc/mes`,
        estado: parseFloat(ipufProm) <= 7.0 ? 'En la meta' : 'Incentivo a reducción',
        tipo: parseFloat(ipufProm) <= 7.0 ? 'ok' : 'warn',
        fuente: '<span class="source-tier-pill tier-1">SUI_AGUAS (Balances)</span>',
        norma: 'Res. CRA 688/2014 y 1032/2026'
      },
      {
        dimension: 'D5 · Gobernanza y datos',
        indicador: 'Tasa de adopción formal del estudio de costos',
        codigo: 'NMT-ADO-01',
        lineaBase: '0% (ex ante, marzo 2026)',
        metaOCDE: '100% de grandes prestadores en SURICATA',
        observado: `${adopcionPct}% radicados`,
        estado: adopcionPct >= 80 ? 'Adopción avanzada' : 'Fase de requerimiento',
        tipo: adopcionPct >= 80 ? 'ok' : 'warn',
        fuente: '<span class="source-tier-pill tier-2">SURICATA / CRA</span>',
        norma: 'Res. CRA 1032/2026 art. 76'
      },
      {
        dimension: 'D5 · Gobernanza y datos',
        indicador: 'Perfil de riesgo institucional IUS SSPD (nivel 1-2)',
        codigo: 'NMT-RIE-01',
        lineaBase: '48% en riesgo bajo',
        metaOCDE: 'Gobernanza basada en riesgos (risk-based regulation)',
        observado: `${riesgoBajoIusPct}% en nivel 1 o 2`,
        estado: 'Supervisión continua (SSPD)',
        tipo: 'info',
        fuente: '<span class="source-tier-pill tier-1">AA_IUS_906 (Oracle SUI)</span>',
        norma: 'Res. CRA 1014/2025 / SSPD'
      }
    ];

    tbody.innerHTML = scorecardItems.map(item => `
      <tr>
        <th scope="row" class="cxo-td-dim">${item.dimension}</th>
        <td>
          <div class="cxo-td-ind">${item.indicador}</div>
          <div class="mono cxo-td-code">${item.codigo}</div>
        </td>
        <td class="mono">${item.lineaBase}</td>
        <td class="cxo-td-ref">${item.metaOCDE}</td>
        <td class="mono cxo-td-obs">${item.observado}</td>
        <td>${this.chip(item.tipo, item.estado)}</td>
        <td>${item.fuente}</td>
        <td class="cxo-td-norma">${item.norma}</td>
      </tr>
    `).join('');
  },

  /**
   * 3. Radar de Gobernanza del Agua de la OCDE (12 Principios)
   */
  pilarColores: ['#0a2f55', '#1664b0', '#0369a1'],

  renderRadarGobernanza: function(providers) {
    const ctx = document.getElementById('chart-radar-ocde');
    if (!ctx || typeof Chart === 'undefined') return;

    if (this.radarChartInstance) {
      this.radarChartInstance.destroy();
      this.radarChartInstance = null;
    }
    const total = providers.length;
    if (!total) return;

    // Cálculo dinámico de valores (0 a 100%) a partir de los datos observados
    const adopcion = Math.round((providers.filter(p => p.nmt_tracking.estudio_costos_reportado).length / total) * 100);
    const contEnMeta = Math.round((providers.filter(p => p.nmt_tracking.estandares_servicio.continuidad_estado === 'en_meta').length / total) * 100);
    const calidadVerified = Math.round((providers.filter(p => p.calidad.quality_flag === 'VERIFIED').length / total) * 100);

    // 12 Principios de Gobernanza del Agua agrupados en los 3 Pilares OCDE
    const labels = [
      'P1. Asignación de Roles',
      'P2. Escala Territorial (Segmentos)',
      'P3. Coherencia Sectorial',
      'P4. Capacidad Operativa',
      'P5. Datos e Información SUI',
      'P6. Tarifas Sostenibles',
      'P7. Marco Regulatorio Claro',
      'P8. Innovación y Buenas Prácticas',
      'P9. Integridad y Transparencia',
      'P10. Participación y Vocales',
      'P11. Subsidios y Equidad',
      'P12. Monitoreo AIR Ex-Post'
    ];

    // Valores de referencia de la configuración del prototipo; solo P4, P5, P6 y P12 salen de los datos
    const datosCRA_Colombia = [
      88,                                  // P1 Roles claros CRA / SSPD / MinVivienda
      92,                                  // P2 Escala segmentada 1 a 4 Res. 1032
      76,                                  // P3 Coherencia interinstitucional
      Math.min(95, Math.max(50, contEnMeta + 10)), // P4 Capacidad reflejada en estándares
      calidadVerified,                     // P5 Datos verificados del SUI
      Math.min(96, Math.max(60, adopcion)),// P6 Adopción de estudios tarifarios
      90,                                  // P7 Marco regulatorio expedido
      78,                                  // P8 Observatorio Context Lake
      86,                                  // P9 Transparencia activa Ley 1712
      74,                                  // P10 Participación ciudadana y vocales
      82,                                  // P11 Subsidios cruzados E1-E6 Ley 142
      adopcion >= 75 ? 85 : 70             // P12 Monitoreo sistemático con referentes AIR
    ];

    const benchmarkOCDE = [85, 85, 80, 85, 90, 88, 88, 82, 88, 80, 85, 85];

    const colores = this.pilarColores;
    const colorPilar = i => colores[Math.min(2, Math.floor(i / 4))];
    const estrecho = ctx.parentElement.clientWidth < 640;

    // Sectores de luz por pilar detrás de la telaraña
    const sectoresPilar = {
      id: 'cxoSectoresPilar',
      beforeDatasetsDraw: (chart) => {
        const r = chart.scales.r;
        if (!r) return;
        const c = chart.ctx, n = labels.length, paso = (Math.PI * 2) / n;
        for (let k = 0; k < 3; k++) {
          const a0 = r.getIndexAngle(k * 4) - Math.PI / 2 - paso / 2;
          const a1 = r.getIndexAngle(k * 4 + 3) - Math.PI / 2 + paso / 2;
          const g = c.createRadialGradient(r.xCenter, r.yCenter, 0, r.xCenter, r.yCenter, r.drawingArea);
          g.addColorStop(0, 'rgba(255,255,255,0)');
          g.addColorStop(1, ['rgba(10,47,85,.10)', 'rgba(22,100,176,.10)', 'rgba(3,105,161,.10)'][k]);
          c.save();
          c.beginPath();
          c.moveTo(r.xCenter, r.yCenter);
          c.arc(r.xCenter, r.yCenter, r.drawingArea, a0, a1);
          c.closePath();
          c.fillStyle = g;
          c.fill();
          c.restore();
        }
      }
    };

    this.radarChartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Nivel de referencia · Colombia (CRA / SUI)',
            data: datosCRA_Colombia,
            backgroundColor: 'rgba(22, 100, 176, 0.24)',
            borderColor: '#1664b0',
            pointBackgroundColor: datosCRA_Colombia.map((_, i) => colorPilar(i)),
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#1664b0',
            pointRadius: 4.5,
            pointHoverRadius: 7,
            borderWidth: 2.5,
            tension: 0
          },
          {
            label: 'Recomendado · OCDE',
            data: benchmarkOCDE,
            backgroundColor: 'rgba(56, 189, 248, 0.06)',
            borderColor: '#38bdf8',
            borderDash: [6, 5],
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: '#38bdf8',
            borderWidth: 2,
            tension: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: window.CineKit && window.CineKit.reducedMotion() ? false : { duration: 1100, easing: 'easeOutQuart' },
        layout: { padding: estrecho ? 4 : 12 },
        scales: {
          r: {
            angleLines: { color: 'rgba(10, 47, 85, 0.10)' },
            grid: { color: 'rgba(10, 47, 85, 0.08)', circular: true },
            suggestedMin: 40,
            suggestedMax: 100,
            ticks: {
              stepSize: 20,
              backdropColor: 'transparent',
              color: '#5b6b80',
              font: { family: "'Inter', sans-serif", size: 10 },
              callback: v => v + ' %'
            },
            pointLabels: {
              font: { size: estrecho ? 11 : 12.5, family: "'Inter', sans-serif", weight: '600' },
              color: (c) => colorPilar(c.index),
              padding: estrecho ? 6 : 10,
              callback: (label) => estrecho ? label.split('.')[0] : label
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: c => `${c.dataset.label}: ${c.raw} %`
            }
          }
        }
      },
      plugins: [sectoresPilar]
    });
  },

  /**
   * 4. Simulador de asequibilidad (referente OCDE de asequibilidad del agua)
   */
  recalculateAffordability: function(providers, selectedProvider = null) {
    const estratoSelect = document.getElementById('calc-estrato-select');
    const sliderConsumo = document.getElementById('calc-consumo-slider');

    const estrato = estratoSelect ? parseInt(estratoSelect.dataset.value || estratoSelect.value) || 1 : 1;
    const consumo = sliderConsumo ? parseFloat(sliderConsumo.value) : 11.0;

    const estratoInfo = this.referenciaIngresosEstrato[estrato] || this.referenciaIngresosEstrato[1];

    // Obtener prestador o promedio
    let cma = 0;
    let cmo = 0;
    let cmi = 0;
    let cmt = 0;
    let nombreReferencia = 'Promedio del grupo seleccionado';

    if (selectedProvider && selectedProvider.nmt_tracking?.variacion_tarifaria_transicion?.desglose_costo_referencia) {
      const desglose = selectedProvider.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia;
      cma = desglose.cma_susc_mes_cop || 6500;
      cmo = desglose.cmo_m3_cop || 1900;
      cmi = desglose.cmi_m3_cop || 1600;
      cmt = desglose.cmt_m3_cop || 120;
      nombreReferencia = selectedProvider.sigla || selectedProvider.prestador_nombre;
    } else {
      const total = providers.length || 1;
      cma = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia?.cma_susc_mes_cop || 0), 0) / total) || 6200;
      cmo = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia?.cmo_m3_cop || 0), 0) / total) || 1850;
      cmi = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia?.cmi_m3_cop || 0), 0) / total) || 1550;
      cmt = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia?.cmt_m3_cop || 0), 0) / total) || 110;
    }

    // Costo de Referencia Bruto (sin subsidio)
    const costoFijo = cma;
    const costoVariableUnitario = cmo + cmi + cmt;
    const costoVariableTotal = costoVariableUnitario * consumo;
    const facturaBruta = costoFijo + costoVariableTotal;

    // Aplicación de subsidio o contribución según estrato (Ley 142/1994)
    const factor = estratoInfo.factor_subsidio;
    const facturaNeta = Math.round(facturaBruta * factor);

    // Esfuerzo tarifario sobre el ingreso mensual del hogar
    const esfuerzoPct = ((facturaNeta / estratoInfo.ingreso_medio) * 100).toFixed(2);
    const esfuerzo = parseFloat(esfuerzoPct);
    const umbral = this.umbralAsequibilidadOCDE_pct;
    const esAlerta = esfuerzo > umbral;

    // Actualizar elementos DOM
    const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    setText('calc-target-provider-name', nombreReferencia);
    setText('calc-factura-bruta', `${this.cop(facturaBruta)} COP`);
    setText('calc-factura-neta', `${this.cop(facturaNeta)} COP`);
    setText('calc-ingreso-ref', `${this.cop(estratoInfo.ingreso_medio)} COP`);
    setText('calc-esfuerzo-pct', this.pct(esfuerzo, 2));

    const subsidioLabelEl = document.getElementById('calc-subsidio-label');
    if (subsidioLabelEl) {
      subsidioLabelEl.classList.remove('is-subsidio', 'is-plena', 'is-aporte');
      if (estrato <= 3) {
        subsidioLabelEl.textContent = `${estratoInfo.nombre} · subsidio aplicado ~${estratoInfo.subsidio_legal_pct} % (Ley 142/94)`;
        subsidioLabelEl.classList.add('is-subsidio');
      } else if (estrato === 4) {
        subsidioLabelEl.textContent = `${estratoInfo.nombre} · tarifa plena, sin subsidio ni aporte`;
        subsidioLabelEl.classList.add('is-plena');
      } else {
        subsidioLabelEl.textContent = `${estratoInfo.nombre} · aporte solidario +${estratoInfo.aporte_legal_pct} % (subsidio cruzado)`;
        subsidioLabelEl.classList.add('is-aporte');
      }
    }

    // Medidor: el líquido sube hasta el esfuerzo; la línea fija marca el umbral
    const escala = umbral * this.escalaMedidorFactor;
    const gauge = document.getElementById('calc-gauge');
    if (gauge) {
      gauge.style.setProperty('--fill', String(Math.min(1, esfuerzo / escala)));
      gauge.classList.toggle('is-alerta', esAlerta);
      gauge.classList.toggle('is-over', esfuerzo > escala);
      gauge.setAttribute('aria-label', `Esfuerzo tarifario de ${this.pct(esfuerzo, 2)} del ingreso del hogar, ${esAlerta ? 'por encima' : 'por debajo'} del umbral de referencia del ${this.pct(umbral, 0)}${esfuerzo > escala ? '; fuera de la escala del medidor' : ''}`);
    }

    const alertBox = document.getElementById('calc-asequibilidad-status-box');
    if (alertBox) {
      alertBox.classList.toggle('is-alerta', esAlerta);
      alertBox.innerHTML = esAlerta
        ? `${this.chip('alert', 'Sobre el umbral de referencia')}
           <p>El gasto mensual en agua (${this.pct(esfuerzo, 2)}) supera el ${this.pct(umbral, 0)} del ingreso del hogar en este estrato. Instrumentos como los fondos de solidaridad (Ley 142/94 art. 89) o el mínimo vital atienden este caso.</p>`
        : `${this.chip('ok', 'Bajo el umbral de referencia')}
           <p>El esfuerzo tarifario es de ${this.pct(esfuerzo, 2)}, por debajo del ${this.pct(umbral, 0)} del ingreso del hogar para este estrato y consumo.</p>`;
    }
  },

  /**
   * 5. Síntesis ejecutiva de seguimiento (modal). No es un dictamen ni una evaluación ex post formal.
   */
  openExecutiveReportModal: function() {
    const modal = document.getElementById('modal-air-report');
    if (!modal) return;

    const providers = window.AppNMT?.filteredProviders || [];
    const total = providers.length || 1;

    // Métricas consolidadas
    const cuProm = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.cu_nuevo_1032_cop_m3 || 0), 0) / total);
    const adopcion = Math.round((providers.filter(p => p.nmt_tracking.estudio_costos_reportado).length / total) * 100);
    const contProm = (providers.reduce((a, p) => a + p.nmt_tracking.estandares_servicio.continuidad_idh2_hdia, 0) / total).toFixed(1);
    const ipufProm = (providers.reduce((a, p) => a + p.nmt_tracking.estandares_servicio.ipuf_ird1_m3_susc_mes, 0) / total).toFixed(2);
    const brechaIpuf = (ipufProm - 6.00).toFixed(2);

    // Esfuerzo E1 con el mismo cálculo de la matriz (antes era un texto fijo "< 2.8%")
    const cmaProm = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia?.cma_susc_mes_cop || 0), 0) / total) || 6200;
    const cmoProm = Math.round(providers.reduce((a, p) => a + (p.nmt_tracking.variacion_tarifaria_transicion.desglose_costo_referencia?.cmo_m3_cop || 0), 0) / total) || 1850;
    const e1 = this.referenciaIngresosEstrato[1];
    const esfuerzoE1 = (Math.round((cmaProm + cmoProm * 11) * e1.factor_subsidio) / e1.ingreso_medio) * 100;
    const umbral = this.umbralAsequibilidadOCDE_pct;
    const e1Bajo = esfuerzoE1 <= umbral;

    const ciclo = window.CRA_NMT_DATA?.metadata?.ciclo_regulatorio_ocde || [];
    const e9 = ciclo.find(s => s.codigo === 'E9');
    const e9Iso = e9 ? (e9.fecha || e9.fecha_limite || e9.fecha_prevista) : null;
    const e9Fecha = e9Iso && window.TimelineOCDE ? window.TimelineOCDE.fmtFecha(e9Iso) : (e9Iso || 'por definir');

    const reportContentEl = document.getElementById('air-report-content');
    if (reportContentEl) {
      reportContentEl.innerHTML = `
        <div class="report-official-header">
          <div class="cx-eyebrow" style="margin-bottom: 8px;">Observatorio Regulatorio · CRA</div>
          <h2 class="cxo-report-title">Síntesis de seguimiento con referentes OCDE (AIR)</h2>
          <div class="cxo-report-meta">
            <span><strong>Marco:</strong> Res. CRA 1032 de 2026 (grandes prestadores)</span>
            <span><strong>Prestadores en seguimiento:</strong> ${providers.length}</span>
            <span><strong>Corte:</strong> 31 de agosto de 2026</span>
          </div>
        </div>

        <p class="cxo-report-scope">Seguimiento informativo, sin efecto jurídico. No es una evaluación ex post formal (etapa E9 del ciclo, prevista para ${e9Fecha}) ni califica el cumplimiento de prestadores; la verificación es de la SSPD.</p>

        <div style="margin: 20px 0;">
          <h3 class="cxo-report-h">1. Resumen</h3>
          <p style="font-size: 0.9rem; line-height: 1.55; color: var(--text-main);">
            En la fase de adopción de la Resolución CRA 1032 de 2026 se observa una <strong>tasa de radicación de estudios de costos del ${adopcion} %</strong>
            en el universo de grandes prestadores. El seguimiento muestra la evolución de la continuidad del servicio y mantiene la atención en la reducción de pérdidas de agua
            y en la asequibilidad de los estratos 1 y 2.
          </p>
        </div>

        <div style="margin: 20px 0;">
          <h3 class="cxo-report-h">2. Síntesis por dimensión</h3>
          <div class="table-responsive">
          <table class="table-cra cxo-table" style="font-size: 0.82rem;">
            <thead>
              <tr>
                <th scope="col">Dimensión</th>
                <th scope="col">Indicador</th>
                <th scope="col">Línea base</th>
                <th scope="col">Observado</th>
                <th scope="col">Estado informativo</th>
                <th scope="col">Fuente</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">D1. Eficiencia económica</th>
                <td>Costo unitario CU promedio</td>
                <td>Res. 688 ($3.800)</td>
                <td class="mono font-bold">$${cuProm.toLocaleString('es-CO')} COP/m³</td>
                <td>${this.chip('info', 'Cálculo con la fórmula de la Res. 1032')}</td>
                <td><span class="source-tier-pill tier-1">TARIFAS_AA2015</span> → <span class="source-tier-pill tier-2">SURICATA</span></td>
              </tr>
              <tr>
                <th scope="row">D2. Nivel de servicio</th>
                <td>Continuidad IDH2</td>
                <td>21.4 h/día</td>
                <td class="mono font-bold">${contProm} h/día</td>
                <td>${this.chip(parseFloat(contProm) >= 21.4 ? 'ok' : 'warn', parseFloat(contProm) >= 21.4 ? 'Sobre la línea base' : 'Bajo la línea base')}</td>
                <td><span class="source-tier-pill tier-1">SUI_AGUAS (CAR_T1057)</span></td>
              </tr>
              <tr>
                <th scope="row">D3. Asequibilidad social</th>
                <td>Esfuerzo tarifario E1 (11 m³)</td>
                <td>2.1%</td>
                <td class="mono font-bold">${esfuerzoE1.toFixed(2)}% (con subsidio)</td>
                <td>${this.chip(e1Bajo ? 'ok' : 'warn', e1Bajo ? `Bajo el umbral de referencia (${umbral.toFixed(1)}%)` : `Sobre el umbral de referencia (${umbral.toFixed(1)}%)`)}</td>
                <td><span class="source-tier-pill tier-1">SUI_AGUAS</span> + <span class="source-tier-pill tier-external">DANE GEIH</span></td>
              </tr>
              <tr>
                <th scope="row">D4. Sostenibilidad hídrica</th>
                <td>Pérdidas IPUF</td>
                <td>12.8 m³/susc/mes</td>
                <td class="mono font-bold">${ipufProm} m³/susc/mes</td>
                <td>${this.chip(brechaIpuf > 0 ? 'warn' : 'ok', brechaIpuf > 0 ? `Brecha activa (+${brechaIpuf})` : 'En la meta')}</td>
                <td><span class="source-tier-pill tier-1">SUI_AGUAS (Balances)</span></td>
              </tr>
              <tr>
                <th scope="row">D5. Gobernanza y datos</th>
                <td>Radicación en SURICATA</td>
                <td>0% (ex ante)</td>
                <td class="mono font-bold">${adopcion}% radicados</td>
                <td>${this.chip('info', 'Adopción en curso')}</td>
                <td><span class="source-tier-pill tier-2">SURICATA / CRA</span></td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <div class="cxo-report-note">
          <h3 class="cxo-report-h">3. Linaje y factibilidad de fuentes (Context Lake v2)</h3>
          <p>
            La síntesis integra datos de <strong>tres niveles de factibilidad</strong>:
            <strong>Tier 1 (Factibilidad 2)</strong>: 77 tablas físicas confirmadas en 13 esquemas Oracle SUI (RUPS, SUI_AGUAS, AA_IUS_906, ESTADOSFIN);
            <strong>Tier 2 (Factibilidad 1)</strong>: captura complementaria de estudios de costos de la Res. 1032 radicados en SURICATA / RUD (ADR-0014); y
            <strong>Tier 3 (Factibilidad condicionada)</strong>: fuentes externas del INS/SIVICAP para IRCA en protocolo de homologación (Q-CAT-01) e ingresos por estrato del DANE.
          </p>
        </div>

        <div style="margin: 20px 0;">
          <h3 class="cxo-report-h">4. Asuntos a seguir en la transición (etapa E6)</h3>
          <ul style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main); padding-left: 20px;">
            <li><strong>Estudios de costos pendientes:</strong> prestadores sin radicación al vencimiento del 31 de agosto de 2026 (requerimiento conjunto CRA-SSPD).</li>
            <li><strong>Metas IPUF:</strong> vacancia de la Tabla 16 (Q-NMT-01) sobre la gradualidad de convergencia hacia 6.0 m³/susc/mes.</li>
            <li><strong>Asequibilidad municipal:</strong> aplicación de subsidios cruzados de acueducto y alcantarillado para el estrato 1 frente al umbral de referencia del ${umbral.toFixed(1)}%.</li>
            <li><strong>Consulta bienal (E7):</strong> consulta pública del informe consolidado con vocales de control y prestadores.</li>
          </ul>
        </div>
      `;
    }

    modal.style.display = 'flex';
  },

  closeExecutiveReportModal: function() {
    const modal = document.getElementById('modal-air-report');
    if (modal) modal.style.display = 'none';
  }
};
