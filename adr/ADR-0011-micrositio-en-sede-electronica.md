---
id: adr-0011
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-14
fuentes: [Q-PORTAL-01 y Q-ARQ-02 (decisión de Camilo Carvajalino 2026-09-14), Propuesta_Observatorio_Regulatorio_CRA.docx §1, Resolución MinTIC 1519 de 2020, Ley 1712 de 2014]
---

# ADR-0011 — El Observatorio es un micrositio dentro de la sede electrónica de la CRA

## Contexto

`Q-PORTAL-01` y `Q-ARQ-02` preguntaban si el portal vive en la sede electrónica de la CRA o en un dominio propio. La propuesta conceptual de la carpeta `09_` lo plantea "integrado al portal institucional". La decisión afecta accesibilidad (`RF-PORTAL-05`), analítica, gobierno del contenido editorial, la ruta de la API (`RF-PORTAL-04`) y la identidad visual (`ADR-0009`).

## Decisión

El Observatorio se publica como **micrositio dentro de la sede electrónica de la CRA**, bajo una ruta propia y estable de primer nivel.

> **ASUNCIÓN (sin validar):** la ruta es `/observatorio` bajo el dominio de la sede electrónica. Origen: contracción natural de la marca corta de `ADR-0009`. Confirmar con el administrador de la sede.

Reglas que se derivan:

1. **Herencia de cumplimiento.** El micrositio hereda la plantilla, el encabezado de Gobierno de Colombia, el pie institucional y los mecanismos de accesibilidad de la sede (Resolución MinTIC 1519 de 2020). Lo que el micrositio agrega (tableros, gráficas, tablas, descargas) debe cumplir WCAG 2.1 AA por sí mismo (`RF-PORTAL-05`); heredar la plantilla no exime a los componentes propios.
2. **Dos tipos de contenido, dos gobiernos.** Los datos (indicadores, fichas, descargas, API) los sirve el tablero propio sobre OCI (`ADR-0010`) y pasan por la compuerta de `ADR-0003`. Los contenidos editoriales (análisis sectorial, boletines, publicaciones) los gestiona el sistema de contenidos de la sede y los aprueba el Equipo Editorial del Observatorio (`RF-PORTAL-15`). La sede no puede editar un dato; el Equipo Editorial no puede publicar un dato.
3. **La API y las descargas viven bajo el mismo host** que el micrositio, en rutas propias y versionadas, para que un enlace a un CSV o a un recurso de la API sea citable y estable (`RF-PORTAL-03/04`, `RNF-PORTAL-03`).
4. **Analítica de uso compartida con la sede**, con vistas propias por sección del micrositio; es el insumo del criterio de migración de `ADR-0010` y de la métrica "consultas y descargas" de `docs/business_context.md`.
5. **Identidad.** El micrositio usa marca corta y lema (`ADR-0009`) dentro de la plantilla de la sede; el nombre canónico va en el pie.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Dominio propio | Libertad de diseño y de stack; analítica independiente | Nuevo dominio que certificar, mantener y hacer cumplir con la 1519; identidad separada de la CRA; confusión sobre quién responde por el dato | La legitimidad del dato viene de la CRA; separarlo la diluye |
| Sección plana de la sede (sin micrositio) | Cero infraestructura adicional | El CMS de la sede no puede servir tableros ni API; la compuerta de publicación no se puede hacer cumplir | No cumple `RN-PORTAL-01` |
| Micrositio en la sede (elegida) | Legitimidad institucional; cumplimiento heredado; datos bajo control propio | Requiere coordinación con el administrador de la sede y dos gobiernos de contenido | — |

## Consecuencias

**Positivas:** el ciudadano llega al Observatorio desde donde ya busca a la CRA; el cumplimiento de la 1519 se hereda en la envoltura; la API y las descargas tienen host institucional.

**Negativas:** el ritmo de despliegue del tablero propio depende parcialmente de la operación de la sede; hay que negociar la ruta, la incrustación y la analítica.

**Deuda que introduce:** documentar cómo se incrusta el tablero propio en la plantilla de la sede (iframe, componente o ruta reversa) y quién administra la sede; ambos son asunciones hasta confirmarse.

> **ASUNCIÓN (sin validar):** el sistema de contenidos y el administrador de la sede electrónica no están identificados en el Context Lake. Origen: no se mencionaron en el material. Confirmar con el CIO.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `specs/portal-publico.md` | `Q-PORTAL-01` cerrada; `RF-PORTAL-04` deja de depender de `Q-ARQ-02`; nueva `RN-PORTAL-07` (dos gobiernos de contenido) |
| `docs/architecture.md` | `Q-ARQ-02` cerrada; componente "Portal y API" con host de la sede |
| `AGENTS.md` | Fila "Portal" del stack |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-14 | Decisión tomada: micrositio en la sede electrónica | Respuesta de Camilo Carvajalino a `Q-PORTAL-01` |
