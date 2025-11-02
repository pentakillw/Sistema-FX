import React from 'react';
// --- MODIFICACIÓN --- 
// Importamos FileCode para el nuevo botón
import { Sparkles, Sun, Moon, Undo2, Redo2, Clock, FileCode } from 'lucide-react';

const ActionButton = ({ onClick, title, disabled = false, children, className = '', style = {} }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`
      h-12 w-12 rounded-full flex items-center justify-center shadow-lg 
      transform transition-all duration-200 
      hover:shadow-xl hover:-translate-y-1 
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 
      ${className}
    `}
    style={style}
  >
    {children}
  </button>
);

const FloatingActionButtons = ({ 
    onRandomClick, 
    onThemeToggle, 
    currentTheme,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onOpenHistoryModal,
    // --- MODIFICACIÓN --- 
    // Recibimos la nueva prop para abrir el modal de exportación
    onOpenExportModal 
}) => (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 flex flex-col items-center gap-3">
      <ActionButton
        onClick={onUndo}
        title="Deshacer"
        disabled={!canUndo}
        className="text-[var(--text-default)] border border-[var(--border-default)]"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <Undo2 size={20} />
      </ActionButton>
      
      <ActionButton
        onClick={onRedo}
        title="Rehacer"
        disabled={!canRedo}
        className="text-[var(--text-default)] border border-[var(--border-default)]"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <Redo2 size={20} />
      </ActionButton>

      <ActionButton
        onClick={onOpenHistoryModal}
        title="Historial de Paletas"
        className="text-[var(--text-default)] border border-[var(--border-default)]"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <Clock size={20} />
      </ActionButton>

      <ActionButton
        onClick={onThemeToggle}
        title={currentTheme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
        className="text-[var(--text-default)] border border-[var(--border-default)]"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        {currentTheme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
      </ActionButton>

      {/* --- NUEVO --- 
          Añadimos el botón de Exportar Código aquí.
          Lo pongo antes del botón "Aleatorio" para que "Aleatorio" quede al final.
      */}
      <ActionButton
        onClick={onOpenExportModal}
        title="Exportar Código"
        className="text-[var(--text-default)] border border-[var(--border-default)]"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <FileCode size={20} />
      </ActionButton>

      <ActionButton
        onClick={onRandomClick}
        title="Generar Tema Aleatorio"
        className="text-white"
        style={{ background: 'linear-gradient(to right, var(--action-primary-default), #e11d48)' }}
      >
        <Sparkles size={22} />
      </ActionButton>
    </div>
);

export default FloatingActionButtons;

