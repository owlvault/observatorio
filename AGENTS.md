---
id: agents
tipo: agents
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-28
fuentes: [README_Context_Lake_Observatorio_Regulatorio_CRA (Drive), Plan_de_Investigacion_y_Hoja_de_Ruta_Poblamiento_Observatorio_CRA (Drive), decisiones de sesion 2026-09-13, decisiones de sesion 2026-09-14 (carpeta 09_), sesión /learn 2026-09-15 (estándares UI/UX), hoja de ruta de implementación de los NMT (sesión 2026-09-15/16), Res. CRA 1038 de 2026 y su Documento Técnico (sesión 2026-09-18)]
---

# Observatorio Regulatorio de Agua Potable y Saneamiento Básico — CRA

Nombre canónico. La marca corta "Observatorio CRA" y el lema están fijados en `adr/ADR-0009`, pendiente de ratificación; ningún otro nombre es válido en este repositorio.

Plataforma pública de información regulatoria del sector de acueducto, alcantarillado y aseo en Colombia, operada por la Comisión de Regulación de Agua Potable y Saneamiento Básico (CRA). Publica indicadores comparables de prestadores —calidad, continuidad, pérdidas, eficiencia, asequibilidad y sostenibilidad— a partir de fuentes oficiales, principalmente el SUI de la Superservicios. La **etapa de prototipo cerró el 2026-09-28**: la versión final, `app_observatorio_nmt/` (prototipo v1.1.0, etiqueta `prototipo-v1.1.0`), cubre la Res. 1032 con datos simulados y la Res. 1038 con datos sintéticos, y está **en validación del product owner** (ver `docs/entrega-prototipo.md`). El Context Lake sigue en construcción.

Este repositorio es el sustrato único de verdad del dominio. Un agente que trabaje aquí **no debe inferir parámetros regulatorios**: si un dato no está, lo reporta como ausente.

## Cómo usar este repositorio de contexto

Antes de escribir código, lee el archivo que corresponda a tu tarea:

| Si vas a... | Lee |
|---|---|
| entender por qué existe el Observatorio y qué optimiza | `docs/business_context.md` |
| usar un término del dominio (IANC, APS, CMA, prestador, subsegmento, ISE) | `docs/glosario.md` |
| entender el stack, sus límites y lo que aún no está decidido | `docs/architecture.md` |
| saber qué se entregó del prototipo, qué se valida y qué queda pendiente | `docs/entrega-prototipo.md` |
| ingerir o versionar datos del SUI y demás fuentes | `specs/ingesta-sui-y-fuentes.md` |
| definir, calcular o versionar un indicador | `specs/ontologia-indicadores.md` |
| validar, marcar o poner en cuarentena datos | `specs/calidad-de-datos.md` |
| construir comparaciones de eficiencia entre prestadores | `specs/benchmarking-econometrico.md` |
| procesar observaciones ciudadanas a proyectos regulatorios | `specs/nlp-participacion-ciudadana.md` |
| construir el portal, sus tableros, su API o sus descargas | `specs/portal-publico.md` |
| diseñar maquetas, tableros o interfaces visuales | `.agents/rules/ui-ux-design-standards.md` |
| construir o consultar el seguimiento a los NMT de grandes prestadores (Res. 1032) | `specs/seguimiento-implementacion-nmt.md` |
| construir o consultar el seguimiento al NMT de **pequeños prestadores de acueducto (Res. 1038)** | `specs/seguimiento-nmt-pequenos-prestadores.md`, sus fichas en `05_.../nmtpp/` y sus parámetros en `specs/nmtpp/parametros-res-1038.json` |
| construir el **prototipo** del tablero de la Res. 1038 | `specs/prototipo-tablero-nmtpp.md` y `specs/nmtpp/` (datos sintéticos, generador, DDL) |
| saber qué aclaraciones normativas bloquean indicadores de la Res. 1038 | `specs/aclaraciones-regulatorias-nmtpp.md` |
| saber qué preguntas de negocio debe responder el Observatorio en Fase A | `specs/preguntas-de-negocio.md` |
| saber por qué algo está hecho así | `adr/` (índice abajo) |
| consultar normas, benchmarks o material fuente | carpetas `00_` a `08_` |
| revisar una propuesta, mockup o requerimiento de área antes de construir | carpeta `09_` y su análisis de alineación; luego `specs/portal-publico.md`, que es lo que manda |

## Relación con la taxonomía 00–09

Las diez carpetas temáticas **no se reorganizan**: son el acervo de conocimiento y la materia prima. Esta capa agéntica (`AGENTS.md`, `docs/`, `specs/`, `adr/`) se superpone a ellas. Ver `adr/ADR-0001`; la regla cubre también las carpetas que se creen después.

| Carpeta | Rol en el Context Lake |
|---|---|
| `00_Gobernanza_y_Arneses_Agenticos` | Protocolos de agentes y ontología canónica. **Subordinada a este `AGENTS.md`**: si hay contradicción, manda este archivo. |
| `01_Marcos_Internacionales_y_Benchmarks_OCDE` | Fuente de `specs/benchmarking-econometrico.md` |
| `02_Experiencias_Locales_BogotaComoVamos_OAB` | Fuente de metodología de percepción y semaforización |
| `03_Marco_Normativo_y_Politica_Sectorial_Colombia` | Fuente normativa citable en fórmulas de indicadores. Contiene la Res. CRA 1038 de 2026 y su Documento Técnico (PDF) |
| `04_Arquitectura_de_Datos_e_Interoperabilidad_SUI_CRA` | Insumo de `docs/architecture.md`; diccionario de datos SUI |
| `05_Bateria_de_Indicadores_y_Dimensiones_Regulatorias` | `catalogo-v1.md` (14 indicadores y plantilla de ficha); `nmtpp/` (catálogo y 25 fichas de la Res. 1038) |
| `06_Modelos_Analiticos_IA_y_Participacion_Ciudadana` | Notebooks, diseños de modelos y evaluaciones |
| `07_Plan_de_Investigacion_y_Diseno_Observatorio` | Plan metodológico, `poc-01-ianc.md` y el diagnóstico de viabilidad del seguimiento a la Res. 1038 |
| `08_Documentos_Fuente_e_Insumos_Maestros` | Materia prima sin editar. **Nunca se borra.** |
| `09_Documentos_Diseños_y_Requerimientos` | Insumos de diseño del portal: propuestas, mockups y requerimientos de área, con su análisis de alineación. **Subordinada a `specs/portal-publico.md`**: un mockup ilustra, no especifica; lo que contradiga una spec o un ADR no se construye |

## Stack

| Capa | Tecnología | Restricción |
|---|---|---|
| Nube | Oracle Cloud Infrastructure (OCI) | Decidido. Ver `adr/ADR-0004` |
| Base de datos | Autonomous Database ya aprovisionada, con esquemas separados por zona | Decidido. Ver `adr/ADR-0007`. El portal accede con usuario de solo lectura sobre `published` |
| Zona cruda | OCI Object Storage con reglas de retención | Decidido. Ver `adr/ADR-0007`. No meter los snapshots en la base |
| Acceso a la fuente | Consulta SQL sobre la base Oracle del SUI vía VPN, solo lectura | Decidido. Ver `adr/ADR-0006`: snapshot propio obligatorio y disciplina de carga sobre el origen |
| Ingesta | Estación de extracción operada, en franjas diarias de máximo 4 horas, días hábiles | La VPN al SUI es site-to-person: **no hay ingesta desatendida**, y el paquete debe ser segmentable y reanudable (`RF-SUI-10`). Ver `adr/ADR-0008` |
| Portal | Micrositio dentro de la sede electrónica de la CRA; tablero propio sobre OCI como motor, con Power BI incrustado solo para exploraciones durante una fase híbrida transitoria | Decidido. Ver `adr/ADR-0010` y `adr/ADR-0011`. Debe cumplir Resolución MinTIC 1519 de 2020 y WCAG 2.1 nivel AA; lee solo `published`. Stack concreto pendiente (`Q-ARQ-10`) |
| Prototipo (etapa cerrada) | HTML + JavaScript sin framework, Chart.js por CDN, servidor local PowerShell | Versión final v1.1.0 congelada en validación del product owner: solo se cambia para atender sus observaciones. Solo datos simulados o sintéticos rotulados. Ver `docs/entrega-prototipo.md` |
| Idioma | Español (Colombia) para todo lo visible; inglés para identificadores de código | Convención del sector público colombiano |

## Reglas de oro

1. **Si un dato o parámetro regulatorio no está en el Context Lake, repórtalo como ausente. NO DEBES inferirlo.** Un parámetro tarifario inventado es indistinguible de uno real para quien lee el resultado, y el Observatorio es fuente pública.
2. **Toda fórmula de indicador DEBE citar la norma vigente que la sustenta** (resolución CRA, decreto o resolución de otra entidad), con artículo. Sin cita, el indicador no se publica.
3. **El SUI es la fuente autoritativa; el Observatorio nunca corrige un dato reportado.** Marca, califica o pone en cuarentena. Ver `adr/ADR-0002`. Y nunca se consulta el SUI en línea para calcular ni para servir el portal: siempre se trabaja sobre el snapshot propio (`adr/ADR-0006`).
4. **Ningún indicador se publica sin ficha metodológica y semáforo de calidad visibles al público.** Ver `adr/ADR-0003`.
5. **Usa exclusivamente el término canónico de `docs/glosario.md`.** Los sinónimos del material fuente crean entidades duplicadas río abajo.
6. **Unidades fijas:** m3, l/s, $/m3 en pesos colombianos corrientes con año base declarado, porcentajes con un decimal, horas/día para continuidad. Toda cifra monetaria DEBE declarar si es corriente o constante y su año base. Excepción: la continuidad de los gestores comunitarios de la Res. 1038 se publica en %, que es la unidad de su fórmula (ficha NMTPP-S2-CON).
7. **Nunca publiques datos personales identificables** de suscriptores o de ciudadanos participantes (Ley 1581 de 2012). El Observatorio publica agregados y datos de prestadores, no de personas.
8. **Todo lo que no venga de una fuente verificable se marca** como `> **ASUNCIÓN (sin validar):**` con su origen.
9. **Ningún puntaje compuesto ni ranking, y ningún agregado sin su descomposición por prestador.** El territorio se muestra como la suma ponderada y visible de sus prestadores (`adr/ADR-0012`, `RN-PORTAL-05`, `RN-ONTO-05`). Única excepción: el ISE oficial que la Res. 1038 obliga a la CRA a publicar, que se muestra tal como se publica, con su descomposición y sin ranking (`adr/ADR-0015`).
10. **Un marco tarifario nuevo (NMT) no reemplaza el seguimiento del anterior mientras tenga prestadores vigentes bajo él.** Cada `marco_tarifario` es una entidad propia y sus indicadores nunca se agregan entre marcos distintos (`specs/seguimiento-implementacion-nmt.md` RN-NMT-02; `adr/ADR-0013`).
11. **Los parámetros regulatorios de la Res. 1038 viven solo en `specs/nmtpp/parametros-res-1038.json`.** Ningún código contiene metas literales. Si un parámetro vale `null` con `bloqueado_por`, el estado es "pendiente de aclaración", nunca un valor supuesto (`RF-NMTPP-06`).
12. **Los datos sintéticos siempre se rotulan como tales**, en pantalla, en exportaciones y en el propio archivo. Nunca se mezclan con datos reales ni se presentan como información de un prestador.

## Fuera de alcance

- **No es un sistema de reporte.** Los prestadores siguen reportando al SUI; el Observatorio no recibe cargues directos. Duplicar el canal de reporte crearía dos verdades y competencia con la SSPD. Que el curador capture los estudios de costos que la norma manda remitir a la CRA no es un canal de reporte (`adr/ADR-0014`).
- **No es una herramienta de vigilancia ni de sanción.** La función sancionatoria es de la SSPD (Ley 142 de 1994). El Observatorio no emite hallazgos ni califica el cumplimiento de un prestador con efectos jurídicos. Los estados frente a meta son informativos (`RN-NMTPP-05`).
- **No calcula ni aprueba tarifas de prestadores particulares.** Eso ocurre en los procesos regulatorios y de vigilancia existentes. Tampoco calcula el ISE: lo muestra (`adr/ADR-0015`).
- **No reemplaza el Gestor Normativo de la CRA** como fuente oficial de normas; lo referencia.
- **No incluye facturación, PQR transaccionales ni atención al usuario.**
- **V1 no incluye encuestas de percepción ciudadana propias.** La metodología de Bogotá Cómo Vamos se estudia como referencia, pero levantar encuesta propia queda fuera de V1 por costo y tiempo.
- **No evalúa el impacto o los resultados de la regulación.** El seguimiento a los NMT documenta adopción, línea base y cumplimiento de estándares; no es una evaluación ex post formal, que la CRA no tiene institucionalizada.

## Comandos

| Acción | Comando |
|---|---|
| prototipo del portal (Res. 1032 y 1038) | `powershell -ExecutionPolicy Bypass -File app_observatorio_nmt/server.ps1` |
| pruebas del prototipo (incluye invariantes Res. 1038) | `powershell -ExecutionPolicy Bypass -File app_observatorio_nmt/test_nmt_mvp.ps1` |
| regenerar datos sintéticos Res. 1038 | `python specs/nmtpp/generar_datos_sinteticos_nmtpp.py` |
| pipeline productivo | pendiente — sin repositorio de código de producción |

## Índice de specs

| Spec | Dominio | Estado |
|---|---|---|
| `specs/ingesta-sui-y-fuentes.md` | Ingesta, linaje y versionado de fuentes oficiales | borrador |
| `specs/ontologia-indicadores.md` | Definición, cálculo y versionado de indicadores | borrador |
| `specs/calidad-de-datos.md` | Reglas de validación, cuarentena y semáforo | borrador |
| `specs/benchmarking-econometrico.md` | Comparación de eficiencia entre prestadores | borrador |
| `specs/nlp-participacion-ciudadana.md` | Análisis de observaciones ciudadanas | borrador |
| `specs/portal-publico.md` | Portal, tableros, API y datos abiertos | borrador |
| `specs/preguntas-de-negocio.md` | Preguntas de negocio de la Fase A por actor | propuesta |
| `specs/seguimiento-implementacion-nmt.md` | Seguimiento a la implementación de los NMT (Res. 1032; ciclo E0-E9) | borrador |
| `specs/seguimiento-nmt-pequenos-prestadores.md` | Seguimiento al NMT de pequeños prestadores de acueducto (Res. 1038): adopción, nivel de servicio frente a meta, ISE e incentivos, tarifa | borrador |
| `specs/aclaraciones-regulatorias-nmtpp.md` | Requerimientos de aclaración a la Subdirección Técnica de Regulación (Q-NMTPP-01..14) | borrador |
| `specs/prototipo-tablero-nmtpp.md` | Prototipo del tablero de la Res. 1038 con datos sintéticos | borrador |

## Índice de decisiones

| ADR | Decisión | Estado |
|---|---|---|
| `adr/ADR-0001-superponer-capa-agentica.md` | Superponer la capa agéntica sobre la taxonomía 00–08 | aceptada |
| `adr/ADR-0002-sui-fuente-autoritativa.md` | El SUI es autoritativo; el Observatorio no corrige datos | aceptada |
| `adr/ADR-0003-compuerta-de-publicacion.md` | Publicación abierta con compuerta de ficha + calidad | aceptada |
| `adr/ADR-0004-despliegue-sobre-oci.md` | Desplegar sobre la OCI existente de la CRA | aceptada |
| `adr/ADR-0005-publicacion-por-prestador.md` | Publicar a nivel de prestador, por fases y con salvaguardas | aceptada |
| `adr/ADR-0006-acceso-sui-consulta-directa.md` | Ingesta por consulta Oracle vía VPN, con snapshot propio | aceptada |
| `adr/ADR-0007-topologia-datos-oci.md` | Zona cruda en Object Storage; zonas restantes en la Autonomous Database | aceptada |
| `adr/ADR-0008-ingesta-asistida-por-operador.md` | Ingesta disparada por operador mientras no haya conectividad permanente | aceptada, transitoria |
| `adr/ADR-0009-nombre-y-lema.md` | Nombre canónico intacto; marca corta "Observatorio CRA"; lema de portada | propuesta, pendiente de Dirección Ejecutiva |
| `adr/ADR-0010-motor-de-tableros.md` | Motor híbrido al inicio (propio + Power BI incrustado), propio sobre OCI como estado final | aceptada |
| `adr/ADR-0011-micrositio-en-sede-electronica.md` | El Observatorio es un micrositio dentro de la sede electrónica de la CRA | aceptada |
| `adr/ADR-0012-agregacion-territorial.md` | El prestador es la unidad; el territorio es la suma ponderada y visible de sus prestadores | aceptada |
| `adr/ADR-0013-familia-indicadores-nmtpp.md` | Familia NMTPP-* separada de IND-* y NMT-*; dimensión de navegación SEG | propuesta |
| `adr/ADR-0014-estudios-de-costos-fuente-complementaria.md` | Estudios de costos recibidos por la CRA como fuente complementaria, capturada por el curador | propuesta |
| `adr/ADR-0015-ise-indice-oficial-de-la-cra.md` | El ISE oficial se muestra tal como lo publica la CRA, con descomposición y sin ranking; prevalece sobre RN-PORTAL-05 | aceptada |

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-GOB-01 | ¿Existe acto administrativo o mandato formal que cree el Observatorio? De él dependen las facultades de publicación. | `docs/business_context.md` → Restricciones | Dirección Ejecutiva CRA |
| Q-ARQ-08 | ¿En qué plazo puede gestionarse conectividad permanente con la SSPD, o entrega periódica de extractos? Es lo que supera `adr/ADR-0008` y lo que vuelve sostenible al Observatorio | Cadencia y continuidad | CIO / SSPD |
| Q-SUI-03 | ¿Cuál es la ventana de retransmisión que permite la SSPD? Define la ventana de re-extracción de `RF-SUI-09` | Dimensionamiento de la ingesta | SSPD |
| Q-NEG-01 | ¿Cuál es la línea base real de los indicadores de éxito (tiempo de elaboración de estudios, cobertura de datos)? | Métricas de éxito | Subdirección de Regulación |
| Q-GOB-04 | Ratificación del nombre canónico, la marca corta y el lema propuestos en `adr/ADR-0009` | Portada, mockup v3 | Dirección Ejecutiva |
| Q-ONTO-06 | Umbral de cobertura de reporte (propuesto 80 %) y de peso material (propuesto 5 %) para publicar agregados territoriales | `RF-ONTO-09`, `RF-PORTAL-13/14` | Subdirección de Regulación |
| Q-ARQ-10 | Confirmar stack del tablero propio y forma de incrustación en la sede electrónica | Componente Portal y API | CIO |
| Q-PORTAL-07 | Ruta del micrositio, sistema de contenidos y administrador de la sede | `RF-PORTAL-15` | CIO |
| Q-PORTAL-08 | Plazo o hito para retirar Power BI y cerrar la fase híbrida | `RF-PORTAL-16` | CIO |
| Q-NLP-04 | Documento vigente del proceso de participación para los NMT que rige la publicación de la matriz | `RF-NLP-04` | Subdirección de Regulación / Oficina Jurídica |
| Q-NMT-01 | ¿Cuáles son los valores de metas y gradualidad por segmento de la Res. 1032 (Tablas 16, 50-51)? | `RF-NMT-06` | Subdirección de Regulación |
| Q-NMT-02 | ¿Cuáles son los porcentajes de descuento por incumplimiento de la Res. 1032 (Tabla 31)? | `RF-NMT-08` | Subdirección de Regulación |
| Q-NMT-04 | ¿Cuál es la fecha oficial de expedición, el número de resolución definitivo y la vigencia (10 o 15 años) de la Res. 1040 (aseo)? | Extensión de `specs/seguimiento-implementacion-nmt.md` a la Res. 1040 | Subdirección de Regulación / Oficina Jurídica |
| Q-NMTPP-01..14 | Catorce aclaraciones normativas de la Res. 1038 (unidad y línea base de continuidad, subsegmentación, normalización del ISE, IRCA, IPUF, metas intermedias, formatos SSPD, entre otras) | Ver `specs/aclaraciones-regulatorias-nmtpp.md` | Subdirección Técnica de Regulación |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial de la capa agéntica | Sesión de generación sobre README y Plan existentes en Drive |
| 2026-09-13 | ADR-0005 y ADR-0006 al índice; acceso al SUI resuelto en la tabla de stack; `Q-GOB-02` cerrada | Sesión con Camilo Carvajalino |
| 2026-09-13 | ADR-0007; infraestructura física definida (ADB + Object Storage); `Q-ARQ-01` cerrada | Confirmación de infraestructura |
| 2026-09-13 | ADR-0008: la VPN al SUI es site-to-person, la ingesta es asistida por operador; `Q-ARQ-06` cerrada | Confirmación de conectividad |
| 2026-09-14 | Carpeta `09_` a la taxonomía; análisis de alineación de la propuesta y el mockup v2; ADR-0009 a ADR-0012; regla de oro 9; portal decidido en la tabla de stack | Respuestas de Camilo Carvajalino a las preguntas del análisis de la carpeta `09_` |
| 2026-09-15 | Estándares UI/UX: fondo blanco, gama azul, mapa geográfico real y Visual-First | Sesión /learn (`.agents/rules/ui-ux-design-standards.md`) |
| 2026-09-16 | `specs/seguimiento-implementacion-nmt.md` al índice de specs; regla de oro 10; fuera de alcance ampliado con la evaluación de impacto de los NMT; `Q-NMT-01` a `Q-NMT-04` abiertas | Sesión con Camilo Carvajalino |
| 2026-09-18 | Componente de la Res. 1038: tres specs nuevas, catálogo y 25 fichas NMTPP, `specs/nmtpp/` (parámetros, DDL, datos sintéticos y generador), ADR-0013 a ADR-0015; reglas de oro 6, 9 y 10 precisadas; reglas 11 y 12 nuevas; `Q-NMT-03` cerrada; `Q-NMTPP-01..14` abiertas; unificación de esta versión con la del repositorio local (fila del 2026-09-15) | Sesión con Camilo Carvajalino; diagnóstico de viabilidad 2026-09-18 |
| 2026-09-28 | Cierre de la etapa de prototipo: versión final v1.1.0 (etiqueta `prototipo-v1.1.0`) en validación del product owner; `docs/entrega-prototipo.md` con alcance, criterios de validación y pendientes P-01..P-08 | Decisión de Camilo Carvajalino |
| 2026-09-28 | Prototipo único: `app_observatorio_nmtpp/` se integra en `app_observatorio_nmt/` (sección de pequeños prestadores); pruebas de invariantes Res. 1038 unificadas en `test_nmt_mvp.ps1`; capa visual común para todas las páginas | Solicitud de Camilo Carvajalino |
