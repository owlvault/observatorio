---
id: runbook-extraccion-diccionario-fisico-sui
tipo: runbook
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-16
fuentes: [diagnostico-completitud-sui-vs-bateria-2026-09-16.md (acción P1, Q-DIC-01), diccionario_sui_cra_v0.2.0 (README, reglas R2 y R3)]
---

# Extracción del diccionario físico del SUI y comparación con el lake

Ejecuta la acción **P1** del diagnóstico de completitud. Primero lee el catálogo físico real del SUI en Oracle con el usuario de consulta (VPN) y luego lo compara con el diccionario del lake (`diccionario_sui_cra_v0.2.0`), en tres niveles: tabla, relación formato → tabla y variable → columna.

## Qué NO hace (salvaguardas)

- **No lee datos de prestadores ni de suscriptores.** Solo consulta vistas de catálogo (`ALL_*`). `NUM_ROWS` sale de las estadísticas del optimizador, así que no se ejecuta ningún `COUNT(*)` sobre tablas de negocio.
- **No escribe en Oracle.** Todo son `SELECT`.
- **No llena `variable_tabla`** (regla R3 del README del lake). El cruce variable → columna sale como `candidato-pendiente-steward`, con método y puntaje. Solo lo aprueba el steward del dominio o lo confirma el catálogo interno de la SSPD (script 06).

## Scripts

| # | Archivo | Dónde corre | Qué produce | Tiempo esperado |
|---|---|---|---|---|
| 01 | `01_privilegios_y_entorno.sql` | Oracle | Versión, privilegios, roles y visibilidad de `ALL_TAB_COLUMNS`/`ALL_COL_COMMENTS`. Responde **Q-DIC-01** | Segundos |
| 02 | `02_descubrir_esquemas.sql` | Oracle | `OWNER` de las 129 tablas del lake, tablas `CAR_*` que el lake no conoce (H9), sinónimos, **tablas candidatas IUS y de cargue AA 2024** por firma de siglas, y tablas de metadatos internos del SUI | Minutos (el bloque 5 recorre `ALL_TAB_COLUMNS`) |
| 03 | `03_extraer_catalogo_fisico.sql` | Oracle | 6 CSV: `oracle_tablas`, `oracle_columnas`, `oracle_restricciones`, `oracle_sinonimos`, `oracle_dependencias`, `oracle_metadatos_sui` | Minutos |
| 04 | `04_comparar_en_oracle.sql` | Oracle | Contraste rápido por tabla: estado de las 129 tablas del lake y de las 32 candidatas de la batería, más alertas H5 | Segundos |
| 05 | `05_comparar_duckdb.sql` | DuckDB local | Comparación completa por tabla, formato y variable, más el recurso `columna_fisica_observada` propuesto para la v0.3 | Segundos |
| 06 | `06_plantilla_metadatos_sui.sql` | Oracle | Plantilla para exportar el catálogo interno formato → tabla → campo del SUI, si 02 lo encuentra | Segundos |

## Procedimiento

1. **Conectarse** por VPN con SQL Developer (modo script, F5) o con SQLcl.
   - En SQL*Plus 12.2+ hay que reemplazar `SET SQLFORMAT CSV` por `SET MARKUP CSV ON QUOTE ON` en los scripts 03 y 06.
2. **Ejecutar 01.**
   - Si `ALL_TAB_COLUMNS` muestra columnas de tablas `CAR_*`, continuar.
   - Si solo hay sinónimos, continuar: 02 y 03 los resuelven.
   - Si no se ve nada, detenerse y pedir el privilegio a la SSPD dentro del oficio H1.
3. **Ejecutar 02.** Anotar los `OWNER` de los bloques 1, 2, 5 y 7.
4. **Editar `DEFINE esquemas`** en 03 y 04 con esos `OWNER`. Ejemplo: `"'SUI_AAA','SUI_IUS'"`. Luego ajustar `DEFINE dir_salida`.
5. **Ejecutar 04** para ver el panorama, y después **03** para exportar.
6. **Armar la carpeta de comparación** en el equipo local:
   ```
   comparacion/
     lake/     <- data/*.csv de diccionario_sui_cra_v0.2.0
               <- matriz_trazabilidad_indicadores_sui.csv
     oracle/   <- los 6 oracle_*.csv del paso 5
     salida/   <- vacía
   sql/        <- estos scripts
   ```
7. **Ejecutar 05** desde `comparacion/`:
   ```
   duckdb comparacion.duckdb < ../sql/05_comparar_duckdb.sql
   ```
8. **Si 02 (bloque 7) encontró tablas de metadatos internos**, completar y ejecutar 06. Esa es la fuente válida para `variable_tabla`.

## Salidas de la comparación (`salida/`)

| Archivo | Contenido | Uso |
|---|---|---|
| `resumen_comparacion.csv` | 16 métricas: tablas coincidentes, no encontradas, físicas fuera del lake, alertas H5, % de columnas comentadas, candidatas IUS, variables con columna candidata y efecto sobre la batería | Informe a Dirección Técnica |
| `cmp_tabla.csv` | Una fila por tabla con estado (`coincide`, `coincide_por_sinonimo`, `solo_lake_no_encontrada`, `solo_oracle_car_no_catalogada`, `solo_oracle_otra`), número de columnas, % comentado, **granularidad por PK**, filas estimadas y alerta de descripción (H5) | Cierra H1/H5 y aporta evidencia a H9 |
| `cmp_formato_tabla.csv` | Las 212 relaciones formato → tabla del lake, con la existencia física de la tabla | Validar linaje declarado |
| `ora_candidatas_ius.csv` | Tablas físicas con 4 o más siglas del IUS | Cierra B-DIC-02 y H18 |
| `puente_candidato.csv` | Hasta 3 columnas candidatas por variable, con método (M1 sigla exacta, M2 nombre normalizado, M3 comentario similar, M4 nombre similar), puntaje y confianza | Revisión del steward |
| `cmp_bateria_tablas.csv` | Estado físico de las tablas candidatas por indicador | Actualizar el diagnóstico |
| `cmp_bateria_variables.csv` | Nivel de linaje por variable requerida: pasa a `N5-candidato` cuando hay columna | Actualizar la matriz de la batería |
| `columna_fisica_observada.csv` | Catálogo físico con los campos de `variable_tabla` (sin `id_variable_formato`) | Recurso nuevo para el paquete v0.3 |

## Cómo leer el puente candidato

| Método | Regla | Puntaje en ámbito / fuera de ámbito |
|---|---|---|
| M1 `sigla_exacta` | La sigla declarada en el nombre (`…_VTAP`, `NS_ACPUC`) es la columna o su sufijo. Se anulan siglas genéricas (ID, COD, DANE…) | 0,95 / 0,75 |
| M2 `nombre_normalizado` | Nombre sin tildes ni signos = nombre de columna | 0,90 / 0,70 |
| M3 `comentario_similar` | Jaro-Winkler ≥ 0,88 entre el nombre de la variable y el comentario de la columna | 0,85 × similitud |
| M4 `nombre_similar` | Jaro-Winkler ≥ 0,85 entre el nombre de la variable y el nombre de la columna | 0,75 × similitud |

**Ámbito** son las tablas del formato catalogado de la variable (`formato_tabla`) o, para variables IUS sin formato catalogado, las tablas candidatas IUS. La confianza es **alta** desde 0,90 y **media** desde 0,75. Todo lo demás es **baja** y no debe usarse sin revisión.

## Verificación hecha antes de entregar

- Los scripts Oracle (01–04) se analizaron sintácticamente en dialecto Oracle con `sqlglot`: 22 de 22 sentencias válidas. Se retiraron los `;` y `&` de los comentarios y se activó `SQLBLANKLINES`, para que SQL*Plus no corte ni pida variables por error.
- El script 05 corrió de punta a punta en DuckDB 1.5 con el paquete real del lake y **exportaciones Oracle simuladas**: tablas eliminadas, un sinónimo, 4 tablas no catalogadas y una tabla IUS sintética. Detectó cada caso sembrado.
- **Aún no se ha ejecutado contra el SUI real.** Los nombres de esquema, los privilegios y la versión del motor se confirman con 01 y 02.

## Riesgos y supuestos

- **Visibilidad parcial.** `ALL_*` muestra solo lo que el usuario puede consultar. Si faltan tablas, el estado `solo_lake_no_encontrada` puede significar "sin privilegio" y no "no existe". El bloque 5 de 01 permite distinguirlo.
- **Estadísticas desactualizadas.** `NUM_ROWS` y `LAST_ANALYZED` dependen de la recolección de estadísticas de la SSPD y son orientativos.
- **Nombres físicos crípticos.** Si las columnas no tienen comentarios, M3 no aplica y la cobertura del puente bajará. En ese caso, el catálogo interno (06) o el oficio a la SSPD es la vía.
- **Datos personales.** `oracle_columnas.csv` contiene solo metadatos. Aun así, las columnas marcadas `restringido-propuesto` en el lake (NUIS, dirección, predial) no deben consultarse con datos reales fuera de la zona restringida (B-DIC-09).
