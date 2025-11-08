import React, { useState, useEffect } from "react"
import tinycolor from "tinycolor2"
import { HexColorPicker } from "react-colorful"
// --- NUEVO --- Importamos el icono de chispas
import { Sparkles } from "lucide-react"

const ColorPalette = ({
  title,
  color,
  hex,  
  shades,
  onShadeCopy,
  themeOverride,
  isExplorer = false,
  onColorChange, 
  isDisabled = false,
  // --- NUEVO --- Se recibe la nueva prop
  onGenerateFromShade 
}) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false)
  const [localColor, setLocalColor] = useState(hex ? hex.toUpperCase() : "")

  const titleColorClass =
    themeOverride === "light" ? "text-gray-900" : "text-gray-50"
  const hexColorClass =
    themeOverride === "light" ? "text-gray-500" : "text-gray-400"

  useEffect(() => {
    if (hex) {
      setLocalColor(hex.toUpperCase())
    }
  }, [hex])

  const handleHeaderClick = () => {
    if (!isDisabled && onColorChange) {
      setLocalColor(hex ? hex.toUpperCase() : "")
      setIsPickerVisible(prev => !prev)
    }
  }

  const commitColorChange = () => {
    const newColor = tinycolor(localColor)
    if (newColor.isValid()) {
      const newHex = newColor.toHexString()
      onColorChange(newHex)
      setLocalColor(newHex.toUpperCase()) 
    } else {
      setLocalColor(hex ? hex.toUpperCase() : "")
    }
  }

  const handleInputChange = e => {
    setLocalColor(e.target.value)
  }

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      commitColorChange()
      e.target.blur() 
    }
  }

  const handleInputBlur = () => {
    commitColorChange()
  }

  const handlePickerClose = () => {
    commitColorChange()
    setIsPickerVisible(false)
  }

  return (
    // --- MODIFICACIÓN: Reducido el margen inferior ---
    // --- CAMBIO de 'mb-4' a 'mb-2' ---
    <div className="mb-2">
      {!isExplorer && (
        <div className="relative">
          <div
            className={`flex items-center mb-2 ${
              onColorChange && !isDisabled ? "cursor-pointer" : "cursor-default"
            }`}
            onClick={handleHeaderClick}
          >
            <div
              className="w-10 h-10 rounded-md mr-3 border"
              style={{
                backgroundColor: color,
                borderColor:
                  themeOverride === "light" ? "#E5E7EB" : "#4B5563",
              }}
            ></div>
            <div>
              <p className={`text-sm font-medium ${titleColorClass}`}>
                {title}
              </p>
              <input
                type="text"
                value={localColor}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()} 
                disabled={isDisabled}
                className={`text-xs font-mono w-24 p-0 m-0 bg-transparent border-none focus:outline-none focus:ring-0 ${hexColorClass}`}
                style={{
                  cursor: isDisabled ? "default" : "text",
                }}
              />
            </div>
          </div>
          {isPickerVisible && onColorChange && !isDisabled && (
            <div className="absolute z-20 top-full mt-2 left-0">
              <div
                className="fixed inset-0 -z-10"
                onClick={handlePickerClose} 
              />
              <HexColorPicker 
                color={localColor} 
                onChange={setLocalColor} 
              />
            </div>
          )}
        </div>
      )}
      <div className="overflow-x-auto pb-2 -mb-2">
        <div className="sm:min-w-0" style={{ minWidth: `${shades.length * 56}px` }}>
          <div
            className="flex rounded-md overflow-hidden h-12 sm:h-10 relative group"
          >
            {shades.map((shade, index) => (
              <div
                key={index}
                className="w-14 flex-shrink-0 sm:flex-1 cursor-pointer transition-transform duration-100 ease-in-out sm:group-hover:transform sm:group-hover:scale-y-110 sm:hover:!scale-125 sm:hover:z-10 flex items-center justify-center relative group/shade" // --- Se añade group/shade
                style={{ backgroundColor: shade }}
                onClick={() => onShadeCopy(shade)} // --- El clic principal sigue copiando
                title={`Copiar ${shade.toUpperCase()}`}
              >
                <span
                  className="text-[10px] font-mono sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{
                    color: tinycolor(shade).isLight() ? "#000" : "#FFF",
                  }}
                >
                  {shade.substring(1).toUpperCase()}
                </span>
                
                {/* --- NUEVO --- Botón para generar tema aleatorio desde este tono */}
                {onGenerateFromShade && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que el clic se propague y copie el color
                      onGenerateFromShade(shade); // Llama a handleRandomTheme con este color
                    }}
                    className="absolute top-1 right-1 p-0.5 bg-black/30 rounded-full text-white opacity-0 group-hover/shade:opacity-100 hover:bg-black/60 transition-all z-20"
                    title={`Generar paleta desde ${shade.toUpperCase()}`}
                  >
                    <Sparkles size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
           {!isExplorer && (
            <div
              className={`flex text-xs font-mono px-1 relative pt-2 mt-1 ${
                themeOverride === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              <div
                className="absolute top-0 w-0 h-0 hidden sm:block"
                style={{
                  left: "calc(47.5% - 7px)", // Centrado en el tono T450 (índice 9.5 de 20)
                  borderLeft: "7px solid transparent",
                  borderRight: "7px solid transparent",
                  borderTop: `10px solid ${
                    themeOverride === "light" ? "#374151" : "#D1D5DB"
                  }`,
                }}
                title="Color Base"
              ></div>
              {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="w-14 sm:flex-1 text-center text-[10px] flex-shrink-0">
                  T{index * 50}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ColorPalette