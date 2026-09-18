/**
 * kpi_cards.js
 * Generación reactiva de tarjetas KPI de seguimiento NMT
 * Requisitos: RF-NMT-02 a RF-NMT-09, ADR-0003, RN-PORTAL-04/05/06
 */

window.KpiCards = {
  render: function(containerId, filteredProviders) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = filteredProviders.length;
    if (total === 0) {
      container.innerHTML = '<div class="gap-alert-box">No se encontraron prestadores con los filtros seleccionados.</div>';
      return;
    }

    // 1. Tasa de Adopción NMT-ADO-01
    const reportaron = filteredProviders.filter(p => p.nmt_tracking.estudio_costos_reportado).length;
    const pctAdopcion = ((reportaron / total) * 100).toFixed(1);

    // 2. Oportunidad de Adopción NMT-ADO-02
    const diasArray = filteredProviders.filter(p => p.nmt_tracking.dias_oportunidad_adopcion != null)
                                       .map(p => p.nmt_tracking.dias_oportunidad_adopcion);
    const promDias = diasArray.length > 0 ? Math.round(diasArray.reduce((a, b) => a + b, 0) / diasArray.length) : 'N/A';

    // 3. Variación Tarifaria de Transición NMT-TAR-01 (Estrato 3 como referencia canónica, nunca promedio)
    const varE3Array = filteredProviders.map(p => p.nmt_tracking.variacion_tarifaria_transicion.estrato_3_pct);
    const promVarE3 = (varE3Array.reduce((a, b) => a + b, 0) / total).toFixed(1);
    const signoE3 = promVarE3 >= 0 ? '+' : '';

    // 4. Cobertura de Línea Base NMT-LB-01
    const lbCompleta = filteredProviders.filter(p => p.nmt_tracking.linea_base_2026 === 'completa').length;
    const pctLb = ((lbCompleta / total) * 100).toFixed(1);

    // 5. Continuidad IDH2 NMT-EST-01
    const contArray = filteredProviders.map(p => p.nmt_tracking.estandares_servicio.continuidad_idh2_hdia);
    const promCont = (contArray.reduce((a, b) => a + b, 0) / total).toFixed(1);
    const enMetaCont = filteredProviders.filter(p => p.nmt_tracking.estandares_servicio.continuidad_estado === 'en_meta').length;
    const pctEnMetaCont = ((enMetaCont / total) * 100).toFixed(1);

    // 6. Brecha de Pérdidas IPUF NMT-EST-02
    const ipufArray = filteredProviders.map(p => p.nmt_tracking.estandares_servicio.ipuf_ird1_m3_susc_mes);
    const promIpuf = (ipufArray.reduce((a, b) => a + b, 0) / total).toFixed(2);
    const brechaProm = (promIpuf - 6.00).toFixed(2);

    // 7. Descuentos e Incentivos NMT-INC-01
    const conDescuento = filteredProviders.filter(p => p.nmt_tracking.descuentos_incentivos.descuento_calidad_pct > 0).length;
    const pctConDesc = ((conDescuento / total) * 100).toFixed(1);

    // 8. Riesgo Alto IUS NMT-RIE-01 (Niveles 4 y 5)
    const riesgoAlto = filteredProviders.filter(p => p.nmt_tracking.riesgo_ius.nivel_ius >= 4).length;
    const pctRiesgoAlto = ((riesgoAlto / total) * 100).toFixed(1);

    // Flags de calidad
    const verifiedCount = filteredProviders.filter(p => p.calidad.quality_flag === 'VERIFIED').length;
    const verifiedPct = Math.round((verifiedCount / total) * 100);
    const generalFlag = verifiedPct >= 80 ? 'badge-verified' : (verifiedPct >= 50 ? 'badge-warning' : 'badge-quarantine');
    const flagText = verifiedPct >= 80 ? 'VERIFICADO' : (verifiedPct >= 50 ? 'OBSERVADO' : 'EN REVISIÓN');

    container.innerHTML = `
      <!-- Card 1: NMT-ADO-01 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-code">NMT-ADO-01</span>
          <span class="quality-badge ${generalFlag}">${flagText}</span>
        </div>
        <div class="kpi-label">Tasa de Adopción del Marco 1032</div>
        <div class="kpi-value-row">
          <span class="kpi-value mono">${pctAdopcion}%</span>
          <span class="kpi-unit">(${reportaron}/${total} prestadores)</span>
        </div>
        <div class="kpi-subinfo">
          <span>Estudio de costos reportado en SUI/SURICATA</span>
          <a class="kpi-footer-link" onclick="window.ModalsFichas.open('NMT-ADO-01')">Ver Ficha</a>
        </div>
      </div>

      <!-- Card 2: NMT-ADO-02 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-code">NMT-ADO-02</span>
          <span class="quality-badge badge-verified">VERIFICADO</span>
        </div>
        <div class="kpi-label">Oportunidad de Adopción</div>
        <div class="kpi-value-row">
          <span class="kpi-value mono">${promDias}</span>
          <span class="kpi-unit">días promedio</span>
        </div>
        <div class="kpi-subinfo">
          <span>Desde expedición hasta 1ra factura emitida</span>
          <a class="kpi-footer-link" onclick="window.ModalsFichas.open('NMT-ADO-02')">Ver Ficha</a>
        </div>
      </div>

      <!-- Card 3: NMT-TAR-01 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-code">NMT-TAR-01</span>
          <span class="quality-badge badge-warning">DESAGREGADO</span>
        </div>
        <div class="kpi-label">Variación Tarifaria de Transición (E3)</div>
        <div class="kpi-value-row">
          <span class="kpi-value mono">${signoE3}${promVarE3}%</span>
          <span class="kpi-unit">Estrato 3 (Pesos Cte 2024)</span>
        </div>
        <div class="kpi-subinfo">
          <span>RN-PORTAL-04: Prohibida tarifa promedio</span>
          <a class="kpi-footer-link" onclick="window.ModalsFichas.open('NMT-TAR-01')">Ver Ficha</a>
        </div>
      </div>

      <!-- Card 4: NMT-LB-01 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-code">NMT-LB-01</span>
          <span class="quality-badge badge-warning">EN ALISTAMIENTO</span>
        </div>
        <div class="kpi-label">Cobertura de Línea Base 2026</div>
        <div class="kpi-value-row">
          <span class="kpi-value mono">${pctLb}%</span>
          <span class="kpi-unit">Línea base completa</span>
        </div>
        <div class="kpi-subinfo">
          <span>${lbCompleta} con reporte pleno de inicio</span>
          <a class="kpi-footer-link" onclick="window.ModalsFichas.open('NMT-LB-01')">Ver Ficha</a>
        </div>
      </div>

      <!-- Card 5: NMT-EST-01 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-code">NMT-EST-01</span>
          <span class="quality-badge badge-verified">VERIFICADO</span>
        </div>
        <div class="kpi-label">Continuidad del Servicio (IDH2)</div>
        <div class="kpi-value-row">
          <span class="kpi-value mono">${promCont}</span>
          <span class="kpi-unit">horas/día (${pctEnMetaCont}% en meta)</span>
        </div>
        <div class="kpi-subinfo">
          <span>Meta: 24h (S1-S2) / 22h (S3-S4)</span>
          <a class="kpi-footer-link" onclick="window.ModalsFichas.open('NMT-EST-01')">Ver Ficha</a>
        </div>
      </div>

      <!-- Card 6: NMT-EST-02 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-code">NMT-EST-02</span>
          <span class="quality-badge badge-verified">VERIFICADO</span>
        </div>
        <div class="kpi-label">Pérdidas IPUF y Brecha vs Meta</div>
        <div class="kpi-value-row">
          <span class="kpi-value mono">${promIpuf}</span>
          <span class="kpi-unit">m³/susc/mes (Brecha: +${brechaProm})</span>
        </div>
        <div class="kpi-subinfo">
          <span>Meta estándar sector: 6.00 m³/susc/mes</span>
          <a class="kpi-footer-link" onclick="window.ModalsFichas.open('NMT-EST-02')">Ver Ficha</a>
        </div>
      </div>

      <!-- Card 7: NMT-INC-01 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-code">NMT-INC-01</span>
          <span class="quality-badge badge-warning">EN TRÁMITE</span>
        </div>
        <div class="kpi-label">Prestadores con Descuento de Servicio</div>
        <div class="kpi-value-row">
          <span class="kpi-value mono">${pctConDesc}%</span>
          <span class="kpi-unit">(${conDescuento} prestadores)</span>
        </div>
        <div class="kpi-subinfo">
          <span>Tabla 31 Res. 1032 por baja continuidad o IPUF</span>
          <a class="kpi-footer-link" onclick="window.ModalsFichas.open('NMT-INC-01')">Ver Ficha</a>
        </div>
      </div>

      <!-- Card 8: NMT-RIE-01 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-code">NMT-RIE-01</span>
          <span class="quality-badge badge-verified">SSPD IUS</span>
        </div>
        <div class="kpi-label">Prestadores en Riesgo Alto (IUS 4-5)</div>
        <div class="kpi-value-row">
          <span class="kpi-value mono">${pctRiesgoAlto}%</span>
          <span class="kpi-unit">(${riesgoAlto} prestadores)</span>
        </div>
        <div class="kpi-subinfo">
          <span>RN-PORTAL-06: Escala de riesgo no invertida</span>
          <a class="kpi-footer-link" onclick="window.ModalsFichas.open('NMT-RIE-01')">Ver Ficha</a>
        </div>
      </div>
    `;
  }
};
