/**
 * nivel_servicio.js — Vista 3: Nivel de Servicio Frente a Metas Regulatorias
 * Cumple RF-NMTPP-06..10, RF-NMTPP-16, INV-03, INV-05, INV-06, INV-07, INV-09
 * Las metas salen del motor de estados (que lee CRA_NMTPP_PARAMS); aquí no hay metas literales.
 */

(function(window) {
    'use strict';

    const NivelServicio = {
        currentIndicator: 'MIC',
        charts: {},

        INDICADORES: [
            { code: 'MIC', nombre: 'Micromedición efectiva', corto: 'Micromedición', unidad: '%', aplica: 'S1, S2', pregunta: '¿Qué porcentaje de los usuarios cuentan con micromedidor activo y lecturas periódicas de su consumo real?' },
            { code: 'MAC', nombre: 'Macromedición efectiva', corto: 'Macromedición', unidad: '%', aplica: 'S1, S2', pregunta: '¿Se mide y registra sistemáticamente el volumen total de agua tratada suministrada a la red de distribución?' },
            { code: 'CON', nombre: 'Continuidad del suministro', corto: 'Continuidad', unidad: 'h/día o %', aplica: 'S1, S2', pregunta: '¿Cuántas horas de servicio continuo y presión adecuada reciben las familias y establecimientos al día?' },
            { code: 'COB', nombre: 'Cobertura', corto: 'Cobertura', unidad: '%', aplica: 'S1', pregunta: '¿Qué proporción de las viviendas y predios dentro del área de servicio tienen conexión efectiva a la red?' },
            { code: 'PER', nombre: 'Pérdidas de agua (IPUF)', corto: 'Pérdidas', unidad: 'm³/susc/mes', aplica: 'S1', pregunta: '¿Cuánto volumen de agua potable tratada se pierde al mes en tuberías o fugas por cada usuario conectado?' },
            { code: 'PSH', nombre: 'Plan de Sostenibilidad Hídrica', corto: 'Plan hídrico', unidad: 'Binario', aplica: 'S1-1', pregunta: '¿Dispone el prestador de instrumentos vigentes para la protección y gobernanza de la cuenca abastecedora?' },
            { code: 'CAL', nombre: 'Calidad del agua (IRCA)', corto: 'Calidad (IRCA)', unidad: '%', aplica: 'S1, S2', pregunta: '¿Cuál es el nivel de riesgo sanitario del agua suministrada a la población según los parámetros de la norma?' }
        ],

        // Clave del observado en los datos de cada APS
        CLAVE_OBS: { MIC: 'MICROMEDICION', MAC: 'MACROMEDICION', CON: 'CONTINUIDAD', COB: 'COBERTURA', PER: 'IPUF', PSH: 'PSH' },

        setIndicator(code) {
            this.currentIndicator = code;
            this.render('tab-nivel-servicio');
            const btn = document.querySelector(`#tab-nivel-servicio .cxpp-seg button[data-ind="${code}"]`);
            if (btn) btn.focus({ preventScroll: true });
        },

        nombreCorto(nombre) {
            return nombre.replace('Empresa de Servicios Públicos Sintética ', 'ESP ').replace('Empresas Públicas Sintéticas ', 'EEPP ').replace('Aguas Sintéticas ', 'Aguas ');
        },

        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const data = window.CRA_NMTPP_DATA;
            const params = window.CRA_NMTPP_PARAMS;
            const U = window.CxPP;
            if (!data || !params || !window.MotorEstados || !U) {
                container.innerHTML = '<div class="notice-box warning">Datos no disponibles</div>';
                return;
            }

            // Se destruyen las gráficas anteriores antes de reemplazar el DOM
            Object.keys(this.charts).forEach(k => { try { this.charts[k].destroy(); } catch (e) { /* lienzo ya retirado */ } });
            this.charts = {};

            const appState = window.AppNMTPP || { modo: 'analista', banderas: {}, filtros: {} };
            const banderas = appState.banderas || {};
            const f = appState.filtros || {};
            const filtroSub = f.subsegmento || 'todos';
            const filtroSeg = f.segmento || 'todos';
            const filtroReg = f.regimen_especial || 'todos';
            const filtroTxt = (f.busqueda || '').toLowerCase().trim();

            const evaluados = window.MotorEstados.evaluarTodo(2027, banderas);
            const indice = {};
            evaluados.forEach(e => { indice[`${e.provider_id}|${e.service_area_id}|${e.indicator_code}`] = e; });

            const indActual = this.INDICADORES.find(i => i.code === this.currentIndicator) || this.INDICADORES[0];
            const esCal = indActual.code === 'CAL';

            let html = `
                ${U.cabecera('Nivel de servicio · año 2027',
                    esCal ? 'Calidad del agua: <span class="cx-grad">sin fuente confirmada</span>'
                          : `${indActual.nombre}, <span class="cx-grad">frente a su meta</span>`,
                    indActual.pregunta)}

                <div class="cxpp-controls">
                    <span class="cxpp-controls-label" id="ns-sel-label">Indicador</span>
                    <div class="cx-seg cxpp-seg" role="group" aria-labelledby="ns-sel-label">
                        ${this.INDICADORES.map(ind => `
                            <button type="button" data-ind="${ind.code}" aria-pressed="${ind.code === indActual.code}" onclick="NivelServicio.setIndicator('${ind.code}')"><b>${ind.code}</b>${ind.corto}</button>
                        `).join('')}
                    </div>
                </div>
                <p class="cxpp-meta-line">Aplica a <b>${indActual.aplica}</b> · Unidad <b>${indActual.unidad}</b></p>
                ${U.leyendaLegal()}
            `;

            // Caso especial CAL (IRCA): INV-05, ningún valor graficado
            if (esCal) {
                html += this.renderCal(params, evaluados, U);
                container.innerHTML = html;
                U.animar(container);
                return;
            }

            let subsegmentos = Object.keys(data.adopcion_esperada || {});
            if (filtroSeg === 'S1') subsegmentos = subsegmentos.filter(s => s.startsWith('S1'));
            if (filtroSeg === 'S2') subsegmentos = subsegmentos.filter(s => s.startsWith('S2'));
            if (filtroSub !== 'todos') subsegmentos = subsegmentos.filter(s => s === filtroSub);

            // Filtros de régimen especial y búsqueda, a nivel de APS
            const pasaAps = (p, a) => {
                const especial = a.condiciones_especiales && a.condiciones_especiales.length > 0;
                if (filtroReg === 'con_condicion' && !especial) return false;
                if (filtroReg === 'sin_condicion' && especial) return false;
                if (filtroTxt && !(`${p.nombre} ${p.provider_id} ${a.municipio} ${a.service_area_id} ${p.departamento ? p.departamento.nombre : ''}`.toLowerCase().includes(filtroTxt))) return false;
                return true;
            };

            const paneles = [];
            subsegmentos.forEach(sub => {
                const prestadoresSub = data.prestadores.filter(p => p.subsegmento_vigente === sub);
                const items = [];
                for (const p of prestadoresSub) {
                    const code = `NMTPP-${p.segmento_vigente}-${indActual.code}`;
                    for (const a of p.aps) {
                        if (!pasaAps(p, a)) continue;
                        const ev = indice[`${p.provider_id}|${a.service_area_id}|${code}`];
                        if (!ev) continue;
                        const clave = this.CLAVE_OBS[indActual.code];
                        const lb = a.linea_base && a.linea_base[clave] !== undefined ? a.linea_base[clave] : null;
                        items.push({ prestador: p, aps: a, estado: ev, lb, obs: ev.valor_observado });
                    }
                }
                // PSH solo aplica a S1-1: los demás subsegmentos quedan en "no aplica" y no se dibujan
                if (!items.length || items.every(it => it.estado.estado === 'no aplica')) return;
                paneles.push({ sub, prestadoresSub, items });
            });

            if (paneles.length > 1) {
                html += `<p class="cxpp-nocomp cxpp-nocomp-block"><span aria-hidden="true">≠</span> <span><strong>Paneles independientes:</strong> las metas, horizontes y fórmulas cambian por subsegmento y régimen; no se comparan prestadores de subsegmentos distintos (INV-06 / RN-NMTPP-02).</span></p>`;
            }

            if (indActual.code === 'CON' && !banderas.continuidad_equivalencia_24h) {
                html += `<div class="cxpp-qnote"><span class="status-pill status-pendiente-aclaracion"><span class="status-icon" aria-hidden="true">§</span> Meta pendiente de aclaración normativa (Q-NMTPP-01, Q-NMTPP-02)</span>
                    <details class="cx-more"><summary>Por qué</summary><p>Se publican los valores observados 2027 y la línea base sin evaluar cierre de brecha, por la discrepancia de unidad del Anexo 6.2.1.10 y la definición de la línea base. En modo analista puede activar el interruptor superior para simular la aclaración de equivalencia de 24 horas (solo prototipo).</p></details></div>`;
            }

            if (!paneles.length) {
                html += `<div class="cxpp-empty"><strong>Sin áreas de prestación con los filtros actuales.</strong><button type="button" class="cx-link" onclick="AppNMTPP.resetFiltros()">Restablecer filtros</button></div>`;
            }

            paneles.forEach(pn => { html += this.renderPanel(pn, indActual, params, U); });

            container.innerHTML = html;
            U.animar(container);

            // Gráficas tras montar el DOM
            setTimeout(() => {
                paneles.forEach(pn => {
                    const canvas = document.getElementById(`chart-sub-${pn.sub}`);
                    if (canvas) this.renderSubsegmentChart(pn, canvas);
                });
            }, 50);
        },

        // Escala del medidor según la unidad del indicador
        escala(unidad, items, ref) {
            if (unidad === 'h/día') return 24;
            if (unidad === 'm3/suscriptor/mes') {
                const vals = items.map(i => i.obs).concat(items.map(i => i.lb), items.map(i => i.estado.meta_aplicada), [ref]).filter(v => typeof v === 'number');
                return Math.max(...vals, 1) * 1.15;
            }
            return 100;
        },

        renderPanel(pn, ind, params, U) {
            const { sub, prestadoresSub, items } = pn;
            const tableId = `tbl-sub-${sub}`;
            // La unidad puede variar por APS (continuidad: h/día o %); escala y rótulo por fila
            const unidadDe = it => it.estado.unidad || ind.unidad;
            const txtUnidad = u => (u === 'm3/suscriptor/mes' ? 'm³/susc/mes' : (u === 'binario' ? '%' : u));
            const ipuf = params.metas_acueducto?.S1?.indicadores?.IPUF?.estandar;
            const ref = ind.code === 'PER' && ipuf ? ipuf.valor : null;
            const maxDe = {};
            items.forEach(it => { const u = unidadDe(it); if (maxDe[u] === undefined) maxDe[u] = this.escala(u, items.filter(x => unidadDe(x) === u), ref); });
            const unidadTxt = txtUnidad(unidadDe(items[0]));
            pn.unidadChart = this.unidadDominante(items.map(unidadDe));
            const mixtas = Object.keys(maxDe).length > 1;

            const conteo = {};
            items.forEach(it => { conteo[it.estado.estado] = (conteo[it.estado.estado] || 0) + 1; });

            const filas = items.map(it => {
                const e = it.estado;
                const ausente = it.obs === null || it.obs === undefined;
                const meta = e.meta_aplicada;
                const st = (window.CxPP.ESTADOS[e.estado]) || { cls: '', icon: '○', corto: e.estado };
                const fr = v => Math.max(0, Math.min(1, v / maxDe[unidadDe(it)]));
                return `
                    <li class="cxpp-aps">
                        <button type="button" class="cxpp-aps-name" onclick="NivelServicio.abrirTrayectoria('${it.prestador.provider_id}', '${it.aps.service_area_id}', '${ind.code}')" aria-label="Abrir ficha de ${U.esc(it.prestador.nombre)}">
                            ${U.esc(this.nombreCorto(it.prestador.nombre))}
                            <small>${U.esc(it.aps.municipio)}${it.aps.condiciones_especiales && it.aps.condiciones_especiales.length ? ' · ' + it.aps.condiciones_especiales.join(', ') : ''}</small>
                        </button>
                        <div class="cx-meter cxpp-meter ${ausente ? 'is-absent' : ''}" data-cx-anim aria-hidden="true">
                            ${ausente ? '' : `<i style="width:${(fr(it.obs) * 100).toFixed(1)}%"></i>`}
                            ${typeof it.lb === 'number' ? `<u class="cxpp-lb" style="left:${(fr(it.lb) * 100).toFixed(1)}%"></u>` : ''}
                            ${typeof meta === 'number' ? `<b style="left:${(fr(meta) * 100).toFixed(1)}%" data-label=""></b>` : ''}
                        </div>
                        <span class="cxpp-aps-val"><span>${ausente ? 'Sin dato' : `${U.num(it.obs)} <small>${txtUnidad(unidadDe(it))}</small>`}</span>${typeof meta === 'number' ? `<small class="cxpp-aps-meta">meta ${U.num(meta)}${e.origen_meta === 'declarada' ? ' (declarada)' : ''}</small>` : ''}</span>
                        <span class="cxpp-aps-st"><span class="status-pill ${st.cls}"><span class="status-icon" aria-hidden="true">${st.icon}</span> ${st.corto}</span>${e.marca_simulacion ? `<span class="chip chip-simulation">${e.marca_simulacion}</span>` : ''}</span>
                    </li>`;
            }).join('');

            return `
                <section class="cxpp-sub" id="panel-sub-${sub}" aria-labelledby="h-sub-${sub}">
                    <header class="cxpp-sub-head">
                        <div>
                            <span class="cx-tile-label">${sub.startsWith('S1') ? 'Empresas' : 'Gestores comunitarios'} · ${prestadoresSub.length} prestadores</span>
                            <h3 id="h-sub-${sub}" class="cxpp-sub-title">Subsegmento <span class="cx-grad">${sub}</span></h3>
                        </div>
                        ${U.btnTabla(tableId)}
                    </header>
                    ${window.CxPP.tiraEstados(conteo, { label: `Estados en el subsegmento ${sub}` })}
                    <div class="cxpp-sub-body">
                        <div>
                            <ul class="cxpp-meterkey" aria-hidden="true">
                                <li><i class="k-obs"></i>Observado 2027</li>
                                <li><i class="k-lb"></i>Línea base</li>
                                <li><i class="k-meta"></i>Meta aplicada</li>
                                ${ref !== null ? `<li>${ipuf.simbolo || 'Referente'} = ${U.num(ref)} ${unidadTxt} · menor es mejor</li>` : ''}
                            </ul>
                            <ul class="cxpp-apslist">${filas}</ul>
                        </div>
                        <figure class="cxpp-sub-chart">
                            <figcaption>Línea base contra observado, por área · ${txtUnidad(pn.unidadChart)}${mixtas ? '<small>Las áreas medidas en otra unidad se ven solo en la lista.</small>' : ''}</figcaption>
                            <div class="chart-wrapper cxpp-chartbox-sm" style="height:${Math.max(200, items.length * 44 + 70)}px" role="img" aria-label="Barras de línea base y observado 2027 por área de prestación del subsegmento ${sub}">
                                <canvas id="chart-sub-${sub}"></canvas>
                            </div>
                            <div class="chart-caption">Fuente: SUI / estudio de costos · DATOS SINTÉTICOS</div>
                        </figure>
                    </div>

                    <div id="${tableId}" hidden>
                        <div class="data-table-container">
                            <table class="data-table" aria-label="Estados frente a meta en el subsegmento ${sub}">
                                <thead>
                                    <tr>
                                        <th>Prestador</th>
                                        <th>APS</th>
                                        <th>Línea base</th>
                                        <th>Observado 2027</th>
                                        <th>Meta aplicada</th>
                                        <th>Origen de la meta</th>
                                        <th>Estado frente a meta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items.map(it => `
                                        <tr>
                                            <td><button type="button" class="cxpp-linkbtn" onclick="NivelServicio.abrirTrayectoria('${it.prestador.provider_id}', '${it.aps.service_area_id}', '${ind.code}')">${U.esc(it.prestador.nombre)}</button></td>
                                            <td>
                                                ${U.esc(it.aps.municipio)}
                                                ${it.aps.condiciones_especiales && it.aps.condiciones_especiales.length > 0 ? `<span class="chip chip-special">${it.aps.condiciones_especiales.join(', ')}</span>` : ''}
                                            </td>
                                            <td class="mono">${it.lb !== null ? U.num(it.lb) : '—'}</td>
                                            <td class="mono font-bold">${it.obs !== null ? U.num(it.obs) : 'No reportó'}</td>
                                            <td class="mono">${it.estado.meta_aplicada !== null ? U.num(it.estado.meta_aplicada) : '—'}</td>
                                            <td>${it.estado.origen_meta ? `<span class="chip">${it.estado.origen_meta}${it.estado.articulo ? ' · art. ' + it.estado.articulo : ''}</span>` : '—'}</td>
                                            <td>${NivelServicio.renderStatusPill(it.estado.estado, it.estado.marca_simulacion)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            `;
        },

        // IRCA: solo el estado y el estándar de la norma (INV-05); ningún valor
        renderCal(params, evaluados, U) {
            const est = s => {
                const e = params.metas_acueducto?.[s]?.indicadores?.IRCA?.estandar;
                return e ? `${e.operador === '<=' ? '≤' : e.operador} ${U.num(Number(e.valor), 1)} ${e.unidad}` : 'pendiente de aclaración';
            };
            const art = s => params.metas_acueducto?.[s]?.indicadores?.IRCA?.articulo || '';
            const n = evaluados.filter(e => e.indicator_code.endsWith('-CAL') && e.estado === 'sin fuente confirmada').length;
            return `
                <div class="cx-bento cxpp-bento">
                    <article class="cx-tile cx-tile-deep cx-on-dark cx-span-4">
                        <span class="cx-tile-label">NMTPP-S1-CAL · NMTPP-S2-CAL</span>
                        <div class="cxpp-bigstate"><span aria-hidden="true">ⓘ</span> Sin fuente confirmada</div>
                        <p class="cx-tile-note">La norma exige el estándar desde el primer día, pero no designa fuente ni canal de reporte hacia la CRA (Q-NMTPP-06).</p>
                        <ul class="cxpp-ircas">
                            <li><span>Empresas (S1)</span><b class="cx-grad-light">${est('S1')}</b><small>art. ${U.esc(art('S1'))}</small></li>
                            <li><span>Gestores comunitarios (S2)</span><b class="cx-grad-light">${est('S2')}</b><small>art. ${U.esc(art('S2'))}</small></li>
                        </ul>
                        <details class="cx-more cx-tile-foot"><summary>Leer más</summary><p>La norma no nombra al SIVICAP ni al SUI como fuente ni establece la regla temporal de agregación. En apego a la regla de oro 1 y al ADR-0003, el Observatorio no grafica valores ni sustituye el IRCA por aproximaciones mientras la Subdirección Técnica de Regulación no expida la aclaración (Q-NMTPP-06).</p></details>
                    </article>
                    <article class="cx-tile cx-tile-ice cx-span-2">
                        <span class="cx-tile-label">Evaluaciones 2027</span>
                        <div class="cx-insight-figure"><span class="cx-insight-num">${n}</span></div>
                        <p class="cx-tile-note">áreas de prestación con el estado <b class="cxpp-strong">sin fuente confirmada</b>; ninguna muestra valor.</p>
                        <button type="button" class="cx-link cx-tile-foot" onclick="AppNMTPP.mostrarTab('tab-aclaraciones')">Ver la aclaración Q-NMTPP-06</button>
                    </article>
                </div>`;
        },

        renderStatusPill(st, simMarca) {
            const e = (window.CxPP && window.CxPP.ESTADOS[st]) || { cls: '', icon: '○' };
            const simTag = simMarca ? ` <span class="chip chip-simulation">${simMarca}</span>` : '';
            return `<span class="status-pill ${e.cls}"><span class="status-icon" aria-hidden="true">${e.icon}</span> ${st}${simTag}</span>`;
        },

        renderSubsegmentChart(pn, canvas) {
            // Ausencia ≠ 0 (INV-03): sin observado no hay barra; sin línea base, hueco
            const items = pn.items.filter(i => i.obs !== null && i.obs !== undefined && (!pn.unidadChart || (i.estado.unidad || '') === pn.unidadChart || !i.estado.unidad));
            if (items.length === 0 || typeof Chart === 'undefined') return;

            if (this.charts[canvas.id]) this.charts[canvas.id].destroy();

            this.charts[canvas.id] = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: items.map(i => { const n = this.nombreCorto(i.prestador.nombre); return n.length > 24 ? n.slice(0, 22) + '…' : n; }),
                    datasets: [
                        { label: 'Línea base', data: items.map(i => (typeof i.lb === 'number' ? i.lb : null)), backgroundColor: '#bcd4ee', borderRadius: 6, maxBarThickness: 22 },
                        { label: 'Observado 2027', data: items.map(i => i.obs), backgroundColor: '#1664b0', borderRadius: 6, maxBarThickness: 22 }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { beginAtZero: true, ticks: { maxTicksLimit: 5 } },
                        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
                    },
                    plugins: { legend: { position: 'top', align: 'start', labels: { boxWidth: 12, boxHeight: 12 } } }
                }
            });
        },

        unidadDominante(unidades) {
            const c = {};
            unidades.forEach(u => { c[u] = (c[u] || 0) + 1; });
            let mejor = unidades[0];
            Object.keys(c).forEach(u => { if (c[u] > c[mejor]) mejor = u; });
            return mejor;
        },

        toggleTable(tableId) {
            const el = document.getElementById(tableId);
            if (el) el.hidden = !el.hidden;
        },

        abrirTrayectoria(providerId, serviceAreaId, indCode) {
            if (window.Prestadores && window.Prestadores.abrirModalPerfil) {
                window.Prestadores.abrirModalPerfil(providerId, 'trayectorias');
            }
        }
    };

    window.NivelServicio = NivelServicio;

})(window);
