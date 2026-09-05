# Ideas — backlog de mejoras de Guionia

Lista viva: cada vez que implementamos algo de aquí, se marca ✅ con una nota breve. No se borran las ideas completadas, para llevar el historial.

## Producto / features nuevas

1. Notificación (push o email) cuando una pieza entra "en riesgo".
✅ 2. Reprogramar fecha de publicación arrastrando la pieza en el calendario — hecho.
✅ 3. Plantillas de guion predefinidas por nicho para clonar — hecho (pendiente de que ejecutes la migración `24_plantillas_nicho.sql` en Supabase).
4. Completar Instagram y LinkedIn (OAuth real).
✅ 5. Adaptar un guion ya escrito de una plataforma a otra — hecho.
✅ 6. Vista "modo grabación" agrupando las piezas "toca grabar" de la semana — hecho.
7. Panel de analíticas unificado cruzando YouTube y TikTok.
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
19. Skeleton loaders en las cargas con `Suspense`.
20. Logo vectorial (SVG) en vez de la foto JPG actual.

## Técnico

21. Evaluar cachear la landing (hoy `force-dynamic` completo).
22. Confirmar rate limiting en login/registro.
23. Tests automatizados, empezando por `lib/contenido.ts`.

## SEO / crecimiento

✅ 24. 2-3 artículos long-tail — hecho (`/blog`, 3 artículos estáticos).
✅ 25. Página de comparación tipo "Guionia vs Notion para creadores" — hecho (`/comparativas/notion`).
✅ 26. Programa de referidos simple — hecho (pendiente de que ejecutes la migración `26_referidos.sql` en Supabase).

## Negocio

27. Dejar decidido (sin activar) un plan de precios futuro.

## Implementado fuera de esta lista

✅ Grabar vídeo desde cámara o pantalla/ventana, en la pantalla del guion.
✅ Abrir el guion en ventana aparte tipo teleprompter (Document Picture-in-Picture, con fallback a ventana emergente).
