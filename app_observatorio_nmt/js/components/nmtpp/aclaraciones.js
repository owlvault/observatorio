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

        filtroPrioridad: 'todas',

        setPrioridad(p) {
            this.filtroPrioridad = p;
            // Se ocultan con hidden; las casillas no se desmontan
            document.querySelectorAll('#tab-aclaraciones .cxpp-q').forEach(el => {
                el.hidden = p !== 'todas' && el.getAttribute('data-prio') !== p;
            });
            document.querySelectorAll('#tab-aclaraciones .cxpp-seg button').forEach(b => {
                b.setAttribute('aria-pressed', String(b.getAttribute('data-prio') === p));
            });
        },

        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const U = window.CxPP;
            const appState = window.AppNMTPP || { modo: 'analista' };
            const fechaCorte = (window.CRA_NMTPP_DATA && window.CRA_NMTPP_DATA._meta) ? window.CRA_NMTPP_DATA._meta.fecha_corte_simulada : appState.fechaCorte;
            const analista = appState.modo === 'analista';
            const qs = this.ACLARACIONES;
            const prios = ['Crítica', 'Alta', 'Media'];
            const n = {};
            prios.forEach(p => { n[p] = qs.filter(q => q.prioridad === p).length; });
            const vencidas = qs.filter(q => q.fechaLimite < fechaCorte).length;
            const claseP = p => (p === 'Crítica' ? 'c' : (p === 'Alta' ? 'a' : 'm'));
            const forma = { 'Crítica': '◆', 'Alta': '▲', 'Media': '●' };

            const html = `
                ${U.cabecera('Aclaraciones normativas · RF-NMTPP-18',
                    `${qs.length} preguntas abiertas <span class="cx-grad">frenan indicadores</span>`,
                    'Mientras no hay respuesta, el indicador se marca "pendiente de aclaración" o "sin fuente confirmada", nunca con un valor supuesto.')}

                <div class="cxpp-controls">
                    <span class="cxpp-controls-label" id="acl-sel-label">Prioridad</span>
                    <div class="cx-seg cxpp-seg" role="group" aria-labelledby="acl-sel-label">
                        <button type="button" data-prio="todas" aria-pressed="${this.filtroPrioridad === 'todas'}" onclick="Aclaraciones.setPrioridad('todas')">Todas <b class="cxpp-cnt">${qs.length}</b></button>
                        ${prios.map(p => `<button type="button" data-prio="${p}" aria-pressed="${this.filtroPrioridad === p}" onclick="Aclaraciones.setPrioridad('${p}')"><span aria-hidden="true" class="cxpp-prio-ic cxpp-prio-ic-${claseP(p)}">${forma[p]}</span> ${p} <b class="cxpp-cnt">${n[p]}</b></button>`).join('')}
                    </div>
                    ${analista && vencidas ? `<span class="cxpp-venc analyst-only"><span aria-hidden="true">✕</span> ${vencidas} con fecha útil vencida al corte</span>` : ''}
                </div>

                <ul class="cxpp-qgrid">
                    ${qs.map(q => {
                        const vencida = q.fechaLimite < fechaCorte;
                        return `
                        <li class="cxpp-q cxpp-q-${claseP(q.prioridad)}" data-prio="${q.prioridad}" ${this.filtroPrioridad !== 'todas' && this.filtroPrioridad !== q.prioridad ? 'hidden' : ''}>
                            <div class="cxpp-q-top">
                                <span class="cxpp-hito-code">${q.id}</span>
                                <span class="cxpp-q-prio"><span aria-hidden="true">${forma[q.prioridad] || '●'}</span> ${q.prioridad}</span>
                            </div>
                            <h3 class="cxpp-q-title">${U.esc(q.tema)}</h3>
                            <div class="cxpp-q-block">
                                <span class="cxpp-q-lbl">Bloquea</span>
                                <strong>${U.esc(q.bloquea)}</strong>
                            </div>
                            <div class="cxpp-q-foot">
                                <span class="status-pill status-pendiente-aclaracion"><span class="status-icon" aria-hidden="true">§</span> Abierta</span>
                                <span class="cxpp-q-date">Fecha útil ${U.fecha(q.fechaLimite)}</span>
                                ${analista && vencida ? '<span class="chip chip-discrepancy analyst-only">Vencida a corte</span>' : ''}
                            </div>
                            <details class="cx-more"><summary>Detalle</summary><p><strong>${U.esc(q.tipo)}.</strong> ${U.esc(q.resumen)} <em>Responsable: ${U.esc(q.responsable)}.</em></p></details>
                        </li>`;
                    }).join('')}
                </ul>
                <p class="cxpp-meta-line cxpp-mt">Fuente: <span class="mono">specs/aclaraciones-regulatorias-nmtpp.md</span> (tabla de resumen).</p>

                <div class="cxpp-chartbar">${U.btnTabla('tbl-aclaraciones')}</div>
                <div id="tbl-aclaraciones" hidden>
                    <div class="data-table-container">
                        <table class="data-table" aria-label="Matriz de aclaraciones regulatorias">
                            <thead>
                                <tr><th>Código</th><th>Consulta</th><th>Naturaleza</th><th>Prioridad</th><th>Bloquea</th><th>Fecha útil</th><th>Responsable</th><th>Estado</th></tr>
                            </thead>
                            <tbody>
                                ${qs.map(q => `
                                    <tr>
                                        <td class="mono">${q.id}</td>
                                        <td><strong>${U.esc(q.tema)}</strong></td>
                                        <td>${U.esc(q.tipo)}</td>
                                        <td>${q.prioridad}</td>
                                        <td>${U.esc(q.bloquea)}</td>
                                        <td class="mono">${q.fechaLimite}${analista && q.fechaLimite < fechaCorte ? ' (vencida a corte)' : ''}</td>
                                        <td>${U.esc(q.responsable)}</td>
                                        <td>Abierta</td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = html;
            U.animar(container);
        }
    };

    window.Aclaraciones = Aclaraciones;

})(window);
