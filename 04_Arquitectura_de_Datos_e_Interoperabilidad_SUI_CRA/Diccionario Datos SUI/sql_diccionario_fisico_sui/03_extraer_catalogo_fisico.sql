-- =============================================================================
-- 03_extraer_catalogo_fisico.sql
-- Observatorio CRA · Extracción del diccionario físico del SUI (Oracle)
-- Objetivo : exportar a CSV el catálogo físico real (tablas, columnas,
--            comentarios, llaves, sinónimos y dependencias de vistas) de los
--            esquemas del SUI AAA. Es la materia prima de la comparación (05).
-- Salida   : 6 archivos CSV en la carpeta dir_salida (ver bloque de parámetros).
-- Seguridad: solo metadatos (vistas ALL_*). NUM_ROWS sale de estadísticas del
--            optimizador, no se hace COUNT(*) ni se lee ningún dato de negocio.
-- Cliente  : SQL Developer (F5) o SQLcl. Para SQL*Plus 12.2+ cambie
--            "SET SQLFORMAT CSV" por "SET MARKUP CSV ON QUOTE ON".
-- =============================================================================

SET SQLBLANKLINES ON
SET DEFINE ON

-- ---------------------------------------------------------------------------
-- PARÁMETROS · editar antes de ejecutar
-- esquemas  : OWNER encontrados con 02_descubrir_esquemas.sql, entre comillas
--             simples y separados por coma.
-- dir_salida: carpeta local donde quedan los CSV (debe existir).
-- ---------------------------------------------------------------------------
DEFINE esquemas   = "'ESQUEMA_SUI_1','ESQUEMA_SUI_2'"
DEFINE dir_salida = "C:\observatorio\oracle"

SET TERMOUT OFF
SET FEEDBACK OFF
SET VERIFY OFF
SET TRIMSPOOL ON
SET HEADING ON
-- PAGESIZE alto y no 0: con 0 se suprime el encabezado del CSV
SET PAGESIZE 50000
SET LINESIZE 32767
SET LONG 4000
SET SQLFORMAT CSV
-- SET MARKUP CSV ON QUOTE ON   -- (SQL*Plus 12.2+ en lugar de SQLFORMAT)

-- ---------------------------------------------------------------------------
-- 1. oracle_tablas.csv · una fila por tabla, vista o vista materializada
-- ---------------------------------------------------------------------------
SPOOL &dir_salida/oracle_tablas.csv
SELECT o.owner                                   AS owner,
       o.object_name                             AS table_name,
       CASE WHEN mv.mview_name IS NOT NULL THEN 'MATERIALIZED VIEW'
            ELSE o.object_type END               AS object_type,
       t.num_rows                                AS num_rows_estadistica,
       TO_CHAR(t.last_analyzed,'YYYY-MM-DD')     AS last_analyzed,
       TO_CHAR(o.created,'YYYY-MM-DD')           AS created,
       TO_CHAR(o.last_ddl_time,'YYYY-MM-DD')     AS last_ddl_time,
       t.partitioned                             AS partitioned,
       o.status                                  AS status,
       nc.n_columnas                             AS n_columnas,
       REPLACE(REPLACE(REPLACE(tc.comments, CHR(13), ' '), CHR(10), ' '), '"', '''')
                                                 AS comentario_tabla,
       TO_CHAR(SYSDATE,'YYYY-MM-DD')             AS fecha_corte
FROM   all_objects o
LEFT JOIN all_tables       t  ON t.owner = o.owner AND t.table_name = o.object_name
LEFT JOIN all_mviews       mv ON mv.owner = o.owner AND mv.mview_name = o.object_name
LEFT JOIN all_tab_comments tc ON tc.owner = o.owner AND tc.table_name = o.object_name
LEFT JOIN (SELECT owner, table_name, COUNT(*) AS n_columnas
           FROM   all_tab_columns
           WHERE  owner IN (&esquemas)
           GROUP BY owner, table_name) nc
       ON nc.owner = o.owner AND nc.table_name = o.object_name
WHERE  o.owner IN (&esquemas)
AND    o.object_type IN ('TABLE','VIEW')
AND    o.object_name NOT LIKE 'BIN$%'
ORDER BY o.owner, o.object_name;
SPOOL OFF

-- ---------------------------------------------------------------------------
-- 2. oracle_columnas.csv · una fila por columna (núcleo del diccionario físico)
--    Se mapea 1:1 a los campos de variable_tabla del paquete del lake.
-- ---------------------------------------------------------------------------
SPOOL &dir_salida/oracle_columnas.csv
SELECT c.owner                                   AS owner,
       c.table_name                              AS table_name,
       c.column_id                               AS column_id,
       c.column_name                             AS column_name,
       c.data_type                               AS data_type,
       CASE WHEN c.data_type IN ('VARCHAR2','NVARCHAR2','CHAR','NCHAR')
            THEN c.char_length ELSE c.data_length END AS longitud,
       c.data_precision                          AS data_precision,
       c.data_scale                              AS data_scale,
       c.nullable                                AS nullable,
       c.num_distinct                            AS num_distinct_estadistica,
       c.num_nulls                               AS num_nulls_estadistica,
       TO_CHAR(c.last_analyzed,'YYYY-MM-DD')     AS last_analyzed,
       REPLACE(REPLACE(REPLACE(cc.comments, CHR(13), ' '), CHR(10), ' '), '"', '''')
                                                 AS comentario_columna,
       TO_CHAR(SYSDATE,'YYYY-MM-DD')             AS fecha_corte
FROM   all_tab_columns c
LEFT JOIN all_col_comments cc
       ON cc.owner = c.owner AND cc.table_name = c.table_name
      AND cc.column_name = c.column_name
WHERE  c.owner IN (&esquemas)
AND    c.table_name NOT LIKE 'BIN$%'
ORDER BY c.owner, c.table_name, c.column_id;
SPOOL OFF

-- ---------------------------------------------------------------------------
-- 3. oracle_restricciones.csv · PK, UK y FK con sus columnas y tabla referida
--    Da la granularidad real de cada tabla (prestador, sistema, APS, NUIS...).
-- ---------------------------------------------------------------------------
SPOOL &dir_salida/oracle_restricciones.csv
SELECT k.owner                                   AS owner,
       k.table_name                              AS table_name,
       k.constraint_name                         AS constraint_name,
       k.constraint_type                         AS constraint_type,
       k.status                                  AS status,
       (SELECT LISTAGG(cc.column_name, '|') WITHIN GROUP (ORDER BY cc.position)
          FROM all_cons_columns cc
         WHERE cc.owner = k.owner AND cc.constraint_name = k.constraint_name) AS columnas,
       r.owner                                   AS ref_owner,
       r.table_name                              AS ref_table_name,
       (SELECT LISTAGG(rc.column_name, '|') WITHIN GROUP (ORDER BY rc.position)
          FROM all_cons_columns rc
         WHERE rc.owner = r.owner AND rc.constraint_name = r.constraint_name) AS ref_columnas
FROM   all_constraints k
LEFT JOIN all_constraints r
       ON r.owner = k.r_owner AND r.constraint_name = k.r_constraint_name
WHERE  k.owner IN (&esquemas)
AND    k.constraint_type IN ('P','U','R')
AND    k.table_name NOT LIKE 'BIN$%'
ORDER BY k.owner, k.table_name, k.constraint_type, k.constraint_name;
SPOOL OFF

-- ---------------------------------------------------------------------------
-- 4. oracle_sinonimos.csv · nombres por los que el usuario ve los objetos
-- ---------------------------------------------------------------------------
SPOOL &dir_salida/oracle_sinonimos.csv
SELECT s.owner        AS owner_sinonimo,
       s.synonym_name AS synonym_name,
       s.table_owner  AS owner,
       s.table_name   AS table_name,
       s.db_link      AS db_link
FROM   all_synonyms s
WHERE  s.table_owner IN (&esquemas)
ORDER BY s.table_owner, s.table_name;
SPOOL OFF

-- ---------------------------------------------------------------------------
-- 5. oracle_dependencias.csv · vistas que leen tablas del SUI
--    Las vistas de consulta suelen traer los nombres "de negocio" que usa el
--    portal, sirven para proponer el puente variable -> columna.
-- ---------------------------------------------------------------------------
SPOOL &dir_salida/oracle_dependencias.csv
SELECT d.owner              AS owner,
       d.name               AS vista,
       d.type               AS tipo,
       d.referenced_owner   AS ref_owner,
       d.referenced_name    AS ref_table_name,
       d.referenced_type    AS ref_tipo
FROM   all_dependencies d
WHERE  (d.owner IN (&esquemas) OR d.referenced_owner IN (&esquemas))
AND    d.type IN ('VIEW','MATERIALIZED VIEW')
AND    d.referenced_type IN ('TABLE','VIEW')
ORDER BY d.owner, d.name, d.referenced_name;
SPOOL OFF

-- ---------------------------------------------------------------------------
-- 6. oracle_metadatos_sui.csv · tablas internas que parecen ser el catálogo
--    de formatos/variables del propio SUI (ver bloque 7 del script 02).
--    Solo se listan sus columnas, su contenido se extrae aparte con
--    06_plantilla_metadatos_sui.sql una vez identificadas.
-- ---------------------------------------------------------------------------
SPOOL &dir_salida/oracle_metadatos_sui.csv
SELECT c.owner, c.table_name, c.column_id, c.column_name, c.data_type
FROM   all_tab_columns c
WHERE  c.owner IN (&esquemas)
AND    (c.owner, c.table_name) IN (
         SELECT x.owner, x.table_name
         FROM   all_tab_columns x
         WHERE  x.owner IN (&esquemas)
         AND    REGEXP_LIKE(x.column_name,
                  '^(ID_?FORMATO|COD_?FORMATO|ID_?VARIABLE|COD_?VARIABLE|NOMBRE_?CAMPO|ID_?CAMPO|ID_?TABLA|NOMBRE_?TABLA|ID_?ESQUEMA|ID_?NORMA|TIPO_?DATO)')
         GROUP BY x.owner, x.table_name
         HAVING COUNT(*) >= 3)
ORDER BY c.owner, c.table_name, c.column_id;
SPOOL OFF

SET TERMOUT ON
SET SQLFORMAT DEFAULT
PROMPT Extracción terminada. Archivos en &dir_salida :
PROMPT   oracle_tablas.csv, oracle_columnas.csv, oracle_restricciones.csv,
PROMPT   oracle_sinonimos.csv, oracle_dependencias.csv, oracle_metadatos_sui.csv
PROMPT Siguiente paso: copiarlos a comparacion/oracle/ y ejecutar 05 en DuckDB.
