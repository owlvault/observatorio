---
id: ficha-NMTPP-ADO-03
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-ADO-03 — APS de acueducto definida y reportada

> Viabilidad (diagnóstico 2026-09-18): **Media** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-10

1. **Código:** NMTPP-ADO-03
2. **Nombre:** APS de acueducto definida y reportada
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Proporción de prestadores del ámbito que tienen al menos una APS de acueducto definida y reportada, con municipio y zona. Sin APS no se pueden calcular costos ni metas por área.
5. **Fórmula:** `ADO03(s) = A(s) / U(s) × 100; A(s) = prestadores con ≥1 `aps_marco` de acueducto con divipola_code y zona`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `A(s)` | Prestadores con APS de acueducto registrada | SUI (reporte de APS a la SSPD) o estudio de costos | `aps_marco` | prestadores |
| `U(s)` | Prestadores del ámbito | Registro maestro | `prestador_marco` | prestadores |

7. **Unidad de medida:** porcentaje con un decimal
8. **Periodicidad:** Anual (y al recibir estudio inicial)
9. **Desagregaciones soportadas:** Soportadas: segmento, subsegmento, departamento, municipio (`divipola_code`) del domicilio del prestador, año tarifario. **No soportadas:** APS (la unidad es el prestador).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.1.5 numerales 1, 7 y 8, y parágrafos 1, 3 y 4.
11. **Umbrales y rangos:** Rango [0, 100]. Sin meta regulatoria.
12. **Limitaciones de interpretación:** La norma deja las condiciones del reporte de APS a la SSPD (num. 7); hasta que exista formato (Q-NMTPP-10) la fuente principal es el estudio de costos. No verifica la coherencia con el POT/PBOT/EOT.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Cociente de sumas. Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-10 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-10 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
