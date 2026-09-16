---
id: catalogo-indicadores-v1
tipo: spec
proyecto: observatorio-regulatorio-cra
estado: borrador
actualizado: 2026-09-14
fuentes: [decisión de sesión 2026-09-13, specs/ontologia-indicadores.md, README_Context_Lake]
---

# Catálogo V1 de indicadores y plantilla de ficha metodológica

Este archivo define **qué indicadores entran a la versión 1** y **con qué plantilla se documenta cada uno**. Cada indicador de la tabla requiere su propia ficha completa antes de poder calcularse (`RF-ONTO-01`); este catálogo es la lista priorizada, no las fichas.

## Criterio de priorización

Catorce indicadores, no cincuenta. El límite no es de ambición sino de sostenibilidad: la unidad económica del Observatorio es el costo por indicador mantenido al año, y una batería que nadie alcanza a actualizar destruye más confianza de la que genera un conjunto pequeño y confiable.

Cada candidato se evaluó contra cuatro filtros, en este orden:

1. **Disponibilidad:** ¿el dato existe hoy en una fuente a la que la CRA tiene acceso efectivo?
2. **Sustento normativo:** ¿hay fórmula regulatoria que lo defina, o es construcción metodológica que habrá que declarar como tal (`RF-ONTO-03`)?
3. **Legibilidad ciudadana:** ¿un vocal de control entiende qué significa sin formación técnica?
4. **Utilidad regulatoria:** ¿alimenta una decisión real de la CRA, o es dato de adorno?

Un indicador que falla el filtro 1 no entra a V1 aunque sea deseable; se marca como candidato a V1.1.

## Catálogo V1

| Código | Indicador | Dimensión | Servicio | Fuente principal | Nota |
|---|---|---|---|---|---|
| `IND-COB-01` | Cobertura de acueducto | COB | Acueducto | SUI + DANE | Denominador pendiente de `Q-GLO-02` (viviendas o población) |
| `IND-CON-01` | Continuidad del servicio | CON | Acueducto | SUI | Unidad horas/día |
| `IND-PER-01` | Índice de Agua No Contabilizada (IANC) | PER | Acueducto | SUI | **Indicador piloto de la PoC** |
| `IND-PER-02` | Índice de Pérdidas por Suscriptor Facturado (IPUF) | PER | Acueducto | SUI | No confundir con IANC (ver glosario) |
| `IND-CAL-01` | IRCA | CAL | Acueducto | INS / SIVICAP | **Dependencia externa**: no está en el SUI. Confirmar canal antes de comprometerlo en V1 |
| `IND-COB-02` | Cobertura de alcantarillado | COB | Alcantarillado | SUI + DANE | Mismo denominador que `IND-COB-01` |
| `IND-ECI-01` | Proporción de aguas residuales con tratamiento | ECI | Alcantarillado | SUI | Alineado con ODS 6.3 |
| `IND-COB-03` | Cobertura de recolección de residuos | COB | Aseo | SUI | |
| `IND-ECI-02` | Tasa de aprovechamiento | ECI | Aseo | SUI | Alineado con la política de economía circular |
| `IND-EFI-01` | Costo Medio de Administración por suscriptor | EFI | AA | SUI | Requiere año base y condición monetaria (`RF-ONTO-07`) |
| `IND-EFI-02` | Costo Medio de Operación por m3 | EFI | AA | SUI | Insumo del benchmarking |
| `IND-FIN-01` | Equilibrio entre subsidios y contribuciones | FIN | AAA | SUI + entes territoriales | Construcción metodológica probable |
| `IND-ASE-01` | Asequibilidad de la factura en estratos 1 y 2 | ASE | AAA | SUI + DANE | Construcción metodológica; alto valor comunicativo |
| `IND-INV-01` | Ejecución de inversiones frente a lo proyectado | INV | AA | SUI | Requiere serie plurianual |

**Cobertura por dimensión:** 3 de cobertura, 1 continuidad, 2 pérdidas, 1 calidad, 2 eficiencia, 1 financiera, 1 asequibilidad, 2 economía circular, 1 inversiones. Riesgo climático (`CLI`) queda sin indicador en V1 por falta de fuente estructurada; se aborda en V1.1 con SIRH del IDEAM.

## Secuencia de construcción

No producir las catorce fichas en paralelo. Primero **tres fichas piloto** —`IND-PER-01`, `IND-CON-01` e `IND-EFI-01`— elegidas porque ejercitan tres problemas distintos: un cociente con dos variables de volumen, una medida temporal con rango acotado, y una cifra monetaria con año base. Con ellas se corrige la plantilla, y solo entonces se producen las once restantes en serie.

## Plantilla de ficha metodológica

Catorce campos obligatorios (los trece de `RF-ONTO-02` más la regla de agregación de `RF-ONTO-09`). Una ficha sin alguno de ellos no se aprueba.

```markdown
---
id: ficha-IND-XXX-NN
tipo: ficha-indicador
version: 1
estado: borrador | aprobada | superada por version N
actualizado: AAAA-MM-DD
---

# IND-XXX-NN — <Nombre del indicador>

1. **Código:** IND-XXX-NN
2. **Nombre:** <nombre canónico, coherente con docs/glosario.md>
3. **Dimensión:** <una sola, del catálogo de diez>
4. **Definición:** <qué mide, en lenguaje que entienda un vocal de control, sin fórmula>
5. **Fórmula:** <expresión matemática explícita, con cada símbolo definido>
6. **Variables:** <tabla: símbolo | descripción | fuente | formulario o tabla de origen | unidad>
7. **Unidad de medida:** <una de las canónicas de RF-ONTO-07; si es monetaria, año base y condición>
8. **Periodicidad:** <mensual | anual | eventual; y regla de cierre si depende de varios periodos>
9. **Desagregaciones soportadas:** <de las de RF-ONTO-05; declarar explícitamente las NO soportadas>
10. **Sustento normativo:** <norma, año y artículo. Si no lo hay: "construcción metodológica del Observatorio">
11. **Umbrales y rangos:** <rango teórico válido, umbral de anomalía histórica, referencias de interpretación>
12. **Limitaciones de interpretación:** <qué NO permite concluir este indicador. Campo obligatorio, no decorativo>
13. **Responsable técnico:** <rol y área>
14. **Regla de agregación territorial:** <cociente de sumas | promedio ponderado por suscriptores facturados | promedio ponderado por m3 facturados | ponderado por población servida con distribución por nivel de riesgo | suma | no agregable>, con el umbral de cobertura de reporte para publicar el agregado (`adr/ADR-0012`, `RF-ONTO-09`)

## Preguntas abiertas
## Historial
```

El campo 12 es el que más se omite y el que más daño evita: es el que impide que un medio de comunicación lea un IANC alto como mala calidad del agua.

El campo 14 fija cómo sube el indicador de prestador a municipio, departamento y nacional. Funciones asignadas por tipo en `adr/ADR-0012`, pendientes de ratificación ficha por ficha (`Q-ONTO-07`): cociente de sumas para IND-COB-01/02/03, IND-PER-01, IND-ECI-01/02; ponderado por suscriptores facturados para IND-CON-01, IND-PER-02, IND-EFI-01, IND-ASE-01; ponderado por m3 facturados para IND-EFI-02; ponderado por población servida con distribución por riesgo para IND-CAL-01; suma para IND-FIN-01 e IND-INV-01.

## Preguntas abiertas

| ID | Pregunta | Bloquea | Responsable |
|---|---|---|---|
| Q-CAT-01 | ¿El IRCA se obtiene por canal formal con el INS o se retira de V1? | `IND-CAL-01` | Subdirección de Regulación |
| Q-CAT-02 | ¿La información de subsidios y contribuciones de entes territoriales tiene cobertura suficiente para `IND-FIN-01`? | `IND-FIN-01` | Subdirección de Regulación |
| Q-CAT-03 | ¿Se confirma el catálogo de catorce, o hay indicadores de decisión regulatoria vigente que falten? | Todo el catálogo | Dirección Técnica |

## Historial

| Fecha | Cambio | Origen |
|---|---|---|
| 2026-09-13 | Versión inicial del catálogo V1 y plantilla de ficha | Sesión con Camilo Carvajalino |
| 2026-09-14 | Campo 14 de la plantilla (regla de agregación territorial) y funciones asignadas por indicador | `adr/ADR-0012` |
