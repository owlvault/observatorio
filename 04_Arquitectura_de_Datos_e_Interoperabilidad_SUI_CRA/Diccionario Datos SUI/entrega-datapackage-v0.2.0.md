# Diccionario de datos regulatorio del SUI · universo CRA

**Versión 0.2.0 · 2026-09-14 · corte de extracción 2026-09-03**

Paquete de metadatos de la capa `sui_meta`: qué norma exige qué formato, en qué tabla física del SUI aterriza y, donde ya fue documentado por la SSPD, qué variables lo componen. Está empaquetado como un [Frictionless Data Package](https://datapackage.org) (`datapackage.json` + CSV UTF-8 + vocabularios SKOS) para que lo consuman directamente pipelines, catálogos de datos y herramientas de calidad sin depender de una suite propietaria.

## Cómo leer este paquete

La **fuente de verdad es `datapackage.json`**: declara cada recurso, su esquema (Table Schema), llaves primarias y foráneas, y las restricciones de dominio. Excel, Word, HTML y el DDL PostgreSQL son vistas derivadas y no deben editarse a mano.

| Recurso | Filas | Qué es |
|---|---:|---|
| `servicio` | 6 | Servicios y ejes de reporte del universo CRA |
| `norma` | 76 | Normas registradas en el portal SUI, con `estado_vigencia` |
| `norma_servicio` | 103 | Cobertura norma → servicio (solo servicios CRA) |
| `formato` | 392 | Catálogo de formatos del portal. **Cifra piso** (H9) |
| `formato_servicio` | 1063 | Cobertura formato → servicio |
| `tabla_sui` | 129 | Tablas físicas del SUI. Columnas no disponibles (H1) |
| `formato_tabla` | 212 | Relación de carga formato → tabla |
| `documento_tecnico` | 9 | Anexos e instructivos SSPD/MVCT, fuente del nivel variable |
| `variable_formato` | 844 | Campos por formato según documento técnico (ISO 11179 *data element*) |
| `variable_tabla` | 0 | Columnas físicas. **Definida y vacía a propósito** (H1, H10) |
| `dominio_valor` | 0 | Tablas de codificación. Reservada para v0.3 (93 códigos pendientes de incorporar) |
| `linaje` | 654 | Aristas norma → formato → tabla → variable con calidad del eslabón |
| `registro_calidad` | 14 | Hallazgos H1–H14 en dimensiones ISO/IEC 25012 |

Los vocabularios controlados están en `vocab/*.ttl` (SKOS): dominio funcional, servicio, tipo de reporte, estado de vigencia, tipo de dato, obligatoriedad, calidad de correspondencia y clasificación de sensibilidad. Los literales originales de los documentos se conservan siempre en columnas `*_declarado`; la normalización va en columnas `*_normalizado`.

## Tres reglas de uso que no admiten excepción

1. **Filtrar `variable_formato` por `calidad_correspondencia = exacta`** antes de relacionar variables con formatos del catálogo (H11). Solo 50 de 844 variables cruzan por nombre exacto; el resto pertenece a formatos que el portal no cataloga o cuyo nombre difiere.
2. **Tratar `requiere_validacion = true` como no verificado** (H12). 373 variables provienen de lectura asistida del PDF y deben contrastarse con el documento antes de usarse en un acto administrativo. `pagina` y `id_documento` permiten ir a la fuente.
3. **No inferir el puente variable → columna.** `variable_tabla` se llenará únicamente con el catálogo de metadatos que entregue la SSPD. Fusionar `variable_formato` con `tabla_sui` por nombre produce un mapeo inventado.

## Vigencia normativa

`formato.estado_vigencia` distingue cuatro estados y **nunca reasigna silenciosamente**: 113 formatos siguen atribuidos a la Res. SSPD 20094000015085 de 2009 (derogada) porque así lo declara el portal; la norma vigente depende del dominio (ver `registro_calidad`, H2) y la reasignación requiere certificación de la SSPD, solicitada en el oficio de información entre autoridades.

## Gobierno del dato

Marco aplicado: ISO/IEC 11179 (elementos de dato con definición, dominio y representación separados del concepto), DAMA-DMBOK (steward, custodio, clasificación, ciclo de vida), ISO/IEC 25012 (dimensiones de calidad), DCAT y lineamiento de datos abiertos de MinTIC (Res. 1519 de 2020) para el catálogo, SKOS para vocabularios, Ley 1581 de 2012 para datos personales.

| Rol | Asignación |
|---|---|
| Publicador | CRA · Oficina TIC |
| Custodio técnico | Oficina TIC CRA |
| Steward de negocio | **Por asignar por dominio funcional** (12 dominios en `vocab/dominio_funcional.ttl`). Sin steward, ninguna clasificación de sensibilidad ni reasignación normativa se considera aprobada. |
| Fuente autoritativa | SSPD (SUI). La CRA documenta; no redefine. |

**Clasificación de sensibilidad.** `clasificacion_sensibilidad` es una *propuesta* por heurística de nombre (54 variables marcadas como posible dato personal: NUIS, dirección, número predial, nombre, contacto, identificación). Requiere confirmación del steward antes de publicar cualquier dato bajo estas variables (H13).

**Identificadores.** `id_norma` e `id_formato` son los identificadores del portal SUI y no se renumeran. `id_variable` es un hash estable de (documento, formato, orden, nombre); sobrevive a cambios de descripción y cambia solo si cambia la identidad del campo. `nombre_tabla` es el nombre físico.

**Vigencia de registros.** Las columnas `valido_desde` / `valido_hasta` existen en todas las entidades maestras y están vacías en esta versión: se poblarán cuando la SSPD certifique la vigencia por formato. Un valor vacío es explícito, nunca inferido.

## Verificación

```
frictionless validate datapackage.json
```
Resultado de esta versión: 13 recursos VALID, integridad referencial completa, 0 errores (ver `VALIDACION.txt`).

## Qué falta (v0.3)

Incorporar `dominio_valor` (93 códigos) y la dimensión de esquemas de BD (90 esquemas, 521 relaciones esquema → formato, 407 formatos no catalogados); completar el barrido de identificadores de formato hasta 6097; poblar `variable_tabla` con la respuesta de la SSPD; validar contra PDF las 373 variables de lectura asistida; asignar stewards y confirmar clasificación de sensibilidad.

## Regeneración

`export.py` construye el paquete completo a partir de `diccionario_sui_cra.json` y `variables_sui_aaa.tsv`. Todo conteo de este README proviene del mismo script, por lo que no puede divergir de los datos.
