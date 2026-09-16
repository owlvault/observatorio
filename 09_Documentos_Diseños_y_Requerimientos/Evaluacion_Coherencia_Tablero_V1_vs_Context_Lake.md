---
id: evaluacion-coherencia-tablero-v1-context-lake
tipo: evaluacion-tecnica-y-regulatoria
proyecto: observatorio-regulatorio-cra
estado: propuesta-aprobada
actualizado: 2026-09-14
fuentes: [09_Documentos_Diseños_y_Requerimientos/MODELO DE TABLERO_V1.pptx, 09_Documentos_Diseños_y_Requerimientos/VARIABLES TABLERO.xlsx, AGENTS.md, docs/business_context.md, docs/glosario.md, specs/portal-publico.md, specs/ontologia-indicadores.md, specs/calidad-de-datos.md, 05_Bateria_de_Indicadores/catalogo-v1.md, adr/ADR-0001 a ADR-0012]
---

# Evaluación de Coherencia Técnica y Regulatoria — Tablero V1 vs. Context Lake CRA

## 1. Objeto y Alcance

El presente documento analiza la viabilidad, coherencia normativa y pertinencia metodológica del prototipo de tablero contenido en `MODELO DE TABLERO_V1.pptx` y su esquema de datos definido en `VARIABLES TABLERO.xlsx`, contrastándolos contra el marco de gobernanza, la ontología canónica de indicadores y las especificaciones de interfaz del **Context Lake del Observatorio Regulatorio de la CRA**.

Este análisis fundamenta los ajustes implementados en el mockup web interactivo `mockup_tablero_v1_ajustado.html`, garantizando que la visualización final cumpla con:
1. Las ocho **Reglas de Oro** del Observatorio (`AGENTS.md`).
2. Los requisitos funcionales de compuerta de publicación, calidad y accesibilidad (`specs/portal-publico.md`, `RF-PORTAL-01` a `-16`).
3. La ontología canónica y el catálogo oficial de indicadores V1 (`catalogo-v1.md`, `specs/ontologia-indicadores.md`).
4. La jurisprudencia y marco regulatorio vigente de la Comisión de Regulación de Agua Potable y Saneamiento Básico (Resolución CRA 688 de 2014, Resolución CRA 825 de 2017, Resolución CRA 943 de 2021) y normatividad interinstitucional (Resolución 2115 de 2007 MPS/MAVDT, Ley 142 de 1994, Resolución MinTIC 1519 de 2020).

---

## 2. Diagnóstico Estructural del Tablero V1

El archivo `MODELO DE TABLERO_V1.pptx` propone una estructura de tipo *Executive Business Intelligence Dashboard* orientada al servicio de Acueducto, con:
- **Filtros jerárquicos:** País, Departamento, Municipio, Empresa, Estrato, Segmento.
- **9 Tarjetas KPI:**
  1. *CALIDAD DEL AGUA (IRCA)*: 7.3
  2. *CANTIDAD DE PRESTADORES*: 6.435
  3. *CANTIDAD DE SUSCRIPTORES*: 10.422.900
  4. *CONSUMO PROMEDIO MES*: 14,6 M3
  5. *VALOR PROMEDIO M3*: 8.102
  6. *INDICE DE PERDIDAS POR USUARIO FACTURADO*: 11,5 M3
  7. *IUS*: 70
  8. *COSTOS PROMEDIO*: 6.450
  9. *PQR PPROMEDIO MES*: 189.950
- **3 Gráficas de comportamiento temporal:**
  1. *COMPORTAMIENTO CONSUMO PROMEDIO*
  2. *COMPORTAMIENTO VALOR PROMEDIO*
  3. *COMPORTAMIENTO PERDIDAS*

Por su parte, `VARIABLES TABLERO.xlsx` desglosa la matriz de campos: `SERVICIO`, `NOMBRE EMPRESA`, `CODIGO EMPRESA (RUPS)`, `NOMBRE MUNICIPIO`, `CODIGO MUNICIPIO (DIVIPOLA)`, `NOMBRE DEPARTAMENTO`, `CODIGO DEPARTAMENTO (DIVIPOLA)`, `AÑO`, `MES`, `SUSCRIPTORES`, `ESTRATO`, `FACTURACIÓN MES`, `CONSUMO MES`, `COSTOS`, `VALOR M3` (definido como `FACTURACIÓN / CONSUMO`), `CONSUMO PROMEDIO`, `CANTIDAD PQR`, `SEGMENTO CALCULADO`, `METODOLOGIA`, `SEGMEMTO`.

---

## 3. Matriz de Coherencia y Severidad de Brechas

| # | Variable / Elemento PPTX | Regla o Especificación Context Lake | Severidad de la Brecha | Diagnóstico Técnico-Regulatorio | Ajuste Obligatorio |
|---|---|---|---|---|---|
| **B-01** | **VALOR PROMEDIO M3** (`$8.102`) / `FACT/CONSUMO` | `RN-PORTAL-04`, `docs/glosario.md`, `catalogo-v1.md` | **Alta (Crítica)** | En Colombia está **prohibido calcular una "tarifa promedio"** que mezcle estratos y subsidios con costos de prestación. El valor facturación / consumo mezcla subsidios otorgados por entes territoriales (estratos 1, 2 y 3) con sobreprecios de contribución (estratos 5, 6 e industrial/comercial). Presentar esto induce a error sobre el precio real que paga un usuario y el costo eficiente regulatorio. | Desagregar en dos indicadores canónicos: **Costo Unitario de Prestación del Servicio (CU)** ($/m³ según metodología Res. CRA 688/2014 o 825/2017) y **Tarifa Aplicada Efectiva por Estrato** ($/m³, declarando estrato, año base y condición monetaria constante de 2024). |
| **B-02** | **CALIDAD DEL AGUA (IRCA: 7.3)** | `IND-CAL-01`, `RN-PORTAL-06`, `docs/glosario.md`, Res. 2115/2007 | **Alta** | El IRCA es un **índice de riesgo**, no un indicador porcentual de calidad en escala ascendente. En el IRCA, **a mayor valor, mayor es el riesgo sanitario** (escala inversa). Presentar 7.3 como "calidad" sugiere erróneamente un desempeño de 7.3 sobre 100. Además, su fuente es SIVICAP / INS (dependencia externa con canal en formalización `Q-CAT-01`). | Rotular con su nombre legal: *Índice de Riesgo de la Calidad del Agua (IRCA)*, asignar semáforo normativo oficial (0-5: Sin Riesgo / Verde; 5.1-14: Riesgo Bajo / Amarillo; 14.1-35: Medio / Naranja; etc.), declarar la escala inversa y advertir la fuente externa INS/SIVICAP con ficha metodológica `IND-CAL-01`. |
| **B-03** | **INDICE DE PERDIDAS POR USUARIO FACTURADO (11,5 M3)** | `IND-PER-02`, `catalogo-v1.md`, Res. CRA 688/2014 art. 23 | **Media** | En la ontología oficial el indicador es el **IPUF** (*Índice de Pérdidas por Suscriptor Facturado*). Su unidad reglamentaria es `m³/suscriptor/mes`. Además, carece de la meta regulatoria de eficiencia para ser inteligible. | Adoptar el código canónico `IND-PER-02`, unidad `m³/susc/mes`, semáforo de calidad de datos, y contrastar con la meta regulatoria de pérdidas eficientes (6 m³/susc/mes según Res. CRA 688 de 2014). |
| **B-04** | **IUS: 70** | Regla de Oro 1, `catalogo-v1.md` | **Alta** | **El "IUS" no existe en el catálogo oficial de 14 indicadores V1 de la CRA.** La Regla de Oro 1 prohíbe taxativamente inferir o crear indicadores sin respaldo en el Context Lake. Si refiere a "Índice de Uso del Suelo" o a un índice compuesto de servicio, carece de sustento en V1. | En el modelo ajustado, se reemplaza por el indicador oficial de prestación `IND-CON-01` (**Continuidad del Servicio**, horas/día). En la réplica del modelo original, se exhibe con advertencia de "Indicador experimental sin ficha aprobada en V1". |
| **B-05** | **COSTOS PROMEDIO: 6.450** | `IND-EFI-01`, `IND-EFI-02`, Regla de Oro 6 | **Media** | Una cifra desnuda "6.450" sin unidad declarada (¿$/m³?, ¿$/suscriptor?) ni desglose por componente regulatorio infringe la regla de oro 6. En acueducto, los costos se componen de CMA (Costo Medio de Administración) y CMO (Costo Medio de Operación). | Desagregar en **CMA** (`IND-EFI-01`, $/suscriptor/mes, base 2024) y **CMO** (`IND-EFI-02`, $/m³, base 2024), con año base y condición monetaria explícita (`RF-ONTO-07`). |
| **B-06** | **PQR PROMEDIO MES: 189.950** | `docs/business_context.md`, `specs/benchmarking-econometrico.md` | **Baja (UI/UX)** | El volumen absoluto de PQR imposibilita la comparación: 180.000 PQR para un operador con 2,5 millones de suscriptores (EAAB) refleja una tasa por usuario muy inferior a 500 PQR en un municipio con 1.000 usuarios. | Presentar el volumen total acompañado obligatoriamente de la **Tasa de PQR por cada 1.000 suscriptores** (`(PQR / Suscriptores) * 1.000`), garantizando comparabilidad equitativa. |
| **B-07** | **Ausencia de Ficha Metodológica y Semáforo** | `RF-PORTAL-01`, `RF-PORTAL-02`, `ADR-0003` | **Alta (Crítica)** | Ninguna tarjeta del PPTX presentaba semáforo de calidad de datos (`quality_flag`), cobertura de reporte municipal/nacional, fecha de corte, ni enlace para auditar la fórmula matemática y la norma vigente. | Incorporar en cada KPI el badge de semáforo accesible (forma + color + texto: Conforme / Observación / Cuarentena), fecha de corte del reporte SUI y drawer/modal de Ficha Metodológica con los 14 campos reglamentarios. |
| **B-08** | **Accesibilidad y Datos Abiertos** | `RF-PORTAL-03`, `RF-PORTAL-05`, Res. MinTIC 1519 de 2020 | **Media** | Las 3 gráficas carecían de alternativa textual tabular, violando el nivel AA de WCAG 2.1. Tampoco se proveía mecanismo de descarga de datos abiertos. | Habilitar toggle "Ver gráfica / Ver tabla de datos accesible" bajo cada componente visual, y botón de exportación CSV/JSON con metadatos completos (`quality_flag`, versión de ficha, fecha de corte). |

---

## 4. Arquitectura de Navegación y Filtros (Coherencia con `VARIABLES TABLERO.xlsx`)

La matriz en Excel define la granularidad de consulta requerida para el Observatorio. Su integración se formaliza de la siguiente manera:

1. **Jerarquía Territorial (`divipola_code`):**
   - Selección por `NOMBRE DEPARTAMENTO` y `CODIGO DEPARTAMENTO` (2 dígitos DIVIPOLA).
   - Selección por `NOMBRE MUNICIPIO` y `CODIGO MUNICIPIO` (5 dígitos DIVIPOLA).
   - Regla de agregación: Cuando se selecciona un municipio con múltiples prestadores, el Observatorio no promedia linealmente, sino que aplica ponderación por suscriptores facturados (`ADR-0012`, `RF-ONTO-09`).
2. **Identificación de Prestador:**
   - Llave canónica: `CODIGO EMPRESA` (RUPS de la SSPD / ID SUI) + `NOMBRE EMPRESA`.
   - Estado de reporte para el periodo (`RF-PORTAL-06`): Con reporte validado, Sin reporte, En revisión o En objeción.
3. **Segmentación Regulatoria:**
   - `SEGMENTO CALCULADO`: Grandes Prestadores (> 5.000 suscriptores en área urbana) o Pequeños Prestadores (hasta 5.000 suscriptores).
   - `METODOLOGIA`: Resolución CRA 688 de 2014 (modificada por Res. CRA 735 de 2015) para Segmentos 1 y 2; Resolución CRA 825 de 2017 para esquemas diferenciales.
4. **Estratificación Socioeconómica:**
   - Residencial: Estratos 1 (Bajo-Bajo), 2 (Bajo), 3 (Medio-Bajo), 4 (Medio), 5 (Medio-Alto), 6 (Alto).
   - No Residencial: Comercial, Industrial, Oficial / Especial.

---

## 5. El Mockup Implementado (`mockup_tablero_v1_ajustado.html`)

Para permitir que el equipo directivo de la CRA evalúe el impacto de estos ajustes de forma tangible, el mockup implementa una **interfaz dual interactiva**:

- **Modo Original (PPTX V1 Replicado):** Renderiza visualmente el tablero tal cual fue concebido en la presentación de diapositivas, aplicando los estilos y tipografía del Observatorio pero manteniendo intactas las variables, títulos y cifras originales. En este modo se despliegan anotaciones flotantes que indican al usuario dónde residen las brechas regulatorias.
- **Modo Ajustado (Context Lake CRA):** Transforma el tablero en la versión oficial del Observatorio, incorporando las tarjetas con semáforos, el Costo Unitario CU desglosado, la tarifa por estrato, el IRCA con escala de riesgo, el IPUF normativo, la continuidad en horas/día, las tablas accesibles y los modales de ficha metodológica.
- **Filtros reactivos en tiempo real:** Los usuarios pueden interactuar con los selectores territoriales y de prestadores, viendo cómo se actualizan los datos simulados y las tres gráficas analíticas.

---

## 6. Conclusión y Recomendaciones para la Subdirección de Regulación

1. **Aprobar la transición del término "Valor m3" a "Costo Unitario (CU) / Tarifa Aplicada":** Protegerá a la CRA de cuestionamientos públicos por inducir a error en la interpretación de los subsidios y aportes solidarios municipales.
2. **Formalizar la adopción de `IND-CON-01` en lugar de "IUS":** Mantener la coherencia del catálogo V1 y reservar la inclusión de nuevos índices para la versión V1.1 previa expedición de su ficha metodológica correspondiente.
3. **Sostener la compuerta de calidad en toda visualización Power BI o web:** Ninguna cifra debe presentarse como un valor aislado sin su fecha de corte y semáforo de confiabilidad.
