// components/InputController.tsx
import * as React from 'react';
import { Spinner } from './common/Spinner';
import { UploadIcon } from './icons/UploadIcon';
import { TopicValidationResult } from '../types';
import { validateTopic } from '../services/geminiService';
import { TopicValidatorModal } from './dialogs/TopicValidatorModal';
import { SpyIcon } from './icons/SpyIcon';

interface InputControllerProps {
    onGenerate: (topic: string, videoStyle: string, targetAudience: string) => void;
    onBrainstorm: (topic: string, videoStyle: string, targetAudience: string) => void;
    onAnalyze: (video: File, script: string) => void;
    isLoading: boolean;
    initialTopic?: string | null;
    onSpy: (topic: string) => void; // NEW
}

export const InputController: React.FC<InputControllerProps> = ({ onGenerate, onBrainstorm, onAnalyze, isLoading, initialTopic, onSpy }) => {
    const [topic, setTopic] = React.useState('');
    const [videoStyle, setVideoStyle] = React.useState('Informative & Engaging');
    const [targetAudience, setTargetAudience] = React.useState('General Audience');
    const [error, setError] = React.useState('');
    
    const [videoFile, setVideoFile] = React.useState<File | null>(null);
    const [userScript, setUserScript] = React.useState('');
    const [analyzeError, setAnalyzeError] = React.useState('');
    const videoInputRef = React.useRef<HTMLInputElement>(null);
    
    const [isValidating, setIsValidating] = React.useState(false);
    const [validationResult, setValidationResult] = React.useState<TopicValidationResult | null>(null);
    const [validationError, setValidationError] = React.useState<string | null>(null);


    React.useEffect(() => {
        if (initialTopic) {
            setTopic(initialTopic);
        }
    }, [initialTopic]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateTopicInput()) return;
        onGenerate(topic, videoStyle, targetAudience);
    };

    const handleBrainstorm = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!validateTopicInput()) return;
        onBrainstorm(topic, videoStyle, targetAudience);
    };
    
    const handleAnalyze = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!videoFile || !userScript.trim()) {
            setAnalyzeError('Please upload a video and provide script notes.');
            return;
        }
        setAnalyzeError('');
        onAnalyze(videoFile, userScript);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setAnalyzeError('');
        }
    };
    
    const validateTopicInput = (): boolean => {
         if (!topic.trim()) {
            setError('Please enter a video topic.');
            return false;
        }
        setError('');
        return true;
    }
    
    const handleValidateTopic = async () => {
        if (!validateTopicInput()) return;
        setIsValidating(true);
        setValidationError(null);
        setValidationResult(null);
        try {
            const result = await validateTopic(topic);
            setValidationResult(result);
        } catch (err) {
            setValidationError(err instanceof Error ? err.message : 'Validation failed.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleSelectValidatedTopic = (newTopic: string) => {
        setTopic(newTopic);
        setValidationResult(null);
    };
    
    const handleSpy = () => {
        if (!validateTopicInput()) return;
        onSpy(topic);
    };

    return (
        <>
            {validationResult && (
                <TopicValidatorModal
                    result={validationResult}
                    onClose={() => setValidationResult(null)}
                    onSelectTopic={handleSelectValidatedTopic}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Generator Section */}
                <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-900/50 rounded-lg border border-gray-800">
                     <h3 className="text-xl font-bold text-gray-200">1. Generate from an Idea</h3>
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">What's your video about?</label>
                        <div className="flex gap-2">
                             <input type="text" id="topic" value={topic} onChange={(e) => { setTopic(e.target.value); if (error) setError(''); }} placeholder="e.g., 'The easiest way to make sourdough bread'" className="w-full saas-input" disabled={isLoading} />
                             <button
                                type="button"
                                onClick={handleValidateTopic}
                                disabled={isLoading || isValidating || !topic.trim()}
                                className="px-4 py-2 text-sm font-bold bg-gray-700 hover:bg-gray-600 text-teal-300 rounded-md transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isValidating ? <Spinner/> : 'Validate'}
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        {validationError && <p className="text-red-400 text-sm mt-2">{validationError}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="video-style" className="block text-sm font-medium text-gray-300 mb-2">Style / Tone</label>
                            <div className="saas-select-container">
                                <select id="video-style" value={videoStyle} onChange={(e) => setVideoStyle(e.target.value)} className="w-full saas-input saas-select" disabled={isLoading}>
                                    <option>Informative & Engaging</option>
                                    <option>Funny & Comedic</option>
                                    <option>Inspirational & Motivational</option>
                                </select>
                                <div className="saas-select-arrow">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="target-audience" className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                            <input type="text" id="target-audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., 'Beginner bakers'" className="w-full saas-input" disabled={isLoading} />
                        </div>
                    </div>
                    <div className="pt-2 space-y-3">
                         <div className="flex gap-3">
                            <button onClick={handleBrainstorm} disabled={isLoading || !topic.trim()} className="flex-1 flex justify-center items-center bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-teal-300 font-bold py-3 px-4 rounded-full transition-all duration-300">
                                {isLoading ? <><Spinner /><span className="ml-2">...</span></> : "Brainstorm"}
                            </button>
                             <button type="button" onClick={handleSpy} disabled={isLoading || !topic.trim()} className="flex-1 flex justify-center items-center bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-violet-300 font-bold py-3 px-4 rounded-full transition-all duration-300">
                                <SpyIcon className="w-5 h-5 mr-2" /> Spy on this Topic
                            </button>
                        </div>
                        <button type="submit" disabled={isLoading || !topic.trim()} className="w-full flex justify-center items-center saas-button-primary">
                            {isLoading ? <><Spinner /><span className="ml-2">Generating...</span></> : "Generate Full Content Plan"}
                        </button>
                    </div>
                </form>

                {/* Video Analysis Section */}
                <form className="space-y-6 p-6 bg-gray-900/50 rounded-lg border border-gray-800">
                     <h3 className="text-xl font-bold text-gray-200">2. Analyze & Enhance a Video</h3>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Upload a video for technical analysis</label>
                        <div onClick={() => videoInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md cursor-pointer hover:border-violet-500 transition bg-gray-950/50">
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-600" />
                                <div className="flex text-sm text-gray-400">
                                    <p className="pl-1">{videoFile ? videoFile.name : 'Click to upload a video (MP4, MOV, etc.)'}</p>
                                </div>
                            </div>
                        </div>
                         <input ref={videoInputRef} id="video-upload" name="video-upload" type="file" className="sr-only" accept="video/*" onChange={handleFileChange} />
                    </div>
                     <div>
                        <label htmlFor="user-script" className="block text-sm font-medium text-gray-300 mb-2">Your script notes or ideas for the video</label>
                        <textarea id="user-script" rows={4} value={userScript} onChange={(e) => {setUserScript(e.target.value); setAnalyzeError('')}} className="w-full saas-input" placeholder="e.g., 'Talk about how to fix over-proofed dough...'" disabled={isLoading}></textarea>
                    </div>
                     {analyzeError && <p className="text-red-400 text-sm mt-2">{analyzeError}</p>}
                     <div className="pt-2">
                        <button onClick={handleAnalyze} disabled={isLoading || !videoFile || !userScript} className="w-full flex justify-center items-center saas-button-primary">
                             {isLoading ? <><Spinner /><span className="ml-2">Analyzing...</span></> : "Analyze & Enhance Script"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};