
import React from 'react';
import { ToolType } from '../types';

interface SidebarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  isLoggedIn: boolean;
  balance: number;
  onLogin: () => void;
  userProfile?: { name: string; email: string; initials: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool, isLoggedIn, balance, onLogin, userProfile }) => {
  const tools = [
    { id: ToolType.CHAT, label: 'Chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: ToolType.IMAGE, label: 'Image Forge', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: ToolType.VIDEO, label: 'Motion Lab', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: ToolType.VOICE, label: 'Live Link', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { id: ToolType.PROFIT, label: 'Profit Hub', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.67-1M12 16v1m4-12V3m0 18v-2M4 5V3m0 18v-2' },
  ];

  return (
    <aside className="w-64 glass flex flex-col h-screen p-4 border-r border-slate-700/50">
      <div className="mb-8 px-2">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent tracking-tight">
          ChatAi
        </h1>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">Earn</span>
          <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">& Create</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTool === tool.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-900/10'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
              </svg>
              <span className="font-medium">{tool.label}</span>
            </div>
            {tool.id === ToolType.PROFIT && (
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse group-hover:scale-125 transition-transform" />
            )}
          </button>
        ))}
      </nav>

      {/* Wallet Section */}
      <div className="mb-4 px-2">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/50 shadow-inner">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Live Balance</p>
          <div className="flex items-end space-x-1">
            <span className="text-xl font-black text-white">${balance.toFixed(2)}</span>
            <span className="text-[10px] text-green-500 font-bold mb-1">USD</span>
          </div>
          {!isLoggedIn && (
            <button 
              onClick={onLogin}
              className="w-full mt-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-[10px] font-black uppercase tracking-tighter rounded-lg border border-indigo-500/20 transition-all"
            >
              Verify Gmail to Withdraw
            </button>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-700/50 px-2">
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/50">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
            isLoggedIn ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
          }`}>
            {isLoggedIn ? userProfile?.initials : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">
              {isLoggedIn ? userProfile?.name : 'Guest User'}
            </p>
            <p className="text-[9px] text-slate-500 truncate uppercase tracking-tighter">
              {isLoggedIn ? userProfile?.email : 'Unverified Account'}
            </p>
          </div>
          {isLoggedIn && (
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Verified" />
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
