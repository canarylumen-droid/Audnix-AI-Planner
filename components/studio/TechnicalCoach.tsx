// components/studio/TechnicalCoach.tsx
import * as React from 'react';
import { TechnicalAnalysis } from '../../types';

interface TechnicalCoachProps {
    analysis: TechnicalAnalysis;
}

const FeedbackItem: React.FC<{ label: string; status: 'good' | 'low' | 'clipping' | 'dark' | 'bright' }> = ({ label, status }) => {
    const getStatusInfo = () => {
        switch (status) {
            case 'good':
                return { text: 'Good', color: 'text-green-400', hint: '' };
            case 'low':
                return { text: 'Too Low', color: 'text-yellow-400', hint: 'Speak up or move closer to the mic.' };
            case 'clipping':
                return { text: 'Clipping!', color: 'text-red-400', hint: 'Move back from the mic or lower input.' };
            case 'dark':
                return { text: 'Too Dark', color: 'text-yellow-400', hint: 'Add more light in front of you.' };
            case 'bright':
                return { text: 'Too Bright', color: 'text-yellow-400', hint: 'Reduce light or move it away.' };
            default:
                return { text: '', color: '' };
        }
    };
    
    const { text, color, hint } = getStatusInfo();

    return (
        <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-400">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{text}</div>
            {status !== 'good' && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
        </div>
    );
};

export const TechnicalCoach: React.FC<TechnicalCoachProps> = ({ analysis }) => {
    return (
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg space-y-4">
             <h3 className="font-bold text-lg text-gray-200">Real-time Technical Coach</h3>
             <div className="grid grid-cols-2 gap-4">
                <FeedbackItem label="Lighting" status={analysis.lightingLevel} />
                <FeedbackItem label="Audio Level" status={analysis.audioLevel} />
            </div>
             <div className="flex items-center justify-center text-sm text-gray-400 gap-2 pt-2">
                 <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                 <span>Monitoring technicals...</span>
            </div>
        </div>
    );
};