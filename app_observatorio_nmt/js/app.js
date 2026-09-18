/**
 * app.js
 * Controlador Principal del MVP del Observatorio NMT CRA
 * Requisitos: RF-NMT-01 a RF-NMT-12, ADR-0003, ADR-0005, ADR-0009, ADR-0010, ADR-0012
 */

window.AppNMT = {
  activeTab: 'tablero',
  activeMode: 'analista', // 'ciudadano' | 'analista'
  filteredProviders: [],
  selectedProvider: null,

  init: function() {
    console.log("Iniciando Observatorio CRA NMT...");
    if (!window.CRA_NMT_DATA || !window.CRA_NMT_DATA.prestadores) {
      console.error("No se encontraron datos en window.CRA_NMT_DATA.");
      return;
    }

    this.filteredProviders = [...window.CRA_NMT_DATA.prestadores];

    this.setupNavigation();
    this.setupFilters();
    this.setupModeToggle();
    this.populateDeptoFilter();
    if (window.ImpactoOCDE) {
      window.ImpactoOCDE.init();
    }
    this.refreshAll();
  },

  setupNavigation: function() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });
  },

  switchTab: function(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.tab-content-pane').forEach(pane => {
      pane.style.display = 'none';
    });

    const activePane = document.getElementById(`pane-${tabId}`);
    if (activePane) {
      activePane.style.display = 'block';
    }

    if (tabId === 'mapa') {
      setTimeout(() => {
        window.MapColombia.renderMarkers(this.filteredProviders);
      }, 100);
    } else if (tabId === 'ciclo') {
      if (window.TimelineOCDE) {
        window.TimelineOCDE.render('timeline-ocde-view', this.selectedProvider);
      }
      if (window.ImpactoOCDE) {
        window.ImpactoOCDE.render(this.filteredProviders, this.selectedProvider);
      }
    } else if (tabId === 'prestadores') {
      this.renderProvidersTable();
    }
  },

  setupModeToggle: function() {
    const btnCiudadano = document.getElementById('btn-mode-ciudadano');
    const btnAnalista = document.getElementById('btn-mode-analista');

    if (btnCiudadano && btnAnalista) {
      btnCiudadano.addEventListener('click', () => {
        this.activeMode = 'ciudadano';
        btnCiudadano.classList.add('active');
        btnAnalista.classList.remove('active');
        this.applyUserMode();
      });

      btnAnalista.addEventListener('click', () => {
        this.activeMode = 'analista';
        btnAnalista.classList.add('active');
        btnCiudadano.classList.remove('active');
        this.applyUserMode();
      });
    }
  },

  applyUserMode: function() {
    const analystAlerts = document.querySelectorAll('.analyst-only');
    analystAlerts.forEach(el => {
      el.style.display = this.activeMode === 'analista' ? 'block' : 'none';
    });

    const citizenNotes = document.querySelectorAll('.citizen-only');
    citizenNotes.forEach(el => {
      el.style.display = this.activeMode === 'ciudadano' ? 'block' : 'none';
    });
  },

  setupFilters: function() {
    const segSelect = document.getElementById('filter-segmento');
    const deptoSelect = document.getElementById('filter-departamento');
    const qualitySelect = document.getElementById('filter-calidad');
    const searchInput = document.getElementById('filter-search');
    const resetBtn = document.getElementById('btn-reset-filters');

    const triggerFilter = () => {
      this.applyFilters();
    };

    if (segSelect) segSelect.addEventListener('change', triggerFilter);
    if (deptoSelect) deptoSelect.addEventListener('change', triggerFilter);
    if (qualitySelect) qualitySelect.addEventListener('change', triggerFilter);
    if (searchInput) searchInput.addEventListener('input', triggerFilter);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (segSelect) segSelect.value = '';
        if (deptoSelect) deptoSelect.value = '';
        if (qualitySelect) qualitySelect.value = '';
        if (searchInput) searchInput.value = '';
        this.selectedProvider = null;
        this.applyFilters();
      });
    }
  },

  populateDeptoFilter: function() {
    const deptoSelect = document.getElementById('filter-departamento');
    if (!deptoSelect) return;

    const deptos = [...new Set(window.CRA_NMT_DATA.prestadores.map(p => p.departamento_nombre))].sort();
    deptos.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      deptoSelect.appendChild(opt);
    });
  },

  applyFilters: function() {
    const seg = document.getElementById('filter-segmento')?.value || '';
    const depto = document.getElementById('filter-departamento')?.value || '';
    const cal = document.getElementById('filter-calidad')?.value || '';
    const q = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();

    let results = window.CRA_NMT_DATA.prestadores;

    if (seg) {
      results = results.filter(p => p.segmento_cra === seg);
    }
    if (depto) {
      results = results.filter(p => p.departamento_nombre === depto);
    }
    if (cal) {
      results = results.filter(p => p.calidad.quality_flag === cal);
    }
    if (q) {
      results = results.filter(p => 
        p.prestador_nombre.toLowerCase().includes(q) ||
        p.sigla.toLowerCase().includes(q) ||
        p.municipio_nombre.toLowerCase().includes(q) ||
        p.prestador_id_sui.toString().includes(q)
      );
    }

    this.filteredProviders = results;

    // Regla RN-NMT-02: Advertencia de No Comparabilidad Inter-Segmentos
    const nonCompBanner = document.getElementById('non-comparability-banner');
    if (nonCompBanner) {
      const distinctSegments = new Set(results.map(p => p.segmento_cra));
      if (!seg && distinctSegments.size > 1 && results.length < window.CRA_NMT_DATA.prestadores.length) {
        nonCompBanner.style.display = 'flex';
        nonCompBanner.innerHTML = `
          <span>⚠️ <strong>Nota Metodológica RN-NMT-02 / RF-ONTO-06:</strong> La selección contiene prestadores de diferentes segmentos tarifarios (${Array.from(distinctSegments).join(', ')}). No se deben establecer comparaciones directas de eficiencia o variación tarifaria entre segmentos de diferente escala sin la debida normalización regulatoria.</span>
        `;
      } else {
        nonCompBanner.style.display = 'none';
      }
    }

    this.refreshAll();
  },

  refreshAll: function() {
    // 1. Contador de prestadores
    const countEl = document.getElementById('filtered-count-badge');
    if (countEl) countEl.textContent = `${this.filteredProviders.length} prestadores`;

    // 2. Tarjetas KPI
    window.KpiCards.render('kpi-cards-container', this.filteredProviders);

    // 3. Gráficas
    window.ChartsNMT.renderAll(this.filteredProviders);

    // 4. Modelo e Impacto Regulatorio OCDE
    if (window.TimelineOCDE) {
      window.TimelineOCDE.render('timeline-ocde-view', this.selectedProvider);
    }
    if (window.ImpactoOCDE) {
      window.ImpactoOCDE.render(this.filteredProviders, this.selectedProvider);
    }

    // 5. Tabla de prestadores
    this.renderProvidersTable();

    // 6. Mapa (si está activo)
    if (this.activeTab === 'mapa') {
      window.MapColombia.renderMarkers(this.filteredProviders);
    }

    // 7. Aplicar modo usuario
    this.applyUserMode();
  },

  renderProvidersTable: function() {
    const tbody = document.getElementById('providers-table-body');
    if (!tbody) return;

    if (this.filteredProviders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--text-muted);">No se encontraron prestadores con los criterios aplicados.</td></tr>`;
      return;
    }

    let html = '';
    this.filteredProviders.forEach(p => {
      const n = p.nmt_tracking;
      const t = n.variacion_tarifaria_transicion;
      const qClass = p.calidad.quality_flag === 'VERIFIED' ? 'badge-verified' : 
                    (p.calidad.quality_flag === 'WARNING' ? 'badge-warning' : 'badge-quarantine');
      const qText = p.calidad.quality_flag === 'VERIFIED' ? 'VERIFICADO' : 
                   (p.calidad.quality_flag === 'WARNING' ? 'OBSERVADO' : 'EN REVISIÓN');
      const adoptoLabel = n.estudio_costos_reportado ? 
        '<span style="color: var(--color-emerald); font-weight: 600;">✓ Radicado</span>' : 
        '<span style="color: var(--color-danger); font-weight: 600;">Pendiente</span>';

      const isSelected = this.selectedProvider?.prestador_id_sui === p.prestador_id_sui;

      html += `
        <tr onclick="window.AppNMT.selectProvider(${p.prestador_id_sui})" style="cursor: pointer; ${isSelected ? 'background-color: var(--color-ice-blue);' : ''}">
          <td class="mono font-bold">${p.prestador_id_sui}</td>
          <td>
            <div style="font-weight: 600; color: var(--color-deep-navy);">${p.sigla}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${p.prestador_nombre}</div>
          </td>
          <td>${p.municipio_nombre} (${p.departamento_nombre})</td>
          <td><span style="font-weight: 600; color: var(--color-cra-blue);">${p.segmento_cra}</span></td>
          <td class="mono">${p.suscriptores_acueducto.toLocaleString('es-CO')}</td>
          <td>${adoptoLabel}</td>
          <td class="mono" style="font-weight: 700; color: ${t.estrato_3_pct > 0 ? 'var(--color-royal-blue)' : 'var(--color-emerald)'};">
            ${t.estrato_3_pct > 0 ? '+' : ''}${t.estrato_3_pct}% (E3)
          </td>
          <td>
            <span class="quality-badge ${qClass}">${qText}</span>
          </td>
          <td>
            <button class="btn-view-detail" onclick="event.stopPropagation(); window.ProviderDetail.open(${p.prestador_id_sui})">Ficha</button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  selectProvider: function(id) {
    if (this.selectedProvider?.prestador_id_sui === id) {
      this.selectedProvider = null; // Deseleccionar al hacer clic de nuevo
    } else {
      this.selectedProvider = window.CRA_NMT_DATA.prestadores.find(p => p.prestador_id_sui === id) || null;
    }
    this.refreshAll();
  }
};

// Auto-inicio al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  window.AppNMT.init();
});
