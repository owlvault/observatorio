---
id: adr-0014
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: propuesta
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026 arts. 2.1.1.1.2.2.9.1, 2.1.1.1.3.2.5.1-2 y 2.1.1.1.7.1.2, AGENTS.md (fuera de alcance), adr/ADR-0002]
---

# ADR-0014 — Los estudios de costos que la Res. 1038 manda remitir a la CRA son fuente complementaria del Observatorio, capturada por el curador y nunca cargada por el prestador

## Contexto

La Res. 1038 obliga a cada prestador a remitir su estudio de costos **a la CRA y a la SSPD**. El estudio incluye:
- el subsegmento;
- la línea base de los indicadores;
- las metas anuales que el prestador proyecta;
- en el S1, desde el año 2, las tarifas por estrato y uso.

Varias metas de la norma son **autoproyectadas**: cobertura, la senda del IPUF, la trayectoria de continuidad y las metas del Plan de Gestión del Esquema Diferencial (PGED). Sin esos datos no se puede calcular el estado frente a meta (RF-NMTPP-07).

El Context Lake dice que el Observatorio **no es un sistema de reporte** ni recibe cargues directos, y `adr/ADR-0002` hace del SUI la fuente autoritativa. Los formatos de la SSPD para estos datos no existen todavía (Q-NMTPP-10).

## Decisión

1. Los estudios de costos **recibidos por la CRA** son fuente complementaria del componente NMTPP, exclusivamente para: fecha de recepción, tipo de estudio, subsegmento declarado, opción del S2 por el S1, línea base, metas declaradas, tarifas por estrato y uso, y condición especial declarada de la APS.
2. La captura la hace el **ACT-CURADOR-DATOS**, a partir del radicado de la CRA, con referencia al documento (RF-NMTPP-04). El prestador no tiene canal de carga en el Observatorio.
3. Cuando el mismo dato exista en el SUI, el SUI prevalece para el valor observado. El estudio de costos solo aporta lo que el SUI no tiene (metas y línea base declaradas), y toda discrepancia se marca, sin corregirse (`adr/ADR-0002`).
4. Todo valor que venga de esta fuente se rotula "declarado por el prestador en su estudio de costos" (RN-NMTPP-08).
5. Si la CRA y la SSPD adoptan el anexo estructurado de Q-NMTPP-09, la captura pasa a ser una ingesta del archivo recibido, con las mismas reglas.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Esperar a que la SSPD publique formatos en el SUI | Mantiene una sola fuente | Sin fecha; se pierde el ciclo 2027 y el primer incentivo i-2 | Deja el componente sin metas durante años |
| Formulario web para que el prestador cargue metas | Rápido | Crea un canal de reporte paralelo, contra el fuera de alcance y competencia de la SSPD | Prohibido por `AGENTS.md` |
| No medir metas autoproyectadas | Simple | Pierde cobertura, IPUF sobre IPUF* y continuidad, el núcleo de la norma | Vacía el componente |

## Consecuencias

**Positivas:** Aprovecha un documento que la norma ya obliga a enviar a la CRA. No crea un canal nuevo.
**Negativas:** Carga operativa del curador, proporcional al número de estudios recibidos: puede ser alta (2.795 prestadores en RUPS). Riesgo de error de transcripción mientras no exista el anexo estructurado.
**Deuda que introduce:** Captura manual hasta cerrar Q-NMTPP-09. Hay que medir el volumen real de estudios recibidos en el primer trimestre de 2027.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `AGENTS.md` | Fuera de alcance: precisa que la captura por el curador de documentos que la norma manda remitir a la CRA no es un canal de reporte |
| `specs/seguimiento-nmt-pequenos-prestadores.md` | RF-NMTPP-04 |
| `specs/ingesta-sui-y-fuentes.md` | Pendiente: registrar "radicado CRA — estudio de costos" como fuente con linaje |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Propuesta | Spec del componente NMT de pequeños prestadores |
