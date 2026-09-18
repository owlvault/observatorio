---
id: ficha-NMTPP-ADO-01
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-ADO-01 — Estudio de costos recibido por la CRA

> Viabilidad (diagnóstico 2026-09-18): **Alta** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-11 (solo para la variante 'a tiempo')

1. **Código:** NMTPP-ADO-01
2. **Nombre:** Estudio de costos recibido por la CRA
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Proporción de prestadores del ámbito de la Res. 1038 cuyo estudio de costos (inicial o recálculo del año) fue recibido por la CRA a la fecha de corte. Muestra cuántos prestadores ya aplican formalmente la metodología.
5. **Fórmula:** `ADO01(s, t) = E(s, t) / U(s) × 100`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `E(s,t)` | Prestadores del subsegmento s con al menos un `estudio_costos` del tipo evaluado y fecha_recepcion_cra ≤ t | Radicado CRA (`adr/ADR-0014`) | entidad `estudio_costos` | prestadores |
| `U(s)` | Prestadores del subsegmento s en el registro maestro vigente (RF-NMTPP-01) | SUI + estudio de costos | entidad `prestador_marco` | prestadores |
| `t` | Fecha de corte | — | — | fecha |

7. **Unidad de medida:** porcentaje con un decimal; se publica siempre junto con 'E de U prestadores'
8. **Periodicidad:** Mensual (corte al último día del mes); serie anual por tipo de estudio (`inicial` 2027, `recalculo` 2028 en adelante)
9. **Desagregaciones soportadas:** Soportadas: segmento, subsegmento, departamento, municipio (`divipola_code`) del domicilio del prestador, año tarifario. **No soportadas:** APS (la unidad es el prestador).
10. **Sustento normativo:** Res. CRA 1038 de 2026, arts. 2.1.1.1.2.2.9.1 parágrafo (S1), 2.1.1.1.3.2.5.1 parágrafo y 2.1.1.1.3.2.5.2 parágrafo (S2): remisión del estudio de costos a la CRA y a la SSPD; art. 2.1.1.1.1.7 (inicio 1-ene-2027).
11. **Umbrales y rangos:** Rango válido [0, 100]. Referencia de interpretación (no meta): con la Res. 825 solo el 17,03 % de los pequeños prestadores certificó estudio en SURICATA y el 16 % de las organizaciones autorizadas (DT §3). No hay meta regulatoria de adopción.
12. **Limitaciones de interpretación:** Mide recepción del documento, no su calidad ni su conformidad con la metodología. Un estudio recibido no significa tarifa aplicada. La variante 'recibido a tiempo' no se calcula hasta cerrar Q-NMTPP-11. El denominador depende del registro maestro, que puede cambiar por ámbito (RF-NMTPP-01).
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Cociente de sumas (prestadores con estudio / prestadores del ámbito) en cada territorio, con descomposición por prestador. Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-11 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-11 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
