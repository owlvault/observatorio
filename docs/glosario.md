---
id: glosario
tipo: glosario
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-14
fuentes: [README_Context_Lake (Drive), Ley 142 de 1994, Decreto 1077 de 2015, marco tarifario vigente CRA]
---

# Glosario — Observatorio Regulatorio CRA

> **ASUNCIÓN (sin validar):** Las definiciones de esta tabla son **operativas**, redactadas para que un agente use un solo nombre por concepto. **No sustituyen la definición legal.** Donde exista definición en la Ley 142 de 1994, el Decreto 1077 de 2015 o una resolución CRA vigente, esa prevalece. Origen: destilación de material sectorial. Validar con la Subdirección de Regulación antes de publicar cualquier ficha que las cite.

## Entidades y actores del sector

| Término canónico | Definición | Sinónimos que NO usar | Se usa en |
|---|---|---|---|
| Prestador | Persona prestadora de uno o más de los servicios públicos domiciliarios de acueducto, alcantarillado o aseo, registrada ante el SUI. | empresa, ESP, operador, compañía, EPS | todas las specs |
| Segmento | Clasificación del prestador que determina qué metodología tarifaria le aplica, según número de suscriptores del área de prestación. | tamaño, categoría, tipo de empresa | `specs/ontologia-indicadores.md`, `specs/benchmarking-econometrico.md` |
| Área de Prestación del Servicio (APS) | Territorio donde el prestador presta el servicio y sobre el cual se calculan sus costos y metas. | zona de cobertura, área de influencia | `specs/ingesta-sui-y-fuentes.md` |
| Suscriptor | Persona natural o jurídica con contrato de servicios públicos vigente. Es la unidad de facturación. | cliente, abonado, usuario | `specs/ontologia-indicadores.md` |
| Usuario | Persona que se beneficia del servicio, con o sin contrato. No es intercambiable con Suscriptor: un suscriptor puede corresponder a varios usuarios. | suscriptor, cliente | `docs/business_context.md` |
| Vocal de control | Representante del comité de desarrollo y control social de los servicios públicos. | veedor, líder comunitario | `docs/business_context.md` |
| SSPD | Superintendencia de Servicios Públicos Domiciliarios. Administra el SUI y ejerce inspección, vigilancia y control. | Superservicios, la Super | `specs/ingesta-sui-y-fuentes.md` |
| CRA | Comisión de Regulación de Agua Potable y Saneamiento Básico. Expide regulación; **no sanciona**. | la Comisión (en texto público sí; en código, no) | todas |

## Fuentes de información

| Término canónico | Definición | Sinónimos que NO usar | Se usa en |
|---|---|---|---|
| SUI | Sistema Único de Información de servicios públicos domiciliarios, administrado por la SSPD. Fuente autoritativa de datos de prestadores. | sistema de la Super, base SUI | `specs/ingesta-sui-y-fuentes.md` |
| Formulario SUI | Estructura de reporte específica del SUI, con su propio conjunto de variables y periodicidad. | formato, reporte, cargue | `specs/ingesta-sui-y-fuentes.md` |
| Periodo de reporte | Unidad temporal a la que corresponde un dato reportado, distinta de la fecha en que se cargó o descargó. | mes, fecha, corte | `specs/ingesta-sui-y-fuentes.md`, `specs/calidad-de-datos.md` |
| SIASAR | Sistema de Información de Agua y Saneamiento Rural. | sistema rural | `specs/ingesta-sui-y-fuentes.md` |
| SIRH | Sistema de Información del Recurso Hídrico (IDEAM). | sistema del IDEAM | `specs/ingesta-sui-y-fuentes.md` |
| Linaje | Registro del origen de un dato: fuente, formulario, periodo de reporte, fecha de descarga y hash del archivo crudo. | trazabilidad, procedencia, metadato | `specs/ingesta-sui-y-fuentes.md` |

## Dimensiones e indicadores

| Término canónico | Definición | Sinónimos que NO usar | Se usa en |
|---|---|---|---|
| Indicador | Medida calculada a partir de datos de fuentes oficiales, con ficha metodológica aprobada. Sin ficha aprobada, un cálculo **no es** un indicador. | KPI, métrica, variable | todas las specs |
| Ficha metodológica | Documento que define fórmula, norma que la sustenta, unidad, desagregaciones, periodicidad, umbrales y limitaciones de un indicador. | ficha técnica, metadato del indicador | `specs/ontologia-indicadores.md` |
| Cobertura | Proporción de la población o de las viviendas del APS con acceso al servicio. | penetración, alcance | `specs/ontologia-indicadores.md` |
| Continuidad | Horas de servicio efectivo por día en el APS, en un periodo. Unidad: horas/día. | disponibilidad, uptime | `specs/ontologia-indicadores.md` |
| IRCA | Índice de Riesgo de la Calidad del Agua para consumo humano. Mayor valor significa mayor riesgo. | índice de calidad, calidad del agua | `specs/ontologia-indicadores.md` |
| IRABAm | Índice de Riesgo por Abastecimiento de Agua para consumo humano, de alcance municipal. | riesgo de abastecimiento | `specs/ontologia-indicadores.md` |
| IANC | Índice de Agua No Contabilizada: proporción del agua producida que no se factura. | pérdidas, agua no facturada, NRW | `specs/ontologia-indicadores.md` |
| IPUF | Índice de Pérdidas por Suscriptor Facturado. **No es intercambiable con IANC**: distinta unidad y distinto uso regulatorio. | pérdidas por suscriptor, IANC | `specs/ontologia-indicadores.md` |
| CMA | Costo Medio de Administración. | costo administrativo | `specs/ontologia-indicadores.md` |
| CMO | Costo Medio de Operación. | costo operativo | `specs/ontologia-indicadores.md` |
| CMI | Costo Medio de Inversión. | costo de inversión, CAPEX | `specs/ontologia-indicadores.md` |
| CMT | Costo Medio generado por Tasas Ambientales. | tasas, costo ambiental | `specs/ontologia-indicadores.md` |
| Costo Unitario | Costo de referencia por unidad de consumo, resultante de la metodología tarifaria vigente. Unidad: $/m3. | tarifa, precio, CU | `specs/ontologia-indicadores.md` |
| Tarifa aplicada | Valor efectivamente cobrado al suscriptor tras subsidios y contribuciones. **Distinta del Costo Unitario.** | tarifa, costo | `specs/portal-publico.md` |
| Cargo fijo | Componente de la tarifa independiente del consumo. | básico, mínimo | `specs/ontologia-indicadores.md` |
| Consumo básico | Rango de consumo definido regulatoriamente sobre el que aplica el subsidio. | mínimo vital, consumo de subsistencia | `specs/ontologia-indicadores.md` |
| Mínimo vital | Política de provisión de una cantidad de agua sin costo para población focalizada. **No es** el consumo básico. | consumo básico, subsidio | `docs/business_context.md` |
| Subsidio | Aporte que reduce el valor pagado por suscriptores de estratos bajos. | descuento, ayuda | `specs/ontologia-indicadores.md` |
| Contribución | Aporte solidario que pagan estratos altos, comercial e industrial. | sobretasa, impuesto | `specs/ontologia-indicadores.md` |
| Asequibilidad | Peso de la factura del servicio sobre el ingreso o gasto del hogar. | affordability, capacidad de pago | `specs/ontologia-indicadores.md` |
| Aprovechamiento | Actividad del servicio de aseo consistente en recuperar material reciclable para reincorporarlo al ciclo económico. | reciclaje, economía circular | `specs/ontologia-indicadores.md` |
| Suscriptor facturado | Suscriptor con facturación efectiva en el periodo. Denominador de varios indicadores; **no** es el total de suscriptores registrados. | suscriptor, usuario facturado | `specs/ontologia-indicadores.md` |

## Términos del Observatorio

| Término canónico | Definición | Sinónimos que NO usar | Se usa en |
|---|---|---|---|
| Semáforo de calidad | Calificación visible (verde, amarillo, rojo) del grado de confianza del dato que soporta un valor publicado. | confiabilidad, score, bandera | `specs/calidad-de-datos.md`, `specs/portal-publico.md` |
| Cuarentena | Estado de un dato que no pasó las reglas duras de validación: se conserva, no se borra, y **no alimenta indicadores publicados**. | rechazado, descartado, error | `specs/calidad-de-datos.md` |
| Grupo comparable | Conjunto de prestadores con características estructurales similares, sobre el cual es válido comparar eficiencia. | peer group, cluster, ranking | `specs/benchmarking-econometrico.md` |
| Observación ciudadana | Comentario remitido por un tercero a un proyecto regulatorio durante su periodo de participación. | comentario, PQR, queja | `specs/nlp-participacion-ciudadana.md` |
| PQR | Petición, queja o reclamo de un suscriptor ante su prestador. **No es** una observación ciudadana ni entra al Observatorio con datos identificables. | reclamo, observación | `docs/business_context.md` |
| Versión de ficha | Identificador incremental de la definición de un indicador. Un cambio de fórmula crea versión nueva; **nunca** reescribe la anterior. | actualización, revisión | `specs/ontologia-indicadores.md` |
| Marca corta | "Observatorio CRA": contracción del nombre canónico para menús, pestañas, ruta del micrositio y prensa (`adr/ADR-0009`). No es un nombre distinto. | Observatorio de Agua, Territorio y Bienestar; Observatorio del Agua; ORAS | `specs/portal-publico.md` |
| Lema | "Datos abiertos para que el agua y el aseo lleguen a todos". Solo en portada y materiales de lanzamiento; nunca en fichas ni datos (`adr/ADR-0009`). Pendiente de ratificación por Dirección Ejecutiva. | eslogan, tagline | `specs/portal-publico.md` |
| Perfil de prestador | Vista pública de un prestador con sus indicadores, semáforos, estados, grupo comparable y objeciones (`RF-PORTAL-12`). | ficha del prestador, página de la empresa | `specs/portal-publico.md` |
| Perfil territorial | Vista pública de un municipio o departamento con los agregados de `RF-ONTO-09`, su cobertura de reporte y la descomposición por prestador (`RF-PORTAL-13`). | perfil municipal, tablero territorial | `specs/portal-publico.md` |
| Cifra destacada | Indicador del catálogo mostrado en portada con semáforo, fecha de corte, cobertura de reporte y enlace a ficha (`RF-PORTAL-14`). | KPI de portada, cifra clave | `specs/portal-publico.md` |
| Cobertura de reporte | Proporción de suscriptores facturados de un territorio representados por valores válidos en un agregado (`RF-ONTO-09`). Distinta de Cobertura (del servicio). | completitud territorial, representatividad | `specs/ontologia-indicadores.md` |
| Regla de agregación territorial | Función declarada en el campo 14 de la ficha para subir de prestador a municipio, departamento y nacional: cociente de sumas, promedio ponderado, ponderado con distribución por riesgo, suma o no agregable (`adr/ADR-0012`). | promedio, consolidado | `specs/ontologia-indicadores.md` |
| Contenido editorial | Estudio, boletín, nota técnica, infografía o texto institucional publicado en el micrositio con aprobación de ACT-EQUIPO-EDITORIAL; no pasa por la compuerta de datos pero cita indicadores publicados (`RF-PORTAL-15`). | publicación, artículo, noticia | `specs/portal-publico.md` |

Sinónimos prohibidos adicionales, sin término canónico porque el concepto no existe en el Observatorio: **tarifa promedio** (usar Tarifa aplicada o Costo Unitario, nunca ambos como uno), **puntaje**, **score de calidad**, **índice de eficiencia**, **ranking** (prohibidos por `RN-PORTAL-05` y `adr/ADR-0005`).

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-GLO-01 | ¿Cuál es el umbral vigente de suscriptores que separa los segmentos de prestadores y en qué resolución está? | Definición de Segmento; RF-ONTO-06 | Subdirección de Regulación |
| Q-GLO-02 | ¿Se adopta la definición de Cobertura por viviendas o por población? Las dos circulan en el sector y no dan el mismo número. | RF-ONTO-01 | Subdirección de Regulación |
| Q-GLO-03 | ¿Qué resoluciones conforman el marco tarifario vigente por servicio y segmento, con su numeración exacta y sus modificaciones? | Regla de oro 2 de `AGENTS.md` | Subdirección de Regulación |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial con 40 términos canónicos | Destilación del README y conocimiento sectorial; pendiente validación normativa |
| 2026-09-14 | Ocho términos del Observatorio (marca corta, lema, perfiles, cifra destacada, cobertura de reporte, regla de agregación, contenido editorial) y sinónimos prohibidos sin canónico | `adr/ADR-0009`, `adr/ADR-0012`; análisis de la carpeta `09_` |
