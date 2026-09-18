---
id: ficha-NMTPP-NRG-01
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-NRG-01 — Regresión frente a la línea base (no regresividad)

> Viabilidad (diagnóstico 2026-09-18): **Media** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-02 (para continuidad)

1. **Código:** NMTPP-NRG-01
2. **Nombre:** Regresión frente a la línea base (no regresividad)
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Número de prestadores con al menos un indicador de nivel de servicio (micromedición, continuidad, macromedición o cobertura) por debajo del nivel que tenían al entrar en vigencia la norma, que prohíbe desmejorarlo.
5. **Fórmula:** `NRG01(s, a) = Σ prestadores con ∃ indicador k: valor(k, a) < LB(k)  (para PER: valor > LB)`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `valor(k,a)` | Valor observado del indicador k en el año a | Indicadores NMTPP de servicio | `indicator_value` | según k |
| `LB(k)` | Línea base del indicador k | Estudio de costos | `linea_base` | según k |

7. **Unidad de medida:** número de prestadores (y % del subsegmento)
8. **Periodicidad:** Anual
9. **Desagregaciones soportadas:** Soportadas: segmento, subsegmento, departamento, municipio (`divipola_code`) del domicilio del prestador, año tarifario. **No soportadas:** APS (la unidad es el prestador).
10. **Sustento normativo:** Res. CRA 1038 de 2026, arts. 2.1.1.1.1.4 parágrafo 4, 2.1.1.1.2.1.1 parágrafo 6, 2.1.1.1.3.1.1 parágrafo 4 y 2.1.1.1.4.1 parágrafo 8.
11. **Umbrales y rangos:** Cualquier regresión se lista. Sin tolerancia definida por la norma.
12. **Limitaciones de interpretación:** Una regresión puede deberse a mejor medición (p. ej. más sectores reportados de continuidad). Solo vista interna por prestador; en la vista pública se muestra el dato sin calificativo (RF-NMTPP-11).
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Suma. Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-02 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-02 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
