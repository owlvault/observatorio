# Changelog

Versionado semántico. MAJOR: cambio de estructura o de identificadores. MINOR: nuevas entidades o fuentes. PATCH: correcciones de contenido sin cambio de esquema.

## [0.2.0] - 2026-09-14
- Empaquetado como Frictionless Data Package con Table Schema, llaves foráneas y vocabularios SKOS.
- Nueva entidad `documento_tecnico` y nivel `variable_formato` (844 campos de 9 documentos SSPD/MVCT).
- Nuevas entidades `linaje` y `registro_calidad` (ISO/IEC 25012).
- Columnas `estado_vigencia` (norma, formato), `calidad_correspondencia`, `requiere_validacion`, `clasificacion_sensibilidad` (propuesta).
- Nombres con mojibake normalizados (H7); original conservado en el JSON fuente.
- Deduplicadas 2 filas de variables artefacto de extracción (H14).
- `variable_tabla` y `dominio_valor` definidas y vacías a propósito.

## [0.1.0] - 2026-09-03
- Primera extracción del portal SUI: 6 servicios, 76 normas, 392 formatos, 129 tablas, 212 relaciones formato→tabla. Entregada como JSON, DDL PostgreSQL, XLSX, DOCX y HTML.
