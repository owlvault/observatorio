-- =============================================================================
-- QUERY_ID: SUI_EXT_04_CALIDAD_AGUA
-- VERSION: 1.0.0
-- DOMINIO: CALIDAD_AGUA
-- FUENTE: SUI Oracle (SSPD)
-- DESCRIPCION: Extrae reportes de control de calidad de agua potable (IRCA reportado por prestador).
-- PARÁMETROS: :period_id (Formato 'YYYY-MM'), :min_provider_id, :max_provider_id
-- =============================================================================

SELECT 
    cal.ID_EMPRESA                  AS provider_id,
    cal.ID_APS                      AS service_area_id,
    cal.PERIODO                     AS reporting_period,
    cal.PUNTO_MUESTREO_ID           AS sampling_point_id,
    cal.FECHA_MUESTREO              AS sample_date,
    cal.IRCA_VALOR                  AS irca_value,
    cal.NIVEL_RIESGO                AS risk_level,        -- 'SIN RIESGO', 'BAJO', 'MEDIO', 'ALTO', 'INVIABLE'
    cal.MUESTRAS_PROGRAMADAS        AS scheduled_samples,
    cal.MUESTRAS_REALIZADAS         AS executed_samples,
    cal.ES_LABORATORIO_ACREDITADO   AS is_accredited_lab,
    SYSDATE                         AS extraction_source_ts
FROM SUI_AAA.CAR_CALIDAD_AGUA cal
WHERE cal.PERIODO = :period_id
  AND cal.ID_EMPRESA BETWEEN :min_provider_id AND :max_provider_id
ORDER BY cal.ID_EMPRESA, cal.ID_APS, cal.FECHA_MUESTREO
