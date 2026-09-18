---
id: spec-seguimiento-nmt-pequenos-prestadores
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-18
fuentes: [Res. CRA 1038 de 2026 (03_), Documento Técnico NMTPPAA jun-2026 (03_), 07_/diagnostico-viabilidad-monitoreo-nmt-pp-acueducto-2026-09-18.md, specs/seguimiento-implementacion-nmt.md, specs/ontologia-indicadores.md, specs/portal-publico.md, adr/ADR-0003, ADR-0005, ADR-0012, ADR-0013, ADR-0014, ADR-0015]
---

# Spec — Seguimiento a la implementación del NMT de pequeños prestadores de acueducto (Res. CRA 1038 de 2026)

## Propósito

Fija qué construye el Observatorio para seguir la implementación de la **Res. CRA 1038 de 2026** en el servicio de **acueducto**, en el primer segmento (demás prestadores) y en el segundo (gestores comunitarios), incluidos los regímenes especiales de acueducto: APS con condiciones especiales estructurales y esquemas diferenciales rurales. El seguimiento se organiza en cuatro capas: adopción del marco, nivel de servicio frente a la meta de la norma, señales de eficiencia e incentivos publicadas por la CRA, y efecto tarifario.

**No cubre:**
- Alcantarillado. Queda para una versión posterior; el modelo de datos ya lo admite.
- Pilas públicas, autodiagnóstico, planes de gestión y contrato de condiciones uniformes. Se atienden por solicitud dirigida (RF-NMTPP-19) porque la norma no les asigna un canal de reporte.
- El cálculo del ISE. Lo calcula y publica la CRA; el Observatorio lo ingiere (`adr/ADR-0015`).
- La Res. 1032 (`specs/seguimiento-implementacion-nmt.md`) y la evaluación de impacto de la regulación.

## Contexto relevante

- Diagnóstico de viabilidad que origina esta spec: `07_Plan_de_Investigacion_y_Diseno_Observatorio/diagnostico-viabilidad-monitoreo-nmt-pp-acueducto-2026-09-18.md`.
- Parámetros regulatorios literales de la norma: `specs/nmtpp/parametros-res-1038.json`. Es la **única** fuente de metas, umbrales y fechas para el código.
- Indicadores y fichas: `05_Bateria_de_Indicadores_y_Dimensiones_Regulatorias/nmtpp/catalogo-nmtpp.md` y `ficha-NMTPP-*.md`.
- Aclaraciones pendientes que bloquean requisitos: `specs/aclaraciones-regulatorias-nmtpp.md` (Q-NMTPP-01 a 14).
- Prototipo del tablero: `specs/prototipo-tablero-nmtpp.md`.
- Decisiones: `adr/ADR-0013` (familia NMTPP), `adr/ADR-0014` (estudios de costos como fuente complementaria), `adr/ADR-0015` (ISE oficial), `adr/ADR-0003` (compuerta de publicación), `adr/ADR-0005` (publicación por prestador), `adr/ADR-0012` (agregación territorial).
- Reglas heredadas: RF-ONTO-01..09, RF-PORTAL-01/02/06/11, RN-PORTAL-04/05/06, RN-NMT-01..04.
- Términos: `docs/glosario.md` → Subsegmento, Gestor comunitario, Año tarifario, Línea base, Meta regulatoria, Meta declarada, Cierre de brecha, IPUF*, ISE, Incentivo tarifario, APS con condición especial estructural, Esquema diferencial rural, Estado frente a meta.
- Actores: ACT-ANALISTA-CRA, ACT-CURADOR-DATOS, ACT-COMISIONADO, ACT-CIUDADANO, ACT-PRESTADOR, ACT-SUI. Además, **ACT-SUBDIRECCION-REGULACION**: la Subdirección Técnica de Regulación, que responde las aclaraciones y es dueña de los parámetros regulatorios.

## Modelo de datos del componente

Extiende el modelo de `docs/architecture.md` y el de `specs/seguimiento-implementacion-nmt.md`. El DDL está en `specs/nmtpp/modelo-datos.sql`.

| Entidad | Llave | Campos clave | Origen del dato |
|---|---|---|---|
| `marco_tarifario` | `id` = `CRA-1038-2026` | norma, fecha_expedicion, inicio_aplicacion, vigencia_anios | `parametros-res-1038.json` |
| `subsegmento` | `id` (S1-1..S1-4, S2-1..S2-4) | segmento_id, min_exclusivo, max_inclusivo, regimen | ídem |
| `parametro_meta` | `marco_id` + `indicador` + `subsegmento_id` + `version` | estandar_operador, estandar_valor, unidad, tipo_meta, anio_cumplimiento, cierre_brecha_pct, articulo, bloqueado_por | ídem, versionado |
| `prestador_marco` | `provider_id` + `marco_id` | segmento_id, subsegmento_declarado, subsegmento_calculado_regla_mayor, subsegmento_calculado_regla_acueducto, suscriptores_ac_2024, suscriptores_al_2024, regimen, opcion_s2_a_s1, fecha_clasificacion | SUI (suscriptores a 31-dic-2024) + estudio de costos |
| `aps_marco` | `service_area_id` + `marco_id` | provider_id, divipola_code, zona, condicion_especial (lista de códigos), esquema_diferencial (`rural` \| `urbano` \| null), pila_publica | SUI + estudio de costos + listas públicas (IDEAM, DANE, PDET/ZOMAC, SSPD) |
| `estudio_costos` | `estudio_id` | provider_id, servicio, fecha_recepcion_cra, anio_tarifario, tipo (`inicial` \| `recalculo`), documento_ref | Radicado de la CRA (`adr/ADR-0014`) |
| `linea_base` | `provider_id` + `service_area_id` + `indicador` | valor, unidad, periodo_referencia, origen (`declarada` \| `sui`) | Estudio de costos; contraste con SUI |
| `meta_declarada` | `provider_id` + `service_area_id` + `indicador` + `anio_tarifario` | valor, unidad, estudio_id | Estudio de costos (`adr/ADR-0014`) |
| `valor_observado` | `indicator_value` de la ontología con `indicator_code` NMTPP-* | valor, unidad, quality_flag, status | SUI |
| `estado_meta` | `indicator_code` + `version` + `provider_id` + `service_area_id` + `anio_tarifario` | estado (catálogo de RN-NMTPP-03), meta_aplicada, origen_meta (`regulatoria` \| `declarada`), articulo | Calculado |
| `ise_publicacion` | `provider_id` + `servicio` + `service_area_id` + `anio_aplicacion` | anio_evaluado, ise_calculado, dim_tecnica, dim_administrativa, dim_financiera, valores de los 6 indicadores, pct_eficiencia_aplicable, piso_anio, incentivos (lista), ise_con_incentivos, fecha_publicacion, acto_ref | Publicación oficial de la CRA (`adr/ADR-0015`) |
| `tarifa_aplicada` | `provider_id` + `servicio` + `service_area_id` + `periodo` + `estrato_uso` | cargo_fijo, cargo_consumo, anio_base, condicion_monetaria | Estudio de costos (num. 10) y SUI |
| `hito` | `marco_id` + `codigo` | fecha_prevista, fecha_real, actor, articulo | `parametros-res-1038.json` → calendario |
| `aclaracion` | `q_id` (Q-NMTPP-NN) | estado (`abierta` \| `respondida` \| `incorporada`), fecha_respuesta, acto_ref, requisitos_bloqueados | `specs/aclaraciones-regulatorias-nmtpp.md` |

> **ASUNCIÓN (sin validar):** Los suscriptores al 31-dic-2024 por prestador y servicio se pueden obtener del SUI. Origen: el DT usa SUI/RUPS con corte a nov-2024. Confirmar la variable exacta con el mapeo diccionario-a-esquema antes de implementar RF-NMTPP-02.

## Requisitos funcionales

### RF-NMTPP-01 — Registro maestro del ámbito

El sistema DEBE mantener un registro versionado de los prestadores del ámbito de la Res. 1038, con una fila `prestador_marco` por prestador y una fila `aps_marco` por APS de acueducto, conforme a las cuatro condiciones del art. 2.1.1.1.1.1 evaluadas a 31-dic-2024. Una vez incluido, el prestador NO DEBE salir del registro durante la vigencia (par. 6).

```gherkin
Escenario: Prestador rural con más de 5.000 suscriptores
  Dado un prestador con 6.200 suscriptores de acueducto a 31-dic-2024, 3.400 de ellos rurales
  Cuando se construye el registro maestro
  Entonces el prestador queda en el ámbito de la Res. 1038
  Y queda en el subsegmento 1 de su segmento (art. 2.1.1.1.1.6 par. 5)

Escenario: Prestador urbano con 5.400 suscriptores
  Dado un prestador con 5.400 suscriptores, 300 rurales, y ninguna APS exclusivamente rural
  Cuando se construye el registro maestro
  Entonces el prestador NO queda en el ámbito de la Res. 1038
  Y el sistema registra el motivo "fuera de ámbito: más de 5.000 suscriptores con menos del 50 % rurales"

Escenario: Prestador que en 2027 supera los 5.000 suscriptores
  Dado un prestador del ámbito con 4.900 suscriptores en 2024 y 5.300 en 2027
  Cuando se actualiza el registro en 2027
  Entonces el prestador permanece en el ámbito y en su subsegmento original
```

**Prioridad:** debe · **Origen:** arts. 2.1.1.1.1.1 y 2.1.1.1.1.6

### RF-NMTPP-02 — Subsegmento calculado frente a declarado

El sistema DEBE calcular, para cada prestador, el subsegmento con **las dos reglas en conflicto**: la cifra mayor entre los suscriptores de acueducto y los de alcantarillado (Resolución) y los suscriptores de acueducto (DT). También DEBE compararlas con el subsegmento que el prestador declara en su estudio de costos. MIENTRAS Q-NMTPP-03 esté abierta, el sistema DEBE usar como vigente la regla de la Resolución y marcar la discrepancia.

```gherkin
Escenario: Discrepancia por regla de conteo
  Dado un prestador del S1 con 1.300 suscriptores de acueducto y 1.500 de alcantarillado a 31-dic-2024
  Cuando el sistema calcula el subsegmento
  Entonces el subsegmento por regla de la Resolución es S1-2 (1.500 > 1.400)
  Y el subsegmento por regla del DT es S1-3 (1.300 <= 1.400)
  Y el estado es "discrepancia de regla: Q-NMTPP-03"
  Y el tablero interno muestra ambos valores y el artículo de cada regla

Escenario: Declarado distinto del calculado
  Dado un prestador con subsegmento calculado S1-2 por ambas reglas
  Y subsegmento declarado S1-3 en su estudio de costos
  Cuando el ACT-ANALISTA-CRA abre su perfil
  Entonces ve "subsegmento declarado distinto del calculado" en la vista interna
  Y la vista pública muestra solo el subsegmento declarado, con la nota "clasificación declarada por el prestador"
```

**Prioridad:** debe · **Bloqueado parcialmente por:** Q-NMTPP-03 · **Indicador:** NMTPP-ADO-02

### RF-NMTPP-03 — Calendario de hitos del marco

El sistema DEBE mostrar los hitos H-01 a H-09 de `parametros-res-1038.json`, cada uno con fecha, actor responsable, artículo y estado: `cumplido`, `en curso`, `pendiente` o `vencido`. Un hito recurrente, como el recálculo anual o la publicación del ISE, DEBE generar una instancia por año tarifario.

```gherkin
Escenario: Publicación del ISE vencida
  Dado que hoy es 2028-09-01
  Y que no hay registros en ise_publicacion con anio_aplicacion 2029
  Cuando el ACT-COMISIONADO abre el calendario
  Entonces el hito H-06 de 2029 aparece como "vencido"
  Y aparece la nota "sin publicación, se reconoce el ISE máximo (art. 2.1.1.1.2.2.7.1 par. 2)"
```

**Prioridad:** debe · **Origen:** calendario del diagnóstico §4; reutiliza la entidad `hito` de RF-NMT-01

### RF-NMTPP-04 — Captura del estudio de costos recibido por la CRA

CUANDO la CRA radica un estudio de costos de un prestador del ámbito, el ACT-CURADOR-DATOS DEBE poder registrar en el sistema:

- fecha de recepción, tipo (`inicial` o `recalculo`), año tarifario y referencia documental;
- subsegmento declarado y la opción del segundo segmento por la metodología del primero;
- línea base por indicador;
- metas anuales declaradas por indicador;
- tarifas por estrato y uso.

El sistema NO DEBE aceptar estas cargas desde el prestador ni desde un canal externo (`adr/ADR-0014`).

```gherkin
Escenario: Estudio sin línea base de continuidad
  Dado un estudio de costos de un prestador del S1 sin valor de línea base de continuidad
  Cuando el ACT-CURADOR-DATOS guarda la captura
  Entonces el sistema guarda el estudio
  Y registra linea_base.continuidad como "no declarada"
  Y NO la reemplaza por el valor SUI ni por cero

Escenario: Intento de captura por un prestador
  Dado un usuario con rol ACT-PRESTADOR
  Cuando intenta crear un registro en estudio_costos
  Entonces el sistema rechaza la operación con "canal no habilitado: el reporte es al SUI (ADR-0014)"
```

**Prioridad:** debe · **Depende de:** Q-NMTPP-09 (formato de captura) · **Origen:** arts. 2.1.1.1.2.2.9.1, 2.1.1.1.3.2.5.1-2

### RF-NMTPP-05 — Indicadores de adopción

El sistema DEBE calcular NMTPP-ADO-01 (estudio de costos recibido), NMTPP-ADO-03 (APS reportada), NMTPP-ADO-04 (recálculo anual oportuno) y NMTPP-ADO-05 (gestores que optan por el S1) por segmento y subsegmento. El denominador DEBE ser el registro maestro de RF-NMTPP-01 en su versión vigente, y el valor DEBE publicarse con su fecha de corte y su denominador.

```gherkin
Escenario: Adopción por subsegmento
  Dado 40 prestadores del subsegmento S2-4 en el registro maestro
  Y 6 estudios de costos iniciales recibidos de ese subsegmento a 2027-03-31
  Cuando se calcula NMTPP-ADO-01 para S2-4 con corte 2027-03-31
  Entonces el valor es 15,0 % (6/40)
  Y se muestra "6 de 40 prestadores" junto al porcentaje

Escenario: Recálculo fuera de ventana
  Dado un recálculo 2028 recibido el 2028-06-15
  Cuando se evalúa NMTPP-ADO-04 para 2028
  Entonces el prestador cuenta como "recálculo fuera de ventana (1-ene a 31-may)"
```

**Prioridad:** debe · **Origen:** fichas NMTPP-ADO-01..05

### RF-NMTPP-06 — Parámetros regulatorios cargados desde la norma

El sistema DEBE leer metas, estándares, años de cumplimiento, porcentajes de cierre de brecha, pisos del ISE, porcentajes de incentivo y calendario **exclusivamente** de `parametro_meta`, cargado desde `specs/nmtpp/parametros-res-1038.json` y versionado. El código NO DEBE contener literales de metas. SI un parámetro vale `null` con `bloqueado_por`, ENTONCES el sistema NO DEBE sustituirlo por ningún valor.

```gherkin
Escenario: Meta anual intermedia inexistente en la norma
  Dado el parámetro MICROMEDICION de S1-4, con año de cumplimiento 5 y metas intermedias null (Q-NMTPP-08)
  Cuando el sistema evalúa a un prestador de S1-4 en el año tarifario 2
  Entonces el estado es "no exigible aún (meta al año 5)" si no hay meta declarada
  Y NO interpola una meta lineal
```

**Prioridad:** debe · **Origen:** regla de oro 1 de `AGENTS.md`

### RF-NMTPP-07 — Estado frente a meta

CUANDO exista un valor observado válido de un indicador de nivel de servicio para un prestador, una APS y un año tarifario, el sistema DEBE asignar exactamente un estado del catálogo RN-NMTPP-03, usando:

- la meta regulatoria del subsegmento si la norma la fija para ese año;
- la meta declarada si la norma remite a la proyección del prestador.

El estado DEBE mostrar el origen de la meta (`regulatoria`, con artículo, o `declarada por el prestador`, con el estudio de costos de donde sale).

```gherkin
Escenario: Micromedición en meta en el año de cumplimiento
  Dado un prestador de S1-1 con IMI 2027 = 100,0 %
  Cuando se evalúa NMTPP-S1-MIC para 2027
  Entonces el estado es "meta cumplida" con origen "regulatoria, art. 2.1.1.1.2.1.2"

Escenario: Micromedición bajo meta en el año de cumplimiento
  Dado un prestador de S1-2 con IMI 2028 = 91,4 %
  Cuando se evalúa NMTPP-S1-MIC para 2028
  Entonces el estado es "meta no alcanzada en el año de cumplimiento"

Escenario: IPUF frente a senda declarada
  Dado un prestador de S1-3 con IPUF 2027 = 8,2 m3/suscriptor/mes
  Y meta declarada 2027 = 8,5 m3/suscriptor/mes
  Cuando se evalúa NMTPP-S1-PER
  Entonces el estado es "en trayectoria (meta declarada)"
  Y la vista muestra además la brecha frente a IPUF* = 6: 2,2 m3/suscriptor/mes

Escenario: Sin valor reportado
  Dado un prestador sin reporte SUI de micromedición para 2027
  Cuando se evalúa NMTPP-S1-MIC para 2027
  Entonces el estado es "no reportó"
  Y NO es "meta no alcanzada"
```

**Prioridad:** debe · **Depende de:** RF-NMTPP-06, RF-NMTPP-04 · **Regla:** RN-NMTPP-03, RN-NMTPP-05

### RF-NMTPP-08 — Continuidad con meta suspendida hasta aclaración

El sistema DEBE calcular el índice de continuidad con la fórmula del segmento: S1 según el Anexo 6.2.1.10 a), en horas/día; S2, APS especiales y esquemas rurales según el literal b), en %. MIENTRAS Q-NMTPP-01 o Q-NMTPP-02 estén abiertas, el sistema DEBE publicar el valor observado y la línea base, y DEBE asignar el estado "meta pendiente de aclaración normativa" en lugar de evaluar el cierre de brecha.

DONDE la bandera de configuración `continuidad_equivalencia_24h` esté activa, que solo se activa con la respuesta a Q-NMTPP-01, el sistema DEBE convertir el porcentaje a horas/día multiplicando por 24 y evaluar el cierre de brecha.

```gherkin
Escenario: Continuidad S1 con aclaración abierta
  Dado Q-NMTPP-01 abierta
  Y un prestador de S1-1 con IC 2029 = 22,9 h/día y línea base declarada 21,5 h/día
  Cuando se evalúa NMTPP-S1-CON para 2029
  Entonces el portal muestra 22,9 h/día y la línea base 21,5 h/día
  Y el estado es "meta pendiente de aclaración normativa (Q-NMTPP-01)"
  Y NO muestra "en meta" ni "bajo meta"

Escenario: Continuidad S1 con equivalencia confirmada
  Dado Q-NMTPP-01 respondida confirmando 97,26 % = 23,34 h/día
  Y la bandera continuidad_equivalencia_24h activa
  Y un prestador de S1-1 con línea base 21,5 h/día e IC 2029 = 22,9 h/día
  Cuando se evalúa NMTPP-S1-CON para 2029
  Entonces la brecha inicial es 1,84 h/día y la meta de 2029 es 22,79 h/día (cierre del 70 %)
  Y el estado es "meta cumplida"
```

**Prioridad:** debe · **Bloqueado por:** Q-NMTPP-01, Q-NMTPP-02, Q-NMTPP-08

### RF-NMTPP-09 — IRCA sin canal confirmado

MIENTRAS Q-NMTPP-06 esté abierta, el sistema DEBE mostrar NMTPP-S1-CAL y NMTPP-S2-CAL con el estado "sin fuente confirmada" y la nota "la Res. 1038 exige IRCA ≤ 5 % desde el inicio, pero no designa fuente ni canal de reporte". NO DEBE sustituir el IRCA por el componente "reporte y calidad del agua" del ISE ni por otro proxy.

**Prioridad:** debe · **Bloqueado por:** Q-NMTPP-06 · **Regla:** RN-PORTAL-06 (escala de riesgo, mayor es peor)

### RF-NMTPP-10 — APS con condición especial estructural

CUANDO una APS del S1 tenga al menos una condición especial estructural (INSULAR, IVH, IPM, PDET_ZOMAC, TOMA_POSESION), el sistema DEBE evaluar calidad, continuidad, micromedición y macromedición de **esa APS** con las fórmulas y estándares del S2, y DEBE mostrar la marca "régimen especial" y la condición que lo origina. Las demás APS del mismo prestador se evalúan con el régimen de su segmento.

```gherkin
Escenario: Prestador del S1 con una APS PDET
  Dado un prestador de S1-2 con APS "A" en municipio PDET y APS "B" sin condición
  Cuando se evalúa la continuidad 2029
  Entonces la APS "A" se evalúa contra 86,3 % con la fórmula del literal b)
  Y la APS "B" se evalúa con el régimen del S1
  Y el perfil muestra "APS A: régimen especial — PDET"
```

**Prioridad:** debe · **Origen:** art. 2.1.1.1.4.1 · **Indicador:** NMTPP-ESP-01

### RF-NMTPP-11 — No regresividad

CUANDO el valor observado de micromedición, continuidad, macromedición o cobertura de un prestador sea inferior a su línea base, el sistema DEBE asignar además el estado "regresión frente a línea base" y DEBE mostrarlo en la vista interna. En la vista pública DEBE mostrarse como dato, sin calificativo de incumplimiento.

**Prioridad:** debe · **Origen:** arts. 2.1.1.1.1.4 par. 4; 2.1.1.1.2.1.1 par. 6; 2.1.1.1.3.1.1 par. 4 · **Indicador:** NMTPP-NRG-01

### RF-NMTPP-12 — ISE oficial publicado por la CRA

CUANDO la CRA publique el ISE de un año de aplicación, el sistema DEBE ingerir la publicación en `ise_publicacion` sin recalcularla y DEBE mostrar, por prestador, servicio y APS:

- el ISE calculado y su descomposición en las 3 dimensiones y los 6 indicadores;
- el porcentaje de eficiencia aplicable, con el piso del año;
- los incentivos reconocidos y el ISE con incentivos;
- el año evaluado (i-2).

El sistema NO DEBE ordenar prestadores por ISE, ni mostrarlo como velocímetro, barra 0-100 aislada o posición relativa (`adr/ADR-0015`).

```gherkin
Escenario: Consulta del ISE de un prestador
  Dado una publicación de la CRA para 2029 con ISE calculado 74,2 para un prestador de S1-2
  Cuando el ACT-CIUDADANO abre el perfil del prestador
  Entonces ve "ISE 2029 (evaluado con datos de 2027): 74,2"
  Y ve las tres dimensiones con su peso (49,4 / 14,0 / 36,6) y su valor
  Y ve "porcentaje de eficiencia aplicable: 90 % (piso del año 3)"
  Y NO ve la posición del prestador frente a otros

Escenario: Intento de ranking
  Dado la vista de prestadores del S1-2
  Cuando un usuario intenta ordenar la tabla por ISE
  Entonces la columna ISE no es ordenable
  Y la tabla conserva el orden alfabético
```

**Prioridad:** debe · **Origen:** arts. 2.1.1.1.2.2.7.1-2; `adr/ADR-0015` · **Indicador:** NMTPP-ISE-01

### RF-NMTPP-13 — Oportunidad de la publicación del ISE

El sistema DEBE calcular NMTPP-ISE-02 como la fecha de publicación del ISE frente al límite de 4 meses antes del año tarifario. SI no hay publicación al día siguiente del límite, ENTONCES DEBE alertar en la vista interna a ACT-COMISIONADO y ACT-ANALISTA-CRA.

**Prioridad:** debe · **Origen:** art. 2.1.1.1.2.2.7.1 par. 2

### RF-NMTPP-14 — Incentivos reconocidos

El sistema DEBE mostrar, por año de aplicación, cuántos prestadores del S1 recibieron cada uno de los seis incentivos: continuidad y pérdidas sobre el CMOG; micromedición, asociatividad, buen gobierno y reporte sobre el CMA. Cada cifra DEBE ir con el porcentaje del año, el año evaluado (i-2) y el artículo. El dato proviene de la publicación de la CRA; el Observatorio NO DEBE determinar la procedencia de un incentivo.

**Prioridad:** debe · **Indicadores:** NMTPP-INC-01, NMTPP-INC-02

### RF-NMTPP-15 — Tarifas por estrato y uso frente al referente ex ante

El sistema DEBE mostrar NMTPP-TAR-01 para cada prestador, desagregado por estrato y uso, con año base y condición monetaria. El referente del DT (Anexo 13: +18,1 % en el S1 y +6,1 % en el S2) DEBE rotularse "estimación ex ante del regulador — no es meta ni tope".

```gherkin
Escenario: Tarifa sin desagregación
  Dado un estudio con una sola tarifa sin estrato ni uso
  Cuando el sistema prepara NMTPP-TAR-01
  Entonces no se publica
  Y queda en el informe de calidad con la causa "falta desagregación por estrato y uso" (RN-NMT-03)
```

**Prioridad:** debería · **Regla:** RN-PORTAL-04, RN-NMT-03

### RF-NMTPP-16 — Filtros y no comparabilidad

El sistema DEBE permitir filtrar por segmento, subsegmento, régimen especial, departamento, municipio (`divipola_code`) y año tarifario. CUANDO una vista incluya prestadores de subsegmentos distintos en un mismo indicador de nivel de servicio, el sistema DEBE mostrar la nota "metas distintas por subsegmento: no comparar valores entre subsegmentos". El sistema NO DEBE combinar valores de la Res. 1038 con valores de la Res. 1032.

**Prioridad:** debe · **Regla:** RN-NMTPP-02, RF-ONTO-06, regla de oro 10

### RF-NMTPP-17 — Vista pública y vista interna

El sistema DEBE separar dos vistas:

- **Pública:** solo indicadores que pasan la compuerta de `adr/ADR-0003`, con estados y notas en lenguaje no técnico.
- **Interna** (ACT-ANALISTA-CRA, ACT-COMISIONADO, ACT-CURADOR-DATOS): discrepancias de subsegmento, regresiones, hitos vencidos, aclaraciones abiertas y alertas del ISE.

Ninguna alerta interna DEBE aparecer en la vista pública.

**Prioridad:** debe · **Origen:** RF-NMT-11; `adr/ADR-0005`

### RF-NMTPP-18 — Trazabilidad de aclaraciones

El sistema DEBE mostrar, junto a cada indicador o estado bloqueado, el identificador Q-NMTPP y su texto corto. CUANDO la ACT-SUBDIRECCION-REGULACION responda una aclaración y el ACT-ANALISTA-CRA la incorpore, el sistema DEBE:

- crear una versión nueva de la ficha afectada (RF-ONTO-04);
- recalcular los estados desde el primer año tarifario afectado;
- registrar la corrección en el historial público (RF-PORTAL-07).

```gherkin
Escenario: Respuesta a la regla de subsegmentación
  Dado Q-NMTPP-03 respondida adoptando la regla de acueducto
  Cuando el ACT-ANALISTA-CRA incorpora la respuesta
  Entonces NMTPP-ADO-02 pasa a la versión 2
  Y 3 prestadores cambian de subsegmento calculado
  Y el historial público registra el cambio con la referencia al acto de respuesta
```

**Prioridad:** debe

### RF-NMTPP-19 — Solicitud dirigida de información

El sistema PUEDE registrar solicitudes de información hechas por la CRA a prestadores con base en el art. 2.1.1.1.7.1.2 (muestras de pilas públicas, autodiagnóstico, plan de gestión, contrato de condiciones uniformes), con fecha, alcance, respuesta y soporte. Estos resultados NO DEBEN publicarse como indicador censal; solo como contenido editorial (RF-PORTAL-15) que declara la muestra.

**Prioridad:** puede

## Requisitos no funcionales

### RNF-NMTPP-01 — Reconstrucción histórica

El sistema DEBE reconstruir el estado de cualquier vista del componente en cualquier fecha pasada, con las versiones de ficha y de `parametro_meta` vigentes en esa fecha (RNF-PORTAL-03).

### RNF-NMTPP-02 — Determinismo

Dos ejecuciones con el mismo snapshot, la misma versión de ficha y los mismos parámetros DEBEN producir estados idénticos (RNF-ONTO-01).

### RNF-NMTPP-03 — Oportunidad frente a la publicación del ISE

CUANDO la CRA publique el ISE, el sistema DEBE reflejarlo en el tablero a más tardar 5 días hábiles después de que la publicación se radique en el Observatorio.

### RNF-NMTPP-04 — Accesibilidad

Todas las vistas DEBEN cumplir RF-PORTAL-05 (WCAG 2.1 AA). Todo estado se codifica con color, ícono y texto.

## Reglas de negocio

| ID | Regla | Aplica a |
|---|---|---|
| RN-NMTPP-01 | El subsegmento se fija una vez con datos a 31-dic-2024 y no se recalcula por crecimiento del prestador; solo cambia por respuesta a Q-NMTPP-03 o por corrección del dato de 2024. | RF-NMTPP-01, 02 |
| RN-NMTPP-02 | Solo se comparan valores de nivel de servicio dentro del mismo subsegmento y régimen. Nunca se agregan con la Res. 1032. | RF-NMTPP-16 |
| RN-NMTPP-03 | Catálogo cerrado de estados frente a meta: `meta cumplida`, `en trayectoria`, `fuera de trayectoria`, `meta no alcanzada en el año de cumplimiento`, `no exigible aún`, `no reportó`, `meta no declarada`, `meta pendiente de aclaración normativa`, `sin fuente confirmada`, `no aplica`. Ningún otro estado es válido, y ninguno se representa como cero. | RF-NMTPP-07..11 |
| RN-NMTPP-04 | El ISE solo se muestra tal como lo publica la CRA, con su descomposición. El Observatorio no lo calcula, no lo estima, no lo proyecta y no lo ordena. | RF-NMTPP-12 |
| RN-NMTPP-05 | Todo estado frente a meta lleva la leyenda "seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD" en la vista pública. | RF-NMTPP-07; fuera de alcance de `AGENTS.md` |
| RN-NMTPP-06 | Todo dato con consecuencia tarifaria se rotula con el año de aplicación y el año evaluado (i-2). | RF-NMTPP-12, 14 |
| RN-NMTPP-07 | Si la Resolución y el DT difieren, prevalece la Resolución y la diferencia queda como pregunta abierta. | Todo el componente |
| RN-NMTPP-08 | Una meta declarada por el prestador se muestra siempre con la leyenda "meta declarada por el prestador en su estudio de costos", nunca como meta regulatoria. | RF-NMTPP-07 |
| RN-NMTPP-09 | Una publicación de la CRA posterior al límite de RF-NMTPP-13 no se reescribe: se registra con su fecha real. | RF-NMTPP-13 |

## Casos borde y errores

| Situación | Comportamiento esperado |
|---|---|
| Gestor comunitario que optó por la metodología del S1 | Se evalúa con metas y fórmulas del S1 y se le asigna subsegmento S1 por número de suscriptores. Se marca `opcion_s2_a_s1 = true` y la marca se muestra en el perfil |
| Prestador sin información completa que usa valores estimados (art. 2.1.1.1.1.7 par. 5) | La línea base se marca `estimada` y el estudio queda con estado "recalcular al tener un año completo" |
| Prestador nuevo después de 2027 (par. 1, 4) | Entra al registro con el subsegmento de su catastro; su línea base se toma del periodo de observación de 90 días (Anexo 6.2.1.11) y su año 1 empieza en su fecha de inicio |
| Sustitución de prestador (art. 2.1.1.1.1.1 par. 5; art. 2.1.1.1.1.7 par. 7) | El sustituto hereda ámbito y subsegmento; la serie se muestra con marca de ruptura en la fecha de sustitución |
| Interrupción excluida por evento natural extremo | El valor observado es el que reportó el prestador; el Observatorio no reconstruye exclusiones. Si la fuente distingue horas excluidas, se muestran aparte |
| APS con dos condiciones especiales (p. ej. IVH y PDET) | Se listan ambas; el tratamiento es el mismo |
| Prestador insular | ISE "no aplica (zona insular)"; no se cuenta como sin publicación |
| Costos unificados entre APS | Se muestra el ISE en el nivel publicado por la CRA (APS o conjunto) y se declara el nivel (Q-NMTPP-13) |
| Estudio recibido de un prestador fuera del registro maestro | El estudio se guarda y el curador recibe la alerta "prestador no está en el registro maestro: revisar ámbito" |
| Valor fuera de rango (micromedición > 100 %, IPUF negativo) | Cuarentena según `specs/calidad-de-datos.md`; estado "no reportó (valor en cuarentena)" |

## Fuera de alcance de esta spec

- Alcantarillado, pilas públicas y esquemas diferenciales urbanos (ver Propósito).
- Proyección de tarifas o del ISE futuros.
- Cálculo propio de incentivos o descuentos.
- Evaluación de impacto ex post del marco.

## Preguntas abiertas

Las catorce aclaraciones normativas están detalladas en `specs/aclaraciones-regulatorias-nmtpp.md`. Resumen:

| ID | Pregunta corta | Bloquea | Responsable |
|---|---|---|---|
| Q-NMTPP-01 | Unidad del índice de continuidad del S1 (h/día o %) y regla de conversión | RF-NMTPP-08; NMTPP-S1-CON | Subdirección Técnica de Regulación |
| Q-NMTPP-02 | Línea base de continuidad: situación real o meta de la Res. 825 | RF-NMTPP-08; NMTPP-S1-CON, S2-CON | Subdirección Técnica de Regulación |
| Q-NMTPP-03 | Subsegmentación: cifra mayor o suscriptores de acueducto | RF-NMTPP-02; NMTPP-ADO-02 | Subdirección Técnica de Regulación |
| Q-NMTPP-04 | Normalización del ISE | Réplica de NMTPP-ISE-01 | Subdirección Técnica de Regulación |
| Q-NMTPP-05 | Fe de erratas de remisiones internas | Codificación de reglas | Subdirección Técnica de Regulación / Oficina Jurídica |
| Q-NMTPP-06 | Fuente, canal y regla temporal del IRCA | RF-NMTPP-09 | Subdirección Técnica de Regulación |
| Q-NMTPP-07 | Denominador del IPUF y agua producida sin macromedición | NMTPP-S1-PER | Subdirección Técnica de Regulación |
| Q-NMTPP-08 | Metas anuales intermedias para incentivos y seguimiento | RF-NMTPP-06, 07, 08, 14 | Subdirección Técnica de Regulación |
| Q-NMTPP-09 | Formato estructurado de línea base y metas declaradas | RF-NMTPP-04 | Subdirección Técnica de Regulación / CIO |
| Q-NMTPP-10 | Formatos y plazos de reporte de la SSPD | Capa de nivel de servicio | Subdirección Técnica de Regulación / SSPD |
| Q-NMTPP-11 | Plazo de remisión del estudio de costos | NMTPP-ADO-01 | Subdirección Técnica de Regulación |
| Q-NMTPP-12 | Reportes exigibles para el incentivo de reporte | NMTPP-INC-02 | Subdirección Técnica de Regulación / SSPD |
| Q-NMTPP-13 | Nivel del ISE con costos unificados y lista de APS insulares | RF-NMTPP-12 | Subdirección Técnica de Regulación |
| Q-NMTPP-14 | Alcance de la publicación del estado frente a meta | RN-NMTPP-05; RF-NMTPP-17 | Subdirección Técnica de Regulación / Oficina Jurídica |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión inicial | Diagnóstico de viabilidad del 2026-09-18; sesión con Camilo Carvajalino |
