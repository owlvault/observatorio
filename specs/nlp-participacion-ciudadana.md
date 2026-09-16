---
id: spec-nlp-participacion-ciudadana
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-14
fuentes: [README_Context_Lake seccion 6 (Drive), Plan_de_Investigacion 2.2 y 3.3 (Drive)]
---

# Spec — Análisis de participación ciudadana

## Propósito

Define cómo el Observatorio procesa las observaciones que ciudadanos, prestadores y terceros remiten a los proyectos regulatorios de la CRA: ingesta, anonimización, agrupamiento temático y publicación de la matriz de observaciones y respuestas. **No cubre** PQR de suscriptores ante prestadores, ni la redacción de respuestas oficiales, que es humana.

## Contexto relevante

- Flujo de negocio: `docs/business_context.md` → FL-04
- Términos: `docs/glosario.md` → Observación ciudadana, PQR
- Restricción legal: Ley 1581 de 2012 (datos personales)

## Requisitos funcionales

### RF-NLP-01 — Anonimización antes del procesamiento

CUANDO una observación entra al sistema, el sistema DEBE eliminar o seudonimizar nombres, documentos de identidad, direcciones, teléfonos y correos antes de cualquier procesamiento analítico o de almacenamiento en la zona conformada.

```gherkin
Escenario: Observación con datos personales
  Dado un texto que contiene nombre, cédula y teléfono del remitente
  Cuando el sistema lo ingiere
  Entonces almacena el texto con esos elementos removidos
  Y conserva el vínculo con el radicado original únicamente en el expediente de la CRA
  Y ningún modelo analítico accede al texto sin anonimizar
```

**Prioridad:** debe
**Origen:** Ley 1581 de 2012; regla de oro 7 de `AGENTS.md`

### RF-NLP-02 — Agrupamiento temático

CUANDO se cierra el periodo de participación de un proyecto regulatorio, el sistema DEBE agrupar las observaciones por tema y DEBE presentar cada grupo con su tamaño y con observaciones representativas.

```gherkin
Escenario: Agrupamiento de un lote de observaciones
  Dado 480 observaciones anonimizadas de un proyecto regulatorio
  Cuando el sistema ejecuta el agrupamiento
  Entonces produce grupos temáticos con su conteo
  Y cada grupo incluye al menos 3 observaciones representativas
  Y las observaciones no asignadas quedan en un grupo "sin clasificar" visible
```

**Prioridad:** debe

### RF-NLP-03 — Detección de duplicados y campañas

El sistema DEBE identificar observaciones de texto idéntico o casi idéntico y DEBE reportarlas como envío masivo, sin descartarlas ni reducir su conteo.

```gherkin
Escenario: Campaña de texto idéntico
  Dado 120 observaciones con texto sustancialmente igual
  Cuando el sistema las procesa
  Entonces las marca como un envío masivo de 120 remisiones
  Y las conserva todas en el conteo total
  Y las presenta como un solo argumento con 120 respaldos
```

**Prioridad:** debe

### RF-NLP-04 — Trazabilidad uno a uno

El sistema DEBE mantener la relación entre cada observación individual y la respuesta oficial que la atiende, y DEBE permitir verificar que ninguna observación quedó sin respuesta.

```gherkin
Escenario: Verificación de cobertura de respuestas
  Dado 480 observaciones y 37 respuestas oficiales
  Cuando ACT-ANALISTA-CRA solicita el control de cobertura
  Entonces el sistema lista las observaciones sin respuesta asociada
  Y NO permite cerrar la matriz mientras haya observaciones sin respuesta
```

**Prioridad:** debe
**Origen:** FL-04 resultado esperado

### RF-NLP-05 — La respuesta oficial es humana

El sistema NO DEBE publicar como respuesta oficial ningún texto generado automáticamente. PUEDE proponer borradores a ACT-ANALISTA-CRA, que DEBEN quedar marcados como borrador hasta que un humano los edite y apruebe.

```gherkin
Escenario: Borrador generado automáticamente
  Dado un grupo temático con borrador de respuesta sugerido
  Cuando ACT-ANALISTA-CRA no lo ha aprobado
  Entonces el borrador no es visible al público
  Y la matriz muestra el grupo como "pendiente de respuesta"
```

**Prioridad:** debe
**Origen:** regla de oro sobre ACT-AGENTE-IA en `docs/business_context.md`

### RF-NLP-06 — Umbral de calidad del agrupamiento

SI la calidad del agrupamiento no alcanza el umbral declarado, ENTONCES el sistema DEBE marcar el lote para clasificación manual y NO DEBE publicar los grupos automáticos.

```gherkin
Escenario: Agrupamiento de baja calidad
  Dado un lote donde más del 40% de las observaciones quedan sin clasificar
  Cuando el sistema evalúa la calidad del agrupamiento
  Entonces marca el lote para clasificación manual
  Y NO publica los grupos automáticos
  Y notifica a ACT-ANALISTA-CRA
```

**Prioridad:** debe

> **ASUNCIÓN (sin validar):** Umbral de 40% sin clasificar. Origen: criterio técnico, no acordado. Confirmar.

### RF-NLP-07 — Prohibición de inferir atributos de personas

El sistema NO DEBE inferir ni almacenar atributos de los remitentes (género, edad, ideología, nivel socioeconómico, ubicación precisa) a partir del texto de sus observaciones.

```gherkin
Escenario: Intento de perfilamiento
  Dado un modelo que podría inferir el estrato del remitente por el texto
  Cuando se procesa la observación
  Entonces el sistema no calcula ni almacena ese atributo
  Y la única clasificación permitida es temática y de tipo de remitente declarado
```

**Prioridad:** debe
**Origen:** Ley 1581 de 2012; mitigación de sesgos del Plan

## Requisitos no funcionales

### RNF-NLP-01 — Evaluación del modelo

El agrupamiento DEBE evaluarse contra una muestra etiquetada manualmente antes de cada uso en un proyecto regulatorio, y el resultado DEBE registrarse junto al lote.

### RNF-NLP-02 — Idioma y variantes

El procesamiento DEBE soportar español de Colombia, incluidos textos sin tildes, con errores ortográficos y con lenguaje técnico del sector.

## Reglas de negocio

| ID | Regla | Aplica a |
|---|---|---|
| RN-NLP-01 | Ninguna observación se descarta, se fusiona ni se resume de forma que se pierda el conteo original. | RF-NLP-03 |
| RN-NLP-02 | Los datos personales del remitente nunca salen del expediente de la CRA hacia el Observatorio. | RF-NLP-01 |
| RN-NLP-03 | El peso de un argumento en el análisis NO DEBE determinarse solo por el número de remisiones: un envío masivo y un argumento técnico único se presentan ambos. | RF-NLP-03 |

## Casos borde y errores

| Situación | Comportamiento esperado |
|---|---|
| Observación en formato no textual (audio, imagen, PDF escaneado) | Se registra como recibida y se enruta a transcripción manual; no se pierde del conteo |
| Observación que mezcla varios temas | Se asigna a todos los temas aplicables; el conteo por tema declara que hay observaciones multitema |
| Observación ofensiva o fuera de tema | Se conserva en el conteo total, se clasifica como fuera de alcance; no se elimina |
| Remitente que solicita supresión de sus datos | Se atiende sobre el expediente; el texto anonimizado ya no permite identificarlo |
| Proyecto regulatorio con menos de 10 observaciones | Clasificación manual directa; el agrupamiento automático no aporta |

## Fuera de alcance de esta spec

- PQR de suscriptores ante prestadores.
- Encuestas de percepción ciudadana (no-objetivo de V1).
- Análisis de sentimiento sobre la entidad o sus funcionarios.

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-NLP-01 | ¿Qué norma rige el periodo de participación y el deber de respuesta a observaciones de proyectos regulatorios? | RF-NLP-04 | Oficina Jurídica |
| Q-NLP-03 | ¿Se procesan observaciones históricas de procesos anteriores o solo las nuevas? | Alcance | Subdirección de Regulación |
| Q-NLP-04 | ¿Cuál es el documento vigente del proceso de participación para los NMT (nombre, versión, fecha) que fija qué se publica de la matriz y cuándo? Debe cargarse en `03_Marco_Normativo` y citarse en RF-NLP-04 | RF-NLP-04, componente "Regulación y seguimiento" del portal | Subdirección de Regulación / Oficina Jurídica |

## Publicación de la matriz (cierre de Q-NLP-02)

Decisión de Camilo Carvajalino (2026-09-14): la publicación de la matriz de observaciones y respuestas sigue **la definida en el proceso de participación vigente y actualizado para los NMT**. El Observatorio no crea una regla propia de publicación: publica lo que ese proceso ordena publicar, en el momento que ordena, y lo hace desde el componente "Regulación y seguimiento" del micrositio (`specs/portal-publico.md`), con trazabilidad uno a uno de RF-NLP-04 y anonimización de RF-NLP-01.

> **ASUNCIÓN (sin validar):** "NMT" se interpreta como Nuevos Marcos Tarifarios. Origen: uso corriente en la CRA; no confirmado en esta sesión. Confirmar y registrar el documento del proceso en `Q-NLP-04`.

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial | Sesión de generación |
| 2026-09-14 | `Q-NLP-02` cerrada: la matriz se publica según el proceso de participación vigente para los NMT; `Q-NLP-04` abierta | Decisión de Camilo Carvajalino; propuesta conceptual §4 componente 4 |
