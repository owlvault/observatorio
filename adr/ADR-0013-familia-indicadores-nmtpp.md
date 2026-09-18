---
id: adr-0013
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: propuesta
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, specs/ontologia-indicadores.md, specs/seguimiento-implementacion-nmt.md, 05_/catalogo-v1.md]
---

# ADR-0013 — Los indicadores de seguimiento de la Res. 1038 forman la familia NMTPP-*, separada de IND-* y NMT-*, con la dimensión de navegación SEG

## Contexto

La Res. CRA 1038 define micromedición, continuidad, macromedición, cobertura e IPUF con **fórmulas distintas por segmento**:

- En el S1, la continuidad se calcula por sectores y periodos de facturación, en h/día.
- En el S2, la continuidad se calcula por eventos de afectación, en %.
- La macromedición del S2 es binaria.

Además, las metas cambian por subsegmento. El catálogo V1 ya tiene IND-CON-01 e IND-PER-02, con otra fuente y otro alcance. La spec de la Res. 1032 usa NMT-*.

Hay dos problemas:
- Si los valores de la 1038 entran como IND-*, un agente o un tablero los agregaría con los de otros marcos, lo que viola la regla de oro 10 y RF-ONTO-06.
- Los indicadores de adopción, ISE, incentivos y régimen especial no caben en ninguna de las diez dimensiones de la ontología, y RN-ONTO-01 exige exactamente una.

## Decisión

1. Los indicadores del componente llevan el código `NMTPP-<CAPA>-<NN>` o `NMTPP-<SEGMENTO>-<TEMA>` (catálogo en `05_.../nmtpp/catalogo-nmtpp.md`). Cumplen `RF-ONTO-01..09` y usan la plantilla de 14 campos.
2. Un valor NMTPP-* NO DEBE combinarse, promediarse ni graficarse en la misma serie con un valor IND-* o NMT-*. Solo puede mostrarse al lado, con nota de no comparabilidad.
3. Se agrega la dimensión de navegación **SEG — Seguimiento regulatorio de marcos tarifarios** para los indicadores de adopción, ISE, incentivos, régimen especial, no regresividad y tarifa, tanto de NMT-* como de NMTPP-*. Los indicadores de nivel de servicio conservan su dimensión de ontología (CAL, CON, COB, PER, EFI o CLI).
4. Cada ficha NMTPP declara `marco_tarifario: CRA-1038-2026` en su frontmatter.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Reutilizar IND-CON-01, IND-PER-02, etc. con desagregación por marco | Menos códigos | Una misma ficha con tres fórmulas; versiones mezcladas; riesgo de agregación | Rompe RF-ONTO-04 y la regla de oro 10 |
| Extender la familia NMT-* de la 1032 | Un solo prefijo para NMT | Los segmentos S1-S4 de la 1032 chocan con los S1/S2 y subsegmentos de la 1038 | Confunde segmentos de marcos distintos |
| Forzar adopción e ISE en la dimensión EFI | Sin dimensión nueva | Clasifica mal la adopción; mezcla eficiencia operativa con un índice regulatorio | Engaña al usuario del portal |

## Consecuencias

**Positivas:** Un agente sabe por el prefijo qué norma, qué fórmula y qué metas aplican. No hay agregación accidental entre marcos.
**Negativas:** Hay una dimensión más en la navegación (11), y el componente 2 del portal tiene que mostrarla.
**Deuda que introduce:** La spec de la 1032 debe reclasificar NMT-ADO/TAR/INC/RIE en SEG cuando se revise.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `specs/ontologia-indicadores.md` | Tabla de dimensiones: agregar SEG como dimensión de navegación de seguimiento regulatorio (pendiente de próxima versión) |
| `docs/glosario.md` | Término "Dimensión SEG" |
| `05_.../nmtpp/*` | Catálogo y fichas nuevas |
| `specs/seguimiento-implementacion-nmt.md` | Fuera de alcance remite a la spec 1038; nota de reclasificación en SEG |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Propuesta | Spec del componente NMT de pequeños prestadores |
