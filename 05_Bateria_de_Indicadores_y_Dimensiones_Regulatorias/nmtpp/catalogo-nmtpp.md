---
id: catalogo-indicadores-nmtpp
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, 07_/diagnostico-viabilidad-monitoreo-nmt-pp-acueducto-2026-09-18.md, catalogo-v1.md (plantilla de ficha)]
---

# Catálogo NMTPP — Seguimiento al NMT de pequeños prestadores de acueducto (Res. CRA 1038 de 2026)

Este catálogo lista los indicadores del componente definido en `specs/seguimiento-nmt-pequenos-prestadores.md`. Cada indicador tiene su ficha en esta carpeta (`ficha-NMTPP-*.md`) con los 14 campos de la plantilla de `../catalogo-v1.md`.

La familia NMTPP-* es distinta de IND-* (`adr/ADR-0013`): sus fórmulas y metas son las de la Res. 1038 por segmento, y sus valores **no se comparan ni se agregan** con IND-* ni con NMT-* de la Res. 1032.

## Criterio de inclusión

Un indicador entra al catálogo cuando cumple las tres condiciones siguientes. Los que no las cumplen quedan como "candidatos sin ficha".

1. La Res. 1038 lo define, o define la obligación que mide.
2. Tiene meta o umbral en la norma, o es un conteo de una obligación de la norma.
3. Alguna fuente designada (SUI, radicado de la CRA o publicación de la CRA) puede alimentarlo.

## Dimensión SEG

`adr/ADR-0013` agrega la dimensión de navegación **SEG — Seguimiento regulatorio de marcos tarifarios** para los indicadores de adopción, ISE, incentivos, régimen especial, no regresividad y tarifa. Los indicadores de nivel de servicio usan las dimensiones de ontología que ya existen: CAL, CON, COB, PER, EFI y CLI.

## Catálogo

| Código | Indicador | Dim. | Capa | Aplica a | Viabilidad | Ficha | Bloqueo | Prototipo |
|---|---|---|---|---|---|---|---|---|
| NMTPP-ADO-01 | Estudio de costos recibido por la CRA | SEG | Adopción | S1, S2 | Alta | COMPLETA | Q-11 (variante "a tiempo") | sí |
| NMTPP-ADO-02 | Concordancia del subsegmento declarado con el calculado | SEG | Adopción | S1, S2 | Alta | PARCIAL | Q-03 | sí |
| NMTPP-ADO-03 | APS de acueducto definida y reportada | SEG | Adopción | S1, S2 | Media | COMPLETA | Q-10 | sí |
| NMTPP-ADO-04 | Recálculo anual oportuno | SEG | Adopción | S1, S2 | Alta | COMPLETA | Q-11 | sí |
| NMTPP-ADO-05 | Gestores comunitarios que optan por el S1 | SEG | Adopción | S2 | Alta | COMPLETA | — | sí |
| NMTPP-S1-CAL | IRCA frente al estándar (S1) | CAL | Servicio | S1 | Media, condicionada | PARCIAL | Q-06 | sí (estado "sin fuente") |
| NMTPP-S1-MIC | Micromedición efectiva (S1) | EFI | Servicio | S1 | Alta | COMPLETA | Q-08 (intermedias) | sí |
| NMTPP-S1-CON | Continuidad: cierre de brecha (S1) | CON | Servicio | S1 | Baja hoy | PARCIAL | Q-01, Q-02, Q-08 | sí (meta suspendida) |
| NMTPP-S1-MAC | Macromedición efectiva (S1) | EFI | Servicio | S1 | Media-Baja | COMPLETA | — | sí |
| NMTPP-S1-COB | Cobertura frente a meta declarada (S1) | COB | Servicio | S1 | Baja-Media | COMPLETA | Q-09 | sí |
| NMTPP-S1-PER | IPUF frente a IPUF* y senda declarada (S1) | PER | Servicio | S1 | Media | PARCIAL | Q-07, Q-09 | sí |
| NMTPP-S1-PSH | Plan de Sostenibilidad Hídrica (S1-1) | CLI | Servicio | S1-1 | Media | COMPLETA | Q-10 | sí |
| NMTPP-S2-CAL | IRCA frente al estándar (GC) | CAL | Servicio | S2 | Media, condicionada | PARCIAL | Q-06 | sí (estado "sin fuente") |
| NMTPP-S2-MIC | Micromedición residencial (GC) | EFI | Servicio | S2 | Media-Alta | COMPLETA | Q-08 (intermedias) | sí |
| NMTPP-S2-CON | Continuidad: cierre de brecha (GC) | CON | Servicio | S2 | Media-Baja | COMPLETA | Q-02, Q-08 | sí |
| NMTPP-S2-MAC | Macromedición de dos puntos (GC) | EFI | Servicio | S2 | Media | COMPLETA | — | sí |
| NMTPP-ESP-01 | APS con condición especial estructural | SEG | Régimen especial | S1, S2 | Alta | COMPLETA | — | sí |
| NMTPP-EDR-01 | Micromedición en esquema diferencial rural | EFI | Régimen especial | EDR | Media-Baja | COMPLETA | Q-09 | no |
| NMTPP-EDR-02 | Continuidad en esquema diferencial rural | CON | Régimen especial | EDR | Media-Baja | COMPLETA | Q-09 | no |
| NMTPP-NRG-01 | Regresión frente a la línea base | SEG | Transversal | S1, S2 | Media | COMPLETA | Q-02 (continuidad) | sí (vista interna) |
| NMTPP-ISE-01 | ISE publicado por la CRA | SEG | Eficiencia | S1 | Alta (publicación) | PARCIAL | Q-04, Q-13 | sí |
| NMTPP-ISE-02 | Oportunidad de la publicación del ISE | SEG | Eficiencia | CRA | Alta | COMPLETA | — | sí |
| NMTPP-INC-01 | Incentivos reconocidos por tipo | SEG | Eficiencia | S1 | Alta desde 2029 | COMPLETA | Q-08 | sí |
| NMTPP-INC-02 | 100 % de reportes obligatorios al SUI | SEG | Eficiencia | S1 | Media | PARCIAL | Q-12 | sí (estado "sin fuente") |
| NMTPP-TAR-01 | Tarifa aplicada por estrato y uso frente a la Res. 825 | SEG | Tarifa | S1, S2 | Media | COMPLETA | Q-09 | sí |

En la columna Bloqueo, "Q-NN" abrevia Q-NMTPP-NN (ver `specs/aclaraciones-regulatorias-nmtpp.md`).

**Resumen:** 25 indicadores, 18 fichas completas y 7 parciales; 23 en el prototipo. Por capa: 5 de adopción, 11 de nivel de servicio, 3 de régimen especial, 1 transversal, 4 de eficiencia e incentivos y 1 de tarifa.

## Candidatos sin ficha (viabilidad baja)

La norma no les asigna un canal de reporte o no tienen meta. Se atienden con solicitud dirigida (RF-NMTPP-19) y contenido editorial, no como indicador censal.

| Código reservado | Candidato | Norma | Motivo |
|---|---|---|---|
| NMTPP-ADO-06 | Aplicación de un valor menor al costo de referencia | art. 2.1.1.1.8.3 | Solo se informa a la SSPD; sin canal hacia la CRA |
| NMTPP-PIL-01 | Calidad en el punto de entrega de pila pública (ICPP) | art. 2.1.1.1.5.1 | El reporte recae en varios responsables "según corresponda" (par. 9) |
| NMTPP-PIL-02 | Continuidad operativa programada de pila pública (COPP) | art. 2.1.1.1.5.1 | Ídem |
| NMTPP-PIL-03 | Control volumétrico colectivo de pila pública (ICVP) | art. 2.1.1.1.5.1 | Ídem |
| NMTPP-S2-ISGP | Indicador simplificado de gestión de pérdidas | art. 2.1.1.1.3.2.3.1 | Solo con medición suficiente; sin meta; no genera incentivos |
| NMTPP-INC-03 | Uso de la tasa de incentivo del CMI | art. 2.1.1.1.2.2.6.4 | Solo consta en el estudio de costos; sin formato |
| NMTPP-GES-01 | Autodiagnóstico aplicado (S1 obligatorio) | Anexo 6.2.1.5 | Solo "conservar soportes"; sin reporte |
| NMTPP-GES-02 | Plan de Gestión del gestor comunitario | art. 2.1.1.1.3.1.4 | Remite al Decreto 1077/960; sin reporte a la CRA |
| NMTPP-GES-03 | Metas incluidas en el contrato de condiciones uniformes | arts. 2.1.1.1.2.1.1, 2.1.1.1.3.1.1 | Sin reporte |

Los códigos reservados no se reutilizan (RN-ONTO-02).

## Secuencia de construcción

1. Adopción: ADO-01, ADO-02, ADO-04 y ESP-01. Se prueban con el registro maestro y los estudios de 2027.
2. Micromedición y macromedición de S1 y S2: primeras metas exigibles con datos de 2027.
3. ISE-01, ISE-02 e INC-01 con la primera publicación de la CRA (a más tardar 2028-08-31).
4. Continuidad, IPUF e IRCA a medida que se cierren Q-NMTPP-01/02/06/07.

## Preguntas abiertas

Todas las de este catálogo están en `specs/aclaraciones-regulatorias-nmtpp.md`. Hereda Q-ONTO-06 (umbral de cobertura de reporte) y Q-CAT-01 (canal del IRCA).

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión inicial: 25 indicadores y 9 candidatos reservados | Diagnóstico de viabilidad 2026-09-18 |
