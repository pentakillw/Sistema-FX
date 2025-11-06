import React, { useState } from 'react';
import { Lock, Mail, Loader2, AlertTriangle } from 'lucide-react';
// Importamos el cliente de Supabase
import { supabase } from '../supabaseClient.js'; // --- ¡RUTA CORREGIDA! ---

const AuthPage = ({ onNavigate }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // Manejador para Login o Sign Up con Email/Password
    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                // --- LOGIN CON SUPABASE ---
                const { error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                if (error) throw error;
                // El onAuthStateChange en App.jsx se encargará de redirigir
            } else {
                // --- SIGN UP CON SUPABASE ---
                const { error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });
                if (error) throw error;
                setMessage("¡Revisa tu correo para verificar tu cuenta!");
            }
        } catch (error) {
            setError(error.message || "Ha ocurrido un error.");
        } finally {
            setLoading(false);
        }
    };

    // Manejador para Login con Google
    const handleOAuthLogin = async (provider) => {
        setError(null);
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + '/generator' // Redirige al generador
            }
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
        // Supabase se encargará de la redirección
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                    <img src="https://raw.githubusercontent.com/pentakillw/sistema-de-diseno-react/main/Icono_FX.png" alt="Sistema FX Logo" className="h-20 w-20 mx-auto rounded-2xl shadow-md mb-4"/>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isLogin ? 'Bienvenido de Nuevo' : 'Crea tu Cuenta'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {isLogin ? 'Ingresa para guardar y cargar tus paletas.' : 'Guarda y sincroniza tus paletas.'}
                    </p>
                </div>

                {/* Mensajes de Error o Éxito */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                        <AlertTriangle size={16} /> <span>{error}</span>
                    </div>
                )}
                {message && (
                    <div className="mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full font-bold py-2.5 px-4 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                            setMessage(null);
                        }}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                        {isLogin ? '¿No tienes una cuenta? Crea una' : '¿Ya tienes una cuenta? Inicia sesión'}
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            O continúa con
                        </span>
                    </div>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-3 font-semibold py-2.5 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.8 0 256S110.3 0 244 0c73 0 134.3 29.4 179.8 74.4L352 144c-35.3-33.3-80-54.5-128-54.5-98.3 0-179.2 80.5-179.2 179.2s80.8 179.2 179.2 179.2c103.5 0 152.1-74.8 157-115.3H256V256h232v5.8z"></path></svg>
                        Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;