import * as React from 'react';

// FIX: Defined props interface for type safety.
interface StudioTeleprompterProps {
    script: string;
    isRecording: boolean;
    speed: number;
    fontSize: number;
    isMirrored: boolean;
}

// FIX: Implemented the StudioTeleprompter component with auto-scrolling.
export const StudioTeleprompter: React.FC<StudioTeleprompterProps> = ({ script, isRecording, speed, fontSize, isMirrored }) => {
    const prompterRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!isRecording || !prompterRef.current) return;

        let animationFrameId: number;
        const prompterElement = prompterRef.current;
        
        const scroll = () => {
            // Adjust scroll speed factor
            prompterElement.scrollTop += speed * 0.1; 
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isRecording, speed]);

    React.useEffect(() => {
        // Reset scroll on script change or when recording stops
        if (prompterRef.current) {
            prompterRef.current.scrollTop = 0;
        }
    }, [script, isRecording]);


    return (
        <div 
            ref={prompterRef}
            className="absolute inset-0 bg-black/50 text-white p-10 overflow-y-scroll scroll-smooth"
            style={{
                // Fades the text at the top and bottom for readability
                WebkitMaskImage: 'linear-gradient(transparent, black 25%, black 75%, transparent)',
                maskImage: 'linear-gradient(transparent, black 25%, black 75%, transparent)',
                transform: isMirrored ? 'scaleX(-1)' : 'none',
            }}
        >
            <p 
                className="text-center transition-all duration-300 whitespace-pre-wrap"
                // Add padding to ensure the last lines can scroll to the center
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.5, paddingBottom: '100vh' }}
            >
                {script}
            </p>
        </div>
    );
};