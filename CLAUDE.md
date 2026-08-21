# Contexto de diseño — Guionia

Referencia rápida del sistema de diseño de esta app, para no tener que volver a explicarlo en cada sesión. Al escribir o modificar UI aquí, sigue estos patrones sin pedir confirmación — son decisiones ya cerradas. Detalle y razonamiento completos en [diseño.md](diseño.md); qué datos gestiona cada pantalla en [readme.md](readme.md).

No introduzcas colores, tipografías, componentes o patrones de navegación que no estén en este archivo. Si hace falta algo nuevo (un componente, un color), añádelo primero a `diseño.md` y luego reflejalo aquí.

## Plataforma

Mobile-first. Sin sidebar. Solo modo claro (no hay modo oscuro). Densidad compacta. **Estilo glass, cristal denso**: fondo con degradado "Neón cíber" (azul eléctrico → violeta → magenta; el violeta central está calibrado al punto más claro que sigue pasando el mínimo de contraste de texto, no el violeta "puro"), con 3 burbujas grandes y difuminadas (130-160px) de distintos colores repartidas por la pantalla, más resplandores aún mayores en las esquinas, detrás de toda la app. Se desplaza con la página (no se queda fijo al hacer scroll); las superficies (tarjetas, tiles, barra superior, inputs) son cristales translúcidos con `backdrop-filter: blur() saturate()`, sombra propia y un borde de brillo sutil, dejando ver el degradado a través de ellas — más opacos/densos que un glassmorphism típico (referencia: Centro de Control de iOS, no macOS/Windows), para que la superficie se lea "sólida" sin perder el color de fondo. Esquinas redondeadas generosas (más que en un diseño plano convencional).

## Design tokens

```css
/* Fondo — degradado "Neón cíber" fijo detrás de toda la app (body::before) */
--bg-body-a: #0057D6;
--bg-body-b: #5B2FB0;
--bg-body-c: #E0138A;
--glass-blur: 24px;
--glass-saturate: 150%;

/* Color — neutros (glass: translúcidos sobre el degradado).
   Cristal denso, no un glassmorphism típico: más opacidad, blur y
   saturación que la primera pasada, más sombra propia (--glass-shadow),
   para que las cajas se lean "sólidas" sin perder el degradado detrás.
   Subir la opacidad más allá de esto empeora el contraste en los tramos
   claros del degradado (azul/magenta) — techo validado con dataviz, no
   un tope arbitrario. */
--bg-primary: rgba(255,255,255,0.26);   /* fondo de tarjetas/tiles/inputs — lleva blur+saturate+sombra */
--bg-secondary: rgba(255,255,255,0.32); /* barra superior, cabeceras de tabla — lleva blur+saturate+sombra */
--glass-shadow: 0 8px 32px rgba(0,0,0,0.28);
--border: transparent;                  /* token sin usar en cajas — el borde real de las cajas se aplica directamente a .bg-bg-primary/.bg-bg-secondary en globals.css (ver nota abajo) */
--text-primary: #FFFFFF;
--text-secondary: rgba(255,255,255,0.78);
--text-disabled: rgba(255,255,255,0.55);

/* Color — acento (único en toda la app, sin color por módulo).
   --accent es solo para RELLENOS sólidos (botones con texto blanco encima):
   necesita ser oscuro/saturado para que el blanco tenga contraste.
   --link es para texto y iconos sueltos sobre el cristal (enlaces, botones
   ghost, icono de Tile): necesita ser claro para leerse sobre cualquier zona
   del degradado. Comparten familia de color pero son dos tokens porque un
   único tono no puede servir bien a la vez de fondo-con-texto-blanco y de
   texto-sobre-fondo-oscuro. En el CSS, `.text-accent` se sobrescribe para
   usar `--link` — en JSX se sigue escribiendo `text-accent` como siempre. */
--accent: #C21C79;          /* botones primarios, pestaña/ítem activo, foco */
--accent-hover: #A11764;
--accent-bg: rgba(255,255,255,0.3); /* fondo de resaltado (hover de tiles, focus ring) */
--link: #F3EFFF;            /* links, botones ghost, iconos sueltos */

/* Color — semántico. Texto plano/relleno translúcido en el resto de la app
   (mensajes de error, "Hoy" en riesgo, barra de progreso...); no confundir
   con la paleta --badge-* de abajo, que es la de los badges de estado. */
--success: #BAFFC9;   --success-bg: rgba(76,214,140,0.4);   /* Publicado, Activo */
--warning: #FFDCA8;   --warning-bg: rgba(255,179,122,0.4);  /* Borrador, Grabado, Pausado */
--neutral: rgba(255,255,255,0.88); --neutral-bg: rgba(255,255,255,0.24); /* Idea, Pendiente */
--danger:  #FFB199;   --danger-bg:  rgba(255,90,60,0.4);    /* Descartada, Cancelado */

/* Espaciado (base 4px) */
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
--space-6: 24px; --space-8: 32px; --space-12: 48px;

/* Radio */
--radius-sm: 12px;  /* botones, inputs, badges */
--radius-md: 20px;  /* tarjetas, contenedores, tiles */
```

Los tokens están centralizados en `globals.css` (`:root` + `@theme inline`). Como toda la UI usa las clases semánticas de Tailwind (`bg-bg-primary`, `text-text-secondary`, `border-border`, etc.) en vez de colores sueltos, cualquier ajuste de paleta se hace ahí y se propaga solo — no hay colores hardcodeados en componentes. El `backdrop-filter` del cristal se aplica de forma global a `.bg-bg-primary`/`.bg-bg-secondary` y a `input`/`textarea`/`select`, así que cualquier superficie nueva que use esos tokens es "glass" automáticamente, sin clases extra.

## Tipografía

Familia: **Inter**, fallback `-apple-system, "Segoe UI", sans-serif`.

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

- **Sin barra de navegación inferior.** Contenido es la pantalla raíz (`/` redirige ahí).
- **Barra superior** (`--bg-secondary`, altura 56px; no es `fixed`, se desplaza con la página como el resto del contenido): en las pantallas raíz (`/contenido`, `/configuracion`) a la izquierda va el buscador (solo en Contenido) y a la derecha el icono de Configuración (`Settings`, se convierte en `ArrowLeft` hacia Contenido dentro de Configuración). **En cualquier pantalla que no sea una de esas dos raíces** (una idea, un guion, una estructura, un formulario "nuevo"…), a la izquierda aparece siempre un icono de volver (`ArrowLeft`, `router.back()`) en vez del buscador/hueco — así cualquier sección tiene una salida clara sin depender del botón atrás del navegador. **Excepción: `/contenido/buscar`** combina ambos — lleva el icono de volver Y el buscador (precargado con la consulta actual) en vez del hueco vacío, para poder modificar la búsqueda sin tener que volver atrás y reescribirla desde cero.
- **Dashboard de cada módulo**: bloque de "datos generales" arriba (control mensual en Contenido) + rejilla de 2 columnas de botones grandes (tiles) debajo. Contenido → TikTok, Instagram, LinkedIn, YouTube. Configuración → Control semanal (cadencia fija y plantilla semanal editables).
- **Dentro de una sección**: listado en tabla compacta (ideas/guiones).

## Componentes

- **Botón primario**: fondo `--accent`, texto blanco, radio `--radius-sm`, sin sombra ni borde.
- **Botón secundario**: sin fondo propio (deja ver el cristal del contenedor), sin borde, texto `--text-primary`.
- **Botón ghost**: sin fondo/borde, texto `--accent` — acciones secundarias en tablas.
- **Input**: fondo `--bg-primary` con blur y borde de cristal (ver nota), radio `--radius-sm`; foco = anillo `--accent-bg`.
- **Tabla**: fila ~36px alto, cabecera fondo `--bg-secondary` (texto H3), sin líneas verticales ni horizontales, filas separadas solo por el cambio de tono al hover (`--bg-secondary`).
- **Badge de estado**: forma píldora de **relleno sólido** (no translúcida), texto Caption blanco (`--badge-warning-text` oscuro solo en warning, por ser el tono más luminoso), padding horizontal `--space-2`. Usa la paleta `--badge-*` (no `--success`/`--warning`/`--danger`/`--neutral` — ver nota).
- **Tarjeta**: fondo `--bg-primary` (cristal, con blur y borde de cristal), radio `--radius-md`, sin sombra dura, padding `--space-4`–`--space-6`.
- **Tile de navegación** (botones grandes del dashboard): tarjeta de cristal (fondo `--bg-primary`, mismo borde de cristal), círculo `--bg-secondary` de 44px con icono `--accent` 20px centrado + label H3 debajo, área táctil mínima 96×96px, fondo pasa a `--accent-bg` al pulsar.
- **Botón de IA**: fondo `--ai` (azul, deliberadamente distinto de `--accent`), texto blanco, icono `Sparkles` + etiqueta, mismo radio `--radius-sm` que el resto de botones. Marca cualquier acción de IA como su propia categoría visual en toda la app — no reutilizar `--accent` para esto.

Nota — borde de cristal: `--border` es `transparent` y no se usa directamente en cajas; en su lugar, `globals.css` aplica `border: 1px solid rgba(255,255,255,0.28)` + `box-shadow: var(--glass-shadow)` directamente a `.bg-bg-primary`/`.bg-bg-secondary`, así que **cualquier superficie que use esos tokens de fondo ya lleva el borde y la sombra de cristal automáticamente**, sin añadir clases de borde en el JSX (de hecho, no hace falta escribir `border border-border` — con poner `bg-bg-primary` o `bg-bg-secondary` ya viene incluido, junto con el blur/saturate/sombra).

Nota — dos paletas semánticas, a propósito: `--success`/`--warning`/`--danger`/`--neutral` (pálidos) siguen usándose tal cual como texto plano/relleno translúcido en el resto de la app (mensaje de error, día "en riesgo" del calendario, sección "Hoy", barra de progreso) — ahí el tono pálido es lo que da contraste sobre el cristal oscuro. `--badge-success`/`--badge-warning`/`--badge-danger`/`--badge-neutral` (saturados, relleno sólido) son **solo para `Badge.tsx`**, donde los 4 estados aparecen unos junto a otros en listas/tablas y necesitan distinguirse entre sí bajo daltonismo — algo que los tonos pálidos, casi todos blanquecinos, no garantizaban. Al ser rellenos sólidos con su propio texto de contraste, no dependen del fondo de la página — cambiar la paleta del degradado (`--bg-body-*`) no obliga a retocarlos.

Validado con el skill `dataviz`. Comando usado para la paleta actual (fondo "Neón cíber"): `node scripts/validate_palette.js "#0B7A52,#B8830A,#B62525,#6B7280,#C21C79,#2F6FFF" --mode dark --surface "#170B33" --pairs all` (los 4 badges + `--accent` + `--ai` en la misma tirada, por si `--accent` y `--ai` aparecen juntos en pantalla — pasó con ΔE 22.2, muy por encima del umbral). El acento (`--accent`) sí depende del fondo: se recalculó con `contrast()` del mismo script para que el blanco encima siga leyéndose (≥4.5:1) contra el nuevo degradado. **Si se cambia la paleta del degradado otra vez, hay que repetir esta comprobación para `--accent`/`--link` (dependen del fondo) — los `--badge-*` no hace falta tocarlos.**
