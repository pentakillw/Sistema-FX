import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Palette, Loader2 } from 'lucide-react';
import tinycolor from 'tinycolor2';
import { extractColorsFromImage } from '../../utils/imageColorExtractor.js'; // Usar nuestra utilidad local

const ImagePaletteModal = ({ onColorSelect, onClose }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [colorPalette, setColorPalette] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (imageUrl) {
            setLoading(true);
            setError(null);
            setColorPalette(null);
            extractColorsFromImage(imageUrl)
                .then(palette => {
                    setColorPalette(palette);
                })
                .catch(err => {
                    setError(err.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [imageUrl]);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleColorClick = (color) => {
        onColorSelect(color);
        onClose();
    };
    
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="p-6 rounded-xl border max-w-lg w-full relative flex flex-col"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                        <Palette size={24} /> Extraer Paleta de Imagen
                    </h2>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                />

                {!imageUrl && (
                    <div
                        className="w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[var(--action-primary-default)] transition-colors"
                        style={{ borderColor: 'var(--border-default)' }}
                        onClick={triggerFileInput}
                    >
                        <UploadCloud size={48} style={{ color: 'var(--text-muted)' }} />
                        <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--text-default)' }}>Haz clic para subir una imagen</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>O arrastra y suelta el archivo aquí</p>
                    </div>
                )}

                {imageUrl && (
                    <div className="space-y-4">
                        <div className="w-full h-64 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--bg-muted)' }}>
                             <img src={imageUrl} alt="Uploaded" className="max-h-full max-w-full object-contain" />
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={triggerFileInput}
                                className="text-sm font-medium py-2 px-4 rounded-lg"
                                style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}
                            >
                                Cambiar Imagen
                            </button>
                        </div>

                        {loading && (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--action-primary-default)' }}/>
                                <p className="ml-4 font-semibold" style={{ color: 'var(--text-muted)'}}>Extrayendo colores...</p>
                            </div>
                        )}
                        
                        {error && (
                            <div className="text-center p-2 rounded-md" style={{ backgroundColor: 'var(--bg-critical-weak)', color: 'var(--text-critical)' }}>
                                <p className="text-sm font-semibold">{error}</p>
                            </div>
                        )}

                        {colorPalette && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Paleta Extraída (toca un color)</h3>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                                    {colorPalette.map((color, index) => (
                                        <div
                                            key={index}
                                            className="h-16 w-full rounded-lg cursor-pointer transition-transform hover:scale-110 border"
                                            style={{ backgroundColor: color, borderColor: 'var(--border-default)' }}
                                            title={color.toUpperCase()}
                                            onClick={() => handleColorClick(color)}
                                        >
                                            <div className="w-full h-full rounded-md flex items-end justify-end p-1 opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                                                <span className="text-[10px] font-mono" style={{ color: tinycolor(color).isLight() ? '#000' : '#FFF' }}>
                                                    {color.substring(1).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImagePaletteModal;

