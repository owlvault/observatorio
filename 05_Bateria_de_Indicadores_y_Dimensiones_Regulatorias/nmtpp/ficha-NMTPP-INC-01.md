---
id: ficha-NMTPP-INC-01
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-INC-01 — Incentivos tarifarios reconocidos por tipo — primer segmento

> Viabilidad (diagnóstico 2026-09-18): **Alta desde 2029** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-08 (condición de continuidad y micromedición)

1. **Código:** NMTPP-INC-01
2. **Nombre:** Incentivos tarifarios reconocidos por tipo — primer segmento
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Número y proporción de prestadores del primer segmento a los que la CRA reconoció cada incentivo en su publicación anual: continuidad y pérdidas (sobre el costo de operación general) y micromedición, asociatividad, buen gobierno y reporte (sobre el costo de administración).
5. **Fórmula:** `INC01(tipo, a) = Σ prestadores con incentivo 'tipo' en `ise_publicacion` del año a;  proporción = INC01 / prestadores del S1 con ISE publicado × 100`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `incentivos` | Lista de incentivos reconocidos por prestador | Publicación CRA | `ise_publicacion` | lista |

7. **Unidad de medida:** número y porcentaje con un decimal; se muestra el porcentaje de incentivo del año (CMOG 5/10/15; CMA 2,5/5/7,5)
8. **Periodicidad:** Anual, desde 2029 (evaluado i-2)
9. **Desagregaciones soportadas:** Soportadas: segmento, subsegmento, departamento, municipio (`divipola_code`) del domicilio del prestador, año tarifario. **No soportadas:** APS (la unidad es el prestador).
10. **Sustento normativo:** Res. CRA 1038 de 2026, arts. 2.1.1.1.2.2.6.1, 2.1.1.1.2.2.6.2 y 2.1.1.1.2.2.6.3.
11. **Umbrales y rangos:** Sin meta. ISE con incentivos ≤ 100 %; no acumulables entre años.
12. **Limitaciones de interpretación:** El Observatorio no determina la procedencia (RF-NMTPP-14). Un prestador sin incentivo puede ser por no cumplir o por no reportar: la publicación de la CRA debe distinguirlo; si no lo hace, se muestra 'sin incentivo' sin causa.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Suma por tipo. Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-08 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-08 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
