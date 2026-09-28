/**
 * regimen_especial.js — Vista 6: Régimen Especial y APS con Condiciones Estructurales
 * Cumple RF-NMTPP-10, NMTPP-ESP-01
 * Tipos y criterios de condición salen de CRA_NMTPP_PARAMS; los conteos, de CRA_NMTPP_DATA.
 */

(function(window) {
    'use strict';

    const NOMBRE_COND = {
        INSULAR: 'Territorio insular',
        IVH: 'Vulnerabilidad hídrica',
        IPM: 'Pobreza multidimensional',
        PDET_ZOMAC: 'Municipios PDET / ZOMAC',
        TOMA_POSESION: 'Toma de posesión SSPD'
    };

    const RegimenEspecial = {
        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const data = window.CRA_NMTPP_DATA;
            const params = window.CRA_NMTPP_PARAMS || {};
            const U = window.CxPP;
            if (!data || !data.prestadores || !U) {
                container.innerHTML = '<div class="notice-box warning">Datos no disponibles</div>';
                return;
            }

            const cond = (params.regimenes_especiales_acueducto || {}).condiciones_especiales_estructurales || {};
            const tipos = cond.tipos || [];
            const irca = params.metas_acueducto?.S2?.indicadores?.IRCA?.estandar;
            const ircaTxt = irca ? `${irca.operador === '<=' ? '≤' : irca.operador} ${U.num(Number(irca.valor), 1)} ${irca.unidad}` : 'pendiente de aclaración';

            // Todas las APS del universo y las que tienen condición especial
            const todas = [];
            data.prestadores.forEach(p => (p.aps || []).forEach(a => todas.push({ prestador: p, aps: a })));
            const especiales = todas.filter(x => x.aps.condiciones_especiales && x.aps.condiciones_especiales.length > 0);
            const conteo = {};
            tipos.forEach(t => { conteo[t.codigo] = 0; });
            especiales.forEach(x => x.aps.condiciones_especiales.forEach(c => { conteo[c] = (conteo[c] || 0) + 1; }));

            // Estados 2027 de las APS especiales (evaluadas con estándares del S2)
            const banderas = (window.AppNMTPP && window.AppNMTPP.banderas) || {};
            const evaluados = window.MotorEstados ? window.MotorEstados.evaluarTodo(2027, banderas) : [];
            const estadosDe = id => evaluados.filter(e => e.service_area_id === id);

            const tiles = tipos.map(t => `
                <article class="cx-tile cx-span-2 cxpp-tile-auto cxpp-cond">
                    <span class="cx-tile-label">${t.codigo}</span>
                    <div class="cx-insight-figure"><span class="cx-insight-num">${conteo[t.codigo] || 0}</span> ${(conteo[t.codigo] || 0) === 1 ? 'área' : 'áreas'}</div>
                    <h3 class="cxpp-cond-name">${NOMBRE_COND[t.codigo] || t.codigo}</h3>
                    <div class="cx-dots cxpp-dots-aps cx-tile-foot" data-cx-anim role="img" aria-label="${conteo[t.codigo] || 0} de ${todas.length} áreas de prestación con la condición ${NOMBRE_COND[t.codigo] || t.codigo}">
                        ${todas.map(x => `<i class="${(x.aps.condiciones_especiales || []).includes(t.codigo) ? 'b' : 'c'}"></i>`).join('')}
                    </div>
                    <details class="cx-more"><summary>Criterio</summary><p>${U.esc(t.criterio)}</p></details>
                </article>`).join('');

            const html = `
                ${U.cabecera('Régimen especial · NMTPP-ESP-01',
                    `${especiales.length} de ${todas.length} áreas, con reglas <span class="cx-grad">a su medida</span>`,
                    `En estas APS se aplican los estándares del segundo segmento (art. ${U.esc((cond.articulo || '').split(';').pop().trim().replace(/\s*\(.*\)/, '') || '2.1.1.1.4.1')}); el IRCA ${ircaTxt} no tiene excepción.`)}

                <div class="cx-bento cxpp-bento">
                    ${tiles}
                    <article class="cx-tile cx-tile-deep cx-on-dark cx-span-2 cxpp-tile-auto">
                        <span class="cx-tile-label">Tratamiento</span>
                        <h3 class="cx-display-3">Estándares del <span class="cx-grad-light">segundo segmento</span></h3>
                        <p class="cx-tile-note">Calidad, continuidad, micro y macromedición, solo en el área con la condición.</p>
                        <details class="cx-more cx-tile-foot"><summary>Leer más</summary><p>${U.esc(cond.tratamiento || '')}</p></details>
                    </article>
                </div>

                ${U.cabecera('Áreas con condición', 'Dónde están y <span class="cx-grad">cómo se evalúan</span>', 'Estados 2027 de cada área con los estándares del segundo segmento.')}
                <ul class="cxpp-zonas">
                    ${especiales.map(x => {
                        const est = estadosDe(x.aps.service_area_id);
                        return `
                        <li class="cxpp-zona">
                            <div class="cxpp-zona-top">
                                <span class="cxpp-hito-code">${x.aps.service_area_id}</span>
                                ${x.aps.condiciones_especiales.map(c => `<span class="chip chip-special">${NOMBRE_COND[c] || c}</span>`).join(' ')}
                            </div>
                            <button type="button" class="cxpp-aps-name" onclick="Prestadores.abrirModalPerfil('${x.prestador.provider_id}')">${U.esc(x.prestador.nombre)}<small>${U.esc(x.aps.municipio)} · segmento ${x.prestador.segmento_vigente} · evaluada como ${x.aps.regimen_evaluacion}</small></button>
                            <ul class="cxpp-zona-st" aria-label="Estados 2027">
                                ${est.map(e => `<li><span class="cxpp-zona-ind">${e.indicator_code.split('-').pop()}</span>${window.NivelServicio ? window.NivelServicio.renderStatusPill(e.estado, e.marca_simulacion) : e.estado}</li>`).join('')}
                            </ul>
                        </li>`;
                    }).join('')}
                </ul>
                ${U.leyendaLegal()}

                <div class="cxpp-chartbar cxpp-mt">${U.btnTabla('tbl-regimen')}</div>
                <div id="tbl-regimen" hidden>
                    <div class="data-table-container">
                        <table class="data-table" aria-label="Áreas de prestación con régimen especial">
                            <thead>
                                <tr><th>Prestador</th><th>APS</th><th>Municipio</th><th>Condición</th><th>Segmento</th><th>Régimen de evaluación</th></tr>
                            </thead>
                            <tbody>
                                ${especiales.map(x => `
                                    <tr>
                                        <td><strong>${U.esc(x.prestador.nombre)}</strong></td>
                                        <td class="mono">${x.aps.service_area_id}</td>
                                        <td>${U.esc(x.aps.municipio)}</td>
                                        <td>${x.aps.condiciones_especiales.join(', ')}</td>
                                        <td>${x.prestador.segmento_vigente}</td>
                                        <td>${x.aps.regimen_evaluacion}</td>
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

    window.RegimenEspecial = RegimenEspecial;

})(window);
