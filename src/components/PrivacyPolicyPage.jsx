import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Botón para volver a la página principal */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 mb-6 hover:underline"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>

        {/* --- CONTENIDO DE LA POLÍTICA DE PRIVACIDAD --- */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 text-gray-700 dark:text-gray-300">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Política de Privacidad</h1>
          <p><strong>Última actualización:</strong> 4 de noviembre de 2025</p>
          
          <p>Bienvenido a Sistema FX (en adelante, "nosotros", "nuestro" o el "Sitio"). Su privacidad es importante para nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando visita nuestro sitio web {window.location.hostname}.</p>

          <h2>Información que Recopilamos</h2>
          <p>Podemos recopilar información sobre usted de varias maneras:</p>
          <ul>
            <li>
              <strong>Información de la Cuenta:</strong> Cuando se registra en nuestro sitio (a través de la `AuthPage`), podemos recopilar su dirección de correo electrónico y la información de su perfil para permitirle guardar y sincronizar sus paletas de colores.
            </li>
            <li>
              <strong>Prompts de IA:</strong> Al utilizar nuestra función de generación de paletas por IA, la descripción o "prompt" que usted proporciona se envía a las API de Google (como Gemini) para procesar su solicitud y generar la paleta de colores.
            </li>
            <li>
              <strong>Datos de Anuncios (Google AdSense):</strong> Utilizamos Google AdSense para mostrar anuncios en nuestro sitio. Google y sus socios pueden usar cookies (como la cookie de DoubleClick) para recopilar datos y mostrar anuncios basados en sus visitas anteriores a este y otros sitios web.
            </li>
          </ul>

          <h2>Cómo Usamos su Información</h2>
          <p>Usamos la información recopilada para:</p>
          <ul>
            <li>Proveer y administrar su cuenta y nuestros servicios (guardar paletas).</li>
            <li>Procesar sus solicitudes de generación de paletas de IA.</li>
            <li>Mostrar anuncios relevantes y personalizados a través de Google AdSense.</li>
            <li>Mejorar y optimizar nuestro sitio web y la experiencia del usuario.</li>
          </ul>

          <h2>Publicidad de Terceros (Google AdSense)</h2>
          <p>Permitimos que Google AdSense muestre anuncios en nuestro sitio. Google utiliza cookies para ayudar a servir los anuncios que se muestran en los sitios web de sus socios.</p>
          <p>Usted puede optar por no recibir publicidad personalizada visitando la página de <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Configuración de anuncios de Google</a>. Alternativamente, puede visitar <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info/choices/</a> para optar por no participar en el uso de cookies de un proveedor externo.</p>

          <h2>Seguridad de su Información</h2>
          <p>Tomamos medidas razonables para proteger la información personal que recopilamos. Sin embargo, ningún sistema de seguridad es impenetrable y no podemos garantizar la seguridad absoluta de su información.</p>
          
          <h2>Cambios a esta Política de Privacidad</h2>
          <p>Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos sobre cualquier cambio publicando la nueva Política de Privacidad en esta página.</p>

          <h2>Contacto</h2>
          <p>Si tiene alguna pregunta o inquietud sobre esta Política de Privacidad, contáctenos en:</p>
          <p><a href="mailto:[wezzertop@gmail.com]">[wezzertop@gmail.com]</a></p>
        </div>
        {/* --- FIN DEL CONTENIDO --- */}

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;