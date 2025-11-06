// components/tabs/StudioTab.tsx
import * as React from 'react';
import { BrandKit, ContentPlan, Recording, StudioSettings, VideoDevice } from '../../types';
import { useAVProcessor } from '../../hooks/useAVProcessor';
import { useSpeechAnalysis } from '../../hooks/useSpeechAnalysis';
import { CameraView } from '../studio/CameraView';
import { RecordingControls } from '../studio/RecordingControls';
import { StudioTeleprompter } from '../studio/StudioTeleprompter';
import { StudioControls } from '../studio/StudioControls';
import { SpeechCoach } from '../studio/SpeechCoach';
import { refineScript } from '../../services/geminiService';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';
import { useHistoryState } from '../../hooks/useHistoryState';
import { UndoIcon } from '../icons/UndoIcon';
import { RedoIcon } from '../icons/RedoIcon';
import { TechnicalCoach } from '../studio/TechnicalCoach';
import { CameraPlaceholder } from '../studio/CameraPlaceholder';
import { EffectsPreviewModal } from '../studio/EffectsPreviewModal';

interface StudioTabProps {
    activePlan: ContentPlan | null;
    onSaveRecording: (recording: Recording) => void;
    brandKit: BrandKit; // NEW
}

export const StudioTab: React.FC<StudioTabProps> = ({ activePlan, onSaveRecording, brandKit }) => {
    const [script, setScript] = React.useState('Welcome to the Audnix AI Studio! Generate a plan or type your script here.');
    const [title, setTitle] = React.useState('My Audnix AI Video');
    const [isRecording, setIsRecording] = React.useState(false);
    const [showPreview, setShowPreview] = React.useState(false);
    const [isRefining, setIsRefining] = React.useState(false);
    const [refineError, setRefineError] = React.useState<string | null>(null);
    const [cameraRequested, setCameraRequested] = React.useState(false);
    const [isPreviewing, setIsPreviewing] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
    const [countdown, setCountdown] = React.useState<number | null>(null);
    
    const speechAnalysis = useSpeechAnalysis({ isRecording });

    const [settings, setSettings, undo, redo, canUndo, canRedo] = useHistoryState<StudioSettings>({
        skinTone: 'none',
        skinSmoothingLevel: 0.2,
        noiseReduction: true,
        autoLeveling: true,
        background: { mode: 'vignette' },
        watermark: '@YourHandle',
        showFrameGuide: true,
        exportQuality: '1080p',
        lighting: 'default',
        autoCutFillers: true,
        colorGrade: 'none',
        livePreviewEnabled: false,
        performanceMode: true,
        teleprompter: {
            fontSize: 48,
            isMirrored: false,
            opacity: 0.7,
            textColor: '#FFFFFF',
            lookahead: 2,
        },
        countdownDuration: 3,
    });
    
    const { 
        processedStream, 
        recordedBlob, 
        error, 
        startRecording, 
        stopRecording, 
        resetRecording, 
        technicalAnalysis,
        startCamera,
        switchCamera,
        videoDevices,
        selectedDeviceId,
        generateEffectsPreview,
     } = useAVProcessor({ settings, brandKit });

    const isCameraReady = !!processedStream;

    React.useEffect(() => {
        if (activePlan) {
            setScript(activePlan.script);
            setTitle(activePlan.title);
        }
    }, [activePlan]);

    React.useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            setIsRecording(true);
            startRecording();
            setCountdown(null);
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, startRecording]);
    
    const handleStartCamera = () => {
        startCamera();
        setCameraRequested(true);
    };

    const handleGeneratePreview = async () => {
        setIsPreviewing(true);
        setIsPreviewLoading(true);
        try {
            const dataUrl = await generateEffectsPreview();
            setPreviewImage(dataUrl);
        } catch (e) {
            console.error(e);
            // You might want to show an error to the user here
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleStart = () => {
        setShowPreview(false);
        setCountdown(settings.countdownDuration);
    };

    const handleStop = () => {
        setIsRecording(false);
        stopRecording();
        setShowPreview(true);
    };

    const handleSave = () => {
        if (recordedBlob) {
            const newRecording: Recording = {
                id: new Date().toISOString(),
                title: title,
                date: new Date().toLocaleString(),
                blob: recordedBlob,
                url: URL.createObjectURL(recordedBlob),
                captions: activePlan?.captions || [],
                hashtags: activePlan?.hashtags || [],
                quality: settings.exportQuality,
                transcriptLog: speechAnalysis.transcriptLog,
            };
            onSaveRecording(newRecording);
            resetRecording();
            setShowPreview(false);
        }
    };
    
    const handleDiscard = () => {
        resetRecording();
        setShowPreview(false);
    };
    
    const handleRefineScript = async () => {
        setIsRefining(true);
        setRefineError(null);
        try {
            const result = await refineScript(script);
            setScript(result.enhancedScript);
        } catch (err)
 {
            setRefineError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsRefining(false);
        }
    };

    const renderEnhancementSummary = () => (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4 text-center">
            <h3 className="text-xl font-bold text-teal-400">AI Enhancement Summary</h3>
            <p className="text-gray-300">Your video is ready to be finalized. The AI will apply the following enhancements upon export:</p>
            <ul className="text-left list-disc list-inside bg-gray-900 p-4 rounded-md text-gray-400">
                {settings.autoCutFillers && (speechAnalysis.fillerWords > 0 || speechAnalysis.stammers > 0) && <li>Seamlessly removed {speechAnalysis.fillerWords} filler word(s) and {speechAnalysis.stammers} stammer(s)</li>}
                {settings.lighting === 'ring' && <li>Applied 'Pro Ring Light' effect</li>}
                {settings.lighting === 'golden' && <li>Applied 'Golden Hour' cinematic lighting</li>}
                {settings.lighting === 'dramatic' && <li>Applied 'Dramatic' high-contrast lighting</li>}
                {settings.colorGrade !== 'none' && <li>Applied '{settings.colorGrade}' color grading</li>}
                {settings.noiseReduction && <li>Studio-quality noise reduction & sound balancing</li>}
                {settings.autoLeveling && <li>Audio volume auto-leveled</li>}
                {settings.skinTone !== 'none' && <li>Applied '{settings.skinTone}' skin tone filter</li>}
                {settings.skinSmoothingLevel > 0 && <li>Applied skin smoothing</li>}
                {settings.background.mode === 'vignette' && <li>Professional background vignette applied</li>}
            </ul>
             <RecordingControls 
                isRecording={false}
                recordedBlob={recordedBlob}
                onStart={() => {}}
                onStop={() => {}}
                onSave={handleSave}
                onDiscard={handleDiscard}
            />
        </div>
    );

    const renderScriptEditor = () => (
        <Card title="Script Editor" initiallyOpen={true}>
            <div className="space-y-4">
                <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    rows={12}
                    className="w-full saas-input"
                    placeholder="Write your script here..."
                />
                {refineError && <p className="text-red-400 text-sm mt-2">{refineError}</p>}
                <button 
                    onClick={handleRefineScript} 
                    disabled={isRefining || !script.trim()}
                    className="w-full flex justify-center items-center gap-2 saas-button-primary"
                >
                    {isRefining ? <><Spinner /> Refining...</> : '✨ Refine Script with AI'}
                </button>
            </div>
        </Card>
    );

    const renderUndoRedoControls = () => (
        <div className="flex items-center justify-end gap-2 mb-4">
            <button onClick={undo} disabled={!canUndo} className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-gray-300">
                <UndoIcon className="w-5 h-5" />
            </button>
            <button onClick={redo} disabled={!canRedo} className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-gray-300">
                <RedoIcon className="w-5 h-5" />
            </button>
        </div>
    );

    const isCountingDown = countdown !== null && countdown > 0;

    return (
        <div className="grid grid-cols-1 gap-8">
            {isPreviewing && (
                <EffectsPreviewModal 
                    isLoading={isPreviewLoading}
                    image={previewImage}
                    onClose={() => {
                        setIsPreviewing(false);
                        setPreviewImage(null);
                    }}
                />
            )}
            <div className="relative aspect-[9/16] w-full max-w-sm mx-auto">
                {isCameraReady ? (
                    <CameraView 
                        stream={processedStream}
                        isRecording={isRecording}
                        coachingHint={speechAnalysis.coachingHint}
                        showFrameGuide={settings.showFrameGuide}
                        countdown={countdown}
                    />
                ) : (
                    <CameraPlaceholder 
                        onStartCamera={handleStartCamera} 
                        isLoading={cameraRequested && !isCameraReady}
                    />
                )}
                {isRecording && <StudioTeleprompter 
                    script={script} 
                    liveTranscript={speechAnalysis.liveTranscript}
                    settings={settings.teleprompter} 
                />}
            </div>

            <div className="w-full max-w-4xl mx-auto space-y-6">
                 {isCameraReady && !showPreview && (
                     <div className="mt-6">
                        <RecordingControls 
                            isRecording={isRecording}
                            recordedBlob={recordedBlob}
                            onStart={handleStart}
                            onStop={handleStop}
                            onSave={handleSave}
                            onDiscard={handleDiscard}
                            isCountingDown={isCountingDown}
                        />
                     </div>
                 )}
                 {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                 
                 {showPreview && recordedBlob ? renderEnhancementSummary() : (
                    <div className="space-y-6">
                        {!isRecording && isCameraReady && !isCountingDown ? (
                            <>
                                {renderScriptEditor()}
                                {renderUndoRedoControls()}
                                <StudioControls 
                                    settings={settings}
                                    onSettingsChange={setSettings}
                                    onSwitchCamera={switchCamera}
                                    videoDevices={videoDevices}
                                    selectedDeviceId={selectedDeviceId}
                                    onGeneratePreview={handleGeneratePreview}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SpeechCoach analysis={speechAnalysis} />
                                    <TechnicalCoach analysis={technicalAnalysis} />
                                </div>
                            </>
                        ) : null}
                    </div>
                 )}
            </div>
        </div>
    );
};