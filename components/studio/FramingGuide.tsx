// components/studio/FramingGuide.tsx
import * as React from 'react';

export const FramingGuide: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* A single rounded rectangle for torso framing */}
            <div 
                style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    width: '85%', 
                    height: '90%',
                }}
                className="border-2 border-dashed border-white/30 rounded-3xl"
            ></div>
        </div>
    );
};