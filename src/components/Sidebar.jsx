import React from 'react';
import { SlidersHorizontal, Compass, Eye, FileCode } from 'lucide-react';

const NavItem = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-semibold transition-colors rounded-lg ${
            isActive
                ? 'bg-[var(--action-primary-default)] text-white'
                : 'text-[var(--text-default)] hover:bg-[var(--bg-muted)]'
        }`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
    return (
        <aside className="w-full md:w-64 lg:w-72 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <nav className="space-y-2">
                <NavItem
                    icon={<SlidersHorizontal size={20} />}
                    label="Definir Tema"
                    isActive={activeTab === 'define'}
                    onClick={() => setActiveTab('define')}
                />
                <NavItem
                    icon={<Compass size={20} />}
                    label="Explorar Paletas"
                    isActive={activeTab === 'explore'}
                    onClick={() => setActiveTab('explore')}
                />
                <NavItem
                    icon={<Eye size={20} />}
                    label="Analizar y Previsualizar"
                    isActive={activeTab === 'analyze'}
                    onClick={() => setActiveTab('analyze')}
                />
                <NavItem
                    icon={<FileCode size={20} />}
                    label="Exportar Código"
                    isActive={activeTab === 'export'}
                    onClick={() => setActiveTab('export')}
                />
            </nav>
        </aside>
    );
};

export default Sidebar;
