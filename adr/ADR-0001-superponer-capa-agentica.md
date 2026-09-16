---
id: adr-0001
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-13
fuentes: [decisión de Camilo Carvajalino, sesión 2026-09-13]
---

# ADR-0001 — Superponer la capa agéntica sobre la taxonomía 00–08 en lugar de reorganizar el Drive

## Contexto

El Drive del Observatorio ya tenía, antes de esta sesión, una taxonomía de nueve carpetas temáticas (`00_Gobernanza` a `08_Documentos_Fuente`) descrita en el README maestro `CTX-LAKE-CRA-OBSERVATORIO-001`, con una matriz de fuentes y cinco directrices de operación para agentes.

Esa taxonomía organiza **acervo de conocimiento** por tema. Lo que no tenía era la capa determinista que un agente de código necesita: enrutamiento, requisitos con identificador y criterios de aceptación verificables, glosario canónico y registro de decisiones. Un agente que leyera solo las nueve carpetas sabría de qué trata el Observatorio, pero rellenaría con su entrenamiento todo lo que faltara.

Había dos caminos: reorganizar el Drive a la estructura canónica de Context Lake, o superponer la capa canónica sobre lo existente.

## Decisión

Mantener intactas las nueve carpetas `00_` a `08_` como capa de conocimiento y materia prima, y crear sobre ellas la capa agéntica: `AGENTS.md` en la raíz, más `docs/`, `specs/` y `adr/`.

`AGENTS.md` es el punto de entrada único y contiene la tabla de correspondencia entre las nueve carpetas y su rol en el Context Lake. Cuando `00_Gobernanza_y_Arneses_Agenticos` y `AGENTS.md` se contradigan, manda `AGENTS.md`.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Reorganizar todo a la estructura canónica | Estructura reconocible entre proyectos; un solo criterio | Rompe enlaces y referencias del README ya aprobado; el conector de Drive no mueve ni borra limpiamente | Costo de migración alto frente a un beneficio estético |
| Poblar solo las carpetas 00–08, sin capa de specs | Cero fricción con lo existente | Deja el problema original sin resolver: ningún requisito verificable | No produce un Context Lake, solo un repositorio documental |
| Superponer la capa agéntica (elegida) | Conserva el trabajo previo; agrega determinismo donde falta | Dos criterios de organización conviviendo | — |

## Consecuencias

**Positivas:** el trabajo previo se conserva íntegro; la materia prima queda separada de lo destilado; se puede empezar a generar specs sin mover un solo archivo existente.

**Negativas:** conviven dos lógicas de organización en el mismo Drive, y alguien que entre sin leer `AGENTS.md` puede no entender cuál manda. Se mitiga con la tabla de correspondencia y con la regla de precedencia explícita.

**Deuda que introduce:** si `00_Gobernanza` se puebla con protocolos de agentes que contradigan `AGENTS.md`, habrá duplicación de verdad. Debe revisarse antes de poblar esa carpeta.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `AGENTS.md` | Incorpora la sección "Relación con la taxonomía 00–08" con la tabla de correspondencia y la regla de precedencia |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Decisión tomada y registrada | Sesión con Camilo Carvajalino |
