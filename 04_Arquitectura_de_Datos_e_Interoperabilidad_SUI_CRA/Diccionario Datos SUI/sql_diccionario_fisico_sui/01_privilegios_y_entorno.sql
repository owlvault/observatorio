-- =============================================================================
-- 01_privilegios_y_entorno.sql
-- Observatorio CRA · Extracción del diccionario físico del SUI (Oracle)
-- Objetivo : confirmar QUÉ puede ver el usuario de consulta antes de extraer.
-- Responde : Q-DIC-01 del diagnóstico de completitud (2026-09-16).
-- Seguridad: solo lectura. No usa vistas DBA_*, no hace COUNT(*) sobre tablas
--            de negocio, no lee datos de prestadores ni de suscriptores.
-- Cliente  : SQL Developer (F5, modo script), SQLcl o SQL*Plus.
-- =============================================================================

SET SQLBLANKLINES ON
SET DEFINE ON

SET PAGESIZE 200
SET LINESIZE 250
SET FEEDBACK ON

PROMPT == 1. Identidad de la sesión ==========================================
SELECT SYS_CONTEXT('USERENV','SESSION_USER')    AS usuario_sesion,
       SYS_CONTEXT('USERENV','CURRENT_SCHEMA')  AS esquema_actual,
       SYS_CONTEXT('USERENV','DB_NAME')         AS base_datos,
       SYS_CONTEXT('USERENV','SERVICE_NAME')    AS servicio,
       TO_CHAR(SYSDATE,'YYYY-MM-DD HH24:MI:SS') AS fecha_corte
FROM   dual;

PROMPT == 2. Versión del motor (define qué sintaxis usar) ======================
-- LISTAGG requiere 11gR2+. Si la versión es 11g, los scripts siguientes
-- funcionan igual (no se usa FETCH FIRST ni LISTAGG ... ON OVERFLOW).
SELECT product, version, status
FROM   product_component_version;

PROMPT == 3. Privilegios de sistema de la sesión ===============================
-- Si aparece SELECT ANY DICTIONARY o SELECT_CATALOG_ROLE, se podrían usar
-- vistas DBA_*, los scripts usan ALL_* igualmente para no depender de ello.
SELECT privilege FROM session_privs ORDER BY privilege;

PROMPT == 4. Roles activos ======================================================
SELECT role FROM session_roles ORDER BY role;

PROMPT == 5. Visibilidad efectiva del catálogo =================================
-- Si ALL_TABLES devuelve pocos objetos y ALL_SYNONYMS muchos, el acceso es
-- por sinónimos y hay que resolverlos (ver 02_descubrir_esquemas.sql, bloque 4).
SELECT 'ALL_TABLES'        AS vista, COUNT(*) AS objetos_visibles FROM all_tables
UNION ALL SELECT 'ALL_VIEWS',        COUNT(*) FROM all_views
UNION ALL SELECT 'ALL_TAB_COLUMNS',  COUNT(*) FROM all_tab_columns
UNION ALL SELECT 'ALL_COL_COMMENTS', COUNT(*) FROM all_col_comments WHERE comments IS NOT NULL
UNION ALL SELECT 'ALL_CONSTRAINTS',  COUNT(*) FROM all_constraints WHERE constraint_type IN ('P','U','R')
UNION ALL SELECT 'ALL_SYNONYMS',     COUNT(*) FROM all_synonyms;

PROMPT == 6. Privilegios de objeto otorgados al usuario (muestra) ==============
SELECT grantor, table_schema AS owner, table_name, privilege
FROM   all_tab_privs
WHERE  grantee IN (SELECT SYS_CONTEXT('USERENV','SESSION_USER') FROM dual
                   UNION ALL SELECT role FROM session_roles
                   UNION ALL SELECT 'PUBLIC' FROM dual)
AND    table_name LIKE 'CAR\_%' ESCAPE '\'
AND    ROWNUM <= 50;

PROMPT == Interpretación ========================================================
PROMPT  Si el bloque 5 muestra ALL_TAB_COLUMNS > 0 para tablas CAR_*, P1 es viable.
PROMPT  Si todo sale en 0 salvo ALL_SYNONYMS, pasar al bloque 4 del script 02.
PROMPT  Si no hay nada visible, solicitar a la SSPD: SELECT sobre ALL_TAB_COLUMNS
PROMPT  y ALL_COL_COMMENTS para los esquemas del SUI AAA (oficio H1).
