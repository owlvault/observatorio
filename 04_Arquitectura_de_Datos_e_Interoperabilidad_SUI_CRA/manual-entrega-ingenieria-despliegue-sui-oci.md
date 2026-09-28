---
id: manual-entrega-ingenieria-sui-oci
tipo: manual_tecnico_entrega
proyecto: observatorio-regulatorio-cra
estado: aprobado
version: 1.0.0
fecha: 2026-09-28
autor: Equipo de Arquitectura de Datos & Inteligencia Regulatoria
dirigido_a: [Ingeniería de Sistemas CRA, Administradores de Base de Datos DBA, Especialistas de Redes e Infraestructura]
fuentes: [adr/ADR-0006, adr/ADR-0007, adr/ADR-0008, specs/ingesta-sui-y-fuentes.md, 04_.../arquitectura-motor-adquisicion-datos.md]
---

# Manual de Entrega a Ingeniería: Despliegue de Infraestructura y Conexión SUI / OCI ADB
**Observatorio Regulatorio de Agua Potable y Saneamiento Básico — CRA**

---

## 1. Propósito y Alcance del Entregable

Este documento técnico contiene las instrucciones detalladas, scripts ejecutables, configuraciones de red y parámetros de seguridad necesarios para que el equipo de **Ingeniería de Sistemas, Infraestructura y Administración de Bases de Datos (DBA) de la CRA** implemente, configure y certifique la conectividad del **Motor de Adquisición de Datos (`cra-acq-cli`)** con:
1. La base de datos relacional Oracle productiva del **Sistema Único de Información (SUI)** administrada por la Superintendencia de Servicios Públicos Domiciliarios (SSPD), vía túnel VPN site-to-person ([`ADR-0006`](../adr/ADR-0006-acceso-sui-consulta-directa.md), [`ADR-0008`](../adr/ADR-0008-ingesta-asistida-por-operador.md)).
2. La **Autonomous Database (ADB)** de la CRA en Oracle Cloud Infrastructure (OCI) para el esquema de control y linaje `raw_control` ([`ADR-0004`](../adr/ADR-0004-despliegue-sobre-oci.md), [`ADR-0007`](../adr/ADR-0007-topologia-datos-oci.md)).
3. El Bucket de **OCI Object Storage** (`cra-observatorio-raw`) para la persistencia inmutable Parquet a 10 años.

---

## 2. Inventario de Artefactos Entregados

| Componente | Ubicación en el Repositorio | Descripción / Uso |
|---|---|---|
| **Software CLI del Extractor** | [`cra-acq-cli/`](../cra-acq-cli) | Paquete Python 3.12 con CLI Typer, oracledb, PyArrow y suite de pruebas pasando al 100%. |
| **Script DBA Creación Usuario ADB** | [`04_.../00_crear_usuario_y_esquema_raw_control.sql`](00_crear_usuario_y_esquema_raw_control.sql) | Script SQL para crear el usuario de servicio `raw_control` y sus grants en ADB. |
| **Script DDL Tablas de Control** | [`04_.../ddl_raw_control_schema.sql`](ddl_raw_control_schema.sql) | Tablas de lotes (`ingestion_batch`), checkpoints, datasets inmutables y retransmisiones. |
| **Diagnóstico Automatizado (Python)** | [`cra-acq-cli/scripts/diagnostico_ingenieria_sui_oci.py`](../cra-acq-cli/scripts/diagnostico_ingenieria_sui_oci.py) | Prueba automática de 5 puntos: TCP SUI, Oracle SUI, tablas maestras, ADB y Object Storage. |
| **Diagnóstico Rápido (PowerShell)** | [`cra-acq-cli/scripts/validar_entorno_ingenieria.ps1`](../cra-acq-cli/scripts/validar_entorno_ingenieria.ps1) | Script PowerShell de verificación de red, enrutador VPN y ejecución de pruebas. |
| **Plantilla de Variables de Entorno** | [`cra-acq-cli/config/env.template`](../cra-acq-cli/config/env.template) | Variables de host, puertos, wallets y parámetros de ejecución. |
| **Plantilla de Resolución TNS** | [`cra-acq-cli/config/tnsnames.ora.template`](../cra-acq-cli/config/tnsnames.ora.template) | Definición de alias TNS para Oracle SUI y ADB. |

---

## 3. Topología de Red y Conectividad con la SSPD

```
┌─────────────────────────────────┐                    ┌───────────────────────────────────┐
│     Estación Operador (CRA)     │                    │          SSPD (Red SUI)           │
│  - Python 3.12 + cra-acq-cli    │   Túnel SSL-VPN    │  - Gateway VPN SSPD               │
│  - IP Virtual VPN: 10.x.x.x     │===================>│  - Oracle Listener (Port 1521)    │
│  - OCI CLI / HTTPS a OCI Cloud  │   (Site-to-Person) │  - Oracle DB: <SERVICIO_SUI>      │
└────────────────┬────────────────┘                    └───────────────────────────────────┘
                 │
                 │ HTTPS / TLS (mTLS Port 1522)
                 ▼
┌──────────────────────────────────────────────────────┐
│             Oracle Cloud Infrastructure              │
│  - OCI Autonomous Database (Esquema raw_control)     │
│  - OCI Object Storage Bucket: cra-observatorio-raw   │
└──────────────────────────────────────────────────────┘
```

### Ficha Técnica de Conexión a la SSPD
- **Protocolo de Enlace:** VPN IPSec / SSL-VPN Site-to-Person (FortiClient o Cisco AnyConnect según asignación SSPD).
- **Servidor Oracle SUI:** Hostname interno o IP provista por la SSPD (ej. `sui.sspd.gov.co` o `<HOST_SUI>`).
- **Puerto de Listener:** `1521` (TCP estándar Oracle).
- **Service Name:** `<SERVICIO_SUI>` (o el servicio autorizado por la Oficina de Informática de la SSPD).
- **Restricción de Ventana:** Máximo **4 horas continuas** de sesión por día hábil.
- **Tipo de Acceso:** Usuario nominal con permisos de solo lectura (`SELECT`) sobre tablas y vistas autorizadas.

---

## 4. Guía de Despliegue en OCI (Paso a Paso para DBA y Cloud Admin)

### Paso 4.1: Aprovisionamiento en OCI Autonomous Database (ADB)

1. Conectarse a la Autonomous Database de la CRA utilizando **SQL Developer** o **SQLcl** con el usuario administrador corporativo (`ADMIN`).
2. Abrir y ejecutar el script [`00_crear_usuario_y_esquema_raw_control.sql`](00_crear_usuario_y_esquema_raw_control.sql):
   - Modifique la contraseña temporal por una contraseña segura administrada en OCI Vault.
   - Valide que el tablespace asignado sea el predeterminado (`DATA`).
3. Cerrar la sesión `ADMIN` y conectarse a la base de datos con el nuevo usuario de servicio:
   - **Usuario:** `raw_control`
   - **Servicio:** `cra_observatorio_high` (o `cra_observatorio_medium`).
4. Abrir y ejecutar el script [`ddl_raw_control_schema.sql`](ddl_raw_control_schema.sql):
   - Verifica la creación de las tablas:
     - `raw_control.ingestion_source` (incluye inserción de fuentes semilla: SUI, DANE, INS, CRA).
     - `raw_control.ingestion_batch`
     - `raw_control.ingestion_checkpoint`
     - `raw_control.raw_dataset`
     - `raw_control.raw_change_log`
   - Verifica la creación de índices B-Tree para optimizar búsquedas por periodo y hashes SHA-256.
5. Descargar el archivo zip del **Oracle Client Wallet** (credenciales mTLS) desde la consola OCI de la base de datos y entregarlo de forma segura al operador de la estación.

---

### Paso 4.2: Aprovisionamiento en OCI Object Storage (Zona Cruda)

1. Ingresar a la consola de OCI $\to$ **Storage** $\to$ **Buckets**.
2. Seleccionar el compartimento del Observatorio: `cmp-observatorio-regulatorio`.
3. Crear el Bucket:
   - **Bucket Name:** `cra-observatorio-raw`
   - **Default Storage Tier:** `Standard`
   - **Encryption:** Encrypt using Oracle Managed Keys (o Master Encryption Key en OCI Vault).
   - **Emit Object Events:** Habilitado (para trazabilidad en OCI Events service).
4. Configurar la Regla de Retención Inmutable WORM ([`RNF-SUI-02`](../specs/ingesta-sui-y-fuentes.md#L222)):
   - En la pestaña **Retention Rules** del bucket, hacer clic en **Create Rule**.
   - **Rule Name:** `RetencionInmutable10Anos`
   - **Rule Type:** Time-Bound
   - **Duration:** 3650 días (10 años).
   - **Lock Rule:** Habilitar bloqueo una vez validado el piloto.
5. Configurar Políticas IAM (Identity & Access Management):
   - Crear el grupo de usuarios: `GRP_OBSERVATORIO_OPERATORS`.
   - Agregar los usuarios de los operadores titular y suplente al grupo.
   - En la política del compartimento, agregar la siguiente sentencia:
     ```
     Allow group GRP_OBSERVATORIO_OPERATORS to manage objects in compartment cmp-observatorio-regulatorio where all {target.bucket.name='cra-observatorio-raw', any {request.permission='OBJECT_CREATE', request.permission='OBJECT_INSPECT', request.permission='OBJECT_READ'}}
     ```

---

## 5. Configuración de la Estación de Trabajo del Operador

La estación de trabajo física designada en la CRA requiere la siguiente parametrización:

### Paso 5.1: Entorno de Software
1. Verificar que **Python 3.11 o 3.12** esté instalado y en el PATH:
   ```powershell
   python --version
   ```
2. Instalar el cliente VPN proporcionado por la SSPD y verificar que las credenciales nominales y el doble factor de autenticación (MFA) funcionen.

### Paso 5.2: Despliegue de `cra-acq-cli`
1. Situarse en la carpeta raíz del proyecto en la estación:
   ```powershell
   cd "<RUTA_DEL_REPOSITORIO>\cra-acq-cli"
   ```
2. Si no se ha creado el entorno virtual, crearlo e instalar las dependencias:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\pip install -e .
   ```
3. Configurar el archivo de variables de entorno `.env`:
   - Copiar [`config/env.template`](../cra-acq-cli/config/env.template) a `.env`:
     ```powershell
     Copy-Item config\env.template .env
     ```
   - Abrir `.env` y completar los valores reales:
     - `SUI_ORACLE_HOST`: Dirección IP o FQDN del servidor de la SSPD.
     - `SUI_ORACLE_PORT`: Puerto (1521).
     - `SUI_ORACLE_SERVICE`: Nombre del servicio Oracle.
     - `SUI_ORACLE_USER`: Usuario otorgado por la SSPD.
     - `TNS_ADMIN`: Ruta absoluta donde se descomprimió el Wallet de OCI ADB.
     - `ADB_PASSWORD`: Contraseña del usuario `raw_control` en ADB.

---

## 6. Catálogo de Tablas del SUI Requeridas (Matriz de Permisos)

El usuario otorgado por la SSPD debe contar exclusivamente con permisos `SELECT` sobre el siguiente conjunto de objetos:

| Esquema SUI | Tabla / Vista Física | Clave de Partición / Filtro | Uso en el Observatorio CRA |
|---|---|---|---|
| `SUI_AAA` | `EMPRESAS_PRESTADORAS` | `ID_EMPRESA` | Identificación canónica del prestador, NIT, naturaleza jurídica. |
| `SUI_AAA` | `AREAS_PRESTACION_SERVICIO` | `ID_EMPRESA`, `ID_APS` | Áreas de prestación de servicio (APS), DIVIPOLA municipal y zona. |
| `SUI_AAA` | `CAR_BALANCE_HIDRICO` | `PERIODO = 'YYYY-MM'` | Volúmenes de agua producida, suministrada y facturada (IANC). |
| `SUI_AAA` | `CAR_COMERCIAL_RESUMEN` | `PERIODO = 'YYYY-MM'` | Suscriptores facturados por estrato y clase de uso. |
| `SUI_AAA` | `CAR_CALIDAD_AGUA` | `PERIODO = 'YYYY-MM'` | Puntos de muestreo, reportes de laboratorio e IRCA por prestador. |

> [!IMPORTANT]
> **Salvaguarda de Protección de Datos Personales (`RN-SUI-04`):**  
> El motor `cra-acq-cli` incluye un sanitizador automático en memoria que suprime columnas con nombres o documentos de personas naturales (`CEDULA`, `NOMBRE_SUSCRIPTOR`, `DIRECCION_PREDIO`, `NUIS`). Ingeniería debe asegurar que no se soliciten tablas que contengan datos crediticios o transaccionales bancarios individuales de suscriptores.

---

## 7. Protocolo de Pruebas de Aceptación (Smoke Testing)

Una vez completada la configuración de infraestructura, el equipo de ingeniería debe ejecutar el siguiente ciclo de pruebas antes de autorizar el primer ciclo operativo:

### Prueba 1: Diagnóstico de Conectividad Integral
1. Levantar el cliente VPN de la SSPD en la estación.
2. Ejecutar el script PowerShell de diagnóstico:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\validar_entorno_ingenieria.ps1
   ```
3. **Criterio de Éxito:**
   - Socket TCP a Oracle SUI: `CONECTADO`.
   - Sesión Oracle SUI: `AUTENTICADO`.
   - Catálogo físico SUI: `COMPLETO` ($4/4$ tablas maestras visibles).
   - OCI Autonomous DB: `OPERATIVO` ($5/5$ tablas del esquema `raw_control` visibles).
   - OCI Object Storage: `CONECTADO` (Bucket `cra-observatorio-raw` accesible).

### Prueba 2: Verificación de Catálogo de Consultas y CLI
Ejecutar desde terminal:
```powershell
.\.venv\Scripts\cra-acq.exe list-queries
```
**Criterio de Éxito:** Muestra las 4 consultas versionadas con sus huellas SHA-256 calculadas en tiempo de ejecución.

### Prueba 3: Extracción Piloto Controlada
Ejecutar una extracción acotada a los primeros 20 prestadores para el periodo de prueba:
```powershell
.\.venv\Scripts\cra-acq.exe run --domain BALANCE_HIDRICO --period 2026-08 --min-p 1 --max-p 20 --chunk-size 20
```
**Criterio de Éxito:**
1. El CLI solicita interactivamente la contraseña SUI Oracle sin dejar rastro en logs.
2. Genera el archivo Parquet en la ruta particionada en OCI Object Storage:  
   `source=SUI_ORACLE/domain=BALANCE_HIDRICO/year=2026/period=2026-08/batch_BAT-xxxx_seq_001.parquet`
3. Registra el lote como `COMPLETED` en la tabla `raw_control.ingestion_batch` de ADB.
4. Registra el dataset con sus huellas SHA-256 en `raw_control.raw_dataset` de ADB.

---

## 8. Guía de Resolución Rápida de Incidencias (Troubleshooting)

| Código / Error | Causa Probable | Acción Correctiva de Ingeniería |
|---|---|---|
| **TCP Timeout en puerto 1521** | Túnel VPN caído o ruta estática no agregada a la tabla de enrutamiento de Windows. | 1. Verificar sesión activa en cliente VPN.<br/>2. Ejecutar `route print` y verificar que el segmento de la SSPD apunte al adaptador virtual VPN.<br/>3. Consultar con redes SSPD si hay bloqueo en firewall perimetral. |
| **ORA-12154: TNS:could not resolve the connect identifier specified** | Error en la ruta `TNS_ADMIN` o alias mal escrito en `tnsnames.ora`. | 1. Verificar que la variable `TNS_ADMIN` apunte a la carpeta exacta del Wallet de ADB.<br/>2. Verificar que el archivo `tnsnames.ora` no tenga caracteres corruptos o espacios adicionales. |
| **ORA-01017: invalid username/password** | Credencial SUI Oracle incorrecta o expirada por inactividad. | 1. Contactar a la Mesa de Ayuda de la SSPD para solicitar reset de contraseña del usuario nominal.<br/>2. Verificar que el teclado no tenga activado bloqueo de mayúsculas al digitar. |
| **ORA-01013: user requested cancel / timeout** | Consulta sobre el SUI excedió el tiempo límite de red. | 1. Reducir el parámetro `--chunk-size` a 50 o 100 prestadores.<br/>2. Verificar que la consulta incluya el filtro obligatorio `WHERE PERIODO = :period_id`. |
| **OCI 401 Not Authenticated** | Llave de API de OCI expirada o perfil incorrecto en `~/.oci/config`. | 1. Verificar la huella digital (fingerprint) en la consola de OCI en el perfil de usuario.<br/>2. Regenerar el par de llaves RSA pública/privada y actualizar el archivo de configuración. |
| **OCI 404 Bucket Not Found** | El nombre del bucket no coincide o se creó en otro compartimento/región. | 1. Confirmar el nombre exacto `cra-observatorio-raw` en la consola OCI.<br/>2. Verificar el namespace de tenancy configurado. |

---

## 9. Directorio de Contactos Técnicos y Escalamiento

- **Líder Técnico de Datos & Observatorio CRA:** Camilo Carvajalino (`ccarvajalino@cra.gov.co`)
- **Administrador OCI / Cloud Tenant CRA:** Equipo de Infraestructura y Redes CRA
- **Mesa de Ayuda SUI — SSPD:** Soporte Interinstitucional SUI (`sui@superservicios.gov.co` / Mesa de Enlace)
- **Horario Autorizado de Extracción Masiva:** Lunes a Viernes de 17:30 a 21:30 h (o de 06:00 a 08:00 h).
