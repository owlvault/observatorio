/**
 * resumen_adopcion.js — Vista 1: Resumen de Implementación y Adopción
 * Cumple RF-NMTPP-05, RF-NMTPP-07, RF-NMTPP-18, RF-PROTO-05
 *
 * También define window.CxPP: utilidades visuales comunes de la sección Res. 1038
 * (se carga primero; los demás componentes lo usan solo al renderizar).
 */

(function(window) {
    'use strict';

    // ---------------------------------------------------------------------
    // Utilidades comunes de la capa cinemática de la Res. 1038
    // ---------------------------------------------------------------------
    const CxPP = {
        esc(s) {
            return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
        },

        num(v, dec) {
            if (v === null || v === undefined || isNaN(v)) return '—';
            const d = dec === undefined ? (Number.isInteger(v) ? 0 : 1) : dec;
            return Number(v).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
        },

        pct(v, dec) {
            return this.num(v, dec === undefined ? 1 : dec) + ' %';
        },

        MESES: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],

        // '2028-08-26' → '26 ago 2028'
        fecha(iso) {
            if (!iso) return '—';
            const [y, m, d] = iso.split('-').map(Number);
            return `${d} ${this.MESES[m - 1]} ${y}`;
        },

        dias(desde, hasta) {
            return Math.round((new Date(hasta + 'T00:00:00') - new Date(desde + 'T00:00:00')) / 86400000);
        },

        // Encabezado-titular de bloque: una idea, acento en degradado
        cabecera(eyebrow, titulo, lead) {
            return `<header class="cx-block-head">
                <span class="cx-eyebrow">${eyebrow}</span>
                <h2>${titulo}</h2>
                ${lead ? `<p>${lead}</p>` : ''}
            </header>`;
        },

        // Botón "Ver tabla" que muestra/oculta la tabla equivalente (INV-09)
        btnTabla(targetId, label) {
            return `<button type="button" class="btn-toggle-table cxpp-tablebtn" aria-expanded="false" aria-controls="${targetId}" onclick="CxPP.toggleTabla(this)">${label || 'Ver tabla'}</button>`;
        },

        toggleTabla(btn) {
            const el = document.getElementById(btn.getAttribute('aria-controls'));
            if (!el) return;
            const abrir = el.hidden;
            el.hidden = !abrir;
            btn.setAttribute('aria-expanded', String(abrir));
            btn.textContent = abrir ? 'Ocultar tabla' : 'Ver tabla';
        },

        // Leyenda RN-NMTPP-05: siempre visible junto a los estados frente a meta
        leyendaLegal() {
            return `<p class="cxpp-legal"><span class="cxpp-legal-mark" aria-hidden="true">§</span><span><strong>Seguimiento informativo, sin efecto jurídico;</strong> la verificación del cumplimiento es de la SSPD (RN-NMTPP-05).</span></p>`;
        },

        // Catálogo cerrado de estados (RN-NMTPP-03) con su codificación doble: color + icono + texto (§7)
        ESTADOS: {
            'meta cumplida': { cls: 'status-meta-cumplida', icon: '✓', corto: 'Meta cumplida', color: '#059669' },
            'en trayectoria': { cls: 'status-en-trayectoria', icon: '↗', corto: 'En trayectoria', color: '#0284c7' },
            'fuera de trayectoria': { cls: 'status-fuera-de-trayectoria', icon: '↘', corto: 'Fuera de trayectoria', color: '#b45309' },
            'meta no alcanzada en el año de cumplimiento': { cls: 'status-meta-no-alcanzada', icon: '✕', corto: 'Meta no alcanzada (año de cumplimiento)', color: '#dc2626' },
            'no exigible aún': { cls: 'status-no-exigible', icon: '⏳', corto: 'No exigible aún', color: '#64748b' },
            'no reportó': { cls: 'status-no-reporto', icon: '⊘', corto: 'No reportó', color: '#334155' },
            'meta no declarada': { cls: 'status-meta-no-declarada', icon: '?', corto: 'Meta no declarada', color: '#e2e8f0', borde: '#64748b' },
            'meta pendiente de aclaración normativa': { cls: 'status-pendiente-aclaracion', icon: '§', corto: 'Pendiente de aclaración (Q)', color: '#bfdbfe', borde: '#0b5e87' },
            'sin fuente confirmada': { cls: 'status-sin-fuente', icon: 'ⓘ', corto: 'Sin fuente confirmada', color: '#e0f2fe', borde: '#38bdf8' },
            'no aplica': { cls: 'status-no-aplica', icon: '—', corto: 'No aplica', color: '#ffffff', borde: '#94a3b8' }
        },

        // Tira de conteos por estado: icono + texto + número (nunca solo color)
        tiraEstados(conteo, opts) {
            const o = opts || {};
            const orden = Object.keys(this.ESTADOS).filter(k => conteo[k] > 0);
            if (!orden.length) return '';
            const total = orden.reduce((a, k) => a + conteo[k], 0);
            const barra = `<div class="cxpp-stack" data-cx-anim aria-hidden="true">${orden.map(k =>
                `<span class="cxpp-st-${this.ESTADOS[k].cls}" style="flex:${conteo[k]}"></span>`).join('')}</div>`;
            return `${o.sinBarra ? '' : barra}
                <ul class="cxpp-states" aria-label="${o.label || 'Conteo por estado'}">
                    ${orden.map(k => `<li><span class="status-pill ${this.ESTADOS[k].cls}"><span class="status-icon" aria-hidden="true">${this.ESTADOS[k].icon}</span> ${this.ESTADOS[k].corto}</span><b>${conteo[k]}</b></li>`).join('')}
                </ul>
                <span class="cx-sr">Total: ${total}</span>`;
        },

        animar(el) {
            if (el && window.CineKit) window.CineKit.animateIn(el);
        }
    };

    window.CxPP = CxPP;

    // ---------------------------------------------------------------------
    // Vista 1
    // ---------------------------------------------------------------------
    const ResumenAdopcion = {
        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const data = window.CRA_NMTPP_DATA;
            const params = window.CRA_NMTPP_PARAMS;
            if (!data || !params) {
                container.innerHTML = '<div class="notice-box warning">Datos no disponibles</div>';
                return;
            }

            const K = window.CineKit;
            const adop = data.adopcion_esperada || {};
            const prestadores = data.prestadores || [];
            const fechaCorte = (data._meta && data._meta.fecha_corte_simulada) || (window.AppNMTPP && window.AppNMTPP.fechaCorte);

            // Totales globales y por segmento, leídos de la adopción esperada
            const seg = { S1: { U: 0, E: 0, R: 0 }, S2: { U: 0, E: 0, R: 0 } };
            let totalU = 0, totalE = 0, totalR = 0;
            for (const sub in adop) {
                const s = sub.slice(0, 2);
                totalU += adop[sub].U;
                totalE += adop[sub].ADO01_inicial;
                totalR += adop[sub].ADO04_recalculo_2028_en_ventana;
                if (seg[s]) {
                    seg[s].U += adop[sub].U;
                    seg[s].E += adop[sub].ADO01_inicial;
                    seg[s].R += adop[sub].ADO04_recalculo_2028_en_ventana;
                }
            }
            const frac = (a, b) => (b > 0 ? a / b : 0);
            const pctE = frac(totalE, totalU) * 100;
            const pctR = frac(totalR, totalU) * 100;

            // Gestores comunitarios y los que optaron por el S1 (ADO-05)
            const gestores = prestadores.filter(p => p.es_gestor_comunitario);
            const optan = gestores.filter(p => p.opcion_s2_a_s1);

            // Ventana del recálculo (H-05) y hito más próximo tras el corte
            const cal = params.calendario || [];
            const h05 = cal.find(h => h.codigo === 'H-05');
            const proximos = cal.filter(h => (h.fecha_inicio || h.fecha) > fechaCorte)
                .sort((a, b) => (a.fecha_inicio || a.fecha).localeCompare(b.fecha_inicio || b.fecha));
            const hito = proximos[0] || null;

            // IRCA: estándar de la norma; el valor no se publica (INV-05)
            const irca = params.metas_acueducto?.S1?.indicadores?.IRCA;
            const ircaTxt = irca?.estandar
                ? (irca.estandar.operador === '<=' ? '≤ ' : irca.estandar.operador + ' ') + CxPP.num(Number(irca.estandar.valor), 1) + ' ' + irca.estandar.unidad
                : 'pendiente de aclaración';

            // Aclaraciones abiertas (dato del escenario) y su prioridad (arreglo de aclaraciones.js)
            const abiertas = (data._meta && data._meta.aclaraciones_abiertas) || [];
            const qs = (window.Aclaraciones && window.Aclaraciones.ACLARACIONES) || [];
            const prio = { 'Crítica': 0, 'Alta': 0, 'Media': 0 };
            qs.forEach(q => { if (prio[q.prioridad] !== undefined) prio[q.prioridad]++; });

            const subs = Object.keys(adop);
            const ring = (f, o) => (K ? K.ring(f, o) : '');
            const meter = (f, o) => (K ? K.meter(f, o) : '');

            const html = `
                ${CxPP.cabecera('Adopción · año tarifario 2027',
                    `<span class="cx-grad">${totalE} de ${totalU}</span> ya presentaron su estudio`,
                    'Estudios de costos iniciales recibidos por la CRA, prestador por prestador.')}

                <div class="cx-bento cxpp-bento">
                    <article class="cx-tile cx-tile-deep cx-on-dark cx-span-3 cxpp-tile-hero">
                        <span class="cx-tile-label">NMTPP-ADO-01 · Estudio inicial</span>
                        <div class="cxpp-ringrow">
                            <div class="cxpp-ringbox">
                                ${ring(frac(totalE, totalU), { size: 168, stroke: 16, tone: 'light', label: `${totalE} de ${totalU} prestadores presentaron su estudio inicial` })}
                                <div class="cxpp-ringnum"><span class="cx-grad-light">${CxPP.num(pctE, 1)}</span><small>%</small></div>
                            </div>
                            <ul class="cxpp-segsplit">
                                ${['S1', 'S2'].map(s => `
                                    <li>
                                        <span class="cxpp-segsplit-l">${s === 'S1' ? 'Empresas (S1)' : 'Gestores comunitarios (S2)'}</span>
                                        <b>${seg[s].E} <small>de ${seg[s].U}</small></b>
                                        ${meter(frac(seg[s].E, seg[s].U), { tone: 'light' })}
                                    </li>`).join('')}
                            </ul>
                        </div>
                    </article>

                    <article class="cx-tile cx-span-3">
                        <span class="cx-tile-label">NMTPP-ADO-04 · Recálculo 2028</span>
                        <h3 class="cx-display-3">Actualizaron <span class="cx-grad">a tiempo</span></h3>
                        <div class="cxpp-ringrow">
                            <div class="cxpp-ringbox cxpp-ringbox-sm">
                                ${ring(frac(totalR, totalU), { size: 128, stroke: 13, label: `${totalR} de ${totalU} prestadores recalcularon dentro de la ventana` })}
                                <div class="cxpp-ringnum cxpp-ringnum-sm"><span class="cx-grad">${CxPP.num(pctR, 1)}</span><small>%</small></div>
                            </div>
                            <p class="cx-tile-note"><b class="cxpp-strong">${totalR} de ${totalU}</b> dentro de la ventana${h05 ? ` del ${CxPP.fecha(h05.fecha_inicio)} al ${CxPP.fecha(h05.fecha)}` : ''}.</p>
                        </div>
                    </article>

                    <article class="cx-tile cx-span-2">
                        <span class="cx-tile-label">Escala</span>
                        <div class="cx-insight-figure"><span class="cx-insight-num">${subs.length}</span> subsegmentos</div>
                        <p class="cx-tile-note">Prestadores en cada tamaño, cada uno con metas propias.</p>
                        <div class="cx-tile-foot cxpp-colsfoot">
                            ${K ? K.columns(subs.map(s => ({ v: adop[s].U, label: s, hi: s.startsWith('S1') })), { height: 96, label: 'Prestadores por subsegmento: ' + subs.map(s => `${s}: ${adop[s].U}`).join(', ') }) : ''}
                        </div>
                    </article>

                    <article class="cx-tile cx-span-2">
                        <span class="cx-tile-label">NMTPP-ADO-05 · Gestores comunitarios</span>
                        <div class="cx-insight-figure"><span class="cx-insight-num">${optan.length}</span> de ${gestores.length} optaron por el S1</div>
                        <div class="cx-tile-foot">
                            <div class="cx-dots cxpp-dots" data-cx-anim role="img" aria-label="${optan.length} de ${gestores.length} gestores comunitarios optaron por la metodología del primer segmento">
                                ${gestores.map(p => `<i class="${p.opcion_s2_a_s1 ? 'b' : 'a'}"></i>`).join('')}
                            </div>
                            <ul class="cx-legend cxpp-legend">
                                <li><span class="cx-key cx-key-b"></span>Optó por el S1</li>
                                <li><span class="cx-key cx-key-a"></span>Sigue en el S2</li>
                            </ul>
                        </div>
                    </article>

                    <article class="cx-tile cx-tile-ice cx-span-2">
                        <span class="cx-tile-label">Calidad del agua · IRCA</span>
                        <div class="cx-insight-figure"><span class="cx-insight-num">${ircaTxt}</span></div>
                        <p class="cx-tile-note">Estándar para todos desde el primer día${irca ? ` (art. ${irca.articulo})` : ''}.</p>
                        <p class="cx-tile-foot"><span class="status-pill status-sin-fuente"><span class="status-icon" aria-hidden="true">ⓘ</span> Sin fuente confirmada (Q-NMTPP-06)</span></p>
                    </article>

                    <article class="cx-tile cx-span-3 cxpp-tile-auto">
                        <span class="cx-tile-label">Aclaraciones que bloquean</span>
                        <div class="cx-insight-figure"><span class="cx-insight-num">${abiertas.length}</span> preguntas abiertas a la CRA</div>
                        ${qs.length ? `
                            <div class="cxpp-qmini" role="img" aria-label="Prioridad de las aclaraciones: ${prio['Crítica']} críticas, ${prio['Alta']} altas y ${prio['Media']} medias">
                                ${qs.map(q => `<i class="cxpp-prio-${q.prioridad === 'Crítica' ? 'c' : (q.prioridad === 'Alta' ? 'a' : 'm')}" title="${q.id}"></i>`).join('')}
                            </div>
                            <ul class="cx-legend cxpp-legend">
                                <li><span class="cx-key cxpp-key-c"></span><b>${prio['Crítica']}</b> críticas</li>
                                <li><span class="cx-key cxpp-key-a"></span><b>${prio['Alta']}</b> altas</li>
                                <li><span class="cx-key cxpp-key-m"></span><b>${prio['Media']}</b> medias</li>
                            </ul>` : ''}
                        <button type="button" class="cx-link cx-tile-foot" onclick="AppNMTPP.mostrarTab('tab-aclaraciones')">Ver qué bloquea cada una</button>
                    </article>

                    <article class="cx-tile cx-span-3 cxpp-tile-auto">
                        <span class="cx-tile-label">Próximo hito${hito ? ' · ' + hito.codigo : ''}</span>
                        ${hito ? `
                            <div class="cx-insight-figure"><span class="cx-insight-num">${CxPP.fecha(hito.fecha_inicio || hito.fecha)}</span></div>
                            <p class="cx-tile-note"><b class="cxpp-strong">${CxPP.esc(hito.hito)}</b> · faltan ${CxPP.num(CxPP.dias(fechaCorte, hito.fecha_inicio || hito.fecha), 0)} días desde el corte simulado.</p>
                        ` : '<p class="cx-tile-note">No hay hitos posteriores a la fecha de corte.</p>'}
                        <button type="button" class="cx-link cx-tile-foot" onclick="AppNMTPP.mostrarTab('tab-calendario')">Ver el calendario completo</button>
                    </article>
                </div>

                ${CxPP.cabecera('Adopción por tamaño', 'Estudio inicial y recálculo, <span class="cx-grad">por subsegmento</span>',
                    'Porcentaje de prestadores de cada grupo; no se comparan grupos entre sí.')}
                <div class="dashboard-panel cxpp-chartpanel">
                    <div class="cxpp-chartbar">${CxPP.btnTabla('adop-table-wrapper')}</div>
                    <div class="chart-wrapper cxpp-chartbox" role="img" aria-label="Barras por subsegmento con el porcentaje de estudios iniciales presentados y de recálculos 2028 en ventana">
                        <canvas id="chart-adopcion-subsegmentos"></canvas>
                    </div>
                    <div class="chart-caption">Fuente: radicados recibidos en la CRA · DATOS SINTÉTICOS DE PROTOTIPO</div>
                    <div id="adop-table-wrapper" hidden>
                        <div class="data-table-container">
                            <table class="data-table" aria-label="Tabla de avance en la adopción por tamaño de acueducto">
                                <thead>
                                    <tr>
                                        <th>Subsegmento</th>
                                        <th>Total prestadores</th>
                                        <th>Estudios iniciales entregados</th>
                                        <th>% adopción inicial</th>
                                        <th>Recálculo 2028 a tiempo</th>
                                        <th>% recálculo oportuno</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${subs.map(sub => `
                                        <tr>
                                            <td><strong>${sub}</strong></td>
                                            <td>${adop[sub].U}</td>
                                            <td>${adop[sub].ADO01_inicial}</td>
                                            <td>${adop[sub].ADO01_pct !== null ? CxPP.pct(adop[sub].ADO01_pct) : '—'}</td>
                                            <td>${adop[sub].ADO04_recalculo_2028_en_ventana}</td>
                                            <td>${adop[sub].ADO04_pct !== null ? CxPP.pct(adop[sub].ADO04_pct) : '—'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                ${CxPP.cabecera('Nivel de servicio · 2027', 'Cada tamaño, frente a <span class="cx-grad">sus propias metas</span>',
                    'Proporción de evaluaciones 2027 en cada estado, dentro de cada subsegmento.')}
                <div class="dashboard-panel cxpp-chartpanel">
                    <div class="cxpp-chartbar">
                        <p class="cxpp-nocomp"><span aria-hidden="true">≠</span> Metas distintas por subsegmento: las columnas no se comparan entre sí (INV-06).</p>
                        ${CxPP.btnTabla('estados-dist-table-wrapper')}
                    </div>
                    <div class="chart-wrapper cxpp-chartbox cxpp-chartbox-tall" role="img" aria-label="Barras 100 % apiladas por subsegmento con la proporción de evaluaciones en cada estado frente a meta en 2027">
                        <canvas id="chart-estados-distribucion"></canvas>
                    </div>
                    <div class="chart-caption">Motor de estados determinista · DATOS SINTÉTICOS DE PROTOTIPO</div>
                    ${CxPP.leyendaLegal()}
                    <div id="estados-dist-table-wrapper" hidden>
                        <div id="estados-dist-table-container"></div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
            CxPP.animar(container);

            this.renderChartAdopcion(adop);
            this.renderChartEstados();
        },

        // Se conserva por compatibilidad con marcados anteriores
        toggleTable(tableWrapperId) {
            const el = document.getElementById(tableWrapperId);
            if (el) el.hidden = !el.hidden;
        },

        renderChartAdopcion(adop) {
            const ctx = document.getElementById('chart-adopcion-subsegmentos');
            if (!ctx || typeof Chart === 'undefined') return;

            const labels = Object.keys(adop);
            // Ausencia ≠ 0 (INV-03): un null queda como hueco, no como barra en cero
            const dataInicial = labels.map(k => adop[k].ADO01_pct);
            const dataRecalculo = labels.map(k => adop[k].ADO04_pct);

            if (window._chartAdopcion) window._chartAdopcion.destroy();

            window._chartAdopcion = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Estudio inicial presentado (%)', data: dataInicial, backgroundColor: '#1664b0', borderRadius: 8, maxBarThickness: 34 },
                        { label: 'Recálculo 2028 en ventana (%)', data: dataRecalculo, backgroundColor: '#38bdf8', borderRadius: 8, maxBarThickness: 34 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { display: false } },
                        y: { beginAtZero: true, max: 100, ticks: { callback: v => v + ' %', maxTicksLimit: 5 } }
                    },
                    plugins: { legend: { position: 'top', align: 'start' } }
                }
            });
        },

        renderChartEstados() {
            const ctx = document.getElementById('chart-estados-distribucion');
            if (!ctx || typeof Chart === 'undefined' || !window.MotorEstados) return;

            const banderas = (window.AppNMTPP && window.AppNMTPP.banderas) || {};
            const evaluados = window.MotorEstados.evaluarTodo(2027, banderas);
            const subsegmentos = Object.keys(window.CRA_NMTPP_DATA.adopcion_esperada || {});
            const porId = {};
            window.CRA_NMTPP_DATA.prestadores.forEach(p => { porId[p.provider_id] = p; });

            // Todos los estados del catálogo, con los colores de §7
            const categorias = Object.keys(CxPP.ESTADOS).map(id => ({ id, label: CxPP.ESTADOS[id].corto, color: CxPP.ESTADOS[id].color, borde: CxPP.ESTADOS[id].borde }));

            const matrix = {};
            for (const sub of subsegmentos) {
                matrix[sub] = {};
                for (const cat of categorias) matrix[sub][cat.id] = 0;
            }
            for (const ev of evaluados) {
                const p = porId[ev.provider_id];
                if (!p) continue;
                const sub = p.subsegmento_vigente;
                if (matrix[sub] && matrix[sub][ev.estado] !== undefined) matrix[sub][ev.estado]++;
            }

            // Solo las categorías con algún caso: menos ruido en la leyenda
            const usadas = categorias.filter(c => subsegmentos.some(s => matrix[s][c.id] > 0));
            // Barras 100 % apiladas: cada subsegmento se lee contra su propio total (spec §4 V1)
            const totales = {};
            subsegmentos.forEach(s => { totales[s] = usadas.reduce((a, c) => a + matrix[s][c.id], 0); });
            const datasets = usadas.map(cat => ({
                label: cat.label,
                data: subsegmentos.map(sub => totales[sub] ? Math.round(matrix[sub][cat.id] * 1000 / totales[sub]) / 10 : null),
                conteo: subsegmentos.map(sub => matrix[sub][cat.id] || 0),
                backgroundColor: cat.color,
                borderColor: cat.borde || cat.color,
                borderWidth: cat.borde ? 1 : 0,
                stack: 'stack0',
                maxBarThickness: 46
            }));

            if (window._chartEstadosDist) window._chartEstadosDist.destroy();

            window._chartEstadosDist = new Chart(ctx, {
                type: 'bar',
                data: { labels: subsegmentos, datasets: datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { stacked: true, grid: { display: false } },
                        y: { stacked: true, beginAtZero: true, max: 100, ticks: { callback: v => v + ' %', maxTicksLimit: 5 } }
                    },
                    plugins: {
                        legend: { position: 'bottom', align: 'start', labels: { boxWidth: 12, boxHeight: 12 } },
                        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.dataset.conteo[c.dataIndex]} de ${totales[subsegmentos[c.dataIndex]]} (${CxPP.num(c.raw, 1)} %)` } }
                    }
                }
            });

            const tblCont = document.getElementById('estados-dist-table-container');
            if (tblCont) {
                tblCont.innerHTML = `
                    <div class="data-table-container">
                        <table class="data-table" aria-label="Evaluaciones por estado y subsegmento, 2027">
                            <thead>
                                <tr><th>Subsegmento</th>${usadas.map(c => `<th>${CxPP.ESTADOS[c.id].icon} ${c.label}</th>`).join('')}</tr>
                            </thead>
                            <tbody>
                                ${subsegmentos.map(sub => `
                                    <tr><td><strong>${sub}</strong></td>${usadas.map(c => `<td>${matrix[sub][c.id] || 0}</td>`).join('')}</tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }
    };

    window.ResumenAdopcion = ResumenAdopcion;

})(window);
