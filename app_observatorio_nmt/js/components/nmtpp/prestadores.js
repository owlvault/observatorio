/**
 * prestadores.js — Vista 5: Registro Maestro de Prestadores y Ficha de Perfil (Modal)
 * Cumple RF-NMTPP-01, 02, 04, 11, 15, 17, INV-08, RN-PORTAL-04
 */

(function(window) {
    'use strict';

    const Prestadores = {
        sortCol: 'nombre',
        sortAsc: true,
        selectedProviderId: null,

        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const data = window.CRA_NMTPP_DATA;
            if (!data || !data.prestadores) {
                container.innerHTML = '<div class="notice-box warning">Datos de prestadores no disponibles</div>';
                return;
            }

            const appState = window.AppNMTPP || { modo: 'analista', filtros: {} };
            let list = [...data.prestadores];

            // Aplicar filtros
            const fSeg = appState.filtros.segmento || 'todos';
            const fSub = appState.filtros.subsegmento || 'todos';
            const fReg = appState.filtros.regimen_especial || 'todos';
            const fTxt = (appState.filtros.busqueda || '').toLowerCase().trim();

            if (fSeg !== 'todos') list = list.filter(p => p.segmento_vigente === fSeg);
            if (fSub !== 'todos') list = list.filter(p => p.subsegmento_vigente === fSub);
            if (fReg === 'con_condicion') {
                list = list.filter(p => p.aps && p.aps.some(a => a.condiciones_especiales && a.condiciones_especiales.length > 0));
            } else if (fReg === 'sin_condicion') {
                list = list.filter(p => !p.aps || p.aps.every(a => !a.condiciones_especiales || a.condiciones_especiales.length === 0));
            }

            if (fTxt) {
                list = list.filter(p =>
                    p.nombre.toLowerCase().includes(fTxt) ||
                    p.provider_id.toLowerCase().includes(fTxt) ||
                    (p.departamento && p.departamento.nombre.toLowerCase().includes(fTxt))
                );
            }

            // Ordenamiento por nombre, subsegmento o departamento (nunca por desempeño)
            list.sort((a, b) => {
                let vA = '';
                let vB = '';
                if (this.sortCol === 'nombre') {
                    vA = a.nombre;
                    vB = b.nombre;
                } else if (this.sortCol === 'subsegmento') {
                    vA = a.subsegmento_vigente;
                    vB = b.subsegmento_vigente;
                } else if (this.sortCol === 'departamento') {
                    vA = a.departamento ? a.departamento.nombre : '';
                    vB = b.departamento ? b.departamento.nombre : '';
                }
                const cmp = vA.localeCompare(vB);
                return this.sortAsc ? cmp : -cmp;
            });

            let html = `
                <div class="dashboard-panel">
                    <div class="panel-header">
                        <div class="panel-header-title">
                            <h2>Directorio de Acueductos y Fichas de Consulta (Res. CRA 1038 de 2026)</h2>
                            <p>${list.length} de 40 prestadores sintéticos • Toque o haga clic en cualquier fila para abrir la Ficha Integral del operador</p>
                        </div>
                    </div>

                    <div class="data-table-container">
                        <table class="data-table" aria-label="Directorio maestro de acueductos">
                            <thead>
                                <tr>
                                    <th class="sortable" onclick="Prestadores.cambiarOrden('nombre')">
                                        Acueducto u Operador ${this.sortCol === 'nombre' ? (this.sortAsc ? '▲' : '▼') : ''}
                                    </th>
                                    <th class="sortable" onclick="Prestadores.cambiarOrden('subsegmento')">
                                        Tamaño / Escala ${this.sortCol === 'subsegmento' ? (this.sortAsc ? '▲' : '▼') : ''}
                                    </th>
                                    <th>Tipo de Organización</th>
                                    <th class="sortable" onclick="Prestadores.cambiarOrden('departamento')">
                                        Departamento ${this.sortCol === 'departamento' ? (this.sortAsc ? '▲' : '▼') : ''}
                                    </th>
                                    <th>Familias Conectadas (2024)</th>
                                    <th>Estudio de Costos Inicial</th>
                                    <th>Revisión Anual (2028)</th>
                                    <th>Zonas Atendidas (APS)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${list.map(p => {
                                    const estIni = p.estudios ? p.estudios.find(e => e.tipo === 'inicial') : null;
                                    const estRec = p.estudios ? p.estudios.find(e => e.tipo === 'recalculo') : null;
                                    const recEnVentana = estRec && estRec.fecha_recepcion_cra >= '2028-01-01' && estRec.fecha_recepcion_cra <= '2028-05-31';

                                    return `
                                        <tr class="clickable" onclick="Prestadores.abrirModalPerfil('${p.provider_id}')">
                                            <td>
                                                <strong>${p.nombre}</strong><br>
                                                <span class="mono" style="font-size: 0.75rem; color: var(--text-muted);">${p.provider_id}</span>
                                            </td>
                                            <td>
                                                <span class="chip font-bold">${p.subsegmento_vigente}</span>
                                                ${appState.modo === 'analista' && p.subsegmento_calc_regla_mayor !== p.subsegmento_calc_regla_acued
                                                    ? '<span class="chip chip-discrepancy" title="Discrepancia de regla Q-NMTPP-03">Q-03</span>'
                                                    : ''}
                                            </td>
                                            <td>
                                                ${p.es_gestor_comunitario ? '<span class="chip">Gestor Comunitario</span>' : '<span class="chip">Empresa Prestadora</span>'}
                                                ${p.opcion_s2_a_s1 ? '<span class="chip chip-special">Eligió Esquema General</span>' : ''}
                                            </td>
                                            <td>${p.departamento ? p.departamento.nombre : '—'}</td>
                                            <td class="mono">
                                                Acueducto: ${p.suscriptores_ac_2024.toLocaleString()} familias<br>
                                                <span style="font-size: 0.75rem; color: var(--text-muted);">${p.pct_rurales_2024}% en zona rural</span>
                                            </td>
                                            <td>
                                                ${estIni
                                                    ? `<span style="color: #065f46; font-size: 0.8rem;">✓ ${estIni.fecha_recepcion_cra}</span>`
                                                    : '<span style="color: var(--text-muted); font-size: 0.8rem;">Pendiente de entrega</span>'}
                                            </td>
                                            <td>
                                                ${estRec
                                                    ? (recEnVentana
                                                        ? `<span class="chip chip-incentive">A tiempo (${estRec.fecha_recepcion_cra})</span>`
                                                        : `<span class="chip chip-discrepancy">Fuera de plazo (${estRec.fecha_recepcion_cra})</span>`)
                                                    : '<span style="color: var(--text-muted); font-size: 0.8rem;">Sin revisión registrada</span>'}
                                            </td>
                                            <td>
                                                <span class="chip">${p.aps ? p.aps.length : 0} APS</span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                                ${list.length === 0 ? `
                                    <tr>
                                        <td colspan="8" style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
                                            
                                            <strong style="color: var(--blue-deep-navy);">No se encontraron acueductos</strong> con los criterios o filtros actuales.<br>
                                            <button type="button" class="btn-reset-filters" style="margin-top: 14px; display: inline-block;" onclick="AppNMTPP.resetFiltros()">↺ Restablecer filtros</button>
                                        </td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        },

        cambiarOrden(col) {
            if (this.sortCol === col) {
                this.sortAsc = !this.sortAsc;
            } else {
                this.sortCol = col;
                this.sortAsc = true;
            }
            this.render('tab-prestadores');
        },

        abrirModalPerfil(providerId, targetTab = 'info') {
            const data = window.CRA_NMTPP_DATA;
            const p = data.prestadores.find(x => x.provider_id === providerId);
            if (!p) return;

            const U = window.CxPP;
            const appState = window.AppNMTPP || { modo: 'analista', banderas: {} };
            const modal = document.getElementById('modal-perfil-prestador');
            const body = document.getElementById('modal-perfil-body');
            const title = document.getElementById('modal-perfil-title');
            if (!modal || !body || !title || !U) return;

            this._retorno = document.activeElement;
            title.textContent = p.nombre;

            const analista = appState.modo === 'analista';
            const evaluados = window.MotorEstados.evaluarTodo(2027, appState.banderas).filter(e => e.provider_id === p.provider_id);
            const regresiones = window.MotorEstados.detectarRegresiones(2027).filter(r => r.provider_id === p.provider_id);
            const conteo = {};
            evaluados.forEach(e => { conteo[e.estado] = (conteo[e.estado] || 0) + 1; });
            const discrepancia = p.subsegmento_calc_regla_mayor !== p.subsegmento_calc_regla_acued;
            const ise = p.ise && p.ise.length ? p.ise[0] : null;

            const html = `
                <div class="cxpp-mhead">
                    <span class="cx-tile-label">${p.provider_id} · ${p.es_gestor_comunitario ? 'Gestor comunitario' : 'Empresa prestadora'}${p.opcion_s2_a_s1 ? ' · optó por el S1' : ''}</span>
                    <ul class="cxpp-mfacts">
                        <li><b class="cx-grad">${analista ? p.subsegmento_vigente : p.subsegmento_declarado}</b><span>subsegmento</span></li>
                        <li><b class="cx-grad">${U.num(p.suscriptores_ac_2024, 0)}</b><span>suscriptores de acueducto (2024)</span></li>
                        <li><b class="cx-grad">${p.aps.length}</b><span>${p.aps.length === 1 ? 'área de prestación' : 'áreas de prestación'}</span></li>
                        <li><b class="cx-grad">${U.num(p.pct_rurales_2024)} %</b><span>rural</span></li>
                    </ul>
                    <p class="cxpp-meta-line">${p.departamento ? U.esc(p.departamento.nombre) : '—'} · régimen ${String(p.regimen).replace('_', ' ')} · facturación ${U.esc(p.facturacion)}</p>
                </div>

                <section class="modal-section cxpp-msec">
                    <h3 class="cxpp-msec-t">Clasificación</h3>
                    ${analista ? `
                        <div class="cxpp-mado">
                            <span class="cxpp-q-lbl">NMTPP-ADO-02 · reglas de conteo</span>
                            <dl class="cxpp-mado-grid">
                                <div><dt>Resolución (cifra mayor)</dt><dd>${p.subsegmento_calc_regla_mayor}</dd></div>
                                <div><dt>Documento técnico (acueducto)</dt><dd>${p.subsegmento_calc_regla_acued}</dd></div>
                                <div><dt>Declarado en el estudio</dt><dd>${p.subsegmento_declarado}</dd></div>
                                <div><dt>Vigente aplicado</dt><dd>${p.subsegmento_vigente}</dd></div>
                            </dl>
                            ${discrepancia ? `<p class="cxpp-nocomp cxpp-nocomp-block"><span aria-hidden="true">≠</span> <span><strong>Discrepancia activa:</strong> consulta Q-NMTPP-03 abierta. La Resolución prevalece sobre el Documento Técnico.</span></p>` : ''}
                        </div>
                    ` : `<p class="cxpp-meta-line">Subsegmento declarado <b>${p.subsegmento_declarado}</b>: fija metas graduales acordes a la capacidad del operador.</p>`}
                </section>

                <section class="modal-section cxpp-msec">
                    <h3 class="cxpp-msec-t">Áreas de prestación</h3>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead><tr><th>APS</th><th>Municipio</th><th>Entorno</th><th>Condición especial</th><th>Se evalúa como</th><th>Unidad de continuidad</th></tr></thead>
                            <tbody>
                                ${p.aps.map(a => `
                                    <tr>
                                        <td class="mono font-bold">${a.service_area_id}</td>
                                        <td>${U.esc(a.municipio)} <small class="cxpp-muted">(DIVIPOLA ${a.divipola_code})</small></td>
                                        <td>${U.esc(a.zona)}</td>
                                        <td>${a.condiciones_especiales && a.condiciones_especiales.length ? a.condiciones_especiales.map(c => `<span class="chip chip-special">${c}</span>`).join(' ') : '<span class="cxpp-muted">Ninguna</span>'}</td>
                                        <td><strong>${a.regimen_evaluacion}</strong>${a.regimen_evaluacion === 'S2' && p.segmento_vigente === 'S1' ? ' <span class="chip chip-special">Estándares del S2</span>' : ''}</td>
                                        <td class="mono">${a.unidad_continuidad}</td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="modal-section cxpp-msec">
                    <h3 class="cxpp-msec-t">Estados frente a meta · 2027</h3>
                    ${U.tiraEstados(conteo, { label: 'Estados del prestador en 2027' })}
                    ${U.leyendaLegal()}
                    <div class="cxpp-chartbar cxpp-mt">${U.btnTabla('tbl-perfil-estados')}</div>
                    <div id="tbl-perfil-estados" hidden>
                        <div class="data-table-container">
                            <table class="data-table">
                                <thead><tr><th>Indicador</th><th>APS</th><th>Observado</th><th>Meta</th><th>Origen de la meta</th><th>Estado</th><th>Base legal</th></tr></thead>
                                <tbody>
                                    ${evaluados.map(ev => `
                                        <tr>
                                            <td><strong>${ev.indicator_code}</strong></td>
                                            <td class="mono">${ev.service_area_id}</td>
                                            <td class="mono font-bold">${ev.valor_observado !== null ? U.num(ev.valor_observado) + ' ' + (ev.unidad || '') : 'Sin reporte'}</td>
                                            <td class="mono">${ev.meta_aplicada !== null ? U.num(ev.meta_aplicada) : '—'}</td>
                                            <td>${ev.origen_meta ? `<span class="chip">${ev.origen_meta}</span>` : '—'}</td>
                                            <td>${window.NivelServicio ? window.NivelServicio.renderStatusPill(ev.estado, ev.marca_simulacion) : ev.estado}</td>
                                            <td class="cxpp-muted">${ev.articulo ? 'Art. ' + ev.articulo : '—'}</td>
                                        </tr>`).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section class="modal-section cxpp-msec" id="perfil-trayectorias">
                    <h3 class="cxpp-msec-t">Trayectorias</h3>
                    <p class="cxpp-meta-line">Línea base, observado 2027 y metas declaradas por el prestador en su estudio (RN-NMTPP-08: meta declarada, no regulatoria).</p>
                    <div class="cxpp-trays">${this.renderTrayectorias(p, U)}</div>
                </section>

                ${p.segmento_vigente === 'S1' ? `
                    <section class="modal-section cxpp-msec">
                        <h3 class="cxpp-msec-t">ISE e incentivos (publicación de la CRA)</h3>
                        ${ise && !ise.no_aplica_motivo ? `
                            <ul class="cxpp-mfacts cxpp-mfacts-sm">
                                <li><b class="cx-grad">${U.num(ise.ise_calculado, 2)}</b><span>ISE publicado</span></li>
                                <li><b class="cx-grad">${U.num(ise.pct_eficiencia_aplicable)} %</b><span>eficiencia reconocida (piso ${U.num(ise.piso_anio)} %)</span></li>
                                <li><b class="cx-grad">${U.num(ise.ise_con_incentivos_cmog)} / ${U.num(ise.ise_con_incentivos_cma)}</b><span>con incentivos CMOG / CMA (%)</span></li>
                            </ul>
                            <p class="cxpp-meta-line">${p.incentivos && p.incentivos.length ? p.incentivos.map(i => `<span class="chip chip-incentive">${U.esc(i.tipo)} +${U.num(i.porcentaje)} %</span>`).join(' ') : 'Sin incentivos'} · <span class="chip chip-simulation">Aplica ${ise.anio_aplicacion} — evaluado con ${ise.anio_evaluado}</span></p>
                        ` : `<p class="cxpp-meta-line">${ise && ise.no_aplica_motivo ? `No aplica (${U.esc(ise.no_aplica_motivo)}).` : 'Sin publicación oficial de la CRA.'}</p>`}
                    </section>` : ''}

                <section class="modal-section cxpp-msec">
                    <h3 class="cxpp-msec-t">Factura por estrato y uso (RF-NMTPP-15)</h3>
                    ${this.renderReferente(p, U)}
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead><tr><th>Estrato / uso</th><th>Cargo fijo Res. 825</th><th>Cargo fijo Res. 1038</th><th>Consumo Res. 825 ($/m³)</th><th>Consumo Res. 1038 ($/m³)</th><th>Cambio en cargo fijo</th></tr></thead>
                            <tbody>${this.renderFilasTarifarias(p)}</tbody>
                        </table>
                    </div>
                    <p class="chart-caption">${(() => { const a = (p.tarifas || []).find(t => t.marco_origen === 'CRA-825-2017'); const b = (p.tarifas || []).find(t => t.marco_origen === 'CRA-1038-2026'); return `Pesos colombianos ${a ? a.monetary_condition + 's' : ''}: Res. 825 periodo ${a ? a.periodo : '—'} (año base ${a ? a.base_year : '—'}); Res. 1038 periodo ${b ? b.periodo : '—'} (año base ${b ? b.base_year : '—'})`; })()} · DATOS SINTÉTICOS</p>
                </section>

                ${analista ? `
                    <section class="modal-section cxpp-msec analyst-only">
                        <h3 class="cxpp-msec-t">No regresividad frente a la línea base</h3>
                        ${regresiones.length > 0 ? `
                            <p class="cxpp-nocomp cxpp-nocomp-block"><span aria-hidden="true">↘</span> <span><strong>Retroceso frente a la línea base:</strong> ${regresiones.map(r => `${r.indicadores.join(', ')} en ${r.service_area_id}`).join('; ')}. Alerta interna de seguimiento técnico; no prejuzga responsabilidades.</span></p>
                        ` : `<p class="cxpp-hito-ev"><span aria-hidden="true">✓</span> Sin retrocesos frente a la línea base en las áreas de este prestador.</p>`}
                    </section>` : ''}
            `;

            body.innerHTML = html;
            modal.classList.add('open');
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'modal-perfil-title');
            U.animar(body);

            // Teclado: Escape cierra; el foco entra al diálogo
            if (!this._teclas) {
                this._teclas = e => { if (e.key === 'Escape' && modal.classList.contains('open')) this.cerrarModal(); };
                document.addEventListener('keydown', this._teclas);
            }
            const cerrar = modal.querySelector('.modal-close-btn');
            if (cerrar) {
                cerrar.setAttribute('aria-label', 'Cerrar ficha del prestador');
                cerrar.focus({ preventScroll: true });
            }
            body.scrollTop = 0;
            if (targetTab === 'trayectorias') {
                const t = document.getElementById('perfil-trayectorias');
                if (t) setTimeout(() => t.scrollIntoView({ block: 'start' }), 60);
            }
        },

        // Minigráfica SVG: línea base → observado 2027 y senda declarada, con el estándar de la norma
        renderTrayectorias(p, U) {
            const P = window.CRA_NMTPP_PARAMS || {};
            const seg = p.segmento_vigente;
            const inds = [
                { k: 'MICROMEDICION', n: 'Micromedición', est: P.metas_acueducto?.[seg]?.indicadores?.[seg === 'S1' ? 'MICROMEDICION' : 'MICROMEDICION_RESIDENCIAL']?.estandar },
                { k: 'COBERTURA', n: 'Cobertura', est: seg === 'S1' ? P.metas_acueducto?.S1?.indicadores?.COBERTURA?.estandar : null }
            ];
            const anio1 = P.marco_tarifario ? P.marco_tarifario.anio_tarifario_1 : null;
            const out = [];
            p.aps.forEach(a => inds.forEach(ind => {
                const md = a.metas_declaradas && a.metas_declaradas[ind.k];
                const lb = a.linea_base ? a.linea_base[ind.k] : undefined;
                const obs = a.observados && anio1 && a.observados[String(anio1)] ? a.observados[String(anio1)][ind.k] : undefined;
                if (!md && lb === undefined) return;
                const años = md ? Object.keys(md) : [];
                const puntos = [];
                if (lb !== undefined && anio1) puntos.push({ x: anio1 - 1, v: lb });
                años.forEach(y => puntos.push({ x: Number(y), v: md[y] }));
                const xs = puntos.map(q => q.x).concat(obs !== undefined && anio1 ? [anio1] : []);
                const vals = puntos.map(q => q.v).concat(obs !== undefined ? [obs] : [], ind.est ? [ind.est.valor] : []);
                const x0 = Math.min(...xs), x1 = Math.max(...xs);
                const v0 = Math.max(0, Math.min(...vals) - 5), v1 = Math.max(...vals) + 2;
                const W = 300, H = 110, px = x => 16 + (x - x0) / Math.max(1, x1 - x0) * (W - 32), py = v => H - 18 - (v - v0) / Math.max(1, v1 - v0) * (H - 36);
                const senda = puntos.map((q, i) => `${i ? 'L' : 'M'}${px(q.x).toFixed(1)} ${py(q.v).toFixed(1)}`).join(' ');
                out.push(`
                    <figure class="cxpp-tray">
                        <figcaption><b>${ind.n}</b> · ${a.service_area_id}</figcaption>
                        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${ind.n} en ${a.service_area_id}: línea base ${lb !== undefined ? U.num(lb) : 'sin dato'}, observado ${anio1} ${obs !== undefined ? U.num(obs) : 'sin dato'}, metas declaradas ${años.map(y => `${y}: ${U.num(md[y])}`).join(', ')}${ind.est ? `, estándar ${U.num(ind.est.valor)} %` : ''}">
                            ${ind.est ? `<line x1="12" x2="${W - 12}" y1="${py(ind.est.valor).toFixed(1)}" y2="${py(ind.est.valor).toFixed(1)}" class="t-est"/><text x="${W - 12}" y="${(py(ind.est.valor) - 5).toFixed(1)}" text-anchor="end" class="t-lbl">estándar ${U.num(ind.est.valor)} %</text>` : ''}
                            <path d="${senda}" class="t-senda"/>
                            ${puntos.map((q, i) => `<circle cx="${px(q.x).toFixed(1)}" cy="${py(q.v).toFixed(1)}" r="${i === 0 && lb !== undefined ? 5 : 3.5}" class="${i === 0 && lb !== undefined ? 't-lb' : 't-md'}"/>`).join('')}
                            ${obs !== undefined && anio1 ? `<circle cx="${px(anio1).toFixed(1)}" cy="${py(obs).toFixed(1)}" r="6.5" class="t-obs"/>` : ''}
                            ${[x0, x1].map(x => `<text x="${px(x).toFixed(1)}" y="${H - 3}" text-anchor="middle" class="t-ax">${x}</text>`).join('')}
                        </svg>
                    </figure>`);
            }));
            return out.length ? out.join('') + `<ul class="cxpp-meterkey"><li><i class="k-lb"></i>Línea base</li><li><i class="cxpp-k-obs"></i>Observado ${anio1}</li><li><i class="cxpp-k-md"></i>Meta declarada</li><li><i class="k-meta"></i>Estándar de la norma</li></ul>`
                : '<p class="cxpp-meta-line">Sin metas declaradas registradas.</p>';
        },

        // Referente ex ante del Documento Técnico: estimación, no meta ni tope
        renderReferente(p, U) {
            const ref = (window.CRA_NMTPP_PARAMS || {}).referente_ex_ante_dt;
            if (!ref || !ref.factura_promedio_estimada) return '';
            const fila = ref.factura_promedio_estimada.find(f => f.servicio === 'acueducto' && f.segmento === p.segmento_vigente);
            if (!fila || fila.variacion_pct === null) return '';
            return `<p class="cxpp-meta-line">Referente del regulador para el ${p.segmento_vigente}: <b>${fila.variacion_pct >= 0 ? '+' : ''}${U.num(fila.variacion_pct)} %</b> en la factura de acueducto. <span class="chip">Estimación ex ante del regulador — no es meta ni tope</span></p>
                <details class="cx-more"><summary>Cómo se compone la factura</summary><p><strong>Cargo fijo ($/mes):</strong> cubre administración, lectura de medidores y disponibilidad del servicio. <strong>Cargo por consumo ($/m³):</strong> valor por cada metro cúbico consumido. Fuente del referente: ${U.esc(ref.fuente)}.</p></details>`;
        },

        renderFilasTarifarias(p) {
            if (!p.tarifas || p.tarifas.length === 0) {
                return '<tr><td colspan="6" class="cxpp-muted">No hay tarifas registradas</td></tr>';
            }
            const U = window.CxPP;
            const estratos = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'COMERCIAL'];
            const res825 = p.tarifas.filter(t => t.marco_origen === 'CRA-825-2017');
            const res1038 = p.tarifas.filter(t => t.marco_origen === 'CRA-1038-2026');
            const peso = v => '$' + U.num(v, 0);

            return estratos.map(est => {
                const tOld = res825.find(t => t.estrato_uso === est);
                const tNew = res1038.find(t => t.estrato_uso === est);
                if (!tOld && !tNew) return '';
                const varCF = tOld && tNew && tOld.cargo_fijo > 0 ? ((tNew.cargo_fijo - tOld.cargo_fijo) / tOld.cargo_fijo) * 100 : null;
                return `
                    <tr>
                        <td><strong>${est}</strong></td>
                        <td class="mono">${tOld ? peso(tOld.cargo_fijo) : '—'}</td>
                        <td class="mono font-bold">${tNew ? peso(tNew.cargo_fijo) : '—'}</td>
                        <td class="mono">${tOld ? '$' + U.num(tOld.cargo_consumo, 2) : '—'}</td>
                        <td class="mono font-bold">${tNew ? '$' + U.num(tNew.cargo_consumo, 2) : '—'}</td>
                        <td class="mono">${varCF !== null ? (varCF >= 0 ? '+' : '') + U.num(varCF, 1) + ' %' : '—'}</td>
                    </tr>`;
            }).join('');
        },

        cerrarModal() {
            const modal = document.getElementById('modal-perfil-prestador');
            if (modal) modal.classList.remove('open');
            if (this._retorno && typeof this._retorno.focus === 'function' && document.contains(this._retorno)) {
                this._retorno.focus({ preventScroll: true });
            }
            this._retorno = null;
        }
    };

    window.Prestadores = Prestadores;

})(window);
