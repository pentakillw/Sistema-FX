import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Palette, Loader2, Pipette, Plus, Minus } from 'lucide-react';
import tinycolor from 'tinycolor2';
import { extractColorsFromImage, findColorInCanvas } from '../../utils/imageColorExtractor.js';

// Componente de vista previa (sin cambios)
const ImagePreview = ({ imageUrl, onColorSelect, onIndicatorPositionChange, selectedColor, indicatorPosition, mode }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const loupeRef = useRef(null);
    const [hoverColor, setHoverColor] = useState(null);
    const [isLoupeVisible, setIsLoupeVisible] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
    }, [imageUrl]);

    const handleMouseMove = (e) => {
        if (mode !== 'picker') {
            setIsLoupeVisible(false);
            return;
        }

        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) {
            setIsLoupeVisible(false);
            return;
        }
        if (!isLoupeVisible) setIsLoupeVisible(true);

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const ctx = canvas.getContext('2d');
        const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
        const color = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
        setHoverColor(tinycolor(color).toHexString());
        
        const loupe = loupeRef.current;
        if (loupe) {
            const loupeX = x - 50;
            const loupeY = y - 50;
            loupe.style.transform = `translate(${loupeX}px, ${loupeY}px)`;
            const zoom = 3;
            loupe.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
            loupe.style.backgroundPosition = `-${x * zoom - 50}px -${y * zoom - 50}px`;
        }
    };
    
    const handleClick = (e) => {
        if (mode !== 'picker' || !hoverColor) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        onColorSelect(hoverColor);
        onIndicatorPositionChange({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-auto max-h-[60vh] ${mode === 'picker' ? 'cursor-crosshair' : ''}`}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onMouseLeave={() => setIsLoupeVisible(false)}
        >
            <img src={imageUrl} className="w-full h-auto max-h-[60vh] object-contain rounded-lg pointer-events-none" alt="Selector" />
            
            {indicatorPosition && (
                <div 
                    className='absolute w-6 h-6 rounded-full ring-2 ring-white/70 shadow-lg pointer-events-none flex items-center justify-center'
                    style={{
                        left: `${indicatorPosition.x}px`,
                        top: `${indicatorPosition.y}px`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: selectedColor,
                    }}
                >
                   <div className='w-1 h-1 rounded-full bg-white/70'></div>
                </div>
            )}
            
            <div 
                ref={loupeRef}
                className={`pointer-events-none absolute top-0 left-0 w-[100px] h-[100px] rounded-full border-4 border-white shadow-lg ${isLoupeVisible && mode === 'picker' ? 'block' : 'hidden'}`}
                style={{ backgroundImage: `url(${imageUrl})`, backgroundRepeat: 'no-repeat' }}
            >
                <div className='w-full h-full relative'>
                     <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full border' style={{borderColor: hoverColor ? tinycolor(hoverColor).isLight() ? '#000' : '#FFF' : '#FFF'}}></div>
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

const ImagePaletteModal = ({ onColorSelect, onClose }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [colorPalette, setColorPalette] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [colorCount, setColorCount] = useState(8);
    const [selectedColor, setSelectedColor] = useState(null);
    const [mode, setMode] = useState('palette');
    const [indicatorPosition, setIndicatorPosition] = useState(null);
    const fileInputRef = useRef(null);
    const hiddenCanvasRef = useRef(null);

    useEffect(() => {
        if (!imageUrl) return;
        const canvas = hiddenCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            canvas.width = 200; 
            canvas.height = 200 / aspectRatio;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    }, [imageUrl]);
    
    useEffect(() => {
        if (imageUrl && mode === 'palette') {
            setLoading(true);
            setError(null);
            setColorPalette(null);
            extractColorsFromImage(imageUrl, colorCount)
                .then(palette => {
                    setColorPalette(palette);
                    handlePaletteColorSelect(palette[0]);
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [imageUrl, colorCount, mode]);

    const handlePaletteColorSelect = (color) => {
        setSelectedColor(color);
        const canvas = hiddenCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const pos = findColorInCanvas(ctx, color);

        if (pos) {
            const imageElement = document.querySelector('img[alt="Selector"]');
            if(imageElement) {
                const rect = imageElement.getBoundingClientRect();
                const scaleX = rect.width / ctx.canvas.width;
                const scaleY = rect.height / ctx.canvas.height;
                setIndicatorPosition({ x: pos.x * scaleX, y: pos.y * scaleY });
            }
        } else {
            setIndicatorPosition(null);
        }
    };

    // --- ¡¡¡FUNCIÓN RESTAURADA!!! ---
    // Esta es la función que faltaba y causaba el error
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result);
                setSelectedColor(null);
                setIndicatorPosition(null);
                setMode('palette');
            };
            reader.readAsDataURL(file);
        }
    };
    // --- FIN DE LA FUNCIÓN RESTAURADA ---

    const handleFinalSelect = () => {
        if(selectedColor) {
            onColorSelect(selectedColor);
            onClose();
        }
    };
    
    const triggerFileInput = () => fileInputRef.current.click();

    return (
        // --- ¡MODIFICADO! --- Fondo centrado
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <canvas ref={hiddenCanvasRef} className="hidden" />
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
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                        <Palette size={24} strokeWidth={1.75} /> Extraer Paleta de Imagen
                    </h2>
                     <div className="flex items-center gap-2 self-end sm:self-center">
                         {/* --- ¡BOTÓN CON GRADIENTE! --- */}
                         <button 
                            onClick={handleFinalSelect}
                            disabled={!selectedColor}
                            className="text-sm font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-white transition-all hover:opacity-90 active:scale-95"
                            style={{ background: selectedColor ? 'linear-gradient(to right, #E0405A, #F59A44, #56B470, #4A90E2, #6F42C1)' : '#d1d5db' }}
                         >
                            Seleccionar
                            {selectedColor && <span className='ml-2 font-mono text-xs'>{selectedColor.toUpperCase()}</span>}
                         </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                     </div>
                </div>
                
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                
                <div className="overflow-y-auto">
                    {!imageUrl && (
                        <div className="w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors border-gray-300" onClick={triggerFileInput}>
                            <UploadCloud size={48} className="text-gray-400" />
                            <p className="mt-4 text-lg font-semibold text-gray-800">Haz clic para subir una imagen</p>
                        </div>
                    )}

                    {imageUrl && (
                        <div className="space-y-4">
                            <div className="flex border-b mb-4 border-gray-200">
                                <button onClick={() => setMode('palette')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 flex items-center gap-2 ${mode === 'palette' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'}`}><Palette size={16} strokeWidth={1.75}/> Paleta Automática</button>
                                <button onClick={() => setMode('picker')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 flex items-center gap-2 ${mode === 'picker' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'}`}><Pipette size={16} strokeWidth={1.75}/> Selector</button>
                            </div>
                            
                            <ImagePreview 
                                imageUrl={imageUrl} 
                                onColorSelect={setSelectedColor} 
                                onIndicatorPositionChange={setIndicatorPosition} 
                                selectedColor={selectedColor} 
                                indicatorPosition={indicatorPosition}
                                mode={mode}
                            />

                            {mode === 'palette' && (
                            <div className='mt-4'>
                                {loading && <div className="flex items-center justify-center p-4"><Loader2 size={32} className="animate-spin text-purple-500" /><p className="ml-4 font-semibold text-gray-500">Extrayendo colores...</p></div>}
                                {error && <div className="text-center p-2 rounded-md bg-red-100 text-red-700"><p className="text-sm font-semibold">{error}</p></div>}
                                {colorPalette && (
                                    <div>
                                        <div className='flex justify-between items-center mb-2'>
                                            <h3 className="text-sm font-semibold text-gray-500">Paleta Extraída (toca un color)</h3>
                                            <div className='flex items-center gap-2'>
                                                <button onClick={() => setColorCount(c => Math.max(2, c - 1))} className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"><Minus size={14}/></button>
                                                <span className='text-xs font-mono w-6 text-center'>{colorCount}</span>
                                                <button onClick={() => setColorCount(c => Math.min(20, c + 1))} className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"><Plus size={14}/></button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                            {colorPalette.map((color, index) => (
                                                <div key={index} className="h-16 w-full rounded-lg cursor-pointer transition-transform hover:scale-110 border-2" style={{ backgroundColor: color, borderColor: color === selectedColor ? 'var(--action-primary-default)' : 'transparent' }} title={color.toUpperCase()} onClick={() => handlePaletteColorSelect(color)}>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            )}
                             <div className="flex justify-center mt-4">
                                <button onClick={triggerFileInput} className="text-sm font-medium py-2 px-4 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">Cambiar Imagen</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImagePaletteModal;