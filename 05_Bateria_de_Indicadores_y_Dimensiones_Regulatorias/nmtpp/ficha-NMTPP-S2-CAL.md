---
id: ficha-NMTPP-S2-CAL
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: PARCIAL — bloqueada por Q-NMTPP-06
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-S2-CAL — Calidad del agua (IRCA) frente al estándar — gestores comunitarios

> Viabilidad (diagnóstico 2026-09-18): **Media, condicionada** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-06

1. **Código:** NMTPP-S2-CAL
2. **Nombre:** Calidad del agua (IRCA) frente al estándar — gestores comunitarios
3. **Dimensión:** CAL
4. **Definición:** Índice de Riesgo de la Calidad del Agua de los gestores comunitarios frente al estándar de 5 %, exigible desde la entrada en vigencia. Mayor valor significa mayor riesgo.
5. **Fórmula:** `Igual que NMTPP-S1-CAL.`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `IRCA` | Índice de riesgo de la calidad del agua | Pendiente (Q-NMTPP-06) | pendiente | % |

7. **Unidad de medida:** porcentaje con un decimal
8. **Periodicidad:** Pendiente de Q-NMTPP-06
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.3.1.2 parágrafo 3; art. 2.1.1.1.3.1.4 (plan de gestión si no se alcanza); Decreto 1575 de 2007.
11. **Umbrales y rangos:** Estándar ≤ 5 %. Mayor es peor (RN-PORTAL-06).
12. **Limitaciones de interpretación:** Estado 'sin fuente confirmada' mientras Q-NMTPP-06 esté abierta. Un valor > 5 % activa la obligación de Plan de Gestión, que el Observatorio no verifica.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Ponderado por población servida con distribución por nivel de riesgo. Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-06 | Estado frente a meta / cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-06 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
