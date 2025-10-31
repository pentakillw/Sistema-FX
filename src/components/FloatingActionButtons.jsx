import React from 'react';
// --- MODIFICACIÓN --- Se importa el ícono Clock ---
import { Sparkles, Sun, Moon, Undo2, Redo2, Clock } from 'lucide-react';

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
    // --- NUEVO --- Se recibe la función para abrir el modal de historial
    onOpenHistoryModal
}) => (
    // --- CORRECCIÓN DE Z-INDEX ---
    // El z-index aquí DEBE SER z-40.
    //
    // Tus otros componentes tienen este orden:
    // 1. Panel de Ajuste (Sidebar): z-60
    // 2. Fondo del Panel (Backdrop): z-50
    //
    // Al poner los botones en z-40, te aseguras de que queden *detrás*
    // del fondo (z-50). Esto es correcto. Cuando el panel se abre,
    // el fondo (backdrop) debe cubrir los botones y deshabilitarlos.
    //
    // Si sigues viendo los botones *encima* del panel (como en tu imagen), 
    // es 100% un problema de CACHÉ de tu navegador o del servidor (Vite).
    //
    // Intenta forzar un refresco (Ctrl + Shift + R) o
    // detén y reinicia tu servidor (npm run dev) después de guardar este archivo.
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

      {/* --- NUEVO --- Botón de historial añadido a los botones flotantes --- */}
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

