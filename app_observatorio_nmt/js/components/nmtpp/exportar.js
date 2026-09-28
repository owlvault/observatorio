/**
 * exportar.js — Vista 9: Centro de Descargas y Exportación de Datos
 * Cumple INV-01, RF-PROTO-06
 * 
 * Regla Estricta RF-PROTO-06:
 * La primera línea de cada archivo exportado DEBE ser el aviso de datos sintéticos (_meta.aviso).
 * La segunda línea es el encabezado de columnas.
 */

(function(window) {
    'use strict';

    const Exportar = {
        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            let html = `
                <div class="dashboard-panel">
                    <div class="panel-header">
                        <div class="panel-header-title">
                            <h2>Centro de Descargas y Datos Abiertos (CSV UTF-8)</h2>
                            <p>Descarga de conjuntos de datos abiertos para investigaciones, veedurías ciudadanas, líderes comunitarios y autoridades locales</p>
                        </div>
                    </div>

                    <div class="notice-box info">
                        <span>ℹ️</span>
                        <div>
                            <strong>Garantía de Transparencia Pública (INV-01 / RF-PROTO-06):</strong>
                            Para facilitar el análisis independiente, todos los datos pueden descargarse en formato libre (CSV). Cada archivo descargado contiene en su <strong>primera línea física</strong> el aviso obligatorio indicando que corresponden a un prototipo pedagógico con datos sintéticos.
                        </div>
                    </div>

                    <div class="card-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
                        <!-- Dataset Prestadores -->
                        <div class="kpi-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div class="kpi-card-header">
                                    <span class="kpi-card-title">Directorio de Acueductos</span>
                                    <div class="kpi-card-icon">🏢</div>
                                </div>
                                <h3 style="font-size: 1.1rem; color: var(--blue-deep-navy); margin-bottom: 6px;">prestadores.csv</h3>
                                <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 16px;">
                                    Listado de los 40 prestadores sintéticos: escala de tamaño, familias atendidas a 2024, departamento, zona urbana o rural y tipo de organización.
                                </p>
                            </div>
                            <button class="nav-tab-btn active" style="justify-content: center; width: 100%; border-radius: var(--radius-sm);"
                                    onclick="Exportar.descargar('prestadores')">
                                ⬇️ Descargar prestadores.csv
                            </button>
                        </div>

                        <!-- Dataset Estados Evaluados -->
                        <div class="kpi-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div class="kpi-card-header">
                                    <span class="kpi-card-title">Metas y Estados de Servicio</span>
                                    <div class="kpi-card-icon">📊</div>
                                </div>
                                <h3 style="font-size: 1.1rem; color: var(--blue-deep-navy); margin-bottom: 6px;">estados.csv</h3>
                                <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 16px;">
                                    239 evaluaciones del año 2027: indicador evaluado, meta exigida, resultado obtenido, estado asignado y base legal correspondiente.
                                </p>
                            </div>
                            <button class="nav-tab-btn active" style="justify-content: center; width: 100%; border-radius: var(--radius-sm);"
                                    onclick="Exportar.descargar('estados')">
                                ⬇️ Descargar estados.csv
                            </button>
                        </div>

                        <!-- Dataset ISE Oficial -->
                        <div class="kpi-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div class="kpi-card-header">
                                    <span class="kpi-card-title">Eficiencia e Incentivos (ISE)</span>
                                    <div class="kpi-card-icon">⚡</div>
                                </div>
                                <h3 style="font-size: 1.1rem; color: var(--blue-deep-navy); margin-bottom: 6px;">ise.csv</h3>
                                <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 16px;">
                                    Publicación oficial anual expedida por la CRA para el Primer Segmento: puntaje ISE, dimensiones técnica/administrativa/financiera y estímulos tarifarios.
                                </p>
                            </div>
                            <button class="nav-tab-btn active" style="justify-content: center; width: 100%; border-radius: var(--radius-sm);"
                                    onclick="Exportar.descargar('ise')">
                                ⬇️ Descargar ise.csv
                            </button>
                        </div>

                        <!-- Dataset Tarifas -->
                        <div class="kpi-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div class="kpi-card-header">
                                    <span class="kpi-card-title">Composición de Tarifas</span>
                                    <div class="kpi-card-icon">💰</div>
                                </div>
                                <h3 style="font-size: 1.1rem; color: var(--blue-deep-navy); margin-bottom: 6px;">tarifas.csv</h3>
                                <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 16px;">
                                    Detalle del cargo fijo mensual y del consumo por metro cúbico facturado por estrato socioeconómico (E1 a E6) y comercios locales.
                                </p>
                            </div>
                            <button class="nav-tab-btn active" style="justify-content: center; width: 100%; border-radius: var(--radius-sm);"
                                    onclick="Exportar.descargar('tarifas')">
                                ⬇️ Descargar tarifas.csv
                            </button>
                        </div>

                        <!-- Dataset Adopción -->
                        <div class="kpi-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div class="kpi-card-header">
                                    <span class="kpi-card-title">Avance por Tamaño de Acueducto</span>
                                    <div class="kpi-card-icon">📈</div>
                                </div>
                                <h3 style="font-size: 1.1rem; color: var(--blue-deep-navy); margin-bottom: 6px;">adopcion.csv</h3>
                                <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 16px;">
                                    Métricas de radicación oportuna de estudios de costos desglosadas por cada uno de los 8 niveles de escala poblacional.
                                </p>
                            </div>
                            <button class="nav-tab-btn active" style="justify-content: center; width: 100%; border-radius: var(--radius-sm);"
                                    onclick="Exportar.descargar('adopcion')">
                                ⬇️ Descargar adopcion.csv
                            </button>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        },

        getAviso() {
            const data = window.CRA_NMTPP_DATA;
            return (data && data._meta && data._meta.aviso)
                ? data._meta.aviso
                : 'DATOS SINTÉTICOS PARA PROTOTIPO — NO SON INFORMACIÓN REAL. Los parámetros regulatorios sí provienen de la Res. CRA 1038 de 2026.';
        },

        descargar(tipo) {
            const data = window.CRA_NMTPP_DATA;
            if (!data) return;

            const aviso = this.getAviso();
            let csvLines = [aviso];
            let filename = `${tipo}.csv`;

            if (tipo === 'prestadores') {
                csvLines.push('provider_id,nombre,segmento,subsegmento_vigente,subsegmento_declarado,es_gestor_comunitario,opcion_s2_a_s1,departamento,suscriptores_ac_2024,pct_rurales_2024,facturacion');
                data.prestadores.forEach(p => {
                    csvLines.push([
                        p.provider_id,
                        `"${p.nombre}"`,
                        p.segmento_vigente,
                        p.subsegmento_vigente,
                        p.subsegmento_declarado,
                        p.es_gestor_comunitario,
                        p.opcion_s2_a_s1,
                        `"${p.departamento ? p.departamento.nombre : ''}"`,
                        p.suscriptores_ac_2024,
                        p.pct_rurales_2024,
                        p.facturacion
                    ].join(','));
                });
            } else if (tipo === 'estados') {
                csvLines.push('indicator_code,version,anio_tarifario,provider_id,service_area_id,estado,meta_aplicada,origen_meta,articulo,q_bloqueante,valor_observado,unidad');
                const appState = window.AppNMTPP || { banderas: {} };
                const estados = window.MotorEstados ? window.MotorEstados.evaluarTodo(2027, appState.banderas) : (data.estados_esperados || []);
                estados.forEach(e => {
                    csvLines.push([
                        e.indicator_code,
                        1,
                        e.anio_tarifario,
                        e.provider_id,
                        e.service_area_id,
                        `"${e.estado}"`,
                        e.meta_aplicada !== null ? e.meta_aplicada : '',
                        e.origen_meta || '',
                        `"${e.articulo || ''}"`,
                        `"${e.q_bloqueante || ''}"`,
                        e.valor_observado !== null ? e.valor_observado : '',
                        `"${e.unidad || ''}"`
                    ].join(','));
                });
            } else if (tipo === 'ise') {
                csvLines.push('provider_id,service_area_id,anio_aplicacion,anio_evaluado,ise_calculado,dim_tecnica,dim_administrativa,dim_financiera,pct_eficiencia_aplicable,piso_anio,ise_cmog,ise_cma,fecha_publicacion,acto_ref');
                data.prestadores.filter(p => p.segmento_vigente === 'S1').forEach(p => {
                    if (p.ise && p.ise.length > 0) {
                        const ise = p.ise[0];
                        csvLines.push([
                            p.provider_id,
                            ise.service_area_id,
                            ise.anio_aplicacion,
                            ise.anio_evaluado,
                            ise.ise_calculado || '',
                            ise.dim_tecnica || '',
                            ise.dim_administrativa || '',
                            ise.dim_financiera || '',
                            ise.pct_eficiencia_aplicable || '',
                            ise.piso_anio || '',
                            ise.ise_con_incentivos_cmog || '',
                            ise.ise_con_incentivos_cma || '',
                            ise.fecha_publicacion || '',
                            `"${ise.acto_ref || ''}"`
                        ].join(','));
                    }
                });
            } else if (tipo === 'tarifas') {
                csvLines.push('provider_id,service_area_id,marco_origen,periodo,estrato_uso,cargo_fijo,cargo_consumo,base_year,monetary_condition');
                data.prestadores.forEach(p => {
                    if (p.tarifas) {
                        p.tarifas.forEach(t => {
                            csvLines.push([
                                p.provider_id,
                                t.service_area_id,
                                t.marco_origen,
                                t.periodo,
                                t.estrato_uso,
                                t.cargo_fijo,
                                t.cargo_consumo,
                                t.base_year,
                                t.monetary_condition
                            ].join(','));
                        });
                    }
                });
            } else if (tipo === 'adopcion') {
                csvLines.push('subsegmento,universo_U,estudio_inicial_E,adopcion_inicial_pct,recalculo_2028_R,recalculo_pct');
                const adop = data.adopcion_esperada || {};
                for (const sub in adop) {
                    csvLines.push([
                        sub,
                        adop[sub].U,
                        adop[sub].ADO01_inicial,
                        adop[sub].ADO01_pct,
                        adop[sub].ADO04_recalculo_2028_en_ventana,
                        adop[sub].ADO04_pct
                    ].join(','));
                }
            }

            const csvContent = '\uFEFF' + csvLines.join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    window.Exportar = Exportar;

})(window);
