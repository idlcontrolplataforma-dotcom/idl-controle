import React from 'react';
import { Edit3, Clock, DollarSign, AlertCircle } from 'lucide-react';
import type { VSLProject } from '../types';

interface CardVSLProps {
  project: VSLProject;
  onEditClick: (project: VSLProject) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
}

// Map priority values to premium color themes
const priorityStyles = {
  low: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  high: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

// Check if a date (format DD/MM/YYYY) is before today and not completed (done)
const isCardOverdue = (prazoFinalStr: string, status: string) => {
  if (status === 'done') return false;
  
  // Parse DD/MM/YYYY
  const parts = prazoFinalStr.split('/');
  if (parts.length !== 3) return false;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  
  const dueDate = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today;
};

// Convert Date from YYYY-MM-DD to DD/MM/YYYY for presentation
const formatDateStr = (dateStr: string) => {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// Function to generate initials-based gradient avatars
const getAvatarGradient = (name: string) => {
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export const CardVSL: React.FC<CardVSLProps> = ({
  project,
  onEditClick,
  onDragStart,
  onDragEnd,
}) => {
  const prazoFinal = formatDateStr(project.dueDate);
  const isOverdue = isCardOverdue(prazoFinal, project.status);
  const initials = project.editor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', project.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(project.id);
  };

  const handleDragEnd = () => {
    if (onDragEnd) onDragEnd();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative p-5 rounded-2xl cursor-pointer select-none transition-all duration-300 hover:scale-[1.015] hover:shadow-xl hover:shadow-violet-950/10 active:cursor-grabbing active:scale-[0.98] active:opacity-70 ${
        isOverdue
          ? 'border border-red-500 bg-red-950/20 hover:bg-red-950/30 hover:border-red-400'
          : 'bg-[#121829] hover:bg-[#161d33] border border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Glow highlight on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Overdue Alert Badge */}
      {isOverdue && (
        <div className="bg-red-600 text-white font-bold px-2 py-1 rounded text-xs uppercase w-full text-center mb-2 flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/20 border border-red-500/35">
          <span>⚠️</span>
          <span>PROJETO ATRASADO</span>
        </div>
      )}

      {/* Top Details & Priority / Settings */}
      <div className="flex justify-between items-start gap-4">
        {/* Client Name & Category */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-violet-400 tracking-wider uppercase">
            {project.clientName}
          </span>
          {project.category && (
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {project.category}
            </span>
          )}
        </div>

        {/* Priority Badge & Settings */}
        <div className="flex items-center gap-2">
          {project.requiresAI && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/35 shadow-[0_0_10px_rgba(168,85,247,0.15)] flex items-center gap-1">
              <span>🤖</span>
              <span>Gestão de IA</span>
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityStyles[project.priority]}`}>
            {project.priority === 'high' ? 'Alta' : project.priority === 'medium' ? 'Média' : 'Baixa'}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(project);
            }}
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all duration-200"
            title="Editar VSL"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title & Theme */}
      <div className="mt-3.5">
        <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors duration-200 line-clamp-1">
          {project.title}
        </h4>
        {project.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-medium leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Extra Info: Budget and Duration */}
      {(project.budget || project.duration) && (
        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500 border-t border-slate-800/40 pt-3">
          {project.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <span>{project.duration} min</span>
            </div>
          )}
          {project.budget && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-600" />
              <span>{project.budget}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer: Editor Badge & Due Date */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-800/40 pt-3">
        {/* Editor Badge */}
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${getAvatarGradient(project.editor.name)} flex items-center justify-center text-white text-[10px] font-bold shadow-sm shadow-indigo-500/10`}>
            {initials}
          </div>
          <span className="text-xs font-medium text-slate-300">
            {project.editor.name}
          </span>
        </div>

        {/* Entry & Due Dates */}
        <div className="flex flex-col items-end gap-1 font-sans">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <span>Entrada:</span>
            <span className="text-slate-400 font-bold">{formatDateStr(project.startDate)}</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
            isOverdue
              ? 'text-red-500 bg-red-950/40 border-red-500/50 animate-pulse'
              : 'text-slate-400 bg-slate-900/60 border-slate-800/80'
          }`}>
            {isOverdue && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
            <span>Prazo: {prazoFinal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
