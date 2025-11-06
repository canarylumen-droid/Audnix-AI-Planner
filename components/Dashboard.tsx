// components/Dashboard.tsx
import * as React from 'react';
import { InputController } from './InputController';
import { ResultsView } from './ResultsView';
import { generateContentPlan, brainstormIdeas, analyzeAndEnhanceScript, generateFinalPlan } from '../services/geminiService';
import { ContentPlan, BrainstormResult, VideoAnalysisResult, BrandKit } from '../types';

interface DashboardProps {
    onPlanGenerated: (plan: ContentPlan) => void;
    initialTopic: string | null;
    onTopicUsed: () => void;
    brandKit: BrandKit;
    onSpy: (topic: string) => void; // NEW
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

export const Dashboard: React.FC<DashboardProps> = ({ onPlanGenerated, initialTopic, onTopicUsed, brandKit, onSpy }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [contentPlan, setContentPlan] = React.useState<ContentPlan | null>(null);
    const [brainstormResult, setBrainstormResult] = React.useState<BrainstormResult | null>(null);
    const [videoAnalysis, setVideoAnalysis] = React.useState<VideoAnalysisResult | null>(null);
    const [analyzedUserScript, setAnalyzedUserScript] = React.useState<string>('');

    React.useEffect(() => {
        if (initialTopic) {
            setContentPlan(null);
            setBrainstormResult(null);
            setVideoAnalysis(null);
            setAnalyzedUserScript('');
        }
    }, [initialTopic]);

    const handleGenerate = async (topic: string, videoStyle: string, targetAudience: string) => {
        setIsLoading(true);
        setError(null);
        setBrainstormResult(null);
        setVideoAnalysis(null);
        setAnalyzedUserScript('');
        try {
            const plan = await generateContentPlan(topic, videoStyle, targetAudience, brandKit.bio);
            setContentPlan(plan);

            if (initialTopic) onTopicUsed();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setContentPlan(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBrainstorm = async (topic: string, videoStyle: string, targetAudience: string) => {
        setIsLoading(true);
        setError(null);
        setContentPlan(null);
        try {
            const result = await brainstormIdeas(topic, videoStyle, targetAudience);
            setBrainstormResult(result);
            if (initialTopic) onTopicUsed();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyze = async (video: File, script: string) => {
        setIsLoading(true);
        setError(null);
        setContentPlan(null);
        setAnalyzedUserScript(script);
        try {
            const videoData = await fileToBase64(video);
            const result = await analyzeAndEnhanceScript({ inlineData: { data: videoData, mimeType: video.type } }, script);
            setVideoAnalysis(result);
        } catch (err) {
             setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateFinalPlan = async () => {
        if (!brainstormResult || !videoAnalysis) return;

        setIsLoading(true);
        setError(null);
        try {
            const plan = await generateFinalPlan(brainstormResult, videoAnalysis, analyzedUserScript);
            setContentPlan(plan);
            setBrainstormResult(null);
            setVideoAnalysis(null);
            setAnalyzedUserScript('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartRecording = (script: string, title: string) => {
        const plan: ContentPlan = {
            title: title,
            script: script,
            hook: '', introduction: '', mainPoints: [], conclusion: '', cta: '', visualSuggestions: [], captions: [], hashtags: [], suggestedDuration: '',
        };
        onPlanGenerated(plan);
    };

    return (
        <div className="space-y-8">
            <InputController onGenerate={handleGenerate} onBrainstorm={handleBrainstorm} onAnalyze={handleAnalyze} isLoading={isLoading} initialTopic={initialTopic} onSpy={onSpy} />
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md">
                    <p className="font-bold">Operation Failed</p>
                    <p>{error}</p>
                </div>
            )}
            <ResultsView 
                plan={contentPlan} 
                brainstormResult={brainstormResult}
                videoAnalysis={videoAnalysis}
                onStartRecording={handleStartRecording} 
                onGenerateFinalPlan={handleGenerateFinalPlan}
                isCombining={isLoading && !!brainstormResult && !!videoAnalysis}
            />
        </div>
    );
};