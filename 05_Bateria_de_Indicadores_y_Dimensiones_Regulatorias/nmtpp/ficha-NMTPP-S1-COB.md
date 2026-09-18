---
id: ficha-NMTPP-S1-COB
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-S1-COB — Cobertura del servicio de acueducto frente a la meta declarada — primer segmento

> Viabilidad (diagnóstico 2026-09-18): **Baja-Media** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-09 (captura de meta declarada)

1. **Código:** NMTPP-S1-COB
2. **Nombre:** Cobertura del servicio de acueducto frente a la meta declarada — primer segmento
3. **Dimensión:** COB
4. **Definición:** Proporción de viviendas del APS con servicio de acueducto (facturadas, no facturadas o atendidas con esquema diferencial urbano) frente a la meta que el prestador proyectó según su plan de inversiones.
5. **Fórmula:** `IDH1_i = (Sf + Vnf + SEDU) / (Sf + Vnf + SEDU + Vns)`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `Sf` | Suscriptores con servicio facturados en el año i | SUI | por mapear | suscriptores |
| `Vnf` | Viviendas con servicio no facturadas | SUI / prestador | por mapear | viviendas |
| `SEDU` | Suscriptores con acueducto provisional de esquema diferencial urbano | SUI | por mapear | suscriptores |
| `Vns` | Viviendas sin servicio (planeación municipal menos censo del prestador) | Planeación municipal + prestador | por mapear | viviendas |

7. **Unidad de medida:** porcentaje con un decimal
8. **Periodicidad:** Anual
9. **Desagregaciones soportadas:** Soportadas: prestador, APS, municipio (`divipola_code`), departamento, segmento, subsegmento, régimen especial, año tarifario. **No soportadas:** zona urbana/rural dentro de una APS (no se prorratea, RN-ONTO-06); comparación entre subsegmentos (RN-NMTPP-02).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.2.1.2 (estándar 100 %, meta autoproyectada); Anexo 6.2.1.10 literal a) (IDH1).
11. **Umbrales y rangos:** Rango [0, 100]. Estándar 100 %. Meta: la declarada por el prestador para cada año (RN-NMTPP-08).
12. **Limitaciones de interpretación:** La definición es por viviendas del APS; no es comparable con coberturas por población (Q-GLO-02). Vns depende del dato de planeación municipal. Sin meta declarada el estado es 'meta no declarada'.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Cociente de sumas (numerador y denominador sumados sobre prestadores del territorio). Leyenda obligatoria en vista pública (RN-NMTPP-05): "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD". Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-09 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-09 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
