import json, csv, re, os, hashlib, unicodedata, shutil
from collections import Counter
S="/tmp/claude-0/-home-claude/8069c3b3-b904-5664-82a6-02386135ddfd/scratchpad/"
VER="0.2.0"; FECHA="2026-09-14"; CORTE="2026-09-03"
OUT=S+f"diccionario_sui_cra_v{VER}/"
shutil.rmtree(OUT,ignore_errors=True); os.makedirs(OUT+"data"); os.makedirs(OUT+"vocab")
d=json.load(open(S+"dicc.json",encoding="utf-8")); V=json.load(open(S+"vars.json",encoding="utf-8"))

DEROGADA='RESOLUCION SSPD No. 20094000015085 de 2009'; VACIADA='Resolución SSPD 20101300048765 DE 2010'
SERV_CRA=['ACUEDUCTO','ALCANTARILLADO','ASEO','COSTOS-TARIFAS AA','RIESGOS AAA','TRANSVERSAL']
def slug(s):
    s=unicodedata.normalize("NFKD",s).encode("ascii","ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+","-",s).strip("-")
def norm(s):
    s=unicodedata.normalize("NFKD",s).encode("ascii","ignore").decode().upper()
    s=re.sub(r"^\s*(FORMATO|\d+\.)\s+","",s); s=re.sub(r"[^A-Z0-9 ]"," ",s); return re.sub(r"\s+"," ",s).strip()
def h8(s): return hashlib.sha1(s.encode()).hexdigest()[:8]
def fix(s): return s.replace("¿","-").replace("?","-").replace("/n","").strip()

def wcsv(name,rows,fields):
    with open(OUT+"data/"+name,"w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields,lineterminator="\n"); w.writeheader()
        for r in rows: w.writerow({k:r.get(k,"") for k in fields})

# ---------- servicio ----------
serv=[{"id_servicio":s["id_servicio"],"descripcion":s["descripcion"],"regulador":s["regulador"],"valido_desde":"","valido_hasta":""} for s in d["servicios"]]
wcsv("servicio.csv",serv,list(serv[0].keys()))

# ---------- norma ----------
def estado_norma(n):
    if n["nombre"]==DEROGADA: return "derogada"
    if n["nombre"]==VACIADA: return "vigente-parcial"
    return "vigente-declarada"
nor=[{"id_norma":n["id_norma"],"nombre":n["nombre"],"tipo":n["tipo"],"emisor":n["emisor"],"anio":n["anio"],
      "aplica_aaa":str(n["aplica_aaa"]).lower(),"en_arbol_servicios":str(n["en_arbol_servicios"]).lower(),
      "estado_vigencia":estado_norma(n),"observacion_vigencia":{"derogada":"H2: derogada; sus formatos requieren reasignación por dominio","vigente-parcial":"H2/H4: vaciada por normas posteriores (78 art. derogados por Res. 20251000182585/2025)"}.get(estado_norma(n),""),
      "fuente":"portal SUI DiccionarioConsultaV2","valido_desde":"","valido_hasta":""} for n in d["normas"]]
wcsv("norma.csv",nor,list(nor[0].keys()))
wcsv("norma_servicio.csv",[{"id_norma":n["id_norma"],"id_servicio":s} for n in d["normas"] for s in n["servicios"] if s in SERV_CRA],["id_norma","id_servicio"])
norma_id={n["nombre"]:n["id_norma"] for n in d["normas"]}

# ---------- formato ----------
def vig(f):
    if f["estado_norma"]!="DECLARADA": return "sin-norma"
    if f["norma"]==DEROGADA: return "derogada-pendiente-reasignacion"
    if f["norma"]==VACIADA: return "vigente-parcial-verificar"
    return "vigente-declarada"
fmt_by_norm={}
for f in d["formatos"]: fmt_by_norm.setdefault(norm(f["nombre"]),[]).append(f["id_formato"])
varsByFmt=Counter()
for v in V:
    for i in fmt_by_norm.get(norm(v["formato"]),[]): varsByFmt[i]+=1
fmt=[{"id_formato":f["id_formato"],"nombre":fix(f["nombre"]),"id_norma":norma_id.get(f["norma"],""),"norma_declarada":f["norma"],
      "dominio_funcional":f["dominio"],"tipo_reporte":f["tipo_reporte"],"estado_vigencia":vig(f),
      "n_tablas":len(f["tablas"]),"n_variables_documentadas":varsByFmt.get(f["id_formato"],0),
      "hallazgos":";".join(x for x in [ "H2" if vig(f).startswith(("derogada","vigente-parcial")) else "", "H3" if vig(f)=="sin-norma" else "", "H6" if f["id_formato"] in ("1052","1053","1056","1115","179","350") else ""] if x),
      "fuente":"portal SUI DiccionarioConsultaV2 (barrido tab 1..1400)","valido_desde":"","valido_hasta":""} for f in d["formatos"]]
wcsv("formato.csv",fmt,list(fmt[0].keys()))
wcsv("formato_servicio.csv",[{"id_formato":f["id_formato"],"id_servicio":s} for f in d["formatos"] for s in f["servicios"] if s in SERV_CRA],["id_formato","id_servicio"])

# ---------- tabla ----------
tab=[{"nombre_tabla":t["nombre_tabla"],"descripcion":fix(t["descripcion"]),"n_formatos":t["n_formatos"],"compartida":str(t["n_formatos"]>1).lower(),
      "hallazgos":";".join(x for x in ["H5" if not t["descripcion"].strip() else "","H8" if t["n_formatos"]>1 else ""] if x),
      "columnas_disponibles":"false","motivo_sin_columnas":"H1: consulta por tablas del portal responde HTTP 500 (NullPointerException TablaBean.getEsq)","fuente":"portal SUI DiccionarioConsultaV2"} for t in d["tablas"]]
wcsv("tabla_sui.csv",tab,list(tab[0].keys()))
wcsv("formato_tabla.csv",d["formato_tabla"],["id_formato","nombre_tabla"])

# ---------- documento_tecnico ----------
docs={}
for v in V: docs.setdefault(v["doc_fuente"],{"id_documento":v["doc_fuente"],"norma":v["norma"],"n_variables":0,"n_formatos":set(),"metodos":set()})
for v in V: docs[v["doc_fuente"]]["n_variables"]+=1; docs[v["doc_fuente"]]["n_formatos"].add(v["formato"]); docs[v["doc_fuente"]]["metodos"].add(v["metodo_extraccion"])
doc_rows=[{"id_documento":k,"norma":x["norma"],"id_norma":norma_id.get(x["norma"],""),"tipo":"instructivo" if "INSTRUCTIVO" in k else ("anexo tecnico" if "ANEXO" in k else "resolucion"),"n_formatos":len(x["n_formatos"]),"n_variables":x["n_variables"],"metodos_extraccion":";".join(sorted(x["metodos"])),"emisor":"MVCT" if "MVCT" in x["norma"] else "SSPD"} for k,x in docs.items()]
wcsv("documento_tecnico.csv",doc_rows,list(doc_rows[0].keys()))

# ---------- variable_formato ----------
def oblig(x):
    x=x.strip().lower()
    if x in ("sí","si","obligatorio"): return "obligatorio"
    if x in ("no","opcional"): return "opcional"
    if x=="" or x=="n/a": return "sin-dato"
    return "condicional"
def tipo(x):
    x=x.strip().lower()
    if not x: return "sin-dato"
    if "fecha" in x: return "fecha"
    if "hora" in x: return "hora"
    if "archivo" in x: return "archivo"
    if x in ("campo",): return "sin-dato"
    if "codific" in x or "lista" in x or x.startswith("c"): return "codificado"
    if "decimal" in x: return "decimal"
    if "entero" in x: return "entero"
    if "alfanum" in x or "texto" in x or "car" in x: return "alfanumerico"
    if "num" in x: return "numerico"
    return slug(x)
PII=[(r"\bNUIS\b|identificaci[oó]n del suscriptor","dato personal · identificador de suscriptor"),(r"direcci[oó]n","dato personal · dirección"),(r"predial|catastr","dato personal · identificador predial"),(r"nombre|raz[oó]n social","dato personal · nombre"),(r"tel[eé]fono|correo|email","dato personal · contacto"),(r"c[eé]dula|nit\b|documento de identidad","dato personal · identificación")]
def clasif(v):
    t=v["nombre_variable"]+" "+v["descripcion"][:80]
    for p,l in PII:
        if re.search(p,t,re.I): return "restringido-propuesto",l
    return "publico-propuesto",""
# dedupe extraction artifacts: same key, one with empty description
seen=set(); V2=[]
for v in sorted(V,key=lambda v:(v["doc_fuente"],v["formato"],int(v["orden"] or 0),v["descripcion"]=="")):
    k=(v["doc_fuente"],v["formato"],v["orden"],v["nombre_variable"])
    if k in seen: continue
    seen.add(k); V2.append(v)
N_DUP=len(V)-len(V2); V=V2
vf=[]
for v in V:
    m=fmt_by_norm.get(norm(v["formato"]),[])
    c,cm=clasif(v)
    vf.append({"id_variable":f"VF-{h8(v['doc_fuente']+'|'+v['formato']+'|'+v['orden']+'|'+v['nombre_variable'])}",
        "id_documento":v["doc_fuente"],"id_norma":norma_id.get(v["norma"],""),"norma":v["norma"],"formato_segun_documento":v["formato"],"orden":v["orden"],
        "nombre_variable":v["nombre_variable"],"definicion":v["descripcion"],"tipo_dato_declarado":v["tipo_dato"],"tipo_dato_normalizado":tipo(v["tipo_dato"]),
        "longitud":v["longitud"],"unidad_medida":v["unidad_medida"],"obligatoriedad_declarada":v["obligatoriedad"],"obligatoriedad_normalizada":oblig(v["obligatoriedad"]),
        "valores_admisibles":v["valores_admisibles"].replace(""," -> "),"segmento_prestador":v["segmento_prestador"].replace(" x",""),"observaciones":v["observaciones"],
        "id_formato_catalogo":";".join(m),"calidad_correspondencia":"exacta" if m else "sin-cruce",
        "clasificacion_sensibilidad":c,"motivo_clasificacion":cm,
        "metodo_extraccion":v["metodo_extraccion"],"pagina":v["pagina"],"requiere_validacion":str(v["metodo_extraccion"]=="WEBFETCH_LECTOR").lower(),
        "hallazgos":";".join(x for x in ["H10","H11" if not m else ""] if x)})
ids=[r["id_variable"] for r in vf]; assert len(ids)==len(set(ids))
wcsv("variable_formato.csv",vf,list(vf[0].keys()))
# variable_tabla: definida y vacía
wcsv("variable_tabla.csv",[],["id_columna","nombre_tabla","nombre_columna","definicion","tipo_dato","longitud","obligatoriedad","dominio","llave","id_variable_formato","fuente","valido_desde","valido_hasta"])
wcsv("dominio_valor.csv",[],["id_dominio","codigo","etiqueta","definicion","fuente_normativa","valido_desde","valido_hasta"])

# ---------- linaje ----------
lin=[]
for f in d["formatos"]:
    lin.append({"origen_tipo":"norma","origen_id":norma_id.get(f["norma"],""),"destino_tipo":"formato","destino_id":f["id_formato"],"relacion":"exige","calidad":"declarada-portal" if f["norma"] else "sin-norma","fuente":"portal SUI"})
for r in d["formato_tabla"]:
    lin.append({"origen_tipo":"formato","origen_id":r["id_formato"],"destino_tipo":"tabla_sui","destino_id":r["nombre_tabla"],"relacion":"alimenta","calidad":"declarada-portal","fuente":"portal SUI"})
for r in vf:
    for i in (r["id_formato_catalogo"].split(";") if r["id_formato_catalogo"] else []):
        lin.append({"origen_tipo":"formato","origen_id":i,"destino_tipo":"variable_formato","destino_id":r["id_variable"],"relacion":"contiene","calidad":"cruce-nombre-exacto","fuente":r["id_documento"]})
wcsv("linaje.csv",lin,["origen_tipo","origen_id","destino_tipo","destino_id","relacion","calidad","fuente"])

# ---------- registro de calidad ----------
derog=sum(1 for f in d["formatos"] if f["norma"]==DEROGADA)
Q=[("H1","alta","trazabilidad;completitud","Consulta por tablas del portal caída (HTTP 500, NullPointerException en TablaBean.getEsq). Nivel columna física inaccesible.","tabla_sui / variable_tabla",str(len(d["tablas"])),"abierto","Oficio técnico a mesa SUI (sui_aaa@superservicios.gov.co); solicitar contenido de la vista como archivo"),
 ("H2","alta","actualidad;conformidad",f"{derog} formatos atribuidos a la Res. SSPD 20094000015085/2009, derogada; la Res. 20101300048765/2010 está vaciada por normas posteriores.","formato / norma",str(derog),"abierto","Reasignar por dominio: comercial AA→Res. 20171300039945/2017; IUS→20221000284385/2022; hidráulico y personal→20211000316965/2021; aseo técnico→20174000237705/2017 y modif.; aseo tarifario→20251000182585/2025; PQR→20261000681915/2026. Requiere certificación SSPD."),
 ("H3","media","completitud","Formatos sin norma declarada en el diccionario.","formato",str(sum(1 for f in d["formatos"] if f["estado_norma"]!="DECLARADA")),"abierto","Incluir en oficio de información entre autoridades"),
 ("H4","media","consistencia","Res. 20101300048765/2010 asociada solo a ASEO: para AA fue sustituida en 2017; en aseo sobrevivió hasta 2025.","norma_servicio","1","documentado","Registrar vigencia por dominio en estado_vigencia"),
 ("H5","media","completitud;exactitud","Tablas con descripción nula o copiada de otra tabla.","tabla_sui",str(sum(1 for t in d["tablas"] if not t["descripcion"].strip())),"abierto","Solicitar diccionario de tablas a SSPD"),
 ("H6","baja","unicidad","Formatos duplicados (1052/1053, 1056/1115, 179/350) y pares con mojibake.","formato","6","abierto","Resolver con SSPD; no fusionar sin confirmación"),
 ("H7","baja","exactitud","Doble codificación ISO-8859-1/UTF-8 en nombres del portal.","formato / tabla_sui","","mitigado","Nombres normalizados en esta versión; el original se conserva en el JSON fuente"),
 ("H8","informativa","consistencia","Tablas compartidas entre formatos y servicios.","tabla_sui",str(sum(1 for t in d["tablas"] if t["n_formatos"]>1)),"documentado","Marcadas con compartida=true"),
 ("H9","alta","completitud","Universo de formatos mayor que el barrido: ids hasta 6097 y 407 formatos referenciados por esquemas fuera del catálogo. Toda cobertura sobre 392 es un piso.","formato","407","abierto","Completar barrido secuencial de identificadores"),
 ("H10","media","trazabilidad","Variables ancladas al formato, no a la columna física. El puente variable→columna solo lo cierra la SSPD.","variable_formato",str(len(V)),"abierto","variable_tabla permanece definida y vacía a propósito"),
 ("H11","media","trazabilidad","Cruce variable→formato del catálogo solo por nombre exacto.","variable_formato",str(sum(1 for r in vf if r["calidad_correspondencia"]=="exacta")),"abierto","Filtrar por calidad_correspondencia antes de cualquier uso"),
 ("H12","media","credibilidad",f"{sum(1 for v in V if v['metodo_extraccion']=='WEBFETCH_LECTOR')} variables provienen de lectura asistida (WEBFETCH_LECTOR), no de extracción mecánica.","variable_formato",str(sum(1 for v in V if v['metodo_extraccion']=='WEBFETCH_LECTOR')),"abierto","Validar contra el PDF antes de uso en acto administrativo; prioridad Res. 20211000316965 y aseo"),
 ("H14","baja","unicidad",f"{N_DUP} filas duplicadas en la extracción de variables (misma clave documento|formato|orden|nombre, una con definición vacía); se conservó la fila con definición.","variable_formato",str(N_DUP),"mitigado","Corregido en esta versión; revisar en el script de extracción"),
 ("H13","media","confidencialidad",f"{sum(1 for r in vf if r['clasificacion_sensibilidad'].startswith('restringido'))} variables clasificadas provisionalmente como dato personal (Ley 1581/2012) por heurística de nombre.","variable_formato",str(sum(1 for r in vf if r['clasificacion_sensibilidad'].startswith('restringido'))),"abierto","Confirmación por el steward de cada dominio antes de publicar")]
wcsv("registro_calidad.csv",[dict(zip(["id_hallazgo","severidad","dimension_iso25012","descripcion","entidad_afectada","registros_afectados","estado","accion"],q)) for q in Q],["id_hallazgo","severidad","dimension_iso25012","descripcion","entidad_afectada","registros_afectados","estado","accion"])

# ---------- SKOS vocabularies ----------
def skos(name,title,concepts,desc):
    base=f"https://cra.gov.co/vocab/sui/{name}#"
    t=f"""@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix : <{base}> .

:scheme a skos:ConceptScheme ;
    dct:title "{title}"@es ;
    dct:description "{desc}"@es ;
    dct:creator "CRA - Comisión de Regulación de Agua Potable y Saneamiento Básico" ;
    dct:issued "{FECHA}" ;
    dct:hasVersion "{VER}" .

"""
    for cid,label,defn in concepts:
        t+=f""":{cid} a skos:Concept ;
    skos:inScheme :scheme ;
    skos:notation "{cid}" ;
    skos:prefLabel "{label}"@es ;
    skos:definition "{defn}"@es ;
    skos:topConceptOf :scheme .

"""
    open(OUT+f"vocab/{name}.ttl","w",encoding="utf-8").write(t)
DOMDEF={"FINANCIERO Y CONTABLE":"Estados financieros, PUC, cuentas por cobrar/pagar, flujos de caja, viabilidad financiera.","TARIFARIO Y COSTOS":"Tarifas proyectadas y aplicadas, costos de referencia, estudios de costos, actos de aprobación tarifaria.","INSTITUCIONAL Y HABILITACION":"Actos de habilitación, invitaciones públicas, reconocimiento SSPD, reglamentos y autorizaciones.","CALIDAD DEL AGUA Y MUESTREO":"Puntos y actas de muestreo, características básicas/especiales, IRCA, calidad de fuentes.","RIESGO Y GOBIERNO CORPORATIVO":"Matrices de riesgo, control interno, organigrama, personal, convenciones colectivas.","COMERCIAL Y FACTURACION":"Facturación, suscriptores, consumos, multiusuarios, proyección de demanda.","TECNICO OPERATIVO":"Redes, continuidad, vehículos, rutas, sitios de disposición, estaciones, vertimientos.","OTROS":"Formatos no clasificados por las reglas de nombre; requieren revisión manual.","SUBSIDIOS Y CONTRIBUCIONES":"Factores y balances de subsidios y contribuciones, FSRI, acuerdos municipales.","INVERSIONES Y SGP":"Formulación y ejecución de proyectos, contratación y liquidación con recursos SGP, metas.","PQR Y CONTROL SOCIAL":"Peticiones, quejas, reclamos e indicadores de control social.","ESTRATIFICACION Y TERRITORIO":"Estratificación socioeconómica, áreas de prestación, vértices, DANE-IGAC."}
skos("dominio_funcional","Dominios funcionales del universo regulatorio CRA",[(slug(k),k.title(),v) for k,v in DOMDEF.items()],"Clasificación derivada por reglas explícitas sobre el nombre del formato (build_model.py, REGLAS_DOMINIO). Reclasificar es cambiar una regla.")
skos("servicio","Servicios y ejes de reporte del universo CRA",[(slug(s["id_servicio"]),s["id_servicio"].title(),s["descripcion"]) for s in d["servicios"]],"Servicios públicos domiciliarios y ejes transversales regulados por la CRA según el árbol del portal SUI.")
skos("tipo_reporte","Tipo de reporte del formato",[("estructurado","Estructurado","El formato aterriza en una o más tablas físicas del SUI y es explotable analíticamente."),("documental","Documental","El formato se carga como PDF/TIFF/ZIP; no tiene tabla física asociada.")],"Naturaleza de la captura declarada en el portal SUI.")
skos("estado_vigencia","Estado de vigencia normativa",[("vigente-declarada","Vigente declarada","La norma declarada en el portal no tiene indicios de derogatoria en esta extracción."),("vigente-parcial-verificar","Vigente parcial, verificar","La norma declarada fue vaciada parcialmente por normas posteriores; verificar artículo aplicable."),("derogada-pendiente-reasignacion","Derogada, pendiente reasignación","La norma declarada está derogada; el formato debe reasignarse a la norma vigente del dominio (H2)."),("sin-norma","Sin norma","El portal no declara norma para el formato (H3).")],"Estado de la relación norma→formato a la fecha de corte. Nunca se reasigna silenciosamente.")
skos("tipo_dato","Tipo de dato normalizado",[("numerico","Numérico","Valor numérico sin precisión declarada."),("entero","Entero","Número entero."),("decimal","Decimal","Número con parte fraccionaria."),("alfanumerico","Alfanumérico","Cadena de texto."),("fecha","Fecha","Fecha, formato declarado en unidad_medida u observaciones."),("hora","Hora","Hora en formato 24 horas."),("archivo","Archivo","Adjunto binario (PDF, imagen)."),("codificado","Codificado / lista","Valor tomado de un dominio de códigos o lista desplegable."),("sin-dato","Sin dato","El documento fuente no declara tipo.")],"Normalización de los 23 literales de tipo de dato encontrados en anexos e instructivos. El literal original se conserva en tipo_dato_declarado.")
skos("obligatoriedad","Obligatoriedad normalizada",[("obligatorio","Obligatorio","El campo debe diligenciarse siempre."),("condicional","Condicional","Obligatorio según condición descrita en observaciones."),("opcional","Opcional","Diligenciamiento no exigido."),("sin-dato","Sin dato","El documento fuente no lo declara.")],"Normalización de los literales de obligatoriedad. El literal original se conserva en obligatoriedad_declarada.")
skos("calidad_correspondencia","Calidad de correspondencia variable→formato de catálogo",[("exacta","Exacta","El nombre del formato en el documento coincide exactamente (normalizado) con uno del catálogo del portal."),("sin-cruce","Sin cruce","No hay coincidencia exacta; el formato puede estar entre los no catalogados (H9).")],"Filtro obligatorio antes de usar el nivel variable (H11).")
skos("clasificacion_sensibilidad","Clasificación de sensibilidad (propuesta)",[("publico-propuesto","Público (propuesto)","Sin indicios de dato personal; pendiente confirmación del steward."),("restringido-propuesto","Restringido (propuesto)","Posible dato personal bajo Ley 1581/2012 por heurística de nombre; pendiente confirmación del steward.")],"Clasificación provisional; ninguna variable se considera clasificada hasta la validación del steward del dominio.")

# ---------- datapackage.json ----------
def F(name,type_,desc,**k):
    o={"name":name,"type":type_,"description":desc}; o.update(k); return o
NORMA_FK={"fields":"id_norma","reference":{"resource":"norma","fields":"id_norma"}}
FMT_FK={"fields":"id_formato","reference":{"resource":"formato","fields":"id_formato"}}
res=[]
def R(name,title,desc,fields,pk=None,fks=None,extra=None):
    r={"name":name,"path":f"data/{name}.csv","title":title,"description":desc,"format":"csv","mediatype":"text/csv","encoding":"utf-8",
       "dialect":{"delimiter":",","header":True},"schema":{"fields":fields,"missingValues":[""]}}
    if pk: r["schema"]["primaryKey"]=pk
    if fks: r["schema"]["foreignKeys"]=fks
    if extra: r.update(extra)
    res.append(r)
R("servicio","Servicios y ejes de reporte","Servicios públicos domiciliarios y ejes transversales del universo CRA.",
  [F("id_servicio","string","Identificador estable (vocab/servicio.ttl)",constraints={"required":True}),F("descripcion","string","Descripción"),F("regulador","string","Entidad reguladora"),F("valido_desde","date","Inicio de vigencia del registro (pendiente)"),F("valido_hasta","date","Fin de vigencia (vacío = vigente)")],pk=["id_servicio"])
R("norma","Normas que originan la obligación de reporte","Resoluciones y circulares registradas en el portal SUI para el universo CRA.",
  [F("id_norma","string","Id estable = id del portal SUI",constraints={"required":True}),F("nombre","string","Nombre tal como aparece en el portal"),F("tipo","string","RESOLUCION | CIRCULAR | OTRO"),F("emisor","string","Entidad emisora"),F("anio","year","Año de expedición"),F("aplica_aaa","boolean","Aplica a acueducto, alcantarillado o aseo"),F("en_arbol_servicios","boolean","Aparece en el árbol Servicio→Norma del portal"),F("estado_vigencia","string","vigente-declarada | vigente-parcial | derogada",constraints={"enum":["vigente-declarada","vigente-parcial","derogada"]}),F("observacion_vigencia","string","Justificación del estado"),F("fuente","string","Procedencia"),F("valido_desde","date","Inicio de vigencia"),F("valido_hasta","date","Fin de vigencia")],pk=["id_norma"])
R("norma_servicio","Norma → servicio","Servicios del universo CRA cubiertos por cada norma.",[F("id_norma","string","FK norma"),F("id_servicio","string","FK servicio")],pk=["id_norma","id_servicio"],fks=[NORMA_FK,{"fields":"id_servicio","reference":{"resource":"servicio","fields":"id_servicio"}}])
R("formato","Formatos de reporte (catálogo del portal)","Formatos del universo CRA levantados del portal SUI. Cifra piso: el barrido llegó al id 1355; los esquemas referencian ids hasta 6097 (H9).",
  [F("id_formato","string","Id estable = id del portal (parámetro tab)",constraints={"required":True}),F("nombre","string","Nombre normalizado (mojibake corregido, H7)"),F("id_norma","string","FK norma; vacío si sin norma (H3)"),F("norma_declarada","string","Nombre de norma tal como lo declara el portal"),F("dominio_funcional","string","vocab/dominio_funcional.ttl",constraints={"enum":list(DOMDEF)}),F("tipo_reporte","string","ESTRUCTURADO | DOCUMENTAL",constraints={"enum":["ESTRUCTURADO","DOCUMENTAL"]}),F("estado_vigencia","string","vocab/estado_vigencia.ttl",constraints={"enum":["vigente-declarada","vigente-parcial-verificar","derogada-pendiente-reasignacion","sin-norma"]}),F("n_tablas","integer","Tablas físicas asociadas"),F("n_variables_documentadas","integer","Variables con cruce exacto (H11)"),F("hallazgos","string","Ids de registro_calidad separados por ;"),F("fuente","string","Procedencia"),F("valido_desde","date","Inicio de vigencia"),F("valido_hasta","date","Fin de vigencia")],pk=["id_formato"],fks=[NORMA_FK])
R("formato_servicio","Formato → servicio","Servicios del universo CRA a los que aplica cada formato.",[F("id_formato","string","FK formato"),F("id_servicio","string","FK servicio")],pk=["id_formato","id_servicio"],fks=[FMT_FK,{"fields":"id_servicio","reference":{"resource":"servicio","fields":"id_servicio"}}])
R("tabla_sui","Tablas físicas del SUI","Tablas de la base de datos del SUI que reciben formatos estructurados. Sus columnas no son accesibles (H1).",
  [F("nombre_tabla","string","Nombre físico; id estable",constraints={"required":True}),F("descripcion","string","Descripción del portal; vacía = H5"),F("n_formatos","integer","Formatos que la alimentan"),F("compartida","boolean","Alimentada por más de un formato (H8)"),F("hallazgos","string","Ids de registro_calidad"),F("columnas_disponibles","boolean","Siempre false en esta versión (H1)"),F("motivo_sin_columnas","string","Causa"),F("fuente","string","Procedencia")],pk=["nombre_tabla"])
R("formato_tabla","Formato → tabla física","Relación de carga declarada por el portal.",[F("id_formato","string","FK formato"),F("nombre_tabla","string","FK tabla_sui")],pk=["id_formato","nombre_tabla"],fks=[FMT_FK,{"fields":"nombre_tabla","reference":{"resource":"tabla_sui","fields":"nombre_tabla"}}])
R("documento_tecnico","Documentos técnicos fuente del nivel variable","Anexos técnicos e instructivos de cargue de la SSPD/MVCT de los que se extrajeron las variables.",
  [F("id_documento","string","Id estable del documento",constraints={"required":True}),F("norma","string","Norma que lo expide"),F("id_norma","string","FK norma si está en el catálogo del portal; vacío en caso contrario"),F("tipo","string","instructivo | anexo tecnico | resolucion"),F("n_formatos","integer","Formatos descritos"),F("n_variables","integer","Variables extraídas"),F("metodos_extraccion","string","Métodos usados"),F("emisor","string","SSPD | MVCT")],pk=["id_documento"])
R("variable_formato","Variables (campos) por formato, según documento técnico","Nivel variable anclado al FORMATO del documento fuente, no a la columna física (H10). Usar calidad_correspondencia y requiere_validacion como filtros obligatorios.",
  [F("id_variable","string","Id estable VF-<hash8>(documento|formato|orden|nombre)",constraints={"required":True}),F("id_documento","string","FK documento_tecnico"),F("id_norma","string","FK norma (vacío si la norma no está en el catálogo del portal)"),F("norma","string","Norma según documento"),F("formato_segun_documento","string","Nombre del formato en el documento"),F("orden","integer","Posición del campo en el formato"),F("nombre_variable","string","Nombre del campo"),F("definicion","string","Definición según documento (ISO 11179: definition)"),F("tipo_dato_declarado","string","Literal original"),F("tipo_dato_normalizado","string","vocab/tipo_dato.ttl",constraints={"enum":["numerico","entero","decimal","alfanumerico","fecha","hora","codificado","archivo","sin-dato"]}),F("longitud","string","Longitud declarada (texto: puede ser rango)"),F("unidad_medida","string","Unidad declarada"),F("obligatoriedad_declarada","string","Literal original"),F("obligatoriedad_normalizada","string","vocab/obligatoriedad.ttl",constraints={"enum":["obligatorio","condicional","opcional","sin-dato"]}),F("valores_admisibles","string","Dominio de valores (texto)"),F("segmento_prestador","string","Segmento al que aplica (serie IUS)"),F("observaciones","string","Reglas de validación y notas"),F("id_formato_catalogo","string","Ids de formato del portal con cruce exacto, separados por ;"),F("calidad_correspondencia","string","vocab/calidad_correspondencia.ttl",constraints={"enum":["exacta","sin-cruce"]}),F("clasificacion_sensibilidad","string","vocab/clasificacion_sensibilidad.ttl (propuesta, H13)",constraints={"enum":["publico-propuesto","restringido-propuesto"]}),F("motivo_clasificacion","string","Patrón que activó la clasificación"),F("metodo_extraccion","string","PDF_TABLA | PDF_NARRATIVO | WEBFETCH_LECTOR",constraints={"enum":["PDF_TABLA","PDF_NARRATIVO","WEBFETCH_LECTOR"]}),F("pagina","string","Página del PDF de la que se leyó"),F("requiere_validacion","boolean","true si metodo_extraccion = WEBFETCH_LECTOR (H12)"),F("hallazgos","string","Ids de registro_calidad")],pk=["id_variable"],fks=[{"fields":"id_documento","reference":{"resource":"documento_tecnico","fields":"id_documento"}}])
R("variable_tabla","Columnas físicas del SUI (definida, vacía)","Entidad reservada para el catálogo de metadatos a nivel columna que solo la SSPD puede entregar (H1). Se mantiene vacía a propósito: fusionarla con variable_formato produciría un mapeo inventado.",
  [F("id_columna","string","Id estable"),F("nombre_tabla","string","FK tabla_sui"),F("nombre_columna","string","Nombre físico"),F("definicion","string","Definición"),F("tipo_dato","string","Tipo físico"),F("longitud","string","Longitud"),F("obligatoriedad","string","Nulabilidad"),F("dominio","string","FK dominio_valor"),F("llave","string","PK | FK | ninguna"),F("id_variable_formato","string","FK variable_formato confirmada por SSPD"),F("fuente","string","Procedencia"),F("valido_desde","date","Inicio"),F("valido_hasta","date","Fin")],pk=["id_columna"],fks=[{"fields":"nombre_tabla","reference":{"resource":"tabla_sui","fields":"nombre_tabla"}}])
R("dominio_valor","Dominios de valores (tablas de codificación)","Reservada para los 93 códigos extraídos de los anexos de codificación; el archivo fuente no está aún en el repositorio del proyecto y se incorporará en la siguiente versión.",
  [F("id_dominio","string","Id del dominio"),F("codigo","string","Código"),F("etiqueta","string","Etiqueta"),F("definicion","string","Definición"),F("fuente_normativa","string","Anexo que lo define"),F("valido_desde","date","Inicio"),F("valido_hasta","date","Fin")],pk=["id_dominio","codigo"])
R("linaje","Linaje norma → formato → tabla → variable","Cada arista de trazabilidad con la calidad del eslabón (modelo simplificado de PROV-O: origen wasDerivedFrom destino).",
  [F("origen_tipo","string","norma | formato"),F("origen_id","string","Id del origen"),F("destino_tipo","string","formato | tabla_sui | variable_formato"),F("destino_id","string","Id del destino"),F("relacion","string","exige | alimenta | contiene"),F("calidad","string","declarada-portal | sin-norma | cruce-nombre-exacto"),F("fuente","string","Procedencia de la arista")])
R("registro_calidad","Registro de hallazgos de calidad (ISO/IEC 25012)","Hallazgos H1–H13 con dimensión de calidad, severidad, alcance, estado y acción.",
  [F("id_hallazgo","string","Id",constraints={"required":True}),F("severidad","string","alta | media | baja | informativa"),F("dimension_iso25012","string","Dimensiones afectadas separadas por ;"),F("descripcion","string","Descripción"),F("entidad_afectada","string","Recurso afectado"),F("registros_afectados","string","Conteo si aplica"),F("estado","string","abierto | mitigado | documentado"),F("accion","string","Acción de remediación")],pk=["id_hallazgo"])

dp={"$schema":"https://datapackage.org/profiles/2.0/datapackage.json","name":"diccionario-sui-cra","title":"Diccionario de datos regulatorio del SUI · universo CRA",
 "version":VER,"created":FECHA+"T00:00:00Z",
 "description":"Modelo de metadatos (capa sui_meta) del Sistema Único de Información de Servicios Públicos (SUI) para el universo misional de la Comisión de Regulación de Agua Potable y Saneamiento Básico: servicios, normas, formatos, tablas físicas, documentos técnicos y variables, con linaje y registro de calidad. Corte de extracción: "+CORTE+". Todas las cifras de cobertura son un piso (H9).",
 "keywords":["SUI","SSPD","CRA","acueducto","alcantarillado","aseo","diccionario de datos","metadatos","ISO 11179","DCAT"],
 "homepage":"http://www.sui.gov.co/DiccionarioConsultaV2/",
 "licenses":[{"name":"CC-BY-4.0","title":"Creative Commons Attribution 4.0","path":"https://creativecommons.org/licenses/by/4.0/"}],
 "sources":[{"title":"Diccionario de Variables SUI (SSPD) - portal DiccionarioConsultaV2","path":"http://www.sui.gov.co/DiccionarioConsultaV2/"},{"title":"Anexos técnicos e instructivos de cargue SSPD/MVCT (Res. 20171300039945/2017, 20211000316965/2021, 20221000284385/2022, MVCT 276/2016, 20201000034455/2020, 20241000606485/2024, 20261000681915/2026)"}],
 "contributors":[{"title":"CRA - Asesor Grado 15 con funciones de CIO","roles":["author","publisher"]}],
 "cra:gobierno":{"steward_negocio":"POR ASIGNAR por dominio funcional (ver README)","custodio_tecnico":"Oficina TIC CRA","clasificacion_por_defecto":"publico-propuesto","marco":["ISO/IEC 11179","DAMA-DMBOK","ISO/IEC 25012","DCAT / lineamiento datos abiertos MinTIC (Res. 1519/2020)","Frictionless Data Package / Table Schema","SKOS","Ley 1581/2012"],"fecha_corte_extraccion":CORTE},
 "resources":res}
json.dump(dp,open(OUT+"datapackage.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
print({r["name"]:sum(1 for _ in open(OUT+r["path"],encoding="utf-8"))-1 for r in res})
print("PII propuestos:",sum(1 for r in vf if r["clasificacion_sensibilidad"].startswith("restringido")))
