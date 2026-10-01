/**
 * portada_contenido.js
 * Textos de la portada, separados del dibujo: el diseño cambia sin tocar el copy y viceversa.
 * Aquí no hay cifras ni parámetros regulatorios: todas se calculan en portada.js desde los datos.
 * El lema y la marca corta son los de ADR-0009.
 */

window.PORTADA_COPY = {
  // El dataset se genera sin tildes; se restituyen solo para mostrar
  tildes: {
    Adopcion: 'Adopción', Transicion: 'Transición', Implementacion: 'Implementación', Operacion: 'Operación',
    Ciudadania: 'Ciudadanía', Evaluacion: 'Evaluación', Diagnostico: 'Diagnóstico', Participacion: 'Participación',
    Socializacion: 'Socialización', Expedicion: 'Expedición', Publicacion: 'Publicación', Ano: 'Año', Linea: 'Línea'
  },

  cifras: {
    adopcion: {
      etiqueta: 'Adopción del marco',
      titular: 'El pulso de la transición: estudios de costos radicados',
      marcos: {
        '1032': { boton: 'Grandes · Res. 1032', apoyo: 'grandes prestadores de los segmentos 1 a 4 ya cargaron su estudio en SUI/SURICATA para migrar a costos eficientes verificados.', cta: 'Ver adopción por segmento', ir: ['tablero'] },
        '1038': { boton: 'Pequeños · Res. 1038', apoyo: 'pequeños prestadores y gestores comunitarios del universo piloto iniciaron su ruta de adopción adaptativa.', cta: 'Ver seguimiento Res. 1038', ir: ['nmtpp'] }
      }
    },
    prestadores: { etiqueta: 'Universo', titular: 'Dos realidades territoriales, dos marcos que nunca se mezclan', leyenda1032: 'grandes prestadores urbanos (Res. 1032)', leyenda1038: 'pequeños y comunitarios rurales (Res. 1038)', cta: 'Explorar directorio de prestadores', ir: ['prestadores'] },
    suscriptores: { etiqueta: 'Alcance', unidad: 'millones de suscriptores de acueducto', apoyo: 'Población urbana con seguimiento continuo a la calidad del servicio y tarifas justas bajo la Res. 1032.', cta: 'Ubicar en el mapa territorial', ir: ['mapa'] }
  },

  mensajes: {
    perdidas: {
      etiqueta: 'Pérdidas de agua',
      titular: (n, total) => `La eficiencia en juego: ${n} de ${total} prestadores superan el tope de pérdidas`,
      detalle: (n, total, meta, segs) => `${n} de ${total} grandes prestadores registran pérdidas por encima del umbral de referencia de ${meta} m³ por suscriptor al mes. La mediana supera la meta en ${segs} de los 4 segmentos. La regulación orienta planes de inversión para evitar el desperdicio de agua tratada (meta sujeta a ratificación formal Q-NMT-01).`,
      leyendaSobre: 'Por encima de la meta',
      leyendaEn: 'En la meta o por debajo',
      ir: ['tablero']
    },
    tarifas: {
      etiqueta: 'Tarifas por estrato',
      titular: 'Justicia y focalización: la tarifa se evalúa estrato por estrato',
      detalle: (e1, e6) => `La variación tarifaria de transición no oculta realidades bajo promedios ciegos: la mediana es ${e1} en estrato 1 y ${e6} en estrato 6 frente a la Res. 688 de 2014. Así se verifica que los subsidios protejan a los hogares más vulnerables mientras se garantiza la sostenibilidad de la red.`,
      ir: ['tablero']
    },
    calidad: {
      etiqueta: 'Calidad del dato',
      titular: (verif, noRep) => `Rigor y compuerta activa: ${verif} verificados y ${noRep} en seguimiento`,
      detalle: (verif, noRep) => `${verif} prestadores superaron las validaciones de la compuerta de calidad en SUI y SURICATA. Para los ${noRep} sin reporte al SUI, el observatorio muestra la ausencia explícita como alerta visible de control, nunca como cero.`,
      estados: {
        VERIFIED: 'Verificado',
        WARNING: 'Observado',
        QUARANTINE: 'En cuarentena',
        NO_REPORT: 'No reportó'
      },
      ir: ['metodologia']
    }
  },

  reto: {
    etiqueta: 'El reto sectorial',
    titular: 'Por qué una nueva regulación <span class="cx-grad">del agua en Colombia</span>',
    bajada: 'Comprender los desafíos estructurales que motivaron los marcos de 2026 es clave para evaluar el verdadero impacto en las tarifas y el servicio.',
    pilares: [
      {
        tag: 'Pérdidas de agua',
        titulo: 'Frenar el desperdicio de agua potable',
        desc: 'Millones de metros cúbicos de agua tratada se pierden en redes obsoletas. La nueva metodología fija incentivos y topes de 6 m³/susc/mes para exigir renovación sin recargar ineficiencias al usuario.',
        cta: 'Ver brecha de pérdidas',
        ir: ['tablero']
      },
      {
        tag: 'Diferenciación territorial',
        titulo: 'Reconocer la realidad comunitaria y rural',
        desc: 'Durante años se exigió la misma complejidad a una metrópoli que a un acueducto veredal. La Res. 1038 introduce metas adaptativas, subsidios diferenciados y tratamiento especial para zonas PDET e insulares.',
        cta: 'Ver marco rural 1038',
        ir: ['nmtpp']
      },
      {
        tag: 'Asequibilidad familiar',
        titulo: 'Tarifas sostenibles sin asfixiar al hogar',
        desc: 'El observatorio monitorea que la factura neta se mantenga por debajo del umbral de referencia del 3 % del ingreso del hogar (estándar OCDE / Banco Mundial), focalizando los subsidios de la Ley 142 de 1994.',
        cta: 'Abrir simulador familiar',
        ir: ['ciclo', 'asequibilidad']
      }
    ]
  },

  // Nombre corto y descripción de cada etapa; estado y fechas vienen del dataset
  ciclo: {
    estados: { cumplida: 'Cumplida', en_curso: 'En curso', pendiente: 'Prevista' },
    etapas: {
      E0: { corto: 'Diagnóstico y agenda', descripcion: 'Identificación del problema público y agenda de revisión de la Res. CRA 688 de 2014.' },
      E1: { corto: 'Participación ciudadana', descripcion: 'Observaciones técnicas y mesas de concertación territorial.' },
      E2: { corto: 'Concepto previo SIC', descripcion: 'Abogacía de la competencia y análisis de impacto económico previo.' },
      E3: { corto: 'Expedición de la Res. 1032', descripcion: 'Adopción del nuevo marco para grandes prestadores urbanos en el Diario Oficial.' },
      E4: { corto: 'Transición y alistamiento', descripcion: 'Alistamiento de sistemas comerciales, modelos de costos y contabilidad regulatoria.' },
      E5: { corto: 'Estudio de costos', descripcion: 'Cargue de estudios de costos a SUI/SURICATA y adopción de tarifas iniciales.' },
      E6: { corto: 'Línea base 2026', descripcion: 'Cierre de la línea base oficial 2026 y facturación plena bajo el nuevo marco.' },
      E7: { corto: 'Recálculo e incentivos', descripcion: 'Descuentos de calidad (Tabla 31) e incentivos de eficiencia (Tablas 17-25).' },
      E8: { corto: 'Evaluación intermedia', descripcion: 'Revisión intermedia del impacto tarifario y de los estándares quinquenales.' },
      E9: { corto: 'Evaluación ex-post', descripcion: 'Evaluación formal ex-post del marco tarifario al cierre de su vigencia.' }
    }
  }
};
