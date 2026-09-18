/**
 * data_export.js
 * Descarga de Datos Abiertos en CSV y JSON
 * Requisitos: ADR-0003, RF-PORTAL-03
 */

window.DataExport = {
  exportCSV: function(providers) {
    if (!providers || providers.length === 0) {
      alert('No hay datos disponibles para exportar con los filtros seleccionados.');
      return;
    }

    const headers = [
      'prestador_id_sui',
      'prestador_nombre',
      'sigla',
      'departamento',
      'divipola_depto',
      'municipio',
      'divipola_muni',
      'segmento_cra',
      'suscriptores',
      'etapa_ciclo_ocde',
      'estudio_costos_reportado',
      'fecha_reporte_estudio',
      'dias_adopcion',
      'linea_base_2026',
      'var_estrato_1_pct',
      'var_estrato_2_pct',
      'var_estrato_3_pct',
      'var_estrato_4_pct',
      'var_estrato_5_pct',
      'var_estrato_6_pct',
      'cu_anterior_688_cop_m3',
      'cu_nuevo_1032_cop_m3',
      'continuidad_hdia',
      'continuidad_estado',
      'ipuf_m3_susc_mes',
      'ipuf_brecha_vs_meta',
      'irca_calidad_pct',
      'nivel_riesgo_ius',
      'descuento_servicio_pct',
      'incentivo_eficiencia_pct',
      'quality_flag',
      'cobertura_reporte_pct',
      'estado_objecion',
      'fecha_corte'
    ];

    const rows = providers.map(p => {
      const n = p.nmt_tracking;
      const t = n.variacion_tarifaria_transicion;
      const e = n.estandares_servicio;
      const d = n.descuentos_incentivos;
      const r = n.riesgo_ius;
      const q = p.calidad;

      return [
        p.prestador_id_sui,
        `"${p.prestador_nombre.replace(/"/g, '""')}"`,
        `"${p.sigla}"`,
        `"${p.departamento_nombre}"`,
        p.departamento_divipola,
        `"${p.municipio_nombre}"`,
        p.municipio_divipola,
        `"${p.segmento_cra}"`,
        p.suscriptores_acueducto,
        n.etapa_actual,
        n.estudio_costos_reportado ? 'SI' : 'NO',
        n.fecha_reporte_estudio || '',
        n.dias_oportunidad_adopcion || '',
        n.linea_base_2026,
        t.estrato_1_pct,
        t.estrato_2_pct,
        t.estrato_3_pct,
        t.estrato_4_pct,
        t.estrato_5_pct,
        t.estrato_6_pct,
        t.cu_anterior_688_cop_m3,
        t.cu_nuevo_1032_cop_m3,
        e.continuidad_idh2_hdia,
        e.continuidad_estado,
        e.ipuf_ird1_m3_susc_mes,
        e.ipuf_brecha_m3_susc_mes,
        e.irca_idh5_pct,
        r.nivel_ius,
        d.descuento_calidad_pct,
        d.incentivo_eficiencia_pct,
        q.quality_flag,
        q.cobertura_reporte_pct,
        q.estado_objecion,
        '2026-08-31'
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `observatorio_cra_nmt_1032_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportJSON: function(providers) {
    if (!providers || providers.length === 0) {
      alert('No hay datos disponibles para exportar con los filtros seleccionados.');
      return;
    }

    const payload = {
      metadata: {
        plataforma: "Observatorio Regulatorio de Agua Potable y Saneamiento Básico – CRA",
        norma: "Resolución CRA 1032 de 2026",
        fecha_corte: "2026-08-31",
        fecha_exportacion: new Date().toISOString(),
        total_registros: providers.length,
        fuente: "SUI / SURICATA - Superintendencia de Servicios Públicos Domiciliarios"
      },
      prestadores: providers
    };

    const jsonContent = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `observatorio_cra_nmt_1032_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
