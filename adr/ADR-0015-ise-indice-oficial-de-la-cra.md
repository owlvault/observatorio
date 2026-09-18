---
id: adr-0015
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026 art. 2.1.1.1.1.3 y arts. 2.1.1.1.2.2.7.1-2 y Anexo 6.2.1.4, specs/portal-publico.md RN-PORTAL-05, docs/glosario.md (sinónimos prohibidos), adr/ADR-0005 salvaguarda 4, decisión de Camilo Carvajalino 2026-09-18]
---

# ADR-0015 — El ISE es un índice oficial que la Res. 1038 obliga a la CRA a publicar; el Observatorio lo muestra tal como se publica, con su descomposición, y eso prevalece sobre la prohibición general de índices compuestos

## Contexto

RN-PORTAL-05 prohíbe mostrar puntajes o índices que agreguen dimensiones distintas en un solo número. El glosario prohíbe el término "índice de eficiencia" y `adr/ADR-0005` (salvaguarda 4) prohíbe los rankings. Esas reglas existen para que el Observatorio **no construya** calificaciones propias sin control estructural.

La Res. CRA 1038 crea el **Índice Sintético de Eficiencia (ISE)** como medida regulatoria (art. 2.1.1.1.1.3): 3 dimensiones, 6 indicadores y ponderaciones fijadas en el Anexo 6.2.1.4. Además, ordena a la CRA **publicarlo anualmente por prestador** (art. 2.1.1.1.2.2.7.1 par. 2-3). El ISE tiene efecto tarifario directo sobre los costos de administración (CMA) y de operación general (CMOG). Si la CRA no lo publica, a los prestadores se les reconoce el ISE máximo.

El 2026-09-18, Camilo Carvajalino decidió que **"el ISE es un índice oficial que la propia Res. 1038 obliga a la CRA a publicar" prevalece**.

## Decisión

1. El ISE se publica en el Observatorio **porque es un acto regulatorio de la CRA**, no una construcción del Observatorio. La obligación de la norma prevalece sobre RN-PORTAL-05 **solo para el ISE oficial**.
2. El Observatorio **no calcula, no estima, no proyecta y no recalcula** el ISE. Ingiere la publicación de la CRA en `ise_publicacion` (RF-NMTPP-12).
3. El ISE siempre se muestra con su **descomposición completa**: las tres dimensiones con su peso, los seis indicadores, el porcentaje de eficiencia aplicable, el piso del año, los incentivos y el año evaluado (i-2).
4. Prohibido, aun para el ISE:
   - ordenar prestadores por ISE;
   - mostrar posiciones, cuartiles o "mejores y peores";
   - mostrarlo como velocímetro o barra 0-100 aislada;
   - promediarlo por territorio;
   - rotularlo "calificación" o "puntaje".
5. El término canónico es **"Índice Sintético de Eficiencia (ISE)"**. "Índice de eficiencia" suelto sigue prohibido como sinónimo, para no confundirlo con construcciones del Observatorio.
6. Ningún otro índice compuesto entra por esta vía. Un índice futuro solo se admite si una norma lo crea **y** obliga a publicarlo, y eso requiere un ADR nuevo.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Solo en la vista interna | Respeta RN-PORTAL-05 al pie de la letra | Oculta un acto oficial con efecto tarifario que la norma ordena publicar | Contradice la norma y la transparencia (Ley 1712) |
| Excluir el ISE del componente | Simple | Pierde la capa de eficiencia e incentivos, núcleo del marco | Vacía el seguimiento del S1 |
| Publicarlo sin restricciones de presentación | Máxima libertad de diseño | Abre la puerta a rankings | Viola `adr/ADR-0005` |

## Consecuencias

**Positivas:** El Observatorio muestra lo que la norma manda publicar, con la misma trazabilidad que el resto. La descomposición educa sobre qué mide el índice.
**Negativas:** Es la primera excepción a RN-PORTAL-05 y hay que vigilar que no se extienda. El ISE no es replicable mientras no se aclare la normalización (Q-NMTPP-04).
**Deuda que introduce:** Nota metodológica de la CRA pendiente (Q-NMTPP-04).

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `specs/portal-publico.md` | RN-PORTAL-05: agregar "salvo el ISE oficial en los términos de `adr/ADR-0015`" (pendiente de próxima versión) |
| `docs/glosario.md` | Término canónico ISE; nota en sinónimos prohibidos |
| `AGENTS.md` | Regla de oro 9 remite a esta excepción |
| `specs/seguimiento-nmt-pequenos-prestadores.md` | RF-NMTPP-12, RN-NMTPP-04 |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Aceptada | Decisión de Camilo Carvajalino en sesión |
