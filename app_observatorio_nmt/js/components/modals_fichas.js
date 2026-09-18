/**
 * modals_fichas.js
 * Fichas Metodológicas Canónicas de los Indicadores NMT
 * Requisitos: ADR-0003, RF-PORTAL-02, specs/seguimiento-implementacion-nmt.md
 */

window.ModalsFichas = {
  fichasData: {
    'NMT-ADO-01': {
      codigo: 'NMT-ADO-01',
      nombre: 'Tasa de Adopción del Nuevo Marco Tarifario',
      dimension: 'Implementación y Cumplimiento',
      unidad: 'Porcentaje (%)',
      periodicidad: 'Mensual / Corte de Período',
      fuente: 'SUI / SURICATA - Superintendencia de Servicios Públicos Domiciliarios',
      baseLegal: 'Resolución CRA 1032 de 2026, Art. 2.1.2.1.1.1 y cronograma oficial de inicio',
      formula: 'Tasa = (Total de Prestadores con Estudio de Costos Reportado en Segmento / Total de Prestadores del Ámbito en Segmento) × 100',
      interpretacion: 'Mide el avance efectivo del sector en la presentación y adopción del estudio de costos regulatorio. No se convierte en un puntaje compuesto de cumplimiento (RN-PORTAL-05).',
      notaRegulatoria: 'La adopción se valida exclusivamente contra el radicado formal en SUI/SURICATA reportado por la SSPD.'
    },
    'NMT-ADO-02': {
      codigo: 'NMT-ADO-02',
      nombre: 'Oportunidad de Adopción',
      dimension: 'Oportunidad y Celeridad',
      unidad: 'Días calendario',
      periodicidad: 'Por evento / Corte mensual',
      fuente: 'SUI (Formato de Facturación Comercial) y Diario Oficial',
      baseLegal: 'Resolución CRA 1032 de 2026, Sección de Transición Tarifaria',
      formula: 'Días = Fecha de Emisión de la Primera Factura bajo Res. 1032 - Fecha de Expedición de la Res. 1032',
      interpretacion: 'Evalúa la celeridad con la que el prestador traslada las nuevas estructuras de costos a los usuarios finales tras la expedición del marco.',
      notaRegulatoria: 'Calculado únicamente para los prestadores que ya aplican las tarifas de la nueva resolución.'
    },
    'NMT-TAR-01': {
      codigo: 'NMT-TAR-01',
      nombre: 'Variación Tarifaria de Transición',
      dimension: 'Impacto Económico y Tarifario',
      unidad: 'Porcentaje (%) y COP/m³ en pesos constantes año base 2024',
      periodicidad: 'Anual / Inicio de Vigencia',
      fuente: 'SUI (Tarifas Aplicadas y Estudios de Costos)',
      baseLegal: 'Resolución CRA 1032 de 2026 frente a Resolución CRA 688 de 2014',
      formula: 'Δ% = ((Tarifa Aplicada Res. 1032_estrato - Tarifa Aplicada Res. 688_estrato) / Tarifa Aplicada Res. 688_estrato) × 100',
      interpretacion: 'Compara la factura resultante bajo el nuevo marco frente al anterior por cada estrato socioeconómico y clase de uso.',
      notaRegulatoria: 'REGLA ESTRICTA RN-PORTAL-04: Se prohíbe calcular o publicar una "tarifa promedio" por prestador. Toda cifra debe reportarse obligatoriamente desglosada por estrato (1 a 6) y clase de uso para preservar la transparencia de subsidios y aportes solidarios.'
    },
    'NMT-LB-01': {
      codigo: 'NMT-LB-01',
      nombre: 'Cobertura de Línea Base 2026',
      dimension: 'Gobernanza de Datos y Calidad',
      unidad: 'Porcentaje (%) de prestadores',
      periodicidad: 'Cierre de Línea Base (2026)',
      fuente: 'SUI / CRA (Zona Conformada)',
      baseLegal: 'Resolución CRA 1032 de 2026, Anexo de Línea Base y Diagnóstico',
      formula: 'Proporción de prestadores clasificados en: Línea Base Completa, Línea Base Parcial, o Sin Línea Base',
      interpretacion: 'Verifica la suficiencia y completitud de las series históricas requeridas para sostener los recálculos anuales de eficiencia e inversiones.',
      notaRegulatoria: 'Trazabilidad Q-DIC-05: El formato específico de cargue de línea base 2026 se encuentra en proceso de armonización con la SSPD.'
    },
    'NMT-EST-01': {
      codigo: 'NMT-EST-01',
      nombre: 'Cumplimiento de Estándares de Servicio (IDH / IRD)',
      dimension: 'Calidad y Desempeño Técnico',
      unidad: 'Horas/día (Continuidad), % (Calidad IRCA), % (Presión)',
      periodicidad: 'Anual / Quinquenal',
      fuente: 'SUI / SIVICAP / INS',
      baseLegal: 'Resolución CRA 1032 de 2026, Tablas 14 y 15 (Estándares de Servicio)',
      formula: 'Comparación del valor observado en cada estándar frente a la meta vigente fijada para su segmento de prestadores.',
      interpretacion: 'Evalúa si el operador cumple con los niveles mínimos de continuidad y calidad garantizados en el costo de referencia.',
      notaRegulatoria: 'Trazabilidad Q-NMT-01: Los valores de gradualidad por segmento de las Tablas 16 y 50-51 se muestran con aviso preliminar hasta su confirmación por la Subdirección de Regulación.'
    },
    'NMT-EST-02': {
      codigo: 'NMT-EST-02',
      nombre: 'Brecha de Pérdidas IPUF con Banda de Incertidumbre',
      dimension: 'Eficiencia y Gestión del Recurso Hídrico',
      unidad: 'm³/suscriptor/mes',
      periodicidad: 'Anual',
      fuente: 'SUI (Volúmenes de Suministro y Facturación)',
      baseLegal: 'Resolución CRA 1032 de 2026, IRD1 y Estándar de Eficiencia de Pérdidas',
      formula: 'Brecha IPUF = IPUF_observado - IPUF_meta (6.00 m³/susc/mes)',
      interpretacion: 'Determina el volumen de pérdidas físicas y comerciales que exceden el reconocimiento regulatorio eficiente, contrastado con el intervalo p10-p90 del segmento comparable.',
      notaRegulatoria: 'Cumple con RF-BENCH-03: Todo valor se grafica conjuntamente con la banda de incertidumbre del grupo comparable para evitar sesgos por condiciones topográficas o antigüedad de redes.'
    },
    'NMT-INC-01': {
      codigo: 'NMT-INC-01',
      nombre: 'Descuentos e Incentivos Tarifarios de Calidad',
      dimension: 'Regulación por Incentivos',
      unidad: 'Porcentaje (%) aplicado al costo de referencia',
      periodicidad: 'Anual (Recálculo)',
      fuente: 'CRA / SUI (Modelos de Costos)',
      baseLegal: 'Resolución CRA 1032 de 2026, Tabla 31 (Descuentos) y Tablas 17-25 (Incentivos)',
      formula: 'Impacto Neto (%) = Incentivos por Eficiencia (%) - Descuentos por Incumplimiento de Metas (%)',
      interpretacion: 'Garantiza que las fallas sistemáticas de continuidad o pérdidas se descuenten directamente de las tarifas cobradas a los suscriptores.',
      notaRegulatoria: 'Trazabilidad Q-NMT-02: Porcentajes detallados sujetos a ratificación de la fórmula definitiva de graduación de penalizaciones.'
    },
    'NMT-RIE-01': {
      codigo: 'NMT-RIE-01',
      nombre: 'Prestadores en Riesgo Alto según el IUS',
      dimension: 'Viabilidad y Riesgo Sectorial',
      unidad: 'Nivel 1 a 5 y proporción (%) de prestadores',
      periodicidad: 'Anual (Publicación oficial SSPD antes del 30 de junio)',
      fuente: 'SSPD - Indicador Único Sectorial (IUS)',
      baseLegal: 'Resolución CRA 943 y 946 de 2021, actualizada por Resolución CRA 1014 de 2025',
      formula: 'Proporción = (Prestadores en Niveles 4 y 5 / Total Prestadores Evaluados) × 100',
      interpretacion: 'Monitorea la solvencia operativa, técnica y financiera del prestador. Nivel 1 representa bajo riesgo; Niveles 4 y 5 señalan alto riesgo o inviabilidad.',
      notaRegulatoria: 'REGLA RN-PORTAL-06: El indicador de riesgo se presenta en escala donde mayor nivel representa mayor gravedad, sin invertir a porcentajes de cumplimiento.'
    }
  },

  open: function(indicadorCodigo) {
    const ficha = this.fichasData[indicadorCodigo];
    if (!ficha) return;

    const modal = document.getElementById('ficha-modal');
    if (!modal) return;

    const titleEl = document.getElementById('ficha-modal-title');
    const bodyEl = document.getElementById('ficha-modal-body');

    titleEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="kpi-code" style="font-size: 0.9rem;">${ficha.codigo}</span>
        <span>${ficha.nombre}</span>
      </div>
    `;

    bodyEl.innerHTML = `
      <div class="modal-grid-2">
        <div class="info-block">
          <div class="info-block-title">Identificación y Parámetros</div>
          <table class="table-cra" style="margin-top: 6px;">
            <tr><td><strong>Código Canónico:</strong></td><td class="mono">${ficha.codigo}</td></tr>
            <tr><td><strong>Dimensión:</strong></td><td>${ficha.dimension}</td></tr>
            <tr><td><strong>Unidad de Medida:</strong></td><td class="mono">${ficha.unidad}</td></tr>
            <tr><td><strong>Periodicidad:</strong></td><td>${ficha.periodicidad}</td></tr>
            <tr><td><strong>Fuente Autoritativa:</strong></td><td>${ficha.fuente}</td></tr>
          </table>
        </div>
        <div class="info-block">
          <div class="info-block-title">Sustento Normativo</div>
          <p style="font-size: 0.82rem; color: var(--text-main); margin-bottom: 8px;">
            <strong>Base Legal:</strong> ${ficha.baseLegal}
          </p>
          <div style="background: #ffffff; border: 1px solid var(--border-light); padding: 10px; border-radius: var(--radius-sm); font-size: 0.78rem;">
            <strong>Fórmula Canónica:</strong><br>
            <code class="mono" style="color: var(--blue-primary);">${ficha.formula}</code>
          </div>
        </div>
      </div>

      <div class="info-block" style="margin-bottom: 16px;">
        <div class="info-block-title">Interpretación y Utilidad Regulatoria</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
          ${ficha.interpretacion}
        </p>
      </div>

      <div class="gap-alert-box">
        <div>
          <strong>Nota de Trazabilidad y Calidad:</strong> ${ficha.notaRegulatoria}
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  },

  close: function() {
    const modal = document.getElementById('ficha-modal');
    if (modal) modal.style.display = 'none';
  }
};
