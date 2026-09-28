-- =============================================================================
-- PROYECTO: Observatorio Regulatorio CRA
-- ESQUEMA: raw_control (Control de Ingesta, Checkpoints, Linaje y Auditoría)
-- DESTINO: OCI Autonomous Database (ADB)
-- FUENTES: specs/ingesta-sui-y-fuentes.md, adr/ADR-0006, adr/ADR-0007, adr/ADR-0008
-- FECHA: 2026-09-28
-- =============================================================================

-- 1. Catálogo de Fuentes de Ingesta
CREATE TABLE raw_control.ingestion_source (
    source_id            VARCHAR2(32) PRIMARY KEY,     -- 'SUI_ORACLE', 'DANE_TERRITORIAL', 'INS_SIVICAP', 'CRA_RADICADOS'
    source_name          VARCHAR2(255) NOT NULL,
    connection_mode      VARCHAR2(30) NOT NULL,     -- 'VPN_OPERATOR', 'VCN_DIRECT', 'REST_PUBLIC'
    default_cadence      VARCHAR2(20) NOT NULL,     -- 'MENSUAL', 'TRIMESTRAL', 'ANUAL'
    is_active            NUMBER(1) DEFAULT 1 NOT NULL,
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Registro de fuentes base oficiales
INSERT INTO raw_control.ingestion_source (source_id, source_name, connection_mode, default_cadence, is_active)
VALUES ('SUI_ORACLE', 'Sistema Único de Información (SSPD) - Base Oracle', 'VPN_OPERATOR', 'MENSUAL', 1);

INSERT INTO raw_control.ingestion_source (source_id, source_name, connection_mode, default_cadence, is_active)
VALUES ('DANE_TERRITORIAL', 'DANE - Catálogo DIVIPOLA y Proyecciones Demográficas', 'REST_PUBLIC', 'ANUAL', 1);

INSERT INTO raw_control.ingestion_source (source_id, source_name, connection_mode, default_cadence, is_active)
VALUES ('INS_SIVICAP', 'Instituto Nacional de Salud - SIVICAP Calidad de Agua (IRCA)', 'REST_PUBLIC', 'MENSUAL', 1);

INSERT INTO raw_control.ingestion_source (source_id, source_name, connection_mode, default_cadence, is_active)
VALUES ('CRA_RADICADOS', 'Sede Electrónica CRA - Estudios de Costos Res. 1038 de 2026', 'VPN_OPERATOR', 'MENSUAL', 1);

-- 2. Lotes de Ejecución de Ingesta (Batch)
CREATE TABLE raw_control.ingestion_batch (
    batch_id             VARCHAR2(64) PRIMARY KEY,     -- Ej: 'BAT-20261015-143022-UUID'
    source_id            VARCHAR2(32) NOT NULL,
    execution_mode       VARCHAR2(30) NOT NULL,     -- 'OPERATOR_ASSISTED', 'UNATTENDED_DAEMON'
    operator_user_id     VARCHAR2(100) NOT NULL,    -- Identificación del operador (linaje RF-SUI-02)
    started_at           TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at         TIMESTAMP WITH TIME ZONE,
    batch_status         VARCHAR2(20) NOT NULL,     -- 'RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED'
    total_datasets       NUMBER(8) DEFAULT 0,
    total_records        NUMBER(14) DEFAULT 0,
    error_summary        VARCHAR2(4000),
    FOREIGN KEY (source_id) REFERENCES raw_control.ingestion_source(source_id),
    CONSTRAINT chk_batch_status CHECK (batch_status IN ('RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED'))
);

-- 3. Puntos de Control y Reanudabilidad (RF-SUI-10 / Sesiones VPN 4 Horas)
CREATE TABLE raw_control.ingestion_checkpoint (
    checkpoint_id        NUMBER(14) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    batch_id             VARCHAR2(64) NOT NULL,
    domain_name          VARCHAR2(60) NOT NULL,     -- 'BALANCE_HIDRICO', 'COMERCIAL_AA', 'TARIFAS'
    reporting_period     VARCHAR2(7) NOT NULL,      -- 'YYYY-MM'
    last_provider_id     NUMBER(10),                -- Último ID de prestador completado en el chunk
    chunk_sequence       NUMBER(6) NOT NULL,        -- Secuencia: 1, 2, 3...
    records_in_chunk     NUMBER(10) NOT NULL,
    saved_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_completed         NUMBER(1) DEFAULT 0 NOT NULL,
    FOREIGN KEY (batch_id) REFERENCES raw_control.ingestion_batch(batch_id)
);

CREATE INDEX idx_chkpoint_batch ON raw_control.ingestion_checkpoint(batch_id, is_completed);

-- 4. Datasets Inmutables en Object Storage (Zona Cruda con Linaje Criptográfico)
CREATE TABLE raw_control.raw_dataset (
    dataset_id           VARCHAR2(64) PRIMARY KEY,     -- Ej: 'DS-20261015-UUID'
    batch_id             VARCHAR2(64) NOT NULL,
    source_id            VARCHAR2(32) NOT NULL,
    domain_name          VARCHAR2(60) NOT NULL,
    reporting_period     VARCHAR2(7) NOT NULL,      -- Periodo de reporte de negocio ('YYYY-MM')
    query_id             VARCHAR2(64) NOT NULL,     -- Identificador de consulta versionada
    query_text_sha256    VARCHAR2(64) NOT NULL,     -- Hash SHA-256 del SQL ejecutado
    schema_fingerprint   VARCHAR2(64) NOT NULL,     -- Hash de estructura física de columnas
    object_storage_uri   VARCHAR2(1000) NOT NULL,   -- URI del archivo Parquet en OCI Bucket
    file_sha256          VARCHAR2(64) NOT NULL,     -- Checksum SHA-256 binario del dataset
    record_count         NUMBER(12) NOT NULL,
    byte_size            NUMBER(14) NOT NULL,
    ingested_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_superseded        NUMBER(1) DEFAULT 0 NOT NULL, -- 1 si fue rectificado (RF-SUI-04)
    FOREIGN KEY (batch_id) REFERENCES raw_control.ingestion_batch(batch_id),
    FOREIGN KEY (source_id) REFERENCES raw_control.ingestion_source(source_id)
);

CREATE INDEX idx_raw_ds_period ON raw_control.raw_dataset(domain_name, reporting_period, is_superseded);
CREATE INDEX idx_raw_ds_hash ON raw_control.raw_dataset(file_sha256);

-- 5. Registro de Cambios, Retransmisiones y Schema Drift (RF-SUI-04, RF-SUI-06)
CREATE TABLE raw_control.raw_change_log (
    change_id            VARCHAR2(64) PRIMARY KEY,
    new_dataset_id       VARCHAR2(64) NOT NULL,
    superseded_dataset_id VARCHAR2(64) NOT NULL,
    domain_name          VARCHAR2(60) NOT NULL,
    reporting_period     VARCHAR2(7) NOT NULL,
    detected_action      VARCHAR2(30) NOT NULL,     -- 'RETRANSMISSION_DETECTED', 'SCHEMA_DRIFT'
    records_diff         NUMBER(10),
    detected_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    recalculation_status VARCHAR2(20) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'CALCULATED', 'OVERRIDDEN'
    curator_notes        VARCHAR2(1000),
    FOREIGN KEY (new_dataset_id) REFERENCES raw_control.raw_dataset(dataset_id),
    FOREIGN KEY (superseded_dataset_id) REFERENCES raw_control.raw_dataset(dataset_id),
    CONSTRAINT chk_recalc_status CHECK (recalculation_status IN ('PENDING', 'CALCULATED', 'OVERRIDDEN'))
);

COMMIT;
