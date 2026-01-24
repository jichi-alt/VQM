import React from 'react';

interface RobotFaceProps {
  isVomiting?: boolean;
}

export const RobotFace: React.FC<RobotFaceProps> = ({ isVomiting = false }) => {
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-black font-black text-2xl mb-6 tracking-widest uppercase font-display">VQM-01 吐题机</h3>
      
      <div className={`mb-8 relative group cursor-pointer transition-transform duration-300 ${isVomiting ? 'animate-shake' : 'hover:scale-105'}`}>
        <div className="w-48 h-48 bg-border-dark relative flex items-center justify-center border-4 border-transparent hover:border-primary transition-colors duration-0">
          <div className="w-40 h-32 bg-background-light border-2 border-dashed border-primary/50 relative overflow-hidden flex flex-col items-center justify-center p-2">
            {/* Scanline inside face */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1))] bg-[length:100%_4px] opacity-20 pointer-events-none"></div>
            
            <div className="flex gap-6 mb-2">
              <div className="w-8 h-8 bg-primary border-2 border-border-dark flex items-center justify-center">
                <div className="w-2 h-2 bg-border-dark animate-pulse"></div>
              </div>
              <div className="w-8 h-8 bg-primary border-2 border-border-dark flex items-center justify-center">
                <div className="w-2 h-2 bg-border-dark animate-pulse"></div>
              </div>
            </div>
            
            {/* Mouth */}
            <div 
                className={`bg-border-dark mt-2 transition-all duration-100 ease-linear ${isVomiting ? 'h-12 w-20' : 'h-1 w-16'}`}
            >
                {isVomiting && <div className="w-full h-full bg-black/80 animate-pulse"></div>}
            </div>
            
            {/* Chin details */}
            <div className={`flex gap-1 mt-1 transition-opacity duration-100 ${isVomiting ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-1 h-2 bg-border-dark"></div>
              <div className="w-1 h-2 bg-border-dark"></div>
              <div className="w-1 h-2 bg-border-dark"></div>
              <div className="w-1 h-2 bg-border-dark"></div>
            </div>
          </div>

          {/* Decor elements */}
          <div className="absolute -top-6 right-8 w-2 h-6 bg-border-dark"></div>
          <div className="absolute -top-8 right-8 w-2 h-2 bg-primary border border-border-dark animate-pulse"></div>
          <div className="absolute -left-1 top-4 w-2 h-2 bg-zinc-300 border border-border-dark"></div>
          <div className="absolute -left-1 bottom-4 w-2 h-2 bg-zinc-300 border border-border-dark"></div>
          <div className="absolute -right-1 top-4 w-2 h-2 bg-zinc-300 border border-border-dark"></div>
          <div className="absolute -right-1 bottom-4 w-2 h-2 bg-zinc-300 border border-border-dark"></div>
        </div>
        
        {/* Shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-2 bg-black/10 blur-sm rounded-[100%]"></div>
      </div>
    </div>
  );
};