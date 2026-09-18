---
id: ficha-NMTPP-S2-CON
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-S2-CON — Continuidad del servicio: cierre de brecha frente al estándar — gestores comunitarios

> Viabilidad (diagnóstico 2026-09-18): **Media-Baja** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-02, Q-NMTPP-08

1. **Código:** NMTPP-S2-CON
2. **Nombre:** Continuidad del servicio: cierre de brecha frente al estándar — gestores comunitarios
3. **Dimensión:** CON
4. **Definición:** Porcentaje del tiempo con servicio (descontadas las horas de afectación por suscriptor) y avance en el cierre de la brecha frente al estándar de máximo 50 días sin servicio al año.
5. **Fórmula:** `IC_i = (1 − H_afectación,i / H_año,i) × 100;  H_afectación,i = Σ_{j=1..m} h_j,i × N_af,j,i;  H_año,i = N_ac,i × 365 × 24.  Meta: M = LB + p × (86,3 − LB)`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `h_j,i` | Horas de afectación del evento j (incluye programadas y mantenimientos) | SUI / bitácora del gestor | por mapear | horas |
| `N_af,j,i` | Suscriptores afectados en el evento j | SUI | por mapear | suscriptores |
| `N_ac,i` | Suscriptores facturados promedio del año | SUI | por mapear | suscriptores |
| `LB` | Línea base | Estudio de costos | `linea_base` | % |
| `p` | Cierre: 35/30/20/10 % para S2-1..S2-4 | parametros-res-1038.json | `parametro_meta` | % |

7. **Unidad de medida:** porcentaje con un decimal (se muestra también en h/día = % × 24 / 100 como dato derivado, sin evaluar meta con él)
8. **Periodicidad:** Anual
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.3.1.2 y parágrafo 7; Anexo 6.2.1.10 literal b).
11. **Umbrales y rangos:** Rango [0, 100]. Estándar 86,3 %. Metas: S2-1 35 % y S2-2 30 % de la brecha al año 3 (2029); S2-3 20 % y S2-4 10 % al año 5 (2031).
12. **Limitaciones de interpretación:** Requiere registro de eventos de afectación que los GC hoy no reportan. La línea base depende de Q-NMTPP-02. Un valor alto con pocos eventos reportados puede reflejar subregistro.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Promedio ponderado por suscriptores facturados; distribución de estados por subsegmento. Leyenda obligatoria en vista pública (RN-NMTPP-05): "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD". Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-02 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-02 |
| Q-NMTPP-08 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-08 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
