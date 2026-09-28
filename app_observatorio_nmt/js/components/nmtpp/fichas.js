/**
 * fichas.js — Vista 8: Metodología, Visor de Fichas Canónicas y Glosario
 * Cumple Reglas de Oro 2, 4, 5 y ADR-0003
 * Catálogo: 05_.../nmtpp/catalogo-nmtpp.md (25 fichas). Las cifras regulatorias de las
 * descripciones van como {marcas} que se resuelven con CRA_NMTPP_PARAMS (INV-02).
 */

(function(window) {
    'use strict';

    const Fichas = {
        selectedFichaCode: 'NMTPP-ADO-01',
        containerId: 'tab-metodologia-nmtpp',

        selectFicha(code) {
            this.selectedFichaCode = code;
            this.render(this.containerId);
            const btn = document.querySelector(`#${this.containerId} [data-ficha="${code}"]`);
            if (btn) btn.focus({ preventScroll: true });
            const det = document.getElementById('ficha-detalle');
            if (det && window.matchMedia('(max-width: 860px)').matches) det.scrollIntoView({ block: 'start' });
        },

        FAMILIAS: ['Adopción', 'Servicio', 'Régimen especial', 'Transversal', 'Eficiencia', 'Tarifa'],

        FICHAS_CATALOGO: [
            { code: 'NMTPP-ADO-01', nombre: 'Estudio de costos recibido por la CRA', dim: 'SEG', capa: 'Adopción', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.2.9.1; 2.1.1.1.3.2.5.1-2', unidad: '%', desc: 'Porcentaje de prestadores del ámbito que remitieron su estudio de costos inicial o de actualización a la CRA.' },
            { code: 'NMTPP-ADO-02', nombre: 'Concordancia del subsegmento declarado con el calculado', dim: 'SEG', capa: 'Adopción', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.1.6 (Q-NMTPP-03)', unidad: 'Binario / Conteo', desc: 'Monitorea la coincidencia entre la clasificación resultante de la regla legal frente a lo radicado por el prestador.' },
            { code: 'NMTPP-ADO-03', nombre: 'APS de acueducto definida y reportada', dim: 'SEG', capa: 'Adopción', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.1.1; 2.1.1.1.1.7', unidad: '%', desc: 'Verifica la delimitación geográfica y reporte en SUI de las Áreas de Prestación del Servicio atendidas.' },
            { code: 'NMTPP-ADO-04', nombre: 'Recálculo anual oportuno', dim: 'SEG', capa: 'Adopción', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.2.1.2; 2.1.1.1.3.2.2.6', unidad: '%', desc: 'Porcentaje de prestadores que efectúan y remiten su recálculo tarifario anual dentro de la ventana {VENTANA}.' },
            { code: 'NMTPP-ADO-05', nombre: 'Gestores comunitarios que optan por el S1', dim: 'SEG', capa: 'Adopción', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.1.6 par. 4', unidad: 'Conteo / %', desc: 'Seguimiento a los gestores comunitarios que voluntariamente deciden aplicar la metodología del Primer Segmento.' },
            { code: 'NMTPP-S1-CAL', nombre: 'IRCA frente al estándar (S1)', dim: 'CAL', capa: 'Servicio', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.2.1.2 par. 3 (Q-NMTPP-06)', unidad: '%', desc: 'Índice de Riesgo de la Calidad del Agua Potable frente al estándar de IRCA {IRCA}.' },
            { code: 'NMTPP-S1-MIC', nombre: 'Micromedición efectiva (S1)', dim: 'EFI', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.1.2', unidad: '%', desc: 'Porcentaje de suscriptores con micromedición en servicio frente a metas y estándar final del {MIC_S1}.' },
            { code: 'NMTPP-S1-CON', nombre: 'Continuidad: cierre de brecha (S1)', dim: 'CON', capa: 'Servicio', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.2.1.2; Anexo 6.2.1.10 (Q-NMTPP-01)', unidad: 'h/día o %', desc: 'Seguimiento al cierre de brecha frente al estándar anualizado de continuidad del servicio ({CON_S1}).' },
            { code: 'NMTPP-S1-MAC', nombre: 'Macromedición efectiva (S1)', dim: 'EFI', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.1.2', unidad: '%', desc: 'Medición de caudales producidos en bocatoma y planta frente al estándar obligatorio del {MAC_S1}.' },
            { code: 'NMTPP-S1-COB', nombre: 'Cobertura frente a meta declarada (S1)', dim: 'COB', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.1.2', unidad: '%', desc: 'Evolución de la cobertura real frente a la senda declarada por el prestador en su estudio de costos.' },
            { code: 'NMTPP-S1-PER', nombre: 'IPUF frente a IPUF* y senda declarada (S1)', dim: 'PER', capa: 'Servicio', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.2.1.2 par. 7 (Q-NMTPP-07)', unidad: 'm³/susc/mes', desc: 'Pérdidas de agua por usuario facturado frente al estándar eficiente IPUF* {IPUF}.' },
            { code: 'NMTPP-S1-PSH', nombre: 'Plan de Sostenibilidad Hídrica (S1-1)', dim: 'CLI', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.1.2', unidad: 'Binario', desc: 'Adopción e implementación formal del plan para prestadores del subsegmento mayor ({RANGO_S1-1} suscriptores).' },
            { code: 'NMTPP-S2-CAL', nombre: 'IRCA frente al estándar (gestores comunitarios)', dim: 'CAL', capa: 'Servicio', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.3.1.2 par. 3 (Q-NMTPP-06)', unidad: '%', desc: 'Monitoreo de calidad de agua en gestores comunitarios frente al estándar sin riesgo IRCA {IRCA}.' },
            { code: 'NMTPP-S2-MIC', nombre: 'Micromedición residencial (gestores comunitarios)', dim: 'EFI', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.3.1.2', unidad: '%', desc: 'Instalación de micromedidores en usuarios residenciales según subsegmento S2.' },
            { code: 'NMTPP-S2-CON', nombre: 'Continuidad: cierre de brecha (gestores comunitarios)', dim: 'CON', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.3.1.2 (Q-NMTPP-02)', unidad: '%', desc: 'Cierre de brecha de continuidad evaluada porcentualmente según Anexo 6.2.1.10 b) (estándar {CON_S2}).' },
            { code: 'NMTPP-S2-MAC', nombre: 'Macromedición de dos puntos (gestores comunitarios)', dim: 'EFI', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.3.1.2', unidad: '%', desc: 'Medición de captación y distribución obligatoria en el año de cumplimiento del subsegmento para gestores comunitarios.' },
            { code: 'NMTPP-ESP-01', nombre: 'APS con condición especial estructural', dim: 'SEG', capa: 'Régimen especial', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.4.1', unidad: 'Conteo / %', desc: 'Identificación de APS que aplican estándares diferenciales del S2 por zona insular, IVH, IPM o PDET.' },
            { code: 'NMTPP-EDR-01', nombre: 'Micromedición en esquema diferencial rural', dim: 'EFI', capa: 'Régimen especial', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.6.1 par. 1, 2, 5 y 6 (Q-NMTPP-09)', unidad: '%', desc: 'Suscriptores con medición en operación en APS con esquema diferencial rural, frente a la meta anual del Plan de Gestión (estándar {EDR_MIC}); nunca por debajo de la situación inicial. Fuera del prototipo.' },
            { code: 'NMTPP-EDR-02', nombre: 'Continuidad en esquema diferencial rural', dim: 'CON', capa: 'Régimen especial', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.6.1 par. 1, 3 y 5 (Q-NMTPP-09)', unidad: '%', desc: 'Porcentaje del tiempo con servicio en APS con esquema diferencial rural frente a la meta anual del Plan de Gestión (estándar {EDR_CON}). Fuera del prototipo.' },
            { code: 'NMTPP-NRG-01', nombre: 'Regresión frente a la línea base', dim: 'SEG', capa: 'Transversal', estado: 'COMPLETA', norma: 'Res. 1038 arts. 2.1.1.1.1.4, 2.1.1.1.2.1.1, 2.1.1.1.3.1.1', unidad: 'Conteo / Alerta', desc: 'Control analítico interno que detecta retrocesos en continuidad, cobertura o pérdidas frente a la línea base.' },
            { code: 'NMTPP-ISE-01', nombre: 'ISE publicado por la CRA', dim: 'SEG', capa: 'Eficiencia', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.2.2.7.1 (Q-NMTPP-04)', unidad: 'Índice (0-100)', desc: 'Ingesta de la publicación oficial expedida por la CRA del Índice Sintético de Eficiencia para el S1.' },
            { code: 'NMTPP-ISE-02', nombre: 'Oportunidad de la publicación del ISE', dim: 'SEG', capa: 'Eficiencia', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.2.7.1 par. 2', unidad: 'Días / Estado', desc: 'Verifica que la CRA publique el ISE al menos {ISE_MESES} meses antes del inicio del año tarifario respectivo.' },
            { code: 'NMTPP-INC-01', nombre: 'Incentivos reconocidos por tipo', dim: 'SEG', capa: 'Eficiencia', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.2.6.2-3', unidad: 'Conteo / %', desc: 'Número y porcentaje de operadores del S1 que reciben incentivos sobre el CMOG (+{CMOG3} el año 3) y el CMA (+{CMA3} el año 3).' },
            { code: 'NMTPP-INC-02', nombre: '100 % de reportes obligatorios al SUI', dim: 'SEG', capa: 'Eficiencia', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.2.2.6.3 num. 4 y par. 5 (Q-NMTPP-12)', unidad: '%', desc: 'Proporción de prestadores del S1 que cumplieron todos los reportes obligatorios al SUI vencidos en el año evaluado; sin la lista de la SSPD queda en "sin fuente confirmada".' },
            { code: 'NMTPP-TAR-01', nombre: 'Tarifa aplicada por estrato y uso frente a la Res. 825', dim: 'SEG', capa: 'Tarifa', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.8.1 y num. 10 estudio', unidad: '$/factura y %', desc: 'Variación de cargos fijos y por consumo por estrato socioeconómico frente al marco tarifario anterior.' }
        ],

        GLOSARIO: [
            { termino: 'Subsegmento (escala del acueducto)', def: 'Clasificación según el número de suscriptores con corte a {CORTE_SEG}. Permite fijar metas graduales y proporcionadas para no sobrecargar a los operadores más pequeños.' },
            { termino: 'Gestor comunitario', def: 'Organización comunitaria (junta de agua, asociación de usuarios o cabildo) que administra y cuida el acueducto en veredas, corregimientos y zonas rurales.' },
            { termino: 'Año tarifario', def: 'Período de 1 de enero a 31 de diciembre en el que se aplican las tarifas y se evalúa el cumplimiento de metas (el año 1 es {ANIO1}).' },
            { termino: 'Línea base (punto de partida)', def: 'Situación real de los indicadores al final de la vigencia de la Res. CRA 825 de 2017. Es la foto inicial que se usa para medir avances y evitar retrocesos.' },
            { termino: 'Meta regulatoria', def: 'Meta exigida por la Resolución CRA 1038 para un año específico, diseñada para mejorar el servicio de manera progresiva.' },
            { termino: 'Meta declarada en estudio', def: 'Proyección anual que el propio acueducto fijó y radicó ante la CRA en su estudio de costos según sus planes de inversión.' },
            { termino: 'Referente eficiente de pérdidas (IPUF*)', def: 'Nivel de pérdidas de referencia: {IPUF} (art. 2.1.1.1.1.3).' },
            { termino: 'Índice Sintético de Eficiencia (ISE)', def: 'Calificación oficial anual de la CRA (de 0 a 100) del desempeño técnico, administrativo y financiero de los operadores del S1, que define estímulos tarifarios.' },
            { termino: 'Condición territorial especial', def: 'Circunstancia de vulnerabilidad (islas, escasez de agua, alta pobreza, PDET/ZOMAC o toma de posesión) que activa los estándares del segundo segmento.' }
        ],

        // Marcas {X} → valor leído de los parámetros; si falta, "pendiente de aclaración"
        marcas() {
            const P = window.CRA_NMTPP_PARAMS || {};
            const U = window.CxPP;
            const n = v => (U ? U.num(Number(v)) : String(v));
            const est = e => (e ? `${e.operador === '<=' ? '≤' : (e.operador === '>=' ? '≥' : '')} ${n(e.valor)} ${e.unidad === 'm3/suscriptor/mes' ? 'm³/susc/mes' : e.unidad}`.trim() : null);
            const s1 = P.metas_acueducto?.S1?.indicadores || {};
            const s2 = P.metas_acueducto?.S2?.indicadores || {};
            const edr = P.regimenes_especiales_acueducto?.esquema_diferencial_rural?.estandares || {};
            const inc = P.incentivos_s1 || {};
            const h05 = (P.calendario || []).find(h => h.codigo === 'H-05');
            const sub11 = (P.segmentos || []).flatMap(s => s.subsegmentos || []).find(s => s.id === 'S1-1');
            return {
                IRCA: est(s1.IRCA?.estandar),
                MIC_S1: s1.MICROMEDICION ? `${n(s1.MICROMEDICION.estandar.valor)} %` : null,
                MAC_S1: s1.MACROMEDICION ? `${n(s1.MACROMEDICION.estandar.valor)} %` : null,
                CON_S1: est(s1.CONTINUIDAD?.estandar),
                CON_S2: est(s2.CONTINUIDAD?.estandar),
                IPUF: est(s1.IPUF?.estandar),
                EDR_MIC: edr.MICROMEDICION !== undefined ? `${n(edr.MICROMEDICION)} %` : null,
                EDR_CON: edr.CONTINUIDAD !== undefined ? `${n(edr.CONTINUIDAD)} %` : null,
                CMOG3: inc.cmog?.porcentajes?.anio_3 !== undefined ? `${n(inc.cmog.porcentajes.anio_3)} %` : null,
                CMA3: inc.cma?.porcentajes?.anio_3 !== undefined ? `${n(inc.cma.porcentajes.anio_3)} %` : null,
                ISE_MESES: P.ise?.publicacion?.anticipacion_minima_meses,
                VENTANA: h05 && U ? `del ${U.fecha(h05.fecha_inicio).replace(/ \d{4}$/, '')} al ${U.fecha(h05.fecha).replace(/ \d{4}$/, '')}` : null,
                'RANGO_S1-1': sub11 ? `${n(sub11.min_exclusivo + 1)} a ${n(sub11.max_inclusivo)}` : null,
                CORTE_SEG: P.reglas_segmentacion && U ? U.fecha(P.reglas_segmentacion.fecha_corte) : null,
                ANIO1: P.marco_tarifario ? P.marco_tarifario.anio_tarifario_1 : null
            };
        },

        texto(s, m) {
            return String(s).replace(/\{([A-Z0-9_-]+)\}/g, (_, k) => (m[k] !== null && m[k] !== undefined ? m[k] : 'pendiente de aclaración'));
        },

        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            this.containerId = containerId;

            const U = window.CxPP;
            const K = window.CineKit;
            const m = this.marcas();
            const cat = this.FICHAS_CATALOGO;
            const fichaActiva = cat.find(f => f.code === this.selectedFichaCode) || cat[0];
            const completas = cat.filter(f => f.estado === 'COMPLETA').length;
            const parciales = cat.length - completas;
            const porFam = this.FAMILIAS.map(fam => ({ fam, fichas: cat.filter(f => f.capa === fam) }));
            const esc = U ? U.esc.bind(U) : (s => s);

            const html = `
                ${U.cabecera('Guía metodológica',
                    `${cat.length} fichas, <span class="cx-grad">una por indicador</span>`,
                    'Definición, norma y unidad de cada indicador de la Res. CRA 1038, agrupados por familia.')}

                <div class="cx-bento cxpp-bento">
                    <article class="cx-tile cx-span-2 cxpp-tile-auto">
                        <span class="cx-tile-label">Estado de las fichas</span>
                        <div class="cxpp-ringrow">
                            <div class="cxpp-ringbox cxpp-ringbox-sm">
                                ${K ? K.ring(completas / cat.length, { size: 128, stroke: 13, label: `${completas} de ${cat.length} fichas completas` }) : ''}
                                <div class="cxpp-ringnum cxpp-ringnum-sm"><span class="cx-grad">${completas}</span><small>/${cat.length}</small></div>
                            </div>
                            <ul class="cx-legend cxpp-legend-col">
                                <li><span class="cxpp-fshape cxpp-fshape-ok" aria-hidden="true"></span><b>${completas}</b> documentadas</li>
                                <li><span class="cxpp-fshape cxpp-fshape-rev" aria-hidden="true"></span><b>${parciales}</b> en revisión</li>
                            </ul>
                        </div>
                    </article>
                    <article class="cx-tile cx-span-4 cxpp-tile-auto">
                        <span class="cx-tile-label">Fichas por familia</span>
                        <div class="cxpp-colsfoot cx-tile-foot">
                            ${K ? K.columns(porFam.map(x => ({ v: x.fichas.length, label: `${({ 'Régimen especial': 'Especial', 'Transversal': 'Transv.' })[x.fam] || x.fam} ${x.fichas.length}`, hi: x.fam === fichaActiva.capa })), { height: 120, label: 'Fichas por familia: ' + porFam.map(x => `${x.fam} ${x.fichas.length}`).join(', ') }) : ''}
                        </div>
                    </article>
                </div>

                <div class="cxpp-fichas">
                    <nav class="cxpp-findex" aria-label="Índice de fichas por familia">
                        ${porFam.map(x => `
                            <section class="cxpp-fam">
                                <h3 class="cxpp-fam-t">${x.fam} <span>${x.fichas.length}</span></h3>
                                <div class="cxpp-fam-list">
                                    ${x.fichas.map(f => `
                                        <button type="button" class="cxpp-fbtn" data-ficha="${f.code}" aria-pressed="${f.code === fichaActiva.code}" aria-controls="ficha-detalle" onclick="Fichas.selectFicha('${f.code}')">
                                            <span class="cxpp-fshape ${f.estado === 'COMPLETA' ? 'cxpp-fshape-ok' : 'cxpp-fshape-rev'}" aria-hidden="true"></span>
                                            <span class="cxpp-fbtn-t"><b>${f.code.replace('NMTPP-', '')}</b>${esc(f.nombre)}</span>
                                            <span class="cx-sr">${f.estado === 'COMPLETA' ? 'documentada' : 'en revisión'}</span>
                                        </button>`).join('')}
                                </div>
                            </section>`).join('')}
                    </nav>

                    <article class="cxpp-fdet" id="ficha-detalle" aria-live="polite">
                        <div class="cxpp-fdet-top">
                            <span class="cx-tile-label">${fichaActiva.dim} · ${fichaActiva.capa}</span>
                            <span class="cxpp-fstate ${fichaActiva.estado === 'COMPLETA' ? 'is-ok' : 'is-rev'}"><span class="cxpp-fshape ${fichaActiva.estado === 'COMPLETA' ? 'cxpp-fshape-ok' : 'cxpp-fshape-rev'}" aria-hidden="true"></span>${fichaActiva.estado === 'COMPLETA' ? 'Ficha documentada' : 'En revisión (ficha parcial)'}</span>
                        </div>
                        <h3 class="cxpp-fdet-name">${esc(fichaActiva.nombre)}</h3>
                        <p class="cxpp-fdet-code">${fichaActiva.code}</p>
                        <p class="cxpp-fdet-desc">${esc(this.texto(fichaActiva.desc, m))}</p>
                        <dl class="cxpp-fdet-grid">
                            <div><dt>Sustento normativo</dt><dd>${esc(fichaActiva.norma)}</dd></div>
                            <div><dt>Unidad</dt><dd class="mono">${esc(fichaActiva.unidad)}</dd></div>
                            <div><dt>Compuerta de publicación</dt><dd>Ficha + semáforo de calidad (ADR-0003)</dd></div>
                            <div><dt>Fuente institucional</dt><dd>CRA / SUI Superservicios</dd></div>
                        </dl>
                    </article>
                </div>

                ${U.cabecera('Glosario', 'Conceptos clave, <span class="cx-grad">en palabras sencillas</span>', '')}
                <dl class="cxpp-glosario">
                    ${this.GLOSARIO.map(g => `<div><dt>${esc(g.termino)}</dt><dd>${esc(this.texto(g.def, m))}</dd></div>`).join('')}
                </dl>
            `;

            container.innerHTML = html;
            if (U) U.animar(container);
        }
    };

    window.Fichas = Fichas;

})(window);
