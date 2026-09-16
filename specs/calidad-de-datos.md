---
id: spec-calidad-de-datos
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-13
fuentes: [README_Context_Lake directrices 1-5 (Drive), DAMA-DMBOK, Plan_de_Investigacion seccion 5 (Drive)]
---

# Spec — Calidad de datos, cuarentena y semáforo

## Propósito

Define cómo el Observatorio evalúa la calidad de los datos que ingiere, qué hace con los que no la cumplen, y cómo comunica al público el grado de confianza de cada valor publicado. **No cubre** la obtención de los datos ni el cálculo de indicadores.

## Contexto relevante

- Flujo de negocio: `docs/business_context.md` → FL-01 pasos 3 y 4
- Decisiones que aplican: `adr/ADR-0002-sui-fuente-autoritativa.md`, `adr/ADR-0003-compuerta-de-publicacion.md`
- Términos: `docs/glosario.md` → Semáforo de calidad, Cuarentena

## Dimensiones de calidad

Se adoptan seis dimensiones de DAMA-DMBOK. Cada regla de validación DEBE declarar a cuál pertenece.

| Código | Dimensión | Pregunta que responde |
|---|---|---|
| `COMP` | Completitud | ¿Está el dato que se esperaba, para todos los prestadores y periodos esperados? |
| `EXAC` | Exactitud | ¿El valor es plausible frente al rango teórico y al histórico del propio prestador? |
| `CONS` | Consistencia | ¿Concuerda con otras variables del mismo reporte y con otras fuentes? |
| `OPOR` | Oportunidad | ¿Llegó dentro de la ventana esperada? |
| `UNIC` | Unicidad | ¿Hay un solo registro vigente por llave? |
| `VALI` | Validez | ¿Cumple el tipo, formato y dominio declarados? |

## Requisitos funcionales

### RF-CAL-01 — Evaluación obligatoria antes de calcular

CUANDO un registro pasa de la zona cruda a la zona conformada, el sistema DEBE evaluar todas las reglas de validación aplicables a su formulario y DEBE registrar un `quality_finding` por cada regla incumplida.

```gherkin
Escenario: Registro con dos incumplimientos
  Dado un registro que viola la regla de rango de IANC y la de consistencia de suscriptores
  Cuando el sistema lo conforma
  Entonces crea 2 quality_finding asociados al registro
  Y cada finding indica regla, dimensión, severidad y valor observado
```

**Prioridad:** debe
**Origen:** FL-01 paso 3

### RF-CAL-02 — Severidad y cuarentena

SI un registro incumple una regla de severidad `bloqueante`, ENTONCES el sistema DEBE enviarlo a cuarentena y NO DEBE usarlo para calcular ningún indicador publicado.

```gherkin
Escenario: Valor imposible
  Dado un registro con continuidad de 27 horas/día
  Cuando el sistema evalúa la regla de rango de continuidad (bloqueante)
  Entonces el registro queda en cuarentena
  Y el indicador de continuidad de ese prestador y periodo no se calcula
  Y el portal muestra "dato en revisión" para ese prestador y periodo
  Y el registro NO se borra ni se modifica
```

**Prioridad:** debe
**Origen:** directriz 5 del README

### RF-CAL-03 — Prohibición de imputación silenciosa

El sistema NO DEBE imputar, estimar ni rellenar valores faltantes sin registrar la imputación como atributo del valor resultante y sin exponerla al público.

```gherkin
Escenario: Dato faltante en un mes de una serie anual
  Dado un indicador anual que requiere 12 meses y solo tiene 11
  Cuando la ficha declara una regla de cierre con 11 meses
  Entonces el sistema calcula el valor
  Y lo marca con semáforo amarillo y la nota "calculado con 11 de 12 periodos"
  Y NO estima el mes faltante por promedio

Escenario: Sin regla de cierre declarada
  Dado el mismo indicador sin regla de cierre en su ficha
  Cuando falta un mes
  Entonces el sistema NO calcula el valor
  Y el portal muestra "sin dato suficiente"
```

**Prioridad:** debe
**Origen:** regla de oro 1 de `AGENTS.md`

### RF-CAL-04 — Semáforo de calidad por valor publicado

El sistema DEBE asignar a todo `indicator_value` publicado un semáforo verde, amarillo o rojo, calculado a partir de los `quality_finding` de los registros que lo alimentan, y DEBE exponerlo junto al valor en portal, API y descargas.

```gherkin
Escenario: Semáforo visible en la API
  Dado un indicator_value con un finding de severidad media
  Cuando ACT-CIUDADANO consulta la API
  Entonces la respuesta incluye el valor, el quality_flag "amarillo"
  Y el motivo legible del semáforo
```

**Prioridad:** debe
**Origen:** `adr/ADR-0003`

> **ASUNCIÓN (sin validar):** El mapeo de findings a color todavía no está definido. Ver `Q-CAL-01`. Hasta definirlo, todo valor con al menos un finding no bloqueante es amarillo.

### RF-CAL-05 — Detección de anomalías frente al histórico

CUANDO un valor se desvía del histórico del propio prestador más allá del umbral declarado en la ficha, el sistema DEBE crear un `quality_finding` de dimensión `EXAC` con severidad media y notificar a ACT-ANALISTA-CRA, sin bloquear la publicación.

```gherkin
Escenario: Salto atípico
  Dado un prestador con IANC entre 38% y 42% en los últimos 24 periodos
  Cuando reporta 71% en el periodo actual
  Entonces el sistema crea un finding de anomalía
  Y publica el valor con semáforo amarillo
  Y notifica a ACT-ANALISTA-CRA
```

**Prioridad:** debería
**Origen:** README sección 6 (detección de anomalías)

### RF-CAL-06 — Informe de calidad público

El sistema DEBE publicar, por periodo, un informe de calidad con la cobertura de reporte por fuente, el número de registros en cuarentena y las reglas más incumplidas, sin identificar hallazgos como incumplimientos sancionables.

```gherkin
Escenario: Publicación del informe de calidad
  Dado el cierre del periodo 2026-08
  Cuando el sistema publica el informe
  Entonces incluye porcentaje de prestadores con reporte completo por fuente
  Y el conteo de registros en cuarentena por motivo
  Y la nota de que los hallazgos no constituyen calificación de cumplimiento
```

**Prioridad:** debe
**Origen:** no-objetivo "no emitir juicios de cumplimiento"

### RF-CAL-07 — Salida de cuarentena

CUANDO un registro en cuarentena es superado por una retransmisión que sí cumple las reglas, el sistema DEBE recalcular los indicadores afectados y DEBE registrar la corrección en el historial público de la serie.

```gherkin
Escenario: Corrección por retransmisión
  Dado un registro en cuarentena por continuidad de 27 horas/día
  Cuando llega una retransmisión con 21 horas/día que pasa todas las reglas
  Entonces el sistema calcula el indicador con el valor nuevo
  Y registra en el historial público que el periodo fue corregido
  Y conserva el registro en cuarentena marcado como superseded
```

**Prioridad:** debe
**Depende de:** RF-SUI-04

## Requisitos no funcionales

### RNF-CAL-01 — Tiempo de evaluación

La evaluación completa de reglas sobre un periodo mensual del SUI DEBE finalizar en menos de 2 horas.

> **ASUNCIÓN (sin validar):** 2 horas. Origen: estimación sin volumetría. Recalibrar.

### RNF-CAL-02 — Reglas como configuración

Las reglas de validación DEBEN ser declarativas y versionadas, editables sin desplegar código, y toda evaluación DEBE registrar la versión del conjunto de reglas aplicada.

## Reglas de negocio

| ID | Regla | Aplica a |
|---|---|---|
| RN-CAL-01 | Un dato en cuarentena NUNCA se borra ni se corrige: se conserva como evidencia. | RF-CAL-02 |
| RN-CAL-02 | El Observatorio NO DEBE calificar a un prestador por su calidad de reporte con lenguaje sancionatorio. Describe el dato, no juzga a la entidad. | RF-CAL-06 |
| RN-CAL-03 | Ninguna imputación sin marca visible al público. | RF-CAL-03 |
| RN-CAL-04 | La ausencia de reporte y el valor cero son estados distintos y NO DEBEN representarse igual en ninguna capa. | Todas |

## Casos borde y errores

| Situación | Comportamiento esperado |
|---|---|
| Prestador nuevo sin histórico | Las reglas de anomalía histórica no aplican; se declara "sin histórico suficiente", no verde automático |
| Todas las reglas pasan pero el dato es implausible para el analista | ACT-ANALISTA-CRA puede crear un finding manual con su justificación; queda trazado con autor |
| Regla mal configurada que manda medio país a cuarentena | El sistema DEBE alertar cuando una sola regla afecta más del 20% de los registros del periodo, antes de aplicar la cuarentena |
| Dato correcto pero fuente desactualizada (por ejemplo, proyección DANE vieja) | Semáforo amarillo con motivo de desactualización, no cuarentena |
| Dos fuentes con cifras distintas para lo mismo | Finding de consistencia; publicar la fuente autoritativa declarada en la ficha y exponer la discrepancia |

## Fuera de alcance de esta spec

- Definición de los umbrales específicos de cada indicador: van en su ficha.
- Acciones de vigilancia o requerimiento a prestadores: competencia de la SSPD.

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-CAL-01 | ¿Qué combinación de findings determina verde, amarillo y rojo? | RF-CAL-04 | CIO / Ciencia de Datos |
| Q-CAL-02 | ¿El informe de calidad se publica siempre o solo cuando supera un mínimo de cobertura? | RF-CAL-06 | Dirección Ejecutiva |
| Q-CAL-03 | ¿Quién puede declarar cuarentena manual y con qué acto? | RF-CAL-02 | CIO |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial | Sesión de generación |
