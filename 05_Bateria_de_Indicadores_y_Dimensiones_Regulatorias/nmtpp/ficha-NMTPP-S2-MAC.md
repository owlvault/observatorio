---
id: ficha-NMTPP-S2-MAC
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-S2-MAC — Macromedición (dos puntos de control) — gestores comunitarios

> Viabilidad (diagnóstico 2026-09-18): **Media** · En el prototipo: **sí** · Dependencias abiertas: —

1. **Código:** NMTPP-S2-MAC
2. **Nombre:** Macromedición (dos puntos de control) — gestores comunitarios
3. **Dimensión:** EFI
4. **Definición:** Indica si el gestor comunitario tiene medición instalada y operativa en al menos dos puntos de control (captación y salida de la planta, o captación y salida a red si no hay planta).
5. **Fórmula:** `IMA_i = 100 % si tiene ≥ 2 puntos de control con medición operativa; 0 % si no. Control adicional: ≥ 1 punto desde el inicio (par. 5).`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `puntos_operativos` | Número de puntos de control con medición operativa | SUI / estudio de costos | por mapear | número |

7. **Unidad de medida:** binario; agregado en porcentaje con un decimal
8. **Periodicidad:** Anual
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.3.1.2 y parágrafo 5; Anexo 6.2.1.10 literal b); Res. 799 de 2021 art. 19 par. 4 (dispositivos aceptados).
11. **Umbrales y rangos:** Meta 100 %: S2-1 año 2 (2028), S2-2 año 3 (2029), S2-3 y S2-4 año 5 (2031). Desde el inicio: al menos 1 punto.
12. **Limitaciones de interpretación:** No verifica calibración. Tener macromedición es condición para el ISGP y para el balance simplificado.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Cociente de sumas (GC con 100 % / GC del subsegmento). Leyenda obligatoria en vista pública (RN-NMTPP-05): "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD". Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

Ninguna propia. Heredadas: Q-ONTO-06 (umbral de cobertura de reporte).

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
