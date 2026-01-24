import React from 'react';
import { NOISE_SVG } from '../constants';

export const Noise: React.FC = () => {
    return (
        <div 
            className="fixed inset-0 pointer-events-none z-0 mix-blend-overlay opacity-40"
            style={{ backgroundImage: `url("${NOISE_SVG}")` }}
        />
    );
};
