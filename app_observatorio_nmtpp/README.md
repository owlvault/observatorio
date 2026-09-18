# Prototipo del Tablero de Monitoreo de Implementación del Marco Tarifario de Pequeños Prestadores de Acueducto (Res. CRA 1038 de 2026)

Este aplicativo constituye el **Prototipo Navegable e Interactivo** del Observatorio Regulatorio de Agua Potable y Saneamiento Básico de la CRA, orientado al seguimiento de la implementación de la **Resolución CRA 1038 de 2026** (pequeños prestadores de acueducto hasta 5.000 suscriptores, prestadores rurales y gestores comunitarios del agua).

> [!WARNING]
> **AVISO OBLIGATORIO DE TRANSPARENCIA (INV-01 / ADR-0014):**
> Este prototipo opera con **DATOS SINTÉTICOS DETERMINISTAS** (40 prestadores ficticios, radicados, códigos DIVIPOLA 9NN y valores observados simulados generados en el Context Lake).
> Los **PARÁMETROS REGULATORIOS (metas, pisos de eficiencia, porcentajes y plazos legales) SÍ SON LOS OFICIALES Y REALES** de la Resolución CRA 1038 de 2026, cargados desde `parametros-res-1038.json`.

---

## 1. Salvaguardas Regulatorias y Metodológicas (No Negociables)

En apego estricto a las **Reglas de Oro del Context Lake (`AGENTS.md`)** y a las especificaciones técnicas (`specs/seguimiento-nmt-pequenos-prestadores.md` y `specs/prototipo-tablero-nmtpp.md`):

1. **INV-01 (Aviso Sintético Permanente):** Visible en toda la interfaz, en la primera línea de cada CSV descargado y en el pie de gráficas.
2. **INV-02 (Sin Literales Regulatorios en Código):** Ningún porcentaje ni meta se escribe como literal en JS; todos se leen de `window.CRA_NMTPP_PARAMS`.
3. **INV-03 (Catálogo Cerrado de Estados RN-NMTPP-03):** Se usan exclusivamente los 10 estados válidos (`meta cumplida`, `en trayectoria`, `fuera de trayectoria`, `meta no alcanzada en el año de cumplimiento`, `no exigible aún`, `no reportó`, `meta no declarada`, `meta pendiente de aclaración normativa`, `sin fuente confirmada`, `no aplica`).
4. **INV-04 (Prohibición de Rankings del ISE):** El ISE oficial de la CRA se muestra tal como se publica, sin velocímetros ni ordenamiento por puntuación numérica.
5. **INV-05 (IRCA sin Fuente Confirmada):** Debido a la ausencia de canal de reporte designado en la norma (Q-NMTPP-06), el IRCA permanece en "sin fuente confirmada".
6. **INV-06 (No Comparabilidad Inter-Subsegmentos):** Se prohíbe contrastar operadores de diferentes escalas de suscriptores; cada grupo se visualiza en paneles separados con advertencias explícitas.
7. **INV-07 (Leyenda Informativa RN-NMTPP-05):** `Seguimiento informativo, sin efecto jurídico; la verificación del cumplimiento es de la SSPD`.
8. **INV-08 (Desagregación Tarifaria Obligatoria):** Las tarifas se presentan por estrato (1 al 6) y uso comercial; está prohibido publicar tarifas promedio.
9. **INV-09 (Accesibilidad Universal WCAG 2.1 AA):** Cada visualización interactiva dispone de su botón para alternar a su tabla de datos accesible.
10. **INV-10 (Consecuencia Tarifaria):** Rotulado temporal explícito `aplica en 2029 — evaluado con datos de 2027` ($i-2$).

---

## 2. Estructura del Aplicativo

```
app_observatorio_nmtpp/
├── index.html                 # Shell accesible (WCAG 2.1 AA) con banner permanente y 9 pestañas
├── README.md                  # Esta documentación técnica
├── server.ps1                 # Servidor HTTP local en PowerShell (puerto 8081)
├── test_nmtpp_prototipo.ps1   # Suite de 9 pruebas de aceptación e invariantes
├── css/
│   └── styles.css             # Sistema de diseño institucional CRA (Deep Navy, CRA Blue, semáforos)
├── data/
│   └── datos-sinteticos-prototipo.js  # Espejo JS del dataset sintético y parámetros normativos
└── js/
    ├── app.js                 # Controlador global, selector de modo y enrutador
    ├── motor_estados.js       # Motor determinista de inferencia de estados (fiel al oráculo)
    └── components/
        ├── resumen_adopcion.js  # V1: KPI cards de adopción, barras apiladas y estados 2027
        ├── calendario_hitos.js  # V2: Línea temporal de hitos H-01 a H-09 evaluados dinámicamente
        ├── nivel_servicio.js    # V3: Paneles por subsegmento (MIC, MAC, CON, COB, PER, PSH, CAL)
        ├── ise_incentivos.js    # V4: Publicación oficial CRA del ISE y desglose en cascada
        ├── prestadores.js       # V5: Maestro de prestadores y Ficha de Perfil Integral (7 secciones)
        ├── regimen_especial.js  # V6: APS con condiciones estructurales (estándares S2)
        ├── aclaraciones.js      # V7: Matriz de 14 aclaraciones normativas (Q-NMTPP-01 a 14)
        ├── fichas.js            # V8: Visor de las 25 fichas metodológicas y glosario
        └── exportar.js          # V9: Descarga CSV con metadatos y aviso obligatorio
```

---

## 3. Cómo Ejecutar Localmente

### Opción A: Servidor Web Local PowerShell (Recomendada)
En una consola de PowerShell en Windows, ejecute:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
El servidor iniciará en `http://localhost:8081/` y abrirá automáticamente el navegador.  
*(Se configuró en el puerto 8081 para no interferir con el aplicativo de la Res. 1032 que corre en el 8080).*

### Opción B: Apertura Directa en Navegador
Haga doble clic en `index.html` o ábralo con Chrome, Edge o Firefox. Funciona de manera autónoma sin servidor backend.

---

## 4. Ejecución de Pruebas de Aceptación

Para verificar la integridad de los 10 invariantes y los 239 estados esperados:
```powershell
powershell -ExecutionPolicy Bypass -File test_nmtpp_prototipo.ps1
```
