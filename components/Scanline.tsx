import React from 'react';

export const Scanline: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden h-full w-full">
             <div className="w-full h-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05))] bg-[length:100%_4px] animate-scan" />
        </div>
    );
};
