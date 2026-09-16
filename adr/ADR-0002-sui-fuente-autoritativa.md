---
id: adr-0002
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-13
fuentes: [Ley 142 de 1994, README_Context_Lake matriz de fuentes (Drive)]
---

# ADR-0002 — El SUI es la fuente autoritativa y el Observatorio nunca corrige un dato reportado

## Contexto

El dato de prestadores se origina en el SUI, administrado por la SSPD, que es la entidad con competencia de inspección, vigilancia y control. La CRA regula; no vigila ni sanciona. Al construir un observatorio que publica datos de terceros, aparece de inmediato la tentación operativa de corregir lo que se ve mal: un IANC de 140%, una continuidad de 27 horas al día, un municipio mal escrito.

Corregir tiene dos consecuencias graves. Primera, crea una segunda versión de la verdad que difiere de la fuente oficial, y el prestador puede legítimamente objetar una cifra que él nunca reportó. Segunda, invade materialmente la función de vigilancia: decidir cuál es el valor "bueno" de un reporte es una determinación que corresponde a la SSPD.

## Decisión

El Observatorio **marca, califica o pone en cuarentena, pero nunca corrige ni sustituye** un dato reportado por un prestador. La corrección ocurre exclusivamente en el SUI, por el canal del prestador ante la SSPD, y llega al Observatorio como retransmisión.

Toda inconsistencia detectada se publica como hallazgo de calidad descriptivo, sin lenguaje de incumplimiento.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Corregir errores evidentes con reglas automáticas | Series más limpias y usables | Crea una verdad paralela; el prestador puede objetar; invade competencia de la SSPD | Riesgo jurídico e institucional desproporcionado |
| Imputar valores faltantes con modelos | Series completas para análisis | Un valor imputado es indistinguible de uno reportado para quien descarga el CSV | Contradice la regla de no alucinación del README |
| Marcar y poner en cuarentena (elegida) | Respeta competencias; el ciudadano ve la calidad real del dato sectorial | Series con huecos visibles; menos "vistosas" | — |

## Consecuencias

**Positivas:** el Observatorio no compite con la SSPD; la calidad real del reporte sectorial queda visible, lo cual es en sí mismo información útil para la política pública.

**Negativas:** las series tendrán huecos y valores en cuarentena, y el portal se verá menos completo que uno que imputa. Hay que explicarlo activamente al público.

**Deuda que introduce:** el análisis econométrico trabajará con paneles no balanceados, lo que restringe los métodos disponibles.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `specs/ingesta-sui-y-fuentes.md` | RN-SUI-02 y RF-SUI-07 formalizan la prohibición de corregir |
| `specs/calidad-de-datos.md` | RN-CAL-01 y RF-CAL-03 prohíben borrado e imputación silenciosa |
| `specs/portal-publico.md` | RF-PORTAL-06 exige mostrar el motivo de ausencia en lugar de cero |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Decisión registrada | Sesión de generación del Context Lake |
