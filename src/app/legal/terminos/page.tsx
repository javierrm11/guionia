export const metadata = {
  title: "Términos de Servicio — Guionia",
};

export default function TerminosPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-h1">Términos de Servicio</h1>
      <p className="text-small text-text-secondary">Última actualización: 21 de agosto de 2026</p>

      <div className="flex flex-col gap-4 rounded-md bg-bg-primary p-6 text-body text-text-secondary">
        <p>
          Guionia es una aplicación personal desarrollada y operada por Javier Rumo
          (contacto: javierrumo2@gmail.com) para planificar, escribir y programar
          contenido propio en TikTok, YouTube, Instagram y LinkedIn.
        </p>

        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-text-primary">1. Uso del servicio</h2>
          <p>
            El acceso a Guionia se realiza mediante una cuenta personal (email/contraseña
            o Google). Cada cuenta gestiona su propio contenido: ideas, guiones,
            estructuras y calendario de publicación. No está permitido usar el servicio
            para actividades ilegales o que infrinjan los términos de las plataformas
            conectadas (TikTok, YouTube, Instagram, LinkedIn).
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-text-primary">2. Conexión con plataformas externas</h2>
          <p>
            Guionia permite conectar cuentas de TikTok y YouTube mediante OAuth para
            leer el listado de vídeos publicados y sus estadísticas (vistas, likes,
            comentarios, compartidos), y mostrarlas dentro de la app. Esta conexión es
            opcional y puede revocarse en cualquier momento desde Configuración →
            Plataformas, sin que ello afecte al resto del contenido guardado.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-text-primary">3. Disponibilidad</h2>
          <p>
            Guionia es un proyecto personal en desarrollo activo. Puede haber cambios,
            interrupciones o pérdida de datos sin previo aviso. No se ofrece ningún
            nivel de disponibilidad garantizado.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-text-primary">4. Contacto</h2>
          <p>
            Para cualquier consulta sobre estos términos, escribe a
            javierrumo2@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
}
