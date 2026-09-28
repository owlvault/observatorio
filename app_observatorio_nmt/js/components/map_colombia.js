/**
 * map_colombia.js
 * Mapa georreferenciado integral de prestadores (Res. 1032 y Res. 1038) con Leaflet
 * Requisitos: RF-PORTAL-05, ADR-0005, RF-NMT-10, ADR-0012
 */

window.MapColombia = {
  mapInstance: null,
  markersLayer: null,

  // Coordenadas departamentales aproximadas para prestadores rurales/comunitarios
  deptoCoords: {
    '88': [12.5847, -81.7006], // San Andrés
    '15': [5.5353, -73.3678],  // Boyacá
    '68': [7.1193, -73.1227],  // Santander
    '54': [7.8939, -72.5078],  // Norte de Santander
    '52': [1.2136, -77.2811],  // Nariño
    '19': [2.4419, -76.6063],  // Cauca
    '41': [2.9273, -75.2819],  // Huila
    '73': [4.4389, -75.2322],  // Tolima
    '05': [6.2518, -75.5636],  // Antioquia
    '11': [4.6097, -74.0817],  // Bogotá
    '13': [10.3910, -75.4794], // Bolívar
    '17': [5.0689, -75.5174],  // Caldas
    '18': [1.6144, -75.6062],  // Caquetá
    '20': [10.4631, -73.2532], // Cesar
    '23': [8.7479, -75.8814],  // Córdoba
    '25': [4.7110, -74.0721],  // Cundinamarca
    '27': [5.6947, -76.6611],  // Chocó
    '44': [11.5444, -72.9072], // La Guajira
    '47': [11.2408, -74.1990], // Magdalena
    '50': [4.1420, -73.6266],  // Meta
    '63': [4.5339, -75.6811],  // Quindío
    '66': [4.8133, -75.6961],  // Risaralda
    '70': [9.3047, -75.3978],  // Sucre
    '76': [3.4516, -76.5320],  // Valle del Cauca
    '81': [7.0844, -70.7591],  // Arauca
    '85': [5.3378, -72.3959],  // Casanare
    '86': [0.4900, -76.8800],  // Putumayo
    '91': [-4.2153, -69.9406], // Amazonas
    '94': [3.8653, -67.9239],  // Guainía
    '95': [2.5658, -72.6417],  // Guaviare
    '97': [1.2500, -70.2333],  // Vaupés
    '99': [4.4239, -69.2878]   // Vichada
  },

  init: function(containerId) {
    const el = document.getElementById(containerId);
    if (!el || this.mapInstance) return;

    // Coordenadas centrales de Colombia
    this.mapInstance = L.map(containerId, {
      center: [4.5709, -74.2973],
      zoom: 6,
      zoomControl: true
    });

    // Mapa base gris claro de Esri (sin clave de API); los basemaps de CARTO pasaron a exigir clave
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Mapa base &copy; Esri, HERE, Garmin, &copy; colaboradores de OpenStreetMap',
      maxZoom: 16
    }).addTo(this.mapInstance);

    this.markersLayer = L.layerGroup().addTo(this.mapInstance);

    // Leyenda del mapa
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'map-legend');
      div.style.background = 'rgba(255, 255, 255, 0.95)';
      div.style.padding = '10px 14px';
      div.style.borderRadius = '8px';
      div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      div.style.fontSize = '0.74rem';
      div.style.fontFamily = 'Inter, system-ui, sans-serif';
      div.style.lineHeight = '1.6';
      div.innerHTML = `
        <strong style="color: #072b42; display: block; margin-bottom: 4px; font-size: 0.8rem;">Convenio Territorial CRA</strong>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #0b5e87;"></span>
          <span>Grandes (Res. 1032) · Radicado</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #dc2626;"></span>
          <span>Grandes (Res. 1032) · Pendiente</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #059669;"></span>
          <span>Pequeños / Rurales (Res. 1038)</span>
        </div>
      `;
      return div;
    };
    legend.addTo(this.mapInstance);
  },

  renderMarkers: function(providers) {
    if (!this.mapInstance) {
      this.init('map-container');
    }
    if (!this.mapInstance || !this.markersLayer) return;

    this.markersLayer.clearLayers();
    const bounds = [];

    // 1. Prestadores Grandes (Res. CRA 1032)
    if (providers && providers.length > 0) {
      providers.forEach(p => {
        if (!p.lat || !p.lng) return;

        const adopto = p.nmt_tracking.estudio_costos_reportado;
        const markerColor = adopto ? '#0b5e87' : '#dc2626';

        const circle = L.circleMarker([p.lat, p.lng], {
          radius: p.segmento_cra === 'Segmento 1' ? 9 : (p.segmento_cra === 'Segmento 2' ? 7 : 5),
          fillColor: markerColor,
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.85
        });

        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.82rem; min-width: 210px;">
            <div style="margin-bottom: 4px;"><span class="regime-badge regime-1032">Res. CRA 1032</span></div>
            <strong style="color: #072b42; font-size: 0.9rem;">${p.prestador_nombre}</strong>
            <div style="color: #64748b; margin: 4px 0;">${p.municipio_nombre} (${p.departamento_nombre})</div>
            <div style="margin-bottom: 6px;">
              <span style="font-weight: 700; color: #0b5e87;">${p.segmento_cra}</span> | 
              <span class="mono">${p.suscriptores_acueducto.toLocaleString('es-CO')} susc.</span>
            </div>
            <div>
              <strong>Estado NMT:</strong> 
              <span style="color: ${adopto ? '#059669' : '#dc2626'}; font-weight: 700;">
                ${adopto ? 'Estudio Reportado' : 'Pendiente'}
              </span>
            </div>
            <button onclick="window.ProviderDetail.open(${p.prestador_id_sui})" 
                    style="margin-top: 8px; width: 100%; background: #0b5e87; color: #fff; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.76rem;">
              Ver Ficha Técnica Completa
            </button>
          </div>
        `;

        circle.bindPopup(popupContent);
        this.markersLayer.addLayer(circle);
        bounds.push([p.lat, p.lng]);
      });
    }

    // 2. Pequeños Prestadores y Rurales (Res. CRA 1038)
    if (window.CRA_NMTPP_DATA && window.CRA_NMTPP_DATA.prestadores) {
      window.CRA_NMTPP_DATA.prestadores.forEach((p, idx) => {
        const cod = p.departamento ? p.departamento.codigo : '11';
        const baseCoord = this.deptoCoords[cod] || [4.5709, -74.2973];

        // Deterministic offset to separate providers in same department
        const angle = (idx * 0.785) % (2 * Math.PI);
        const distance = 0.08 + (idx % 4) * 0.05;
        const lat = baseCoord[0] + Math.sin(angle) * distance;
        const lng = baseCoord[1] + Math.cos(angle) * distance;

        const circle = L.circleMarker([lat, lng], {
          radius: 6,
          fillColor: '#059669',
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.85
        });

        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.82rem; min-width: 210px;">
            <div style="margin-bottom: 4px;"><span class="regime-badge regime-1038">Res. CRA 1038</span></div>
            <strong style="color: #072b42; font-size: 0.9rem;">${p.nombre}</strong>
            <div style="color: #64748b; margin: 4px 0;">${p.departamento ? p.departamento.nombre : 'Colombia'} · ${p.es_gestor_comunitario ? 'Gestor Comunitario' : 'Empresa S1'}</div>
            <div style="margin-bottom: 6px;">
              <span style="font-weight: 700; color: #059669;">Subsegmento ${p.subsegmento_vigente}</span> | 
              <span class="mono">${p.suscriptores_ac_2024.toLocaleString('es-CO')} familias</span>
            </div>
            <div>
              <strong>Adopción:</strong> 
              <span style="color: #059669; font-weight: 700;">Estudio Radicado</span>
            </div>
            <button onclick="window.Prestadores && window.Prestadores.abrirModalPerfil('${p.provider_id}')" 
                    style="margin-top: 8px; width: 100%; background: #059669; color: #fff; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.76rem;">
              Ver Ficha Técnica Integral
            </button>
          </div>
        `;

        circle.bindPopup(popupContent);
        this.markersLayer.addLayer(circle);
        bounds.push([lat, lng]);
      });
    }

    if (bounds.length > 0 && this.mapInstance) {
      // El contenedor se crea oculto: se remide antes de encuadrar
      this.mapInstance.invalidateSize();
      this.mapInstance.fitBounds(bounds, { padding: [30, 30] });
    }
  }
};

