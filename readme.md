# Guionia

Panel para centralizar la gestión de todo el negocio (contenido + negocio) en un único sitio, en vez de tenerlo repartido en archivos sueltos. Este documento es la **especificación de la información** que el panel deberá gestionar — no es el panel en sí (todavía no hay código, solo esta carpeta con el readme). La reorganización real de carpetas y la construcción de la app se abordan en tareas aparte.

## 0. Módulos

| Módulo | Qué gestiona |
|---|---|
| **1. Contenido** | Todo lo relacionado con la creación y publicación de piezas en redes (TikTok, Instagram, LinkedIn, YouTube) |
| **2. Negocio** | La idea de negocio, el público objetivo y los "trabajos" (productos propios + proyectos a medida) |

---

## 1. Contenido

### 1.1 Jerarquía de navegación

Cada pieza de contenido se ubica por: **Año → Mes → Día → Plataforma**.

Hoy en el repo esta jerarquía existe de forma parcial (carpetas por mes, ej. `contenido/videos/08-26/`, con `ideas/` y `guiones/` por plataforma dentro). El panel es el que introduce el nivel de **día** de forma explícita, tomando la fecha de publicación real de cada pieza (hoy esa fecha vive implícita en el calendario de [mensual.md](../contenido/mensual/mensual.md), no en el nombre de la carpeta).

### 1.2 Control (guía mensual)

Es la "guía de contenido" del mes: qué se publica, cuándo y en qué plataforma, de forma repetible mes a mes. Ya existe y no se duplica — el panel la muestra a partir de:

- [contenido/estructura.md](../contenido/estructura.md) — pilares de contenido, formato por plataforma, flujo de creación, métricas.
- [contenido/mensual/mensual.md](../contenido/mensual/mensual.md) — cadencia fija, plantilla semanal, checklist repetible.

Datos que el panel debe poder mostrar/editar desde aquí: cadencia fija (3 TikToks/semana, 1 carrusel/semana, 2 YouTube/mes), plantilla semanal por día, y el checklist de la semana en curso marcado como hecho/pendiente.

### 1.3 Por plataforma

Dentro de cada mes/día, y para cada plataforma (TikTok, Instagram, LinkedIn, YouTube), dos tipos de elemento:

| Tipo | Qué es | Campos | Fuente actual |
|---|---|---|---|
| **Idea** | Tema sin desarrollar aún, banco de ideas vivo por pilar | Título, pilar (educativo / build in public / producto en acción / opinión), estado (pendiente, descartada, usada) | `contenido/videos/{mes}/ideas/{plataforma}.md` |
| **Guion** | Pieza ya escrita, lista para grabar o publicar | Número, título, texto del guion/post, estado (borrador, grabado, editado, publicado), fecha de publicación | `contenido/videos/{mes}/guiones/{plataforma}/{NN}/guion.md` |

Plantilla base (estructura vacía a copiar cada mes): `contenido/videos/00-00-plantilla/ideas/`.

### 1.4 Estado de una pieza

Flujo sugerido para que el panel pueda mostrar de un vistazo en qué punto está cada pieza:

`Idea → Guion escrito → Grabado → Editado → Publicado`

### 1.5 Métricas de contenido

Ver [estructura.md sección 6](../contenido/estructura.md#6-métricas-de-contenido-a-seguir) — seguidores nuevos por plataforma, alcance/impresiones, clics/mensajes a producto, leads que mencionan haber llegado por contenido.

---

## 2. Negocio

### 2.1 Idea de negocio / público objetivo

Visión, modelo de negocio, propuesta de valor, diferenciación frente a competencia y mercado objetivo. Ya documentado en [idea negocio/idea.md](../idea%20negocio/idea.md) — el panel lo muestra como sección de referencia, editable.

### 2.2 Trabajos

Todo lo que MoleroDev vende se gestiona aquí por igual: **productos propios (SaaS)** — Citaswhassap, Prezu — y **proyectos a medida** para clientes. Dos vistas:

- **Trabajos realizados/activos**: catálogo de lo que ya existe o se está vendiendo.
- **Ideas de futuros trabajos**: banco de ideas de nuevos productos o tipos de proyecto a explorar, todavía sin desarrollar.

Ficha de cada trabajo (misma estructura tanto para SaaS como para proyectos a medida):

| Campo | Descripción |
|---|---|
| Nombre | Ej. "Citaswhassap", "Prezu", o el nombre/tipo de un proyecto a medida |
| Tipo | SaaS propio / proyecto a medida |
| Estado | Idea → En desarrollo → Activo → Pausado → Finalizado |
| Descripción / funcionalidades | Qué hace, para quién |
| Precios | Planes y tarifas (SaaS) o modelo de presupuesto (a medida) |
| Guía de venta | Cómo se vende: argumentario, objeciones frecuentes, proceso de venta paso a paso |
| Cliente(s) asociados | Solo aplica a proyectos a medida |

Fuente actual para Citaswhassap y Prezu: [idea.md sección 4](../idea%20negocio/idea.md) (producto) y [precios/precios.md](../precios/precios.md) (precios). La guía de venta de Citaswhassap/Prezu ya existe parcialmente en [idea.md sección 9](../idea%20negocio/idea.md) (estrategia de captación y proceso de venta). Los proyectos a medida todavía no tienen fichas propias — se crean conforme aparezcan.

---

## 3. Mapa: dónde vive cada dato hoy

| Sección del panel | Archivo(s) actual(es) |
|---|---|
| Contenido → Control | `contenido/estructura.md`, `contenido/mensual/mensual.md` |
| Contenido → Ideas por plataforma | `contenido/videos/{mes}/ideas/{plataforma}.md` |
| Contenido → Guiones por plataforma | `contenido/videos/{mes}/guiones/{plataforma}/{NN}/guion.md` |
| Negocio → Idea de negocio | `idea negocio/idea.md` |
| Negocio → Trabajos → Citaswhassap / Prezu | `idea negocio/idea.md` (secciones 4, 6, 9) + `precios/precios.md` |
| Negocio → Trabajos → proyectos a medida | Pendiente de crear |

---

## 4. Pendientes / próximos pasos

- [ ] Reorganizar `contenido/videos/` al esquema año/mes/día explícito (tarea aparte, no incluida en este readme)
- [ ] Crear la primera ficha de trabajo a medida en cuanto haya un proyecto real que documentar
- [ ] Decidir si el panel lee directamente estos `.md` o si los datos migran a una base de datos/CMS
- [ ] Elegir stack técnico del panel (framework, hosting) cuando se empiece a construir
- [ ] Definir permisos/accesos si en el futuro el panel lo usa más de una persona
