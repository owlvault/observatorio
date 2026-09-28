---
id: entrega-prototipo
tipo: entrega
proyecto: observatorio-regulatorio-cra
estado: en validación del product owner
version: prototipo v1.1.0
actualizado: 2026-09-28
fuentes: [app_observatorio_nmt/README.md, specs/prototipo-tablero-nmtpp.md, specs/portal-publico.md, AGENTS.md]
---

# Entrega del prototipo del Observatorio CRA — versión final para validación

La etapa de prototipo **cerró el 2026-09-28**. La versión final es el **prototipo v1.1.0**, en `app_observatorio_nmt/`, etiquetada en git como `prototipo-v1.1.0`. Queda congelada mientras el product owner la valida: solo se cambia para atender sus observaciones.

## Qué se entrega

Un solo portal navegable que cubre los dos nuevos marcos tarifarios de acueducto y alcantarillado:

| Sección | Qué muestra | Datos |
|---|---|---|
| Inicio | Lema, cifras clave, mensajes de los datos, ciclo E0–E9 | Calculados de los datos de ambas resoluciones, sin sumarlas |
| Grandes prestadores (Res. 1032) | 8 indicadores con su gráfico y 4 análisis por segmento | 188 prestadores **simulados** |
| Pequeños prestadores y rurales (Res. 1038) | Adopción, calendario de hitos, nivel de servicio frente a meta, ISE, zonas especiales, aclaraciones, 25 fichas | 40 prestadores **sintéticos**; parámetros **reales** de la Res. 1038 |
| Impacto regulatorio | Cinco dimensiones, 12 principios de gobernanza del agua, simulador de asequibilidad, ciclo E0–E9 | Datos simulados de la Res. 1032 y configuración del prototipo |
| Prestadores | Directorio con ficha individual, cada marco en su grupo | Ambos |
| Mapa | Ubicación y estado de adopción | Ambos, en capas separadas |
| Metodología | Compuerta de publicación, semáforo de calidad, fichas | Res. 1032 (8 fichas) y enlace a las 25 de la Res. 1038 |
| Datos abiertos | Descargas CSV/JSON y contrato de API | Ambos, por separado |

Hasta esta versión la Res. 1038 tenía un prototipo aparte (`app_observatorio_nmtpp/`); se integró en el portal para dejar una sola versión.

## Cómo revisarlo

```powershell
powershell -ExecutionPolicy Bypass -File app_observatorio_nmt/server.ps1      # abre http://localhost:8080/
powershell -ExecutionPolicy Bypass -File app_observatorio_nmt/test_nmt_mvp.ps1 # 49 pruebas de aceptación
```

El conmutador **Vista Ciudadana / Analista CRA** (arriba a la derecha) cambia el nivel de detalle. La simulación **Q-NMTPP-01** solo aparece en vista analista.

## Qué se pide validar

1. **Mensajes y lectura.** ¿Los titulares dicen lo correcto y se entienden sin leer el texto de apoyo?
2. **Salvaguardas.** Sin rankings, tarifas solo por estrato, sin mezclar los dos marcos, semáforo visible en cada cifra, leyenda "seguimiento informativo, sin efecto jurídico".
3. **Alcance del módulo de impacto.** Los rótulos se suavizaron para no sugerir una evaluación ex post formal; confirmar que el tono es el adecuado.
4. **Excepción visual.** Las escenas en Deep Navy (portada, encabezados, casillas protagonistas) son una excepción al fondo blanco de `.agents/rules/ui-ux-design-standards.md`. Confirmar o pedir retirarla.
5. **Nombre y lema** (ADR-0009, pendiente de Dirección Ejecutiva).

## Pendientes conocidos, que esta versión no resuelve

| # | Pendiente | Dónde | Quién decide |
|---|---|---|---|
| P-01 | 8 de los 12 valores del radar de gobernanza y todo el referente OCDE son números fijos del prototipo, sin fuente | `js/components/impacto_ocde.js` | Product owner / Subdirección de Regulación |
| P-02 | El esfuerzo tarifario del estrato 1 difiere entre la casilla D3 (0,68 %) y el simulador (1,10 %): el simulador suma CMI y CMT | `impacto_ocde.js` | Subdirección de Regulación |
| P-03 | Ingresos por estrato y líneas base del módulo de impacto (21,4 h, 12,8 m³, etc.) son supuestos sin fuente | `impacto_ocde.js` | Subdirección de Regulación |
| P-04 | La simulación de Q-NMTPP-01 lee un campo inexistente en los parámetros; fallará en el año de cumplimiento (hoy todo es "no exigible aún") | `js/motor_estados.js` | Equipo técnico, con la respuesta a Q-NMTPP-01 |
| P-05 | Metas y descuentos de la Res. 1032 sujetos a ratificación | Q-NMT-01, Q-NMT-02 | Subdirección de Regulación |
| P-06 | Catorce aclaraciones normativas de la Res. 1038 abiertas | Q-NMTPP-01..14 | Subdirección Técnica de Regulación |
| P-07 | Chart.js, Leaflet, fuentes y mapa base se cargan de internet; sin red, el portal pierde gráficas y mapa | `index.html` | CIO, al definir el stack final (Q-ARQ-10) |
| P-08 | Sin prueba con lector de pantalla ni medición de contraste con herramienta (WCAG 2.1 AA) | Todo el portal | Antes de publicar en la sede electrónica |

## Lo que sigue después de la validación

Las observaciones del product owner se registran como cambios a esta versión. El paso a producción (tablero propio sobre OCI, lectura del esquema `published`, micrositio en la sede electrónica) se rige por `specs/portal-publico.md`, `adr/ADR-0010` y `adr/ADR-0011`, y está bloqueado por Q-ARQ-10 y Q-PORTAL-07.
