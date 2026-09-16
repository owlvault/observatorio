---
id: adr-0005
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-13
fuentes: [decisión de Camilo Carvajalino 2026-09-13, análisis de práctica internacional (OFWAT, ERSAR, SUNASS, IB-NET, ADERASA)]
---

# ADR-0005 — Publicar a nivel de prestador individual, por fases y con salvaguardas

## Contexto

`Q-PORTAL-02` y `Q-BENCH-03` preguntaban si el Observatorio publica el dato por prestador o solo agregados territoriales. Es la decisión bisagra del proyecto: define el portal, el benchmarking, la exposición jurídica y el valor del instrumento.

La práctica internacional de reguladores maduros es homogénea: publican a nivel de entidad. OFWAT publica desempeño por compañía, con métricas de experiencia de usuario y control de fugas. ERSAR (Portugal) califica anualmente a cada prestador con semáforo de tres colores, sobre un universo de entidades de tamaño muy heterogéneo. SUNASS publica benchmarking por EPS. IB-NET es una base abierta a nivel de prestador. ADERASA compara entes con agrupación por pares.

La razón es funcional. Un observatorio que solo publica agregados territoriales no responde la única pregunta que el ciudadano hace —cómo está su prestador— y elimina el incentivo reputacional, que es el mecanismo por el cual este instrumento mejora el sector. Un promedio departamental no informa a nadie sobre su municipio.

El riesgo de señalamiento indebido es real, pero no se mitiga agregando: se mitiga con salvaguardas metodológicas.

## Decisión

Publicar a **nivel de prestador individual**, con cinco salvaguardas obligatorias y despliegue por fases.

**Salvaguardas:**

1. Todo valor se publica con su semáforo de calidad y su ficha metodológica (ya vigente por `ADR-0003`).
2. Toda comparación de eficiencia ocurre dentro de grupo comparable (ya vigente por `RF-BENCH-01`).
3. Derecho de contradicción con marca `en_objecion` visible (ya vigente por `RF-BENCH-06` y FL-03).
4. Prohibido el ranking compuesto de "mejores y peores" prestadores (ya vigente como no-objetivo).
5. **Nuevo:** ventana de revisión previa del prestador antes de su **primera** publicación. El prestador recibe su propio dato calculado y dispone de un plazo para observarlo antes de que sea público. Aplica solo a la primera vez que un indicador se publica para ese prestador, no a cada periodo: de lo contrario el Observatorio se vuelve un proceso de concertación permanente.

**Adicionalmente**, y siguiendo la práctica de ERSAR: el estado "no reportó" se publica como valor visible del prestador. No reportar no puede ser una forma de desaparecer del Observatorio; si lo fuera, el instrumento premiaría al que se esconde.

**Fases:**

- **Fase A:** prestadores del segmento grande, donde la calidad y regularidad del reporte al SUI es mayor.
- **Fase B:** ampliación a los demás segmentos, una vez medida la cobertura real de reporte en el informe de calidad de la Fase A.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Solo agregados territoriales | Cero riesgo de señalamiento individual | No responde la pregunta del ciudadano; sin incentivo reputacional; el benchmarking pierde sentido | Vacía de función al Observatorio |
| Prestador individual sin ventana de revisión previa | Publicación más rápida | La primera publicación es donde se concentra el riesgo de error no detectado | Se gana poco tiempo y se arriesga la credibilidad inicial |
| Prestador individual solo para segmento grande, permanente | Menor riesgo sobre prestadores pequeños | Deja fuera del control social justo donde el servicio es más débil | Se adopta como fase, no como estado final |
| Prestador individual por fases con salvaguardas (elegida) | Valor completo con riesgo acotado | Requiere operar la ventana de revisión previa | — |

## Consecuencias

**Positivas:** el Observatorio cumple su función de transparencia activa y habilita control social efectivo; alinea a la CRA con la práctica de reguladores comparables.

**Negativas:** aumenta el volumen esperado de objeciones, sobre todo en los primeros ciclos; exige capacidad de respuesta técnica sostenida (FL-03).

**Deuda que introduce:** hay que especificar el módulo de autenticación de prestadores para la ventana de revisión y para radicar objeciones, que hoy está declarado fuera de alcance en `specs/portal-publico.md`.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `specs/portal-publico.md` | `Q-PORTAL-02` queda cerrada; se agrega RF-PORTAL-10 (ventana de revisión previa) y RF-PORTAL-11 (publicar "no reportó" como estado); el módulo de autenticación de prestadores pasa de fuera de alcance a pendiente de spec |
| `specs/benchmarking-econometrico.md` | `Q-BENCH-03` queda cerrada: resultado individual publicado dentro de grupo comparable |
| `docs/business_context.md` | Los no-objetivos conservan la prohibición de ranking compuesto; se agrega la fase A/B al alcance |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Decisión tomada | Sesión con Camilo Carvajalino; análisis de práctica internacional |
