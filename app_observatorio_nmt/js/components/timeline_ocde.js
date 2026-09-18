/**
 * timeline_ocde.js
 * Componente de Línea de Tiempo del Ciclo Regulatorio OCDE (E0 a E9)
 * Requisitos: RF-NMT-01, RF-NMT-11, Enfoque OCDE AIR Ex-Post
 */

window.TimelineOCDE = {
  render: function(containerId, activeProvider = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const metadata = window.CRA_NMT_DATA?.metadata;
    if (!metadata || !metadata.ciclo_regulatorio_ocde) {
      container.innerHTML = '<p class="text-muted">No se cargaron los hitos del ciclo regulatorio.</p>';
      return;
    }

    const ciclo = metadata.ciclo_regulatorio_ocde;
    let html = '';

    // Si hay un prestador seleccionado, se evalúa su hito individual
    const providerStage = activeProvider?.nmt_tracking?.etapa_actual || null;

    ciclo.forEach(step => {
      let statusClass = step.estado; // cumplida, en_curso, pendiente
      let statusLabel = step.estado === 'cumplida' ? 'Cumplida' : (step.estado === 'en_curso' ? 'En Curso' : 'Prevista');

      // Si el prestador está seleccionado, se evalúa si alcanzó esta etapa
      if (activeProvider) {
        const stepNum = parseInt(step.codigo.replace('E', ''));
        const provNum = parseInt(providerStage.replace('E', ''));
        if (stepNum < provNum) {
          statusClass = 'cumplida';
          statusLabel = 'Cumplida (Prestador)';
        } else if (stepNum === provNum) {
          statusClass = 'en_curso';
          statusLabel = 'Etapa Actual del Prestador';
        } else {
          statusClass = 'pendiente';
          statusLabel = 'Pendiente';
        }
      }

      const dateText = step.fecha || step.fecha_limite || step.fecha_prevista || 'Por definir';

      html += `
        <div class="timeline-step-card ${statusClass}">
          <div class="timeline-step-header">
            <span class="step-code-badge ${statusClass}">${step.codigo}</span>
            <span class="step-fase-tag">${step.fase}</span>
          </div>
          <div class="step-name">${step.nombre}</div>
          <div class="step-desc">${step.descripcion || ''}</div>
          <div class="step-meta-row">
            <span><strong>Resp:</strong> ${step.responsable}</span>
            <span class="mono">${dateText}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
};
