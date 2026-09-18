---
id: spec-ontologia-indicadores
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-18
fuentes: [README_Context_Lake seccion 4 (Drive), 05_Bateria_de_Indicadores/catalogo-v1.md (Drive), Plan_de_Investigacion 3.1 (Drive), adr/ADR-0012, adr/ADR-0013, carpeta 09_ (propuesta y mockup v2)]
---

# Spec — Ontología y cálculo de indicadores

## Propósito

Define qué es un indicador en el Observatorio, qué debe contener su ficha metodológica, cómo se calcula, se versiona y se desagrega. **No cubre** la ingesta de los datos que lo alimentan, las reglas de validación de contenido (`specs/calidad-de-datos.md`) ni la publicación (`specs/portal-publico.md`).

## Contexto relevante

- Flujo de negocio: `docs/business_context.md` → FL-02
- Decisión que aplica: `adr/ADR-0003-compuerta-de-publicacion.md`, `adr/ADR-0013-familia-indicadores-nmtpp.md`
- Términos: `docs/glosario.md` → Indicador, Ficha metodológica, Versión de ficha, IANC, IPUF, IRCA, IRABAm, CMA, CMO, CMI, CMT, Costo Unitario, Asequibilidad, Dimensión SEG

## Dimensiones del catálogo

El catálogo se organiza en diez dimensiones temáticas y una dimensión de navegación transversal (`SEG`, incorporada en `adr/ADR-0013`). Un indicador pertenece a **una sola** dimensión: la clasificación múltiple hace que el mismo concepto se cuente dos veces en los tableros.

| Código | Dimensión | Ejemplos de indicador |
|---|---|---|
| `COB` | Cobertura | Cobertura de acueducto, de alcantarillado, de recolección de aseo |
| `CON` | Continuidad | Horas de servicio por día |
| `CAL` | Calidad del agua y salud | IRCA, IRABAm |
| `PER` | Pérdidas | IANC, IPUF |
| `EFI` | Eficiencia operativa y de costos | CMA, CMO, CMI, CMT por suscriptor o por m3 |
| `FIN` | Sostenibilidad financiera | Suficiencia de ingresos, equilibrio de subsidios y contribuciones |
| `INV` | Inversiones | Ejecución del plan de obras e inversiones |
| `ASE` | Asequibilidad | Peso de la factura sobre gasto del hogar |
| `CLI` | Riesgo climático y resiliencia | Exposición de fuentes de abastecimiento, planes de contingencia |
| `ECI` | Economía circular | Aprovechamiento, tratamiento de aguas residuales |
| `SEG` | Seguimiento regulatorio de marcos tarifarios | Adopción, ISE, incentivos, régimen especial y tarifa (`adr/ADR-0013`) |

Código de indicador: `IND-<DIMENSION>-<NN>` para el catálogo general V1 (por ejemplo `IND-PER-01`), o `NMTPP-<CAPA>-<NN>` / `NMTPP-<SEGMENTO>-<TEMA>` para el seguimiento de la Res. 1038 (`adr/ADR-0013`).

> **ASUNCIÓN (sin validar):** Las diez dimensiones temáticas originales se derivan del README y del Plan. La dimensión `SEG` proviene de `adr/ADR-0013`. Cada indicador requiere ficha aprobada antes de implementarse.

## Requisitos funcionales

### RF-ONTO-01 — Ficha metodológica obligatoria

El sistema NO DEBE calcular ni exponer ningún indicador que no tenga una ficha metodológica aprobada por ACT-CURADOR-DATOS en una versión vigente.

```gherkin
Escenario: Cálculo sin ficha
  Dado un indicador "IND-PER-01" sin ficha aprobada
  Cuando un proceso solicita su cálculo para el periodo 2026-08
  Entonces el sistema rechaza la solicitud
  Y registra el evento "calculo_sin_ficha" con el código del indicador
  Y NO produce ningún indicator_value
```

**Prioridad:** debe
**Origen:** regla de oro 4 de `AGENTS.md`; `adr/ADR-0003`

### RF-ONTO-02 — Contenido mínimo de la ficha

El sistema DEBE exigir, para aprobar una ficha, la presencia de los trece campos siguientes: código, nombre, dimensión, definición en lenguaje natural, fórmula, variables con su fuente y formulario de origen, unidad de medida, periodicidad, desagregaciones soportadas, norma que sustenta la fórmula con artículo, umbrales o rangos de referencia, limitaciones conocidas de interpretación, y responsable técnico.

```gherkin
Escenario: Ficha incompleta
  Dado una ficha de indicador sin el campo "norma que sustenta la fórmula"
  Cuando ACT-ANALISTA-CRA la envía a aprobación
  Entonces el sistema rechaza el envío
  Y lista los campos faltantes
  Y la ficha permanece en estado "borrador"
```

**Prioridad:** debe
**Origen:** directriz 4 del README (trazabilidad matemática)

### RF-ONTO-03 — Cita normativa de la fórmula

El sistema DEBE registrar, para toda fórmula de indicador, la referencia normativa que la sustenta con número de norma, año y artículo. SI la fórmula es una construcción propia del Observatorio sin respaldo normativo directo, ENTONCES la ficha DEBE declararlo explícitamente como "construcción metodológica del Observatorio" y el portal DEBE mostrar esa nota junto al valor.

```gherkin
Escenario: Indicador de construcción propia
  Dado un indicador de asequibilidad que combina tarifa aplicada y gasto del hogar del DANE
  Y que no existe fórmula regulatoria que lo defina
  Cuando se aprueba su ficha
  Entonces la ficha queda marcada como "construcción metodológica del Observatorio"
  Y el portal muestra esa nota junto a todo valor del indicador
```

**Prioridad:** debe
**Origen:** regla de oro 2 de `AGENTS.md`

### RF-ONTO-04 — Versionado de ficha y recálculo

CUANDO ACT-ANALISTA-CRA modifica la fórmula, las variables o la unidad de un indicador, el sistema DEBE crear una versión nueva de la ficha y DEBE conservar los valores calculados con la versión anterior, marcándolos con su número de versión.

```gherkin
Escenario: Cambio de fórmula sobre serie publicada
  Dado el indicador "IND-PER-01" versión 1 con 36 periodos publicados
  Cuando se aprueba la versión 2 con una fórmula distinta
  Entonces el sistema crea indicator_value nuevos con version 2
  Y conserva los valores de version 1 sin alterarlos
  Y el portal muestra la serie de version 2 y ofrece la serie de version 1 como histórico
  Y muestra una marca de ruptura metodológica en el periodo de cambio
```

**Prioridad:** debe
**Origen:** regla 2 del modelo de datos en `docs/architecture.md`

### RF-ONTO-05 — Desagregaciones mínimas

El sistema DEBE soportar, para todo indicador cuya fuente lo permita, desagregación por prestador, por área de prestación, por municipio (`divipola_code`), por departamento, por segmento de prestador, por servicio y por zona urbana o rural.

```gherkin
Escenario: Desagregación no soportada por la fuente
  Dado un indicador cuya fuente solo reporta a nivel de prestador
  Cuando se solicita su desagregación por zona urbana o rural
  Entonces el sistema responde que la desagregación no está disponible
  Y NO distribuye el valor del prestador entre zonas por prorrateo
```

**Prioridad:** debe
**Origen:** Plan de Investigación 3.1

### RF-ONTO-06 — Comparabilidad entre segmentos

MIENTRAS un indicador esté definido con fórmulas distintas según el segmento del prestador, el sistema NO DEBE presentar valores de segmentos distintos en una misma comparación sin una nota de no comparabilidad visible.

```gherkin
Escenario: Comparación entre segmentos con metodologías distintas
  Dado un indicador de costos con fórmula distinta por segmento
  Cuando ACT-CIUDADANO compara un prestador grande con uno pequeño
  Entonces el sistema muestra ambos valores
  Y muestra la advertencia de que se calculan con metodologías distintas
  Y NO calcula una diferencia porcentual entre ellos
```

**Prioridad:** debe
**Depende de:** Q-GLO-01
**Origen:** no-objetivo de ranking sin control estructural

### RF-ONTO-07 — Unidades canónicas

El sistema DEBE almacenar y exponer cada indicador en la unidad declarada en su ficha, usando exclusivamente: m3, l/s, $/m3, pesos colombianos, horas/día, porcentaje con un decimal, o número de suscriptores. Toda cifra monetaria DEBE llevar año base y condición (corriente o constante).

```gherkin
Escenario: Cifra monetaria sin año base
  Dado un valor calculado de costo unitario en pesos
  Cuando el sistema intenta publicarlo sin año base declarado
  Entonces el sistema bloquea la publicación
  Y registra el error "unidad_monetaria_incompleta"
```

**Prioridad:** debe
**Origen:** directriz 3 del README; regla de oro 6 de `AGENTS.md`

### RF-ONTO-08 — Trazabilidad del valor

El sistema DEBE permitir, para cualquier valor publicado, recuperar la versión de ficha, la fórmula aplicada, los valores de cada variable de entrada y los `raw_record` que los originaron.

```gherkin
Escenario: Auditoría de un valor publicado
  Dado un valor publicado de IND-PER-01 para un prestador y periodo
  Cuando ACT-ANALISTA-CRA solicita su trazabilidad
  Entonces el sistema devuelve version de ficha, fórmula, cada variable con su valor
  Y la lista de raw_record de origen con su file_hash
```

**Prioridad:** debe
**Depende de:** RNF-SUI-03
**Origen:** directriz 5 del README (regla de no alucinación)

### RF-ONTO-09 — Agregación territorial declarada por ficha

CUANDO se calcule un agregado municipal, departamental o nacional de un indicador, el sistema DEBE aplicar únicamente la función de agregación declarada en el campo 14 de la ficha (cociente de sumas, promedio ponderado por suscriptores facturados o por m3 facturados, ponderado por población servida con distribución por nivel de riesgo, suma, o no agregable), calcularlo desde los `indicator_value` a nivel prestador × APS × periodo, registrar la cobertura de reporte (proporción de suscriptores facturados del territorio representados por valores válidos) y producir la descomposición por prestador con el peso y el estado de cada uno. El sistema NO DEBE publicar un agregado cuya cobertura de reporte esté por debajo del umbral de la ficha, ni un agregado sin descomposición.

```gherkin
Escenario: Cobertura departamental como cociente de sumas
  Dado IND-COB-01 con función "cociente de sumas" y valores válidos de los prestadores de un departamento
  Cuando se calcula el agregado departamental
  Entonces el valor es la suma de población servida sobre la suma de población del territorio
  Y NO es el promedio de los porcentajes de los prestadores
  Y el resultado lleva cobertura de reporte, semáforo y la lista de prestadores con su peso

Escenario: Agregado por debajo del umbral
  Dado un municipio cuyos prestadores con valor válido representan 65 % de los suscriptores facturados
  Y una ficha con umbral de 80 %
  Cuando se calcula el agregado municipal
  Entonces el sistema produce el estado "agregado no publicable: cobertura de reporte 65 %"
  Y conserva la descomposición por prestador para publicarla

Escenario: Indicador no agregable
  Dado un resultado de benchmarking (DEA/SFA) de un prestador
  Cuando se solicita el agregado departamental
  Entonces el sistema responde "no agregable" con la razón de la ficha
  Y NO calcula un promedio

Escenario: Departamento construido desde valores base
  Dado un departamento con doce municipios ya agregados
  Cuando se calcula el agregado departamental
  Entonces el sistema lo calcula desde los indicator_value de los prestadores, no desde los doce agregados municipales
```

**Prioridad:** debe
**Depende de:** RF-ONTO-05, tabla de suscriptores facturados por prestador, APS y periodo (zona conformada), denominadores territoriales DANE (`RF-SUI-08`), `Q-ONTO-06`
**Origen:** `adr/ADR-0012`; criterio de misión fijado en `Q-ONTO-05`

## Requisitos no funcionales

### RNF-ONTO-01 — Determinismo del cálculo

Dos ejecuciones del mismo indicador, misma versión, mismo periodo y mismo conjunto de `raw_record` DEBEN producir valores idénticos hasta el último decimal almacenado.

### RNF-ONTO-02 — Precisión y redondeo

El sistema DEBE calcular con precisión decimal completa y redondear únicamente en la capa de presentación, según la regla declarada en la ficha. NO DEBE redondear en pasos intermedios.

## Reglas de negocio

| ID | Regla | Aplica a |
|---|---|---|
| RN-ONTO-01 | Un indicador pertenece a una sola dimensión. | Catálogo |
| RN-ONTO-02 | Un `indicator_code` NO DEBE reciclarse. Si un indicador se retira, su código queda obsoleto con referencia al ADR que lo retiró. | RF-ONTO-04 |
| RN-ONTO-03 | Ausencia de dato NO DEBE representarse como cero en ningún punto del pipeline ni de la presentación. | RF-ONTO-05 |
| RN-ONTO-04 | La definición de la fórmula la hace ACT-ANALISTA-CRA; la aprobación para publicar la hace ACT-CURADOR-DATOS. Nunca la misma persona en ambos roles para un mismo indicador. | RF-ONTO-01 |
| RN-ONTO-05 | Ningún agregado territorial existe sin su descomposición por prestador ni sin cobertura de reporte; el semáforo del agregado nunca es mejor que el de su peor componente con peso material. | RF-ONTO-09 |
| RN-ONTO-06 | Un valor de prestador cuya APS cubre varios municipios NO DEBE prorratearse entre ellos; se atribuye al conjunto de la APS y así se muestra. | RF-ONTO-05, RF-ONTO-09 |

## Dimensiones de navegación del portal frente a dimensiones de ontología

La propuesta conceptual (carpeta `09_`) organiza los tableros en cinco dimensiones y el mockup v2 en ocho módulos. Ninguna de esas dos listas sustituye a las diez dimensiones de esta spec: son agrupaciones de navegación. Correspondencia vigente:

| Propuesta | Mockup v2 | Dimensiones de ontología e indicadores V1 | Tratamiento en el portal |
|---|---|---|---|
| Prestación | Prestación y calidad | `COB` (IND-COB-01/02/03), `CON` (IND-CON-01), `CAL` (IND-CAL-01), `PER` (IND-PER-01/02) | Cuatro dimensiones; calidad del agua (índice de riesgo) separada de cobertura y continuidad |
| Económicos y tarifarios | Tarifas y costos | `EFI` (IND-EFI-01/02), `FIN` (IND-FIN-01), `INV` (IND-INV-01) | Tres dimensiones; nunca "tarifa promedio" (`RN-PORTAL-04`) |
| — | Impacto social | `ASE` (IND-ASE-01) | Una dimensión |
| — | Sostenibilidad | `ECI` (IND-ECI-01/02), `CLI` (sin indicador en V1) | Dos dimensiones |
| Mercado | Mercado | Sin dimensión: atributos de `provider` (segmento, servicios, suscriptores) | Catálogo de prestadores (`RF-PORTAL-12`) |
| Territoriales | Territorio | Sin dimensión: desagregación de `RF-ONTO-05` y agregación de `RF-ONTO-09` | Perfil territorial (`RF-PORTAL-13`) |
| Regulatorios | Regulación | Sin dimensión: proyectos regulatorios y participación (`FL-04`) | Componente "Regulación y seguimiento" |
| — | Tendencias | Sin dimensión: serie temporal de cualquier indicador | Vista transversal |

## Casos borde y errores

| Situación | Comportamiento esperado |
|---|---|
| Denominador cero (prestador sin suscriptores facturados) | El indicador no se calcula; estado "no aplicable". Nunca división por cero ni valor nulo silencioso |
| Prestador que presta varios servicios en varias APS | El indicador se calcula por APS y servicio; el consolidado solo con la función del campo 14 de la ficha (`RF-ONTO-09`) |
| Municipio servido por varios prestadores | Agregado por `RF-ONTO-09` con descomposición; si uno no reporta, la cobertura de reporte lo refleja y el prestador aparece como "no reportó" en la descomposición |
| Fase A (solo segmento grande) y agregado nacional | El agregado se calcula y se publica solo si supera el umbral de cobertura de reporte; de lo contrario se publica el estado "no publicable" con la cobertura alcanzada, nunca un nacional "de segmento grande" rotulado como nacional |
| Valor fuera del rango teórico (IANC > 100%) | No se publica; va a cuarentena vía `specs/calidad-de-datos.md` |
| Cambio de segmento del prestador a mitad de serie | Marcar ruptura en la serie; no recalcular retroactivamente con la metodología nueva |
| Indicador anual que depende de un insumo mensual incompleto | No se calcula hasta tener los 12 periodos, salvo que la ficha declare una regla de cierre parcial |
| Deflactación de series monetarias | Solo con el índice declarado en la ficha; nunca con un índice elegido por el pipeline |

## Fuera de alcance de esta spec

- La batería concreta de indicadores: vive como fichas en `05_Bateria_de_Indicadores`, una por indicador.
- Comparaciones de eficiencia entre prestadores: `specs/benchmarking-econometrico.md`.
- Semáforo de calidad: `specs/calidad-de-datos.md`.

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-ONTO-01 | ¿Cuál es la batería priorizada de indicadores para V1 y cuántos son? | Todo el módulo | Subdirección de Regulación |
| Q-ONTO-02 | ¿Qué índice se usa para deflactar series monetarias y con qué año base? | RF-ONTO-07 | Subdirección de Regulación |
| Q-ONTO-03 | ¿Se adopta la definición de cobertura por viviendas o por población? | RF-ONTO-01 | Subdirección de Regulación (ver Q-GLO-02) |
| Q-ONTO-04 | ¿Quién ocupa el rol de ACT-CURADOR-DATOS para efectos de RN-ONTO-04? | RF-ONTO-01 | CIO (ver Q-NEG-04) |
| Q-ONTO-06 | ¿Umbral de cobertura de reporte para publicar un agregado (propuesto 80 % de suscriptores facturados) y umbral de "peso material" de un componente (propuesto 5 %)? | RF-ONTO-09, RN-ONTO-05 | Subdirección de Regulación |
| Q-ONTO-07 | ¿Las funciones de agregación asignadas por tipo en `adr/ADR-0012` se ratifican indicador por indicador al redactar cada ficha? | Campo 14 de las 14 fichas | Subdirección de Regulación |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial | Sesión de generación |
| 2026-09-14 | RF-ONTO-09, RN-ONTO-05, RN-ONTO-06, sección de dimensiones de navegación, casos borde de agregación; `Q-ONTO-05` cerrada con el criterio de misión; `Q-ONTO-06` y `Q-ONTO-07` abiertas | `adr/ADR-0012`; análisis de la carpeta `09_` |
