import * as React from 'react';
import { SpeechAnalysis } from '../types';

// FIX: Added type definitions for Web Speech API to resolve TypeScript errors.
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onstart: (() => void) | null;
    start(): void;
    stop(): void;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error:
        | 'no-speech'
        | 'audio-capture'
        | 'not-allowed'
        | 'network'
        | 'aborted'
        | 'language-not-supported'
        | 'service-not-allowed'
        | 'bad-grammar';
    readonly message: string;
}

declare var SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
};

declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}

interface UseSpeechAnalysisProps {
    isRecording: boolean;
}

const FILLER_WORDS = [
    'ah', 'ahm', 'uh', 'um', 'umm', 'er', 'err', 'like', 'so', 'you know', 'actually', 'basically', 'literally'
];

const DYNAMIC_HINTS = [
    '💡 Try varying your pace!',
    '🕺 Time to move a bit!',
    '😄 Remember to smile!',
    '🙌 Use more hand gestures!',
];

export const useSpeechAnalysis = ({ isRecording }: UseSpeechAnalysisProps): SpeechAnalysis => {
    const [analysis, setAnalysis] = React.useState<SpeechAnalysis>({
        wpm: 0,
        fillerWords: 0,
        stammers: 0,
        coachingHint: null,
        isListening: false,
        liveTranscript: '',
        transcriptLog: [], // NEW
    });

    const recognitionRef = React.useRef<SpeechRecognition | null>(null);
    const wordCountRef = React.useRef(0);
    const lastWordTimestampRef = React.useRef(Date.now());
    const hintTimeoutRef = React.useRef<number | null>(null);
    const dynamicHintIntervalRef = React.useRef<number | null>(null);
    const lastWordRef = React.useRef<string>('');
    const fullTranscriptRef = React.useRef('');
    const recordingStartTimeRef = React.useRef<number>(0); // NEW
    const transcriptLogRef = React.useRef<{ text: string, timestamp: number }[]>([]); // NEW


    const isRecordingRef = React.useRef(isRecording);
    React.useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    React.useEffect(() => {
        const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionImpl) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognitionImpl();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setAnalysis(prev => ({ ...prev, isListening: true }));
        };

        recognition.onend = () => {
            setAnalysis(prev => ({ ...prev, isListening: false, wpm: 0 }));
            if (isRecordingRef.current) {
                try {
                    recognition.start();
                } catch (e) {
                    console.error("Error restarting speech recognition:", e);
                }
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
                setAnalysis(prev => ({ ...prev, isListening: false }));
            }
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcriptPart = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    fullTranscriptRef.current += transcriptPart;
                    
                    // NEW: Log the final transcript part with a timestamp
                    const timestamp = performance.now() - recordingStartTimeRef.current;
                    transcriptLogRef.current.push({ text: transcriptPart.trim(), timestamp });
                    
                    const words = transcriptPart.toLowerCase().trim().split(/\s+/).filter(Boolean);
                    let newFillers = 0;
                    let newStammers = 0;

                    words.forEach(word => {
                        if (FILLER_WORDS.includes(word)) {
                            newFillers++;
                        }
                        if (word === lastWordRef.current) {
                            newStammers++;
                        }
                        lastWordRef.current = word;
                    });

                    if (newFillers > 0 || newStammers > 0) {
                        setAnalysis(prev => ({ 
                            ...prev, 
                            fillerWords: prev.fillerWords + newFillers,
                            stammers: prev.stammers + newStammers
                        }));
                    }

                    const now = Date.now();
                    const timeDiffMinutes = (now - lastWordTimestampRef.current) / 60000;
                    wordCountRef.current += words.length;

                    if (timeDiffMinutes > 0) {
                        const wpm = Math.round(wordCountRef.current / timeDiffMinutes);
                        setAnalysis(prev => ({...prev, wpm}));
                    }

                } else {
                    interimTranscript += transcriptPart;
                }
            }
            setAnalysis(prev => ({
                ...prev, 
                liveTranscript: fullTranscriptRef.current + interimTranscript,
                transcriptLog: [...transcriptLogRef.current] // Update state with the log
            }));
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
            if (dynamicHintIntervalRef.current) clearInterval(dynamicHintIntervalRef.current);
        };
    }, []);

    React.useEffect(() => {
        const recognition = recognitionRef.current;
        if (recognition) {
            if (isRecording) {
                try {
                    recognition.start();
                } catch(e) {
                    console.error("Could not start recognition:", e);
                }
                wordCountRef.current = 0;
                lastWordTimestampRef.current = Date.now();
                fullTranscriptRef.current = '';
                transcriptLogRef.current = []; // NEW: Reset log
                recordingStartTimeRef.current = performance.now(); // NEW: Set start time
                setAnalysis(prev => ({...prev, fillerWords: 0, stammers: 0, wpm: 0, liveTranscript: '', transcriptLog: []}));
                lastWordRef.current = '';

                dynamicHintIntervalRef.current = window.setInterval(() => {
                    const hint = DYNAMIC_HINTS[Math.floor(Math.random() * DYNAMIC_HINTS.length)];
                    setAnalysis(prev => ({...prev, coachingHint: hint}));
                    if(hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
                    hintTimeoutRef.current = window.setTimeout(() => {
                        setAnalysis(prev => ({...prev, coachingHint: null}));
                    }, 4000);
                }, 20000);

            } else {
                recognition.stop();
                if (dynamicHintIntervalRef.current) {
                    clearInterval(dynamicHintIntervalRef.current);
                    dynamicHintIntervalRef.current = null;
                }
                if (hintTimeoutRef.current) {
                    clearTimeout(hintTimeoutRef.current);
                    hintTimeoutRef.current = null;
                }
                setAnalysis(prev => ({...prev, coachingHint: null, isListening: false, liveTranscript: ''}));
            }
        }
    }, [isRecording]);

    return analysis;
};