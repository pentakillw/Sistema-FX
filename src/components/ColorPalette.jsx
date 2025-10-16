import React, { useState, useEffect } from "react"
import tinycolor from "tinycolor2"
import { HexColorPicker } from "react-colorful"

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
}) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false)
  const titleColorClass =
    themeOverride === "light" ? "text-gray-900" : "text-gray-50"
  const hexColorClass =
    themeOverride === "light" ? "text-gray-500" : "text-gray-400"

  const [inputValue, setInputValue] = useState(hex ? hex.toUpperCase() : "")

  const handleHeaderClick = () => {
    if (!isDisabled && onColorChange) {
      setIsPickerVisible(prev => !prev)
    }
  }

  useEffect(() => {
    if (hex) {
      setInputValue(hex.toUpperCase())
    }
  }, [hex])

  const handleInputChange = e => {
    setInputValue(e.target.value)
  }

  const handleColorUpdate = () => {
    const newColor = tinycolor(inputValue)
    if (newColor.isValid()) {
      onColorChange(newColor.toHexString())
    } else {
      setInputValue(hex ? hex.toUpperCase() : "")
    }
  }

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      handleColorUpdate()
      e.target.blur()
    }
  }

  return (
    <div className="mb-4">
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
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleColorUpdate}
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
                onClick={() => setIsPickerVisible(false)}
              />
              <HexColorPicker color={color} onChange={onColorChange} />
            </div>
          )}
        </div>
      )}
      {/* --- MEJORA RESPONSIVE: Contenedor de scroll único --- */}
      <div className="overflow-x-auto pb-2 -mb-2">
        <div className="sm:min-w-0" style={{ minWidth: `${shades.length * 56}px` }}>
          <div
            className="flex rounded-md overflow-hidden h-12 sm:h-10 relative group"
          >
            {shades.map((shade, index) => (
              <div
                key={index}
                className="w-14 flex-shrink-0 sm:flex-1 cursor-pointer transition-transform duration-100 ease-in-out sm:group-hover:transform sm:group-hover:scale-y-110 sm:hover:!scale-125 sm:hover:z-10 flex items-center justify-center"
                style={{ backgroundColor: shade }}
                onClick={() => onShadeCopy(shade)}
                title={`Usar ${shade.toUpperCase()}`}
              >
                <span
                  className="text-[10px] font-mono sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{
                    color: tinycolor(shade).isLight() ? "#000" : "#FFF",
                  }}
                >
                  {shade.substring(1).toUpperCase()}
                </span>
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
                  left: "calc(47.5% - 7px)",
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
