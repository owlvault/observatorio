---
id: ficha-NMTPP-TAR-01
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-TAR-01 — Tarifa aplicada por estrato y uso frente a la del marco anterior

> Viabilidad (diagnóstico 2026-09-18): **Media** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-09 (formato de tarifas del estudio)

1. **Código:** NMTPP-TAR-01
2. **Nombre:** Tarifa aplicada por estrato y uso frente a la del marco anterior
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Cargo fijo y cargo por consumo de acueducto que aplica el prestador bajo la Res. 1038, por estrato y uso, y su variación frente a lo aplicado en diciembre de 2026 bajo la Res. 825. Se contrasta con la estimación ex ante del regulador.
5. **Fórmula:** `Var(e, u) = (T_1038(e, u) − T_825(e, u)) / T_825(e, u) × 100, por separado para cargo fijo ($/suscriptor/mes) y cargo por consumo ($/m3)`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `T_1038(e,u)` | Tarifa aplicada bajo la Res. 1038 por estrato e y uso u | Estudio de costos num. 10 (desde año 2) y SUI | `tarifa_aplicada` | $ corrientes |
| `T_825(e,u)` | Tarifa aplicada en dic-2026 | SUI | `tarifa_aplicada` | $ corrientes |

7. **Unidad de medida:** $/m3 y $/suscriptor/mes en pesos corrientes con año base declarado; variación en porcentaje con un decimal
8. **Periodicidad:** Anual (y al inicio de aplicación)
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, estrato (1-6), uso (residencial, comercial, industrial, oficial), segmento, subsegmento. **No soportadas:** promedio del prestador sin estrato ('tarifa promedio', RN-PORTAL-04), agregados territoriales.
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.2.2.9.1 numeral 10; art. 2.1.1.1.8.2; art. 2.1.1.1.8.3 (valor máximo; menor valor informado a la SSPD). Referente ex ante: Documento Técnico, Anexo 13, Tabla 104.
11. **Umbrales y rangos:** Referente ex ante del DT (factura promedio estimada): acueducto S1 +18,1 %, acueducto gestores comunitarios +6,1 %. Rotulado 'estimación ex ante del regulador — no es meta ni tope'.
12. **Limitaciones de interpretación:** Tarifa aplicada ≠ costo unitario (glosario). Una tarifa sin estrato o uso no se publica (RN-NMT-03). La comparación con el referente del DT es de orden de magnitud: el DT compara factura promedio, no tarifas por estrato.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** No agregable (RN-PORTAL-04). 

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-09 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-09 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
