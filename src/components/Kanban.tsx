import React, { useState } from 'react';
import type { ColumnStatus, VSLProject } from '../types';
import { CardVSL } from './CardVSL';
import { PlayCircle, Flame, CheckCircle2, MessageSquareCode, PlusCircle, Cpu } from 'lucide-react';

interface KanbanProps {
  projects: VSLProject[];
  onEditClick: (project: VSLProject) => void;
  onMoveCard: (id: string, destinationStatus: ColumnStatus) => void;
  onQuickAdd: (status: ColumnStatus) => void;
}

interface ColumnConfig {
  id: ColumnStatus;
  title: string;
  dotColor: string;
  borderColor: string;
  bgColor: string;
  icon: React.ComponentType<any>;
}

const columns: ColumnConfig[] = [
  {
    id: 'ai',
    title: 'GESTOR DE IA',
    dotColor: 'bg-purple-500',
    borderColor: 'border-purple-500/20',
    bgColor: 'bg-purple-500/5',
    icon: Cpu
  },
  {
    id: 'waiting',
    title: 'FILA GERAL',
    dotColor: 'bg-slate-400',
    borderColor: 'border-slate-800/80',
    bgColor: 'bg-slate-900/20',
    icon: PlayCircle
  },
  {
    id: 'editing',
    title: 'EM EDIÇÃO',
    dotColor: 'bg-amber-500',
    borderColor: 'border-amber-500/20',
    bgColor: 'bg-amber-500/5',
    icon: Flame
  },
  {
    id: 'done',
    title: 'FINALIZADAS',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/20',
    bgColor: 'bg-emerald-500/5',
    icon: CheckCircle2
  },
  {
    id: 'review',
    title: 'REVISÃO',
    dotColor: 'bg-violet-500',
    borderColor: 'border-violet-500/20',
    bgColor: 'bg-violet-500/5',
    icon: MessageSquareCode
  }
];

export const Kanban: React.FC<KanbanProps> = ({
  projects,
  onEditClick,
  onMoveCard,
  onQuickAdd
}) => {
  // Store the active dragging project ID and the column being dragged over
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragOverColumn, setActiveDragOverColumn] = useState<ColumnStatus | null>(null);

  const handleDragStart = (id: string) => {
    setActiveDragId(id);
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
    setActiveDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: ColumnStatus) => {
    e.preventDefault();
    if (activeDragOverColumn !== columnId) {
      setActiveDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setActiveDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: ColumnStatus) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      onMoveCard(cardId, columnId);
    }
    setActiveDragOverColumn(null);
    setActiveDragId(null);
  };

  return (
    <div className="flex-1 grid grid-cols-5 gap-6 px-8 py-6 min-h-0 select-none items-stretch">
      {columns.map((col) => {
        const columnProjects = projects.filter((p) => p.status === col.id);
        const isDraggingOver = activeDragOverColumn === col.id;
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col h-full min-h-[70vh] rounded-2xl border transition-all duration-300 ${col.borderColor} ${col.bgColor} ${
              isDraggingOver 
                ? 'ring-2 ring-violet-500/30 border-violet-500/40 bg-slate-900/40 scale-[1.01]' 
                : ''
            }`}
          >
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/20 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${
                  col.id === 'waiting' ? 'text-slate-400' :
                  col.id === 'ai' ? 'text-purple-400' :
                  col.id === 'editing' ? 'text-amber-500' :
                  col.id === 'review' ? 'text-violet-400' : 'text-emerald-500'
                }`} />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {col.title}
                </h3>
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800/80 text-slate-400 border border-slate-700/40">
                  {columnProjects.length}
                </span>
              </div>

              {/* Quick Add Button */}
              <button
                onClick={() => onQuickAdd(col.id)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all duration-200"
                title={`Adicionar VSL em ${col.title}`}
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
              {columnProjects.length > 0 ? (
                columnProjects.map((project) => (
                  <CardVSL
                    key={project.id}
                    project={project}
                    onEditClick={onEditClick}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))
              ) : (
                /* Empty Column Placeholder */
                <div className="h-44 border-2 border-dashed border-slate-800/50 hover:border-slate-700/50 rounded-2xl flex flex-col items-center justify-center text-slate-600 hover:text-slate-500 transition-colors duration-200">
                  <span className="text-xs font-semibold">Nenhuma VSL aqui</span>
                  <button
                    onClick={() => onQuickAdd(col.id)}
                    className="mt-2 text-[10px] font-bold text-violet-400/80 hover:text-violet-400 flex items-center gap-1.5 hover:underline"
                  >
                    <span>+ Criar projeto</span>
                  </button>
                </div>
              )}

              {/* Dropping placeholder overlay guides */}
              {isDraggingOver && activeDragId && (
                <div className="h-28 border-2 border-dashed border-violet-500/30 bg-violet-500/5 rounded-2xl animate-pulse flex items-center justify-center text-[10px] font-bold text-violet-400/80">
                  Solte para mover
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
