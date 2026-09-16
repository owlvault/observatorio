---
id: ui-ux-design-standards
tipo: rule
proyecto: observatorio-regulatorio-cra
actualizado: 2026-09-15
---

# Estándares de Diseño UI/UX y Visualización para el Observatorio CRA

Al diseñar, maquetar o implementar interfaces de usuario, tableros o portales para el Observatorio Regulatorio de la CRA, los agentes DEBEN cumplir estrictamente con los siguientes principios visuales:

## 1. Paleta Cromática Institucional (Fondo Blanco & Gama Azul)
- **Fondo:** Obligatoriamente blanco puro o gris luminoso institucional (`#ffffff`, `#f8fafc`). Queda prohibido el modo oscuro por defecto en vistas institucionales del Observatorio.
- **Contenido y Visualizaciones:** Se debe usar una gama armónica y sofisticada de azules:
  - `Deep Navy` (`#072b42`): Títulos de alto impacto, textos principales y agujas de precisión.
  - `CRA Blue` (`#0b5e87`): Botones de acción, cabeceras y elementos activos principales.
  - `Royal Blue` (`#1d4ed8`): Curvas de tendencia temporales, polígonos de radar y tarifas finales.
  - `Cerulean & Sky` (`#0284c7`, `#38bdf8`): Barras de cascada, interactivos y microinteracciones.
  - `Ice Blue` (`#e0f2fe`): Superficies secundarias, badges de estado y fondo de mapas.
- **Colores Funcionales de Alerta:** Exclusivamente para cumplimiento normativo (verde `#059669` para metas eficientes; ámbar `#b45309` para riesgos moderados; rojo `#dc2626` para ineficiencias o riesgos sanitarios altos).

## 2. Enfoque Visual-First (Prohibición de Tableros Basados en Cajas de Texto)
- Todo dato debe comunicarse preferentemente mediante **visualizaciones interactivas** antes que números planos en cuadros de texto:
  - **Estructura Tarifaria:** Gráficas de cascada (*waterfall charts*) dinámicas que desglosen CMA + CMO = Costo Unitario CU, con deslizador de estratos (E1 a E6) para simular subsidios y aportes solidarios.
  - **Calidad del Agua (IRCA):** Tacómetros radiales graduados según las 5 zonas de riesgo de la Resolución 2115 de 2007, evidenciando que menor valor representa menor riesgo (escala inversa).
  - **Pérdidas (IPUF):** Gráficas bullet con demarcación clara de la meta regulatoria eficiente (6,0 m³/susc/mes, Res. CRA 688/2014, art. 23).
  - **Benchmarking:** Gráficas de radar pentagonal comparando al prestador frente a su grupo homogéneo (`BQ-PRE-01`).
  - **Series Temporales:** Curvas suaves Bezier con área sombreada luminosa y cursor sincronizado.

## 3. Navegación Espacial con Mapa Geográfico Real (Map-First Navigation)
- La navegación debe apoyarse en mapas interactivos de Colombia.
- **Contorno Geográfico Real:** El mapa SVG DEBE respetar las líneas costeras y fronterizas reales de Colombia y la división departamental precisa, prohibiéndose bocetos poligonales esquemáticos o simplistas.
- **Interactividad Espacial:** Al pasar el cursor sobre un departamento debe iluminarse y desplegar tarjetas flotantes (*sparklines*); al hacer clic, todo el ecosistema de gráficos del tablero debe sincronizarse en tiempo real.

## 4. Accesibilidad Obligatoria (WCAG 2.1 AA / Res. MinTIC 1519 de 2020)
- Cada gráfica compleja debe disponer de un control inmediato para alternar a su **tabla de datos estructurada accesible**.
- Todo semáforo debe usar doble codificación (color + forma de ícono + texto explícito).
