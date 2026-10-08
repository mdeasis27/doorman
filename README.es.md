# Doorman

<!-- community-badges -->
[![CI](https://github.com/mdeasis27/doorman/actions/workflows/ci.yml/badge.svg)](https://github.com/mdeasis27/doorman/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
<!-- /community-badges -->

[English](README.md) · [Probar demo](https://doorman-manueldeasis27-2515s-projects.vercel.app/es/app) · [Caso de estudio](https://portafolio-mdea.vercel.app/es/projects/doorman) · [Código](https://github.com/mdeasis27/doorman)

![Interfaz interactiva local real](docs/images/cover.png)

Edita un documento y la política de herramientas para ver qué reglas permiten, bloquean o escalan una solicitud.

## Dos situaciones para comparar

**Política activada:** Documento hostil que pide enviar un correo de aprobación; política activada. Las reglas bloquean la acción externa.

![Política activada](docs/images/scenario-a.es.png)

**Resumen benigno sin política:** Documento benigno que pide un resumen; política desactivada. Se permite el resumen local; no se ejecuta ninguna acción externa.

![Resumen benigno sin política](docs/images/scenario-b.es.png)

## Caso de uso de negocio

Instrucciones dentro de un documento no confiable pueden activar una acción insegura de agente.

**Quién lo usa:** Responsable de operaciones de revisión documental.

**La decisión:** Permitir o bloquear una acción externa después de revisar el documento.

Elige política activada o desactivada, inspecciona reglas del documento hostil y lee la decisión de acción.

### Prueba la decisión

**Política activada:** Documento hostil que pide enviar un correo de aprobación; política activada. Las reglas bloquean la acción externa.

**Resumen benigno sin política:** Documento benigno que pide un resumen; política desactivada. Se permite el resumen local; no se ejecuta ninguna acción externa.

Elige un escenario, modifica sus controles y ejecuta el cálculo local. Avanza por la visualización paso a paso o revela todo. Reinicia antes de comparar el segundo escenario.

## Cómo probarlo

Abre `/en/app` (inglés, por defecto) o `/es/app` (español). Cambia los datos del escenario y ejecuta el cálculo. Inspecciona la decisión, evidencia y traza calculada. La reproducción revela pasos locales ya completados; no mide un modelo en vivo. Reiniciar empieza un escenario local nuevo. Cambiar de idioma reinicia el escenario.

La demo principal no requiere cuenta, clave de API ni base de datos. Los enlaces públicos apuntan al despliegue existente; el rediseño local está pendiente de publicación.

<!-- recruiter-mission:start -->
### Tu misión interactiva

Carga instrucciones hostiles sin protección, inspecciona el documento, predice opcionalmente autorización, bloqueo o ninguna acción y revela la comparación.

Calcula la política activada y desactivada sobre el mismo documento. Inspecciona operaciones solicitadas, autorizaciones simuladas, reglas léxicas y bloqueos. No se envía correo ni se escribe en ATS. Una entrada benigna puede producir empate.

**Por qué este enfoque:** Reglas léxicas locales y restricciones por origen separan contenido y autoridad. La lista de acciones bloquea incluso sin detección léxica; las reglas no son una defensa completa contra inyección.

**Antes de producción:** Aislar herramientas, validar permisos, registrar decisiones y probar falsos positivos y ataques no detectados antes de conectar un agente real.

Editar datos, elegir un escenario o reiniciar borra la predicción y los resultados anteriores. La comparación aparece al completar la reproducción; las demos principales no requieren cuenta ni llave.

Este lote modifica la implementación. Las capturas e informes de navegador existentes documentan la etapa anterior. Capturas nuevas, interacción, móvil y rutas HTTP siguen pendientes por los bloqueos documentados. La aprobación visual previa cubre el piloto anterior de seis misiones, no este lote.
<!-- recruiter-mission:end -->

## Instalación y verificación local

Requiere Node.js 22 y pnpm 10.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
node node_modules/typescript/bin/tsc --noEmit --incremental false
pnpm lint
pnpm build
```

Abre `http://localhost:3000/en/app`. La validación registrada cubre pruebas, lint, TypeScript y builds de producción. Consulta los [resultados de comandos](docs/quality/decision-lab-verification.json) y las [comprobaciones de componentes en navegador](docs/quality/decision-lab-browser.json). Estas pruebas usan componentes React y CSS de producción con navegación de idioma controlada; no certifican rutas de Next ni el despliegue público.

## Arquitectura

- `app/[lang]/`: experiencia web por idioma.
- `lib/experience/`: adaptador local tipado, validación y trazas.
- `design-system/`: tokens visuales, controles de idioma y presentación de ejecución y reproducción.
- `app/api/`: integraciones opcionales de servidor; la demo principal no las requiere.

Tecnología: Next.js 16, TypeScript, Python, Vitest, pytest, Tailwind CSS v4.

## Evidencia y límites

Instrucciones de documento pasan por una compuerta de reglas hacia una tarjeta de acción.

Rutas de control y reglas activadas inspeccionables; no ejecuta herramientas.

Hace visible el límite de política antes de que actúe un agente.

**Límites:** El documento y las reglas son ejemplos locales; no se intenta ninguna acción externa. Los escenarios cambian documento y política; alterna la política sobre el mismo documento para aislar su efecto. Estos prototipos de portafolio no afirman impacto medido en producción.

Los datos son ejemplos ficticios o anónimos. Las integraciones opcionales requieren sus propias credenciales y configuración. Los secretos pertenecen al gestor configurado, nunca a archivos locales de secretos ni Git. Usa el flujo existente `infisical run -- <command>` si necesitas integraciones en vivo. La demo local no publica ni despliega automáticamente.

![Captura real de la demo en español](docs/images/demo.es.png)

<!-- community-section -->
## Licencia y contribución

Publicado bajo la [licencia MIT](LICENSE). Se aceptan issues y pull requests: lee antes [CONTRIBUTING.md](CONTRIBUTING.md) y el [Código de Conducta](CODE_OF_CONDUCT.md). Para reportar una vulnerabilidad, consulta [SECURITY.md](SECURITY.md).
<!-- /community-section -->
