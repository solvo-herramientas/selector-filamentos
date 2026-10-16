# Selector de Filamentos

Herramienta gratuita para elegir el filamento de impresión 3D adecuado para una pieza según sus condiciones reales de servicio.

**Usala acá:** https://solvo-herramientas.github.io/selector-filamentos/

## Qué hace

- Te pregunta qué es la pieza y en qué condiciones trabaja: temperatura, sol, humedad, líquidos y químicos, esfuerzos, requisitos especiales y equipo de impresión.
- Descarta los materiales que no cumplen y ordena el resto con un puntaje de 0 a 100.
- Muestra los materiales que **casi cumplen** y qué cambio los haría viables (recubrimiento anti-UV, recocido, etc.).
- Indica qué condición es la que más restringe la elección.
- Compara hasta 3 materiales en un gráfico radar.
- Da recomendaciones de fabricación para el material elegido.
- Incluye un explorador de materiales con buscador por necesidad («nafta», «sol», «100 °C») y una matriz de resistencia química.

Materiales incluidos: PLA, PETG, PETG-GF, PETG-CF, ABS, ABS-GF, ASA, PC, PA6, PA12, PA12-CF, PA6-CF, TPU 95A, PP y POM.

## Uso del selector

El selector mantiene los siete pasos de la ficha original en formato wizard: tipo de pieza, temperaturas, exterior, líquidos y químicos, esfuerzos mecánicos, requisitos especiales y fabricación. Elegí el tipo de pieza para cargar sugerencias editables y avanzá con **Continuar**; cada paso queda en pantalla hasta que decidas seguir. Los detalles condicionales se muestran dentro de su paso, como color si hay sol directo, nivel de contacto de cada agente químico y capacidades del equipo si imprimís la pieza. **No sé** conserva los supuestos conservadores de la herramienta. Al completar el séptimo paso aparece el informe con las recomendaciones. Desde ahí podés **Editar respuestas** o **Empezar de nuevo**; cambiar de pestaña conserva el progreso actual.

## Alcance

Los valores son típicos por familia sobre pieza impresa, no de una marca en particular. La impresión agrega anisotropía y cada configuración cambia el resultado. Es una herramienta de **preselección**: para piezas críticas, validá con ensayo.

## Desarrollo

Usamos Node.js `24.19.0` y pnpm `12.14.0`, administrado con Corepack. Desde la raíz del repositorio:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

El servidor de desarrollo muestra la URL local en la terminal. Para revisar el código y preparar una versión de producción:

```sh
corepack pnpm typecheck
corepack pnpm build
corepack pnpm preview
```

`build` verifica TypeScript y genera el sitio estático en `dist/`; `preview` sirve ese resultado por HTTP. También podés correr las verificaciones de dominio, persistencia y rutas de publicación:

```sh
corepack pnpm run verify:wizard
corepack pnpm run verify:domain
corepack pnpm run verify:persistence
corepack pnpm run verify:pages-build
corepack pnpm run verify:pages-workflow
```

`verify:pages-build` se ejecuta después de `build`. Abrir `index.html` directamente con `file://` ya no ejecuta la aplicación: usá el servidor de desarrollo o serví el build.

Para editar la base de materiales, abrí la herramienta con `#curador` al final de la dirección.

## Publicación en GitHub Pages

La dirección pública es https://solvo-herramientas.github.io/selector-filamentos/. El workflow [Build and deploy GitHub Pages](.github/workflows/pages.yml) valida cada pull request a `main`; solo publica después de un build correcto en `main`. Sube `dist/` como el artifact `github-pages` y despliega ese artifact con el entorno de GitHub Pages.

La fuente registrada antes de esta migración era la rama `main`, carpeta `/`, con publicación heredada. Para pasar a Actions, después de revisar que el pull request compila y, como parte de la misma ventana de salida, abrí **Settings → Pages → Build and deployment**, elegí **GitHub Actions** como fuente y luego integrá el cambio en `main`. Confirmá en **Actions** que terminaron bien los trabajos `build` y `deploy` y que la URL del entorno `github-pages` coincide con la dirección pública. Comprobá que la página y sus recursos respondan bajo `/selector-filamentos/`; el fragmento `#curador` se verifica al abrir la aplicación manualmente.

Para volver a la publicación heredada, revertí el cambio de migración para que `main:/` vuelva a contener el `index.html` autónomo original. Después seleccioná **Deploy from a branch**, rama `main`, carpeta `/` en **Settings → Pages**. No cambies la fuente mientras la raíz de `main` tenga el HTML de Vite: sus recursos de producción viven en `dist/` y no se publican desde esa raíz.

## Autor

Desarrollada por [SOLVO Fabricaciones Digitales](https://solvo.ar), San Juan, Argentina: ingeniería mecánica y manufactura aditiva industrial.

¿Necesitás fabricar la pieza? Escribinos por [WhatsApp](https://wa.me/5492645484363) o a contacto@solvo.ar.

Si la herramienta te sirvió, podés [invitarnos un cafecito ☕](https://cafecito.app/solvo).
