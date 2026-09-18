---
id: ficha-NMTPP-ISE-01
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: PARCIAL — bloqueada por Q-NMTPP-04, Q-NMTPP-13
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-ISE-01 — Índice Sintético de Eficiencia publicado por la CRA — primer segmento

> Viabilidad (diagnóstico 2026-09-18): **Alta (como publicación de la CRA)** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-04, Q-NMTPP-13

1. **Código:** NMTPP-ISE-01
2. **Nombre:** Índice Sintético de Eficiencia publicado por la CRA — primer segmento
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Valor oficial del Índice Sintético de Eficiencia que la CRA publica cada año para cada prestador del primer segmento, con sus tres dimensiones (técnica, administrativa y financiera), el porcentaje de eficiencia que se aplica a los costos de administración y operación general, y los incentivos que proceden.
5. **Fórmula:** `Ingestión sin recálculo (RN-NMTPP-04). Referencia: ISE = 0,494 × D_técnica + 0,140 × D_administrativa + 0,366 × D_financiera; D_técnica = 0,073 × macromedición + 0,615 × reporte y calidad de agua + 0,311 × continuidad; D_administrativa = 0,813 × micromedición efectiva + 0,187 × PQR; D_financiera = costo administrativo + operativo por suscriptor. % aplicable = max(ISE, 70) desde el año 5; piso 90 % (año 3) y 80 % (año 4).`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `ise_calculado, dim_*, indicadores` | Valores publicados por la CRA | Publicación anual de la CRA (`adr/ADR-0015`) | `ise_publicacion` | puntos 0-100 |
| `pct_eficiencia_aplicable` | Porcentaje aplicado a CMA y CMOG | ídem | ídem | % |
| `ise_con_incentivos` | ISE más incentivos, tope 100 | ídem | ídem | puntos |

7. **Unidad de medida:** puntos (0-100) con un decimal; porcentaje de eficiencia con un decimal
8. **Periodicidad:** Anual; publicación a más tardar 4 meses antes del año de aplicación; primera: 2029 (evaluado 2027)
9. **Desagregaciones soportadas:** Soportadas: prestador, servicio, APS o conjunto de APS (según publique la CRA, Q-NMTPP-13), subsegmento, año de aplicación. **No soportadas:** agregados territoriales, promedios, rankings.
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.1.3 (definición), arts. 2.1.1.1.2.2.7.1 y 2.1.1.1.2.2.7.2; Anexo 6.2.1.4.
11. **Umbrales y rangos:** Rango [0, 100]. ISE ≤ 70 → 70 %. Transición: años 1-2 sin efecto (100 %), año 3 piso 90 %, año 4 piso 80 %, año 5 en adelante piso 70 %. Sin información: 70 %. Sin publicación de la CRA: máximo. Zonas insulares: no aplica.
12. **Limitaciones de interpretación:** El Observatorio no puede replicarlo mientras no se publique la normalización (Q-NMTPP-04). Es una medida relativa: su valor depende del conjunto de referencia. No es calificación de calidad del servicio. Excepción acotada a RN-PORTAL-05 (`adr/ADR-0015`): siempre con descomposición, nunca en ranking ni velocímetro.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** No agregable. 

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-04 | Estado frente a meta / cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-04 |
| Q-NMTPP-13 | Estado frente a meta / cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-13 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
