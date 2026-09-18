---
id: ficha-NMTPP-ESP-01
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-ESP-01 — APS de acueducto con condición especial estructural

> Viabilidad (diagnóstico 2026-09-18): **Alta** · En el prototipo: **sí** · Dependencias abiertas: —

1. **Código:** NMTPP-ESP-01
2. **Nombre:** APS de acueducto con condición especial estructural
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Número y proporción de APS de acueducto del ámbito con al menos una condición especial estructural (insular, vulnerabilidad hídrica alta, pobreza multidimensional, PDET/ZOMAC o toma de posesión), que por eso se evalúan con los estándares del segundo segmento.
5. **Fórmula:** `ESP01(c) = número de `aps_marco` con c ∈ condicion_especial;  ESP01_total = APS con ≥1 condición / APS del ámbito × 100`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `condicion_especial` | Lista de códigos INSULAR, IVH, IPM, PDET_ZOMAC, TOMA_POSESION | IDEAM (IVH, Estudio Nacional del Agua), DANE (IPM, ECV), listas PDET/ZOMAC, SSPD (tomas de posesión), estudio de costos | `aps_marco` | códigos |

7. **Unidad de medida:** número de APS y porcentaje con un decimal
8. **Periodicidad:** Anual (las listas externas se actualizan con su fuente)
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.1.3 (definición de APS con condiciones especiales estructurales), art. 2.1.1.1.1.5 num. 1 vi, art. 2.1.1.1.4.1.
11. **Umbrales y rangos:** Sin meta. Una APS puede tener varias condiciones; se cuentan por condición y una vez en el total.
12. **Limitaciones de interpretación:** La condición la declara el prestador y el Observatorio la contrasta con las listas públicas; una discrepancia es alerta interna, no corrección. La toma de posesión es transitoria (par. 7).
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Suma (APS) y cociente de sumas (proporción). Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

Ninguna propia. Heredadas: Q-ONTO-06 (umbral de cobertura de reporte).

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
