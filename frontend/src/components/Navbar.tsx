import React from 'react';
import { 
  Zap, 
  Layers, 
  Truck, 
  Flame, 
  ShieldCheck, 
  Leaf, 
  Activity, 
  Cpu,
  Building2
} from 'lucide-react';
import type { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  tokenBalance: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  activeTab,
  onSelectTab,
  tokenBalance
}) => {
  const roles: { id: UserRole; label: string; icon: any; color: string }[] = [
    { id: 'KITCHEN', label: 'Kitchen / Producer', icon: Layers, color: 'text-emerald-400 border-emerald-500/40' },
    { id: 'DRIVER', label: 'Fleet Driver', icon: Truck, color: 'text-amber-400 border-amber-500/40' },
    { id: 'PLANT_OPERATOR', label: 'Biogas Operator', icon: Flame, color: 'text-cyan-400 border-cyan-500/40' },
    { id: 'ADMIN', label: 'ESG / SuperAdmin', icon: ShieldCheck, color: 'text-purple-400 border-purple-500/40' }
  ];

  const navItems = [
    { id: 'producers', label: 'Restaurants & Companies', icon: Building2 },
    { id: 'vision', label: 'AI CV Contamination', icon: Cpu },
    { id: 'bmp', label: 'BMP & Carbon Math', icon: Leaf },
    { id: 'copilot', label: 'RAG Biogas Copilot', icon: Zap },
    { id: 'logistics', label: 'Multi-Party Logistics', icon: Truck },
    { id: 'scada', label: 'Digester SCADA', icon: Flame },
    { id: 'esg', label: 'Carbon Ledger & Tokens', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('vision')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <Zap className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  BIOWASTE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">NEURAL-GRID</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-mono">
                  v2.4 AD-AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Autonomous Commercial Food Waste Diversion to Anaerobic Digestion
              </p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-2 hidden lg:inline font-mono">
              Perspective:
            </span>
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRole(r.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? `bg-slate-800 text-white shadow-md border ${r.color}`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? r.color.split(' ')[0] : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* ESG Token Ticker */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
              <Leaf className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-emerald-400/80 font-mono leading-none">GREEN ENERGY TOKENS</div>
                <div className="text-sm font-bold font-mono text-emerald-300 leading-tight">
                  {tokenBalance.toFixed(2)} <span className="text-[10px] font-normal text-emerald-400/70">GET</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/50 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
