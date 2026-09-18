---
id: ficha-NMTPP-S1-PER
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: PARCIAL — bloqueada por Q-NMTPP-07, Q-NMTPP-09
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-S1-PER — Índice de pérdidas por suscriptor facturado (IPUF) frente a IPUF* y a la senda declarada — primer segmento

> Viabilidad (diagnóstico 2026-09-18): **Media** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-07, Q-NMTPP-09

1. **Código:** NMTPP-S1-PER
2. **Nombre:** Índice de pérdidas por suscriptor facturado (IPUF) frente a IPUF* y a la senda declarada — primer segmento
3. **Dimensión:** PER
4. **Definición:** Volumen de agua perdida por suscriptor facturado y por mes, comparado con el nivel aceptable de 6 m³/suscriptor/mes y, cuando lo supera, con la senda anual de reducción que el prestador declaró.
5. **Fórmula:** `IPUF_i = (AS_i − AF_i) / N_i;  AS_i = AP_i + RCSAP_i − ECSAP_i`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `AP_i` | Agua producida en el año | SUI (requiere macromedición) | por mapear | m3/año |
| `RCSAP_i` | Volumen recibido por contratos de suministro o interconexión | SUI | por mapear | m3/año |
| `ECSAP_i` | Volumen entregado por contratos de suministro o interconexión | SUI | por mapear | m3/año |
| `AF_i` | Consumo facturado de acueducto | SUI | por mapear | m3/año |
| `N_i` | Sumatoria de suscriptores facturados del año (definición en revisión, Q-NMTPP-07) | SUI | por mapear | suscriptor-periodo |

7. **Unidad de medida:** m3/suscriptor/mes con un decimal
8. **Periodicidad:** Anual
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.1.3 (IPUF, IPUF* = 6), art. 2.1.1.1.2.1.2 y parágrafo 7; Anexo 6.2.1.10 literal a); Ley 142 de 1994 art. 163.
11. **Umbrales y rangos:** Rango ≥ 0. IPUF* = 6 m3/suscriptor/mes. Estados: si IPUF ≤ 6, 'meta cumplida' (mantener o mejorar); si IPUF > 6, estado frente a la meta declarada del año. Escala: mayor es peor (RN-NMT-04).
12. **Limitaciones de interpretación:** Con facturación bimestral la fórmula literal duplica el valor (Q-NMTPP-07). Sin macromedición no hay AP medido: el valor se marca 'no calculable'. No es IANC y no es intercambiable con él (glosario).
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Promedio ponderado por suscriptores facturados (igual que IND-PER-02). Leyenda obligatoria en vista pública (RN-NMTPP-05): "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD". Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-07 | Estado frente a meta / cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-07 |
| Q-NMTPP-09 | Estado frente a meta / cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-09 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
