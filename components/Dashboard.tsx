// components/Dashboard.tsx
import * as React from 'react';
import { InputController } from './InputController';
import { ResultsView } from './ResultsView';
import { generateContentPlan, brainstormIdeas, analyzeAndEnhanceScript } from '../services/geminiService';
import { ContentPlan, BrainstormResult, VideoAnalysisResult } from '../types';

interface DashboardProps {
    onPlanGenerated: (plan: ContentPlan) => void;
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

export const Dashboard: React.FC<DashboardProps> = ({ onPlanGenerated, initialTopic, onTopicUsed }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [contentPlan, setContentPlan] = React.useState<ContentPlan | null>(null);
    const [brainstormResult, setBrainstormResult] = React.useState<BrainstormResult | null>(null);
    const [videoAnalysis, setVideoAnalysis] = React.useState<VideoAnalysisResult | null>(null);

    React.useEffect(() => {
        if (initialTopic) {
            // When a topic comes from the campaign, clear old results to avoid confusion.
            clearResults();
            // The onTopicUsed callback will be called when the user generates a plan,
            // effectively "consuming" the topic from the campaign.
        }
    }, [initialTopic]);

    const clearResults = () => {
        setContentPlan(null);
        setBrainstormResult(null);
        setVideoAnalysis(null);
    }

    const handleGenerate = async (topic: string, videoStyle: string, targetAudience: string) => {
        setIsLoading(true);
        setError(null);
        clearResults();
        try {
            const plan = await generateContentPlan(topic, videoStyle, targetAudience);
            setContentPlan(plan);
            if (initialTopic) onTopicUsed(); // Signal that the topic has been used
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBrainstorm = async (topic: string, videoStyle: string, targetAudience: string) => {
        setIsLoading(true);
        setError(null);
        clearResults();
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
        clearResults();
        try {
            const videoData = await fileToBase64(video);
            const result = await analyzeAndEnhanceScript({ data: videoData, mimeType: video.type }, script);
            setVideoAnalysis(result);
        } catch (err) {
             setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartRecording = (script: string, title: string) => {
        // Create a minimal ContentPlan to send to the studio
        const plan: ContentPlan = {
            title: title,
            script: script,
            hook: '', introduction: '', mainPoints: [], conclusion: '', cta: '', visualSuggestions: [], captions: [], hashtags: [], suggestedDuration: '',
        };
        onPlanGenerated(plan);
    };

    return (
        <div className="space-y-8">
            <InputController onGenerate={handleGenerate} onBrainstorm={handleBrainstorm} onAnalyze={handleAnalyze} isLoading={isLoading} initialTopic={initialTopic} />
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
            />
        </div>
    );
};