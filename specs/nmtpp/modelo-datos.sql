-- =============================================================================
-- modelo-datos.sql — Componente NMTPP (Res. CRA 1038 de 2026)
-- Proyecto: observatorio-regulatorio-cra · Estado: borrador · 2026-09-18
-- Dialecto: Oracle Autonomous Database (adr/ADR-0007). Esquema: analytics
-- (las vistas públicas se materializan en `published`; el portal solo lee published).
-- Fuente de verdad del modelo: specs/seguimiento-nmt-pequenos-prestadores.md
-- Convenciones: snake_case en inglés/español según docs/architecture.md; fechas DATE;
-- montos NUMBER(18,0) en pesos con base_year y monetary_condition explícitos.
-- NO insertar metas como literales en código: se cargan desde parametros-res-1038.json.
-- =============================================================================

-- 1. Marco y parámetros -------------------------------------------------------
CREATE TABLE marco_tarifario (
  id                    VARCHAR2(20)  PRIMARY KEY,           -- 'CRA-1038-2026'
  norma                 VARCHAR2(200) NOT NULL,
  fecha_expedicion      DATE          NOT NULL,
  inicio_aplicacion     DATE          NOT NULL,              -- 2027-01-01
  fecha_corte_ambito    DATE          NOT NULL,              -- 2024-12-31
  vigencia_anios        NUMBER(2)     NOT NULL
);

CREATE TABLE subsegmento (
  id                    VARCHAR2(10)  PRIMARY KEY,           -- 'S1-1'..'S2-4'
  marco_id              VARCHAR2(20)  NOT NULL REFERENCES marco_tarifario(id),
  segmento_id           VARCHAR2(5)   NOT NULL CHECK (segmento_id IN ('S1','S2')),
  min_exclusivo         NUMBER(7),                           -- NULL = sin límite inferior
  max_inclusivo         NUMBER(7),                           -- NULL = sin límite superior
  regimen               VARCHAR2(20)  NOT NULL CHECK (regimen IN ('libertad_regulada','libertad_vigilada'))
);

CREATE TABLE parametro_meta (
  marco_id              VARCHAR2(20)  NOT NULL REFERENCES marco_tarifario(id),
  indicador             VARCHAR2(40)  NOT NULL,              -- 'MICROMEDICION','CONTINUIDAD',...
  subsegmento_id        VARCHAR2(10)  NOT NULL REFERENCES subsegmento(id),
  version               NUMBER(3)     NOT NULL,
  estandar_operador     VARCHAR2(2)   CHECK (estandar_operador IN ('<=','>=','=')),
  estandar_valor        NUMBER(9,4),
  unidad                VARCHAR2(30),
  tipo_meta             VARCHAR2(30)  NOT NULL CHECK (tipo_meta IN
                          ('absoluta_desde_inicio','absoluta_en_anio','cierre_de_brecha',
                           'autoproyectada','autoproyectada_condicional','no_exigible')),
  anio_cumplimiento     NUMBER(2),                           -- año tarifario 1..5
  cierre_brecha_pct     NUMBER(5,2),
  articulo              VARCHAR2(120) NOT NULL,              -- regla de oro 2
  bloqueado_por         VARCHAR2(60),                        -- 'Q-NMTPP-01,...' o NULL
  vigente_desde         DATE          NOT NULL,
  vigente_hasta         DATE,
  CONSTRAINT pk_parametro_meta PRIMARY KEY (marco_id, indicador, subsegmento_id, version)
);

-- 2. Registro maestro ----------------------------------------------------------
CREATE TABLE prestador_marco (
  provider_id                     VARCHAR2(20) NOT NULL,     -- ID SUI (provider)
  marco_id                        VARCHAR2(20) NOT NULL REFERENCES marco_tarifario(id),
  version_registro                NUMBER(4)    NOT NULL,
  en_ambito                       CHAR(1)      NOT NULL CHECK (en_ambito IN ('S','N')),
  motivo_ambito                   VARCHAR2(200),
  segmento_id                     VARCHAR2(5)  CHECK (segmento_id IN ('S1','S2')),
  es_gestor_comunitario           CHAR(1)      CHECK (es_gestor_comunitario IN ('S','N')),
  opcion_s2_a_s1                  CHAR(1)      DEFAULT 'N' CHECK (opcion_s2_a_s1 IN ('S','N')),
  suscriptores_ac_2024            NUMBER(9),
  suscriptores_al_2024            NUMBER(9),
  pct_rurales_2024                NUMBER(5,2),
  subsegmento_calc_regla_mayor    VARCHAR2(10) REFERENCES subsegmento(id),  -- Resolución
  subsegmento_calc_regla_acued    VARCHAR2(10) REFERENCES subsegmento(id),  -- DT (Q-NMTPP-03)
  subsegmento_declarado           VARCHAR2(10) REFERENCES subsegmento(id),
  subsegmento_vigente             VARCHAR2(10) REFERENCES subsegmento(id),  -- regla vigente
  regimen                         VARCHAR2(20),
  fecha_clasificacion             DATE,
  CONSTRAINT pk_prestador_marco PRIMARY KEY (provider_id, marco_id, version_registro)
);

CREATE TABLE aps_marco (
  service_area_id       VARCHAR2(30) NOT NULL,
  marco_id              VARCHAR2(20) NOT NULL REFERENCES marco_tarifario(id),
  provider_id           VARCHAR2(20) NOT NULL,
  servicio              VARCHAR2(15) NOT NULL CHECK (servicio IN ('acueducto','alcantarillado')),
  divipola_code         CHAR(5)      NOT NULL,
  zona                  VARCHAR2(15) CHECK (zona IN ('urbana','rural','urbana_rural')),
  esquema_diferencial   VARCHAR2(10) CHECK (esquema_diferencial IN ('rural','urbano')),
  pila_publica          CHAR(1)      DEFAULT 'N' CHECK (pila_publica IN ('S','N')),
  reportada_sspd        CHAR(1)      DEFAULT 'N' CHECK (reportada_sspd IN ('S','N')),
  CONSTRAINT pk_aps_marco PRIMARY KEY (service_area_id, marco_id)
);

CREATE TABLE aps_condicion_especial (
  service_area_id       VARCHAR2(30) NOT NULL,
  marco_id              VARCHAR2(20) NOT NULL,
  condicion             VARCHAR2(15) NOT NULL CHECK (condicion IN ('INSULAR','IVH','IPM','PDET_ZOMAC','TOMA_POSESION')),
  origen                VARCHAR2(20) NOT NULL CHECK (origen IN ('declarada','lista_publica','ambas')),
  fuente_ref            VARCHAR2(200),
  CONSTRAINT pk_aps_cond PRIMARY KEY (service_area_id, marco_id, condicion),
  CONSTRAINT fk_aps_cond FOREIGN KEY (service_area_id, marco_id) REFERENCES aps_marco(service_area_id, marco_id)
);

-- 3. Estudio de costos (adr/ADR-0014) ------------------------------------------
CREATE TABLE estudio_costos (
  estudio_id            VARCHAR2(40) PRIMARY KEY,
  provider_id           VARCHAR2(20) NOT NULL,
  marco_id              VARCHAR2(20) NOT NULL REFERENCES marco_tarifario(id),
  servicio              VARCHAR2(15) NOT NULL,
  tipo                  VARCHAR2(10) NOT NULL CHECK (tipo IN ('inicial','recalculo')),
  anio_tarifario        NUMBER(4)    NOT NULL,
  fecha_recepcion_cra   DATE         NOT NULL,
  radicado_cra          VARCHAR2(40) NOT NULL,
  capturado_por         VARCHAR2(60) NOT NULL,              -- ACT-CURADOR-DATOS
  capturado_en          TIMESTAMP    NOT NULL
);

CREATE TABLE linea_base (
  provider_id           VARCHAR2(20) NOT NULL,
  service_area_id       VARCHAR2(30) NOT NULL,
  indicador             VARCHAR2(40) NOT NULL,
  valor                 NUMBER(12,4),                       -- NULL = no declarada (nunca 0 por defecto)
  unidad                VARCHAR2(30),
  periodo_referencia    VARCHAR2(20),
  origen                VARCHAR2(15) NOT NULL CHECK (origen IN ('declarada','sui','estimada','observacion_90d')),
  estudio_id            VARCHAR2(40) REFERENCES estudio_costos(estudio_id),
  CONSTRAINT pk_linea_base PRIMARY KEY (provider_id, service_area_id, indicador, origen)
);

CREATE TABLE meta_declarada (
  provider_id           VARCHAR2(20) NOT NULL,
  service_area_id       VARCHAR2(30) NOT NULL,
  indicador             VARCHAR2(40) NOT NULL,
  anio_tarifario        NUMBER(4)    NOT NULL,
  valor                 NUMBER(12,4) NOT NULL,
  unidad                VARCHAR2(30) NOT NULL,
  estudio_id            VARCHAR2(40) NOT NULL REFERENCES estudio_costos(estudio_id),
  CONSTRAINT pk_meta_declarada PRIMARY KEY (provider_id, service_area_id, indicador, anio_tarifario, estudio_id)
);

CREATE TABLE tarifa_aplicada (
  provider_id           VARCHAR2(20) NOT NULL,
  service_area_id       VARCHAR2(30) NOT NULL,
  servicio              VARCHAR2(15) NOT NULL,
  periodo               VARCHAR2(7)  NOT NULL,              -- 'AAAA-MM'
  marco_origen          VARCHAR2(20) NOT NULL,              -- 'CRA-825-2017' | 'CRA-1038-2026'
  estrato_uso           VARCHAR2(20) NOT NULL,              -- 'E1'..'E6','COMERCIAL','INDUSTRIAL','OFICIAL'
  cargo_fijo            NUMBER(18,0),                       -- $/suscriptor/mes
  cargo_consumo         NUMBER(18,2),                       -- $/m3
  base_year             NUMBER(4)    NOT NULL,
  monetary_condition    VARCHAR2(10) NOT NULL CHECK (monetary_condition IN ('corriente','constante')),
  CONSTRAINT pk_tarifa PRIMARY KEY (provider_id, service_area_id, servicio, periodo, marco_origen, estrato_uso)
);

-- 4. Estados frente a meta ----------------------------------------------------
CREATE TABLE estado_meta (
  indicator_code        VARCHAR2(20) NOT NULL,              -- 'NMTPP-S1-MIC'
  version               NUMBER(3)    NOT NULL,
  provider_id           VARCHAR2(20) NOT NULL,
  service_area_id       VARCHAR2(30) NOT NULL,
  anio_tarifario        NUMBER(4)    NOT NULL,
  valor_observado       NUMBER(12,4),                       -- NULL si no reportó
  unidad                VARCHAR2(30),
  meta_aplicada         NUMBER(12,4),
  origen_meta           VARCHAR2(12) CHECK (origen_meta IN ('regulatoria','declarada')),
  estado                VARCHAR2(45) NOT NULL CHECK (estado IN (
                          'meta cumplida','en trayectoria','fuera de trayectoria',
                          'meta no alcanzada en el año de cumplimiento','no exigible aún',
                          'no reportó','meta no declarada','meta pendiente de aclaración normativa',
                          'sin fuente confirmada','no aplica')),          -- RN-NMTPP-03
  regresion_linea_base  CHAR(1)      DEFAULT 'N' CHECK (regresion_linea_base IN ('S','N')),
  articulo              VARCHAR2(120) NOT NULL,
  q_bloqueante          VARCHAR2(60),
  calculado_en          TIMESTAMP    NOT NULL,
  CONSTRAINT pk_estado_meta PRIMARY KEY (indicator_code, version, provider_id, service_area_id, anio_tarifario)
);

-- 5. ISE oficial (adr/ADR-0015) ------------------------------------------------
CREATE TABLE ise_publicacion (
  provider_id                 VARCHAR2(20) NOT NULL,
  servicio                    VARCHAR2(15) NOT NULL,
  nivel                       VARCHAR2(10) NOT NULL CHECK (nivel IN ('aps','conjunto')),   -- Q-NMTPP-13
  service_area_id             VARCHAR2(30) NOT NULL,       -- '*' si nivel = conjunto
  anio_aplicacion             NUMBER(4)    NOT NULL,
  anio_evaluado               NUMBER(4)    NOT NULL,       -- = anio_aplicacion - 2
  ise_calculado               NUMBER(5,2),
  dim_tecnica                 NUMBER(5,2),
  dim_administrativa          NUMBER(5,2),
  dim_financiera              NUMBER(5,2),
  ind_macromedicion           NUMBER(5,2),
  ind_reporte_calidad_agua    NUMBER(5,2),
  ind_continuidad             NUMBER(5,2),
  ind_micromedicion_efectiva  NUMBER(5,2),
  ind_pqr                     NUMBER(5,2),
  ind_costo_adm_op_suscriptor NUMBER(5,2),
  pct_eficiencia_aplicable    NUMBER(5,2),
  piso_anio                   NUMBER(5,2),
  ise_con_incentivos_cmog     NUMBER(5,2),                -- ISE aplicable al CMOG con incentivos (tope 100)
  ise_con_incentivos_cma      NUMBER(5,2),                -- ISE aplicable al CMA con incentivos (tope 100)
  no_aplica_motivo            VARCHAR2(40),                -- 'zona insular'
  fecha_publicacion           DATE         NOT NULL,
  acto_ref                    VARCHAR2(80) NOT NULL,
  CONSTRAINT pk_ise PRIMARY KEY (provider_id, servicio, service_area_id, anio_aplicacion),
  CONSTRAINT ck_ise_i2 CHECK (anio_evaluado = anio_aplicacion - 2)
);

CREATE TABLE incentivo_reconocido (
  provider_id           VARCHAR2(20) NOT NULL,
  servicio              VARCHAR2(15) NOT NULL,
  anio_aplicacion       NUMBER(4)    NOT NULL,
  tipo                  VARCHAR2(20) NOT NULL CHECK (tipo IN ('continuidad','perdidas','micromedicion','asociatividad','buen_gobierno','reporte')),
  componente            VARCHAR2(5)  NOT NULL CHECK (componente IN ('CMOG','CMA')),
  porcentaje            NUMBER(5,2)  NOT NULL,
  acto_ref              VARCHAR2(80) NOT NULL,
  CONSTRAINT pk_incentivo PRIMARY KEY (provider_id, servicio, anio_aplicacion, tipo)
);

-- 6. Hitos y aclaraciones -----------------------------------------------------
CREATE TABLE hito (
  marco_id              VARCHAR2(20) NOT NULL REFERENCES marco_tarifario(id),
  codigo                VARCHAR2(10) NOT NULL,
  anio                  NUMBER(4)    NOT NULL,              -- instancia de hitos recurrentes
  descripcion           VARCHAR2(300) NOT NULL,
  fecha_prevista        DATE         NOT NULL,
  fecha_real            DATE,
  actor                 VARCHAR2(20) NOT NULL,
  articulo              VARCHAR2(120) NOT NULL,
  CONSTRAINT pk_hito PRIMARY KEY (marco_id, codigo, anio)
);

CREATE TABLE aclaracion (
  q_id                  VARCHAR2(15) PRIMARY KEY,           -- 'Q-NMTPP-01'
  titulo                VARCHAR2(200) NOT NULL,
  estado                VARCHAR2(12) NOT NULL CHECK (estado IN ('abierta','respondida','incorporada')),
  prioridad             VARCHAR2(10),
  fecha_limite_util     DATE,
  fecha_respuesta       DATE,
  acto_ref              VARCHAR2(120),
  requisitos_bloqueados VARCHAR2(400)
);

-- Vista de ejemplo: distribución de estados por subsegmento (agregado principal)
CREATE OR REPLACE VIEW v_distribucion_estados AS
SELECT e.indicator_code, e.anio_tarifario, p.subsegmento_vigente AS subsegmento, e.estado,
       COUNT(*) AS prestadores
FROM   estado_meta e
JOIN   prestador_marco p ON p.provider_id = e.provider_id AND p.marco_id = 'CRA-1038-2026'
WHERE  p.version_registro = (SELECT MAX(version_registro) FROM prestador_marco x
                             WHERE x.provider_id = p.provider_id AND x.marco_id = p.marco_id)
GROUP BY e.indicator_code, e.anio_tarifario, p.subsegmento_vigente, e.estado;
