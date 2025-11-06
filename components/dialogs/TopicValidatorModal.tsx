// components/dialogs/TopicValidatorModal.tsx
import * as React from 'react';
import { TopicValidationResult } from '../../types';

interface TopicValidatorModalProps {
    result: TopicValidationResult;
    onClose: () => void;
    onSelectTopic: (topic: string) => void;
}

const SWOTCard: React.FC<{ title: string; items: string[]; color: string; icon: string }> = ({ title, items, color, icon }) => (
    <div className={`bg-gray-800/50 p-4 rounded-lg border border-${color}-700/50`}>
        <h4 className={`font-bold text-lg text-${color}-400 flex items-center gap-2 mb-2`}>
            <span>{icon}</span>
            <span>{title}</span>
        </h4>
        <ul className="space-y-1 text-sm text-gray-300 list-disc list-inside">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);

export const TopicValidatorModal: React.FC<TopicValidatorModalProps> = ({ result, onClose, onSelectTopic }) => {
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const scoreColor = result.viralityScore > 75 ? 'text-green-400' : result.viralityScore > 50 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-gray-900 rounded-xl p-6 border border-gray-700 max-w-2xl w-full animate-fade-in space-y-6 max-h-[90vh] overflow-y-auto" 
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-100">AI Topic Validation</h2>
                    <p className="text-gray-400">Here's a strategic analysis of your content idea.</p>
                </div>

                <div className="text-center bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm font-medium text-gray-400">Virality Score</p>
                    <p className={`text-6xl font-black ${scoreColor}`}>{result.viralityScore}<span className="text-3xl text-gray-500">/100</span></p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SWOTCard title="Strengths" items={result.swotAnalysis.strengths} color="green" icon="💪" />
                    <SWOTCard title="Weaknesses" items={result.swotAnalysis.weaknesses} color="red" icon="⚠️" />
                    <SWOTCard title="Opportunities" items={result.swotAnalysis.opportunities} color="cyan" icon="💡" />
                    <SWOTCard title="Threats" items={result.swotAnalysis.threats} color="yellow" icon="⚔️" />
                </div>
                
                <div>
                    <h3 className="font-bold text-lg text-gray-200 mb-2">Suggested Topic Improvements</h3>
                    <div className="space-y-2">
                        {result.suggestedTopics.map((topic, index) => (
                             <button 
                                key={index}
                                onClick={() => onSelectTopic(topic)}
                                className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700/50 rounded-md transition border border-gray-700"
                            >
                                <p className="font-semibold text-cyan-400">{topic}</p>
                            </button>
                        ))}
                    </div>
                </div>


                <button onClick={onClose} className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    Close
                </button>
            </div>
        </div>
    );
};
