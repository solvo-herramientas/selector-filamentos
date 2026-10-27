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

### Estilos y componentes compartidos

Toda la interfaz se estiliza con utilidades de Tailwind CSS v4, integrado mediante el plugin oficial de Vite en `vite.config.ts`. `src/styles.css` contiene los tokens de color, fuentes, radios y movimiento, junto con una base global mínima que usa `@apply`; no importa Preflight ni define selectores de componentes. Conserva los temas automático, claro y oscuro mediante `prefers-color-scheme` y `data-theme`.

Los componentes locales basados en shadcn/ui viven en `src/components/ui`: Button, Input, Label, Checkbox, RadioGroup, Slider, Card, Badge, Table, NativeSelect y Drawer. Son fuentes editables y adaptadas a la presentación compacta de SOLVO. `Table` conserva la tabla nativa y deja el contenedor de desplazamiento en el panel para respetar sus columnas fijas. `Drawer` y `Slider` usan Base UI mediante `@base-ui/react`; `Drawer` muestra el panel modal «Cómo funciona» con contenido a ancho completo y padding lateral, y `Slider` controla las temperaturas de trabajo, pico ocasional, mínima y capacidades de boquilla y cama de la impresora. El helper `cn` está en `src/lib/utils.ts`. El alias `@/*` apunta a `src/*` tanto en Vite como en `tsconfig.json`; `components.json` configura las rutas para futuras incorporaciones.

`src/components/ui/selectable-card.tsx` define la apariencia común de las opciones de respuesta. `SelectableCard` conserva semántica de radio y `SelectableCheckboxCard` conserva semántica de casilla; ambos comparten dimensiones, tipografía y estado seleccionado, con un círculo vacío o un círculo relleno amarillo con tilde según el estado. La opción seleccionada no muestra borde en reposo, pero sí al pasar el cursor; conserva también el contorno de foco del teclado. Los iconos decorativos vienen de `@tabler/icons-react` y no reemplazan la semántica accesible del control. `SelectableCardGrid` envuelve `RadioGroup` con ancho completo por defecto, dos columnas y una en pantallas de hasta 700 px; cada instancia puede ajustar `columns`, `mobileColumns` y `className`. `src/components/SegmentedControl.tsx` adapta esa grilla para las opciones mutuamente excluyentes. Recibe `name`, `value`, `options` y `onChange(value)`; conserva los IDs `${name}_${value}`, `ariaLabel`, `labelledBy`, `describedBy`, `invalid` y `dataAttribute`. Los grupos de hasta tres opciones usan una fila en todos los tamaños de pantalla por defecto; cada instancia puede sobrescribir sus columnas.

Las subsecciones condicionales del asistente usan un panel inset con borde y superficie `bg-card` para mostrar que dependen de la respuesta anterior. Las secciones estáticas mantienen el fondo normal del paso.

La barra de acciones del selector permanece fija al borde inferior en todos los tamaños de pantalla. En escritorio, sus botones se alinean a la derecha dentro del mismo ancho máximo y margen lateral que el contenido; en móviles ocupan el ancho disponible. El selector reserva espacio inferior según la altura medida de la barra y respeta las áreas seguras del dispositivo.

Los títulos de subsección del wizard se renderizan con `Subsection` en `SelectorForm`; usan la fuente display y un tamaño intermedio para distinguirlos de las etiquetas de controles.

Las tablas, el radar, el Drawer de metodología, el Slider de temperatura, los controles `details`, el diseño adaptable, la impresión, las áreas seguras y el movimiento reducido también usan utilidades de Tailwind en sus componentes. El Slider fuente está basado en Base UI, comparte el estilo shadcn y acepta valores controlados como arreglo. Las variantes `data-*`, `motion-reduce`, `starting` y `print` controlan sus estados; las variantes arbitrarias de medios conservan los puntos de corte exactos existentes. Los estilos inline se reservan para valores calculados: colores de materiales y series, porcentajes de barras y medidas del viewport. Para extender la interfaz, componé los elementos de `src/components/ui`, combiná clases con `cn` y reutilizá los tokens semánticos; agregá las clases al componente que controla el elemento.

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
