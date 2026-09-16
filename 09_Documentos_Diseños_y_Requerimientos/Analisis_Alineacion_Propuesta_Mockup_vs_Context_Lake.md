---
id: analisis-propuesta-mockup-2026-09-14
tipo: analisis-de-alineacion
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-14
fuentes: [09_Documentos_Diseños_y_Requerimientos/Propuesta_Observatorio_Regulatorio_CRA.docx, 09_Documentos_Diseños_y_Requerimientos/mockup_observatorio_cra_v2.html, AGENTS.md, docs/architecture.md, docs/business_context.md, docs/glosario.md, specs/portal-publico.md, specs/ontologia-indicadores.md, specs/calidad-de-datos.md, specs/benchmarking-econometrico.md, 05_Bateria_de_Indicadores/catalogo-v1.md, adr/ADR-0001 a ADR-0008]
---

# Análisis de alineación — Propuesta y mockup v2 frente al Context Lake

## 1. Qué se analizó

| Documento | Naturaleza | Qué propone |
|---|---|---|
| `Propuesta_Observatorio_Regulatorio_CRA.docx` | Propuesta conceptual, dirigida a Dirección Ejecutiva, para integración al portal institucional | Seis componentes de navegación (El Observatorio, Indicadores del sector, Análisis sectorial, Regulación en cifras, Territorios, Conocimiento y datos); tableros Power BI organizados en cinco dimensiones (prestación, económicos y tarifarios, mercado, territoriales, regulatorios); filtros por servicio, año, departamento, municipio, prestador y tipo de área; portada con cifras destacadas, mapa interactivo y accesos a Power BI; cadena de valor DATOS → INDICADORES → ANÁLISIS → EVIDENCIA → REGULACIÓN → SEGUIMIENTO; tres nombres candidatos |
| `mockup_observatorio_cra_v2.html` | Maqueta visual estática (una sola página, datos simulados declarados) | Marca "Observatorio de Agua, Territorio y Bienestar"; menú Inicio / Indicadores / Territorios / Impacto y regulación / Conocimiento / Datos abiertos; hero con mapa de Colombia y cuatro cifras; cuatro tarjetas KPI con variación; espacio de incrustación Power BI; ocho módulos temáticos; perfil territorial municipio vs departamento vs Colombia con barras de puntaje; línea de tiempo "de la regulación al bienestar"; tres productos de conocimiento; tabla de conjuntos de datos descargables |

El Context Lake vigente (13 de septiembre de 2026) fija: V1 como plataforma pública con portal y tableros abiertos (`ADR-0003`), publicación a nivel de prestador individual con cinco salvaguardas y fases A/B (`ADR-0005`), compuerta de publicación ficha + semáforo + curador (`RF-PORTAL-01`), once requisitos funcionales del portal (`RF-PORTAL-01` a `-11`), diez dimensiones de ontología y catorce indicadores en `catalogo-v1.md`, y un stack donde **el framework del portal sigue "por decidir"** (`AGENTS.md`, `docs/architecture.md`, `Q-ARQ-02`, `Q-PORTAL-01`).

## 2. Respuesta corta a las tres preguntas

**¿Se alinea con lo avanzado?** En propósito y arquitectura de información, sí: es la misma plataforma pública, orientada al ciudadano y al territorio, con datos abiertos, fichas y productos de conocimiento. La propuesta es coherente con `docs/business_context.md` (problema, propuesta de valor, actores) y con la decisión de V1 pública. El mockup, además, respeta la regla de oro 8 al declarar los datos como simulados.

**¿Cumple con el diseño identificado?** Parcialmente. Cumple lo estructural y no cumple lo que hace defendible al Observatorio en público: ninguno de los dos documentos incorpora la compuerta de publicación ni sus manifestaciones visibles (semáforo de calidad, fecha de corte y ficha junto a cada valor, estados "no reportó" / "en revisión" / "en objeción", historial de correcciones), ninguno tiene vista por prestador pese a que `ADR-0005` la fijó como la decisión bisagra, y el mockup introduce puntajes compuestos ("Calidad 91 %", "Eficiencia 70 %") y una "Tarifa promedio" que contradicen el glosario, `RN-PORTAL-04` y la salvaguarda 4 de `ADR-0005`. La propuesta también toma dos decisiones que el Context Lake tenía abiertas, Power BI como motor de tableros e integración al portal institucional, sin pasar por ADR.

**¿Cómo se integra?** No se reemplaza nada: la propuesta se convierte en la arquitectura de información de `specs/portal-publico.md` y en insumo para cerrar `Q-PORTAL-01`; las dos decisiones implícitas se formalizan como `ADR-0009` (nombre) y `ADR-0010` (motor de visualización); el mockup pasa a v3 con un backlog de cambios trazado a requisitos; y la carpeta `09_` se registra en la taxonomía de `AGENTS.md`. El detalle está en las secciones 5 y 6.

## 3. Convergencias (lo que ya está bien)

| Elemento de la propuesta / mockup | Con qué converge en el Context Lake |
|---|---|
| Plataforma pública con tableros abiertos y datos descargables | `ADR-0003`, `RF-PORTAL-03`, `RN-PORTAL-02`, Ley 1712 de 2014 |
| Pregunta "¿Cómo están los servicios en mi territorio?" y comparación municipio / departamento / Colombia | Consecuencia 2 del problema en `docs/business_context.md`; desagregaciones de `RF-ONTO-05`; llave `divipola_code` |
| Filtros por servicio, año, departamento, municipio, prestador y tipo de área | Desagregaciones canónicas de `RF-ONTO-05` (faltan **segmento** y **APS**, ver brecha B-07) |
| Componente "Conocimiento y datos" con fichas de indicadores y metodologías | `RF-PORTAL-02`, `RF-PORTAL-09`, plantilla de ficha de `catalogo-v1.md` |
| "Regulación en cifras" con participación ciudadana | `FL-04` y `specs/nlp-participacion-ciudadana.md`; es un insumo para cerrar `Q-NLP-02` (matriz pública) en sentido afirmativo |
| Lenguaje ciudadano y no técnico | `RF-PORTAL-09`; metodología Bogotá Cómo Vamos (carpeta `02_`) |
| Mapa interactivo de Colombia en portada | Referencia del OAB en el Plan de Investigación (2.2) |
| Cadena DATOS → INDICADORES → ANÁLISIS → EVIDENCIA → REGULACIÓN → SEGUIMIENTO | Zonas cruda → conformada → analítica → publicación de `docs/architecture.md`; AIR ex-ante y ex-post de `docs/business_context.md` |
| Módulos "Impacto social" (asequibilidad) y "Sostenibilidad" (economía circular, resiliencia) | Dimensiones `ASE`, `ECI`, `CLI` de `specs/ontologia-indicadores.md` (`CLI` sin indicador en V1) |
| Aviso "Datos simulados para fines de diseño del mockup" | Regla de oro 8 (`ASUNCIÓN`) y regla de oro 1 |
| Nombre candidato 1 de la propuesta | Es el nombre canónico del Context Lake |

## 4. Brechas y contradicciones

Severidad: **alta** = contradice un ADR aceptado o una regla de oro; **media** = omite un requisito "debe"; **baja** = falta de precisión o decisión pendiente.

| ID | Brecha | Dónde | Severidad | Qué la sustenta |
|---|---|---|---|---|
| B-01 | **Sin vista por prestador.** El mockup solo muestra conteos de prestadores; el perfil es municipal. La propuesta lo menciona solo como filtro | Mockup, propuesta §5 | Alta | `ADR-0005` (publicar a nivel de prestador individual es la decisión bisagra); `RF-PORTAL-10`, `RF-PORTAL-11`; `FL-03` |
| B-02 | **Sin semáforo de calidad, fecha de corte ni enlace a ficha junto a cada valor.** Solo aparece una etiqueta global "Actualizado" | Mockup | Alta | `RF-PORTAL-02`, `RF-CAL-04`, `ADR-0003` (indicador, ficha y semáforo se publican juntos o no se publican) |
| B-03 | **Puntajes compuestos 0–100 ("Calidad 91 %", "Eficiencia 70 %") con barras de progreso.** Agregan dimensiones en un índice único y sugieren calificación | Mockup, perfil territorial | Alta | Salvaguarda 4 de `ADR-0005` (prohibido el ranking compuesto); `RN-BENCH-01`; no-objetivo "rankings de mejores y peores"; `RF-BENCH-03` (toda comparación de eficiencia lleva banda de incertidumbre) |
| B-04 | **"Calidad" expresada como porcentaje ascendente.** El indicador canónico es IRCA, un índice de riesgo donde mayor es peor, con fuente externa (INS/SIVICAP) aún sin canal | Mockup | Alta | `docs/glosario.md` (IRCA); `IND-CAL-01`; `Q-CAT-01` |
| B-05 | **"Tarifa promedio" como cifra.** No existe en el catálogo; mezcla Tarifa aplicada (con subsidios y contribuciones por estrato) y Costo Unitario | Mockup, tabla del perfil territorial | Alta | `RN-PORTAL-04`; glosario (Tarifa aplicada ≠ Costo Unitario); `RF-ONTO-07` (año base y condición monetaria) |
| B-06 | **Power BI decidido sin ADR.** El Context Lake tiene el framework del portal "por decidir"; `ADR-0004` advierte menor integración nativa de herramientas analíticas comunes con OCI | Propuesta §2, §5, §6; mockup | Alta | `AGENTS.md` (stack: Portal "por decidir"); `docs/architecture.md` (deuda técnica); `ADR-0004`; `RN-PORTAL-01` (solo lectura sobre `published`); `RNF-PORTAL-03` (reconstruir lo publicado en cualquier fecha); `RF-PORTAL-05` (WCAG 2.1 AA) |
| B-07 | **Falta el filtro por segmento.** Comparar prestadores de segmentos distintos sin nota de no comparabilidad está prohibido | Propuesta §5 | Media | `RF-ONTO-06`; `RF-BENCH-01` (grupo comparable); `Q-GLO-01` |
| B-08 | **Sin estados de ausencia de dato.** Ningún elemento muestra "sin reporte", "en revisión", "en objeción" o "no aplicable"; las celdas siempre tienen número | Mockup | Media | `RF-PORTAL-06`, `RF-PORTAL-11`, `RN-CAL-04`, `RN-ONTO-03` |
| B-09 | **Sin historial público de correcciones ni marca `en_objecion`** | Ambos | Media | `RF-PORTAL-07`, `RN-PORTAL-03`, `FL-03`, `RF-BENCH-06` |
| B-10 | **Sin API pública** | Ambos | Media | `RF-PORTAL-04` |
| B-11 | **Sin informe de calidad público por periodo** | Ambos | Media | `RF-CAL-06` |
| B-12 | **Accesibilidad.** Íconos emoji como semántica, tooltips solo por hover, variaciones solo por color, animaciones continuas, gráficas sin tabla equivalente, menú oculto en móvil sin alternativa | Mockup | Media | `RF-PORTAL-05`; Resolución MinTIC 1519 de 2020 |
| B-13 | **Dimensiones de navegación ≠ dimensiones de ontología.** Propuesta: 5; mockup: 8; ontología: 10 (`COB CON CAL PER EFI FIN INV ASE CLI ECI`). "Territorio" y "Tendencias" son desagregaciones y vistas, no dimensiones; "Mercado" y "Regulatorios" no tienen indicadores con ficha en V1 | Propuesta §5, mockup | Media | `RN-ONTO-01` (un indicador pertenece a una sola dimensión); `catalogo-v1.md` |
| B-14 | **Amplitud implícita.** Ocho módulos y cifras de mercado, tarifas, sostenibilidad y tendencias sugieren decenas de indicadores; V1 tiene catorce y Fase A solo segmento grande | Mockup | Media | `docs/business_context.md` ("30 confiables valen más que 200 desactualizados"); `catalogo-v1.md`; `ADR-0005` fases A/B |
| B-15 | **Agregados nacionales y municipales sin regla.** "Cobertura nacional 92,4 %", "Continuidad promedio 21,6 h" y el perfil municipal requieren una regla de agregación (ponderación, tratamiento de municipios multi-prestador) que la ontología no define | Mockup | Media | `RF-ONTO-05` (nunca prorratear); `RNF-ONTO-01` (determinismo) |
| B-16 | **Variaciones "▲ +1,8 p.p. frente al periodo anterior".** Válidas solo si ambos periodos tienen la misma versión de ficha y semáforo comparable | Mockup | Baja | `RF-ONTO-04`; caso borde "cambio de versión a mitad de serie" de `specs/portal-publico.md` |
| B-17 | **Cuatro nombres en circulación.** Propuesta: tres candidatos; mockup: "Observatorio de Agua, Territorio y Bienestar" (no está entre los tres). El canónico es "Observatorio Regulatorio de Agua Potable y Saneamiento Básico – CRA" | Ambos | Baja | Regla de oro 5 (término canónico); `AGENTS.md` |
| B-18 | **"Integrado al portal institucional" decide `Q-PORTAL-01` / `Q-ARQ-02` sin registrarlo.** Es una respuesta válida, pero con consecuencias (CMS de la sede, analítica, dominio, accesibilidad) que deben quedar en ADR | Propuesta §1, §8 | Baja | `Q-PORTAL-01`, `Q-ARQ-02` |
| B-19 | **"Impacto" y "resultados de la regulación" en V1.** Atribuir causalidad excede el alcance informativo; V1 no construye modelos predictivos ni emite juicios | Propuesta §5 (indicadores regulatorios), mockup "Impacto y regulación" | Baja | No-objetivos de `docs/business_context.md`; `AGENTS.md` fuera de alcance |
| B-20 | **Componentes "Análisis sectorial" y "Conocimiento y datos" no tienen spec.** Son contenidos editoriales (estudios, boletines, infografías) que no pasan por la compuerta de datos pero sí necesitan reglas de publicación (autoría, fecha, versión, relación con el Gestor Normativo) | Propuesta §4 | Baja | `AGENTS.md` fuera de alcance (no reemplaza el Gestor Normativo); ninguna spec cubre gestión de contenidos |

## 5. Decisiones que la propuesta obliga a tomar

Tres decisiones quedan implícitas en los documentos y deben pasar por ADR antes de que un agente o un proveedor construya algo sobre ellas.

### ADR-0009 (propuesta) — Nombre y marca del Observatorio

Contexto: cuatro nombres en circulación (B-17). Opciones: (a) mantener el canónico "Observatorio Regulatorio de Agua Potable y Saneamiento Básico – CRA" como nombre institucional y usar "Agua, Territorio y Bienestar" solo como lema de portada; (b) adoptar uno de los tres nombres de la propuesta. Recomendación: (a). El nombre canónico refuerza la función misional de la CRA y ya está en todo el Context Lake; el lema conserva el valor comunicacional del mockup sin crear un sinónimo. Responsable: Dirección Ejecutiva (ligado a `Q-GOB-01`).

### ADR-0010 (propuesta) — Motor de tableros: Power BI incrustado o tablero propio sobre OCI

Contexto: B-06. La propuesta asume Power BI; el Context Lake no lo ha decidido y `ADR-0004` advierte fricción con OCI. Las condiciones que **cualquier** motor debe cumplir, extraídas de las specs, son independientes de la herramienta:

1. Lee exclusivamente el esquema `published` con usuario de solo lectura (`RN-PORTAL-01`, `ADR-0007`).
2. Muestra semáforo, motivo, fecha de corte y enlace a ficha junto a cada valor (`RF-PORTAL-02`).
3. Representa los estados de ausencia sin cero ni celda vacía (`RF-PORTAL-06`, `RF-PORTAL-11`).
4. Toda gráfica tiene tabla equivalente, navegación por teclado y contraste AA (`RF-PORTAL-05`).
5. Todo lo visible es descargable en CSV con `quality_flag`, fecha de corte y versión de ficha (`RF-PORTAL-03`).
6. Permite reconstruir lo publicado en una fecha pasada (`RNF-PORTAL-03`): el versionado vive en `published`, no en el motor.
7. Los datos publicados no salen de la jurisdicción de la CRA sin decisión explícita (Plan de Investigación §5, "Soberanía de datos").

Lo que hay que verificar sobre Power BI antes de decidir (no está en el Context Lake y no debe inferirse): licenciamiento del modo de incrustación pública frente a incrustación con capacidad dedicada; conector a Autonomous Database (gateway o conexión directa); grado real de cumplimiento WCAG 2.1 AA de los informes incrustados; residencia de los datos del conjunto publicado; y cómo se cumple la condición 6. Alternativa a evaluar en paralelo: tablero propio con el patrón que la CRA ya usó para el Tablero de Control CIO (React, TypeScript, Chart.js sobre OCI), que cumple las siete condiciones por construcción pero requiere desarrollo. Una decisión híbrida es viable: portada, perfiles por prestador y territorio, fichas y descargas como tablero propio; exploraciones profundas en Power BI. Recomendación: decidir con una prueba de concepto visual de un solo indicador (`IND-PER-01`, el mismo de `PoC-01`) construida en ambos motores, midiendo las siete condiciones. Responsable: CIO.

### Cierre de `Q-PORTAL-01` / `Q-ARQ-02` — Sede electrónica

La propuesta responde: integrado al portal institucional. Si Camilo lo confirma, se cierra la pregunta y se registra en `docs/architecture.md`, con las consecuencias: cumplimiento por herencia de la Resolución 1519 de 2020, dominio de la sede, CMS institucional para los componentes editoriales (B-20) y analítica de uso compartida.

## 6. Plan de integración al Context Lake

Orden sugerido; cada paso deja el repositorio consistente.

| Paso | Archivo | Cambio |
|---|---|---|
| 1 | `AGENTS.md` | Añadir `09_Documentos_Diseños_y_Requerimientos` a la tabla de taxonomía con rol "Insumos de diseño del portal (propuestas, mockups, requerimientos de área). Subordinada a `specs/portal-publico.md`: un mockup ilustra, no especifica". Actualizar "nueve carpetas" a "diez" y anotar en el historial |
| 2 | `adr/ADR-0001` | Nota de alcance: la regla de superposición cubre también carpetas nuevas (`09_`) |
| 3 | `adr/ADR-0009-nombre-y-marca.md` | Crear (sección 5) |
| 4 | `adr/ADR-0010-motor-de-tableros.md` | Crear en estado `propuesta` con las siete condiciones y el plan de PoC visual |
| 5 | `specs/portal-publico.md` | Nueva sección "Arquitectura de información" con los seis componentes de la propuesta mapeados a requisitos (tabla de la sección 7). Nuevos requisitos: `RF-PORTAL-12` perfil por prestador (indicadores del catálogo, semáforo, "no reportó", grupo comparable, marca `en_objecion`); `RF-PORTAL-13` perfil territorial (depende de la regla de agregación de `Q-ONTO-05`); `RF-PORTAL-14` cifras destacadas de portada (solo indicadores del catálogo con ficha aprobada, semáforo, fecha de corte; variación solo con misma versión de ficha); `RF-PORTAL-15` contenidos editoriales (autoría, fecha, versión, enlace al Gestor Normativo, fuera de la compuerta de datos pero con fecha de corte de las cifras citadas). Nuevas reglas: `RN-PORTAL-05` prohibido todo puntaje o índice compuesto que agregue dimensiones; `RN-PORTAL-06` ningún indicador de riesgo (IRCA, IRABAm) se presenta en escala donde mayor sea mejor. Cerrar `Q-PORTAL-01` si se confirma la sede electrónica |
| 6 | `specs/ontologia-indicadores.md` | Tabla "Dimensiones de navegación del portal frente a dimensiones de ontología" (sección 7). Nueva pregunta `Q-ONTO-05`: regla de agregación territorial y nacional (ponderación por suscriptores facturados, tratamiento de municipios con varios prestadores, umbral de cobertura de reporte para publicar un agregado). Bloquea `RF-PORTAL-13` y `RF-PORTAL-14` |
| 7 | `docs/glosario.md` | Añadir "Cifra destacada", "Perfil de prestador", "Perfil territorial", "Lema" y marcar como sinónimos prohibidos "tarifa promedio", "puntaje", "score de calidad", "índice de eficiencia" |
| 8 | `specs/nlp-participacion-ciudadana.md` | Registrar la propuesta (§4 componente 4) como insumo a favor de matriz pública en `Q-NLP-02` |
| 9 | `09_.../mockup_observatorio_cra_v3.html` | Rehacer con el backlog de la sección 8 y solo los catorce indicadores de `catalogo-v1.md` |
| 10 | `AGENTS.md` historial | Registrar la sesión 2026-09-14 |

## 7. Mapa de la propuesta a la ontología y a los requisitos

**Componentes de navegación → requisitos**

| Componente (propuesta) | Sección del mockup | Requisitos que lo gobiernan | Estado |
|---|---|---|---|
| 1. El Observatorio | Hero, footer | `RF-PORTAL-09`; `ADR-0009` | Falta texto de alcance y de qué no permite concluir |
| 2. Indicadores del sector | Cifras destacadas, Indicadores y Power BI, Dimensiones | `RF-PORTAL-01/02/06/11`, `RF-PORTAL-14`, `ADR-0010` | Brechas B-02, B-06, B-13, B-14 |
| 3. Análisis sectorial | Conocimiento | `RF-PORTAL-15` (nuevo) | Sin spec (B-20) |
| 4. Regulación en cifras | Impacto y regulación | `FL-04`, `specs/nlp-participacion-ciudadana.md`, `Q-NLP-02` | Reformular "impacto" como "seguimiento" (B-19) |
| 5. Territorios | Territorios | `RF-PORTAL-13` (nuevo), `RF-ONTO-05`, `Q-ONTO-05` | Brechas B-03, B-05, B-15 |
| (ausente) Prestadores | (ausente) | `RF-PORTAL-10/11/12`, `ADR-0005`, `RF-BENCH-01/03/06` | Brecha B-01, la más importante |
| 6. Conocimiento y datos | Conocimiento, Datos abiertos | `RF-PORTAL-03/04/07`, `RF-CAL-06` | Faltan API, historial de correcciones e informe de calidad (B-09, B-10, B-11) |

**Dimensiones de navegación → dimensiones de ontología**

| Propuesta (5) | Mockup (8) | Ontología (10) e indicadores V1 | Observación |
|---|---|---|---|
| Prestación | Prestación y calidad | `COB` (IND-COB-01/02/03), `CON` (IND-CON-01), `CAL` (IND-CAL-01), `PER` (IND-PER-01/02) | Separar calidad del agua (IRCA, riesgo) de cobertura y continuidad en la interfaz |
| Económicos y tarifarios | Tarifas y costos | `EFI` (IND-EFI-01/02), `FIN` (IND-FIN-01), `INV` (IND-INV-01) | Nunca "tarifa promedio"; distinguir Tarifa aplicada y Costo Unitario |
| — | Impacto social | `ASE` (IND-ASE-01) | Converge |
| — | Sostenibilidad | `ECI` (IND-ECI-01/02), `CLI` (vacía en V1) | Converge; `CLI` va a V1.1 |
| Mercado | Mercado | Sin dimensión: son atributos de la entidad `provider` (segmento, servicios, suscriptores) | Publicar como catálogo de prestadores, no como indicadores |
| Territoriales | Territorio | Sin dimensión: es la desagregación por `divipola_code` de `RF-ONTO-05` | Es una vista transversal |
| Regulatorios | Regulación | Sin dimensión: proyectos regulatorios y participación (`FL-04`) | Es contenido y matriz de participación, no indicadores con ficha |
| — | Tendencias | Sin dimensión: es la serie temporal de cualquier indicador | Es una vista transversal |

## 8. Backlog para el mockup v3

Cambios concretos, cada uno trazado a su requisito, para que la maqueta represente lo que las specs exigen.

1. Renombrar según `ADR-0009`; el lema puede quedarse en el hero (B-17).
2. Portada: cuatro cifras destacadas tomadas solo del catálogo (por ejemplo IND-COB-01, IND-CON-01, IND-PER-01, IND-ASE-01), cada una con semáforo, motivo en una línea, fecha de corte y enlace a ficha (`RF-PORTAL-02`, `RF-PORTAL-14`).
3. Nueva sección "Prestadores": buscador por nombre o ID SUI, ficha del prestador con sus indicadores, su grupo comparable, la banda de incertidumbre en eficiencia y los estados "no reportó" y "en objeción" (`ADR-0005`, `RF-PORTAL-11/12`, `RF-BENCH-03/06`).
4. Perfil territorial: eliminar barras 0–100 y los puntajes "Calidad" y "Eficiencia"; mostrar los indicadores del catálogo con unidad canónica y semáforo; sustituir "Tarifa promedio" por Tarifa aplicada (estrato y año base declarados) o Costo Unitario, nunca ambos como uno; añadir nota de agregación pendiente de `Q-ONTO-05` (B-03, B-04, B-05, B-15).
5. Filtros: añadir segmento y APS; el selector territorial resuelve por `divipola_code` aunque muestre nombres (`RF-ONTO-05/06`).
6. Estados de ausencia: al menos un ejemplo visible de "sin reporte del prestador para el periodo" y uno de "dato en revisión" (`RF-PORTAL-06`, `RF-CAL-02`).
7. Sección "Datos abiertos": columnas `quality_flag`, versión de ficha y fecha de generación en la descripción de cada conjunto; enlace a la API con ejemplo de consulta (`RF-PORTAL-03/04`).
8. Sección "Transparencia del dato": informe de calidad del periodo e historial público de correcciones (`RF-CAL-06`, `RF-PORTAL-07`).
9. "Impacto y regulación" pasa a "Regulación y seguimiento"; la línea de tiempo se conserva pero el paso 4 se llama "Seguimiento de resultados" (B-19).
10. Accesibilidad: íconos SVG con texto alternativo, tooltips accesibles por teclado, variaciones con texto además de color, sin animación continua, tabla equivalente bajo cada gráfica, menú móvil operable (`RF-PORTAL-05`).
11. Marcar el espacio Power BI como "motor de tableros por decidir (`ADR-0010`)" en lugar de "EMBED POWER BI".
12. Conservar el aviso de datos simulados y añadir la versión del mockup y la fecha en el pie.

## 9. Preguntas abiertas que este análisis crea o afecta

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-GOB-04 | ¿Nombre institucional definitivo y uso del lema? | `ADR-0009`, mockup v3 | Dirección Ejecutiva |
| Q-ARQ-09 | ¿Power BI incrustado, tablero propio sobre OCI o híbrido? | `ADR-0010`, `RF-PORTAL-02/03/05` | CIO |
| Q-ONTO-05 | ¿Regla de agregación territorial y nacional? | `RF-PORTAL-13/14` | Subdirección de Regulación |
| Q-PORTAL-01 | Sede electrónica o dominio propio (la propuesta dice sede electrónica) | `RF-PORTAL-04/05` | CIO |
| Q-NLP-02 | Matriz de participación pública (la propuesta lo asume) | Componente 4 | Oficina Jurídica |
| Q-PORTAL-06 | ¿Quién es el dueño editorial de "Análisis sectorial" y "Conocimiento" y con qué flujo de aprobación? | `RF-PORTAL-15` | Subdirección de Regulación |

> **ASUNCIÓN (sin validar):** Este análisis toma el texto del `.docx` extraído como texto plano; si la sección 6 de la propuesta contiene una imagen con la estructura visual sugerida, no fue analizada. Origen: extracción sin imágenes. Confirmar contra el documento original.

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-14 | Versión inicial | Sesión de análisis de la carpeta `09_` con Camilo Carvajalino |
