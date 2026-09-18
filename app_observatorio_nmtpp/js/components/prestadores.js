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
                                            <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
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

            const appState = window.AppNMTPP || { modo: 'analista', banderas: {} };
            const modal = document.getElementById('modal-perfil-prestador');
            const body = document.getElementById('modal-perfil-body');
            const title = document.getElementById('modal-perfil-title');
            if (!modal || !body || !title) return;

            title.innerHTML = `Ficha Integral del Prestador: ${p.nombre}`;

            // Evaluaciones de este prestador
            const evaluados = window.MotorEstados.evaluarTodo(2027, appState.banderas).filter(e => e.provider_id === p.provider_id);
            const regresiones = window.MotorEstados.detectarRegresiones(2027).filter(r => r.provider_id === p.provider_id);

            let html = `
                <!-- 1. IDENTIFICACIÓN Y CLASIFICACIÓN (RF-NMTPP-02) -->
                <div class="modal-section">
                    <div class="modal-section-title">1. Datos Básicos y Clasificación del Acueducto</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; font-size: 0.88rem;">
                        <div><strong>Código de Registro:</strong> <span class="mono">${p.provider_id}</span></div>
                        <div><strong>Naturaleza:</strong> ${p.es_gestor_comunitario ? 'Gestor Comunitario (Organización comunitaria)' : 'Empresa Prestadora (Sociedad de servicios S1)'}</div>
                        <div><strong>Régimen Tarifario:</strong> ${p.regimen}</div>
                        <div><strong>Ciclo de Facturación:</strong> ${p.facturacion}</div>
                        <div><strong>Departamento:</strong> ${p.departamento ? p.departamento.nombre : '—'}</div>
                        <div><strong>Familias Conectadas (2024):</strong> ${p.suscriptores_ac_2024.toLocaleString()}</div>
                    </div>

                    <!-- Bloque ADO-02: Modo analista vs ciudadano -->
                    ${appState.modo === 'analista' ? `
                        <div style="background: var(--bg-surface-subtle); padding: 12px; border-radius: var(--radius-sm); margin-top: 12px; border: 1px dashed var(--blue-primary);">
                            <strong style="color: var(--blue-deep-navy);">Bloque Analítico NMTPP-ADO-02 (Reglas de Conteo en Conflicto):</strong>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin-top: 6px; font-size: 0.82rem;">
                                <div>• Regla Resolución (Cifra Mayor): <strong>${p.subsegmento_calc_regla_mayor}</strong></div>
                                <div>• Regla Documento Técnico (Acueducto): <strong>${p.subsegmento_calc_regla_acued}</strong></div>
                                <div>• Subsegmento Declarado en Estudio: <strong>${p.subsegmento_declarado}</strong></div>
                                <div>• Subsegmento Vigente Aplicado: <strong>${p.subsegmento_vigente}</strong></div>
                            </div>
                            ${p.subsegmento_calc_regla_mayor !== p.subsegmento_calc_regla_acued ? `
                                <div class="notice-box warning" style="margin-top: 8px; margin-bottom: 0;">
                                    <span>⚠️</span>
                                    <div><strong>Discrepancia Activa:</strong> Consulta Q-NMTPP-03 abierta. La Resolución prevalece sobre el Documento Técnico.</div>
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <div style="margin-top: 8px; font-size: 0.84rem; color: var(--text-secondary);">
                            <strong>Clasificación de Escala:</strong> <span class="chip font-bold">${p.subsegmento_declarado}</span>
                            <span style="font-size: 0.78rem; color: var(--text-muted);">(Fija las metas graduales de servicio adecuadas a la capacidad del operador)</span>
                        </div>
                    `}
                </div>

                <!-- 2. ÁREAS DE PRESTACIÓN DE SERVICIO (APS) Y CONDICIONES ESPECIALES -->
                <div class="modal-section">
                    <div class="modal-section-title">2. Zonas y Poblaciones Atendidas (Áreas de Prestación - APS)</div>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Zona (APS)</th>
                                    <th>Municipio</th>
                                    <th>Entorno</th>
                                    <th>Condición Especial (Vulnerabilidad)</th>
                                    <th>Reglas de Evaluación</th>
                                    <th>Medición de Continuidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${p.aps.map(a => `
                                    <tr>
                                        <td class="mono font-bold">${a.service_area_id}</td>
                                        <td>${a.municipio} (DIVIPOLA ${a.divipola_code})</td>
                                        <td>${a.zona}</td>
                                        <td>
                                            ${a.condiciones_especiales && a.condiciones_especiales.length > 0
                                                ? a.condiciones_especiales.map(c => `<span class="chip chip-special">${c}</span>`).join(' ')
                                                : '<span style="color: var(--text-muted); font-size: 0.8rem;">Ninguna</span>'}
                                        </td>
                                        <td>
                                            <strong>${a.regimen_evaluacion}</strong>
                                            ${a.regimen_evaluacion === 'S2' && p.segmento_vigente === 'S1'
                                                ? '<span class="chip chip-special">Reglas Flexibles S2</span>'
                                                : ''}
                                        </td>
                                        <td><span class="mono">${a.unidad_continuidad}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 3. ESTADOS REGULATORIOS POR INDICADOR (AÑO 2027) -->
                <div class="modal-section">
                    <div class="modal-section-title">3. Cumplimiento de Metas de Calidad y Servicio (Año 2027)</div>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Indicador de Servicio</th>
                                    <th>Zona (APS)</th>
                                    <th>Resultado Obtenido</th>
                                    <th>Meta Exigida</th>
                                    <th>Origen de la Meta</th>
                                    <th>Estado Evaluado</th>
                                    <th>Base Legal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${evaluados.map(ev => `
                                    <tr>
                                        <td><strong>${ev.indicator_code}</strong></td>
                                        <td class="mono" style="font-size: 0.8rem;">${ev.service_area_id}</td>
                                        <td class="mono font-bold">${ev.valor_observado !== null ? ev.valor_observado + ' ' + (ev.unidad || '') : 'Sin reporte'}</td>
                                        <td class="mono">${ev.meta_aplicada !== null ? ev.meta_aplicada : '—'}</td>
                                        <td>${ev.origen_meta ? `<span class="chip">${ev.origen_meta}</span>` : '—'}</td>
                                        <td>${window.NivelServicio ? window.NivelServicio.renderStatusPill(ev.estado, ev.marca_simulacion) : ev.estado}</td>
                                        <td style="font-size: 0.78rem; color: var(--text-muted);">Art. ${ev.articulo || '—'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 4. TARIFAS POR ESTRATO Y USO (INV-08 / RN-PORTAL-04) -->
                <div class="modal-section">
                    <div class="modal-section-title">4. Composición de la Factura: Cargo Fijo y Consumo de Agua (RF-NMTPP-15)</div>
                    <div class="notice-box info" style="margin-bottom: 12px;">
                        <span>💡</span>
                        <div>
                            <strong>¿Cómo se compone la factura de acueducto?:</strong>
                            <br>• <strong>Cargo Fijo ($/mes):</strong> Cubre los costos de administración, lectura de medidores y disponibilidad permanente del agua en la red.
                            <br>• <strong>Cargo por Consumo ($/m³):</strong> Valor facturado por cada metro cúbico (1.000 litros) de agua efectivamente consumida.
                            <br>• <em>Referente ex-ante:</em> El regulador estimó que las tarifas globales variarían en promedio alrededor del <strong>+18.1% en empresas S1</strong> y <strong>+6.1% en gestores comunitarios</strong> para financiar inversiones básicas. Esta cifra es un referente técnico de estudio, no un tope ni una meta obligatoria.
                        </div>
                    </div>

                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Estrato / Uso</th>
                                    <th>Cargo Fijo Anterior (Res. 825)</th>
                                    <th>Cargo Fijo Nuevo (Res. 1038)</th>
                                    <th>Consumo Anterior ($/m³)</th>
                                    <th>Consumo Nuevo ($/m³)</th>
                                    <th>Cambio en Cargo Fijo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Prestadores.renderFilasTarifarias(p)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 5. REGRESIONES FRENTE A LÍNEA BASE (RF-NMTPP-11, Solo modo analista) -->
                ${appState.modo === 'analista' ? `
                    <div class="modal-section analyst-only">
                        <div class="modal-section-title">5. Verificación Preventiva de No Retroceso (No Regresividad)</div>
                        ${regresiones.length > 0 ? `
                            <div class="notice-box warning">
                                <span>⚠️</span>
                                <div>
                                    <strong>Retroceso Identificado Frente a 2026:</strong>
                                    Se identificaron retrocesos en: <strong>${regresiones[0].indicadores.join(', ')}</strong> en la zona ${regresiones[0].service_area_id}.
                                    <br><span style="font-size: 0.78rem; color: var(--text-muted);">Alerta interna de seguimiento técnico para la CRA; no prejuzga responsabilidades sancionatorias.</span>
                                </div>
                            </div>
                        ` : `
                            <div style="color: #065f46; font-size: 0.85rem; background: #ecfdf5; padding: 10px; border-radius: 6px;">
                                ✓ No se detectaron retrocesos frente a la línea base 2026 en ninguna de las zonas de este acueducto.
                            </div>
                        `}
                    </div>
                ` : ''}
            `;

            body.innerHTML = html;
            modal.classList.add('open');
        },

        renderFilasTarifarias(p) {
            if (!p.tarifas || p.tarifas.length === 0) {
                return '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No hay tarifas registradas</td></tr>';
            }

            const estratos = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'COMERCIAL'];
            const res825 = p.tarifas.filter(t => t.marco_origen === 'CRA-825-2017');
            const res1038 = p.tarifas.filter(t => t.marco_origen === 'CRA-1038-2026');

            return estratos.map(est => {
                const tOld = res825.find(t => t.estrato_uso === est);
                const tNew = res1038.find(t => t.estrato_uso === est);
                if (!tOld && !tNew) return '';

                const cfOld = tOld ? tOld.cargo_fijo : 0;
                const cfNew = tNew ? tNew.cargo_fijo : 0;
                const varCF = cfOld > 0 ? (((cfNew - cfOld) / cfOld) * 100).toFixed(1) : '—';

                return `
                    <tr>
                        <td><strong>${est}</strong></td>
                        <td class="mono">$${cfOld.toLocaleString()}</td>
                        <td class="mono font-bold">$${cfNew.toLocaleString()}</td>
                        <td class="mono">$${tOld ? tOld.cargo_consumo.toFixed(2) : '—'}</td>
                        <td class="mono font-bold">$${tNew ? tNew.cargo_consumo.toFixed(2) : '—'}</td>
                        <td class="mono ${parseFloat(varCF) > 18.1 ? 'font-bold' : ''}">
                            ${varCF !== '—' ? (parseFloat(varCF) >= 0 ? '+' : '') + varCF + '%' : '—'}
                        </td>
                    </tr>
                `;
            }).join('');
        },

        cerrarModal() {
            const modal = document.getElementById('modal-perfil-prestador');
            if (modal) modal.classList.remove('open');
        }
    };

    window.Prestadores = Prestadores;

})(window);
