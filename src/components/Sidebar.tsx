import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  BarChart3, 
  FolderKanban, 
  Film
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'editores', label: 'Editores', icon: UserSquare2 },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'projetos', label: 'Projetos', icon: FolderKanban },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0e1322] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              IDL CONTROL
            </h1>
            <p className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase">
              Production Control
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/25 to-indigo-500/10 text-violet-300 border-l-4 border-violet-500 shadow-md shadow-violet-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Connection Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0b0e1a]/80">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
          <span>v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};
