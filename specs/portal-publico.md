---
id: spec-portal-publico
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-13
fuentes: [decisión de sesión 2026-09-13 (plataforma pública), Ley 1712 de 2014, Resolución MinTIC 1519 de 2020]
---

# Spec — Portal público, API y datos abiertos

## Propósito

Define la capa de publicación del Observatorio: qué se expone, con qué garantías de accesibilidad y transparencia, y qué nunca se expone. **No cubre** cómo se calculan los valores ni cómo se validan.

## Contexto relevante

- Flujo de negocio: `docs/business_context.md` → FL-02 paso 5, FL-03
- Decisión que aplica: `adr/ADR-0003-compuerta-de-publicacion.md`
- Términos: `docs/glosario.md` → Semáforo de calidad, Tarifa aplicada, Costo Unitario

## Requisitos funcionales

### RF-PORTAL-01 — Compuerta de publicación

El sistema NO DEBE exponer en portal, API ni descargas ningún valor que no tenga ficha metodológica aprobada, semáforo de calidad asignado y aprobación de ACT-CURADOR-DATOS.

```gherkin
Escenario: Valor sin aprobación
  Dado un indicator_value en estado "listo_para_publicar" sin aprobación del curador
  Cuando ACT-CIUDADANO consulta el portal y la API
  Entonces ninguno de los dos devuelve el valor
  Y la serie muestra el último periodo aprobado como el más reciente
```

**Prioridad:** debe
**Origen:** `adr/ADR-0003`

### RF-PORTAL-02 — Ficha y semáforo siempre visibles

El sistema DEBE mostrar, junto a todo valor publicado, su fecha de corte, su semáforo de calidad con motivo legible y el acceso a la ficha metodológica del indicador.

```gherkin
Escenario: Consulta de un indicador en el tablero
  Dado un valor publicado con semáforo amarillo
  Cuando ACT-CIUDADANO lo consulta
  Entonces ve el valor, la unidad, la fecha de corte y el semáforo
  Y ve el motivo del semáforo en lenguaje no técnico
  Y puede abrir la ficha metodológica desde el mismo lugar
```

**Prioridad:** debe

### RF-PORTAL-03 — Datos abiertos descargables

El sistema DEBE permitir descargar, sin registro ni autenticación, los datos de cualquier vista publicada en formato CSV con codificación UTF-8, incluyendo las columnas de semáforo, fecha de corte y versión de ficha.

```gherkin
Escenario: Descarga de una serie
  Dado una serie de 36 periodos de un indicador
  Cuando ACT-CIUDADANO descarga el CSV
  Entonces el archivo incluye periodo, valor, unidad, quality_flag, fecha de corte y version de ficha
  Y no requiere registro previo
  Y el archivo declara su fecha de generación
```

**Prioridad:** debe
**Origen:** Ley 1712 de 2014

### RF-PORTAL-04 — API pública de consulta

El sistema DEBE exponer una API pública de solo lectura sobre la zona de publicación, con los mismos campos de la descarga y con paginación.

```gherkin
Escenario: Consulta por API
  Dado un indicador publicado
  Cuando un tercero consulta la API por indicador, prestador y rango de periodos
  Entonces recibe los valores con quality_flag, unidad y version de ficha
  Y la respuesta indica el total de registros y el cursor de paginación
```

**Prioridad:** debe
**Depende de:** Q-ARQ-02

### RF-PORTAL-05 — Accesibilidad

El portal DEBE cumplir WCAG 2.1 nivel AA y los lineamientos de la Resolución MinTIC 1519 de 2020, incluyendo navegación por teclado, contraste suficiente y alternativas textuales para toda representación gráfica.

```gherkin
Escenario: Gráfica con alternativa textual
  Dado un tablero con una serie temporal en gráfica
  Cuando un usuario navega con lector de pantalla
  Entonces accede a la tabla de datos equivalente de la gráfica
  Y puede recorrer todos los controles del tablero con teclado
```

**Prioridad:** debe
**Origen:** Resolución MinTIC 1519 de 2020

### RF-PORTAL-06 — Ausencia de dato explícita

CUANDO no exista valor para una combinación de indicador, prestador y periodo, el sistema DEBE mostrar el motivo (sin reporte, en cuarentena, en objeción, no aplicable) y NO DEBE mostrar cero ni dejar la celda vacía sin explicación.

```gherkin
Escenario: Prestador sin reporte en el periodo
  Dado un prestador sin reporte para 2026-08
  Cuando ACT-CIUDADANO consulta su continuidad en ese periodo
  Entonces el portal muestra "sin reporte del prestador para el periodo"
  Y NO muestra 0 horas/día
  Y la serie deja el punto vacío con la nota correspondiente
```

**Prioridad:** debe
**Origen:** RN-CAL-04

### RF-PORTAL-07 — Historial público de correcciones

CUANDO un valor publicado cambia por recálculo, retransmisión o corrección de fórmula, el sistema DEBE registrar el cambio en un historial público consultable, con valor anterior, valor nuevo, fecha y motivo.

```gherkin
Escenario: Corrección de un valor publicado
  Dado un valor publicado de 42,1% que se recalcula a 39,8%
  Cuando el curador aprueba el recálculo
  Entonces el portal muestra el valor nuevo
  Y el historial público registra valor anterior, valor nuevo, fecha y motivo
  Y el valor anterior sigue siendo consultable
```

**Prioridad:** debe
**Origen:** FL-03 paso 5

### RF-PORTAL-08 — Cero datos personales

El sistema NO DEBE publicar ningún dato que permita identificar a una persona natural, ni directamente ni por cruce de desagregaciones.

```gherkin
Escenario: Desagregación que podría identificar
  Dado una desagregación que dejaría menos de 5 suscriptores en una celda
  Cuando el sistema prepara la publicación
  Entonces suprime la celda y muestra "dato suprimido por protección de la información"
  Y NO publica el valor
```

**Prioridad:** debe
**Origen:** Ley 1581 de 2012

> **ASUNCIÓN (sin validar):** Umbral de supresión de 5 unidades por celda. Origen: práctica estadística estándar; no acordado. Confirmar con la Oficina Jurídica.

### RF-PORTAL-09 — Lenguaje comprensible

El portal DEBE presentar cada indicador con una explicación en lenguaje no técnico de qué significa y de qué **no** permite concluir.

```gherkin
Escenario: Explicación de un indicador técnico
  Dado el indicador IANC
  Cuando ACT-CIUDADANO lo consulta
  Entonces ve una explicación sin fórmulas de qué mide
  Y una nota de qué no permite concluir (por ejemplo, que no mide calidad del agua)
```

**Prioridad:** debería
**Origen:** metodología de Bogotá Cómo Vamos (carpeta `02_`)

## Requisitos no funcionales

### RNF-PORTAL-01 — Desempeño

La carga inicial de un tablero DEBE completarse en menos de 3.000 ms en el percentil 95, con 200 usuarios concurrentes y conexión móvil 4G.

> **ASUNCIÓN (sin validar):** 3.000 ms, 200 concurrentes. Origen: estimación sin datos de demanda esperada. Recalibrar tras medir tráfico real.

### RNF-PORTAL-02 — Disponibilidad

El portal DEBE tener disponibilidad mensual igual o superior al 99,0%, medida sobre la página de consulta de indicadores.

### RNF-PORTAL-03 — Trazabilidad de lo publicado

El sistema DEBE poder reconstruir el estado exacto de lo publicado en cualquier fecha pasada, para responder a un cuestionamiento sobre qué mostraba el portal ese día.

## Reglas de negocio

| ID | Regla | Aplica a |
|---|---|---|
| RN-PORTAL-01 | La publicación solo lee de la zona de publicación, nunca de la zona cruda ni de cuarentena. | Todas |
| RN-PORTAL-02 | Todo dato publicado es descargable. No existe información visible que no se pueda extraer. | RF-PORTAL-03 |
| RN-PORTAL-03 | Retirar un valor publicado requiere aprobación de ACT-CURADOR-DATOS y queda en el historial público. | RF-PORTAL-07 |
| RN-PORTAL-04 | El portal NO DEBE presentar la Tarifa aplicada y el Costo Unitario como el mismo concepto. | RF-PORTAL-09 |

## Casos borde y errores

| Situación | Comportamiento esperado |
|---|---|
| Indicador retirado del catálogo | La serie histórica permanece consultable, marcada como descontinuada, con la fecha y el motivo |
| Cambio de versión de ficha a mitad de serie | Mostrar ruptura metodológica visible; no empalmar series de versiones distintas sin advertencia |
| Búsqueda de un municipio que cambió de nombre | Resolver por `divipola_code`; ofrecer el nombre histórico como sinónimo de búsqueda |
| Pico de tráfico por nota de prensa | Degradar a vistas precalculadas antes que fallar; nunca servir datos desactualizados sin declarar la fecha de corte |
| API consultada con un indicador inexistente | Responder con error explícito y la lista de indicadores disponibles; nunca lista vacía sin explicación |

## Fuera de alcance de esta spec

- Autenticación de prestadores para objeciones (módulo aparte, pendiente).
- Publicación de documentos normativos: es del Gestor Normativo de la CRA.
- Canal de PQR.

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-PORTAL-01 | ¿El portal vive en la sede electrónica de la CRA o en dominio propio? | RF-PORTAL-05, analítica | CIO (ver Q-ARQ-02) |
| Q-PORTAL-02 | ¿Se publica el dato a nivel de prestador individual o solo agregados territoriales? Decide el alcance completo del portal | Todo el módulo | Dirección Ejecutiva (ver Q-BENCH-03) |
| Q-PORTAL-03 | ¿La API pública requiere llave de uso para control de abuso, siendo los datos abiertos? | RF-PORTAL-04 | CIO |
| Q-PORTAL-04 | ¿Qué umbral de supresión aplica para proteger celdas pequeñas? | RF-PORTAL-08 | Oficina Jurídica |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial | Sesión de generación; decisión de V1 como plataforma pública |
