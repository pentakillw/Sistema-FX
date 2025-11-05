import React from 'react';
import { ArrowLeft } from 'lucide-react';

const TermsOfServicePage = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 mb-6 hover:underline"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 text-gray-700 dark:text-gray-300">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Términos y Condiciones de Uso</h1>
          <p><strong>Última actualización:</strong> 4 de noviembre de 2025</p>

          <p>Bienvenido a Sistema FX. Estos Términos y Condiciones ("Términos") rigen su acceso y uso de nuestra aplicación web (el "Servicio"). Al acceder o utilizar el Servicio, usted acepta estar sujeto a estos Términos.</p>

          <h2>1. Aceptación de los Términos</h2>
          <p>Al crear una cuenta o utilizar nuestro Servicio, usted confirma que ha leído, entendido y aceptado estar sujeto a estos Términos. Si no está de acuerdo, no debe utilizar el Servicio.</p>

          <h2>2. Cuentas de Usuario</h2>
          <p>Para acceder a ciertas funciones, como guardar paletas, debe crear una cuenta. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta. Se compromete a notificarnos inmediatamente cualquier uso no autorizado de su cuenta.</p>
          <p>Nos reservamos el derecho de suspender o cancelar su cuenta, a nuestra entera discreción, si infringe estos Términos o si determinamos que su conducta podría dañar nuestra reputación o el Servicio.</p>

          <h2>3. Reglas de Uso Aceptable (Reglas del Usuario)</h2>
          <p>Usted se compromete a no utilizar el Servicio para:</p>
          <ul>
            <li>Realizar cualquier actividad ilegal o no autorizada.</li>
            <li>Intentar hackear, desestabilizar o realizar ingeniería inversa en el Servicio o sus sistemas.</li>
            <li>Utilizar bots, scrapers u otros medios automatizados para acceder al Servicio sin nuestro permiso explícito.</li>
            <li>Transmitir virus, malware o cualquier otro código de naturaleza destructiva.</li>
            <li>Infringir los derechos de propiedad intelectual de cualquier parte.</li>
          </ul>

          <h2>4. Propiedad Intelectual</h2>
          <p>El Servicio y todo su contenido original, incluyendo el nombre "Sistema FX", logotipos, diseño visual, código fuente y características (excluyendo el contenido generado por el usuario) son y seguirán siendo propiedad exclusiva de Sistema FX y sus licenciantes. Nuestro código y marca están protegidos por derechos de autor y otras leyes.</p>
          <p>Cualquier intento de copiar, robar o "quitar" nuestro sistema será perseguido en la máxima medida permitida por la ley.</p>

          <h2>5. Contenido Generado por el Usuario y la IA</h2>
          <p>Usted conserva la propiedad de los "prompts" o descripciones que ingresa en nuestra herramienta de IA. Las paletas de colores generadas son el resultado de un modelo de inteligencia artificial (como Google Gemini).</p>
          <p>No reclamamos la propiedad de las paletas de colores que usted genera. Sin embargo, al utilizar la herramienta, usted entiende que las paletas generadas por IA no son únicas y que otros usuarios pueden generar paletas idénticas o similares. No ofrecemos ninguna garantía sobre la originalidad o la no infracción (plagio) del contenido generado por la IA.</p>

          <h2>6. Deslinde de Responsabilidad de Terceros</h2>
          <p>Nuestro Servicio utiliza API de terceros (como Google Gemini) y muestra anuncios de terceros (Google AdSense). No somos responsables del contenido, las políticas o las prácticas de estos servicios de terceros. Su interacción con ellos se rige por sus propios términos y políticas. Nos deslindamos de cualquier responsabilidad derivada de su uso de estos servicios.</p>

          <h2>7. Renuncia de Garantías (Deslinde de Responsabilidad)</h2>
          <p>El Servicio se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD", sin garantías de ningún tipo, ya sean expresas o implícitas. No garantizamos que el Servicio:</p>
          <ul>
            <li>Funcione de manera ininterrumpida, segura o esté disponible en cualquier momento o lugar.</li>
            <li>Esté libre de errores o que los defectos sean corregidos.</li>
            <li>Esté libre de virus u otros componentes dañinos.</li>
            <li>Cumpla con sus requisitos específicos.</li>
          </ul>

          <h2>8. Limitación de Responsabilidad</h2>
          <p>En la máxima medida permitida por la ley, Sistema FX y sus propietarios no serán responsables de ningún daño indirecto, incidental, especial, consecuente o punitivo, incluyendo, entre otros, la pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de:</p>
          <ul>
            <li>Su acceso o uso o incapacidad para acceder o usar el Servicio.</li>
            <li>Cualquier conducta o contenido de un tercero en el Servicio (incluidos anuncios).</li>
            <li>Cualquier contenido obtenido del Servicio (incluidas las paletas de IA).</li>
          </ul>

          <h2>9. Cambios a los Términos</h2>
          <p>Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos avisar con al menos 30 días de antelación. Lo que constituye un cambio material se determinará a nuestra entera discreción.</p>

          <h2>10. Contacto</h2>
          <p>Si tiene alguna pregunta sobre estos Términos, contáctenos en:</p>
          <p><a href="mailto:[TU-EMAIL-AQUI@dominio.com]">[TU-EMAIL-AQUI@dominio.com]</a></p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;