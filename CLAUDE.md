# Contexto de diseño — Guionia

Referencia rápida del sistema de diseño de esta app, para no tener que volver a explicarlo en cada sesión. Al escribir o modificar UI aquí, sigue estos patrones sin pedir confirmación — son decisiones ya cerradas. Detalle y razonamiento completos en [diseño.md](diseño.md); qué datos gestiona cada pantalla en [readme.md](readme.md).

No introduzcas colores, tipografías, componentes o patrones de navegación que no estén en este archivo. Si hace falta algo nuevo (un componente, un color), añádelo primero a `diseño.md` y luego reflejalo aquí.

## Plataforma

Mobile-first, con tablet y escritorio como capas añadidas encima (`lg:` en adelante) — el layout base sigue siendo el de una columna en móvil; ver [Tablet y escritorio](#tablet-y-escritorio) para el detalle. Solo modo claro (no hay modo oscuro). Densidad compacta. **Estilo claro, tarjetas planas** (referencia: iOS/Material plano, no glassmorphism): fondo gris muy claro (`--bg-page`, `#F5F5F7`) liso detrás de toda la app, sin degradado ni burbujas. Las superficies (tarjetas, tiles, barra superior/inferior, inputs) son blancas sólidas (`--bg-primary`/`--bg-secondary`), separadas del fondo con una sombra suave de dos capas (`--card-shadow`) en vez de blur o borde de cristal. Esquinas redondeadas generosas (más que en un diseño plano convencional).

## Design tokens

```css
/* Fondo de página — plano, sin degradado ni cristal. */
--bg-page: #F5F5F7;

/* Color — neutros. Tarjetas blancas sólidas; se separan del fondo con
   --card-shadow (dos capas, sombra suave) en vez de un borde — .bg-bg-primary
   y .bg-bg-secondary la llevan aplicada automáticamente en globals.css. */
--bg-primary: #FFFFFF;
--bg-secondary: #FFFFFF;
--card-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 6px 16px rgba(16,24,40,0.05);
--border: #ECECEF;      /* borde real y visible (inputs, divisores) — a diferencia del cristal, aquí sí se usa directamente */
--text-primary: #111114;
--text-secondary: #6E6E76; /* un punto más oscuro que el gris "de fábrica" del mockup de origen (#8B8B93, ~3.4:1) para pasar 4.5:1 AA sobre blanco */
--text-disabled: #B4B3BC;

/* Color — acento (único en toda la app, sin color por módulo). Sobre fondo
   claro, un único tono sirve tanto para relleno sólido (texto blanco encima)
   como para texto/iconos sueltos — a diferencia del cristal oscuro anterior,
   no hace falta un segundo tono claro para legibilidad. `--link` existe como
   alias por si algún día vuelve a hacer falta divergir, pero hoy vale lo mismo
   que `--accent`. */
--accent: #6C5CE0;
--accent-hover: #5A4BC4;
--accent-bg: rgba(108,92,224,0.12); /* fondo de resaltado (hover de tiles, focus ring) */
--link: #6C5CE0;

/* Color — IA. --ai y --accent deben distinguirse claramente entre sí (morado
   vs. azul) para que un botón de IA y uno normal no se confundan si aparecen
   juntos. */
--ai: #2F6FED;
--ai-hover: #1F57C9;

/* Color — semántico. Texto plano/relleno translúcido en el resto de la app
   (mensajes de error, "Hoy" en riesgo, barra de progreso...); oscurecidos lo
   justo para pasar 4.5:1 sobre blanco como texto — a diferencia del cristal
   oscuro, aquí NO funcionan los tonos pálidos. No confundir con la paleta
   --badge-* de abajo, que es la de los badges de estado. */
--success: #0B8259;   --success-bg: #E3F7EF;   /* Publicado, Activo */
--warning: #B45F04;   --warning-bg: #FDF0E0;   /* Borrador, Grabado, Pausado */
--neutral: #55555C;   --neutral-bg: #F1F0EE;   /* Idea, Pendiente */
--danger:  #D2483B;   --danger-bg:  #FCE9E7;   /* Descartada, Cancelado, Atrasada */

/* Espaciado (base 4px) */
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
--space-6: 24px; --space-8: 32px; --space-12: 48px;

/* Radio */
--radius-sm: 12px;  /* botones, inputs, badges, iconos cuadrados de plataforma */
--radius-md: 20px;  /* tarjetas, contenedores, tiles */
```

Los tokens están centralizados en `globals.css` (`:root` + `@theme inline`). Como toda la UI usa las clases semánticas de Tailwind (`bg-bg-primary`, `text-text-secondary`, `border-border`, etc.) en vez de colores sueltos, cualquier ajuste de paleta se hace ahí y se propaga solo — no hay colores hardcodeados en componentes (los pocos hex sueltos que quedan en JSX, como `PLATAFORMA_TONO`, son colores de marca de cada plataforma, no del sistema). `.bg-bg-primary`/`.bg-bg-secondary` llevan `--card-shadow` aplicado automáticamente en globals.css, así que cualquier superficie nueva que use esos tokens ya se lee como tarjeta sin clases extra.

## Tipografía

Dos familias, ambas de Google Fonts vía `next/font/google`:

- **Inter** (`--font-inter`, clase Tailwind `font-sans` — la que aplica por defecto en todo el texto), fallback `-apple-system, "Segoe UI", sans-serif`.
- **Space Grotesk** (`--font-space-grotesk`, clase Tailwind `font-display`) — solo para texto de énfasis puntual: el número grande de un gauge/stat (ej. el % de `GaugeCadencia`), los eyebrows en mayúsculas de una sección (ej. "PLATAFORMAS"/"HOY" en Control) y algún título corto y directo (ej. "¿Qué idea se te acaba de ocurrir?"). El resto del texto —cuerpo, labels de formulario, nombres de plataforma, badges, nav— se queda en Inter. No sustituye a Inter como familia base, es un acento tipográfico, así que úsalo con moderación.

| Estilo | Tamaño | Peso |
|---|---|---|
| H1 | 24px | Semibold (600) |
| H2 | 18px | Semibold (600) |
| H3 | 14px | Medium (500) |
| Body | 14px | Regular (400) |
| Small | 13px | Regular (400) |
| Caption | 12px | Medium (500) |

## Iconos

[Lucide](https://lucide.dev), línea fina (outline), trazo 1.5px. 20px en la barra inferior, 24px en los tiles del dashboard, 16px en línea con texto.

## Navegación

- **Barra de navegación inferior fija** (`BottomNav.tsx`, blanca `--bg-secondary`, a todo el ancho y pegada al borde inferior — `inset-x-0 bottom-0`, `border-t border-border`, sin sombra ni esquinas redondeadas, con relleno de `env(safe-area-inset-bottom)`): 4 ítems — Inicio (`/contenido`), Plataformas (`/contenido/plataformas`), Ideas (`/contenido/ideas`), Cuenta (`/contenido/cuenta`). Iconos Lucide 20px; el ítem activo se distingue solo por color, sin fondo — icono/label en `--text-primary` si está activo, `--text-disabled` el resto. Oculta en las rutas de auth (`/login`, `/registro`, etc.) y en `/legal`, y también en escritorio (`lg:hidden` — ahí la navegación vive en `Sidebar`, ver [Tablet y escritorio](#tablet-y-escritorio)). `main` (componente `Main.tsx`) lleva `pb-28` para dejarle hueco (`lg:pb-8` en escritorio, donde no hace falta) — excepto en las rutas de auth, donde no hay `BottomNav` que despejar y por tanto tampoco ese padding.
- **Barra superior** (`--bg-secondary`, altura 56px; no es `fixed`, se desplaza con la página): ya no lleva el icono de Configuración — solo el buscador (en `/contenido` y en `/contenido/buscar`, precargado con la consulta actual en este último) o, en cualquier pantalla que no sea una de las tres raíces (`/contenido`, `/contenido/plataformas`, `/contenido/cuenta`), un icono de volver (`ArrowLeft`, `router.back()`) a la izquierda — `/configuracion` ya no es una raíz, así que ahí también sale la flecha (se llega desde Cuenta). Solo en `/contenido`, además, un icono de Tendencias (`TrendingUp`) a la derecha del buscador, enlazando a `/contenido/tendencias` — sin etiqueta de texto. En `/contenido` específicamente, el buscador y el icono de Tendencias van en blanco (`text-white`/`border-white/40`, placeholder vía la variable `--placeholder-color` que sobreescribe `--text-disabled`) porque ahí se apoyan sobre `OndaCadencia` — ver más abajo.
- **`/contenido/plataformas`**: listado de tarjetas, una por plataforma activa, con icono cuadrado a color (`PLATAFORMA_TONO`, radio `--radius-sm`), barra de progreso de la cadencia semanal y píldoras de "en riesgo / pendientes / olvidadas" — la vista de detalle a la que lleva la pestaña "Plataformas" de la barra inferior. El enlace de cada plataforma (y el de la rejilla de Plataformas en Control) va directo a `/contenido/{plataforma}/videos`, que redirige sola al mes actual — ya no existe una página intermedia `/contenido/{plataforma}` con tiles de Ideas/Vídeos (las ideas viven en la pestaña "Ideas" combinada).
- **`/contenido/cuenta`**: estadísticas de cada cuenta conectada, una sección por plataforma (`Suspense` independiente cada una, para que una lenta no bloquee a la otra), usando la tarjeta compartida `StatMes` (número + flecha ↑/↓ verde/roja con el % respecto al mes anterior):
  - **YouTube** (`CuentaSection.tsx`): avatar + nombre del canal, suscriptores/vistas totales/vídeos, y "este mes vs. el anterior" (vistas, comentarios, likes, suscriptores ganados) vía `obtenerComparativaMensual` — Analytics API con `dimensions=month`, un solo request para ambos meses.
  - **TikTok** (`CuentaTiktokSection.tsx`, requiere el scope `user.info.stats` además de `user.info.basic`/`video.list`): avatar + nombre, seguidores/likes totales/vídeos vía `obtenerCuentaPropia`. TikTok no tiene una API de analítica agregada por fechas, así que "este mes vs. el anterior" se calcula sumando a mano las estadísticas (ya pedidas por vídeo en otras partes de la app) de tus propios vídeos publicados en cada mes — no es un dato de la API, es un cálculo local.
  
  Debajo de ambas, una fila **Ajustes** que enlaza a `/configuracion`. Es la pestaña "Cuenta" de la barra inferior — sustituye a lo que antes era un acceso directo a Ajustes.
- **Dashboard de Contenido** (`/contenido`) — "Control": **excepción al patrón de tarjetas** del resto de la app — es una lista continua de secciones separadas por hairline (`border-b border-border`), sin fondo propio ni sombra en cada bloque (a diferencia de `Tarjeta` en [Componentes](#componentes)). No lleva cabecera "Control" ni píldora de semana, ni la fila "Tendencias" (ese enlace vive en la `TopBar`, ver arriba). Detrás de la cabecera va **`OndaCadencia`**: una banda con el borde inferior ondulado, sin texto propio, rellena de `--ai` (el único azul del sistema) — su altura (constantes `ALTURA_MIN`/`ALTURA_MAX` en el propio componente, en ajuste) crece con el % de la cadencia semanal, calculada para cubrir siempre la sección de cadencia y terminar justo antes de Plataformas, pegada tras la `TopBar` (`position: absolute; top: -56px`, dentro de un contenedor `relative`; la `TopBar` necesita `relative z-10` para pintarse por delante de la onda, que sin `position` propia se pintaría detrás igualmente incluso con `z-0`). Sobre la onda va **`GaugeCadencia`**: el mismo gauge circular de 270° con marcas de reloj alrededor que ya se usaba en versiones anteriores del dashboard, pero en blanco (pista `rgba(255,255,255,0.25)`, arco relleno `#FFFFFF`, marcas `rgba(255,255,255,0.35)`, punto indicador blanco con borde `--ai`) — el resto de texto de la sección ("de la cadencia semanal") también en blanco (`text-white`/`text-white/80`), no en los tokens de texto habituales, porque siempre está sobre la onda. Orden del contenido: sección de cadencia (gauge + "X% de la cadencia semanal") — sin más tarjetas-stat sueltas, el único número que manda arriba es la cadencia. Luego **Plataformas**: una rejilla de 2 columnas (`grid grid-cols-2`, incluso en móvil) de tiles compactos — icono cuadrado a color `PLATAFORMA_TONO` de 30px, nombre y "X de Y"/"Sin cadencia" apilados debajo, sin barra de progreso ni divisores entre tiles (solo el `gap` de la rejilla). No hay sección "Hoy" en este dashboard. Luego, a todo el ancho, **Atrasadas** (solo si hay alguna; eyebrow en `--danger` + contador en píldora `--neutral-bg`, filas con punto `--danger` + título, sin badge de texto — el propio eyebrow ya dice que están atrasadas). La captura rápida de ideas (`CapturaRapidaForm`, título + chips de plataforma + input subrayado) ya no va fija en la pantalla — vive dentro de **`CapturaFlotante`**, una notificación flotante (estilo TikTok) que aparece sola a los 2 segundos de entrar en `/contenido` (`setTimeout` + animación de entrada por `@keyframes`), anclada abajo (`fixed bottom-24`, encima de `BottomNav`; en escritorio pasa a la esquina inferior derecha, `lg:right-6 lg:w-96`), con una X para cerrarla y que se cierra sola al guardar una idea.
- **Dashboard de Configuración**: rejilla de tiles (`grid-cols-2`, `md:grid-cols-3`) → Plataformas, **Cadencia fija** (`/configuracion/cadencia`) y **Plantilla semanal** (`/configuracion/plantilla`, "solo como referencia manual — no genera recordatorios ni aparece en el dashboard") son dos tiles independientes, no una sola pantalla combinada, Estructuras, Hooks, CTAs.

## Tablet y escritorio

Un único breakpoint hace casi todo el trabajo: **`lg:` (≥1024px)**. Por debajo de eso (móvil y tablet en vertical/apaisado estrecho) la app es exactamente el layout mobile-first de siempre — nada cambia hasta `lg:`. `md:` (≥768px) se usa una sola vez (rejilla de Configuración, ver abajo) para un escalón intermedio en tablet ancha.

- **Navegación**: a partir de `lg:`, `BottomNav` desaparece (`lg:hidden`) y aparece **`Sidebar.tsx`** — panel blanco fijo a la izquierda (`--bg-secondary`, `lg:w-60`, `lg:sticky lg:top-0 lg:h-screen`), con el wordmark "Guionia" arriba y los mismos 4 destinos que `BottomNav` en filas horizontales (icono 20px + label, en vez de apilados). Ambos componentes leen la misma lista de ítems y la misma lógica de "activo" desde `src/lib/navegacion.ts` — cualquier cambio de destinos se hace ahí una sola vez. `layout.tsx` pasa a `lg:flex-row` a nivel de `<body>` para colocar el sidebar junto al resto (`TopBar` + `main`) en vez de encima.
- **Ancho del contenido**: cada pantalla limita su ancho y se centra en escritorio con `lg:mx-auto lg:w-full lg:max-w-{N} lg:p-8` en el contenedor raíz (nunca a todo lo ancho del viewport — un formulario de un solo campo no debe estirarse a 1600px). Convención de anchos según el tipo de pantalla:
  - Formulario enfocado (nueva idea, nuevo hook/CTA, nueva estructura/cadencia/plantilla, publicar): `max-w-xl` o `max-w-2xl`.
  - Detalle (idea, guion, estructura): `max-w-2xl` o `max-w-3xl` según cuánto contenido lleve (el guion, con escenas + estadísticas, usa `3xl`).
  - Listado/dashboard con tarjetas (Plataformas, Ideas, Configuración, Control): `max-w-3xl` o `max-w-4xl`.
  - Calendario mensual: `max-w-3xl`, y las celdas crecen (`lg:min-h-24`) para aprovechar el alto extra.
- **Multi-columna real**: donde había una lista de tarjetas de una sola columna, en escritorio pasa a rejilla — `lg:grid lg:grid-cols-2` en Plataformas (`/contenido/plataformas`), ideas activas de `/contenido/ideas`, y las listas de hooks/CTAs. El dashboard de Configuración (tiles) usa `md:grid-cols-3` (un escalón antes, porque son tiles pequeños). El dashboard de Contenido es la excepción — su rejilla de Plataformas es de 2 columnas ya desde móvil (no solo en `lg:`, así lo pide el diseño de esa pantalla), con la sección de cadencia arriba y Atrasadas debajo, ambas a todo el ancho.
- **Login / registro**: son la excepción — llevan su propio layout de "hero + hoja inferior" a pantalla completa en móvil (sin `Sidebar`/`BottomNav`, están en `RUTAS_AUTH`). En escritorio no se estiran a todo el viewport: se centran como una tarjeta de ancho fijo (`lg:max-w-sm`, hero con alto fijo `lg:min-h-56 lg:flex-none` en vez de `min-h-[30vh]` relativo al viewport, `lg:rounded-md lg:shadow-2xl` para que se lea como una tarjeta flotante sobre el fondo). Estas 4 pantallas (login, registro, olvide/restablecer contraseña) activan ese margen ya en `md:` en vez de esperar a `lg:` — al no llevar `Sidebar`, no dependen del breakpoint del resto de la app y se ven mejor centradas desde antes, en tablet.
- **Dentro de una sección** (listado de ideas/guiones de una plataforma): tabla compacta. **Excepción: `/contenido/ideas`** (todas las plataformas juntas, destino de la pestaña "Ideas" de la barra inferior) usa tarjetas en vez de tabla — icono cuadrado a color (`PLATAFORMA_TONO`), filtro por plataforma en chips, secciones "Activas"/"Descartadas", y tinte `--warning-bg` en las que llevan ≥30 días sin convertir a guion ("olvidadas").

## Componentes

- **Botón primario**: fondo `--accent`, texto blanco, radio `--radius-sm`, sin sombra ni borde.
- **Botón secundario**: sin fondo propio, sin borde, texto `--text-primary`.
- **Botón ghost**: sin fondo/borde, texto `--accent` — acciones secundarias en tablas.
- **Input**: fondo `--bg-primary` (blanco) con borde `--border`, radio `--radius-sm`; foco = anillo `--accent-bg`. Excepción: el buscador de `TopBar` y el campo de `CapturaRapidaForm` van sin caja — fondo transparente, solo `border-b border-border` (foco = `border-accent`), a juego con el resto de filas subrayadas de "Control". Importante: `input`/`textarea`/`select` llevan `background: var(--input-bg, var(--bg-primary))` en `globals.css` (regla sin `@layer`, así que gana siempre a `bg-transparent` u otra clase de Tailwind con la misma especificidad) — para un input transparente hay que pasar `style={{ "--input-bg": "transparent" }}`, no basta con la clase.
- **Tabla**: fila ~36px alto, cabecera fondo `--bg-secondary` (texto H3), sin líneas verticales ni horizontales, filas separadas solo por el cambio de tono al hover (`--bg-secondary`).
- **Badge de estado**: forma píldora de **relleno sólido** (no translúcida), texto Caption blanco (`--badge-warning-text` oscuro solo en warning, por ser el tono más luminoso), padding horizontal `--space-2`. Usa la paleta `--badge-*` (no `--success`/`--warning`/`--danger`/`--neutral` — ver nota).
- **Tarjeta**: fondo `--bg-primary` (blanco, con `--card-shadow`), radio `--radius-md`, sin borde, padding `--space-4`–`--space-6`.
- **Tile de navegación** (botones grandes del dashboard): tarjeta blanca (fondo `--bg-primary`, `--card-shadow`), círculo `--bg-secondary` de 44px con icono `--accent` 20px centrado + label H3 debajo, área táctil mínima 96×96px, fondo pasa a `--accent-bg` al pulsar.
- **Botón de IA**: fondo `--ai` (azul, deliberadamente distinto de `--accent`), texto blanco, icono `Sparkles` + etiqueta, mismo radio `--radius-sm` que el resto de botones. Marca cualquier acción de IA como su propia categoría visual en toda la app — no reutilizar `--accent` para esto.
- **`PLATAFORMA_TONO`** (en `PlataformaTile.tsx`, solo exporta el mapa de color — no hay componente `Tile` propio de plataforma, se usa el `Tile` normal): colores de marca sólidos, propios de cada plataforma (no derivados de los tokens del sistema) — TikTok `#111114`, Instagram `#D6336C`, LinkedIn `#0A66C2`, YouTube `#FF3B30`. Se aplican sobre un icono **cuadrado redondeado** (radio `--radius-sm`, no círculo) de 32-44px según el contexto, con el icono de Lucide en blanco centrado.
- **`OlaProgreso`**: gauge circular "ola de líquido" — un nivel azul (`--ai`, el único azul del sistema; reutilizado aquí como decorativo, no como marca de IA) sube dentro de un círculo (`--neutral-bg` de fondo) hasta el % de la cadencia semanal, con una animación de oleaje continua (SVG + `@keyframes` en un `<style>` local, sin JS). Número hechas/objetivo centrado, en blanco cuando el nivel lo cubre (≥50%) o en `--text-primary` si no.

Nota — `--border` es un color real y visible (`#ECECEF`), no un token especial: se escribe `border border-border` en el JSX igual que cualquier otro borde, sin casos especiales que recordar. `.bg-bg-primary`/`.bg-bg-secondary` no añaden borde, solo `--card-shadow` (la separación del fondo es por sombra, no por borde).

Nota — dos paletas semánticas, a propósito: `--success`/`--warning`/`--danger`/`--neutral` (oscurecidos para AA) siguen usándose tal cual como texto plano/relleno translúcido en el resto de la app (mensaje de error, día "en riesgo" del calendario, sección "Hoy", barra de progreso). `--badge-success`/`--badge-warning`/`--badge-danger`/`--badge-neutral` (saturados, relleno sólido) son **solo para `Badge.tsx`**, donde los 4 estados aparecen unos junto a otros en listas/tablas y necesitan distinguirse entre sí bajo daltonismo. Al ser rellenos sólidos con su propio texto de contraste, no dependen del fondo de la página — cambiar `--bg-page` no obliga a retocarlos.

Nota — contraste comprobado a mano (fórmula WCAG) al definir esta paleta clara: `--text-primary` 18.9:1, `--text-secondary` 5.1:1, `--accent`/`--ai` con texto blanco encima 4.9:1/4.6:1 — todos ≥ 4.5:1 sobre `#FFFFFF`. `--text-disabled` (2.1:1) queda deliberadamente por debajo, como en cualquier estado disabled/placeholder. `--accent` (morado `#6C5CE0`) y `--ai` (azul `#2F6FED`) son hues claramente distintos — sigue siendo la pareja que más importa no confundir (botón de IA vs. botón normal). **No se ha vuelto a correr el script `validate_palette.js` del skill `dataviz` con esta paleta** (no se localizó en esta sesión) — si se retoca cualquiera de estos dos tonos, conviene pasarlo por ahí para el contraste bajo daltonismo, no solo WCAG.
