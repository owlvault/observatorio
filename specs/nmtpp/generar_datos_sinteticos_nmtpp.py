# -*- coding: utf-8 -*-
"""
generar_datos_sinteticos_nmtpp.py
Genera specs/nmtpp/datos-sinteticos-prototipo.json y su espejo JS para el prototipo
del tablero NMTPP (Res. CRA 1038 de 2026).

*** DATOS SINTÉTICOS — NO SON INFORMACIÓN REAL DE NINGÚN PRESTADOR ***
- Nombres de prestadores y municipios ficticios ("Sintético").
- Códigos DIVIPOLA: departamento real + municipio ficticio 9xx (no existen).
- Los PARÁMETROS REGULATORIOS se leen de parametros-res-1038.json (reales, de la norma).
- Los ESTADOS se calculan con las reglas de specs/prototipo-tablero-nmtpp.md §6 y se guardan
  en 'estados_esperados' como oráculo de las pruebas de aceptación del prototipo.

Uso:  python generar_datos_sinteticos_nmtpp.py      (determinista, semilla 1038)
"""
import json, random, os, datetime as dt

HERE = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(HERE, "parametros-res-1038.json"), encoding="utf-8"))
rnd = random.Random(1038)

FECHA_CORTE_SIMULADA = "2028-09-15"   # 'hoy' del escenario: hay datos 2027, recálculo 2028 e ISE 2029
ANIO_OBS = 2027
# Aclaraciones: todas abiertas en el escenario base (banderas del prototipo apagadas)
Q_ABIERTAS = [f"Q-NMTPP-{i:02d}" for i in range(1, 15)]

DEPTOS = [("25","Cundinamarca"),("15","Boyacá"),("68","Santander"),("54","Norte de Santander"),
          ("52","Nariño"),("19","Cauca"),("41","Huila"),("73","Tolima"),("27","Chocó"),
          ("88","San Andrés, Providencia y Santa Catalina"),("23","Córdoba"),("50","Meta"),
          ("86","Putumayo"),("18","Caquetá"),("05","Antioquia"),("17","Caldas")]

def sub_de(n, seg):
    for s in next(x for x in P["segmentos"] if x["id"] == seg)["subsegmentos"]:
        lo, hi = s["min_exclusivo"], s["max_inclusivo"]
        if (lo is None or n > lo) and (hi is None or n <= hi):
            return s["id"]

# ---------------- definición de los 40 prestadores sintéticos ----------------
# (segmento, rango de suscriptores) y casos especiales forzados por índice
PLAN = ([("S1", 3300, 4950)]*4 + [("S1", 1450, 3150)]*6 + [("S1", 650, 1380)]*6 + [("S1", 150, 590)]*6 +
        [("S2", 1650, 2600)]*4 + [("S2", 520, 1580)]*5 + [("S2", 310, 495)]*4 + [("S2", 40, 290)]*5)
assert len(PLAN) == 40

ESPECIALES = {
  # idx: dict de marcas del escenario
  0:  {"condiciones": ["INSULAR"], "depto": "88"},
  4:  {"discrepancia_regla": True},                  # al > ac cruza umbral 1.400
  5:  {"condiciones": ["PDET_ZOMAC"], "segunda_aps_especial": True},
  7:  {"declarado_distinto": True},
  9:  {"sin_estudio": True},
  11: {"condiciones": ["TOMA_POSESION"]},
  12: {"recalculo_fuera_ventana": True},
  13: {"facturacion": "bimestral"},
  15: {"no_reporta_2027": True},
  17: {"regresion": True},
  18: {"condiciones": ["IVH"]},
  20: {"sin_estudio": True},
  22: {"opcion_s2_a_s1": True},
  24: {"esquema_diferencial": "rural"},
  26: {"no_reporta_2027": True},
  28: {"condiciones": ["PDET_ZOMAC", "IPM"]},
  30: {"sin_estudio": True},
  31: {"recalculo_fuera_ventana": True},
  33: {"no_reporta_2027": True},
  35: {"regresion": True},
  37: {"opcion_s2_a_s1": True},
  39: {"sin_linea_base_continuidad": True},
}

def r1(x): return round(x, 1)
def r2(x): return round(x, 2)

def estudio(pid, tipo, anio, fecha):
    return {"estudio_id": f"EST-{pid}-{tipo[:3].upper()}-{anio}", "tipo": tipo, "anio_tarifario": anio,
            "fecha_recepcion_cra": fecha, "radicado_cra": f"SINT-{anio}-{rnd.randint(10000,99999)}"}

prestadores = []
for i, (seg, lo, hi) in enumerate(PLAN):
    esp = ESPECIALES.get(i, {})
    pid = f"SINT-{i+1:04d}"
    es_gc = seg == "S2"
    ac = rnd.randint(lo, hi)
    al = int(ac * rnd.uniform(0.55, 0.95)) if seg == "S1" or rnd.random() < 0.35 else 0
    if esp.get("discrepancia_regla"):
        ac, al = 1330, 1480
    opcion = bool(esp.get("opcion_s2_a_s1"))
    seg_vig = "S1" if (es_gc and opcion) else seg
    sub_mayor = sub_de(max(ac, al), seg_vig)
    sub_acued = sub_de(ac, seg_vig)
    sub_decl = sub_mayor
    if esp.get("declarado_distinto"):
        order = [s["id"] for s in next(x for x in P["segmentos"] if x["id"] == seg_vig)["subsegmentos"]]
        k = order.index(sub_mayor); sub_decl = order[min(k+1, 3)]
    NO_INSULAR = [d for d in DEPTOS if d[0] != "88"]
    dcode, dname = next(d for d in DEPTOS if d[0] == esp["depto"]) if "depto" in esp else NO_INSULAR[i % len(NO_INSULAR)]
    mun = f"{dcode}9{i+1:02d}"
    tipo_nom = "Asociación de Usuarios del Acueducto Sintético" if es_gc else rnd.choice(["Empresa de Servicios Públicos Sintética", "Empresas Públicas Sintéticas", "Aguas Sintéticas"])
    p = {
      "provider_id": pid, "sintetico": True,
      "nombre": f"{tipo_nom} {i+1:02d}" + ("" if es_gc else " S.A. E.S.P."),
      "es_gestor_comunitario": es_gc, "segmento_origen": seg, "opcion_s2_a_s1": opcion,
      "segmento_vigente": seg_vig,
      "suscriptores_ac_2024": ac, "suscriptores_al_2024": al,
      "pct_rurales_2024": r1(rnd.uniform(60, 100) if es_gc else rnd.uniform(0, 35)),
      "subsegmento_calc_regla_mayor": sub_mayor, "subsegmento_calc_regla_acued": sub_acued,
      "subsegmento_declarado": None if esp.get("sin_estudio") else sub_decl,
      "subsegmento_vigente": sub_mayor,
      "regimen": "libertad_regulada" if seg_vig == "S1" else "libertad_vigilada",
      "departamento": {"codigo": dcode, "nombre": dname},
      "facturacion": esp.get("facturacion", "mensual"),
      "aps": [], "estudios": [], "tarifas": [], "ise": [], "incentivos": [],
      "marcas_escenario": sorted(esp.keys()),
    }
    # APS
    aps = [{"service_area_id": f"{pid}-APS1", "divipola_code": mun, "municipio": f"Municipio Sintético {mun}",
            "zona": "rural" if es_gc else rnd.choice(["urbana", "urbana_rural"]),
            "condiciones_especiales": [] if esp.get("segunda_aps_especial") else esp.get("condiciones", []),
            "esquema_diferencial": esp.get("esquema_diferencial"), "reportada_sspd": not esp.get("sin_estudio")}]
    if esp.get("segunda_aps_especial"):
        m2 = f"{dcode}9{i+41:02d}"
        aps.append({"service_area_id": f"{pid}-APS2", "divipola_code": m2, "municipio": f"Municipio Sintético {m2}",
                    "zona": "urbana_rural", "condiciones_especiales": esp["condiciones"], "esquema_diferencial": None, "reportada_sspd": True})
    p["aps"] = aps
    # Estudios
    if not esp.get("sin_estudio"):
        p["estudios"].append(estudio(pid, "inicial", 2027, f"2026-{rnd.randint(10,12):02d}-{rnd.randint(1,28):02d}"))
        f28 = f"2028-06-{rnd.randint(2,28):02d}" if esp.get("recalculo_fuera_ventana") else f"2028-{rnd.randint(2,5):02d}-{rnd.randint(1,28):02d}"
        p["estudios"].append(estudio(pid, "recalculo", 2028, f28))
    prestadores.append(p)

# ---------------- línea base, metas declaradas y observados por APS ----------------
def especial(a): return len(a["condiciones_especiales"]) > 0

for i, p in enumerate(prestadores):
    esp = ESPECIALES.get(i, {})
    s1 = p["segmento_vigente"] == "S1"
    tiene_estudio = len(p["estudios"]) > 0
    for a in p["aps"]:
        reg_s2 = (not s1) or especial(a)
        lb = {
          "MICROMEDICION": r1(rnd.uniform(55, 97) if s1 else rnd.uniform(20, 85)),
          "MACROMEDICION": r1(rnd.choice([0, 25, 50, 66.7, 100]) if (s1 and not reg_s2) else rnd.choice([0, 0, 100])),
          "COBERTURA": r1(rnd.uniform(78, 99)) if s1 else None,
          "IPUF": r1(rnd.uniform(3.5, 14)) if s1 else None,
          # continuidad: S1 en h/día (fórmula del anexo a), S2 y régimen especial en %
          "CONTINUIDAD": (r1(rnd.uniform(16, 23.3)) if (s1 and not reg_s2) else r1(rnd.uniform(55, 96))),
        }
        if esp.get("sin_linea_base_continuidad"): lb["CONTINUIDAD"] = None
        a["regimen_evaluacion"] = "S2" if reg_s2 else "S1"
        a["unidad_continuidad"] = "h/día" if a["regimen_evaluacion"] == "S1" else "%"
        a["linea_base"] = lb if tiene_estudio else {k: None for k in lb}
        # metas declaradas (solo si hay estudio): senda propia 2027..2031
        md = {}
        if tiene_estudio:
            for ind, v0, tgt in (("MICROMEDICION", lb["MICROMEDICION"], 100.0), ("COBERTURA", lb["COBERTURA"], 100.0)):
                if v0 is None: continue
                md[ind] = {str(2027+k): r1(v0 + (tgt - v0) * (k+1) / 5) for k in range(5)}
            if lb["IPUF"] is not None and lb["IPUF"] > 6:
                md["IPUF"] = {str(2027+k): r1(lb["IPUF"] - (lb["IPUF"] - 6) * (k+1) / 5) for k in range(5)}
        a["metas_declaradas"] = md
        # observados 2027
        if esp.get("no_reporta_2027") or not tiene_estudio and rnd.random() < 0.5:
            obs = {"MICROMEDICION": None, "MACROMEDICION": None, "COBERTURA": None, "IPUF": None, "CONTINUIDAD": None, "PSH": None}
        else:
            base = a["linea_base"] if tiene_estudio else {"MICROMEDICION": r1(rnd.uniform(40, 95)), "MACROMEDICION": 0, "COBERTURA": r1(rnd.uniform(80, 98)) if s1 else None, "IPUF": r1(rnd.uniform(4, 13)) if s1 else None, "CONTINUIDAD": r1(rnd.uniform(18, 23)) if (s1 and not reg_s2) else r1(rnd.uniform(60, 95))}
            d = -1 if esp.get("regresion") else 1
            mic = min(100.0, r1((base["MICROMEDICION"] or 60) + d * rnd.uniform(1, 12)))
            if rnd.random() < 0.25: mic = 100.0
            mac = base["MACROMEDICION"] if base["MACROMEDICION"] is not None else 0
            if rnd.random() < 0.45: mac = 100.0
            obs = {
              "MICROMEDICION": mic,
              "MACROMEDICION": r1(mac),
              "COBERTURA": (min(100.0, r1(base["COBERTURA"] + d * rnd.uniform(0.2, 3)))) if base["COBERTURA"] is not None else None,
              "IPUF": (r1(max(1.5, base["IPUF"] - d * rnd.uniform(-0.8, 2.5))) if (base["IPUF"] is not None and mac > 0) else None),
              "CONTINUIDAD": (r1(min(24, (base["CONTINUIDAD"] or 20) + d * rnd.uniform(0.1, 0.9))) if a["unidad_continuidad"] == "h/día" else r1(min(100, (base["CONTINUIDAD"] or 70) + d * rnd.uniform(0.5, 6)))),
              # IRCA: NO se genera. Sin fuente confirmada (Q-NMTPP-06); el prototipo no debe mostrar valores.
              "PSH": 100.0 if rnd.random() < 0.4 else 0.0,
            }
        a["observados"] = {str(ANIO_OBS): obs}

# ---------------- tarifas por estrato y uso (dic-2026 Res. 825 y 2027 Res. 1038) ----------------
ESTR = ["E1","E2","E3","E4","E5","E6","COMERCIAL"]
for p in prestadores:
    s1 = p["segmento_vigente"] == "S1"
    for a in p["aps"]:
        cf0 = rnd.randint(4500, 9500) if s1 else rnd.randint(3000, 8000)
        cc0 = rnd.randint(1100, 2600) if s1 else rnd.randint(700, 2000)
        var = rnd.uniform(0.08, 0.28) if s1 else rnd.uniform(-0.02, 0.14)
        for e in ESTR:
            f = {"E1":0.5,"E2":0.6,"E3":0.85,"E4":1.0,"E5":1.5,"E6":1.6,"COMERCIAL":1.5}[e]
            for marco, periodo, mult in (("CRA-825-2017","2026-12",1.0),("CRA-1038-2026","2027-01",1+var)):
                if marco == "CRA-1038-2026" and not p["estudios"]: continue
                p["tarifas"].append({"service_area_id": a["service_area_id"], "marco_origen": marco, "periodo": periodo, "estrato_uso": e,
                                     "cargo_fijo": int(round(cf0*mult*f, -1)), "cargo_consumo": r2(cc0*mult*f),
                                     "base_year": int(periodo[:4]), "monetary_condition": "corriente"})

# ---------------- ISE 2029 (evaluado 2027) e incentivos — SOLO S1 ----------------
W = P["ise"]["ponderaciones_acueducto"]
PISO_2029 = next(x["piso_pct"] for x in P["ise"]["transicion_piso_reconocimiento"] if x["calendario"] == 2029)
FECHA_PUB = "2028-08-26"
for p in prestadores:
    if p["segmento_vigente"] != "S1": continue
    a = p["aps"][0]
    if "INSULAR" in a["condiciones_especiales"]:
        p["ise"].append({"servicio":"acueducto","nivel":"aps","service_area_id":a["service_area_id"],"anio_aplicacion":2029,"anio_evaluado":2027,
                         "no_aplica_motivo":"zona insular","fecha_publicacion":FECHA_PUB,"acto_ref":"PUBLICACIÓN SINTÉTICA CRA ISE-2029"})
        continue
    ind = {k: r1(rnd.uniform(35, 98)) for k in ["macromedicion","reporte_y_calidad_agua_potable","continuidad","micromedicion_efectiva","atencion_pqr_acueducto","costo_administrativo_mas_operativo_promedio_por_suscriptor"]}
    dt_ = r2(sum(ind[k]*v/100 for k, v in W["tecnica"]["indicadores"].items()))
    da_ = r2(sum(ind[k]*v/100 for k, v in W["administrativa"]["indicadores"].items()))
    df_ = ind["costo_administrativo_mas_operativo_promedio_por_suscriptor"]
    ise = r2(dt_*W["tecnica"]["peso"]/100 + da_*W["administrativa"]["peso"]/100 + df_*W["financiera"]["peso"]/100)
    base = ise if ise > 70 else 70.0
    pct = max(base, PISO_2029)
    inc = []
    obs = a["observados"]["2027"]
    if obs["IPUF"] is not None and obs["IPUF"] <= 6: inc.append(("perdidas","CMOG",5.0))
    if obs["MICROMEDICION"] == 100.0: inc.append(("micromedicion","CMA",2.5))
    if rnd.random() < 0.25: inc.append(("asociatividad","CMA",2.5))
    if rnd.random() < 0.35: inc.append(("buen_gobierno","CMA",2.5))
    if obs["MICROMEDICION"] is not None and rnd.random() < 0.5: inc.append(("reporte","CMA",2.5))
    cmog = min(100.0, pct + sum(x[2] for x in inc if x[1]=="CMOG"))
    cma  = min(100.0, pct + sum(x[2] for x in inc if x[1]=="CMA"))
    p["ise"].append({"servicio":"acueducto","nivel":"aps","service_area_id":a["service_area_id"],"anio_aplicacion":2029,"anio_evaluado":2027,
        "ise_calculado":ise,"dim_tecnica":dt_,"dim_administrativa":da_,"dim_financiera":df_,"indicadores":ind,
        "pct_eficiencia_aplicable":r2(pct),"piso_anio":PISO_2029,"ise_con_incentivos_cmog":r2(cmog),"ise_con_incentivos_cma":r2(cma),
        "fecha_publicacion":FECHA_PUB,"acto_ref":"PUBLICACIÓN SINTÉTICA CRA ISE-2029"})
    for t, c, pc in inc:
        p["incentivos"].append({"servicio":"acueducto","anio_aplicacion":2029,"anio_evaluado":2027,"tipo":t,"componente":c,"porcentaje":pc,"acto_ref":"PUBLICACIÓN SINTÉTICA CRA ISE-2029"})

# ---------------- ESTADOS ESPERADOS (reglas del prototipo §6) ----------------
def anio_cal(n): return P["marco_tarifario"]["anio_tarifario_1"] + n - 1

def estado(p, a, code, anio):
    s1 = p["segmento_vigente"] == "S1"; reg = a["regimen_evaluacion"]
    obs = a["observados"][str(anio)]
    md = a["metas_declaradas"]; sub = p["subsegmento_vigente"]
    def fin(st, meta=None, origen=None, art=None, q=None, val=None, unidad=None):
        return {"indicator_code": code, "provider_id": p["provider_id"], "service_area_id": a["service_area_id"], "anio_tarifario": anio,
                "estado": st, "meta_aplicada": meta, "origen_meta": origen, "articulo": art, "q_bloqueante": q, "valor_observado": val, "unidad": unidad}
    if code.endswith("-CAL"):
        return fin("sin fuente confirmada", art="2.1.1.1.2.1.2 par. 3" if s1 else "2.1.1.1.3.1.2 par. 3", q="Q-NMTPP-06", val=None, unidad="%")
    if code.endswith("-CON"):
        v = obs["CONTINUIDAD"]
        if v is None: return fin("no reportó", unidad=a["unidad_continuidad"])
        q = "Q-NMTPP-01, Q-NMTPP-02" if reg == "S1" else "Q-NMTPP-02"
        return fin("meta pendiente de aclaración normativa", art="2.1.1.1.2.1.2" if reg=="S1" else "2.1.1.1.3.1.2", q=q, val=v, unidad=a["unidad_continuidad"])
    if code.endswith("-MIC"):
        v = obs["MICROMEDICION"]
        if v is None: return fin("no reportó", unidad="%")
        if reg == "S2" and s1:  # APS especial de prestador S1: meta autoproyectada hacia estándar S2 (art. 2.1.1.1.4.1 par. 5)
            m = md.get("MICROMEDICION", {}).get(str(anio))
            if v >= 100: return fin("meta cumplida", 100, "regulatoria", "2.1.1.1.4.1 par. 5", val=v, unidad="%")
            if m is None: return fin("meta no declarada", art="2.1.1.1.4.1 par. 5", val=v, unidad="%")
            return fin("en trayectoria" if v >= m else "fuera de trayectoria", m, "declarada", "2.1.1.1.4.1 par. 5", val=v, unidad="%")
        key = "MICROMEDICION" if s1 else "MICROMEDICION_RESIDENCIAL"
        par = P["metas_acueducto"]["S1" if s1 else "S2"]["indicadores"][key]["subsegmentos"][sub]
        ac = anio_cal(par["anio_cumplimiento"]); art = "2.1.1.1.2.1.2" if s1 else "2.1.1.1.3.1.2"
        if anio == ac: return fin("meta cumplida" if v >= 100 else "meta no alcanzada en el año de cumplimiento", 100, "regulatoria", art, val=v, unidad="%")
        if anio > ac: return fin("meta cumplida" if v >= 100 else "fuera de trayectoria", 100, "regulatoria", art, val=v, unidad="%")
        if v >= 100: return fin("meta cumplida", 100, "regulatoria", art, val=v, unidad="%")
        m = md.get("MICROMEDICION", {}).get(str(anio))
        if m is None: return fin("no exigible aún", art=art, q="Q-NMTPP-08", val=v, unidad="%")
        return fin("en trayectoria" if v >= m else "fuera de trayectoria", m, "declarada", art, q="Q-NMTPP-08", val=v, unidad="%")
    if code.endswith("-MAC"):
        v = obs["MACROMEDICION"]
        if v is None: return fin("no reportó", unidad="%")
        if reg == "S2" and s1:
            return fin("meta cumplida" if v >= 100 else "no exigible aún", None, "regulatoria", "2.1.1.1.4.1 par. 3", val=v, unidad="%")
        par = P["metas_acueducto"]["S1" if s1 else "S2"]["indicadores"]["MACROMEDICION"]["subsegmentos"][sub]
        ac = anio_cal(par["anio_cumplimiento"]); art = "2.1.1.1.2.1.2" if s1 else "2.1.1.1.3.1.2"
        if anio == ac: return fin("meta cumplida" if v >= 100 else "meta no alcanzada en el año de cumplimiento", 100, "regulatoria", art, val=v, unidad="%")
        if anio > ac: return fin("meta cumplida" if v >= 100 else "fuera de trayectoria", 100, "regulatoria", art, val=v, unidad="%")
        return fin("meta cumplida" if v >= 100 else "no exigible aún", 100, "regulatoria", art, val=v, unidad="%")
    if code == "NMTPP-S1-COB":
        v = obs["COBERTURA"]
        if v is None: return fin("no reportó", unidad="%")
        if v >= 100: return fin("meta cumplida", 100, "regulatoria", "2.1.1.1.2.1.2", val=v, unidad="%")
        m = md.get("COBERTURA", {}).get(str(anio))
        if m is None: return fin("meta no declarada", art="2.1.1.1.2.1.2", val=v, unidad="%")
        return fin("en trayectoria" if v >= m else "fuera de trayectoria", m, "declarada", "2.1.1.1.2.1.2", val=v, unidad="%")
    if code == "NMTPP-S1-PER":
        v = obs["IPUF"]
        if v is None: return fin("no reportó", unidad="m3/suscriptor/mes")
        if p["facturacion"] == "bimestral": return fin("meta pendiente de aclaración normativa", art="Anexo 6.2.1.10 a)", q="Q-NMTPP-07", val=v, unidad="m3/suscriptor/mes")
        if v <= 6: return fin("meta cumplida", 6, "regulatoria", "2.1.1.1.2.1.2 par. 7", val=v, unidad="m3/suscriptor/mes")
        m = md.get("IPUF", {}).get(str(anio))
        if m is None: return fin("meta no declarada", art="2.1.1.1.2.1.2 par. 7", val=v, unidad="m3/suscriptor/mes")
        return fin("en trayectoria" if v <= m else "fuera de trayectoria", m, "declarada", "2.1.1.1.2.1.2 par. 7", val=v, unidad="m3/suscriptor/mes")
    if code == "NMTPP-S1-PSH":
        if sub != "S1-1": return fin("no aplica", art="2.1.1.1.2.1.2")
        v = obs["PSH"]
        if v is None: return fin("no reportó", unidad="binario")
        ac = anio_cal(P["metas_acueducto"]["S1"]["indicadores"]["PSH"]["subsegmentos"]["S1-1"]["anio_cumplimiento"])
        if v >= 100: return fin("meta cumplida", 100, "regulatoria", "2.1.1.1.2.1.2", val=v, unidad="binario")
        return fin("no exigible aún" if anio < ac else "meta no alcanzada en el año de cumplimiento", 100, "regulatoria", "2.1.1.1.2.1.2", val=v, unidad="binario")
    raise ValueError(code)

CODES_S1 = ["NMTPP-S1-CAL","NMTPP-S1-MIC","NMTPP-S1-CON","NMTPP-S1-MAC","NMTPP-S1-COB","NMTPP-S1-PER","NMTPP-S1-PSH"]
CODES_S2 = ["NMTPP-S2-CAL","NMTPP-S2-MIC","NMTPP-S2-CON","NMTPP-S2-MAC"]
estados = []
regresiones = []
for p in prestadores:
    codes = CODES_S1 if p["segmento_vigente"] == "S1" else CODES_S2
    for a in p["aps"]:
        for c in codes:
            e = estado(p, a, c, ANIO_OBS)
            estados.append(e)
        lb, ob = a["linea_base"], a["observados"][str(ANIO_OBS)]
        reg = [k for k in ("MICROMEDICION","MACROMEDICION","COBERTURA","CONTINUIDAD") if lb.get(k) is not None and ob.get(k) is not None and ob[k] < lb[k]]
        if lb.get("IPUF") is not None and ob.get("IPUF") is not None and ob["IPUF"] > lb["IPUF"]: reg.append("IPUF")
        if reg: regresiones.append({"provider_id": p["provider_id"], "service_area_id": a["service_area_id"], "anio_tarifario": ANIO_OBS, "indicadores": reg})

# adopción esperada (corte simulado)
def adop():
    out = {}
    for sub in [s["id"] for sg in P["segmentos"] for s in sg["subsegmentos"]]:
        U = [p for p in prestadores if p["subsegmento_vigente"] == sub]
        E = [p for p in U if any(e["tipo"]=="inicial" for e in p["estudios"])]
        R = [p for p in U if any(e["tipo"]=="recalculo" and "2028-01-01" <= e["fecha_recepcion_cra"] <= "2028-05-31" for e in p["estudios"])]
        out[sub] = {"U": len(U), "ADO01_inicial": len(E), "ADO04_recalculo_2028_en_ventana": len(R),
                    "ADO01_pct": r1(100*len(E)/len(U)) if U else None, "ADO04_pct": r1(100*len(R)/len(U)) if U else None}
    return out

data = {
  "_meta": {
    "id": "datos-sinteticos-prototipo-nmtpp", "sintetico": True,
    "aviso": "DATOS SINTÉTICOS PARA PROTOTIPO — NO SON INFORMACIÓN REAL. Prestadores, municipios, radicados, publicaciones del ISE y valores son ficticios. Los parámetros regulatorios (metas, pisos, porcentajes) sí son los de la Res. CRA 1038 de 2026 y viven en parametros-res-1038.json.",
    "generado_con": "specs/nmtpp/generar_datos_sinteticos_nmtpp.py (semilla 1038)",
    "fecha_generacion": "2026-09-18",
    "fecha_corte_simulada": FECHA_CORTE_SIMULADA,
    "anio_observado": ANIO_OBS,
    "aclaraciones_abiertas": Q_ABIERTAS,
    "banderas": {"continuidad_equivalencia_24h": False},
    "asunciones_del_generador": [
      "Metas declaradas sintéticas: senda lineal de la línea base al estándar en 5 años (solo para poblar el escenario; NO es regla regulatoria, ver Q-NMTPP-08).",
      "Incentivos sumados como puntos porcentuales sobre el porcentaje de eficiencia aplicable, con tope 100 (solo para poblar; ver Q-NMTPP-04 punto 8).",
      "Divipola: departamento real + municipio ficticio 9NN (no existe en DANE)."
    ],
  },
  "parametros_ref": "specs/nmtpp/parametros-res-1038.json",
  "prestadores": prestadores,
  "estados_esperados": estados,
  "regresiones_esperadas": regresiones,
  "adopcion_esperada": adop(),
}

out = os.path.join(HERE, "datos-sinteticos-prototipo.json")
json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
with open(os.path.join(HERE, "datos-sinteticos-prototipo.js"), "w", encoding="utf-8") as fh:
    fh.write("/* ESPEJO JS — DATOS SINTÉTICOS (ver datos-sinteticos-prototipo.json). No editar a mano. */\n")
    fh.write("window.CRA_NMTPP_DATA = " + json.dumps(data, ensure_ascii=False) + ";\n")
    fh.write("window.CRA_NMTPP_PARAMS = " + json.dumps(P, ensure_ascii=False) + ";\n")
print("prestadores", len(prestadores), "estados", len(estados), "regresiones", len(regresiones))
