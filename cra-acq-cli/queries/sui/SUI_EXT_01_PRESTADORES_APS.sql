-- =============================================================================
-- QUERY_ID: SUI_EXT_01_PRESTADORES_APS
-- VERSION: 1.0.0
-- DOMINIO: CATASTRO_PRESTADORES_APS
-- FUENTE: SUI Oracle (SSPD)
-- DESCRIPCION: Extrae catálogo de prestadores activos y sus APS para el periodo.
-- PARÁMETROS: :period_id (Formato 'YYYY-MM'), :min_provider_id, :max_provider_id
-- =============================================================================

SELECT 
    p.ID_EMPRESA           AS provider_id,
    p.NIT                  AS nit,
    p.NOMBRE_COMERCIAL     AS business_name,
    p.NATURALEZA_JURIDICA  AS legal_nature,
    p.ESTADO_EMPRESA       AS provider_status,
    aps.ID_APS             AS service_area_id,
    aps.CODIGO_DANE_MUN    AS divipola_code,
    aps.TIPO_AREA          AS zone_type,        -- 'URBANO', 'RURAL'
    aps.SERVICIO           AS service_code,     -- 'ACU', 'ALC', 'ASE'
    :period_id             AS reporting_period,
    SYSDATE                AS extraction_source_ts
FROM SUI_AAA.EMPRESAS_PRESTADORAS p
JOIN SUI_AAA.AREAS_PRESTACION_SERVICIO aps 
    ON p.ID_EMPRESA = aps.ID_EMPRESA
WHERE p.ID_EMPRESA BETWEEN :min_provider_id AND :max_provider_id
  AND (aps.PERIODO_VIGENCIA = :period_id OR aps.PERIODO_VIGENCIA IS NULL)
ORDER BY p.ID_EMPRESA, aps.ID_APS
