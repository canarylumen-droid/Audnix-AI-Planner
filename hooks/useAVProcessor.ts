// hooks/useAVProcessor.ts
import * as React from 'react';
import { StudioSettings, TechnicalAnalysis, VideoDevice, BrandKit } from '../types';

interface AVProcessorProps {
    settings: StudioSettings;
    brandKit: BrandKit; // NEW
}

const getIdealDimensions = (quality: '720p' | '1080p' | '4K', performanceMode: boolean) => {
    if (performanceMode) {
        return { width: 1280, height: 720 };
    }
    switch (quality) {
        // Cap camera request at 1080p for preview to prevent lag, even if export is 4K.
        // The higher bitrate for 4K will still produce a better quality file from the 1080p source.
        case '4K': return { width: 1920, height: 1080 };
        case '1080p': return { width: 1920, height: 1080 };
        case '720p': return { width: 1280, height: 720 };
        default: return { width: 1920, height: 1080 };
    }
}

// Builds the CSS filter string for live preview. Excludes performance-heavy filters.
const buildLiveFilterString = (s: StudioSettings): string => {
    if (!s.livePreviewEnabled) return '';

    let filterString = '';
    // NOTE: 'blur' is intentionally excluded from live preview due to high performance cost.
    if(s.skinTone === 'warm') filterString += 'sepia(0.2) saturate(1.1) ';
    if(s.skinTone === 'cool') filterString += 'contrast(1.05) saturate(0.95) ';
    if(s.skinTone === 'glow') filterString += 'brightness(1.05) contrast(1.05) saturate(1.1) ';
    if (s.lighting === 'dramatic') filterString += 'contrast(1.2) brightness(0.95) ';

    switch(s.colorGrade) {
        case 'cinematic': filterString += 'saturate(1.2) contrast(1.1) '; break;
        case 'vintage': filterString += 'sepia(0.4) saturate(1.2) contrast(0.9) brightness(1.05) '; break;
        case 'noir': filterString += 'grayscale(1) contrast(1.3) brightness(0.9) '; break;
        case 'vibrant': filterString += 'saturate(1.5) contrast(1.1) '; break;
    }
    return filterString.trim();
};


export const useAVProcessor = ({ settings, brandKit }: AVProcessorProps) => {
    const [rawStream, setRawStream] = React.useState<MediaStream | null>(null);
    const [processedStream, setProcessedStream] = React.useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordedBlob, setRecordedBlob] = React.useState<Blob | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [technicalAnalysis, setTechnicalAnalysis] = React.useState<TechnicalAnalysis>({ audioLevel: 'good', lightingLevel: 'good' });
    const [videoDevices, setVideoDevices] = React.useState<VideoDevice[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | undefined>(undefined);
    
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const videoRef = React.useRef(document.createElement('video'));
    const canvasRef = React.useRef(document.createElement('canvas'));
    const requestRef = React.useRef<number>();
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const audioAnalyserRef = React.useRef<AnalyserNode | null>(null);
    const lastAnalysisTime = React.useRef(0);
    const logoImageRef = React.useRef<HTMLImageElement | null>(null); // NEW for Brand Kit logo

    // NEW: Effect to load the brand logo into an Image element for canvas drawing
    React.useEffect(() => {
        if (brandKit.logo) {
            const img = new Image();
            img.onload = () => {
                logoImageRef.current = img;
            };
            img.src = brandKit.logo;
        } else {
            logoImageRef.current = null;
        }
    }, [brandKit.logo]);


    const getVideoDevices = React.useCallback(async () => {
        try {
            if (!navigator.mediaDevices?.enumerateDevices) {
                console.log("enumerateDevices() not supported.");
                return;
            }
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); // Request permission first
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(device => device.kind === 'videoinput');
            setVideoDevices(videoInputs.map(device => ({ deviceId: device.deviceId, label: device.label })));
            
            // FIX: Use a functional update to safely set the initial device ID without creating a dependency loop.
            // This ensures that an existing selection isn't overridden, but an initial one is set.
            setSelectedDeviceId(currentId => currentId || videoInputs[0]?.deviceId);

        } catch (err) {
            console.error("Error enumerating devices:", err);
            setError("Could not access camera/mic. Please grant permission and try again.");
        }
    }, []);

    const getMediaStream = React.useCallback(async (deviceId?: string) => {
        if (rawStream) {
            rawStream.getTracks().forEach(track => track.stop());
        }
        try {
            const { width, height } = getIdealDimensions(settings.exportQuality, settings.performanceMode);
            let audioDeviceId: string | undefined = undefined;

            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const externalMic = devices.find(device => device.kind === 'audioinput' && device.deviceId !== 'default' && !device.label.toLowerCase().includes('built-in'));
                if (externalMic) {
                    audioDeviceId = externalMic.deviceId;
                }
            }
            
            const constraints: MediaStreamConstraints = {
                video: { 
                    facingMode: 'user', 
                    width: { ideal: width }, 
                    height: { ideal: height },
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    advanced: [{ focusMode: 'continuous' } as any],
                },
                audio: {
                    deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setRawStream(mediaStream);
            setError(null);
        } catch (err) {
            console.error("Error accessing media devices.", err);
            setError("Could not access camera/mic. Please grant permission and try again.");
        }
    }, [settings.exportQuality, settings.performanceMode, rawStream]);

    const startCamera = React.useCallback(async () => {
        await getVideoDevices();
        // The useEffect listening to selectedDeviceId will now reliably trigger getMediaStream.
    }, [getVideoDevices]);
    
    React.useEffect(() => {
        // This effect runs when selectedDeviceId is set by startCamera, triggering the stream.
        if (selectedDeviceId) {
             getMediaStream(selectedDeviceId);
        }
    }, [selectedDeviceId, getMediaStream]);


    const switchCamera = React.useCallback((deviceId?: string) => {
        let nextDeviceId = deviceId;
        if (!deviceId && videoDevices.length > 1) {
            const currentIndex = videoDevices.findIndex(d => d.deviceId === selectedDeviceId);
            const nextIndex = (currentIndex + 1) % videoDevices.length;
            nextDeviceId = videoDevices[nextIndex].deviceId;
        }
        
        if (nextDeviceId && nextDeviceId !== selectedDeviceId) {
            setSelectedDeviceId(nextDeviceId);
            // The useEffect listening to selectedDeviceId will trigger getMediaStream
        }
    }, [videoDevices, selectedDeviceId]);

    React.useEffect(() => {
        return () => {
            rawStream?.getTracks().forEach(track => track.stop());
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [rawStream]);
    
    const playVideoWhenReady = React.useCallback(() => {
        const video = videoRef.current;
        if (video.paused) {
            video.play().catch(e => {
                if (e.name !== 'AbortError') {
                    console.error("Video play failed", e);
                }
            });
        }
    }, []);


    // Real-time processing loop
    React.useEffect(() => {
        if (!rawStream) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (video.srcObject !== rawStream) {
            video.srcObject = rawStream;
            video.muted = true;
            video.addEventListener('loadedmetadata', playVideoWhenReady);
        } else {
            playVideoWhenReady();
        }
        
        const animate = () => {
            if (video.paused || video.ended || video.readyState < 2) {
                requestRef.current = requestAnimationFrame(animate);
                return;
            }
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            ctx.filter = buildLiveFilterString(settings);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.filter = 'none';

            if (settings.background.mode === 'vignette') {
                const gradient = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, canvas.height / 3,
                    canvas.width / 2, canvas.height / 2, canvas.height * 0.8
                );
                gradient.addColorStop(0, 'rgba(0,0,0,0)');
                gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // NEW: Render brand logo or text watermark
            const watermarkPadding = canvas.width * 0.04;
            ctx.globalAlpha = 0.7;
            if (logoImageRef.current) {
                const logoHeight = canvas.height * 0.05;
                const logoWidth = (logoImageRef.current.width / logoImageRef.current.height) * logoHeight;
                ctx.drawImage(logoImageRef.current, canvas.width - logoWidth - watermarkPadding, canvas.height - logoHeight - watermarkPadding, logoWidth, logoHeight);
            } else if (settings.watermark) {
                const fontSize = canvas.width * 0.03;
                ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.textAlign = 'right';
                ctx.fillText(settings.watermark, canvas.width - watermarkPadding, canvas.height - watermarkPadding);
            }
            ctx.globalAlpha = 1.0;


            // Technical Analysis (throttled)
            const now = Date.now();
            if (now - lastAnalysisTime.current > 500) {
                let audioLevel: TechnicalAnalysis['audioLevel'] = 'good';
                if (audioAnalyserRef.current) {
                    const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
                    audioAnalyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                    if (average > 110) audioLevel = 'clipping';
                    else if (average < 20) audioLevel = 'low';
                }

                let lightingLevel: TechnicalAnalysis['lightingLevel'] = 'good';
                try {
                    const sampleSize = 100;
                    const imageData = ctx.getImageData(canvas.width / 2 - sampleSize / 2, canvas.height / 2 - sampleSize / 2, sampleSize, sampleSize);
                    const data = imageData.data;
                    let colorSum = 0;
                    for(let x = 0, len = data.length; x < len; x+=4) {
                        const avg = Math.floor((data[x] + data[x+1] + data[x+2]) / 3);
                        colorSum += avg;
                    }
                    const brightness = Math.floor(colorSum / (sampleSize*sampleSize));
                    if (brightness < 70) lightingLevel = 'dark';
                    else if (brightness > 200) lightingLevel = 'bright';
                } catch (e) {
                    if (!(e instanceof DOMException && e.name === 'SecurityError')) {
                        console.error("Error analyzing lighting:", e);
                    }
                }

                setTechnicalAnalysis({ audioLevel, lightingLevel });
                lastAnalysisTime.current = now;
            }

            requestRef.current = requestAnimationFrame(animate);
        };
        
        animate();
        
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
             audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;
        const audioSource = audioContext.createMediaStreamSource(rawStream);
        const destination = audioContext.createMediaStreamDestination();
        
        let lastNode: AudioNode = audioSource;
        audioAnalyserRef.current = audioContext.createAnalyser();
        audioAnalyserRef.current.fftSize = 256;
        lastNode.connect(audioAnalyserRef.current);

        if (settings.noiseReduction) {
            const highPass = audioContext.createBiquadFilter();
            highPass.type = 'highpass';
            highPass.frequency.value = 80; 
            lastNode.connect(highPass);
            lastNode = highPass;
        }

        if (settings.autoLeveling) {
            const compressor = audioContext.createDynamicsCompressor();
            compressor.threshold.value = -40;
            compressor.knee.value = 30;
            compressor.ratio.value = 12;
            compressor.attack.value = 0;
            compressor.release.value = 0.25;
            lastNode.connect(compressor);
            lastNode = compressor;
        }

        lastNode.connect(destination);

        const canvasStream = canvas.captureStream();
        const processedAudioTracks = destination.stream.getAudioTracks();
        if (processedAudioTracks.length > 0) {
            canvasStream.addTrack(processedAudioTracks[0]);
        }
        setProcessedStream(canvasStream);

        return () => {
            video.removeEventListener('loadedmetadata', playVideoWhenReady);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };

    }, [rawStream, settings, playVideoWhenReady, brandKit.logo]);


    const generateEffectsPreview = React.useCallback(async (): Promise<string> => {
        const video = videoRef.current;
        const previewCanvas = document.createElement('canvas');
        const ctx = previewCanvas.getContext('2d');
        if (!ctx || video.readyState < 2) {
            throw new Error("Preview generation failed: video not ready.");
        }

        const PREVIEW_MAX_WIDTH = 480;
        const aspectRatio = video.videoWidth / video.videoHeight;
        previewCanvas.width = PREVIEW_MAX_WIDTH;
        previewCanvas.height = PREVIEW_MAX_WIDTH / aspectRatio;
        
        let filterString = '';
        if(settings.skinTone === 'warm') filterString += 'sepia(0.2) saturate(1.1) ';
        if(settings.skinTone === 'cool') filterString += 'contrast(1.05) saturate(0.95) ';
        if(settings.skinTone === 'glow') filterString += 'brightness(1.05) contrast(1.05) saturate(1.1) ';
        if (settings.skinSmoothingLevel > 0) filterString += `blur(${settings.skinSmoothingLevel * 0.8}px) `;
        if (settings.lighting === 'dramatic') filterString += 'contrast(1.2) brightness(0.95) ';

        switch(settings.colorGrade) {
            case 'cinematic': filterString += 'saturate(1.2) contrast(1.1) '; break;
            case 'vintage': filterString += 'sepia(0.4) saturate(1.2) contrast(0.9) brightness(1.05) '; break;
            case 'noir': filterString += 'grayscale(1) contrast(1.3) brightness(0.9) '; break;
            case 'vibrant': filterString += 'saturate(1.5) contrast(1.1) '; break;
        }

        ctx.filter = filterString.trim();
        ctx.drawImage(video, 0, 0, previewCanvas.width, previewCanvas.height);
        ctx.filter = 'none';

        if (settings.lighting === 'ring') {
            const centerX = previewCanvas.width / 2;
            const centerY = previewCanvas.height / 2;
            const innerRadius = previewCanvas.height / 4;
            const outerRadius = previewCanvas.height * 0.9;
            const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        } else if (settings.lighting === 'golden') {
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
            ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
            ctx.globalCompositeOperation = 'source-over';
        }
        
        // NEW: Render brand logo or text watermark in preview
        const watermarkPadding = previewCanvas.width * 0.04;
        ctx.globalAlpha = 0.7;
        if (logoImageRef.current) {
            const logoHeight = previewCanvas.height * 0.05;
            const logoWidth = (logoImageRef.current.width / logoImageRef.current.height) * logoHeight;
            ctx.drawImage(logoImageRef.current, previewCanvas.width - logoWidth - watermarkPadding, previewCanvas.height - logoHeight - watermarkPadding, logoWidth, logoHeight);
        } else if (settings.watermark) {
            const fontSize = previewCanvas.width * 0.04;
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'right';
            ctx.fillText(settings.watermark, previewCanvas.width - watermarkPadding, previewCanvas.height - watermarkPadding);
        }
        ctx.globalAlpha = 1.0;


        return previewCanvas.toDataURL('image/jpeg', 0.9);
    }, [settings, brandKit.logo]);


    const startRecording = () => {
        if (processedStream && processedStream.active) {
            setRecordedBlob(null);
            const bitrate = settings.exportQuality === '4K' ? 20000000 : 8000000;
            const recorder = new MediaRecorder(processedStream, { mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: bitrate });
            mediaRecorderRef.current = recorder;
            const chunks: Blob[] = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) };
            recorder.onstop = () => setRecordedBlob(new Blob(chunks, { type: 'video/webm' }));
            recorder.start();
            setIsRecording(true);
        } else {
            setError("Media stream not ready. Please wait or check permissions.");
            if(!rawStream) startCamera();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    const resetRecording = () => {
        setRecordedBlob(null);
        setIsRecording(false);
        mediaRecorderRef.current = null;
    }

    return { 
        processedStream, 
        isRecording, 
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
    };
};