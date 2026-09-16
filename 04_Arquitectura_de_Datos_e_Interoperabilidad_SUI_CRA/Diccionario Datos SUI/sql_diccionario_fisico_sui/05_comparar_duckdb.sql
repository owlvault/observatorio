-- =============================================================================
-- 05_comparar_duckdb.sql
-- Observatorio CRA · Comparación completa: diccionario físico real (Oracle)
--                    vs diccionario del lake (diccionario_sui_cra v0.2.0)
-- Motor    : DuckDB >= 1.1 (local, sin servidor). No se conecta a Oracle:
--            lee los CSV exportados por 03 y los CSV del paquete del lake.
-- Ejecución, desde la carpeta comparacion/:
--     duckdb comparacion.duckdb < ../sql/05_comparar_duckdb.sql
-- Estructura esperada:
--     comparacion/lake/     <- data/*.csv del paquete v0.2.0 + matriz_trazabilidad_indicadores_sui.csv
--     comparacion/oracle/   <- oracle_*.csv producidos por 03
--     comparacion/salida/   <- resultados (se crea vacía antes de ejecutar)
-- Reglas del README del lake que este script respeta:
--   R2  variables con requiere_validacion = true se marcan, no se descartan.
--   R3  NO se escribe variable_tabla. El puente variable -> columna sale como
--       "candidato-pendiente-steward" con método y puntaje explícitos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Utilidades
-- -----------------------------------------------------------------------------
CREATE OR REPLACE MACRO norm(x) AS
  trim(regexp_replace(upper(strip_accents(coalesce(x, ''))), '[^A-Z0-9]+', '_', 'g'), '_');

-- -----------------------------------------------------------------------------
-- 1. Carga (todo como texto; se tipa donde hace falta)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE lake_tabla          AS SELECT * FROM read_csv('lake/tabla_sui.csv',        header=true, all_varchar=true);
CREATE OR REPLACE TABLE lake_formato        AS SELECT * FROM read_csv('lake/formato.csv',          header=true, all_varchar=true);
CREATE OR REPLACE TABLE lake_formato_tabla  AS SELECT * FROM read_csv('lake/formato_tabla.csv',    header=true, all_varchar=true);
CREATE OR REPLACE TABLE lake_variable       AS SELECT * FROM read_csv('lake/variable_formato.csv', header=true, all_varchar=true);
CREATE OR REPLACE TABLE lake_matriz         AS SELECT * FROM read_csv('lake/matriz_trazabilidad_indicadores_sui.csv', header=true, all_varchar=true);

CREATE OR REPLACE TABLE ora_tablas     AS SELECT * FROM read_csv('oracle/oracle_tablas.csv',        header=true, all_varchar=true);
CREATE OR REPLACE TABLE ora_columnas   AS SELECT * FROM read_csv('oracle/oracle_columnas.csv',      header=true, all_varchar=true);
CREATE OR REPLACE TABLE ora_restr      AS SELECT * FROM read_csv('oracle/oracle_restricciones.csv', header=true, all_varchar=true);
CREATE OR REPLACE TABLE ora_sinonimos  AS SELECT * FROM read_csv('oracle/oracle_sinonimos.csv',     header=true, all_varchar=true);

-- Los encabezados de SQL Developer/SQLcl salen en mayúsculas: se normalizan.
CREATE OR REPLACE TABLE ora_t AS
SELECT upper("OWNER") AS owner, upper("TABLE_NAME") AS table_name, "OBJECT_TYPE" AS object_type,
       TRY_CAST("NUM_ROWS_ESTADISTICA" AS BIGINT) AS num_rows, "LAST_ANALYZED" AS last_analyzed,
       TRY_CAST("N_COLUMNAS" AS INTEGER) AS n_columnas, "COMENTARIO_TABLA" AS comentario_tabla,
       "FECHA_CORTE" AS fecha_corte
FROM ora_tablas;

CREATE OR REPLACE TABLE ora_c AS
SELECT upper("OWNER") AS owner, upper("TABLE_NAME") AS table_name,
       TRY_CAST("COLUMN_ID" AS INTEGER) AS column_id, upper("COLUMN_NAME") AS column_name,
       "DATA_TYPE" AS data_type, TRY_CAST("LONGITUD" AS INTEGER) AS longitud,
       TRY_CAST("DATA_PRECISION" AS INTEGER) AS data_precision, TRY_CAST("DATA_SCALE" AS INTEGER) AS data_scale,
       "NULLABLE" AS nullable, "COMENTARIO_COLUMNA" AS comentario_columna, "FECHA_CORTE" AS fecha_corte
FROM ora_columnas;

-- Columnas que forman parte de PK / UK / FK
CREATE OR REPLACE TABLE ora_llaves AS
SELECT upper("OWNER") AS owner, upper("TABLE_NAME") AS table_name,
       unnest(string_split("COLUMNAS", '|')) AS column_name, "CONSTRAINT_TYPE" AS constraint_type
FROM ora_restr;

-- -----------------------------------------------------------------------------
-- 2. Comparación a nivel de TABLA
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE cmp_tabla AS
WITH col_stats AS (
  SELECT owner, table_name,
         count(*)                                   AS n_col,
         count(comentario_columna)                  AS n_col_comentadas
  FROM ora_c GROUP BY ALL
),
pk AS (
  SELECT owner, table_name, string_agg(column_name, '|' ORDER BY column_name) AS pk_columnas
  FROM ora_llaves WHERE constraint_type = 'P' GROUP BY ALL
),
fisica AS (
  SELECT t.*, s.n_col, s.n_col_comentadas, pk.pk_columnas
  FROM ora_t t
  LEFT JOIN col_stats s USING (owner, table_name)
  LEFT JOIN pk          USING (owner, table_name)
),
sin AS (   -- nombre del lake que en Oracle es un sinónimo
  SELECT upper("SYNONYM_NAME") AS nombre, upper("OWNER") AS owner_real, upper("TABLE_NAME") AS tabla_real
  FROM ora_sinonimos
),
lake AS (
  SELECT upper(nombre_tabla) AS nombre_tabla, descripcion, n_formatos, compartida, hallazgos
  FROM lake_tabla
)
SELECT
  coalesce(l.nombre_tabla, f.table_name)                                  AS nombre_tabla,
  f.owner,
  CASE
    WHEN l.nombre_tabla IS NOT NULL AND f.table_name IS NOT NULL
         AND f.table_name = l.nombre_tabla                                THEN 'coincide'
    WHEN l.nombre_tabla IS NOT NULL AND f.table_name IS NOT NULL          THEN 'coincide_por_sinonimo'
    WHEN l.nombre_tabla IS NOT NULL                                       THEN 'solo_lake_no_encontrada'
    WHEN f.table_name LIKE 'CAR\_%' ESCAPE '\'                            THEN 'solo_oracle_car_no_catalogada'
    ELSE                                                                       'solo_oracle_otra'
  END                                                                     AS estado,
  s.tabla_real,
  f.object_type,
  f.n_col                                                                 AS n_columnas,
  f.n_col_comentadas,
  round(100.0 * f.n_col_comentadas / nullif(f.n_col, 0), 0)               AS pct_col_comentadas,
  f.pk_columnas                                                           AS granularidad_pk,
  f.num_rows                                                              AS num_rows_estadistica,
  f.last_analyzed,
  l.descripcion                                                           AS descripcion_lake,
  f.comentario_tabla                                                      AS comentario_oracle,
  round(jaro_winkler_similarity(norm(l.descripcion), norm(f.comentario_tabla)), 2) AS similitud_descripcion,
  CASE
    WHEN l.nombre_tabla IS NULL OR f.table_name IS NULL                   THEN NULL
    WHEN f.comentario_tabla IS NULL                                       THEN 'H5: sin comentario físico'
    WHEN l.descripcion IS NULL                                            THEN 'H5: descripción vacía en lake; usar comentario físico'
    WHEN jaro_winkler_similarity(norm(l.descripcion), norm(f.comentario_tabla)) < 0.75
                                                                          THEN 'H5: descripción del lake difiere del comentario físico'
  END                                                                     AS alerta_descripcion,
  l.hallazgos                                                             AS hallazgos_lake
FROM lake l
LEFT JOIN sin s      ON s.nombre = l.nombre_tabla
FULL OUTER JOIN fisica f
       ON f.table_name = l.nombre_tabla
       OR (s.tabla_real IS NOT NULL AND f.owner = s.owner_real AND f.table_name = s.tabla_real);

-- -----------------------------------------------------------------------------
-- 3. Comparación formato -> tabla (linaje declarado en el lake vs existencia física)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE cmp_formato_tabla AS
SELECT ft.id_formato, f.nombre AS formato, f.dominio_funcional, f.estado_vigencia,
       upper(ft.nombre_tabla) AS nombre_tabla,
       coalesce(max(c.estado), 'solo_lake_no_encontrada') AS estado_tabla,
       max(c.n_columnas) AS n_columnas_fisicas,
       max(c.granularidad_pk) AS granularidad_pk
FROM lake_formato_tabla ft
LEFT JOIN lake_formato f USING (id_formato)
LEFT JOIN cmp_tabla c
       ON c.nombre_tabla = upper(ft.nombre_tabla)
      AND c.estado IN ('coincide','coincide_por_sinonimo')
GROUP BY ALL;

-- -----------------------------------------------------------------------------
-- 4. Tablas físicas candidatas a IUS / cargue AA 2024 (firma de siglas)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE ora_candidatas_ius AS
WITH firma(sigla) AS (
  VALUES ('VTAP'),('VTA'),('ACPUC'),('NEP'),('IMA'),('IMI'),('NDNA'),('NTD'),('POAC'),('POALC'),
         ('IPAA'),('CLT'),('CLG'),('EET'),('CMCAP'),('PPAP'),('IRPD'),('FAC'),('FAL'),('ICG'),('IC')
)
SELECT c.owner, c.table_name,
       count(DISTINCT f.sigla)                                  AS siglas_encontradas,
       string_agg(DISTINCT f.sigla, ',' ORDER BY f.sigla)       AS siglas
FROM ora_c c
JOIN firma f
  ON c.column_name = f.sigla
  OR c.column_name LIKE '%\_' || f.sigla ESCAPE '\'
  OR c.column_name LIKE f.sigla || '\_%' ESCAPE '\'
GROUP BY ALL
HAVING count(DISTINCT f.sigla) >= 4;

-- -----------------------------------------------------------------------------
-- 5. Puente CANDIDATO variable (lake) -> columna (Oracle)
--    Métodos, de mayor a menor confianza:
--      M1 sigla_exacta        : sigla declarada en el nombre (…_VTAP) = columna
--      M2 nombre_normalizado  : nombre de variable normalizado = columna
--      M3 comentario_similar  : nombre ~ comentario de columna (Jaro-Winkler)
--      M4 nombre_similar      : nombre ~ nombre de columna (Jaro-Winkler)
--    Ámbito de M3/M4: tablas del formato catalogado de la variable (formato_tabla)
--    o, si la variable no cruza con el catálogo, las candidatas IUS del bloque 4.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE lake_var AS
SELECT v.id_variable, v.id_documento, v.formato_segun_documento, v.nombre_variable,
       v.definicion, v.unidad_medida, v.id_formato_catalogo, v.calidad_correspondencia,
       v.requiere_validacion, v.clasificacion_sensibilidad,
       norm(v.nombre_variable) AS nombre_norm,
       coalesce(
         nullif(regexp_extract(v.nombre_variable, '_([A-Z][A-Z0-9]{1,9})$', 1), ''),
         nullif(regexp_extract(v.nombre_variable, '^([A-Z][A-Z0-9]*(_[A-Z0-9]+)?)$', 1), ''),
         nullif(regexp_extract(v.nombre_variable, '^([A-Z]{3,6}) ', 1), '')
       ) AS sigla_bruta
FROM lake_variable v;

-- Siglas genéricas que producirían falsos positivos se anulan.
ALTER TABLE lake_var ADD COLUMN sigla VARCHAR;
UPDATE lake_var
SET sigla = CASE WHEN sigla_bruta IN ('ID','NO','SI','DE','COD','NIT','DANE','TOTAL','VALOR','FECHA','TIPO')
                 THEN NULL ELSE sigla_bruta END;

CREATE OR REPLACE TABLE ambito_var AS
SELECT v.id_variable, upper(ft.nombre_tabla) AS table_name, 'formato_catalogo' AS ambito
FROM lake_var v
JOIN lake_formato_tabla ft
  ON ft.id_formato = regexp_replace(v.id_formato_catalogo, '\.0$', '')
UNION
SELECT v.id_variable, i.table_name, 'candidata_ius' AS ambito
FROM lake_var v
CROSS JOIN ora_candidatas_ius i
WHERE v.id_formato_catalogo IS NULL
  AND v.id_documento IN ('INSTRUCTIVO_IUS_APS_2024','INSTRUCTIVO_CARGUE_AA_2024','ANEXO_TECNICO_IUS_284385_2022');

CREATE OR REPLACE TABLE puente_candidato AS
WITH m1 AS (
  SELECT v.id_variable, c.owner, c.table_name, c.column_name, 'M1_sigla_exacta' AS metodo,
         CASE WHEN a.table_name IS NOT NULL THEN 0.95 ELSE 0.75 END AS puntaje
  FROM lake_var v
  JOIN ora_c c
    ON v.sigla IS NOT NULL
   AND (c.column_name = v.sigla OR c.column_name LIKE '%\_' || v.sigla ESCAPE '\')
  LEFT JOIN ambito_var a ON a.id_variable = v.id_variable AND a.table_name = c.table_name
),
m2 AS (
  SELECT v.id_variable, c.owner, c.table_name, c.column_name, 'M2_nombre_normalizado' AS metodo,
         CASE WHEN a.table_name IS NOT NULL THEN 0.90 ELSE 0.70 END AS puntaje
  FROM lake_var v
  JOIN ora_c c ON c.column_name = v.nombre_norm
  LEFT JOIN ambito_var a ON a.id_variable = v.id_variable AND a.table_name = c.table_name
),
en_ambito AS (
  SELECT v.id_variable, v.nombre_norm, c.owner, c.table_name, c.column_name, c.comentario_columna
  FROM lake_var v
  JOIN ambito_var a ON a.id_variable = v.id_variable
  JOIN ora_c c      ON c.table_name = a.table_name
),
m3 AS (
  SELECT id_variable, owner, table_name, column_name, 'M3_comentario_similar' AS metodo,
         round(0.85 * jaro_winkler_similarity(nombre_norm, norm(comentario_columna)), 3) AS puntaje
  FROM en_ambito
  WHERE comentario_columna IS NOT NULL
    AND jaro_winkler_similarity(nombre_norm, norm(comentario_columna)) >= 0.88
),
m4 AS (
  SELECT id_variable, owner, table_name, column_name, 'M4_nombre_similar' AS metodo,
         round(0.75 * jaro_winkler_similarity(nombre_norm, column_name), 3) AS puntaje
  FROM en_ambito
  WHERE jaro_winkler_similarity(nombre_norm, column_name) >= 0.85
),
todos AS (
  SELECT * FROM m1 UNION ALL SELECT * FROM m2 UNION ALL SELECT * FROM m3 UNION ALL SELECT * FROM m4
),
mejor AS (   -- un registro por (variable, columna) con su mejor método
  SELECT *, row_number() OVER (PARTITION BY id_variable, owner, table_name, column_name
                               ORDER BY puntaje DESC) AS rn_col
  FROM todos
),
rank_var AS (
  SELECT *, row_number() OVER (PARTITION BY id_variable ORDER BY puntaje DESC, table_name, column_name) AS rango
  FROM mejor WHERE rn_col = 1
)
SELECT v.id_variable, v.id_documento, v.formato_segun_documento, v.nombre_variable,
       v.sigla, v.id_formato_catalogo, v.requiere_validacion, v.clasificacion_sensibilidad,
       r.rango, r.owner, r.table_name, r.column_name, r.metodo, r.puntaje,
       c.data_type, c.longitud, c.nullable, c.comentario_columna,
       CASE WHEN r.puntaje >= 0.90 THEN 'alta'
            WHEN r.puntaje >= 0.75 THEN 'media'
            ELSE 'baja' END                                   AS confianza,
       CASE WHEN v.requiere_validacion = 'true'
            THEN 'candidato-pendiente-steward; variable sin validar contra PDF (R2)'
            ELSE 'candidato-pendiente-steward' END            AS estado
FROM rank_var r
JOIN lake_var v USING (id_variable)
LEFT JOIN ora_c c USING (owner, table_name, column_name)
WHERE r.rango <= 3;

-- -----------------------------------------------------------------------------
-- 6. Efecto sobre la batería de indicadores
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE cmp_bateria_tablas AS
SELECT m.indicador, m.variable_requerida,
       trim(t.nombre_tabla) AS tabla_candidata,
       coalesce(c.estado, 'solo_lake_no_encontrada') AS estado_fisico,
       c.n_columnas, c.granularidad_pk, c.num_rows_estadistica
FROM lake_matriz m,
     unnest(string_split(m.tablas_candidatas, ';')) AS t(nombre_tabla)
LEFT JOIN cmp_tabla c
       ON c.nombre_tabla = upper(trim(t.nombre_tabla))
      AND c.estado IN ('coincide','coincide_por_sinonimo')
WHERE m.tablas_candidatas IS NOT NULL AND trim(t.nombre_tabla) <> '';

CREATE OR REPLACE TABLE cmp_bateria_variables AS
WITH ids AS (
  SELECT m.indicador, m.variable_requerida, m.rol, TRY_CAST(m.nivel AS INTEGER) AS nivel_lake,
         trim(i.id_variable) AS id_variable
  FROM lake_matriz m,
       unnest(string_split(coalesce(m.ids_variable, ''), ';')) AS i(id_variable)
)
SELECT i.indicador, i.variable_requerida, i.rol, i.nivel_lake,
       count(DISTINCT i.id_variable) FILTER (WHERE i.id_variable <> '')               AS variables_lake,
       count(DISTINCT p.id_variable) FILTER (WHERE p.confianza = 'alta')             AS con_columna_alta,
       count(DISTINCT p.id_variable) FILTER (WHERE p.confianza IN ('alta','media'))  AS con_columna_media_o_alta,
       string_agg(DISTINCT p.owner || '.' || p.table_name || '.' || p.column_name, '; ')
         FILTER (WHERE p.rango = 1 AND p.confianza IN ('alta','media'))              AS mejores_columnas,
       CASE
         WHEN count(DISTINCT p.id_variable) FILTER (WHERE p.confianza = 'alta') > 0 THEN 'N5-candidato (alta)'
         WHEN count(DISTINCT p.id_variable) FILTER (WHERE p.confianza = 'media') > 0 THEN 'N5-candidato (media)'
         ELSE 'sin columna candidata'
       END                                                                          AS nivel_nuevo
FROM ids i
LEFT JOIN puente_candidato p ON p.id_variable = i.id_variable AND p.rango = 1
GROUP BY ALL
ORDER BY i.indicador, i.variable_requerida;

-- -----------------------------------------------------------------------------
-- 7. Recurso propuesto para el paquete v0.3: columna_fisica_observada
--    Mismos campos que variable_tabla, sin id_variable_formato (R3).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE columna_fisica_observada AS
WITH llaves AS (
  SELECT owner, table_name, column_name, string_agg(DISTINCT constraint_type, '|') AS llave
  FROM ora_llaves GROUP BY ALL
)
SELECT c.owner || '.' || c.table_name || '.' || c.column_name       AS id_columna,
       c.owner                                                      AS esquema,
       c.table_name                                                 AS nombre_tabla,
       c.column_name                                                AS nombre_columna,
       c.column_id                                                  AS orden,
       c.comentario_columna                                         AS definicion,
       c.data_type                                                  AS tipo_dato,
       c.longitud,
       c.data_precision                                             AS precision_numerica,
       c.data_scale                                                 AS escala,
       CASE c.nullable WHEN 'N' THEN 'obligatorio' ELSE 'opcional' END AS obligatoriedad,
       k.llave,
       t.estado                                                     AS estado_tabla_vs_lake,
       'Oracle SUI · ALL_TAB_COLUMNS/ALL_COL_COMMENTS'               AS fuente,
       c.fecha_corte                                                AS valido_desde,
       NULL                                                         AS valido_hasta
FROM ora_c c
LEFT JOIN llaves k USING (owner, table_name, column_name)
LEFT JOIN cmp_tabla t ON t.owner = c.owner AND t.nombre_tabla = c.table_name;

-- -----------------------------------------------------------------------------
-- 8. Resumen y exportación
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE resumen_comparacion AS
SELECT 'tablas del lake'                                      AS metrica, count(*)::VARCHAR AS valor FROM lake_tabla
UNION ALL SELECT 'tablas del lake encontradas en Oracle',     count(*)::VARCHAR FROM cmp_tabla WHERE estado IN ('coincide','coincide_por_sinonimo')
UNION ALL SELECT '  …de ellas por sinónimo',                  count(*)::VARCHAR FROM cmp_tabla WHERE estado = 'coincide_por_sinonimo'
UNION ALL SELECT 'tablas del lake NO encontradas',            count(*)::VARCHAR FROM cmp_tabla WHERE estado = 'solo_lake_no_encontrada'
UNION ALL SELECT 'tablas CAR_* físicas fuera del lake (H9)',  count(*)::VARCHAR FROM cmp_tabla WHERE estado = 'solo_oracle_car_no_catalogada'
UNION ALL SELECT 'tablas con alerta de descripción (H5)',     count(*)::VARCHAR FROM cmp_tabla WHERE alerta_descripcion IS NOT NULL
UNION ALL SELECT 'columnas físicas observadas',               count(*)::VARCHAR FROM ora_c
UNION ALL SELECT '% columnas con comentario',                 round(100.0 * count(comentario_columna) / nullif(count(*),0), 1)::VARCHAR FROM ora_c
UNION ALL SELECT 'relaciones formato→tabla con tabla física', count(*)::VARCHAR FROM cmp_formato_tabla WHERE estado_tabla <> 'solo_lake_no_encontrada'
UNION ALL SELECT 'relaciones formato→tabla sin tabla física', count(*)::VARCHAR FROM cmp_formato_tabla WHERE estado_tabla = 'solo_lake_no_encontrada'
UNION ALL SELECT 'tablas candidatas IUS/cargue AA (firma)',   count(*)::VARCHAR FROM ora_candidatas_ius
UNION ALL SELECT 'variables del lake',                        count(*)::VARCHAR FROM lake_var
UNION ALL SELECT 'variables con columna candidata alta',      count(DISTINCT id_variable)::VARCHAR FROM puente_candidato WHERE rango = 1 AND confianza = 'alta'
UNION ALL SELECT 'variables con columna candidata media',     count(DISTINCT id_variable)::VARCHAR FROM puente_candidato WHERE rango = 1 AND confianza = 'media'
UNION ALL SELECT 'variables requeridas de la batería con N5-candidato',
                 count(*)::VARCHAR FROM cmp_bateria_variables WHERE nivel_nuevo LIKE 'N5%'
UNION ALL SELECT 'variables requeridas de la batería (total)', count(*)::VARCHAR FROM cmp_bateria_variables;

.print '== Resumen de la comparación =='
SELECT * FROM resumen_comparacion;
.print '== Batería: variables requeridas con columna candidata =='
SELECT indicador, variable_requerida, nivel_lake, nivel_nuevo, mejores_columnas
FROM cmp_bateria_variables ORDER BY indicador, variable_requerida;

COPY resumen_comparacion       TO 'salida/resumen_comparacion.csv'       (HEADER, DELIMITER ',');
COPY cmp_tabla                 TO 'salida/cmp_tabla.csv'                 (HEADER, DELIMITER ',');
COPY cmp_formato_tabla         TO 'salida/cmp_formato_tabla.csv'         (HEADER, DELIMITER ',');
COPY ora_candidatas_ius        TO 'salida/ora_candidatas_ius.csv'        (HEADER, DELIMITER ',');
COPY puente_candidato          TO 'salida/puente_candidato.csv'          (HEADER, DELIMITER ',');
COPY cmp_bateria_tablas        TO 'salida/cmp_bateria_tablas.csv'        (HEADER, DELIMITER ',');
COPY cmp_bateria_variables     TO 'salida/cmp_bateria_variables.csv'     (HEADER, DELIMITER ',');
COPY columna_fisica_observada  TO 'salida/columna_fisica_observada.csv'  (HEADER, DELIMITER ',');
