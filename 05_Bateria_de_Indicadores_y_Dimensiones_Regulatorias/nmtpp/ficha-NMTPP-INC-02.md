---
id: ficha-NMTPP-INC-02
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: PARCIAL — bloqueada por Q-NMTPP-12
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-INC-02 — Cumplimiento del 100 % de los reportes obligatorios al SUI — primer segmento

> Viabilidad (diagnóstico 2026-09-18): **Media** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-12

1. **Código:** NMTPP-INC-02
2. **Nombre:** Cumplimiento del 100 % de los reportes obligatorios al SUI — primer segmento
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Proporción de prestadores del primer segmento que cumplieron todos los reportes obligatorios al SUI cuyo plazo venció en el año evaluado, condición del incentivo de reporte y gestión de la información.
5. **Fórmula:** `INC02(a) = Σ prestadores con cumplidos(a) = exigibles(a) / prestadores del S1 × 100`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `exigibles(a)` | Reportes obligatorios con plazo vencido en el año a | SSPD (Q-NMTPP-12) | pendiente | reportes |
| `cumplidos(a)` | De ellos, cargados o certificados en plazo | SUI | pendiente | reportes |

7. **Unidad de medida:** porcentaje con un decimal
8. **Periodicidad:** Anual
9. **Desagregaciones soportadas:** Soportadas: segmento, subsegmento, departamento, municipio (`divipola_code`) del domicilio del prestador, año tarifario. **No soportadas:** APS (la unidad es el prestador).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.2.2.6.3 numeral 4 y parágrafo 5.
11. **Umbrales y rangos:** Condición del incentivo: 100 %.
12. **Limitaciones de interpretación:** Sin la lista de reportes exigibles de la SSPD (Q-NMTPP-12) no se calcula; el estado es 'sin fuente confirmada'.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Cociente de sumas. Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-12 | Estado frente a meta / cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-12 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
