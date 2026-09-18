---
id: ficha-NMTPP-S1-MAC
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-S1-MAC — Macromedición efectiva — primer segmento

> Viabilidad (diagnóstico 2026-09-18): **Media-Baja** · En el prototipo: **sí** · Dependencias abiertas: —

1. **Código:** NMTPP-S1-MAC
2. **Nombre:** Macromedición efectiva — primer segmento
3. **Dimensión:** EFI
4. **Definición:** Porcentaje de los puntos de medición exigidos por el reglamento técnico (salida de potabilización, salida de tanques y entrada y salida de bombeos) que tienen medidor funcionando, frente a la meta de 100 %.
5. **Fórmula:** `IMA = (Σ_{i=1..m} IMA_i) / m;  IMA_i = NT_i / NTT_i × 100`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `NT_i` | Tuberías de salida de potabilización, salida de tanques y entrada/salida de bombeo con medición en funcionamiento en el mes i | SUI | por mapear | tuberías |
| `NTT_i` | Total de esas tuberías en el sistema | SUI | por mapear | tuberías |
| `m` | Meses con servicio en el año fiscal | SUI | por mapear | meses |

7. **Unidad de medida:** porcentaje con un decimal
8. **Periodicidad:** Anual (promedio de 12 meses)
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.2.1.2; Anexo 6.2.1.10 literal a); Res. MVCT 330 de 2017 art. 73 (modificada por Res. 799 de 2021).
11. **Umbrales y rangos:** Rango [0, 100]. Meta 100 %: S1-1, S1-2 y S1-3 al año 1 (2027); S1-4 al año 2 (2028).
12. **Limitaciones de interpretación:** La información de macromedición es 'casi inexistente' (DT §6.1): los primeros años tendrán alta proporción de 'no reportó'. No verifica calibración ni tipo de medidor, aunque la norma los exige.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** No agregable como promedio (unidades de tuberías heterogéneas); se publica la distribución de prestadores por estado. Leyenda obligatoria en vista pública (RN-NMTPP-05): "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD". 

## Preguntas abiertas

Ninguna propia. Heredadas: Q-ONTO-06 (umbral de cobertura de reporte).

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
