import React, { useState } from 'react';
import { Search, Bell, Plus, Lock } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onNewVSLClick: () => void;
  title?: string;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  availablePeriods: { value: string; label: string }[];
  onChangePasswordClick?: () => void;
  selectedEditor: string;
  setSelectedEditor: (val: string) => void;
  editorsList: string[];
  selectedClient: string;
  setSelectedClient: (val: string) => void;
  clientsList: string[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categoriesList: string[];
  showFilters?: boolean;
  selectedStage: string;
  setSelectedStage: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  setSearchTerm,
  onNewVSLClick,
  title = "Painel de Projetos",
  selectedPeriod,
  setSelectedPeriod,
  availablePeriods,
  onChangePasswordClick,
  selectedEditor,
  setSelectedEditor,
  editorsList,
  selectedClient,
  setSelectedClient,
  clientsList,
  selectedCategory,
  setSelectedCategory,
  categoriesList,
  showFilters = false,
  selectedStage,
  setSelectedStage,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <header className="h-16 px-8 bg-[#0c101d] border-b border-slate-800/80 flex items-center justify-between shrink-0 select-none">
      {/* Page Title */}
      <div className="flex items-center gap-3 shrink-0">
        <h2 className="text-lg font-bold text-white tracking-wide">
          {title}
        </h2>
        <span className="hidden md:inline px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
          IDL CONTROL
        </span>
      </div>

      {/* Middle Controls (Search & Dynamic Dropdowns) */}
      <div className="flex-1 flex items-center gap-3 px-6 max-w-4xl">
        {showFilters && (
          <>
            {/* Search Input */}
            <div className="relative flex-1 min-w-[150px] max-w-[280px] group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200" />
              </span>
              <input
                type="text"
                placeholder="Buscar por VSL ou Editor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:border-violet-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>

            {/* Editor Filter Dropdown */}
            <select
              value={selectedEditor}
              onChange={(e) => setSelectedEditor(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-250 hover:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors duration-200 cursor-pointer select-none max-w-[130px] truncate"
            >
              <option value="All">Todos Editores</option>
              {editorsList.map((ed) => (
                <option key={ed} value={ed} className="bg-[#0f1425] text-slate-200">
                  {ed}
                </option>
              ))}
            </select>

            {/* Client Filter Dropdown */}
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-250 hover:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors duration-200 cursor-pointer select-none max-w-[130px] truncate"
            >
              <option value="All">Todos Clientes</option>
              {clientsList.map((cl) => (
                <option key={cl} value={cl} className="bg-[#0f1425] text-slate-200">
                  {cl}
                </option>
              ))}
            </select>

            {/* Category Filter Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-250 hover:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors duration-200 cursor-pointer select-none max-w-[130px] truncate"
            >
              <option value="All">Todas Categorias</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0f1425] text-slate-200">
                  {cat}
                </option>
              ))}
            </select>

            {/* Stage Filter Dropdown */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-250 hover:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors duration-200 cursor-pointer select-none max-w-[130px] truncate"
            >
              <option value="All">Todas Etapas</option>
              <option value="ai" className="bg-[#0f1425] text-slate-200">Gestão de IA</option>
              <option value="waiting" className="bg-[#0f1425] text-slate-200">Fila Geral</option>
              <option value="editing" className="bg-[#0f1425] text-slate-200">Em Edição</option>
              <option value="review" className="bg-[#0f1425] text-slate-200">Revisão</option>
              <option value="done" className="bg-[#0f1425] text-slate-200">Finalizadas</option>
            </select>
          </>
        )}
      </div>

      {/* Right Actions Container */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Dynamic Month Selector */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors duration-200 cursor-pointer select-none"
        >
          {availablePeriods.map((p) => (
            <option key={p.value} value={p.value} className="bg-[#0f1425] text-slate-200">
              {p.label}
            </option>
          ))}
        </select>

        {/* Quick Action Button */}
        <button
          onClick={onNewVSLClick}
          className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-500/10 hover:shadow-lg hover:shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Projeto</span>
        </button>

        {/* Icons Area */}
        <div className="flex items-center gap-4 border-l border-slate-800/80 pl-6">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all duration-200 group">
            <Bell className="w-4 h-4 group-hover:animate-swing" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-[#0c101d]" />
          </button>

          {/* User Profile Dropdown Container */}
          <div className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 pl-2 cursor-pointer select-none group"
            >
              <div className="hidden lg:block text-right">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-violet-400 transition-colors">
                  MATHEUS
                </p>
                <p className="text-[10px] text-violet-400 font-semibold tracking-wide">
                  Diretor de Produção
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/10 group-hover:scale-105 transition-all duration-200">
                M
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0f1425] border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-fadeIn">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onChangePasswordClick?.();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-350 hover:text-white hover:bg-slate-800/50 transition-colors flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-violet-400" />
                  <span>Trocar Senha</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
