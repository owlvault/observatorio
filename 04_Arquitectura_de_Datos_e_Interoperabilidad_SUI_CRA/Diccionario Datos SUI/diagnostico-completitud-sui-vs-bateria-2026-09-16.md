---
id: diagnostico-completitud-sui-vs-bateria
tipo: diagnostico
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-16
fuentes: [04_Arquitectura_de_Datos_e_Interoperabilidad_SUI_CRA/Diccionario Datos SUI/diccionario_sui_cra_v0.2.0 (corte 2026-09-03), 05_Bateria_de_Indicadores_y_Dimensiones_Regulatorias/catalogo-v1.md, specs/spec-seguimiento-implementacion-nmt (2026-09-16), adr/ADR-0012]
anexos: [matriz_trazabilidad_indicadores_sui.csv, resumen_completitud_indicadores.csv]
---

# Diagnóstico de completitud del Diccionario SUI v0.2.0 frente a la batería de indicadores

## 1. Resumen ejecutivo

**Veredicto:** hoy el diccionario explica **qué** reporta el prestador, pero todavía no dice **dónde** está ese dato en el SUI. Ninguno de los 22 indicadores evaluados (14 del catálogo V1 y 8 del tablero NMT) puede llevarse a una consulta Oracle con trazabilidad hasta la columna física, porque `variable_tabla` está vacía (H1/H10). El dato de fondo existe para la mayoría. Lo que falta es el puente físico.

| Métrica | V1 (38 variables requeridas) | NMT (11) | Total (49) |
|---|---:|---:|---:|
| Variable documentada en algún documento técnico | 28 (74%) | 7 (64%) | **35 (71%)** |
| …de esas, por extracción mecánica (no requiere validación) | 24 | 7 | 31 (63%) |
| Cruzada por nombre exacto con un formato del catálogo | 5 | 1 | **6 (12%)** |
| Solo formato catalogado, sin variables | 4 | 0 | 4 (8%) |
| Sin evidencia en el diccionario (externa o inexistente) | 6 | 4 | **10 (20%)** |
| Trazada hasta columna física | 0 | 0 | **0 (0%)** |

**Lectura por indicador (con ajuste semántico):**

| Veredicto | V1 | NMT |
|---|---|---|
| **A · Calculable al cerrar el puente físico** | IND-PER-01 (IANC), IND-PER-02 (IPUF), IND-INV-01 | — |
| **B · SUI suficiente con ajuste metodológico** | IND-CON-01, IND-ECI-01, IND-FIN-01 | NMT-TAR-01, NMT-EST-01, NMT-EST-02 |
| **C · Requiere fuente externa integrable** | IND-COB-01, IND-COB-02, IND-ASE-01 | — |
| **D · Documentación insuficiente** | IND-COB-03, IND-ECI-02 | — |
| **E · Brecha semántica (el SUI mide otra cosa)** | IND-EFI-01, IND-EFI-02 | NMT-ADO-02, NMT-INC-01 |
| **F · Fuera del SUI o sin formato** | IND-CAL-01 (IRCA) | NMT-ADO-01, NMT-LB-01, NMT-RIE-01 |

Cinco conclusiones para decidir:

1. **La PoC del IANC sigue siendo la elección correcta.** Sus cuatro variables (VTAP, volumen adquirido, volumen entregado y consumo facturado) están documentadas con extracción mecánica en el Instructivo IUS 2024 y en el de cargue AA 2024. El bloqueo no es de negocio sino físico: esos formatos IUS **no están entre los 392 formatos del catálogo** (H9), así que no hay tabla candidata.
2. **El puente físico se puede destrabar sin esperar a la SSPD.** La CRA ya tiene un usuario de consulta Oracle por VPN. Si ese usuario puede leer las vistas de catálogo (`ALL_TAB_COLUMNS`, `ALL_COL_COMMENTS`), se obtiene el inventario de columnas en días. Ver acción P1.
3. **La dimensión de eficiencia tiene un problema de definición, no de datos.** El SUI trae el CMA y el CMO **tarifarios** que se aplican en cada factura, no el gasto administrativo ni operativo real. La Dirección Técnica debe decidir qué mide IND-EFI-01/02 antes de hacer las fichas.
4. **Tres indicadores de cobertura y el de asequibilidad dependen de DANE.** Esa integración es previsible y de datos abiertos, pero bloquea la publicación mientras no se cierre `Q-GLO-02` (viviendas o población).
5. **El tablero NMT no tiene todavía una base de reporte propia en el SUI.** No hay formatos para línea base, estudio de costos ni incentivos de la Res. CRA 1032/2026. Tres de sus ocho indicadores no se pueden alimentar hoy, y dos solo tienen campos que pertenecen a marcos anteriores.

## 2. Alcance y método

**Objeto evaluado:** `diccionario_sui_cra_v0.2.0` (Frictionless Data Package, 13 recursos válidos). Contiene 392 formatos, 129 tablas, 844 variables tomadas de 9 documentos técnicos, 654 aristas de linaje y 14 hallazgos de calidad.

**Batería evaluada:** 14 indicadores de `catalogo-v1.md` y 8 indicadores NMT-* de `spec-seguimiento-implementacion-nmt`. Cada indicador se descompuso en sus **variables requeridas** (numerador, denominador, valor, ajuste o desagregación). En total son 49.

**Escala de linaje por variable requerida (N0–N5):**

| Nivel | Significado | Evidencia en el paquete |
|---|---|---|
| N0 | Sin evidencia en el diccionario (fuente externa o inexistente) | — |
| N1 | Solo existe un formato catalogado candidato, sin variables | `formato` |
| N2 | Variable documentada, lectura asistida (`requiere_validacion = true`) | `variable_formato` |
| N3 | Variable documentada, extracción mecánica | `variable_formato` |
| N4 | Variable cruzada por nombre exacto con el formato candidato, que tiene tabla física | `variable_formato.calidad_correspondencia = exacta` + `formato_tabla` |
| N5 | Columna física identificada | `variable_tabla` (vacía) |

**Completitud sintáctica** = nivel medio ÷ 5. **Ajuste semántico** = juicio experto sobre si la variable del SUI mide lo que pide la ficha (directo, parcial, proxy o ausente). El veredicto A–F combina ambos. El puntaje por sí solo engaña: IND-EFI-01 tiene N4 en CMA y aun así es una brecha semántica.

**Reglas del README respetadas:** los formatos y tablas de la matriz son **candidatos propuestos por este diagnóstico** a partir del nombre, no linaje declarado. No se infirió ningún puente variable→columna (regla 3). Las variables con `requiere_validacion = true` se trataron como no verificadas (regla 2).

**Reproducibilidad:** la matriz se genera con expresiones regulares sobre `nombre_variable`, restringidas a los documentos técnicos de cada dominio. Los `id_variable` concretos están en `matriz_trazabilidad_indicadores_sui.csv`. La batería usa **112 de las 844 variables** del diccionario (13%): 23 requieren validación, 10 tienen cruce exacto, 51 no tienen unidad de medida y 10 no tienen definición.

## 3. Resultado por indicador

`%` = completitud sintáctica. `Mín` = nivel mínimo entre las variables críticas (numerador, denominador y valor).

### 3.1 Catálogo V1

| Indicador | % | Mín | Evidencia principal en el diccionario | Brecha crítica | Veredicto |
|---|---:|---:|---|---|---|
| IND-PER-01 IANC | 60 | N3 | IUS por sistema: `Volumen de agua producida_VTAP`, volumen adquirido y entregado en interconexión, `Consumo facturado` (Instructivo IUS 2024, mecánica) | Formatos IUS fuera del catálogo; sin tabla ni columna | **A** |
| IND-PER-02 IPUF | 60 | N3 | Las del IANC + `Número de Suscriptores_ACPUC` + periodo de facturación | Igual que PER-01 | **A** |
| IND-CON-01 Continuidad | 60 | N3 | `Índice de Continuidad_IC` (IUS); discontinuidades por ruta de lectura con tiempo y suscriptores afectados (Res. 39945/2017) | El catálogo pide horas/día y el IC es un índice; formatos 719/735 sin variables, tabla 735 con H5 | **B** |
| IND-COB-01 Cobertura acueducto | 30 | N0 | `Número de suscriptores atendidos` por municipio y clase de uso | Denominador DANE (`Q-GLO-02`); suscriptor ≠ vivienda (formato 881 de multiusuarios sin variables) | **C** |
| IND-COB-02 Cobertura alcantarillado | 30 | N0 | `Suscriptores del servicio de alcantarillado…` (4 campos) | Igual que COB-01 | **C** |
| IND-COB-03 Cobertura aseo | 20 | N0 | Solo `Número de suscriptores` (Res. 34455/2020, lectura asistida) y `Promedio de suscriptores` | Formatos 702/1320 sin variables; denominador DANE | **D** |
| IND-CAL-01 IRCA | 20 | N1 | Formatos de muestreo 1230–1233 (derogados o por verificar), sin variables | El IRCA no está en el SUI; depende de INS/SIVICAP (`Q-CAT-01`) | **F** |
| IND-ECI-01 Aguas residuales tratadas | 70 | N3 | `Volumen de agua residual tratada_VTA` (IUS); `Total m3 vertidos facturados` y `Vertimiento del periodo` (cruce exacto con 1058) | Denominador proxy: vertido facturado ≠ agua residual generada (ODS 6.3). El 1058 está atribuido a norma derogada (H2) | **B** |
| IND-ECI-02 Aprovechamiento | 40 | N2 | `Toneladas` (Anexo aprovechamiento), `Toneladas de recolección y transporte` (formato 59), `Rechazo` (balance de masas) | Todo es lectura asistida; los formatos 753/1342 no tienen variables | **D** |
| IND-EFI-01 CMA | 33 | N4* | `CMA ($/suscriptor)` en facturación AC/AL (cruce exacto con 1058) | *Es el costo tarifario aplicado, no el gasto real. PUC (formato 1) sin variables. IPC externo | **E** |
| IND-EFI-02 CMO | 33 | N4* | `CMO ($/m3)` en facturación | Igual que EFI-01; formatos 1276/1277 de costos sin variables | **E** |
| IND-FIN-01 Subsidios y contribuciones | 53 | N1 | `Valor de subsidio o contribución` por cargo fijo y consumo (exacto con 1058); recursos FSRI solicitados, recibidos y enviados (10 campos) | Transferencias de entes territoriales: formato 1030 sin variables (`Q-CAT-02`) | **B** |
| IND-ASE-01 Asequibilidad E1–E2 | 47 | N0 | `Total cobro` por factura + `Código clase de uso` | Ingreso de hogares (DANE ENPH/GEIH); los códigos de estrato están en `dominio_valor`, **vacío** | **C** |
| IND-INV-01 Ejecución de inversiones | 60 | N3 | `Valor presente de los recursos ejecutados` y `…de las inversiones proyectadas` (IUS por APS, mecánica); POIR por activo | Formatos 1062–1064/1340–1341 atribuidos a la Res. 2010 parcial (H2) y con tablas compartidas (H8) | **A** |

### 3.2 Tablero NMT (Res. CRA 1032/2026)

| Indicador | % | Mín | Evidencia | Brecha crítica | Veredicto |
|---|---:|---:|---|---|---|
| NMT-ADO-01 Tasa de adopción | 30 | N0 | Universo por suscriptores (IUS) | No hay campo de "estudio de costos reportado bajo el marco" (`Q-NMT-05`) | **F** |
| NMT-ADO-02 Oportunidad de adopción | 60 | N3 | `Fecha de expedición de la factura`; `Fecha de inicio de aplicación de tarifas Res.` | Ese marcador apunta a marcos anteriores: no identifica facturas bajo la 1032 | **E** |
| NMT-TAR-01 Variación tarifaria | 80 | N4 | CMA/CMO/CMI/CMT por factura + clase de uso | Formatos de tarifas aplicadas (705/707/1328/1329) sin variables; cargos de la 1032 sin formato; estrato sin `dominio_valor` | **B** |
| NMT-LB-01 Cobertura de línea base | 0 | N0 | — | No existe formato de línea base 2026 | **F** |
| NMT-EST-01 Cumplimiento IDH/IRD | 30 | N0 | IC, IMI, IMA, NDNA/NTD (IUS y cargue AA 2024) | Metas por segmento sin fuente (`Q-NMT-01`); IDH5 depende del IRCA | **B** (observado) |
| NMT-EST-02 Brecha de pérdidas | 60 | N3 | Componentes del IPUF | Meta pendiente (`Q-NMT-01`) | **B** |
| NMT-INC-01 Descuentos e incentivos | 60 | N3 | `Valor a descontar por ICAP/ICON/IQR` | Pertenecen al esquema de descuentos anterior; los incentivos de las Tablas 17–25 de la 1032 no tienen formato | **E** |
| NMT-RIE-01 Riesgo IUS | 0 | N0 | Solo insumos del IUS | El nivel de riesgo es una publicación anual de la SSPD, fuera del diccionario | **F** |

## 4. Brechas estructurales del diccionario frente a la batería

| ID | Brecha | Evidencia | Impacto en la batería | Severidad |
|---|---|---|---|---|
| B-DIC-01 | **Sin puente variable → columna física** | `variable_tabla` = 0 filas; H1 (portal HTTP 500) y H10 | Bloquea los 22 indicadores para una consulta Oracle trazable | Crítica |
| B-DIC-02 | **Formatos de mayor valor fuera del catálogo** | Los formatos IUS (sistema, APS, prestador) y los transitorios de cargue AA 2024 cruzan 0 de 187 variables con el catálogo; H9 (ids hasta 6097, 407 no catalogados) | IANC, IPUF, continuidad, inversiones y los NMT-EST quedan sin tabla candidata | Crítica |
| B-DIC-03 | **Vocabulario de codificación vacío** | `dominio_valor` = 0 (93 códigos pendientes para v0.3) | Sin códigos de clase de uso y estrato no hay desagregación por estrato: bloquea IND-ASE-01, NMT-TAR-01 (RN-NMT-03) y los subsidios por estrato | Alta |
| B-DIC-04 | **Metadatos de representación incompletos** | 46% de las 112 variables de la batería no tiene `unidad_medida`; 10 no tienen definición | La ficha exige unidad canónica (RF-ONTO-07); riesgo de mezclar m³/mes con m³/año o pesos corrientes con constantes | Alta |
| B-DIC-05 | **Vigencia normativa sin resolver en formatos candidatos** | 113 formatos derogados pendientes de reasignación y 82 por verificar (H2); incluye 1058 (facturación alcantarillado), 1062–1064 y 1340–1341 (proyectos), 1230–1233 (calidad) | Los cruces exactos hoy caen sobre un formato atribuido a norma derogada: el linaje no es defendible en un acto administrativo | Alta |
| B-DIC-06 | **Lectura asistida concentrada en aseo** | 100% de las variables de aprovechamiento (596/2016), Res. 34455/2020 y Res. 606485/2024 tienen `requiere_validacion = true` | IND-ECI-02 e IND-COB-03 no pueden certificarse | Media |
| B-DIC-07 | **Sin fuentes externas en el modelo** | El paquete es solo `sui_meta`; no hay entidad de fuente externa | COB-01/02/03, CAL-01, ASE-01, EFI (IPC) y RIE-01 no tienen linaje declarable | Media |
| B-DIC-08 | **Sin dimensión de marco tarifario** | Ningún formato ni variable referencia la Res. CRA 1032/1038/1040 de 2026 | Tablero NMT sin base de reporte (ADO-01, LB-01, INC-01) | Alta (para NMT) |
| B-DIC-09 | **Granularidad de microdato en facturación** | Facturación AC/AL por `NUIS` con dirección y número predial; la heurística marca 54 variables como personales, pero no el riesgo de reidentificación por NUIS + consumo | El Observatorio debe agregar en la capa de ingesta; no puede exponer ni guardar en bruto en la zona pública (Ley 1581/2012) | Media |

## 5. Hallazgos nuevos sobre la calidad del diccionario

Se proponen para incorporar a `registro_calidad` en la v0.3:

| ID propuesto | Dimensión ISO/IEC 25012 | Descripción | Registros |
|---|---|---|---|
| H15 | Exactitud; consistencia | `formato_servicio` asigna servicios que contradicen el nombre del formato. Ejemplos: 1341 "EJECUCIÓN DE PROYECTOS - ACUEDUCTO" y 1328 "TARIFAS APLICADAS - ACUEDUCTO" solo en ASEO; 730 "ACUEDUCTO CUENTAS POR PAGAR" solo en ASEO | 46 formatos con nombre de servicio ausente en su mapeo; 52 formatos sin ningún servicio |
| H16 | Trazabilidad | `documento_tecnico.id_norma` y `variable_formato.id_norma` están vacíos en los 9 documentos. Varias normas fuente (Res. SSPD 20221000284385/2022 IUS, 20251000182585/2025, 20261000681915/2026) no figuran en `norma`, aunque H2 las cita como destino de reasignación | 844 variables; ≥3 normas |
| H17 | Completitud | 69% de las 844 variables no tiene `unidad_medida` | ≈585 |
| H18 | Completitud | Los formatos IUS y los transitorios de cargue AA 2024 están documentados a nivel de variable pero no existen en `formato` | 12 formatos según documento (3 IUS en dos documentos + 9 de cargue AA 2024), 187 variables |

## 6. Plan de cierre priorizado

| # | Acción | Desbloquea | Responsable | Esfuerzo |
|---|---|---|---|---|
| **P1** | **Inventario físico directo desde Oracle.** Con el usuario de consulta por VPN, extraer `ALL_TAB_COLUMNS` y `ALL_COL_COMMENTS` de los esquemas SUI AAA, empezando por las 32 tablas candidatas de la matriz y buscando las tablas IUS (`%IUS%`, `%INDIC%`, `%CARGUE%`). Cargar el resultado en un **recurso nuevo** `columna_fisica_observada` (fuente: catálogo Oracle; calidad: observada). **No** poblar `variable_tabla` por inferencia: los puentes se proponen como candidatos y los aprueba el steward o la SSPD | B-DIC-01, B-DIC-02; los A pasan a extracción | CIO / Oficina TIC | Días, si el usuario tiene privilegio sobre las vistas de catálogo |
| P2 | Priorizar en el barrido H9 los identificadores de los formatos IUS y de cargue AA 2024, y darlos de alta en `formato` con norma y tabla | B-DIC-02, H18 | Oficina TIC | Bajo |
| P3 | Adelantar a v0.3 los códigos de **clase de uso y estrato** en `dominio_valor` | B-DIC-03 → ASE-01, TAR-01, FIN-01 | Oficina TIC + steward comercial | Bajo |
| P4 | Validar contra PDF **solo las 23 variables de lectura asistida que usa la batería** (aseo e IUS anexo), no las 373 | B-DIC-06 → ECI-02, COB-03 | Ciencia de Datos | Bajo |
| P5 | Decisión de definición de **IND-EFI-01/02**: costo de referencia tarifario (disponible en SUI) o costo real contable (PUC, sin variables) | Brecha semántica E | Dirección Técnica (curador) | Decisión |
| P6 | Cerrar `Q-GLO-02` y declarar DANE (CNPV, proyecciones, ENPH, IPC) como fuentes externas con su propio linaje; extender el paquete con una entidad `fuente_externa` | B-DIC-07 → COB-*, ASE-01, EFI-* | Ciencia de Datos + Subdirección de Regulación | Medio |
| P7 | Incluir en el oficio de información entre autoridades: (a) catálogo de metadatos físicos (H1); (b) formatos de reporte de la Res. CRA 1032 (línea base, estudio de costos, incentivos, marcador de marco en facturación); (c) canal para el nivel de riesgo IUS publicado; (d) certificación de vigencia de los formatos candidatos (H2) | B-DIC-05, B-DIC-08 → NMT-* | Dirección Ejecutiva / CIO | Medio (depende de la SSPD) |
| P8 | Canal formal con INS/SIVICAP para el IRCA, o retiro de IND-CAL-01 de V1 (`Q-CAT-01`) | IND-CAL-01, IDH5 | Subdirección de Regulación | Decisión |
| P9 | Asignar stewards a los seis dominios que toca la batería: técnico operativo, comercial y facturación, tarifario y costos, subsidios, inversiones e IUS | Gobierno (H13, B-DIC-09) | Dirección Técnica | Decisión |
| P10 | Registrar H15–H18 en `registro_calidad` y corregir `formato_servicio` antes de usar el filtro por servicio en el portal | H15–H18 | Oficina TIC | Bajo |

**Secuencia sugerida:** P1 + P2 en paralelo, porque desbloquean la PoC del IANC y las tres fichas piloto. Luego P3 + P4 + P5, que dejan listas 9 de las 14 fichas V1. P6–P9 corren en paralelo sobre la ruta institucional.

**Efecto esperado:** con P1–P5 cerradas, el catálogo V1 pasaría de 0 a **9 indicadores calculables con trazabilidad física** (los A, los B, ECI-02 y EFI-01/02 una vez definidos). Los C quedarían a la espera de DANE. IND-CAL-01 dependería de INS.

## 7. Limitaciones de este diagnóstico

- La correspondencia variable requerida → variable del diccionario se hizo por nombre y documento. Es un **candidato**, no una certificación: cada ficha metodológica debe confirmarla contra el instructivo.
- Los formatos y tablas candidatos salen del nombre del formato, no del linaje declarado por la SSPD.
- El puntaje de completitud mide disponibilidad de metadatos, **no la calidad ni la cobertura de los datos reportados** por los prestadores (tasa de reporte, oportunidad, valores atípicos). Eso requiere perfilar los datos en Oracle después de P1.
- El análisis NMT se limita a la Res. 1032; las Res. 1038 y 1040 están fuera de alcance, igual que en su spec.

## 8. Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-DIC-01 | ¿El usuario de consulta Oracle por VPN tiene privilegio de lectura sobre `ALL_TAB_COLUMNS` y `ALL_COL_COMMENTS` de los esquemas SUI AAA? | P1 | CIO |
| Q-DIC-02 | ¿IND-EFI-01/02 miden el costo de referencia tarifario o el costo real contable? | Fichas EFI | Dirección Técnica |
| Q-DIC-03 | ¿IND-CON-01 se publica como índice IUS (IC) o como horas/día derivadas de discontinuidades por ruta? | Ficha piloto CON-01 | Subdirección de Regulación |
| Q-DIC-04 | ¿El denominador de IND-ECI-01 es el vertimiento facturado (disponible) o el agua residual generada (no disponible)? | Ficha ECI-01 | Subdirección de Regulación |
| Q-DIC-05 | ¿La SSPD definirá formatos de reporte específicos para la Res. CRA 1032, y en qué plazo? | NMT-ADO-01, LB-01, INC-01 | Dirección Ejecutiva |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-16 | Versión inicial: evaluación de 49 variables requeridas por 22 indicadores contra el diccionario v0.2.0 | Sesión con Camilo Carvajalino |
