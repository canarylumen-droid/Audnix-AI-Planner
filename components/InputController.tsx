// components/InputController.tsx
import * as React from 'react';
import { Spinner } from './common/Spinner';
import { UploadIcon } from './icons/UploadIcon';

interface InputControllerProps {
    onGenerate: (topic: string, videoStyle: string, targetAudience: string) => void;
    onBrainstorm: (topic: string, videoStyle: string, targetAudience: string) => void;
    onAnalyze: (video: File, script: string) => void;
    isLoading: boolean;
    initialTopic?: string | null; // NEW: To pre-fill from campaign planner
}

export const InputController: React.FC<InputControllerProps> = ({ onGenerate, onBrainstorm, onAnalyze, isLoading, initialTopic }) => {
    const [topic, setTopic] = React.useState('');
    const [videoStyle, setVideoStyle] = React.useState('Informative & Engaging');
    const [targetAudience, setTargetAudience] = React.useState('General Audience');
    const [error, setError] = React.useState('');
    
    // NEW: State for video analysis tool
    const [videoFile, setVideoFile] = React.useState<File | null>(null);
    const [userScript, setUserScript] = React.useState('');
    const [analyzeError, setAnalyzeError] = React.useState('');
    const videoInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (initialTopic) {
            setTopic(initialTopic);
        }
    }, [initialTopic]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateTopic()) return;
        onGenerate(topic, videoStyle, targetAudience);
    };

    const handleBrainstorm = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!validateTopic()) return;
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
    
    const validateTopic = (): boolean => {
         if (!topic.trim()) {
            setError('Please enter a video topic.');
            return false;
        }
        setError('');
        return true;
    }

    return (
        <div className="space-y-8">
            {/* Generator Section */}
            <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                 <h3 className="text-xl font-bold text-gray-200">Generate from an Idea</h3>
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">What's your video about?</label>
                    <input type="text" id="topic" value={topic} onChange={(e) => { setTopic(e.target.value); if (error) setError(''); }} placeholder="e.g., 'The easiest way to make sourdough bread'" className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" disabled={isLoading} />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="video-style" className="block text-sm font-medium text-gray-300 mb-2">Style / Tone</label>
                        <select id="video-style" value={videoStyle} onChange={(e) => setVideoStyle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" disabled={isLoading}>
                            <option>Informative & Engaging</option>
                            <option>Funny & Comedic</option>
                            <option>Inspirational & Motivational</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="target-audience" className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                        <input type="text" id="target-audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., 'Beginner bakers'" className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" disabled={isLoading} />
                    </div>
                </div>
                <div className="pt-2 space-y-3">
                     <button onClick={handleBrainstorm} disabled={isLoading || !topic.trim()} className="w-full flex justify-center items-center bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-cyan-300 font-bold py-3 px-4 rounded-md transition-all duration-300">
                        {isLoading ? <><Spinner /><span className="ml-2">Brainstorming...</span></> : "Brainstorm Ideas"}
                    </button>
                    <button type="submit" disabled={isLoading || !topic.trim()} className="w-full flex justify-center items-center bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-md transition-all duration-300">
                        {isLoading ? <><Spinner /><span className="ml-2">Generating...</span></> : "Generate Full Content Plan"}
                    </button>
                </div>
            </form>

            {/* NEW: Video Analysis Section */}
            <form className="space-y-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                 <h3 className="text-xl font-bold text-gray-200">Analyze & Enhance a Video</h3>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Upload a video to analyze</label>
                    <div onClick={() => videoInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-cyan-400 transition">
                        <div className="space-y-1 text-center">
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                            <div className="flex text-sm text-gray-400">
                                <p className="pl-1">{videoFile ? videoFile.name : 'Click to upload a video (MP4, MOV, etc.)'}</p>
                            </div>
                        </div>
                    </div>
                     <input ref={videoInputRef} id="video-upload" name="video-upload" type="file" className="sr-only" accept="video/*" onChange={handleFileChange} />
                </div>
                 <div>
                    <label htmlFor="user-script" className="block text-sm font-medium text-gray-300 mb-2">Your script notes or ideas</label>
                    <textarea id="user-script" rows={4} value={userScript} onChange={(e) => {setUserScript(e.target.value); setAnalyzeError('')}} className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" placeholder="e.g., 'Talk about how to fix over-proofed dough...'" disabled={isLoading}></textarea>
                </div>
                 {analyzeError && <p className="text-red-400 text-sm mt-2">{analyzeError}</p>}
                 <div className="pt-2">
                    <button onClick={handleAnalyze} disabled={isLoading || !videoFile || !userScript} className="w-full flex justify-center items-center bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300">
                         {isLoading ? <><Spinner /><span className="ml-2">Analyzing...</span></> : "Analyze Video & Enhance Script"}
                    </button>
                </div>
            </form>
        </div>
    );
};