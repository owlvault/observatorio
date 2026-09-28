-- =============================================================================
-- PROYECTO: Observatorio Regulatorio CRA
-- ARCHIVO : 00_crear_usuario_y_esquema_raw_control.sql
-- DESTINO : OCI Autonomous Database (ADB) - Ejecutar como ADMIN
-- PROPÓSITO: Creación del usuario y asignación de privilegios para el esquema raw_control
-- =============================================================================

-- 1. Crear el usuario de servicio raw_control (si no existe)
-- NOTA: Reemplace '<CONTRASENA_RAW_CONTROL>' por la contraseña corporativa definida en OCI Vault
CREATE USER raw_control IDENTIFIED BY "<CONTRASENA_RAW_CONTROL>"
    DEFAULT TABLESPACE data
    TEMPORARY TABLESPACE temp
    QUOTA UNLIMITED ON data;

-- 2. Privilegios de conexión y sesión básica
GRANT CREATE SESSION TO raw_control;
GRANT RESTRICTED SESSION TO raw_control;

-- 3. Privilegios de objetos para el esquema
GRANT CREATE TABLE TO raw_control;
GRANT CREATE VIEW TO raw_control;
GRANT CREATE SEQUENCE TO raw_control;
GRANT CREATE PROCEDURE TO raw_control;
GRANT CREATE TRIGGER TO raw_control;

-- 4. Privilegios para lectura/escritura de OCI Object Storage desde ADB (DBMS_CLOUD)
GRANT EXECUTE ON DBMS_CLOUD TO raw_control;

-- 5. Comentarios de auditoría
COMMENT ON USER raw_control IS 'Esquema de control de ingesta, auditoría, linaje y checkpoints del Observatorio Regulatorio CRA';

PROMPT [OK] Usuario raw_control aprovisionado con éxito. Ahora proceda a conectarse como raw_control y ejecute ddl_raw_control_schema.sql.
