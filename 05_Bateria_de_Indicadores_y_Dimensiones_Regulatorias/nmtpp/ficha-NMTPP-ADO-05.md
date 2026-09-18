---
id: ficha-NMTPP-ADO-05
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-ADO-05 — Gestores comunitarios que optan por la metodología del primer segmento

> Viabilidad (diagnóstico 2026-09-18): **Alta** · En el prototipo: **sí** · Dependencias abiertas: —

1. **Código:** NMTPP-ADO-05
2. **Nombre:** Gestores comunitarios que optan por la metodología del primer segmento
3. **Dimensión:** SEG — Seguimiento regulatorio de marcos tarifarios (`adr/ADR-0013`)
4. **Definición:** Número de gestores comunitarios del segundo segmento que comunicaron a la CRA y a la SSPD, en su estudio de costos, que aplicarán la metodología del primer segmento. La decisión es irreversible durante la vigencia.
5. **Fórmula:** `ADO05 = Σ prestadores con opcion_s2_a_s1 = verdadero`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `opcion_s2_a_s1` | Comunicación del GC en el estudio de costos | Estudio de costos | `prestador_marco` | booleano |

7. **Unidad de medida:** número de prestadores (y % sobre gestores comunitarios del ámbito)
8. **Periodicidad:** Una vez (inicio de aplicación)
9. **Desagregaciones soportadas:** Soportadas: segmento, subsegmento, departamento, municipio (`divipola_code`) del domicilio del prestador, año tarifario. **No soportadas:** APS (la unidad es el prestador).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.1.6 parágrafo 2.
11. **Umbrales y rangos:** Sin meta. Mayor o igual a 0.
12. **Limitaciones de interpretación:** No indica mejor o peor desempeño. Un GC que opta por el S1 se evalúa con metas del S1 y sale del grupo comparable del S2.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Suma. Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

Ninguna propia. Heredadas: Q-ONTO-06 (umbral de cobertura de reporte).

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
