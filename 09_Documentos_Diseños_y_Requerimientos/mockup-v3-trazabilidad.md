---
id: mockup-v3-trazabilidad
tipo: insumo-de-diseno
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-14
fuentes: [specs/portal-publico.md, 05_Bateria_de_Indicadores/catalogo-v1.md, adr/ADR-0005, adr/ADR-0009, adr/ADR-0010, adr/ADR-0011, adr/ADR-0012, 09_.../Analisis_Alineacion_Propuesta_Mockup_vs_Context_Lake.md]
---

# Mockup v3 — trazabilidad a requisitos

Acompaña a `mockup_observatorio_cra_v3.html`. Un mockup ilustra; `specs/portal-publico.md` especifica. Esta nota registra qué exige cada pantalla y qué quedó como asunción, para que nadie tome la maqueta como fuente de requisitos.

Datos, prestadores y municipios son **simulados** (regla de oro 8). Los prestadores nombrados son ficticios.

## Qué cambió frente al v2

El v3 se construyó sobre el backlog de la sección 8 del análisis de la carpeta `09_` y sobre las decisiones del 2026-09-14 (`ADR-0009` a `ADR-0012`).

| # backlog | Cambio | Brechas que cierra | Requisitos |
|---|---|---|---|
| 1 | Marca corta "Observatorio CRA" y lema en portada y menús; nombre canónico en fichas, metadatos, API y pie | B-17 | `ADR-0009`, `RN-PORTAL-08` |
| 2 | Cuatro cifras destacadas solo del catálogo (IND-COB-01, IND-CON-01, IND-PER-01, IND-ASE-01), cada una con semáforo, motivo en una línea, fecha de corte, cobertura de reporte y enlace a ficha | B-02, B-14, B-16 | `RF-PORTAL-02`, `RF-PORTAL-14` |
| 3 | Componente **Prestadores** nuevo: buscador por nombre o ID SUI, perfil con segmento, servicios, APS, grupo comparable (n=38), banda de incertidumbre y estados "no reportó", "en revisión", "en objeción" | **B-01** | `ADR-0005`, `RF-PORTAL-10/11/12`, `RF-BENCH-01/03/06` |
| 4 | Perfil territorial sin barras 0–100 ni puntajes; sin "tarifa promedio"; función de agregación y cobertura de reporte declaradas por cifra | B-03, B-04, B-05, B-15 | `RF-PORTAL-13`, `RF-ONTO-09`, `ADR-0012`, `RN-PORTAL-04/05` |
| 5 | Filtros de segmento y APS añadidos; el selector territorial resuelve por `divipola_code` | B-07 | `RF-ONTO-05`, `RF-ONTO-06` |
| 6 | Estados de ausencia visibles: "sin reporte del prestador para el periodo", "dato en revisión por el curador", "no publicable por cobertura", "no aplicable en V1" | B-08 | `RF-PORTAL-06`, `RF-PORTAL-11` |
| 7 | Datos abiertos con columnas `quality_flag`, `version_ficha`, `cobertura_reporte` y fecha de generación; API con ejemplo de consulta y respuesta | B-10 | `RF-PORTAL-03`, `RF-PORTAL-04` |
| 8 | Sección "Transparencia del dato": informe de calidad del periodo e historial público de correcciones (incluye el caso 42,1 % → 39,8 % y un valor retirado) | B-09, B-11 | `RF-CAL-06`, `RF-PORTAL-07`, `RN-PORTAL-03` |
| 9 | "Impacto y regulación" pasa a "Regulación y seguimiento"; el paso 6 de la cadena es "Seguimiento de resultados" | B-19 | no-objetivos de `docs/business_context.md` |
| 10 | Íconos SVG con texto alternativo, semáforo con forma y texto además de color, sin animación continua, tabla equivalente bajo la gráfica, menú operable en móvil, foco visible | B-12 | `RF-PORTAL-05`, Resolución MinTIC 1519 de 2020 |
| 11 | El espacio Power BI se marca como "exploración analítica · no es fuente oficial", con espejo descargable exigido | B-06 | `ADR-0010`, `RF-PORTAL-16` |
| 12 | Aviso de datos simulados permanente; versión y fecha del mockup en el pie | — | regla de oro 8 |

Además: las dimensiones de navegación son las **diez de la ontología**, no cinco ni ocho; territorio, tendencias y mercado dejan de presentarse como dimensiones (B-13, `RN-ONTO-01`). El micrositio se maqueta dentro de la sede electrónica (`ADR-0011`) y los contenidos editoriales se firman como Equipo Editorial Observatorio (`RF-PORTAL-15`, `RN-PORTAL-07`), lo que cubre B-20.

## Escenarios de las specs representados literalmente

| Escenario | Dónde se ve en el mockup |
|---|---|
| `RF-PORTAL-14` — cifra con cambio de versión de ficha no muestra variación | Cifra destacada IND-PER-01: "sin variación comparable: cambio metodológico en la versión 2" |
| `RF-PORTAL-06` — prestador sin reporte no muestra cero | Serie del IANC, periodo 2025-09; perfil de Aguas de Riosur, IND-COB-01 |
| `RF-PORTAL-12` — perfil con indicador en objeción y sin ranking | Perfil de Aguas de Riosur: IND-PER-01 en objeción con valor visible; panel "sin puntaje ni posición en ranking" |
| `RF-PORTAL-12` — prestador fuera de la fase vigente sigue en el buscador | Acueducto Comunitario Vereda La Esperanza: "indicadores desde la Fase B" |
| `RF-PORTAL-13` — municipio con dos prestadores, uno sin reporte | Territorios, caso 1: agregado no publicable con cobertura de reporte 70 % y descomposición 70/30 |
| `RF-PORTAL-13` — comparación con departamento y nacional | Territorios, caso 2: tres niveles con la misma función y versión de ficha |
| `RF-PORTAL-07` — corrección de un valor publicado | Historial público: IND-ASE-01 de 42,1 % a 39,8 % |
| `RF-PORTAL-16` — exploración sin espejo descargable no se incrusta | Bloque de exploración analítica |
| `RN-PORTAL-06` — índice de riesgo no se presenta como "calidad" | IND-CAL-01: IRCA sin valor, con aviso de que mayor es peor |
| Caso borde: ruptura de versión a mitad de serie | Gráfica del IANC: la serie no se empalma a través de v1 → v2 |

## Asunciones declaradas en la maqueta

| ID | Asunción |
|---|---|
| `Q-GOB-04` | Marca corta "Observatorio CRA" y lema "Datos abiertos para que el agua y el aseo lleguen a todos" — propuestos en `ADR-0009`, sin ratificar por Dirección Ejecutiva |
| `Q-ONTO-06` | Umbral de cobertura de reporte 80 % y peso material 5 % para bloquear un agregado |
| `Q-ONTO-07` | Función de agregación asignada por indicador, sin ratificar ficha por ficha |
| `Q-CAT-01` | IRCA sin canal formal con el INS: `IND-CAL-01` se maqueta en el catálogo pero sin valor |
| `Q-PORTAL-05` | Plazo de la ventana de revisión previa del prestador |
| `Q-PORTAL-07` | Ruta exacta, sistema de contenidos y administrador de la sede |
| `Q-PORTAL-08` / `Q-ARQ-10` | Cierre de la fase híbrida y frontera exacta propio / Power BI |
| `Q-PORTAL-03` / `Q-PORTAL-04` | Llave de uso de la API y umbral de supresión de celdas pequeñas |
| Cifras | Todos los valores, prestadores, municipios y fechas son simulados y no provienen del SUI |

## Pendiente de orden en el Context Lake

En Drive coexisten tres archivos llamados `portal-publico.md` (un Documento de Google del 2026-09-14 15:51, el `.md` vigente del 18:27 y uno del 2026-09-13 que no quedó renombrado `*.superseded-20260914`) y dos `ADR-0010` (Documento de Google y `.md`). Conviene dejar una sola copia vigente por archivo para que un agente no lea la versión equivocada.

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-14 | Mockup v3 y esta nota de trazabilidad | Sesión con Camilo Carvajalino, sobre el backlog de la sección 8 y `ADR-0009` a `ADR-0012` |
