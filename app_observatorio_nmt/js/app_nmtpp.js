/**
 * app.js — Controlador Principal y Enrutador del Prototipo NMTPP
 * Observatorio Regulatorio CRA (Res. CRA 1038 de 2026)
 */

(function(window) {
    'use strict';

    const AppNMTPP = {
        modo: 'analista', // 'analista' (por defecto) o 'ciudadano'
        filtros: {
            segmento: 'todos',
            subsegmento: 'todos',
            regimen_especial: 'todos',
            busqueda: ''
        },
        banderas: {
            continuidad_equivalencia_24h: false
        },
        fechaCorte: '2028-09-15',
        activeTab: 'tab-resumen',

        init() {
            console.log('Iniciando Prototipo NMTPP CRA (Res. 1038 de 2026)...');

            if (window.CRA_NMTPP_DATA && window.CRA_NMTPP_DATA._meta) {
                this.fechaCorte = window.CRA_NMTPP_DATA._meta.fecha_corte_simulada || '2028-09-15';
                if (window.CRA_NMTPP_DATA._meta.banderas) {
                    this.banderas = { ...window.CRA_NMTPP_DATA._meta.banderas };
                }
            }

            // Aplicar clase inicial del modo al body
            this.actualizarClaseModo();

            // Verificar motor vs oráculo (RF-PROTO-01)
            this.verificarOraculo();

            // Registrar eventos de UI
            this.registrarEventos();

            // Renderizar vista activa
            this.mostrarTab(this.activeTab);
        },

        actualizarClaseModo() {
            if (this.modo === 'analista') {
                document.body.classList.add('modo-analista');
            } else {
                document.body.classList.remove('modo-analista');
            }

            const btnAnalista = document.getElementById('btn-modo-analista');
            const btnCiudadano = document.getElementById('btn-modo-ciudadano');
            if (btnAnalista && btnCiudadano) {
                btnAnalista.classList.toggle('active', this.modo === 'analista');
                btnCiudadano.classList.toggle('active', this.modo === 'ciudadano');
            }
        },

        setModo(nuevoModo) {
            this.modo = nuevoModo;
            this.actualizarClaseModo();
            this.renderVistaActiva();
        },

        toggleSimulacionQ01(activo) {
            this.banderas.continuidad_equivalencia_24h = activo;
            console.log('Simulación de respuesta a Q-NMTPP-01:', activo ? 'ACTIVADA' : 'DESACTIVADA');
            this.renderVistaActiva();
        },

        mostrarTab(tabId) {
            this.activeTab = tabId;

            // Actualizar botones de navegación
            const tabButtons = document.querySelectorAll('.nav-tab-btn[data-tab]');
            tabButtons.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
            });

            // Actualizar paneles dentro de pane-nmtpp
            const panes = document.querySelectorAll('#pane-nmtpp .tab-pane');
            panes.forEach(pane => {
                const isActive = (pane.id === tabId);
                pane.classList.toggle('active', isActive);
                pane.style.display = isActive ? 'block' : 'none';
            });

            this.renderVistaActiva();
        },

        renderVistaActiva() {
            switch (this.activeTab) {
                case 'tab-resumen':
                    if (window.ResumenAdopcion) window.ResumenAdopcion.render('tab-resumen');
                    break;
                case 'tab-calendario':
                    if (window.CalendarioHitos) window.CalendarioHitos.render('tab-calendario');
                    break;
                case 'tab-nivel-servicio':
                    if (window.NivelServicio) window.NivelServicio.render('tab-nivel-servicio');
                    break;
                case 'tab-ise-incentivos':
                    if (window.IseIncentivos) window.IseIncentivos.render('tab-ise-incentivos');
                    break;
                case 'tab-prestadores':
                    if (window.Prestadores) window.Prestadores.render('tab-prestadores');
                    break;
                case 'tab-regimen-especial':
                    if (window.RegimenEspecial) window.RegimenEspecial.render('tab-regimen-especial');
                    break;
                case 'tab-aclaraciones':
                    if (window.Aclaraciones) window.Aclaraciones.render('tab-aclaraciones');
                    break;
                case 'tab-metodologia':
                case 'tab-metodologia-nmtpp':
                    if (window.Fichas) window.Fichas.render(document.getElementById('tab-metodologia-nmtpp') ? 'tab-metodologia-nmtpp' : 'tab-metodologia');
                    break;
                case 'tab-datos':
                    if (window.Exportar) window.Exportar.render('tab-datos');
                    break;
            }
        },

        onFiltroChange() {
            const selSeg = document.getElementById('filtro-segmento');
            const selSub = document.getElementById('filtro-subsegmento');
            const selReg = document.getElementById('filtro-regimen');
            const inpBusq = document.getElementById('filtro-busqueda');

            if (selSeg) this.filtros.segmento = selSeg.value;
            if (selSub) this.filtros.subsegmento = selSub.value;
            if (selReg) this.filtros.regimen_especial = selReg.value;
            if (inpBusq) this.filtros.busqueda = inpBusq.value;

            this.renderVistaActiva();
        },

        resetFiltros() {
            this.filtros = {
                segmento: 'todos',
                subsegmento: 'todos',
                regimen_especial: 'todos',
                busqueda: ''
            };
            const selSeg = document.getElementById('filtro-segmento');
            const selSub = document.getElementById('filtro-subsegmento');
            const selReg = document.getElementById('filtro-regimen');
            const inpBusq = document.getElementById('filtro-busqueda');

            if (selSeg) selSeg.value = 'todos';
            if (selSub) selSub.value = 'todos';
            if (selReg) selReg.value = 'todos';
            if (inpBusq) inpBusq.value = '';

            this.renderVistaActiva();
        },

        verificarOraculo() {
            if (!window.MotorEstados) return;
            const res = window.MotorEstados.compararConOraculo(2027);
            const banner = document.getElementById('oraculo-verification-banner');

            if (res.coincide) {
                console.log(`[PASS] RF-PROTO-01: Motor de estados coincide 100% con oráculo (${res.totalCalculados} estados evaluados)`);
                if (banner) {
                    banner.innerHTML = `<span class="chip chip-incentive" style="font-size: 0.78rem;">✓ Integridad Verificada</span> <span style="color: var(--text-secondary);">Motor determinista: <strong>${res.totalCalculados}/${res.totalCalculados}</strong> estados evaluados coinciden exactamente con el oráculo</span>`;
                }
            } else {
                console.warn(`[WARN] Discrepancia con oráculo: ${res.diferencias.length} diferencias encontradas`, res.diferencias);
                if (banner) {
                    banner.innerHTML = `<span class="chip chip-discrepancy" style="font-size: 0.78rem;">⚠️ Alerta Discrepancia</span> <span style="color: var(--st-meta-no-alcanzada-color); font-weight: 700;">Motor ≠ Oráculo: ${res.diferencias.length} diferencias detectadas</span>`;
                }
            }
        },

        registrarEventos() {
            // Pestañas
            const tabButtons = document.querySelectorAll('.nav-tab-btn[data-tab]');
            tabButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tabId = btn.getAttribute('data-tab');
                    if (tabId) this.mostrarTab(tabId);
                });
            });

            // Filtros
            const selSeg = document.getElementById('filtro-segmento');
            const selSub = document.getElementById('filtro-subsegmento');
            const selReg = document.getElementById('filtro-regimen');
            const inpBusq = document.getElementById('filtro-busqueda');

            if (selSeg) selSeg.addEventListener('change', () => this.onFiltroChange());
            if (selSub) selSub.addEventListener('change', () => this.onFiltroChange());
            if (selReg) selReg.addEventListener('change', () => this.onFiltroChange());
            if (inpBusq) {
                inpBusq.addEventListener('input', () => {
                    clearTimeout(this._searchTimer);
                    this._searchTimer = setTimeout(() => this.onFiltroChange(), 200);
                });
            }

            // Modal cerrar al hacer clic en fondo
            const modal = document.getElementById('modal-perfil-prestador');
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal && window.Prestadores) {
                        window.Prestadores.cerrarModal();
                    }
                });
            }
        }
    };

    window.AppNMTPP = AppNMTPP;

    // Inicializar al cargar el DOM
    document.addEventListener('DOMContentLoaded', () => {
        AppNMTPP.init();
    });

})(window);
