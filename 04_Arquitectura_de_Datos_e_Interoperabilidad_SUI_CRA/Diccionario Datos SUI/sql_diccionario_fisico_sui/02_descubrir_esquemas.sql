-- =============================================================================
-- 02_descubrir_esquemas.sql
-- Observatorio CRA · Extracción del diccionario físico del SUI (Oracle)
-- Objetivo : ubicar en qué esquemas (OWNER) viven las tablas del diccionario
--            del lake y descubrir tablas físicas que el lake no conoce (H9),
--            en particular las del IUS y del cargue AA 2024 (B-DIC-02, H18).
-- Entrada  : lista de las 129 tablas de tabla_sui.csv (v0.2.0), embebida abajo.
-- Salida   : resultados en pantalla, con ellos se llena DEFINE esquemas en 03.
-- Seguridad: solo lectura sobre vistas ALL_*, no toca datos de negocio.
-- =============================================================================

SET SQLBLANKLINES ON
SET DEFINE ON

SET PAGESIZE 500
SET LINESIZE 300
COLUMN owner        FORMAT A25
COLUMN nombre_tabla FORMAT A32
COLUMN table_name   FORMAT A32
COLUMN comentario   FORMAT A60

PROMPT == 1. ¿Dónde están las 129 tablas del lake? =============================
-- tipo_acceso: TABLE / VIEW = objeto visible directamente,
--              SYNONYM      = visible solo por sinónimo (resolver en bloque 4),
--              NO_VISIBLE   = no existe con ese nombre o sin privilegio.
WITH lake AS (
  SELECT UPPER(column_value) AS nombre_tabla
  FROM   TABLE(sys.odcivarchar2list(
    'T_ESTADOS_FINANCIEROS', 'CAR_T455_FORMATO18', 'CAR_FAAC_ACDCTO', 'CAR_FAAL_ALCNTRLDO',
    'CAR_FAAS_ASEO', 'CAR_T704_TARIFA_ACDCTO', 'CAR_T705_TARAPL_ACDCTO', 'CAR_T706_TARIFA_ALCNTRLDO',
    'CAR_T707_TARAPL_ALCNTRLDO', 'CAR_T708_708', 'CAR_T709_709', 'CAR_T710_710',
    'CAR_T711_711', 'CAR_T715_715', 'CAR_T716_716', 'CAR_T717_717',
    'CAR_T718_718', 'CAR_T719_719', 'CAR_T720_720', 'CAR_T721_721',
    'CAR_T722_722', 'CAR_T730_730', 'CAR_T733_733', 'CAR_T734_734',
    'CAR_T735_CONTINUIDAD', 'CAR_T751_VERTICES_AREA', 'CAR_T752_RECOLECCIONTRANSPORTE', 'CAR_T753_SITIOSAPROVECHAMIENTO',
    'CAR_T754_VEHICULOS', 'CAR_T755_COMERCIAL', 'CAR_T756_ESTACIONESTRANS', 'CAR_T757_VALOR_PEAJES',
    'CAR_T758_SITIOSDISPOSICION', 'CAR_T761_MATRIZRIESGO', 'CAR_T733_SUS_PROY_ACU', 'CAR_T857_TAR_APLICA_ASEO',
    'CAR_T858_DISP_FINAL_SINNUAP', 'CAR_870_CTAXCOBRAR', 'CAR_871_CTASXPAGAR', 'CAR_872_FLUJOCAJA',
    'CAR_873_CONFLCAJA', 'CAR_874_ESTRESPROY', 'CAR_875_CESRESULT', 'CAR_876_BALGENPRO',
    'CAR_877_BALGENPA', 'CAR_880_M3VERTIDOS', 'CAR_881_MULTIUSUA', 'CAR_882_MULTIUSUAL',
    'CAR_935_MATRIZR', 'CAR_936_CODIGOSN', 'CAR_T971_PQR', 'CAR_T972_PETICION',
    'CAR_T995_USUARIOS_FACTURADOS', 'CAR_T996_CONSUMO_FACTURADO', 'CAR_T998_METAS_GLOBALES', 'CAR_T1010_TAR_TEL_PUBLICOS',
    'CAR_T210_210', 'CAR_T1014_TAR_PLAN_EMPAQUET', 'CAR_T1019_TAR_PAR_AISLADO', 'CAR_T1021_TAR_SER_COMPLEM',
    'CAR_T1022_TAR_SER_SUPLEMEN', 'CAR_T1023_TAR_SER_CORPORAT', 'CAR_T1030_BALANCESUBCONT', 'CAR_T1032_AMB_CARS',
    'CAR_T1033_PLAN_DEPTO_CARS', 'CAR_T1038_RES_HOSPCARS', 'CAR_T1041_REGISTRO_PSMV', 'CAR_T1048_VERT_ALC',
    'CAR_T1050_F1001_PRES', 'CAR_T1051_FACT_SUBCONT', 'CAR_T1056_F45_FRECOTORGASUB', 'CAR_T1057_FACT_ACU',
    'CAR_T1058_FACT_ALC', 'CAR_T1059_SUSPENSERVACU', 'CAR_T1061_REDESSISALC', 'CAR_T1062_FORMPROYECTOS',
    'CAR_T1064_EJECPROYECTOS', 'CAR_T1069_FORMPROYEC_ASEO', 'CAR_T1070_EJECPROYEC_ASEO', 'CAR_T1067_CONTRATACION_SGP',
    'CAR_T1073_CXCSERVPUBLICOS', 'CAR_T1080_LIQUIDACION_SGP', 'CAR_T1234_ADICIONALES', 'CAR_T1081_CARAC_ESPEC',
    'CAR_T1085_OPER_SITIOS_DF', 'CAR_T1087_BAR_LIMPIEZA', 'CAR_T1102_F141_CALIDADAGUAFSUP', 'CAR_T1103_F142_CALIDADAGUAFSUB',
    'CAR_T1105_F134_REGESTMEDPREC', 'CAR_T1106_F135_PREC', 'CAR_T1107_ESTACION_TRANS', 'CAR_T1109_COMERCIAL_ASEO',
    'CAR_T1055_RECLAMACIONES', 'CAR_T1126_FACT_SUBCONT', 'CAR_T1227_DANE_IGAC', 'CAR_T1229_REG_PUNTOS',
    'CAR_T1230_OBLIGATORIOS', 'CAR_T1242_DANE_IGAC_ANTIOQUIA', 'CAR_T1243_DANE_IGAC_CALI', 'CAR_T1244_DANE_IGAC_BOGOTA',
    'CAR_T1245_DANE_IGAC_MEDELLIN', 'CAR_T1246CXC_SECTOROFICIAL', 'CAR_T1249_COMP_ING_OPERA', 'CAR_T1267_CONV_COLEC',
    'CAR_T1268_CAT_EMPLEADO', 'CAR_T1269_COMP_ING_OPER_AS', 'CAR_T1271_FLUJO_CAJA_REAL', 'CAR_T1272_COSTO_PAR_BOMBEO',
    'CAR_T1273_COSTO_TASA_AMBIENTAL', 'CAR_T1274_COSTOS_ENERGIA_ALC', 'CAR_T1275_COSTOS_ENERGIA_CE', 'CAR_T1276_COST_INSUM_QUIMIC',
    'CAR_T1277_COSTOS_ENERGIA_ACU', 'CAR_T1278_COST_AGUABLOQ_CMOp', 'CAR_T1279_IMP_TASAS_OPE_ACU', 'CAR_T1290_COSTINSQUIM',
    'CAR_T1291_COSTSERVPERS', 'CAR_T1292_IMPUESTYTASAS', 'CAR_T1293_COSTOPARTBOMBEO', 'CAR_T1294_COSTOTASASAMBIENT',
    'CAR_T1295_OTR_COS_OPERA_AR', 'CAR_T1083_MICRO_RUTA', 'CAR_T1086_DISFIN_OPER', 'CAR_T1088_PEAJES',
    'CAR_T1052_F22_PRESTACUEDUCTO', 'CAR_T1053_TARAPL_ALC', 'CAR_T1084_REG_TONELA', 'CAR_T1108_REGISTRO_VEHIC',
    'CAR_T1349_PUNT_VERT_CRECEP'
  ))
),
objetos AS (
  SELECT owner, table_name AS nombre, 'TABLE' AS tipo FROM all_tables
  UNION ALL
  SELECT owner, view_name, 'VIEW' FROM all_views
  UNION ALL
  SELECT owner, synonym_name, 'SYNONYM' FROM all_synonyms
)
SELECT l.nombre_tabla,
       NVL(o.owner,'-')        AS owner,
       NVL(o.tipo,'NO_VISIBLE') AS tipo_acceso
FROM   lake l
LEFT JOIN objetos o ON o.nombre = l.nombre_tabla
ORDER BY tipo_acceso, owner, l.nombre_tabla;

PROMPT == 2. Esquemas candidatos del SUI AAA (tablas con prefijo del lake) =====
SELECT owner,
       COUNT(*)                                                     AS tablas_car,
       SUM(CASE WHEN table_name LIKE 'CAR\_T%' ESCAPE '\' THEN 1 ELSE 0 END) AS tablas_car_t,
       MAX(last_analyzed)                                           AS ultimo_analisis
FROM   all_tables
WHERE  table_name LIKE 'CAR\_%' ESCAPE '\'
   OR  table_name LIKE 'T\_%'   ESCAPE '\'
GROUP BY owner
ORDER BY tablas_car DESC;

PROMPT == 3. Tablas físicas CAR_* que el lake NO cataloga (evidencia H9) ========
WITH lake AS (
  SELECT UPPER(column_value) AS nombre_tabla
  FROM   TABLE(sys.odcivarchar2list(
    'T_ESTADOS_FINANCIEROS', 'CAR_T455_FORMATO18', 'CAR_FAAC_ACDCTO', 'CAR_FAAL_ALCNTRLDO',
    'CAR_FAAS_ASEO', 'CAR_T704_TARIFA_ACDCTO', 'CAR_T705_TARAPL_ACDCTO', 'CAR_T706_TARIFA_ALCNTRLDO',
    'CAR_T707_TARAPL_ALCNTRLDO', 'CAR_T708_708', 'CAR_T709_709', 'CAR_T710_710',
    'CAR_T711_711', 'CAR_T715_715', 'CAR_T716_716', 'CAR_T717_717',
    'CAR_T718_718', 'CAR_T719_719', 'CAR_T720_720', 'CAR_T721_721',
    'CAR_T722_722', 'CAR_T730_730', 'CAR_T733_733', 'CAR_T734_734',
    'CAR_T735_CONTINUIDAD', 'CAR_T751_VERTICES_AREA', 'CAR_T752_RECOLECCIONTRANSPORTE', 'CAR_T753_SITIOSAPROVECHAMIENTO',
    'CAR_T754_VEHICULOS', 'CAR_T755_COMERCIAL', 'CAR_T756_ESTACIONESTRANS', 'CAR_T757_VALOR_PEAJES',
    'CAR_T758_SITIOSDISPOSICION', 'CAR_T761_MATRIZRIESGO', 'CAR_T733_SUS_PROY_ACU', 'CAR_T857_TAR_APLICA_ASEO',
    'CAR_T858_DISP_FINAL_SINNUAP', 'CAR_870_CTAXCOBRAR', 'CAR_871_CTASXPAGAR', 'CAR_872_FLUJOCAJA',
    'CAR_873_CONFLCAJA', 'CAR_874_ESTRESPROY', 'CAR_875_CESRESULT', 'CAR_876_BALGENPRO',
    'CAR_877_BALGENPA', 'CAR_880_M3VERTIDOS', 'CAR_881_MULTIUSUA', 'CAR_882_MULTIUSUAL',
    'CAR_935_MATRIZR', 'CAR_936_CODIGOSN', 'CAR_T971_PQR', 'CAR_T972_PETICION',
    'CAR_T995_USUARIOS_FACTURADOS', 'CAR_T996_CONSUMO_FACTURADO', 'CAR_T998_METAS_GLOBALES', 'CAR_T1010_TAR_TEL_PUBLICOS',
    'CAR_T210_210', 'CAR_T1014_TAR_PLAN_EMPAQUET', 'CAR_T1019_TAR_PAR_AISLADO', 'CAR_T1021_TAR_SER_COMPLEM',
    'CAR_T1022_TAR_SER_SUPLEMEN', 'CAR_T1023_TAR_SER_CORPORAT', 'CAR_T1030_BALANCESUBCONT', 'CAR_T1032_AMB_CARS',
    'CAR_T1033_PLAN_DEPTO_CARS', 'CAR_T1038_RES_HOSPCARS', 'CAR_T1041_REGISTRO_PSMV', 'CAR_T1048_VERT_ALC',
    'CAR_T1050_F1001_PRES', 'CAR_T1051_FACT_SUBCONT', 'CAR_T1056_F45_FRECOTORGASUB', 'CAR_T1057_FACT_ACU',
    'CAR_T1058_FACT_ALC', 'CAR_T1059_SUSPENSERVACU', 'CAR_T1061_REDESSISALC', 'CAR_T1062_FORMPROYECTOS',
    'CAR_T1064_EJECPROYECTOS', 'CAR_T1069_FORMPROYEC_ASEO', 'CAR_T1070_EJECPROYEC_ASEO', 'CAR_T1067_CONTRATACION_SGP',
    'CAR_T1073_CXCSERVPUBLICOS', 'CAR_T1080_LIQUIDACION_SGP', 'CAR_T1234_ADICIONALES', 'CAR_T1081_CARAC_ESPEC',
    'CAR_T1085_OPER_SITIOS_DF', 'CAR_T1087_BAR_LIMPIEZA', 'CAR_T1102_F141_CALIDADAGUAFSUP', 'CAR_T1103_F142_CALIDADAGUAFSUB',
    'CAR_T1105_F134_REGESTMEDPREC', 'CAR_T1106_F135_PREC', 'CAR_T1107_ESTACION_TRANS', 'CAR_T1109_COMERCIAL_ASEO',
    'CAR_T1055_RECLAMACIONES', 'CAR_T1126_FACT_SUBCONT', 'CAR_T1227_DANE_IGAC', 'CAR_T1229_REG_PUNTOS',
    'CAR_T1230_OBLIGATORIOS', 'CAR_T1242_DANE_IGAC_ANTIOQUIA', 'CAR_T1243_DANE_IGAC_CALI', 'CAR_T1244_DANE_IGAC_BOGOTA',
    'CAR_T1245_DANE_IGAC_MEDELLIN', 'CAR_T1246CXC_SECTOROFICIAL', 'CAR_T1249_COMP_ING_OPERA', 'CAR_T1267_CONV_COLEC',
    'CAR_T1268_CAT_EMPLEADO', 'CAR_T1269_COMP_ING_OPER_AS', 'CAR_T1271_FLUJO_CAJA_REAL', 'CAR_T1272_COSTO_PAR_BOMBEO',
    'CAR_T1273_COSTO_TASA_AMBIENTAL', 'CAR_T1274_COSTOS_ENERGIA_ALC', 'CAR_T1275_COSTOS_ENERGIA_CE', 'CAR_T1276_COST_INSUM_QUIMIC',
    'CAR_T1277_COSTOS_ENERGIA_ACU', 'CAR_T1278_COST_AGUABLOQ_CMOp', 'CAR_T1279_IMP_TASAS_OPE_ACU', 'CAR_T1290_COSTINSQUIM',
    'CAR_T1291_COSTSERVPERS', 'CAR_T1292_IMPUESTYTASAS', 'CAR_T1293_COSTOPARTBOMBEO', 'CAR_T1294_COSTOTASASAMBIENT',
    'CAR_T1295_OTR_COS_OPERA_AR', 'CAR_T1083_MICRO_RUTA', 'CAR_T1086_DISFIN_OPER', 'CAR_T1088_PEAJES',
    'CAR_T1052_F22_PRESTACUEDUCTO', 'CAR_T1053_TARAPL_ALC', 'CAR_T1084_REG_TONELA', 'CAR_T1108_REGISTRO_VEHIC',
    'CAR_T1349_PUNT_VERT_CRECEP'
  ))
)
SELECT t.owner, t.table_name, t.num_rows, t.last_analyzed,
       SUBSTR(c.comments,1,60) AS comentario
FROM   all_tables t
LEFT JOIN all_tab_comments c
       ON c.owner = t.owner AND c.table_name = t.table_name
WHERE  t.table_name LIKE 'CAR\_%' ESCAPE '\'
AND    t.table_name NOT IN (SELECT nombre_tabla FROM lake)
ORDER BY t.owner, t.table_name;

PROMPT == 4. Resolución de sinónimos (si el acceso es indirecto) ================
SELECT s.owner        AS owner_sinonimo,
       s.synonym_name,
       s.table_owner  AS owner_real,
       s.table_name   AS objeto_real,
       s.db_link
FROM   all_synonyms s
WHERE  s.synonym_name LIKE 'CAR\_%' ESCAPE '\'
   OR  s.synonym_name LIKE 'T\_%'   ESCAPE '\'
   OR  s.synonym_name LIKE '%IUS%'
ORDER BY s.table_owner, s.table_name;

PROMPT == 5. Candidatas IUS / cargue AA 2024 por firma de columnas ==============
-- Las variables del Instructivo IUS 2024 usan siglas cortas (VTAP, VTA, NS_ACPUC,
-- IMA, IMI, NDNA, NTD, POAC, POALC, IPAA, CLT, CLG, EET, CMCAP, PPAP, IRPD).
-- Una tabla con 4 o más siglas es candidata fuerte a formato IUS o transitorio.
WITH firma AS (
  SELECT column_value AS sigla
  FROM   TABLE(sys.odcivarchar2list(
    'VTAP','VTA','ACPUC','NEP','IMA','IMI','NDNA','NTD','POAC','POALC',
    'IPAA','CLT','CLG','EET','CMCAP','PPAP','IRPD','FAC','FAL','ICG','IC'
  ))
),
hits AS (
  SELECT c.owner, c.table_name, f.sigla, c.column_name
  FROM   all_tab_columns c
  JOIN   firma f
    ON   c.column_name = f.sigla
    OR   c.column_name LIKE '%\_' || f.sigla ESCAPE '\'
    OR   c.column_name LIKE f.sigla || '\_%' ESCAPE '\'
  WHERE  c.owner NOT IN ('SYS','SYSTEM','XDB','MDSYS','CTXSYS','ORDSYS','WMSYS',
                         'OLAPSYS','DVSYS','LBACSYS','APEX_PUBLIC_USER','OUTLN')
)
SELECT owner, table_name,
       COUNT(DISTINCT sigla)                                        AS siglas_encontradas,
       LISTAGG(sigla, ',') WITHIN GROUP (ORDER BY sigla)            AS siglas
FROM   (SELECT DISTINCT owner, table_name, sigla FROM hits)
GROUP BY owner, table_name
HAVING COUNT(DISTINCT sigla) >= 4
ORDER BY siglas_encontradas DESC, owner, table_name;

PROMPT == 6. Candidatas IUS / indicadores por nombre de tabla ==================
SELECT t.owner, t.table_name, t.num_rows, t.last_analyzed,
       SUBSTR(c.comments,1,60) AS comentario
FROM   all_tables t
LEFT JOIN all_tab_comments c
       ON c.owner = t.owner AND c.table_name = t.table_name
WHERE  REGEXP_LIKE(t.table_name, 'IUS|INDICAD|TRANSIT|CARGUE|HIDRAUL|POIR|DISCONT', 'i')
   OR  REGEXP_LIKE(c.comments,   'IUS|INDICADOR|TRANSITORIO|MODELO HIDR', 'i')
ORDER BY t.owner, t.table_name;

PROMPT == 7. Metadatos propios del SUI (el diccionario "de negocio" del portal) =
-- El portal DiccionarioConsultaV2 lee formatos, variables y esquemas desde
-- tablas internas. Si son visibles, son la fuente autoritativa para poblar
-- variable_tabla (regla 3 del README) sin inferencias.
SELECT c.owner, c.table_name,
       COUNT(*)                                                     AS columnas_senal,
       LISTAGG(c.column_name, ',') WITHIN GROUP (ORDER BY c.column_name) AS columnas
FROM   all_tab_columns c
WHERE  REGEXP_LIKE(c.column_name,
         '^(ID_?FORMATO|COD_?FORMATO|ID_?VARIABLE|COD_?VARIABLE|NOMBRE_?CAMPO|ID_?CAMPO|ID_?TABLA|NOMBRE_?TABLA|ID_?ESQUEMA|ID_?NORMA|TIPO_?DATO|LONGITUD|OBLIGATORI)')
AND    c.owner NOT IN ('SYS','SYSTEM','XDB','MDSYS','CTXSYS','ORDSYS','WMSYS',
                       'OLAPSYS','DVSYS','LBACSYS','OUTLN')
GROUP BY c.owner, c.table_name
HAVING COUNT(*) >= 3
ORDER BY columnas_senal DESC, c.owner, c.table_name;

PROMPT == Siguiente paso ========================================================
PROMPT  Con los OWNER de los bloques 1, 2, 5 y 7, editar DEFINE esquemas en 03.
