import type { VSLProject } from '../types';
import { Plus, Library } from 'lucide-react';

interface ProjetosProps {
  onNewProjectClick?: () => void;
  projects?: VSLProject[];
}

export const Projetos: React.FC<ProjetosProps> = ({ onNewProjectClick, projects = [] }) => {
  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#070913]">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">
            PORTFÓLIO DE PROJETOS
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Catálogo completo e arquivo de produções VSL concluídas</p>
        </div>

        {onNewProjectClick && (
          <button
            onClick={onNewProjectClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-500/10 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>
        )}
      </div>

      {/* Modern, high-end Blank State Portfolio Placeholder */}
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-3xl bg-[#0e1322]/30 min-h-[400px] text-center max-w-4xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/10 to-indigo-500/5 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 shadow-md shadow-violet-500/5">
          <Library className="w-7 h-7" />
        </div>
        
        <h4 className="text-base font-bold text-slate-200 tracking-wide">
          {projects.length > 0
            ? `Você possui ${projects.length} projeto(s) catalogado(s)`
            : 'Nenhum projeto no portfólio ainda'}
        </h4>
        <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed font-medium">
          Assim que seus editores finalizarem as edições de VSL e elas forem aprovadas, os projetos concluídos aparecerão automaticamente aqui para consulta histórica e download. (Total: {projects.length})
        </p>

        {/* Decorative Grid Skeleton placeholders */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl opacity-35 select-none pointer-events-none">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-slate-900/50 border border-slate-850 rounded-xl space-y-3">
              <div className="w-12 h-2.5 bg-slate-800 rounded" />
              <div className="w-full h-3 bg-slate-850 rounded" />
              <div className="flex justify-between items-center pt-2">
                <div className="w-8 h-2 bg-slate-800 rounded" />
                <div className="w-10 h-2 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
