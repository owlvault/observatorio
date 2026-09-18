---
id: spec-ingesta-sui-y-fuentes
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-18
fuentes: [README_Context_Lake matriz de fuentes (Drive), Plan_de_Investigacion Fase I (Drive), adr/ADR-0002, adr/ADR-0006, adr/ADR-0008, adr/ADR-0014, Res. CRA 1038 de 2026]
---

# Spec — Ingesta de fuentes oficiales

## Propósito

Define cómo el Observatorio obtiene, registra y versiona los datos de fuentes oficiales externas hasta dejarlos conformados y listos para calcular indicadores. **No cubre** el cálculo de indicadores (`specs/ontologia-indicadores.md`), las reglas de validación de contenido (`specs/calidad-de-datos.md`) ni la publicación (`specs/portal-publico.md`).

## Contexto relevante

- Flujo de negocio: `docs/business_context.md` → FL-01
- Contrato de zonas y modelo de datos: `docs/architecture.md`
- Decisiones que aplican: `adr/ADR-0002-sui-fuente-autoritativa.md`, `adr/ADR-0006-acceso-sui-consulta-directa.md`, `adr/ADR-0008-ingesta-asistida-por-operador.md`, `adr/ADR-0014-estudios-de-costos-fuente-complementaria.md`
- Términos: `docs/glosario.md` → Linaje, Formulario SUI, Periodo de reporte, Cuarentena, Estudio de costos

## Requisitos funcionales

### RF-SUI-01 — Ingesta programada por fuente

CUANDO se cumple la ventana de ingesta configurada para una fuente, el sistema DEBE descargar los formularios registrados para esa fuente y escribirlos en la zona cruda sin aplicar ninguna transformación.

```gherkin
Escenario: Ingesta mensual exitosa del SUI
  Dado que la fuente "SUI" tiene 6 formularios registrados con ventana mensual
  Y que el periodo de reporte 2026-08 está disponible en la fuente
  Cuando se ejecuta la ingesta programada
  Entonces el sistema crea 6 registros raw_record con period_id "2026-08"
  Y cada registro tiene source, form_id, download_ts y file_hash no nulos
  Y el contenido almacenado es byte a byte idéntico al descargado

Escenario: Periodo aún no disponible en la fuente
  Dado que el periodo de reporte 2026-08 no está publicado en la fuente
  Cuando se ejecuta la ingesta programada
  Entonces el sistema NO crea ningún raw_record
  Y registra el evento "periodo_no_disponible" con la fuente y el periodo
  Y reprograma el intento según RF-SUI-05
```

**Prioridad:** debe
**Depende de:** Q-GOB-02 (acuerdo de acceso con la SSPD)
**Origen:** matriz de fuentes del README; FL-01 paso 1

### RF-SUI-02 — Registro de linaje obligatorio

El sistema DEBE registrar, para todo dato que entre a la zona cruda, su fuente, formulario, periodo de reporte, fecha y hora de descarga en UTC, y hash del archivo original.

```gherkin
Escenario: Linaje completo
  Dado un archivo descargado de la fuente "DANE"
  Cuando el sistema lo escribe en la zona cruda
  Entonces el raw_record tiene source, form_id, period_id, download_ts y file_hash
  Y ningún indicador puede referenciar ese dato si falta alguno de los cinco campos
```

**Prioridad:** debe
**Origen:** `docs/architecture.md` → reglas del modelo

### RF-SUI-03 — Idempotencia de la ingesta

CUANDO el sistema descarga un archivo cuyo `file_hash` ya existe para la misma fuente, formulario y periodo de reporte, ENTONCES el sistema NO DEBE crear un registro nuevo y DEBE registrar el evento `ingesta_sin_cambios`.

```gherkin
Escenario: Reejecución sin cambios en la fuente
  Dado un raw_record existente con hash "a1b2c3" para SUI/F-100/2026-08
  Cuando se ejecuta de nuevo la ingesta y el archivo descargado tiene hash "a1b2c3"
  Entonces el sistema no crea un raw_record nuevo
  Y registra "ingesta_sin_cambios" con la referencia al registro existente
```

**Prioridad:** debe
**Origen:** regla de append-only de la zona cruda

### RF-SUI-04 — Retransmisión del prestador

CUANDO el sistema detecta que un prestador retransmitió datos de un periodo ya ingerido (hash distinto para la misma llave), ENTONCES el sistema DEBE crear un `raw_record` nuevo, marcar el anterior como `superseded`, y DEBE marcar como pendientes de recálculo todos los `indicator_value` que dependían del registro anterior.

```gherkin
Escenario: Retransmisión de un periodo cerrado
  Dado un raw_record vigente para SUI/F-100/2026-08 con hash "a1b2c3"
  Y 12 indicator_value publicados que dependen de él
  Cuando la ingesta descarga el mismo formulario con hash "d4e5f6"
  Entonces el sistema crea un raw_record nuevo con hash "d4e5f6"
  Y marca el raw_record anterior como "superseded" sin borrarlo
  Y marca los 12 indicator_value con estado "pendiente_recalculo"
  Y NO altera los valores publicados hasta que ACT-CURADOR-DATOS apruebe el recálculo
```

**Prioridad:** debe
**Depende de:** RF-SUI-02
**Origen:** práctica de retransmisión al SUI

### RF-SUI-05 — Fuente no disponible

SI una fuente no responde o responde con error, ENTONCES el sistema DEBE reintentar máximo 3 veces con espera exponencial, y si agota los reintentos DEBE notificar a ACT-CURADOR-DATOS y dejar el periodo en estado `ingesta_fallida`.

```gherkin
Escenario: Fuente caída
  Dado que la fuente "SIRH" responde con error en los 3 intentos
  Cuando se agota el último reintento
  Entonces el periodo queda en estado "ingesta_fallida"
  Y el sistema notifica a ACT-CURADOR-DATOS con fuente, periodo y último error
  Y NO publica ningún valor parcial de ese periodo
```

**Prioridad:** debe
**Origen:** FL-01 → qué pasa si falla

> **ASUNCIÓN (sin validar):** 3 reintentos con espera exponencial. Origen: práctica estándar, no acordado. Confirmar con el CIO.

### RF-SUI-06 — Cambio de estructura en la fuente

SI la estructura de un formulario cambia respecto a la última ingesta exitosa (columnas añadidas, eliminadas o renombradas), ENTONCES el sistema DEBE detener la conformación de ese formulario, conservar el archivo crudo, y notificar a ACT-CURADOR-DATOS con el detalle del cambio.

```gherkin
Escenario: El SUI agrega una columna al formulario
  Dado un formulario cuya última ingesta tenía 24 columnas
  Cuando se descarga una versión con 25 columnas
  Entonces el sistema almacena el archivo crudo
  Y NO ejecuta la conformación de ese formulario
  Y notifica el diff de columnas a ACT-CURADOR-DATOS
  Y deja el periodo en estado "estructura_cambiada"
```

**Prioridad:** debe
**Origen:** riesgo identificado en Fase I del Plan de Investigación

### RF-SUI-07 — Llaves canónicas al conformar

CUANDO el sistema conforma un registro crudo, DEBE resolver el prestador contra `provider_id` del SUI y el territorio contra `divipola_code` del DANE. SI no logra resolver alguna de las dos llaves, ENTONCES DEBE enviar el registro a cuarentena y NO DEBE crear un prestador ni un municipio nuevo por inferencia.

```gherkin
Escenario: Municipio no resoluble
  Dado un registro con el campo municipio en texto libre "San José del Palmar (Chocó)"
  Y que ese texto no corresponde exactamente a un divipola_code vigente
  Cuando el sistema conforma el registro
  Entonces envía el registro a cuarentena con motivo "llave_territorial_no_resuelta"
  Y NO crea un municipio nuevo
  Y el registro queda disponible para resolución manual
```

**Prioridad:** debe
**Origen:** regla 1 del modelo de datos en `docs/architecture.md`

### RF-SUI-08 — Fuentes de periodicidad distinta

DONDE una fuente tenga periodicidad mayor que la del SUI (anual, censal o eventual), el sistema DEBE usar la última versión vigente para el periodo consultado y DEBE exponer la fecha de corte de esa versión junto a todo indicador que la utilice.

```gherkin
Escenario: Indicador mensual con denominador poblacional anual
  Dado un indicador de cobertura para el periodo 2026-08
  Y que la proyección de población vigente del DANE tiene corte 2026-01-01
  Cuando el sistema calcula el indicador
  Entonces el valor se calcula con la proyección de corte 2026-01-01
  Y el portal muestra la fecha de corte del denominador junto al valor
```

**Prioridad:** debe
**Origen:** matriz de fuentes del README (periodicidades heterogéneas)

### RF-SUI-09 — Ventana de re-extracción periódica

El sistema DEBE re-extraer periódicamente los periodos históricos dentro de la ventana de retransmisión autorizada por la SSPD (`Q-SUI-03`), para capturar actualizaciones o rectificaciones reportadas formalmente por los prestadores.

```gherkin
Escenario: Ventana de retransmisión abierta
  Dado un periodo cerrado hace 3 meses dentro de la ventana permitida
  Cuando se ejecuta el ciclo mensual de re-extracción
  Entonces el sistema consulta las tablas del SUI para ese periodo
  Y procesa cualquier variación según RF-SUI-04
```

**Prioridad:** debe
**Depende de:** `Q-SUI-03`
**Origen:** disciplina de actualización y linaje histórico (`adr/ADR-0006`, `AGENTS.md`)

### RF-SUI-10 — Extracción segmentable y reanudable por operador

DADO que la conexión VPN al SUI es site-to-person (`adr/ADR-0008`), los procesos de extracción DEBEN ejecutarse en paquetes segmentables y reanudables dentro de las franjas de operación autorizadas (máximo 4 horas continuas en días hábiles).

```gherkin
Escenario: Interrupción de la sesión de extracción
  Dado un paquete de extracción del SUI en curso que alcanza el límite de 4 horas
  Cuando el operador finaliza la sesión VPN
  Entonces el sistema registra el punto de control alcanzado (última tabla/prestador)
  Y permite reanudar la extracción al siguiente día hábil sin duplicar registros crudos
```

**Prioridad:** debe
**Origen:** `adr/ADR-0008`

### RF-SUI-11 — Fuente complementaria: Radicado CRA de Estudios de Costos (Res. 1038)

El sistema DEBE admitir como fuente complementaria oficial del componente NMTPP los documentos de estudios de costos remitidos formalmente a la CRA en cumplimiento de la Res. CRA 1038 de 2026. La captura se realiza exclusivamente por `ACT-CURADOR-DATOS` con registro de radicado, fecha, prestador, subsegmento declarado, línea base y metas proyectadas. El prestador NO tiene canal de cargue directo en el Observatorio.

```gherkin
Escenario: Captura de estudio de costos recibido
  Dado un estudio de costos recibido por la CRA con número de radicado oficial
  Cuando ACT-CURADOR-DATOS registra los metadatos y parámetros del estudio
  Entonces el sistema genera un registro en la zona cruda con source="radicado_cra_ec"
  Y asocia el file_hash y número de radicado como identificador de linaje
  Y rotula todo valor derivado como "declarado por el prestador en su estudio de costos"
```

**Prioridad:** debe
**Origen:** `adr/ADR-0014`, `specs/seguimiento-nmt-pequenos-prestadores.md` (RF-NMTPP-04, RN-NMTPP-08)

## Requisitos no funcionales

### RNF-SUI-01 — Ventana de ingesta

La ingesta completa de un periodo mensual del SUI DEBE finalizar en menos de 6 horas desde su inicio, para el universo completo de prestadores registrados.

> **ASUNCIÓN (sin validar):** 6 horas. Origen: estimación sin volumetría real medida. Recalibrar una vez conocido el tamaño real de los formularios.

### RNF-SUI-02 — Retención de la zona cruda

El sistema DEBE conservar todo `raw_record`, incluidos los `superseded`, por un mínimo de 10 años. Razón: los marcos tarifarios operan en ciclos de cinco años y una revisión ex-post necesita reconstruir el dato tal como estaba al momento de la decisión.

> **ASUNCIÓN (sin validar):** 10 años. Ver `Q-ARQ-03`.

### RNF-SUI-03 — Reproducibilidad

Dado un `(indicator_code, version, period_id)`, el sistema DEBE poder identificar el conjunto exacto de `raw_record` que produjo cada valor publicado.

## Reglas de negocio

| ID | Regla | Aplica a |
|---|---|---|
| RN-SUI-01 | La zona cruda es append-only. Ningún proceso DEBE actualizar ni borrar un `raw_record`. | RF-SUI-03, RF-SUI-04 |
| RN-SUI-02 | El Observatorio NO DEBE corregir un valor reportado por un prestador, ni siquiera ante error evidente. Lo marca y lo remite al SUI. | RF-SUI-07, `adr/ADR-0002` |
| RN-SUI-03 | Un periodo NO DEBE publicarse parcialmente. O se cierra completo, o se declara qué falta. | RF-SUI-05 |
| RN-SUI-04 | Los datos personales que lleguen en cualquier fuente DEBEN eliminarse o seudonimizarse antes de salir de la zona cruda. | Todas |

## Casos borde y errores

| Situación | Comportamiento esperado |
|---|---|
| Dos prestadores con el mismo NIT en periodos distintos (fusión o escisión) | Conservar ambos `provider_id`; registrar la relación de sucesión. NO fusionar series automáticamente |
| Prestador que deja de reportar | El indicador no se calcula para ese periodo; el portal muestra "sin reporte", nunca cero |
| Municipio creado o suprimido durante la serie | Usar el `divipola_code` vigente en cada periodo; declarar el cambio en la nota de la serie |
| Archivo descargado vacío pero con respuesta exitosa | Tratar como fuente no disponible (RF-SUI-05), no como periodo sin datos |
| Zona horaria de la fuente distinta de UTC | Normalizar a UTC al registrar `download_ts`; no tocar el `period_id` |
| Un mismo prestador reporta el mismo periodo en dos formularios con cifras distintas | Cuarentena por inconsistencia; no elegir una por criterio automático |

## Fuera de alcance de esta spec

- Cálculo de indicadores y sus fórmulas.
- Reglas de validación de contenido (rangos, coherencia entre variables).
- Recepción de cargues directos de prestadores: no existe, por no-objetivo de `docs/business_context.md`.

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-SUI-01 | ¿Qué formularios específicos del SUI se ingieren en V1 y con qué periodicidad cada uno? | RF-SUI-01 | Subdirección de Regulación |
| Q-SUI-02 | ¿El acceso al SUI es vía API, descarga masiva o acuerdo de réplica de base? | RF-SUI-01, `docs/architecture.md` | CIO / SSPD |
| Q-SUI-03 | ¿Cuál es la ventana de retransmisión permitida por la SSPD? Determina cuándo un periodo puede darse por estable | RF-SUI-04 | SSPD |
| Q-SUI-04 | ¿Los prestadores rurales vía SIASAR entran en V1? | Alcance | Comisionados (ver Q-NEG-03) |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial | Sesión de generación |
