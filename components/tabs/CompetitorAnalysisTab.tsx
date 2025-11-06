// components/tabs/CompetitorAnalysisTab.tsx
import * as React from 'react';
import { spyOnCompetitor, analyzeAndEnhanceScript } from '../../services/geminiService';
import { CompetitorAnalysisResult, VideoAnalysisResult } from '../../types';
import { Spinner } from '../common/Spinner';
import { Card } from '../common/Card';
import { UploadIcon } from '../icons/UploadIcon';

interface CompetitorAnalysisTabProps {
    onScriptGenerated: (result: CompetitorAnalysisResult | VideoAnalysisResult) => void;
    initialTopic: string | null;
    onTopicUsed: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string).split(',')[1];
            resolve(result);
        };
        reader.onerror = error => reject(error);
    });
};


export const CompetitorAnalysisTab: React.FC<CompetitorAnalysisTabProps> = ({ onScriptGenerated, initialTopic, onTopicUsed }) => {
    const [analysisMode, setAnalysisMode] = React.useState<'url' | 'upload'>('url');
    
    const [videoUrl, setVideoUrl] = React.useState('');
    const [videoFile, setVideoFile] = React.useState<File | null>(null);
    const videoInputRef = React.useRef<HTMLInputElement>(null);

    const [userIdea, setUserIdea] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = React.useState<CompetitorAnalysisResult | VideoAnalysisResult | null>(null);

    React.useEffect(() => {
        if (initialTopic) {
            setUserIdea(`My video will be about "${initialTopic}". How can I make it better than this competitor?`);
            onTopicUsed(); // Consume the topic
        }
    }, [initialTopic, onTopicUsed]);
    
    const resetState = () => {
        setError(null);
        setAnalysisResult(null);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        resetState();

        if (analysisMode === 'url') {
            if (!videoUrl.trim() || (!videoUrl.includes('youtube.com') && !videoUrl.includes('instagram.com'))) {
                setError('Please enter a valid YouTube or Instagram video URL.');
                return;
            }
            setIsLoading(true);
            try {
                const result = await spyOnCompetitor(videoUrl, userIdea);
                setAnalysisResult(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
            } finally {
                setIsLoading(false);
            }
        } else { // 'upload' mode
            if (!videoFile) {
                setError('Please upload a video file for analysis.');
                return;
            }
            setIsLoading(true);
            try {
                const videoData = await fileToBase64(videoFile);
                const result = await analyzeAndEnhanceScript({ inlineData: { data: videoData, mimeType: videoFile.type } }, userIdea || 'No specific idea provided. Analyze this video and create a superior script based on its content.');
                setAnalysisResult(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setError('');
        }
    };

    const renderUrlAnalysisResult = (result: CompetitorAnalysisResult) => (
         <div className="mt-8 space-y-6">
            <Card title="Spy Report: Competitor's Hook Analysis" initiallyOpen={true}>
                <div className="p-2">
                    <blockquote className="border-l-4 border-violet-500 pl-4 italic text-gray-300">"{result.hookAnalysis.hook}"</blockquote>
                    <div className="flex items-center gap-4 mt-4">
                        <p className="font-bold text-lg">Effectiveness Score: <span className="text-violet-400">{result.hookAnalysis.score}/100</span></p>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{result.hookAnalysis.explanation}</p>
                </div>
            </Card>

            <Card title="Deconstructed: The Secret Formula" initiallyOpen={true}>
                 <div className="space-y-4 p-2">
                    {result.secretFormula.map((item, index) => (
                        <div key={index}>
                            <h4 className="font-bold text-gray-200">{item.title}</h4>
                            <p className="text-sm text-gray-400">{item.description}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Your New & Improved Script (from URL)" initiallyOpen={true}>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed p-2">{result.enhancedScript}</p>
            </Card>
        </div>
    );
    
    const renderFileUploadAnalysisResult = (result: VideoAnalysisResult) => (
        <div className="mt-8 space-y-6">
             <Card title="Deep Video Analysis (Frame-by-Frame)" initiallyOpen={true}>
                <div className="space-y-4 p-2">
                    {(Object.keys(result.analysis) as Array<keyof typeof result.analysis>).map(key => (
                        <div key={key}>
                            <h4 className="font-bold capitalize text-gray-200">{key}</h4>
                            <div className="flex items-center gap-4 my-2">
                                 <div className="w-full bg-gray-700 rounded-full h-2.5"><div className={`bg-green-500 h-2.5 rounded-full`} style={{ width: `${result.analysis[key].rating}%` }}></div></div>
                                <span className="font-bold text-lg">{result.analysis[key].rating}</span>
                            </div>
                            <p className="text-gray-400 text-sm whitespace-pre-wrap">{result.analysis[key].detailedFeedback}</p>
                        </div>
                    ))}
                </div>
            </Card>
            <Card title="Your New & Improved Script (from File)" initiallyOpen={true}>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed p-2">{result.enhancedScript.script}</p>
            </Card>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-100">AI Competitor Spy</h2>
                <p className="text-gray-400 mt-2">Deconstruct any video's success formula to create something even better.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 space-y-6">
                
                {/* Analysis Mode Toggle */}
                <div className="flex bg-gray-900/50 p-1 rounded-full border border-gray-700">
                    <button type="button" onClick={() => setAnalysisMode('url')} className={`flex-1 py-2 text-sm font-bold rounded-full transition ${analysisMode === 'url' ? 'bg-teal-500 text-gray-900' : 'text-gray-400 hover:bg-gray-700'}`}>Analyze by URL</button>
                    <button type="button" onClick={() => setAnalysisMode('upload')} className={`flex-1 py-2 text-sm font-bold rounded-full transition ${analysisMode === 'upload' ? 'bg-teal-500 text-gray-900' : 'text-gray-400 hover:bg-gray-700'}`}>Analyze by File Upload</button>
                </div>
                
                {analysisMode === 'url' ? (
                    <div>
                        <label htmlFor="video-url" className="block text-sm font-medium text-gray-300 mb-2">Competitor Video URL</label>
                        <input type="url" id="video-url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Paste a YouTube or Instagram video link..." className="w-full saas-input" />
                        <p className="text-xs text-gray-500 mt-2">Fast analysis of script & public data using AI Search.</p>
                    </div>
                ) : (
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Upload Competitor Video</label>
                        <div onClick={() => videoInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md cursor-pointer hover:border-violet-500 transition bg-gray-950/50">
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-600" />
                                <div className="flex text-sm text-gray-400">
                                    <p className="pl-1">{videoFile ? videoFile.name : 'Click to upload a video for deep analysis'}</p>
                                </div>
                            </div>
                        </div>
                        <input ref={videoInputRef} id="video-upload" name="video-upload" type="file" className="sr-only" accept="video/*" onChange={handleFileChange} />
                        <p className="text-xs text-gray-500 mt-2">Deep, frame-by-frame visual analysis using a multimodal AI.</p>
                    </div>
                )}
                
                <div>
                    <label htmlFor="user-idea" className="block text-sm font-medium text-gray-300 mb-2">Your Idea or Angle (Optional)</label>
                    <textarea id="user-idea" rows={3} value={userIdea} onChange={(e) => setUserIdea(e.target.value)} placeholder="e.g., 'My video will be similar but focus on a beginner's perspective...'" className="w-full saas-input" />
                </div>
                 <div className="pt-2">
                    <button type="submit" disabled={isLoading} className="w-full saas-button-primary">
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

            {analysisResult && (
                <>
                    {'reconstructedScript' in analysisResult 
                        ? renderUrlAnalysisResult(analysisResult)
                        : renderFileUploadAnalysisResult(analysisResult)
                    }
                    <button onClick={() => onScriptGenerated(analysisResult)} className="w-full saas-button-primary">
                        Send to Studio & Record
                    </button>
                </>
            )}
        </div>
    );
};