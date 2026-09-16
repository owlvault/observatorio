---
id: adr-0012
tipo: adr
proyecto: observatorio-regulatorio-cra
estado: aceptada
actualizado: 2026-09-14
fuentes: [Q-ONTO-05 (criterio de Camilo Carvajalino 2026-09-14), specs/ontologia-indicadores.md RF-ONTO-05, ADR-0002, ADR-0005, práctica de IB-NET, ERSAR y JMP (OMS/UNICEF) en agregación de indicadores de prestadores a territorios]
---

# ADR-0012 — Agregación territorial: el prestador es la unidad, el territorio es la suma ponderada y visible de sus prestadores

## Contexto

La propuesta y el mockup de la carpeta `09_` muestran "cobertura nacional 92,4 %", "continuidad promedio 21,6 h" y un perfil municipal comparado con el departamento y con Colombia. La ontología solo definía valores por prestador y APS (`RF-ONTO-05`) y prohibía prorratear; no existía regla para subir de prestador a municipio, departamento o país. Sin regla, cada tablero agregaría a su manera y dos cifras "nacionales" distintas convivirían en el mismo portal.

Camilo Carvajalino fijó el criterio en `Q-ONTO-05`: la misión de la CRA es regular para el máximo cubrimiento de los ciudadanos en agua y aseo, por lo que la agregación debe permitir ver a las empresas prestadoras a nivel territorial. Es decir: el territorio no reemplaza al prestador, lo contiene.

Lo que enseña la práctica comparable: IB-NET y JMP publican agregados nacionales como cocientes de sumas (población servida sobre población total), no como promedios de porcentajes, porque el promedio simple de ratios sobre-representa a los prestadores pequeños; ERSAR publica por prestador y deriva los agregados nacionales declarando la cobertura de reporte que los sustenta; ninguno publica un agregado sin decir cuántas entidades lo componen.

## Decisión

**Regla general.** Todo agregado territorial se calcula desde los `indicator_value` a nivel prestador × APS × periodo, con la función de agregación declarada en la ficha del indicador, y se publica **siempre acompañado de la lista de prestadores que lo componen**, con el peso de cada uno y su estado (valor, semáforo, "no reportó", en cuarentena, en objeción). Un agregado sin su descomposición no se publica.

**Unidades territoriales.** Municipio (`divipola_code`), departamento y nacional, en ese orden de construcción: el departamento se calcula desde los mismos valores base, no desde los municipios ya agregados (evita doble ponderación). Zona urbana/rural solo cuando la fuente la reporta (`RF-ONTO-05`). La pertenencia de un prestador a un municipio se resuelve por su APS (`service_area`), nunca por su domicilio.

**Funciones de agregación por tipo de indicador.** Cada ficha declara una y solo una; la plantilla de ficha gana el campo 14 "Regla de agregación territorial".

| Tipo | Función | Indicadores V1 | Por qué |
|---|---|---|---|
| Cociente de conteos (cobertura) | **Cociente de sumas**: Σ numerador / Σ denominador (personas o viviendas servidas sobre personas o viviendas del territorio) | IND-COB-01, IND-COB-02, IND-COB-03 | Es la única lectura fiel de "cuántos ciudadanos tienen el servicio", que es la misión; un promedio de porcentajes no la responde |
| Cociente de volúmenes (pérdidas, tratamiento, aprovechamiento) | **Cociente de sumas** de los volúmenes | IND-PER-01, IND-ECI-01, IND-ECI-02 | Mismo principio; además, sumar volúmenes es sumar magnitudes físicas homogéneas |
| Intensidad por suscriptor o por unidad (continuidad, IPUF, costos medios, asequibilidad) | **Promedio ponderado por suscriptores facturados** (o por m3 facturados cuando la ficha lo indique) | IND-CON-01, IND-PER-02, IND-EFI-01, IND-EFI-02, IND-ASE-01 | El peso de un prestador en la experiencia del territorio es su número de suscriptores; ponderar por m3 solo cuando el indicador es por metro cúbico |
| Índice de riesgo (IRCA, IRABAm) | **Ponderado por población servida, más distribución por nivel de riesgo** (sin riesgo, bajo, medio, alto, inviable sanitariamente) | IND-CAL-01 | Un promedio de índice de riesgo oculta a los prestadores en riesgo alto; la distribución los hace visibles. Nunca en escala donde mayor sea mejor |
| Magnitudes financieras (subsidios, contribuciones, inversión) | **Suma**, en pesos del mismo año base y condición | IND-FIN-01, IND-INV-01 | Son flujos; el cociente (equilibrio, ejecución) se recalcula sobre las sumas |
| Resultados de benchmarking (DEA/SFA) | **No agregable** | — | La eficiencia es relativa a un grupo comparable; un "promedio de eficiencia territorial" no tiene significado (`RN-BENCH-04`) |

**Cobertura de reporte como condición de publicación.** Un agregado se publica solo si los prestadores con valor válido (no en cuarentena, no "no reportó") representan al menos un umbral de los suscriptores facturados del territorio. Por debajo del umbral se muestra "agregado no publicable: cobertura de reporte X %" con la lista de prestadores, y el ciudadano ve quién falta.

> **ASUNCIÓN (sin validar):** umbral de 80 % de suscriptores facturados representados, tanto para municipio como para departamento y nacional. Origen: práctica usual en estadística oficial para publicar agregados de encuestas administrativas; no acordado con la Subdirección de Regulación. Registrar como `Q-ONTO-06`.

**Semáforo del agregado.** Verde solo si todos los componentes son verdes y la cobertura de reporte es 100 %; amarillo si algún componente es amarillo o la cobertura está entre el umbral y 100 %; el motivo legible enumera los prestadores que lo degradan. Un agregado no puede tener mejor semáforo que su peor componente con peso material.

> **ASUNCIÓN (sin validar):** "peso material" es un componente con al menos 5 % de los suscriptores del territorio. Origen: propuesta de diseño. Parte de `Q-ONTO-06`.

**Comparaciones territoriales.** Municipio contra departamento y contra nacional se muestran con los tres agregados construidos con la misma función y la misma versión de ficha, y con la cobertura de reporte de cada uno. Comparar un municipio con cobertura de reporte 100 % contra un departamento con 60 % exige mostrar ambas coberturas.

**Lo que no cambia.** El prestador sigue siendo la unidad de publicación (`ADR-0005`); ningún valor de prestador se modifica para que el agregado cuadre (`ADR-0002`); no se prorratea un valor de prestador entre municipios de su APS: si un prestador sirve varios municipios y la fuente no desagrega, el valor se atribuye al conjunto de su APS y el perfil municipal lo muestra como "valor del prestador para toda su área de prestación".

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Promedio simple de valores de prestadores | Trivial | Un acueducto de 300 suscriptores pesa igual que uno de 2 millones; contradice la misión de cubrimiento de ciudadanos | No responde "cuántos ciudadanos" |
| Solo prestador, sin agregados | Cero ambigüedad | El ciudadano y el ente territorial preguntan por su municipio; la propuesta y el mockup lo exigen | Vacía el componente Territorios |
| Prorrateo del valor del prestador entre municipios por población | Perfil municipal completo | Inventa un dato que el prestador no reportó; viola `RF-ONTO-05` y `ADR-0002` | Prohibido |
| Cociente de sumas y ponderación declarada por ficha, con descomposición visible (elegida) | Fiel a la misión; reproducible; cada agregado enseña quién lo compone | Requiere suscriptores facturados y población o viviendas por APS en la zona conformada | — |

## Consecuencias

**Positivas:** una sola cifra nacional por indicador y periodo, reproducible desde `(indicator_code, version, period_id, snapshot)`; el perfil territorial responde a la vez "cómo está mi municipio" y "qué prestadores lo sirven y cómo está cada uno", que es lo que Camilo Carvajalino pidió; la cobertura de reporte hace visible al que no reporta también en el agregado.

**Negativas:** los primeros agregados nacionales de Fase A (solo segmento grande) tendrán cobertura de reporte parcial y se publicarán como "no publicable" o amarillos; hay que explicarlo en `RF-PORTAL-09`. Requiere denominadores territoriales (población o viviendas por municipio y zona, DANE) con fecha de corte declarada (`RF-SUI-08`).

**Deuda que introduce:** `Q-ONTO-06` (umbral y peso material); el campo 14 de la plantilla de ficha; la tabla de pesos (suscriptores facturados por prestador, APS y periodo) como producto de la zona conformada.

## Impacto en el Context Lake

| Archivo | Qué cambia |
|---|---|
| `specs/ontologia-indicadores.md` | Nuevo `RF-ONTO-09` (agregación territorial declarada por ficha, con descomposición y cobertura de reporte); `RN-ONTO-05` (ningún agregado sin descomposición); `Q-ONTO-05` cerrada; `Q-ONTO-06` abierta |
| `05_.../catalogo-v1.md` | Plantilla de ficha: campo 14 "Regla de agregación territorial"; columna de función por indicador |
| `specs/portal-publico.md` | `RF-PORTAL-13` (perfil territorial) y `RF-PORTAL-14` (cifras destacadas) dependen de `RF-ONTO-09` |
| `specs/calidad-de-datos.md` | Semáforo del agregado (extensión de `RF-CAL-04`) |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-14 | Decisión tomada con el criterio de misión fijado por Camilo Carvajalino; funciones por tipo propuestas para validación de la Subdirección de Regulación | Respuesta a `Q-ONTO-05` |
