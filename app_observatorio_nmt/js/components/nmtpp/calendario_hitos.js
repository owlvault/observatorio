/**
 * calendario_hitos.js — Vista 2: Calendario de Hitos Regulatorios (2026 - 2036)
 * Cumple RF-NMTPP-03, RN-NMTPP-09
 * Los hitos y sus fechas salen de CRA_NMTPP_PARAMS.calendario; la evidencia, de CRA_NMTPP_DATA.
 */

(function(window) {
    'use strict';

    const ESTADO_HITO = {
        cumplido: { icon: '✓', texto: 'Cumplido', plural: 'cumplidos' },
        en_curso: { icon: '◐', texto: 'En curso', plural: 'en curso' },
        vencido: { icon: '✕', texto: 'Vencido sin evidencia', plural: 'vencidos sin evidencia' },
        pendiente: { icon: '○', texto: 'Próximo', plural: 'próximos' }
    };

    const CalendarioHitos = {
        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const params = window.CRA_NMTPP_PARAMS;
            const data = window.CRA_NMTPP_DATA;
            const U = window.CxPP;
            if (!params || !params.calendario || !U) {
                container.innerHTML = '<div class="notice-box warning">Calendario no disponible</div>';
                return;
            }

            const hitos = params.calendario;
            const fechaCorte = (data && data._meta && data._meta.fecha_corte_simulada) || (window.AppNMTPP && window.AppNMTPP.fechaCorte);

            // Evidencia de H-06: publicaciones del ISE en los datos para el año siguiente al hito
            const publicacionIse = (anioAplicacion) => {
                let min = null;
                (data && data.prestadores || []).forEach(p => (p.ise || []).forEach(r => {
                    if (r.anio_aplicacion === anioAplicacion && r.fecha_publicacion && (!min || r.fecha_publicacion < min)) min = r.fecha_publicacion;
                }));
                return min;
            };

            // Estado de cada hito frente a la fecha de corte (spec §4 V2)
            const evaluados = hitos.map(h => {
                let st = 'pendiente';
                let evidencia = '';
                if (h.codigo === 'H-06') {
                    const pub = publicacionIse(Number(h.fecha.slice(0, 4)) + 1);
                    if (pub && pub <= h.fecha) {
                        st = 'cumplido';
                        evidencia = `Publicado por la CRA el ${U.fecha(pub)}, ${U.dias(pub, h.fecha)} días antes del límite (publicación sintética).`;
                    } else if (h.fecha <= fechaCorte) {
                        st = 'vencido';
                    }
                } else if (h.fecha_inicio && fechaCorte >= h.fecha_inicio && fechaCorte <= h.fecha) {
                    st = 'en_curso';
                } else if (h.fecha && h.fecha <= fechaCorte) {
                    st = 'cumplido';
                }
                return { ...h, estado_calculado: st, nota_evidencia: evidencia };
            });

            // Escala del eje: del 1 de enero del primer año al 31 de diciembre del último
            const fechas = hitos.map(h => h.fecha_inicio || h.fecha).concat(hitos.map(h => h.fecha));
            const y0 = Math.min(...fechas.map(f => Number(f.slice(0, 4))));
            const y1 = Math.max(...fechas.map(f => Number(f.slice(0, 4))));
            const t0 = new Date(`${y0}-01-01T00:00:00`).getTime();
            const t1 = new Date(`${y1}-12-31T00:00:00`).getTime();
            const pos = iso => 3 + 94 * ((new Date(iso + 'T00:00:00').getTime() - t0) / (t1 - t0));

            // Carriles para que los hitos cercanos no se encimen
            const GAP = 5.6;
            const ultimos = [];
            const nodos = evaluados.map(h => {
                const x = pos(h.fecha_inicio || h.fecha);
                let lane = ultimos.findIndex(u => x - u >= GAP);
                if (lane === -1) { lane = ultimos.length; ultimos.push(x); } else ultimos[lane] = x;
                return { h, x, lane };
            });
            const nLanes = Math.max(1, ultimos.length);
            const hoyX = pos(fechaCorte);
            const cuenta = { cumplido: 0, en_curso: 0, vencido: 0, pendiente: 0 };
            evaluados.forEach(h => { cuenta[h.estado_calculado]++; });

            const años = [];
            for (let y = y0; y <= y1; y++) años.push(y);

            const html = `
                ${U.cabecera('Calendario del marco',
                    `${hitos.length} hitos, de ${y0} a <span class="cx-grad">${y1}</span>`,
                    `Estado de cada plazo a la fecha de corte simulada: ${U.fecha(fechaCorte)}.`)}

                <section class="cx-tile cx-tile-deep cx-on-dark cxpp-tl-tile" aria-label="Línea de tiempo de los hitos de la Res. CRA 1038">
                    <div class="cxpp-tl-top">
                        <span class="cx-tile-label">Línea de tiempo ${y0}–${y1}</span>
                        <ul class="cxpp-tl-count">
                            ${Object.keys(cuenta).filter(k => cuenta[k] > 0).map(k => `<li><span class="cxpp-tl-key cxpp-tl-${k}" aria-hidden="true">${ESTADO_HITO[k].icon}</span><b>${cuenta[k]}</b> ${ESTADO_HITO[k].plural}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="cx-scroll-x cxpp-tl-scroll">
                        <div class="cxpp-tl" style="--lanes:${nLanes}" role="group" aria-label="Hitos de ${y0} a ${y1}; corte simulado: ${U.fecha(fechaCorte)}">
                            <div class="cxpp-tl-axis" aria-hidden="true"><i class="cxpp-tl-done" style="width:${Math.min(100, hoyX).toFixed(2)}%"></i></div>
                            ${años.map(y => `<span class="cxpp-tl-year" style="left:${pos(y + '-01-01').toFixed(2)}%" aria-hidden="true">${y}</span>`).join('')}
                            ${evaluados.filter(h => h.fecha_inicio).map(h => `<span class="cxpp-tl-window" style="left:${pos(h.fecha_inicio).toFixed(2)}%;width:${(pos(h.fecha) - pos(h.fecha_inicio)).toFixed(2)}%" aria-hidden="true"></span>`).join('')}
                            <span class="cxpp-tl-hoy" style="left:${hoyX.toFixed(2)}%" aria-hidden="true"><em>Corte · ${U.fecha(fechaCorte)}</em></span>
                            ${nodos.map(n => `
                                <button type="button" class="cxpp-tl-node cxpp-tl-${n.h.estado_calculado}" style="left:${n.x.toFixed(2)}%;--lane:${n.lane}"
                                        onclick="CalendarioHitos.irA('${n.h.codigo}')" aria-label="${n.h.codigo}: ${U.esc(n.h.hito)}, ${U.fecha(n.h.fecha_inicio || n.h.fecha)}, ${ESTADO_HITO[n.h.estado_calculado].texto}">
                                    <span class="cxpp-tl-code">${n.h.codigo}</span>
                                    <span class="cxpp-tl-badge" aria-hidden="true">${ESTADO_HITO[n.h.estado_calculado].icon}</span>
                                </button>`).join('')}
                        </div>
                    </div>
                    <p class="cxpp-tl-hint">Toque un hito para ver su detalle.</p>
                </section>

                ${U.cabecera('Cada hito', 'Quién responde y <span class="cx-grad">con qué artículo</span>', '')}
                <ol class="cxpp-hitos">
                    ${evaluados.map(h => {
                        const e = ESTADO_HITO[h.estado_calculado];
                        return `
                            <li class="cxpp-hito cxpp-hito-${h.estado_calculado}" id="hito-${h.codigo}" tabindex="-1">
                                <div class="cxpp-hito-top">
                                    <span class="cxpp-hito-code">${h.codigo}</span>
                                    <span class="cxpp-hito-state"><span aria-hidden="true">${e.icon}</span> ${e.texto}</span>
                                </div>
                                <div class="cxpp-hito-date">${h.fecha_inicio ? `${U.fecha(h.fecha_inicio)} <small>al</small> ${U.fecha(h.fecha)}` : U.fecha(h.fecha)}</div>
                                <h3 class="cxpp-hito-name">${U.esc(h.hito)}</h3>
                                <p class="cxpp-hito-meta"><span class="chip">${U.esc(h.actor)}</span> ${/^\d/.test(h.articulo) ? 'Art. ' : ''}${U.esc(h.articulo)}${h.recurrente ? ` · <em>se repite: ${U.esc(h.recurrente)}</em>` : ''}</p>
                                ${h.nota_evidencia ? `<p class="cxpp-hito-ev"><span aria-hidden="true">✓</span> ${h.nota_evidencia}</p>` : ''}
                                ${h.nota ? `<details class="cx-more"><summary>Nota</summary><p>${U.esc(h.nota)}</p></details>` : ''}
                            </li>`;
                    }).join('')}
                </ol>
            `;

            container.innerHTML = html;
            U.animar(container);
        },

        // Lleva al detalle del hito y lo resalta
        irA(codigo) {
            const el = document.getElementById('hito-' + codigo);
            if (!el) return;
            el.scrollIntoView({ behavior: window.CineKit && window.CineKit.reducedMotion() ? 'auto' : 'smooth', block: 'center' });
            el.focus({ preventScroll: true });
            el.classList.remove('is-flash');
            void el.offsetWidth;
            el.classList.add('is-flash');
        }
    };

    window.CalendarioHitos = CalendarioHitos;

})(window);
