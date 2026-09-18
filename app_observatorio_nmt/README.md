# MVP del Observatorio Regulatorio CRA — Monitoreo de Implementación de Nuevos Marcos Tarifarios (NMT)

## 1. Propósito y Alcance

Este aplicativo constituye el **Producto Mínimo Viable (MVP)** del Observatorio Regulatorio de Agua Potable y Saneamiento Básico de la CRA, orientado al seguimiento de la implementación de los **Nuevos Marcos Tarifarios (NMT)** expedidos en 2026, iniciando con la **Resolución CRA 1032 de 2026** (grandes prestadores de acueducto y alcantarillado, >5.000 suscriptores urbanos, Segmentos 1 al 4, 188 prestadores).

Asimismo, este módulo implementa la adopción del marco de **Política y Gobernanza Regulatoria de la OCDE**, cerrando la brecha de evaluación *ex-post* en Colombia al estructurar el ciclo de vida del marco a lo largo de 10 etapas (**E0 a E9**), desde el diagnóstico inicial hasta la Evaluación de Impacto Regulatorio Ex-Post (AIR Ex-Post).

---

## 2. Salvaguardas Regulatorias y Metodológicas (No Negociables)

En estricto apego a las **Reglas de Oro** del Context Lake ([`AGENTS.md`](../AGENTS.md)) y a los registros de decisiones arquitectónicas ([`ADR-0001` a `ADR-0012`](../adr/)):

1. **Prohibición de Rankings Compuestos (`RN-NMT-01`, `RN-PORTAL-05`):** Ningún indicador se combina en un puntaje único o índice de "cumplimiento" del 0 al 100 ni se ordenan prestadores de "mejores a peores".
2. **Desagregación Tarifaria Obligatoria (`RN-NMT-03`, `RN-PORTAL-04`):** El indicador de variación tarifaria (`NMT-TAR-01`) se presenta siempre desglosado por estrato socioeconómico (1 al 6) y clase de uso. Está terminantemente prohibido publicar una "tarifa promedio" por prestador.
3. **Nota de No Comparabilidad Inter-Segmentos (`RN-NMT-02`, `RF-ONTO-06`):** Los prestadores únicamente se comparan dentro de su segmento de escala correspondiente. La interfaz activa advertencias automáticas al cruzar operadores de diferentes escalas.
4. **Escalas de Riesgo No Invertidas (`RN-NMT-04`, `RN-PORTAL-06`):** Los indicadores de riesgo (IUS SSPD y Brechas de Pérdidas) se representan en escalas donde un mayor valor denota mayor gravedad o ineficiencia.
5. **Compuerta de Calidad (`ADR-0003`, `RF-PORTAL-01`):** Todo dato publicado cuenta con su semáforo de calidad (`VERIFIED`, `WARNING`, `QUARANTINE`, `NO_REPORT`), fecha de corte oficial y enlace a su ficha metodológica canónica.
6. **Publicación Individual por Fases con Salvaguardas (`ADR-0005`):** Ficha individual por prestador con estado de objeción (`en_objecion`) y ventana de revisión previa.

---

## 3. Estructura de Componentes

```
app_observatorio_nmt/
├── index.html                   # Interfaz accesible (WCAG 2.1 AA / MinTIC 1519)
├── README.md                    # Esta documentación
├── server.ps1                   # Servidor web local nativo en PowerShell
├── generar_datos_nmt.ps1        # Generador determinista del dataset canónico
├── css/
│   └── styles.css               # Sistema de diseño institucional CRA (azul marino, cerúleo, fondo blanco)
├── js/
│   ├── app.js                   # Controlador de estado, filtros reactivos y vistas
│   ├── data_nmt.js              # Espejo JS del dataset para ejecución local offline
│   └── components/
│       ├── timeline_ocde.js     # Línea de tiempo E0-E9 (Enfoque OCDE)
│       ├── impacto_ocde.js      # Módulo Analítico de Impacto OCDE (5 Dimensiones, Radar, Asequibilidad, AIR)
│       ├── kpi_cards.js         # Tarjetas de indicadores NMT reactivas
│       ├── charts_nmt.js        # Visualizaciones analíticas avanzadas en Chart.js
│       ├── map_colombia.js      # Mapa espacial interactivo con Leaflet
│       ├── provider_detail.js   # Ficha individual del prestador (ADR-0005)
│       ├── modals_fichas.js     # Fichas metodológicas canónicas desplegables
│       └── data_export.js       # Exportación a CSV y JSON con linaje y flags
└── data/
    ├── datos_nmt_prestadores_1032.json # Dataset canónico estructurado
    └── datos_nmt_prestadores_1032.csv  # Espejo tabular para descarga pública
```

---

## 4. Módulo de Impacto Regulatorio bajo el Modelo de la OCDE

Este módulo operativo implementa el ciclo completo de gobernanza regulatoria y las directrices de la **OCDE para la Evaluación del Impacto Regulatorio Ex-Post (AIR Ex-Post)** en el sector de agua y saneamiento:

1. **5 Dimensiones Canónicas de Impacto Regulatorio:**
   - **D1. Eficiencia Económica y Productividad:** Comportamiento del Costo Unitario CU ($CU = CMA + CMO + CMI + CMT$), incentivos de productividad ($X\text{-factor}$) y descuentos por servicio.
   - **D2. Nivel de Servicio y Continuidad:** Horas/día de suministro continuo ($IDH2$), calidad microbiológica ($IRCA / IDH5$) y presión en red ($IDH1$).
   - **D3. Asequibilidad e Inclusión Social (*OECD Affordability*):** Esfuerzo tarifario familiar frente al techo de referencia internacional de la OCDE (<3.0% del ingreso familiar) por estrato socioeconómico (1 al 6).
   - **D4. Sostenibilidad Hídrica y Pérdidas de Agua:** Brecha del Índice de Pérdidas por Usuario Facturado ($IPUF / IRD1$) frente al estándar de $6.0\text{ m}^3/\text{susc/mes}$.
   - **D5. Gobernanza Institucional y Calidad del Dato:** Adopción formal en SURICATA/SUI, perfil de riesgo institucional ($IUS\text{ SSPD}$) y semáforos de confiabilidad.

2. **Radar de los 12 Principios de Gobernanza del Agua de la OCDE:**
   - Visualización multiaxial en los 3 pilares: **Efectividad** (P1-P4), **Eficiencia** (P5-P8) y **Confianza & Participación** (P9-P12), contrastado frente al benchmark de países OCDE.

3. **Calculadora Interactiva de Asequibilidad Social:**
   - Simulación dinámica del impacto de la factura neta sobre los ingresos de los hogares en Estratos 1 a 6 con variación de consumo básico ($5\text{ a }25\text{ m}^3/\text{mes}$) y alertas automáticas de superación del umbral OCDE.

4. **Dictamen Ejecutivo AIR Ex-Post para Comisionados:**
   - Generación de informe oficial estructurado con dictamen de implementación, matriz comparativa de metas vs. observados y recomendaciones de transición para la CRA y SSPD.

---

## 5. Cómo Ejecutar Localmente

### Opción A: Servidor Web Local PowerShell (Recomendada)
En una consola de PowerShell en Windows, ejecute:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
El servidor iniciará en `http://localhost:8080/` y abrirá automáticamente el aplicativo en su navegador predeterminado.

### Opción B: Apertura Directa en Navegador
Haga doble clic en `index.html` o ábralo con su navegador (Chrome, Edge, Firefox). Todos los scripts y datasets funcionan de forma autónoma sin depender de servidores externos ni Node.js.
