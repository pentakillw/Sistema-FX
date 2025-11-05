import React, { useState, useEffect } from 'react';
import { Palette, Feather, Zap, LogIn, UserPlus, ArrowRight, Mouse, Code, CheckCircle, Image as ImageIcon, TestTube2, ShieldCheck } from 'lucide-react';

// Componente para las formas abstractas del fondo con efecto parallax
const ParallaxShape = ({ className, speed = 0.1 }) => {
    const [offsetY, setOffsetY] = useState(0);
    const handleScroll = () => setOffsetY(window.pageYOffset);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div 
            className={`absolute -z-10 rounded-full bg-gradient-to-br opacity-20 dark:opacity-30 filter blur-3xl ${className}`} 
            style={{ transform: `translateY(${offsetY * speed}px)` }}
        />
    );
};

// Componente de tarjeta de característica mejorado
const FeatureCard = ({ icon, title, children }) => (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
        <div className="flex items-center gap-4 mb-3">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-xl text-purple-600 dark:text-purple-400">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{children}</p>
    </div>
);


const LandingPage = ({ onNavigate }) => {
    return (
        <div className="w-full flex flex-col relative bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans overflow-hidden">
            {/* Fondos con Parallax más coloridos y prominentes */}
            <ParallaxShape className="from-purple-500 to-pink-500 w-96 h-96 top-20 left-[-15rem]" speed={0.2} />
            <ParallaxShape className="from-blue-400 to-teal-400 w-80 h-80 top-[30rem] right-[-12rem]" speed={0.15} />
            <ParallaxShape className="from-yellow-300 to-orange-500 w-[30rem] h-[30rem] top-[80rem] left-[-20rem]" speed={0.1} />
            <ParallaxShape className="from-green-400 to-cyan-400 w-96 h-96 top-[130rem] right-[-15rem]" speed={0.25} />
            <ParallaxShape className="from-red-400 to-rose-500 w-80 h-80 top-[180rem] left-[-10rem]" speed={0.18} />


            {/* Header */}
            <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg z-20 border-b border-gray-200 dark:border-gray-800">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                         <img src="https://raw.githubusercontent.com/pentakillw/sistema-de-diseno-react/main/Icono_FX.png" alt="Sistema FX Logo" className="h-10 w-10 rounded-lg"/>
                         <span className="font-bold text-xl text-gray-900 dark:text-white">Sistema FX</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigate('auth')} className="text-sm font-semibold text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <LogIn size={16} />
                            <span>Iniciar Sesión</span>
                        </button>
                        <button onClick={() => onNavigate('auth')} className="text-sm font-semibold text-white bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm">
                            <UserPlus size={16} />
                            <span>Registrarse</span>
                        </button>
                    </div>
                </nav>
            </header>
            
            <div className="flex-grow">
                {/* Hero Section */}
                <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                        Crea Sistemas de Diseño <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">Impresionantes</span> en Segundos
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                        Desde una idea a una paleta de colores completa y lista para exportar. Genera, ajusta y previsualiza tus temas para Power Apps, CSS y Tailwind con herramientas inteligentes.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={() => onNavigate('generator')}
                            className="text-lg font-semibold text-white bg-purple-600 px-8 py-4 rounded-xl hover:bg-purple-700 transition-transform transform hover:scale-105 flex items-center gap-3 shadow-lg"
                        >
                            <span>Comienza a generar paletas</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </main>

                {/* NUEVA SECCIÓN: Muestra de la Galería de Paletas */}
                <section className="relative z-10 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white">Infinitas Posibilidades de Color</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">De tonos pastel suaves a neones vibrantes, encuentra la inspiración que necesitas.</p>
                    </div>
                    {/* Animación de scroll infinito con paletas de ejemplo */}
                    <div className="relative h-48 [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] group">
                        <div className="absolute top-0 flex items-center animate-scroll group-hover:pause">
                             {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex-shrink-0 flex items-center justify-around w-max mx-4">
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#fecaca]"></div><div className="w-full h-full bg-[#fca5a5]"></div><div className="w-full h-full bg-[#ef4444]"></div><div className="w-full h-full bg-[#b91c1c]"></div></div>
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#dbeafe]"></div><div className="w-full h-full bg-[#93c5fd]"></div><div className="w-full h-full bg-[#3b82f6]"></div><div className="w-full h-full bg-[#1e40af]"></div></div>
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#d1fae5]"></div><div className="w-full h-full bg-[#6ee7b7]"></div><div className="w-full h-full bg-[#10b981]"></div><div className="w-full h-full bg-[#047857]"></div></div>
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#f5d0fe]"></div><div className="w-full h-full bg-[#e879f9]"></div><div className="w-full h-full bg-[#c026d3]"></div><div className="w-full h-full bg-[#86198f]"></div></div>
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#fef3c7]"></div><div className="w-full h-full bg-[#fcd34d]"></div><div className="w-full h-full bg-[#f59e0b]"></div><div className="w-full h-full bg-[#b45309]"></div></div>
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#ccfbf1]"></div><div className="w-full h-full bg-[#5eead4]"></div><div className="w-full h-full bg-[#0d9488]"></div><div className="w-full h-full bg-[#0f766e]"></div></div>
                                </div>
                             ))}
                        </div>
                    </div>
                </section>


                {/* Features Section Ampliada */}
                <section id="features" className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                     <div className="text-center mb-16">
                         <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white">Un Conjunto de Herramientas de Diseño Completo</h2>
                         <p className="mt-4 max-w-3xl mx-auto text-gray-600 dark:text-gray-400">Sistema FX está diseñado para acelerar tu flujo de trabajo, desde la concepción de la idea hasta la implementación final.</p>
                    </div>
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={<Zap size={24} />} title="Generación con IA">
                            Describe un concepto como "atardecer en el bosque" y deja que la IA cree una paleta de colores única para ti.
                        </FeatureCard>
                        <FeatureCard icon={<ImageIcon size={24} />} title="Extractor de Imágenes">
                            Sube cualquier imagen y extrae automáticamente su paleta de colores para usarla como punto de partida.
                        </FeatureCard>
                        <FeatureCard icon={<Palette size={24} />} title="Armonías de Color">
                            Genera paletas basadas en reglas de la teoría del color como análogas, complementarias, triádicas y más.
                        </FeatureCard>
                        <FeatureCard icon={<TestTube2 size={24} />} title="Previsualización en Vivo">
                           Mira cómo se ven tus colores aplicados a componentes de UI reales antes de exportar, en modo claro y oscuro.
                        </FeatureCard>
                         <FeatureCard icon={<ShieldCheck size={24} />} title="Análisis de Accesibilidad">
                            Comprueba al instante los ratios de contraste de tu paleta para asegurar que tu diseño sea legible para todos.
                        </FeatureCard>
                         <FeatureCard icon={<Feather size={24} />} title="Exportación Flexible">
                            Obtén tu código listo para copiar y pegar en Power Fx, CSS con variables, o como una extensión de Tailwind.
                        </FeatureCard>
                    </div>
                </section>
                
                {/* How it Works Section */}
                <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">De la Idea al Código en 3 Simples Pasos</h2>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Nuestro flujo de trabajo intuitivo te permite concentrarte en la creatividad mientras nosotros nos encargamos de la parte técnica.</p>
                            <ul className="mt-8 space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl text-blue-600 dark:text-blue-400"><span className="font-bold text-xl">1</span></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Genera tu Paleta Base</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Usa nuestras herramientas inteligentes (IA, imagen, aleatorio) para obtener una paleta inicial armónica.</p>
                                    </div>
                                </li>
                                 <li className="flex items-start gap-4">
                                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-xl text-green-600 dark:text-green-400"><span className="font-bold text-xl">2</span></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Ajusta y Previsualiza</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Refina tu paleta, comprueba la accesibilidad y mira cómo se ve en componentes de UI reales.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-xl text-red-600 dark:text-red-400"><span className="font-bold text-xl">3</span></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Copia y Pega el Código</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Exporta el sistema de diseño completo en el formato que necesites y acelera tu desarrollo.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl">
                           <div className="flex items-center gap-2 mb-4">
                               <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                               <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                               <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                           </div>
                            <pre className="font-mono text-sm text-green-300 bg-transparent overflow-x-auto">
                                <code>
{`ClearCollect(
    colDesignSystem,
    {
        Tema: "Claro",
        Colores: {
            Marca: {
                t0: ColorValue("#032A3A"),
                ...
            },
            Acciones: {
                Primario: ColorValue("#009FDB"),
                ...
            }
        }
    }
);`}
                                </code>
                            </pre>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                     <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white">¿Listo para Crear?</h2>
                     <p className="mt-4 max-w-xl mx-auto text-gray-600 dark:text-gray-400">Únete a cientos de desarrolladores que ya están creando mejores interfaces, más rápido.</p>
                     <div className="mt-8">
                        <button 
                            onClick={() => onNavigate('generator')}
                            className="text-lg font-semibold text-white bg-purple-600 px-8 py-4 rounded-xl hover:bg-purple-700 transition-transform transform hover:scale-105 flex items-center gap-3 shadow-lg mx-auto"
                        >
                            <span>Empieza Gratis Ahora</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </section>
            </div>


             {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 relative z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Sistema FX. Creado por JD_DM.</p>
                    
                    {/* === ENLACE A POLÍTICA DE PRIVACIDAD === */}
                    <div className="mt-4">
                      <button 
                        onClick={() => onNavigate('privacy')}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                      >
                        Política de Privacidad
                      </button>
                    </div>
                    {/* === FIN DEL ENLACE === */}
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;