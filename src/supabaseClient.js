import { createClient } from '@supabase/supabase-js'

// ¡IMPORTANTE!
// Debes crear un archivo .env en la raíz de tu proyecto y añadir estas dos líneas
// con tus propias claves de Supabase.
// VITE_SUPABASE_URL=https://tu-url-de-proyecto.supabase.co
// VITE_SUPABASE_ANON_KEY=tu-llave-anon-publica

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Las variables de entorno de Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY) no están configuradas.");
  alert("Error de configuración: La conexión con la base de datos no está configurada. Revisa el archivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)