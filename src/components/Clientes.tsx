import React from 'react';
import type { VSLProject } from '../types';
import { Users } from 'lucide-react';

interface ClientesProps {
  projects: VSLProject[];
}

// Utility to parse budget string (e.g. "R$ 1.500") into float
const parseCurrency = (val?: string): number => {
  if (!val) return 0;
  const clean = val.replace(/[R$\s.]/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Utility to format number back as Brazilian Real BRL
const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
};

export const Clientes: React.FC<ClientesProps> = ({ projects }) => {
  // Extract clients from global projects list
  const clientMap: { [name: string]: { activeCount: number; totalBudget: number; totalProjects: number } } = {};

  projects.forEach((proj) => {
    const client = proj.clientName.trim();
    if (!clientMap[client]) {
      clientMap[client] = { activeCount: 0, totalBudget: 0, totalProjects: 0 };
    }
    
    clientMap[client].totalProjects += 1;
    
    if (proj.status !== 'done') {
      clientMap[client].activeCount += 1;
    }
    
    clientMap[client].totalBudget += parseCurrency(proj.budget);
  });

  const clients = Object.keys(clientMap).map((name) => ({
    name,
    activeCount: clientMap[name].activeCount,
    totalBudget: clientMap[name].totalBudget,
    totalProjects: clientMap[name].totalProjects,
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#070913]">
      {/* Tab Header */}
      <div className="border-b border-slate-800/40 pb-5">
        <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">
          Gestão de Clientes
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Lista de contas ativas e resumo financeiro derivado do portfólio</p>
      </div>

      {clients.length > 0 ? (
        <div className="bg-[#0e1322]/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="p-5 pl-8">Cliente</th>
                  <th className="p-5">Projetos Ativos</th>
                  <th className="p-5">Total de Projetos</th>
                  <th className="p-5">Total Investido</th>
                  <th className="p-5">Status da Fila</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-350">
                {clients.map((cli, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                    <td className="p-5 pl-8 font-bold text-white tracking-wide">{cli.name}</td>
                    <td className="p-5">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {cli.activeCount} ativo{cli.activeCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="p-5 text-slate-400">{cli.totalProjects} projeto{cli.totalProjects !== 1 ? 's' : ''}</td>
                    <td className="p-5 font-bold text-violet-400">{formatCurrency(cli.totalBudget)}</td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cli.activeCount === 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cli.activeCount === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {cli.activeCount === 0 ? 'Fila Concluída' : 'Em Andamento'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-3xl bg-[#0e1322]/20 min-h-[350px] text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-5">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-300">Nenhum cliente com projetos</h4>
          <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
            Assim que você criar novos projetos VSL associados a clientes, eles serão exibidos automaticamente nesta listagem com o balanço consolidado.
          </p>
        </div>
      )}
    </div>
  );
};
