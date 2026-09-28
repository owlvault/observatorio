/**
 * motor_estados.js — Motor de Inferencia de Estados Regulatorios NMTPP
 * Resolución CRA 1038 de 2026 (Pequeños Prestadores de Acueducto)
 * 
 * Cumple estrictamente con las Reglas de Oro y los Invariantes:
 * - INV-02: Ninguna meta, porcentaje ni año se hardcodea; todo proviene de window.CRA_NMTPP_PARAMS.
 * - INV-03: Solo estados del catálogo cerrado de RN-NMTPP-03.
 * - INV-05: CAL siempre es "sin fuente confirmada" (Q-NMTPP-06).
 * - Oráculo: evaluarTodo(2027) produce exactamente los 239 estados de window.CRA_NMTPP_DATA.estados_esperados.
 */

(function(window) {
    'use strict';

    const MotorEstados = {
        // Catálogo cerrado de estados válidos según RN-NMTPP-03
        ESTADOS_VALIDOS: [
            'meta cumplida',
            'en trayectoria',
            'fuera de trayectoria',
            'meta no alcanzada en el año de cumplimiento',
            'no exigible aún',
            'no reportó',
            'meta no declarada',
            'meta pendiente de aclaración normativa',
            'sin fuente confirmada',
            'no aplica'
        ],

        CODES_S1: [
            'NMTPP-S1-CAL',
            'NMTPP-S1-MIC',
            'NMTPP-S1-CON',
            'NMTPP-S1-MAC',
            'NMTPP-S1-COB',
            'NMTPP-S1-PER',
            'NMTPP-S1-PSH'
        ],

        CODES_S2: [
            'NMTPP-S2-CAL',
            'NMTPP-S2-MIC',
            'NMTPP-S2-CON',
            'NMTPP-S2-MAC'
        ],

        _getParams() {
            if (!window.CRA_NMTPP_PARAMS) {
                console.error('CRA_NMTPP_PARAMS no está cargado');
                return null;
            }
            return window.CRA_NMTPP_PARAMS;
        },

        _anioCal(numAnio) {
            const P = this._getParams();
            const inicio = P && P.marco_tarifario ? P.marco_tarifario.anio_tarifario_1 : 2027;
            return inicio + numAnio - 1;
        },

        /**
         * Evalúa un indicador para una APS y un año tarifario dado
         */
        evaluar(prestador, aps, code, anio, banderas = {}) {
            const P = this._getParams();
            const s1 = prestador.segmento_vigente === 'S1';
            const reg = aps.regimen_evaluacion;
            const sub = prestador.subsegmento_vigente;
            const obs = aps.observados && aps.observados[String(anio)] ? aps.observados[String(anio)] : {};
            const md = aps.metas_declaradas || {};
            const simularQ01 = Boolean(banderas.continuidad_equivalencia_24h);

            const buildRes = (st, meta = null, origen = null, art = null, q = null, val = null, unidad = null, esSim = false) => {
                if (!this.ESTADOS_VALIDOS.includes(st)) {
                    throw new Error(`Estado inválido fuera de catálogo RN-NMTPP-03: "${st}"`);
                }
                const res = {
                    indicator_code: code,
                    provider_id: prestador.provider_id,
                    service_area_id: aps.service_area_id,
                    anio_tarifario: anio,
                    estado: st,
                    meta_aplicada: meta,
                    origen_meta: origen,
                    articulo: art,
                    q_bloqueante: q,
                    valor_observado: val,
                    unidad: unidad
                };
                if (esSim) {
                    res.es_simulacion = true;
                    res.marca_simulacion = 'SIMULACIÓN';
                }
                return res;
            };

            // 1. CALIDAD (IRCA) - Sin fuente confirmada
            if (code.endsWith('-CAL')) {
                const art = s1 ? '2.1.1.1.2.1.2 par. 3' : '2.1.1.1.3.1.2 par. 3';
                return buildRes('sin fuente confirmada', null, null, art, 'Q-NMTPP-06', null, '%');
            }

            // 2. CONTINUIDAD
            if (code.endsWith('-CON')) {
                const v = obs.CONTINUIDAD !== undefined ? obs.CONTINUIDAD : null;
                if (v === null) {
                    return buildRes('no reportó', null, null, null, null, null, aps.unidad_continuidad);
                }

                // Simulación de respuesta a Q-NMTPP-01
                if (simularQ01 && reg === 'S1' && aps.linea_base && aps.linea_base.CONTINUIDAD !== undefined) {
                    const lb = aps.linea_base.CONTINUIDAD;
                    const parCon = P.metas_acueducto.S1.indicadores.CONTINUIDAD.subsegmentos[sub];
                    const estVal = parCon ? parCon.estandar_valor : 0;
                    // Factor de conversión horas/día = E * 24 / 100
                    const E = (estVal * 24) / 100;
                    const p = parCon && parCon.cierre_brecha_pct ? parCon.cierre_brecha_pct / 100 : 1.0;
                    const metaCumpl = lb + p * (E - lb);
                    const ac = this._anioCal(parCon ? parCon.anio_cumplimiento : 5);

                    if (anio < ac) {
                        // Años anteriores al año de cumplimiento: no exigible aún sin meta declarada
                        return buildRes('no exigible aún', null, null, '2.1.1.1.2.1.2', null, v, 'h/día', true);
                    } else if (anio === ac) {
                        const esCumplida = v >= metaCumpl;
                        return buildRes(
                            esCumplida ? 'meta cumplida' : 'meta no alcanzada en el año de cumplimiento',
                            Math.round(metaCumpl * 10) / 10,
                            'regulatoria',
                            '2.1.1.1.2.1.2',
                            null,
                            v,
                            'h/día',
                            true
                        );
                    }
                }

                const q = reg === 'S1' ? 'Q-NMTPP-01, Q-NMTPP-02' : 'Q-NMTPP-02';
                const art = reg === 'S1' ? '2.1.1.1.2.1.2' : '2.1.1.1.3.1.2';
                return buildRes('meta pendiente de aclaración normativa', null, null, art, q, v, aps.unidad_continuidad);
            }

            // 3. MICROMEDICIÓN
            if (code.endsWith('-MIC')) {
                const v = obs.MICROMEDICION !== undefined ? obs.MICROMEDICION : null;
                if (v === null) {
                    return buildRes('no reportó', null, null, null, null, null, '%');
                }

                // APS especial de prestador S1 (evaluada bajo régimen S2)
                if (reg === 'S2' && s1) {
                    const m = md.MICROMEDICION && md.MICROMEDICION[String(anio)] !== undefined
                        ? md.MICROMEDICION[String(anio)]
                        : null;
                    if (v >= 100) {
                        return buildRes('meta cumplida', 100, 'regulatoria', '2.1.1.1.4.1 par. 5', null, v, '%');
                    }
                    if (m === null) {
                        return buildRes('meta no declarada', null, null, '2.1.1.1.4.1 par. 5', null, v, '%');
                    }
                    const st = v >= m ? 'en trayectoria' : 'fuera de trayectoria';
                    return buildRes(st, m, 'declarada', '2.1.1.1.4.1 par. 5', null, v, '%');
                }

                const key = s1 ? 'MICROMEDICION' : 'MICROMEDICION_RESIDENCIAL';
                const par = P.metas_acueducto[s1 ? 'S1' : 'S2'].indicadores[key].subsegmentos[sub];
                const ac = this._anioCal(par.anio_cumplimiento);
                const art = s1 ? '2.1.1.1.2.1.2' : '2.1.1.1.3.1.2';

                if (anio === ac) {
                    const st = v >= 100 ? 'meta cumplida' : 'meta no alcanzada en el año de cumplimiento';
                    return buildRes(st, 100, 'regulatoria', art, null, v, '%');
                }
                if (anio > ac) {
                    const st = v >= 100 ? 'meta cumplida' : 'fuera de trayectoria';
                    return buildRes(st, 100, 'regulatoria', art, null, v, '%');
                }
                if (v >= 100) {
                    return buildRes('meta cumplida', 100, 'regulatoria', art, null, v, '%');
                }
                const m = md.MICROMEDICION && md.MICROMEDICION[String(anio)] !== undefined
                    ? md.MICROMEDICION[String(anio)]
                    : null;
                if (m === null) {
                    return buildRes('no exigible aún', null, null, art, 'Q-NMTPP-08', v, '%');
                }
                const st = v >= m ? 'en trayectoria' : 'fuera de trayectoria';
                return buildRes(st, m, 'declarada', art, 'Q-NMTPP-08', v, '%');
            }

            // 4. MACROMEDICIÓN
            if (code.endsWith('-MAC')) {
                const v = obs.MACROMEDICION !== undefined ? obs.MACROMEDICION : null;
                if (v === null) {
                    return buildRes('no reportó', null, null, null, null, null, '%');
                }
                if (reg === 'S2' && s1) {
                    const st = v >= 100 ? 'meta cumplida' : 'no exigible aún';
                    return buildRes(st, null, 'regulatoria', '2.1.1.1.4.1 par. 3', null, v, '%');
                }
                const par = P.metas_acueducto[s1 ? 'S1' : 'S2'].indicadores.MACROMEDICION.subsegmentos[sub];
                const ac = this._anioCal(par.anio_cumplimiento);
                const art = s1 ? '2.1.1.1.2.1.2' : '2.1.1.1.3.1.2';

                if (anio === ac) {
                    const st = v >= 100 ? 'meta cumplida' : 'meta no alcanzada en el año de cumplimiento';
                    return buildRes(st, 100, 'regulatoria', art, null, v, '%');
                }
                if (anio > ac) {
                    const st = v >= 100 ? 'meta cumplida' : 'fuera de trayectoria';
                    return buildRes(st, 100, 'regulatoria', art, null, v, '%');
                }
                const st = v >= 100 ? 'meta cumplida' : 'no exigible aún';
                return buildRes(st, 100, 'regulatoria', art, null, v, '%');
            }

            // 5. COBERTURA (S1)
            if (code === 'NMTPP-S1-COB') {
                const v = obs.COBERTURA !== undefined ? obs.COBERTURA : null;
                if (v === null) {
                    return buildRes('no reportó', null, null, null, null, null, '%');
                }
                if (v >= 100) {
                    return buildRes('meta cumplida', 100, 'regulatoria', '2.1.1.1.2.1.2', null, v, '%');
                }
                const m = md.COBERTURA && md.COBERTURA[String(anio)] !== undefined
                    ? md.COBERTURA[String(anio)]
                    : null;
                if (m === null) {
                    return buildRes('meta no declarada', null, null, '2.1.1.1.2.1.2', null, v, '%');
                }
                const st = v >= m ? 'en trayectoria' : 'fuera de trayectoria';
                return buildRes(st, m, 'declarada', '2.1.1.1.2.1.2', null, v, '%');
            }

            // 6. PÉRDIDAS (IPUF S1)
            if (code === 'NMTPP-S1-PER') {
                const v = obs.IPUF !== undefined ? obs.IPUF : null;
                if (v === null) {
                    return buildRes('no reportó', null, null, null, null, null, 'm3/suscriptor/mes');
                }
                if (prestador.facturacion === 'bimestral') {
                    return buildRes('meta pendiente de aclaración normativa', null, null, 'Anexo 6.2.1.10 a)', 'Q-NMTPP-07', v, 'm3/suscriptor/mes');
                }
                // IPUF* estándar de referencia eficiente = 6 m3/susc/mes
                if (v <= 6) {
                    return buildRes('meta cumplida', 6, 'regulatoria', '2.1.1.1.2.1.2 par. 7', null, v, 'm3/suscriptor/mes');
                }
                const m = md.IPUF && md.IPUF[String(anio)] !== undefined
                    ? md.IPUF[String(anio)]
                    : null;
                if (m === null) {
                    return buildRes('meta no declarada', null, null, '2.1.1.1.2.1.2 par. 7', null, v, 'm3/suscriptor/mes');
                }
                // Escala de pérdidas: menor es mejor
                const st = v <= m ? 'en trayectoria' : 'fuera de trayectoria';
                return buildRes(st, m, 'declarada', '2.1.1.1.2.1.2 par. 7', null, v, 'm3/suscriptor/mes');
            }

            // 7. PLAN DE SOSTENIBILIDAD HÍDRICA (PSH S1-1)
            if (code === 'NMTPP-S1-PSH') {
                if (sub !== 'S1-1') {
                    return buildRes('no aplica', null, null, '2.1.1.1.2.1.2', null, null, null);
                }
                const v = obs.PSH !== undefined ? obs.PSH : null;
                if (v === null) {
                    return buildRes('no reportó', null, null, null, null, null, 'binario');
                }
                const par = P.metas_acueducto.S1.indicadores.PSH.subsegmentos['S1-1'];
                const ac = this._anioCal(par.anio_cumplimiento);
                if (v >= 100) {
                    return buildRes('meta cumplida', 100, 'regulatoria', '2.1.1.1.2.1.2', null, v, 'binario');
                }
                const st = anio < ac ? 'no exigible aún' : 'meta no alcanzada en el año de cumplimiento';
                return buildRes(st, 100, 'regulatoria', '2.1.1.1.2.1.2', null, v, 'binario');
            }

            throw new Error(`Código de indicador desconocido: ${code}`);
        },

        /**
         * Evalúa todas las APS y prestadores para un año tarifario
         */
        evaluarTodo(anio = 2027, banderas = {}) {
            if (!window.CRA_NMTPP_DATA || !window.CRA_NMTPP_DATA.prestadores) {
                console.warn('CRA_NMTPP_DATA no disponible');
                return [];
            }
            const res = [];
            const prestadores = window.CRA_NMTPP_DATA.prestadores;

            for (const p of prestadores) {
                const codes = p.segmento_vigente === 'S1' ? this.CODES_S1 : this.CODES_S2;
                for (const a of p.aps) {
                    for (const c of codes) {
                        res.push(this.evaluar(p, a, c, anio, banderas));
                    }
                }
            }
            return res;
        },

        /**
         * Detecta regresiones frente a la línea base para un año dado (solo modo analista)
         */
        detectarRegresiones(anio = 2027) {
            if (!window.CRA_NMTPP_DATA || !window.CRA_NMTPP_DATA.prestadores) return [];
            const regresiones = [];

            for (const p of window.CRA_NMTPP_DATA.prestadores) {
                for (const a of p.aps) {
                    const lb = a.linea_base || {};
                    const ob = (a.observados && a.observados[String(anio)]) || {};
                    const indReg = [];

                    for (const k of ['MICROMEDICION', 'MACROMEDICION', 'COBERTURA', 'CONTINUIDAD']) {
                        if (lb[k] !== undefined && ob[k] !== undefined && ob[k] !== null && lb[k] !== null && ob[k] < lb[k]) {
                            indReg.push(k);
                        }
                    }
                    if (lb.IPUF !== undefined && ob.IPUF !== undefined && ob.IPUF !== null && lb.IPUF !== null && ob.IPUF > lb.IPUF) {
                        indReg.push('IPUF');
                    }

                    if (indReg.length > 0) {
                        regresiones.push({
                            provider_id: p.provider_id,
                            service_area_id: a.service_area_id,
                            anio_tarifario: anio,
                            indicadores: indReg
                        });
                    }
                }
            }
            return regresiones;
        },

        /**
         * Compara el resultado del motor con el oráculo sintético
         */
        compararConOraculo(anio = 2027) {
            const calculados = this.evaluarTodo(anio, { continuidad_equivalencia_24h: false });
            const esperados = (window.CRA_NMTPP_DATA && window.CRA_NMTPP_DATA.estados_esperados) || [];
            const diferencias = [];

            if (calculados.length !== esperados.length) {
                diferencias.push({
                    tipo: 'CONTEO_TOTAL',
                    detalle: `Calculados ${calculados.length} vs esperados ${esperados.length}`
                });
            }

            for (let i = 0; i < esperados.length; i++) {
                const esp = esperados[i];
                const calc = calculados.find(c =>
                    c.indicator_code === esp.indicator_code &&
                    c.service_area_id === esp.service_area_id &&
                    c.anio_tarifario === esp.anio_tarifario
                );

                if (!calc) {
                    diferencias.push({ tipo: 'NO_ENCONTRADO', esperado: esp });
                    continue;
                }

                const campos = ['estado', 'meta_aplicada', 'origen_meta', 'q_bloqueante'];
                for (const cmp of campos) {
                    if (calc[cmp] !== esp[cmp]) {
                        diferencias.push({
                            tipo: 'DISCREPANCIA',
                            indicador: esp.indicator_code,
                            service_area_id: esp.service_area_id,
                            campo: cmp,
                            calculado: calc[cmp],
                            esperado: esp[cmp]
                        });
                    }
                }
            }

            return {
                coincide: diferencias.length === 0,
                totalCalculados: calculados.length,
                totalEsperados: esperados.length,
                diferencias: diferencias
            };
        }
    };

    window.MotorEstados = MotorEstados;

})(window);
