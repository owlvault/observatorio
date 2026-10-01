/**
 * app.js
 * Controlador Principal del MVP del Observatorio NMT CRA
 * Requisitos: RF-NMT-01 a RF-NMT-12, ADR-0003, ADR-0005, ADR-0009, ADR-0010, ADR-0012
 */

window.AppNMT = {
  activeTab: 'inicio',
  validTabs: ['inicio', 'tablero', 'nmtpp', 'ciclo', 'prestadores', 'mapa', 'metodologia', 'datos'],

  // Encabezado editorial de cada sección (la portada usa su propio hero)
  pageMeta: {
    tablero: {
      crumb: 'Grandes prestadores',
      eyebrow: 'Resolución CRA 1032 de 2026 · Ámbito Urbano',
      title: 'Grandes prestadores de acueducto:',
      accent: 'eficiencia y tarifas justas',
      lead: 'Monitoreo a costos eficientes, estándares de calidad IDH y variación tarifaria en prestadores de más de 5.000 suscriptores.',
      img: 'assets/img/perdidas.jpg'
    },
    nmtpp: {
      crumb: 'Pequeños prestadores y rurales',
      eyebrow: 'Resolución CRA 1038 de 2026 · Equidad Territorial',
      title: 'Agua potable comunitaria y rural:',
      accent: 'metas que respetan la escala',
      lead: 'Metas adaptativas de continuidad, calidad y micromedición que avanzan al ritmo de pequeñas poblaciones y zonas vulnerables.',
      img: 'assets/img/continuidad.jpg'
    },
    ciclo: {
      crumb: 'Impacto regulatorio',
      eyebrow: 'Enfoque OCDE de política regulatoria',
      title: 'Impacto social, asequibilidad',
      accent: 'y gobernanza del agua',
      lead: 'Cinco dimensiones de impacto, simulador de esfuerzo en la factura del hogar (umbral 3 % OCDE) y evaluación del ciclo E0 a E9.',
      img: 'assets/img/hogar.jpg'
    },
    prestadores: {
      crumb: 'Directorio',
      eyebrow: 'Transparencia individual (ADR-0005)',
      title: 'Directorio universal auditable:',
      accent: 'conozca a su prestador',
      lead: 'Radiografía técnica de cada operador: estado de adopción, estructura tarifaria por estrato y compuerta de calidad.',
      img: ''
    },
    mapa: {
      crumb: 'Mapa territorial',
      eyebrow: 'Georreferenciación del servicio',
      title: 'Presencia territorial y avance',
      accent: 'en cada departamento',
      lead: 'Visualice la distribución geográfica de los operadores y su nivel de radicación de estudios de costos en el país.',
      img: 'assets/img/hero-ptar.jpg'
    },
    metodologia: {
      crumb: 'Metodología',
      eyebrow: 'Rigor y compuerta analítica (ADR-0003)',
      title: 'Compuerta de calidad:',
      accent: 'ninguna cifra sin evidencia',
      lead: 'Todo indicador cuenta con ficha técnica pública, fórmula canónica, sustento normativo explícito y semáforo de verificación.',
      img: 'assets/img/calidad.jpg'
    },
    datos: {
      crumb: 'Datos abiertos',
      eyebrow: 'Ley 1712 de 2014 y Gobierno Digital',
      title: 'Datos abiertos certificados',
      accent: 'e interoperabilidad API',
      lead: 'Microdatos descargables en CSV/JSON con trazabilidad de linaje (SUI Oracle / SURICATA) para auditoría y control social.',
      img: ''
    }
  },

  // Pestañas que usan el contexto compartido de la Res. 1032 (fuentes, vacíos y filtros)
  contextTabs: ['tablero', 'ciclo', 'prestadores', 'mapa', 'datos'],
  activeMode: 'analista', // 'ciudadano' | 'analista'
  ambitoPrestadores: 'todos', // 'todos' | '1032' | '1038'
  filteredProviders: [],
  selectedProvider: null,

  init: function() {
    console.log("Iniciando Observatorio CRA NMT (Sistema Integral)...");
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
    if (window.Portada) {
      window.Portada.render();
    }
    if (window.Paginas) {
      window.Paginas.render();
    }

    // Ruta inicial desde el hash (#tablero, #nmtpp, ...)
    const initial = (location.hash || '').replace('#', '');
    this.goTo(this.validTabs.includes(initial) ? initial : 'inicio', null, { scroll: false, push: false });
    window.addEventListener('hashchange', () => {
      const h = (location.hash || '').replace('#', '');
      if (this.validTabs.includes(h) && h !== this.activeTab) this.goTo(h, null, { push: false });
    });
  },

  setupNavigation: function() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.goTo(btn.getAttribute('data-tab'));
      });
    });
  },

  // Navegación pública: pestaña + subvista opcional (subpanel OCDE o pestaña NMTPP)
  goTo: function(tabId, sub, opts) {
    const o = Object.assign({ scroll: true, push: true }, opts || {});
    if (!this.validTabs.includes(tabId)) tabId = 'inicio';

    document.querySelectorAll('.tab-btn').forEach(t => {
      const on = t.getAttribute('data-tab') === tabId;
      t.classList.toggle('active', on);
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });

    this.switchTab(tabId);

    if (sub) {
      if (tabId === 'ciclo') {
        const b = document.querySelector(`.ocde-subnav-btn[data-ocde-target="${sub}"]`);
        if (b) b.click();
      } else if (tabId === 'nmtpp' && window.AppNMTPP) {
        window.AppNMTPP.mostrarTab(sub);
      }
    }

    // Las entradas de una pestaña que cargó oculta se evalúan al mostrarla
    if (window.CineKit) window.CineKit.initReveal();

    if (o.push && location.hash !== '#' + tabId) {
      history.pushState(null, '', '#' + tabId);
    }
    if (o.scroll) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      const main = document.getElementById('contenido');
      if (main) main.focus({ preventScroll: true });
    }
  },

  renderPageHead: function(tabId) {
    const head = document.getElementById('page-head');
    if (!head) return;
    const meta = this.pageMeta[tabId];
    if (!meta) {
      head.hidden = true;
      return;
    }
    head.hidden = false;
    document.getElementById('page-head-crumb').textContent = meta.crumb;
    document.getElementById('page-head-eyebrow').textContent = meta.eyebrow;
    // Titular: la segunda parte va en degradado como acento
    const title = document.getElementById('page-head-title');
    title.textContent = meta.title + (meta.accent ? ' ' : '');
    if (meta.accent) {
      const acc = document.createElement('span');
      acc.className = 'cx-grad-light';
      acc.textContent = meta.accent;
      title.appendChild(acc);
    }
    document.getElementById('page-head-lead').textContent = meta.lead;
    document.getElementById('page-head-media').style.backgroundImage = meta.img ? `url('${meta.img}')` : '';
    head.classList.toggle('no-media', !meta.img);

    const pillars = document.getElementById('page-head-pillars');
    if (pillars && window.Encabezados) {
      pillars.innerHTML = window.Encabezados.pilares(tabId)
        .map(p => `<li><span class="v cx-grad-light">${p.v}</span><span class="l">${p.l}</span></li>`).join('');
    }
    // Sin foto, la escena de agua ocupa el fondo (se inicia una sola vez)
    const canvas = document.getElementById('page-head-canvas');
    if (canvas && !meta.img && !canvas._cxInit && window.CineKit) {
      canvas._cxInit = true;
      window.CineKit.escenaAgua(canvas);
    }
  },

  switchTab: function(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.tab-content-pane').forEach(pane => {
      pane.style.display = 'none';
    });

    const activePane = document.getElementById(`pane-${tabId}`);
    if (activePane) {
      activePane.style.display = 'block';
      // Las piezas animadas de una pestaña que cargó oculta se encienden al mostrarla
      if (window.CineKit) window.CineKit.animateIn(activePane);
    }

    this.renderPageHead(tabId);
    const ctx = document.getElementById('global-context');
    if (ctx) ctx.hidden = !this.contextTabs.includes(tabId);
    document.body.setAttribute('data-tab', tabId);

    if (tabId === 'tablero') {
      // Las gráficas se crean ocultas en la carga inicial; se redibujan al mostrarse
      window.ChartsNMT.renderAll(this.filteredProviders);
    } else if (tabId === 'mapa') {
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
    } else if (tabId === 'nmtpp') {
      if (window.AppNMTPP) {
        window.AppNMTPP.renderVistaActiva();
      }
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

    if (window.AppNMTPP && typeof window.AppNMTPP.setModo === 'function') {
      window.AppNMTPP.setModo(this.activeMode);
    }
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

    const deptos1032 = window.CRA_NMT_DATA?.prestadores?.map(p => p.departamento_nombre) || [];
    const deptos1038 = window.CRA_NMTPP_DATA?.prestadores?.map(p => p.departamento?.nombre).filter(Boolean) || [];
    const deptos = [...new Set([...deptos1032, ...deptos1038])].sort();

    deptos.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      deptoSelect.appendChild(opt);
    });
  },

  setAmbitoPrestadores: function(ambito) {
    this.ambitoPrestadores = ambito;
    const btnTodos = document.getElementById('btn-ambito-todos');
    const btn1032 = document.getElementById('btn-ambito-1032');
    const btn1038 = document.getElementById('btn-ambito-1038');

    [[btnTodos, 'todos'], [btn1032, '1032'], [btn1038, '1038']].forEach(([btn, val]) => {
      if (!btn) return;
      btn.classList.toggle('active', ambito === val);
      btn.setAttribute('aria-pressed', String(ambito === val));
    });

    this.renderProvidersTable();
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
    if (countEl) {
      const n1032 = window.CRA_NMT_DATA?.prestadores?.length || 0;
      const n1038 = window.CRA_NMTPP_DATA?.prestadores?.length || 0;
      countEl.textContent = `${n1032} grandes · ${n1038} pequeños`;
    }

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

    const depto = document.getElementById('filter-departamento')?.value || '';
    const q = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();

    let rowsHtml = '';
    let displayedCount = 0;

    const grupo = (titulo, nota) => `<tr class="cx-group-row"><th colspan="9" scope="rowgroup"><span>${titulo}</span><em>${nota}</em></th></tr>`;

    // 1. Grandes Prestadores (Res. CRA 1032)
    if (this.ambitoPrestadores === 'todos' || this.ambitoPrestadores === '1032') {
      rowsHtml += grupo('Grandes prestadores · Res. CRA 1032 de 2026', `${this.filteredProviders.length} prestadores · datos simulados`);
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

        rowsHtml += `
          <tr onclick="window.AppNMT.selectProvider(${p.prestador_id_sui})" style="cursor: pointer; ${isSelected ? 'background-color: var(--color-ice-blue);' : ''}">
            <td>
              <span class="mono font-bold">${p.prestador_id_sui}</span>
              <div><span class="regime-badge regime-1032" style="font-size: 0.65rem; padding: 1px 6px;">Res. 1032</span></div>
            </td>
            <td>
              <div style="font-weight: 700; color: var(--color-deep-navy);">${p.sigla}</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">${p.prestador_nombre}</div>
            </td>
            <td>${p.municipio_nombre} (${p.departamento_nombre})</td>
            <td><span style="font-weight: 600; color: var(--color-cra-blue);">${p.segmento_cra}</span></td>
            <td class="mono">${p.suscriptores_acueducto.toLocaleString('es-CO')}</td>
            <td>${adoptoLabel}</td>
            <td class="mono" style="font-weight: 700; color: ${t.estrato_3_pct > 0 ? 'var(--color-royal-blue)' : 'var(--color-emerald)'};">
              ${t.estrato_3_pct > 0 ? '+' : ''}${t.estrato_3_pct}% (E3)
              <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: normal;">E1-E6 Desagregado</div>
            </td>
            <td>
              <span class="quality-badge ${qClass}">${qText}</span>
            </td>
            <td>
              <button class="btn-view-detail" onclick="event.stopPropagation(); window.ProviderDetail.open(${p.prestador_id_sui})">Ficha 1032</button>
            </td>
          </tr>
        `;
        displayedCount++;
      });
    }

    // 2. Pequeños Prestadores y Rurales (Res. CRA 1038)
    if ((this.ambitoPrestadores === 'todos' || this.ambitoPrestadores === '1038') && window.CRA_NMTPP_DATA?.prestadores) {
      let smallProviders = window.CRA_NMTPP_DATA.prestadores;

      if (depto) {
        smallProviders = smallProviders.filter(p => p.departamento?.nombre === depto);
      }
      if (q) {
        smallProviders = smallProviders.filter(p => 
          p.nombre.toLowerCase().includes(q) ||
          p.provider_id.toLowerCase().includes(q) ||
          (p.departamento?.nombre || '').toLowerCase().includes(q)
        );
      }

      rowsHtml += grupo('Pequeños prestadores y gestores comunitarios · Res. CRA 1038 de 2026', `${smallProviders.length} prestadores · datos sintéticos · no comparables con la Res. 1032`);
      smallProviders.forEach(p => {
        const estInicial = p.estudios?.find(e => e.tipo === 'inicial');
        const estRadicado = estInicial ? '<span style="color: var(--color-emerald); font-weight: 600;">✓ ' + estInicial.radicado_cra + '</span>' : '<span style="color: var(--color-danger); font-weight: 600;">Pendiente</span>';
        const iseVal = p.ise && p.ise[0] && p.ise[0].ise_calculado ? p.ise[0].ise_calculado.toFixed(1) + '%' : 'Exención (Insular)';

        rowsHtml += `
          <tr onclick="window.AppNMT.selectProvider('${p.provider_id}')" style="cursor: pointer;">
            <td>
              <span class="mono font-bold">${p.provider_id}</span>
              <div><span class="regime-badge regime-1038" style="font-size: 0.65rem; padding: 1px 6px;">Res. 1038</span></div>
            </td>
            <td>
              <div style="font-weight: 700; color: #065f46;">${p.nombre}</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">${p.es_gestor_comunitario ? 'Gestor Comunitario' : 'Empresa Prestadora S1'}</div>
            </td>
            <td>${p.aps && p.aps[0] ? p.aps[0].municipio : 'Varios'} (${p.departamento ? p.departamento.nombre : '—'})</td>
            <td><span style="font-weight: 600; color: #059669;">Subsegmento ${p.subsegmento_vigente}</span></td>
            <td class="mono">${p.suscriptores_ac_2024.toLocaleString('es-CO')} fam.</td>
            <td>${estRadicado}</td>
            <td class="mono">
              <span style="font-weight: 700; color: #059669;">ISE: ${iseVal}</span>
              <div style="font-size: 0.68rem; color: var(--text-muted);">E1-E6 Diferencial</div>
            </td>
            <td>
              <span class="quality-badge badge-verified">VERIFICADO</span>
            </td>
            <td>
              <button class="btn-view-detail" style="border-color: #059669; color: #065f46; background: #ecfdf5;" onclick="event.stopPropagation(); window.Prestadores && window.Prestadores.abrirModalPerfil('${p.provider_id}')">Ficha 1038</button>
            </td>
          </tr>
        `;
        displayedCount++;
      });
    }

    if (displayedCount === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 24px; color: var(--text-muted);">No se encontraron prestadores con los criterios aplicados.</td></tr>`;
      return;
    }

    tbody.innerHTML = rowsHtml;
  },

  selectProvider: function(id) {
    if (typeof id === 'string' && id.startsWith('SINT-')) {
      if (window.Prestadores && typeof window.Prestadores.abrirModalPerfil === 'function') {
        window.Prestadores.abrirModalPerfil(id);
      }
      return;
    }

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
