---
id: adr-0008
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-13
fuentes: [confirmación de Camilo Carvajalino 2026-09-13: la conexión al SUI es VPN site-to-person]
---

# ADR-0008 — Ingesta asistida por operador mientras no exista conectividad permanente al SUI

## Contexto

`Q-ARQ-06` preguntaba si había ruta de red desde la VCN de OCI hacia el SUI. La respuesta es que **no**: la conexión es VPN site-to-person, un túnel que existe únicamente mientras una persona identificada mantiene la sesión abierta desde su estación.

Esto invalida el supuesto central de `RF-SUI-01` y de `ADR-0007`. No hay ingesta desatendida posible: ningún proceso en OCI puede alcanzar el SUI por sí mismo. El pipeline completo queda colgando de que alguien se conecte.

Tres consecuencias que conviene nombrar sin adornos:

1. **La cadencia del Observatorio deja de ser una decisión técnica y pasa a ser una restricción de disponibilidad de personas.** No se puede prometer publicación mensual si el canal depende de que un funcionario tenga tiempo ese mes.
2. **Bus factor uno.** Si hay un solo operador autorizado, sus vacaciones son una interrupción del servicio de información pública.
3. **Riesgo de gobernanza sobre la credencial.** Automatizar la ejecución bajo la identidad nominal de una persona puede exceder las condiciones bajo las cuales la SSPD otorgó ese acceso. Ver `Q-GOB-03`.

La tentación aquí es doble y las dos salidas son malas: fingir que el problema no existe y escribir specs de ingesta automática que nunca podrán ejecutarse, o paralizar el proyecto hasta que exista conectividad permanente, lo que puede tardar más que todo lo demás junto.

## Decisión

Adoptar la **ingesta asistida por operador** como modo de operación vigente, declarada explícitamente como transitoria, y gestionar en paralelo la conectividad permanente.

1. **Estación de extracción.** Un operador autorizado inicia la sesión VPN desde una estación de la CRA y ejecuta desde allí un **paquete de extracción versionado**. El paquete ejecuta las consultas registradas, calcula los checksums y publica los conjuntos de resultados en OCI Object Storage. A partir de ese punto todo el pipeline sigue siendo automático.
2. **Lo único que cambia es el disparador.** El linaje (`RF-SUI-02`), la idempotencia (`RF-SUI-03`), la detección de mutación (`RF-SUI-04`), la inmutabilidad de la zona cruda y la prohibición de consultar el SUI en línea siguen vigentes sin excepción. Un disparador humano no autoriza un pipeline artesanal.
3. **Prohibido el SQL improvisado en producción.** El operador **NO DEBE** escribir consultas ad hoc para alimentar el lago. Ejecuta el paquete versionado y nada más. La exploración del esquema se hace en sesión aparte, y sus resultados **nunca** entran a la zona cruda. Sin esta regla, la trazabilidad se pierde en la primera semana.
4. **Cadencia comprometida igual a cadencia sostenible.** Se publica con la periodicidad que el canal soporta, no con la que sería deseable. Mientras el modo sea asistido: extracción mensual del periodo corriente y **re-extracción profunda trimestral** para la ventana de `RF-SUI-09`, porque cada re-extracción cuesta tiempo de operador y una ventana mensual completa no es sostenible a mano.
5. **Mínimo dos operadores autorizados.** No es redundancia deseable, es condición de continuidad.
6. **Credenciales nunca embebidas.** El paquete de extracción no contiene credenciales; el operador se autentica de forma interactiva. El paquete registra quién ejecutó cada extracción como parte del linaje.
7. **Vía estructural en paralelo, desde ya.** Gestionar con la SSPD conectividad permanente (site-to-site) o, alternativamente, entrega periódica de extractos hacia un destino que la CRA controle. Esta ADR queda superada el día que exista.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Esperar a la conectividad permanente antes de construir | Diseño limpio desde el inicio | El trámite interinstitucional no depende de la CRA y puede tardar más que el proyecto | Paraliza sin garantía de plazo |
| Mantener la sesión VPN abierta de forma permanente con la credencial nominal | Habilita automatización inmediata | Probable incumplimiento de las condiciones del acceso; credencial de persona usada como credencial de servicio | Riesgo de perder el acceso por completo |
| Construir sobre datos abiertos publicados del SUI en vez del acceso directo | Sin dependencia de personas | Menor granularidad y menor cobertura de variables | No sostiene la batería de indicadores V1 |
| Ingesta asistida con paquete versionado (elegida) | Desbloquea hoy sin degradar trazabilidad; transición natural a automatización | Cadencia limitada por disponibilidad humana | — |

## Consecuencias

**Positivas:** la PoC arranca esta semana. El paquete de extracción que se escriba ahora es exactamente el que se programará el día que haya conectividad permanente: cambia quién lo dispara, no qué hace.

**Negativas:** la frecuencia de actualización del Observatorio queda acotada por disponibilidad de personal, y eso debe comunicarse al público como fecha de corte, nunca disimularse. La ventana de re-extracción trimestral implica que una retransmisión del prestador puede tardar hasta tres meses en reflejarse.

**Deuda que introduce:** mientras el modo sea asistido, `RNF-SUI-01` (ventana de seis horas de ingesta) es irrelevante; lo que importa es cuánto dura una sesión de operador. PoC-01 debe medirlo.

**Riesgo que queda vivo y no se mitiga con esta decisión:** si el único canal de datos del Observatorio depende de la disponibilidad de dos funcionarios, el instrumento es frágil por diseño. La conectividad permanente no es una mejora opcional; es lo que convierte esto en un sistema.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `specs/ingesta-sui-y-fuentes.md` | RF-SUI-01 cambia de disparador programado a sesión de operador; RF-SUI-09 pasa a cadencia trimestral; se agregan RN-SUI-06 y RNF-SUI-05; nuevos casos borde de sesión |
| `docs/architecture.md` | El componente Ingestor deja de ser cómputo en la VCN y pasa a estación de extracción operada; `Q-ARQ-06` cerrada |
| `AGENTS.md` | Tabla de stack y preguntas abiertas |
| `07_.../poc-01-ianc.md` | `Q-POC-04` cerrada; se agrega la medición de duración de sesión de operador |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Decisión registrada | Confirmación de que la VPN al SUI es site-to-person |
