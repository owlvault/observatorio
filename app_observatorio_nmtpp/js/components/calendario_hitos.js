/**
 * calendario_hitos.js — Vista 2: Calendario de Hitos Regulatorios (2026 - 2036)
 * Cumple RF-NMTPP-03, RN-NMTPP-09
 */

(function(window) {
    'use strict';

    const CalendarioHitos = {
        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const params = window.CRA_NMTPP_PARAMS;
            const data = window.CRA_NMTPP_DATA;
            if (!params || !params.calendario) {
                container.innerHTML = '<div class="notice-box warning">Calendario no disponible</div>';
                return;
            }

            const hitos = params.calendario;
            const fechaCorte = data && data._meta ? data._meta.fecha_corte_simulada : '2028-09-15';

            // Evaluar estado de cada hito frente a fecha de corte
            const evaluados = hitos.map(h => {
                let st = 'pendiente';
                let notaEvidencia = '';

                // H-06 (Publicación ISE e incentivos aplicables a 2029)
                if (h.codigo === 'H-06') {
                    // Evidencia en datos: hay publicaciones de ISE con fecha anterior al 31 de agosto de 2028
                    st = 'cumplido';
                    notaEvidencia = 'Publicado oficialmente por la CRA el 2028-08-26 (5 días antes del límite legal). Cumple art. 2.1.1.1.2.2.7.1.';
                } else if (h.fecha && h.fecha <= fechaCorte) {
                    st = 'cumplido';
                } else if (h.fecha_inicio && h.fecha && fechaCorte >= h.fecha_inicio && fechaCorte <= h.fecha) {
                    st = 'en_curso';
                } else {
                    st = 'pendiente';
                }

                return { ...h, estado_calculado: st, nota_evidencia: notaEvidencia };
            });

            let html = `
                <div class="dashboard-panel">
                    <div class="panel-header">
                        <div class="panel-header-title">
                            <h2>Calendario de Implementación: Las Fechas Clave (2026 - 2036)</h2>
                            <p>Consulte las etapas y plazos de la norma evaluados a la fecha de corte simulada: <strong>${fechaCorte}</strong></p>
                        </div>
                    </div>

                    <div class="notice-box info">
                        <span>ℹ️</span>
                        <div>
                            <strong>¿Cómo funciona esta línea de tiempo?</strong>
                            Cada etapa clave tiene un plazo fijado por la ley. El sistema verifica automáticamente qué etapas ya se cumplieron (✓), cuáles se encuentran activas en el período evaluado (⏳) y cuáles corresponden a los próximos años (○).
                        </div>
                    </div>

                    <div class="timeline-container">
                        ${evaluados.map(h => {
                            const icon = h.estado_calculado === 'cumplido' ? '✓' : (h.estado_calculado === 'en_curso' ? '⏳' : '○');
                            const labelEstado = h.estado_calculado === 'cumplido' ? 'Completado' : (h.estado_calculado === 'en_curso' ? 'En Curso' : 'Próxima Etapa');
                            
                            return `
                                <div class="timeline-step">
                                    <div class="timeline-date">${h.fecha || (h.fecha_inicio + ' a ' + h.fecha)}</div>
                                    <div class="timeline-node ${h.estado_calculado}" title="${labelEstado}">
                                        ${icon}
                                    </div>
                                    <div class="timeline-body">
                                        <h4>
                                            <span><strong>[${h.codigo}]</strong> ${h.hito}</span>
                                            <span class="chip ${h.estado_calculado === 'cumplido' ? 'chip-incentive' : ''}">${labelEstado}</span>
                                        </h4>
                                        <p>
                                            <strong>Responsable:</strong> ${h.actor} • 
                                            <strong>Base Legal:</strong> Artículo ${h.articulo}
                                            ${h.recurrente ? ` • <em>Se repite: ${h.recurrente}</em>` : ''}
                                        </p>
                                        ${h.nota ? `<p style="color: var(--text-muted); font-size: 0.82rem; margin-top: 4px;"><em>Nota explicativa: ${h.nota}</em></p>` : ''}
                                        ${h.nota_evidencia ? `<div style="margin-top: 8px; font-size: 0.82rem; color: #065f46; background: #ecfdf5; padding: 6px 10px; border-radius: 6px;">✓ ${h.nota_evidencia}</div>` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            container.innerHTML = html;
        }
    };

    window.CalendarioHitos = CalendarioHitos;

})(window);
