/**
 * map_colombia.js
 * Mapa georreferenciado de prestadores NMT con Leaflet
 * Requisitos: RF-PORTAL-05, ADR-0005, RF-NMT-10
 */

window.MapColombia = {
  mapInstance: null,
  markersLayer: null,

  init: function(containerId) {
    const el = document.getElementById(containerId);
    if (!el || this.mapInstance) return;

    // Coordenadas centrales de Colombia
    this.mapInstance = L.map(containerId, {
      center: [4.5709, -74.2973],
      zoom: 6,
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.mapInstance);

    this.markersLayer = L.layerGroup().addTo(this.mapInstance);
  },

  renderMarkers: function(providers) {
    if (!this.mapInstance) {
      this.init('map-container');
    }
    if (!this.mapInstance || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    const bounds = [];

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
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.82rem; min-width: 200px;">
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

    if (bounds.length > 0 && this.mapInstance) {
      this.mapInstance.fitBounds(bounds, { padding: [30, 30] });
    }
  }
};
