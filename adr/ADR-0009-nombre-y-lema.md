---
id: adr-0009
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: propuesta
actualizado: 2026-09-14
fuentes: [Q-GOB-04 (respuesta de Camilo Carvajalino 2026-09-14), Propuesta_Observatorio_Regulatorio_CRA.docx §8, mockup_observatorio_cra_v2.html, práctica de observatorios y reguladores (OFWAT Discover Water, ERSAR, SUNASS, IB-NET, OAB, Bogotá Cómo Vamos)]
---

# ADR-0009 — Nombre institucional, marca corta y lema del Observatorio

## Contexto

Circulan cuatro nombres. La propuesta conceptual (carpeta `09_`) ofrece tres: "Observatorio Regulatorio de Agua Potable y Saneamiento Básico – CRA", "Observatorio de Información y Análisis Regulatorio – CRA" y "Observatorio de Impacto Regulatorio y Bienestar Social – CRA". El mockup v2 usa un cuarto, "Observatorio de Agua, Territorio y Bienestar", que no está entre los tres. El Context Lake usa el primero como término canónico desde su creación y la regla de oro 5 prohíbe sinónimos.

`Q-GOB-04` pidió una recomendación fundada en la experiencia de otros observatorios. Lo que enseña esa experiencia, en tres capas:

**Capa 1, el nombre institucional dice quién responde por el dato.** Los reguladores maduros nombran el instrumento por la función regulatoria y la entidad, no por una aspiración: el sistema de evaluación de ERSAR se llama por lo que hace (evaluación de calidad del servicio), el benchmarking de SUNASS se llama benchmarking regulatorio, y ambos llevan la entidad. Un nombre que promete "impacto" o "bienestar" compromete al Observatorio con una atribución causal que V1 no puede sostener (no-objetivos de `docs/business_context.md`) y que un prestador puede objetar. Un nombre que dice "información y análisis" describe cualquier portal.

**Capa 2, la marca corta es la que la gente usa.** OFWAT no publica su portal ciudadano como "Water Services Regulation Authority open data": lo llama Discover Water, dos palabras, y el nombre institucional queda en el pie de página. El Observatorio Ambiental de Bogotá es "el OAB"; Bogotá Cómo Vamos es "Cómo Vamos". El nombre canónico de once palabras no cabe en un menú, en una URL ni en una mención de prensa; necesita una marca corta que no sea un sinónimo sino una contracción.

**Capa 3, el lema dice para quién es.** Bogotá Cómo Vamos convirtió en marca una pregunta que el ciudadano se hace. El lema del mockup, "Agua, territorio y bienestar", es un sustantivo triple sin sujeto: no dice qué hace el Observatorio ni para quién. La misión que Camilo Carvajalino fijó como criterio para `Q-ONTO-05`, "regular para un máximo cubrimiento de los ciudadanos en agua y aseo", da el sujeto y el verbo que faltan.

## Decisión

Tres niveles, cada uno con un uso fijo. No son sinónimos: son el mismo nombre en tres longitudes.

| Nivel | Texto | Dónde se usa |
|---|---|---|
| Nombre institucional (canónico) | **Observatorio Regulatorio de Agua Potable y Saneamiento Básico – CRA** | Actos administrativos, fichas metodológicas, pie de página, metadatos de datos abiertos, API, citas académicas. Es el único nombre que aparece en el Context Lake |
| Marca corta | **Observatorio CRA** | Menú, título de pestaña, ruta del micrositio (`/observatorio`, ver `ADR-0011`), redes, prensa. Es una contracción del canónico, no un nombre distinto: conserva "Observatorio" y la entidad |
| Lema | **Datos abiertos para que el agua y el aseo lleguen a todos** | Hero de la portada, materiales de lanzamiento. Nunca en fichas ni en datos |

Por qué este lema y no otro:

- Nombra las dos cosas que el Observatorio es por decisión: datos abiertos (`ADR-0003`, Ley 1712 de 2014) y cobertura de ciudadanos como misión (criterio de `Q-ONTO-05`).
- Dice "agua y aseo", los dos servicios en lenguaje ciudadano, sin el tecnicismo "saneamiento básico" que ya carga el nombre canónico.
- No promete impacto ni bienestar: promete transparencia, que es lo que V1 entrega.
- Cabe en una línea y se lee en voz alta.

Alternativas de lema que se conservan como opciones para Dirección Ejecutiva, en orden de preferencia: "Evidencia abierta para regular mejor el agua y el aseo" (más regulatorio, menos ciudadano); "¿Cómo está el agua en mi municipio?" (pregunta a la manera de Cómo Vamos; fuerte para portada, débil como lema institucional porque omite aseo y alcantarillado); "Agua, territorio y bienestar" (el del mockup; se descarta como lema pero puede sobrevivir como nombre de la sección territorial).

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| "Observatorio de Impacto Regulatorio y Bienestar Social – CRA" | Ambicioso, alineado con AIR ex-post | Promete atribución causal que V1 no sostiene; objetable por prestadores; contradice no-objetivos | Compromete credibilidad antes de tener series |
| "Observatorio de Información y Análisis Regulatorio – CRA" | Neutro | No dice el sector; describe cualquier portal | No diferencia |
| "Observatorio de Agua, Territorio y Bienestar" (mockup) | Comunicacional, memorable | Omite aseo y la entidad; "bienestar" promete impacto; crea un sinónimo del canónico | Se conserva solo como candidato a nombre de sección |
| Tres niveles con canónico intacto (elegida) | No rompe el Context Lake; da marca corta usable; lema con sujeto y misión | Requiere disciplina de uso por nivel | — |

## Consecuencias

**Positivas:** ningún archivo del Context Lake cambia de nombre; el micrositio y la prensa tienen una marca de dos palabras; el lema conecta con la misión sin prometer lo que no se mide.

**Negativas:** "Observatorio CRA" es poco distintivo fuera del sector; se acepta porque el público objetivo (ciudadanos, vocales, prestadores, entidades) conoce la sigla CRA.

**Deuda que introduce:** el manual de identidad visual del micrositio (colores, logotipo, convivencia con la marca de la sede electrónica y con los lineamientos de Gobierno de Colombia) queda pendiente; no es materia de este ADR.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `docs/glosario.md` | Se agregan "Marca corta" y "Lema" con los textos fijados; "Observatorio de Agua, Territorio y Bienestar" pasa a sinónimo prohibido |
| `specs/portal-publico.md` | RF-PORTAL-14 (portada) usa marca corta y lema; el pie de página usa el nombre canónico |
| `09_.../mockup_observatorio_cra_v3.html` | Renombrar según los tres niveles |
| `AGENTS.md` | `Q-GOB-04` pasa a cerrada, condicionada a ratificación de Dirección Ejecutiva |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-14 | Propuesta redactada por solicitud de Camilo Carvajalino (`Q-GOB-04`); pendiente de ratificación por Dirección Ejecutiva | Sesión 2026-09-14 |
