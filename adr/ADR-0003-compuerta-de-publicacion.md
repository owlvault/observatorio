---
id: adr-0003
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-13
fuentes: [decisión de sesión 2026-09-13 (V1 pública), Ley 1712 de 2014, README_Context_Lake directrices]
---

# ADR-0003 — Publicación abierta por defecto, con compuerta de ficha metodológica y semáforo de calidad

## Contexto

Se decidió que la versión 1 del Observatorio es una plataforma pública con portal y tableros abiertos, no un instrumento interno. Eso multiplica el valor y también el riesgo: una cifra pública equivocada sobre un prestador tiene consecuencias reputacionales para ese prestador y para la CRA, y una vez descargada no se puede recoger.

La tensión es entre publicar pronto para demostrar valor, y publicar solo lo que resiste escrutinio. Los observatorios que publican todo lo que tienen terminan defendiendo cifras que no pueden explicar; los que esperan a la perfección nunca publican.

## Decisión

Publicación **abierta por defecto**, sujeta a tres condiciones acumulativas que operan como compuerta: ficha metodológica aprobada, semáforo de calidad asignado, y aprobación explícita de ACT-CURADOR-DATOS.

El indicador, su ficha y su semáforo se publican **juntos o no se publican**. Un valor sin su ficha visible no existe para el público.

La separación de roles es parte de la decisión: quien define la fórmula (ACT-ANALISTA-CRA) no es quien aprueba la publicación (ACT-CURADOR-DATOS).

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Publicar todo lo ingerido, con advertencia general | Máxima transparencia y velocidad | Una advertencia genérica no impide que una cifra mala circule como oficial | El costo de una cifra errónea pública es asimétrico |
| Publicar solo tras validación con cada prestador | Máxima seguridad de la cifra | Inviable operativamente para miles de prestadores; convierte el observatorio en proceso de concertación | Paraliza la publicación |
| Compuerta de tres condiciones (elegida) | Velocidad razonable con responsabilidad asignada | Requiere que exista efectivamente el rol de curador con dedicación | — |

## Consecuencias

**Positivas:** todo lo público es explicable y trazable; el semáforo traslada al lector información honesta sobre la confianza del dato en lugar de esconderla.

**Negativas:** el ritmo de publicación depende de la capacidad del curador, que es un cuello de botella humano deliberado. Si no se asigna el rol con dedicación real, el Observatorio no publica.

**Deuda que introduce:** se necesita un flujo de aprobación con evidencia de quién aprobó qué y cuándo, que aún no está especificado como módulo.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `specs/ontologia-indicadores.md` | RF-ONTO-01 prohíbe calcular sin ficha; RN-ONTO-04 separa los roles |
| `specs/calidad-de-datos.md` | RF-CAL-04 obliga semáforo en todo valor publicado |
| `specs/portal-publico.md` | RF-PORTAL-01 y RF-PORTAL-02 implementan la compuerta |
| `docs/business_context.md` | Q-NEG-04 queda como bloqueante: sin curador asignado, la decisión no opera |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Decisión registrada | Sesión de generación; V1 definida como plataforma pública |
