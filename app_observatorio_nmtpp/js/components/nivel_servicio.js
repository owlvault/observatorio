/**
 * nivel_servicio.js — Vista 3: Nivel de Servicio Frente a Metas Regulatorias
 * Cumple RF-NMTPP-06..10, RF-NMTPP-16, INV-05, INV-06, INV-07, INV-09
 */

(function(window) {
    'use strict';

    const NivelServicio = {
        currentIndicator: 'MIC',
        charts: {},

        INDICADORES: [
            { code: 'MIC', nombre: 'Micromedición Efectiva', unidad: '%', aplica: 'S1, S2', pregunta: '¿Qué porcentaje de los usuarios cuentan con micromedidor activo y lecturas periódicas de su consumo real?' },
            { code: 'MAC', nombre: 'Macromedición Efectiva', unidad: '%', aplica: 'S1, S2', pregunta: '¿Se mide y registra sistemáticamente el volumen total de agua tratada suministrada a la red de distribución?' },
            { code: 'CON', nombre: 'Continuidad del Suministro', unidad: 'h/día o %', aplica: 'S1, S2', pregunta: '¿Cuántas horas de servicio continuo y presión adecuada reciben las familias y establecimientos al día?' },
            { code: 'COB', nombre: 'Cobertura', unidad: '%', aplica: 'S1', pregunta: '¿Qué proporción de las viviendas y predios dentro del área de servicio tienen conexión efectiva a la red?' },
            { code: 'PER', nombre: 'Pérdidas de Agua (IPUF)', unidad: 'm³/susc/mes', aplica: 'S1', pregunta: '¿Cuánto volumen de agua potable tratada se pierde al mes en tuberías o fugas por cada usuario conectado?' },
            { code: 'PSH', nombre: 'Plan de Sostenibilidad Hídrica', unidad: 'Binario', aplica: 'S1-1', pregunta: '¿Dispone el prestador de instrumentos vigentes para la protección y gobernanza de la cuenca abastecedora?' },
            { code: 'CAL', nombre: 'Calidad del Agua (IRCA)', unidad: '%', aplica: 'S1, S2', pregunta: '¿Cuál es el nivel de riesgo sanitario del agua suministrada a la población según los parámetros de la norma?' }
        ],

        setIndicator(code) {
            this.currentIndicator = code;
            this.render('tab-nivel-servicio');
        },

        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const data = window.CRA_NMTPP_DATA;
            const params = window.CRA_NMTPP_PARAMS;
            if (!data || !params || !window.MotorEstados) {
                container.innerHTML = '<div class="notice-box warning">Datos no disponibles</div>';
                return;
            }

            const appState = window.AppNMTPP || { modo: 'analista', banderas: {}, filtros: {} };
            const banderas = appState.banderas || {};
            const filtroSub = appState.filtros.subsegmento || 'todos';
            const filtroSeg = appState.filtros.segmento || 'todos';

            // Evaluar todos los estados 2027
            const evaluados = window.MotorEstados.evaluarTodo(2027, banderas);

            // Filtrar indicadores relevantes
            const indActual = this.INDICADORES.find(i => i.code === this.currentIndicator) || this.INDICADORES[0];

            let html = `
                <div class="dashboard-panel" style="margin-bottom: 18px;">
                    <div class="panel-header" style="margin-bottom: 12px; padding-bottom: 10px;">
                        <div class="panel-header-title">
                            <h2>Nivel de Servicio Frente a Metas Regulatorias</h2>
                            <p>Seguimiento por indicador sin rankings ni agregaciones no homogéneas • Comparación exclusiva dentro de cada subsegmento</p>
                        </div>
                    </div>

                    <!-- Selector de Indicador de Nivel de Servicio -->
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
                        ${this.INDICADORES.map(ind => `
                            <button class="nav-tab-btn ${ind.code === this.currentIndicator ? 'active' : ''}"
                                    style="border-radius: var(--radius-sm); border: 1px solid var(--border-light);"
                                    onclick="NivelServicio.setIndicator('${ind.code}')">
                                <strong>${ind.code}</strong> — ${ind.nombre}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Pregunta Orientadora Amigable (Estilo OECD Water) -->
                    <div style="background: var(--bg-surface-subtle); padding: 14px 18px; border-radius: var(--radius-sm); border-left: 4px solid var(--blue-primary); margin-bottom: 16px;">
                        <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--blue-primary); margin-bottom: 2px;">
                            Pregunta Clave • ${indActual.nombre}
                        </div>
                        <div style="font-size: 0.98rem; font-weight: 700; color: var(--blue-deep-navy); line-height: 1.4;">
                            ${indActual.pregunta}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                            <strong>Ámbito de Aplicación:</strong> ${indActual.aplica} • <strong>Unidad de Reporte:</strong> ${indActual.unidad}
                        </div>
                    </div>

                    <!-- Leyenda obligatoria RN-NMTPP-05 -->
                    <div class="notice-box info" style="margin-bottom: 0;">
                        <span>⚖️</span>
                        <div>
                            <strong>Aviso Regulatorio Institucional (RN-NMTPP-05):</strong>
                            <em>Seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento y funciones de inspección, vigilancia y control son de competencia exclusiva de la Superintendencia de Servicios Públicos Domiciliarios (SSPD).</em>
                        </div>
                    </div>
                </div>
            `;

            // Caso Especial CAL (IRCA): INV-05
            if (this.currentIndicator === 'CAL') {
                html += `
                    <div class="notice-box danger" style="padding: 24px; font-size: 0.95rem;">
                        <span style="font-size: 1.6rem;">🚫</span>
                        <div>
                            <h3 style="color: var(--st-meta-no-alcanzada-color); margin-bottom: 8px;">Estado: Sin Fuente Confirmada (INV-05 / Q-NMTPP-06)</h3>
                            <p style="margin-bottom: 8px;">
                                La Resolución CRA 1038 de 2026 exige que el IRCA sea menor o igual al <strong>5.0%</strong> desde el inicio de aplicación (estándar sin riesgo). Sin embargo, <strong>la norma no designó una fuente autoritativa ni un canal de reporte formal</strong> hacia la CRA ni estableció la regla temporal de agregación.
                            </p>
                            <p style="color: var(--text-muted); font-size: 0.85rem;">
                                En apego a la <strong>Regla de Oro 1</strong> y al <strong>ADR-0003</strong>, el Observatorio prohíbe graficar valores o sustituir el IRCA por proxies mientras la Subdirección Técnica de Regulación no expida la aclaración correspondiente (Q-NMTPP-06).
                            </p>
                        </div>
                    </div>
                `;
                container.innerHTML = html;
                return;
            }

            // Subsegmentos a mostrar
            let subsegmentos = ['S1-1', 'S1-2', 'S1-3', 'S1-4', 'S2-1', 'S2-2', 'S2-3', 'S2-4'];
            if (filtroSeg === 'S1') subsegmentos = subsegmentos.filter(s => s.startsWith('S1'));
            if (filtroSeg === 'S2') subsegmentos = subsegmentos.filter(s => s.startsWith('S2'));
            if (filtroSub !== 'todos') subsegmentos = subsegmentos.filter(s => s === filtroSub);

            // Advertencia de no comparabilidad inter-subsegmento si abarca más de uno (INV-06)
            if (subsegmentos.length > 1) {
                html += `
                    <div class="notice-box warning">
                        <span>⚠️</span>
                        <div>
                            <strong>Nota de No Comparabilidad Inter-Subsegmentos (INV-06 / RN-NMTPP-02):</strong>
                            Las metas, horizontes de cumplimiento y fórmulas son distintas por subsegmento y régimen. <strong>Está estrictamente prohibido comparar operadores entre subsegmentos diferentes.</strong> Las visualizaciones se presentan en paneles independientes.
                        </div>
                    </div>
                `;
            }

            // Renderizar un panel por subsegmento
            subsegmentos.forEach(sub => {
                // Filtrar prestadores de este subsegmento
                const prestadoresSub = data.prestadores.filter(p => p.subsegmento_vigente === sub);
                if (prestadoresSub.length === 0) return;

                // Filtrar estados evaluados correspondientes a este indicador y este subsegmento
                const itemsSub = [];
                for (const p of prestadoresSub) {
                    for (const a of p.aps) {
                        const codeBuscado = p.segmento_vigente === 'S1' ? `NMTPP-S1-${this.currentIndicator}` : `NMTPP-S2-${this.currentIndicator}`;
                        const ev = evaluados.find(e => e.provider_id === p.provider_id && e.service_area_id === a.service_area_id && e.indicator_code === codeBuscado);
                        if (ev) {
                            itemsSub.push({
                                prestador: p,
                                aps: a,
                                estado: ev,
                                lb: (a.linea_base && a.linea_base[this.currentIndicator]) || null,
                                obs: ev.valor_observado
                            });
                        }
                    }
                }

                if (itemsSub.length === 0 && this.currentIndicator === 'PSH') {
                    // PSH solo aplica a S1-1
                    return;
                }

                const panelId = `panel-sub-${sub}`;
                const chartId = `chart-sub-${sub}`;
                const tableId = `tbl-sub-${sub}`;

                html += `
                    <div class="dashboard-panel" id="${panelId}">
                        <div class="panel-header">
                            <div class="panel-header-title">
                                <h2>Subsegmento ${sub} • ${indActual.nombre}</h2>
                                <p>${prestadoresSub.length} prestadores en este grupo • Unidad de reporte: ${itemsSub[0] ? itemsSub[0].estado.unidad : indActual.unidad}</p>
                            </div>
                            <div class="panel-actions">
                                <button class="btn-toggle-table" onclick="NivelServicio.toggleTable('${tableId}')">Ver tabla accesible</button>
                            </div>
                        </div>

                        ${this.currentIndicator === 'CON' && !banderas.continuidad_equivalencia_24h ? `
                            <div class="notice-box info" style="margin-bottom: 16px;">
                                <span>§</span>
                                <div>
                                    <strong>Meta Pendiente de Aclaración Normativa (Q-NMTPP-01 / Q-NMTPP-02):</strong>
                                    Se publican los valores observados 2027 y la línea base histórica sin evaluar cierre de brecha, debido a discrepancias en la unidad del Anexo 6.2.1.10 y definición de línea base.
                                    <em>(En modo analista puede activar el switch superior para simular la aclaración de equivalencia de 24 horas).</em>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Gráfica según indicador -->
                        <div class="chart-wrapper">
                            <canvas id="${chartId}" height="100"></canvas>
                        </div>
                        <div class="chart-caption">Fuente: SUI / Estudio de Costos • DATOS SINTÉTICOS</div>

                        <!-- Tabla accesible de APS -->
                        <div id="${tableId}" style="display: none; margin-top: 16px;">
                            <div class="data-table-container">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Prestador</th>
                                            <th>APS</th>
                                            <th>Línea Base</th>
                                            <th>Observado 2027</th>
                                            <th>Meta Aplicada</th>
                                            <th>Origen Meta</th>
                                            <th>Estado Frente a Meta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsSub.map(it => `
                                            <tr class="clickable" onclick="NivelServicio.abrirTrayectoria('${it.prestador.provider_id}', '${it.aps.service_area_id}', '${this.currentIndicator}')">
                                                <td><strong>${it.prestador.nombre}</strong></td>
                                                <td>
                                                    ${it.aps.municipio}
                                                    ${it.aps.condiciones_especiales && it.aps.condiciones_especiales.length > 0
                                                        ? `<span class="chip chip-special">${it.aps.condiciones_especiales.join(', ')}</span>`
                                                        : ''}
                                                </td>
                                                <td class="mono">${it.lb !== null ? it.lb : '—'}</td>
                                                <td class="mono font-bold">${it.obs !== null ? it.obs : 'No reportó'}</td>
                                                <td class="mono">${it.estado.meta_aplicada !== null ? it.estado.meta_aplicada : '—'}</td>
                                                <td>${it.estado.origen_meta ? `<span class="chip">${it.estado.origen_meta}</span>` : '—'}</td>
                                                <td>
                                                    ${NivelServicio.renderStatusPill(it.estado.estado, it.estado.marca_simulacion)}
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            // Renderizar gráficas tras montar DOM
            setTimeout(() => {
                subsegmentos.forEach(sub => {
                    const chartId = `chart-sub-${sub}`;
                    const canvas = document.getElementById(chartId);
                    if (canvas) {
                        this.renderSubsegmentChart(sub, canvas, evaluados);
                    }
                });
            }, 50);
        },

        renderStatusPill(st, simMarca) {
            const icons = {
                'meta cumplida': '✓',
                'en trayectoria': '↗',
                'fuera de trayectoria': '↘',
                'meta no alcanzada en el año de cumplimiento': '✕',
                'no exigible aún': '⏳',
                'no reportó': '⊘',
                'meta no declarada': '?',
                'meta pendiente de aclaración normativa': '§',
                'sin fuente confirmada': 'ⓘ',
                'no aplica': '—'
            };

            const classMap = {
                'meta cumplida': 'status-meta-cumplida',
                'en trayectoria': 'status-en-trayectoria',
                'fuera de trayectoria': 'status-fuera-de-trayectoria',
                'meta no alcanzada en el año de cumplimiento': 'status-meta-no-alcanzada',
                'no exigible aún': 'status-no-exigible',
                'no reportó': 'status-no-reporto',
                'meta no declarada': 'status-meta-no-declarada',
                'meta pendiente de aclaración normativa': 'status-pendiente-aclaracion',
                'sin fuente confirmada': 'status-sin-fuente',
                'no aplica': 'status-no-aplica'
            };

            const ic = icons[st] || '○';
            const cls = classMap[st] || '';
            const simTag = simMarca ? ` <span class="chip chip-simulation">${simMarca}</span>` : '';

            return `<span class="status-pill ${cls}"><span class="status-icon">${ic}</span> ${st}${simTag}</span>`;
        },

        renderSubsegmentChart(sub, canvas, evaluados) {
            const data = window.CRA_NMTPP_DATA;
            const prestadoresSub = data.prestadores.filter(p => p.subsegmento_vigente === sub);
            const items = [];

            for (const p of prestadoresSub) {
                for (const a of p.aps) {
                    const code = p.segmento_vigente === 'S1' ? `NMTPP-S1-${this.currentIndicator}` : `NMTPP-S2-${this.currentIndicator}`;
                    const ev = evaluados.find(e => e.provider_id === p.provider_id && e.service_area_id === a.service_area_id && e.indicator_code === code);
                    if (ev && ev.valor_observado !== null) {
                        items.push({
                            label: p.nombre.replace('Empresa de Servicios Públicos Sintética ', 'ESP ').replace('Empresas Públicas Sintéticas ', 'EEPP ').replace('Aguas Sintéticas ', 'Aguas '),
                            lb: (a.linea_base && a.linea_base[this.currentIndicator]) || 0,
                            obs: ev.valor_observado,
                            meta: ev.meta_aplicada
                        });
                    }
                }
            }

            if (items.length === 0) return;

            if (this.charts[canvas.id]) this.charts[canvas.id].destroy();

            const labels = items.map(i => i.label);
            const obsData = items.map(i => i.obs);
            const lbData = items.map(i => i.lb);

            this.charts[canvas.id] = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Línea Base (2026)',
                            data: lbData,
                            backgroundColor: '#cbd5e1',
                            borderRadius: 4
                        },
                        {
                            label: 'Observado 2027',
                            data: obsData,
                            backgroundColor: '#0b5e87',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: { position: 'top' }
                    }
                }
            });
        },

        toggleTable(tableId) {
            const el = document.getElementById(tableId);
            if (el) {
                el.style.display = el.style.display === 'none' ? 'block' : 'none';
            }
        },

        abrirTrayectoria(providerId, serviceAreaId, indCode) {
            if (window.Prestadores && window.Prestadores.abrirModalPerfil) {
                window.Prestadores.abrirModalPerfil(providerId, 'trayectorias');
            }
        }
    };

    window.NivelServicio = NivelServicio;

})(window);
