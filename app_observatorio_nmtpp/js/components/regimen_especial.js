/**
 * regimen_especial.js — Vista 6: Régimen Especial y APS con Condiciones Estructurales
 * Cumple RF-NMTPP-10, NMTPP-ESP-01
 */

(function(window) {
    'use strict';

    const RegimenEspecial = {
        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const data = window.CRA_NMTPP_DATA;
            if (!data || !data.prestadores) {
                container.innerHTML = '<div class="notice-box warning">Datos no disponibles</div>';
                return;
            }

            // Recopilar APS con condiciones especiales
            const apsEspeciales = [];
            const conteoCondiciones = {
                'INSULAR': 0,
                'IVH': 0,
                'IPM': 0,
                'PDET_ZOMAC': 0,
                'TOMA_POSESION': 0
            };

            data.prestadores.forEach(p => {
                if (p.aps) {
                    p.aps.forEach(a => {
                        if (a.condiciones_especiales && a.condiciones_especiales.length > 0) {
                            apsEspeciales.push({
                                prestador: p,
                                aps: a
                            });
                            a.condiciones_especiales.forEach(cond => {
                                if (conteoCondiciones[cond] !== undefined) {
                                    conteoCondiciones[cond]++;
                                }
                            });
                        }
                    });
                }
            });

            let html = `
                <div class="dashboard-panel">
                    <div class="panel-header">
                        <div class="panel-header-title">
                            <h2>Territorios y Zonas con Tratamiento Especial (Protección Social y Geográfica)</h2>
                            <p>Reglas flexibles para acueductos en islas, zonas con escasez de agua, municipios con alta pobreza o territorios en posconflicto (Art. 2.1.1.1.4.1)</p>
                        </div>
                    </div>

                    <div class="notice-box info">
                        <span>🏛️</span>
                        <div>
                            <strong>¿Por qué la regulación otorga un tratamiento flexible a estas comunidades?:</strong>
                            Colombia cuenta con una gran diversidad territorial. No es razonable exigir las mismas metas inmediatas de inversión a un acueducto en una isla lejana o en una zona con sequías recurrentes que a una cabecera municipal con mayores recursos.
                            <br>
                            Por ello, cuando una zona atendida presenta condiciones de alta vulnerabilidad geográfica o socioeconómica, <strong>se evalúa con metas graduales y adaptadas a su realidad local (las mismas del esquema de acueductos comunitarios)</strong>, garantizando que el servicio no se interrumpa por exigencias financieras desproporcionadas.
                            <br>
                            <em>💧 Principio innegociable: La seguridad sanitaria no admite excepciones; el agua suministrada siempre debe ser apta para el consumo de las familias (IRCA ≤ 5.0%).</em>
                        </div>
                    </div>

                    <!-- Tarjetas de Conteo por Condición Especial (NMTPP-ESP-01) -->
                    <div class="card-grid" style="margin-top: 20px;">
                        <div class="kpi-card">
                            <div class="kpi-card-header">
                                <span class="kpi-card-title">Comunidades Insulares</span>
                                <div class="kpi-card-icon">🏝️</div>
                            </div>
                            <div class="kpi-main-stat">${conteoCondiciones.INSULAR}</div>
                            <div class="kpi-subtext">Zonas en San Andrés, Providencia y Santa Catalina con retos logísticos singulares</div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card-header">
                                <span class="kpi-card-title">Escasez y Vulnerabilidad Hídrica</span>
                                <div class="kpi-card-icon">💧</div>
                            </div>
                            <div class="kpi-main-stat">${conteoCondiciones.IVH}</div>
                            <div class="kpi-subtext">Municipios con alta fragilidad en sus fuentes naturales de agua (según el IDEAM)</div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card-header">
                                <span class="kpi-card-title">Municipios con Alta Pobreza (IPM)</span>
                                <div class="kpi-card-icon">📈</div>
                            </div>
                            <div class="kpi-main-stat">${conteoCondiciones.IPM}</div>
                            <div class="kpi-subtext">Comunidades con privaciones de vivienda e ingresos (según censo DANE)</div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card-header">
                                <span class="kpi-card-title">Territorios PDET / ZOMAC</span>
                                <div class="kpi-card-icon">🕊️</div>
                            </div>
                            <div class="kpi-main-stat">${conteoCondiciones.PDET_ZOMAC}</div>
                            <div class="kpi-subtext">Municipios con Programas de Desarrollo con Enfoque Territorial y Zonas de Conflicto</div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card-header">
                                <span class="kpi-card-title">Empresas en Medida Especial</span>
                                <div class="kpi-card-icon">⚖️</div>
                            </div>
                            <div class="kpi-main-stat">${conteoCondiciones.TOMA_POSESION}</div>
                            <div class="kpi-subtext">Operadores temporalmente intervenidos por la Superintendencia (SSPD)</div>
                        </div>
                    </div>

                    <!-- Tabla de APS bajo Régimen Especial -->
                    <h3 style="font-size: 1.05rem; color: var(--blue-deep-navy); margin-top: 10px; margin-bottom: 8px;">
                        Zonas Específicas Evaluadas con Reglas Flexibles de Segundo Segmento (S2)
                    </h3>
                    <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 14px;">
                        Estas poblaciones reciben metas de continuidad porcentuales y calendarios graduales de micromedición acordes a su realidad local.
                    </p>

                    <div class="data-table-container">
                        <table class="data-table" aria-label="Tabla de zonas con régimen especial">
                            <thead>
                                <tr>
                                    <th>Operador Responsable</th>
                                    <th>Zona Atendida (APS)</th>
                                    <th>Municipio</th>
                                    <th>Condición Especial Reconocida</th>
                                    <th>Segmento General</th>
                                    <th>Régimen Aplicado</th>
                                    <th>Beneficio Concreto para la Comunidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${apsEspeciales.map(item => `
                                    <tr>
                                        <td><strong>${item.prestador.nombre}</strong></td>
                                        <td class="mono font-bold">${item.aps.service_area_id}</td>
                                        <td>${item.aps.municipio}</td>
                                        <td>
                                            ${item.aps.condiciones_especiales.map(c => `<span class="chip chip-special">${c}</span>`).join(' ')}
                                        </td>
                                        <td><span class="chip">${item.prestador.segmento_vigente}</span></td>
                                        <td>
                                            <span class="status-pill status-en-trayectoria">
                                                Reglas Flexibles S2
                                            </span>
                                        </td>
                                        <td style="font-size: 0.8rem; color: var(--text-secondary);">
                                            Continuidad gradual y medidores adaptados a la capacidad local (Art. 2.1.1.1.4.1)
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        }
    };

    window.RegimenEspecial = RegimenEspecial;

})(window);
