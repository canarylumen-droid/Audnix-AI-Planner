// components/studio/StudioTeleprompter.tsx
import * as React from 'react';
import { SpeechAnalysis, StudioSettings } from '../../types';

interface StudioTeleprompterProps {
    script: string;
    settings: StudioSettings['teleprompter'];
    speechAnalysis: SpeechAnalysis;
    isRecording: boolean;
}

export const StudioTeleprompter: React.FC<StudioTeleprompterProps> = ({ script, settings, speechAnalysis, isRecording }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const scriptWords = React.useMemo(() => script.split(/(\s+)/), [script]);

    React.useEffect(() => {
        if (!isRecording || !containerRef.current) return;
        
        const spokenWords = speechAnalysis.liveTranscript.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const spokenWordCount = spokenWords.length;
        
        const lookaheadIndex = Math.min(
            scriptWords.filter(w => w.trim() !== '').length - 1,
            spokenWordCount + settings.lookahead
        );

        let wordCounter = -1;
        let targetElementIndex = -1;
        for(let i=0; i < scriptWords.length; i++) {
            if (scriptWords[i].trim() !== '') {
                wordCounter++;
            }
            if(wordCounter === lookaheadIndex) {
                targetElementIndex = i;
                break;
            }
        }
        
        if (targetElementIndex !== -1) {
             const targetWord = containerRef.current.querySelector(`[data-word-index='${targetElementIndex}']`);
             if (targetWord) {
                 targetWord.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }
        }

    }, [speechAnalysis.liveTranscript, settings.lookahead, scriptWords, isRecording]);

    const getHighlightedText = () => {
        const spokenWords = speechAnalysis.liveTranscript.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const spokenWordCount = spokenWords.length;
        
        let wordCounter = 0;
        return scriptWords.map((word, index) => {
            const isSpoken = word.trim() !== '' && wordCounter < spokenWordCount;
            if (word.trim() !== '') {
                wordCounter++;
            }

            return (
                <span
                    key={index}
                    data-word-index={index}
                    className={isSpoken && isRecording ? 'text-gray-500' : 'text-inherit'}
                >
                    {word}
                </span>
            );
        });
    };

    return (
        <div className="h-full bg-gray-900/80 rounded-lg overflow-hidden flex flex-col">
            <div 
                ref={containerRef}
                className="flex-grow w-full py-24 px-8 overflow-y-scroll scroll-smooth"
                style={{
                    backgroundColor: `rgba(0, 0, 0, ${settings.opacity})`,
                    color: settings.textColor,
                    fontSize: `${settings.fontSize}px`,
                    transform: settings.isMirrored ? 'scaleX(-1)' : 'none',
                }}
            >
                <div 
                    className="leading-loose font-bold text-center"
                    style={{
                        transform: settings.isMirrored ? 'scaleX(-1)' : 'none',
                    }}
                >
                    {getHighlightedText()}
                </div>
            </div>
        </div>
    );
};
