import React from 'react';
import type { Editor, VSLProject } from '../types';
import { Plus, Trash2, Users } from 'lucide-react';

interface EditoresProps {
  editors: Editor[];
  projects: VSLProject[];
  onAddEditorClick: () => void;
  onDeleteEditor: (id: string) => void;
}

export const Editores: React.FC<EditoresProps> = ({
  editors,
  projects,
  onAddEditorClick,
  onDeleteEditor,
}) => {
  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#070913]">
      
      {/* Header section with Plus Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">
            GERENCIAMENTO DE EDITORES
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Controle de equipe, carga de trabalho e eficiência</p>
        </div>
        
        <button
          onClick={onAddEditorClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-500/10 hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar Editor</span>
        </button>
      </div>

      {editors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {editors.map((editor) => {
            // Calculate workload dynamically based on global projects
            const assigned = projects.filter((p) => p.editor.id === editor.id);
            const activeCount = assigned.filter((p) => p.status !== 'done').length;
            const completedCount = assigned.filter((p) => p.status === 'done').length;
            const progressPercentage = assigned.length > 0 ? Math.round((completedCount / assigned.length) * 100) : 0;

            const waitingCount = assigned.filter((p) => p.status === 'waiting').length;
            const aiCount = assigned.filter((p) => p.status === 'ai').length;
            const editingCount = assigned.filter((p) => p.status === 'editing').length;
            const doneCount = assigned.filter((p) => p.status === 'done').length;
            const reviewCount = assigned.filter((p) => p.status === 'review').length;

            return (
              <div
                key={editor.id}
                className="p-6 bg-[#0e1322]/80 border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-all duration-300"
              >
                {/* Editor Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${editor.avatarColor || 'from-indigo-500 to-violet-500'} flex items-center justify-center text-white text-base font-bold shadow-lg shadow-indigo-500/10`}>
                      {editor.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{editor.name}</h4>
                      <span className="text-xs text-violet-400 font-semibold">{editor.role}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      activeCount > 2 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                      {activeCount > 2 ? 'Carga Alta' : 'Disponível'}
                    </span>
                    
                    <button
                      onClick={() => onDeleteEditor(editor.id)}
                      className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 transition-all duration-200"
                      title="Remover Editor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editor Dynamic workload Stats */}
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Eficiência de Entrega</span>
                    <span>{progressPercentage}% ({completedCount}/{assigned.length})</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-950/60 rounded-full h-2 border border-slate-800/50">
                    <div 
                      className="bg-gradient-to-r from-violet-600 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* 5 columns workload counters */}
                  <div className="grid grid-cols-5 gap-1 text-center pt-2 border-t border-slate-800/40">
                    <div className="p-1.5 bg-slate-950/40 rounded-lg">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">IA</p>
                      <p className="text-xs font-extrabold text-purple-400 mt-0.5">{aiCount}</p>
                    </div>
                    <div className="p-1.5 bg-slate-950/40 rounded-lg">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Fila</p>
                      <p className="text-xs font-extrabold text-slate-300 mt-0.5">{waitingCount}</p>
                    </div>
                    <div className="p-1.5 bg-slate-950/40 rounded-lg">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Edição</p>
                      <p className="text-xs font-extrabold text-amber-500 mt-0.5">{editingCount}</p>
                    </div>
                    <div className="p-1.5 bg-slate-950/40 rounded-lg">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Feito</p>
                      <p className="text-xs font-extrabold text-emerald-500 mt-0.5">{doneCount}</p>
                    </div>
                    <div className="p-1.5 bg-slate-950/40 rounded-lg">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Revisão</p>
                      <p className="text-xs font-extrabold text-violet-400 mt-0.5">{reviewCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-3xl bg-[#0e1322]/20 min-h-[350px] text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-5">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-300">Nenhum editor cadastrado</h4>
          <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
            Adicione editores clicando no botão "+ Adicionar Editor" acima para começar a distribuir a demanda de projetos VSL.
          </p>
        </div>
      )}
    </div>
  );
};
