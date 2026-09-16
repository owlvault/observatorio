---
id: agents
tipo: agents
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-13
fuentes: [README_Context_Lake_Observatorio_Regulatorio_CRA (Drive), Plan_de_Investigacion_y_Hoja_de_Ruta_Poblamiento_Observatorio_CRA (Drive), decisiones de sesion 2026-09-13]
---

# Observatorio Regulatorio de Agua Potable y Saneamiento Básico — CRA

Plataforma pública de información regulatoria del sector de acueducto, alcantarillado y aseo en Colombia, operada por la Comisión de Regulación de Agua Potable y Saneamiento Básico (CRA). Publica indicadores comparables de prestadores —calidad, continuidad, pérdidas, eficiencia, asequibilidad y sostenibilidad— a partir de fuentes oficiales, principalmente el SUI de la Superservicios. Hoy el proyecto está en **diseño**: no existe código, no hay stack contratado y el Context Lake está en construcción.

Este repositorio es el sustrato único de verdad del dominio. Un agente que trabaje aquí **no debe inferir parámetros regulatorios**: si un dato no está, lo reporta como ausente.

## Cómo usar este repositorio de contexto

| Si vas a... | Lee |
|---|---|
| entender por qué existe el Observatorio y qué optimiza | `docs/business_context.md` |
| usar un término del dominio (IANC, APS, CMA, prestador) | `docs/glosario.md` |
| entender el stack, sus límites y lo que aún no está decidido | `docs/architecture.md` |
| ingerir o versionar datos del SUI y demás fuentes | `specs/ingesta-sui-y-fuentes.md` |
| definir, calcular o versionar un indicador | `specs/ontologia-indicadores.md` |
| validar, marcar o poner en cuarentena datos | `specs/calidad-de-datos.md` |
| construir comparaciones de eficiencia entre prestadores | `specs/benchmarking-econometrico.md` |
| procesar observaciones ciudadanas a proyectos regulatorios | `specs/nlp-participacion-ciudadana.md` |
| construir el portal, sus tableros, su API o sus descargas | `specs/portal-publico.md` |
| diseñar maquetas, tableros o interfaces visuales | `.agents/rules/ui-ux-design-standards.md` |
| saber por qué algo está hecho así | `adr/` (índice abajo) |
| consultar normas, benchmarks o material fuente | carpetas `00_` a `08_` de este Drive |

## Relación con la taxonomía 00–08

Las nueve carpetas temáticas de este Drive **no se reorganizan**: son el acervo de conocimiento y la materia prima. Esta capa agéntica (`AGENTS.md`, `docs/`, `specs/`, `adr/`) se superpone a ellas. Ver `adr/ADR-0001`.

| Carpeta | Rol en el Context Lake |
|---|---|
| `00_Gobernanza_y_Arneses_Agenticos` | Protocolos de agentes y ontología canónica. **Subordinada a este `AGENTS.md`**: si hay contradicción, manda este archivo. |
| `01_Marcos_Internacionales_y_Benchmarks_OCDE` | Fuente de `specs/benchmarking-econometrico.md` |
| `02_Experiencias_Locales_BogotaComoVamos_OAB` | Fuente de metodología de percepción y semaforización |
| `03_Marco_Normativo_y_Politica_Sectorial_Colombia` | Fuente normativa citable en fórmulas de indicadores |
| `04_Arquitectura_de_Datos_e_Interoperabilidad_SUI_CRA` | Insumo de `docs/architecture.md` |
| `05_Bateria_de_Indicadores_y_Dimensiones_Regulatorias` | Repositorio de fichas metodológicas (una por indicador) |
| `06_Modelos_Analiticos_IA_y_Participacion_Ciudadana` | Notebooks, diseños de modelos y evaluaciones |
| `07_Plan_de_Investigacion_y_Diseno_Observatorio` | Plan metodológico y cronograma |
| `08_Documentos_Fuente_e_Insumos_Maestros` | Materia prima sin editar. **Nunca se borra.** |

## Stack

| Capa | Tecnología | Restricción |
|---|---|---|
| Nube | Oracle Cloud Infrastructure (OCI) | Hipótesis primaria: es la nube vigente de la CRA. Ver `adr/ADR-0004` — **estado: propuesta** |
| Almacenamiento analítico | Por decidir | No asumir motor. Ver `Q-ARQ-01` |
| Ingesta | Por decidir | El contrato de ingesta está en `specs/ingesta-sui-y-fuentes.md` y es independiente de la herramienta |
| Portal | Por decidir | Debe cumplir Resolución MinTIC 1519 de 2020 y WCAG 2.1 nivel AA |
| Idioma | Español (Colombia) para todo lo visible; inglés para identificadores de código | Convención del sector público colombiano |

## Reglas de oro

1. **Si un dato o parámetro regulatorio no está en el Context Lake, repórtalo como ausente. NO DEBES inferirlo.** Un parámetro tarifario inventado es indistinguible de uno real para quien lee el resultado, y el Observatorio es fuente pública.
2. **Toda fórmula de indicador DEBE citar la norma vigente que la sustenta** (resolución CRA, decreto o resolución de otra entidad), con artículo. Sin cita, el indicador no se publica.
3. **El SUI es la fuente autoritativa; el Observatorio nunca corrige un dato reportado.** Marca, califica o pone en cuarentena. Ver `adr/ADR-0002`.
4. **Ningún indicador se publica sin ficha metodológica y semáforo de calidad visibles al público.** Ver `adr/ADR-0003`.
5. **Usa exclusivamente el término canónico de `docs/glosario.md`.** Los sinónimos del material fuente crean entidades duplicadas río abajo.
6. **Unidades fijas:** m3, l/s, $/m3 en pesos colombianos corrientes con año base declarado, porcentajes con un decimal, horas/día para continuidad. Toda cifra monetaria DEBE declarar si es corriente o constante y su año base.
7. **Nunca publiques datos personales identificables** de suscriptores o de ciudadanos participantes (Ley 1581 de 2012). El Observatorio publica agregados y datos de prestadores, no de personas.
8. **Todo lo que no venga de una fuente verificable se marca** como `> **ASUNCIÓN (sin validar):**` con su origen.

## Fuera de alcance

- **No es un sistema de reporte.** Los prestadores siguen reportando al SUI; el Observatorio no recibe cargues directos. Duplicar el canal de reporte crearía dos verdades y competencia con la SSPD.
- **No es una herramienta de vigilancia ni de sanción.** La función sancionatoria es de la SSPD (Ley 142 de 1994). El Observatorio no emite hallazgos ni califica el cumplimiento de un prestador con efectos jurídicos.
- **No calcula ni aprueba tarifas de prestadores particulares.** Eso ocurre en los procesos regulatorios y de vigilancia existentes.
- **No reemplaza el Gestor Normativo de la CRA** como fuente oficial de normas; lo referencia.
- **No incluye facturación, PQR transaccionales ni atención al usuario.**
- **V1 no incluye encuestas de percepción ciudadana propias.** La metodología de Bogotá Cómo Vamos se estudia como referencia, pero levantar encuesta propia queda fuera de V1 por costo y tiempo.

## Comandos

| Acción | Comando |
|---|---|
| instalar | pendiente — no hay repositorio de código |
| pruebas | pendiente |
| build | pendiente |

> **ASUNCIÓN (sin validar):** No existe repositorio de código todavía. Origen: no se mencionó ninguno en el material. Confirmar antes de que un agente intente ejecutar algo.

## Índice de specs

| Spec | Dominio | Estado |
|---|---|---|
| `specs/ingesta-sui-y-fuentes.md` | Ingesta, linaje y versionado de fuentes oficiales | borrador |
| `specs/ontologia-indicadores.md` | Definición, cálculo y versionado de indicadores | borrador |
| `specs/calidad-de-datos.md` | Reglas de validación, cuarentena y semáforo | borrador |
| `specs/benchmarking-econometrico.md` | Comparación de eficiencia entre prestadores | borrador |
| `specs/nlp-participacion-ciudadana.md` | Análisis de observaciones ciudadanas | borrador |
| `specs/portal-publico.md` | Portal, tableros, API y datos abiertos | borrador |

## Índice de decisiones

| ADR | Decisión | Estado |
|---|---|---|
| `adr/ADR-0001-superponer-capa-agentica.md` | Superponer la capa agéntica sobre la taxonomía 00–08 | aceptada |
| `adr/ADR-0002-sui-fuente-autoritativa.md` | El SUI es autoritativo; el Observatorio no corrige datos | aceptada |
| `adr/ADR-0003-compuerta-de-publicacion.md` | Publicación abierta con compuerta de ficha + calidad | aceptada |
| `adr/ADR-0004-despliegue-sobre-oci.md` | Desplegar sobre la OCI existente de la CRA | propuesta |

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-GOB-01 | ¿Existe acto administrativo o mandato formal que cree el Observatorio? De él dependen las facultades de publicación. | `docs/business_context.md` → Restricciones | Dirección Ejecutiva CRA |
| Q-GOB-02 | ¿Hay convenio o acuerdo de intercambio de datos vigente con la SSPD para consumo sistemático del SUI? | RF-SUI-01 | CIO / SSPD |
| Q-ARQ-01 | ¿Qué motor analítico y qué servicios de OCI se usarán? | `docs/architecture.md` | CIO |
| Q-NEG-01 | ¿Cuál es la línea base real de los indicadores de éxito (tiempo de elaboración de estudios, cobertura de datos)? | Métricas de éxito | Subdirección de Regulación |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-15 | Estándares UI/UX: fondo blanco, gama azul, mapa geográfico real y Visual-First | Sesión /learn (`.agents/rules/ui-ux-design-standards.md`) |
| 2026-09-13 | Versión inicial de la capa agéntica | Sesión de generación sobre README y Plan existentes en Drive |
