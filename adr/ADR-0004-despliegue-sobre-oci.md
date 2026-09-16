---
id: adr-0004
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: propuesta
actualizado: 2026-09-13
fuentes: [contexto de infraestructura CRA; no confirmado para este proyecto]
---

# ADR-0004 — Desplegar sobre la infraestructura Oracle Cloud existente de la CRA

## Contexto

La CRA opera hoy sobre Oracle Cloud Infrastructure (OCI) como nube institucional. El Observatorio necesita almacenamiento de objetos para la zona cruda, un motor analítico, orquestación de ingesta y un portal público con disponibilidad y accesibilidad exigibles.

La alternativa de contratar una nube distinta por conveniencia técnica del proyecto choca con tres realidades del sector público: el proceso de contratación de una nube nueva tarda más que el proyecto, la entidad tendría dos planos de seguridad que gobernar, y el equipo de TI operaría tecnología que no conoce.

> **ASUNCIÓN (sin validar):** Que OCI sea la nube vigente de la CRA proviene del contexto institucional general, **no de una confirmación específica para este proyecto**. Esta decisión permanece en estado `propuesta` hasta que el CIO la confirme. Ver `Q-ARQ-01`.

## Decisión

Diseñar el Observatorio para desplegarse sobre la OCI existente de la CRA, con dos condiciones de diseño que reducen el costo de equivocarse:

1. Las especificaciones funcionales (`specs/`) se escriben **independientes del proveedor**: describen contratos de datos y comportamientos, no servicios de nube.
2. La ingesta, el cálculo y la publicación se separan en componentes con interfaces explícitas, de modo que sustituir un servicio gestionado no obligue a reescribir la lógica de dominio.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Nube nueva elegida por idoneidad técnica | Mejor ajuste a cargas analíticas | Contratación lenta; dos planos de seguridad; curva de aprendizaje del equipo | Costo institucional mayor que el beneficio técnico |
| Infraestructura on-premise en la entidad | Control total | Costo de capital y de operación; el portal público requiere elasticidad | No compite con nube ya contratada |
| Nube existente OCI (elegida, propuesta) | Aprovecha contratación, seguridad y conocimiento vigentes | Restringe el catálogo de servicios gestionados disponibles | — |

## Consecuencias

**Positivas:** tiempo al primer despliegue mucho menor; gobierno de identidad y seguridad reutilizado; sin proceso contractual nuevo.

**Negativas:** algunas herramientas analíticas de uso común tendrán menos integración nativa y exigirán trabajo adicional de operación.

**Deuda que introduce:** mientras esta decisión siga en estado `propuesta`, `docs/architecture.md` no puede pasar de contrato lógico a diseño físico, y ningún agente debe escribir infraestructura como código.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `docs/architecture.md` | La tabla de componentes mantiene "por decidir" hasta que esta decisión pase a `aceptada` |
| `AGENTS.md` | La tabla de stack declara OCI como hipótesis primaria, no como restricción firme |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Decisión propuesta, pendiente de confirmación del CIO | Sesión de generación |
