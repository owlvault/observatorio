---
id: ficha-NMTPP-ADO-04
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-ADO-04 — Recálculo anual oportuno

> Viabilidad (diagnóstico 2026-09-18): **Alta** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-11 (fecha de remisión)

1. **Código:** NMTPP-ADO-04
2. **Nombre:** Recálculo anual oportuno
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Proporción de prestadores que hicieron el recálculo anual del costo de referencia o de la tarifa comunitaria dentro de la ventana del 1 de enero al 31 de mayo del año tarifario. Aplica desde el año tarifario 2 (2028).
5. **Fórmula:** `ADO04(s, a) = R(s, a) / U(s) × 100; R = prestadores con `estudio_costos` tipo `recalculo`, anio_tarifario = a y fecha_recepcion_cra entre a-01-01 y a-05-31`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `R(s,a)` | Recálculos recibidos en ventana | Radicado CRA | `estudio_costos` | prestadores |
| `U(s)` | Prestadores del ámbito | Registro maestro | `prestador_marco` | prestadores |

7. **Unidad de medida:** porcentaje con un decimal
8. **Periodicidad:** Anual, con corte 31-may y reporte final 30-jun
9. **Desagregaciones soportadas:** Soportadas: segmento, subsegmento, departamento, municipio (`divipola_code`) del domicilio del prestador, año tarifario. **No soportadas:** APS (la unidad es el prestador).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.2.2.1.2 (S1: 'entre el 1 de enero y a más tardar el 31 de mayo de cada año tarifario') y art. 2.1.1.1.3.2.2.6 (tarifa comunitaria).
11. **Umbrales y rangos:** Rango [0, 100]. Se distinguen tres estados por prestador: 'en ventana', 'fuera de ventana', 'sin recálculo'.
12. **Limitaciones de interpretación:** Usa la fecha de recepción en la CRA como aproximación de la fecha de recálculo: la norma fija la ventana de aplicación, no de remisión (Q-NMTPP-11). No aplica al año 1.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Cociente de sumas. Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-11 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-11 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
