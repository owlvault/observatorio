---
id: ficha-NMTPP-S1-CON
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: PARCIAL — bloqueada por Q-NMTPP-01, Q-NMTPP-02, Q-NMTPP-08
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-S1-CON — Continuidad del servicio: cierre de brecha frente al estándar — primer segmento

> Viabilidad (diagnóstico 2026-09-18): **Baja hoy; viable con condiciones** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-01, Q-NMTPP-02, Q-NMTPP-08

1. **Código:** NMTPP-S1-CON
2. **Nombre:** Continuidad del servicio: cierre de brecha frente al estándar — primer segmento
3. **Dimensión:** CON
4. **Definición:** Horas promedio diarias de servicio por suscriptor y avance en el cierre de la brecha entre la continuidad de la línea base y el estándar de 10 días sin servicio al año.
5. **Fórmula:** `IC = (Σ_{g} IC_g) / PF;  IC_g = ( Σ_{s=1..k} (Nhs_s × Ns_s) / (Nht_g × NS_g) ) × 24 h/día.  Meta del año de cumplimiento a_c: M = LB + p × (E − LB), con p = % de cierre del subsegmento y E = estándar en la unidad que fije Q-NMTPP-01`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `Nhs_s` | Horas de servicio prestadas en el sector s en g | SUI | por mapear | horas |
| `Ns_s` | Suscriptores del sector s en g | SUI | por mapear | suscriptores |
| `Nht_g` | Horas totales del periodo g (24 × días) | Derivado | — | horas |
| `NS_g` | Suscriptores totales en g | SUI | por mapear | suscriptores |
| `LB` | Línea base de continuidad | Estudio de costos (Q-NMTPP-02) | `linea_base` | h/día |
| `p` | Cierre de brecha: 70/60/50/40 % para S1-1..S1-4 | parametros-res-1038.json | `parametro_meta` | % |

7. **Unidad de medida:** horas/día con un decimal (regla de oro 6). El estándar 97,26 % se convierte a h/día SOLO si Q-NMTPP-01 lo confirma (bandera `continuidad_equivalencia_24h`)
8. **Periodicidad:** Anual (año tarifario)
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.2.1.2 (estándar y metas) y parágrafo 6 (exclusión de eventos naturales); Anexo 6.2.1.10 literal a).
11. **Umbrales y rangos:** Rango [0, 24] h/día. Estándar 97,26 % (≈ 23,34 h/día si se confirma la equivalencia). Metas: S1-1 70 % y S1-2 60 % de la brecha al año 3 (2029); S1-3 50 % y S1-4 40 % al año 5 (2031).
12. **Limitaciones de interpretación:** Mientras Q-NMTPP-01 o Q-NMTPP-02 estén abiertas el estado es 'meta pendiente de aclaración normativa' (RF-NMTPP-08). El valor depende de la sectorización que reporte el prestador. Las horas excluidas por eventos extremos acreditados reducen Nht_g; el Observatorio no las reconstruye.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Promedio ponderado por suscriptores facturados (igual que IND-CON-01), con distribución de estados por subsegmento. Leyenda obligatoria en vista pública (RN-NMTPP-05): "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD". Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-01 | Estado frente a meta / cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-01 |
| Q-NMTPP-02 | Estado frente a meta / cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-02 |
| Q-NMTPP-08 | Estado frente a meta / cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-08 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
