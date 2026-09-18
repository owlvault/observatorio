---
id: ficha-NMTPP-ISE-02
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-ISE-02 — Oportunidad de la publicación del ISE por la CRA

> Viabilidad (diagnóstico 2026-09-18): **Alta** · En el prototipo: **sí** · Dependencias abiertas: —

1. **Código:** NMTPP-ISE-02
2. **Nombre:** Oportunidad de la publicación del ISE por la CRA
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Días de anticipación (o de retraso) con que la CRA publica el ISE frente al límite de cuatro meses antes del inicio del año tarifario. Si la CRA no publica, a los prestadores se les reconoce el ISE máximo.
5. **Fórmula:** `ISE02(a) = (a-01-01 − 4 meses) − fecha_publicacion(a) en días; positivo = a tiempo; si no hay publicación: 'sin publicación'`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `fecha_publicacion(a)` | Fecha del acto o publicación del ISE aplicable al año a | Publicación CRA | `ise_publicacion` | fecha |

7. **Unidad de medida:** días (entero)
8. **Periodicidad:** Anual, desde 2029
9. **Desagregaciones soportadas:** Solo nacional (es una obligación de la CRA).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.2.2.7.1 parágrafo 2.
11. **Umbrales y rangos:** Límite: 31-ago del año anterior (por ejemplo 2028-08-31 para 2029). Sin publicación → ISE máximo para todos.
12. **Limitaciones de interpretación:** Mide la oportunidad de la CRA, no la de los prestadores.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** No aplica (indicador nacional). 

## Preguntas abiertas

Ninguna propia. Heredadas: Q-ONTO-06 (umbral de cobertura de reporte).

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
