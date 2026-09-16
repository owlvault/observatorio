---
id: poc-01-ianc
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-13
fuentes: [decisión de sesión 2026-09-13, adr/ADR-0006, specs/ingesta-sui-y-fuentes.md]
---

# PoC-01 — Prueba de concepto de ingesta sobre IANC

## Objetivo

**No es construir: es medir y descubrir.** Al terminar, la CRA debe saber tres cosas que hoy no sabe y que condicionan toda la arquitectura:

1. El **volumen real** de datos por periodo y el tiempo de extracción, para recalibrar `RNF-SUI-01` y dimensionar almacenamiento (`Q-ARQ-03`).
2. Si la base del SUI **conserva o sobrescribe** los reportes retransmitidos. De esto depende la ventana de re-extracción de `ADR-0006` punto 4, y es el hallazgo más importante de toda la prueba.
3. El **mapeo real** entre las variables del diccionario del SUI y las tablas o vistas físicas de Oracle.

Un objetivo secundario: verificar que las reglas de calidad de `specs/calidad-de-datos.md` atrapan lo que deben atrapar sobre datos reales.

## Por qué IANC

Es el indicador piloto porque concentra los problemas que romperán el pipeline más adelante: es un cociente entre dos variables de volumen que se reportan por separado, sus valores implausibles son frecuentes en el sector, tiene rango teórico acotado que hace evidente el fallo, y es el insumo clásico del benchmarking. Si el pipeline funciona con IANC, funciona con casi todo lo demás.

Además es el mismo indicador del MVP vertical, de modo que la PoC no es trabajo desechable.

## Conjunto de datos solicitado

Alcance: **acueducto, segmento grande, 24 periodos mensuales consecutivos**, universo nacional. Veinticuatro periodos porque es el mínimo para que las reglas de anomalía histórica de `RF-CAL-05` tengan algo contra qué comparar.

### Entidades y variables

| Bloque | Variables mínimas | Uso |
|---|---|---|
| Catálogo de prestadores | identificador SUI, NIT, nombre, naturaleza jurídica, estado (activo/inactivo), servicios que presta | Llave canónica `provider_id`; base de `RF-SUI-07` |
| Áreas de prestación | identificador de APS, prestador, municipios cubiertos (código DIVIPOLA), zona urbana o rural | Llave territorial; desagregación de `RF-ONTO-05` |
| Volumen de agua | volumen producido o suministrado al sistema, por prestador, APS y periodo, en m3 | Numerador de IANC |
| Volumen facturado | volumen facturado a suscriptores, por prestador, APS y periodo, en m3 | Denominador de IANC |
| Suscriptores | suscriptores facturados por periodo, por clase de uso y estrato | Denominador de IPUF; desagregaciones |
| Metadatos de reporte | fecha de cargue, fecha de última modificación del registro, estado de certificación del reporte | **Crítico**: es lo que revela si hay retransmisión y si el origen sobrescribe |

El último bloque es el que suele olvidarse y es el que responde la pregunta 2 del objetivo. Si la base no expone fecha de modificación por registro, eso en sí mismo es un hallazgo que obliga a re-extraer ventanas completas.

### Fuentes complementarias

DIVIPOLA vigente del DANE, para resolver la llave territorial. No se requiere proyección de población en esta PoC: IANC no la usa.

## Actividades

1. **Exploración del diccionario y del esquema** (sobre ambiente de consulta, con las consultas acotadas de `ADR-0006` punto 5). Producir el mapeo variable del diccionario → tabla o vista física. Este mapeo es entregable, no borrador de trabajo.
2. **Extracción de los seis bloques** para los 24 periodos, materializando snapshot inmutable en la zona cruda de la CRA.
3. **Segunda extracción del mismo rango, días después**, y comparación de checksums contra el primer snapshot. Es el experimento que responde si el origen muta filas en sitio.
4. **Conformación** con llaves canónicas y aplicación de las reglas de calidad.
5. **Cálculo de IANC** por prestador, APS y periodo, con semáforo.

## Mediciones a capturar

| Medición | Para qué |
|---|---|
| Filas y bytes por bloque y por periodo | Dimensionar almacenamiento y recalibrar `RNF-SUI-01` |
| Tiempo de extracción por consulta | Diseñar la ventana de ingesta y la disciplina de carga |
| Porcentaje de registros que no resuelven llave de prestador o territorio | Calibrar el esfuerzo de conformación |
| Porcentaje de registros que caen en cuarentena, por regla | Detectar reglas mal calibradas antes de publicar (`RF-CAL` caso borde del 20%) |
| Número de registros con diferencia entre las dos extracciones | **Responde si el SUI sobrescribe** |
| Cobertura de reporte: prestadores con dato completo sobre el universo | Anticipar cuán agujereada saldrá la serie pública |

## Criterios de salida

La PoC se considera exitosa si, al cierre, existe: el mapeo diccionario-a-esquema documentado, dos snapshots comparados con conclusión escrita sobre la mutabilidad del origen, la serie de IANC calculada para al menos 24 periodos con su semáforo, y las seis mediciones anteriores registradas.

**No** es criterio de éxito que la serie salga limpia. Una serie con 30% en cuarentena es un resultado válido y valioso: informa la realidad del reporte sectorial.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Una consulta mal dimensionada degrada el SUI productivo | Ventana horaria de baja demanda, filtros por periodo, límite de concurrencia, pruebas sobre un periodo antes de los 24 |
| El esquema físico no corresponde al diccionario publicado | Es un hallazgo esperado, no un fallo; documentarlo es parte del entregable |
| La base no expone fecha de modificación por registro | Obliga a re-extracción de ventana completa; encarece la ingesta y debe quedar en el informe |
| Datos personales de suscriptores en alguna tabla | Aplicar `RN-SUI-04`: no salen de la zona cruda sin seudonimizar |

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-POC-01 | ¿Qué umbral de suscriptores define el segmento grande para acotar el universo? | Alcance de la extracción | Subdirección de Regulación (ver `Q-GLO-01`) |
| Q-POC-02 | ¿El usuario de consulta tiene visibilidad sobre las tablas de metadatos de reporte, o solo sobre las de datos? | Actividad 1 y objetivo 2 | CIO |
| Q-POC-03 | ¿Dónde se materializa el snapshot mientras no esté decidido el stack? | Actividad 2 | CIO |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial | Sesión con Camilo Carvajalino; aprobación del paso 6 |
