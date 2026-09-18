---
id: ficha-NMTPP-S1-PSH
tipo: ficha-indicador
proyecto: observatorio-regulatorio-cra
version: 1
estado: borrador
completitud: COMPLETA
marco_tarifario: CRA-1038-2026
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026, Documento Técnico NMTPPAA jun-2026, specs/seguimiento-nmt-pequenos-prestadores.md]
---

# NMTPP-S1-PSH — Plan de Sostenibilidad Hídrica elaborado e implementado — subsegmento S1-1

> Viabilidad (diagnóstico 2026-09-18): **Media** · En el prototipo: **sí** · Dependencias abiertas: Q-NMTPP-10 (soporte de reporte)

1. **Código:** NMTPP-S1-PSH
2. **Nombre:** Plan de Sostenibilidad Hídrica elaborado e implementado — subsegmento S1-1
3. **Dimensión:** CLI
4. **Definición:** Indica si el prestador del subsegmento S1-1 elaboró e implementa su Plan de Sostenibilidad Hídrica, exigible en el año 2 de aplicación. Para los subsegmentos S1-2 a S1-4 no es exigible.
5. **Fórmula:** `PSH_i = 100 % si elabora e implementa el PSH; 0 % si no`
6. **Variables:**

| Símbolo | Descripción | Fuente | Formulario o tabla de origen | Unidad |
|---|---|---|---|---|
| `PSH` | Existencia e implementación del plan con los componentes del Anexo 6.2.1.12 | Estudio de costos / SUI | por mapear | binario |

7. **Unidad de medida:** binario (sí / no); agregado en porcentaje con un decimal
8. **Periodicidad:** Anual
9. **Desagregaciones soportadas:** Soportadas: segmento, subsegmento, departamento, municipio (`divipola_code`) del domicilio del prestador, año tarifario. **No soportadas:** APS (la unidad es el prestador).
10. **Sustento normativo:** Res. CRA 1038 de 2026, art. 2.1.1.1.2.1.2 (meta S1-1 año 2), art. 2.1.1.1.2.1.1 parágrafo 7; Anexo 6.2.1.10 literal a) y Anexo 6.2.1.12.
11. **Umbrales y rangos:** Meta 100 % en S1-1 al año 2 (2028). S1-2 a S1-4: 'no aplica' (deben soportar costos ambientales realizados).
12. **Limitaciones de interpretación:** Mide existencia declarada, no calidad del plan ni resultados ambientales.
13. **Responsable técnico:** ACT-ANALISTA-CRA (Subdirección Técnica de Regulación) define y mantiene la fórmula; ACT-CURADOR-DATOS aprueba la publicación (RN-ONTO-04).
14. **Regla de agregación territorial:** Cociente de sumas (prestadores con PSH / prestadores de S1-1). Leyenda obligatoria en vista pública (RN-NMTPP-05): "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD". Umbral de cobertura de reporte para publicar el agregado: el que fije `Q-ONTO-06` (propuesto 80 % de suscriptores facturados).

## Preguntas abiertas

| ID | Bloquea | Detalle |
|---|---|---|
| Q-NMTPP-10 | Parte del cálculo | `specs/aclaraciones-regulatorias-nmtpp.md` → Q-NMTPP-10 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión 1 | Diagnóstico de viabilidad 2026-09-18; Res. CRA 1038 de 2026 |
