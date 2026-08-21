# Guionia — Diseño del Panel

Guía de diseño del panel: colores, tipografía, componentes y estructura visual. Relacionado: [readme.md](readme.md) (qué gestiona el panel). Sin marca previa que respetar — paleta y estilo definidos desde cero para este documento.

## 1. Dirección general

- **Estilo**: minimalista y limpio — prioriza claridad y datos sobre decoración, mínimos elementos visuales.
- **Plataforma**: mobile-first. Se diseña primero la versión móvil, sin sidebar — la versión de escritorio se adapta más adelante a partir de esta base.
- **Modo**: solo claro (no se construye modo oscuro).
- **Densidad**: compacta — listados y tablas priorizan ver el máximo de contenido/trabajos sin scroll.
- **Elevación**: plano — sin sombras salvo en elementos flotantes (menús desplegables, modales), donde se usa una sombra mínima solo para separarlos del contenido de detrás. El resto de la interfaz se separa con bordes finos, no con sombras.

## 2. Color

### 2.1 Paleta base (neutros)

| Token | Hex | Uso |
|---|---|---|
| `bg-primary` | `#FFFFFF` | Fondo principal del contenido |
| `bg-secondary` | `#F7F8FA` | Fondo de la barra inferior, barra superior y cabeceras de tabla |
| `border` | `#E5E7EB` | Bordes de tarjetas, tablas, inputs — el separador principal en un diseño plano |
| `text-primary` | `#111827` | Texto principal, títulos |
| `text-secondary` | `#6B7280` | Texto secundario, metadatos, placeholders |
| `text-disabled` | `#9CA3AF` | Texto deshabilitado |

### 2.2 Color de acento

Un único azul en toda la interfaz (Contenido y Negocio comparten el mismo acento — no hay color por módulo).

| Token | Hex | Uso |
|---|---|---|
| `accent` | `#2563EB` | Botones primarios, links, pestaña activa de la barra inferior, foco de inputs |
| `accent-hover` | `#1D4ED8` | Estado hover/pressed de `accent` |
| `accent-bg` | `#EFF6FF` | Fondo suave para resaltar (ítem activo del sidebar, fila seleccionada) |

### 2.3 Color semántico (estados)

Usado en las badges de estado que aparecen en Contenido (idea/guion/grabado/publicado) y en Negocio (trabajo activo/pausado/idea):

| Token | Hex texto | Hex fondo | Se usa para |
|---|---|---|---|
| `success` | `#16A34A` | `#F0FDF4` | Publicado, Activo |
| `warning` | `#D97706` | `#FFFBEB` | Borrador, Grabado, Pausado |
| `neutral` | `#6B7280` | `#F3F4F6` | Idea, Pendiente |
| `danger` | `#DC2626` | `#FEF2F2` | Descartada, Cancelado |

## 3. Tipografía

- **Familia**: Inter (sans geométrica), con fallback `-apple-system, "Segoe UI", sans-serif`.
- **Pesos usados**: Regular (400), Medium (500) para énfasis y labels, Semibold (600) para títulos.

| Estilo | Tamaño | Peso | Uso |
|---|---|---|---|
| H1 | 24px | Semibold | Título de página |
| H2 | 18px | Semibold | Título de sección/tarjeta |
| H3 | 14px | Medium | Subtítulo, cabecera de tabla |
| Body | 14px | Regular | Texto general, contenido de tablas |
| Small | 13px | Regular | Metadatos, fechas, texto secundario |
| Caption | 12px | Medium | Badges de estado, etiquetas |

## 4. Espaciado y forma

- **Escala de espaciado** (base 4px): 4, 8, 12, 16, 24, 32, 48px.
- **Radio de esquina**: ligeramente redondeado en todos los elementos — `6px` en botones/inputs/badges, `8px` en tarjetas y contenedores.
- **Iconos**: línea fina (outline), librería [Lucide](https://lucide.dev) — 18px en navegación, 16px en línea con texto, trazo 1.5px.

## 5. Estructura de navegación (mobile-first)

Sin sidebar. Navegación en dos niveles: una **barra inferior** fija que cambia de módulo, y dentro de cada módulo un **dashboard** con botones grandes que llevan a cada sección.

### 5.1 Barra inferior

Fija en la parte inferior de la pantalla, fondo `bg-secondary`, borde superior `border`, sin sombra. Solo dos pestañas:

- **Contenido**
- **Negocio**

Cada pestaña con icono (Lucide, 20px) encima del texto (Caption). Pestaña activa: icono y texto en `accent`. Pestaña inactiva: `text-secondary`.

### 5.2 Barra superior

Fija en la parte superior, fondo `bg-primary`, borde inferior `border`. Muestra únicamente el título de la pantalla actual (H1 en el dashboard de cada módulo, H2 al entrar en una sección) — sin logo ni acciones adicionales por ahora.

### 5.3 Dashboard de cada módulo

Al pulsar una pestaña de la barra inferior se entra en el dashboard de ese módulo, con dos bloques en este orden:

1. **Datos generales** (arriba de todo): en Contenido, resumen del "Control" mensual — cadencia de la semana y checklist en curso (fuente: [estructura.md](../contenido/estructura.md) y [mensual.md](../contenido/mensual/mensual.md)). En Negocio, resumen de las métricas clave del negocio — MRR, negocios activos, altas del mes (fuente: [idea.md sección 10](../idea%20negocio/idea.md)).
2. **Botones grandes de navegación** (debajo, en rejilla de 2 columnas): acceso a cada sección del módulo.

| Módulo | Botones grandes de la rejilla |
|---|---|
| Contenido | TikTok · Instagram · LinkedIn · YouTube |
| Negocio | Idea de negocio · Trabajos |

Cada botón abre el listado/detalle de esa sección (componentes de tabla y ficha, sección 6).

## 6. Componentes

### 6.1 Botones

| Variante | Estilo |
|---|---|
| Primario | Fondo `accent`, texto blanco, radio 6px, sin sombra |
| Secundario | Fondo blanco, borde `border`, texto `text-primary` |
| Ghost/texto | Sin fondo ni borde, texto `accent`, para acciones secundarias en tablas |

### 6.2 Inputs

Borde fino `border`, radio 6px, fondo blanco. En foco: borde `accent` + anillo suave `accent-bg` alrededor.

### 6.3 Tablas (listados de contenido/trabajos)

- Densidad compacta: altura de fila ~36px, texto en tamaño Body/Small.
- Cabecera con fondo `bg-secondary`, texto H3.
- Sin líneas verticales entre columnas; solo línea horizontal `border` entre filas.
- Fila con hover en `bg-secondary` para indicar interactividad.

### 6.4 Badges de estado

Forma de píldora (radio completo), fondo y texto según la tabla de color semántico (sección 2.3), tamaño Caption, padding horizontal 8px.

### 6.5 Tarjetas (fichas de trabajo, resumen de control mensual)

Fondo blanco, borde `border` 1px, radio 8px, sin sombra, padding 16-24px.

### 6.6 Botones grandes de navegación (tiles del dashboard)

Tarjeta cuadrada en la rejilla de 2 columnas de cada dashboard (sección 5.3): fondo blanco, borde `border` 1px, radio 8px, sin sombra. Icono Lucide 24px en `accent` centrado arriba, label debajo en H3, todo centrado. Área táctil mínima 96x96px (accesible para el pulgar). Al pulsar: fondo pasa brevemente a `accent-bg` como feedback táctil.

## 7. Prompt para generar el diseño con IA

Prompt listo para copiar y pegar en una herramienta de generación de UI (Claude, v0, Galileo AI, Figma AI, etc.). Resume todas las decisiones de las secciones 1-6 para que la herramienta genere pantallas coherentes con esta guía.

```
Diseña la interfaz móvil (mobile-first, viewport ~375-414px de ancho) de un panel de administración interno llamado "Guionia". Es la herramienta que centraliza la gestión de una agencia de IA con dos productos SaaS propios (Citaswhassap, Prezu) y proyectos a medida, además de todo su contenido de redes sociales.

CONTEXTO Y MÓDULOS
El panel tiene dos módulos principales, accesibles desde una barra de navegación inferior (sin sidebar):
1. Contenido: gestión de piezas para TikTok, Instagram, LinkedIn y YouTube, organizadas por año/mes/día y plataforma. Incluye un "Control" con la guía/calendario mensual de publicación, y dentro de cada plataforma dos tipos de elemento: "Ideas" (temas sin desarrollar) y "Guiones" (piezas ya escritas, con estado: borrador, grabado, editado, publicado).
2. Negocio: la idea de negocio y el público objetivo, y un apartado "Trabajos" que agrupa tanto los productos SaaS como los proyectos a medida para clientes, cada uno con ficha propia (nombre, tipo, estado, descripción, precios, guía de venta), separando trabajos activos de ideas para futuros trabajos.

ESTILO GENERAL
Minimalista y limpio, mobile-first, modo claro únicamente, densidad compacta (prioriza ver muchas filas de datos sin scroll), diseño plano sin sombras (solo bordes finos como separador), esquinas ligeramente redondeadas.

COLOR
- Fondo principal: #FFFFFF
- Fondo secundario (barra inferior, barra superior, cabeceras de tabla): #F7F8FA
- Bordes: #E5E7EB
- Texto principal: #111827 · Texto secundario: #6B7280
- Acento (único color en toda la interfaz, botones/links/pestaña activa): #2563EB, hover #1D4ED8, fondo suave #EFF6FF
- Estados con color semántico: éxito/publicado #16A34A sobre #F0FDF4, aviso/borrador #D97706 sobre #FFFBEB, neutro/idea #6B7280 sobre #F3F4F6, peligro/cancelado #DC2626 sobre #FEF2F2 — mostrados como badges en forma de píldora

TIPOGRAFÍA
Inter (o system sans equivalente). H1 24px semibold, H2 18px semibold, H3/cabeceras de tabla 14px medium, texto de cuerpo 14px regular, texto secundario/metadatos 13px, badges/etiquetas 12px medium.

ESPACIADO Y FORMA
Escala de espaciado en base 4px (4/8/12/16/24/32/48). Radio de esquina 6px en botones, inputs y badges; 8px en tarjetas y contenedores. Iconos de línea fina estilo Lucide, trazo 1.5px.

ESTRUCTURA
Sin sidebar. Barra superior fija (fondo #F7F8FA, borde inferior) que solo muestra el título de la pantalla actual. Barra inferior fija (fondo #F7F8FA, borde superior, sin sombra) con exactamente dos pestañas: "Contenido" y "Negocio", cada una con icono Lucide 20px encima del texto; la pestaña activa en #2563EB, la inactiva en #6B7280.

Al entrar en cada pestaña se muestra un dashboard con dos bloques verticales: (1) arriba, un bloque de "datos generales" — en Contenido el resumen del control mensual (cadencia de la semana, checklist), en Negocio las métricas clave del negocio (MRR, negocios activos, altas del mes); (2) debajo, una rejilla de 2 columnas de botones grandes tipo tarjeta (fondo blanco, borde #E5E7EB, radio 8px, sin sombra, icono Lucide 24px en #2563EB arriba + label centrado debajo, área táctil mínima 96x96px) — en Contenido: TikTok, Instagram, LinkedIn, YouTube; en Negocio: Idea de negocio, Trabajos.

Dentro de una sección (ej. al pulsar TikTok), la vista pasa a un listado en tablas compactas (fila ~36px de alto, hover/tap con fondo #F7F8FA, sin líneas verticales entre columnas).

PANTALLAS A GENERAR
1. Dashboard de Contenido: datos generales del control mensual arriba + rejilla 2x2 con TikTok/Instagram/LinkedIn/YouTube.
2. Dashboard de Negocio: datos generales (métricas clave) arriba + rejilla con Idea de negocio/Trabajos.
3. Listado de una plataforma (ej. TikTok) tras pulsar su botón: Ideas y Guiones, cada fila con título, estado (badge) y fecha.
4. Listado de "Trabajos" en Negocio: nombre, tipo (SaaS/a medida), estado y precio, separando trabajos activos de ideas de futuros trabajos.
5. Detalle de un trabajo: ficha con descripción, planes de precio y guía de venta.

Todas las pantallas en formato móvil, con la barra superior y la barra inferior siempre visibles. Genera las pantallas fieles a esta guía de estilo, sin añadir colores, tipografías ni componentes que no estén especificados aquí.
```

## 8. Pendientes / próximos pasos

- [ ] Elegir set de iconos definitivo dentro de Lucide para la barra inferior y los botones grandes
- [ ] Diseñar el estado vacío (empty state) de las vistas sin contenido aún
- [ ] Definir la versión de escritorio (qué pasa con la barra inferior y la rejilla de botones cuando hay más espacio)
- [ ] Maquetar el dashboard de Contenido (primera pantalla real) para validar la paleta y densidad en la práctica
