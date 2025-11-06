// components/tabs/CompetitorAnalysisTab.tsx
import * as React from 'react';
import { spyOnCompetitor } from '../../services/geminiService';
import { CompetitorAnalysisResult } from '../../types';
import { Spinner } from '../common/Spinner';
import { Card } from '../common/Card';

interface CompetitorAnalysisTabProps {
    onScriptGenerated: (result: CompetitorAnalysisResult) => void;
    initialTopic: string | null;
    onTopicUsed: () => void;
}

export const CompetitorAnalysisTab: React.FC<CompetitorAnalysisTabProps> = ({ onScriptGenerated, initialTopic, onTopicUsed }) => {
    const [videoUrl, setVideoUrl] = React.useState('');
    const [userIdea, setUserIdea] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [analysis, setAnalysis] = React.useState<CompetitorAnalysisResult | null>(null);

    React.useEffect(() => {
        if (initialTopic) {
            setUserIdea(`My video will be about "${initialTopic}". How can I make it better than this competitor?`);
            onTopicUsed(); // Consume the topic
        }
    }, [initialTopic, onTopicUsed]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!videoUrl.trim() || (!videoUrl.includes('youtube.com') && !videoUrl.includes('instagram.com'))) {
            setError('Please enter a valid YouTube or Instagram video URL.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await spyOnCompetitor(videoUrl, userIdea);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-100">AI Competitor Spy</h2>
                <p className="text-gray-400 mt-2">Paste a competitor's video link. The AI will "watch" it, deconstruct their strategy, and generate a superior script for you.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 space-y-6">
                <div>
                    <label htmlFor="video-url" className="block text-sm font-medium text-gray-300 mb-2">Competitor Video URL</label>
                    <input 
                        type="url"
                        id="video-url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Paste a YouTube or Instagram video link..."
                        className="w-full saas-input"
                    />
                </div>
                <div>
                    <label htmlFor="user-idea" className="block text-sm font-medium text-gray-300 mb-2">Your Idea or Angle (Optional)</label>
                    <textarea 
                        id="user-idea" 
                        rows={3}
                        value={userIdea} 
                        onChange={(e) => setUserIdea(e.target.value)} 
                        placeholder="e.g., 'My video will be similar but focus on a beginner's perspective...'" 
                        className="w-full saas-input"
                    />
                </div>
                 <div className="pt-2">
                    <button type="submit" disabled={isLoading || !videoUrl.trim()} className="w-full saas-button-primary">
                        {isLoading ? <><Spinner /><span className="ml-2">Analyzing...</span></> : "Analyze & Generate My Script"}
                    </button>
                </div>
            </form>

             {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md">
                    <p className="font-bold">Operation Failed</p>
                    <p>{error}</p>
                </div>
            )}

            {analysis && (
                <div className="mt-8 space-y-6">
                    <Card title="Spy Report: Competitor's Hook Analysis" initiallyOpen={true}>
                        <div className="p-2">
                            <blockquote className="border-l-4 border-violet-500 pl-4 italic text-gray-300">"{analysis.hookAnalysis.hook}"</blockquote>
                            <div className="flex items-center gap-4 mt-4">
                                <p className="font-bold text-lg">Effectiveness Score: <span className="text-violet-400">{analysis.hookAnalysis.score}/100</span></p>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">{analysis.hookAnalysis.explanation}</p>
                        </div>
                    </Card>

                    <Card title="Deconstructed: The Secret Formula" initiallyOpen={true}>
                         <div className="space-y-4 p-2">
                            {analysis.secretFormula.map((item, index) => (
                                <div key={index}>
                                    <h4 className="font-bold text-gray-200">{item.title}</h4>
                                    <p className="text-sm text-gray-400">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Your New & Improved Script" initiallyOpen={true}>
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed p-2">{analysis.enhancedScript}</p>
                    </Card>

                     <button onClick={() => onScriptGenerated(analysis)} className="w-full saas-button-primary">
                        Send to Studio & Record
                    </button>
                </div>
            )}
        </div>
    );
};