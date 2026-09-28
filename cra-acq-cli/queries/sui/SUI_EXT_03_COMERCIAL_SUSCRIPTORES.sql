-- =============================================================================
-- QUERY_ID: SUI_EXT_03_COMERCIAL_SUSCRIPTORES
-- VERSION: 1.0.0
-- DOMINIO: COMERCIAL_SUSCRIPTORES
-- FUENTE: SUI Oracle (SSPD)
-- DESCRIPCION: Extrae suscriptores facturados agrupados por clase de uso y estrato.
--              Incluye salvaguarda de no incluir datos personales de suscriptores (RN-SUI-04).
-- PARÁMETROS: :period_id (Formato 'YYYY-MM'), :min_provider_id, :max_provider_id
-- =============================================================================

SELECT 
    com.ID_EMPRESA                  AS provider_id,
    com.ID_APS                      AS service_area_id,
    com.PERIODO                     AS reporting_period,
    com.SERVICIO                    AS service_code,      -- 'ACU', 'ALC'
    com.ESTRATO_USO                 AS stratum_use_code,  -- 'ESTRATO_1'..'ESTRATO_6', 'COMERCIAL', 'INDUSTRIAL', 'OFICIAL'
    com.TOTAL_SUSCRIPTORES_FACT     AS billed_subscribers,
    com.TOTAL_VOL_FACTURADO_M3      AS billed_volume_m3,
    com.VALOR_TOTAL_FACTURADO_COP   AS billed_amount_cop,
    com.SUBSIDIOS_APLICADOS_COP     AS subsidies_cop,
    com.CONTRIBUCIONES_COP          AS contributions_cop,
    SYSDATE                         AS extraction_source_ts
FROM SUI_AAA.CAR_COMERCIAL_RESUMEN com
WHERE com.PERIODO = :period_id
  AND com.ID_EMPRESA BETWEEN :min_provider_id AND :max_provider_id
ORDER BY com.ID_EMPRESA, com.ID_APS, com.ESTRATO_USO
