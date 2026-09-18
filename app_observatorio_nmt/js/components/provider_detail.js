/**
 * provider_detail.js
 * Modal de Ficha Técnica Individual del Prestador
 * Requisitos: ADR-0005, RF-PORTAL-11/12, RN-PORTAL-04
 */

window.ProviderDetail = {
  open: function(prestadorId) {
    const data = window.CRA_NMT_DATA?.prestadores;
    if (!data) return;

    const p = data.find(item => item.prestador_id_sui === prestadorId);
    if (!p) return;

    const modal = document.getElementById('provider-detail-modal');
    if (!modal) return;

    const titleEl = document.getElementById('provider-modal-title');
    const bodyEl = document.getElementById('provider-modal-body');

    titleEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="brand-logo-badge" style="width: 36px; height: 36px; font-size: 1rem;">${p.sigla.substring(0, 3)}</span>
        <div>
          <div style="font-size: 1.15rem; font-weight: 800; color: var(--blue-deep-navy);">${p.prestador_nombre}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">
            ID SUI: <strong class="mono">${p.prestador_id_sui}</strong> | ${p.municipio_nombre}, ${p.departamento_nombre} | <strong>${p.segmento_cra}</strong>
          </div>
        </div>
      </div>
    `;

    const qFlag = p.calidad.quality_flag;
    const qClass = qFlag === 'VERIFIED' ? 'badge-verified' : (qFlag === 'WARNING' ? 'badge-warning' : (qFlag === 'QUARANTINE' ? 'badge-quarantine' : 'badge-noreport'));
    const qLabel = qFlag === 'VERIFIED' ? 'VERIFICADO' : (qFlag === 'WARNING' ? 'OBSERVADO' : (qFlag === 'QUARANTINE' ? 'EN CUARENTENA' : 'NO REPORTÓ'));

    const nmt = p.nmt_tracking;
    const est = nmt.estandares_servicio;
    const tar = nmt.variacion_tarifaria_transicion;
    const desc = nmt.descuentos_incentivos;
    const ius = nmt.riesgo_ius;

    bodyEl.innerHTML = `
      <!-- Alerta de Calidad y Ventana Previa (ADR-0005) -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-subtle); padding: 12px 16px; border-radius: var(--radius-sm); margin-bottom: 20px; border: 1px solid var(--border-light);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="quality-badge ${qClass}">${qLabel}</span>
          <span style="font-size: 0.82rem; color: var(--text-secondary);">${p.calidad.observacion}</span>
        </div>
        <div>
          ${p.calidad.estado_objecion === 'en_objecion' ? 
            '<span class="quality-badge badge-warning">En Objeción (FL-03)</span>' : 
            '<span class="quality-badge badge-verified">Sin Objeciones</span>'}
        </div>
      </div>

      <div class="modal-grid-2">
        <!-- Bloque 1: Estado en el Ciclo NMT -->
        <div class="info-block">
          <div class="info-block-title">Estado de Implementación NMT (Res. 1032)</div>
          <table class="table-cra" style="margin-top: 6px;">
            <tr><td><strong>Etapa Actual:</strong></td><td><span class="step-code-badge en_curso">${nmt.etapa_actual}</span> ${nmt.etapa_nombre}</td></tr>
            <tr><td><strong>Estudio de Costos:</strong></td><td>${nmt.estudio_costos_reportado ? '<span style="color: var(--verified-color); font-weight: 700;">Reportado en SUI (' + nmt.fecha_reporte_estudio + ')</span>' : '<span style="color: var(--noreport-color); font-weight: 700;">Pendiente de Reporte</span>'}</td></tr>
            <tr><td><strong>Oportunidad de Adopción:</strong></td><td class="mono">${nmt.dias_oportunidad_adopcion ? nmt.dias_oportunidad_adopcion + ' días desde expedición' : 'En trámite'}</td></tr>
            <tr><td><strong>Línea Base 2026:</strong></td><td><span style="text-transform: capitalize; font-weight: 600;">${nmt.linea_base_2026}</span></td></tr>
            <tr><td><strong>Suscriptores Acueducto:</strong></td><td class="mono">${p.suscriptores_acueducto.toLocaleString('es-CO')}</td></tr>
            <tr><td><strong>Área de Prestación (APS):</strong></td><td>${p.aps}</td></tr>
          </table>
        </div>

        <!-- Bloque 2: Estándares de Servicio IDH / IRD -->
        <div class="info-block">
          <div class="info-block-title">Estándares de Calidad y Pérdidas (Res. 1032)</div>
          <table class="table-cra" style="margin-top: 6px;">
            <tr>
              <td><strong>Continuidad (IDH2):</strong></td>
              <td><span class="mono" style="font-weight: 800;">${est.continuidad_idh2_hdia} h/día</span> (Meta: ${est.continuidad_meta_hdia} h)</td>
            </tr>
            <tr>
              <td><strong>Pérdidas IPUF (IRD1):</strong></td>
              <td><span class="mono" style="font-weight: 800;">${est.ipuf_ird1_m3_susc_mes} m³/susc/mes</span> (Meta: ${est.ipuf_meta_m3_susc_mes})</td>
            </tr>
            <tr>
              <td><strong>Brecha de Pérdidas:</strong></td>
              <td><span class="mono" style="color: ${est.ipuf_brecha_m3_susc_mes > 0 ? 'var(--noreport-color)' : 'var(--verified-color)'}; font-weight: 700;">${est.ipuf_brecha_m3_susc_mes > 0 ? '+' : ''}${est.ipuf_brecha_m3_susc_mes} m³</span> (Banda: [${est.ipuf_banda_p10} - ${est.ipuf_banda_p90}])</td>
            </tr>
            <tr>
              <td><strong>Calidad del Agua (IRCA):</strong></td>
              <td><span class="mono">${est.irca_idh5_pct}%</span> - ${est.irca_clasificacion}</td>
            </tr>
            <tr>
              <td><strong>Riesgo IUS (SSPD):</strong></td>
              <td><span class="quality-badge ${ius.nivel_ius >= 4 ? 'badge-noreport' : (ius.nivel_ius >= 3 ? 'badge-warning' : 'badge-verified')}">Nivel ${ius.nivel_ius} - ${ius.categoria_riesgo}</span></td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Bloque 3: Matriz Tarifaria Desagregada por Estrato (RN-PORTAL-04) -->
      <div class="info-block" style="margin-bottom: 20px;">
        <div class="info-block-title">Variación Tarifaria de Transición por Estrato (Res. 1032 vs Res. 688)</div>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 8px;">
          * En estricto cumplimiento de la regla <strong>RN-PORTAL-04</strong>, se desglosa por estrato socioeconómico y clase de uso para reflejar los subsidios y aportes solidarios. No se presenta una cifra única agregada de "tarifa promedio".
        </p>
        <div class="table-responsive">
          <table class="table-cra">
            <thead>
              <tr>
                <th>Uso / Estrato</th>
                <th>Estrato 1</th>
                <th>Estrato 2</th>
                <th>Estrato 3</th>
                <th>Estrato 4</th>
                <th>Estrato 5</th>
                <th>Estrato 6</th>
                <th>Comercial</th>
                <th>Industrial</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Variación %</strong></td>
                <td class="mono">${tar.estrato_1_pct > 0 ? '+' : ''}${tar.estrato_1_pct}%</td>
                <td class="mono">${tar.estrato_2_pct > 0 ? '+' : ''}${tar.estrato_2_pct}%</td>
                <td class="mono" style="font-weight: 800; color: var(--blue-primary);">${tar.estrato_3_pct > 0 ? '+' : ''}${tar.estrato_3_pct}%</td>
                <td class="mono">${tar.estrato_4_pct > 0 ? '+' : ''}${tar.estrato_4_pct}%</td>
                <td class="mono">${tar.estrato_5_pct > 0 ? '+' : ''}${tar.estrato_5_pct}%</td>
                <td class="mono">${tar.estrato_6_pct > 0 ? '+' : ''}${tar.estrato_6_pct}%</td>
                <td class="mono">${tar.comercial_pct > 0 ? '+' : ''}${tar.comercial_pct}%</td>
                <td class="mono">${tar.industrial_pct > 0 ? '+' : ''}${tar.industrial_pct}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 12px; font-size: 0.8rem; background: #ffffff; border: 1px solid var(--border-light); padding: 10px 14px; border-radius: var(--radius-sm);">
          <strong>Desglose de Costo Unitario de Referencia (CU):</strong> 
          CU Anterior Res. 688: <span class="mono">$${tar.cu_anterior_688_cop_m3.toLocaleString('es-CO')} COP/m³</span> | 
          CU Nuevo Res. 1032: <span class="mono" style="font-weight: 700; color: var(--blue-primary);">$${tar.cu_nuevo_1032_cop_m3.toLocaleString('es-CO')} COP/m³</span> 
          (CMA: $${tar.desglose_costo_referencia.cma_susc_mes_cop}/susc | CMO: $${tar.desglose_costo_referencia.cmo_m3_cop}/m³ | CMI: $${tar.desglose_costo_referencia.cmi_m3_cop}/m³ | CMT: $${tar.desglose_costo_referencia.cmt_m3_cop}/m³).
        </div>
      </div>

      <!-- Bloque 4: Incentivos y Descuentos -->
      <div class="info-block">
        <div class="info-block-title">Incentivos y Descuentos de Calidad Aplicados</div>
        <div style="display: flex; gap: 24px; font-size: 0.82rem; flex-wrap: wrap;">
          <div>
            <strong>Descuento por Falla de Servicio:</strong> 
            <span class="mono" style="color: ${desc.descuento_calidad_pct > 0 ? 'var(--noreport-color)' : 'var(--text-muted)'}; font-weight: 700;">
              ${desc.descuento_calidad_pct > 0 ? '-' + desc.descuento_calidad_pct + '%' : '0.0% (Sin descuento)'}
            </span>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${desc.sustento_legal_descuento}</div>
          </div>
          <div>
            <strong>Incentivo por Eficiencia:</strong> 
            <span class="mono" style="color: ${desc.incentivo_eficiencia_pct > 0 ? 'var(--verified-color)' : 'var(--text-muted)'}; font-weight: 700;">
              ${desc.incentivo_eficiencia_pct > 0 ? '+' + desc.incentivo_eficiencia_pct + '%' : '0.0% (Sin incentivo)'}
            </span>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${desc.sustento_legal_incentivo}</div>
          </div>
          <div>
            <strong>Impacto Neto en Tarifa:</strong> 
            <span class="mono" style="font-weight: 800; color: var(--blue-deep-navy);">
              ${desc.impacto_neto_pct > 0 ? '+' : ''}${desc.impacto_neto_pct}%
            </span>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  },

  close: function() {
    const modal = document.getElementById('provider-detail-modal');
    if (modal) modal.style.display = 'none';
  }
};
