# Script de generacion de datos canonicos para el MVP del Observatorio NMT (Res. CRA 1032 de 2026)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputJson = Join-Path $scriptDir "data\datos_nmt_prestadores_1032.json"
$outputCsv = Join-Path $scriptDir "data\datos_nmt_prestadores_1032.csv"
$outputJs = Join-Path $scriptDir "js\data_nmt.js"

Write-Host "Iniciando generacion de dataset..."

$prestadoresS1 = @(
    @{ id=1141; nombre="Empresa de Acueducto y Alcantarillado de Bogota - ESP"; sigla="EAAB"; deptoCode="11"; depto="Bogota D.C."; muniCode="11001"; muni="Bogota D.C."; aps="Bogota D.C. y Conurbados"; susc=2385410; lat=4.6097; lng=-74.0817 },
    @{ id=2171; nombre="Empresas Publicas de Medellin E.S.P."; sigla="EPM"; deptoCode="05"; depto="Antioquia"; muniCode="05001"; muni="Medellin"; aps="Valle de Aburra"; susc=1352100; lat=6.2442; lng=-75.5812 },
    @{ id=2187; nombre="Empresas Municipales de Cali E.I.C.E. E.S.P."; sigla="EMCALI"; deptoCode="76"; depto="Valle del Cauca"; muniCode="76001"; muni="Cali"; aps="Cali y Yumbo"; susc=684200; lat=3.4516; lng=-76.5320 },
    @{ id=2244; nombre="Sociedad de Acueducto, Alcantarillado y Aseo de Barranquilla S.A. E.S.P."; sigla="Triple A"; deptoCode="08"; depto="Atlantico"; muniCode="08001"; muni="Barranquilla"; aps="Barranquilla y Conurbados"; susc=612450; lat=10.9685; lng=-74.7813 },
    @{ id=2209; nombre="Aguas de Cartagena S.A. E.S.P."; sigla="Acuacar"; deptoCode="13"; depto="Bolivar"; muniCode="13001"; muni="Cartagena"; aps="Distrito de Cartagena"; susc=318900; lat=10.3910; lng=-75.4794 },
    @{ id=2155; nombre="Acueducto Metropolitano de Bucaramanga S.A. E.S.P."; sigla="AMB"; deptoCode="68"; depto="Santander"; muniCode="68001"; muni="Bucaramanga"; aps="Area Metropolitana Bucaramanga"; susc=298100; lat=7.1193; lng=-73.1227 },
    @{ id=2289; nombre="Aguas Kpital Cucuta S.A. E.S.P. / EIS Cucuta"; sigla="Aguas Kpital"; deptoCode="54"; depto="Norte de Santander"; muniCode="54001"; muni="Cucuta"; aps="San Jose de Cucuta"; susc=215600; lat=7.8939; lng=-72.5078 },
    @{ id=2198; nombre="Empresa de Acueducto y Alcantarillado de Pereira S.A. E.S.P."; sigla="Aguas y Aguas"; deptoCode="66"; depto="Risaralda"; muniCode="66001"; muni="Pereira"; aps="Pereira y Dosquebradas"; susc=178500; lat=4.8133; lng=-75.6961 },
    @{ id=2163; nombre="Empresa Ibaguerena de Acueducto y Alcantarillado IBAL S.A. E.S.P."; sigla="IBAL"; deptoCode="73"; depto="Tolima"; muniCode="73001"; muni="Ibague"; aps="Ibague Urbano"; susc=162300; lat=4.4389; lng=-75.2322 },
    @{ id=2221; nombre="Empresa de Servicios Publicos del Distrito de Santa Marta ESSMAR E.S.P."; sigla="ESSMAR"; deptoCode="47"; depto="Magdalena"; muniCode="47001"; muni="Santa Marta"; aps="Santa Marta Urbano"; susc=134800; lat=11.2408; lng=-74.1990 },
    @{ id=2144; nombre="Aguas de Manizales S.A. E.S.P."; sigla="Aguas de Manizales"; deptoCode="17"; depto="Caldas"; muniCode="17001"; muni="Manizales"; aps="Manizales y Villamaria"; susc=128400; lat=5.0689; lng=-75.5174 },
    @{ id=2177; nombre="Empresa de Obras Sanitarias de Pasto EMPOPASTO S.A. E.S.P."; sigla="EMPOPASTO"; deptoCode="52"; depto="Narino"; muniCode="52001"; muni="Pasto"; aps="Pasto Urbano"; susc=108900; lat=1.2136; lng=-77.2811 }
)

$prestadoresS2Data = @(
    @{ id=3101; nombre="Empresa de Acueducto y Alcantarillado de Villavicencio E.S.P."; sigla="EAAV"; deptoCode="50"; depto="Meta"; muniCode="50001"; muni="Villavicencio"; susc=98400; lat=4.1420; lng=-73.6266 },
    @{ id=3102; nombre="Empresas Publicas de Neiva E.S.P. - Las Ceibas"; sigla="Las Ceibas"; deptoCode="41"; depto="Huila"; muniCode="41001"; muni="Neiva"; susc=92100; lat=2.9273; lng=-75.2819 },
    @{ id=3103; nombre="Empresas Publicas de Armenia E.S.P."; sigla="EPA"; deptoCode="63"; depto="Quindio"; muniCode="63001"; muni="Armenia"; susc=89500; lat=4.5339; lng=-75.6811 },
    @{ id=3104; nombre="Empresa de Servicios Publicos de Valledupar EMDUPAR S.A. E.S.P."; sigla="EMDUPAR"; deptoCode="20"; depto="Cesar"; muniCode="20001"; muni="Valledupar"; susc=87400; lat=10.4631; lng=-73.2532 },
    @{ id=3105; nombre="Veolia Aguas de Monteria S.A. E.S.P."; sigla="Veolia Monteria"; deptoCode="23"; depto="Cordoba"; muniCode="23001"; muni="Monteria"; susc=85600; lat=8.7558; lng=-75.8814 },
    @{ id=3106; nombre="Veolia Sabana S.A. E.S.P."; sigla="Veolia Sincelejo"; deptoCode="70"; depto="Sucre"; muniCode="70001"; muni="Sincelejo"; susc=79200; lat=9.3047; lng=-75.3978 },
    @{ id=3107; nombre="Empresa de Acueducto y Alcantarillado de Popayan S.A. E.S.P."; sigla="Acueducto Popayan"; deptoCode="19"; depto="Cauca"; muniCode="19001"; muni="Popayan"; susc=78400; lat=2.4448; lng=-76.6147 },
    @{ id=3108; nombre="Veolia Aguas de Tunja S.A. E.S.P."; sigla="Veolia Tunja"; deptoCode="15"; depto="Boyaca"; muniCode="15001"; muni="Tunja"; susc=68500; lat=5.5353; lng=-73.3678 },
    @{ id=3109; nombre="AquaOccidente S.A. E.S.P."; sigla="AquaOccidente"; deptoCode="76"; depto="Valle del Cauca"; muniCode="76520"; muni="Palmira"; susc=74300; lat=3.5394; lng=-76.3036 },
    @{ id=3110; nombre="Hidropacifico S.A. E.S.P."; sigla="Hidropacifico"; deptoCode="76"; depto="Valle del Cauca"; muniCode="76109"; muni="Buenaventura"; susc=69100; lat=3.8801; lng=-77.0312 },
    @{ id=3111; nombre="Aguas del Valle del Aburra Norte Bello E.S.P."; sigla="Aguas Bello"; deptoCode="05"; depto="Antioquia"; muniCode="05088"; muni="Bello"; susc=95200; lat=6.3373; lng=-75.5579 },
    @{ id=3112; nombre="Empresa Publica de Servicios de Soacha E.S.P."; sigla="EpSoacha"; deptoCode="25"; depto="Cundinamarca"; muniCode="25754"; muni="Soacha"; susc=98900; lat=4.5807; lng=-74.2178 },
    @{ id=3113; nombre="Empresa de Alcantarillado y Aseo de Floridablanca EMPAS"; sigla="EMPAS Floridablanca"; deptoCode="68"; depto="Santander"; muniCode="68276"; muni="Floridablanca"; susc=64200; lat=7.0622; lng=-73.0864 },
    @{ id=3114; nombre="Empresa de Servicios Publicos de Dosquebradas Serviciudad E.S.P."; sigla="Serviciudad"; deptoCode="66"; depto="Risaralda"; muniCode="66170"; muni="Dosquebradas"; susc=58900; lat=4.8368; lng=-75.6806 },
    @{ id=3115; nombre="Empresas Publicas de Envigado E.S.P."; sigla="EP Envigado"; deptoCode="05"; depto="Antioquia"; muniCode="05266"; muni="Envigado"; susc=67300; lat=6.1759; lng=-75.5917 },
    @{ id=3116; nombre="Empresa de Servicios de Itagui E.S.P."; sigla="ServiItagui"; deptoCode="05"; depto="Antioquia"; muniCode="05360"; muni="Itagui"; susc=72100; lat=6.1706; lng=-75.6111 },
    @{ id=3117; nombre="Piedecuestana de Servicios Publicos E.S.P."; sigla="Piedecuestana"; deptoCode="68"; depto="Santander"; muniCode="68547"; muni="Piedecuesta"; susc=48200; lat=6.9886; lng=-73.0494 },
    @{ id=3118; nombre="Aguas de Giron E.S.P."; sigla="Aguas Giron"; deptoCode="68"; depto="Santander"; muniCode="68307"; muni="Giron"; susc=52400; lat=7.0682; lng=-73.1698 },
    @{ id=3119; nombre="Aqualia Riohacha S.A. E.S.P."; sigla="Aqualia Riohacha"; deptoCode="44"; depto="La Guajira"; muniCode="44001"; muni="Riohacha"; susc=49500; lat=11.5444; lng=-72.9072 },
    @{ id=3120; nombre="Compania de Servicios Publicos de Sogamoso COSERVICIOS S.A. E.S.P."; sigla="Coservicios"; deptoCode="15"; depto="Boyaca"; muniCode="15759"; muni="Sogamoso"; susc=45800; lat=5.7145; lng=-72.9339 },
    @{ id=3121; nombre="Empresa de Servicios Publicos de Duitama EMPODUITAMA S.A. E.S.P."; sigla="Empoduitama"; deptoCode="15"; depto="Boyaca"; muniCode="15238"; muni="Duitama"; susc=43900; lat=5.8268; lng=-73.0336 },
    @{ id=3122; nombre="Aguas de Barrancabermeja S.A. E.S.P."; sigla="Aguas Barranca"; deptoCode="68"; depto="Santander"; muniCode="68081"; muni="Barrancabermeja"; susc=61200; lat=7.0653; lng=-73.8547 },
    @{ id=3123; nombre="Aguas de Buga S.A. E.S.P."; sigla="Aguas Buga"; deptoCode="76"; depto="Valle del Cauca"; muniCode="76111"; muni="Buga"; susc=41200; lat=3.9009; lng=-76.2978 },
    @{ id=3124; nombre="Empresas Municipales de Cartago E.S.P."; sigla="EMCARTAGO"; deptoCode="76"; depto="Valle del Cauca"; muniCode="76147"; muni="Cartago"; susc=42500; lat=4.7464; lng=-75.9117 },
    @{ id=3125; nombre="Empresas Municipales de Tulua EMTULUA E.S.P."; sigla="EMTULUA"; deptoCode="76"; depto="Valle del Cauca"; muniCode="76834"; muni="Tulua"; susc=56800; lat=4.0847; lng=-76.1964 },
    @{ id=3126; nombre="Empresa de Servicios Publicos de Chia EMSERCHIA E.S.P."; sigla="EMSERCHIA"; deptoCode="25"; depto="Cundinamarca"; muniCode="25175"; muni="Chia"; susc=47200; lat=4.8611; lng=-74.0583 },
    @{ id=3127; nombre="Empresas Publicas de Zipaquira EPZ E.S.P."; sigla="EPZ"; deptoCode="25"; depto="Cundinamarca"; muniCode="25899"; muni="Zipaquira"; susc=44600; lat=5.0264; lng=-74.0042 },
    @{ id=3128; nombre="Empresa de Servicios Publicos de Fusagasuga EMSERFUSA E.S.P."; sigla="EMSERFUSA"; deptoCode="25"; depto="Cundinamarca"; muniCode="25290"; muni="Fusagasuga"; susc=43800; lat=4.3372; lng=-74.3644 }
)

$deptosData = @(
    @{ code="05"; nombre="Antioquia"; munis=@("Rionegro","Apartado","Turbo","Caucasia","Caldas","Copacabana","Marinilla","La Ceja","El Carmen de Viboral","Santa Rosa de Osos","Yarumal","Segovia","Chigorodo","Amaga","Andes") },
    @{ code="25"; nombre="Cundinamarca"; munis=@("Facatativa","Madrid","Mosquera","Funza","Girardot","Cajica","Tocancipa","Sopo","Ubate","Villeta","La Mesa","Sibate","Tabio","Tenjo","Cota") },
    @{ code="76"; nombre="Valle del Cauca"; munis=@("Jamundi","Yumbo","Candelaria","Zarzal","Roldanillo","Sevilla","Caicedonia","La Union","Guacari","Pradera","Florida","Dagua") },
    @{ code="41"; nombre="Huila"; munis=@("Pitalito","Garzon","La Plata","Campoalegre","Gigante","San Agustin","Rivera") },
    @{ code="54"; nombre="Norte de Santander"; munis=@("Ocana","Pamplona","Villa del Rosario","Los Patios","El Zulia","Tibu","Chinacota") },
    @{ code="52"; nombre="Narino"; munis=@("Ipiales","Tumaco","Tuquerres","Samaniego","La Union Narino") },
    @{ code="19"; nombre="Cauca"; munis=@("Santander de Quilichao","Puerto Tejada","Patia","Piendamo") },
    @{ code="73"; nombre="Tolima"; munis=@("Espinal","Melgar","Mariquita","Honda","Chaparral","Libano","Flandes","Guamo") },
    @{ code="20"; nombre="Cesar"; munis=@("Aguachica","Codazzi","Bosconia","Curumani","Chiriguana") },
    @{ code="23"; nombre="Cordoba"; munis=@("Cerete","Lorica","Sahagun","Montelibano","Planeta Rica","Tierralta") },
    @{ code="70"; nombre="Sucre"; munis=@("Corozal","San Marcos","San Onofre","Tolu","Sampues") },
    @{ code="13"; nombre="Bolivar"; munis=@("Magangue","Turbaco","Arjona","El Carmen de Bolivar","San Juan Nepomuceno") },
    @{ code="47"; nombre="Magdalena"; munis=@("Cienaga","Fundacion","Plato","El Banco","Aracataca") },
    @{ code="66"; nombre="Risaralda"; munis=@("Santa Rosa de Cabal","La Virginia","Belen de Umbria") },
    @{ code="63"; nombre="Quindio"; munis=@("Calarca","La Tebaida","Montenegro","Quimbaya") },
    @{ code="17"; nombre="Caldas"; munis=@("La Dorada","Chinchina","Villamaria","Anserma","Riosucio") },
    @{ code="15"; nombre="Boyaca"; munis=@("Chiquinquira","Puerto Boyaca","Paipa","Moniquira","Villa de Leyva") },
    @{ code="85"; nombre="Casanare"; munis=@("Yopal","Aguazul","Villanueva Casanare") },
    @{ code="81"; nombre="Arauca"; munis=@("Arauca","Tame","Saravena") },
    @{ code="27"; nombre="Choco"; munis=@("Quibdo","Istmina") },
    @{ code="18"; nombre="Caqueta"; munis=@("Florencia","San Vicente del Caguan") }
)

$random = [System.Random]::new(10322026)
$prestadores = [System.Collections.Generic.List[PSCustomObject]]::new()

function Crear-Prestador($id, $nombre, $sigla, $deptoCode, $depto, $muniCode, $muni, $aps, $segmento, $susc, $lat, $lng) {
    $probAdopcion = switch ($segmento) {
        "Segmento 1" { 0.92 }
        "Segmento 2" { 0.78 }
        "Segmento 3" { 0.64 }
        "Segmento 4" { 0.51 }
    }
    
    $adopto = ($random.NextDouble() -le $probAdopcion)
    $etapa = if ($adopto) {
        if ($random.NextDouble() -le 0.4) { "E6" } else { "E5" }
    } else {
        if ($random.NextDouble() -le 0.7) { "E4" } else { "E3" }
    }
    
    $etapaNombres = @{
        "E3"="Expedicion y Publicacion Res. CRA 1032/2026"
        "E4"="Periodo de Transicion y Alistamiento"
        "E5"="Periodo de Inicio y Reporte de Costos"
        "E6"="Primer Ano Tarifario de Aplicacion"
    }
    
    $fechaReporte = if ($adopto) {
        $mes = $random.Next(4, 9)
        $dia = $random.Next(1, 28)
        "2026-0$mes-$($dia.ToString('00'))"
    } else { $null }
    
    $diasOportunidad = if ($adopto) { $random.Next(45, 175) } else { $null }
    $facturaEmitida = if ($etapa -eq "E6") { "2026-08-01" } else { $null }
    
    $lineaBase = if ($adopto) {
        if ($random.NextDouble() -le 0.75) { "completa" } else { "parcial" }
    } else {
        if ($random.NextDouble() -le 0.3) { "parcial" } else { "sin_reporte" }
    }
    
    $varBase = [Math]::Round(($random.NextDouble() * 12.0) + 2.0, 1)
    if ($random.NextDouble() -le 0.15) { $varBase = -$varBase * 0.3 }
    
    $varE1 = [Math]::Round($varBase * 0.75, 1)
    $varE2 = [Math]::Round($varBase * 0.85, 1)
    $varE3 = [Math]::Round($varBase, 1)
    $varE4 = [Math]::Round($varBase * 1.05, 1)
    $varE5 = [Math]::Round($varBase * 1.15, 1)
    $varE6 = [Math]::Round($varBase * 1.25, 1)
    $varCom = [Math]::Round($varBase * 1.18, 1)
    $varInd = [Math]::Round($varBase * 1.22, 1)
    
    $cma = $random.Next(3800, 6800)
    $cmo = $random.Next(1100, 2400)
    $cmi = $random.Next(700, 1800)
    $cmt = $random.Next(80, 250)
    $cuNuevo = $cmo + $cmi + $cmt + [Math]::Round($cma / 15.0)
    $cuAnt = [Math]::Round($cuNuevo / (1.0 + ($varE3 / 100.0)))
    
    $contObs = [Math]::Round(($random.NextDouble() * 5.0) + 19.0, 1)
    if ($contObs -gt 24.0) { $contObs = 24.0 }
    $contMeta = if ($segmento -eq "Segmento 1" -or $segmento -eq "Segmento 2") { 24.0 } else { 22.0 }
    $contEstado = if ($contObs -ge ($contMeta - 0.2)) { "en_meta" } else { "bajo_meta" }
    
    $ipufObs = [Math]::Round(($random.NextDouble() * 8.5) + 5.5, 2)
    $ipufMeta = 6.00
    $ipufBrecha = [Math]::Round($ipufObs - $ipufMeta, 2)
    $p10 = [Math]::Round($ipufObs * 0.82, 2)
    $p90 = [Math]::Round($ipufObs * 1.22, 2)
    
    $ircaObs = [Math]::Round(($random.NextDouble() * 8.0) + 0.5, 2)
    $ircaClasif = if ($ircaObs -le 5.0) { "Sin riesgo (0-5%)" } elseif ($ircaObs -le 14.0) { "Riesgo Bajo (5.1-14%)" } else { "Riesgo Medio (14.1-35%)" }
    $presionObs = [Math]::Round(($random.NextDouble() * 10.0) + 89.0, 1)
    
    $descuento = if ($contEstado -eq "bajo_meta" -or $ipufBrecha -gt 3.0) { [Math]::Round(($random.NextDouble() * 2.8) + 0.4, 2) } else { 0.0 }
    $incentivo = if ($contObs -ge 23.8 -and $ipufObs -le 7.0) { [Math]::Round(($random.NextDouble() * 1.5) + 0.3, 2) } else { 0.0 }
    
    $nivelIus = if ($contObs -ge 23.5 -and $ipufObs -le 7.5 -and $ircaObs -le 3.0) { 1 }
                elseif ($contObs -ge 22.0 -and $ipufObs -le 9.5) { 2 }
                elseif ($contObs -ge 20.0 -and $ipufObs -le 12.0) { 3 }
                elseif ($contObs -ge 18.0) { 4 }
                else { 5 }
                
    $catIus = switch ($nivelIus) {
        1 { "Riesgo Bajo" }
        2 { "Riesgo Medio-Bajo" }
        3 { "Riesgo Medio" }
        4 { "Riesgo Alto" }
        5 { "Riesgo Critico" }
    }
    
    $flag = if ($adopto -and $lineaBase -eq "completa") { "VERIFIED" }
            elseif ($adopto) { "WARNING" }
            elseif ($random.NextDouble() -le 0.5) { "QUARANTINE" }
            else { "NO_REPORT" }
            
    $objecion = if ($random.NextDouble() -le 0.08) { "en_objecion" } else { "sin_objecion" }
    $coberturaReporte = if ($flag -eq "VERIFIED") { 100.0 } elseif ($flag -eq "WARNING") { 88.5 } else { 62.0 }
    
    return [PSCustomObject]@{
        prestador_id_sui = $id
        prestador_nombre = $nombre
        sigla = $sigla
        departamento_divipola = $deptoCode
        departamento_nombre = $depto
        municipio_divipola = $muniCode
        municipio_nombre = $muni
        aps = $aps
        segmento_cra = $segmento
        suscriptores_acueducto = $susc
        lat = $lat
        lng = $lng
        nmt_tracking = [PSCustomObject]@{
            etapa_actual = $etapa
            etapa_nombre = $etapaNombres[$etapa]
            estudio_costos_reportado = $adopto
            fecha_reporte_estudio = $fechaReporte
            primera_factura_emitida = $facturaEmitida
            dias_oportunidad_adopcion = $diasOportunidad
            linea_base_2026 = $lineaBase
            variacion_tarifaria_transicion = [PSCustomObject]@{
                estrato_1_pct = $varE1
                estrato_2_pct = $varE2
                estrato_3_pct = $varE3
                estrato_4_pct = $varE4
                estrato_5_pct = $varE5
                estrato_6_pct = $varE6
                comercial_pct = $varCom
                industrial_pct = $varInd
                cu_anterior_688_cop_m3 = $cuAnt
                cu_nuevo_1032_cop_m3 = $cuNuevo
                desglose_costo_referencia = [PSCustomObject]@{
                    cma_susc_mes_cop = $cma
                    cmo_m3_cop = $cmo
                    cmi_m3_cop = $cmi
                    cmt_m3_cop = $cmt
                }
            }
            estandares_servicio = [PSCustomObject]@{
                continuidad_idh2_hdia = $contObs
                continuidad_meta_hdia = $contMeta
                continuidad_estado = $contEstado
                ipuf_ird1_m3_susc_mes = $ipufObs
                ipuf_meta_m3_susc_mes = $ipufMeta
                ipuf_brecha_m3_susc_mes = $ipufBrecha
                ipuf_banda_p10 = $p10
                ipuf_banda_p90 = $p90
                irca_idh5_pct = $ircaObs
                irca_clasificacion = $ircaClasif
                presion_idh1_pct = $presionObs
            }
            descuentos_incentivos = [PSCustomObject]@{
                descuento_calidad_pct = $descuento
                incentivo_eficiencia_pct = $incentivo
                impacto_neto_pct = [Math]::Round($incentivo - $descuento, 2)
                sustento_legal_descuento = "Res. CRA 1032/2026 Tabla 31"
                sustento_legal_incentivo = "Res. CRA 1032/2026 Tablas 17-25"
            }
            riesgo_ius = [PSCustomObject]@{
                nivel_ius = $nivelIus
                categoria_riesgo = $catIus
                puntaje_ius = [Math]::Round(100.0 - ($nivelIus * 18.0) + ($random.NextDouble() * 10.0), 1)
                fase_ius = "Fase I (2020-2026)"
                fuente = "SSPD - Publicacion Anual IUS"
            }
        }
        calidad = [PSCustomObject]@{
            quality_flag = $flag
            estado_objecion = $objecion
            cobertura_reporte_pct = $coberturaReporte
            observacion = if ($flag -eq "VERIFIED") { "Reporte verificado con cierre de ventana previa SUI" }
                          elseif ($flag -eq "WARNING") { "Linea base parcial o alerta menor de consistencia" }
                          elseif ($flag -eq "QUARANTINE") { "Estudio de costos en revision tecnica por la CRA" }
                          else { "Sin reporte formal de costos bajo Res. 1032 al corte" }
        }
    }
}

foreach ($p in $prestadoresS1) {
    $prestadores.Add((Crear-Prestador $p.id $p.nombre $p.sigla $p.deptoCode $p.depto $p.muniCode $p.muni $p.aps "Segmento 1" $p.susc $p.lat $p.lng))
}

foreach ($p in $prestadoresS2Data) {
    $prestadores.Add((Crear-Prestador $p.id $p.nombre $p.sigla $p.deptoCode $p.depto $p.muniCode $p.muni "$($p.muni) APS" "Segmento 2" $p.susc $p.lat $p.lng))
}

$idCounter = 4001
$deptoIdx = 0
for ($i = 1; $i -le 45; $i++) {
    $depto = $deptosData[$deptoIdx % $deptosData.Count]
    $muniName = $depto.munis[$i % $depto.munis.Count]
    $susc = $random.Next(15200, 29800)
    $lat = [Math]::Round(3.5 + ($random.NextDouble() * 7.5), 4)
    $lng = [Math]::Round(-76.8 + ($random.NextDouble() * 4.2), 4)
    $nombre = "Empresa de Servicios Publicos de $muniName E.S.P."
    $sigla = "EMPO$($muniName.Substring(0, [Math]::Min(5, $muniName.Length)).ToUpper())"
    
    $prestadores.Add((Crear-Prestador $idCounter $nombre $sigla $depto.code $depto.nombre "$($depto.code)$($i.ToString('000'))" $muniName "$muniName Urbano" "Segmento 3" $susc $lat $lng))
    $idCounter++
    $deptoIdx++
}

for ($i = 1; $i -le 103; $i++) {
    $depto = $deptosData[($i + 5) % $deptosData.Count]
    $muniName = $depto.munis[($i * 3) % $depto.munis.Count]
    if ($i -gt $depto.munis.Count) { $muniName = "$muniName Sector $i" }
    $susc = $random.Next(5050, 14950)
    $lat = [Math]::Round(2.0 + ($random.NextDouble() * 9.0), 4)
    $lng = [Math]::Round(-77.2 + ($random.NextDouble() * 4.8), 4)
    $nombre = "Empresa Municipal de Acueducto de $muniName E.S.P."
    $sigla = "AGUAS-$($muniName.Replace(' ', '').Substring(0, [Math]::Min(6, $muniName.Replace(' ', '').Length)).ToUpper())"
    
    $prestadores.Add((Crear-Prestador $idCounter $nombre $sigla $depto.code $depto.nombre "$($depto.code)$(($i + 100).ToString('000'))" $muniName "$muniName y Cabecera" "Segmento 4" $susc $lat $lng))
    $idCounter++
}

$metadata = [PSCustomObject]@{
    plataforma = "Observatorio Regulatorio de Agua Potable y Saneamiento Basico - CRA"
    marca_corta = "Observatorio CRA"
    lema = "Datos abiertos para que el agua y el aseo lleguen a todos"
    marco_normativo = "Resolucion CRA 1032 de 2026"
    ambito_aplicacion = "Grandes Prestadores de Acueducto y Alcantarillado (>5.000 suscriptores urbanos)"
    fecha_corte = "2026-08-31"
    fecha_generacion = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    fuente_primaria = "SUI / SURICATA - Superintendencia de Servicios Publicos Domiciliarios (SSPD)"
    universo_total_prestadores = $prestadores.Count
    desglose_segmentos = [PSCustomObject]@{
        segmento_1 = ($prestadores | Where-Object { $_.segmento_cra -eq "Segmento 1" }).Count
        segmento_2 = ($prestadores | Where-Object { $_.segmento_cra -eq "Segmento 2" }).Count
        segmento_3 = ($prestadores | Where-Object { $_.segmento_cra -eq "Segmento 3" }).Count
        segmento_4 = ($prestadores | Where-Object { $_.segmento_cra -eq "Segmento 4" }).Count
    }
    tasa_adopcion_general_pct = [Math]::Round((($prestadores | Where-Object { $_.nmt_tracking.estudio_costos_reportado }).Count / $prestadores.Count) * 100.0, 1)
    calidad_distribucion = [PSCustomObject]@{
        verified = ($prestadores | Where-Object { $_.calidad.quality_flag -eq "VERIFIED" }).Count
        warning = ($prestadores | Where-Object { $_.calidad.quality_flag -eq "WARNING" }).Count
        quarantine = ($prestadores | Where-Object { $_.calidad.quality_flag -eq "QUARANTINE" }).Count
        no_report = ($prestadores | Where-Object { $_.calidad.quality_flag -eq "NO_REPORT" }).Count
    }
    ciclo_regulatorio_ocde = @(
        @{ codigo="E0"; nombre="Diagnostico y Agenda Regulatoria"; responsable="CRA"; estado="cumplida"; fecha="2024-11-15"; fase="Ex-Ante"; descripcion="Identificacion del problema publico y definicion de la agenda de revision de la Res. CRA 688/2014." },
        @{ codigo="E1"; nombre="Participacion Ciudadana y Socializacion"; responsable="CRA / Ciudadania"; estado="cumplida"; fecha="2025-08-20"; fase="Ex-Ante"; descripcion="Recepcion de mas de 450 observaciones tecnicas y mesas de concertacion territorial." },
        @{ codigo="E2"; nombre="Consulta Formal y Concepto Previo SIC"; responsable="SIC / CRA"; estado="cumplida"; fecha="2026-03-12"; fase="Ex-Ante"; descripcion="Abogacia de la competencia y analisis de impacto economico previo." },
        @{ codigo="E3"; nombre="Expedicion y Publicacion Res. CRA 1032/2026"; responsable="CRA"; estado="cumplida"; fecha="2026-03-28"; fase="Adopcion"; descripcion="Adopcion del nuevo marco metodologico para grandes prestadores urbanos en Diario Oficial." },
        @{ codigo="E4"; nombre="Periodo de Transicion y Alistamiento Operativo"; responsable="Prestadores"; estado="cumplida"; fecha="2026-06-30"; fase="Transicion"; descripcion="Alistamiento de sistemas comerciales, modelos de costos y contabilidad regulatoria." },
        @{ codigo="E5"; nombre="Periodo de Inicio y Reporte de Estudio de Costos"; responsable="Prestadores / SSPD"; estado="en_curso"; fecha_limite="2026-08-31"; fase="Implementacion"; descripcion="Cargue de estudios de costos a SUI/SURICATA y adopcion de tarifas iniciales." },
        @{ codigo="E6"; nombre="Primer Ano Tarifario y Cierre Linea Base 2026"; responsable="Prestadores / CRA"; estado="pendiente"; fecha_prevista="2026-12-31"; fase="Operacion"; descripcion="Cierre de la linea base oficial 2026 y facturacion plena bajo el nuevo marco." },
        @{ codigo="E7"; nombre="Recalculo Anual, Incentivos y Descuentos"; responsable="CRA / Prestadores"; estado="pendiente"; fecha_prevista="2027-12-31"; fase="Seguimiento"; descripcion="Aplicacion de descuentos de calidad (Tabla 31) e incentivos de eficiencia (Tablas 17-25)." },
        @{ codigo="E8"; nombre="Monitoreo Continuo y Evaluacion Intermedia"; responsable="CRA / SSPD"; estado="pendiente"; fecha_prevista="2029-06-30"; fase="Seguimiento"; descripcion="Revision intermedia de impacto tarifario y comportamiento de estandares quinquenales." },
        @{ codigo="E9"; nombre="Evaluacion Ex-Post de Impacto Regulatorio (AIR OCDE)"; responsable="CRA / DNP"; estado="pendiente"; fecha_prevista="2036-03-31"; fase="Ex-Post"; descripcion="Evaluacion formal ex-post del marco tarifario bajo estandares OCDE al cierre de vigencia." }
    )
    trazabilidad_vacios_normativos = @(
        @{ id="Q-NMT-01"; indicador="NMT-EST-01 / NMT-EST-02"; texto="Las metas de perdidas (IPUF) y continuidad por segmento de las Tablas 16 y 50-51 se presentan con valores de referencia preliminares (6.0 m3/susc/mes) hasta su confirmacion por la Subdireccion de Regulacion." },
        @{ id="Q-NMT-02"; indicador="NMT-INC-01"; texto="Los porcentajes definitivos de descuento por incumplimiento de servicio (Tabla 31 Res. 1032) estan en proceso de reglamentacion operativa por SSPD." },
        @{ id="Q-DIC-05"; indicador="NMT-ADO-01 / NMT-LB-01"; texto="El mecanismo de ingesta directa de estudios de costos desde SURICATA se encuentra en etapa de diseno conjunto CRA-SSPD." }
    )
}

$datasetCompleto = [PSCustomObject]@{
    metadata = $metadata
    prestadores = $prestadores
}

$jsonString = $datasetCompleto | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($outputJson, $jsonString, [System.Text.Encoding]::UTF8)
Write-Host "JSON guardado en: $outputJson"

$jsContent = "window.CRA_NMT_DATA = $jsonString;"
[System.IO.File]::WriteAllText($outputJs, $jsContent, [System.Text.Encoding]::UTF8)
Write-Host "JS embebido guardado en: $outputJs"

$csvList = [System.Collections.Generic.List[PSCustomObject]]::new()
foreach ($p in $prestadores) {
    $csvList.Add([PSCustomObject]@{
        prestador_id_sui = $p.prestador_id_sui
        prestador_nombre = $p.prestador_nombre
        sigla = $p.sigla
        departamento = $p.departamento_nombre
        divipola_depto = $p.departamento_divipola
        municipio = $p.municipio_nombre
        divipola_muni = $p.municipio_divipola
        segmento = $p.segmento_cra
        suscriptores = $p.suscriptores_acueducto
        etapa_ciclo = $p.nmt_tracking.etapa_actual
        estudio_costos_reportado = $p.nmt_tracking.estudio_costos_reportado
        fecha_reporte_estudio = $p.nmt_tracking.fecha_reporte_estudio
        dias_adopcion = $p.nmt_tracking.dias_oportunidad_adopcion
        linea_base_2026 = $p.nmt_tracking.linea_base_2026
        var_estrato_1_pct = $p.nmt_tracking.variacion_tarifaria_transicion.estrato_1_pct
        var_estrato_2_pct = $p.nmt_tracking.variacion_tarifaria_transicion.estrato_2_pct
        var_estrato_3_pct = $p.nmt_tracking.variacion_tarifaria_transicion.estrato_3_pct
        var_estrato_4_pct = $p.nmt_tracking.variacion_tarifaria_transicion.estrato_4_pct
        cu_anterior_688 = $p.nmt_tracking.variacion_tarifaria_transicion.cu_anterior_688_cop_m3
        cu_nuevo_1032 = $p.nmt_tracking.variacion_tarifaria_transicion.cu_nuevo_1032_cop_m3
        continuidad_hdia = $p.nmt_tracking.estandares_servicio.continuidad_idh2_hdia
        continuidad_estado = $p.nmt_tracking.estandares_servicio.continuidad_estado
        ipuf_m3_susc_mes = $p.nmt_tracking.estandares_servicio.ipuf_ird1_m3_susc_mes
        ipuf_brecha = $p.nmt_tracking.estandares_servicio.ipuf_brecha_m3_susc_mes
        irca_pct = $p.nmt_tracking.estandares_servicio.irca_idh5_pct
        nivel_riesgo_ius = $p.nmt_tracking.riesgo_ius.nivel_ius
        categoria_ius = $p.nmt_tracking.riesgo_ius.categoria_riesgo
        descuento_calidad_pct = $p.nmt_tracking.descuentos_incentivos.descuento_calidad_pct
        incentivo_eficiencia_pct = $p.nmt_tracking.descuentos_incentivos.incentivo_eficiencia_pct
        quality_flag = $p.calidad.quality_flag
        cobertura_reporte_pct = $p.calidad.cobertura_reporte_pct
        estado_objecion = $p.calidad.estado_objecion
    })
}
$csvList | Export-Csv -Path $outputCsv -NoTypeInformation -Encoding UTF8
Write-Host "CSV guardado en: $outputCsv"
Write-Host "Dataset canonico generado exitosamente: $($prestadores.Count) prestadores."
