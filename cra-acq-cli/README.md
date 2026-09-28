# cra-acq-cli — Motor de Adquisición de Datos del Observatorio Regulatorio CRA

Herramienta de línea de comandos para la extracción, validación criptográfica, sanitización y persistencia inmutable de datos desde fuentes oficiales externas (SUI, DANE, INS), conforme a la arquitectura `ADR-0008` (Modo Asistido por Operador).

---

## Características Principales

1. **Autenticación Interactiva Segura:** Cero contraseñas en código o disco.
2. **Chunking y Checkpoints (`RF-SUI-10`):** Soporta sesiones interrumpibles ante el límite de 4 horas de VPN.
3. **Cripto-Linaje (`RF-SUI-02`):** Hashing SHA-256 de consultas SQL y de los conjuntos de datos extraídos.
4. **Detector de Variación de Esquema (`RF-SUI-06`):** Detección automática de columnas agregadas, eliminadas o renombradas en el SUI.
5. **Sanitizador PII (`RN-SUI-04`):** Supresión en memoria de datos sensibles de suscriptores y personas naturales.
6. **Escritura Parquet en OCI Object Storage (`ADR-0007`):** Almacenamiento inmutable en la zona cruda con metadatos incrustados.

---

## Comandos Disponibles

- `cra-acq ping`: Verifica conectividad con SUI Oracle y OCI Object Storage.
- `cra-acq list-queries`: Muestra el catálogo de consultas versionadas con sus huellas SHA-256.
- `cra-acq run`: Ejecuta un proceso de adquisición para una fuente, dominio y periodo.
- `cra-acq resume`: Reanuda un lote interrumpido a partir de su último punto de control.
- `cra-acq status`: Consulta el estado de un lote de ingesta.
