-- =============================================================================
-- 06_plantilla_metadatos_sui.sql
-- Observatorio CRA · Extracción del catálogo de negocio interno del SUI
-- Objetivo : si el bloque 7 de 02 encontró las tablas internas con que el portal
--            DiccionarioConsultaV2 relaciona formato -> esquema -> tabla -> campo,
--            exportar su contenido. Esa relación, declarada por la SSPD, es la
--            ÚNICA fuente válida para poblar variable_tabla (regla 3 del README).
-- Uso      : reemplazar los nombres entre <> por los encontrados en 02 y en
--            oracle_metadatos_sui.csv. Son tablas de metadatos, no de prestadores.
-- =============================================================================

SET SQLBLANKLINES ON
SET DEFINE ON

DEFINE dir_salida = "C:\observatorio\oracle"

SET TERMOUT OFF
SET FEEDBACK OFF
SET HEADING ON
-- PAGESIZE alto y no 0: con 0 se suprime el encabezado del CSV
SET PAGESIZE 50000
SET LINESIZE 32767
SET TRIMSPOOL ON
SET SQLFORMAT CSV

-- 1. Catálogo de formatos (esperado: id de formato, nombre, norma, esquema)
SPOOL &dir_salida/sui_meta_formato.csv
SELECT *
FROM   <OWNER>.<TABLA_FORMATOS>;
SPOOL OFF

-- 2. Relación formato -> tabla física (esperado: id formato, esquema, tabla)
SPOOL &dir_salida/sui_meta_formato_tabla.csv
SELECT *
FROM   <OWNER>.<TABLA_FORMATO_TABLA>;
SPOOL OFF

-- 3. Campos por formato (esperado: id formato, orden, nombre campo, columna
--    física, tipo, longitud, obligatoriedad, dominio)
SPOOL &dir_salida/sui_meta_campo.csv
SELECT *
FROM   <OWNER>.<TABLA_CAMPOS>;
SPOOL OFF

SET TERMOUT ON
SET SQLFORMAT DEFAULT
PROMPT Metadatos internos exportados. Revisar con el steward antes de cargar
PROMPT a variable_tabla: la fuente se registra como "catálogo interno SUI".
