---
id: ficha-NMTPP-EDR-02
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-EDR-02 — Continuidad en esquemas diferenciales rurales frente al Plan de Gestión

> Viabilidad (diagnóstico 2026-09-18): **Media-Baja** · En el prototipo: **no** · Dependencias abiertas: Q-NMTPP-09

1. **Código:** NMTPP-EDR-02
2. **Nombre:** Continuidad en esquemas diferenciales rurales frente al Plan de Gestión
3. **Dimensión:** CON
4. **Definición:** Porcentaje del tiempo con servicio en APS con esquema diferencial rural, frente a la meta anual del Plan de Gestión del esquema, con estándar de máximo 50 días sin servicio al año.
5. **Fórmula:** `IC_i = (1 − H_afectación,i / H_año,i) × 100 (misma fórmula que NMTPP-S2-CON)`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `H_afectación,i` | Σ horas de afectación × suscriptores afectados | SUI | por mapear | horas-suscriptor |
| `H_año,i` | N_ac,i × 365 × 24 | Derivado | — | horas-suscriptor |
| `meta_pged` | Meta anual del PGED | PGED | `meta_declarada` | % |

7. **Unidad de medida:** porcentaje con un decimal
8. **Periodicidad:** Anual
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.6.1 y parágrafos 1, 3 y 5.
11. **Umbrales y rangos:** Estándar 86,3 %. Metas del PGED; nunca por debajo de la situación inicial.
12. **Limitaciones de interpretación:** Igual que NMTPP-EDR-01. Fuera del prototipo inicial.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Promedio ponderado por suscriptores facturados. Leyenda obligatoria en vista pública (RN-NMTPP-05): "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD". Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-09 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-09 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
