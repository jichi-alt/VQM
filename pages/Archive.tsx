import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_ARCHIVE } from '../constants';

export const Archive: React.FC = () => {
    const navigate = useNavigate();

  return (
    <div className="bg-background-dark text-white font-display min-h-screen overflow-x-hidden selection:bg-primary selection:text-black w-full">
      <div className="relative flex min-h-screen w-full flex-col items-center pt-0 md:pt-8 pb-12 px-0 md:px-4 bg-background-dark bg-[linear-gradient(to_right,#3f3f4620_1px,transparent_1px),linear-gradient(to_bottom,#3f3f4620_1px,transparent_1px)] bg-[size:40px_40px]">
        
        <div className="w-full max-w-[800px] border-x-0 md:border-2 border-border-dark bg-[#0f1012] shadow-2xl relative flex flex-col h-full md:h-auto min-h-screen md:min-h-0">
          <div className="h-2 w-full bg-hazard-stripe opacity-80 border-b border-border-dark"></div>
          
          <header className="flex flex-col border-b border-border-dark bg-surface-dark/50">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border-dark border-dashed">
              <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                <h2 className="text-primary text-sm font-bold tracking-widest uppercase">VQM // SYSTEM</h2>
              </button>
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">SYS: ONLINE</span>
                </span>
                <span className="hidden sm:inline">MEM: 84%</span>
                <span>LATENCY: 12ms</span>
              </div>
            </div>
            
            <div className="px-6 py-8 flex flex-col gap-2">
              <div className="flex justify-between items-end flex-wrap gap-4">
                <div>
                  <p className="text-zinc-500 text-xs font-mono tracking-widest mb-1">MODULE: HISTORY_LOG</p>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white uppercase">
                    人类思想样本库
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-8 px-3 border border-border-dark bg-transparent text-zinc-400 hover:text-primary hover:border-primary transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">filter_list</span>
                    Filter
                  </button>
                  <button className="h-8 px-3 border border-border-dark bg-transparent text-zinc-400 hover:text-primary hover:border-primary transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Export
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Search */}
          <div className="px-6 py-6 bg-[#0f1012]">
            <label className="group flex flex-col w-full">
              <div className="flex w-full items-stretch h-14 border border-border-dark group-focus-within:border-primary transition-colors">
                <div className="text-zinc-500 group-focus-within:text-primary flex bg-surface-dark/30 items-center justify-center pl-4 pr-2 border-r border-border-dark border-dashed">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input 
                  className="flex w-full min-w-0 flex-1 resize-none bg-transparent text-white focus:outline-0 focus:ring-0 border-none h-full placeholder:text-zinc-600 px-4 font-mono text-base" 
                  placeholder="检索意识碎片..." 
                />
                <div className="flex items-center pr-2">
                  <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono text-zinc-500 bg-zinc-900 border border-border-dark rounded-sm">CTRL+K</kbd>
                </div>
              </div>
            </label>
          </div>

          {/* List */}
          <div className="flex flex-col flex-1 min-h-[400px]">
            <div className="hidden sm:flex items-center px-6 py-2 border-y border-border-dark bg-surface-dark/20 text-xs text-zinc-500 font-mono uppercase tracking-wider">
              <div className="w-32">Date</div>
              <div className="w-40">Tag</div>
              <div className="flex-1">Question Subject</div>
              <div className="w-24 text-right">Count</div>
            </div>

            <div className="flex flex-col">
              {MOCK_ARCHIVE.map((item) => (
                <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-6 py-4 border-b border-border-dark border-dashed hover:bg-surface-dark/40 hover:border-solid transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                    <div className="w-32 shrink-0 font-mono text-zinc-500 text-sm group-hover:text-primary transition-colors">{item.date}</div>
                    <div className="w-40 shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-300">
                        <span>{item.tagIcon}</span> {item.tag}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-base font-bold leading-normal truncate group-hover:text-primary transition-colors">{item.question}</p>
                    </div>
                    <div className="w-full sm:w-24 shrink-0 flex items-center sm:justify-end justify-between sm:gap-0 mt-1 sm:mt-0">
                        <span className="sm:hidden text-xs text-zinc-600 font-mono">COUNT:</span>
                        <span className="text-primary font-mono text-sm font-bold bg-primary/10 px-2 py-0.5 border border-primary/20 rounded-sm">{item.count} 份样本</span>
                    </div>
                </div>
              ))}
              
              <div className="flex flex-col items-center justify-center p-8 text-zinc-700 gap-2 border-b border-border-dark border-dashed bg-surface-dark/10">
                <span className="material-symbols-outlined text-2xl">more_horiz</span>
                <span className="text-xs font-mono">END OF LOG</span>
              </div>
            </div>
          </div>

          {/* Footer Pagination */}
          <div className="border-t border-border-dark p-4 bg-surface-dark/50 flex items-center justify-between">
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center border border-border-dark bg-[#0f1012] hover:border-primary hover:text-primary text-zinc-400 disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center border border-primary bg-primary text-black font-bold font-mono text-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center border border-border-dark bg-[#0f1012] hover:border-primary hover:text-primary text-zinc-400 font-mono text-sm">2</button>
              <button className="w-8 h-8 flex items-center justify-center border border-border-dark bg-[#0f1012] hover:border-primary hover:text-primary text-zinc-400 font-mono text-sm">3</button>
              <span className="w-8 h-8 flex items-center justify-center text-zinc-600">...</span>
              <button className="w-8 h-8 flex items-center justify-center border border-border-dark bg-[#0f1012] hover:border-primary hover:text-primary text-zinc-400">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
            <div className="text-xs text-zinc-500 font-mono tracking-wider hidden sm:block">
              DISPLAYING 1-5 OF 128 FRAGMENTS
            </div>
          </div>
          
          <div className="h-1 w-full bg-zinc-800 flex">
            <div className="h-full w-1/4 bg-zinc-700"></div>
            <div className="h-full w-1/12 bg-primary"></div>
            <div className="h-full w-full bg-zinc-800"></div>
          </div>
        </div>

        <div className="fixed bottom-8 right-8 z-10">
          <button onClick={() => navigate('/record')} className="group flex items-center justify-center w-14 h-14 bg-primary text-black shadow-hard hover:shadow-hard-sm hover:translate-y-[2px] hover:translate-x-[2px] transition-all border-2 border-transparent">
            <span className="material-symbols-outlined text-[28px]">add</span>
          </button>
        </div>

      </div>
    </div>
  );
};
