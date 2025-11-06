// components/ResultsView.tsx
import * as React from 'react';
import { Card } from './common/Card';
import { ContentPlan, BrainstormResult, VideoAnalysisResult } from '../types';
import { refineScript } from '../services/geminiService';
import { Spinner } from './common/Spinner';

interface ResultsViewProps {
    plan: ContentPlan | null;
    brainstormResult: BrainstormResult | null;
    videoAnalysis: VideoAnalysisResult | null;
    onStartRecording: (script: string, title: string) => void;
    onGenerateFinalPlan: () => void;
    isCombining: boolean;
}

const RatingBar: React.FC<{ rating: number }> = ({ rating }) => {
    const width = `${rating}%`;
    const color = rating > 75 ? 'bg-green-500' : rating > 50 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{ width }}></div>
        </div>
    );
};


export const ResultsView: React.FC<ResultsViewProps> = ({ 
    plan, 
    brainstormResult, 
    videoAnalysis, 
    onStartRecording,
    onGenerateFinalPlan,
    isCombining
}) => {
    const [currentEnhancedScript, setCurrentEnhancedScript] = React.useState<string>('');
    const [isRefining, setIsRefining] = React.useState(false);
    const [refineError, setRefineError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (videoAnalysis) {
            setCurrentEnhancedScript(videoAnalysis.enhancedScript.script);
            setRefineError(null); // Clear previous errors
        }
    }, [videoAnalysis]);
    
    const calculateDuration = (script: string): string => {
        const wordsPerMinute = 150; // Average speaking rate
        const wordCount = script.split(/\s+/).length;
        const totalSeconds = Math.round((wordCount / wordsPerMinute) * 60);
        if (totalSeconds < 1) return '< 1s';
        if (totalSeconds < 60) return `${totalSeconds}s`;
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}m ${s}s`;
    };

    const handleRefineFurther = async () => {
        if (!currentEnhancedScript) return;
        setIsRefining(true);
        setRefineError(null);
        try {
            const result = await refineScript(currentEnhancedScript);
            setCurrentEnhancedScript(result.enhancedScript);
        } catch (err) {
            setRefineError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsRefining(false);
        }
    };

    if (!plan && !brainstormResult && !videoAnalysis) {
        return null;
    }
    
    const showCombinationSection = brainstormResult && videoAnalysis && !plan;

    return (
        <div className="space-y-6">
            {showCombinationSection && (
                 <div className="p-6 bg-gray-800/50 rounded-lg border-2 border-dashed border-cyan-700 text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-100">Ready to Combine?</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">You have brainstorming ideas and a video analysis. Combine them with AI to create the ultimate, final content plan.</p>
                    <button 
                        onClick={onGenerateFinalPlan}
                        disabled={isCombining}
                        className="w-full max-w-sm mx-auto flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300"
                    >
                        {isCombining ? <><Spinner /> Combining...</> : '✨ Create Final Combined Plan'}
                    </button>
                </div>
            )}
            {plan && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-100">{plan.title}</h2>
                    <div className="bg-cyan-900/20 border border-cyan-700 p-4 rounded-lg text-center">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-cyan-400 font-semibold text-sm">Est. Script Duration</p>
                                <p className="text-cyan-200 font-bold text-xl">{calculateDuration(plan.script)}</p>
                            </div>
                            <div>
                                <p className="text-cyan-400 font-semibold text-sm">AI Suggested Duration</p>
                                <p className="text-cyan-200 font-bold text-xl">{plan.suggestedDuration}</p>
                            </div>
                        </div>
                    </div>
                    <Card title="🎬 Full Script" initiallyOpen={true}>
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{plan.script}</p>
                    </Card>
                    {plan.thumbnailSuggestions && plan.thumbnailSuggestions.length > 0 && (
                        <Card title="🖼️ AI Thumbnail Ideas">
                            <div className="space-y-4">
                                {plan.thumbnailSuggestions.map((item, index) => (
                                    <div key={index} className="p-3 bg-gray-800/50 rounded-md border border-gray-700">
                                        <p className="font-bold text-gray-200">{item.concept}</p>
                                        <p className="text-sm text-gray-400 mt-1">{item.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                    {plan.bRollSuggestions && plan.bRollSuggestions.length > 0 && (
                        <Card title="🎞️ AI B-Roll Shot List">
                            <div className="space-y-3">
                                {plan.bRollSuggestions.map((item, index) => (
                                    <div key={index} className="flex gap-4 text-sm">
                                        <span className="font-bold text-cyan-400 w-24">{item.timestamp}</span>
                                        <p className="text-gray-300">{item.suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                     <Card title="✍️ Captions & Hashtags">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-300 mb-2">Captions:</h4>
                                <ul className="list-disc list-inside text-gray-400 space-y-1">
                                    {plan.captions.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-300 mb-2">Hashtags:</h4>
                                <p className="text-gray-400">{plan.hashtags.join(' ')}</p>
                            </div>
                        </div>
                    </Card>
                    <Card title="💡 On-Screen Text Ideas">
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            {plan.visualSuggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    </Card>
                    <button onClick={() => onStartRecording(plan.script, plan.title)} className="w-full saas-button-primary">
                        Start Recording in Studio
                    </button>
                </div>
            )}
            
            {brainstormResult && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-100">Brainstorming Results</h2>
                    <Card title="💡 Content Ideas" initiallyOpen={true}>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">{brainstormResult.contentIdeas.map((idea, i) => <li key={i}>{idea}</li>)}</ul>
                    </Card>
                    <Card title="🎯 Unique Angles">
                        <ul className="list-disc list-inside text-gray-300 space-y-2">{brainstormResult.uniqueAngles.map((angle, i) => <li key={i}>{angle}</li>)}</ul>
                    </Card>
                     <Card title="🔥 Trending Topics">
                        <ul className="list-disc list-inside text-gray-300 space-y-2">{brainstormResult.trendingTopics.map((topic, i) => <li key={i}>{topic}</li>)}</ul>
                    </Card>
                </div>
            )}

            {videoAnalysis && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-100">Video Analysis & Enhanced Script</h2>
                    <Card title="📊 Original Video Analysis" initiallyOpen={true}>
                        <div className="space-y-4">
                            {(Object.keys(videoAnalysis.analysis) as Array<keyof typeof videoAnalysis.analysis>).map(key => (
                                <div key={key}>
                                    <h4 className="font-bold capitalize text-gray-200">{key}</h4>
                                    <div className="flex items-center gap-4 my-2">
                                        <RatingBar rating={videoAnalysis.analysis[key].rating} />
                                        <span className="font-bold text-lg">{videoAnalysis.analysis[key].rating}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm whitespace-pre-wrap">{videoAnalysis.analysis[key].detailedFeedback}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                     <Card title="🚀 Enhanced Script" initiallyOpen={true}>
                         <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg text-center mb-4">
                            <p className="text-blue-300 font-semibold text-lg">
                                Estimated Duration: <span className="font-bold">{calculateDuration(currentEnhancedScript)}</span>
                            </p>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{currentEnhancedScript}</p>
                         <div className="mt-4 space-y-2 border-t border-gray-700 pt-4">
                             <h4 className="font-bold text-gray-200">New Script Ratings:</h4>
                              <div className="flex items-center gap-2 text-sm"><span className="w-24">Hook:</span><RatingBar rating={videoAnalysis.enhancedScript.hook.rating} /><span className="font-bold">{videoAnalysis.enhancedScript.hook.rating}</span></div>
                             <div className="flex items-center gap-2 text-sm"><span className="w-24">Storytelling:</span><RatingBar rating={videoAnalysis.enhancedScript.storytelling.rating} /><span className="font-bold">{videoAnalysis.enhancedScript.storytelling.rating}</span></div>
                             <div className="flex items-center gap-2 text-sm"><span className="w-24">CTA:</span><RatingBar rating={videoAnalysis.enhancedScript.cta.rating} /><span className="font-bold">{videoAnalysis.enhancedScript.cta.rating}</span></div>
                        </div>
                         {refineError && <p className="text-red-400 text-sm mt-2 p-2 bg-red-900/20 rounded-md">{refineError}</p>}
                    </Card>
                     <div className="space-y-2">
                        <button onClick={() => onStartRecording(currentEnhancedScript, "Enhanced Video Script")} className="w-full saas-button-primary bg-blue-600 hover:bg-blue-500">
                            Record Enhanced Script in Studio
                        </button>
                        <button
                            onClick={handleRefineFurther}
                            disabled={isRefining}
                            className="w-full flex justify-center items-center gap-2 border-2 border-blue-500 hover:bg-blue-500/20 disabled:border-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed text-blue-300 font-bold py-3 px-4 rounded-md transition-all duration-300"
                        >
                            {isRefining ? <><Spinner /> Refining...</> : '✨ Refine Further with AI'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};