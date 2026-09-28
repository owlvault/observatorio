# Prototipo del Observatorio CRA — Seguimiento a los Nuevos Marcos Tarifarios (Res. CRA 1032 y 1038 de 2026)

> [!IMPORTANT]
> **Versión final del prototipo — v1.1.0 (etiqueta `prototipo-v1.1.0`).** La etapa de prototipo cerró el 2026-09-28 y esta versión está **en validación del product owner**. Queda congelada: solo se cambia para atender sus observaciones. Alcance, criterios de validación y pendientes conocidos: [`docs/entrega-prototipo.md`](../docs/entrega-prototipo.md).

## 1. Propósito y Alcance

Este aplicativo es el **único prototipo** del Observatorio Regulatorio de Agua Potable y Saneamiento Básico de la CRA. Cubre el seguimiento a la implementación de los **Nuevos Marcos Tarifarios (NMT)** expedidos en 2026:

- **Resolución CRA 1032 de 2026** — grandes prestadores de acueducto y alcantarillado (>5.000 suscriptores urbanos, segmentos 1 a 4, 188 prestadores con datos simulados). Secciones *Grandes prestadores*, *Impacto regulatorio*, *Prestadores*, *Mapa*, *Metodología* y *Datos abiertos*.
- **Resolución CRA 1038 de 2026** — pequeños prestadores de acueducto de hasta 5.000 suscriptores y gestores comunitarios del agua (40 prestadores **sintéticos**). Sección *Pequeños prestadores y rurales* (`#nmtpp`), especificada en [`specs/prototipo-tablero-nmtpp.md`](../specs/prototipo-tablero-nmtpp.md).

Hasta el 2026-09-28 la Res. 1038 tenía un prototipo aparte (`app_observatorio_nmtpp/`); se integró aquí para mantener una sola versión. Los dos marcos **nunca se mezclan en una misma vista ni se suman en una misma cifra** (regla de oro 10, RN-NMTPP-02): cada uno tiene su sección, y donde el portal los muestra juntos (portada, directorio, mapa) van en grupos separados y rotulados.

El módulo de impacto estructura el ciclo del marco en 10 etapas (**E0 a E9**) con el enfoque de política regulatoria de la OCDE. Es seguimiento informativo: no es una evaluación ex post formal ni califica el cumplimiento con efectos jurídicos (ver "Fuera de alcance" en [`AGENTS.md`](../AGENTS.md)).

> [!WARNING]
> **Datos de prototipo.** Las cifras de los prestadores de la Res. 1032 son simuladas y las de la Res. 1038 son **sintéticas deterministas** (prestadores, radicados, códigos DIVIPOLA 9NN y valores observados ficticios). Los **parámetros regulatorios** de la Res. 1038 (metas, pisos, porcentajes y plazos) sí son los oficiales y se leen de `specs/nmtpp/parametros-res-1038.json`.

---

## 2. Salvaguardas Regulatorias y Metodológicas (No Negociables)

En estricto apego a las **Reglas de Oro** del Context Lake ([`AGENTS.md`](../AGENTS.md)) y a los registros de decisiones ([`adr/`](../adr/)):

1. **Prohibición de Rankings Compuestos (`RN-NMT-01`, `RN-PORTAL-05`):** Ningún indicador se combina en un puntaje único ni se ordenan prestadores de "mejores a peores".
2. **Desagregación Tarifaria Obligatoria (`RN-NMT-03`, `RN-PORTAL-04`):** La variación tarifaria (`NMT-TAR-01`) se presenta siempre por estrato (1 al 6) y clase de uso. Nunca se publica una "tarifa promedio".
3. **No Comparabilidad Inter-Segmentos (`RN-NMT-02`, `RF-ONTO-06`):** Los prestadores solo se comparan dentro de su segmento. La interfaz advierte al cruzar escalas.
4. **Escalas de Riesgo No Invertidas (`RN-NMT-04`, `RN-PORTAL-06`):** En IUS y brechas de pérdidas, mayor valor es mayor gravedad.
5. **Compuerta de Calidad (`ADR-0003`, `RF-PORTAL-01`):** Todo dato lleva semáforo (`VERIFIED`, `WARNING`, `QUARANTINE`, `NO_REPORT`), fecha de corte y enlace a su ficha.
6. **Publicación por Prestador con Salvaguardas (`ADR-0005`):** Ficha individual con estado de objeción y ventana de revisión previa.

### Invariantes del componente Res. 1038 (`specs/prototipo-tablero-nmtpp.md` §2)

| ID | Invariante |
|---|---|
| INV-01 | Aviso de datos sintéticos visible en la sección, en la primera línea de cada CSV y en el pie de las gráficas |
| INV-02 | Ninguna meta ni porcentaje como literal en el JS: todo sale de `window.CRA_NMTPP_PARAMS` |
| INV-03 | Solo los 10 estados del catálogo cerrado de RN-NMTPP-03; ausencia nunca se grafica como cero |
| INV-04 | El ISE oficial se muestra tal como se publica, sin ranking, ordenamiento ni velocímetro (ADR-0015) |
| INV-05 | IRCA en "sin fuente confirmada" mientras no haya canal de reporte (Q-NMTPP-06) |
| INV-06 | Sin comparaciones entre subsegmentos; paneles separados con advertencia |
| INV-07 | Leyenda RN-NMTPP-05: *seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD* |
| INV-08 | Tarifas por estrato (1 al 6) y uso; nunca tarifa promedio |
| INV-09 | Cada gráfica tiene su tabla de datos accesible |
| INV-10 | Todo dato con consecuencia tarifaria rotula "aplica en AAAA — evaluado con AAAA-2" |

---

## 3. Estructura de Componentes

```
app_observatorio_nmt/
├── index.html                   # Interfaz accesible (WCAG 2.1 AA / MinTIC 1519)
├── README.md                    # Esta documentación
├── server.ps1                   # Servidor web local nativo en PowerShell (puerto 8080)
├── test_nmt_mvp.ps1             # Pruebas de aceptación del portal; la sección 11 cubre los invariantes de la Res. 1038
├── generar_datos_nmt.ps1        # Generador determinista del dataset de la Res. 1032
├── assets/img/                  # Fotografías ilustrativas de portada y encabezados
├── css/
│   ├── styles.css               # Sistema de diseño institucional CRA (base)
│   ├── nmtpp.css                # Estilos base de las vistas Res. 1038
│   ├── portal.css               # Capa editorial del portal (tokens, componentes heredados)
│   ├── cinematica.css           # Capa visual común: escala editorial, bento, escenas Deep Navy, piezas de dato, encabezado de página
│   ├── cx-paginas.css           # Capa visual de Grandes prestadores, directorio, mapa, metodología, datos y modales
│   ├── cx-nmtpp.css             # Capa visual de la sección Res. 1038
│   └── cx-ocde.css              # Capa visual de la sección Impacto regulatorio
├── data/
│   ├── datos_nmt_prestadores_1032.json # Dataset canónico Res. 1032
│   ├── datos_nmt_prestadores_1032.csv  # Espejo tabular para descarga
│   └── datos-sinteticos-prototipo.js   # COPIA de specs/nmtpp/ (Res. 1038; no editar a mano)
└── js/
    ├── app.js                   # Controlador: navegación (goTo + #hash), filtros, encabezado de página y directorio
    ├── app_nmtpp.js             # Controlador de la sección Res. 1038 (subpestañas, modo, simulación Q-NMTPP-01)
    ├── motor_estados.js         # Motor determinista de estados de la Res. 1038 (fiel al oráculo)
    ├── cinematica_kit.js        # Movimiento: entradas, lienzo autodimensionado, escena de agua, anillos y medidores
    ├── theme_charts.js          # Tema Chart.js (degradados automáticos) + tabla de datos equivalente (RF-PORTAL-05)
    ├── data_nmt.js              # Espejo JS del dataset Res. 1032
    └── components/
        ├── portada.js / portada_contenido.js  # Portada y sus textos
        ├── encabezados.js       # Cifras-pilar del encabezado de cada página, calculadas desde los datos
        ├── paginas.js           # Conteos de Metodología y Datos abiertos
        ├── kpi_cards.js         # Indicadores NMT en bento, con su gráfico
        ├── charts_nmt.js        # Gráficas Chart.js de la Res. 1032
        ├── timeline_ocde.js / impacto_ocde.js # Impacto regulatorio: dimensiones, radar, asequibilidad, ciclo E0-E9
        ├── map_colombia.js      # Mapa con Leaflet (mapa base Esri, sin clave de API)
        ├── provider_detail.js   # Ficha individual del prestador Res. 1032 (ADR-0005)
        ├── modals_fichas.js     # Fichas metodológicas Res. 1032
        ├── data_export.js       # Exportación CSV/JSON Res. 1032
        └── nmtpp/               # Vistas de la Res. 1038: resumen, calendario, nivel de servicio, ISE,
                                 # régimen especial, aclaraciones, fichas, perfil de prestador, exportación, cifras
```

La capa visual sigue el skill *web-visual-cinematica*: titulares cortos que dicen el mensaje, un gráfico que lo explica y el texto largo en una segunda capa (`Leer más`). Las cifras de todas las piezas visuales se calculan desde los datos.

---

## 4. Módulo de Impacto Regulatorio con Enfoque OCDE

1. **5 dimensiones de impacto:** D1 eficiencia económica (costo unitario $CU = CMA + CMO + CMI + CMT$), D2 nivel de servicio (IDH2, IRCA/IDH5, IDH1), D3 asequibilidad frente a la referencia OCDE de 3,0 % del ingreso del hogar, D4 pérdidas (IPUF/IRD1 frente a la meta de referencia), D5 gobernanza y calidad del dato.
2. **Radar de los 12 principios de gobernanza del agua de la OCDE**, en sus tres pilares: efectividad (P1-P4), eficiencia (P5-P8) y confianza y participación (P9-P12).
3. **Calculadora de asequibilidad:** simula el peso de la factura neta en el ingreso del hogar por estrato y consumo (5 a 25 m³/mes).
4. **Resumen ejecutivo imprimible** con la matriz de metas frente a lo observado.

---

## 5. Cómo Ejecutar y Probar

```powershell
# Servidor local (abre el navegador en http://localhost:8080/)
powershell -ExecutionPolicy Bypass -File server.ps1

# Pruebas de aceptación (portal + invariantes de la Res. 1038)
powershell -ExecutionPolicy Bypass -File test_nmt_mvp.ps1
```

También funciona abriendo `index.html` con doble clic; Chart.js, Leaflet, las fuentes y el mapa base se cargan por internet.

Si se regeneran los datos sintéticos (`python ../specs/nmtpp/generar_datos_sinteticos_nmtpp.py`), copie `specs/nmtpp/datos-sinteticos-prototipo.js` a `data/`; la prueba NMTPP-10 falla si la copia difiere.
