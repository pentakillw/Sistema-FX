import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

const AIPaletteModal = ({ onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateClick = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        const success = await onGenerate(prompt);
        setIsLoading(false);
        if (success) {
            onClose();
        }
    };

    const examplePrompts = [
        "Atardecer en una playa de Bali",
        "Bosque nórdico en invierno",
        "Neón en una ciudad de noche",
        "Tonos tierra de cerámica artesanal",
        "Dulces y pasteles franceses",
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="p-6 rounded-xl border max-w-lg w-full relative flex flex-col"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                        <Sparkles size={24} className="text-purple-500" /> Generar Paleta con IA
                    </h2>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>

                <div className="mt-4 space-y-4">
                    <p className="text-sm" style={{ color: 'var(--text-muted)'}}>
                        Describe el ambiente, tema o estilo de la paleta que quieres crear.
                    </p>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ej: Un café otoñal con tonos cálidos y acogedores..."
                        className="w-full h-24 p-3 rounded-lg text-sm border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)' }}
                    />
                     <div>
                        <p className="text-xs mb-2" style={{color: 'var(--text-muted)'}}>O intenta con un ejemplo:</p>
                        <div className="flex flex-wrap gap-2">
                            {examplePrompts.map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => setPrompt(p)}
                                    className="text-xs py-1 px-2 rounded-full"
                                    style={{backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleGenerateClick}
                        disabled={isLoading || !prompt.trim()}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto font-bold py-2.5 px-6 rounded-lg transition-colors text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Generando...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} /> Generar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIPaletteModal;
