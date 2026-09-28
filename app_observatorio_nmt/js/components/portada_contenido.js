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
      titular: 'Estudios de costos radicados',
      marcos: {
        '1032': { boton: 'Grandes · Res. 1032', apoyo: 'grandes prestadores de los segmentos 1 a 4 cargaron su estudio en SUI/SURICATA.', cta: 'Ver adopción por segmento', ir: ['tablero'] },
        '1038': { boton: 'Pequeños · Res. 1038', apoyo: 'pequeños prestadores y gestores comunitarios del universo piloto tienen estudio inicial radicado.', cta: 'Ver seguimiento Res. 1038', ir: ['nmtpp'] }
      }
    },
    prestadores: { etiqueta: 'Universo', titular: 'Dos marcos, dos universos que no se suman', leyenda1032: 'grandes (Res. 1032)', leyenda1038: 'pequeños y comunitarios (Res. 1038)', cta: 'Ver directorio', ir: ['prestadores'] },
    suscriptores: { etiqueta: 'Alcance', unidad: 'millones de suscriptores de acueducto', apoyo: 'Atendidos por los grandes prestadores de la Res. 1032.', cta: 'Ver en el mapa', ir: ['mapa'] }
  },

  mensajes: {
    perdidas: {
      etiqueta: 'Pérdidas de agua',
      titular: (n, total) => `${n} de ${total} pierden más agua que la meta`,
      detalle: (n, total, meta, segs) => `${n} de ${total} grandes prestadores tienen pérdidas por encima de la meta de referencia de ${meta} m³ por suscriptor al mes. La mediana supera la meta en ${segs} de los 4 segmentos. La meta está sujeta a ratificación formal (Q-NMT-01).`,
      leyendaSobre: 'Por encima de la meta',
      leyendaEn: 'En la meta o por debajo',
      ir: ['tablero']
    },
    tarifas: {
      etiqueta: 'Tarifas por estrato',
      titular: 'La tarifa se lee estrato por estrato',
      detalle: (e1, e6) => `La variación tarifaria de transición se publica estrato por estrato: la mediana es ${e1} en estrato 1 y ${e6} en estrato 6, frente a la Res. 688 de 2014. Nunca se publica una tarifa promedio.`,
      ir: ['tablero']
    },
    calidad: {
      etiqueta: 'Calidad del dato',
      titular: (verif, noRep) => `${verif} verificados, ${noRep} sin reportar`,
      detalle: (verif, noRep) => `${verif} prestadores tienen su información verificada y ${noRep} aún no reportan al SUI. Cada cifra muestra su semáforo para que se lea con la cautela adecuada.`,
      estados: {
        VERIFIED: 'Verificado',
        WARNING: 'Observado',
        QUARANTINE: 'En cuarentena',
        NO_REPORT: 'No reportó'
      },
      ir: ['metodologia']
    }
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
