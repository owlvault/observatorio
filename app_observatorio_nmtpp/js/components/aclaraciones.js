/**
 * aclaraciones.js — Vista 7: Matriz de Aclaraciones Normativas Pendientes (Q-NMTPP)
 * Cumple RF-NMTPP-18
 */

(function(window) {
    'use strict';

    const Aclaraciones = {
        ACLARACIONES: [
            {
                id: 'Q-NMTPP-03',
                tema: 'Regla de subsegmentación: cifra mayor vs acueducto',
                tipo: 'Contradicción Resolución vs DT',
                bloquea: 'NMTPP-ADO-02, y subsegmentación de todo el ámbito',
                fechaLimite: '2026-11-30',
                prioridad: 'Crítica',
                responsable: 'Subdirección Técnica de Regulación',
                estado: 'abierta',
                resumen: 'Art. 2.1.1.1.1.6 toma la cifra mayor entre acueducto y alcantarillado, mientras el DT toma solo acueducto. Afecta la clasificación de operadores multiactividad.'
            },
            {
                id: 'Q-NMTPP-09',
                tema: 'Formato estructurado de línea base y metas declaradas',
                tipo: 'Vacío operativo',
                bloquea: 'Todos los de nivel de servicio con meta declarada',
                fechaLimite: '2026-11-30',
                prioridad: 'Crítica',
                responsable: 'Subdirección Técnica de Regulación / CIO',
                estado: 'abierta',
                resumen: 'La norma exige que el prestador proyecte metas en su estudio de costos pero no provee plantilla ni formato estructurado para su radicación.'
            },
            {
                id: 'Q-NMTPP-10',
                tema: 'Formatos y plazos de reporte oficial de la SSPD al SUI',
                tipo: 'Dependencia institucional',
                bloquea: 'Toda la capa de nivel de servicio',
                fechaLimite: '2026-12-31',
                prioridad: 'Crítica',
                responsable: 'Subdirección Técnica de Regulación / SSPD',
                estado: 'abierta',
                resumen: 'Falta resolución conjunta o circular de la SSPD que fije los formatos y fechas límites de cargue en SUI para pequeños prestadores bajo el NMT.'
            },
            {
                id: 'Q-NMTPP-11',
                tema: 'Plazo legal de remisión del estudio de costos inicial a la CRA',
                tipo: 'Vacío normativo',
                bloquea: 'NMTPP-ADO-01 (cómputo oportuno)',
                fechaLimite: '2026-12-15',
                prioridad: 'Alta',
                responsable: 'Subdirección Técnica de Regulación',
                estado: 'abierta',
                resumen: 'La norma fija que el marco entra a regir el 1-ene-2027 pero no define la fecha límite estricta en que la CRA debe haber radicado el estudio inicial.'
            },
            {
                id: 'Q-NMTPP-14',
                tema: 'Alcance jurídico de publicación del estado frente a meta',
                tipo: 'Salvaguarda legal',
                bloquea: 'Estados frente a meta (vista pública)',
                fechaLimite: '2026-12-15',
                prioridad: 'Alta',
                responsable: 'Oficina Asesora Jurídica / Regulación',
                estado: 'abierta',
                resumen: 'Ratificación jurídica de la leyenda informativa: el Observatorio realiza seguimiento técnico sin prejuzgar incumplimientos sancionatorios.'
            },
            {
                id: 'Q-NMTPP-01',
                tema: 'Unidad de la fórmula de continuidad del S1 (h/día vs %)',
                tipo: 'Contradicción interna',
                bloquea: 'NMTPP-S1-CON',
                fechaLimite: '2027-12-31',
                prioridad: 'Alta',
                responsable: 'Subdirección Técnica de Regulación',
                estado: 'abierta',
                resumen: 'El Anexo 6.2.1.10 a) multiplica por 24 h/día produciendo horas, pero el encabezado del anexo y el artículo declaran el estándar en %.'
            },
            {
                id: 'Q-NMTPP-02',
                tema: 'Línea base de continuidad: situación real vs meta Res. 825',
                tipo: 'Contradicción Resolución vs DT',
                bloquea: 'NMTPP-S1-CON, NMTPP-S2-CON',
                fechaLimite: '2026-12-31',
                prioridad: 'Alta',
                responsable: 'Subdirección Técnica de Regulación',
                estado: 'abierta',
                resumen: 'La Resolución habla de la situación real al final de la vigencia de la Res. 825, mientras el DT alude a la meta que debía haber alcanzado.'
            },
            {
                id: 'Q-NMTPP-08',
                tema: 'Metas anuales intermedias para incentivos y seguimiento',
                tipo: 'Vacío normativo',
                bloquea: 'S1-MIC, S1-CON, S2-MIC, S2-CON, INC-01',
                fechaLimite: '2027-12-31',
                prioridad: 'Alta',
                responsable: 'Subdirección Técnica de Regulación',
                estado: 'abierta',
                resumen: 'Los incentivos del CMA exigen cumplir "metas anuales", pero la norma solo fijó estándares al año 3 o 5 sin fijar senda anual intermedia.'
            },
            {
                id: 'Q-NMTPP-06',
                tema: 'Fuente oficial, canal de reporte y regla temporal del IRCA',
                tipo: 'Vacío normativo',
                bloquea: 'NMTPP-S1-CAL, NMTPP-S2-CAL',
                fechaLimite: '2027-06-30',
                prioridad: 'Alta',
                responsable: 'Subdirección Técnica de Regulación',
                estado: 'abierta',
                resumen: 'Exige IRCA ≤ 5.0% desde el inicio pero no nombra al SIVICAP ni al SUI como fuente ni define si se promedia mensual, anual o muestralmente.'
            },
            {
                id: 'Q-NMTPP-07',
                tema: 'Denominador del IPUF con facturación bimestral',
                tipo: 'Ambigüedad de fórmula',
                bloquea: 'NMTPP-S1-PER, incentivo de pérdidas',
                fechaLimite: '2027-12-31',
                prioridad: 'Media',
                responsable: 'Subdirección Técnica de Regulación',
                estado: 'abierta',
                resumen: 'La fórmula mensualiza el IPUF asumiendo ciclo mensual. No define cómo calcular para los prestadores rurales con facturación bimestral.'
            },
            {
                id: 'Q-NMTPP-12',
                tema: 'Definición de reportes obligatorios para el incentivo SUI',
                tipo: 'Dependencia institucional',
                bloquea: 'NMTPP-INC-02',
                fechaLimite: '2028-06-30',
                prioridad: 'Media',
                responsable: 'Subdirección Técnica de Regulación / SSPD',
                estado: 'abierta',
                resumen: 'El art. 2.1.1.1.2.2.6.3 otorga incentivo por el 100% de reportes SUI vencidos, pero falta la lista canónica taxativa de formatos exigibles.'
            },
            {
                id: 'Q-NMTPP-04',
                tema: 'Normalización matemática estandarizada del ISE',
                tipo: 'Vacío metodológico',
                bloquea: 'NMTPP-ISE-01 (réplica técnica)',
                fechaLimite: '2028-05-31',
                prioridad: 'Media',
                responsable: 'Subdirección Técnica de Regulación',
                estado: 'abierta',
                resumen: 'La fórmula de ponderación está definida, pero no se detallan las curvas de transformación ni parámetros min/max de cada indicador.'
            },
            {
                id: 'Q-NMTPP-13',
                tema: 'ISE con costos unificados entre APS y prestadores insulares',
                tipo: 'Decisión regulatoria',
                bloquea: 'NMTPP-ISE-01',
                fechaLimite: '2028-05-31',
                prioridad: 'Media',
                responsable: 'Subdirección Técnica de Regulación',
                estado: 'abierta',
                resumen: 'Cómo publicar el ISE cuando un prestador opera múltiples APS con contabilidad o costos agregados, y exclusión de zonas insulares.'
            },
            {
                id: 'Q-NMTPP-05',
                tema: 'Fe de erratas de remisiones internas cruzadas en la norma',
                tipo: 'Error material',
                bloquea: 'Codificación unívoca de reglas',
                fechaLimite: '2026-12-31',
                prioridad: 'Media',
                responsable: 'Oficina Asesora Jurídica / Regulación',
                estado: 'abierta',
                resumen: 'Remisiones a artículos inexistentes o renombrados en la versión final de la resolución oficial expedida.'
            }
        ],

        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const appState = window.AppNMTPP || { modo: 'analista' };
            const fechaCorte = (window.CRA_NMTPP_DATA && window.CRA_NMTPP_DATA._meta) ? window.CRA_NMTPP_DATA._meta.fecha_corte_simulada : '2028-09-15';

            let html = `
                <div class="dashboard-panel">
                    <div class="panel-header">
                        <div class="panel-header-title">
                            <h2>Consultas y Aclaraciones Normativas (Mecanismo de Transparencia)</h2>
                            <p>Seguimiento público a dudas prácticas, vacíos técnicos y coordinación interinstitucional entre la CRA, la SSPD y los acueductos (RF-NMTPP-18)</p>
                        </div>
                    </div>

                    <div class="notice-box info">
                        <span>⚖️</span>
                        <div>
                            <strong>¿Por qué esta sección protege a las comunidades y a los acueductos?:</strong>
                            Al implementar una nueva regulación, surgen preguntas prácticas sobre qué formularios oficiales usar, cómo reportar en zonas rurales o cómo interpretar ciertas fórmulas matemáticas.
                            <br>
                            En lugar de aplicar sanciones arbitrarias o inventar reglas por nuestra cuenta, el Observatorio hace visibles estas consultas técnicas.
                            Mientras una duda se resuelve formalmente entre las entidades de gobierno, los indicadores correspondientes <strong>se marcan de forma transparente como "Meta pendiente de aclaración normativa" o "Sin fuente confirmada"</strong>, garantizando el debido proceso para prestadores y usuarios.
                        </div>
                    </div>

                    <div class="data-table-container">
                        <table class="data-table" aria-label="Matriz de aclaraciones regulatorias">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Consulta o Pregunta en Revisión</th>
                                    <th>Naturaleza</th>
                                    <th>Urgencia</th>
                                    <th>Aspectos Afectados</th>
                                    <th>Fecha Esperada</th>
                                    <th>Entidad Encargada</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.ACLARACIONES.map(q => {
                                    const vencida = q.fechaLimite < fechaCorte;
                                    const prioCls = q.prioridad === 'Crítica' ? 'chip-discrepancy' : (q.prioridad === 'Alta' ? 'chip-special' : '');

                                    return `
                                        <tr>
                                            <td><strong class="mono">${q.id}</strong></td>
                                            <td>
                                                <strong>${q.tema}</strong>
                                                <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
                                                    ${q.resumen}
                                                </p>
                                            </td>
                                            <td><span class="chip">${q.tipo}</span></td>
                                            <td><span class="chip ${prioCls}">${q.prioridad}</span></td>
                                            <td style="font-size: 0.8rem; color: var(--blue-deep-navy);">
                                                <strong>${q.bloquea}</strong>
                                            </td>
                                            <td class="mono">
                                                ${q.fechaLimite}
                                                ${appState.modo === 'analista' && vencida
                                                    ? '<br><span class="chip chip-discrepancy">Vencida a corte</span>'
                                                    : ''}
                                            </td>
                                            <td style="font-size: 0.8rem;">${q.responsable}</td>
                                            <td>
                                                <span class="status-pill status-pendiente-aclaracion">
                                                    <span class="status-icon">§</span> Abierta
                                                </span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        }
    };

    window.Aclaraciones = Aclaraciones;

})(window);
