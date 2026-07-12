import React from 'react';
import type { VSLProject } from '../types';
import { DollarSign, CheckCircle, TrendingUp, BarChart3, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface RelatoriosProps {
  projects: VSLProject[];
}

// Utility to parse currency string (e.g., "R$ 1.800" -> 1800)
const parseCurrency = (val?: string): number => {
  if (!val) return 0;
  const clean = val.replace(/[R$\s.]/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Utility to format number back as Brazilian Real
const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
};

export const Relatorios: React.FC<RelatoriosProps> = ({ projects }) => {
  // Calculate Entradas, Saídas, and Faturamento
  let totalEntradas = 0;
  let totalSaidas = 0;

  projects.forEach((proj) => {
    const budgetVal = parseCurrency(proj.budget);
    const aiCostVal = proj.requiresAI ? parseCurrency(proj.aiManagerCost) : 0;
    const editorCostVal = parseCurrency(proj.editorCost);
    
    totalEntradas += budgetVal;
    totalSaidas += (aiCostVal + editorCostVal);
  });

  const faturamento = totalEntradas - totalSaidas;

  // Completed projects count
  const completedProjectsCount = projects.filter((p) => p.status === 'done').length;

  // Calculate Referral stats (excluding 'Nenhum')
  const REFERRERS = [
    'Higor Neves',
    'Ferini',
    'Augusto e Geraldo',
    'Gabriel Rebouças',
    'HE',
    'Outros'
  ];

  const referralStats = REFERRERS.map((ref) => {
    let count = 0;
    let totalBudget = 0;
    let totalCommission = 0;

    projects.forEach((p) => {
      if (p.referral === ref) {
        count++;
        const budgetVal = parseCurrency(p.budget);
        totalBudget += budgetVal;
        
        const commPercentage = p.comissionPercentage !== undefined ? p.comissionPercentage : 0;
        const projectCommission = (budgetVal * commPercentage) / 100;
        totalCommission += projectCommission;
      }
    });

    return {
      name: ref,
      count,
      totalBudget,
      totalCommission
    };
  });

  // Group completed projects by month dynamically based on global projects array
  const getCompletedProjectsByMonth = (pList: VSLProject[]) => {
    const monthlyData: { [key: string]: number } = {};
    
    pList.forEach((p) => {
      if (p.status === 'done' && p.dueDate) {
        const monthKey = p.dueDate.slice(0, 7); // e.g. "2026-07"
        if (monthKey.length === 7) {
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        }
      }
    });

    const monthNames: { [key: string]: string } = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };

    return Object.keys(monthlyData)
      .sort((a, b) => b.localeCompare(a))
      .map((key) => {
        const [year, month] = key.split('-');
        const label = `${monthNames[month] || month}/${year}`;
        return {
          label,
          count: monthlyData[key],
          key
        };
      });
  };

  const monthlyProduction = getCompletedProjectsByMonth(projects);
  const maxMonthCount = Math.max(...monthlyProduction.map((m) => m.count), 1);

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#070913]">
      
      {/* Header section */}
      <div className="border-b border-slate-800/40 pb-5">
        <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">
          Visão Financeira & de Operação
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Indicadores financeiros analíticos extraídos em tempo real do período ativo</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ENTRADAS */}
        <div className="p-5 bg-[#0e1322]/80 border border-slate-800/80 rounded-2xl flex flex-col justify-between min-h-[130px] hover:border-slate-700/60 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entradas</span>
              <h4 className="text-xl font-extrabold text-white mt-1.5">{formatCurrency(totalEntradas)}</h4>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-semibold">Orçamentos brutos recebidos</p>
        </div>

        {/* SAÍDAS */}
        <div className="p-5 bg-[#0e1322]/80 border border-slate-800/80 rounded-2xl flex flex-col justify-between min-h-[130px] hover:border-slate-700/60 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saídas</span>
              <h4 className="text-xl font-extrabold text-white mt-1.5">{formatCurrency(totalSaidas)}</h4>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-semibold">Custos de editores e gestão de IA</p>
        </div>

        {/* FATURAMENTO */}
        <div className="p-5 bg-gradient-to-tr from-violet-950/20 to-indigo-950/10 border border-violet-500/20 rounded-2xl flex flex-col justify-between min-h-[130px] shadow-lg shadow-violet-500/5 hover:border-violet-500/40 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Faturamento</span>
              <h4 className="text-xl font-extrabold text-white mt-1.5">{formatCurrency(faturamento)}</h4>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Resultado financeiro líquido</span>
          </div>
        </div>

        {/* PROJETOS CONCLUÍDOS */}
        <div className="p-5 bg-[#0e1322]/80 border border-slate-800/80 rounded-2xl flex flex-col justify-between min-h-[130px] hover:border-slate-700/60 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projetos Concluídos</span>
              <h4 className="text-xl font-extrabold text-white mt-1.5">
                {completedProjectsCount} {completedProjectsCount === 1 ? 'Entrega' : 'Entregas'}
              </h4>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-850">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-semibold">Status "Finalizadas" no período</p>
        </div>
      </div>

      {/* Comissões de Indicação */}
      <div className="p-6 bg-[#0e1322]/80 border border-slate-800/80 rounded-2xl space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-4">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          <div>
            <h4 className="text-sm font-bold text-slate-200">Comissões de Indicação</h4>
            <p className="text-xs text-slate-500 font-medium">Projetos indicados e volume financeiro consolidado por parceiro</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/20 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="p-4 pl-6">Indicador</th>
                <th className="p-4 text-center">Projetos Indicados</th>
                <th className="p-4 text-right">Volume Financeiro Total</th>
                <th className="p-4 text-right pr-6">Comissão Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-semibold text-slate-300">
              {referralStats.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                  <td className="p-4 pl-6 font-bold text-white tracking-wide">{item.name}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.count > 0
                        ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                        : 'bg-slate-950 text-slate-500 border border-slate-850'
                    }`}>
                      {item.count} {item.count === 1 ? 'projeto' : 'projetos'}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-400">
                    {formatCurrency(item.totalBudget)}
                  </td>
                  <td className="p-4 text-right pr-6 font-bold text-emerald-400">
                    {formatCurrency(item.totalCommission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Chart Section */}
      <div className="p-6 bg-[#0e1322]/80 border border-slate-800/80 rounded-2xl">
        <div className="flex items-center gap-2.5 mb-6">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          <div>
            <h4 className="text-sm font-bold text-slate-200">Volume de Produção Mensal</h4>
            <p className="text-xs text-slate-500 font-medium">Quantidade de VSLs concluídas por período filtrado</p>
          </div>
        </div>
        
        {monthlyProduction.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 text-center min-h-[150px]">
            <p className="text-xs text-slate-500 font-semibold text-slate-400">Nenhum dado de produção registrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {monthlyProduction.map((item, index) => {
              const percentage = Math.round((item.count / maxMonthCount) * 100);
              return (
                <div key={index} className="flex items-center gap-4">
                  <span className="w-28 text-xs font-bold text-slate-400">{item.label}</span>
                  <div className="flex-1 h-3 bg-slate-950/60 rounded-full border border-slate-800/50 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.count > 0 ? percentage : 0}%` }}
                    />
                  </div>
                  <span className="w-20 text-xs font-extrabold text-right text-slate-200">
                    {item.count} projeto{item.count !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
