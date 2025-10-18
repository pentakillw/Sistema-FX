import React from 'react';
import { LogIn } from 'lucide-react';

const LoginBanner = ({ onLoginClick }) => {
    return (
        <div className="sticky top-0 z-30 bg-purple-600 text-white shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center text-center">
                <p className="text-sm font-semibold">
                    <span className="hidden sm:inline">¡Bienvenido!</span> Inicia sesión o crea una cuenta para guardar y sincronizar tus paletas.
                </p>
                <button
                    onClick={onLoginClick}
                    className="ml-4 flex-shrink-0 text-xs font-bold bg-white text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                >
                    <LogIn size={12} />
                    <span>Iniciar Sesión / Registrarse</span>
                </button>
            </div>
        </div>
    );
};

export default LoginBanner;
