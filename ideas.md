# Ideas — backlog de mejoras de Guionia

Lista viva: cada vez que implementamos algo de aquí, se marca ✅ con una nota breve. No se borran las ideas completadas, para llevar el historial.

## Producto / features nuevas

1. Notificación (push o email) cuando una pieza entra "en riesgo".
✅ 2. Reprogramar fecha de publicación arrastrando la pieza en el calendario — hecho.
✅ 3. Plantillas de guion predefinidas por nicho para clonar — hecho (pendiente de que ejecutes la migración `24_plantillas_nicho.sql` en Supabase).
4. Completar Instagram y LinkedIn (OAuth real).
✅ 5. Adaptar un guion ya escrito de una plataforma a otra — hecho.
✅ 6. Vista "modo grabación" agrupando las piezas "toca grabar" de la semana — hecho.
✅ 7. Panel de analíticas unificado cruzando YouTube y TikTok — hecho (pestaña "Todas" en `/contenido/cuenta`, `CuentaUnificadaSection.tsx`; suma vistas/vídeos/comentarios/likes de ambas plataformas y cruza "mejores vídeos" de las dos en un mismo carrusel).
8. Sugerencias de IA para título.
9. Colaboración — invitar a un editor/guionista a una pieza.
✅ 10. Aviso proactivo de racha en riesgo de romperse — hecho (modal).

## UX / flujo

✅ 11. Tour guiado la primera vez que se entra a Control — hecho.
✅ 12. Deshacer con toast (p. ej. tras "Descartar idea") — hecho.
✅ 13. Atajo de teclado (Cmd/Ctrl+K) para el buscador en escritorio — hecho.
✅ 14. Panel "Hoy" persistente en escritorio (sidebar fijo) — hecho.
✅ 15. Historial/línea de tiempo de una pieza (idea → guion → grabado → publicado) — hecho (migración `25_historial_piezas.sql`, pendiente de que la ejecutes en Supabase).

## Diseño

16. Terminar el arreglo que quedó a medias en `GuionForm.tsx` (aviso de lint sobre refs durante el render) — sigue pendiente.
17. Revisar la landing pública en modo oscuro.
18. Ilustraciones de marca en estados vacíos clave (Ideas, Papelera, Tendencias).
✅ 19. Skeleton loaders en las cargas con `Suspense` — hecho parcialmente: el carrusel de Tendencias del dashboard tiene esqueleto propio (`TendenciasCarruselSkeleton.tsx`, tarjetas grises `animate-pulse` en vez de hueco vacío). El resto de `Suspense` de la app (Cuenta, Tendencias completo, etc.) sigue con `CuentaLoader`/`TendenciasLoader` genéricos (spinner) en vez de un esqueleto a medida — pendiente extenderlo si se quiere completar del todo.
20. Logo vectorial (SVG) en vez de la foto JPG actual.

## Técnico

21. Evaluar cachear la landing (hoy `force-dynamic` completo).
22. Confirmar rate limiting en login/registro.
✅ 23. Tests automatizados, empezando por `lib/contenido.ts` — hecho (Vitest configurado desde cero — `vitest.config.ts`, `package.json` con `npm test`/`npm run test:watch` —, mock reutilizable de `SupabaseClient` en `lib/__tests__/supabaseMock.ts`, y 24 tests en `lib/contenido.test.ts` cubriendo `calcularLimitesRango`, `getRachaSemanas`, `getEtiquetasPopulares`, `getTareasHoy`, `activarPlataformaConectada`/`desactivarPlataforma`, etc. Queda extender el mismo patrón a otros archivos de `lib/` — YouTube/TikTok, por ejemplo — que hoy no tienen ningún test).

## SEO / crecimiento

✅ 24. 2-3 artículos long-tail — hecho (`/blog`, 3 artículos estáticos).
✅ 25. Página de comparación tipo "Guionia vs Notion para creadores" — hecho (`/comparativas/notion`).
✅ 26. Programa de referidos simple — hecho (pendiente de que ejecutes la migración `26_referidos.sql` en Supabase).

## Negocio

27. Dejar decidido (sin activar) un plan de precios futuro.

## Accesibilidad (auditoría 2026-09)

Findings concretos de una auditoría de accesibilidad sobre el código actual — cada uno con archivo y por qué importa, no checklist genérico.

28. **Buscador (`⌘K`) sin nombre accesible ni foco visible** — `TopBar.tsx` (dos sitios) y `contenido/ideas/page.tsx`: el `<input placeholder="Buscar...">` no tiene `<label>`/`aria-label`, y además lleva `focus:outline-none` sin ningún anillo de foco propio que lo sustituya. Es el control más usado de toda la app (con atajo de teclado dedicado) y hoy es invisible para lectores de pantalla y para quien navega solo con teclado. **Prioridad alta.**
29. **Reprogramar fecha en el calendario mensual solo funciona con arrastrar y soltar** — `CalendarioMensualGrid.tsx`: el "asa" de cada pieza es un `<span onPointerDown>` sin `tabIndex`, `role` ni `onKeyDown` — no hay ninguna forma de cambiar la fecha desde el calendario sin usar puntero/dedo. Un usuario de teclado o de tecnología de asistencia no puede reprogramar nada desde aquí (sí puede editando la pieza desde otra pantalla, pero no es descubrible). **Prioridad alta.**
30. **Estado de la pieza en el calendario mensual solo se distingue por color** — el punto de color (`ESTADO_PIEZA_TONE`) junto al título no va acompañado de texto ni de un `title`/`aria-label` propio (el único `title` de la fila es el título de la pieza). Contrasta con `/contenido/ideas` y `/contenido/plataformas`, que sí acompañan cada color con texto. Sin color, no hay forma de saber el estado desde esta vista.
31. **Enlace de solo icono sin `aria-label`** en `/contenido/publicados` (el icono `ExternalLink` de cada fila) — inconsistente con el resto de iconos sueltos de la app (`CarruselFlechas`, `BotonVolverArriba`, `TopBar`), que sí llevan `aria-label`.
32. **`/contenido` (Control) no tiene ningún encabezado real una vez hay cadencia definida** — "Bienvenido a Guionia" y el título de la tarea "hero" son `<p>`, no `<h1>`/`<h2>`, y esta ruta tampoco está en el mapa `TITULOS` de `TopBar.tsx`. Quien navega por encabezados (uno de los patrones más comunes con lector de pantalla) no encuentra ninguna estructura en la pantalla principal de la app.
33. Revisar en general el patrón "punto de color solo" (dots de estado, indicadores de racha, etc.) en el resto de la app conforme se vayan tocando esas pantallas — los puntos 30 y 33 probablemente no son los únicos casos.

## Rendimiento (auditoría 2026-09)

34. **`CuentaUnificadaSection` (pestaña "Todas" de Cuenta) serializa YouTube y TikTok en vez de pedirlos en paralelo** — `CuentaUnificadaSection.tsx`: el bloque de TikTok no empieza hasta que termina *todo* el de YouTube (varias llamadas cada uno), aunque los tokens de ambas plataformas ya se piden juntos con `Promise.all` más arriba. Con `Promise.allSettled` en vez de dos bloques secuenciales, la pestaña "Todas" tardaría lo que tarde la más lenta de las dos, no la suma de las dos. **Es la pantalla con más latencia de API externa de toda la app — prioridad alta.**
35. **`getProgresoCadenciaSemanal` hace una consulta por plataforma en vez de una sola agrupada** — `lib/contenido.ts`: por cada fila de cadencia lanza su propio `count` a Supabase, cuando `getRachaSemanas` (justo debajo, en el mismo archivo) ya resuelve el mismo tipo de problema con una sola consulta agrupada en memoria. Se ejecuta en cada visita a `/contenido`, así que con 3 plataformas configuradas son 3 idas y vueltas en vez de 1.
36. **Detalle de guion con 4 lecturas secuenciales que no dependen entre sí** — `.../[dia]/[id]/page.tsx`: guion → historial → plataformas activas → escenas, una detrás de otra, cuando solo el guion necesita resolverse primero (para el 404). Las otras tres podrían ir en un único `Promise.all`. Es la pantalla más visitada de la app de contenido real, y al ser `force-dynamic` este coste se paga en cada visita, sin caché.
37. **`select("*")` trae el guion completo en vistas de solo listado** — `/contenido/publicados`, `/contenido/ideas` y `/contenido/buscar` piden todas las columnas (incluye el texto completo del guion y metadatos de publicación) para pintar listas que solo usan id/plataforma/fecha/título — payload innecesariamente grande cuanto más largos sean los guiones.
38. **Fotos de la landing con `fill` sin `sizes`** — `src/app/page.tsx` (fondo del hero con `priority`, foto de la sección desktop, avatar de "Por qué Guionia"): a diferencia del resto de usos de `fill` en la app (que sí llevan `sizes`), estas tres caen al `100vw` por defecto de Next — la imagen de fondo del hero, que además es `priority`, es la que más pesa en el LCP de la única pantalla que ven visitantes anónimos con conexión lenta.

## Ideas nuevas para potenciar el proyecto

39. **Exportar un guion a PDF/Word** — para compartirlo con un editor o cámara que no tiene ni necesita cuenta en Guionia, sin depender de copiar y pegar texto plano.
40. **Recordatorio por email el día que toca publicar según la plantilla semanal** — para quien no entra a diario a la app; complementa (no sustituye) el aviso de racha en riesgo ya existente, que solo se ve si entras.
✅ 41. **Rendimiento real de hooks y CTAs guardados** — hecho (migración `28_frase_origen_escena.sql`, pendiente de que la ejecutes en Supabase): `GuionForm.tsx` guarda ahora qué frase se insertó en cada escena (`escenas_guion.frase_origen_id`, se mantiene aunque el texto se edite después a mano); `/configuracion/hooks` y `/configuracion/ctas` muestran vistas y retención media (solo YouTube por ahora) de los vídeos publicados donde se usó cada frase. El vínculo se copia también al usar "Adaptar a otra plataforma". No cubre frases insertadas al editar un guion ya creado (esa pantalla no tiene selector de frases guardadas) ni TikTok (su API no expone retención por vídeo).
42. **Importar ideas en bloque** (pegar una lista o subir un CSV) — refuerza directamente el ángulo de "Guionia vs Notion/hoja de cálculo": migrarse hoy exige crear cada idea a mano, una por una.
43. **Compartir el calendario mensual en modo solo lectura** (enlace público sin login) — para coordinarse con un editor, socio o cliente sin darle acceso a la cuenta completa ni a los guiones.
✅ 44. **Sugerir la mejor estructura de guion al crear un vídeo nuevo** — hecho (migración `29_estructura_origen_pieza.sql`, pendiente de que la ejecutes en Supabase): `GuionForm.tsx` ahora preselecciona (sigue siendo editable) la estructura que más se ha usado hasta ahora en esa plataforma, cruzando el nuevo `piezas_contenido.estructura_origen_id`. No sugiere nada hasta que exista al menos un guion creado con estructura en esa plataforma.
✅ 45. **Sugerir mejor día/hora de publicación** — hecho, y con hora real (no solo día): `lib/youtube/oauth.ts` gana `obtenerFechasPublicacionVideos`, que lee `snippet.publishedAt` (fecha y hora real, en UTC) de YouTube para cualquier vídeo ya publicado — a diferencia de `piezas_contenido.fecha_publicacion`, que en toda la app solo guarda el día. `lib/youtube/mejorMomentoPublicacion.ts` cruza esa hora real (convertida a hora de Madrid) con las vistas de cada vídeo y encuentra el día/hora con mejor media; se muestra como aviso informativo bajo el campo de fecha en `GuionForm.tsx` (solo al crear un vídeo de YouTube, con al menos 2 vídeos publicados). Solo YouTube — TikTok no expone la hora real de publicación con los scopes actuales.

## Implementado fuera de esta lista

✅ Grabar vídeo desde cámara o pantalla/ventana, en la pantalla del guion.
✅ Abrir el guion en ventana aparte tipo teleprompter (Document Picture-in-Picture, con fallback a ventana emergente).
