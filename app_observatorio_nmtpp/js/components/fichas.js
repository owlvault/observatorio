/**
 * fichas.js — Vista 8: Metodología, Visor de Fichas Canónicas y Glosario
 * Cumple Reglas de Oro 2, 4, 5 y ADR-0003
 */

(function(window) {
    'use strict';

    const Fichas = {
        selectedFichaCode: 'NMTPP-ADO-01',

        selectFicha(code) {
            this.selectedFichaCode = code;
            this.render('tab-metodologia');
        },

        FICHAS_CATALOGO: [
            { code: 'NMTPP-ADO-01', nombre: 'Estudio de costos recibido por la CRA', dim: 'SEG', capa: 'Adopción', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.2.9.1; 2.1.1.1.3.2.5.1-2', unidad: '%', desc: 'Porcentaje de prestadores del ámbito que remitieron su estudio de costos inicial o de actualización a la CRA.' },
            { code: 'NMTPP-ADO-02', nombre: 'Concordancia del subsegmento declarado con el calculado', dim: 'SEG', capa: 'Adopción', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.1.6 (Q-NMTPP-03)', unidad: 'Binario / Conteo', desc: 'Monitorea la coincidencia entre la clasificación resultante de la regla legal frente a lo radicado por el prestador.' },
            { code: 'NMTPP-ADO-03', nombre: 'APS de acueducto definida y reportada', dim: 'SEG', capa: 'Adopción', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.1.1; 2.1.1.1.1.7', unidad: '%', desc: 'Verifica la delimitación geográfica y reporte en SUI de las Áreas de Prestación del Servicio atendidas.' },
            { code: 'NMTPP-ADO-04', nombre: 'Recálculo anual oportuno', dim: 'SEG', capa: 'Adopción', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.2.1.2; 2.1.1.1.3.2.2.6', unidad: '%', desc: 'Porcentaje de prestadores que efectúan y remiten su recálculo tarifario anual dentro de la ventana de 1-ene a 31-may.' },
            { code: 'NMTPP-ADO-05', nombre: 'Gestores comunitarios que optan por el S1', dim: 'SEG', capa: 'Adopción', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.1.6 par. 4', unidad: 'Conteo / %', desc: 'Seguimiento a los gestores comunitarios que voluntariamente deciden aplicar la metodología del Primer Segmento.' },
            { code: 'NMTPP-S1-CAL', nombre: 'IRCA frente al estándar (S1)', dim: 'CAL', capa: 'Servicio', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.2.1.2 par. 3 (Q-NMTPP-06)', unidad: '%', desc: 'Índice de Riesgo de la Calidad del Agua Potable frente al estándar de IRCA ≤ 5.0%.' },
            { code: 'NMTPP-S1-MIC', nombre: 'Micromedición efectiva (S1)', dim: 'EFI', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.1.2', unidad: '%', desc: 'Porcentaje de suscriptores con micromedición en servicio frente a metas y estándar final del 100%.' },
            { code: 'NMTPP-S1-CON', nombre: 'Continuidad: cierre de brecha (S1)', dim: 'CON', capa: 'Servicio', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.2.1.2; Anexo 6.2.1.10 (Q-NMTPP-01)', unidad: 'h/día o %', desc: 'Seguimiento al cierre de brecha frente al estándar anualizado de continuidad del servicio.' },
            { code: 'NMTPP-S1-MAC', nombre: 'Macromedición efectiva (S1)', dim: 'EFI', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.1.2', unidad: '%', desc: 'Medición de caudales producidos en bocatoma y planta frente al estándar obligatorio del 100%.' },
            { code: 'NMTPP-S1-COB', nombre: 'Cobertura frente a meta declarada (S1)', dim: 'COB', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.1.2', unidad: '%', desc: 'Evolución de la cobertura real frente a la senda declarada por el prestador en su estudio de costos.' },
            { code: 'NMTPP-S1-PER', nombre: 'IPUF frente a IPUF* y senda declarada (S1)', dim: 'PER', capa: 'Servicio', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.2.1.2 par. 7 (Q-NMTPP-07)', unidad: 'm³/susc/mes', desc: 'Pérdidas de agua por usuario facturado frente al estándar eficiente de 6.0 m³/susc/mes.' },
            { code: 'NMTPP-S1-PSH', nombre: 'Plan de Sostenibilidad Hídrica (S1-1)', dim: 'CLI', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.1.2', unidad: 'Binario', desc: 'Adopción e implementación formal del plan para prestadores del subsegmento mayor (3.200 a 5.000 susc).' },
            { code: 'NMTPP-S2-CAL', nombre: 'IRCA frente al estándar (Gestores Comunitarios)', dim: 'CAL', capa: 'Servicio', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.3.1.2 par. 3 (Q-NMTPP-06)', unidad: '%', desc: 'Monitoreo de calidad de agua en gestores comunitarios frente al estándar sin riesgo IRCA ≤ 5.0%.' },
            { code: 'NMTPP-S2-MIC', nombre: 'Micromedición residencial (Gestores Comunitarios)', dim: 'EFI', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.3.1.2', unidad: '%', desc: 'Instalación de micromedidores en usuarios residenciales según subsegmento S2.' },
            { code: 'NMTPP-S2-CON', nombre: 'Continuidad: cierre de brecha (Gestores Comunitarios)', dim: 'CON', capa: 'Servicio', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.3.1.2 (Q-NMTPP-02)', unidad: '%', desc: 'Cierre de brecha de continuidad evaluada porcentualmente según Anexo 6.2.1.10 b).' },
            { code: 'NMTPP-S2-MAC', nombre: 'Macromedición de dos puntos (Gestores Comunitarios)', dim: 'EFI', capa: 'Servicio', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.3.1.2', unidad: '%', desc: 'Medición de captación y distribución obligatoria al año 5 para gestores comunitarios.' },
            { code: 'NMTPP-ESP-01', nombre: 'APS con condición especial estructural', dim: 'SEG', capa: 'Régimen especial', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.4.1', unidad: 'Conteo / %', desc: 'Identificación de APS que aplican estándares diferenciales del S2 por zona insular, IVH, IPM o PDET.' },
            { code: 'NMTPP-NRG-01', nombre: 'Regresión frente a la línea base', dim: 'SEG', capa: 'Transversal', estado: 'COMPLETA', norma: 'Res. 1038 arts. 2.1.1.1.1.4, 2.1.1.1.2.1.1, 2.1.1.1.3.1.1', unidad: 'Conteo / Alerta', desc: 'Control analítico interno que detecta retrocesos en continuidad, cobertura o pérdidas frente a 2026.' },
            { code: 'NMTPP-ISE-01', nombre: 'ISE publicado por la CRA', dim: 'SEG', capa: 'Eficiencia', estado: 'PARCIAL', norma: 'Res. 1038 art. 2.1.1.1.2.2.7.1 (Q-NMTPP-04)', unidad: 'Índice (0-100)', desc: 'Ingesta de la publicación oficial expedida por la CRA del Índice Sintético de Eficiencia para el S1.' },
            { code: 'NMTPP-ISE-02', nombre: 'Oportunidad de la publicación del ISE', dim: 'SEG', capa: 'Eficiencia', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.2.7.1 par. 2', unidad: 'Días / Estado', desc: 'Verifica que la CRA publique el ISE al menos 4 meses antes del inicio del año tarifario respectivo.' },
            { code: 'NMTPP-INC-01', nombre: 'Incentivos reconocidos por tipo', dim: 'SEG', capa: 'Eficiencia', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.2.2.6.2-3', unidad: 'Conteo / %', desc: 'Número y porcentaje de operadores del S1 que reciben incentivos sobre el CMOG (+5.0%) y CMA (+2.5%).' },
            { code: 'NMTPP-TAR-01', nombre: 'Tarifa aplicada por estrato y uso frente a la Res. 825', dim: 'SEG', capa: 'Tarifa', estado: 'COMPLETA', norma: 'Res. 1038 art. 2.1.1.1.8.1 y num. 10 estudio', unidad: '$/factura y %', desc: 'Variación de cargos fijos y por consumo por estrato socioeconómico frente al marco tarifario anterior.' }
        ],

        GLOSARIO: [
            { termino: 'Subsegmento (Escala del Acueducto)', def: 'Clasificación según el número de familias conectadas (a 31 de diciembre de 2024). Permite fijar metas graduales y proporcionadas para no sobrecargar a los operadores más pequeños.' },
            { termino: 'Gestor Comunitario', def: 'Organización comunitaria (junta de agua, asociación de usuarios o cabildo) que administra y cuida el acueducto en veredas, corregimientos y zonas rurales.' },
            { termino: 'Año Tarifario', def: 'Período anual de 12 meses (del 1 de enero al 31 de diciembre) en el cual se aplican las tarifas y se evalúa el cumplimiento de metas (el Año 1 es 2027).' },
            { termino: 'Línea Base (Punto de Partida)', def: 'Situación real verificada del acueducto al 31 de diciembre de 2026. Es la foto inicial que se usa para medir avances y evitar retrocesos en el servicio.' },
            { termino: 'Meta Regulatoria', def: 'Meta legal exigida por la Resolución CRA 1038 para un año específico, diseñada para mejorar el servicio de manera progresiva y sostenible.' },
            { termino: 'Meta Declarada en Estudio', def: 'Proyección anual que el propio acueducto fijó y radicó ante la CRA en su estudio de costos según sus planes locales de inversión.' },
            { termino: 'Referente Eficiente de Pérdidas (IPUF*)', def: 'Nivel óptimo de control de fugas: no superar 6.0 m³ de agua perdida al mes por cada familia conectada (art. 2.1.1.1.1.3).' },
            { termino: 'Índice Sintético de Eficiencia (ISE)', def: 'Calificación oficial anual de la CRA (de 0 a 100) que evalúa el desempeño técnico, administrativo y financiero de los operadores para reconocer estímulos tarifarios.' },
            { termino: 'Condición Territorial Especial', def: 'Circunstancia especial de vulnerabilidad (islas, escasez de agua, alta pobreza o posconflicto) que activa reglas y metas flexibles para proteger a la comunidad.' }
        ],

        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const fichaActiva = this.FICHAS_CATALOGO.find(f => f.code === this.selectedFichaCode) || this.FICHAS_CATALOGO[0];

            let html = `
                <div class="dashboard-panel">
                    <div class="panel-header">
                        <div class="panel-header-title">
                            <h2>Guía Metodológica: Diccionario de Indicadores y Glosario Ciudadano</h2>
                            <p>Definiciones claras, fórmulas, base legal y glosario en palabras sencillas para entender cómo se evalúa el servicio de agua potable</p>
                        </div>
                    </div>

                    <!-- Fichas Metodológicas y Detalle -->
                    <div style="display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start;">
                        <!-- Lista lateral de Fichas -->
                        <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-light); border-radius: var(--radius-sm); max-height: 650px; overflow-y: auto; padding: 8px;">
                            <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--text-secondary); padding: 8px; border-bottom: 1px solid var(--border-light);">
                                Indicadores Oficiales (20 Fichas Técnicas):
                            </h4>
                            <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
                                ${this.FICHAS_CATALOGO.map(f => `
                                    <button class="nav-tab-btn ${f.code === this.selectedFichaCode ? 'active' : ''}"
                                             style="width: 100%; text-align: left; padding: 8px 10px; font-size: 0.82rem; border-radius: 6px; border: none; justify-content: space-between;"
                                             onclick="Fichas.selectFicha('${f.code}')">
                                        <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                            <strong class="mono">${f.code}</strong><br>
                                            <span style="font-size: 0.76rem; color: var(--text-muted);">${f.nombre}</span>
                                        </div>
                                        <span class="chip ${f.estado === 'COMPLETA' ? 'chip-incentive' : 'chip-discrepancy'}" style="font-size: 0.68rem;">
                                            ${f.estado === 'COMPLETA' ? 'DOCUMENTADA' : 'EN REVISIÓN'}
                                        </span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Detalle de la Ficha Seleccionada -->
                        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 24px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 2px solid var(--border-light); padding-bottom: 12px;">
                                <div>
                                    <span class="chip font-bold" style="margin-bottom: 6px;">${fichaActiva.dim} • ${fichaActiva.capa}</span>
                                    <h3 style="font-size: 1.25rem; color: var(--blue-deep-navy);">${fichaActiva.nombre}</h3>
                                    <span class="mono" style="color: var(--text-muted); font-size: 0.85rem;">Código Canónico: ${fichaActiva.code}</span>
                                </div>
                                <span class="chip ${fichaActiva.estado === 'COMPLETA' ? 'chip-incentive' : 'chip-discrepancy'}" style="font-size: 0.85rem; padding: 6px 12px;">
                                    ${fichaActiva.estado === 'COMPLETA' ? 'Ficha Documentada' : 'En Reglamentación Oficial'}
                                </span>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.88rem;">
                                <div>
                                    <strong style="color: var(--blue-deep-navy);">¿Qué mide y para qué sirve?:</strong>
                                    <p style="margin-top: 4px; color: var(--text-secondary);">${fichaActiva.desc}</p>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: var(--bg-surface-subtle); padding: 14px; border-radius: var(--radius-sm);">
                                    <div><strong>Artículo de la Resolución CRA:</strong><br><span style="color: var(--blue-primary);">${fichaActiva.norma}</span></div>
                                    <div><strong>Unidad de Expresión:</strong><br><span class="mono">${fichaActiva.unidad}</span></div>
                                    <div><strong>Control de Verificación:</strong><br><span>VERIFIED / AUDITABLE (ADR-0003)</span></div>
                                    <div><strong>Fuente Institucional:</strong><br><span>CRA / SUI Superservicios</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Glosario Resumido de Términos Canónicos (Regla 5) -->
                    <h3 style="font-size: 1.1rem; color: var(--blue-deep-navy); margin-top: 36px; margin-bottom: 14px;">
                        Glosario Ciudadano: Conceptos Clave en Palabras Sencillas
                    </h3>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px;">
                        ${this.GLOSARIO.map(g => `
                            <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 14px;">
                                <strong style="color: var(--blue-primary); font-size: 0.9rem;">${g.termino}</strong>
                                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">${g.def}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            container.innerHTML = html;
        }
    };

    window.Fichas = Fichas;

})(window);
