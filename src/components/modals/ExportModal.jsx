import React, { useState } from 'react';
import { 
    X, FileCode, Settings, Clipboard, Check, ArrowLeft,
    Zap, Paintbrush, FileText, Wind, FileJson2,
    Link, Share2, FileDown, Image, Code, Star, Heart
} from 'lucide-react';
import { 
    generatePowerFxCode, 
    generateCssCode, 
    generateTailwindCode,
    generateJsonCode,
    generateScssCode 
} from '../../utils/codeGenUtils.js';
import Switch from '../ui/Switch.jsx';

const ExportOptionCard = ({ icon, label, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="p-4 w-full rounded-2xl border text-center transition-all duration-200 
                   flex flex-col items-center justify-center gap-2 aspect-square
                   hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1
                   disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-transparent border-gray-200"
    >
        {icon}
        <span className="font-semibold text-sm text-gray-800">{label}</span>
    </button>
);


const ExportModal = ({
    onClose,
    themeData,
    fxSeparator,
    setFxSeparator,
    useFxQuotes,
    setUseFxQuotes,
    onCopy,
    user,
    onOpenSaveModal,
    onOpenMyPalettes,
    handleSharePalette
}) => {
    const [view, setView] = useState('selection');
    const [selectedFormat, setSelectedFormat] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const getCode = () => {
        // Asegúrate de que themeData exista antes de intentar acceder a él
        if (!themeData) return "// No hay datos de tema para exportar";
        
        switch(selectedFormat) {
            case 'powerfx': return generatePowerFxCode(themeData, fxSeparator, useFxQuotes);
            case 'css': return generateCssCode(themeData);
            case 'scss': return generateScssCode(themeData);
            case 'tailwind': return generateTailwindCode(themeData);
            case 'json': return generateJsonCode(themeData);
            default: return "// Selecciona un formato de exportación";
        }
    };
    
    const codeToDisplay = getCode();

    const handleCopy = () => {
        const textToCopy = codeToDisplay;
        try {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            textArea.style.position = "fixed"; 
            textArea.style.top = "-9999px";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showCopySuccess();
        } catch (err) {
            console.error('Error al copiar:', err);
            onCopy('Error al copiar', 'error');
        }

        function showCopySuccess() {
            onCopy('¡Código copiado al portapapeles!');
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };
    
    const handleSelectFormat = (format) => {
        setSelectedFormat(format);
        setView('code');
    };

    const handleBack = () => {
        setView('selection');
        setSelectedFormat(null);
        setCopySuccess(false);
    };
    
    const showComingSoon = () => {
        onCopy('¡Próximamente!', 'info');
    };
    
    const formatLabels = {
        'powerfx': 'Power Fx',
        'css': 'CSS',
        'scss': 'SCSS',
        'tailwind': 'Tailwind',
        'json': 'JSON'
    };

    const handleSaveClick = () => {
        if (!user) {
            onCopy('Inicia sesión para guardar paletas', 'error');
            return;
        }
        onClose();
        onOpenSaveModal();
    };
    
    const handleShareClick = () => {
        if (!user) {
            onCopy('Inicia sesión para compartir paletas', 'error');
            return;
        }
        handleSharePalette();
        onClose();
    };
    
    const handleMyPalettesClick = () => {
        if (!user) {
            onCopy('Inicia sesión para ver tus paletas', 'error');
            return;
        }
        onClose();
        onOpenMyPalettes();
    };

    return (
        // --- ¡MODIFICADO! --- Fondo centrado
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* --- ¡MODIFICADO! ---
              - Cambiado a 'bg-white' y 'rounded-xl'
              - Eliminado padding de safe-area y handle visual
              - Ajustado max-h
            */}
            <div
                className="p-6 rounded-xl border border-gray-200 max-w-2xl w-full relative flex flex-col max-h-[90vh] bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- ELIMINADO --- Handle visual de móvil */}
                
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {view === 'code' && (
                            <button onClick={handleBack} className="p-1 text-gray-500 hover:text-gray-900">
                                <ArrowLeft size={24} strokeWidth={1.75} />
                            </button>
                        )}
                        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                            <FileCode size={24} strokeWidth={1.75} />
                            {view === 'selection' ? 'Exportar Paleta' : `Exportar ${formatLabels[selectedFormat]}`}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto">
                    {view === 'selection' && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            <ExportOptionCard
                                icon={<Link size={32} strokeWidth={1.75} className="text-blue-500" />}
                                label="URL"
                                onClick={handleShareClick}
                            />
                            <ExportOptionCard
                                icon={<Share2 size={32} strokeWidth={1.75} className="text-green-500" />}
                                label="Compartir"
                                onClick={handleShareClick}
                            />
                            <ExportOptionCard
                                icon={<FileDown size={32} strokeWidth={1.75} className="text-red-500" />}
                                label="PDF"
                                onClick={showComingSoon}
                                disabled={true}
                            />
                            <ExportOptionCard
                                icon={<Image size={32} strokeWidth={1.75} className="text-purple-500" />}
                                label="Imagen"
                                onClick={showComingSoon}
                                disabled={true}
                            />
                            <ExportOptionCard
                                icon={<Paintbrush size={32} strokeWidth={1.75} className="text-blue-500" />}
                                label="CSS"
                                onClick={() => handleSelectFormat('css')}
                            />
                            <ExportOptionCard
                                icon={<FileText size={32} strokeWidth={1.75} className="text-pink-500" />}
                                label="SCSS"
                                onClick={() => handleSelectFormat('scss')}
                            />
                            <ExportOptionCard
                                icon={<Wind size={32} strokeWidth={1.75} className="text-cyan-500" />}
                                label="Tailwind"
                                onClick={() => handleSelectFormat('tailwind')}
                            />
                            <ExportOptionCard
                                icon={<Zap size={32} strokeWidth={1.75} className="text-purple-500" />}
                                label="Power Fx"
                                onClick={() => handleSelectFormat('powerfx')}
                            />
                             <ExportOptionCard
                                icon={<FileJson2 size={32} strokeWidth={1.75} className="text-yellow-500" />}
                                label="JSON"
                                onClick={() => handleSelectFormat('json')}
                            />
                            <ExportOptionCard
                                icon={<Code size={32} strokeWidth={1.75} className="text-gray-500" />}
                                label="SVG"
                                onClick={showComingSoon}
                                disabled={true}
                            />
                            <ExportOptionCard
                                icon={<Heart size={32} strokeWidth={1.75} className="text-red-600" />}
                                label="Mis Paletas" // Cambiado de "Favoritos" para claridad
                                onClick={handleMyPalettesClick}
                            />
                             <ExportOptionCard
                                icon={<Star size={32} strokeWidth={1.75} className="text-yellow-400" />}
                                label="Guardar"
                                onClick={handleSaveClick}
                            />
                        </div>
                    )}
                    
                    {view === 'code' && (
                        <div>
                            {selectedFormat === 'powerfx' && (
                                <div className="p-4 border-b border-gray-200">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900"><Settings size={16} strokeWidth={1.75} /> Configuración de Salida</h4>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-y-2 gap-x-6">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-600" htmlFor="fxSeparator">Separador:</label>
                                            <select id="fxSeparator" value={fxSeparator} onChange={(e) => setFxSeparator(e.target.value)} className="font-semibold px-2 py-1 rounded-md border bg-gray-100 text-gray-900 border-gray-200">
                                                <option value=";">;</option>
                                                <option value=",">,</option>
                                                <option value=";;">;;</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-600">Usar comillas:</label>
                                            <Switch checked={useFxQuotes} onCheckedChange={setUseFxQuotes} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="relative mt-4">
                                <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-all p-4 rounded-md h-64 md:h-80 overflow-auto bg-gray-100 text-gray-600">
                                    <code>{codeToDisplay}</code>
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {view === 'code' && (
                    <div className="mt-4 flex justify-end flex-shrink-0">
                        {/* --- ¡BOTÓN CON GRADIENTE! --- */}
                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto font-bold py-2 px-6 rounded-lg transition-all text-white hover:opacity-90 active:scale-95"
                            style={{ background: copySuccess ? '#22c55e' : 'linear-gradient(to right, #E0405A, #F59A44, #56B470, #4A90E2, #6F42C1)' }}
                        >
                            {copySuccess ? <><Check size={16} /> Copiado</> : <><Clipboard size={16} strokeWidth={1.75} /> Copiar Código</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportModal;