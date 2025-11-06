import * as React from 'react';
import { SpeechAnalysis } from '../../types';

interface SpeechCoachProps {
    analysis: SpeechAnalysis;
}

export const SpeechCoach: React.FC<SpeechCoachProps> = ({ analysis }) => {
    const { wpm, fillerWords, stammers, isListening } = analysis;

    return (
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg space-y-4">
            <h3 className="font-bold text-lg text-gray-200">Real-time Delivery Coach</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{wpm}</div>
                    <div className="text-xs text-gray-400">Words / Min</div>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                     <div className="text-2xl font-bold text-cyan-400">{fillerWords}</div>
                    <div className="text-xs text-gray-400">Filler Words</div>
                </div>
                 <div className="bg-gray-700/50 p-3 rounded-lg">
                     <div className="text-2xl font-bold text-cyan-400">{stammers}</div>
                    <div className="text-xs text-gray-400">Stammers</div>
                </div>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-400 gap-2 pt-2">
                 <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
                 <span>{isListening ? 'Listening for feedback...' : 'Paused'}</span>
            </div>
        </div>
    );
};