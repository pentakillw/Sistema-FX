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
                   hover:bg-[var(--bg-muted)] hover:shadow-lg hover:-translate-y-1
                   disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-transparent"
        style={{ borderColor: 'var(--border-default)' }}
    >
        {icon}
        <span className="font-semibold text-sm" style={{ color: 'var(--text-default)' }}>{label}</span>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
            <div
                className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 rounded-t-2xl md:rounded-xl border max-w-2xl w-full relative flex flex-col max-h-[90vh] md:max-h-[80vh]"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden" />
                
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {view === 'code' && (
                            <button onClick={handleBack} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-default)]">
                                <ArrowLeft size={24} />
                            </button>
                        )}
                        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                            <FileCode size={24} />
                            {view === 'selection' ? 'Exportar Paleta' : `Exportar ${formatLabels[selectedFormat]}`}
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto">
                    {view === 'selection' && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            <ExportOptionCard
                                icon={<Link size={32} className="text-blue-500" />}
                                label="URL"
                                onClick={handleShareClick}
                            />
                            <ExportOptionCard
                                icon={<Share2 size={32} className="text-green-500" />}
                                label="Compartir"
                                onClick={handleShareClick}
                            />
                            <ExportOptionCard
                                icon={<FileDown size={32} className="text-red-500" />}
                                label="PDF"
                                onClick={showComingSoon}
                                disabled={true}
                            />
                            <ExportOptionCard
                                icon={<Image size={32} className="text-purple-500" />}
                                label="Imagen"
                                onClick={showComingSoon}
                                disabled={true}
                            />
                            <ExportOptionCard
                                icon={<Paintbrush size={32} className="text-blue-500" />}
                                label="CSS"
                                onClick={() => handleSelectFormat('css')}
                            />
                            <ExportOptionCard
                                icon={<FileText size={32} className="text-pink-500" />}
                                label="SCSS"
                                onClick={() => handleSelectFormat('scss')}
                            />
                            <ExportOptionCard
                                icon={<Wind size={32} className="text-cyan-500" />}
                                label="Tailwind"
                                onClick={() => handleSelectFormat('tailwind')}
                            />
                            <ExportOptionCard
                                icon={<Zap size={32} className="text-purple-500" />}
                                label="Power Fx"
                                onClick={() => handleSelectFormat('powerfx')}
                            />
                             <ExportOptionCard
                                icon={<FileJson2 size={32} className="text-yellow-500" />}
                                label="JSON"
                                onClick={() => handleSelectFormat('json')}
                            />
                            <ExportOptionCard
                                icon={<Code size={32} className="text-gray-500" />}
                                label="SVG"
                                onClick={showComingSoon}
                                disabled={true}
                            />
                            <ExportOptionCard
                                icon={<Heart size={32} className="text-red-600" />}
                                label="Mis Paletas" // Cambiado de "Favoritos" para claridad
                                onClick={handleMyPalettesClick}
                            />
                             <ExportOptionCard
                                icon={<Star size={32} className="text-yellow-400" />}
                                label="Guardar"
                                onClick={handleSaveClick}
                            />
                        </div>
                    )}
                    
                    {view === 'code' && (
                        <div>
                            {selectedFormat === 'powerfx' && (
                                <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-default)' }}><Settings size={16} /> Configuración de Salida</h4>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-y-2 gap-x-6">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm" style={{ color: 'var(--text-muted)' }} htmlFor="fxSeparator">Separador:</label>
                                            <select id="fxSeparator" value={fxSeparator} onChange={(e) => setFxSeparator(e.target.value)} className="font-semibold px-2 py-1 rounded-md border" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)' }}>
                                                <option value=";">;</option>
                                                <option value=",">,</option>
                                                <option value=";;">;;</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Usar comillas:</label>
                                            <Switch checked={useFxQuotes} onCheckedChange={setUseFxQuotes} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="relative mt-4">
                                <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-all p-4 rounded-md h-64 md:h-80 overflow-auto" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                    <code>{codeToDisplay}</code>
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {view === 'code' && (
                    <div className="mt-4 flex justify-end flex-shrink-0">
                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto font-bold py-2 px-6 rounded-lg transition-colors text-white"
                            style={{ backgroundColor: copySuccess ? '#22c55e' : 'var(--action-primary-default)' }}
                        >
                            {copySuccess ? <><Check size={16} /> Copiado</> : <><Clipboard size={16} /> Copiar Código</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportModal;