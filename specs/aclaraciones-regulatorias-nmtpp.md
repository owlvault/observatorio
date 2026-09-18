---
id: aclaraciones-regulatorias-nmtpp
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, 07_/diagnostico-viabilidad-monitoreo-nmt-pp-acueducto-2026-09-18.md, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# Requerimientos de aclaración regulatoria — NMT de pequeños prestadores de acueducto (Res. CRA 1038 de 2026)

## Propósito

Este documento se dirige a la **Subdirección Técnica de Regulación** (ACT-SUBDIRECCION-REGULACION). Presenta los catorce puntos de la Res. CRA 1038 de 2026 y de su Documento Técnico que el Observatorio no puede convertir en indicadores sin una decisión de quien tiene la competencia regulatoria.

El Observatorio **no interpreta la norma** (regla de oro 1 de `AGENTS.md`). Mientras un punto no se aclare, el indicador afectado se publica con el estado "meta pendiente de aclaración normativa" o "sin fuente confirmada", nunca con un valor supuesto.

Cada requerimiento trae lo que la Subdirección necesita para responder sin reconstruir el análisis: el texto normativo exacto, el problema, las opciones, una recomendación técnica del equipo del Observatorio, el impacto en los indicadores, el formato de respuesta y la fecha límite útil.

> La recomendación de cada requerimiento es **una propuesta del equipo del Observatorio para facilitar la decisión**, no una interpretación adoptada. Solo vale como regla cuando la Subdirección la ratifica por el medio que indique el campo "Forma de respuesta".

## Cómo responder y cómo se incorpora la respuesta

1. La Subdirección responde cada Q-NMTPP con el formato de su sección, por memorando, concepto o circular. Si la respuesta modifica la norma, lo hace por acto administrativo.
2. El ACT-ANALISTA-CRA registra la respuesta en la entidad `aclaracion` (estado `respondida`, con referencia al documento).
3. El ACT-ANALISTA-CRA crea la versión nueva de la ficha afectada (RF-ONTO-04) y actualiza `specs/nmtpp/parametros-res-1038.json` con la versión nueva.
4. El sistema recalcula los estados desde el primer año afectado y deja la traza en el historial público (RF-NMTPP-18). El estado de la aclaración pasa a `incorporada`.

## Resumen y prioridad

| ID | Tema | Tipo | Indicadores bloqueados | Fecha límite útil | Prioridad |
|---|---|---|---|---|---|
| Q-NMTPP-03 | Regla de subsegmentación | Contradicción Resolución vs DT | NMTPP-ADO-02, y el subsegmento de todos los demás | 2026-11-30 | Crítica |
| Q-NMTPP-09 | Formato estructurado de línea base y metas declaradas | Vacío operativo | Todos los de nivel de servicio con meta declarada | 2026-11-30 | Crítica |
| Q-NMTPP-10 | Formatos y plazos de reporte SSPD | Dependencia institucional | Toda la capa de nivel de servicio | 2026-12-31 | Crítica |
| Q-NMTPP-11 | Plazo de remisión del estudio de costos | Vacío | NMTPP-ADO-01 | 2026-12-15 | Alta |
| Q-NMTPP-14 | Alcance de publicación del estado frente a meta | Jurídico | Todos los estados frente a meta (vista pública) | 2026-12-15 | Alta |
| Q-NMTPP-01 | Unidad de la continuidad del S1 | Contradicción interna | NMTPP-S1-CON | 2027-12-31 | Alta |
| Q-NMTPP-02 | Línea base de continuidad | Contradicción Resolución vs DT | NMTPP-S1-CON, NMTPP-S2-CON | 2026-12-31 | Alta |
| Q-NMTPP-08 | Metas anuales intermedias | Vacío | S1-MIC, S1-CON, S2-MIC, S2-CON, INC-01 | 2027-12-31 | Alta |
| Q-NMTPP-06 | Fuente y regla del IRCA | Vacío | NMTPP-S1-CAL, NMTPP-S2-CAL | 2027-06-30 | Alta |
| Q-NMTPP-07 | Denominador del IPUF | Ambigüedad de fórmula | NMTPP-S1-PER, incentivo de pérdidas | 2027-12-31 | Media |
| Q-NMTPP-12 | Reportes exigibles para el incentivo de reporte | Dependencia institucional | NMTPP-INC-02 | 2028-06-30 | Media |
| Q-NMTPP-04 | Normalización del ISE | Vacío | NMTPP-ISE-01 (réplica) | 2028-05-31 | Media |
| Q-NMTPP-13 | ISE con costos unificados; APS insulares | Decisión pendiente de la CRA | NMTPP-ISE-01 | 2028-05-31 | Media |
| Q-NMTPP-05 | Fe de erratas de remisiones internas | Error material | Codificación de reglas | 2026-12-31 | Media |

Las fechas se derivan del calendario de la norma: registro maestro antes del 1-ene-2027; primera medición con datos de 2027 durante 2028; publicación del ISE a más tardar el 31-ago-2028.

---

## Q-NMTPP-01 — Unidad del índice de continuidad del primer segmento

**Texto normativo**

- Art. 2.1.1.1.2.1.2 (estándar S1): *"97,26 % de continuidad anual (Máximo 10 días sin servicio al año)"*.
- Anexo 6.2.1.10 a) (fórmula S1): *"IC_g = ( Σ(Nhs_s × Ns_s) / (Nht_g × NS_g) ) × (24h/día)"*, con IC *"redondeado a dos (2) cifras decimales (en porcentaje)"*.
- Anexo 6.2.1.10 b), c) y d) (S2, APS especiales, esquemas diferenciales): *"IC_i = (1 − H_afectación,i / H_año,i) × 100"*, en %.

**Problema.** Al multiplicar por 24 h/día, la fórmula del S1 da **horas por día** (entre 0 y 24), pero el anexo la declara "en porcentaje" y el estándar está en %. Con el texto actual un valor de 23,1 se puede leer como 23,1 h/día (96,25 %) o como 23,1 %. Además, la regla de oro 6 del Observatorio publica la continuidad en h/día.

**Opciones**

| Opción | Regla | Efecto |
|---|---|---|
| A | La fórmula correcta del S1 es la fracción sin el factor 24 (× 100, en %) | Unifica con S2; el estándar 97,26 % se aplica directo |
| B | La fórmula da h/día y el estándar equivale a 97,26 % × 24 = 23,34 h/día | Conserva la fórmula; requiere declarar la equivalencia |
| C | Otra regla que la Subdirección defina | — |

**Recomendación del equipo.** Opción B, declarando que el estándar en h/día es 23,34 (97,26 % × 24). Es algebraicamente equivalente a la opción A, conserva la fórmula del anexo y es coherente con la unidad canónica h/día del Observatorio. El prototipo tiene esta conversión detrás de la bandera `continuidad_equivalencia_24h`, desactivada hasta que haya respuesta.

**Impacto.** NMTPP-S1-CON (estado frente a meta), el componente de continuidad del ISE y el incentivo de continuidad sobre el CMOG.

**Forma de respuesta.** Memorando que indique: (1) opción adoptada; (2) unidad oficial del IC para el S1; (3) valor del estándar en esa unidad, con dos decimales; (4) si hace falta fe de erratas del anexo.

**Criterio de aceptación.** Con la respuesta, un analista calcula sin ambigüedad si 23,00 h/día cumple o no el estándar.

---

## Q-NMTPP-02 — Línea base del indicador de continuidad

**Texto normativo**

- Art. 2.1.1.1.1.7 par. 4: *"la línea base de los indicadores de nivel de servicio se determinará con base en la información disponible al final de la vigencia de la metodología tarifaria contenida en la Resolución CRA 825 de 2017"*.
- Art. 2.1.1.1.2.1.1 par. 1: *"La línea base deberá reflejar la situación real de los indicadores al final de la vigencia (…)"*.
- DT §7.1.1.3: *"se toma como línea base la meta establecida en el marco anterior, bajo el entendido de que dichas metas fueron definidas para ser alcanzadas durante el periodo de aplicación de esa metodología"*.

**Problema.** La meta de continuidad es un **cierre porcentual de la brecha** entre la línea base y el estándar, así que la meta cambia según qué se tome como línea base. Ejemplo con la opción B de Q-NMTPP-01 para un prestador de S1-1 con continuidad real de 20,0 h/día:

- Con la situación real, la brecha es 3,34 h/día y la meta del año 3 es 22,34 h/día.
- Si la meta de la Res. 825 ya era el estándar, la brecha es cero y la meta del año 3 es 23,34 h/día. En ese caso el cierre gradual del 70 % pierde sentido.

**Opciones**

| Opción | Línea base |
|---|---|
| A | Situación real al 31-dic-2026 (texto de la Resolución) |
| B | Meta que tenía el prestador en la Res. 825 (texto del DT) |
| C | La mayor entre la real y la meta anterior (protege la no regresividad) |

**Recomendación del equipo.** Opción A, porque es el texto del acto vinculante (RN-NMTPP-07). Solicitamos además precisar qué hacer cuando no hay dato real. El DT informa que el 96 % de los prestadores no reportó continuidad entre 2016 y 2021 y la norma permite "el período de información disponible más cercano". Preguntamos si, sin dato, la línea base se construye con el periodo de observación de 90 días del Anexo 6.2.1.11 aplicado a 2027.

**Impacto.** NMTPP-S1-CON, NMTPP-S2-CON, NMTPP-NRG-01 y el incentivo de continuidad.

**Forma de respuesta.** (1) Opción adoptada; (2) periodo de referencia exacto (año 2026, último año con dato, u otro); (3) regla para prestadores sin dato; (4) si la regla es la misma para S1, S2, APS especiales y esquemas rurales.

---

## Q-NMTPP-03 — Regla de subsegmentación para quien presta acueducto y alcantarillado

**Texto normativo**

- Art. 2.1.1.1.1.6 par. 1: *"En caso de prestar ambos servicios, la clasificación en el subsegmento se determinará con base en la cifra que resulte mayor entre los dos totales. Esta subsegmentación aplicará de manera unificada para ambos servicios."*
- DT §5.3: *"En el caso de prestar los dos servicios, la segmentación aplicará tomando como referencia el valor de los suscriptores de acueducto, y será tenido en cuenta para ambos servicios."*
- Art. 2.1.1.1.1.1 par. 3 (ámbito): *"se tomará en cuenta el servicio que registre el mayor número de suscriptores"*.

**Problema.** Un prestador con más suscriptores de alcantarillado que de acueducto puede quedar en subsegmentos distintos según la regla. La diferencia no es menor: cambian los años de cumplimiento de todas las metas, la tasa de incentivo del CMI y el grupo contra el que se compara. Como la clasificación es única e invariable (par. 3), el error dura cinco años.

**Opciones.** A: cifra mayor (Resolución). B: suscriptores de acueducto (DT).

**Recomendación del equipo.** Opción A, porque es el texto vinculante y es coherente con la regla de ámbito del art. 2.1.1.1.1.1 par. 3. Solicitamos una circular aclaratoria a prestadores antes del primer estudio de costos, porque el DT es público y puede inducir la otra lectura.

**Impacto.** NMTPP-ADO-02 y el subsegmento de todos los indicadores del S1 y del S2.

**Forma de respuesta.** (1) Regla adoptada; (2) variable SUI y fecha de corte de "suscriptores" (catastro, facturados promedio o facturados a diciembre de 2024); (3) si se publicará aclaración a prestadores.

---

## Q-NMTPP-04 — Normalización de los indicadores del ISE

**Texto normativo**

- Anexo 6.2.1.4: fija dimensiones y ponderaciones y dice que *"cada indicador se normaliza en una escala de desempeño (0 a 100)"*, sin decir cómo.
- DT §7.1.8: *"Y_i = ((X_i − X_min)/(X_max − X_min)) × 100 (…) X_min y X_max son los valores mínimo y máximo del indicador sin normalizar"*.

**Problema.** Sin la regla de normalización, nadie fuera del equipo que calcula puede replicar el ISE, y un prestador no puede verificar su propio valor. Faltan ocho definiciones:

1. **Conjunto de referencia** de mínimos y máximos: todo el S1, el subsegmento, el servicio o el año.
2. **Sentido de cada indicador.** En el costo administrativo más operativo por suscriptor, menor debería ser mejor. En macromedición, mayor es mejor.
3. **Tratamiento de valores atípicos** (recorte por percentiles, winsorización).
4. **Tratamiento de valores faltantes** en un indicador cuando los demás sí existen.
5. **Definición operativa de cada uno de los seis indicadores de acueducto:** fórmula, variable SUI e IUS de origen, y periodo. En particular "reporte y calidad de agua potable" y "atención de PQR".
6. **Moneda y año base** del costo por suscriptor.
7. **Si el mínimo y el máximo se fijan por año** (cambian cada año) o se congelan al inicio de la vigencia.
8. **Cómo se combinan los incentivos con el ISE:** si los "+5 %" o "+2,5 %" se suman como puntos porcentuales o multiplican el ISE; si se aplican antes o después del piso de transición (90/80/70 %) y del umbral de 70 %; y si la CRA publica un ISE aplicable al CMOG y otro al CMA, como sugieren los arts. 2.1.1.1.2.2.6.2 y 6.3 par. 2.

**Recomendación del equipo.** Que la CRA publique, con la primera publicación del ISE, una nota metodológica con estas ocho definiciones y un archivo de cálculo de ejemplo. El Observatorio solo muestra el ISE oficial (`adr/ADR-0015`), pero no puede afirmar que lo muestra correctamente si no lo puede replicar.

**Impacto.** Reproducibilidad de NMTPP-ISE-01 y verificación de los incentivos.

**Forma de respuesta.** Nota metodológica del ISE que responda las ocho definiciones, con un ejemplo numérico de un prestador.

---

## Q-NMTPP-05 — Fe de erratas de remisiones internas

Estas remisiones del texto apuntan a un artículo que no corresponde. El Observatorio no puede codificar una regla que remite a un artículo inexistente o equivocado.

| # | Dónde | Dice | Debería decir (propuesta) |
|---|---|---|---|
| 1 | Art. 2.1.1.1.2.2.6.2 par. 2 y art. 2.1.1.1.2.2.6.3 par. 2 | publicación anual del ISE "de que trata el Artículo 2.1.1.1.2.2.**8.1**" | 2.1.1.1.2.2.**7.1** (el 8.1 trata del análisis de beneficio de la unificación) |
| 2 | Art. 2.1.1.1.2.2.7.1 par. 3 | incentivos "de conformidad con (…) los Artículos 2.1.1.1.2.2.7.2 y 2.1.1.1.2.2.**7.3**" | 2.1.1.1.2.2.**6.2 y 6.3** (el 7.3 no existe; el 7.2 es la transición del ISE) |
| 3 | Art. 2.1.1.1.2.2.6.4 | recálculos anuales "que dispone el Artículo 2.1.1.1.2.2.**1.4**" | 2.1.1.1.2.2.**1.2** (el 1.4 es el cargo por consumo) |
| 4 | Art. 2.1.1.1.2.2.9.1 num. 8 | incentivos según "la Subsección **7**" | Subsección **6** (la 7 es el ISE) |
| 5 | Art. 2.1.1.1.2.2.9.1 num. 7 | análisis de beneficio en "la Sección 1, del Capítulo 5" | Subsección 8, Sección 2, Capítulo 2 |
| 6 | Art. 2.1.1.1.3.2.5.2 num. 3 | aportes por conexión "Artículos **2.1.13 a 2.1.16**" | 2.**2**.13 a 2.**2**.16 (así en el art. 2.1.1.1.3.2.5.1) |
| 7 | Encabezado del art. "2.1.1.**12**.2.5.3" | numeración | 2.1.1.1.2.2.5.3 |
| 8 | Art. 2.1.1.1.2.2.6.4 (autodiagnóstico) | "que trata el Artículo 6.2.1.5 del presente Título" | numeral 6.2.1.5 del Anexo (Título 1, Parte 2, Libro 6) |

**Forma de respuesta.** Confirmación de la tabla, o corrección de ella. Si procede, fe de erratas por acto administrativo.

---

## Q-NMTPP-06 — Fuente, canal y regla temporal del IRCA

**Texto normativo.** Arts. 2.1.1.1.2.1.2 par. 3 y 2.1.1.1.3.1.2 par. 3: *"deberán cumplir con un valor del IRCA <=5 % desde la entrada en vigencia"*. El IRCA se define en el art. 12 del Decreto 1575 de 2007.

**Problema.** La Resolución exige el estándar pero no dice:

1. qué fuente es la oficial (el IRCA de la autoridad sanitaria o el del control del prestador);
2. por qué canal llega al Observatorio;
3. sobre qué periodo se evalúa el "≤ 5 %": cada muestra, cada mes, el promedio anual o cada mes del año;
4. cómo se trata un mes sin muestra.

En el catálogo V1 esto ya está abierto como Q-CAT-01 (IND-CAL-01).

**Recomendación del equipo.** Tomar como fuente oficial el IRCA de la vigilancia de la autoridad sanitaria. Evaluar el estándar con el promedio anual, reportando además cuántos meses superaron el 5 % y cuántos no tuvieron dato. Cerrar el canal junto con Q-CAT-01 para que el Observatorio tenga una sola fuente de IRCA.

**Impacto.** NMTPP-S1-CAL, NMTPP-S2-CAL y el componente de calidad del ISE.

**Forma de respuesta.** (1) Fuente oficial; (2) regla temporal; (3) tratamiento de meses sin muestra; (4) canal y responsable de la entrega.

---

## Q-NMTPP-07 — Denominador del IPUF y agua producida sin macromedición

**Texto normativo.** Anexo 6.2.1.10 a): *"IPUF_i = (AS_i,ac − AF_i,ac) / N_i,ac"*, en m³/suscriptor/mes, con AS y AF en m³/año, y *"N_i,ac: (…) Sumatoria de todos los suscriptores facturados del año tarifario i"*.

**Problemas**

1. Con facturación **mensual**, sumar los suscriptores de los 12 periodos da suscriptor-mes y el cociente sale en m³/suscriptor/mes, que es correcto. Con facturación **bimestral**, la suma de 6 periodos da suscriptor-bimestre y el resultado sale en m³/suscriptor/**bimestre**: el doble del valor mensual, comparado contra el mismo IPUF* de 6.
2. AS se construye con el agua producida (AP), que requiere macromedición. Sin macromedición no hay AS medido. La norma no dice si se permite estimarlo ni con qué método.

**Recomendación del equipo.** Definir N como el promedio mensual de suscriptores facturados multiplicado por 12, independiente del ciclo de facturación. Declarar el IPUF como "no calculable" cuando AP no provenga de macromedición operativa, en vez de aceptar estimaciones.

**Impacto.** NMTPP-S1-PER y el incentivo de pérdidas sobre el CMOG.

**Forma de respuesta.** (1) Definición de N; (2) tratamiento de AP sin macromedición.

---

## Q-NMTPP-08 — Metas anuales intermedias

**Texto normativo**

- La norma fija el **año de cumplimiento** (micromedición, macromedición) o el **cierre de brecha al año 3 o 5** (continuidad) por subsegmento.
- Art. 2.1.1.1.2.1.1 par. 1: los prestadores deben *"proyectar las metas a las que se comprometen en cada uno de los años de vigencia"*.
- Arts. 2.1.1.1.2.2.6.2 y 6.3: los incentivos de continuidad y micromedición se reconocen a quien *"cumpla o supere las metas anuales (…) definidas para su subsegmento"*.

**Problema.** Los incentivos empiezan en el año 3 y se evalúan con el año i-2, es decir con el año 1 (2027). Para los subsegmentos con cumplimiento en el año 3 o 5, la norma no fija una meta de subsegmento para el año 1. Hay dos lecturas:

- (a) la meta anual es la que declara cada prestador en su estudio;
- (b) debe existir una senda de subsegmento que la CRA no ha publicado.

Además, la lectura (a) crea un incentivo a declarar metas bajas.

**Opciones**

| Opción | Meta anual intermedia |
|---|---|
| A | La declarada por el prestador, con la única restricción de llegar al estándar en el año de cumplimiento |
| B | Senda lineal de subsegmento publicada por la CRA |
| C | La declarada, con un piso mínimo que fije la CRA (p. ej. no inferior a la senda lineal) |

**Recomendación del equipo.** Opción C: conserva la proyección propia que ordena la norma y evita que se declaren metas bajas para ganar el incentivo. El Observatorio no interpola sendas mientras no haya respuesta (RF-NMTPP-06).

**Impacto.** NMTPP-S1-MIC, S1-CON, S2-MIC, S2-CON, NMTPP-INC-01 y el cálculo del ISE con incentivos.

**Forma de respuesta.** (1) Opción; (2) si es B o C, la tabla de metas por subsegmento y año para micromedición y continuidad; (3) si la opción aplica a los incentivos, al seguimiento o a ambos.

---

## Q-NMTPP-09 — Formato estructurado de línea base y metas declaradas en el estudio de costos

**Texto normativo.** Art. 2.1.1.1.2.2.9.1 num. 3 y 4 (S1) y art. 2.1.1.1.3.2.5.1 lit. i (S2): el estudio debe contener la línea base y las metas anuales. El parágrafo manda remitirlo a la CRA y a la SSPD y *"reportarlo en los formatos diseñados para tal fin"* por la SSPD.

**Problema.** Si la línea base y las metas llegan en documentos libres (PDF), capturarlas para 2.800 prestadores es inviable y aparecen errores de transcripción. Varias metas son autoproyectadas (cobertura, senda del IPUF, trayectoria de continuidad), así que sin ese dato no se puede comparar nada.

**Recomendación del equipo.** Que la CRA adopte, en coordinación con la SSPD, un anexo estructurado mínimo del estudio de costos: una hoja o formato con una fila por prestador, servicio, APS, indicador y año tarifario, con los campos:

- `nit`, `id_sui`, `servicio`, `id_aps`, `divipola`;
- `subsegmento_declarado`, `suscriptores_ac_2024`, `suscriptores_al_2024`, `opcion_s2_a_s1`;
- `indicador` (MICROMEDICION, CONTINUIDAD, MACROMEDICION, COBERTURA, IPUF, PSH);
- `linea_base_valor`, `linea_base_unidad`, `linea_base_periodo`;
- `anio_tarifario`, `meta_valor`;
- `condicion_especial` (lista), `esquema_diferencial`.

El Observatorio lo captura según `adr/ADR-0014`.

**Forma de respuesta.** (1) Si se adopta el anexo; (2) su estructura final; (3) si lo recibe la CRA, la SSPD o ambas.

---

## Q-NMTPP-10 — Formatos y plazos de reporte a la SSPD

**Texto normativo.** La Resolución remite el reporte a *"la forma indicada por la SSPD, a través del SUI o el mecanismo que defina dicha entidad"* en los arts. 2.1.1.1.1.5 num. 7, 2.1.1.1.1.8 par., 2.1.1.1.2.1.1 par. 3, 2.1.1.1.3.1.1 par. 3, 2.1.1.1.3.2.3.1 par. 4, 2.1.1.1.6.1 par. 5 y 2.1.1.1.7.1.2. No fija plazo para que existan los formatos.

**Problema.** Sin formatos no hay reporte comparable de 2027, y sin reporte de 2027 se pierde el primer ciclo de incentivos (i-2).

**Solicitud.** Que la Subdirección gestione con la SSPD e informe al Observatorio:

1. la lista de formatos nuevos o modificados, con sus variables;
2. la fecha de expedición prevista;
3. la periodicidad y el plazo de cargue de cada uno;
4. si habrá formatos proporcionales para gestores comunitarios (art. 2.1.1.1.3.2.3.1 par. 4).

**Impacto.** Toda la capa de nivel de servicio.

---

## Q-NMTPP-11 — Plazo de remisión del estudio de costos

**Texto normativo.** Arts. 2.1.1.1.2.2.9.1 par. y 2.1.1.1.3.2.5.1-2 par.: el estudio *"se remite"* a la CRA y la SSPD. El art. 2.1.1.1.1.7 fija el inicio de aplicación en el 1-ene-2027, pero no hay una fecha límite de remisión.

**Problema.** NMTPP-ADO-01 necesita un umbral para decir "remitido a tiempo". ¿El estudio se debe remitir antes del 1-ene-2027, antes de la primera factura con la nueva tarifa, o en otro plazo? ¿Y los recálculos anuales se remiten dentro de la ventana del 1-ene al 31-may?

**Recomendación del equipo.** Definir: estudio inicial remitido antes de facturar con la nueva tarifa; recálculos remitidos a más tardar el 31-may de cada año.

**Forma de respuesta.** Plazos para el estudio inicial y para los recálculos, con su fundamento.

---

## Q-NMTPP-12 — Reportes exigibles para el incentivo de reporte y gestión de la información

**Texto normativo.** Art. 2.1.1.1.2.2.6.3 num. 4: incentivo si se cumple *"el cien por ciento (100 %) de los reportes obligatorios exigibles para el período evaluado"*, según *"el calendario, requerimientos y condiciones definidos por la SSPD"*. Par. 5 define el periodo evaluado.

**Problema.** El Observatorio no tiene la lista de reportes obligatorios por segmento y subsegmento ni su calendario, que es lo que define el denominador del indicador.

**Solicitud.** Que la Subdirección obtenga de la SSPD, para cada año evaluado, la lista de reportes exigibles para prestadores del S1, con su plazo máximo de cargue. Y que confirme si la CRA determinará el incentivo con el certificado de cumplimiento de la SSPD o con un cálculo propio.

---

## Q-NMTPP-13 — Nivel del ISE con costos unificados y lista de APS insulares

**Texto normativo**

- Art. 2.1.1.1.2.2.7.1 par. 1: *"en caso de que los prestadores decidan unificar costos, la CRA determinará si el ISE se calcula por APS o por el conjunto de APS"*.
- Par. 4 y art. 2.1.1.1.2.2.7.2 par. 2: exención para zonas insulares, con acreditación técnica del prestador.

**Solicitud**

1. Criterio y decisión sobre el nivel del ISE para prestadores con costos unificados.
2. Procedimiento y resultado de la acreditación de la condición insular, para que el Observatorio muestre "no aplica (zona insular)" solo a quien fue acreditado.

---

## Q-NMTPP-14 — Alcance de la publicación del estado frente a meta

**Contexto.** El Observatorio no emite juicios de cumplimiento con efecto jurídico (`AGENTS.md`, fuera de alcance; `docs/business_context.md`, no-objetivos). La verificación del cumplimiento es de la SSPD (art. 2.1.1.1.1.8 par.). Sin embargo, el art. 2.1.1.1.1.8 define las metas como trayectorias que orientan el *"seguimiento regulatorio"*, y el DT §10.5 prevé un *"tablero público"*.

**Pregunta**

1. ¿Puede publicarse por prestador el estado frente a meta (catálogo RN-NMTPP-03), con la leyenda de RN-NMTPP-05?
2. ¿O en la vista pública solo el valor observado y la meta, sin estado?
3. ¿Qué tratamiento se da a "no reportó"? RF-PORTAL-11 lo publica como valor visible.

**Recomendación del equipo.** Publicar el valor, la meta y el estado, con la leyenda de RN-NMTPP-05, usando los términos del catálogo. Nunca usar "incumple", porque es una calificación reservada a la SSPD.

**Responsable.** Subdirección Técnica de Regulación con concepto de la Oficina Jurídica.

---

## Preguntas abiertas

Este archivo **es** el registro de las preguntas Q-NMTPP-01 a Q-NMTPP-14. No tiene preguntas adicionales.

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión inicial con 14 requerimientos | Diagnóstico de viabilidad del 2026-09-18 |
