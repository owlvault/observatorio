---
id: ficha-NMTPP-S2-MIC
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-S2-MIC — Micromedición de suscriptores residenciales — gestores comunitarios

> Viabilidad (diagnóstico 2026-09-18): **Media-Alta** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-08 (años previos al de cumplimiento)

1. **Código:** NMTPP-S2-MIC
2. **Nombre:** Micromedición de suscriptores residenciales — gestores comunitarios
3. **Dimensión:** EFI
4. **Definición:** Porcentaje de suscriptores residenciales del gestor comunitario con sistema de medición en operación, frente a la meta de 100 % en el año que fija la norma para su subsegmento.
5. **Fórmula:** `IM_i,R = N_medidor,i,R / N_ac,i,R × 100`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `N_medidor,i,R` | Suscriptores residenciales con medición en operación en el año | SUI (formato proporcional, Q-NMTPP-10) | por mapear | suscriptores |
| `N_ac,i,R` | Suscriptores residenciales facturados promedio del año (12 meses o 6 bimestres) | SUI | por mapear | suscriptores |

7. **Unidad de medida:** porcentaje con un decimal
8. **Periodicidad:** Anual
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.3.1.2 y parágrafos 2, 4 y 6; Anexo 6.2.1.10 literal b).
11. **Umbrales y rangos:** Rango [0, 100]. Meta 100 %: S2-1 año 2 (2028), S2-2 año 3 (2029), S2-3 año 4 (2030), S2-4 año 5 (2031). No residenciales: 100 % desde el inicio.
12. **Limitaciones de interpretación:** Solo el 16 % de las organizaciones autorizadas certificó estudio bajo la Res. 825 (DT §3): alta probabilidad de 'no reportó'. No incluye usuarios atendidos solo por pila pública (art. 2.1.1.1.5.1 par. 2).
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Promedio ponderado por suscriptores facturados; distribución de estados por subsegmento. Leyenda obligatoria en vista pública (RN-NMTPP-05): "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD". Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-08 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-08 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
