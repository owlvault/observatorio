/**
 * resumen_adopcion.js — Vista 1: Resumen de Implementación y Adopción
 * Cumple RF-NMTPP-05, RF-NMTPP-07, RF-PROTO-05
 */

(function(window) {
    'use strict';

    const ResumenAdopcion = {
        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const data = window.CRA_NMTPP_DATA;
            const params = window.CRA_NMTPP_PARAMS;
            if (!data || !params) {
                container.innerHTML = '<div class="notice-box warning">Datos no disponibles</div>';
                return;
            }

            const adop = data.adopcion_esperada || {};
            const prestadores = data.prestadores || [];

            // Totales globales
            let totalU = 0;
            let totalE = 0;
            let totalR = 0;
            let totalOptanS1 = 0;

            for (const sub in adop) {
                totalU += adop[sub].U;
                totalE += adop[sub].ADO01_inicial;
                totalR += adop[sub].ADO04_recalculo_2028_en_ventana;
            }

            for (const p of prestadores) {
                if (p.opcion_s2_a_s1) totalOptanS1++;
            }

            const pctE = totalU > 0 ? (totalE * 100 / totalU).toFixed(1) : '0.0';
            const pctR = totalU > 0 ? (totalR * 100 / totalU).toFixed(1) : '0.0';

            // HTML de KPIs y estructura
            let html = `
                <!-- Bloque Editorial de Política Pública (Estilo OECD Water) -->
                <div class="policy-insights-grid" aria-label="Aspectos clave de la política regulatoria">
                    <div class="policy-insight-card">
                        <div class="policy-insight-icon">📐</div>
                        <h3>Diferenciación Real por Escala</h3>
                        <p>
                            El nuevo marco supera la fórmula genérica anterior al segmentar en <strong>8 subgrupos específicos</strong> (4 para empresas municipales S1 y 4 para gestores comunitarios S2), ajustando las exigencias de inversión a la capacidad real del territorio.
                        </p>
                    </div>

                    <div class="policy-insight-card">
                        <div class="policy-insight-icon">🤝</div>
                        <h3>Fortalecimiento Comunitario</h3>
                        <p>
                            Se reconoce formalmente la gobernanza de los <strong>Gestores Comunitarios del Agua</strong>, permitiéndoles optar voluntariamente por la metodología del Primer Segmento si disponen de capacidad operativa (art. 2.1.1.1.1.6 par. 4).
                        </p>
                    </div>

                    <div class="policy-insight-card">
                        <div class="policy-insight-icon">💧</div>
                        <h3>Seguridad Sanitaria Innegociable</h3>
                        <p>
                            El estándar sanitario de calidad del agua apta para consumo humano (<strong>IRCA ≤ 5.0%</strong>) rige para todos los operadores desde el primer día, protegiendo la salud de las comunidades rurales sin excepción geográfica.
                        </p>
                    </div>
                </div>

                <div class="card-grid">
                    <div class="kpi-card">
                        <div class="kpi-card-header">
                            <span class="kpi-card-title">Estudios de Tarifas Iniciales</span>
                            <div class="kpi-card-icon">📄</div>
                        </div>
                        <div class="kpi-main-stat">
                            ${pctE}%
                            <span class="kpi-fraction">(${totalE} de ${totalU} acueductos)</span>
                        </div>
                        <div class="kpi-subtext">Acueductos que ya calcularon y presentaron sus tarifas iniciales para 2027</div>
                        <div class="kpi-progress-track">
                            <div class="kpi-progress-fill" style="width: ${pctE}%;"></div>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-card-header">
                            <span class="kpi-card-title">Actualización Anual de Cuentas</span>
                            <div class="kpi-card-icon">⏱️</div>
                        </div>
                        <div class="kpi-main-stat">
                            ${pctR}%
                            <span class="kpi-fraction">(${totalR} de ${totalU} acueductos)</span>
                        </div>
                        <div class="kpi-subtext">Operadores que actualizaron sus cuentas a tiempo en 2028 (1 de enero a 31 de mayo)</div>
                        <div class="kpi-progress-track">
                            <div class="kpi-progress-fill" style="width: ${pctR}%;"></div>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-card-header">
                            <span class="kpi-card-title">Acueductos Comunitarios en Esquema General</span>
                            <div class="kpi-card-icon">🤝</div>
                        </div>
                        <div class="kpi-main-stat">${totalOptanS1} <span class="kpi-fraction">acueductos</span></div>
                        <div class="kpi-subtext">Organizaciones comunitarias que optaron voluntariamente por la metodología de empresas</div>
                        <div class="kpi-progress-track">
                            <div class="kpi-progress-fill" style="width: ${totalU > 0 ? (totalOptanS1 * 100 / totalU).toFixed(1) : 0}%;"></div>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-card-header">
                            <span class="kpi-card-title">Consultas y Aclaraciones Técnicas</span>
                            <div class="kpi-card-icon">⚖️</div>
                        </div>
                        <div class="kpi-main-stat" style="color: var(--st-fuera-trayectoria-color);">14 <span class="kpi-fraction">temas</span></div>
                        <div class="kpi-subtext">Aspectos normativos que la CRA está precisando para facilitar su aplicación en territorio</div>
                        <div class="kpi-progress-track">
                            <div class="kpi-progress-fill" style="width: 100%; background: linear-gradient(90deg, #f59e0b, #ef4444);"></div>
                        </div>
                    </div>
                </div>

                <!-- Panel Gráfico de Adopción por Tamaño -->
                <div class="dashboard-panel">
                    <div class="panel-header">
                        <div class="panel-header-title">
                            <h2>Avance en la Entrega de Estudios por Tamaño de Acueducto</h2>
                            <p>Muestra cuántos acueductos han presentado su estudio inicial y cuántos actualizaron sus cuentas oportunamente en cada grupo</p>
                        </div>
                        <div class="panel-actions">
                            <button class="btn-toggle-table" onclick="ResumenAdopcion.toggleTable('adop-table-wrapper')">Ver tabla accesible</button>
                        </div>
                    </div>

                    <div class="chart-wrapper">
                        <canvas id="chart-adopcion-subsegmentos" height="90"></canvas>
                    </div>
                    <div class="chart-caption">Fuente: Radicados oficiales recibidos en la CRA • DATOS SINTÉTICOS DE PROTOTIPO</div>

                    <div id="adop-table-wrapper" style="display: none; margin-top: 16px;">
                        <div class="data-table-container">
                            <table class="data-table" aria-label="Tabla de avance en la adopción por tamaño de acueducto">
                                <thead>
                                    <tr>
                                        <th>Grupo y Tamaño del Acueducto</th>
                                        <th>Total Acueductos</th>
                                        <th>Estudios Iniciales Entregados</th>
                                        <th>% Adopción Inicial</th>
                                        <th>Actualización 2028 a Tiempo</th>
                                        <th>% Actualización Oportuna</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.keys(adop).map(sub => `
                                        <tr>
                                            <td><strong>${sub}</strong></td>
                                            <td>${adop[sub].U}</td>
                                            <td>${adop[sub].ADO01_inicial}</td>
                                            <td>${adop[sub].ADO01_pct !== null ? adop[sub].ADO01_pct + '%' : '—'}</td>
                                            <td>${adop[sub].ADO04_recalculo_2028_en_ventana}</td>
                                            <td>${adop[sub].ADO04_pct !== null ? adop[sub].ADO04_pct + '%' : '—'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Panel Distribución de Estados por Subsegmento (Año 2027) -->
                <div class="dashboard-panel">
                    <div class="panel-header">
                        <div class="panel-header-title">
                            <h2>¿Cómo van los Acueductos Frente a sus Metas? (Año 2027)</h2>
                            <p>Evaluación técnica de calidad, continuidad y medición para cada grupo, respetando sus realidades territoriales</p>
                        </div>
                        <div class="panel-actions">
                            <button class="btn-toggle-table" onclick="ResumenAdopcion.toggleTable('estados-dist-table-wrapper')">Ver tabla accesible</button>
                        </div>
                    </div>

                    <div class="chart-wrapper">
                        <canvas id="chart-estados-distribucion" height="110"></canvas>
                    </div>
                    <div class="chart-caption">Evaluación objetiva con motor regulatorio determinista • DATOS SINTÉTICOS DE PROTOTIPO</div>

                    <div id="estados-dist-table-wrapper" style="display: none; margin-top: 16px;">
                        <div id="estados-dist-table-container"></div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            this.renderChartAdopcion(adop);
            this.renderChartEstados();
        },

        toggleTable(tableWrapperId) {
            const el = document.getElementById(tableWrapperId);
            if (el) {
                el.style.display = el.style.display === 'none' ? 'block' : 'none';
            }
        },

        renderChartAdopcion(adop) {
            const ctx = document.getElementById('chart-adopcion-subsegmentos');
            if (!ctx || typeof Chart === 'undefined') return;

            const labels = Object.keys(adop);
            const dataInicial = labels.map(k => adop[k].ADO01_pct || 0);
            const dataRecalculo = labels.map(k => adop[k].ADO04_pct || 0);

            if (window._chartAdopcion) window._chartAdopcion.destroy();

            window._chartAdopcion = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Estudios Iniciales Presentados (%)',
                            data: dataInicial,
                            backgroundColor: '#0b5e87',
                            borderRadius: 6
                        },
                        {
                            label: 'Actualización 2028 a Tiempo en Ventana (%)',
                            data: dataRecalculo,
                            backgroundColor: '#0284c7',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { callback: v => v + '%' }
                        }
                    },
                    plugins: {
                        legend: { position: 'top' }
                    }
                }
            });
        },

        renderChartEstados() {
            const ctx = document.getElementById('chart-estados-distribucion');
            if (!ctx || typeof Chart === 'undefined' || !window.MotorEstados) return;

            const evaluados = window.MotorEstados.evaluarTodo(2027);
            const subsegmentos = ['S1-1', 'S1-2', 'S1-3', 'S1-4', 'S2-1', 'S2-2', 'S2-3', 'S2-4'];
            
            // Conteo de estados por subsegmento
            const categorias = [
                { id: 'meta cumplida', label: 'Meta cumplida', color: '#059669' },
                { id: 'en trayectoria', label: 'En trayectoria', color: '#0284c7' },
                { id: 'fuera de trayectoria', label: 'Fuera de trayectoria', color: '#b45309' },
                { id: 'no exigible aún', label: 'No exigible aún', color: '#64748b' },
                { id: 'meta pendiente de aclaración normativa', label: 'Pendiente aclaración (Q)', color: '#0ea5e9' },
                { id: 'sin fuente confirmada', label: 'Sin fuente confirmada', color: '#38bdf8' },
                { id: 'no reportó', label: 'No reportó', color: '#334155' }
            ];

            const matrix = {};
            for (const sub of subsegmentos) {
                matrix[sub] = {};
                for (const cat of categorias) matrix[sub][cat.id] = 0;
            }

            for (const ev of evaluados) {
                const p = window.CRA_NMTPP_DATA.prestadores.find(pr => pr.provider_id === ev.provider_id);
                if (!p) continue;
                const sub = p.subsegmento_vigente;
                if (matrix[sub] && matrix[sub][ev.estado] !== undefined) {
                    matrix[sub][ev.estado]++;
                }
            }

            const datasets = categorias.map(cat => ({
                label: cat.label,
                data: subsegmentos.map(sub => matrix[sub][cat.id] || 0),
                backgroundColor: cat.color,
                stack: 'stack0'
            }));

            if (window._chartEstadosDist) window._chartEstadosDist.destroy();

            window._chartEstadosDist = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: subsegmentos,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { stacked: true },
                        y: { stacked: true, beginAtZero: true }
                    },
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });

            // Rellenar tabla alternativa
            const tblCont = document.getElementById('estados-dist-table-container');
            if (tblCont) {
                tblCont.innerHTML = `
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Subsegmento</th>
                                    ${categorias.map(c => `<th>${c.label}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${subsegmentos.map(sub => `
                                    <tr>
                                        <td><strong>${sub}</strong></td>
                                        ${categorias.map(c => `<td>${matrix[sub][c.id] || 0}</td>`).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }
    };

    window.ResumenAdopcion = ResumenAdopcion;

})(window);
