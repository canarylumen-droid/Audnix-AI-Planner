// components/tabs/PerformanceTab.tsx
import * as React from 'react';
import { Recording, PerformanceAnalysis } from '../../types';
import { analyzeVideoPerformance } from '../../services/geminiService';
import { Spinner } from '../common/Spinner';
import { AnalyticsIcon } from '../icons/AnalyticsIcon';
import { Card } from '../common/Card';

interface PerformanceTabProps {
    recording: Recording | null;
    onAnalysisComplete: () => void;
}

const ScoreCard: React.FC<{ title: string; score: number; }> = ({ title, score }) => {
    const color = score > 75 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400';
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg text-center border border-gray-700">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className={`text-4xl font-bold ${color}`}>{score}</p>
        </div>
    );
};

const RatingBar: React.FC<{ label: string; rating: number }> = ({ label, rating }) => {
    const width = `${rating}%`;
    const color = rating > 75 ? 'bg-green-500' : rating > 50 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-300">{label}</span>
                <span className="font-bold text-gray-200">{rating}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full`} style={{ width }}></div>
            </div>
        </div>
    );
};

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ recording, onAnalysisComplete }) => {
    const [title, setTitle] = React.useState('');
    const [comments, setComments] = React.useState('');
    const [analysis, setAnalysis] = React.useState<PerformanceAnalysis | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        // When a new recording is passed, clear the old analysis and inputs
        setTitle(recording?.title || '');
        setComments('');
        setAnalysis(null);
        setError(null);
        if(recording) {
            // Acknowledge the recording has been received
            onAnalysisComplete();
        }
    // FIX: Added onAnalysisComplete to dependency array to satisfy exhaustive-deps.
    }, [recording, onAnalysisComplete]);

    const handleAnalyze = async () => {
        if (!title.trim() || !recording) {
            setError('Please provide the final title of the video.');
            return;
        }
        
        if (!recording.transcriptLog || recording.transcriptLog.length === 0) {
            setError('This recording does not have a transcript, so it cannot be analyzed. Please record a new video.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const transcript = recording.transcriptLog.map(entry => entry.text).join(' ');
            const result = await analyzeVideoPerformance(title, transcript, comments);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // FIX: Added an improved empty state for when no recording is selected for analysis.
    if (!recording) {
        return (
            <div className="text-center py-20">
                <AnalyticsIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-400">AI Growth Consultant</h2>
                <p className="text-gray-500 mt-2">Go to the 'Exports' tab, select a video, and click 'Analyze Performance' to get strategic feedback.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-100">AI Growth Consultant</h2>
                <p className="text-gray-400 mt-2">Get a data-driven analysis of your video's performance potential. The more context you provide, the better the insights.</p>
            </div>
            
            {/* FIX: Refactored input form into a single card for better layout and consistency. */}
            <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
                <h3 className="font-bold text-lg">Analyzing: <span className="text-cyan-400">{recording.title}</span></h3>
                <div>
                    <label htmlFor="video-title" className="block text-sm font-medium text-gray-300 mb-2">Final Video Title (as published)</label>
                    <input 
                        type="text" 
                        id="video-title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="e.g., The SECRET to perfect sourdough bread..." 
                        className="w-full saas-input"
                    />
                </div>
                 <div>
                    <label htmlFor="video-comments" className="block text-sm font-medium text-gray-300 mb-2">Sample Comments (Optional)</label>
                    <textarea 
                        id="video-comments" 
                        rows={4}
                        value={comments} 
                        onChange={(e) => setComments(e.target.value)} 
                        placeholder="Paste a few representative comments here to help the AI analyze audience sentiment." 
                        className="w-full saas-input"
                    />
                </div>
                 <button onClick={handleAnalyze} disabled={isLoading} className="w-full saas-button-primary">
                    {isLoading ? <><Spinner /><span className="ml-2">Analyzing...</span></> : "Analyze Performance"}
                </button>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md">
                    <p className="font-bold">Analysis Failed</p>
                    <p>{error}</p>
                </div>
            )}
            
            {analysis && (
                <div className="space-y-6">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ScoreCard title="Virality Potential" score={analysis.viralityPotential} />
                        <ScoreCard title="Hook Effectiveness" score={analysis.scores.hookEffectiveness} />
                        <ScoreCard title="Engagement" score={analysis.scores.engagement} />
                        <ScoreCard title="CTA Strength" score={analysis.scores.ctaStrength} />
                    </div>

                    <Card title="📊 Detailed Scores" initiallyOpen={true}>
                        <div className="space-y-4 p-2">
                            <RatingBar label="Hook Effectiveness" rating={analysis.scores.hookEffectiveness} />
                            <RatingBar label="Clarity" rating={analysis.scores.clarity} />
                            <RatingBar label="Engagement" rating={analysis.scores.engagement} />
                            <RatingBar label="CTA Strength" rating={analysis.scores.ctaStrength} />
                        </div>
                    </Card>

                    <Card title="💬 Audience Sentiment" initiallyOpen={true}>
                        <div className="p-2 space-y-3">
                            <p className="font-semibold text-gray-300 italic">"{analysis.audienceSentiment.summary}"</p>
                            <div>
                                <h4 className="font-bold text-gray-200 mb-2">Common Themes:</h4>
                                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                    {analysis.audienceSentiment.commonThemes.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </Card>

                    <Card title="✅ Key Takeaways" initiallyOpen={true}>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 p-2">
                            {analysis.keyTakeaways.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </Card>
                    <Card title="💡 Improvement Suggestions" initiallyOpen={true}>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 p-2">
                            {analysis.improvementSuggestions.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </Card>
                    <Card title="🚀 Next Video Ideas" initiallyOpen={true}>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 p-2">
                            {analysis.nextVideoIdeas.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </Card>
                </div>
            )}
        </div>
    );
};
