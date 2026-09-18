/**
 * ise_incentivos.js — Vista 4: Eficiencia e Incentivos (ISE Oficial CRA)
 * Cumple RF-NMTPP-12, RF-NMTPP-13, RF-NMTPP-14, INV-04, INV-10, ADR-0015
 * 
 * Regla de Oro / ADR-0015: El ISE solo se muestra tal como lo publica la CRA.
 * El Observatorio no lo calcula, no lo estima, no lo proyecta y NO LO ORDENA.
 */

(function(window) {
    'use strict';

    const IseIncentivos = {
        selectedPrestadorId: null,

        selectPrestador(providerId) {
            this.selectedPrestadorId = this.selectedPrestadorId === providerId ? null : providerId;
            this.render('tab-ise-incentivos');
        },

        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const data = window.CRA_NMTPP_DATA;
            const params = window.CRA_NMTPP_PARAMS;
            if (!data || !params) {
                container.innerHTML = '<div class="notice-box warning">Datos no disponibles</div>';
                return;
            }

            // Solo prestadores del Segmento 1
            const prestadoresS1 = data.prestadores.filter(p => p.segmento_vigente === 'S1');

            // Conteo de incentivos reconocidos (NMTPP-INC-01)
            const incentivosCount = {
                perdidas: 0,
                micromedicion: 0,
                asociatividad: 0,
                buen_gobierno: 0,
                reporte: 0
            };

            let prestadoresConIse = 0;
            prestadoresS1.forEach(p => {
                if (p.ise && p.ise.length > 0 && !p.ise[0].no_aplica_motivo) {
                    prestadoresConIse++;
                }
                if (p.incentivos) {
                    p.incentivos.forEach(inc => {
                        if (incentivosCount[inc.tipo] !== undefined) {
                            incentivosCount[inc.tipo]++;
                        }
                    });
                }
            });

            let html = `
                <div class="dashboard-panel">
                    <div class="panel-header">
                        <div class="panel-header-title">
                            <h2>Eficiencia e Incentivos: Reconocimiento al Buen Desempeño (ISE Oficial CRA)</h2>
                            <p>Publicación oficial anual de la CRA (Art. 2.1.1.1.2.2.7.1) • <em>El Observatorio refleja la información oficial sin alterar ni clasificar a los prestadores</em></p>
                        </div>
                    </div>

                    <!-- Banner de no replicabilidad y ausencia de ranking (INV-04) -->
                    <div class="notice-box info">
                        <span>ℹ️</span>
                        <div>
                            <strong>¿Qué es el Índice Sintético de Eficiencia y cómo se publica? (ADR-0015 / INV-04):</strong>
                            Es una evaluación técnica integral expedida por la Comisión de Regulación de Agua Potable y Saneamiento Básico (CRA) que mide cómo gestionan los acueductos el agua, la atención comunitaria y los recursos económicos. Los operadores con buenas prácticas reciben estímulos en sus tarifas para reinvertir en las redes.
                            <br>
                            El Observatorio publica únicamente las calificaciones oficiales de la Comisión. Por principio de equidad y mandato regulatorio, <strong>no se calculan índices propios ni se elaboran clasificaciones de "mejores o peores"</strong> para no estigmatizar a acueductos en proceso de fortalecimiento.
                            <br>
                            <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; display: inline-block;">
                                <em>Nota técnica: La réplica independiente de este índice requiere que la CRA formalice las curvas de normalización matemática (Consulta Q-NMTPP-04).</em>
                            </span>
                        </div>
                    </div>

                    <!-- Tarjetas de Oportunidad e Incentivos -->
                    <div class="card-grid" style="margin-top: 20px;">
                        <div class="kpi-card">
                            <div class="kpi-card-header">
                                <span class="kpi-card-title">Publicación Oficial a Tiempo</span>
                                <div class="kpi-card-icon">📅</div>
                            </div>
                            <div class="kpi-main-stat" style="color: #059669;">
                                A TIEMPO
                            </div>
                            <div class="kpi-subtext">
                                Publicado por la CRA el <strong>26 de agosto de 2028</strong> (cumpliendo el plazo legal de 4 meses de antelación)
                            </div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card-header">
                                <span class="kpi-card-title">Piso de Protección al Acueducto</span>
                                <div class="kpi-card-icon">🛡️</div>
                            </div>
                            <div class="kpi-main-stat">90.0%</div>
                            <div class="kpi-subtext">Piso regulatorio legal para 2029: garantiza que ningún operador reciba menos del 90% en la etapa de transición</div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card-header">
                                <span class="kpi-card-title">Acueductos con Estímulos al Desempeño</span>
                                <div class="kpi-card-icon">🎁</div>
                            </div>
                            <div class="kpi-main-stat">
                                ${prestadoresS1.filter(p => p.incentivos && p.incentivos.length > 0).length}
                                <span class="kpi-fraction">/${prestadoresS1.length}</span>
                            </div>
                            <div class="kpi-subtext">Operadores que alcanzaron al menos un incentivo tarifario por buenas prácticas</div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card-header">
                                <span class="kpi-card-title">Incentivo por Reporte de Información (SUI)</span>
                                <div class="kpi-card-icon">⚠️</div>
                            </div>
                            <div class="kpi-main-stat" style="font-size: 1.2rem; color: var(--st-sin-fuente-color); padding-top: 6px;">
                                Sin fuente confirmada
                            </div>
                            <div class="kpi-subtext">En proceso de definición entre la CRA y la SSPD (Consulta Q-NMTPP-12)</div>
                        </div>
                    </div>

                    <!-- Resumen de Incentivos Otorgados -->
                    <div style="background: var(--bg-surface-subtle); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 24px;">
                        <h4 style="font-size: 0.88rem; color: var(--blue-deep-navy); margin-bottom: 8px;">
                            Estímulos Económicos Ganados para el Año 2029 (Evaluados con Desempeño de 2027):
                        </h4>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                            <span class="chip chip-incentive">💧 Control y Reducción de Fugas (+5.0% en operación): ${incentivosCount.perdidas} operadores</span>
                            <span class="chip chip-incentive">⏱️ Medición Precisa en Hogares (+2.5% en administración): ${incentivosCount.micromedicion} operadores</span>
                            <span class="chip chip-incentive">🤝 Trabajo Asociativo y Cooperación (+2.5% en administración): ${incentivosCount.asociatividad} operadores</span>
                            <span class="chip chip-incentive">🏛️ Transparencia y Buen Gobierno (+2.5% en administración): ${incentivosCount.buen_gobierno} operadores</span>
                            <span class="chip chip-incentive">📊 Reportes Completos de Información (+2.5% en administración): ${incentivosCount.reporte} operadores</span>
                        </div>
                    </div>

                    <!-- Tabla Oficial del ISE (Estrictamente no ordenable numéricamente) -->
                    <h3 style="font-size: 1.05rem; color: var(--blue-deep-navy); margin-bottom: 12px;">
                        Calificaciones Oficiales del ISE — Empresas y Prestadores del Primer Segmento
                    </h3>
                    <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 14px;">
                        Toque o haga clic en cualquier fila para ver en detalle cómo se calculó cada componente y qué beneficios tarifarios obtuvo.
                    </p>

                    <div class="data-table-container">
                        <table class="data-table" aria-label="Tabla de resultados oficiales del ISE">
                            <thead>
                                <tr>
                                    <th class="non-sortable">Empresa u Operador</th>
                                    <th class="non-sortable">Puntaje Base ISE</th>
                                    <th class="non-sortable">Gestión Técnica (49.4%)</th>
                                    <th class="non-sortable">Gestión Administrativa (14.0%)</th>
                                    <th class="non-sortable">Gestión Financiera (36.6%)</th>
                                    <th class="non-sortable">Eficiencia Reconocida</th>
                                    <th class="non-sortable">Estímulos Obtenidos</th>
                                    <th class="non-sortable">Puntaje Final con Estímulos</th>
                                    <th class="non-sortable">Vigencia Temporal (INV-10)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${prestadoresS1.map(p => {
                                    const iseRecord = p.ise && p.ise.length > 0 ? p.ise[0] : null;
                                    const isInsular = iseRecord && iseRecord.no_aplica_motivo === 'zona insular';
                                    const isSelected = this.selectedPrestadorId === p.provider_id;

                                    if (isInsular) {
                                        return `
                                            <tr>
                                                <td>
                                                    <strong>${p.nombre}</strong><br>
                                                    <span class="chip">${p.subsegmento_vigente}</span>
                                                    <span class="chip chip-special">ZONA INSULAR</span>
                                                </td>
                                                <td colspan="7" style="color: var(--text-muted); font-style: italic; text-align: center;">
                                                    Exento de esta medición por particularidades geográficas insulares (Art. 2.1.1.1.2.2.7.1)
                                                </td>
                                                <td><span class="chip">Aplica 2029 (eval 2027)</span></td>
                                            </tr>
                                        `;
                                    }

                                    if (!iseRecord) {
                                        return `
                                            <tr>
                                                <td><strong>${p.nombre}</strong> <span class="chip">${p.subsegmento_vigente}</span></td>
                                                <td colspan="8" style="color: var(--text-muted);">Sin publicación oficial de la CRA</td>
                                            </tr>
                                        `;
                                    }

                                    return `
                                        <tr class="clickable ${isSelected ? 'selected' : ''}"
                                            onclick="IseIncentivos.selectPrestador('${p.provider_id}')"
                                            title="Haga clic para ver el desglose en cascada del ISE">
                                            <td>
                                                <strong>${p.nombre}</strong><br>
                                                <span class="chip">${p.subsegmento_vigente}</span>
                                            </td>
                                            <td class="mono font-bold">${iseRecord.ise_calculado}</td>
                                            <td class="mono">${iseRecord.dim_tecnica}</td>
                                            <td class="mono">${iseRecord.dim_administrativa}</td>
                                            <td class="mono">${iseRecord.dim_financiera}</td>
                                            <td>
                                                <span class="mono font-bold" style="color: var(--blue-primary);">${iseRecord.pct_eficiencia_aplicable}%</span>
                                                <span style="font-size: 0.75rem; color: var(--text-muted);">(Piso legal ${iseRecord.piso_anio}%)</span>
                                            </td>
                                            <td>
                                                ${p.incentivos && p.incentivos.length > 0
                                                    ? p.incentivos.map(inc => `<span class="chip chip-incentive">${inc.tipo} (+${inc.porcentaje}%)</span>`).join(' ')
                                                    : '<span style="color: var(--text-muted); font-size: 0.8rem;">Ninguno</span>'
                                                }
                                            </td>
                                            <td class="mono">
                                                <strong>Operación:</strong> ${iseRecord.ise_con_incentivos_cmog}%<br>
                                                <strong>Administración:</strong> ${iseRecord.ise_con_incentivos_cma}%
                                            </td>
                                            <td>
                                                <span class="chip chip-simulation">Aplica 2029 (eval 2027)</span>
                                            </td>
                                        </tr>
                                        ${isSelected ? `
                                            <tr>
                                                <td colspan="9" style="background: #f8fafc; padding: 20px;">
                                                    ${IseIncentivos.renderDetalleCascada(p, iseRecord)}
                                                </td>
                                            </tr>
                                        ` : ''}
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        },

        renderDetalleCascada(p, ise) {
            const ind = ise.indicadores || {};
            return `
                <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 18px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
                        <h4 style="color: var(--blue-deep-navy);">
                            Desglose Detallado de Calificación y Estímulos — ${p.nombre}
                        </h4>
                        <span class="chip">Acto Oficial: ${ise.acto_ref}</span>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                        <div>
                            <h5 style="font-size: 0.82rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px;">
                                ¿Qué evalúa cada indicador en este acueducto?:
                            </h5>
                            <ul style="list-style: none; font-size: 0.84rem; display: flex; flex-direction: column; gap: 6px;">
                                <li><strong>Medición en Planta (Técnica):</strong> <span class="mono">${ind.macromedicion || '—'}</span> <span style="font-size: 0.75rem; color: var(--text-muted);">(registro del agua tratada)</span></li>
                                <li><strong>Calidad del Agua (Técnica):</strong> <span class="mono">${ind.reporte_y_calidad_agua_potable || '—'}</span> <span style="font-size: 0.75rem; color: var(--text-muted);">(análisis de potabilidad)</span></li>
                                <li><strong>Horas de Servicio (Técnica):</strong> <span class="mono">${ind.continuidad || '—'}</span> <span style="font-size: 0.75rem; color: var(--text-muted);">(continuidad en grifos)</span></li>
                                <li><strong>Medidores en Viviendas (Adm.):</strong> <span class="mono">${ind.micromedicion_efectiva || '—'}</span> <span style="font-size: 0.75rem; color: var(--text-muted);">(medición de consumos)</span></li>
                                <li><strong>Atención a Reclamos (Adm.):</strong> <span class="mono">${ind.atencion_pqr_acueducto || '—'}</span> <span style="font-size: 0.75rem; color: var(--text-muted);">(respuesta a PQR)</span></li>
                                <li><strong>Eficiencia en Costos (Finan.):</strong> <span class="mono">${ind.costo_administrativo_mas_operativo_promedio_por_suscriptor || '—'}</span> <span style="font-size: 0.75rem; color: var(--text-muted);">(gasto por familia atendida)</span></li>
                            </ul>
                        </div>

                        <div style="background: var(--bg-surface-subtle); padding: 12px; border-radius: var(--radius-sm);">
                            <h5 style="font-size: 0.82rem; text-transform: uppercase; color: var(--blue-primary); margin-bottom: 8px;">
                                Pasos de Liquidación Legal (Art. 2.1.1.1.2.2.7.2):
                            </h5>
                            <ol style="font-size: 0.82rem; margin-left: 18px; display: flex; flex-direction: column; gap: 6px; color: var(--text-secondary);">
                                <li><strong>Evaluación de áreas:</strong> Técnica (49.4%) + Administrativa (14.0%) + Financiera (36.6%) = <strong>${ise.ise_calculado}</strong></li>
                                <li><strong>Respaldo de protección:</strong> Se aplica un umbral mínimo de seguridad: max(${ise.ise_calculado}, 70.0%) = <strong>${Math.max(ise.ise_calculado, 70.0).toFixed(2)}%</strong> para evitar desfinanciamiento.</li>
                                <li><strong>Piso de transición del año:</strong> max(umbral, piso legal ${ise.piso_anio}%) = <strong>${ise.pct_eficiencia_aplicable}%</strong></li>
                                <li><strong>Estímulos adicionales:</strong> Se suman bonificaciones por buenas prácticas sobre costos de operación (${ise.ise_con_incentivos_cmog}%) y administración (${ise.ise_con_incentivos_cma}%).</li>
                            </ol>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    window.IseIncentivos = IseIncentivos;

})(window);
