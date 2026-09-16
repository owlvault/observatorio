---
id: spec-seguimiento-implementacion-nmt
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-16
fuentes: [claude/hoja-de-ruta-nuevos-marcos-tarifarios-2026-09-15.md, docs/business_context.md, specs/ontologia-indicadores.md, specs/portal-publico.md, 05_Bateria_de_Indicadores/catalogo-v1.md, adr/ADR-0003, adr/ADR-0005, adr/ADR-0010, adr/ADR-0012, Res. CRA 1032 de 2026, Res. CRA 1038 de 2026, Res. CRA 1040 de 2026, Res. CRA 1014/2025 (IUS)]
---

# Spec — Tablero de seguimiento a la implementación de los Nuevos Marcos Tarifarios (NMT)

## Propósito

Fija qué debe construir el tablero que hace seguimiento a la implementación de los Nuevos Marcos Tarifarios (NMT) expedidos por la CRA en 2026, empezando por la **Res. CRA 1032 de 2026** (acueducto y alcantarillado, grandes prestadores, >5.000 suscriptores urbanos, ~188-189 prestadores). Este tablero cierra un vacío que la propia CRA reconoce: no existe evaluación ex post institucionalizada de sus marcos tarifarios (el DNP la califica como "el elemento más débil del ciclo regulatorio"); lo que hoy existe son diagnósticos incluidos en los documentos de trabajo del marco siguiente.

Esta spec cubre el **seguimiento al proceso de implementación** (adopción, línea base, cumplimiento de estándares, incentivos/descuentos, riesgo) por prestador y por segmento, a lo largo del ciclo E0-E9 definido en la hoja de ruta. NO cubre: el cálculo de los catorce indicadores del catálogo V1 (eso es `specs/ontologia-indicadores.md`), las reglas generales de publicación en el portal (`specs/portal-publico.md`), ni la evaluación de impacto o resultados de la regulación (fuera de alcance del Observatorio, ver `docs/business_context.md` → No-objetivos).

## Contexto relevante

- Hoja de ruta y arquitectura de medición: `claude/hoja-de-ruta-nuevos-marcos-tarifarios-2026-09-15.md` (secciones 2, 4 y 5 — es la fuente primaria de esta spec)
- Compuerta de publicación (indicador + ficha + semáforo o no se publica): `adr/ADR-0003`
- Publicación a nivel de prestador individual, fases A/B, salvaguarda contra ranking compuesto: `adr/ADR-0005`
- Motor de tableros (condiciones que debe cumplir cualquier motor, propio o Power BI): `adr/ADR-0010`
- Regla de agregación territorial (prestador como unidad, territorio como suma ponderada, umbral de cobertura de reporte): `adr/ADR-0012`
- Catálogo de indicadores V1: `05_Bateria_de_Indicadores/catalogo-v1.md` (IND-COB-*, IND-CON-01, IND-PER-01/02, IND-CAL-01, IND-ASE-01, IND-ECI-*, IND-EFI-*, IND-FIN-01, IND-INV-01)
- Desagregaciones y comparabilidad: `RF-ONTO-05` (nunca prorratear), `RF-ONTO-06` (grupo comparable por segmento), `RF-ONTO-09` (cobertura de reporte)
- Reglas de portal que este tablero hereda: `RF-PORTAL-01/02/06/11` (compuerta y estados de ausencia), `RN-PORTAL-04` (nunca "tarifa promedio"), `RN-PORTAL-05` (prohibido todo puntaje o índice compuesto), `RN-PORTAL-06` (indicadores de riesgo nunca en escala donde mayor sea mejor), `RF-BENCH-01/03/06` (grupo comparable, banda de incertidumbre, historial de correcciones)
- Actores: `ACT-PRESTADOR`, `ACT-ANALISTA-CRA`, `ACT-COMISIONADO`, `ACT-CIUDADANO`, `ACT-CIO`, `ACT-CURADOR-DATOS` — definidos en `docs/business_context.md`
- Preguntas de negocio que este tablero sirve: `BQ-REG-01`, `BQ-REG-02`, `BQ-REG-03`, `BQ-CIU-06` (`specs/preguntas-de-negocio.md`)

## Modelo de datos de referencia

Entidades que este módulo necesita, además de `provider` (prestador) e `indicador` ya definidos en `specs/ontologia-indicadores.md`:

| Entidad | Campos clave | Notas |
|---|---|---|
| `marco_tarifario` | `id` (ej. `CRA-1032-2026`), `norma`, `fecha_expedicion`, `ambito`, `vigencia_anios` | Un registro por resolución (1032, 1038, 1040, 1027/1037) |
| `segmento` | `id`, `marco_tarifario_id`, `umbral_min`, `umbral_max`, `unidad` | S1-S4 en la 1032; segmentos propios en 1038 |
| `etapa_ciclo` | `codigo` (E0-E9), `nombre`, `actor_responsable` (`R`/`P`/`V`) | Catálogo fijo, común a los cuatro marcos (sección 2 de la hoja de ruta) |
| `hito` | `marco_tarifario_id`, `etapa_codigo`, `fecha_prevista`, `fecha_real`, `fuente` | Ej.: "Concepto SIC", "Expedición", "Período de inicio" |
| `prestador_marco` | `provider_id`, `marco_tarifario_id`, `segmento_id`, `etapa_actual`, `fecha_clasificacion` | Un prestador puede tener registros en más de un `marco_tarifario` si presta acueducto y aseo |

> **ASUNCIÓN (sin validar):** el modelo asume que `prestador_marco` se actualiza por reporte del prestador a SUI/SURICATA, no por cálculo propio del Observatorio. Origen: sección 4.1 de la hoja de ruta ("la verificación del cumplimiento la hace la SSPD"). Confirmar el mecanismo real de ingesta con la Subdirección de Regulación antes de implementar `RF-NMT-02`.

## Requisitos funcionales

### RF-NMT-01 — Línea de tiempo del ciclo de implementación por marco y prestador

El sistema DEBE mostrar, para cada `marco_tarifario` y, cuando el actor lo solicite, para un `provider` específico dentro de ese marco, las diez etapas del ciclo (E0-E9) con su fecha prevista, su fecha real (si ya ocurrió) y su estado (`cumplida`, `en curso`, `pendiente`, `vencida`).

**Criterios de aceptación**

```gherkin
Escenario: Etapa cumplida con fecha real
  Dado que la Res. CRA 1032 de 2026 tiene el hito "Concepto SIC" con fecha real 12-mar-2026
  Cuando el ACT-ANALISTA-CRA abre la línea de tiempo de la Res. 1032
  Entonces el sistema muestra la etapa E3 como "cumplida" con fecha 12-mar-2026 y fuente "Res. 1032"

Escenario: Etapa vencida sin fecha real
  Dado que el hito "Período de inicio" de la Res. CRA 1032 tenía fecha prevista 30-jun-2026
  Y hoy es una fecha posterior a esa
  Y el 90% de los prestadores del ámbito aún no reportan estudio de costos
  Cuando el ACT-ANALISTA-CRA abre la línea de tiempo
  Entonces el sistema muestra la etapa E5 como "vencida" para esos prestadores
  Y NO oculta el retraso ni lo redondea a "en curso"
```

**Prioridad:** debe
**Origen:** sección 2 de `claude/hoja-de-ruta-nuevos-marcos-tarifarios-2026-09-15.md`

### RF-NMT-02 — Tasa de adopción del marco (NMT-ADO-01)

CUANDO se solicita el indicador de adopción para un `marco_tarifario` y `segmento`, el sistema DEBE calcularlo como la proporción de prestadores del ámbito con estudio de costos reportado bajo ese marco en SUI/SURICATA, sobre el total de prestadores del ámbito para ese segmento.

**Criterios de aceptación**

```gherkin
Escenario: Adopción con cobertura completa de reporte
  Dado que el Segmento 1 de la Res. 1032 tiene 12 prestadores del ámbito
  Y 9 de ellos reportaron estudio de costos bajo la Res. 1032
  Cuando el sistema calcula NMT-ADO-01 para Segmento 1
  Entonces el resultado es 75% (9/12)
  Y se publica junto con el semáforo, la fecha de corte y la cobertura de reporte (RF-ONTO-09)

Escenario: Segmento con menos del umbral de cobertura de reporte
  Dado que un segmento tiene una cobertura de reporte por debajo del umbral fijado en RF-ONTO-09
  Cuando el sistema calcula NMT-ADO-01 para ese segmento
  Entonces el sistema NO publica el agregado del segmento
  Y SÍ publica la descomposición por prestador con su estado individual
```

**Prioridad:** debe
**Depende de:** RF-ONTO-09, RN-PORTAL-05 (el resultado NO se convierte en un puntaje de "cumplimiento" 0-100)
**Origen:** tabla de indicadores propuestos, sección 5 de la hoja de ruta

### RF-NMT-03 — Oportunidad de adopción (NMT-ADO-02)

El sistema DEBE calcular, para cada `provider` que ya aplica un `marco_tarifario`, los días transcurridos entre la fecha de expedición de la norma y la fecha de su primera factura emitida bajo ese marco, tomada del reporte comercial a SUI.

**Prioridad:** debería
**Depende de:** RF-NMT-02
**Origen:** sección 5 de la hoja de ruta

### RF-NMT-04 — Variación tarifaria de transición (NMT-TAR-01)

El sistema DEBE mostrar la tarifa aplicada bajo el nuevo marco frente a la tarifa aplicada bajo el marco anterior, siempre desagregada por estrato y por segmento, y NUNCA como una cifra única "tarifa promedio".

**Criterios de aceptación**

```gherkin
Escenario: Variación por estrato
  Dado un prestador del Segmento 2 con tarifa de acueducto estrato 3 de 1.850 COP/m³ bajo la Res. 688/2014
  Y una tarifa de 2.100 COP/m³ bajo la Res. 1032 en el período de inicio
  Cuando el ACT-CIUDADANO consulta la variación tarifaria de ese prestador
  Entonces el sistema muestra "+13,5% en estrato 3" con el año base declarado
  Y NO muestra una cifra agregada de "tarifa promedio" del prestador

Escenario: Intento de agregar por prestador sin desagregación
  Dado que un valor de NMT-TAR-01 no trae la desagregación por estrato
  Cuando el sistema intenta publicarlo
  Entonces el sistema rechaza la publicación
  Y registra la causa "falta desagregación por estrato" en el informe de calidad
```

**Prioridad:** debe
**Regla de negocio:** RN-PORTAL-04
**Origen:** sección 5 de la hoja de ruta; glosario (Tarifa aplicada ≠ Costo Unitario)

### RF-NMT-05 — Cobertura de línea base (NMT-LB-01)

El sistema DEBE mostrar la proporción de prestadores del ámbito de la Res. 1032 con línea base 2026 completa reportada, por segmento, distinguiendo "línea base completa", "línea base parcial" y "sin línea base reportada".

**Prioridad:** debe
**Origen:** sección 5 de la hoja de ruta; "Línea base: información al cierre de 2026" (sección 3.1)

### RF-NMT-06 — Cumplimiento de estándares IDH/IRD frente a meta (NMT-EST-01)

CUANDO un `provider` reporta valores de un indicador IDH o IRD (catálogo de la Res. 1032, Tablas 14-15) para un año tarifario, el sistema DEBE comparar el valor observado contra la meta del año vigente para su segmento y clasificar el resultado como "en meta", "bajo meta" o "sin dato".

**Criterios de aceptación**

```gherkin
Escenario: Prestador en meta
  Dado que la meta de IDH2 (continuidad) para el Segmento 3 en el primer año tarifario es 22 horas/día
  Y un prestador del Segmento 3 reporta 22,5 horas/día
  Cuando el sistema evalúa RF-NMT-06 para ese prestador
  Entonces clasifica el resultado como "en meta"

Escenario: Meta del segmento aún no confirmada
  Dado que las Tablas 16 y 50-51 de la Res. 1032 (metas y gradualidad por segmento) están marcadas "por confirmar" en la hoja de ruta
  Cuando el sistema intenta clasificar un valor de IRD1 (IPUF) contra su meta
  Entonces el sistema muestra el valor observado sin clasificación de cumplimiento
  Y muestra el aviso "meta del segmento pendiente de confirmar (Q-NMT-01)"
  Y NO asume el valor de referencia 6 m³/suscriptor/mes de la EAAB como meta general
```

**Prioridad:** debe
**Bloqueado por:** Q-NMT-01 (ver Preguntas abiertas)
**Origen:** sección 3.1 y sección 6 ("Vacíos y datos contradictorios") de la hoja de ruta

### RF-NMT-07 — Brecha de pérdidas con banda de incertidumbre (NMT-EST-02)

El sistema DEBE calcular la brecha entre el IPUF observado de un prestador y el IPUF meta de su año tarifario, y DEBE presentarla junto con la banda de incertidumbre del grupo comparable del prestador (segmento), siguiendo la misma regla de `RF-BENCH-03`.

**Prioridad:** debe
**Depende de:** RF-NMT-06, RF-BENCH-03
**Origen:** sección 4.2 de la hoja de ruta (IPUF sector 2024: 10,34 m³/suscriptor/mes frente a estándar de 6, SSPD 2024)

### RF-NMT-08 — Descuentos e incentivos aplicados (NMT-INC-01)

El sistema DEBE mostrar, por prestador y por indicador, el valor y el signo (incentivo positivo o descuento) aplicado en el recálculo anual del costo de referencia, con la tabla de origen citada (Res. 1032, Tabla 31 para descuentos; Tablas 17-25 para incentivos).

**Prioridad:** debe
**Bloqueado por:** Q-NMT-02 (porcentajes de descuento por incumplimiento, hoy "por confirmar")
**Origen:** sección 3.1 de la hoja de ruta

### RF-NMT-09 — Prestadores en riesgo alto según el IUS (NMT-RIE-01)

El sistema DEBE mostrar la proporción de prestadores en niveles 4-5 del Indicador Único Sectorial (IUS, Res. CRA 943 y 946/2021, actualizado por Res. 1014/2025), comparando el valor antes y después de la entrada en vigor de cada NMT, y DEBE señalar la fase del IUS vigente (Fase I 2020-2026, Fase II 2027-2028, Fase III desde 2029).

**Prioridad:** debe
**Fuente del dato:** SSPD, publicación antes del 30 de junio de cada año
**Origen:** sección 4.1 y 3.1 de la hoja de ruta

### RF-NMT-10 — Filtro por marco normativo y segmento

El sistema DEBE permitir filtrar cualquiera de los indicadores NMT-* por `marco_tarifario`, `segmento` y periodo, y DEBE mostrar una nota de no comparabilidad cuando el actor intente comparar prestadores de segmentos distintos o de marcos distintos.

**Prioridad:** debe
**Regla de negocio:** RF-ONTO-06
**Origen:** brecha B-07 de `claude/analisis-propuesta-mockup-vs-context-lake.md`, extendida a este tablero

### RF-NMT-11 — Alerta de hito vencido para el equipo interno

MIENTRAS un hito de `hito` tenga `fecha_prevista` anterior a la fecha actual y `fecha_real` vacía, el sistema DEBE marcarlo como "vencido" en la vista interna del ACT-ANALISTA-CRA y del ACT-COMISIONADO, sin publicarlo como alerta pública.

**Prioridad:** debería
**Origen:** necesidad operativa derivada de `BQ-REG-01`; no hay fuente normativa explícita que exija la alerta, se infiere del objetivo de cerrar el vacío de evaluación ex post

### RF-NMT-12 — Trazabilidad de vacíos normativos

El sistema DEBE mostrar, junto a cada indicador NMT-* que dependa de una tabla marcada "por confirmar" en la fuente normativa, un aviso visible con el texto exacto de la limitación y la pregunta abierta que la bloquea, en vez de omitir el indicador o rellenarlo con un valor de referencia no oficial.

**Prioridad:** debe
**Origen:** sección 6 de la hoja de ruta; regla general de "vacío tapado" (antipatrón, `references/sintaxis-ears-bdd.md`)

## Requisitos no funcionales

### RNF-NMT-01 — Reconstrucción histórica del ciclo

El sistema DEBE poder reconstruir el estado de la línea de tiempo (RF-NMT-01) y de todos los indicadores NMT-* tal como se veían en cualquier fecha pasada, con el mismo mecanismo de versionado de `published` que usa el resto del portal (`RNF-PORTAL-03`).

### RNF-NMT-02 — Actualización tras publicación del IUS

CUANDO la SSPD publique el IUS anual (antes del 30 de junio, ver RF-NMT-09), el sistema DEBE reflejar el nuevo valor de NMT-RIE-01 en un plazo máximo de 5 días hábiles desde la publicación.

## Reglas de negocio

| ID | Regla | Aplica a |
|---|---|---|
| RN-NMT-01 | Ningún indicador NMT-* se combina en un puntaje o índice único de "avance de implementación". | RF-NMT-01 a RF-NMT-09 (extiende RN-PORTAL-05) |
| RN-NMT-02 | Ninguna comparación entre prestadores de distinto segmento o distinto marco tarifario se publica sin la nota de no comparabilidad. | RF-NMT-10 (extiende RF-ONTO-06) |
| RN-NMT-03 | Un valor de NMT-TAR-01 sin desagregación por estrato y segmento NO se publica. | RF-NMT-04 |
| RN-NMT-04 | Los indicadores de riesgo (IUS, brecha de pérdidas) se presentan siempre en la escala donde mayor riesgo es peor, nunca invertidos a "porcentaje de cumplimiento". | RF-NMT-07, RF-NMT-09 (extiende RN-PORTAL-06) |

## Casos borde y errores

| Situación | Comportamiento esperado |
|---|---|
| Un prestador solicita reclasificarse a un segmento superior a más tardar el 31 de marzo del año tarifario anterior al recálculo (regla del art. 2.1.2.1.1.6) | El sistema mantiene el `segmento` vigente hasta la fecha de corte del cambio y registra el hito de reclasificación en `hito`, sin recalcular retroactivamente los indicadores ya publicados |
| Un prestador aparece en más de un `marco_tarifario` (por ejemplo, acueducto bajo la Res. 1032 y aseo bajo la Res. 1040) | El sistema mantiene registros `prestador_marco` independientes por marco; ningún indicador NMT-* se agrega entre marcos distintos |
| Un litigio suspende la aplicación de un marco (caso documentado para la Res. 1040 de aseo) | El sistema marca el `marco_tarifario` como "aplicación suspendida" a partir de la fecha del acto que lo suspende, y conserva visibles los valores ya publicados con la marca de la fecha en que quedaron vigentes |
| Corrección de un valor de línea base ya publicado | Sigue el flujo general de corrección de `RF-PORTAL-07` (historial público); el indicador de cobertura de línea base (RF-NMT-05) se recalcula solo hacia adelante, nunca reescribe silenciosamente un periodo ya cerrado |
| Un indicador depende de una fuente externa sin canal confirmado (IRCA/INS, bloqueado por Q-CAT-01 en `specs/ontologia-indicadores.md`) | RF-NMT-06 muestra el indicador como "sin fuente" para IDH5, igual que en el catálogo V1; no se sustituye por un proxy |

## Fuera de alcance de esta spec

- Los marcos de **pequeños prestadores, rurales y gestores comunitarios (Res. 1038)** y de **aseo, grandes prestadores (Res. 1040)**: su período de inicio, línea base y vigencia están "por confirmar" en la fuente (sección 6 de la hoja de ruta). El modelo de datos (`marco_tarifario`, `etapa_ciclo`) se diseñó para admitirlos sin cambio estructural, pero sus indicadores NMT-ASE-01/02 y las metas de la 1038 quedan para una versión posterior, una vez se cierren Q-NMT-03 y Q-NMT-04.
- El **régimen transitorio de aseo en Bogotá (Res. 1027/1037)**: tiene su propio cronograma de verificación por la CRA hacia la Corte Constitucional; no comparte el ciclo E0-E9 de los otros tres marcos y merece spec propia si se decide incluirlo.
- **Evaluación ex post formal del marco**: la CRA no la tiene institucionalizada (E9 de la hoja de ruta); este tablero documenta el proceso de implementación, no sustituye ni simula una evaluación de impacto regulatorio.
- **Proyección de tarifas futuras**: ningún requisito de esta spec calcula o muestra una tarifa esperada para años tarifarios que aún no han cerrado.
- **Valores concretos de metas, gradualidades y porcentajes de descuento** de la Res. 1032 (Tablas 16, 50-51, 31): quedan como pregunta abierta hasta leer el documento de trabajo completo; ningún requisito de esta spec asume un valor no confirmado como si fuera meta oficial.

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-NMT-01 | ¿Cuáles son los valores de metas y gradualidad por segmento de la Res. 1032 (Tablas 16, 50-51)? | RF-NMT-06 | Subdirección de Regulación |
| Q-NMT-02 | ¿Cuáles son los porcentajes de descuento por incumplimiento de la Res. 1032 (Tabla 31)? | RF-NMT-08 | Subdirección de Regulación |
| Q-NMT-03 | ¿Cuáles son el período de inicio, la línea base y la vigencia de la Res. 1038 (pequeños prestadores)? | Extensión de esta spec a la Res. 1038 | Subdirección de Regulación |
| Q-NMT-04 | ¿Cuál es la fecha oficial de expedición, el número de resolución definitivo y la vigencia (10 o 15 años) de la Res. 1040 (aseo)? | Extensión de esta spec a la Res. 1040 | Subdirección de Regulación / Oficina Jurídica |
| Q-NMT-05 | ¿Cómo se ingiere `prestador_marco.etapa_actual` en la práctica: por reporte directo del prestador a SUI/SURICATA, por proceso batch desde SSPD, o por captura manual del equipo del Observatorio? | RF-NMT-01, RF-NMT-02 | CIO / Ciencia de Datos |
| Q-NMT-06 | ¿La regla de agregación territorial de `ADR-0012` (umbral 80%, peso material 5%) aplica sin cambios a los indicadores NMT-*, o necesitan un umbral propio dado que la implementación apenas empieza (menor cobertura de reporte en 2026-2027)? | Vista territorial de RF-NMT-02, RF-NMT-05 | Subdirección de Regulación |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-16 | Versión inicial, generada bajo el método SDD del Context Lake, a partir de `claude/hoja-de-ruta-nuevos-marcos-tarifarios-2026-09-15.md` (sección 5, "Implicaciones para el Observatorio") | Sesión con Camilo Carvajalino |
