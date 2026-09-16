---
id: spec-preguntas-de-negocio
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: propuesta
actualizado: 2026-09-14
fuentes: [docs/business_context.md, specs/ontologia-indicadores.md, 05_Bateria_de_Indicadores/catalogo-v1.md, specs/portal-publico.md, adr/ADR-0005, adr/ADR-0009, adr/ADR-0010, adr/ADR-0012]
---

# Spec — Preguntas de negocio de la Fase A del Observatorio

## Propósito

Fija el conjunto de **preguntas de negocio (BQ)** que el Observatorio debe poder responder en su primera etapa (Fase A / V1: prestadores del segmento grande y el subconjunto de indicadores del segmento mediano fijado en `adr/ADR-0005`). Cada pregunta queda atada al actor que la formula, a los indicadores del catálogo que la responden, a su desagregación y al requisito de portal que la sirve.

Esta spec es la capa de **"para qué"** entre el problema de negocio (`docs/business_context.md`) y las specs de **"cómo"**: `specs/ontologia-indicadores.md` (cálculo) y `specs/portal-publico.md` (publicación). No sustituye ninguna de las dos. Su función es evitar dos fallas simétricas: construir un tablero con catorce indicadores que no responde ninguna pregunta real, o prometer en el portal preguntas que el catálogo V1 no puede sostener.

## Contexto relevante

- Flujo de negocio: `docs/business_context.md` → problema, actores (`ACT-CIUDADANO`, `ACT-PRESTADOR`, `ACT-ANALISTA-CRA`, `ACT-CURADOR-DATOS`, `ACT-COMISIONADO`, `ACT-CIO`), FL-01 a FL-04
- Alcance por fases: `adr/ADR-0005` (publicación por prestador; Fase A segmento grande, indicadores parciales para el mediano, ficha de entidad para el pequeño)
- Catálogo: `05_Bateria_de_Indicadores/catalogo-v1.md` (los 14 indicadores V1 y su cobertura por dimensión)
- Reglas de cálculo que acotan lo que una pregunta puede prometer: `RF-ONTO-05` (desagregaciones), `RF-ONTO-06` (comparabilidad entre segmentos), `RF-ONTO-09` (agregación territorial)
- No-objetivos que acotan lo que una pregunta NO puede prometer: `docs/business_context.md` → sección "No-objetivos"

## Método

Cada pregunta de negocio se filtró en tres pasos, en este orden:

1. **¿Se puede responder con datos de Fase A?** Solo con indicadores del catálogo V1 disponibles para el segmento grande (los 14) o para el subconjunto publicado del segmento mediano (cobertura, continuidad, pérdidas y asequibilidad). Si la respuesta depende de un indicador sin fuente confirmada (`IND-CAL-01`/IRCA, bloqueado por `Q-CAT-01`) o sin indicador en V1 (`CLI`), la pregunta se marca **condicionada** o se aplaza a Fase B / V1.1.
2. **¿Respeta los no-objetivos?** Ninguna pregunta puede prometer un ranking simple, un juicio de cumplimiento con efecto jurídico, una proyección de tarifa futura, o una lectura del dato con ausencia representada como cero.
3. **¿A qué decisión sirve?** Toda pregunta debe atarse a una acción concreta de un actor (consultar, comparar, objetar, decidir, estudiar), no a una curiosidad genérica.

Las preguntas que fallan el filtro 1 o 2 no se eliminan: pasan a la sección 3 ("Lo que el Observatorio no responde en Fase A") para que quede explícito qué expectativa no se debe generar al lanzar.

## 1. Preguntas de negocio por actor

### 1.1 Ciudadano, suscriptor y vocal de control (`ACT-CIUDADANO`)

| Código | Pregunta de negocio | Indicadores / insumo | Desagregación | Disponible en Fase A | Requisito de portal |
|---|---|---|---|---|---|
| `BQ-CIU-01` | ¿Cómo está el servicio de acueducto y alcantarillado en mi municipio, comparado con mi departamento y con el país? | `IND-COB-01/02`, `IND-CON-01`, `IND-PER-01/02` | Municipio → departamento → nacional (`divipola_code`) | Sí, grande; parcial mediano (cobertura, continuidad, pérdidas) | Perfil territorial (`RF-PORTAL-13`), agregación `RF-ONTO-09` |
| `BQ-CIU-02` | ¿Cómo se comporta mi prestador frente a prestadores de tamaño y condiciones similares? | Todos los del segmento del prestador | Prestador, filtrado por segmento (`RF-ONTO-06`) | Sí, grande; mediano solo con los indicadores publicados de su segmento | Perfil de prestador (`RF-PORTAL-12`), banda de incertidumbre (benchmarking) |
| `BQ-CIU-03` | ¿Qué tan confiable es el dato que estoy viendo, de cuándo es y qué prestadores lo componen? | Semáforo, fecha de corte, cobertura de reporte, ficha | Todas | Sí (es transversal a todo valor publicado) | Compuerta de publicación (`ADR-0003`), `RF-PORTAL-02` |
| `BQ-CIU-04` | ¿Qué tanto pesa mi factura de acueducto y alcantarillado frente al ingreso de un hogar de mi estrato? | `IND-ASE-01` | Estrato 1 y 2, territorio | Sí, grande; sí, mediano (está en el subconjunto) | Ficha marcada "construcción metodológica del Observatorio" (`RF-ONTO-03`) |
| `BQ-CIU-05` | ¿Se están tratando las aguas residuales y aprovechando los residuos donde vivo? | `IND-ECI-01/02` | Municipio, departamento | Sí, solo segmento grande | Perfil territorial |
| `BQ-CIU-06` | ¿Qué pasó con la observación que envié a un proyecto de resolución? | Matriz de participación (`FL-04`) | Por proyecto regulatorio | Condicionado a `Q-NLP-02` (matriz pública) | Componente "Regulación y seguimiento" |

### 1.2 Persona prestadora (`ACT-PRESTADOR`)

| Código | Pregunta de negocio | Indicadores / insumo | Desagregación | Disponible en Fase A | Requisito de portal |
|---|---|---|---|---|---|
| `BQ-PRE-01` | ¿Cuál es mi posición en pérdidas y en costos frente a mi grupo comparable, con el margen de incertidumbre declarado? | `IND-PER-01/02`, `IND-EFI-01/02` | Prestador, grupo comparable por segmento | Sí, grande; pérdidas también para mediano | Perfil de prestador, `RF-BENCH-01/03` |
| `BQ-PRE-02` | ¿Cómo objeto un valor publicado que considero incorrecto y qué trazabilidad tiene mi objeción? | `FL-03` | Por indicador y periodo | Sí | Estado `en_objecion`, historial público de correcciones |
| `BQ-PRE-03` (solo segmento mediano) | ¿Cuáles de mis indicadores ya se publican en Fase A y cuándo entran los demás? | `IND-COB-*`, `IND-CON-01`, `IND-PER-*`, `IND-ASE-01` | Prestador | Parcial por diseño (`ADR-0005`) | Ficha de prestador con aviso de alcance por fase |
| `BQ-PRE-04` (solo segmento pequeño) | ¿Aparezco en el Observatorio aunque todavía no tenga indicadores publicados? | Ficha de entidad (identificación, segmento, municipio) | Prestador | Sí, solo ficha; indicadores "desde la Fase B" | Buscador de prestadores (`RF-PORTAL-12`) |

### 1.3 Analista de la Subdirección de Regulación y Comisionado (`ACT-ANALISTA-CRA`, `ACT-COMISIONADO`)

| Código | Pregunta de negocio | Indicadores / insumo | Desagregación | Disponible en Fase A | Requisito de portal |
|---|---|---|---|---|---|
| `BQ-REG-01` | ¿Cuál es la serie histórica comparable de un prestador o territorio, con su versión de ficha, para sustentar un estudio tarifario o un AIR ex-ante/ex-post? | Cualquiera de los 14, según el estudio | Prestador, territorio, periodo | Sí, grande; parcial mediano | `RF-ONTO-04` (versionado), `FL-02` |
| `BQ-REG-02` | ¿Qué prestadores están fuera del rango esperado en un indicador y periodo, para priorizar revisión? | Umbrales de la ficha (campo 11) | Prestador, periodo | Sí | Estados "en revisión" / cuarentena |
| `BQ-REG-03` | ¿La cobertura de reporte de un territorio alcanza el umbral para que su agregado sea confiable en una decisión? | Cobertura de reporte (`RF-ONTO-09`) | Municipio, departamento | Sí, condicionado al umbral de `Q-ONTO-06` | `RN-ONTO-05` |
| `BQ-REG-04` | ¿Qué correcciones ha tenido un indicador y por qué, para no reutilizar una cifra superada? | Historial público de correcciones | Indicador, periodo | Sí | `RF-PORTAL-07` |
| `BQ-REG-05` | ¿Qué observaciones ciudadanas se agruparon en un proyecto regulatorio y cómo se respondieron? | `FL-04` | Por proyecto | Condicionado a `Q-NLP-02` | Matriz de participación |

### 1.4 CIO y gobierno del dato (`ACT-CIO`, `ACT-CURADOR-DATOS`)

| Código | Pregunta de negocio | Indicadores / insumo | Desagregación | Disponible en Fase A | Requisito de portal |
|---|---|---|---|---|---|
| `BQ-CIO-01` | ¿Qué indicadores tienen ficha aprobada y cuáles siguen en borrador, para saber qué puede publicarse este periodo? | Estado de la ficha (`RF-ONTO-01`) | Indicador | Sí (es interno, no de portal) | — |
| `BQ-CIO-02` | ¿Qué prestadores tienen datos completos para el periodo, para dimensionar el riesgo de una publicación parcial? | Informe de calidad (`FL-01` paso 3) | Prestador, periodo | Sí | `RF-CAL-06` |
| `BQ-CIO-03` | ¿Cuánto cuesta mantener cada indicador al año, para decidir si se sostiene, se pausa o pasa a V1.1? | Costo por indicador (unidad económica del modelo de negocio) | Indicador | **No** — sin línea base (`Q-NEG-01`) | — |

### 1.5 Otras entidades: MinVivienda, DNP, SSPD, entes territoriales (vía datos abiertos)

| Código | Pregunta de negocio | Indicadores / insumo | Desagregación | Disponible en Fase A | Requisito de portal |
|---|---|---|---|---|---|
| `BQ-EXT-01` | ¿Puedo descargar la serie completa de un indicador con su bandera de calidad, fecha de corte y versión de ficha, sin pedirla directamente a la CRA? | Cualquiera de los 14 | Todas las soportadas | Sí | `RF-PORTAL-03/04` (API y CSV) |

## 2. Matriz de disponibilidad por segmento (Fase A)

| Dimensión | Indicadores | Segmento grande | Segmento mediano | Segmento pequeño |
|---|---|---|---|---|
| Cobertura (`COB`) | `IND-COB-01/02/03` | Publicado | Publicado | Solo ficha de entidad |
| Continuidad (`CON`) | `IND-CON-01` | Publicado | Publicado | Solo ficha de entidad |
| Pérdidas (`PER`) | `IND-PER-01/02` | Publicado | Publicado | Solo ficha de entidad |
| Asequibilidad (`ASE`) | `IND-ASE-01` | Publicado | Publicado | Solo ficha de entidad |
| Calidad del agua (`CAL`) | `IND-CAL-01` | Condicionado a `Q-CAT-01` | No | No |
| Eficiencia (`EFI`) | `IND-EFI-01/02` | Publicado | No | No |
| Financiera (`FIN`) | `IND-FIN-01` | Publicado, condicionado a `Q-CAT-02` | No | No |
| Economía circular (`ECI`) | `IND-ECI-01/02` | Publicado | No | No |
| Inversiones (`INV`) | `IND-INV-01` | Publicado | No | No |
| Riesgo climático (`CLI`) | Sin indicador en V1 | No | No | No |

Consecuencia directa para las preguntas de negocio: `BQ-CIU-02`, `BQ-PRE-01` y `BQ-REG-01` deben mostrar, para un prestador mediano, solo el subconjunto de cuatro dimensiones; nunca un espacio vacío o un cero en las diez restantes (`RN-ONTO-03`).

## 3. Lo que el Observatorio NO responde en Fase A

Preguntas que un usuario formulará y que el portal debe estar preparado para no responder, con una razón visible en vez de un silencio:

| Pregunta que se anticipa | Por qué no se responde en Fase A | Dónde se declara |
|---|---|---|
| "¿Cuál es el mejor o el peor prestador del país?" | No-objetivo: un ranking simple castiga al prestador rural o pequeño por serlo | No-objetivos de `docs/business_context.md`; `RN-BENCH-01` |
| "¿Cuánto va a costar mi factura el próximo año?" | No-objetivo: un modelo predictivo de tarifa genera efectos de expectativa fuera del alcance informativo de V1 | No-objetivos de `docs/business_context.md` |
| "¿Este prestador incumplió la regulación?" | El Observatorio no emite juicios de cumplimiento con efecto jurídico | No-objetivos de `docs/business_context.md` |
| "¿Cómo es la calidad del agua que consumo?" | `IND-CAL-01` (IRCA) depende de un canal con el INS/SIVICAP aún sin confirmar | `Q-CAT-01` |
| "¿Qué tan expuesto está mi prestador a riesgo climático?" | Dimensión `CLI` sin indicador en V1 por falta de fuente estructurada; se aborda en V1.1 con el SIRH del IDEAM | `catalogo-v1.md` |
| "¿Cómo comparo un prestador grande con uno pequeño en el mismo indicador?" | Comparación entre segmentos con metodologías distintas requiere nota de no comparabilidad y nunca una diferencia porcentual | `RF-ONTO-06` |
| "¿Cuánto invierte la CRA en sostener el Observatorio por indicador?" | Sin línea base de costo por indicador | `Q-NEG-01` |

## 4. Preguntas abiertas que esta spec crea o afecta

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| `Q-NEG-06` | De las preguntas de la sección 1, ¿cuáles cuatro se eligen como "cifras destacadas" de portada, dado que `RF-PORTAL-14` limita el espacio? | `RF-PORTAL-14` | Subdirección de Regulación / Equipo Editorial |
| `Q-NEG-07` | ¿Se prioriza `BQ-CIU-04` (asequibilidad) en el lanzamiento pese a ser una construcción metodológica sin sustento normativo directo, dado su alto valor comunicativo? | Portada, `RF-ONTO-03` | Dirección Ejecutiva |
| `Q-NEG-08` | ¿La respuesta a `BQ-PRE-03`/`BQ-PRE-04` (aviso de alcance por fase en la ficha del prestador mediano y pequeño) se redacta como texto fijo o se automatiza desde el segmento del prestador? | `specs/portal-publico.md` | CIO |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-14 | Versión inicial: preguntas de negocio de Fase A por actor, matriz de disponibilidad por segmento y preguntas fuera de alcance | Sesión con Camilo Carvajalino, a partir de `docs/business_context.md`, `05_Bateria_de_Indicadores/catalogo-v1.md` y `adr/ADR-0005` |
