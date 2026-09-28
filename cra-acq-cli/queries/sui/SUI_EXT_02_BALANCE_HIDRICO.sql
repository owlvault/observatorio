-- =============================================================================
-- QUERY_ID: SUI_EXT_02_BALANCE_HIDRICO
-- VERSION: 1.0.0
-- DOMINIO: BALANCE_HIDRICO
-- FUENTE: SUI Oracle (SSPD)
-- DESCRIPCION: Extrae volúmenes producidos, suministrados y facturados para cálculo de IANC.
-- PARÁMETROS: :period_id (Formato 'YYYY-MM'), :min_provider_id, :max_provider_id
-- =============================================================================

SELECT 
    bh.ID_EMPRESA                   AS provider_id,
    bh.ID_APS                       AS service_area_id,
    bh.PERIODO                      AS reporting_period,
    NVL(bh.VOL_AGUA_PRODUCIDA_M3, 0) AS water_produced_m3,
    NVL(bh.VOL_AGUA_SUMINISTRADA_M3, 0) AS water_supplied_m3,
    NVL(bh.VOL_AGUA_FACTURADA_M3, 0) AS water_billed_m3,
    NVL(bh.CONSUMO_AUTORIZADO_M3, 0) AS authorized_consumption_m3,
    NVL(bh.PERDIDAS_APARENTES_M3, 0) AS apparent_losses_m3,
    NVL(bh.PERDIDAS_REALES_M3, 0)    AS real_losses_m3,
    bh.TIENE_MACROMEDICION           AS has_macrometering,
    bh.PORC_MICROMEDICION            AS micrometering_pct,
    bh.FECHA_REPORTE_SUI             AS filing_date_sui,
    bh.ESTADO_CERTIFICACION          AS cert_status,
    SYSDATE                          AS extraction_source_ts
FROM SUI_AAA.CAR_BALANCE_HIDRICO bh
WHERE bh.PERIODO = :period_id
  AND bh.ID_EMPRESA BETWEEN :min_provider_id AND :max_provider_id
ORDER BY bh.ID_EMPRESA, bh.ID_APS
