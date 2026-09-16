---
id: business-context
tipo: business
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-13
fuentes: [README_Context_Lake (Drive), Plan_de_Investigacion_y_Hoja_de_Ruta (Drive)]
---

# Contexto de negocio — Observatorio Regulatorio de Agua Potable y Saneamiento Básico

## Problema

La CRA regula acueducto, alcantarillado y aseo para todo el país, pero la evidencia que sustenta esa regulación está fragmentada en silos que no se hablan: el SUI (Superservicios) para datos de prestadores, SIASAR para el ámbito rural, SIRH del IDEAM para fuentes hídricas, DANE para demografía y estratificación, SISBÉN IV para focalización de subsidios, MinVivienda para inversión sectorial. Cada estudio regulatorio reconstruye a mano la misma línea base, con criterios distintos según el analista.

Tres consecuencias concretas:

1. **Los estudios tarifarios y las evaluaciones de impacto normativo empiezan desde cero** cada vez, con un costo de tiempo de analista que hoy no está medido (ver `Q-NEG-01`).
2. **No hay una serie comparable y pública** que permita responder "¿cómo está este municipio frente a municipios similares?" sin un ejercicio ad hoc.
3. **El ciudadano y el vocal de control no tienen dónde ver** cómo se comporta su prestador en calidad, continuidad y tarifa, lo que traslada toda la carga de control social a la PQR individual.

> **ASUNCIÓN (sin validar):** El costo del problema se describe cualitativamente porque no se dispone de línea base cuantitativa. Origen: no había cifras en el material fuente. Confirmar con la Subdirección de Regulación antes de fijar metas.

## Propuesta de valor

Un sustrato único de evidencia sectorial, público por defecto, que:

- **Para la CRA:** reduce el tiempo entre pregunta regulatoria y evidencia, y habilita Análisis de Impacto Normativo (AIR) ex-ante y ex-post con series comparables en lugar de cortes puntuales.
- **Para el prestador:** le muestra su posición frente a pares comparables y qué variables explican la brecha, antes de que sea materia de vigilancia.
- **Para el ciudadano y el vocal de control:** información comprensible y descargable sobre el servicio que paga, con la calidad del dato declarada.
- **Para otras entidades (MinVivienda, DNP, SSPD, entes territoriales):** una fuente común que evita que cada una publique su propia versión de la misma cifra.

## Modelo de negocio

El Observatorio **no genera ingresos**: es una función pública financiada con el presupuesto de la CRA. Su unidad económica relevante es el **costo por indicador mantenido al año** (ingesta + validación + publicación), porque determina cuántos indicadores puede sostener la entidad sin degradar la calidad. Publicar 200 indicadores desactualizados destruye más confianza institucional de la que crean 30 confiables.

El retorno se mide en horas de analista liberadas, reducción del tiempo de ciclo de los estudios regulatorios y cumplimiento de compromisos de transparencia activa y gobierno de datos (PNID, MRAE 3.0, ODS 6).

## Actores

| ID | Actor | Rol | Qué puede hacer | Qué NO puede hacer |
|---|---|---|---|---|
| ACT-CIUDADANO | Ciudadano, suscriptor, vocal de control | Externo, anónimo | Consultar tableros, descargar datos abiertos, leer fichas metodológicas | Ver datos personales de otros; alterar cifras |
| ACT-PRESTADOR | Persona prestadora de acueducto, alcantarillado o aseo | Externo, identificado | Consultar su posición en benchmarking; radicar objeción técnica sobre un dato publicado | Editar sus datos en el Observatorio; el canal de corrección es el SUI |
| ACT-ANALISTA-CRA | Analista de la Subdirección de Regulación | Interno | Definir fichas de indicador, ejecutar cálculos, revisar resultados, responder objeciones | Publicar sin aprobación del curador; modificar datos crudos |
| ACT-CURADOR-DATOS | Steward de datos (equipo de ciencia de datos) | Interno | Aprobar o rechazar la publicación de un lote; declarar cuarentena; fijar el semáforo de calidad | Definir la fórmula de un indicador (es del analista regulatorio) |
| ACT-COMISIONADO | Experto comisionado / Dirección Ejecutiva | Interno | Consumir evidencia para decisión regulatoria; solicitar análisis | Operar el sistema |
| ACT-CIO | CIO / Oficina Asesora de TI | Interno, accountable | Gobernar ontología, arquitectura y seguridad | Definir contenido regulatorio |
| ACT-SUI | Sistema Único de Información (SSPD) | Sistema externo | Entregar datos de prestadores | Recibir datos del Observatorio |
| ACT-AGENTE-IA | Agente autónomo de código o análisis | Sistema interno | Leer el Context Lake, proponer cálculos, generar borradores | Publicar al portal; responder oficialmente a un ciudadano; inferir parámetros regulatorios |

## Flujos operativos

### FL-01 — Ingesta y certificación periódica de datos

1. **ACT-SUI** publica el periodo de reporte → el sistema descarga los formatos definidos en `specs/ingesta-sui-y-fuentes.md`
2. El sistema registra linaje (fuente, formato, fecha de corte, fecha de descarga, hash) → almacena la versión cruda sin transformar
3. El sistema ejecuta las reglas de `specs/calidad-de-datos.md` → produce un informe de calidad por prestador y periodo
4. **ACT-CURADOR-DATOS** revisa el informe → aprueba, rechaza o declara cuarentena parcial
5. El sistema recalcula los indicadores del periodo → los deja en estado `listo_para_publicar`

**Disparador:** disponibilidad de un nuevo periodo de reporte en la fuente.
**Resultado esperado:** periodo cerrado, con indicadores calculados y semáforo de calidad asignado.
**Frecuencia y volumen:** mensual para SUI; anual o eventual para DANE, IDEAM y SIASAR. Orden de magnitud: miles de prestadores registrados y más de 1.100 municipios.
**Qué pasa si falla:** el periodo no se publica. Nunca se publica un periodo parcial sin declarar qué falta.

> **ASUNCIÓN (sin validar):** La periodicidad efectiva varía por formulario del SUI y por segmento de prestador. Origen: matriz de fuentes del README. Confirmar formulario por formulario antes de implementar RF-SUI-01.

### FL-02 — De la ficha metodológica al tablero público

1. **ACT-ANALISTA-CRA** redacta la ficha del indicador (fórmula, norma que la sustenta, unidad, desagregaciones, umbrales) → la registra en `05_Bateria_de_Indicadores`
2. **ACT-CIO** valida que los términos usados existan en `docs/glosario.md`
3. El sistema calcula el indicador sobre los periodos disponibles → genera la serie histórica
4. **ACT-CURADOR-DATOS** aprueba → el sistema publica indicador, ficha y semáforo simultáneamente
5. **ACT-CIUDADANO** consulta y descarga

**Disparador:** aprobación de una ficha nueva o de una versión nueva de ficha.
**Resultado esperado:** indicador publicado con su ficha y su serie, nunca uno sin el otro.
**Qué pasa si falla:** si la ficha no está aprobada, el indicador no aparece en el portal ni en la API.

### FL-03 — Objeción técnica de un prestador

1. **ACT-PRESTADOR** radica objeción sobre un valor publicado, identificando indicador, periodo y motivo
2. El sistema marca el valor como `en_objecion` en el portal, sin retirarlo
3. **ACT-ANALISTA-CRA** verifica contra el dato fuente
4. Si el error está en el dato fuente → el valor se mantiene y se remite al prestador al canal de corrección del SUI
5. Si el error está en el cálculo → se corrige la ficha o el pipeline, se recalcula la serie y se registra en el historial público de correcciones

**Disparador:** radicación de la objeción.
**Resultado esperado:** el valor queda confirmado o corregido, con traza pública.
**Qué pasa si falla:** ante duda no resuelta en el plazo, el valor permanece marcado `en_objecion`.

> **ASUNCIÓN (sin validar):** Existe un plazo de respuesta a la objeción; no se definió cuál. Ver `Q-NEG-02`.

### FL-04 — Análisis de observaciones a un proyecto regulatorio

1. **ACT-CIUDADANO** o **ACT-PRESTADOR** remite observaciones durante la participación de un proyecto de resolución
2. El sistema anonimiza datos personales e ingiere el texto
3. El sistema agrupa observaciones por tema y detecta duplicados y campañas de texto idéntico
4. **ACT-ANALISTA-CRA** revisa los grupos y redacta las respuestas oficiales
5. El sistema publica la matriz de observaciones y respuestas, con trazabilidad uno a uno

**Disparador:** cierre del periodo de participación de un proyecto regulatorio.
**Resultado esperado:** ninguna observación queda sin respuesta trazable.
**Qué pasa si falla:** si el agrupamiento no alcanza el umbral de calidad, el análisis se hace manualmente. El agrupamiento automático nunca sustituye la respuesta humana.

## Métricas de éxito

| Métrica | Línea base hoy | Objetivo | Cómo se mide |
|---|---|---|---|
| Indicadores publicados con ficha metodológica aprobada | 0 | 100% de los publicados | Conteo en el catálogo |
| Prestadores con datos completos para el periodo | desconocida | por definir | Informe de calidad, dimensión completitud |
| Tiempo de ciclo de un estudio regulatorio | desconocida | por definir | Registro de la Subdirección de Regulación |
| Consultas y descargas de datos abiertos | 0 | por definir | Analítica del portal |
| Observaciones ciudadanas con respuesta trazable | desconocida | 100% | Matriz de participación |

> **ASUNCIÓN (sin validar):** Las metas cuantitativas quedan sin fijar a propósito: fijar una meta sin línea base produce un indicador decorativo. Bloqueado por `Q-NEG-01`.

## Restricciones

| Restricción | Fuente |
|---|---|
| Competencias de la CRA y reparto con la SSPD | Ley 142 de 1994 |
| Marco general del sector de agua potable y saneamiento | Decreto 1077 de 2015 |
| Tratamiento de datos personales de participantes y suscriptores | Ley 1581 de 2012 |
| Transparencia activa y publicación de información pública | Ley 1712 de 2014 |
| Accesibilidad y estándares de publicación en sede electrónica | Resolución MinTIC 1519 de 2020 |
| Arquitectura empresarial del Estado y gobierno de datos | MRAE 3.0 MinTIC; PNID |
| El dato de prestadores se origina en el SUI, no en la CRA | Competencia legal de la SSPD |
| Infraestructura de nube institucional | OCI (hipótesis primaria, ver `adr/ADR-0004`) |

## No-objetivos

- **No sustituir el SUI ni crear un canal de reporte paralelo.**
- **No emitir juicios de cumplimiento con efecto jurídico** sobre un prestador.
- **No publicar rankings simples de "mejores y peores"** sin controlar por condiciones estructurales (tamaño, ruralidad, fuente de abastecimiento, topografía). Un ranking mal controlado castiga al prestador rural por serlo.
- **No levantar encuesta de percepción propia en V1.**
- **No construir modelos predictivos de tarifa futura en V1.** La proyección tarifaria tiene efectos de expectativa que exceden el alcance de un observatorio informativo.
- **No incluir datos de usuarios individuales**, ni siquiera seudonimizados, en el portal público.

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-NEG-01 | ¿Cuál es la línea base de tiempo de ciclo de estudios y de completitud de datos? | Métricas de éxito | Subdirección de Regulación |
| Q-NEG-02 | ¿Qué plazo y qué acto administrativo rigen la respuesta a una objeción de prestador? | FL-03 | Dirección Ejecutiva |
| Q-NEG-03 | ¿El Observatorio cubre prestadores rurales no registrados en el SUI (vía SIASAR) o solo los registrados? | Alcance de FL-01 | Comisionados |
| Q-NEG-04 | ¿Quién asume operativamente el rol ACT-CURADOR-DATOS y con qué dedicación? | FL-01 paso 4 | CIO |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial | Destilación del README y el Plan de Investigación en Drive |
