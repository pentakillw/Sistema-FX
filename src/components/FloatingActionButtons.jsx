import React from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';

const FloatingActionButtons = ({ onRandomClick, onThemeToggle, currentTheme }) => (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col gap-4">
      <button
        onClick={onRandomClick}
        className="h-14 w-14 rounded-full text-white flex items-center justify-center shadow-lg transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
        style={{ background: 'linear-gradient(to right, var(--action-primary-default), #e11d48)' }}
        title="Generar Tema Aleatorio"
      >
        <Sparkles size={24} />
      </button>
      <button
        onClick={onThemeToggle}
        className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-default)', border: '1px solid var(--border-default)' }}
        title={currentTheme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
      >
        {currentTheme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>
    </div>
);

export default FloatingActionButtons;
