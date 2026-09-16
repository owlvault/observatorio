---
id: adr-0006
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-13
fuentes: [confirmación de Camilo Carvajalino 2026-09-13: acceso vigente al SUI por VPN con usuario de consulta Oracle]
---

# ADR-0006 — La ingesta del SUI se hace por consulta directa a la base Oracle vía VPN, no por API ni descarga

## Contexto

`Q-SUI-02` y `Q-GOB-02` preguntaban cómo se accede al SUI. La respuesta es que **el acceso ya existe**: la CRA cuenta con conexión VPN y un usuario de consulta sobre la herramienta Oracle del SUI, con el que se ejecutan consultas SQL.

Esto cambia el modelo de ingesta diseñado en `specs/ingesta-sui-y-fuentes.md`, que asumía descarga de archivos. Tres supuestos dejan de ser válidos y uno nuevo aparece, este último con riesgo alto.

**El supuesto que cae:** no hay archivo descargado, luego no hay `file_hash` que anclar el linaje ni que comparar para detectar idempotencia y retransmisiones (RF-SUI-02, RF-SUI-03, RF-SUI-04 tal como están escritos).

**El riesgo nuevo:** una base de datos consultada en vivo **puede actualizar filas en sitio**. Si un prestador retransmite y el SUI sobrescribe el registro anterior, esa retransmisión es invisible para quien solo consulta: el dato de ayer simplemente ya no existe. Sin un mecanismo propio de retención, el Observatorio perdería la capacidad de reconstruir qué mostraba en una fecha pasada, que es justamente `RNF-PORTAL-03` y la razón de existir de la zona cruda.

**El segundo riesgo:** se consulta una base de la que la CRA no es dueña. Una consulta mal dimensionada degrada un sistema productivo de otra entidad, y eso cuesta el acceso.

## Decisión

La ingesta se hace por **consulta SQL programada contra la base Oracle del SUI a través de la VPN**, con estas reglas:

1. **Snapshot propio e inmutable.** Cada extracción se materializa completa en la zona cruda de la CRA. El Observatorio **NO DEBE** consultar el SUI en línea para servir el portal ni para calcular indicadores: siempre trabaja sobre su propio snapshot.
2. **Linaje sin archivo.** El ancla de linaje pasa a ser: consulta SQL ejecutada (texto literal), su hash, marca de tiempo de extracción en UTC, periodo de reporte, conteo de filas y checksum del conjunto de resultados. Sustituye a `file_hash` donde este aparece.
3. **Detección de cambios por comparación de snapshots.** Una retransmisión se detecta comparando el checksum del conjunto extraído contra el del snapshot anterior del mismo periodo y llave. Si difiere, aplica `RF-SUI-04` como está.
4. **Re-extracción de periodos ya cerrados.** Cada ciclo re-extrae no solo el periodo corriente sino una ventana de periodos anteriores, para capturar retransmisiones. La longitud de esa ventana depende de la ventana de retransmisión que permita la SSPD (`Q-SUI-03`, sigue abierta).
5. **Disciplina de carga sobre el origen.** Las consultas se ejecutan en ventana horaria de baja demanda, con límite de concurrencia, filtradas por periodo, y sin operaciones que fuercen recorridos completos innecesarios. El Observatorio **NO DEBE** ejecutar consultas exploratorias no acotadas contra el SUI productivo.
6. **Solo lectura, y nunca escritura.** El usuario de consulta no escribe en el SUI bajo ninguna circunstancia.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Consultar el SUI en vivo para cada cálculo | Dato siempre fresco; sin almacenamiento propio | Sin historia reconstruible; portal acoplado a una base ajena; carga permanente sobre sistema de terceros | Rompe `RNF-PORTAL-03` y `RNF-SUI-03` |
| Esperar a que la SSPD exponga una API | Contrato estable e independiente del esquema físico | No existe hoy y su plazo no depende de la CRA | Bloquearía el proyecto por tiempo indefinido |
| Solicitar réplica de base a la SSPD | Sin carga sobre el productivo | Requiere trámite y capacidad de la SSPD | Se mantiene como evolución deseable, no como prerrequisito |
| Consulta programada con snapshot propio (elegida) | Usa el acceso ya disponible; conserva historia; carga controlada | Depende del esquema físico del SUI, que puede cambiar sin aviso | — |

## Consecuencias

**Positivas:** `Q-GOB-02` y `Q-SUI-02` quedan cerradas y la prueba de concepto puede empezar esta semana sin trámite institucional previo.

**Negativas:** el Observatorio queda acoplado al **esquema físico** del SUI, no a un contrato de interfaz. Un cambio de tabla o de columna en el origen rompe la ingesta sin previo aviso, lo que hace de `RF-SUI-06` (detección de cambio de estructura) un requisito crítico y no uno defensivo.

**Deuda que introduce:** el mapeo entre variables del diccionario del SUI y tablas o vistas físicas de Oracle debe documentarse y versionarse como artefacto propio. Sin él, el conocimiento queda en la cabeza de quien escribió la consulta.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `specs/ingesta-sui-y-fuentes.md` | RF-SUI-01 pasa de descarga a consulta programada; RF-SUI-02 sustituye `file_hash` por el ancla de linaje del punto 2; RF-SUI-03 y RF-SUI-04 comparan checksum de conjunto de resultados; RF-SUI-06 se marca como crítico; se agregan RNF-SUI-04 (disciplina de carga) y RF-SUI-09 (ventana de re-extracción); `Q-SUI-02` cerrada |
| `docs/architecture.md` | La integración con el SUI pasa a "consulta SQL sobre Oracle vía VPN, solo lectura"; se agrega el mapeo diccionario-a-esquema como componente; `Q-ARQ-03` gana urgencia porque el volumen de snapshots depende de la ventana de re-extracción |
| `AGENTS.md` | La tabla de stack registra el acceso al SUI como decidido |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Decisión registrada | Confirmación de acceso vigente por VPN y usuario de consulta Oracle |
