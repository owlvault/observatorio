/**
 * ise_incentivos.js — Vista 4: Eficiencia e Incentivos (ISE Oficial CRA)
 * Cumple RF-NMTPP-12, RF-NMTPP-13, RF-NMTPP-14, INV-04, INV-10, ADR-0015
 *
 * Regla de Oro / ADR-0015: El ISE solo se muestra tal como lo publica la CRA.
 * El Observatorio no lo calcula, no lo estima, no lo proyecta y NO LO ORDENA:
 * los prestadores van en el orden del registro, sin posiciones ni velocímetros.
 * Pesos, umbral, pisos y porcentajes de incentivo salen de CRA_NMTPP_PARAMS.
 */

(function(window) {
    'use strict';

    const DIMS = [
        { key: 'tecnica', campo: 'dim_tecnica', nombre: 'Técnica', color: '#1664b0' },
        { key: 'administrativa', campo: 'dim_administrativa', nombre: 'Administrativa', color: '#38bdf8' },
        { key: 'financiera', campo: 'dim_financiera', nombre: 'Financiera', color: '#0a2f55' }
    ];

    const NOMBRE_IND = {
        macromedicion: 'Medición en planta',
        reporte_y_calidad_agua_potable: 'Reporte y calidad del agua',
        continuidad: 'Horas de servicio',
        micromedicion_efectiva: 'Medidores en viviendas',
        atencion_pqr_acueducto: 'Atención a reclamos (PQR)',
        costo_administrativo_mas_operativo_promedio_por_suscriptor: 'Costo por suscriptor'
    };

    // Tipo de incentivo en los datos → clave en los parámetros
    const TIPO_PARAM = { perdidas: 'perdidas', continuidad: 'continuidad', micromedicion: 'micromedicion', asociatividad: 'asociatividad', buen_gobierno: 'buen_gobierno', reporte: 'reporte_informacion' };
    const NOMBRE_INC = { continuidad: 'Continuidad', perdidas: 'Control de pérdidas', micromedicion: 'Micromedición', asociatividad: 'Asociatividad', buen_gobierno: 'Buen gobierno', reporte_informacion: 'Reporte de información' };

    const IseIncentivos = {
        selectedPrestadorId: null,

        selectPrestador(providerId) {
            this.selectedPrestadorId = this.selectedPrestadorId === providerId ? null : providerId;
            this.render('tab-ise-incentivos');
            const det = document.getElementById('ise-detalle');
            if (this.selectedPrestadorId && det && det.firstElementChild) {
                det.scrollIntoView({ behavior: window.CineKit && window.CineKit.reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
            }
            const btn = document.querySelector(`#tab-ise-incentivos [data-ise="${providerId}"]`);
            if (btn) btn.focus({ preventScroll: true });
        },

        // Porcentaje de incentivo del año de aplicación: anio_3, anio_4 o anio_5_y_siguientes
        pctIncentivo(porcentajes, anioTarifario) {
            if (!porcentajes) return null;
            if (porcentajes['anio_' + anioTarifario] !== undefined) return porcentajes['anio_' + anioTarifario];
            return anioTarifario >= 5 ? porcentajes.anio_5_y_siguientes : null;
        },

        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const data = window.CRA_NMTPP_DATA;
            const params = window.CRA_NMTPP_PARAMS;
            const U = window.CxPP;
            const K = window.CineKit;
            if (!data || !params || !U) {
                container.innerHTML = '<div class="notice-box warning">Datos no disponibles</div>';
                return;
            }

            const P = params.ise || {};
            const pesos = P.ponderaciones_acueducto || {};
            const umbral = P.umbral_eficiencia ? P.umbral_eficiencia.ise_menor_igual : null;
            const pisos = P.transicion_piso_reconocimiento || [];
            const inc = params.incentivos_s1 || {};
            const h06 = (params.calendario || []).find(h => h.codigo === 'H-06');

            // Solo prestadores del Segmento 1, en el orden del registro (nunca por puntaje)
            const prestadoresS1 = data.prestadores.filter(p => p.segmento_vigente === 'S1');
            const registros = [];
            prestadoresS1.forEach(p => (p.ise || []).forEach(r => registros.push(r)));
            const conValor = registros.filter(r => !r.no_aplica_motivo);
            const anioAplic = conValor.length ? conValor[0].anio_aplicacion : (pisos.find(x => x.ise_aplica) || {}).calendario;
            const anioEval = conValor.length ? conValor[0].anio_evaluado : null;
            const anioTar = anioAplic && params.marco_tarifario ? anioAplic - params.marco_tarifario.anio_tarifario_1 + 1 : null;
            const pisoAnio = pisos.find(x => x.calendario === anioAplic);

            // Publicación (ISE-02): la primera fecha de publicación frente al límite
            let pub = null;
            registros.forEach(r => { if (r.fecha_publicacion && (!pub || r.fecha_publicacion < pub)) pub = r.fecha_publicacion; });
            const diasAntes = pub && h06 ? U.dias(pub, h06.fecha) : null;

            // Incentivos reconocidos por tipo (INC-01)
            const conteo = {};
            prestadoresS1.forEach(p => (p.incentivos || []).forEach(i => {
                const k = TIPO_PARAM[i.tipo] || i.tipo;
                conteo[k] = (conteo[k] || 0) + 1;
            }));
            const tipos = [];
            ['cmog', 'cma'].forEach(comp => {
                const c = inc[comp];
                if (!c || !c.incentivos) return;
                Object.keys(c.incentivos).forEach(k => tipos.push({
                    k, comp: comp.toUpperCase(), n: conteo[k] || 0,
                    pct: this.pctIncentivo(c.porcentajes, anioTar),
                    bloqueo: c.incentivos[k].bloqueado_por || null
                }));
            });
            const conEstimulo = prestadoresS1.filter(p => p.incentivos && p.incentivos.length > 0).length;
            const nS1 = prestadoresS1.length;
            const sel = prestadoresS1.find(p => p.provider_id === this.selectedPrestadorId) || null;
            const vigencia = anioAplic && anioEval ? `Aplica ${anioAplic} — evaluado con ${anioEval}` : '';

            const barraPesos = DIMS.map(d => pesos[d.key] ? `<span style="flex:${pesos[d.key].peso};background:${d.color}"><em><i>${d.nombre}</i><b>${U.num(pesos[d.key].peso, 1)} %</b></em></span>` : '').join('');

            let html = `
                ${U.cabecera('Eficiencia · ISE oficial',
                    'El ISE, <span class="cx-grad">tal como lo publica</span> la CRA',
                    'Índice Sintético de Eficiencia — publicado por la CRA (Res. 1038 art. 2.1.1.1.2.2.7.1). El Observatorio no lo calcula.')}
                <p class="cxpp-meta-line"><span class="chip chip-simulation">Publicación sintética</span> Sin posiciones, sin puntajes propios y sin ordenar a los prestadores (ADR-0015).</p>

                <div class="cx-bento cxpp-bento cxpp-mt">
                    <article class="cx-tile cx-tile-deep cx-on-dark cx-span-4">
                        <span class="cx-tile-label">Cómo se compone · acueducto</span>
                        <h3 class="cx-display-3">Tres dimensiones, <span class="cx-grad-light">pesos fijos</span></h3>
                        <div class="cxpp-weights" data-cx-anim role="img" aria-label="Pesos del ISE: ${DIMS.map(d => pesos[d.key] ? `${d.nombre} ${U.num(pesos[d.key].peso, 1)} %` : '').join(', ')}">${barraPesos}</div>
                        <ul class="cx-legend cxpp-weights-legend" aria-hidden="true">${DIMS.map(d => pesos[d.key] ? `<li><span class="cx-key" style="background:${d.color}"></span>${d.nombre} <b>${U.num(pesos[d.key].peso, 1)} %</b></li>` : '').join('')}</ul>
                        <ol class="cxpp-steps">
                            <li><b>ISE</b><span>Suma ponderada de las tres dimensiones</span></li>
                            <li><b>${umbral !== null ? U.num(umbral, 0) + ' %' : '—'}</b><span>Si el ISE no supera el umbral, se reconoce el umbral</span></li>
                            <li><b>${pisoAnio ? U.num(pisoAnio.piso_pct, 0) + ' %' : '—'}</b><span>Piso de transición ${anioAplic || ''}</span></li>
                            <li><b>+ %</b><span>Incentivos sobre CMOG y CMA</span></li>
                        </ol>
                        <details class="cx-more cx-tile-foot"><summary>Nota técnica</summary><p>El Observatorio no puede replicar este índice mientras la CRA no publique la normalización (Q-NMTPP-04). Los prestadores de zonas insulares están exentos (${U.esc(P.exencion || '')}).</p></details>
                    </article>

                    <article class="cx-tile cx-span-2">
                        <span class="cx-tile-label">NMTPP-ISE-02 · Oportunidad</span>
                        ${pub ? `
                            <div class="cx-insight-figure"><span class="cx-insight-num">${U.num(diasAntes, 0)}</span> días antes del límite</div>
                            <p class="cx-tile-note">Publicado el <b class="cxpp-strong">${U.fecha(pub)}</b>; límite ${h06 ? U.fecha(h06.fecha) : '—'} (${P.publicacion ? P.publicacion.anticipacion_minima_meses : '—'} meses antes del año tarifario).</p>
                        ` : '<p class="cx-tile-note">Sin publicación registrada.</p>'}
                    </article>

                    <article class="cx-tile cx-span-2">
                        <span class="cx-tile-label">Piso de reconocimiento</span>
                        <div class="cx-insight-figure"><span class="cx-insight-num">${pisoAnio ? U.num(pisoAnio.piso_pct, 0) : '—'}</span> % en ${anioAplic || '—'}</div>
                        <div class="cx-tile-foot cxpp-colsfoot">
                            ${K ? K.columns(pisos.map(x => ({ v: x.piso_pct, label: String(x.calendario), hi: x.calendario === anioAplic })), { height: 92, label: 'Piso por año: ' + pisos.map(x => `${x.calendario}: ${x.piso_pct} %`).join(', ') }) : ''}
                        </div>
                    </article>

                    <article class="cx-tile cx-span-2">
                        <span class="cx-tile-label">Con al menos un estímulo</span>
                        <div class="cxpp-ringrow">
                            <div class="cxpp-ringbox cxpp-ringbox-sm">
                                ${K ? K.ring(nS1 ? conEstimulo / nS1 : 0, { size: 128, stroke: 13, label: `${conEstimulo} de ${nS1} prestadores del S1 con al menos un incentivo` }) : ''}
                                <div class="cxpp-ringnum cxpp-ringnum-sm"><span class="cx-grad">${conEstimulo}</span><small>/${nS1}</small></div>
                            </div>
                        </div>
                        <p class="cx-tile-note cx-tile-foot">${vigencia} (INV-10).</p>
                    </article>

                    <article class="cx-tile cx-span-2 cxpp-tile-auto">
                        <span class="cx-tile-label">NMTPP-INC-02 · Reportes al SUI</span>
                        <p class="cxpp-bigstate cxpp-bigstate-ink"><span aria-hidden="true">ⓘ</span> Sin fuente confirmada</p>
                        <p class="cx-tile-note">Falta la lista de reportes exigibles de la SSPD (Q-NMTPP-12).</p>
                    </article>

                    <article class="cx-tile cx-span-6 cxpp-tile-auto">
                        <span class="cx-tile-label">NMTPP-INC-01 · Incentivos reconocidos por tipo · ${vigencia}</span>
                        <ul class="cxpp-inclist">
                            ${tipos.map(t => `
                                <li>
                                    <span class="cxpp-inc-name">${NOMBRE_INC[t.k] || t.k}<small>${t.comp}${t.pct !== null && t.pct !== undefined ? ' · +' + U.num(t.pct) + ' %' : ''}${t.bloqueo ? ' · ' + t.bloqueo : ''}</small></span>
                                    ${K ? K.meter(nS1 ? t.n / nS1 : 0) : ''}
                                    <b>${t.n} <small>de ${nS1}</small></b>
                                </li>`).join('')}
                        </ul>
                    </article>
                </div>

                ${U.cabecera('Publicación', 'Prestador por prestador, <span class="cx-grad">sin posiciones</span>',
                    'En el orden del registro. Abra una fila para ver la descomposición del cálculo.')}
                <div class="dashboard-panel cxpp-chartpanel">
                    <div class="data-table-container">
                        <table class="data-table cxpp-isetable" aria-label="Resultados oficiales del ISE publicados por la CRA">
                            <thead>
                                <tr>
                                    <th class="non-sortable">Prestador</th>
                                    <th class="non-sortable">ISE publicado y su descomposición</th>
                                    ${DIMS.map(d => `<th class="non-sortable">${d.nombre}${pesos[d.key] ? ` (${U.num(pesos[d.key].peso, 1)} %)` : ''}</th>`).join('')}
                                    <th class="non-sortable">Eficiencia reconocida</th>
                                    <th class="non-sortable">Incentivos</th>
                                    <th class="non-sortable">Con incentivos</th>
                                    <th class="non-sortable">Vigencia (INV-10)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${prestadoresS1.map(p => this.renderFila(p, pesos, U)).join('')}
                            </tbody>
                        </table>
                    </div>
                    <p class="chart-caption">Fuente: publicación de la CRA · DATOS SINTÉTICOS DE PROTOTIPO</p>
                </div>
                <div id="ise-detalle" aria-live="polite">${sel && sel.ise && sel.ise[0] && !sel.ise[0].no_aplica_motivo ? this.renderDetalleCascada(sel, sel.ise[0]) : ''}</div>
            `;

            container.innerHTML = html;
            U.animar(container);
        },

        renderFila(p, pesos, U) {
            const r = p.ise && p.ise.length > 0 ? p.ise[0] : null;
            const vig = r ? `Aplica ${r.anio_aplicacion} — evaluado con ${r.anio_evaluado}` : '';
            const nombre = `<strong>${U.esc(p.nombre)}</strong><br><span class="chip">${p.subsegmento_vigente}</span>`;

            if (r && r.no_aplica_motivo) {
                return `<tr><td>${nombre} <span class="chip chip-special">No aplica (${U.esc(r.no_aplica_motivo)})</span></td>
                    <td colspan="7" class="cxpp-muted">Exento por particularidades insulares (art. 2.1.1.1.2.2.7.1)</td>
                    <td><span class="chip">${vig}</span></td></tr>`;
            }
            if (!r) {
                return `<tr><td>${nombre}</td><td colspan="8" class="cxpp-muted">Sin publicación oficial de la CRA</td></tr>`;
            }

            const abierto = this.selectedPrestadorId === p.provider_id;
            const aportes = DIMS.map(d => ({ d, v: pesos[d.key] ? r[d.campo] * pesos[d.key].peso / 100 : 0 }));
            return `
                <tr class="${abierto ? 'selected' : ''}">
                    <td>
                        <button type="button" class="cxpp-linkbtn" data-ise="${p.provider_id}" aria-expanded="${abierto}" aria-controls="ise-detalle" onclick="IseIncentivos.selectPrestador('${p.provider_id}')">${U.esc(p.nombre)}</button><br>
                        <span class="chip">${p.subsegmento_vigente}</span>
                    </td>
                    <td>
                        <span class="mono font-bold">${U.num(r.ise_calculado, 2)}</span>
                        <span class="cxpp-decomp" role="img" aria-label="Aportes ponderados: ${aportes.map(a => `${a.d.nombre} ${U.num(a.v, 1)}`).join(', ')}">
                            ${aportes.map(a => `<i style="width:${a.v.toFixed(2)}%;background:${a.d.color}"></i>`).join('')}
                        </span>
                    </td>
                    ${DIMS.map(d => `<td class="mono">${U.num(r[d.campo], 2)}</td>`).join('')}
                    <td><span class="mono font-bold">${U.num(r.pct_eficiencia_aplicable)} %</span><br><small class="cxpp-muted">piso ${U.num(r.piso_anio)} %</small></td>
                    <td>${p.incentivos && p.incentivos.length ? p.incentivos.map(i => `<span class="chip chip-incentive">${NOMBRE_INC[TIPO_PARAM[i.tipo]] || i.tipo} +${U.num(i.porcentaje)} %</span>`).join(' ') : '<span class="cxpp-muted">Ninguno</span>'}</td>
                    <td class="mono">CMOG ${U.num(r.ise_con_incentivos_cmog)} %<br>CMA ${U.num(r.ise_con_incentivos_cma)} %</td>
                    <td><span class="chip chip-simulation">${vig}</span></td>
                </tr>
            `;
        },

        renderDetalleCascada(p, ise) {
            const U = window.CxPP;
            const params = window.CRA_NMTPP_PARAMS || {};
            const P = params.ise || {};
            const pesos = P.ponderaciones_acueducto || {};
            const umbral = P.umbral_eficiencia ? P.umbral_eficiencia.ise_menor_igual : null;
            const ind = ise.indicadores || {};
            const conUmbral = umbral !== null ? Math.max(ise.ise_calculado, umbral) : ise.ise_calculado;
            const pasos = [
                ...DIMS.map(d => ({ l: `${d.nombre} × ${pesos[d.key] ? U.num(pesos[d.key].peso, 1) : '—'} %`, v: pesos[d.key] ? ise[d.campo] * pesos[d.key].peso / 100 : null })),
                { l: 'ISE publicado', v: ise.ise_calculado, hi: true },
                { l: `Umbral: máx(ISE, ${umbral !== null ? U.num(umbral, 0) : '—'})`, v: conUmbral },
                { l: `Piso del año: máx(umbral, ${U.num(ise.piso_anio)})`, v: ise.pct_eficiencia_aplicable, hi: true },
                { l: 'Con incentivos · CMOG', v: ise.ise_con_incentivos_cmog },
                { l: 'Con incentivos · CMA', v: ise.ise_con_incentivos_cma }
            ];
            return `
                <div class="cxpp-isedet">
                    <div class="cxpp-isedet-head">
                        <h4>Descomposición · ${U.esc(p.nombre)}</h4>
                        <button type="button" class="cx-link" onclick="IseIncentivos.selectPrestador('${p.provider_id}')">Cerrar</button>
                        <span class="chip">Acto: ${U.esc(ise.acto_ref)}</span>
                    </div>
                    <div class="cxpp-isedet-grid">
                        <div>
                            <h5>Indicadores normalizados, por dimensión</h5>
                            ${DIMS.map(d => pesos[d.key] ? `
                                <div class="cxpp-isedim">
                                    <span class="cxpp-isedim-t"><i style="background:${d.color}"></i>${d.nombre} · ${U.num(pesos[d.key].peso, 1)} %</span>
                                    ${Object.keys(pesos[d.key].indicadores || {}).map(k => `
                                        <div class="cxpp-isebar">
                                            <span>${NOMBRE_IND[k] || k} <small>peso ${U.num(pesos[d.key].indicadores[k], 1)} %</small></span>
                                            ${window.CineKit ? window.CineKit.meter((ind[k] || 0) / 100) : ''}
                                            <b>${ind[k] !== undefined ? U.num(ind[k], 1) : '—'}</b>
                                        </div>`).join('')}
                                </div>` : '').join('')}
                        </div>
                        <div>
                            <h5>Pasos de liquidación (art. 2.1.1.1.2.2.7.2)</h5>
                            <ol class="cxpp-cascade">
                                ${pasos.map(s => `<li class="${s.hi ? 'hi' : ''}"><span>${s.l}</span>${window.CineKit ? window.CineKit.meter(s.v !== null ? s.v / 100 : 0) : ''}<b>${s.v !== null ? U.num(s.v, 2) : '—'}</b></li>`).join('')}
                            </ol>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    window.IseIncentivos = IseIncentivos;

})(window);
