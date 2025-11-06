import * as React from 'react';
import { StudioSettings } from '../../types';

interface StudioTeleprompterProps {
    script: string;
    liveTranscript: string;
    settings: StudioSettings['teleprompter'];
}

// Function to clean up text for better matching
const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
};

export const StudioTeleprompter: React.FC<StudioTeleprompterProps> = ({ script, liveTranscript, settings }) => {
    const { fontSize, isMirrored, opacity, textColor, lookahead } = settings;
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // NEW: Refs for custom smooth scrolling animation
    const targetScrollTopRef = React.useRef(0);
    const animationFrameRef = React.useRef<number>();
    const scrollActiveRef = React.useRef(false);


    // Memoize the normalized script words for efficient searching
    const normalizedScriptWords = React.useMemo(() => {
        return normalizeText(script).split(/\s+/).filter(Boolean);
    }, [script]);
    
    // Memoize the original script words for display
    const displayWords = React.useMemo(() => {
        return script.split(/\s+/).filter(Boolean);
    }, [script]);

    const spokenWordIndex = React.useMemo(() => {
        const transcriptWords = normalizeText(liveTranscript).split(/\s+/).filter(Boolean);
        if (transcriptWords.length === 0) return -1;

        // Try to match the last 1 to 5 words of the transcript within the script
        for (let i = Math.min(5, transcriptWords.length); i > 0; i--) {
            const phraseToMatch = transcriptWords.slice(-i).join(' ');
            const scriptStr = normalizedScriptWords.join(' ');
            
            const lastIndex = scriptStr.lastIndexOf(phraseToMatch);
            if (lastIndex !== -1) {
                // Find the word index corresponding to the end of the match
                const wordsBefore = scriptStr.substring(0, lastIndex + phraseToMatch.length).split(/\s+/).filter(Boolean);
                return wordsBefore.length - 1;
            }
        }
        return -1;
    }, [liveTranscript, normalizedScriptWords]);

    // NEW: Animation loop function for smooth scrolling
    const animateScroll = React.useCallback(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) {
            scrollActiveRef.current = false;
            return;
        }

        const currentScrollTop = scrollContainer.scrollTop;
        const targetScrollTop = targetScrollTopRef.current;
        const delta = targetScrollTop - currentScrollTop;

        if (Math.abs(delta) < 1) {
            // Reached the target, snap to it and stop the loop
            scrollContainer.scrollTop = targetScrollTop;
            scrollActiveRef.current = false;
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        } else {
            // Continue animating with easing
            const newScrollTop = currentScrollTop + delta * 0.1; // Easing factor
            scrollContainer.scrollTop = newScrollTop;
            animationFrameRef.current = requestAnimationFrame(animateScroll);
        }
    }, []);


    // This effect updates the target scroll position and kicks off the animation loop.
    React.useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (spokenWordIndex === -1 || !scrollContainer) return;
        
        const targetWordIndex = Math.min(
            spokenWordIndex + lookahead,
            displayWords.length - 1
        );

        const activeWordElement = scrollContainer.querySelector(`[data-word-index='${targetWordIndex}']`) as HTMLElement;

        if (activeWordElement) {
            const newTarget = activeWordElement.offsetTop - (scrollContainer.clientHeight * 0.3);
            targetScrollTopRef.current = newTarget;
            
            // Start the animation loop if it's not already running
            if (!scrollActiveRef.current) {
                scrollActiveRef.current = true;
                animationFrameRef.current = requestAnimationFrame(animateScroll);
            }
        }
    }, [spokenWordIndex, lookahead, displayWords.length, animateScroll]);
    
    // NEW: Cleanup effect for the animation frame
    React.useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }
    }, []);


    return (
        <div
            ref={scrollContainerRef}
            className="absolute bottom-0 left-0 right-0 h-[30%] p-6 overflow-y-scroll select-none"
            style={{
                backgroundColor: `rgba(0, 0, 0, ${opacity})`,
                transform: isMirrored ? 'scaleX(-1)' : 'none',
                WebkitMaskImage: 'linear-gradient(transparent, black 20%, black 80%, transparent)',
                maskImage: 'linear-gradient(transparent, black 20%, black 80%, transparent)',
                scrollbarWidth: 'none',
            }}
        >
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            <div
                className="text-center transition-all duration-300 whitespace-pre-wrap no-scrollbar"
                style={{
                    paddingTop: '30vh', // Padding to allow first words to be positioned correctly
                    paddingBottom: '30vh', // Padding to allow last words to be positioned correctly
                    transform: isMirrored ? 'scaleX(-1)' : 'none', // Counter-mirror the text
                }}
            >
                {displayWords.map((word, index) => {
                    const isSpoken = index <= spokenWordIndex;
                    const isCurrent = index === spokenWordIndex;
                    return (
                        <span
                            key={index}
                            data-word-index={index}
                            style={{
                                fontSize: `${fontSize}px`,
                                lineHeight: 1.5,
                                color: isSpoken ? textColor : `rgba(255, 255, 255, 0.4)`,
                                transition: 'color 0.3s, background-color 0.3s, transform 0.3s ease-in-out',
                                backgroundColor: isCurrent ? 'rgba(0, 255, 255, 0.25)' : 'transparent',
                                transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                                padding: '0.05em 0.2em',
                                borderRadius: '0.25rem',
                                display: 'inline-block'
                            }}
                        >
                            {word}&nbsp;
                        </span>
                    );
                })}
            </div>
        </div>
    );
};
