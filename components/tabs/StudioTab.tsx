// components/tabs/StudioTab.tsx
import * as React from 'react';
import { ContentPlan, Recording, BrandKit, StudioSettings } from '../../types';
import { CameraView } from '../studio/CameraView';
import { StudioControls } from '../studio/StudioControls';
import { RecordingControls } from '../studio/RecordingControls';
import { SpeechCoach } from '../studio/SpeechCoach';
import { TechnicalCoach } from '../studio/TechnicalCoach';
import { StudioTeleprompter } from '../studio/StudioTeleprompter';
import { CameraPlaceholder } from '../studio/CameraPlaceholder';
import { EffectsPreviewModal } from '../studio/EffectsPreviewModal';
import { useAVProcessor } from '../../hooks/useAVProcessor';
import { useSpeechAnalysis } from '../../hooks/useSpeechAnalysis';
import { generateEffectsPreview } from '../../services/geminiService';

const DEFAULT_SCRIPT = "Welcome to the Audnix AI Studio! If you haven't generated a plan yet, you can use this space to record a video freestyle. Your delivery will be analyzed in real-time. Let's create something amazing!";

const DEFAULT_SETTINGS: StudioSettings = {
    skinTone: 'none',
    skinSmoothingLevel: 0,
    noiseReduction: true,
    autoLeveling: true,
    background: { mode: 'none' },
    watermark: '',
    showFrameGuide: true,
    exportQuality: '1080p',
    lighting: 'default',
    autoCutFillers: false,
    colorGrade: 'none',
    livePreviewEnabled: false,
    performanceMode: false,
    teleprompter: {
        fontSize: 64,
        isMirrored: false,
        opacity: 0.8,
        textColor: '#FFFFFF',
        lookahead: 3,
    },
    countdownDuration: 3,
};

interface StudioTabProps {
    activePlan: ContentPlan | null;
    onSaveRecording: (recording: Recording) => void;
    brandKit: BrandKit;
}

export const StudioTab: React.FC<StudioTabProps> = ({ activePlan, onSaveRecording, brandKit }) => {
    const [settings, setSettings] = React.useState<StudioSettings>({
        ...DEFAULT_SETTINGS,
        watermark: brandKit.bio.match(/@\w+/) ? brandKit.bio.match(/@\w+/)![0] : ''
    });
    const [isCameraLoading, setIsCameraLoading] = React.useState(false);
    const [cameraError, setCameraError] = React.useState<string | null>(null);
    const [countdown, setCountdown] = React.useState<number | null>(null);
    
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);

    const { 
        stream, isRecording, recordedBlob, 
        videoDevices, selectedDeviceId, technicalAnalysis,
        getDevices, startStream, 
        startRecording, stopRecording, resetRecording, switchCamera
    } = useAVProcessor({});
    
    const speechAnalysis = useSpeechAnalysis({ isRecording });
    const playbackVideoRef = React.useRef<HTMLVideoElement>(null);
    const videoRefForPreview = React.useRef<HTMLVideoElement | null>(null);
    const canvasForPreview = React.useRef<HTMLCanvasElement | null>(null);
    
    React.useEffect(() => {
        // Create elements for preview capture, but don't attach them to the DOM
        videoRefForPreview.current = document.createElement('video');
        videoRefForPreview.current.muted = true;
        canvasForPreview.current = document.createElement('canvas');
    }, []);

    React.useEffect(() => {
        // Keep the hidden video element's srcObject in sync with the main stream for captures
        if (videoRefForPreview.current && stream) {
            videoRefForPreview.current.srcObject = stream;
            videoRefForPreview.current.play().catch(e => console.error("Error playing preview video:", e));
        }
    }, [stream]);

    React.useEffect(() => {
        getDevices();
    }, [getDevices]);
    
    React.useEffect(() => {
        if (recordedBlob && playbackVideoRef.current) {
            playbackVideoRef.current.src = URL.createObjectURL(recordedBlob);
        }
    }, [recordedBlob]);

    const handleStartCamera = async () => {
        setIsCameraLoading(true);
        setCameraError(null);
        if (videoDevices.length > 0) {
            try {
                await startStream(selectedDeviceId || videoDevices[0].deviceId);
            } catch (err) {
                setCameraError('Failed to start camera. Please check permissions.');
            }
        } else {
            setCameraError('No video devices found.');
        }
        setIsCameraLoading(false);
    };

    const handleStartRecording = () => {
        let count = settings.countdownDuration;
        setCountdown(count);
        const interval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 0) {
                clearInterval(interval);
                setCountdown(null);
                startRecording();
            }
        }, 1000);
    };

    const handleSave = () => {
        if (recordedBlob) {
            const newRecording: Recording = {
                id: crypto.randomUUID(),
                title: activePlan?.title || 'Freestyle Recording',
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
        }
    };
    
    const handleDiscard = () => {
        resetRecording();
    };

    const handleGeneratePreview = async () => {
        if (!stream || !videoRefForPreview.current || !canvasForPreview.current) {
            alert("Camera is not active. Cannot generate preview.");
            return;
        }

        const video = videoRefForPreview.current;
        const canvas = canvasForPreview.current;
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            alert("Camera feed is not ready yet. Please try again in a moment.");
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Flip the image horizontally to match the mirrored camera view
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const originalImage = canvas.toDataURL('image/jpeg');
        const base64Image = originalImage.split(',')[1];
        
        setPreviewImage(originalImage);
        setIsPreviewLoading(true);

        try {
            const result = await generateEffectsPreview(base64Image, settings);
            setPreviewImage(`data:image/png;base64,${result}`);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to generate preview.");
            // On error, the modal remains open with the original image
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const scriptToUse = activePlan?.script || DEFAULT_SCRIPT;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {previewImage && <EffectsPreviewModal image={previewImage} isLoading={isPreviewLoading} onClose={() => setPreviewImage(null)} />}
            
            <div className="lg:col-span-1 lg:order-2 flex flex-col gap-6">
                {stream && !recordedBlob ? (
                    <CameraView 
                        stream={stream} 
                        isRecording={isRecording} 
                        coachingHint={speechAnalysis.coachingHint} 
                        showFrameGuide={settings.showFrameGuide} 
                        countdown={countdown} 
                    />
                ) : recordedBlob ? (
                    <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden border-2 border-gray-700">
                        <video ref={playbackVideoRef} controls className="w-full h-full object-cover"></video>
                    </div>
                ) : (
                    <CameraPlaceholder onStartCamera={handleStartCamera} isLoading={isCameraLoading} />
                )}
                {cameraError && <p className="text-red-400 text-center">{cameraError}</p>}

                {stream && <RecordingControls 
                    isRecording={isRecording}
                    recordedBlob={recordedBlob}
                    onStart={handleStartRecording}
                    onStop={stopRecording}
                    onSave={handleSave}
                    onDiscard={handleDiscard}
                    isCountingDown={countdown !== null && countdown > 0}
                />}
            </div>

            <div className="lg:col-span-2 lg:order-1 flex flex-col gap-6">
                <div className="h-[400px] lg:h-auto lg:flex-grow">
                    <StudioTeleprompter script={scriptToUse} settings={settings.teleprompter} speechAnalysis={speechAnalysis} isRecording={isRecording} />
                </div>
                {stream && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SpeechCoach analysis={speechAnalysis} />
                        <TechnicalCoach analysis={technicalAnalysis} />
                    </div>
                )}
                
                <StudioControls 
                    settings={settings}
                    onSettingsChange={setSettings}
                    videoDevices={videoDevices}
                    selectedDeviceId={selectedDeviceId}
                    onSwitchCamera={switchCamera}
                    onGeneratePreview={handleGeneratePreview}
                />
            </div>
        </div>
    );
};