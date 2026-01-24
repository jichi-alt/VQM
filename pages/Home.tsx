import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RobotFace } from '../components/RobotFace';
import { SVG_DOTS, SVG_GRID } from '../constants';
import { generatePhilosophicalQuestion } from '../services/geminiService';
import { QuestionData } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSpitQuestion = async () => {
    setIsLoading(true);
    
    // Wait for both the API call and a minimum animation duration of 1.5s
    const [questionData] = await Promise.all([
      generatePhilosophicalQuestion(),
      new Promise<void>((resolve) => setTimeout(resolve, 1500))
    ]);

    setIsLoading(false);
    navigate('/record', { state: { question: questionData } });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-background-light text-border-dark overflow-hidden font-display">
      {/* Header */}
      <header className="flex items-center justify-between border-b-4 border-border-dark px-4 py-3 bg-background-light relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-border-dark text-xl">radar</span>
          <h2 className="text-border-dark text-sm font-bold tracking-wider uppercase">VQM 观测站</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 h-3 items-end">
            <div className="w-1 h-1 bg-border-dark"></div>
            <div className="w-1 h-2 bg-border-dark"></div>
            <div className="w-1 h-3 bg-border-dark"></div>
          </div>
          <div className="bg-primary px-1.5 py-0.5 text-[10px] font-bold border border-border-dark">V.1.0</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Decor Corners */}
        <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-border-dark opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-border-dark opacity-30 pointer-events-none"></div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-6 pb-6 w-full">
          <RobotFace isVomiting={isLoading} />

          <div className="w-full max-w-[280px] border border-dashed border-border-dark/40 bg-white/50 p-2 mb-8 text-center backdrop-blur-sm">
            <p className="font-mono text-xs text-border-dark font-bold tracking-wide">
              STATUS: <span className="text-emerald-700 animate-pulse">{isLoading ? "正在生成..." : "正在等待输入..."}</span>
            </p>
          </div>

          <div className="text-left w-full mb-6 relative pl-4">
            <h1 className="text-border-dark text-5xl font-black leading-[0.9] tracking-tighter uppercase mb-2">
              人类，<br />
              今天<span className="bg-primary/30 px-1">思考了吗？</span>
            </h1>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div 
            className="w-full px-6 pb-8 pt-4 border-t-4 border-border-dark relative"
            style={{ backgroundImage: `url('${SVG_DOTS}')` }}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-hazard-stripe border-b-2 border-border-dark"></div>
          
          <button 
            onClick={handleSpitQuestion}
            disabled={isLoading}
            className="group w-full relative h-16 bg-primary border-4 border-border-dark shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 flex items-center justify-between px-6 overflow-hidden hover:brightness-110 disabled:grayscale"
          >
            <div 
                className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                style={{ backgroundImage: `url('${SVG_GRID}')` }}
            />
            <span className="relative z-10 text-border-dark text-xl font-black tracking-widest uppercase group-hover:underline decoration-4 underline-offset-4">
              {isLoading ? "CALCULATING..." : "吐一个问题"}
            </span>
            <span className="relative z-10 bg-border-dark text-primary p-1">
              <span className="material-symbols-outlined text-xl block">arrow_forward</span>
            </span>
          </button>

          <div className="flex justify-between items-center mt-4">
            <span className="text-[10px] font-mono text-border-dark/60">ID: 843-92-X</span>
            <span className="text-[10px] font-mono text-border-dark/60 uppercase">System Ready</span>
          </div>

          <div className="flex justify-center mt-2">
             <button onClick={() => navigate('/archive')} className="text-xs font-mono underline decoration-dotted text-border-dark/70 hover:text-border-dark">
                View Archive >
             </button>
          </div>
        </div>
      </main>

      {/* Decorative Screws */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-border-dark flex items-center justify-center bg-gray-300 z-20"><div className="w-1.5 h-[1px] bg-border-dark rotate-45"></div></div>
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-border-dark flex items-center justify-center bg-gray-300 z-20"><div className="w-1.5 h-[1px] bg-border-dark rotate-45"></div></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-border-dark flex items-center justify-center bg-gray-300 z-20"><div className="w-1.5 h-[1px] bg-border-dark rotate-45"></div></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-border-dark flex items-center justify-center bg-gray-300 z-20"><div className="w-1.5 h-[1px] bg-border-dark rotate-45"></div></div>
    </div>
  );
};