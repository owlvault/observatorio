---
id: ficha-NMTPP-ADO-02
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: PARCIAL — bloqueada por Q-NMTPP-03
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-ADO-02 — Concordancia del subsegmento declarado con el calculado

> Viabilidad (diagnóstico 2026-09-18): **Alta** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-03

1. **Código:** NMTPP-ADO-02
2. **Nombre:** Concordancia del subsegmento declarado con el calculado
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Proporción de prestadores cuyo subsegmento declarado en el estudio de costos coincide con el que resulta de los suscriptores a 31-dic-2024. La clasificación es única por cinco años, por eso un error aquí se arrastra en todas las metas.
5. **Fórmula:** `ADO02(s) = C(s) / D(s) × 100, donde C(s) = prestadores con subsegmento_declarado = subsegmento_calculado_regla_vigente; D(s) = prestadores con estudio recibido y subsegmento calculable`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `subsegmento_calculado_regla_mayor` | Subsegmento con max(suscriptores_ac_2024, suscriptores_al_2024) (Resolución) | SUI | por mapear (ver ASUNCIÓN de la spec) | código |
| `subsegmento_calculado_regla_acueducto` | Subsegmento con suscriptores_ac_2024 (DT) | SUI | ídem | código |
| `subsegmento_declarado` | Declarado por el prestador | Estudio de costos | `prestador_marco` | código |

7. **Unidad de medida:** porcentaje con un decimal y conteo de discrepancias
8. **Periodicidad:** Una vez (al recibir el estudio inicial); se recalcula solo si cambia la regla (Q-NMTPP-03) o se corrige el dato 2024
9. **Desagregaciones soportadas:** Soportadas: segmento, subsegmento, departamento, municipio (`divipola_code`) del domicilio del prestador, año tarifario. **No soportadas:** APS (la unidad es el prestador).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.1.6 y parágrafos 1, 3, 4 y 5. Documento Técnico §5.3 (regla divergente).
11. **Umbrales y rangos:** Rango [0, 100]. Una discrepancia se lista uno a uno en la vista interna; no hay umbral de tolerancia.
12. **Limitaciones de interpretación:** Mientras Q-NMTPP-03 esté abierta, la regla vigente es la de la Resolución y la discrepancia entre reglas se muestra aparte. No afirma que el prestador se clasificó mal: puede haber diferencias en la variable 'suscriptores' (catastro vs facturados).
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Cociente de sumas en territorio; la lista de discrepancias es solo interna (RF-NMTPP-17). Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-03 | Estado frente a meta / cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-03 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
