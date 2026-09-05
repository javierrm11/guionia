export type BloqueArticulo =
  | { tipo: "p"; texto: string }
  | { tipo: "h2"; texto: string }
  | { tipo: "ul"; items: string[] };

export type Articulo = {
  slug: string;
  titulo: string;
  /** Para el `<meta description>` y la tarjeta del índice — 1-2 frases. */
  descripcion: string;
  fechaPublicacion: string;
  cuerpo: BloqueArticulo[];
};

export const ARTICULOS: Articulo[] = [
  {
    slug: "calendario-contenido-tiktok-youtube",
    titulo: "Cómo planificar tu contenido de TikTok y YouTube en un solo calendario",
    descripcion:
      "Si subes a varias plataformas a la vez, llevarlas por separado (notas sueltas, un Notion por un lado, la app de TikTok por otro) es la razón número uno de que se te olvide publicar. Así se monta un calendario único.",
    fechaPublicacion: "2026-08-18",
    cuerpo: [
      {
        tipo: "p",
        texto:
          "Si subes contenido a más de una plataforma, seguramente te ha pasado: tienes clarísimo qué vas a grabar para TikTok esta semana, pero el vídeo de YouTube que \"tenías que hacer el jueves\" se queda en un audio de voz que te mandaste a ti mismo. No es un problema de disciplina — es que cada plataforma vive en un sitio distinto de tu cabeza (o de tus apps), y nadie lleva bien dos calendarios paralelos durante mucho tiempo.",
      },
      {
        tipo: "h2",
        texto: "Por qué separarlo por plataforma no funciona a la larga",
      },
      {
        tipo: "p",
        texto:
          "Lo habitual es empezar con una nota para TikTok y otra para YouTube, o un Notion por cada uno. Funciona las primeras semanas, mientras subes poco. En cuanto tienes 2-3 piezas en marcha por plataforma — una idea, un guion a medio escribir, otra ya grabada esperando edición — mantener el mismo estado actualizado en dos sitios distintos empieza a fallar. Acabas escribiendo lo mismo dos veces o, más probable, dejas de actualizar uno de los dos y ese es el que se te olvida.",
      },
      {
        tipo: "p",
        texto:
          "La alternativa no es \"currar menos por plataforma\", es dejar de separar por plataforma y separar por fecha y estado en su lugar, con la plataforma como una etiqueta más de cada pieza, no como el criterio que organiza todo.",
      },
      {
        tipo: "h2",
        texto: "Qué necesita tener ese calendario para ser útil de verdad",
      },
      {
        tipo: "ul",
        items: [
          "Una fecha de publicación por pieza, no solo una lista sin orden temporal.",
          "El estado real de cada una: idea, guion escrito, grabado, editado o publicado — no solo \"pendiente\".",
          "A qué plataforma pertenece cada pieza, visible de un vistazo (un color o icono, no una columna que hay que abrir).",
          "Una cadencia objetivo por plataforma (\"3 TikToks y 1 YouTube a la semana\"), para poder ver de un vistazo si vas retrasado antes de que sea tarde.",
        ],
      },
      {
        tipo: "h2",
        texto: "Cómo montarlo paso a paso",
      },
      {
        tipo: "p",
        texto:
          "1. Define primero la cadencia por plataforma — cuántas piezas quieres publicar a la semana en cada una. Sin esto, cualquier calendario es solo una lista de tareas sin manera de saber si vas bien o mal.",
      },
      {
        tipo: "p",
        texto:
          "2. Fija una plantilla semanal: qué día tocaría publicar en cada plataforma. No hace falta que la cumplas al milímetro, pero tener un \"martes y viernes, TikTok; domingo, YouTube\" por defecto evita que la semana se te vaya sin publicar nada porque \"ya lo haré cuando tenga tiempo\".",
      },
      {
        tipo: "p",
        texto:
          "3. Cada vez que se te ocurra una idea, apúntala en el mismo sitio donde luego la vas a convertir en guion — si la ideas vive en un sitio y el guion en otro, se pierde en la mudanza.",
      },
      {
        tipo: "p",
        texto:
          "4. Revisa el calendario en semana, no solo al final: si el miércoles ves que tienes dos guiones sin grabar y toca publicar el viernes, todavía estás a tiempo de reorganizar. Si te enteras el viernes, ya no.",
      },
      {
        tipo: "h2",
        texto: "Errores más comunes al montarlo",
      },
      {
        tipo: "ul",
        items: [
          "Mezclar ideas sueltas con piezas ya en producción en la misma lista, sin distinguir qué tiene fecha y qué no.",
          "Poner la misma cadencia a todas las plataformas en vez de una realista por cada una (YouTube pesa más por vídeo que TikTok; no tiene sentido exigirte lo mismo).",
          "No revisar el progreso hasta el domingo, cuando ya no hay margen para grabar nada más esa semana.",
        ],
      },
      {
        tipo: "p",
        texto:
          "Al final, un calendario de contenido multiplataforma no necesita ser complicado — necesita que la fecha, el estado y la plataforma de cada pieza estén siempre en el mismo sitio, sin que tengas que ir a buscarlos por separado.",
      },
    ],
  },
  {
    slug: "plantilla-guion-tiktok",
    titulo: "Plantilla de guion para vídeos cortos de TikTok: la estructura hook-desarrollo-CTA",
    descripcion:
      "Un guion de 30 segundos no necesita ser complicado, necesita tener siempre las mismas tres partes. Así se estructura, con ejemplos y tiempos por segundo.",
    fechaPublicacion: "2026-08-25",
    cuerpo: [
      {
        tipo: "p",
        texto:
          "Uno de los frenos más habituales para grabar contenido corto es sentarte a escribir el guion sin saber por dónde empezar. La solución no es \"ser más creativo\", es tener siempre la misma estructura de base y rellenarla cada vez — así el trabajo creativo se reduce a una sola cosa (el contenido) en vez de dos (el contenido y la estructura).",
      },
      {
        tipo: "h2",
        texto: "Las tres partes de un guion corto",
      },
      {
        tipo: "p",
        texto:
          "Hook (los primeros 2-5 segundos): la frase o imagen que decide si alguien se queda o sigue haciendo scroll. Tiene que plantear una pregunta, un problema o una promesa concreta — \"nadie te dice esto sobre X\" funciona mejor que una introducción genérica del tema.",
      },
      {
        tipo: "p",
        texto:
          "Desarrollo (el grueso del vídeo): la solución, el dato o la historia que prometiste en el hook. Aquí es donde se nota si el vídeo aporta algo o solo alarga el hook sin cumplirlo — si alguien llega al final y piensa \"vale, ¿y qué más\", el desarrollo se quedó corto.",
      },
      {
        tipo: "p",
        texto:
          "CTA (los últimos segundos): la invitación a seguir, comentar o guardar. No hace falta que sea agresiva — a veces basta con \"guárdalo para cuando lo necesites\" o una pregunta directa que invite a comentar.",
      },
      {
        tipo: "h2",
        texto: "Plantilla con tiempos, según la duración",
      },
      {
        tipo: "ul",
        items: [
          "15 segundos: 3s de hook, 9s de desarrollo, 3s de CTA. Solo cabe una idea, sin rodeos.",
          "30 segundos: 3s de hook, 22s de desarrollo, 5s de CTA. El formato más flexible — cabe un ejemplo o un paso a paso corto.",
          "60 segundos: 5s de hook (puede permitirse un poco más de contexto), 45s de desarrollo con 2-3 pasos o ejemplos, 10s de CTA.",
        ],
      },
      {
        tipo: "p",
        texto:
          "Estos tiempos son un punto de partida, no una regla exacta — pero tener un reparto de referencia por adelantado evita el error más común: pasarte 40 de los 30 segundos en el hook y dejar el desarrollo a medias.",
      },
      {
        tipo: "h2",
        texto: "Reutiliza lo que ya te ha funcionado",
      },
      {
        tipo: "p",
        texto:
          "Si un hook o un CTA te funcionó bien en un vídeo, no hay ninguna razón para reescribirlo desde cero la próxima vez. Guardar los hooks y CTAs que mejor retención o interacción te dieron, con una nota de por qué funcionaron, te ahorra la parte más lenta de escribir un guion nuevo — y con el tiempo notas patrones de qué tipo de hook funciona mejor para tu audiencia.",
      },
      {
        tipo: "h2",
        texto: "Errores comunes al escribir guiones cortos",
      },
      {
        tipo: "ul",
        items: [
          "Escribir el hook al final, como si fuera lo menos importante — es justo al revés, decide si se ve el resto.",
          "Meter dos ideas en un vídeo de 30 segundos: no da tiempo a desarrollar ninguna bien.",
          "Olvidar el CTA porque \"ya se sobreentiende\" — casi nunca se sobreentiende, hay que decirlo.",
        ],
      },
      {
        tipo: "p",
        texto:
          "Con la estructura fija y un banco de hooks y CTAs que ya sabes que funcionan, escribir un guion corto deja de ser la parte que más se posterga y pasa a ser cuestión de minutos.",
      },
    ],
  },
  {
    slug: "constancia-publicar-redes-sociales",
    titulo: "Cómo mantener la constancia publicando en redes sociales cada semana (sin quemarte)",
    descripcion:
      "El algoritmo premia la constancia más que la perfección de cada vídeo. El problema casi nunca es de disciplina — es que no tienes un proceso que sobreviva a una mala semana.",
    fechaPublicacion: "2026-09-01",
    cuerpo: [
      {
        tipo: "p",
        texto:
          "Casi todos los creadores que dejan de publicar no lo hacen porque se les acaben las ideas — lo hacen porque una semana mala (viaje, trabajo, un vídeo que no salió bien) rompe la racha, y una vez rota cuesta mucho más retomarla que si nunca se hubiera roto. Si te ha pasado, el problema no es que te falte disciplina: es que el proceso que tenías dependía de que todo saliera bien todas las semanas.",
      },
      {
        tipo: "h2",
        texto: "Por qué cuesta tanto ser constante",
      },
      {
        tipo: "p",
        texto:
          "La causa más habitual no es la falta de tiempo, es no tener un proceso por pasos. Si cada vídeo pasa por \"tener la idea → escribir el guion → grabarlo → editarlo → subirlo\" todo en la misma sesión, cualquier interrupción tira todo el vídeo hacia atrás. En cambio, si esos pasos están separados y cada pieza puede quedarse \"a medias\" en cualquiera de ellos sin perderse, una mala semana solo retrasa una pieza, no rompe el proceso entero.",
      },
      {
        tipo: "h2",
        texto: "Define una cadencia que puedas sostener, no la que te gustaría tener",
      },
      {
        tipo: "p",
        texto:
          "Publicar 5 veces por semana suena mejor que 2, pero solo si de verdad lo puedes mantener 8 semanas seguidas. Una cadencia que rompes cada dos semanas es peor que una más baja que cumples siempre — el algoritmo y tu audiencia notan más la regularidad que el volumen. Empieza por lo que sabes que puedes cumplir incluso en una semana mala, y solo sube el objetivo cuando lleves varias semanas cumpliéndolo con margen.",
      },
      {
        tipo: "h2",
        texto: "Graba varios guiones en la misma sesión (modo grabación)",
      },
      {
        tipo: "p",
        texto:
          "Uno de los cambios que más diferencia hace: en vez de grabar un vídeo cada vez que te toca publicar, junta todos los guiones que ya tienes escritos y grábalos todos seguidos, en una sola sesión a la semana. El montaje de cámara, luz e iluminación es el mismo cueste 1 vídeo o 4 — así que grabar por lotes reduce el tiempo total y, más importante, hace que una semana ocupada no te deje sin nada grabado: ya tienes 3-4 piezas en cola esperando edición.",
      },
      {
        tipo: "h2",
        texto: "Qué hacer cuando rompes la racha",
      },
      {
        tipo: "ul",
        items: [
          "No intentes recuperar de golpe lo que no publicaste — publicar 3 vídeos el mismo día no compensa una semana en blanco y sí puede saturar a tu audiencia.",
          "Vuelve a la cadencia mínima que sabes que puedes cumplir, no a la que tenías antes de la interrupción.",
          "Revisa si la racha se rompió por falta de guion o por falta de tiempo para grabar — son problemas distintos y la solución no es la misma (banco de ideas vs. sesión de grabación por lotes).",
        ],
      },
      {
        tipo: "p",
        texto:
          "La constancia no depende de tener una semana perfecta detrás de otra — depende de tener un proceso que aguante las semanas malas sin romperse del todo. Con eso resuelto, publicar todas las semanas deja de ser una cuestión de fuerza de voluntad.",
      },
    ],
  },
];

export function getArticulo(slug: string) {
  return ARTICULOS.find((a) => a.slug === slug);
}
