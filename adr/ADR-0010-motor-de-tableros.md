---
id: adr-0010
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-14
fuentes: [Q-ARQ-09 (decisión de Camilo Carvajalino 2026-09-14), Propuesta_Observatorio_Regulatorio_CRA.docx §5, ADR-0004, ADR-0007, specs/portal-publico.md]
---

# ADR-0010 — Motor de tableros: híbrido al inicio, propio sobre OCI como estado final

## Contexto

La propuesta conceptual de la carpeta `09_` asume Power BI como motor de tableros. El Context Lake tenía el framework del portal "por decidir" (`AGENTS.md`, `docs/architecture.md`) y `ADR-0004` advirtió que algunas herramientas analíticas de uso común tienen menos integración nativa con OCI. La CRA ya construyó un tablero propio sobre OCI (Tablero de Control CIO, React y TypeScript con Chart.js) que cumple por construcción las condiciones de publicación, pero cada vista nueva cuesta desarrollo; Power BI produce exploraciones rápidas, pero no garantiza por sí mismo la compuerta de publicación ni la reconstrucción histórica.

Las condiciones que cualquier motor debe cumplir vienen de las specs y son independientes de la herramienta:

1. Lee exclusivamente el esquema `published` con usuario de solo lectura (`RN-PORTAL-01`, `ADR-0007`).
2. Muestra semáforo, motivo, fecha de corte y enlace a ficha junto a cada valor (`RF-PORTAL-02`).
3. Representa los estados de ausencia sin cero ni celda vacía (`RF-PORTAL-06`, `RF-PORTAL-11`).
4. Toda gráfica tiene tabla equivalente, navegación por teclado y contraste AA (`RF-PORTAL-05`).
5. Todo lo visible es descargable en CSV con `quality_flag`, fecha de corte y versión de ficha (`RF-PORTAL-03`).
6. Lo publicado en una fecha pasada se puede reconstruir (`RNF-PORTAL-03`); el versionado vive en `published`, no en el motor.
7. Los datos publicados no salen de la jurisdicción de la CRA sin decisión explícita (Plan de Investigación §5).

## Decisión

**Arquitectura híbrida al inicio, con migración gradual hasta un tablero propio sobre OCI como único motor.** Camilo Carvajalino fijó la trayectoria; este ADR fija la frontera entre los dos motores y el criterio de migración.

**Frontera durante la fase híbrida.** Lo que el ciudadano ve primero y lo que compromete jurídicamente a la CRA es propio; lo exploratorio puede ser Power BI.

| Capa | Motor | Razón |
|---|---|---|
| Portada, cifras destacadas, perfil por prestador, perfil territorial, fichas metodológicas, estados de ausencia, historial de correcciones, informe de calidad, descargas y API | **Propio** (patrón del Tablero CIO sobre OCI, usuario de solo lectura sobre `published`) | Son las superficies donde `RF-PORTAL-01/02/06/07/11` y `RNF-PORTAL-03` se hacen cumplir; deben estar bajo control total de la CRA desde el día uno |
| Exploraciones analíticas profundas (series largas, cruces multidimensionales, mapas temáticos) | **Power BI incrustado**, con las cinco reglas de abajo | Velocidad de producción mientras el tablero propio madura |

**Reglas para Power BI mientras exista:**

1. Su única fuente es el esquema `published`, con el mismo usuario de solo lectura del portal. Prohibido conectarlo a `conformed`, `quarantine`, `analytics` o a la zona cruda.
2. Todo informe incrustado declara en su primera pantalla fecha de corte, versión de ficha de cada indicador y semáforo; si el motor no puede mostrarlos junto al valor, el informe no se publica.
3. Todo informe incrustado tiene un espejo descargable en CSV servido por el tablero propio (`RF-PORTAL-03`); ningún dato existe solo dentro de Power BI.
4. Ningún informe incrustado se cita como fuente oficial ni se usa para la ventana de revisión previa de `RF-PORTAL-10`; lo oficial es lo que sirve el tablero propio.
5. Antes de incrustar el primer informe, el CIO documenta y aprueba: modalidad de incrustación y licenciamiento, conector a la Autonomous Database, residencia de los datos del conjunto publicado y resultado de la revisión de accesibilidad. Ninguno de estos cuatro puntos está en el Context Lake y no se infieren.

**Criterio de migración.** Una exploración pasa de Power BI al tablero propio cuando cumple cualquiera de estas condiciones: es consultada de forma recurrente (se mide con la analítica del micrositio), sostiene una cifra citada en un documento oficial de la CRA, o recibe una objeción de prestador. Power BI se retira cuando no queda ninguna exploración con esas marcas, o al cumplirse el plazo que fije el CIO en el plan de operación, lo que ocurra primero.

**Prueba de concepto.** Antes de construir, se implementa `IND-PER-01` (el mismo de `PoC-01`) en los dos motores y se verifican las siete condiciones. El resultado alimenta la primera revisión de este ADR.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Solo Power BI | Rápido; conocido por analistas | No garantiza condiciones 2, 3, 4 y 6 sin trabajo adicional; datos publicados fuera de OCI; `ADR-0004` advierte fricción | No cumple la compuerta por construcción |
| Solo propio desde el día uno | Control total; cumple las siete condiciones | Cada vista cuesta desarrollo; retrasa la exploración analítica de la Subdirección | Camilo Carvajalino optó por gradualidad |
| Híbrido permanente | Combina velocidad y control | Dos motores para siempre: dos verdades visuales, doble mantenimiento | Camilo Carvajalino fijó propio sobre OCI como estado final |
| Híbrido con migración gradual (elegida) | Arranca rápido; converge a control total | Exige disciplina para migrar y retirar | — |

## Consecuencias

**Positivas:** la Subdirección de Regulación explora desde el primer periodo publicado; las superficies con compromiso jurídico nacen bajo control de la CRA; la migración tiene criterio objetivo y no depende de una fecha arbitraria.

**Negativas:** durante la fase híbrida conviven dos motores, dos estilos visuales y dos ciclos de despliegue; hay que resistir la tentación de publicar en Power BI lo que debería ser propio.

**Deuda que introduce:** definir el stack concreto del tablero propio (se propone reutilizar el del Tablero CIO: React, TypeScript, Chart.js, despliegue en OCI) en `docs/architecture.md`; medir uso por vista para aplicar el criterio de migración; resolver los cuatro puntos de la regla 5.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `AGENTS.md` | Fila "Portal" del stack: híbrido con estado final propio sobre OCI; `Q-ARQ-09` cerrada |
| `docs/architecture.md` | Componente "Portal y API" deja de estar por decidir; se agrega el componente "Exploraciones incrustadas" con su restricción; `Q-ARQ-02` cerrada por `ADR-0011` |
| `specs/portal-publico.md` | Sección "Arquitectura de información" asigna cada componente a un motor; `RF-PORTAL-16` (exploraciones incrustadas) |
| `07_.../poc-01-ianc.md` | Actividad 6: PoC visual de `IND-PER-01` en ambos motores |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-14 | Decisión tomada: híbrido inicial, propio sobre OCI como estado final | Respuesta de Camilo Carvajalino a `Q-ARQ-09` |
