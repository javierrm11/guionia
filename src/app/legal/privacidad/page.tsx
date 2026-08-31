export const metadata = {
  title: "Política de Privacidad — Guionia",
};

export default function PrivacidadPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:mx-auto lg:w-full lg:max-w-2xl lg:p-10">
      <h1 className="text-h1">Política de Privacidad</h1>
      <p className="text-small text-text-secondary">Última actualización: 21 de agosto de 2026</p>

      <div className="flex flex-col gap-4 rounded-md border border-border p-6 text-body text-text-secondary">
        <p>
          Esta política explica qué datos gestiona Guionia y cómo se usan. Guionia es
          una aplicación personal desarrollada por Javier Rumo
          (contacto: javierrumo2@gmail.com).
        </p>

        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-text-primary">1. Datos que gestionamos</h2>
          <ul className="list-disc pl-5">
            <li>Datos de cuenta: email y credenciales de acceso (gestionadas por Supabase Auth).</li>
            <li>
              Contenido creado por el usuario: ideas, guiones, estructuras, hooks y
              calendario de publicación.
            </li>
            <li>
              Si el usuario conecta TikTok o YouTube: un token de acceso OAuth, el
              identificador de cuenta/canal, su nombre público y avatar, y las
              estadísticas de los vídeos propios (vistas, likes, comentarios,
              compartidos) que la plataforma expone a través de su API oficial.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-text-primary">2. Uso de los datos</h2>
          <p>
            Los datos de TikTok y YouTube se usan exclusivamente para mostrar dentro de
            Guionia el listado y las estadísticas de los propios vídeos del usuario que
            los conecta. No se venden, ceden ni comparten con terceros, ni se usan con
            fines publicitarios.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-text-primary">3. Almacenamiento y seguridad</h2>
          <p>
            Los datos se almacenan en una base de datos Supabase (PostgreSQL) con
            control de acceso por usuario. Los tokens de acceso a TikTok y YouTube se
            guardan asociados únicamente a la cuenta que los conectó y nunca se exponen
            públicamente.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-text-primary">4. Revocar acceso y eliminar datos</h2>
          <p>
            El usuario puede desconectar TikTok o YouTube en cualquier momento desde
            Configuración → Plataformas, lo que elimina inmediatamente el token
            guardado. Para solicitar la eliminación completa de la cuenta y sus datos,
            escribe a javierrumo2@gmail.com.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-text-primary">5. Contacto</h2>
          <p>Para cualquier duda sobre privacidad, escribe a javierrumo2@gmail.com.</p>
        </div>
      </div>
    </div>
  );
}
