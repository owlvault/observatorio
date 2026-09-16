---
id: adr-0007
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-13
fuentes: [confirmación de Camilo Carvajalino 2026-09-13: Autonomous Database aprovisionada en OCI y despliegue sobre esa nube]
---

# ADR-0007 — Zona cruda en Object Storage y zonas conformada, analítica y de publicación en la Autonomous Database

## Contexto

La CRA cuenta con una **Autonomous Database ya aprovisionada en OCI**, y el despliegue del Observatorio se hará sobre esa nube. Eso cierra `Q-ARQ-01` y convierte `ADR-0004` en decisión aceptada.

Queda por resolver algo que la disponibilidad de la base no responde: **dónde vive cada una de las cinco zonas** del contrato lógico de `docs/architecture.md`. La tentación natural es meterlo todo en la base, porque ya está y funciona. Tres razones lo desaconsejan para la zona cruda:

1. `RNF-SUI-02` exige conservar diez años de snapshots, incluidos los `superseded`. Con la ventana de re-extracción de `RF-SUI-09`, el mismo periodo se materializa muchas veces. Eso es volumen que crece de forma monótona y que casi nunca se consulta.
2. La inmutabilidad de la zona cruda es hoy una convención (`RN-SUI-01`). En almacenamiento de objetos puede volverse una garantía técnica mediante reglas de retención, lo que es cualitativamente distinto de confiar en que nadie ejecute un `UPDATE`.
3. El almacenamiento por GB es sustancialmente más barato que el de la base, y la zona cruda es la que más crece y menos se lee.

## Decisión

**Zona cruda:** OCI Object Storage. Cada extracción se materializa como objeto inmutable, particionado por fuente, dominio y periodo de reporte, con el linaje de `RF-SUI-02` como metadatos del objeto. Se aplican reglas de retención para impedir borrado o sobrescritura durante el periodo de conservación. La Autonomous Database lee estos objetos cuando necesita reprocesar, sin copiarlos permanentemente.

**Zonas conformada, analítica y de publicación:** Autonomous Database, en **esquemas separados** con usuarios distintos:

| Zona | Esquema | Usuario que la escribe | Usuario que la lee |
|---|---|---|---|
| Conformada | `conformed` | proceso de conformación | motor de indicadores |
| Cuarentena | `quarantine` | proceso de conformación | analistas y curador, nunca el motor de indicadores |
| Analítica | `analytics` | motor de indicadores y motor analítico | proceso de publicación |
| Publicación | `published` | proceso de publicación | **usuario de solo lectura del portal y la API** |

Que el portal acceda con un usuario que solo tiene permiso de lectura sobre `published` convierte `RN-PORTAL-01` en un control técnico y no en una regla de disciplina. Un error de programación en el portal deja de poder alcanzar un dato en cuarentena, porque el permiso no existe.

**Extracción:** el proceso que consulta el SUI se ejecuta desde un componente de cómputo dentro de la VCN con ruta de red hacia el SUI, no desde la Autonomous Database. La base es el destino de la carga, no el origen de la conexión. Ver `Q-ARQ-06`.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Todo dentro de la Autonomous Database, incluida la zona cruda | Un solo componente; consultas más simples | Diez años de snapshots en la base; inmutabilidad solo por convención; costo por GB más alto | La zona cruda es el peor candidato para vivir en una base transaccional |
| Zona cruda en Object Storage y el resto también fuera de la base | Máxima flexibilidad de motor | Desaprovecha una base ya aprovisionada; agrega componentes a operar | Sin beneficio que compense |
| Un solo esquema para todas las zonas | Menos objetos que administrar | La separación cuarentena-publicación queda a merced de la disciplina del código | El riesgo de publicar un dato en cuarentena es el que más cuesta |
| Object Storage para cruda, esquemas separados en ADB (elegida) | Retención barata y verificable; separación de zonas por permisos | Dos tecnologías en el camino del dato | — |

## Consecuencias

**Positivas:** `Q-ARQ-01` y `Q-POC-03` quedan cerradas y la PoC puede materializar snapshots desde el primer día. La separación por permisos convierte dos reglas de negocio en controles técnicos.

**Negativas:** reprocesar desde la zona cruda implica leer desde almacenamiento de objetos, lo que es más lento que leer de una tabla. Es la contrapartida aceptada: se reprocesa pocas veces y se almacena siempre.

**Deuda que introduce:** hay que definir el formato físico de los objetos de la zona cruda. Un formato columnar comprimido reduce costo y acelera la relectura frente a texto plano, pero agrega una transformación entre la consulta y el objeto, lo que roza la regla de materializar sin transformar. La lectura estricta de `RF-SUI-01` favorece conservar el conjunto tal como lo devolvió la consulta. Ver `Q-ARQ-07`.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `docs/architecture.md` | La tabla de componentes deja de decir "por decidir"; se agrega la tabla de esquemas y el control de permisos del portal |
| `AGENTS.md` | Tabla de stack completa; `Q-ARQ-01` sale de preguntas abiertas |
| `adr/ADR-0004-despliegue-sobre-oci.md` | Pasa de `propuesta` a `aceptada` |
| `07_.../poc-01-ianc.md` | `Q-POC-03` cerrada: el snapshot se materializa en Object Storage desde el inicio |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Decisión registrada | Confirmación de Autonomous Database aprovisionada y despliegue en OCI |
