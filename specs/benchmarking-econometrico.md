---
id: spec-benchmarking-econometrico
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-13
fuentes: [README_Context_Lake seccion 6 (Drive), Plan_de_Investigacion 2.3 (Drive)]
---

# Spec — Benchmarking y modelos econométricos

## Propósito

Define cómo el Observatorio compara la eficiencia de prestadores entre sí: cómo forma grupos comparables, qué modelos usa, qué publica y qué no. **No cubre** el cálculo de indicadores individuales ni la fijación de metas regulatorias, que ocurre en los procesos tarifarios.

## Contexto relevante

- No-objetivos que acotan este módulo: `docs/business_context.md` → No-objetivos
- Términos: `docs/glosario.md` → Grupo comparable, Segmento, Indicador
- Referencias metodológicas: `01_Marcos_Internacionales_y_Benchmarks_OCDE` (OFWAT, SUNASS, WAREG, ADERASA)

## Requisitos funcionales

### RF-BENCH-01 — Grupos comparables explícitos

El sistema DEBE calcular toda comparación de eficiencia dentro de un grupo comparable definido por variables estructurales declaradas, y DEBE exponer al público las variables que formaron el grupo.

```gherkin
Escenario: Comparación dentro de grupo
  Dado un prestador del segmento pequeño en zona rural de montaña
  Cuando ACT-CIUDADANO consulta su posición de eficiencia
  Entonces el sistema lo compara solo con prestadores de su grupo comparable
  Y muestra las variables que definen el grupo y cuántos prestadores lo integran
  Y NO muestra su posición frente al universo completo de prestadores
```

**Prioridad:** debe
**Origen:** no-objetivo de ranking sin control estructural

### RF-BENCH-02 — Tamaño mínimo de grupo

SI un grupo comparable tiene menos de 8 prestadores con datos válidos en el periodo, ENTONCES el sistema NO DEBE publicar posiciones relativas para ese grupo y DEBE mostrar únicamente el valor absoluto del indicador.

```gherkin
Escenario: Grupo demasiado pequeño
  Dado un grupo comparable con 5 prestadores válidos
  Cuando se solicita el benchmarking del grupo
  Entonces el sistema publica los valores absolutos de cada prestador
  Y NO publica percentiles, posiciones ni distancia a la frontera
  Y muestra el motivo: grupo insuficiente para comparación estadística
```

**Prioridad:** debe

> **ASUNCIÓN (sin validar):** Umbral de 8 prestadores. Origen: criterio técnico para evitar identificación por deducción y estimaciones inestables; no acordado. Confirmar con la Subdirección de Regulación.

### RF-BENCH-03 — Banda de incertidumbre obligatoria

El sistema NO DEBE publicar un resultado de eficiencia relativa sin su intervalo de confianza o banda de incertidumbre.

```gherkin
Escenario: Puntaje de eficiencia con incertidumbre
  Dado un puntaje DEA de 0,82 para un prestador
  Cuando el sistema lo publica
  Entonces muestra el puntaje con su banda de incertidumbre
  Y si dos prestadores tienen bandas superpuestas, los presenta como indistinguibles
  Y NO los ordena entre sí
```

**Prioridad:** debe
**Origen:** riesgo de mitigación de sesgos del Plan de Investigación

### RF-BENCH-04 — Reproducibilidad del modelo

El sistema DEBE registrar, para toda corrida de modelo publicada, la especificación completa: variables de entrada y salida, orientación y supuestos de rendimientos a escala en DEA, forma funcional y distribución de ineficiencia en SFA, tratamiento de atípicos, semilla aleatoria y versión del conjunto de datos.

```gherkin
Escenario: Reejecución de una corrida publicada
  Dado una corrida publicada con su especificación registrada
  Cuando ACT-ANALISTA-CRA la reejecuta con el mismo snapshot de datos
  Entonces obtiene resultados idénticos hasta el último decimal
```

**Prioridad:** debe

### RF-BENCH-05 — Tratamiento declarado de atípicos

El sistema DEBE aplicar el criterio de exclusión de atípicos declarado en la especificación y DEBE publicar cuántos prestadores fueron excluidos y por qué regla. NO DEBE excluir observaciones por criterio discrecional no declarado.

```gherkin
Escenario: Exclusión de atípicos
  Dado un modelo con regla de exclusión declarada
  Cuando se ejecuta sobre 240 prestadores y excluye 6
  Entonces el resultado publicado indica 234 prestadores incluidos y 6 excluidos
  Y detalla la regla que produjo cada exclusión
```

**Prioridad:** debe

### RF-BENCH-06 — Derecho de contradicción

CUANDO ACT-PRESTADOR radica una objeción sobre un resultado de benchmarking, el sistema DEBE marcar el resultado como `en_objecion` manteniéndolo visible, y DEBE registrar la respuesta técnica cuando exista.

```gherkin
Escenario: Objeción sobre puntaje de eficiencia
  Dado un puntaje publicado para un prestador
  Cuando el prestador radica objeción técnica
  Entonces el sistema marca el resultado como "en_objecion"
  Y el resultado sigue visible con la marca
  Y al resolverse, publica la respuesta junto al resultado
```

**Prioridad:** debe
**Depende de:** `docs/business_context.md` → FL-03

### RF-BENCH-07 — Lenguaje no sancionatorio

El sistema NO DEBE etiquetar prestadores con calificativos de desempeño (ineficiente, deficiente, incumplido) en ninguna salida pública. DEBE usar descripciones posicionales neutras respecto del grupo comparable.

```gherkin
Escenario: Etiqueta de salida
  Dado un prestador en el decil inferior de su grupo
  Cuando el portal presenta su resultado
  Entonces muestra su posición relativa y la distancia a la mediana del grupo
  Y NO usa las palabras "ineficiente", "deficiente" ni "incumple"
```

**Prioridad:** debe
**Origen:** no-objetivo: el Observatorio no es herramienta sancionatoria

## Requisitos no funcionales

### RNF-BENCH-01 — Trazabilidad de la corrida

Toda corrida publicada DEBE conservarse con su especificación y su snapshot de datos por al menos 10 años, alineado con RNF-SUI-02.

### RNF-BENCH-02 — Revisión metodológica periódica

La especificación de cada modelo DEBERÍA revisarse al menos una vez al año, evaluando su sesgo entre prestadores rurales y urbanos, y documentando el resultado de la revisión.

## Reglas de negocio

| ID | Regla | Aplica a |
|---|---|---|
| RN-BENCH-01 | Ningún resultado de benchmarking constituye calificación de cumplimiento normativo. | Todas |
| RN-BENCH-02 | Los datos en cuarentena NO DEBEN entrar a ningún modelo. | RF-BENCH-04 |
| RN-BENCH-03 | Un cambio de especificación crea una corrida nueva; nunca modifica una publicada. | RF-BENCH-04 |
| RN-BENCH-04 | La frontera de eficiencia se estima dentro del grupo comparable, nunca sobre el universo completo. | RF-BENCH-01 |

## Casos borde y errores

| Situación | Comportamiento esperado |
|---|---|
| Prestador con datos válidos en unas variables y en cuarentena en otras | Se excluye de la corrida; se publica el motivo, no un puntaje parcial |
| Grupo comparable con un solo prestador dominante en tamaño | Declarar la heterogeneidad en la nota del grupo; considerar subgrupo, nunca comparar sin advertencia |
| Serie con ruptura metodológica del indicador (RF-ONTO-04) | No mezclar versiones de ficha en una misma corrida |
| Resultados que cambian de signo entre DEA y SFA | Publicar ambos con su método declarado; NO elegir el más favorable ni el más desfavorable |
| Prestador que aparece y desaparece del grupo entre periodos | Panel no balanceado declarado como tal; no interpolar |

## Fuera de alcance de esta spec

- Fijación de metas de eficiencia o de factores de productividad regulatorios.
- Proyección de tarifas futuras (no-objetivo de V1).
- Publicación de rankings generales de prestadores.

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-BENCH-01 | ¿Qué variables estructurales definen el grupo comparable y quién las aprueba? | RF-BENCH-01 | Subdirección de Regulación |
| Q-BENCH-02 | ¿El benchmarking del Observatorio es informativo o alimenta procesos tarifarios? El efecto jurídico cambia el nivel de exigencia del módulo | Todo el módulo | Comisionados |
| Q-BENCH-03 | ¿Se publica el resultado individual por prestador o solo agregados por grupo? | RF-BENCH-01, RF-BENCH-07 | Dirección Ejecutiva |
| Q-BENCH-04 | ¿Se valida el umbral de 8 prestadores por grupo? | RF-BENCH-02 | Subdirección de Regulación |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial | Sesión de generación |
