import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Scanline } from '../components/Scanline';
import { Noise } from '../components/Noise';
import { BARCODE_URL } from '../constants';
import { QuestionData } from '../types';

export const DailyRecord: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const questionData = (location.state as { question: QuestionData })?.question || {
      text: "Loading System...",
      id: "ERR",
      ticketNum: "0000",
      date: "1970-01-01"
  };
  
  const [input, setInput] = useState("");

  const handleArchive = () => {
    // Check if input is empty and require confirmation
    if (!input.trim()) {
      const confirmSave = window.confirm("什么都没写，确定要存入吗？");
      if (!confirmSave) {
        return;
      }
    }
    
    // In a real app, save to DB here.
    navigate('/archive');
  };

  return (
    <div className="bg-background-dark text-white font-display overflow-hidden flex flex-col items-center justify-center min-h-screen relative w-full h-full">
      <Noise />
      <Scanline />
      
      <div className="relative z-10 flex h-full w-full flex-col bg-[#181611] md:border-x md:border-[#3a3427] shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#3a3427] px-5 py-3 bg-[#181611] z-30 relative shadow-md shrink-0">
          <div className="flex items-center gap-3 text-white">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">terminal</span>
            </button>
            <h2 className="text-[#bbb29b] text-xs font-bold leading-tight tracking-[0.15em] font-mono">VQM // SYSTEM READY</h2>
          </div>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-[#3a3427] rounded-full"></div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto flex flex-col relative px-6 pb-6 pt-0">
           {/* Black bar shadow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-black z-20 shadow-[0_5px_15px_rgba(0,0,0,0.8)]"></div>
          
          {/* Receipt/Ticket */}
          <div className="w-full mx-auto mt-[-4px] mb-8 bg-receipt text-[#181611] p-6 pt-8 shadow-lg animate-slide-in relative z-10 transform origin-top ticket-jagged-bottom">
            {/* Ticket CSS Jagged bottom implementation using mask or pseudo elements */}
            <div className="absolute bottom-[-12px] left-0 w-full h-[12px] bg-transparent"
                 style={{
                     background: `linear-gradient(45deg, #e8e6df 33.333%, transparent 33.333%) 0 0 / 24px 24px repeat-x, linear-gradient(-45deg, #e8e6df 33.333%, transparent 33.333%) 12px 0 / 24px 24px repeat-x`
                 }}
            ></div>

            <div className="flex justify-between items-center border-b-2 border-dashed border-[#181611]/20 pb-2 mb-4">
              <p className="text-[#181611]/60 text-xs font-mono font-bold tracking-widest">TICKET #{questionData.ticketNum}</p>
              <p className="text-[#181611]/60 text-xs font-mono">{questionData.date}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="inline-flex items-center justify-center border-2 border-[#181611] px-2 py-0.5 transform -rotate-1">
                <span className="text-xs font-bold leading-none uppercase tracking-wide">⚡ 脑路短路</span>
              </div>
            </div>
            
            <h2 className="text-[#181611] text-[22px] font-bold leading-[1.3] mb-2 tracking-tight">
              {questionData.text}
            </h2>
            
            <div className="mt-4 flex justify-between items-end opacity-40">
              <div 
                className="h-8 w-32 bg-cover mix-blend-multiply filter grayscale contrast-200" 
                style={{ backgroundImage: `url('${BARCODE_URL}')` }}
              ></div>
              <span className="text-[10px] font-mono">VQM-REF-{questionData.id}</span>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 flex flex-col justify-start w-full gap-4 mt-4">
            <div className="w-full">
              <label className="block text-[#8a8170] text-[10px] font-mono tracking-widest uppercase mb-1.5 pl-1">
                Input Buffer // Write Access
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/0 rounded opacity-0 group-focus-within:opacity-100 transition duration-500 blur"></div>
                <div className="relative bg-surface-dark rounded border border-[#3a3427] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex flex-col">
                  <div className="h-[1px] w-full bg-[#ffffff]/10"></div>
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-transparent border-none text-[#e0e0e0] focus:ring-0 focus:outline-none resize-none min-h-[180px] p-4 text-base font-normal leading-relaxed placeholder:text-[#52525b]" 
                    placeholder="在这里捕捉你的意识火花..."
                  />
                  <div className="flex justify-between items-center px-4 py-2 border-t border-black/20 bg-black/10">
                    <span className="material-symbols-outlined text-[#52525b] text-xs">keyboard</span>
                    <span className="text-[#52525b] text-[10px] font-mono">LN: {input.split('\n').length} COL: {input.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-6 flex flex-col gap-6">
              <button 
                onClick={handleArchive}
                className="w-full bg-black text-white border border-[#3a3427] hover:border-primary hover:text-primary active:bg-[#181611] transition-all duration-200 group relative overflow-hidden py-4 px-6 flex items-center justify-center gap-3 shadow-lg"
              >
                <div className="absolute inset-0 w-1 bg-primary/20 -skew-x-12 translate-x-[-200px] group-hover:translate-x-[500px] transition-transform duration-700 ease-in-out"></div>
                <span className="material-symbols-outlined text-lg">archive</span>
                <span className="font-bold tracking-[0.1em] text-sm uppercase z-10">存入人类思想样本库</span>
              </button>
              
              <div className="flex justify-center pb-4">
                <button 
                    onClick={() => setInput("")}
                    className="text-[#52525b] hover:text-[#bbb29b] text-xs font-mono tracking-wider flex items-center gap-2 transition-colors group" 
                >
                  <span className="material-symbols-outlined text-[14px] group-hover:-rotate-180 transition-transform duration-500">restart_alt</span>
                  <span className="border-b border-transparent group-hover:border-[#bbb29b]">强制重置 (剩余: 1)</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-[#3a3427] bg-[#12110d] px-5 py-2 flex justify-between items-center text-[9px] text-[#4a4438] uppercase font-mono tracking-widest shrink-0">
          <div>Mem: 64MB OK</div>
          <div className="flex items-center gap-2">
            <span>Net: ON</span>
            <span className="block w-1.5 h-1.5 bg-[#2a9134] animate-pulse rounded-full"></span>
          </div>
        </footer>
      </div>
    </div>
  );
};