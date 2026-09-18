---
id: spec-prototipo-tablero-nmtpp
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-18
fuentes: [specs/seguimiento-nmt-pequenos-prestadores.md, 05_/nmtpp/catalogo-nmtpp.md, specs/nmtpp/*, app_observatorio_nmt/README.md (convenciones del prototipo de la Res. 1032), .agents/rules/ui-ux-design-standards.md, adr/ADR-0015]
---

# Spec — Prototipo del tablero de seguimiento al NMT de pequeños prestadores de acueducto

## Propósito

Esta spec define lo que un agente de código necesita para construir, **sin preguntar**, el prototipo navegable del componente especificado en `specs/seguimiento-nmt-pequenos-prestadores.md`. El prototipo usa **datos sintéticos** y los **parámetros reales** de la Res. 1038. Sirve para validar con la Subdirección Técnica de Regulación y los comisionados qué se ve, cómo se leen los estados y qué bloquean las aclaraciones pendientes.

**No cubre:** conexión al SUI, persistencia en Oracle, autenticación, publicación en la sede electrónica, alcantarillado, pilas públicas ni esquemas diferenciales como vista propia. Tampoco NMTPP-EDR-01/02: el esquema rural solo aparece como marca de la APS.

## Contexto relevante

- Requisitos funcionales del componente: RF-NMTPP-01..19 y RN-NMTPP-01..09. Esta spec dice **qué parte implementa el prototipo** y cómo.
- Parámetros: `specs/nmtpp/parametros-res-1038.json`.
- Datos: `specs/nmtpp/datos-sinteticos-prototipo.json` y su espejo `datos-sinteticos-prototipo.js`, que expone `window.CRA_NMTPP_DATA` y `window.CRA_NMTPP_PARAMS`.
- Generador de datos y oráculo de estados: `specs/nmtpp/generar_datos_sinteticos_nmtpp.py`.
- Modelo físico futuro: `specs/nmtpp/modelo-datos.sql`. El prototipo no lo usa, pero sus nombres de campo coinciden.
- Fichas: `05_Bateria_de_Indicadores_y_Dimensiones_Regulatorias/nmtpp/ficha-NMTPP-*.md`.
- Estándares visuales obligatorios: `.agents/rules/ui-ux-design-standards.md` (fondo blanco, gama azul, doble codificación de semáforos, tabla alternativa en cada gráfica).
- Convenciones de código: las mismas de `app_observatorio_nmt/` (prototipo de la Res. 1032). JavaScript sin framework con objetos globales `window.<Componente>`, Chart.js por CDN, servidor local `server.ps1`, funcionamiento offline abriendo `index.html`.

## 1. Ubicación y estructura

El prototipo va en una carpeta **hermana** de `app_observatorio_nmt/`. No se integra en ella porque la regla de oro 10 y RN-NMTPP-02 prohíben mezclar datos de la 1032 y la 1038 en las mismas vistas.

```
app_observatorio_nmtpp/
├── index.html                 # Shell accesible; banner "DATOS SINTÉTICOS" fijo
├── README.md                  # Cómo ejecutar; aviso de datos sintéticos; enlaces a specs
├── server.ps1                 # Copia de app_observatorio_nmt/server.ps1 con puerto 8081
├── test_nmtpp_prototipo.ps1   # Pruebas de aceptación §9 (patrón de test_nmt_mvp.ps1)
├── css/styles.css             # Reutiliza tokens de color de app_observatorio_nmt/css/styles.css
├── data/
│   └── datos-sinteticos-prototipo.js   # COPIA de specs/nmtpp/ (no editar a mano)
└── js/
    ├── app.js                 # Estado global, navegación por pestañas, modo ciudadano/analista, filtros
    ├── motor_estados.js       # Motor de estados §6 (única lógica de evaluación)
    ├── components/
    │   ├── resumen_adopcion.js
    │   ├── calendario_hitos.js
    │   ├── nivel_servicio.js
    │   ├── ise_incentivos.js
    │   ├── prestadores.js     # tabla + perfil de prestador (modal)
    │   ├── regimen_especial.js
    │   ├── aclaraciones.js
    │   ├── fichas.js          # visor de fichas (texto embebido de las 25 fichas)
    │   └── exportar.js        # CSV UTF-8 de cada vista
```

## 2. Invariantes que el prototipo DEBE respetar

| ID | Invariante | Origen |
|---|---|---|
| INV-01 | El banner "DATOS SINTÉTICOS — no son información real de ningún prestador" se ve en todas las pantallas, en el CSV exportado (primera línea) y en el pie de cada gráfica. | ADR-0014 (no confundir con fuente oficial); `_meta.aviso` |
| INV-02 | Ninguna meta, porcentaje, año de cumplimiento ni piso se escribe como literal en JS: todo sale de `window.CRA_NMTPP_PARAMS`. | RF-NMTPP-06 |
| INV-03 | Ningún estado fuera del catálogo de RN-NMTPP-03. Ausencia ≠ 0: un `null` nunca se grafica como cero. | RN-NMTPP-03, RN-ONTO-03 |
| INV-04 | No hay ordenamiento, ranking, cuartil ni velocímetro del ISE. La columna ISE no se puede ordenar. | ADR-0015, RN-NMTPP-04 |
| INV-05 | No se muestra ningún valor de IRCA; solo el estado "sin fuente confirmada". | RF-NMTPP-09 |
| INV-06 | Cada vista de nivel de servicio filtra por subsegmento. Si el filtro abarca más de uno, se muestra la nota de no comparabilidad y las gráficas se separan en paneles por subsegmento. | RF-NMTPP-16 |
| INV-07 | Todo estado frente a meta lleva la leyenda de RN-NMTPP-05 en modo ciudadano y el origen de la meta (regulatoria con artículo, o declarada). | RN-NMTPP-05, RN-NMTPP-08 |
| INV-08 | No hay "tarifa promedio": las tarifas siempre van por estrato y uso. | RN-PORTAL-04 |
| INV-09 | Toda gráfica tiene un botón "Ver tabla" con la tabla equivalente accesible. | RF-PORTAL-05 |
| INV-10 | Todo dato con consecuencia tarifaria muestra "aplica en AAAA — evaluado con AAAA-2". | RN-NMTPP-06 |

## 3. Estado global y controles

- `AppNMTPP.modo`: `ciudadano` o `analista` (por defecto `analista`). En modo ciudadano se ocultan los elementos `.analyst-only`: discrepancias, regresiones, alertas de hitos y el detalle de Q.
- `AppNMTPP.filtros`: segmento (`S1` | `S2` | todos), subsegmento, departamento, régimen especial (`todos` | `con condición especial` | `sin condición`), texto de búsqueda.
- `AppNMTPP.banderas`: `{continuidad_equivalencia_24h: false}` desde `_meta.banderas`. En modo analista se muestra un interruptor rotulado **"Simular respuesta a Q-NMTPP-01 (solo prototipo)"**. Activarlo recalcula los estados de continuidad del S1 con §6.4 y pone la marca "SIMULACIÓN" en cada valor afectado.
- `AppNMTPP.fechaCorte` = `_meta.fecha_corte_simulada` (2028-09-15). Se muestra en la cabecera como "Fecha de corte simulada".

## 4. Vistas

### V1 — Resumen de implementación (pestaña por defecto)

| Elemento | Contenido | Gráfica | Requisito |
|---|---|---|---|
| Tarjetas de adopción | ADO-01 (inicial 2027) y ADO-04 (recálculo 2028 en ventana), cada una como "E de U prestadores" más porcentaje, por segmento | Barras apiladas horizontales por subsegmento: recibido / no recibido; en ventana / fuera de ventana / sin recálculo | RF-NMTPP-05 |
| Gestores que optaron por el S1 | ADO-05 | Número con enlace a la lista | RF-NMTPP-05 |
| Distribución de estados | Por indicador de servicio del año 2027, número de APS en cada estado del catálogo, **dentro de cada subsegmento** | Barras 100 % apiladas por subsegmento, con los colores de §7 | RF-NMTPP-07 |
| Aclaraciones que bloquean | Número de Q abiertas y de indicadores afectados, con enlace a V7 | Tarjeta | RF-NMTPP-18 |
| Hito próximo o vencido | El hito más cercano de V2 | Tarjeta | RF-NMTPP-03 |

### V2 — Calendario del marco

Línea de tiempo horizontal 2026-2036 con H-01 a H-09 de `parametros.calendario`. El estado de cada hito se calcula contra `fechaCorte`:
- `cumplido` si la fecha pasó y hay evidencia en los datos (por ejemplo, ISE publicado para H-06);
- `vencido` si la fecha pasó sin evidencia;
- `en curso` si la fecha de corte cae dentro de la ventana;
- `pendiente` en los demás casos.

Cada hito muestra el actor y el artículo. En el escenario, H-06 de 2029 queda `cumplido` (publicación sintética del 2028-08-26).

### V3 — Nivel de servicio

- Selector de indicador: MIC, MAC, CON, COB, PER, PSH y CAL, con la etiqueta S1 o S2 según el segmento filtrado.
- **Panel por subsegmento**, cada uno con:
  - una tabla de APS con valor observado 2027, línea base, meta aplicada, origen de la meta y estado (icono, color y texto);
  - una gráfica según el indicador:

| Indicador | Gráfica |
|---|---|
| MIC, MAC, COB, CON (h/día o %) | Gráfica de puntos: línea base contra observado por APS, con la línea del estándar y una banda vertical que marca el año de cumplimiento del subsegmento |
| PER (IPUF) | Bullet: valor observado, marca en IPUF* = 6 (art. 2.1.1.1.1.3 Res. 1038) y marca de la meta declarada. Mayor es peor |
| CAL | Sin gráfica. Cartel: "Sin fuente confirmada: la Res. 1038 exige IRCA ≤ 5 % desde el inicio pero no designa fuente ni canal (Q-NMTPP-06)" |
| CON con Q abierta | Solo valores observados y línea base, con la leyenda "meta pendiente de aclaración normativa (Q-NMTPP-01, Q-NMTPP-02)" |

- **Trayectoria por prestador**, al hacer clic en una fila: línea con la línea base (2026), el observado (2027) y las metas declaradas de 2027 a 2031, más el estándar y el año de cumplimiento regulatorio. Rotulado RN-NMTPP-08.

### V4 — Eficiencia e incentivos (ISE oficial)

- Encabezado fijo: "Índice Sintético de Eficiencia — publicado por la CRA (Res. 1038 art. 2.1.1.1.2.2.7.1). El Observatorio no lo calcula." Y la marca SINTÉTICO.
- Tabla del S1, ordenada **alfabéticamente** por nombre y **no ordenable** por ninguna columna numérica. Columnas:
  - prestador y subsegmento;
  - ISE calculado;
  - D. técnica, D. administrativa y D. financiera;
  - porcentaje de eficiencia aplicable y piso del año;
  - ISE con incentivos (CMOG) e ISE con incentivos (CMA);
  - incentivos reconocidos (chips);
  - "aplica 2029 — evaluado 2027".
- Detalle al abrir una fila: barras horizontales de los 6 indicadores normalizados, agrupadas por dimensión y con su peso, y un gráfico de cascada del cálculo (dimensiones ponderadas → ISE → umbral de 70 → piso del año → incentivos → ISE con incentivos). **No** se muestra velocímetro ni posición.
- Tarjeta NMTPP-ISE-02: fecha de publicación frente al límite (2028-08-31); en el escenario, 5 días antes del límite.
- NMTPP-INC-01: barras por tipo de incentivo con el número de prestadores y el porcentaje del año (CMOG +5, CMA +2,5).
- NMTPP-INC-02: estado "sin fuente confirmada (Q-NMTPP-12)".
- Nota fija: "El Observatorio no puede replicar este índice mientras la CRA no publique la normalización (Q-NMTPP-04)".
- Un prestador insular muestra "no aplica (zona insular)".

### V5 — Prestadores

Tabla de los 40 prestadores sintéticos con:
- nombre, segmento y subsegmento vigente;
- marca de gestor comunitario, y "optó por el S1" cuando aplica;
- departamento y número de APS;
- estudio inicial (fecha) y recálculo 2028 (en ventana o fuera);
- número de indicadores en cada familia de estados.

La tabla es ordenable por nombre, subsegmento y departamento; nunca por desempeño.

**Perfil del prestador (modal)**, con las secciones de RF-PORTAL-12 adaptadas:
1. Identificación y clasificación, en modo analista con el bloque ADO-02: subsegmento por regla de la Resolución, por regla del DT y declarado, y la marca de discrepancia.
2. APS con sus condiciones especiales y el régimen con que se evalúan.
3. Estados por indicador, en la tabla del catálogo.
4. Trayectorias.
5. ISE e incentivos (solo S1).
6. Tarifas por estrato y uso, dic-2026 contra ene-2027, con la variación por estrato y el referente del DT rotulado "estimación ex ante del regulador — no es meta ni tope" (+18,1 % en S1 y +6,1 % en gestores comunitarios).
7. En modo analista, regresiones frente a la línea base.

### V6 — Régimen especial

- Conteo de APS por condición (NMTPP-ESP-01): barras por INSULAR, IVH, IPM, PDET_ZOMAC y TOMA_POSESION.
- Tabla de APS especiales con el prestador, el segmento de origen y los estados evaluados con estándares del S2.
- Nota: "En estas APS se aplican los estándares del segundo segmento (art. 2.1.1.1.4.1); el IRCA ≤ 5 % no tiene excepción".

### V7 — Aclaraciones pendientes

Tabla de Q-NMTPP-01 a 14 con título, prioridad, fecha límite útil, estado (todas `abierta` en el escenario), responsable e indicadores bloqueados, más un enlace de texto a `specs/aclaraciones-regulatorias-nmtpp.md`. Una fila con fecha límite anterior a `fechaCorte` se marca como vencida en modo analista. Los títulos, prioridades y fechas se copian de la tabla de resumen del archivo de aclaraciones a un arreglo `ACLARACIONES` en `aclaraciones.js`; esta es la única excepción permitida al principio de datos externos, porque ese contenido no son parámetros regulatorios.

### V8 — Metodología

El visor de fichas muestra las 25 fichas como texto, con las marcas COMPLETA o PARCIAL. Acompaña un glosario resumido con los términos del componente definidos en `docs/glosario.md`.

### V9 — Datos

Descarga CSV UTF-8 de:
- prestadores;
- estados;
- ISE;
- tarifas;
- adopción por subsegmento.

La primera línea de cada archivo es el aviso SINTÉTICO. Las columnas incluyen `indicator_code`, `version` (1), `anio_tarifario`, `estado`, `origen_meta`, `articulo` y `q_bloqueante`.

## 5. Datos de entrada

- `window.CRA_NMTPP_PARAMS`: contenido literal de `parametros-res-1038.json`.
- `window.CRA_NMTPP_DATA.prestadores[]`, con estos campos:
  - identificación y clasificación: `provider_id`, `nombre`, `es_gestor_comunitario`, `opcion_s2_a_s1`, `segmento_vigente`;
  - subsegmentos: `subsegmento_calc_regla_mayor`, `subsegmento_calc_regla_acued`, `subsegmento_declarado`, `subsegmento_vigente`;
  - `departamento{codigo,nombre}` y `facturacion`;
  - `aps[]` con `service_area_id`, `divipola_code`, `municipio`, `condiciones_especiales[]`, `esquema_diferencial`, `regimen_evaluacion` (`S1` o `S2`), `unidad_continuidad`, `linea_base{}`, `metas_declaradas{indicador:{anio:valor}}` y `observados{"2027":{...}}`;
  - `estudios[]`, `tarifas[]`, `ise[]` e `incentivos[]`.
- `window.CRA_NMTPP_DATA.estados_esperados[]`, `regresiones_esperadas[]` y `adopcion_esperada{}`. Son el **oráculo** de las pruebas: el prototipo no los usa para pintar, porque su motor DEBE calcularlos (§6) y la prueba los compara.

## 6. Motor de estados (`motor_estados.js`)

Es la única lógica de evaluación, y DEBE producir exactamente los estados de `estados_esperados` para el año 2027. Notación:
- `v` = valor observado de la APS;
- `ac` = año calendario de cumplimiento = 2026 + `anio_cumplimiento` (año tarifario 1 = 2027);
- `md(k,a)` = meta declarada del indicador `k` para el año `a`.

1. **Sin dato.** Si `v` es null → `no reportó`. Excepción: CAL, que siempre queda en `sin fuente confirmada`, y PSH en subsegmentos distintos de S1-1, que queda en `no aplica`.
2. **CAL (S1 y S2).** `sin fuente confirmada`, con q = Q-NMTPP-06. Nunca se lee un valor.
3. **Metas absolutas por año** (MIC del S1 y del S2 residencial, MAC del S1 y del S2, PSH del S1-1), con estándar 100:
   - si a = ac: `meta cumplida` cuando v ≥ 100; si no, `meta no alcanzada en el año de cumplimiento`;
   - si a > ac: `meta cumplida` o `fuera de trayectoria`;
   - si a < ac: `meta cumplida` cuando v ≥ 100. Si no, en MIC se compara con md: `en trayectoria` cuando v ≥ md y `fuera de trayectoria` en caso contrario; sin md, `no exigible aún` con q = Q-NMTPP-08. En MAC y PSH el resultado es `no exigible aún`.
4. **Continuidad.** Con la bandera apagada: `meta pendiente de aclaración normativa`, con q = "Q-NMTPP-01, Q-NMTPP-02" en régimen S1 y "Q-NMTPP-02" en régimen S2. Con la bandera encendida, solo en régimen S1 y solo si hay línea base:
   - E = 97,26 × 24 / 100 h/día;
   - meta del año de cumplimiento = LB + p × (E − LB);
   - años anteriores: `no exigible aún` sin md;
   - año de cumplimiento: `meta cumplida` o `meta no alcanzada en el año de cumplimiento`.

   Las APS en régimen S2 siguen pendientes por Q-NMTPP-02.
5. **COB (S1).** `meta cumplida` si v ≥ 100. Si no, con md: `en trayectoria` cuando v ≥ md y `fuera de trayectoria` en caso contrario. Sin md: `meta no declarada`.
6. **PER (S1).**
   - Facturación bimestral: `meta pendiente de aclaración normativa`, con q = Q-NMTPP-07.
   - v ≤ 6: `meta cumplida`, con meta 6 y origen regulatorio.
   - Si no, con md: `en trayectoria` cuando v ≤ md y `fuera de trayectoria` en caso contrario. Sin md: `meta no declarada`.
7. **APS de prestador S1 con condición especial** (régimen S2, art. 2.1.1.1.4.1):
   - MIC: `meta cumplida` si v ≥ 100; si no, contra md como en la regla 5, y sin md `meta no declarada`;
   - MAC: `meta cumplida` si v ≥ 100; si no, `no exigible aún`;
   - CON: regla 4 con régimen S2.
8. **Regresión** (solo modo analista). Hay regresión si MIC, MAC, COB o CON bajan frente a la línea base, o si PER sube frente a ella.
9. El motor devuelve objetos con los campos de `estado_meta` de `modelo-datos.sql`.

## 7. Codificación visual de estados

| Estado | Color (ui-ux-design-standards) | Icono | Texto corto |
|---|---|---|---|
| meta cumplida | verde `#059669` | ✓ círculo | Meta cumplida |
| en trayectoria | azul `#0284c7` | ↗ flecha | En trayectoria |
| fuera de trayectoria | ámbar `#b45309` | ↘ flecha | Fuera de trayectoria |
| meta no alcanzada en el año de cumplimiento | rojo `#dc2626` | ✕ círculo | Meta no alcanzada (año de cumplimiento) |
| no exigible aún | gris `#64748b` | ⏳ | No exigible aún |
| no reportó | gris oscuro `#334155`, trama rayada | ⊘ | No reportó |
| meta no declarada | gris `#64748b`, borde discontinuo | ? | Meta no declarada |
| meta pendiente de aclaración normativa | azul hielo `#e0f2fe` con borde `#0b5e87` | § | Pendiente de aclaración (Q) |
| sin fuente confirmada | azul hielo `#e0f2fe` con borde discontinuo | ⓘ | Sin fuente confirmada |
| no aplica | blanco con borde gris | — | No aplica |

El rojo nunca se usa con la palabra "incumple" (Q-NMTPP-14).

## 8. Requisitos del prototipo

### RF-PROTO-01 — Motor de estados igual al oráculo

CUANDO el prototipo carga, `MotorEstados.evaluarTodo(2027)` DEBE producir un conjunto igual a `estados_esperados`, comparando `indicator_code`, `service_area_id`, `estado`, `meta_aplicada`, `origen_meta` y `q_bloqueante`. SI hay diferencias, ENTONCES el modo analista DEBE mostrar el aviso "motor ≠ oráculo: N diferencias" con la lista.

```gherkin
Escenario: Prestador con facturación bimestral
  Dado el prestador SINT-0014 con facturacion "bimestral" e IPUF 2027 reportado
  Cuando el motor evalúa NMTPP-S1-PER para 2027
  Entonces el estado es "meta pendiente de aclaración normativa"
  Y q_bloqueante es "Q-NMTPP-07"
```

### RF-PROTO-02 — Discrepancia de subsegmento visible

```gherkin
Escenario: Discrepancia por regla
  Dado el prestador SINT-0005 con 1.330 suscriptores de acueducto y 1.480 de alcantarillado
  Cuando el analista abre su perfil
  Entonces ve "S1-2 (regla de la Resolución)" y "S1-3 (regla del DT)"
  Y la marca "discrepancia de regla: Q-NMTPP-03"
  Y en modo ciudadano solo ve el subsegmento declarado con la nota "clasificación declarada por el prestador"
```

### RF-PROTO-03 — ISE sin ranking

```gherkin
Escenario: Intento de ordenar por ISE
  Dado la vista V4
  Cuando el usuario hace clic en el encabezado "ISE calculado"
  Entonces la tabla no cambia de orden
  Y el encabezado no tiene rol de botón ni aria-sort
```

### RF-PROTO-04 — Simulación de respuesta a Q-NMTPP-01

```gherkin
Escenario: Activar la equivalencia de continuidad
  Dado el modo analista y la bandera apagada
  Cuando el analista activa "Simular respuesta a Q-NMTPP-01 (solo prototipo)"
  Entonces los estados de NMTPP-S1-CON de APS en régimen S1 con línea base pasan a "no exigible aún" (2027 es anterior al año 3 y al año 5)
  Y cada uno lleva la marca "SIMULACIÓN"
  Y las APS en régimen S2 siguen en "meta pendiente de aclaración normativa"
```

### RF-PROTO-05 — Adopción coincide con el oráculo

CUANDO se renderiza V1, las cifras "E de U" de ADO-01 y ADO-04 por subsegmento DEBEN coincidir con `adopcion_esperada`.

### RF-PROTO-06 — Datos sintéticos siempre declarados

```gherkin
Escenario: Exportación de estados
  Dado la vista V9
  Cuando el usuario descarga "estados.csv"
  Entonces la primera línea del archivo es el texto de _meta.aviso
  Y la segunda línea es el encabezado de columnas
```

### RNF-PROTO-01 — Ejecución offline

El prototipo DEBE funcionar abriendo `index.html` directamente, sin red, con la excepción de Chart.js. Si Chart.js no carga, cada gráfica DEBE mostrar su tabla equivalente.

### RNF-PROTO-02 — Desempeño

Con los 40 prestadores sintéticos, el cambio de filtro DEBE repintar la vista activa en menos de 300 ms en un portátil institucional.

> **ASUNCIÓN (sin validar):** 300 ms; no hay medición de referencia. Recalibrar con el primer despliegue.

## 9. Pruebas de aceptación (`test_nmtpp_prototipo.ps1`)

Siguen el patrón `Assert-Check` de `app_observatorio_nmt/test_nmt_mvp.ps1`:

1. Existen `index.html`, `js/app.js`, `js/motor_estados.js` y `data/datos-sinteticos-prototipo.js`.
2. El archivo de datos contiene `"sintetico": true` y el texto del aviso.
3. `js/*.js` no contiene los literales de metas `97.26`, `86.3`, `11.82`, `11.68`, `11.41` ni `11.35` (INV-02). Se permite el 24 de la conversión de horas.
4. No existe ningún campo `tarifa_promedio` (INV-08).
5. Ninguna cadena de estado fuera del catálogo de RN-NMTPP-03 aparece en `motor_estados.js`.
6. `index.html` contiene el banner SINTÉTICO y la leyenda de RN-NMTPP-05.
7. Hay 40 prestadores y 239 estados esperados.
8. `ise_incentivos.js` no contiene `sort(` sobre campos del ISE (INV-04).
9. En `motor_estados.js`, ninguna rama asigna a IRCA un estado distinto de `sin fuente confirmada` (INV-05).

Las pruebas 1 a 9 son estáticas. RF-PROTO-01 y RF-PROTO-05 se verifican en el navegador con el aviso del modo analista.

## Fuera de alcance de esta spec

Conexión real al SUI y a Oracle; autenticación de prestadores; ventana de revisión previa (RF-PORTAL-10); alcantarillado; pilas públicas; vista de esquemas diferenciales; mapa. El mapa real de Colombia de `ui-ux-design-standards.md` se deja para la integración con el portal: las divipolas sintéticas no existen.

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-PROTO-01 | ¿El prototipo se muestra a prestadores o solo a funcionarios de la CRA? Si lo ven prestadores, el aviso SINTÉTICO debe reforzarse con una marca de agua | Presentación | Subdirección Técnica de Regulación |
| Q-PROTO-02 | ¿Se confirma el puerto 8081 para no chocar con `app_observatorio_nmt` (8080)? | `server.ps1` | CIO |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-18 | Versión inicial | Spec del componente NMTPP; convenciones de `app_observatorio_nmt/` |
