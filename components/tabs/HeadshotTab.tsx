// components/tabs/HeadshotTab.tsx
import * as React from 'react';
import { HeadshotConfig } from '../../types';
import { generateHeadshot } from '../../services/geminiService';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';
import { CameraIcon } from '../icons/CameraIcon';
import { useHistoryState } from '../../hooks/useHistoryState';
import { UndoIcon } from '../icons/UndoIcon';
import { RedoIcon } from '../icons/RedoIcon';
import { UploadIcon } from '../icons/UploadIcon';

const fileToDataUrlParts = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (!mimeType || !data) {
                return reject(new Error('Invalid file format.'));
            }
            resolve({ data, mimeType });
        };
        reader.onerror = error => reject(error);
    });
};

export const HeadshotTab: React.FC = () => {
    const [config, setConfig, undoConfig, redoConfig, canUndo, canRedo] = useHistoryState<HeadshotConfig>({
        background: 'Office',
        lighting: 'Professional Studio',
        clothing: {
            enabled: false,
            style: 'Business Suit',
            color: '#334155', // slate-700
        },
        highQuality: false,
        backgroundBlur: 0.5,
    });

    const [exportSettings, setExportSettings] = React.useState({
        format: 'PNG',
        size: 1024,
    });
    const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const backgroundInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } });
            setCameraStream(stream);
        } catch (err) {
            console.error(err);
            setError('Could not access camera. Please grant permission and try again.');
        }
    };

    const stopCamera = () => {
        cameraStream?.getTracks().forEach(track => track.stop());
        setCameraStream(null);
    };

    const snapPhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUrl);
            stopCamera();
        }
    };

    const handleGenerate = async () => {
        if (!capturedImage) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const base64Image = capturedImage.split(',')[1];
            const result = await generateHeadshot(base64Image, config);
            setGeneratedImage(`data:image/png;base64,${result}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage || !canvasRef.current) return;

        const link = document.createElement('a');
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        if (!ctx) return;

        img.onload = () => {
            canvas.width = exportSettings.size;
            canvas.height = exportSettings.size;
            ctx.drawImage(img, 0, 0, exportSettings.size, exportSettings.size);
            
            const format = exportSettings.format === 'PNG' ? 'image/png' : 'image/jpeg';
            const fileExtension = exportSettings.format.toLowerCase();
            const dataUrl = canvas.toDataURL(format, 0.95);
            
            link.href = dataUrl;
            link.download = `ai-headshot-${exportSettings.size}px.${fileExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        img.src = generatedImage;
    };


    const reset = () => {
        setCapturedImage(null);
        setGeneratedImage(null);
        setError(null);
        startCamera();
    };

    const handleBackgroundFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const { data, mimeType } = await fileToDataUrlParts(file);
                setConfig({ ...config, customBackground: { data, mimeType }, background: 'Custom' });
            } catch (err) {
                setError("Failed to read background image.");
            }
        }
    };

    const clearCustomBackground = () => {
        setConfig({ ...config, customBackground: undefined, background: 'Office' });
        if(backgroundInputRef.current) {
            backgroundInputRef.current.value = '';
        }
    };

    React.useEffect(() => {
        // Cleanup camera on component unmount
        return () => stopCamera();
    }, []);

    const renderCameraView = () => (
        <div className="relative aspect-[3/4] w-full max-w-md mx-auto bg-black rounded-lg overflow-hidden border-2 border-gray-700">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
            {/* Headshot Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-[70%] h-[80%] border-2 border-dashed border-white/50 rounded-full opacity-50"></div>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <button onClick={snapPhoto} className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50" aria-label="Snap Photo">
                    <div className="w-16 h-16 bg-white rounded-full"></div>
                </button>
            </div>
        </div>
    );
    
    const renderCapturedImageView = () => (
         <div className="space-y-6 flex flex-col items-center">
            <img src={capturedImage!} alt="Captured photo" className="rounded-lg max-w-md w-full" />
            <div className="flex gap-4">
                <button onClick={reset} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-colors">
                    Retake
                </button>
                 <button onClick={handleGenerate} disabled={isLoading} className="saas-button-primary py-3 px-8 flex items-center justify-center gap-2">
                    {isLoading ? <><Spinner/> Generating...</> : '✨ Generate Headshot'}
                </button>
            </div>
        </div>
    );
    
     const renderGeneratedImageView = () => (
        <div className="space-y-6 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-teal-400">Your AI Headshot is Ready!</h3>
            <img src={generatedImage!} alt="AI generated headshot" className="rounded-lg max-w-md w-full" />
             
             <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 w-full max-w-md space-y-4">
                <h4 className="font-bold text-lg text-gray-200">Export Options</h4>
                <div>
                    <label className="text-sm font-medium text-gray-300">Format</label>
                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
                        {['PNG', 'JPG'].map(format => (
                            <button 
                                key={format}
                                onClick={() => setExportSettings(s => ({...s, format}))}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${exportSettings.format === format ? 'bg-teal-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                            >
                                {format}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-300">Size</label>
                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
                        {[512, 1024, 2048].map(size => (
                            <button 
                                key={size}
                                onClick={() => setExportSettings(s => ({...s, size}))}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${exportSettings.size === size ? 'bg-teal-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                            >
                                {size}px
                            </button>
                        ))}
                    </div>
                </div>
            </div>

             <div className="flex gap-4">
                <button onClick={() => { setGeneratedImage(null); setCapturedImage(null); }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-colors">
                    Start Over
                </button>
                <button onClick={handleDownload} className="saas-button-primary py-3 px-8">
                    Download
                </button>
            </div>
        </div>
    );

    const renderControls = () => (
        <Card title="AI Headshot Settings" initiallyOpen={true}>
            <div className="flex items-center justify-end gap-2 mb-2">
                <button onClick={undoConfig} disabled={!canUndo} className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-gray-300">
                    <UndoIcon className="w-5 h-5" />
                </button>
                <button onClick={redoConfig} disabled={!canRedo} className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-gray-300">
                    <RedoIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-6 p-2">
                 <div>
                    <label className="text-sm font-medium text-gray-300">Background Style</label>
                    <div className="saas-select-container mt-1">
                        <select 
                            value={config.background} 
                            onChange={e => {
                                setConfig({ ...config, background: e.target.value as HeadshotConfig['background'], customBackground: undefined });
                                if(backgroundInputRef.current) backgroundInputRef.current.value = '';
                            }}
                            className="w-full saas-input saas-select"
                        >
                            <optgroup label="Studio Colors">
                                <option>Studio White</option>
                                <option>Studio Gray</option>
                                <option>Studio Black</option>
                                <option>Studio Blue</option>
                                <option>Studio Dark Blue</option>
                                <option>Studio Green</option>
                                <option>Studio Orange</option>
                            </optgroup>
                            <optgroup label="Environments">
                                <option>Office</option>
                                <option>Outdoor Cafe</option>
                                <option>Modern Tech</option>
                                <option>Bookshelf</option>
                                <option>Beach</option>
                                <option>Cityscape</option>
                                <option>Nature Landscape</option>
                            </optgroup>
                            <optgroup label="Abstract & Minimalist">
                                <option>Minimalist Studio</option>
                                <option>Abstract Gradient</option>
                                <option>Abstract Geometric</option>
                            </optgroup>
                            {config.background === 'Custom' && <option value="Custom">Custom Upload</option>}
                        </select>
                        <div className="saas-select-arrow"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                    </div>
                     <div className="mt-3">
                        {config.background === 'Custom' && config.customBackground ? (
                             <div className="flex items-center gap-2 p-2 bg-gray-900 rounded-md">
                                <img src={`data:${config.customBackground.mimeType};base64,${config.customBackground.data}`} className="w-10 h-10 object-cover rounded" alt="Custom background preview"/>
                                <span className="text-sm text-gray-300 flex-1 truncate">Custom Background</span>
                                <button onClick={clearCustomBackground} className="text-red-400 hover:text-red-500 font-bold text-lg">&times;</button>
                            </div>
                        ) : (
                             <button onClick={() => backgroundInputRef.current?.click()} className="w-full flex justify-center items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-teal-300 font-semibold py-2 px-3 rounded-md transition">
                                <UploadIcon className="w-4 h-4" /> Upload Your Own
                            </button>
                        )}
                        <input ref={backgroundInputRef} type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleBackgroundFileChange} />
                     </div>
                </div>
                <div>
                    <label htmlFor="backgroundBlur" className="text-sm font-medium text-gray-300">Background Blur: {Math.round(config.backgroundBlur * 100)}%</label>
                    <input type="range" id="backgroundBlur" min="0" max="1" step="0.1" value={config.backgroundBlur} onChange={(e) => setConfig({ ...config, backgroundBlur: parseFloat(e.target.value) })} className="mt-1 w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400"/>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-300">Lighting Style</label>
                    <div className="saas-select-container mt-1">
                        <select value={config.lighting} onChange={e => setConfig({ ...config, lighting: e.target.value as HeadshotConfig['lighting'] })} className="w-full saas-input saas-select">
                            <option>Professional Studio</option>
                            <option>Golden Hour</option>
                            <option>Dramatic</option>
                            <option>Natural Daylight</option>
                            <option>Rim Lighting</option>
                            <option>Softbox Lighting</option>
                        </select>
                        <div className="saas-select-arrow"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                    </div>
                </div>
                <fieldset>
                    <legend className="font-semibold text-gray-200 mb-3 text-md">Virtual Clothing (Optional)</legend>
                    <div className="space-y-4">
                        <label className="saas-checkbox-container"><input type="checkbox" checked={config.clothing.enabled} onChange={e => setConfig({ ...config, clothing: { ...config.clothing, enabled: e.target.checked } })} className="saas-checkbox"/><span className="text-gray-300 text-sm ml-3">Enable Virtual Clothing</span></label>
                            {config.clothing.enabled && (
                            <div className="pl-6 space-y-4">
                                <div className="saas-select-container">
                                    <select value={config.clothing.style} onChange={e => setConfig({ ...config, clothing: { ...config.clothing, style: e.target.value as HeadshotConfig['clothing']['style'] } })} className="w-full saas-input saas-select text-sm">
                                        <option>Business Suit</option>
                                        <option>Casual Blazer</option>
                                        <option>Simple T-Shirt</option>
                                        <option>Turtleneck</option>
                                        <option>Formal Dress</option>
                                        <option>Casual Sweater</option>
                                        <option>Athletic Wear</option>
                                    </select>
                                    <div className="saas-select-arrow"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <label htmlFor="clothingColor" className="text-sm text-gray-300">Color:</label>
                                    <div className="saas-color-picker-container">
                                        <div className="saas-color-preview" style={{backgroundColor: config.clothing.color}}></div>
                                        <input id="clothingColor" type="color" value={config.clothing.color} onChange={e => setConfig({ ...config, clothing: { ...config.clothing, color: e.target.value } })} className="saas-color-picker"/>
                                    </div>
                                </div>
                            </div>
                            )}
                    </div>
                </fieldset>
                 <fieldset>
                    <legend className="font-semibold text-gray-200 mb-3 text-md">Output Quality</legend>
                    <label className="saas-checkbox-container"><input type="checkbox" checked={config.highQuality} onChange={e => setConfig({ ...config, highQuality: e.target.checked })} className="saas-checkbox"/><span className="text-gray-300 text-sm ml-3">High Quality Output (Slower)</span></label>
                </fieldset>
            </div>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="flex flex-col items-center justify-center space-y-6 lg:order-2">
                {!cameraStream && !capturedImage && !generatedImage && (
                    <div className="text-center p-8 bg-gray-800/50 rounded-lg border border-gray-700 w-full max-w-md">
                        <h2 className="text-2xl font-bold">Create Your AI Headshot</h2>
                        <p className="text-gray-400 mt-2 mb-6">Get a professional profile picture in seconds.</p>
                        <button onClick={startCamera} className="saas-button-primary flex items-center justify-center gap-2 mx-auto">
                            <CameraIcon /> Start Camera
                        </button>
                    </div>
                )}
                {cameraStream && !capturedImage && renderCameraView()}
                {capturedImage && !generatedImage && renderCapturedImageView()}
                {generatedImage && renderGeneratedImageView()}

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md w-full max-w-md">
                        <p className="font-bold">Generation Failed</p>
                        <p>{error}</p>
                    </div>
                )}
            </div>
            <div className="lg:order-1">
                {renderControls()}
            </div>
        </div>
    );
};