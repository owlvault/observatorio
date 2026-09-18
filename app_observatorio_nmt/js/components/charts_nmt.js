/**
 * charts_nmt.js
 * Visualizaciones Analíticas Avanzadas con Chart.js
 * Requisitos: RF-NMT-02, RF-NMT-04, RF-NMT-07, RF-NMT-09, RN-PORTAL-04/06
 */

window.ChartsNMT = {
  instances: {},

  renderAll: function(filteredProviders) {
    this.renderAdoptionBySegment(filteredProviders);
    this.renderTariffVariationByStratum(filteredProviders);
    this.renderLossesGapAndUncertainty(filteredProviders);
    this.renderIusRiskDistribution(filteredProviders);
  },

  destroy: function(chartKey) {
    if (this.instances[chartKey]) {
      this.instances[chartKey].destroy();
      delete this.instances[chartKey];
    }
  },

  // 1. Tasa de Adopción por Segmento (NMT-ADO-01)
  renderAdoptionBySegment: function(providers) {
    this.destroy('adoption');
    const ctx = document.getElementById('chart-adoption-segment');
    if (!ctx) return;

    const segments = ['Segmento 1', 'Segmento 2', 'Segmento 3', 'Segmento 4'];
    const adoptionData = [];
    const pendingData = [];

    segments.forEach(seg => {
      const segProviders = providers.filter(p => p.segmento_cra === seg);
      const totalSeg = segProviders.length;
      if (totalSeg === 0) {
        adoptionData.push(0);
        pendingData.push(0);
      } else {
        const adopted = segProviders.filter(p => p.nmt_tracking.estudio_costos_reportado).length;
        const pctAdopted = Math.round((adopted / totalSeg) * 100);
        adoptionData.push(pctAdopted);
        pendingData.push(100 - pctAdopted);
      }
    });

    this.instances['adoption'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['S1 (>100k)', 'S2 (30k-100k)', 'S3 (15k-30k)', 'S4 (5k-15k)'],
        datasets: [
          {
            label: '% Con Estudio de Costos (Adoptado)',
            data: adoptionData,
            backgroundColor: '#0b5e87',
            borderRadius: 6
          },
          {
            label: '% En Trámite / Pendiente',
            data: pendingData,
            backgroundColor: '#e2e8f0',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, max: 100, ticks: { callback: v => v + '%' } }
        },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw}%`
            }
          }
        }
      }
    });
  },

  // 2. Variación Tarifaria de Transición por Estrato (NMT-TAR-01) - RN-PORTAL-04
  renderTariffVariationByStratum: function(providers) {
    this.destroy('tariff');
    const ctx = document.getElementById('chart-tariff-variation');
    if (!ctx) return;

    if (providers.length === 0) return;

    const strata = ['Estrato 1', 'Estrato 2', 'Estrato 3', 'Estrato 4', 'Estrato 5', 'Estrato 6', 'Comercial', 'Industrial'];
    const keys = ['estrato_1_pct', 'estrato_2_pct', 'estrato_3_pct', 'estrato_4_pct', 'estrato_5_pct', 'estrato_6_pct', 'comercial_pct', 'industrial_pct'];

    const avgDeltas = keys.map(k => {
      const sum = providers.reduce((acc, p) => acc + (p.nmt_tracking.variacion_tarifaria_transicion[k] || 0), 0);
      return parseFloat((sum / providers.length).toFixed(1));
    });

    const colors = avgDeltas.map(val => val >= 0 ? '#0284c7' : '#059669');

    this.instances['tariff'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: strata,
        datasets: [{
          label: 'Variación % vs Res. 688/2014',
          data: avgDeltas,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { callback: v => (v > 0 ? '+' : '') + v + '%' },
            grid: { color: '#e2e8f0' }
          },
          y: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `Variación promedio: ${ctx.raw > 0 ? '+' : ''}${ctx.raw}% en ${ctx.label}`
            }
          }
        }
      }
    });
  },

  // 3. Brecha de Pérdidas IPUF vs Estándar 6 m3 (NMT-EST-02) con Banda de Incertidumbre
  renderLossesGapAndUncertainty: function(providers) {
    this.destroy('losses');
    const ctx = document.getElementById('chart-losses-gap');
    if (!ctx) return;

    const segments = ['Segmento 1', 'Segmento 2', 'Segmento 3', 'Segmento 4'];
    const labels = ['S1 (>100k)', 'S2 (30k-100k)', 'S3 (15k-30k)', 'S4 (5k-15k)'];

    const avgIpuf = [];
    const p10List = [];
    const p90List = [];

    segments.forEach(seg => {
      const segProv = providers.filter(p => p.segmento_cra === seg);
      if (segProv.length === 0) {
        avgIpuf.push(0);
        p10List.push(0);
        p90List.push(0);
      } else {
        const ipufs = segProv.map(p => p.nmt_tracking.estandares_servicio.ipuf_ird1_m3_susc_mes);
        const p10s = segProv.map(p => p.nmt_tracking.estandares_servicio.ipuf_banda_p10);
        const p90s = segProv.map(p => p.nmt_tracking.estandares_servicio.ipuf_banda_p90);

        avgIpuf.push(parseFloat((ipufs.reduce((a, b) => a + b, 0) / ipufs.length).toFixed(2)));
        p10List.push(parseFloat((p10s.reduce((a, b) => a + b, 0) / p10s.length).toFixed(2)));
        p90List.push(parseFloat((p90s.reduce((a, b) => a + b, 0) / p90s.length).toFixed(2)));
      }
    });

    this.instances['losses'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'IPUF Observado Promedio',
            data: avgIpuf,
            backgroundColor: '#0b5e87',
            borderRadius: 6
          },
          {
            label: 'Meta Regulatoria Estándar (6 m³)',
            data: [6.0, 6.0, 6.0, 6.0],
            type: 'line',
            borderColor: '#dc2626',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 4,
            pointBackgroundColor: '#dc2626',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: { display: true, text: 'm³/suscriptor/mes' },
            min: 0,
            max: 16
          }
        },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              afterLabel: ctx => {
                if (ctx.datasetIndex === 0) {
                  const idx = ctx.dataIndex;
                  return `Banda de Incertidumbre p10-p90: [${p10List[idx]} - ${p90List[idx]}] m³`;
                }
              }
            }
          }
        }
      }
    });
  },

  // 4. Distribución de Riesgo IUS (NMT-RIE-01) - RN-PORTAL-06
  renderIusRiskDistribution: function(providers) {
    this.destroy('ius');
    const ctx = document.getElementById('chart-ius-risk');
    if (!ctx) return;

    const counts = [0, 0, 0, 0, 0];
    providers.forEach(p => {
      const lvl = p.nmt_tracking.riesgo_ius.nivel_ius;
      if (lvl >= 1 && lvl <= 5) {
        counts[lvl - 1]++;
      }
    });

    this.instances['ius'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Nivel 1 (Bajo)', 'Nivel 2 (Medio-Bajo)', 'Nivel 3 (Medio)', 'Nivel 4 (Alto)', 'Nivel 5 (Crítico)'],
        datasets: [{
          data: counts,
          backgroundColor: [
            '#059669', // Verde
            '#0ea5e9', // Azul cielo
            '#f59e0b', // Amarillo
            '#ea580c', // Naranja
            '#dc2626'  // Rojo
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} prestadores (${Math.round((ctx.raw / providers.length) * 100)}%)`
            }
          }
        }
      }
    });
  }
};
