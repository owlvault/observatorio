---
id: ficha-NMTPP-S1-MIC
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-S1-MIC — Micromedición efectiva frente a la meta del subsegmento — primer segmento

> Viabilidad (diagnóstico 2026-09-18): **Alta** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-08 (solo años anteriores al de cumplimiento)

1. **Código:** NMTPP-S1-MIC
2. **Nombre:** Micromedición efectiva frente a la meta del subsegmento — primer segmento
3. **Dimensión:** EFI
4. **Definición:** Porcentaje de suscriptores con medidor en buen estado cuya lectura se usa para facturar, frente a la meta de 100 % en el año que fija la norma para cada subsegmento.
5. **Fórmula:** `IMI = (Σ_{g=1..PF} IMI_g) / PF;  IMI_g = MFL_g / NS_g × 100`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `MFL_g` | Micromedidores en buen estado funcionando con lectura en el periodo de facturación g | SUI | por mapear | medidores |
| `NS_g` | Suscriptores donde es técnicamente viable la medición en g (multiusuario = 1) | SUI | por mapear | suscriptores |
| `PF` | Periodos de facturación del año de evaluación | SUI | por mapear | número |

7. **Unidad de medida:** porcentaje con un decimal (la norma redondea a dos decimales; se almacena completo, RNF-ONTO-02)
8. **Periodicidad:** Anual (año tarifario); cierre con todos los periodos de facturación del año
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.2.1.2 (metas) y parágrafos 2, 4 y 5; Anexo 6.2.1.10 literal a) (fórmula), que remite al numeral 6.1.8.4 del Libro 6.
11. **Umbrales y rangos:** Rango [0, 100]. Meta 100 %: S1-1 año 1 (2027), S1-2 año 2 (2028), S1-3 año 3 (2029), S1-4 año 5 (2031). Antes del año de cumplimiento: meta declarada por el prestador (RN-NMTPP-08) o 'no exigible aún'.
12. **Limitaciones de interpretación:** Excluye a los suscriptores donde la medición no es técnicamente viable. No mide exactitud metrológica. Un valor alto no implica bajas pérdidas.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Promedio ponderado por suscriptores facturados; el agregado principal del tablero es la distribución de prestadores por estado dentro del subsegmento. Leyenda obligatoria en vista pública (RN-NMTPP-05): "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD". Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-08 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-08 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
